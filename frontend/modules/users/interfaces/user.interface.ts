export type UserStatus = "pending" | "active" | "suspended";
export type AccessType = "limited" | "full" | "none";
export type MembershipStatus = "invited" | "active" | "suspended";
export type PermissionAction = "GRANT" | "REVOKE";

export interface MembershipRole {
  id: string;
  name: string;
  description?: string | null;
}

export interface MembershipEmpresa {
  id: string;
  name: string;
}

export interface Membership {
  id: string;
  userId: string;
  companyId: string;
  roleId: string;
  status: MembershipStatus;
  assignedBy?: string | null;
  assignedAt: string;
  updatedAt: string;
  company?: MembershipEmpresa;
  role?: MembershipRole;
}

export interface User {
  id: string;
  img?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  departments: string[];
  access: AccessType;
  status: UserStatus;
  deleted: boolean;
  online: boolean;
  fcmTokens: string[];
  google: boolean;
  isTechnician: boolean;
  createdAt: string;
  updatedAt: string;
  memberships?: Membership[];
}

export interface AuditUser {
  id: string;
  name: string;
  email: string;
}

export interface AuditLog {
  id: string;
  entity: string;
  entityId: string;
  action: string;
  userId?: string | null;
  user?: AuditUser | null;
  changes: unknown;
  metadata?: unknown;
  createdAt: string;
}

export interface UsersResponse {
  total: number;
  users: User[];
}

export interface UserResponse {
  data?: User;
  user?: User;
}

export interface AuditLogsResponse {
  total: number;
  auditLogs: AuditLog[];
}

export interface MembershipsResponse {
  total: number;
  memberships: Membership[];
}

export interface MembershipResponse {
  data?: Membership;
  membership?: Membership;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  departments: string[];
  access?: AccessType;
  status?: UserStatus;
  img?: string | null;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  phone?: string | null;
  departments?: string[];
  access?: AccessType;
  status?: UserStatus;
  img?: string | null;
  online?: boolean;
  isTechnician?: boolean;
}

export interface CreateMembershipRequest {
  userId: string;
  empresaId: string;
  roleId: string;
  status?: MembershipStatus;
}

export interface UpdateMembershipRequest {
  roleId?: string;
  status?: MembershipStatus;
}

export interface MembershipPermissionOverride {
  permissionCode: string;
  action: PermissionAction;
  reason?: string | null;
}

export interface MembershipPermissionsResponse {
  membershipId: string;
  user: { id: string; nombre: string; correo: string };
  empresa: { id_empresa: string; nombre: string };
  roleName: string;
  rolePermissions: string[];
  overrides: MembershipPermissionOverride[];
  effectivePermissions: string[];
}
