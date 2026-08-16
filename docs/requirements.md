# MM Connect — Requirements

**Product:** Professional Registration and Digital Credential Platform  
**Client:** MMCollege (Marjorie Milner College), a Victorian Registered Training Organisation  
**Working name:** MM Connect  
**Tagline:** Connect. Showcase. Grow.

## 1. Purpose

MM Connect is a professional networking and recruitment platform for **qualified hairdressers** and **employers/salons**.

Trusted qualification verification is performed only by MMCollege administrators.

This is **not**:

- a general social media platform
- an appointment booking system
- an RTO student management system

Core relationship:

```
HAIRDRESSER  <-->  EMPLOYER
        \            /
         \          /
        MMCollege Admin
     (credential verification)
```

## 2. User roles

| Role | Public registration | Purpose |
| --- | --- | --- |
| `HAIRDRESSER` | Yes | Create a professional profile, showcase credentials, apply for jobs, receive employer contact |
| `EMPLOYER` | Yes | Create a business profile, search candidates, contact hairdressers, post jobs |
| `ADMIN` | No — seed only | Manage users, verify credentials, review reports, view platform statistics |

Role-based access control is enforced on both API and frontend routes.

## 3. Functional requirements

### 3.1 Authentication

- Register as hairdresser or employer
- Login / logout
- JWT access token
- Get current user (`GET /api/auth/me`)
- Passwords hashed with bcrypt
- Admin accounts cannot be created via public registration
- Password reset is a **placeholder**: a reset token is created and returned in development logs only (no email provider in MVP)

### 3.2 Hairdresser

- Onboard and maintain a professional profile
- Manage skills, qualifications/credentials, work experience, and portfolio
- View dashboard (completion %, verification, views, contacts, recommended jobs)
- View public profile
- Browse jobs and express interest / apply
- Receive and reply to employer messages

### 3.3 Employer

- Create and edit a business profile
- Search and filter hairdressers (database-backed, paginated)
- View public hairdresser profiles
- Contact candidates (conversation)
- Create, edit, close, and delete job opportunities
- View dashboard (jobs, matches, contacts, recommended professionals)

### 3.4 Admin

- Search and filter users
- Suspend / unsuspend users
- Review pending credentials
- Verify or reject credentials (only admin can set `VERIFIED`)
- View reported content
- View platform statistics

### 3.5 Credential verification

```
Hairdresser uploads credential
        ↓
Status = PENDING
        ↓
Admin reviews document
        ↓
VERIFIED or REJECTED
        ↓
Hairdresser profile / public badge updates
```

A qualification is displayed as “MMCollege Verified” **only** when `Credential.status = VERIFIED` in the database.

### 3.6 Search

Employer (and public) search queries PostgreSQL. Filters:

- location (suburb / state / free-text)
- skills
- qualification
- years of experience
- availability
- employment preference
- verification status

Distance-radius search is **not** in MVP (see assumptions).

### 3.7 Jobs and applications

Employers create jobs (`DRAFT`, `ACTIVE`, `CLOSED`).  
Hairdressers can apply / express interest. One application per hairdresser per job.

### 3.8 Messaging

REST-based conversations and messages. No WebSockets in MVP.  
Read/unread is tracked via `readAt`.

## 4. Non-functional requirements

- Responsive UI: desktop, tablet, mobile
- PostgreSQL is the source of truth
- Secrets only in environment variables
- File uploads validated (type + size) and stored locally in development
- Credential documents are **not** publicly accessible
- Audit logs for admin verification, rejection, and user suspension
- Basic rate limiting on authentication endpoints

## 5. MVP assumptions

These decisions unblock development where the brief is open-ended:

1. **Distance search** — deferred. Profiles store suburb, state, and postcode. Search matches location text. Adding radius search later requires geocoding and coordinates.
2. **Password reset** — token + expiry model exists. In development the reset URL is logged. Production email is out of scope.
3. **Profile views** — increment a counter on authorised public-profile views. Unique-visitor analytics are out of scope.
4. **Employer “interest”** — counted from conversations started by employers plus job applications received.
5. **Contact** — opens or reuses a 1:1 conversation between employer and hairdresser.
6. **Qualification vs credential** — `Qualification` is a catalogue (e.g. Certificate III in Hairdressing). `Credential` is a hairdresser’s uploaded instance, optionally linked to a catalogue row.
7. **Skills** — seeded catalogue. Hairdressers select from the catalogue. “Other” is a catalogue skill, not free-text explosion.
8. **Suspended users** — cannot log in. Existing JWT is rejected on subsequent requests.
9. **Reports** — any authenticated user can report a profile, job, portfolio item, or message. Admin reviews status.
10. **Salary** — optional integer min/max in AUD plus optional display string.
11. **Matching** — deterministic weighted score only. No external AI. AI must never set verification status.
12. **File storage** — local disk behind a `StorageService` interface so S3/Azure/Supabase can replace it later.
13. **Public professional directory** — `Find Professionals` is publicly browsable with public fields only. Credential documents remain private.
14. **Notifications** — created on message, application, and verification decision. In-app list only (no push/email).
15. **Soft delete** — not implemented. Jobs are closed; users are suspended.

## 6. Out of scope (MVP)

- Real-time chat
- Payment / subscriptions
- Email/SMS delivery
- Geolocation radius
- Calendar / booking
- Social feed, likes, comments, followers
- Student enrolment or RTO compliance systems
- External AI verification or LLM matching
