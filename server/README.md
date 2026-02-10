Prisma & Database guide for the server
=====================================

Overview
--------
This guide explains how to use Prisma Migrate with the project, how to run the initial migration, and how to switch between the in-memory repositories and Postgres.

Quick setup
-----------
1. Install dependencies (run in the `server` folder):

```powershell
cd "server"
npm install
npm install -D prisma
npm install @prisma/client
```

2. Copy example env and edit credentials:

```powershell
# Windows PowerShell
copy .env.template .env.development

# macOS / Linux
cp .env.template .env.development

Then copy .env.development to .env for local dev, or create .env.test/.env.production as needed.
# then edit .env to set DATABASE_URL and USE_IN_MEMORY
```

3. Initialize Prisma (if you haven't already):

```powershell
npx prisma generate
```

Create and run initial migration
--------------------------------
With `DATABASE_URL` pointing at your Postgres instance, run:

```powershell
Server — Prisma & DB Guide
==========================

Purpose
-------
This document shows how to configure and run the server with either PostgreSQL (via Prisma) or the built-in in-memory repositories used for tests and quick local runs.

Prerequisites
-------------
- Node.js (16+)
- npm
- PostgreSQL (local, Docker, or remote instance) if you intend to use a real DB

Files added
-----------
- `prisma/schema.prisma` — Prisma schema for the `Board` model
- `src/repositories/boardsRepository.ts` — repo that toggles between in-memory and Prisma implementations
- `.env.template` — tracked env template (copy to `.env.*` for local use)

Quickstart (local dev)
----------------------
1. From the `server` folder install dependencies:

```powershell
cd server
npm install
npm install -D prisma
npm install @prisma/client
```

2. Create an environment file from the template and edit credentials:

```powershell
copy .env.template .env.development   # Windows
# or on macOS / Linux: cp .env.template .env.development
# then edit .env.development and set DATABASE_URL & USE_IN_MEMORY

# For a quick local run you can copy to .env that dotenv will load:
copy .env.development .env
```

3. Generate Prisma client:

```powershell
npx prisma generate
```

4. Create and apply the initial migration (applies SQL to `DATABASE_URL`):

```powershell
npx prisma migrate dev --name init
```

5. Start the server (will use Postgres if `USE_IN_MEMORY=false`):

```powershell
npm run dev
```

Switching between in-memory and Postgres
---------------------------------------
- To use Postgres, set in your `.env`:

```
USE_IN_MEMORY=false
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

- To use the in-memory implementation (recommended for unit tests and fast local experiments), set:

```
USE_IN_MEMORY=true
```

The repository selector (`src/repositories/boardsRepository.ts`) chooses the implementation automatically based on `USE_IN_MEMORY` or when `NODE_ENV === 'test'`.

Migrations & Prisma notes
-------------------------
- Development: `npx prisma migrate dev` creates migrations, applies them to the dev DB and updates the client.
- CI / Production: use `npx prisma migrate deploy` to apply pending migrations without prompts.
- Generated SQL migration files live under `server/prisma/migrations` — commit them to source control.

Running migrations manually
--------------------------
If you prefer running SQL directly, find the SQL file in the migration folder and apply with `psql`:

```powershell
psql "postgresql://user:pass@host:5432/dbname" -f server/prisma/migrations/<timestamp>_init/migration.sql
```

CI / Deployment
---------------
- In CI, set `DATABASE_URL` in environment variables (recommended) and run:

```bash
npm ci
npx prisma migrate deploy
npm start
```

Troubleshooting
---------------
- "Prisma client not found" — run `npx prisma generate` after installing `@prisma/client`.
- Connection errors — verify `DATABASE_URL` and that Postgres is reachable from the host/container.
- To quickly test without Postgres set `USE_IN_MEMORY=true`.

Security
--------
- Never commit real secrets. Use `.env.template` for the sample and add `.env*` to `.gitignore` (already done).
- For production, provide `DATABASE_URL` through your deployment platform's secret manager.

Next steps
----------
- Run the initial migration against your running Postgres instance.
- Confirm the server starts with `USE_IN_MEMORY=false` and the UI calls to `/api/boards` return real data.
