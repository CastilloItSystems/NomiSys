import {
  PrismaClient,
  Membership,
  CompanyRole,
} from '@/generated/prisma/client'

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string
        email?: string
        access?: string
      }
      companyId?: string
      prisma?: PrismaClient
      membership?: Membership & {
        role?: CompanyRole
      }
      authz?: {
        permissions: Set<string>
        isSuperAdmin?: boolean
      }
      validatedBody?: unknown
      validatedQuery?: unknown
      validatedParams?: unknown
    }
  }
}

export {}
