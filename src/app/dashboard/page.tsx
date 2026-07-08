"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, isAuthenticated, logout, User } from "@/services/auth";

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
          Welcome back, {user.name}! 👋
        </h2>
        <p className="text-gray-500 mt-1">
          Dashboard modules Phase 2 mein add honge.
        </p>
      </main>
    </div>
  );
}