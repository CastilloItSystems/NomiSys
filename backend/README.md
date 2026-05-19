# NomiSys Backend

Express + Prisma API for NomiSys.

## Scripts

```bash
npm run dev              # tsx watch src/index.ts
npm run build            # tsc -> dist/
npm start                # node dist/index.js
npm test                 # jest (ESM)
npm run prisma:merge
npm run prisma:generate  # merge + generate
npm run prisma:migrate   # merge + migrate dev
npm run seed
```

## Local Setup

```bash
npm install
npm run prisma:generate
npm run dev
```

API runs on `PORT` or `4000`.

## Required Environment

Minimum:

- `DATABASE_URL`
- `JWT_SECRET`

Commonly used:

- `PORT`
- `FRONTEND_URL`
- `ADDITIONAL_CORS_ORIGINS`
- `DIRECT_URL` (Prisma CLI/migrations via `prisma.config.ts`)

Cloudflare R2 (if using uploads/storage):

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_URL`

## Prisma Notes

- Schema is assembled from `prisma/base.prisma` + `prisma/models/**/*.prisma` into `prisma/schema.prisma`.
- Use repo scripts (`prisma:merge`, `prisma:generate`, `prisma:migrate`) instead of raw Prisma commands.
- Runtime Prisma client reads `DATABASE_URL`; Prisma CLI reads `DIRECT_URL`.

## Runtime Gotchas

- Server startup (`src/index.ts`) is not read-only: it syncs permission catalog and seeds default roles for all active companies.
- CORS allows localhost `3000/3001`, plus `FRONTEND_URL` and `ADDITIONAL_CORS_ORIGINS`.

## Main Entrypoints

- App wiring: `src/app.ts`
- Server bootstrap: `src/index.ts`
- API root routes: `src/routes/api.routes.ts`
- Domain modules: `src/modules/{auth,users,companies,company-roles,memberships,nomina}`
