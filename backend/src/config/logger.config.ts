// backend/src/config/logger.config.ts
// Logger configuration constants and re-export of the application logger.
// Transport setup and format is in src/shared/utils/logger.ts.

export { logger } from '../shared/utils/logger.js'

export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  HTTP: 'http',
  DEBUG: 'debug',
} as const

export type LogLevel = (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS]
