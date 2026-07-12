import { apiFetch } from "@/lib/api";

export interface Domain {
  id: number;
  client_id: number | null;
  name: string;
  registrar: string | null;
  registrar_account: string | null;
  nameservers: string | null;
  registered_date: string | null;
  expiry_date: string | null;
  renewal_date: string | null;
  auto_renewal: boolean;
  annual_cost: string | null;
  status: "active" | "expired" | "expiring" | "renewal_pending";
  is_critical: boolean;
  notes: string | null;
  days_to_expiry: number | null;
  client?: { id: number; name: string } | null;
  creator?: { id: number; name: string } | null;
  created_at: string;
}

export interface PaginatedDomains {
  current_page: number;
  data: Domain[];
  last_page: number;
  total: number;
}

export interface DomainPayload {
  client_id?: number | null;
  name: string;
  registrar?: string;
  registered_date?: string;
  expiry_date?: string;
  renewal_date?: string;
  auto_renewal?: boolean;
  annual_cost?: number;
  status?: string;
  is_critical?: boolean;
  notes?: string;
}

export interface ClientOption {
  id: number;
  name: string;
  company: string | null;
}

export async function getDomains(
  search = "",
  status = "",
  expiringSoon = false
): Promise<PaginatedDomains> {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (status) params.append("status", status);
  if (expiringSoon) params.append("expiring_soon", "1");
  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await apiFetch<{ success: boolean; data: PaginatedDomains }>(
    `/domains${query}`
  );
  return res.data;
}

export async function getClientsList(): Promise<ClientOption[]> {
  const res = await apiFetch<{ success: boolean; data: ClientOption[] }>(
    "/domains/clients-list"
  );
  return res.data;
}

export async function createDomain(payload: DomainPayload) {
  return apiFetch("/domains", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateDomain(id: number, payload: Partial<DomainPayload>) {
  return apiFetch(`/domains/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function toggleAutoRenewal(id: number) {
  return apiFetch(`/domains/${id}/toggle-renewal`, {
    method: "PATCH",
  });
}

export async function deleteDomain(id: number) {
  return apiFetch(`/domains/${id}`, {
    method: "DELETE",
  });
}