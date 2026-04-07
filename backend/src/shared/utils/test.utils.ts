// backend/src/shared/utils/test.utils.ts

import { generateToken, JWTPayload } from '../../services/jwt.service.js'
import prisma from '../../services/prisma.service.js'

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

/**
 * Returns an auth token for tests.
 * Creates or reuses a test user (admin@test.com).
 */
export async function getTestAuthToken(): Promise<string> {
  let user = await prisma.user.findUnique({
    where: { email: 'admin@test.com' },
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: 'Test Admin User',
        email: 'admin@test.com',
        password: 'test-hashed-password',
        status: 'active',
        access: 'full',
        deleted: false,
      },
    })
  }

  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
  }

  return generateToken(payload)
}

// ---------------------------------------------------------------------------
// Empresa
// ---------------------------------------------------------------------------

/**
 * Returns the test company ID.
 * Creates or reuses a company named 'Test Company'.
 * The company is associated with admin@test.com.
 */
export async function getTestCompanyId(): Promise<string> {
  // Find existing test company
  let company = await prisma.company.findFirst({
    where: { name: 'Test Company', deleted: false },
  })

  if (!company) {
    company = await prisma.company.create({
      data: {
        name: 'Test Company',
        deleted: false,
      },
    })
  }

  return company.id
}

/**
 * Returns token + companyId in a single call.
 * Convenient for beforeAll when the test needs both.
 * Also creates the Membership required for the company middleware.
 */
export async function getTestCredentials(): Promise<{
  authToken: string
  companyId: string
}> {
  const [authToken, companyId] = await Promise.all([
    getTestAuthToken(),
    getTestCompanyId(),
  ])

  // Ensure the test user has a Membership for this empresa so the
  // empresa middleware (which validates membership) doesn't return 403.
  const user = await prisma.user.findUnique({
    where: { email: 'admin@test.com' },
  })
  if (user) {
    const existing = await prisma.membership.findUnique({
      where: { userId_companyId: { userId: user.id, companyId } },
    })
    if (!existing) {
      let role = await prisma.companyRole.findFirst({ where: { companyId } })
      if (!role) {
        role = await prisma.companyRole.create({
          data: { name: 'Admin', companyId, isSystem: true },
        })
      }
      await prisma.membership.create({
        data: { userId: user.id, companyId, roleId: role.id, status: 'active' },
      })
    }
  }

  return { authToken, companyId }
}

// ---------------------------------------------------------------------------
// Cleanup
// ---------------------------------------------------------------------------

/**
 * Cleans up the test user from the database.
 */
export async function cleanupTestData(): Promise<void> {
  await prisma.user
    .deleteMany({
      where: { email: 'admin@test.com' },
    })
    .catch(() => {})
}

/**
 * Cleans up the test company and all its associated data.
 * Use with care — deletes warehouses, items, etc. in cascade.
 */
export async function cleanupTestCompany(companyId: string): Promise<void> {
  await prisma.company
    .deleteMany({
      where: { id: companyId },
    })
    .catch(() => {})
}
