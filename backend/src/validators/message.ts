import { z } from "zod";

export const startConversationSchema = z.object({
  hairdresserProfileId: z.string().uuid(),
  body: z.string().min(1).max(4000)
});

export const sendMessageSchema = z.object({
  body: z.string().min(1).max(4000)
});

export const reportSchema = z.object({
  targetType: z.enum(["PROFILE", "PORTFOLIO", "MESSAGE", "JOB"]),
  targetId: z.string().uuid(),
  reportedUserId: z.string().uuid().optional(),
  reason: z.string().min(4).max(1000)
});
