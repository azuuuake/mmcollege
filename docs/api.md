# MM Connect — REST API

Base URL: `http://localhost:4000/api`

All JSON. Authenticated routes require:

```
Authorization: Bearer <jwt>
```

Error shape:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "…", "details": [] } }
```

## Status codes

| Code | Meaning |
| --- | --- |
| 200 / 201 | Success |
| 400 | Validation / bad request |
| 401 | Missing or invalid token |
| 403 | Authenticated but not allowed (role, ownership, suspended) |
| 404 | Not found |
| 409 | Conflict (duplicate email, duplicate application) |
| 413 / 415 | Upload too large / unsupported type |
| 429 | Auth rate limit |
| 500 | Unexpected server error (no internals leaked) |

## Authentication

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | Register hairdresser or employer |
| POST | `/auth/login` | Public | Issue JWT |
| POST | `/auth/logout` | Auth | Client discard; server acknowledges |
| GET | `/auth/me` | Auth | Current user + role profile summary |
| POST | `/auth/forgot-password` | Public | Create reset token (dev placeholder) |
| POST | `/auth/reset-password` | Public | Consume reset token |

`POST /auth/register` body:

```json
{
  "email": "alex@example.com",
  "password": "AtLeast8chars!",
  "role": "HAIRDRESSER"
}
```

`role` must be `HAIRDRESSER` or `EMPLOYER`. `ADMIN` is rejected.

## Hairdressers

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/hairdressers` | Public | Paginated search (public fields only) |
| GET | `/hairdressers/:id` | Public | Public profile (no private docs/email) |
| GET | `/hairdressers/me/dashboard` | Hairdresser | Dashboard aggregates |
| POST | `/hairdressers/profile` | Hairdresser | Create own profile |
| PUT | `/hairdressers/profile` | Hairdresser | Update own profile |
| POST | `/hairdressers/skills` | Hairdresser | Replace/add skills (`skillIds`) |
| DELETE | `/hairdressers/skills/:skillId` | Hairdresser | Remove a skill |
| POST | `/hairdressers/qualifications` | Hairdresser | Create credential (`PENDING`) |
| PUT | `/hairdressers/qualifications/:id` | Hairdresser | Update own non-verified fields |
| DELETE | `/hairdressers/qualifications/:id` | Hairdresser | Delete own credential |
| POST | `/hairdressers/experience` | Hairdresser | Add experience |
| PUT | `/hairdressers/experience/:id` | Hairdresser | Update experience |
| DELETE | `/hairdressers/experience/:id` | Hairdresser | Delete experience |
| POST | `/hairdressers/portfolio` | Hairdresser | Add portfolio item |
| DELETE | `/hairdressers/portfolio/:id` | Hairdresser | Delete portfolio item |

### Search query parameters

`q`, `location`, `skillIds` (comma-separated), `qualificationId`, `minExperience`, `availability`, `employmentType`, `verified` (`true` = at least one verified credential), `page`, `pageSize`.

## Employers

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/employers/:id` | Public | Public business profile |
| GET | `/employers/me/dashboard` | Employer | Dashboard aggregates |
| POST | `/employers/profile` | Employer | Create own profile |
| PUT | `/employers/profile` | Employer | Update own profile |

## Catalogue

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/skills` | Public | Active skills |
| GET | `/qualifications` | Public | Active qualification catalogue |

## Jobs

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/jobs` | Public | Active jobs (employers see own drafts too via `mine=true`) |
| GET | `/jobs/:id` | Public | Job detail (drafts only for owner) |
| POST | `/jobs` | Employer | Create job |
| PUT | `/jobs/:id` | Employer | Update own job |
| DELETE | `/jobs/:id` | Employer | Delete own job |
| POST | `/jobs/:id/apply` | Hairdresser | Express interest |
| GET | `/jobs/:id/matches` | Employer | Deterministic candidate matches |

## Applications

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/applications` | Auth | Hairdresser: own applications. Employer: applications to own jobs |

## Messages

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/conversations` | Auth | Inbox |
| POST | `/conversations` | Employer | Start or reuse thread with a hairdresser |
| GET | `/conversations/:id/messages` | Participant | List messages (marks inbound as read) |
| POST | `/conversations/:id/messages` | Participant | Send message |

## Notifications

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/notifications` | Auth | Recent notifications |
| POST | `/notifications/:id/read` | Auth | Mark one read |
| POST | `/notifications/read-all` | Auth | Mark all read |

## Reports

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/reports` | Auth | Report content |
| GET | `/admin/reports` | Admin | Moderation queue |

## Files

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/uploads` | Auth | Upload image or document (`type=profile\|logo\|portfolio\|credential`) |
| GET | `/files/credentials/:credentialId` | Owner or admin | Download credential document |

Public images are served from `/uploads/...` only when the stored key is a public type.

## Admin

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/admin/stats` | Admin | Platform counters |
| GET | `/admin/users` | Admin | Search/filter users |
| GET | `/admin/users/:id` | Admin | User + profile detail |
| PUT | `/admin/users/:id/suspend` | Admin | Suspend or restore (`{ "status": "SUSPENDED" \| "ACTIVE" }`) |
| GET | `/admin/credentials` | Admin | Verification queue (`status` filter) |
| PUT | `/admin/credentials/:id/verify` | Admin | Set VERIFIED + verification record |
| PUT | `/admin/credentials/:id/reject` | Admin | Set REJECTED + verification record |
| GET | `/admin/reports` | Admin | Reports |
| PUT | `/admin/reports/:id` | Admin | Update report status |

## Privacy

Public hairdresser payloads **exclude**:

- email, password hash
- phone (optional: shown only after contact / to admin — MVP hides phone on public profile)
- credential `documentUrl` / file keys
- verification notes

Employers see the same public profile as anyone else, plus the ability to start a conversation.
