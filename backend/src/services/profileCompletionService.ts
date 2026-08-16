import type { HairdresserProfile } from "@prisma/client";

type ProfileWithRelations = HairdresserProfile & {
  skills: unknown[];
  credentials: unknown[];
  workExperiences: unknown[];
  portfolioItems: unknown[];
};

export type CompletionBreakdown = {
  basic: number;
  professional: number;
  skills: number;
  qualification: number;
  experience: number;
  portfolio: number;
  total: number;
};

function filled(value: unknown): boolean {
  if (typeof value === "string") return value.trim().length > 0;
  return value !== null && value !== undefined;
}

export function calculateProfileCompletion(profile: ProfileWithRelations): CompletionBreakdown {
  const basicFields = [
    profile.firstName,
    profile.lastName,
    profile.location,
    profile.phone,
    profile.profilePhotoUrl,
    profile.bio
  ];
  const basicScore = (basicFields.filter(filled).length / basicFields.length) * 20;

  const professionalFields = [
    profile.professionalTitle,
    profile.yearsOfExperience > 0 ? profile.yearsOfExperience : null,
    profile.employmentStatus,
    profile.availability,
    profile.preferredEmploymentType
  ];
  const professionalScore = (professionalFields.filter(filled).length / professionalFields.length) * 20;

  const skillsScore = profile.skills.length > 0 ? 15 : 0;
  const qualificationScore = profile.credentials.length > 0 ? 20 : 0;
  const experienceScore = profile.workExperiences.length > 0 ? 15 : 0;
  const portfolioScore = profile.portfolioItems.length > 0 ? 10 : 0;

  const total = Math.round(
    basicScore + professionalScore + skillsScore + qualificationScore + experienceScore + portfolioScore
  );

  return {
    basic: Math.round(basicScore),
    professional: Math.round(professionalScore),
    skills: skillsScore,
    qualification: qualificationScore,
    experience: experienceScore,
    portfolio: portfolioScore,
    total
  };
}
