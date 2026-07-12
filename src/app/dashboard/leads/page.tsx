"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isAuthenticated, hasPermission } from "@/services/auth";
import {
  getLeads,
  getAssignableUsers,
  createLead,
  updateLead,
  assignLead,
  convertLead,
  deleteLead,
  Lead,
  LeadPayload,
  AssignableUser,
} from "@/services/leads";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-amber-100 text-amber-700",
  proposal_sent: "bg-purple-100 text-purple-700",
  won: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  proposal_sent: "Proposal Sent",
  won: "Won",
  lost: "Lost",
};

const SOURCES = ["website", "facebook", "google", "referral", "whatsapp", "other"];

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<AssignableUser[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [mounted, setMounted] = useState(false);

  const canCreate = hasPermission("leads.create");
  const canUpdate = hasPermission("leads.update");
  const canDelete = hasPermission("leads.delete");
  const canAssign = hasPermission("leads.assign");
  const canConvert = hasPermission("clients.create");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getLeads(search, statusFilter, sourceFilter);
      setLeads(data.data);
    } catch (err: any) {
      setError(err.message || "Failed to load leads.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sourceFilter]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    if (!hasPermission("leads.view")) {
      setError("You do not have permission to view leads.");
      setLoading(false);
      return;
    }
    loadData();
    getAssignableUsers().then(setUsers).catch(() => {});
  }, [router, loadData]);

  async function handleStatusChange(id: number, status: string) {
    try {
      await updateLead(id, { status });
      loadData();
    } catch {
      alert("Failed to update status.");
    }
  }

  async function handleAssign(id: number, userId: number) {
    try {
      await assignLead(id, userId);
      loadData();
    } catch {
      alert("Failed to assign lead.");
    }
  }

  async function handleConvert(lead: Lead) {
    if (
      !confirm(
        `Convert "${lead.name}" into a client? This will mark the lead as Won.`
      )
    )
      return;
    try {
      await convertLead(lead.id);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to convert lead.");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    try {
      await deleteLead(id);
      loadData();
    } catch {
      alert("Failed to delete lead.");
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
            <h1 className="text-xl font-bold text-gray-900">Leads</h1>
          </div>
          {canCreate && (
            <button
              onClick={() => {
                setEditingLead(null);
                setShowModal(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md"
            >
              + Add Lead
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
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md capitalize"
          >
            <option value="">All Sources</option>
            {SOURCES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Assigned To</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{lead.name}</p>
                      <p className="text-xs text-gray-500">{lead.email || "-"}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {lead.company || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 capitalize">
                      {lead.source}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {lead.estimated_value
                        ? Number(lead.estimated_value).toLocaleString()
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      {canUpdate && !lead.converted_to_client_id ? (
                        <select
                          value={lead.status}
                          onChange={(e) =>
                            handleStatusChange(lead.id, e.target.value)
                          }
                          className={`px-2 py-1 rounded-full text-xs border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                            STATUS_COLORS[lead.status]
                          }`}
                        >
                          {Object.entries(STATUS_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            STATUS_COLORS[lead.status]
                          }`}
                        >
                          {STATUS_LABELS[lead.status]}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {canAssign ? (
                        <select
                          value={lead.assigned_to ?? ""}
                          onChange={(e) =>
                            handleAssign(lead.id, Number(e.target.value))
                          }
                          className="border border-gray-300 rounded px-2 py-1 text-xs"
                        >
                          {users.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-gray-600 text-xs">
                          {lead.assignee?.name ?? "-"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                      {canConvert && !lead.converted_to_client_id && (
                        <button
                          onClick={() => handleConvert(lead)}
                          className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
                          title="Convert to Client"
                        >
                          Convert
                        </button>
                      )}
                      {lead.converted_to_client_id && (
                        <span className="text-xs text-green-600 mr-1">
                          ✓ Client
                        </span>
                      )}
                      {canUpdate && (
                        <button
                          onClick={() => {
                            setEditingLead(lead);
                            setShowModal(true);
                          }}
                          className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                        >
                          Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(lead.id)}
                          className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                      No leads found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {showModal && (
        <LeadModal
          lead={editingLead}
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

function LeadModal({
  lead,
  onClose,
  onSuccess,
}: {
  lead: Lead | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isEdit = !!lead;
  const [form, setForm] = useState<LeadPayload>({
    name: lead?.name ?? "",
    email: lead?.email ?? "",
    phone: lead?.phone ?? "",
    company: lead?.company ?? "",
    country: lead?.country ?? "",
    source: lead?.source ?? "website",
    notes: lead?.notes ?? "",
    estimated_value: lead?.estimated_value
      ? Number(lead.estimated_value)
      : undefined,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: keyof LeadPayload, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      if (isEdit && lead) {
        await updateLead(lead.id, form);
      } else {
        await createLead(form);
      }
      onSuccess();
    } catch (err: any) {
      const firstError = err.errors
        ? (Object.values(err.errors)[0] as string[])[0]
        : err.message;
      setError(firstError || "Failed to save lead.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50 overflow-y-auto py-8">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          {isEdit ? "Edit Lead" : "Add New Lead"}
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
          <Field label="Source *">
            <select className={inputCls} value={form.source}
              onChange={(e) => update("source", e.target.value)}>
              {SOURCES.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Estimated Value">
            <input type="number" className={inputCls}
              value={form.estimated_value ?? ""}
              onChange={(e) => update("estimated_value", Number(e.target.value))} />
          </Field>
          <Field label="Country">
            <input className={inputCls} value={form.country}
              onChange={(e) => update("country", e.target.value)} />
          </Field>
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
            {loading ? "Saving..." : isEdit ? "Update Lead" : "Create Lead"}
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