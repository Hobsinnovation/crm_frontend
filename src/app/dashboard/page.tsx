"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getStoredUser, isAuthenticated, logout, hasPermission, User } from "@/services/auth";
import { getDashboardStats, DashboardStats } from "@/services/dashboard";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-700",
  suspended: "bg-red-100 text-red-700",
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

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

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  if (!user) return null;

  const canViewUsers = hasPermission("users.view");
  const canViewClients = hasPermission("clients.view");
  const canViewLeads = hasPermission("leads.view");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">HOBS CRM</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user.name} ({user.role})
            </span>
            <button
              onClick={handleLogout}
              className="text-sm px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.name}!
        </h2>
        <p className="text-gray-500 mt-1">
          Yahan aap ke CRM ka overview hai.
        </p>

        {/* Stat Cards */}
        {loading ? (
          <p className="text-gray-400 mt-6">Loading stats...</p>
        ) : (
          stats && (
            <>
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {stats.users && (
                  <StatCard
                    title="Total Users"
                    value={stats.users.total}
                    sub={`${stats.users.active} active`}
                    color="blue"
                  />
                )}
                {stats.clients && (
                  <StatCard
                    title="Total Clients"
                    value={stats.clients.total}
                    sub={`+${stats.clients.this_month} this month`}
                    color="green"
                  />
                )}
                {stats.leads && (
                  <StatCard
                    title="Total Leads"
                    value={stats.leads.total}
                    sub="Sales pipeline"
                    color="amber"
                  />
                )}
                {stats.domains && (
                  <StatCard
                    title="Domains"
                    value={stats.domains.total}
                    sub="Registered"
                    color="purple"
                  />
                )}
              </div>

              {/* Clients breakdown + Recent clients */}
              {stats.clients && (
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Clients by Status
                    </h3>
                    <div className="space-y-3">
                      <StatusBar
                        label="Active"
                        count={stats.clients.active}
                        total={stats.clients.total}
                        color="bg-green-500"
                      />
                      <StatusBar
                        label="Inactive"
                        count={stats.clients.inactive}
                        total={stats.clients.total}
                        color="bg-gray-400"
                      />
                      <StatusBar
                        label="Suspended"
                        count={stats.clients.suspended}
                        total={stats.clients.total}
                        color="bg-red-500"
                      />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-gray-900">
                        Recent Clients
                      </h3>
                      <Link
                        href="/dashboard/clients"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View all
                      </Link>
                    </div>
                    <div className="space-y-3">
                      {stats.recent_clients?.length ? (
                        stats.recent_clients.map((client) => (
                          <div
                            key={client.id}
                            className="flex justify-between items-center"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {client.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {client.company || "-"}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs capitalize ${
                                STATUS_COLORS[client.status]
                              }`}
                            >
                              {client.status}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400">No clients yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )
        )}

        {/* Module Links */}
        <h3 className="mt-8 font-semibold text-gray-900">Modules</h3>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {canViewUsers && (
            <Link
              href="/dashboard/users"
              className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition"
            >
              <h3 className="font-semibold text-gray-900">User Management</h3>
              <p className="text-sm text-gray-500 mt-1">
                Manage users, roles, and access.
              </p>
            </Link>
          )}
          {canViewClients && (
            <Link
              href="/dashboard/clients"
              className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition"
            >
              <h3 className="font-semibold text-gray-900">Clients</h3>
              <p className="text-sm text-gray-500 mt-1">
                Manage your customers and companies.
              </p>
            </Link>
          )}
          {canViewLeads && (
            <Link
              href="/dashboard/leads"
              className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition"
            >
              <h3 className="font-semibold text-gray-900">Leads</h3>
              <p className="text-sm text-gray-500 mt-1">
                Track your sales pipeline and conversions.
              </p>
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}

const CARD_COLORS: Record<string, string> = {
  blue: "border-l-blue-500",
  green: "border-l-green-500",
  amber: "border-l-amber-500",
  purple: "border-l-purple-500",
};

function StatCard({
  title,
  value,
  sub,
  color,
}: {
  title: string;
  value: number;
  sub: string;
  color: string;
}) {
  return (
    <div
      className={`bg-white rounded-lg shadow p-5 border-l-4 ${CARD_COLORS[color]}`}
    >
      <p className="text-xs text-gray-500 uppercase">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}

function StatusBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const percent = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="text-gray-900 font-medium">{count}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}