# MM Connect — Database

PostgreSQL 16 with Prisma ORM. Schema lives in `database/prisma/schema.prisma`. All IDs are UUIDs.

For a full column list, live row snapshot, and foreign-key map, see [database-map.md](database-map.md).

## 1. Entity relationship overview

```
User 1──1 HairdresserProfile
User 1──1 EmployerProfile

HairdresserProfile 1──* HairdresserSkill *──1 Skill
HairdresserProfile 1──* Credential *──1 Qualification (optional)
HairdresserProfile 1──* WorkExperience
HairdresserProfile 1──* PortfolioItem
HairdresserProfile 1──* Application

EmployerProfile 1──* Job
Job 1──* JobSkill *──1 Skill
Job *──1 Qualification (optional required qualification)
Job 1──* Application

Credential 1──* CredentialVerification
User (admin) 1──* CredentialVerification

User 1──* Conversation (as participant A or B)
Conversation 1──* Message
User 1──* Message (sender)

User 1──* Notification
User 1──* Report (reporter / reported)
User 1──* AuditLog
User 1──* PasswordResetToken
```

## 2. Models

### User

Authentication identity. One role per user.

| Field | Notes |
| --- | --- |
| `email` | Unique, lowercase |
| `passwordHash` | bcrypt; never returned by API |
| `role` | `HAIRDRESSER` \| `EMPLOYER` \| `ADMIN` |
| `status` | `ACTIVE` \| `SUSPENDED` |

### HairdresserProfile / EmployerProfile

1:1 with `User`. Public directory fields live here. Email stays on `User` and is not shown on public profiles.

### Skill / HairdresserSkill / JobSkill

Skills are a catalogue. Join tables enforce uniqueness per profile or job.

### Qualification / Credential / CredentialVerification

- `Qualification` — catalogue (Certificate III in Hairdressing, etc.)
- `Credential` — uploaded instance; `status` is the **current** verification state
- `CredentialVerification` — immutable-ish review history (who, when, notes, decision)

Only an admin service path may set `Credential.status` to `VERIFIED`.

Statuses: `PENDING`, `VERIFIED`, `REJECTED`, `EXPIRED`.

Expiry can be applied by comparing `expiryDate` to now when reading; seed/admin may also set `EXPIRED`.

### WorkExperience / PortfolioItem

Owned by a hairdresser profile. Portfolio images are public; credential documents are not.

### Job / Application

Jobs belong to an employer. Applications uniquely pair a hairdresser with a job.

Job statuses: `DRAFT`, `ACTIVE`, `CLOSED`.

### Conversation / Message

Exactly two participants. Unique pair `(participantAId, participantBId)` with A/B ordered by UUID so the same pair cannot create two threads.

`Message.readAt` is null until the recipient marks the thread read.

### Notification / Report / AuditLog / PasswordResetToken

Supporting tables for in-app alerts, moderation, admin accountability, and placeholder password reset.

## 3. Indexes

Notable indexes (see schema):

- `User.email` unique
- `HairdresserProfile` location + years of experience (search)
- `Credential.status` (admin queue)
- `Job.status` + `postedAt`
- `Message(conversationId, createdAt)`
- Full-text-friendly `contains` filters on location and names (Prisma `contains` / `mode: insensitive`)

## 4. Migrations and seed

```bash
npm run db:migrate    # prisma migrate deploy / dev
npm run db:seed       # realistic fictional data
npm run db:studio     # optional Prisma Studio
```

Seed creates:

- 1 admin
- 10 hairdressers
- 3 employers
- 10+ skills
- catalogue qualifications
- credentials in mixed verification states
- work experience and portfolio items
- 5+ jobs, applications, conversations, messages, reports, notifications

Demo passwords are documented in the root README. They are **not** hardcoded in application source — only in the seed script and README for local development.
