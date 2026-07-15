import { apiFetch } from "@/lib/api";

export interface Invoice {
  id: number;
  client_id: number;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  subtotal: string;
  tax: string;
  discount: string;
  total: string;
  status: "draft" | "sent" | "viewed" | "paid" | "unpaid" | "overdue" | "cancelled";
  amount_paid: string;
  paid_at: string | null;
  notes: string | null;
  terms: string | null;
  is_overdue: boolean;
  balance_due: number;
  client?: { id: number; name: string; company: string | null } | null;
  creator?: { id: number; name: string } | null;
  created_at: string;
}

export interface PaginatedInvoices {
  current_page: number;
  data: Invoice[];
  last_page: number;
  total: number;
}

export interface InvoicePayload {
  client_id: number;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax?: number;
  discount?: number;
  status?: string;
  notes?: string;
  terms?: string;
}

export interface ClientInvoiceSummary {
  id: number;
  name: string;
  company: string | null;
  invoices_count: number;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  overdue_count: number;
}

export async function getInvoices(
  search = "",
  status = "",
  overdueOnly = false,
  clientId: number | null = null
): Promise<PaginatedInvoices> {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (status) params.append("status", status);
  if (overdueOnly) params.append("overdue", "1");
  if (clientId) params.append("client_id", String(clientId));
  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await apiFetch<{ success: boolean; data: PaginatedInvoices }>(
    `/invoices${query}`
  );
  return res.data;
}

export async function getInvoicesByClient(): Promise<ClientInvoiceSummary[]> {
  const res = await apiFetch<{ success: boolean; data: ClientInvoiceSummary[] }>(
    "/invoices/by-client"
  );
  return res.data;
}

export async function createInvoice(payload: InvoicePayload) {
  return apiFetch("/invoices", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateInvoice(id: number, payload: Partial<InvoicePayload>) {
  return apiFetch(`/invoices/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function markInvoicePaid(id: number) {
  return apiFetch(`/invoices/${id}/mark-paid`, {
    method: "PATCH",
  });
}

export async function deleteInvoice(id: number) {
  return apiFetch(`/invoices/${id}`, {
    method: "DELETE",
  });
}