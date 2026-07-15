"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isAuthenticated, hasPermission } from "@/services/auth";
import {
  getActivityLogs,
  getActivityFilters,
  ActivityLog,
  ActivityFilters,
} from "@/services/activity";

const ACTION_COLORS: Record<string, string> = {
  login: "bg-blue-100 text-blue-700",
  logout: "bg-gray-100 text-gray-700",
  created: "bg-green-100 text-green-700",
  updated: "bg-amber-100 text-amber-700",
  deleted: "bg-red-100 text-red-700",
  assigned: "bg-purple-100 text-purple-700",
  converted: "bg-emerald-100 text-emerald-700",
  paid: "bg-green-100 text-green-700",
  activated: "bg-green-100 text-green-700",
  deactivated: "bg-red-100 text-red-700",
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "?";
}

function describeLog(log: ActivityLog): string {
  const who = log.user?.name ?? "System";
  const what = log.model ? `${log.model}${log.model_id ? ` #${log.model_id}` : ""}` : "";

  switch (log.action) {
    case "login":
      return `${who} logged in`;
    case "logout":
      return `${who} logged out`;
    case "created":
      return `${who} created ${what}`;
    case "updated":
      return `${who} updated ${what}`;
    case "deleted":
      return `${who} deleted ${what}`;
    case "assigned":
      return `${who} assigned ${what}`;
    case "converted":
      return `${who} converted ${what} to a client`;
    case "paid":
      return `${who} marked ${what} as paid`;
    case "activated":
      return `${who} activated ${what}`;
    case "deactivated":
      return `${who} deactivated ${what}`;
    default:
      return `${who} performed "${log.action}" on ${what}`;
  }
}

export default function ActivityPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filters, setFilters] = useState<ActivityFilters | null>(null);
  const [userFilter, setUserFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getActivityLogs(userFilter, actionFilter, modelFilter);
      setLogs(data.data);
    } catch (err: any) {
      setError(err.message || "Failed to load activity logs.");
    } finally {
      setLoading(false);
    }
  }, [userFilter, actionFilter, modelFilter]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    if (!hasPermission("users.view")) {
      setError("You do not have permission to view activity logs.");
      setLoading(false);
      return;
    }
    loadData();
    getActivityFilters().then(setFilters).catch(() => {});
  }, [router, loadData]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-900">
            Back
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Activity Logs</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Users</option>
            {filters?.users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm capitalize"
          >
            <option value="">All Actions</option>
            {filters?.actions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <select
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Types</option>
            {filters?.models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          {(userFilter || actionFilter || modelFilter) && (
            <button
              onClick={() => {
                setUserFilter("");
                setActionFilter("");
                setModelFilter("");
              }}
              className="px-3 py-2 text-sm text-blue-600 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Timeline */}
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : logs.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No activity found.</p>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200" />

            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="relative flex gap-4">
                  {/* Avatar */}
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white border-2 border-gray-200 text-xs font-semibold text-gray-600">
                    {log.user ? getInitials(log.user.name) : "SY"}
                  </div>

                  {/* Card */}
                  <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm text-gray-900">
                        {describeLog(log)}
                      </p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs capitalize ${
                          ACTION_COLORS[log.action] ?? "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {log.action}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      <span>{timeAgo(log.created_at)}</span>
                      {log.ip_address && <span>IP: {log.ip_address}</span>}
                      {(log.old_values || log.new_values) && (
                        <button
                          onClick={() =>
                            setExpandedId(expandedId === log.id ? null : log.id)
                          }
                          className="text-blue-600 hover:underline"
                        >
                          {expandedId === log.id ? "Hide details" : "Show details"}
                        </button>
                      )}
                    </div>

                    {/* Expanded details — old/new values */}
                    {expandedId === log.id && (
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {log.old_values && (
                          <div className="bg-red-50 rounded-md p-3">
                            <p className="font-semibold text-red-700 mb-1">
                              Before
                            </p>
                            <pre className="text-red-600 whitespace-pre-wrap break-all">
                              {JSON.stringify(log.old_values, null, 2)}
                            </pre>
                          </div>
                        )}
                        {log.new_values && (
                          <div className="bg-green-50 rounded-md p-3">
                            <p className="font-semibold text-green-700 mb-1">
                              After
                            </p>
                            <pre className="text-green-600 whitespace-pre-wrap break-all">
                              {JSON.stringify(log.new_values, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}