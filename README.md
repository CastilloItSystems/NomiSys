# NomiSys

NomiSys is a split Node monorepo with:
- `backend/`: Express + Prisma API
- `frontend/`: Next.js 13 (App Router) web app

## Project Structure

- `backend/` API server, Prisma schema/migrations, seeds
- `frontend/` Next.js app, auth middleware, UI modules
- `.github/workflows/deploy.yml` Docker image build/push pipeline
- `docker-compose.yml` production-style compose using GHCR images

## Prerequisites

- Node.js + npm
- PostgreSQL database for backend runtime/migrations

## Local Development

Important: there is no root `package.json`. Run commands inside each package.

### Backend

```bash
cd backend
npm install
npm run dev
```

API runs on `PORT` or `4000` by default.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

## Build and Start

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run build
npm start
```

## Tests

### Backend

```bash
cd backend
npm test
```

### Frontend

Frontend test script is currently a stub and exits successfully without running a suite.

## Prisma Workflow (Backend)

Prisma schema is composed from `prisma/base.prisma` + `prisma/models/**/*.prisma`.

Use these scripts instead of raw Prisma commands:

```bash
cd backend
npm run prisma:merge
npm run prisma:generate
npm run prisma:migrate
```

Notes:
- Runtime Prisma client reads `DATABASE_URL`.
- Prisma CLI config (`backend/prisma.config.ts`) reads `DIRECT_URL`.

## Environment Notes

- `frontend/middleware.ts` throws if `AUTH_SECRET` is missing.
- `frontend/app/api/apiClient.ts` falls back to production API when `NEXT_PUBLIC_API_BASE_URL` is unset.
- Backend startup (`backend/src/index.ts`) runs permission catalog sync and default role seeding for active companies.

## Deployment

- CI on `main` builds and pushes Docker images for backend/frontend to GHCR.
- `docker-compose.yml` uses prebuilt GHCR images by default; local source changes are ignored unless you switch compose services to local `build:`.
