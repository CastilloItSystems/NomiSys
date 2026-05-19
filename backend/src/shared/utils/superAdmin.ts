import { Request } from 'express'
import { logger } from './logger.js'

const SUPER_ADMIN_EMAILS_ENV = 'SUPER_ADMIN_EMAILS'

function normalizeEmail(value: string | undefined | null): string {
  return String(value || '')
    .trim()
    .toLowerCase()
}

function getSuperAdminEmails(): Set<string> {
  const raw = process.env[SUPER_ADMIN_EMAILS_ENV] || ''

  return new Set(
    raw
      .split(',')
      .map((email) => normalizeEmail(email))
      .filter(Boolean)
  )
}

export function isSuperAdminEmail(email: string | undefined | null): boolean {
  const normalized = normalizeEmail(email)

  if (!normalized) {
    return false
  }

  return getSuperAdminEmails().has(normalized)
}

export function isSuperAdminRequest(req: Request): boolean {
  return isSuperAdminEmail(req.user?.email)
}

export function logSuperAdminBypass(
  req: Request,
  gate: string,
  metadata: Record<string, unknown> = {}
): void {
  logger.warn('[SUPER_ADMIN_BYPASS]', {
    gate,
    method: req.method,
    path: req.originalUrl || req.url,
    companyId: req.companyId || null,
    actorUserId: req.user?.userId || null,
    actorEmail: req.user?.email || null,
    ip: req.ip,
    ...metadata,
  })
}
