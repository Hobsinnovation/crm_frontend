"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Space_Grotesk, Manrope, IBM_Plex_Mono } from "next/font/google";
import { getStoredUser, isAuthenticated, logout, hasPermission, User } from "@/services/auth";
import { getDashboardStats, DashboardStats } from "@/services/dashboard";
import NotificationBell from "@/components/NotificationBell";

/**
 * Type system
 * - display: Space Grotesk — used sparingly for headings and big numbers, gives the
 *   dashboard a distinct, slightly technical character instead of a generic UI font.
 * - body: Manrope — everyday text, warm and highly legible.
 * - mono: IBM Plex Mono — reserved for financial figures (tabular numerals), so the
 *   billing section reads like an actual ledger.
 * next/font self-hosts these at build time — no extra npm install, no runtime request.
 */
const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-mono" });

// Client status → pill styling. Keys must match the `status` values coming from the API.
const STATUS_STYLES: Record<string, string> = {
  active: "bg-[#E7F5F0] text-[#127A5D]",
  inactive: "bg-[#F1F2F6] text-[#5B5F6E]",
  suspended: "bg-[#FDEBEA] text-[#C23B34]",
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    setUser(getStoredUser());

    getDashboardStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  // Drives the one-time entrance transition on the main content.
  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  if (!user) return null;

  const canViewUsers = hasPermission("users.view");
  const canViewClients = hasPermission("clients.view");
  const canViewLeads = hasPermission("leads.view");
  const canViewDomains = hasPermission("domains.view");
  const canViewInvoices = hasPermission("invoices.view");

  return (
    <div
      className={`${body.variable} ${display.variable} ${mono.variable} min-h-screen bg-[#F5F6FA] font-[family-name:var(--font-body)] text-[#14192E] antialiased`}
    >
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-[#E6E8F0] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#4B5FE0] to-[#171F3D] font-[family-name:var(--font-display)] text-sm font-bold text-white shadow-sm">
              H
            </div>
            <p className="font-[family-name:var(--font-display)] text-[15px] font-semibold tracking-tight">
              HOBS <span className="text-[#4B5FE0]">CRM</span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="hidden items-center gap-2.5 sm:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EDEFFB] font-[family-name:var(--font-display)] text-xs font-semibold text-[#4B5FE0]">
                {getInitials(user.name)}
              </div>
              <div className="leading-tight">
                <p className="text-sm font-medium text-[#14192E]">{user.name}</p>
                <p className="text-xs capitalize text-[#8B8FA3]">{user.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="group flex items-center gap-1.5 rounded-lg border border-[#E6E8F0] px-3 py-2 text-sm font-medium text-[#5B5F6E] transition-colors hover:border-[#E15252]/30 hover:bg-[#FDEBEA] hover:text-[#C23B34] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B5FE0] focus-visible:ring-offset-2"
            >
              <IconLogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main
        className={`mx-auto max-w-7xl px-4 py-8 transition-all duration-700 motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 sm:px-6 ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        }`}
      >
        {/* Welcome */}
        <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-[#4B5FE0]">{getGreeting()}</p>
            <h2 className="mt-1 font-[family-name:var(--font-display)] text-[26px] font-semibold tracking-tight sm:text-[30px]">
              {user.name.split(" ")[0]}, here&apos;s today&apos;s overview.
            </h2>
          </div>
          <p className="text-sm text-[#8B8FA3]">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Stat cards */}
        {loading ? (
          <SkeletonStats />
        ) : (
          stats && (
            <>
              <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {stats.users && (
                  <StatCard
                    icon={<IconUsers />}
                    title="Total Users"
                    value={stats.users.total}
                    sub={`${stats.users.active} active`}
                    accent="#4B5FE0"
                  />
                )}
                {stats.clients && (
                  <StatCard
                    icon={<IconBuilding />}
                    title="Total Clients"
                    value={stats.clients.total}
                    sub={`+${stats.clients.this_month} this month`}
                    accent="#127A5D"
                  />
                )}
                {stats.leads && (
                  <StatCard icon={<IconTrendingUp />} title="Total Leads" value={stats.leads.total} sub="Sales pipeline" accent="#C99A2E" />
                )}
                {stats.domains && (
                  <StatCard
                    icon={<IconGlobe />}
                    title="Domains"
                    value={stats.domains.total}
                    sub={stats.domains.expiring_soon ? `${stats.domains.expiring_soon} expiring soon` : "All healthy"}
                    accent="#7C5CFC"
                    warn={!!stats.domains.expiring_soon}
                  />
                )}
              </div>

              {/* Billing overview — a ledger strip instead of four more identical cards,
                  since these four numbers are one story (invoices → revenue → pending → overdue). */}
              {stats.invoices && (
                <div className="mt-4 overflow-hidden rounded-2xl border border-[#E6E8F0] bg-white shadow-sm">
                  <div className="flex items-center gap-2 border-b border-[#E6E8F0] bg-[#FBFAF6] px-5 py-3">
                    <IconReceipt className="h-4 w-4 text-[#C99A2E]" />
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#8B8FA3]">Billing overview</p>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-y divide-[#E6E8F0] sm:grid-cols-4 sm:divide-y-0">
                    <LedgerCell label="Invoices" value={stats.invoices.total} sub={`${stats.invoices.paid ?? 0} paid`} />
                    <LedgerCell label="Revenue" value={`$${(stats.invoices.revenue ?? 0).toLocaleString()}`} sub="Collected" tone="#127A5D" />
                    <LedgerCell label="Pending" value={`$${(stats.invoices.pending ?? 0).toLocaleString()}`} sub="Awaiting payment" tone="#C99A2E" />
                    <LedgerCell
                      label="Overdue"
                      value={stats.invoices.overdue ?? 0}
                      sub={(stats.invoices.overdue ?? 0) > 0 ? "Needs attention" : "All on time"}
                      tone={(stats.invoices.overdue ?? 0) > 0 ? "#C23B34" : "#127A5D"}
                    />
                  </div>
                </div>
              )}

              {/* Clients breakdown + recent clients */}
              {stats.clients && (
                <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-[#E6E8F0] bg-white p-6 shadow-sm">
                    <h3 className="font-[family-name:var(--font-display)] text-sm font-semibold">Clients by status</h3>
                    <div className="mt-5 space-y-4">
                      <StatusBar label="Active" count={stats.clients.active} total={stats.clients.total} color="#127A5D" />
                      <StatusBar label="Inactive" count={stats.clients.inactive} total={stats.clients.total} color="#9AA0B4" />
                      <StatusBar label="Suspended" count={stats.clients.suspended} total={stats.clients.total} color="#C23B34" />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#E6E8F0] bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="font-[family-name:var(--font-display)] text-sm font-semibold">Recent clients</h3>
                      <Link
                        href="/dashboard/clients"
                        className="flex items-center gap-0.5 text-sm font-medium text-[#4B5FE0] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B5FE0] focus-visible:ring-offset-2"
                      >
                        View all
                        <IconChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                    <div className="mt-4 space-y-1">
                      {stats.recent_clients?.length ? (
                        stats.recent_clients.map((client) => (
                          <div
                            key={client.id}
                            className="flex items-center justify-between rounded-lg px-2 py-2 transition-colors hover:bg-[#F5F6FA]"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EDEFFB] text-xs font-semibold text-[#4B5FE0]">
                                {getInitials(client.name)}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-[#14192E]">{client.name}</p>
                                <p className="text-xs text-[#8B8FA3]">{client.company || "—"}</p>
                              </div>
                            </div>
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                                STATUS_STYLES[client.status] ?? STATUS_STYLES.inactive
                              }`}
                            >
                              {client.status}
                            </span>
                          </div>
                        ))
                      ) : (
                        <EmptyState message="No clients yet — add your first client to see them here." />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )
        )}

        {/* Module links */}
        <h3 className="mb-3 mt-10 font-[family-name:var(--font-display)] text-sm font-semibold">Modules</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {canViewUsers && (
            <ModuleCard href="/dashboard/users" icon={<IconUsers />} title="User Management" desc="Manage users, roles, and access." accent="#4B5FE0" />
          )}
          {canViewClients && (
            <ModuleCard href="/dashboard/clients" icon={<IconBuilding />} title="Clients" desc="Manage your customers and companies." accent="#127A5D" />
          )}
          {canViewLeads && (
            <ModuleCard href="/dashboard/leads" icon={<IconTrendingUp />} title="Leads" desc="Track your sales pipeline and conversions." accent="#C99A2E" />
          )}
          {canViewDomains && (
            <ModuleCard href="/dashboard/domains" icon={<IconGlobe />} title="Domains" desc="Track expiry dates and renewals." accent="#7C5CFC" />
          )}
          {canViewInvoices && (
            <ModuleCard href="/dashboard/invoices" icon={<IconReceipt />} title="Invoices" desc="Billing, payments, and overdue tracking." accent="#C99A2E" />
          )}
          {canViewUsers && (
            <ModuleCard href="/dashboard/activity" icon={<IconClock />} title="Activity Logs" desc="Audit trail of all system actions." accent="#5B5F6E" />
          )}
        </div>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Presentational helpers                                             */
/* ------------------------------------------------------------------ */

function StatCard({
  icon,
  title,
  value,
  sub,
  accent,
  warn,
}: {
  icon: ReactNode;
  title: string;
  value: ReactNode;
  sub: string;
  accent: string;
  warn?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md motion-safe:hover:-translate-y-0.5 ${
        warn ? "border-[#F0C25E]" : "border-[#E6E8F0]"
      }`}
    >
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${accent}1A`, color: accent }}>
        {icon}
      </div>
      <p className="text-xs font-medium uppercase tracking-wide text-[#8B8FA3]">{title}</p>
      <p className="mt-1 font-[family-name:var(--font-mono)] text-2xl font-semibold tabular-nums">{value}</p>
      <p className={`mt-1 text-xs ${warn ? "font-medium text-[#B8860B]" : "text-[#8B8FA3]"}`}>{sub}</p>
    </div>
  );
}

function LedgerCell({
  label,
  value,
  sub,
  tone = "#14192E",
}: {
  label: string;
  value: ReactNode;
  sub: string;
  tone?: string;
}) {
  return (
    <div className="px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-[#8B8FA3]">{label}</p>
      <p className="mt-1 font-[family-name:var(--font-mono)] text-xl font-semibold tabular-nums" style={{ color: tone }}>
        {value}
      </p>
      <p className="mt-0.5 text-xs text-[#8B8FA3]">{sub}</p>
    </div>
  );
}

function StatusBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const percent = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-sm">
        <span className="text-[#5B5F6E]">{label}</span>
        <span className="font-[family-name:var(--font-mono)] font-semibold tabular-nums">{count}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#F1F2F6]">
        <div
          className="h-full rounded-full transition-all duration-700 motion-reduce:transition-none"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function ModuleCard({ href, icon, title, desc, accent }: { href: string; icon: ReactNode; title: string; desc: string; accent: string }) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-2xl border border-[#E6E8F0] bg-white p-5 shadow-sm transition-all duration-200 hover:border-[#4B5FE0]/30 hover:shadow-md motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B5FE0] focus-visible:ring-offset-2"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${accent}1A`, color: accent }}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="font-[family-name:var(--font-display)] text-[15px] font-semibold">{title}</h3>
          <IconChevronRight className="h-4 w-4 text-[#C7CAD9] transition-transform group-hover:translate-x-0.5 group-hover:text-[#4B5FE0]" />
        </div>
        <p className="mt-1 text-sm text-[#8B8FA3]">{desc}</p>
      </div>
    </Link>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-[#E6E8F0] py-8 text-center">
      <p className="text-sm text-[#8B8FA3]">{message}</p>
    </div>
  );
}

function SkeletonStats() {
  return (
    <div className="mt-8 animate-pulse space-y-4" aria-hidden="true">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl border border-[#E6E8F0] bg-white p-5">
            <div className="h-9 w-9 rounded-lg bg-[#F1F2F6]" />
            <div className="mt-4 h-3 w-16 rounded bg-[#F1F2F6]" />
            <div className="mt-2 h-6 w-12 rounded bg-[#F1F2F6]" />
          </div>
        ))}
      </div>
      <div className="h-24 rounded-2xl border border-[#E6E8F0] bg-white" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small utilities                                                    */
/* ------------------------------------------------------------------ */

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return initials || "?";
}

/* ------------------------------------------------------------------ */
/* Icons — minimal inline SVGs so no icon package needs to be added   */
/* ------------------------------------------------------------------ */

function IconUsers({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M15.5 14.2c2.4.4 4.5 2.4 4.5 5.8" />
    </svg>
  );
}

function IconBuilding({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4" y="3" width="12" height="18" rx="1" />
      <path d="M8 8h.01M12 8h.01M8 12h.01M12 12h.01M8 16h.01M12 16h.01" />
      <path d="M16 10h3a1 1 0 0 1 1 1v10h-4" />
    </svg>
  );
}

function IconTrendingUp({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 17l6-6 4 4 7-8" />
      <path d="M15 7h5v5" />
    </svg>
  );
}

function IconGlobe({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-6-3.8-9s1.3-6.4 3.8-9z" />
    </svg>
  );
}

function IconReceipt({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="5" y="3" width="14" height="18" rx="1.5" />
      <path d="M8.5 8h7M8.5 12h7M8.5 16h4" />
    </svg>
  );
}

function IconLogOut({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}

function IconChevronRight({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}
function IconClock({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}