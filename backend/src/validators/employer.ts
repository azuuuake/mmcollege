import { z } from "zod";

export const employerProfileSchema = z.object({
  businessName: z.string().min(1).max(160).optional(),
  logoUrl: z.string().max(500).optional().nullable(),
  description: z.string().max(3000).optional().nullable(),
  location: z.string().max(160).optional().nullable(),
  suburb: z.string().max(80).optional().nullable(),
  state: z.string().max(40).optional().nullable(),
  website: z.string().max(300).optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  contactEmail: z.string().email().optional().nullable(),
  businessType: z.string().max(80).optional().nullable()
});
