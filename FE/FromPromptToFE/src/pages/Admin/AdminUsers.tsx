import React, { useEffect, useState, useCallback } from 'react';
import adminService, { AdminUser } from '../../services/adminService';

const PAGE_SIZE = 20;

const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [totalRow, setTotalRow] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async (currentPage: number, currentSearch: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await adminService.getUsers({
                search: currentSearch || undefined,
                pageIndex: currentPage,
                pageSize: PAGE_SIZE,
            });
            const data = res.data.content;
            setUsers(data.totalItems);
            setTotalRow(data.totalRow);
        } catch {
            setError('Failed to load users.');
        } finally {
            setLoading(false);
        }
    }, []);

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
            // Update locally without re-fetching
            setUsers(prev =>
                prev.map(u => u.id === user.id ? { ...u, isVerified: !u.isVerified, isActive: !u.isActive } : u)
            );
        } catch {
            setError('Failed to toggle user status.');
        } finally {
            setTogglingId(null);
        }
    };

    const totalPages = Math.ceil(totalRow / PAGE_SIZE);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-1">
                        User Management
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        {totalRow.toLocaleString()} users total
                    </p>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-64">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                        search
                    </span>
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1c2230] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1c2230]">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/50">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">User</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Provider</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Role</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Joined</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {loading ? (
                            [1, 2, 3, 4, 5].map(i => (
                                <tr key={i}>
                                    <td colSpan={6} className="px-6 py-4">
                                        <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                                    </td>
                                </tr>
                            ))
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
                                    No users found.
                                </td>
                            </tr>
                        ) : users.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                {/* User */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        {user.avatarUrl ? (
                                            <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                                                <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-base">person</span>
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="font-medium text-slate-900 dark:text-white text-sm truncate">
                                                {user.name || '—'}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                                        </div>
                                    </div>
                                </td>

                                {/* Provider */}
                                <td className="px-6 py-4">
                                    <span className="text-sm text-slate-600 dark:text-slate-300 capitalize">{user.provider}</span>
                                </td>

                                {/* Status */}
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${user.isActive
                                            ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                        }`}>
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>

                                {/* Role */}
                                <td className="px-6 py-4">
                                    {user.isAdmin ? (
                                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary">
                                            Admin
                                        </span>
                                    ) : (
                                        <span className="text-sm text-slate-500 dark:text-slate-400">User</span>
                                    )}
                                </td>

                                {/* Joined */}
                                <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                    {user.createdAt
                                        ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                                        : '—'}
                                </td>

                                {/* Action */}
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleToggleStatus(user)}
                                        disabled={togglingId === user.id}
                                        className={`text-sm font-semibold transition-colors ${user.isActive
                                                ? 'text-red-500 hover:text-red-600'
                                                : 'text-green-600 hover:text-green-700'
                                            } disabled:opacity-40 disabled:cursor-not-allowed`}
                                    >
                                        {togglingId === user.id
                                            ? '...'
                                            : user.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                </td>
                            </tr>
                        ))}
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
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            <span className="material-symbols-outlined text-base">chevron_left</span>
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            <span className="material-symbols-outlined text-base">chevron_right</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
