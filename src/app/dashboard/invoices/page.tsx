"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isAuthenticated, hasPermission } from "@/services/auth";
import { getClientsList, ClientOption } from "@/services/domains";
import {
  getInvoices,
  getInvoicesByClient,
  createInvoice,
  updateInvoice,
  markInvoicePaid,
  deleteInvoice,
  Invoice,
  InvoicePayload,
  ClientInvoiceSummary,
} from "@/services/invoices";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  viewed: "bg-indigo-100 text-indigo-700",
  paid: "bg-green-100 text-green-700",
  unpaid: "bg-amber-100 text-amber-700",
  overdue: "bg-red-100 text-red-700",
  cancelled: "bg-gray-200 text-gray-500",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  sent: "Sent",
  viewed: "Viewed",
  paid: "Paid",
  unpaid: "Unpaid",
  overdue: "Overdue",
  cancelled: "Cancelled",
};

export default function InvoicesPage() {
  const router = useRouter();
  const [clientSummaries, setClientSummaries] = useState<ClientInvoiceSummary[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientInvoiceSummary | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [mounted, setMounted] = useState(false);

  const canCreate = hasPermission("invoices.create");
  const canUpdate = hasPermission("invoices.update");
  const canDelete = hasPermission("invoices.delete");

  const loadSummaries = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getInvoicesByClient();
      setClientSummaries(data);
    } catch (err: any) {
      setError(err.message || "Failed to load clients.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadInvoices = useCallback(async () => {
    if (!selectedClient) return;
    setLoading(true);
    setError("");
    try {
      const data = await getInvoices(
        search,
        statusFilter,
        overdueOnly,
        selectedClient.id
      );
      setInvoices(data.data);
    } catch (err: any) {
      setError(err.message || "Failed to load invoices.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, overdueOnly, selectedClient]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    if (!hasPermission("invoices.view")) {
      setError("You do not have permission to view invoices.");
      setLoading(false);
      return;
    }
    if (selectedClient) {
      loadInvoices();
    } else {
      loadSummaries();
    }
    getClientsList().then(setClients).catch(() => {});
  }, [router, selectedClient, loadInvoices, loadSummaries]);

  function openClient(summary: ClientInvoiceSummary) {
    setSearch("");
    setStatusFilter("");
    setOverdueOnly(false);
    setSelectedClient(summary);
  }

  function backToClients() {
    setSelectedClient(null);
    loadSummaries();
  }

  async function handleMarkPaid(invoice: Invoice) {
    if (!confirm(`Mark ${invoice.invoice_number} as fully paid?`)) return;
    try {
      await markInvoicePaid(invoice.id);
      loadInvoices();
    } catch (err: any) {
      alert(err.message || "Failed to mark as paid.");
    }
  }

  async function handleDelete(invoice: Invoice) {
    if (!confirm(`Delete invoice ${invoice.invoice_number}?`)) return;
    try {
      await deleteInvoice(invoice.id);
      loadInvoices();
    } catch (err: any) {
      alert(err.message || "Failed to delete invoice.");
    }
  }

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {selectedClient ? (
              <button
                onClick={backToClients}
                className="text-gray-500 hover:text-gray-900"
              >
                Back to Clients
              </button>
            ) : (
              <Link
                href="/dashboard"
                className="text-gray-500 hover:text-gray-900"
              >
                Back
              </Link>
            )}
            <h1 className="text-xl font-bold text-gray-900">
              {selectedClient
                ? `Invoices — ${selectedClient.name}`
                : "Invoices by Client"}
            </h1>
          </div>
          {canCreate && (
            <button
              onClick={() => {
                setEditingInvoice(null);
                setShowModal(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md"
            >
              + New Invoice
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* ================= CLIENTS VIEW ================= */}
        {!selectedClient && (
          <>
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {clientSummaries.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => openClient(c)}
                    className="text-left bg-white rounded-lg shadow hover:shadow-md transition p-5"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {c.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {c.company || "-"}
                        </p>
                      </div>
                      {c.overdue_count > 0 && (
                        <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">
                          {c.overdue_count} overdue
                        </span>
                      )}
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-lg font-bold text-gray-900">
                          {c.invoices_count}
                        </p>
                        <p className="text-xs text-gray-500">Invoices</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-green-600">
                          ${c.paid_amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">Paid</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-amber-600">
                          ${c.pending_amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">Pending</p>
                      </div>
                    </div>
                  </button>
                ))}
                {clientSummaries.length === 0 && (
                  <p className="text-gray-400 col-span-full text-center py-8">
                    No invoices yet. Create your first invoice!
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {/* ================= INVOICES VIEW (client selected) ================= */}
        {selectedClient && (
          <>
            <div className="mb-4 flex flex-wrap gap-3 items-center">
              <input
                type="text"
                placeholder="Search by invoice #..."
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
                  checked={overdueOnly}
                  onChange={(e) => setOverdueOnly(e.target.checked)}
                  className="rounded"
                />
                Overdue only
              </label>
            </div>

            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3">Invoice #</th>
                      <th className="px-4 py-3">Issue Date</th>
                      <th className="px-4 py-3">Due Date</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {invoice.invoice_number}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {invoice.issue_date?.slice(0, 10)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={
                              invoice.is_overdue
                                ? "text-red-600 font-medium"
                                : "text-gray-600"
                            }
                          >
                            {invoice.due_date?.slice(0, 10)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">
                            ${Number(invoice.total).toFixed(2)}
                          </p>
                          {invoice.balance_due > 0 &&
                            invoice.status !== "cancelled" && (
                              <p className="text-xs text-gray-500">
                                Due: ${invoice.balance_due.toFixed(2)}
                              </p>
                            )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              invoice.is_overdue && invoice.status !== "paid"
                                ? STATUS_COLORS.overdue
                                : STATUS_COLORS[invoice.status]
                            }`}
                          >
                            {invoice.is_overdue && invoice.status !== "paid"
                              ? "Overdue"
                              : STATUS_LABELS[invoice.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                          {canUpdate && invoice.status !== "paid" && (
                            <button
                              onClick={() => handleMarkPaid(invoice)}
                              className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
                            >
                              Mark Paid
                            </button>
                          )}
                          {canUpdate && invoice.status !== "paid" && (
                            <button
                              onClick={() => {
                                setEditingInvoice(invoice);
                                setShowModal(true);
                              }}
                              className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                            >
                              Edit
                            </button>
                          )}
                          {canDelete && invoice.status !== "paid" && (
                            <button
                              onClick={() => handleDelete(invoice)}
                              className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                            >
                              Delete
                            </button>
                          )}
                          {invoice.status === "paid" && (
                            <span className="text-xs text-green-600">Paid</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {invoices.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-8 text-center text-gray-400"
                        >
                          No invoices found for this client.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>

      {showModal && (
        <InvoiceModal
          invoice={editingInvoice}
          clients={clients}
          defaultClientId={selectedClient?.id}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            if (selectedClient) {
              loadInvoices();
            } else {
              loadSummaries();
            }
          }}
        />
      )}
    </div>
  );
}

function InvoiceModal({
  invoice,
  clients,
  defaultClientId,
  onClose,
  onSuccess,
}: {
  invoice: Invoice | null;
  clients: ClientOption[];
  defaultClientId?: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isEdit = !!invoice;
  const [form, setForm] = useState<InvoicePayload>({
    client_id: invoice?.client_id ?? defaultClientId ?? clients[0]?.id ?? 0,
    issue_date:
      invoice?.issue_date?.slice(0, 10) ??
      new Date().toISOString().slice(0, 10),
    due_date: invoice?.due_date?.slice(0, 10) ?? "",
    subtotal: invoice ? Number(invoice.subtotal) : 0,
    tax: invoice ? Number(invoice.tax) : 0,
    discount: invoice ? Number(invoice.discount) : 0,
    status: invoice?.status ?? "draft",
    notes: invoice?.notes ?? "",
    terms: invoice?.terms ?? "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const total = (form.subtotal || 0) + (form.tax || 0) - (form.discount || 0);

  function update(field: keyof InvoicePayload, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      if (isEdit && invoice) {
        await updateInvoice(invoice.id, form);
      } else {
        await createInvoice(form);
      }
      onSuccess();
    } catch (err: any) {
      const firstError = err.errors
        ? (Object.values(err.errors)[0] as string[])[0]
        : err.message;
      setError(firstError || "Failed to save invoice.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50 overflow-y-auto py-8">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          {isEdit ? `Edit ${invoice?.invoice_number}` : "New Invoice"}
        </h2>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <Field label="Client *">
              <select
                className={inputCls}
                value={form.client_id}
                onChange={(e) => update("client_id", Number(e.target.value))}
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.company ? `(${c.company})` : ""}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Issue Date *">
            <input
              type="date"
              className={inputCls}
              value={form.issue_date}
              onChange={(e) => update("issue_date", e.target.value)}
            />
          </Field>
          <Field label="Due Date *">
            <input
              type="date"
              className={inputCls}
              value={form.due_date}
              onChange={(e) => update("due_date", e.target.value)}
            />
          </Field>
          <Field label="Subtotal ($) *">
            <input
              type="number"
              step="0.01"
              className={inputCls}
              value={form.subtotal}
              onChange={(e) => update("subtotal", Number(e.target.value))}
            />
          </Field>
          <Field label="Tax ($)">
            <input
              type="number"
              step="0.01"
              className={inputCls}
              value={form.tax}
              onChange={(e) => update("tax", Number(e.target.value))}
            />
          </Field>
          <Field label="Discount ($)">
            <input
              type="number"
              step="0.01"
              className={inputCls}
              value={form.discount}
              onChange={(e) => update("discount", Number(e.target.value))}
            />
          </Field>
          <Field label="Status">
            <select
              className={inputCls}
              value={form.status}
              onChange={(e) => update("status", e.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="unpaid">Unpaid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <textarea
                className={inputCls}
                rows={2}
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
              />
            </Field>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-md flex justify-between items-center">
          <span className="text-sm text-gray-600">Total</span>
          <span className="text-xl font-bold text-gray-900">
            ${total.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
          >
            {loading ? "Saving..." : isEdit ? "Update Invoice" : "Create Invoice"}
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
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}