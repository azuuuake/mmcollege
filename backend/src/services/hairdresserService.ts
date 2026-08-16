import type { HairdresserProfile, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { badRequest, forbidden, notFound } from "../utils/httpError.js";
import { calculateProfileCompletion } from "./profileCompletionService.js";
import { effectiveCredentialStatus, scoreCandidate } from "./matchingService.js";

const publicCredentialSelect = {
  id: true,
  qualificationName: true,
  issuingOrganisation: true,
  issueDate: true,
  expiryDate: true,
  status: true,
  qualification: { select: { id: true, name: true, level: true } }
} satisfies Prisma.CredentialSelect;

function toPublicCredential<T extends { status: "PENDING" | "VERIFIED" | "REJECTED" | "EXPIRED"; expiryDate: Date | null }>(
  credential: T
) {
  return { ...credential, status: effectiveCredentialStatus(credential.status, credential.expiryDate) };
}

export function toPublicHairdresser<T extends Record<string, unknown>>(
  profile: T,
  options?: { includePending?: boolean }
) {
  const { user: _user, phone: _phone, credentials: rawCredentials, ...rest } = profile as T & {
    user?: unknown;
    phone?: string | null;
    credentials?: Array<{
      status: "PENDING" | "VERIFIED" | "REJECTED" | "EXPIRED";
      expiryDate: Date | null;
      documentKey?: string | null;
    }>;
  };
  const credentials = (rawCredentials ?? [])
    .map(toPublicCredential)
    .filter((item) => options?.includePending || item.status === "VERIFIED" || item.status === "EXPIRED")
    .map(({ documentKey: _documentKey, ...safe }) => safe);
  return { ...rest, credentials, phone: undefined };
}

export async function getOwnHairdresserProfile(userId: string) {
  const profile = await prisma.hairdresserProfile.findUnique({
    where: { userId },
    include: profileInclude
  });
  if (!profile) throw notFound("Hairdresser profile not found");
  return profile;
}

const profileInclude = {
  skills: { include: { skill: true } },
  credentials: { include: { qualification: true }, orderBy: { createdAt: "desc" as const } },
  workExperiences: { orderBy: { startDate: "desc" as const } },
  portfolioItems: { orderBy: { createdAt: "desc" as const } }
};

export async function upsertHairdresserProfile(
  userId: string,
  data: Prisma.HairdresserProfileUncheckedUpdateInput,
  create = false
) {
  const existing = await prisma.hairdresserProfile.findUnique({ where: { userId } });
  if (!existing && !create) {
    throw notFound("Create a profile before updating it");
  }
  if (existing) {
    return prisma.hairdresserProfile.update({
      where: { userId },
      data,
      include: profileInclude
    });
  }
  return prisma.hairdresserProfile.create({
    data: {
      userId,
      firstName: String(data.firstName ?? "New"),
      lastName: String(data.lastName ?? "Professional"),
      ...data
    } as Prisma.HairdresserProfileUncheckedCreateInput,
    include: profileInclude
  });
}

export async function getPublicHairdresser(id: string) {
  const profile = await prisma.hairdresserProfile.findUnique({
    where: { id },
    include: {
      ...profileInclude,
      user: { select: { status: true } }
    }
  });
  if (!profile || profile.user.status !== "ACTIVE") {
    throw notFound("Hairdresser not found");
  }

  await prisma.hairdresserProfile.update({
    where: { id },
    data: { profileViews: { increment: 1 } }
  });

  return toPublicHairdresser({
    ...profile,
    profileViews: profile.profileViews + 1
  } as typeof profile);
}

export async function searchHairdressers(query: {
  q?: string;
  location?: string;
  skillIds?: string[];
  qualificationId?: string;
  minExperience?: number;
  availability?: string;
  employmentType?: string;
  verified?: boolean;
  page?: number;
  pageSize?: number;
}) {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, query.pageSize ?? 12));
  const where: Prisma.HairdresserProfileWhereInput = {
    user: { status: "ACTIVE" }
  };

  if (query.q) {
    where.OR = [
      { firstName: { contains: query.q, mode: "insensitive" } },
      { lastName: { contains: query.q, mode: "insensitive" } },
      { professionalTitle: { contains: query.q, mode: "insensitive" } },
      { bio: { contains: query.q, mode: "insensitive" } }
    ];
  }
  if (query.location) {
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
      {
        OR: [
          { location: { contains: query.location, mode: "insensitive" } },
          { suburb: { contains: query.location, mode: "insensitive" } },
          { state: { contains: query.location, mode: "insensitive" } },
          { postcode: { contains: query.location, mode: "insensitive" } }
        ]
      }
    ];
  }
  if (query.skillIds?.length) {
    where.skills = { some: { skillId: { in: query.skillIds } } };
  }
  if (query.qualificationId) {
    where.credentials = {
      some: {
        qualificationId: query.qualificationId,
        ...(query.verified ? { status: "VERIFIED" } : {})
      }
    };
  } else if (query.verified) {
    where.credentials = { some: { status: "VERIFIED" } };
  }
  if (query.minExperience !== undefined) {
    where.yearsOfExperience = { gte: query.minExperience };
  }
  if (query.availability) {
    where.availability = query.availability as HairdresserProfile["availability"];
  }
  if (query.employmentType) {
    where.preferredEmploymentType = query.employmentType as HairdresserProfile["preferredEmploymentType"];
  }

  const [total, items] = await prisma.$transaction([
    prisma.hairdresserProfile.count({ where }),
    prisma.hairdresserProfile.findMany({
      where,
      include: profileInclude,
      orderBy: [{ yearsOfExperience: "desc" }, { updatedAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize
    })
  ]);

  return {
    page,
    pageSize,
    total,
    items: items.map((item) => {
      const publicProfile = toPublicHairdresser(item);
      const completion = calculateProfileCompletion(item);
      const hasVerified = item.credentials.some(
        (credential) => effectiveCredentialStatus(credential.status, credential.expiryDate) === "VERIFIED"
      );
      return {
        ...publicProfile,
        profileCompletion: completion.total,
        verified: hasVerified
      };
    })
  };
}

export async function setSkills(userId: string, skillIds: string[]) {
  const profile = await getOwnHairdresserProfile(userId);
  const unique = [...new Set(skillIds)];
  const skills = await prisma.skill.findMany({ where: { id: { in: unique }, isActive: true } });
  if (skills.length !== unique.length) {
    throw badRequest("One or more skills are invalid");
  }

  await prisma.$transaction([
    prisma.hairdresserSkill.deleteMany({ where: { hairdresserProfileId: profile.id } }),
    prisma.hairdresserSkill.createMany({
      data: unique.map((skillId) => ({ hairdresserProfileId: profile.id, skillId }))
    })
  ]);

  return getOwnHairdresserProfile(userId);
}

export async function removeSkill(userId: string, skillId: string) {
  const profile = await getOwnHairdresserProfile(userId);
  await prisma.hairdresserSkill.deleteMany({
    where: { hairdresserProfileId: profile.id, skillId }
  });
  return getOwnHairdresserProfile(userId);
}

export async function addCredential(
  userId: string,
  data: {
    qualificationId?: string;
    qualificationName: string;
    issuingOrganisation: string;
    credentialNumber?: string;
    issueDate?: Date;
    expiryDate?: Date;
    documentKey?: string;
  }
) {
  const profile = await getOwnHairdresserProfile(userId);
  if (data.qualificationId) {
    const qualification = await prisma.qualification.findUnique({ where: { id: data.qualificationId } });
    if (!qualification) throw badRequest("Unknown qualification");
    data.qualificationName = qualification.name;
  }

  return prisma.credential.create({
    data: {
      hairdresserProfileId: profile.id,
      qualificationId: data.qualificationId,
      qualificationName: data.qualificationName,
      issuingOrganisation: data.issuingOrganisation,
      credentialNumber: data.credentialNumber,
      issueDate: data.issueDate,
      expiryDate: data.expiryDate,
      documentKey: data.documentKey,
      status: "PENDING"
    },
    include: { qualification: true }
  });
}

export async function updateCredential(
  userId: string,
  credentialId: string,
  data: Prisma.CredentialUncheckedUpdateInput
) {
  const profile = await getOwnHairdresserProfile(userId);
  const credential = await prisma.credential.findUnique({ where: { id: credentialId } });
  if (!credential || credential.hairdresserProfileId !== profile.id) {
    throw notFound("Credential not found");
  }
  if (credential.status === "VERIFIED") {
    throw forbidden("Verified credentials cannot be edited. Contact MMCollege admin if a correction is required.");
  }
  return prisma.credential.update({
    where: { id: credentialId },
    data: { ...data, status: "PENDING" },
    include: { qualification: true }
  });
}

export async function deleteCredential(userId: string, credentialId: string) {
  const profile = await getOwnHairdresserProfile(userId);
  const result = await prisma.credential.deleteMany({
    where: { id: credentialId, hairdresserProfileId: profile.id }
  });
  if (result.count === 0) throw notFound("Credential not found");
}

export async function addExperience(
  userId: string,
  data: {
    employerName: string;
    position: string;
    startDate: Date;
    endDate?: Date;
    description?: string;
  }
) {
  const profile = await getOwnHairdresserProfile(userId);
  return prisma.workExperience.create({
    data: { ...data, hairdresserProfileId: profile.id }
  });
}

export async function updateExperience(
  userId: string,
  id: string,
  data: Prisma.WorkExperienceUncheckedUpdateInput
) {
  const profile = await getOwnHairdresserProfile(userId);
  const existing = await prisma.workExperience.findUnique({ where: { id } });
  if (!existing || existing.hairdresserProfileId !== profile.id) {
    throw notFound("Experience not found");
  }
  return prisma.workExperience.update({ where: { id }, data });
}

export async function deleteExperience(userId: string, id: string) {
  const profile = await getOwnHairdresserProfile(userId);
  const result = await prisma.workExperience.deleteMany({
    where: { id, hairdresserProfileId: profile.id }
  });
  if (result.count === 0) throw notFound("Experience not found");
}

export async function addPortfolioItem(
  userId: string,
  data: { imageUrl: string; title: string; description?: string; category?: string }
) {
  const profile = await getOwnHairdresserProfile(userId);
  return prisma.portfolioItem.create({
    data: { ...data, hairdresserProfileId: profile.id }
  });
}

export async function deletePortfolioItem(userId: string, id: string) {
  const profile = await getOwnHairdresserProfile(userId);
  const result = await prisma.portfolioItem.deleteMany({
    where: { id, hairdresserProfileId: profile.id }
  });
  if (result.count === 0) throw notFound("Portfolio item not found");
}

export async function getHairdresserDashboard(userId: string) {
  const profile = await getOwnHairdresserProfile(userId);
  const completion = calculateProfileCompletion(profile);

  const [contacts, recommendedJobs, unreadMessages] = await prisma.$transaction([
    prisma.conversation.count({
      where: { OR: [{ participantAId: userId }, { participantBId: userId }] }
    }),
    prisma.job.findMany({
      where: { status: "ACTIVE" },
      include: {
        requiredSkills: { include: { skill: true } },
        requiredQualification: true,
        employerProfile: true
      },
      orderBy: { postedAt: "desc" },
      take: 20
    }),
    prisma.message.count({
      where: {
        readAt: null,
        senderId: { not: userId },
        conversation: { OR: [{ participantAId: userId }, { participantBId: userId }] }
      }
    })
  ]);

  const candidate = {
    id: profile.id,
    location: profile.location,
    suburb: profile.suburb,
    state: profile.state,
    yearsOfExperience: profile.yearsOfExperience,
    availability: profile.availability,
    employmentStatus: profile.employmentStatus,
    skillNames: profile.skills.map((item) => item.skill.name),
    qualificationNames: profile.credentials.map((item) => item.qualificationName),
    verifiedQualificationNames: profile.credentials
      .filter((item) => effectiveCredentialStatus(item.status, item.expiryDate) === "VERIFIED")
      .map((item) => item.qualificationName)
  };

  const jobs = recommendedJobs
    .map((job) => ({
      job,
      match: scoreCandidate(candidate, {
        location: job.location,
        requiredSkillNames: job.requiredSkills.map((item) => item.skill.name),
        requiredQualificationName: job.requiredQualification?.name,
        requiredExperienceYears: job.requiredExperienceYears
      })
    }))
    .sort((a, b) => b.match.score - a.match.score)
    .slice(0, 5);

  const verificationSummary = {
    verified: profile.credentials.filter((item) => effectiveCredentialStatus(item.status, item.expiryDate) === "VERIFIED")
      .length,
    pending: profile.credentials.filter((item) => item.status === "PENDING").length,
    rejected: profile.credentials.filter((item) => item.status === "REJECTED").length,
    expired: profile.credentials.filter((item) => effectiveCredentialStatus(item.status, item.expiryDate) === "EXPIRED")
      .length
  };

  return {
    profile,
    completion,
    verificationSummary,
    profileViews: profile.profileViews,
    employerInterests: contacts,
    unreadMessages,
    recommendedJobs: jobs
  };
}

export { publicCredentialSelect };
