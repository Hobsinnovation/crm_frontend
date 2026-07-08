"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getStoredUser, isAuthenticated, logout, hasPermission, User } from "@/services/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    setUser(getStoredUser());
  }, [router]);

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  if (!user) return null;

  const canViewUsers = hasPermission("users.view");
  const canViewClients = hasPermission("clients.view");

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
          Yahan se apne CRM modules manage karein.
        </p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
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
        </div>
      </main>
    </div>
  );
}