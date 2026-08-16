import { z } from "zod";

export const hairdresserProfileSchema = z.object({
  firstName: z.string().min(1).max(80).optional(),
  lastName: z.string().min(1).max(80).optional(),
  profilePhotoUrl: z.string().max(500).optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  location: z.string().max(160).optional().nullable(),
  suburb: z.string().max(80).optional().nullable(),
  state: z.string().max(40).optional().nullable(),
  postcode: z.string().max(12).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  professionalTitle: z.string().max(120).optional().nullable(),
  yearsOfExperience: z.number().int().min(0).max(60).optional(),
  employmentStatus: z.enum(["EMPLOYED", "SEEKING", "OPEN_TO_OPPORTUNITIES", "NOT_LOOKING"]).optional().nullable(),
  availability: z.enum(["IMMEDIATE", "TWO_WEEKS", "ONE_MONTH", "FLEXIBLE"]).optional().nullable(),
  preferredEmploymentType: z
    .enum(["FULL_TIME", "PART_TIME", "CASUAL", "CONTRACT", "APPRENTICESHIP"])
    .optional()
    .nullable()
});

export const skillsSchema = z.object({
  skillIds: z.array(z.string().uuid()).min(1)
});

export const credentialSchema = z.object({
  qualificationId: z.string().uuid().optional(),
  qualificationName: z.string().min(2).max(200),
  issuingOrganisation: z.string().min(2).max(200),
  credentialNumber: z.string().max(80).optional(),
  issueDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
  documentKey: z.string().max(500).optional()
});

export const experienceSchema = z.object({
  employerName: z.string().min(1).max(160),
  position: z.string().min(1).max(160),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  description: z.string().max(2000).optional()
});

export const portfolioSchema = z.object({
  imageUrl: z.string().min(1).max(500),
  title: z.string().min(1).max(160),
  description: z.string().max(1000).optional(),
  category: z.string().max(80).optional()
});

export const searchQuerySchema = z.object({
  q: z.string().optional(),
  location: z.string().optional(),
  skillIds: z.string().optional(),
  qualificationId: z.string().uuid().optional(),
  minExperience: z.coerce.number().int().min(0).optional(),
  availability: z.enum(["IMMEDIATE", "TWO_WEEKS", "ONE_MONTH", "FLEXIBLE"]).optional(),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CASUAL", "CONTRACT", "APPRENTICESHIP"]).optional(),
  verified: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(50).optional()
});
