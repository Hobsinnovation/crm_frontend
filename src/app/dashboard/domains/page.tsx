"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isAuthenticated, hasPermission } from "@/services/auth";
import {
  getDomains,
  getClientsList,
  createDomain,
  updateDomain,
  toggleAutoRenewal,
  deleteDomain,
  Domain,
  DomainPayload,
  ClientOption,
} from "@/services/domains";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  expired: "bg-red-100 text-red-700",
  expiring: "bg-amber-100 text-amber-700",
  renewal_pending: "bg-purple-100 text-purple-700",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  expired: "Expired",
  expiring: "Expiring",
  renewal_pending: "Renewal Pending",
};

function ExpiryBadge({ days }: { days: number | null }) {
  if (days === null) return <span className="text-gray-400 text-xs">-</span>;

  let cls = "bg-green-100 text-green-700";
  let label = `${days} days`;

  if (days < 0) {
    cls = "bg-red-100 text-red-700";
    label = `Expired ${Math.abs(days)}d ago`;
  } else if (days <= 30) {
    cls = "bg-red-100 text-red-700";
    label = `${days} days left`;
  } else if (days <= 90) {
    cls = "bg-amber-100 text-amber-700";
    label = `${days} days left`;
  } else {
    label = `${days} days left`;
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

export default function DomainsPage() {
  const router = useRouter();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [expiringOnly, setExpiringOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [mounted, setMounted] = useState(false);

  const canCreate = hasPermission("domains.create");
  const canUpdate = hasPermission("domains.update");
  const canDelete = hasPermission("domains.delete");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getDomains(search, statusFilter, expiringOnly);
      setDomains(data.data);
    } catch (err: any) {
      setError(err.message || "Failed to load domains.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, expiringOnly]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    if (!hasPermission("domains.view")) {
      setError("You do not have permission to view domains.");
      setLoading(false);
      return;
    }
    loadData();
    getClientsList().then(setClients).catch(() => {});
  }, [router, loadData]);

  async function handleToggleRenewal(id: number) {
    try {
      await toggleAutoRenewal(id);
      loadData();
    } catch {
      alert("Failed to toggle auto-renewal.");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this domain?")) return;
    try {
      await deleteDomain(id);
      loadData();
    } catch {
      alert("Failed to delete domain.");
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
            <h1 className="text-xl font-bold text-gray-900">Domains</h1>
          </div>
          {canCreate && (
            <button
              onClick={() => {
                setEditingDomain(null);
                setShowModal(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md"
            >
              + Add Domain
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-4 flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Search by domain or registrar..."
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
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={expiringOnly}
              onChange={(e) => setExpiringOnly(e.target.checked)}
              className="rounded"
            />
            Expiring in 30 days
          </label>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* ================= DOMAIN CARDS ================= */}
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {domains.map((domain) => (
              <div
                key={domain.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition p-5 flex flex-col"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {domain.name}
                      {domain.is_critical && (
                        <span className="ml-2 text-xs text-red-600" title="Critical domain">
                          ★
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {domain.client?.name ?? "No client"}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      STATUS_COLORS[domain.status]
                    }`}
                  >
                    {STATUS_LABELS[domain.status]}
                  </span>
                </div>

                <div className="mt-4 space-y-1 text-sm">
                  <p className="text-gray-600">
                    <span className="text-gray-400">Registrar: </span>
                    {domain.registrar ?? "-"}
                  </p>
                  <p className="text-gray-600">
                    <span className="text-gray-400">Annual Cost: </span>
                    {domain.annual_cost
                      ? `$${Number(domain.annual_cost).toFixed(2)}/yr`
                      : "-"}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-gray-400">Expiry:</span>
                    <ExpiryBadge days={domain.days_to_expiry} />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                  {canUpdate ? (
                    <button
                      onClick={() => handleToggleRenewal(domain.id)}
                      className={`relative w-10 h-5 rounded-full transition ${
                        domain.auto_renewal ? "bg-green-500" : "bg-gray-300"
                      }`}
                      title={
                        domain.auto_renewal
                          ? "Auto-renewal ON"
                          : "Auto-renewal OFF"
                      }
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
                          domain.auto_renewal ? "left-5" : "left-0.5"
                        }`}
                      />
                    </button>
                  ) : (
                    <span className="text-xs text-gray-600">
                      Auto-renew: {domain.auto_renewal ? "On" : "Off"}
                    </span>
                  )}

                  <div className="space-x-1">
                    {canUpdate && (
                      <button
                        onClick={() => {
                          setEditingDomain(domain);
                          setShowModal(true);
                        }}
                        className="text-xs px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                      >
                        Edit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(domain.id)}
                        className="text-xs px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {domains.length === 0 && (
              <p className="text-gray-400 col-span-full text-center py-8">
                No domains found.
              </p>
            )}
          </div>
        )}
      </main>

      {showModal && (
        <DomainModal
          domain={editingDomain}
          clients={clients}
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

function DomainModal({
  domain,
  clients,
  onClose,
  onSuccess,
}: {
  domain: Domain | null;
  clients: ClientOption[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isEdit = !!domain;
  const [form, setForm] = useState<DomainPayload>({
    name: domain?.name ?? "",
    client_id: domain?.client_id ?? null,
    registrar: domain?.registrar ?? "",
    registered_date: domain?.registered_date?.slice(0, 10) ?? "",
    expiry_date: domain?.expiry_date?.slice(0, 10) ?? "",
    auto_renewal: domain?.auto_renewal ?? false,
    annual_cost: domain?.annual_cost ? Number(domain.annual_cost) : undefined,
    status: domain?.status ?? "active",
    is_critical: domain?.is_critical ?? false,
    notes: domain?.notes ?? "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: keyof DomainPayload, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      if (isEdit && domain) {
        await updateDomain(domain.id, form);
      } else {
        await createDomain(form);
      }
      onSuccess();
    } catch (err: any) {
      const firstError = err.errors
        ? (Object.values(err.errors)[0] as string[])[0]
        : err.message;
      setError(firstError || "Failed to save domain.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50 overflow-y-auto py-8">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          {isEdit ? "Edit Domain" : "Add New Domain"}
        </h2>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Domain Name *">
            <input className={inputCls} value={form.name}
              placeholder="example.com"
              onChange={(e) => update("name", e.target.value)} />
          </Field>
          <Field label="Client">
            <select className={inputCls} value={form.client_id ?? ""}
              onChange={(e) =>
                update("client_id", e.target.value ? Number(e.target.value) : null)
              }>
              <option value="">No client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.company ? `(${c.company})` : ""}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Registrar">
            <input className={inputCls} value={form.registrar}
              placeholder="GoDaddy, Namecheap..."
              onChange={(e) => update("registrar", e.target.value)} />
          </Field>
          <Field label="Annual Cost ($)">
            <input type="number" step="0.01" className={inputCls}
              value={form.annual_cost ?? ""}
              onChange={(e) => update("annual_cost", Number(e.target.value))} />
          </Field>
          <Field label="Registered Date">
            <input type="date" className={inputCls} value={form.registered_date}
              onChange={(e) => update("registered_date", e.target.value)} />
          </Field>
          <Field label="Expiry Date">
            <input type="date" className={inputCls} value={form.expiry_date}
              onChange={(e) => update("expiry_date", e.target.value)} />
          </Field>
          <Field label="Status">
            <select className={inputCls} value={form.status}
              onChange={(e) => update("status", e.target.value)}>
              <option value="active">Active</option>
              <option value="expiring">Expiring</option>
              <option value="expired">Expired</option>
              <option value="renewal_pending">Renewal Pending</option>
            </select>
          </Field>
          <div className="flex items-end gap-4 pb-1">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={form.auto_renewal ?? false}
                onChange={(e) => update("auto_renewal", e.target.checked)}
                className="rounded" />
              Auto-renewal
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={form.is_critical ?? false}
                onChange={(e) => update("is_critical", e.target.checked)}
                className="rounded" />
              Critical
            </label>
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
            {loading ? "Saving..." : isEdit ? "Update Domain" : "Create Domain"}
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