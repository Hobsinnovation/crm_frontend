import { apiFetch } from "@/lib/api";

export interface Client {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  website: string | null;
  country: string | null;
  city: string | null;
  postal_code: string | null;
  address: string | null;
  contact_person: string | null;
  contact_phone: string | null;
  status: "active" | "inactive" | "suspended";
  notes: string | null;
  credit_balance: string;
  creator?: { id: number; name: string } | null;
  assignee?: { id: number; name: string } | null;
  created_at: string;
}

export interface PaginatedClients {
  current_page: number;
  data: Client[];
  last_page: number;
  total: number;
  per_page: number;
}

export interface ClientPayload {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  website?: string;
  country?: string;
  city?: string;
  address?: string;
  contact_person?: string;
  contact_phone?: string;
  status: string;
  notes?: string;
  credit_balance?: number;
}

export async function getClients(search = "", status = ""): Promise<PaginatedClients> {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (status) params.append("status", status);
  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await apiFetch<{ success: boolean; data: PaginatedClients }>(
    `/clients${query}`
  );
  return res.data;
}

export async function createClient(payload: ClientPayload) {
  return apiFetch("/clients", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateClient(id: number, payload: Partial<ClientPayload>) {
  return apiFetch(`/clients/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteClient(id: number) {
  return apiFetch(`/clients/${id}`, {
    method: "DELETE",
  });
}