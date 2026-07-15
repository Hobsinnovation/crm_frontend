import { apiFetch } from "@/lib/api";

export interface DashboardStats {
  users?: {
    total: number;
    active: number;
    inactive: number;
  };
  clients?: {
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    this_month: number;
  };
  clients_monthly?: { month: string; count: number }[];
  recent_clients?: {
    id: number;
    name: string;
    company: string | null;
    status: string;
    created_at: string;
  }[];
  leads?: { total: number };
  domains?: { total: number; expiring_soon?: number };
  invoices?: {
    total: number;
    paid?: number;
    overdue?: number;
    revenue?: number;
    pending?: number;
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await apiFetch<{ success: boolean; data: DashboardStats }>(
    "/dashboard/stats"
  );
  return res.data;
}