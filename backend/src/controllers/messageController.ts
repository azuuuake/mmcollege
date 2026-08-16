import type { Request, Response } from "express";
import * as messageService from "../services/messageService.js";
import * as notificationService from "../services/notificationService.js";
import * as adminService from "../services/adminService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { routeParam } from "../utils/params.js";

export const listConversations = asyncHandler(async (req: Request, res: Response) => {
  const conversations = await messageService.listConversations(req.user!.id);
  res.json({ conversations });
});

export const startConversation = asyncHandler(async (req: Request, res: Response) => {
  const result = await messageService.startConversation(
    req.user!.id,
    req.body.hairdresserProfileId,
    req.body.body
  );
  res.status(201).json(result);
});

export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const messages = await messageService.getMessages(req.user!.id, routeParam(req, "id"));
  res.json({ messages });
});

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const message = await messageService.sendMessage(req.user!.id, routeParam(req, "id"), req.body.body);
  res.status(201).json({ message });
});

export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  const notifications = await notificationService.listNotifications(req.user!.id);
  res.json({ notifications });
});

export const readNotification = asyncHandler(async (req: Request, res: Response) => {
  await notificationService.markNotificationRead(req.user!.id, routeParam(req, "id"));
  res.json({ ok: true });
});

export const readAllNotifications = asyncHandler(async (req: Request, res: Response) => {
  await notificationService.markAllNotificationsRead(req.user!.id);
  res.json({ ok: true });
});

export const createReport = asyncHandler(async (req: Request, res: Response) => {
  const report = await adminService.createReport({
    reporterId: req.user!.id,
    ...req.body
  });
  res.status(201).json({ report });
});
