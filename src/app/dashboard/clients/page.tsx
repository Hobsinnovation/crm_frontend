"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isAuthenticated, hasPermission } from "@/services/auth";
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
  Client,
  ClientPayload,
} from "@/services/clients";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-700",
  suspended: "bg-red-100 text-red-700",
};

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [mounted, setMounted] = useState(false);

  const canCreate = hasPermission("clients.create");
  const canUpdate = hasPermission("clients.update");
  const canDelete = hasPermission("clients.delete");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getClients(search, statusFilter);
      setClients(data.data);
    } catch (err: any) {
      setError(err.message || "Failed to load clients.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    if (!hasPermission("clients.view")) {
      setError("You do not have permission to view clients.");
      setLoading(false);
      return;
    }
    loadData();
  }, [router, loadData]);

  function openAdd() {
    setEditingClient(null);
    setShowModal(true);
  }

  function openEdit(client: Client) {
    setEditingClient(client);
    setShowModal(true);
  }

  async function handleStatusChange(id: number, status: string) {
    try {
      await updateClient(id, { status });
      loadData();
    } catch {
      alert("Failed to update status.");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this client?")) return;
    try {
      await deleteClient(id);
      loadData();
    } catch {
      alert("Failed to delete client.");
    }
  }

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-900">
              Back
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Clients</h1>
          </div>
          {canCreate && (
            <button
              onClick={openAdd}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md"
            >
              + Add Client
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-4 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search by name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* ================= CLIENT CARDS ================= */}
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client) => (
              <div
                key={client.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition p-5 flex flex-col"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {client.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {client.company || "-"}
                    </p>
                  </div>
                  {canUpdate ? (
                    <select
                      value={client.status}
                      onChange={(e) =>
                        handleStatusChange(client.id, e.target.value)
                      }
                      className={`px-2 py-1 rounded-full text-xs capitalize border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                        STATUS_COLORS[client.status]
                      }`}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  ) : (
                    <span
                      className={`px-2 py-1 rounded-full text-xs capitalize ${
                        STATUS_COLORS[client.status]
                      }`}
                    >
                      {client.status}
                    </span>
                  )}
                </div>

                <div className="mt-4 space-y-1 text-sm">
                  <p className="text-gray-600 truncate">
                    <span className="text-gray-400">Email: </span>
                    {client.email || "-"}
                  </p>
                  <p className="text-gray-600">
                    <span className="text-gray-400">Phone: </span>
                    {client.phone || "-"}
                  </p>
                  {(client.city || client.country) && (
                    <p className="text-gray-600">
                      <span className="text-gray-400">Location: </span>
                      {[client.city, client.country].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end gap-2">
                  {canUpdate && (
                    <button
                      onClick={() => openEdit(client)}
                      className="text-xs px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                    >
                      Edit
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="text-xs px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
            {clients.length === 0 && (
              <p className="text-gray-400 col-span-full text-center py-8">
                No clients found.
              </p>
            )}
          </div>
        )}
      </main>

      {showModal && (
        <ClientModal
          client={editingClient}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

function ClientModal({
  client,
  onClose,
  onSuccess,
}: {
  client: Client | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isEdit = !!client;
  const [form, setForm] = useState<ClientPayload>({
    name: client?.name ?? "",
    email: client?.email ?? "",
    phone: client?.phone ?? "",
    company: client?.company ?? "",
    website: client?.website ?? "",
    country: client?.country ?? "",
    city: client?.city ?? "",
    address: client?.address ?? "",
    contact_person: client?.contact_person ?? "",
    contact_phone: client?.contact_phone ?? "",
    status: client?.status ?? "active",
    notes: client?.notes ?? "",
    credit_balance: client ? Number(client.credit_balance) : 0,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: keyof ClientPayload, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      if (isEdit && client) {
        await updateClient(client.id, form);
      } else {
        await createClient(form);
      }
      onSuccess();
    } catch (err: any) {
      const firstError = err.errors
        ? (Object.values(err.errors)[0] as string[])[0]
        : err.message;
      setError(firstError || "Failed to save client.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50 overflow-y-auto py-8">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          {isEdit ? "Edit Client" : "Add New Client"}
        </h2>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Name *">
            <input className={inputCls} value={form.name}
              onChange={(e) => update("name", e.target.value)} />
          </Field>
          <Field label="Company">
            <input className={inputCls} value={form.company}
              onChange={(e) => update("company", e.target.value)} />
          </Field>
          <Field label="Email">
            <input type="email" className={inputCls} value={form.email}
              onChange={(e) => update("email", e.target.value)} />
          </Field>
          <Field label="Phone">
            <input className={inputCls} value={form.phone}
              onChange={(e) => update("phone", e.target.value)} />
          </Field>
          <Field label="Website">
            <input className={inputCls} value={form.website}
              onChange={(e) => update("website", e.target.value)} />
          </Field>
          <Field label="Status">
            <select className={inputCls} value={form.status}
              onChange={(e) => update("status", e.target.value)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </Field>
          <Field label="Country">
            <input className={inputCls} value={form.country}
              onChange={(e) => update("country", e.target.value)} />
          </Field>
          <Field label="City">
            <input className={inputCls} value={form.city}
              onChange={(e) => update("city", e.target.value)} />
          </Field>
          <Field label="Contact Person">
            <input className={inputCls} value={form.contact_person}
              onChange={(e) => update("contact_person", e.target.value)} />
          </Field>
          <Field label="Contact Phone">
            <input className={inputCls} value={form.contact_phone}
              onChange={(e) => update("contact_phone", e.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Address">
              <input className={inputCls} value={form.address}
                onChange={(e) => update("address", e.target.value)} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <textarea className={inputCls} rows={2} value={form.notes}
                onChange={(e) => update("notes", e.target.value)} />
            </Field>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50">
            {loading ? "Saving..." : isEdit ? "Update Client" : "Create Client"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  );
}