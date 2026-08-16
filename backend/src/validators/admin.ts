import { z } from "zod";

export const adminUserQuerySchema = z.object({
  q: z.string().optional(),
  role: z.enum(["HAIRDRESSER", "EMPLOYER", "ADMIN"]).optional(),
  status: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(50).optional()
});

export const suspendSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED"])
});

export const reviewSchema = z.object({
  notes: z.string().max(2000).optional()
});

export const credentialQuerySchema = z.object({
  status: z.enum(["PENDING", "VERIFIED", "REJECTED", "EXPIRED"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(50).optional()
});

export const reportStatusSchema = z.object({
  status: z.enum(["OPEN", "REVIEWED", "DISMISSED"])
});
