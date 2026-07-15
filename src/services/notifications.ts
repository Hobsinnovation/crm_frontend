import { apiFetch } from "@/lib/api";

export interface AppNotification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  read_at: string | null;
  created_at: string;
}

export async function getNotifications(): Promise<AppNotification[]> {
  const res = await apiFetch<{ success: boolean; data: AppNotification[] }>(
    "/notifications"
  );
  return res.data;
}

export async function getUnreadCount(): Promise<number> {
  const res = await apiFetch<{ success: boolean; data: { count: number } }>(
    "/notifications/unread-count"
  );
  return res.data.count;
}

export async function markNotificationRead(id: number) {
  return apiFetch(`/notifications/${id}/read`, {
    method: "PATCH",
  });
}

export async function markAllNotificationsRead() {
  return apiFetch("/notifications/mark-all-read", {
    method: "PATCH",
  });
}