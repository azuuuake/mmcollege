import type { NotificationType } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export async function notify(input: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  linkUrl?: string;
}) {
  return prisma.notification.create({ data: input });
}

export async function listNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50
  });
}

export async function markNotificationRead(userId: string, id: string) {
  await prisma.notification.updateMany({
    where: { id, userId },
    data: { readAt: new Date() }
  });
}

export async function markAllNotificationsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() }
  });
}
