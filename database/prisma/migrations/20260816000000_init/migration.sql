-- CreateEnum
CREATE TYPE "Role" AS ENUM ('HAIRDRESSER', 'EMPLOYER', 'ADMIN');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED');
CREATE TYPE "EmploymentStatus" AS ENUM ('EMPLOYED', 'SEEKING', 'OPEN_TO_OPPORTUNITIES', 'NOT_LOOKING');
CREATE TYPE "Availability" AS ENUM ('IMMEDIATE', 'TWO_WEEKS', 'ONE_MONTH', 'FLEXIBLE');
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CASUAL', 'CONTRACT', 'APPRENTICESHIP');
CREATE TYPE "CredentialStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED');
CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'ACTIVE', 'CLOSED');
CREATE TYPE "ApplicationStatus" AS ENUM ('INTERESTED', 'WITHDRAWN');
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'REVIEWED', 'DISMISSED');
CREATE TYPE "ReportTargetType" AS ENUM ('PROFILE', 'PORTFOLIO', 'MESSAGE', 'JOB');
CREATE TYPE "NotificationType" AS ENUM ('MESSAGE', 'APPLICATION', 'VERIFICATION', 'JOB_MATCH', 'SYSTEM');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HairdresserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "profilePhotoUrl" TEXT,
    "phone" TEXT,
    "location" TEXT,
    "suburb" TEXT,
    "state" TEXT,
    "postcode" TEXT,
    "bio" TEXT,
    "professionalTitle" TEXT,
    "yearsOfExperience" INTEGER NOT NULL DEFAULT 0,
    "employmentStatus" "EmploymentStatus",
    "availability" "Availability",
    "preferredEmploymentType" "EmploymentType",
    "profileViews" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "HairdresserProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EmployerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "logoUrl" TEXT,
    "description" TEXT,
    "location" TEXT,
    "suburb" TEXT,
    "state" TEXT,
    "website" TEXT,
    "phone" TEXT,
    "contactEmail" TEXT,
    "businessType" TEXT,
    "profileViews" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "EmployerProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HairdresserSkill" (
    "id" TEXT NOT NULL,
    "hairdresserProfileId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    CONSTRAINT "HairdresserSkill_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Qualification" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Qualification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Credential" (
    "id" TEXT NOT NULL,
    "hairdresserProfileId" TEXT NOT NULL,
    "qualificationId" TEXT,
    "qualificationName" TEXT NOT NULL,
    "issuingOrganisation" TEXT NOT NULL,
    "credentialNumber" TEXT,
    "issueDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "documentKey" TEXT,
    "status" "CredentialStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Credential_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CredentialVerification" (
    "id" TEXT NOT NULL,
    "credentialId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "status" "CredentialStatus" NOT NULL,
    "notes" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CredentialVerification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WorkExperience" (
    "id" TEXT NOT NULL,
    "hairdresserProfileId" TEXT NOT NULL,
    "employerName" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "WorkExperience_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PortfolioItem" (
    "id" TEXT NOT NULL,
    "hairdresserProfileId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PortfolioItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "employerProfileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "employmentType" "EmploymentType" NOT NULL,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "salaryDisplay" TEXT,
    "requiredExperienceYears" INTEGER,
    "requiredQualificationId" TEXT,
    "status" "JobStatus" NOT NULL DEFAULT 'DRAFT',
    "postedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JobSkill" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    CONSTRAINT "JobSkill_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "hairdresserProfileId" TEXT NOT NULL,
    "coverNote" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'INTERESTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "participantAId" TEXT NOT NULL,
    "participantBId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "linkUrl" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reportedUserId" TEXT,
    "targetType" "ReportTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_role_status_idx" ON "User"("role", "status");
CREATE UNIQUE INDEX "HairdresserProfile_userId_key" ON "HairdresserProfile"("userId");
CREATE INDEX "HairdresserProfile_state_suburb_idx" ON "HairdresserProfile"("state", "suburb");
CREATE INDEX "HairdresserProfile_yearsOfExperience_idx" ON "HairdresserProfile"("yearsOfExperience");
CREATE INDEX "HairdresserProfile_availability_idx" ON "HairdresserProfile"("availability");
CREATE UNIQUE INDEX "EmployerProfile_userId_key" ON "EmployerProfile"("userId");
CREATE UNIQUE INDEX "Skill_name_key" ON "Skill"("name");
CREATE UNIQUE INDEX "Skill_slug_key" ON "Skill"("slug");
CREATE UNIQUE INDEX "HairdresserSkill_hairdresserProfileId_skillId_key" ON "HairdresserSkill"("hairdresserProfileId", "skillId");
CREATE UNIQUE INDEX "Qualification_name_key" ON "Qualification"("name");
CREATE INDEX "Credential_status_idx" ON "Credential"("status");
CREATE INDEX "Credential_hairdresserProfileId_status_idx" ON "Credential"("hairdresserProfileId", "status");
CREATE INDEX "CredentialVerification_credentialId_createdAt_idx" ON "CredentialVerification"("credentialId", "createdAt");
CREATE INDEX "Job_status_postedAt_idx" ON "Job"("status", "postedAt");
CREATE INDEX "Job_employerProfileId_status_idx" ON "Job"("employerProfileId", "status");
CREATE UNIQUE INDEX "JobSkill_jobId_skillId_key" ON "JobSkill"("jobId", "skillId");
CREATE UNIQUE INDEX "Application_jobId_hairdresserProfileId_key" ON "Application"("jobId", "hairdresserProfileId");
CREATE INDEX "Application_hairdresserProfileId_idx" ON "Application"("hairdresserProfileId");
CREATE UNIQUE INDEX "Conversation_participantAId_participantBId_key" ON "Conversation"("participantAId", "participantBId");
CREATE INDEX "Conversation_participantAId_updatedAt_idx" ON "Conversation"("participantAId", "updatedAt");
CREATE INDEX "Conversation_participantBId_updatedAt_idx" ON "Conversation"("participantBId", "updatedAt");
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");
CREATE INDEX "Report_status_createdAt_idx" ON "Report"("status", "createdAt");
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");
CREATE INDEX "PasswordResetToken_userId_expiresAt_idx" ON "PasswordResetToken"("userId", "expiresAt");

ALTER TABLE "HairdresserProfile" ADD CONSTRAINT "HairdresserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmployerProfile" ADD CONSTRAINT "EmployerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HairdresserSkill" ADD CONSTRAINT "HairdresserSkill_hairdresserProfileId_fkey" FOREIGN KEY ("hairdresserProfileId") REFERENCES "HairdresserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HairdresserSkill" ADD CONSTRAINT "HairdresserSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_hairdresserProfileId_fkey" FOREIGN KEY ("hairdresserProfileId") REFERENCES "HairdresserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_qualificationId_fkey" FOREIGN KEY ("qualificationId") REFERENCES "Qualification"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CredentialVerification" ADD CONSTRAINT "CredentialVerification_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "Credential"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CredentialVerification" ADD CONSTRAINT "CredentialVerification_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WorkExperience" ADD CONSTRAINT "WorkExperience_hairdresserProfileId_fkey" FOREIGN KEY ("hairdresserProfileId") REFERENCES "HairdresserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PortfolioItem" ADD CONSTRAINT "PortfolioItem_hairdresserProfileId_fkey" FOREIGN KEY ("hairdresserProfileId") REFERENCES "HairdresserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Job" ADD CONSTRAINT "Job_employerProfileId_fkey" FOREIGN KEY ("employerProfileId") REFERENCES "EmployerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Job" ADD CONSTRAINT "Job_requiredQualificationId_fkey" FOREIGN KEY ("requiredQualificationId") REFERENCES "Qualification"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "JobSkill" ADD CONSTRAINT "JobSkill_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobSkill" ADD CONSTRAINT "JobSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Application" ADD CONSTRAINT "Application_hairdresserProfileId_fkey" FOREIGN KEY ("hairdresserProfileId") REFERENCES "HairdresserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_participantAId_fkey" FOREIGN KEY ("participantAId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_participantBId_fkey" FOREIGN KEY ("participantBId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
