import { apiFetch } from "@/lib/api";

export interface Lead {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  country: string | null;
  source: string;
  status: "new" | "contacted" | "proposal_sent" | "won" | "lost";
  assigned_to: number | null;
  converted_to_client_id: number | null;
  notes: string | null;
  estimated_value: string | null;
  assignee?: { id: number; name: string } | null;
  creator?: { id: number; name: string } | null;
  client?: { id: number; name: string } | null;
  created_at: string;
}

export interface PaginatedLeads {
  current_page: number;
  data: Lead[];
  last_page: number;
  total: number;
}

export interface LeadPayload {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  country?: string;
  source: string;
  status?: string;
  notes?: string;
  estimated_value?: number;
}

export interface AssignableUser {
  id: number;
  name: string;
  role: string;
}

export async function getLeads(
  search = "",
  status = "",
  source = ""
): Promise<PaginatedLeads> {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (status) params.append("status", status);
  if (source) params.append("source", source);
  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await apiFetch<{ success: boolean; data: PaginatedLeads }>(
    `/leads${query}`
  );
  return res.data;
}

export async function getAssignableUsers(): Promise<AssignableUser[]> {
  const res = await apiFetch<{ success: boolean; data: AssignableUser[] }>(
    "/leads/assignable-users"
  );
  return res.data;
}

export async function createLead(payload: LeadPayload) {
  return apiFetch("/leads", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateLead(id: number, payload: Partial<LeadPayload>) {
  return apiFetch(`/leads/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function assignLead(id: number, userId: number) {
  return apiFetch(`/leads/${id}/assign`, {
    method: "PATCH",
    body: JSON.stringify({ assigned_to: userId }),
  });
}

export async function convertLead(id: number) {
  return apiFetch(`/leads/${id}/convert`, {
    method: "POST",
  });
}

export async function deleteLead(id: number) {
  return apiFetch(`/leads/${id}`, {
    method: "DELETE",
  });
}