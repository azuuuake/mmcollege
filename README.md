# MM Connect

Professional Registration and Digital Credential Platform for **MMCollege (Marjorie Milner College)**.

**Connect. Showcase. Grow.**

MM Connect helps qualified hairdressers showcase verified credentials and helps salons find the right people. It is not a social network, booking system, or RTO student management system.

Verification is performed only by MMCollege administrators. Matching scores never change credential status.

## Features

- Role-based access: hairdresser, employer, admin
- JWT authentication and bcrypt password hashing
- Hairdresser profiles, skills, qualifications, experience, portfolio
- Employer business profiles and job posts
- Database-backed professional search and pagination
- Express interest / apply for jobs
- REST messaging
- Admin credential verification workflow and user moderation
- Deterministic candidate matching (no external AI)
- Local file uploads with a replaceable storage interface

## Technology stack

| Layer | Stack |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS, React Router, Axios, React Hook Form |
| Backend | Node.js, Express, TypeScript, Zod, JWT, bcrypt |
| Database | PostgreSQL, Prisma |

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 16 (or Docker)

## Installation

```bash
git clone <repository-url>
cd mmcollege
cp .env.example .env
npm install
```

## Environment variables

See `.env.example`. Required values:

- `DATABASE_URL`
- `JWT_SECRET`
- `CLIENT_ORIGIN`
- `UPLOAD_DIR`

Never commit a real `.env` file.

## Database setup

Start PostgreSQL (Docker example):

```bash
docker compose up -d db
```

Generate the Prisma client, run migrations, and seed demo data:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

Useful commands:

```bash
npm run db:migrate:deploy   # apply existing migrations
npm run db:reset            # drop, migrate, seed
npm run db:studio           # Prisma Studio
```

## Run the app

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:4000
- Health check: http://localhost:4000/health

Or run them separately:

```bash
npm run dev:backend
npm run dev:frontend
```

## Demo credentials

All seeded accounts use password `DemoPass123!`.

| Role | Email |
| --- | --- |
| Admin | `admin@mmcollege.example` |
| Hairdresser | `sarah.nguyen@example.com` |
| Employer | `hello@novasalon.example` |

Admin accounts cannot be created through public registration.

## Tests

```bash
npm test
```

Tests expect a migrated and seeded database.

## API overview

Base path: `/api`

- `POST /auth/register` `POST /auth/login` `GET /auth/me`
- `GET /hairdressers` `GET /hairdressers/:id` hairdresser profile and credential routes
- `GET|PUT /employers/profile` `GET /employers/:id`
- `GET|POST /jobs` applications via `POST /jobs/:id/apply`
- `GET|POST /conversations` and messages
- `GET /admin/users` `PUT /admin/credentials/:id/verify`

Full reference: [docs/api.md](docs/api.md)

## Documentation

- [Requirements and MVP assumptions](docs/requirements.md)
- [Architecture](docs/architecture.md)
- [Database](docs/database.md)
- [Database map (columns, rows, connections)](docs/database-map.md)
- [API](docs/api.md)
- [Implementation plan](docs/implementation-plan.md)

## Project structure

```
frontend/   React SPA
backend/    Express API
database/   Prisma schema, migrations, seed
docs/       Project documentation
```
