import { z } from "zod";

export const jobSchema = z.object({
  title: z.string().min(2).max(160),
  description: z.string().min(10).max(5000),
  location: z.string().min(2).max(160),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CASUAL", "CONTRACT", "APPRENTICESHIP"]),
  salaryMin: z.number().int().min(0).optional(),
  salaryMax: z.number().int().min(0).optional(),
  salaryDisplay: z.string().max(80).optional(),
  requiredExperienceYears: z.number().int().min(0).max(40).optional(),
  requiredQualificationId: z.string().uuid().optional(),
  skillIds: z.array(z.string().uuid()).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "CLOSED"]).optional()
});

export const jobUpdateSchema = jobSchema.partial();

export const applySchema = z.object({
  coverNote: z.string().max(2000).optional()
});

export const jobListQuerySchema = z.object({
  q: z.string().optional(),
  location: z.string().optional(),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CASUAL", "CONTRACT", "APPRENTICESHIP"]).optional(),
  mine: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(50).optional()
});
