import type { CredentialStatus, Prisma, Role, UserStatus } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { forbidden, notFound } from "../utils/httpError.js";
import { writeAuditLog } from "./auditService.js";
import { notify } from "./notificationService.js";

export async function getAdminStats() {
  const [hairdressers, employers, verifiedCredentials, pendingVerifications, activeJobs] = await Promise.all([
    prisma.user.count({ where: { role: "HAIRDRESSER" } }),
    prisma.user.count({ where: { role: "EMPLOYER" } }),
    prisma.credential.count({ where: { status: "VERIFIED" } }),
    prisma.credential.count({ where: { status: "PENDING" } }),
    prisma.job.count({ where: { status: "ACTIVE" } })
  ]);

  return { hairdressers, employers, verifiedCredentials, pendingVerifications, activeJobs };
}

export async function listUsers(query: { q?: string; role?: Role; status?: UserStatus; page?: number; pageSize?: number }) {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, query.pageSize ?? 20));
  const where: Prisma.UserWhereInput = {};
  if (query.role) where.role = query.role;
  if (query.status) where.status = query.status;
  if (query.q) {
    where.OR = [
      { email: { contains: query.q, mode: "insensitive" } },
      { hairdresserProfile: { firstName: { contains: query.q, mode: "insensitive" } } },
      { hairdresserProfile: { lastName: { contains: query.q, mode: "insensitive" } } },
      { employerProfile: { businessName: { contains: query.q, mode: "insensitive" } } }
    ];
  }

  const [total, items] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        hairdresserProfile: {
          select: { id: true, firstName: true, lastName: true, professionalTitle: true, location: true }
        },
        employerProfile: { select: { id: true, businessName: true, location: true } }
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    })
  ]);

  return { page, pageSize, total, items };
}

export async function getUserAdminDetail(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      hairdresserProfile: {
        include: {
          skills: { include: { skill: true } },
          credentials: { include: { qualification: true, verifications: true } },
          workExperiences: true,
          portfolioItems: true
        }
      },
      employerProfile: { include: { jobs: true } }
    }
  });
  if (!user) throw notFound("User not found");
  return user;
}

export async function setUserStatus(actorId: string, userId: string, status: UserStatus) {
  if (actorId === userId) throw forbidden("Administrators cannot suspend their own account");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw notFound("User not found");
  if (user.role === "ADMIN") throw forbidden("Admin accounts cannot be suspended from this screen");

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { status },
    select: { id: true, email: true, role: true, status: true }
  });

  await writeAuditLog({
    actorId,
    action: status === "SUSPENDED" ? "USER_SUSPENDED" : "USER_RESTORED",
    entityType: "User",
    entityId: userId,
    metadata: { status }
  });

  return updated;
}

export async function listCredentials(query: { status?: CredentialStatus; page?: number; pageSize?: number }) {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, query.pageSize ?? 20));
  const where: Prisma.CredentialWhereInput = query.status ? { status: query.status } : {};

  const [total, items] = await prisma.$transaction([
    prisma.credential.count({ where }),
    prisma.credential.findMany({
      where,
      include: {
        qualification: true,
        hairdresserProfile: {
          select: { id: true, firstName: true, lastName: true, userId: true }
        },
        verifications: { orderBy: { createdAt: "desc" }, take: 5 }
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    })
  ]);

  return { page, pageSize, total, items };
}

export async function reviewCredential(
  actorId: string,
  credentialId: string,
  decision: "VERIFIED" | "REJECTED",
  notes?: string
) {
  const credential = await prisma.credential.findUnique({
    where: { id: credentialId },
    include: { hairdresserProfile: true }
  });
  if (!credential) throw notFound("Credential not found");

  const updated = await prisma.$transaction(async (tx) => {
    const next = await tx.credential.update({
      where: { id: credentialId },
      data: { status: decision },
      include: { qualification: true, hairdresserProfile: true }
    });
    await tx.credentialVerification.create({
      data: {
        credentialId,
        reviewerId: actorId,
        status: decision,
        notes,
        verifiedAt: decision === "VERIFIED" ? new Date() : null
      }
    });
    return next;
  });

  await writeAuditLog({
    actorId,
    action: decision === "VERIFIED" ? "CREDENTIAL_VERIFIED" : "CREDENTIAL_REJECTED",
    entityType: "Credential",
    entityId: credentialId,
    metadata: { notes, qualificationName: credential.qualificationName }
  });

  await notify({
    userId: credential.hairdresserProfile.userId,
    type: "VERIFICATION",
    title: decision === "VERIFIED" ? "Credential verified" : "Credential not verified",
    body:
      decision === "VERIFIED"
        ? `${credential.qualificationName} is now MMCollege Verified.`
        : `${credential.qualificationName} was not verified. ${notes ?? ""}`.trim(),
    linkUrl: "/dashboard"
  });

  return updated;
}

export async function listReports(query: { status?: "OPEN" | "REVIEWED" | "DISMISSED"; page?: number; pageSize?: number }) {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, query.pageSize ?? 20));
  const where = query.status ? { status: query.status } : {};
  const [total, items] = await prisma.$transaction([
    prisma.report.count({ where }),
    prisma.report.findMany({
      where,
      include: {
        reporter: { select: { id: true, email: true, role: true } },
        reportedUser: { select: { id: true, email: true, role: true } }
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    })
  ]);
  return { page, pageSize, total, items };
}

export async function updateReport(id: string, status: "OPEN" | "REVIEWED" | "DISMISSED", actorId: string) {
  const report = await prisma.report.update({ where: { id }, data: { status } });
  await writeAuditLog({
    actorId,
    action: "REPORT_UPDATED",
    entityType: "Report",
    entityId: id,
    metadata: { status }
  });
  return report;
}

export async function createReport(input: {
  reporterId: string;
  reportedUserId?: string;
  targetType: "PROFILE" | "PORTFOLIO" | "MESSAGE" | "JOB";
  targetId: string;
  reason: string;
}) {
  return prisma.report.create({ data: input });
}
