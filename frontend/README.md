# NomiSys Frontend

Next.js 13 App Router frontend for NomiSys.

## Scripts

```bash
npm run dev    # starts on port 3000
npm run build
npm run start
npm run lint
npm run test   # stub: prints "No tests configured"
```

## Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Required Environment

At minimum for local auth flow:

- `AUTH_SECRET`

Recommended for local API integration:

- `NEXT_PUBLIC_API_BASE_URL` (for example `http://localhost:4000/api`)

Optional for Google sign-in:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_URL`

## Important Runtime Notes

- `middleware.ts` throws immediately if `AUTH_SECRET` is missing.
- `app/api/apiClient.ts` defaults to production API when `NEXT_PUBLIC_API_BASE_URL` is unset.
- `next.config.js` has `typescript.ignoreBuildErrors: true`, so builds can pass even with TypeScript errors.

## App Layout

- Root layout: `app/layout.tsx`
- Main app routes: `app/(main)`
- Landing routes: `app/(landing)`
- NextAuth route handler: `app/api/auth/[...nextauth]/route.ts`
