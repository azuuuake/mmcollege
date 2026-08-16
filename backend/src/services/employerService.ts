import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { notFound } from "../utils/httpError.js";
import { scoreCandidate } from "./matchingService.js";

const employerInclude = {
  jobs: {
    orderBy: { createdAt: "desc" as const },
    include: {
      requiredSkills: { include: { skill: true } },
      _count: { select: { applications: true } }
    }
  }
};

export async function getOwnEmployerProfile(userId: string) {
  const profile = await prisma.employerProfile.findUnique({
    where: { userId },
    include: employerInclude
  });
  if (!profile) throw notFound("Employer profile not found");
  return profile;
}

export async function upsertEmployerProfile(
  userId: string,
  data: Prisma.EmployerProfileUncheckedUpdateInput,
  create = false
) {
  const existing = await prisma.employerProfile.findUnique({ where: { userId } });
  if (!existing && !create) {
    throw notFound("Create a business profile before updating it");
  }
  if (existing) {
    return prisma.employerProfile.update({
      where: { userId },
      data,
      include: employerInclude
    });
  }
  return prisma.employerProfile.create({
    data: {
      userId,
      businessName: String(data.businessName ?? "New Salon"),
      ...data
    } as Prisma.EmployerProfileUncheckedCreateInput,
    include: employerInclude
  });
}

export async function getPublicEmployer(id: string) {
  const profile = await prisma.employerProfile.findUnique({
    where: { id },
    include: {
      user: { select: { status: true } },
      jobs: {
        where: { status: "ACTIVE" },
        orderBy: { postedAt: "desc" },
        include: { requiredSkills: { include: { skill: true } } }
      }
    }
  });
  if (!profile || profile.user.status !== "ACTIVE") {
    throw notFound("Employer not found");
  }
  await prisma.employerProfile.update({
    where: { id },
    data: { profileViews: { increment: 1 } }
  });
  const { user: _user, phone: _phone, contactEmail: _contactEmail, ...publicProfile } = profile;
  return { ...publicProfile, profileViews: profile.profileViews + 1 };
}

export async function getEmployerDashboard(userId: string) {
  const profile = await getOwnEmployerProfile(userId);
  const activeJobs = profile.jobs.filter((job) => job.status === "ACTIVE");

  const recentContacts = await prisma.conversation.findMany({
    where: { OR: [{ participantAId: userId }, { participantBId: userId }] },
    include: {
      participantA: { include: { hairdresserProfile: true, employerProfile: true } },
      participantB: { include: { hairdresserProfile: true, employerProfile: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 }
    },
    orderBy: { updatedAt: "desc" },
    take: 5
  });

  const hairdressers = await prisma.hairdresserProfile.findMany({
    where: { user: { status: "ACTIVE" } },
    include: {
      skills: { include: { skill: true } },
      credentials: true
    },
    take: 40
  });

  const primaryJob = activeJobs[0];
  const recommended = hairdressers
    .map((candidate) => ({
      candidate,
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
          location: primaryJob?.location ?? profile.location,
          requiredSkillNames: primaryJob?.requiredSkills.map((item) => item.skill.name) ?? [],
          requiredQualificationName: undefined,
          requiredExperienceYears: primaryJob?.requiredExperienceYears ?? 0
        }
      )
    }))
    .sort((a, b) => b.match.score - a.match.score)
    .slice(0, 6);

  return {
    profile,
    activeJobs,
    candidateMatches: recommended.length,
    profileViews: profile.profileViews,
    recentContacts,
    recommendedProfessionals: recommended
  };
}
