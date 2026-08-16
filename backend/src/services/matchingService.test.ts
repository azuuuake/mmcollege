import { describe, expect, it } from "vitest";
import { effectiveCredentialStatus, scoreCandidate } from "./matchingService.js";

describe("matchingService", () => {
  it("scores overlapping skills and location", () => {
    const result = scoreCandidate(
      {
        id: "c1",
        location: "Melbourne, VIC",
        suburb: "Melbourne",
        state: "VIC",
        yearsOfExperience: 4,
        availability: "IMMEDIATE",
        employmentStatus: "SEEKING",
        skillNames: ["Hair colouring", "Balayage"],
        qualificationNames: ["Certificate III in Hairdressing"],
        verifiedQualificationNames: ["Certificate III in Hairdressing"]
      },
      {
        location: "Melbourne",
        requiredSkillNames: ["Balayage", "Hair colouring"],
        requiredQualificationName: "Certificate III in Hairdressing",
        requiredExperienceYears: 2
      }
    );

    expect(result.score).toBe(100);
    expect(result.matchingSkills).toHaveLength(2);
    expect(result.qualificationMatch).toBe(true);
    expect(result.experienceMatch).toBe(true);
    expect(result.locationMatch).toBe(true);
  });

  it("treats expired verified credentials as expired for display", () => {
    expect(effectiveCredentialStatus("VERIFIED", new Date("2020-01-01"))).toBe("EXPIRED");
    expect(effectiveCredentialStatus("VERIFIED", new Date("2099-01-01"))).toBe("VERIFIED");
  });
});
