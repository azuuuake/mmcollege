import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { badRequest, conflict, forbidden, unauthorized } from "../utils/httpError.js";
import { createRawToken, hashToken, signAccessToken } from "../utils/tokens.js";

const PUBLIC_ROLES: Role[] = ["HAIRDRESSER", "EMPLOYER"];

function sanitiseUser<T extends { passwordHash?: string }>(user: T) {
  const { passwordHash: _passwordHash, ...safe } = user;
  return safe;
}

export async function register(input: {
  email: string;
  password: string;
  role: Role;
  firstName?: string;
  lastName?: string;
  businessName?: string;
}) {
  if (!PUBLIC_ROLES.includes(input.role)) {
    throw forbidden("Admin accounts cannot be created through public registration");
  }

  const email = input.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw conflict("An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, env.bcryptRounds);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: input.role,
      ...(input.role === "HAIRDRESSER"
        ? {
            hairdresserProfile: {
              create: {
                firstName: input.firstName?.trim() || "New",
                lastName: input.lastName?.trim() || "Professional"
              }
            }
          }
        : {
            employerProfile: {
              create: {
                businessName: input.businessName?.trim() || "New Salon"
              }
            }
          })
    },
    include: {
      hairdresserProfile: true,
      employerProfile: true
    }
  });

  const token = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  return { token, user: sanitiseUser(user) };
}

export async function login(input: { email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
    include: { hairdresserProfile: true, employerProfile: true }
  });
  if (!user) {
    throw unauthorized("Invalid email or password");
  }
  if (user.status === "SUSPENDED") {
    throw forbidden("This account has been suspended");
  }

  const matches = await bcrypt.compare(input.password, user.passwordHash);
  if (!matches) {
    throw unauthorized("Invalid email or password");
  }

  const token = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  return { token, user: sanitiseUser(user) };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { hairdresserProfile: true, employerProfile: true }
  });
  if (!user) {
    throw unauthorized("Account no longer exists");
  }
  return sanitiseUser(user);
}

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  // Always succeed so callers cannot enumerate accounts.
  if (!user) {
    return { delivered: false };
  }

  const raw = createRawToken();
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(raw),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000)
    }
  });

  if (env.nodeEnv !== "production") {
    console.info(`[password-reset] token for ${user.email}: ${raw}`);
  }

  return { delivered: false, resetToken: env.nodeEnv === "production" ? undefined : raw };
}

export async function resetPassword(input: { token: string; password: string }) {
  const tokenHash = hashToken(input.token);
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
    throw badRequest("Reset token is invalid or expired");
  }

  const passwordHash = await bcrypt.hash(input.password, env.bcryptRounds);
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } })
  ]);
}
