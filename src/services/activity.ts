import { apiFetch } from "@/lib/api";

export interface ActivityLog {
  id: number;
  user_id: number | null;
  action: string;
  model: string | null;
  model_id: number | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user?: { id: number; name: string; role: string } | null;
}

export interface PaginatedLogs {
  current_page: number;
  data: ActivityLog[];
  last_page: number;
  total: number;
}

export interface ActivityFilters {
  users: { id: number; name: string }[];
  actions: string[];
  models: string[];
}

export async function getActivityLogs(
  userId = "",
  action = "",
  model = ""
): Promise<PaginatedLogs> {
  const params = new URLSearchParams();
  if (userId) params.append("user_id", userId);
  if (action) params.append("action", action);
  if (model) params.append("model", model);
  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await apiFetch<{ success: boolean; data: PaginatedLogs }>(
    `/activity-logs${query}`
  );
  return res.data;
}

export async function getActivityFilters(): Promise<ActivityFilters> {
  const res = await apiFetch<{ success: boolean; data: ActivityFilters }>(
    "/activity-logs/filters"
  );
  return res.data;
}