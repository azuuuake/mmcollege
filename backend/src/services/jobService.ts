import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { conflict, forbidden, notFound } from "../utils/httpError.js";
import { notify } from "./notificationService.js";
import { scoreCandidate } from "./matchingService.js";
import { getOwnEmployerProfile } from "./employerService.js";
import { getOwnHairdresserProfile } from "./hairdresserService.js";

const jobInclude = {
  employerProfile: true,
  requiredSkills: { include: { skill: true } },
  requiredQualification: true,
  _count: { select: { applications: true } }
};

export async function listJobs(query: {
  q?: string;
  location?: string;
  employmentType?: string;
  mine?: boolean;
  userId?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, query.pageSize ?? 12));
  const where: Prisma.JobWhereInput = {};

  if (query.mine && query.userId) {
    const employer = await prisma.employerProfile.findUnique({ where: { userId: query.userId } });
    if (!employer) throw notFound("Employer profile not found");
    where.employerProfileId = employer.id;
  } else {
    where.status = "ACTIVE";
  }

  if (query.q) {
    where.OR = [
      { title: { contains: query.q, mode: "insensitive" } },
      { description: { contains: query.q, mode: "insensitive" } }
    ];
  }
  if (query.location) {
    where.location = { contains: query.location, mode: "insensitive" };
  }
  if (query.employmentType) {
    where.employmentType = query.employmentType as Prisma.JobWhereInput["employmentType"];
  }

  const [total, items] = await prisma.$transaction([
    prisma.job.count({ where }),
    prisma.job.findMany({
      where,
      include: jobInclude,
      orderBy: { postedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    })
  ]);

  return { page, pageSize, total, items };
}

export async function getJob(id: string, userId?: string) {
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      ...jobInclude,
      applications: userId
        ? {
            where: {
              OR: [{ hairdresserProfile: { userId } }, { job: { employerProfile: { userId } } }]
            }
          }
        : false
    }
  });
  if (!job) throw notFound("Job not found");
  if (job.status === "DRAFT" && job.employerProfile.userId !== userId) {
    throw notFound("Job not found");
  }
  return job;
}

export async function createJob(
  userId: string,
  data: {
    title: string;
    description: string;
    location: string;
    employmentType: Prisma.JobCreateInput["employmentType"];
    salaryMin?: number;
    salaryMax?: number;
    salaryDisplay?: string;
    requiredExperienceYears?: number;
    requiredQualificationId?: string;
    skillIds?: string[];
    status?: "DRAFT" | "ACTIVE";
  }
) {
  const employer = await getOwnEmployerProfile(userId);
  const status = data.status ?? "DRAFT";
  return prisma.job.create({
    data: {
      employerProfileId: employer.id,
      title: data.title,
      description: data.description,
      location: data.location,
      employmentType: data.employmentType,
      salaryMin: data.salaryMin,
      salaryMax: data.salaryMax,
      salaryDisplay: data.salaryDisplay,
      requiredExperienceYears: data.requiredExperienceYears,
      requiredQualificationId: data.requiredQualificationId,
      status,
      postedAt: status === "ACTIVE" ? new Date() : null,
      requiredSkills: data.skillIds?.length
        ? { create: data.skillIds.map((skillId) => ({ skillId })) }
        : undefined
    },
    include: jobInclude
  });
}

export async function updateJob(
  userId: string,
  id: string,
  data: {
    title?: string;
    description?: string;
    location?: string;
    employmentType?: Prisma.JobUpdateInput["employmentType"];
    salaryMin?: number | null;
    salaryMax?: number | null;
    salaryDisplay?: string | null;
    requiredExperienceYears?: number | null;
    requiredQualificationId?: string | null;
    skillIds?: string[];
    status?: "DRAFT" | "ACTIVE" | "CLOSED";
  }
) {
  const job = await prisma.job.findUnique({
    where: { id },
    include: { employerProfile: true }
  });
  if (!job) throw notFound("Job not found");
  if (job.employerProfile.userId !== userId) throw forbidden();

  const { skillIds, status, ...rest } = data;
  return prisma.$transaction(async (tx) => {
    if (skillIds) {
      await tx.jobSkill.deleteMany({ where: { jobId: id } });
      if (skillIds.length) {
        await tx.jobSkill.createMany({ data: skillIds.map((skillId) => ({ jobId: id, skillId })) });
      }
    }
    return tx.job.update({
      where: { id },
      data: {
        ...rest,
        status,
        postedAt: status === "ACTIVE" && !job.postedAt ? new Date() : job.postedAt
      },
      include: jobInclude
    });
  });
}

export async function deleteJob(userId: string, id: string) {
  const job = await prisma.job.findUnique({
    where: { id },
    include: { employerProfile: true }
  });
  if (!job) throw notFound("Job not found");
  if (job.employerProfile.userId !== userId) throw forbidden();
  await prisma.job.delete({ where: { id } });
}

export async function applyToJob(userId: string, jobId: string, coverNote?: string) {
  const profile = await getOwnHairdresserProfile(userId);
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { employerProfile: true }
  });
  if (!job || job.status !== "ACTIVE") throw notFound("Job is not available");

  try {
    const application = await prisma.application.create({
      data: {
        jobId,
        hairdresserProfileId: profile.id,
        coverNote
      },
      include: { job: { include: jobInclude } }
    });

    await notify({
      userId: job.employerProfile.userId,
      type: "APPLICATION",
      title: "New application",
      body: `${profile.firstName} ${profile.lastName} expressed interest in ${job.title}.`,
      linkUrl: `/jobs/${job.id}`
    });

    return application;
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") {
      throw conflict("You have already applied for this job");
    }
    throw error;
  }
}

export async function listApplications(userId: string, role: "HAIRDRESSER" | "EMPLOYER" | "ADMIN") {
  if (role === "HAIRDRESSER") {
    const profile = await getOwnHairdresserProfile(userId);
    return prisma.application.findMany({
      where: { hairdresserProfileId: profile.id },
      include: { job: { include: jobInclude } },
      orderBy: { createdAt: "desc" }
    });
  }

  const employer = await getOwnEmployerProfile(userId);
  return prisma.application.findMany({
    where: { job: { employerProfileId: employer.id } },
    include: {
      job: true,
      hairdresserProfile: {
        include: { skills: { include: { skill: true } }, credentials: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function matchJobCandidates(userId: string, jobId: string) {
  const job = await getJob(jobId, userId);
  if (job.employerProfile.userId !== userId) throw forbidden();

  const candidates = await prisma.hairdresserProfile.findMany({
    where: { user: { status: "ACTIVE" } },
    include: { skills: { include: { skill: true } }, credentials: true }
  });

  return candidates
    .map((candidate) => ({
      candidate: {
        id: candidate.id,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        professionalTitle: candidate.professionalTitle,
        location: candidate.location,
        yearsOfExperience: candidate.yearsOfExperience,
        profilePhotoUrl: candidate.profilePhotoUrl
      },
      match: scoreCandidate(
        {
          id: candidate.id,
          location: candidate.location,
          suburb: candidate.suburb,
          state: candidate.state,
          yearsOfExperience: candidate.yearsOfExperience,
          availability: candidate.availability,
          employmentStatus: candidate.employmentStatus,
          skillNames: candidate.skills.map((item) => item.skill.name),
          qualificationNames: candidate.credentials.map((item) => item.qualificationName),
          verifiedQualificationNames: candidate.credentials
            .filter((item) => item.status === "VERIFIED")
            .map((item) => item.qualificationName)
        },
        {
          location: job.location,
          requiredSkillNames: job.requiredSkills.map((item) => item.skill.name),
          requiredQualificationName: job.requiredQualification?.name,
          requiredExperienceYears: job.requiredExperienceYears
        }
      )
    }))
    .sort((a, b) => b.match.score - a.match.score)
    .slice(0, 20);
}
