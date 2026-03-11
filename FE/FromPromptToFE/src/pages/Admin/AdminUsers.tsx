import React, { useEffect, useState, useCallback } from "react";
import adminService, { AdminUser } from "../../services/adminService";
import CreateUserModal from "./CreateUserModal";
import EditUserModal from "./EditUserModal";

const PAGE_SIZE = 20;

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalRow, setTotalRow] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Bulk Delete
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const fetchUsers = useCallback(
    async (currentPage: number, currentSearch: string) => {
      setLoading(true);
      setError(null);
      setSelectedIds([]); // clear selection on fetch
      try {
        const res = await adminService.getUsers({
          search: currentSearch || undefined,
          pageIndex: currentPage,
          pageSize: PAGE_SIZE,
        });
        const data = res.data.content;
        const items = (data.totalItems || []).map((u: any) => ({
          ...u,
          avatarUrl: u.avatarUrl ?? u.AvatarUrl ?? null,
        }));
        setUsers(items);
        setTotalRow(data.totalRow);
      } catch {
        setError("Failed to load users.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Initial load + page change
  useEffect(() => {
    fetchUsers(page, search);
  }, [page, search, fetchUsers]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setSearch(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleToggleStatus = async (user: AdminUser) => {
    setTogglingId(user.id);
    try {
      await adminService.toggleUserStatus(user.id);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, isActive: !u.isActive } : u,
        ),
      );
    } catch {
      setError("Failed to toggle user status.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${user.email}? This action cannot be undone.`,
      )
    )
      return;
    setDeletingId(user.id);
    setError(null);
    try {
      await adminService.deleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setTotalRow((prev) => prev - 1);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete user.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIds.length} users? This action cannot be undone.`,
      )
    )
      return;
    setBulkDeleting(true);
    setError(null);
    try {
      await adminService.deleteUsersBulk(selectedIds);
      setUsers((prev) => prev.filter((u) => !selectedIds.includes(u.id)));
      setTotalRow((prev) => Math.max(0, prev - selectedIds.length));
      setSelectedIds([]);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to delete selected users.",
      );
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleSelectToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id],
    );
  };

  const totalPages = Math.ceil(totalRow / PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-1">
            User Management
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            {totalRow.toLocaleString()} users total
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              search
            </span>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1c2230] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 justify-center px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Create User
          </button>
        </div>
      </div>

      {/* Bulk Actions Header */}
      <div
        className={`transition-all duration-300 overflow-hidden ${selectedIds.length > 0 ? "h-14 mb-4 opacity-100" : "h-0 mb-0 opacity-0"}`}
      >
        <div className="flex items-center justify-between px-4 py-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded-lg">
          <span className="text-sm font-bold text-red-600 dark:text-red-400">
            {selectedIds.length}{" "}
            {(selectedIds.length || 0) > 1 ? "users" : "user"} selected
          </span>
          <button
            onClick={handleBulkDelete}
            disabled={bulkDeleting}
            className="text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-1.5 text-xs font-bold rounded-md transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
            {bulkDeleting ? "Deleting..." : "Delete Selected"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Table - horizontal scroll when wide */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1c2230]">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/50">
              <th className="px-4 py-4 w-12 text-center">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedIds(
                      users.length > 0 && selectedIds.length === users.length
                        ? []
                        : users.map((u) => u.id),
                    )
                  }
                  className="inline-flex items-center justify-center w-5 h-5 rounded-md border-2 border-slate-400 dark:border-slate-500 cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                  style={
                    users.length > 0 && selectedIds.length === users.length
                      ? {
                          backgroundColor: "#2563eb",
                          borderColor: "#fff",
                          boxShadow: "0 0 0 1px rgba(255,255,255,0.5)",
                        }
                      : undefined
                  }
                >
                  {users.length > 0 && selectedIds.length === users.length && (
                    <span
                      className="material-symbols-outlined text-white text-sm"
                      style={{ fontSize: 14 }}
                    >
                      check
                    </span>
                  )}
                </button>
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                User
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                Provider
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                Role
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                Joined
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {loading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  <td colSpan={7} className="px-6 py-4">
                    <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-10 text-center text-slate-500 dark:text-slate-400"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className={`transition-colors ${selectedIds.includes(user.id) ? "bg-blue-500/5" : "hover:bg-slate-50/50 dark:hover:bg-slate-800/30"}`}
                >
                  <td className="px-4 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleSelectToggle(user.id)}
                      className="inline-flex items-center justify-center w-5 h-5 rounded-md border-2 border-slate-400 dark:border-slate-500 cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                      style={
                        selectedIds.includes(user.id)
                          ? {
                              backgroundColor: "#2563eb",
                              borderColor: "#fff",
                              boxShadow: "0 0 0 1px rgba(255,255,255,0.5)",
                            }
                          : undefined
                      }
                    >
                      {selectedIds.includes(user.id) && (
                        <span
                          className="material-symbols-outlined text-white text-sm"
                          style={{ fontSize: 14 }}
                        >
                          check
                        </span>
                      )}
                    </button>
                  </td>
                  {/* User name/email */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-9 h-9 rounded-full bg-slate-100 dark:bg-[#282e39] border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 ring-2 ring-inset ring-slate-200/50 dark:ring-slate-700/50">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt=""
                            className="w-full h-full object-cover rounded-full absolute inset-0"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                              (e.target as HTMLImageElement)
                                .closest("div")
                                ?.querySelector("[data-avatar-fallback]")
                                ?.classList.remove("hidden");
                            }}
                          />
                        ) : null}
                        <span
                          className={
                            user.avatarUrl
                              ? "hidden font-bold text-slate-400 text-sm"
                              : "font-bold text-slate-400 text-sm"
                          }
                          data-avatar-fallback
                        >
                          {(user.name || user.email).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">
                          {user.name || "No Name"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Provider */}
                  <td className="px-6 py-4">
                    <span className="text-xs px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium capitalize">
                      {user.provider}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    {user.isActive ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        Banned
                      </span>
                    )}
                  </td>

                  {/* Role */}
                  <td className="px-6 py-4">
                    {user.isAdmin ? (
                      <span className="text-xs px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold tracking-wide">
                        ADMIN
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        User
                      </span>
                    )}
                  </td>

                  {/* Joined Date */}
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3 text-sm">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        disabled={togglingId === user.id}
                        className="font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors disabled:opacity-40"
                      >
                        {togglingId === user.id
                          ? "..."
                          : user.isActive
                            ? "Ban"
                            : "Unban"}
                      </button>
                      <button
                        onClick={() => setEditingUser(user)}
                        className="font-bold text-blue-500 hover:text-blue-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        disabled={deletingId === user.id}
                        className="font-bold text-red-500 hover:text-red-600 transition-colors disabled:opacity-40"
                      >
                        {deletingId === user.id ? "..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Page {page} of {totalPages} ({totalRow.toLocaleString()} users)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <span className="material-symbols-outlined text-base">
                chevron_left
              </span>
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <span className="material-symbols-outlined text-base">
                chevron_right
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onUserCreated={() => {
          setIsCreateModalOpen(false);
          fetchUsers(page, search);
        }}
      />

      <EditUserModal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        user={editingUser}
        onUserUpdated={(updatedData) => {
          setUsers((prev) =>
            prev.map((u) =>
              u.id === editingUser?.id ? { ...u, ...updatedData } : u,
            ),
          );
        }}
      />
    </div>
  );
};

export default AdminUsers;
