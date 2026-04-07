// backend/src/types/prisma.types.ts
// Re-exports commonly used Prisma input/where/select types for convenience.

import type { Prisma } from '../generated/prisma/client.js'

export type UserSelect = Prisma.UserSelect
export type UserWhereInput = Prisma.UserWhereInput
export type UserCreateInput = Prisma.UserUncheckedCreateInput
export type UserUpdateInput = Prisma.UserUncheckedUpdateInput

export type CompanySelect = Prisma.CompanySelect
export type CompanyWhereInput = Prisma.CompanyWhereInput
export type CompanyCreateInput = Prisma.CompanyUncheckedCreateInput
export type CompanyUpdateInput = Prisma.CompanyUncheckedUpdateInput

export type MembershipSelect = Prisma.MembershipSelect
export type MembershipWhereInput = Prisma.MembershipWhereInput
export type MembershipCreateInput = Prisma.MembershipUncheckedCreateInput

export type CompanyRoleSelect = Prisma.CompanyRoleSelect
export type CompanyRoleCreateInput = Prisma.CompanyRoleUncheckedCreateInput

export type AuditLogCreateInput = Prisma.AuditLogUncheckedCreateInput
export type AuditLogWhereInput = Prisma.AuditLogWhereInput
