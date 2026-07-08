import { apiFetch } from "@/lib/api";

export interface Permission {
  id: number;
  name: string;
  display_name: string;
  module: string;
  action: string;
}

export interface RoleRelation {
  id: number;
  name: string;
  display_name: string;
  permissions?: Permission[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  role_id: number | null;
  is_active: boolean;
  avatar?: string | null;
  role_relation?: RoleRelation | null;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export async function login(email: string, password: string) {
  const res = await apiFetch<AuthResponse>("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem("token", res.data.token);
  localStorage.setItem("user", JSON.stringify(res.data.user));
  return res.data.user;
}

export async function register(
  name: string,
  email: string,
  password: string,
  password_confirmation: string
) {
  const res = await apiFetch<AuthResponse>("/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, password_confirmation }),
  });
  localStorage.setItem("token", res.data.token);
  localStorage.setItem("user", JSON.stringify(res.data.user));
  return res.data.user;
}

export async function logout() {
  try {
    await apiFetch("/logout", { method: "POST" });
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("token");
}

export function hasPermission(permissionName: string): boolean {
  const user = getStoredUser();
  if (!user?.role_relation?.permissions) return false;
  return user.role_relation.permissions.some((p) => p.name === permissionName);
}