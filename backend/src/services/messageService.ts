import { prisma } from "../config/prisma.js";
import { badRequest, forbidden, notFound } from "../utils/httpError.js";
import { notify } from "./notificationService.js";

function orderedPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export async function listConversations(userId: string) {
  return prisma.conversation.findMany({
    where: { OR: [{ participantAId: userId }, { participantBId: userId }] },
    include: {
      participantA: {
        select: {
          id: true,
          role: true,
          hairdresserProfile: { select: { id: true, firstName: true, lastName: true, profilePhotoUrl: true } },
          employerProfile: { select: { id: true, businessName: true, logoUrl: true } }
        }
      },
      participantB: {
        select: {
          id: true,
          role: true,
          hairdresserProfile: { select: { id: true, firstName: true, lastName: true, profilePhotoUrl: true } },
          employerProfile: { select: { id: true, businessName: true, logoUrl: true } }
        }
      },
      messages: { orderBy: { createdAt: "desc" }, take: 1 }
    },
    orderBy: { updatedAt: "desc" }
  });
}

export async function startConversation(employerUserId: string, hairdresserProfileId: string, body: string) {
  const hairdresser = await prisma.hairdresserProfile.findUnique({
    where: { id: hairdresserProfileId },
    include: { user: true }
  });
  if (!hairdresser || hairdresser.user.status !== "ACTIVE") {
    throw notFound("Hairdresser not found");
  }
  if (!body.trim()) throw badRequest("Message cannot be empty");

  const [participantAId, participantBId] = orderedPair(employerUserId, hairdresser.userId);
  const conversation = await prisma.conversation.upsert({
    where: { participantAId_participantBId: { participantAId, participantBId } },
    update: { updatedAt: new Date() },
    create: { participantAId, participantBId }
  });

  const message = await prisma.message.create({
    data: { conversationId: conversation.id, senderId: employerUserId, body: body.trim() }
  });

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date() }
  });

  await notify({
    userId: hairdresser.userId,
    type: "MESSAGE",
    title: "New employer message",
    body: "An employer has contacted you on MM Connect.",
    linkUrl: `/messages/${conversation.id}`
  });

  return { conversation, message };
}

export async function getMessages(userId: string, conversationId: string) {
  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation) throw notFound("Conversation not found");
  if (conversation.participantAId !== userId && conversation.participantBId !== userId) {
    throw forbidden();
  }

  await prisma.message.updateMany({
    where: { conversationId, senderId: { not: userId }, readAt: null },
    data: { readAt: new Date() }
  });

  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { id: true, role: true } } }
  });
}

export async function sendMessage(userId: string, conversationId: string, body: string) {
  if (!body.trim()) throw badRequest("Message cannot be empty");
  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation) throw notFound("Conversation not found");
  if (conversation.participantAId !== userId && conversation.participantBId !== userId) {
    throw forbidden();
  }

  const message = await prisma.message.create({
    data: { conversationId, senderId: userId, body: body.trim() }
  });
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() }
  });

  const recipientId =
    conversation.participantAId === userId ? conversation.participantBId : conversation.participantAId;
  await notify({
    userId: recipientId,
    type: "MESSAGE",
    title: "New message",
    body: "You have a new message on MM Connect.",
    linkUrl: `/messages/${conversationId}`
  });

  return message;
}
