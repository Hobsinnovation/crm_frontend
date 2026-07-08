import { apiFetch } from "@/lib/api";
import { User } from "@/services/auth";

export interface Role {
  id: number;
  name: string;
  display_name: string;
  priority: number;
}

export interface PaginatedUsers {
  current_page: number;
  data: User[];
  last_page: number;
  total: number;
  per_page: number;
}

export async function getUsers(search = ""): Promise<PaginatedUsers> {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const res = await apiFetch<{ success: boolean; data: PaginatedUsers }>(
    `/users${query}`
  );
  return res.data;
}

export async function getRoles(): Promise<Role[]> {
  const res = await apiFetch<{ success: boolean; data: Role[] }>("/roles");
  return res.data;
}

export async function createUser(payload: {
  name: string;
  email: string;
  password: string;
  role_id: number;
}) {
  return apiFetch("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateUserRole(userId: number, roleId: number) {
  return apiFetch(`/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify({ role_id: roleId }),
  });
}

export async function toggleUserStatus(userId: number) {
  return apiFetch(`/users/${userId}/toggle-status`, {
    method: "PATCH",
  });
}

export async function deleteUser(userId: number) {
  return apiFetch(`/users/${userId}`, {
    method: "DELETE",
  });
}