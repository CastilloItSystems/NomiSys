import apiClient from "@/app/api/apiClient";
import type {
  AuditLogsResponse,
  CreateMembershipRequest,
  CreateUserRequest,
  Membership,
  MembershipPermissionOverride,
  MembershipPermissionsResponse,
  MembershipsResponse,
  UpdateMembershipRequest,
  UpdateUserRequest,
  User,
  UsersResponse,
} from "@/modules/users/interfaces/user.interface";

export type {
  AccessType,
  AuditLog,
  AuditLogsResponse,
  AuditUser,
  CreateMembershipRequest,
  CreateUserRequest,
  Membership,
  MembershipEmpresa,
  MembershipPermissionOverride,
  MembershipPermissionsResponse,
  MembershipResponse,
  MembershipRole,
  MembershipsResponse,
  MembershipStatus,
  PermissionAction,
  UpdateMembershipRequest,
  UpdateUserRequest,
  User,
  UserResponse,
  UsersResponse,
  UserStatus,
} from "@/modules/users/interfaces/user.interface";

// ── Usuarios globales SaaS ──────────────────────────────────────────────────

export const getUsers = async (): Promise<UsersResponse> => {
  const response = await apiClient.get("/users");
  return response.data.data;
};

export const getUser = async (id: string): Promise<User> => {
  const response = await apiClient.get(`/users/${id}`);
  return response.data;
};

export const createUser = async (data: CreateUserRequest): Promise<User> => {
  const response = await apiClient.post("/users", data);
  return response.data;
};

export const updateUser = async (
  id: string,
  data: UpdateUserRequest,
): Promise<User> => {
  const response = await apiClient.put(`/users/${id}`, data);
  return response.data;
};

export const uploadUserProfilePicture = async (
  id: string,
  file: File,
): Promise<User> => {
  const formData = new FormData();
  formData.append("image", file);
  const response = await apiClient.post<User>(
    `/users/${id}/profile-picture`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await apiClient.delete(`/users/${id}`);
};

export const getAuditLogsForUser = async (
  id: string,
): Promise<AuditLogsResponse> => {
  const response = await apiClient.get(`/users/${id}/audit-logs`);
  return response.data.data;
};

// ── Memberships ─────────────────────────────────────────────────────────────

export const getMembershipsByEmpresa =
  async (): Promise<MembershipsResponse> => {
    const response = await apiClient.get("/memberships");
    return response.data.data;
  };

export const getMembershipsByUser = async (
  userId: string,
): Promise<MembershipsResponse> => {
  const response = await apiClient.get(`/memberships/user/${userId}`);
  return response.data.data;
};

export const createMembership = async (
  data: CreateMembershipRequest,
): Promise<Membership> => {
  const response = await apiClient.post("/memberships", data);
  return response.data;
};

export const updateMembership = async (
  id: string,
  data: UpdateMembershipRequest,
): Promise<Membership> => {
  const response = await apiClient.put(`/memberships/${id}`, data);
  return response.data;
};

export const deleteMembership = async (id: string): Promise<void> => {
  await apiClient.delete(`/memberships/${id}`);
};

export const getMembershipPermissions = async (
  membershipId: string,
): Promise<MembershipPermissionsResponse> => {
  const response = await apiClient.get(
    `/memberships/${membershipId}/permissions`,
  );
  return response.data;
};

export const setMembershipPermissions = async (
  membershipId: string,
  overrides: MembershipPermissionOverride[],
): Promise<void> => {
  await apiClient.put(`/memberships/${membershipId}/permissions`, {
    overrides,
  });
};
