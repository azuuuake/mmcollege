import { Router } from "express";
import * as messageController from "../controllers/messageController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { sendMessageSchema, startConversationSchema } from "../validators/message.js";

export const conversationRouter = Router();

conversationRouter.get("/", requireAuth, messageController.listConversations);
conversationRouter.post(
  "/",
  requireAuth,
  requireRole("EMPLOYER"),
  validateBody(startConversationSchema),
  messageController.startConversation
);
conversationRouter.get("/:id/messages", requireAuth, messageController.getMessages);
conversationRouter.post(
  "/:id/messages",
  requireAuth,
  validateBody(sendMessageSchema),
  messageController.sendMessage
);
