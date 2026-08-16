# MM Connect — Architecture

## 1. Overview

MM Connect is a monorepo with a React SPA and an Express REST API. PostgreSQL is the system of record. Prisma is the only database access layer.

```
┌─────────────┐     HTTPS/JSON      ┌──────────────────┐
│   React SPA │ ──────────────────► │  Express API     │
│   Vite + TS │ ◄────────────────── │  JWT + RBAC      │
└─────────────┘                     └────────┬─────────┘
                                             │ Prisma
                                             ▼
                                    ┌──────────────────┐
                                    │   PostgreSQL     │
                                    └──────────────────┘
                                             ▲
                                    ┌────────┴─────────┐
                                    │ Local file store │
                                    │ (uploads/)       │
                                    └──────────────────┘
```

## 2. Repository layout

```
/
├── README.md
├── package.json                 # npm workspaces
├── docker-compose.yml           # local PostgreSQL
├── .env.example
├── frontend/                    # React + Vite + Tailwind
├── backend/                     # Express + TypeScript
├── database/                    # Prisma schema, migrations, seed
└── docs/                        # requirements, architecture, API, DB
```

### Frontend (`/frontend/src`)

| Folder | Responsibility |
| --- | --- |
| `components/` | Reusable UI and domain widgets |
| `pages/` | Route-level screens |
| `layouts/` | Public, authenticated, and admin shells |
| `hooks/` | Auth, API, and form helpers |
| `services/` | Axios API clients |
| `types/` | Shared TypeScript types |
| `utils/` | Formatting, completion display, class names |
| `context/` | Auth session |

### Backend (`/backend/src`)

| Folder | Responsibility |
| --- | --- |
| `config/` | Environment and CORS |
| `controllers/` | HTTP request/response |
| `routes/` | Route tables |
| `middleware/` | Auth, RBAC, validation, uploads, errors |
| `services/` | Business logic (auth, profiles, matching, storage) |
| `validators/` | Zod schemas |
| `utils/` | Tokens, completion, sanitisation |
| `types/` | Express locals / JWT payload |

Controllers stay thin. Services own transactions and authorisation rules.

## 3. Authentication and authorisation

1. User registers (`HAIRDRESSER` or `EMPLOYER` only) or logs in.
2. API returns a signed JWT (role, user id, email).
3. Frontend stores the token in memory + `localStorage` for MVP session restore.
4. `Authorization: Bearer <token>` is required on protected routes.
5. `requireAuth` verifies the JWT and loads the user.
6. `requireRole(...)` restricts admin / employer / hairdresser endpoints.
7. Suspended users receive `403` even with a valid token.

Admin accounts are created only by the database seed.

Password reset (placeholder):

1. `POST /api/auth/forgot-password` creates a hashed token with expiry.
2. In development the reset path is logged; no email is sent.
3. `POST /api/auth/reset-password` consumes a valid unused token.

## 4. File storage

`StorageService` is an interface:

- `save({ buffer, mimeType, folder, userId, originalName })`
- `delete(key)`
- `resolveAbsolutePath(key)` for authorised downloads

`LocalStorageService` writes to `UPLOAD_DIR/{userId}/{type}/`.

A later `S3StorageService` can implement the same interface without changing controllers.

**Access rules**

| Asset | Public? |
| --- | --- |
| Profile photo | Yes (URL) |
| Employer logo | Yes (URL) |
| Portfolio image | Yes (URL) |
| Credential document | No — owner or admin only, via authorised download route |

Uploads are validated for MIME type and size before write.

## 5. Profile completion

Computed in `profileCompletionService` (never stored as source of truth):

| Section | Weight | Complete when |
| --- | --- | --- |
| Basic information | 20% | First name, last name, location, phone, photo, bio |
| Professional information | 20% | Title, years, employment status, availability, preferred type |
| Skills | 15% | At least one skill |
| Qualification | 20% | At least one credential |
| Experience | 15% | At least one work experience |
| Portfolio | 10% | At least one portfolio item |

Dashboard displays the live percentage.

## 6. Matching service

`matchingService` is deterministic and replaceable.

Default weights (job → candidate or search → candidate):

| Signal | Weight |
| --- | --- |
| Overlapping skills | 40% |
| Qualification match | 25% |
| Experience vs required years | 20% |
| Location token overlap | 10% |
| Availability / seeking status | 5% |

Returned payload:

```ts
{
  candidateId: string
  score: number
  matchingSkills: string[]
  qualificationMatch: boolean
  experienceMatch: boolean
  locationMatch: boolean
}
```

**Hard rule:** matching never writes `Credential.status`. Verification is admin-only.

## 7. Security

- bcrypt password hashing
- JWT with server-side secret
- Zod validation on write endpoints
- Prisma parameterised queries
- Helmet + CORS allowlist
- Auth endpoint rate limit
- Upload MIME/size checks
- Password hashes never returned
- Credential files not served on a public static path
- Audit log for verify / reject / suspend

## 8. Extensibility

| Future capability | Extension point |
| --- | --- |
| Cloud object storage | `StorageService` |
| Email password reset | `authService.requestPasswordReset` |
| LLM ranking | `matchingService` (read-only ranking) |
| WebSockets | new gateway; keep REST as source of truth |
| Geodistance | add `lat`/`lng` and a PostGIS or haversine query |

## 9. Runtime

| Process | Default |
| --- | --- |
| Frontend (Vite) | `http://localhost:5173` |
| Backend (Express) | `http://localhost:4000` |
| PostgreSQL | `localhost:5432` |

Frontend proxies `/api` and `/uploads` to the backend in development.
