"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, hasPermission, User } from "@/services/auth";
import { getUsers, getRoles, updateUserRole, toggleUserStatus, deleteUser, createUser, Role } from "@/services/users";
import {
  pageShellCls,
  PageHeader,
  PageMain,
  PrimaryButton,
  SecondaryButton,
  RowAction,
  inputCls,
  Field,
  SearchInput,
  Modal,
  ErrorBanner,
  EmptyState,
  SkeletonTable,
  Avatar,
  tableWrapCls,
  theadCls,
  thCls,
  tdCls,
  trCls,
  IconPlus,
  IconTrash,
  IconCheck,
  IconX,
} from "@/components/ui/kit";

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  const canCreate = hasPermission("users.create");
  const canUpdate = hasPermission("users.update");
  const canDelete = hasPermission("users.delete");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [usersData, rolesData] = await Promise.all([getUsers(search), getRoles()]);
      setUsers(usersData.data);
      setRoles(rolesData);
    } catch (err: any) {
      setError(err.message || "Failed to load users. You may not have access.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    if (!hasPermission("users.view")) {
      setError("You do not have permission to view users.");
      setLoading(false);
      return;
    }
    loadData();
  }, [router, loadData]);

  async function handleRoleChange(userId: number, roleId: number) {
    try {
      await updateUserRole(userId, roleId);
      loadData();
    } catch {
      alert("Failed to update role.");
    }
  }

  async function handleToggle(userId: number) {
    try {
      await toggleUserStatus(userId);
      loadData();
    } catch {
      alert("Failed to toggle status.");
    }
  }

  async function handleDelete(userId: number) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(userId);
      loadData();
    } catch {
      alert("Failed to delete user.");
    }
  }

  if (!mounted) return null;

  return (
    <div className={pageShellCls}>
      <PageHeader
        title="User Management"
        backHref="/dashboard"
        action={
          canCreate && (
            <PrimaryButton onClick={() => setShowModal(true)}>
              <IconPlus />
              Add User
            </PrimaryButton>
          )
        }
      />

      <PageMain>
        <div className="mb-4 flex flex-wrap gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name or email..." />
        </div>

        {error && <ErrorBanner message={error} />}

        {loading ? (
          <SkeletonTable rows={6} />
        ) : (
          <div className={tableWrapCls}>
            <table className="w-full text-sm">
              <thead className={theadCls}>
                <tr>
                  <th className={thCls}>Name</th>
                  <th className={thCls}>Email</th>
                  <th className={thCls}>Role</th>
                  <th className={thCls}>Status</th>
                  <th className={`${thCls} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className={trCls}>
                    <td className={tdCls}>
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} />
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className={`${tdCls} text-[#5B5F6E]`}>{user.email}</td>
                    <td className={tdCls}>
                      {canUpdate ? (
                        <select
                          value={user.role_id ?? ""}
                          onChange={(e) => handleRoleChange(user.id, Number(e.target.value))}
                          className={`${inputCls} w-auto py-1.5 text-xs`}
                        >
                          {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.display_name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-[#5B5F6E]">{user.role_relation?.display_name ?? user.role}</span>
                      )}
                    </td>
                    <td className={tdCls}>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          user.is_active ? "bg-[#E7F5F0] text-[#127A5D]" : "bg-[#FDEBEA] text-[#C23B34]"
                        }`}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className={`${tdCls} text-right`}>
                      <div className="flex justify-end gap-1.5">
                        {canUpdate && (
                          <RowAction
                            onClick={() => handleToggle(user.id)}
                            icon={user.is_active ? <IconX className="h-3.5 w-3.5" /> : <IconCheck />}
                          >
                            {user.is_active ? "Deactivate" : "Activate"}
                          </RowAction>
                        )}
                        {canDelete && (
                          <RowAction onClick={() => handleDelete(user.id)} variant="danger" icon={<IconTrash />}>
                            Delete
                          </RowAction>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-2">
                      <EmptyState message="No users found." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </PageMain>

      {showModal && (
        <AddUserModal
          roles={roles}
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

function AddUserModal({ roles, onClose, onSuccess }: { roles: Role[]; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role_id: roles[0]?.id ?? 0,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      await createUser({
        name: form.name,
        email: form.email,
        password: form.password,
        role_id: Number(form.role_id),
      });
      onSuccess();
    } catch (err: any) {
      const firstError = err.errors ? (Object.values(err.errors)[0] as string[])[0] : err.message;
      setError(firstError || "Failed to create user.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      title="Add New User"
      onClose={onClose}
      footer={
        <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Create User"}
          </PrimaryButton>
        </>
      }
    >
      {error && <ErrorBanner message={error} />}

      <div className="space-y-3">
        <Field label="Full Name">
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Email">
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Password">
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Min 8 characters"
            className={inputCls}
          />
        </Field>
        <Field label="Role">
          <select
            value={form.role_id}
            onChange={(e) => setForm({ ...form, role_id: Number(e.target.value) })}
            className={inputCls}
          >
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.display_name}
              </option>
            ))}
          </select>
        </Field>
      </div>
    </Modal>
  );
}