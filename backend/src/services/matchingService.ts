import type { Availability, CredentialStatus, EmploymentStatus } from "@prisma/client";

export type MatchableCandidate = {
  id: string;
  location?: string | null;
  suburb?: string | null;
  state?: string | null;
  yearsOfExperience: number;
  availability?: Availability | null;
  employmentStatus?: EmploymentStatus | null;
  skillNames: string[];
  qualificationNames: string[];
  verifiedQualificationNames: string[];
};

export type MatchCriteria = {
  location?: string | null;
  requiredSkillNames?: string[];
  requiredQualificationName?: string | null;
  requiredExperienceYears?: number | null;
};

export type MatchResult = {
  candidateId: string;
  score: number;
  matchingSkills: string[];
  qualificationMatch: boolean;
  experienceMatch: boolean;
  locationMatch: boolean;
};

const WEIGHTS = {
  skills: 40,
  qualification: 25,
  experience: 20,
  location: 10,
  availability: 5
};

function tokens(value?: string | null): string[] {
  return (value ?? "")
    .toLowerCase()
    .split(/[\s,/-]+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 1);
}

function locationOverlap(candidate: MatchableCandidate, location?: string | null): boolean {
  if (!location) return false;
  const haystack = tokens([candidate.location, candidate.suburb, candidate.state].filter(Boolean).join(" "));
  const needles = tokens(location);
  return needles.some((needle) => haystack.includes(needle));
}

/**
 * Deterministic matching only. This function never writes verification status.
 * Verification is exclusively an admin database workflow.
 */
export function scoreCandidate(candidate: MatchableCandidate, criteria: MatchCriteria): MatchResult {
  const requiredSkills = (criteria.requiredSkillNames ?? []).map((name) => name.toLowerCase());
  const matchingSkills = candidate.skillNames.filter((name) => requiredSkills.includes(name.toLowerCase()));
  const skillScore =
    requiredSkills.length === 0
      ? WEIGHTS.skills
      : (matchingSkills.length / requiredSkills.length) * WEIGHTS.skills;

  const requiredQual = criteria.requiredQualificationName?.toLowerCase();
  const qualificationMatch = requiredQual
    ? candidate.verifiedQualificationNames.some((name) => name.toLowerCase() === requiredQual) ||
      candidate.qualificationNames.some((name) => name.toLowerCase() === requiredQual)
    : false;
  const qualificationScore = !requiredQual ? WEIGHTS.qualification : qualificationMatch ? WEIGHTS.qualification : 0;

  const requiredYears = criteria.requiredExperienceYears ?? 0;
  const experienceMatch = candidate.yearsOfExperience >= requiredYears;
  const experienceScore =
    requiredYears === 0
      ? WEIGHTS.experience
      : Math.min(candidate.yearsOfExperience / requiredYears, 1) * WEIGHTS.experience;

  const locationMatch = locationOverlap(candidate, criteria.location);
  const locationScore = !criteria.location ? WEIGHTS.location : locationMatch ? WEIGHTS.location : 0;

  const availabilityScore =
    candidate.employmentStatus === "SEEKING" ||
    candidate.employmentStatus === "OPEN_TO_OPPORTUNITIES" ||
    candidate.availability === "IMMEDIATE" ||
    candidate.availability === "FLEXIBLE"
      ? WEIGHTS.availability
      : 0;

  const score = Math.round(skillScore + qualificationScore + experienceScore + locationScore + availabilityScore);

  return {
    candidateId: candidate.id,
    score,
    matchingSkills,
    qualificationMatch,
    experienceMatch,
    locationMatch
  };
}

export function effectiveCredentialStatus(
  status: CredentialStatus,
  expiryDate?: Date | null
): CredentialStatus {
  if (status === "VERIFIED" && expiryDate && expiryDate.getTime() < Date.now()) {
    return "EXPIRED";
  }
  return status;
}
