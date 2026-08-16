# Implementation plan and risks

## Phased delivery

| Stage | Scope | Exit check |
| --- | --- | --- |
| 1 | Monorepo, toolchains, env templates, docs | `npm install` succeeds; folders exist |
| 2 | Prisma schema, initial migration, seed | `prisma validate`; migrate + seed against Postgres |
| 3 | Auth, JWT, RBAC, password-reset placeholder | Auth tests pass; admin cannot self-register |
| 4 | Hairdresser profiles, skills, credentials, experience, portfolio, uploads | Profile CRUD + completion % |
| 5 | Employer profiles | Employer CRUD |
| 6 | Database-backed search + pagination + matching | Search tests; no frontend-only filters |
| 7 | Jobs + applications | Job/apply tests |
| 8 | Conversations + messages + notifications | REST inbox works |
| 9 | Admin-only credential verify/reject + audit log | Non-admin cannot verify |
| 10 | Admin users, reports, stats | Admin dashboard wired |
| 11 | Landing, dashboards, public profile, responsive polish | UI compiles; empty/loading/error states |
| 12 | Automated tests + bug fixes | Backend test suite + `tsc` clean |

## Risks

| Risk | Mitigation |
| --- | --- |
| Credential documents leak via static `/uploads` | Public static serving is limited to image types; credential files only via authorised route |
| Students accidentally treat matching as verification | Matching service is read-only; verify endpoints are admin-only and audited |
| JWT stolen from localStorage | Acceptable for university MVP; documented. HttpOnly cookies can replace later |
| Large upload DoS | MIME allowlist, size caps, auth required |
| Location/distance ambiguity | Text location only; documented in requirements |
| Email-less password reset | Token model exists; no production email until a provider is chosen |
| Empty cloud environment (no Postgres) | `docker-compose.yml` + README; CI/local install documented |

## Ambiguities resolved for MVP

See `docs/requirements.md` §5. Summary:

- Distance search deferred
- Phone hidden on public profiles
- Contact = conversation
- Qualification catalogue vs uploaded credential
- Skills from catalogue only
- Profile views are a simple counter
- Password reset is a logged token in development
