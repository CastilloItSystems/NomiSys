// backend/src/config/env.config.ts
// Validates and exports typed environment variables. Called once at startup.

const required = (key: string): string => {
  const value = process.env[key]
  if (!value) throw new Error(`Missing required environment variable: ${key}`)
  return value
}

const optional = (key: string, fallback: string): string =>
  process.env[key] || fallback

export const env = {
  NODE_ENV: optional('NODE_ENV', 'development'),
  PORT: parseInt(optional('PORT', '3000'), 10),
  DATABASE_URL: required('DATABASE_URL'),
  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: optional('JWT_EXPIRES_IN', '7d'),
  R2_ACCOUNT_ID: optional('R2_ACCOUNT_ID', ''),
  R2_ACCESS_KEY_ID: optional('R2_ACCESS_KEY_ID', ''),
  R2_SECRET_ACCESS_KEY: optional('R2_SECRET_ACCESS_KEY', ''),
  R2_BUCKET_NAME: optional('R2_BUCKET_NAME', ''),
  R2_PUBLIC_URL: optional('R2_PUBLIC_URL', ''),
  SKIP_AUTHZ_IN_TESTS: optional('SKIP_AUTHZ_IN_TESTS', 'false') === 'true',
} as const

export type Env = typeof env
