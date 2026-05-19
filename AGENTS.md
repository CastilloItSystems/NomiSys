# NomiSys Agent Notes

## Repo Shape
- Monorepo-style layout with two independent Node projects: `backend/` (Express + Prisma) and `frontend/` (Next.js 13 app router).
- There is no root `package.json`; run npm commands inside `backend/` or `frontend/`.

## Reliable Commands
- Backend dev: `cd backend && npm run dev` (starts API on `PORT` or `4000`).
- Backend build/start: `cd backend && npm run build && npm start`.
- Backend tests: `cd backend && npm test` (Jest ESM via `NODE_OPTIONS=--experimental-vm-modules`).
- Frontend dev: `cd frontend && npm run dev` (configured for port `3000`, not `3001`).
- Frontend build/start: `cd frontend && npm run build && npm start`.
- Frontend tests are a stub: `npm run test` always exits 0 with "No tests configured".

## Prisma + DB Workflow (Backend)
- Prisma schema is composed from fragments: `prisma/base.prisma` + `prisma/models/**/*.prisma`.
- Use provided scripts, not raw Prisma commands:
  - `npm run prisma:merge`
  - `npm run prisma:generate` (merge + generate)
  - `npm run prisma:migrate` (merge + migrate)
- Backend Prisma client uses `DATABASE_URL` at runtime, while `prisma.config.ts` uses `DIRECT_URL` for Prisma CLI/migrations.

## Env and Runtime Gotchas
- Frontend middleware throws immediately if `AUTH_SECRET` is missing (`frontend/middleware.ts`).
- Frontend API client defaults to production API if `NEXT_PUBLIC_API_BASE_URL` is unset (`frontend/app/api/apiClient.ts`); set it explicitly for local work.
- Backend CORS allows localhost `3000/3001` plus `FRONTEND_URL` and `ADDITIONAL_CORS_ORIGINS`.
- Backend startup (`backend/src/index.ts`) auto-runs permission catalog sync and default role seeding for all active companies; startup is not read-only.

## Architecture Pointers
- Backend entrypoints: `backend/src/app.ts` (Express wiring) and `backend/src/index.ts` (server + socket + startup tasks).
- API routes are centralized in `backend/src/routes/api.routes.ts` and mount modules under `/api`.
- Main backend domains live in `backend/src/modules/{auth,users,companies,company-roles,memberships,nomina}`.
- Frontend app router uses route groups in `frontend/app/(main)` and `frontend/app/(landing)`; root layout is `frontend/app/layout.tsx`.

## Delivery/Deploy Reality
- CI (`.github/workflows/deploy.yml`) only builds and pushes Docker images on pushes to `main`; it does not run lint/typecheck/tests.
- `docker-compose.yml` uses prebuilt GHCR images by default (local `build:` lines are commented), so local code changes are ignored unless you switch compose to build locally.
