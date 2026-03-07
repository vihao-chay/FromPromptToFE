import React, { useEffect, useState, useCallback } from 'react';
import adminService, { AdminProject } from '../../services/adminService';
import ProjectPreviewModal from './ProjectPreviewModal';

const PAGE_SIZE = 20;

const AdminProjects: React.FC = () => {
    const [projects, setProjects] = useState<AdminProject[]>([]);
    const [totalRow, setTotalRow] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Single item deletion
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Bulk Delete
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [bulkDeleting, setBulkDeleting] = useState(false);

    // Preview Modal
    const [previewProjectId, setPreviewProjectId] = useState<string | null>(null);

    const fetchProjects = useCallback(async (currentPage: number, currentSearch: string) => {
        setLoading(true);
        setError(null);
        setSelectedIds([]);
        try {
            const res = await adminService.getProjects({
                search: currentSearch || undefined,
                pageIndex: currentPage,
                pageSize: PAGE_SIZE,
            });
            const data = res.data.content;
            setProjects(data.totalItems);
            setTotalRow(data.totalRow);
        } catch {
            setError('Failed to load projects.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects(page, search);
    }, [page, search, fetchProjects]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            setSearch(searchInput);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const handleDelete = async (project: AdminProject) => {
        if (!window.confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
        setDeletingId(project.id);
        setError(null);
        try {
            await adminService.deleteProject(project.id);
            // Remove from local list + update count
            setProjects(prev => prev.filter(p => p.id !== project.id));
            setTotalRow(prev => prev - 1);
        } catch {
            setError('Failed to delete project.');
        } finally {
            setDeletingId(null);
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} projects? This action cannot be undone.`)) return;
        setBulkDeleting(true);
        setError(null);
        try {
            await adminService.deleteProjectsBulk(selectedIds);
            setProjects(prev => prev.filter(p => !selectedIds.includes(p.id)));
            setTotalRow(prev => Math.max(0, prev - selectedIds.length));
            setSelectedIds([]);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete selected projects.');
        } finally {
            setBulkDeleting(false);
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(projects.map(p => p.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectToggle = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
        );
    };

    const totalPages = Math.ceil(totalRow / PAGE_SIZE);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-1">
                        Project Monitor
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        {totalRow.toLocaleString()} projects across all organizations
                    </p>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-64">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                        search
                    </span>
                    <input
                        type="text"
                        placeholder="Search by name or org..."
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1c2230] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
            </div>

            {/* Bulk Actions Header */}
            <div className={`transition-all duration-300 overflow-hidden ${selectedIds.length > 0 ? 'h-14 mb-4 opacity-100' : 'h-0 mb-0 opacity-0'}`}>
                <div className="flex items-center justify-between px-4 py-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded-lg">
                    <span className="text-sm font-bold text-red-600 dark:text-red-400">
                        {selectedIds.length} {(selectedIds.length || 0) > 1 ? 'projects' : 'project'} selected
                    </span>
                    <button
                        onClick={handleBulkDelete}
                        disabled={bulkDeleting}
                        className="text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-1.5 text-xs font-bold rounded-md transition-colors flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">delete</span>
                        {bulkDeleting ? 'Deleting...' : 'Delete Selected'}
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1c2230]">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/50">
                            <th className="px-4 py-4 w-12 text-center">
                                <input
                                    type="checkbox"
                                    className="rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                                    onChange={handleSelectAll}
                                    checked={projects.length > 0 && selectedIds.length === projects.length}
                                />
                            </th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Project</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Organization</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Type</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Code</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Created</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {loading ? (
                            [1, 2, 3, 4, 5].map(i => (
                                <tr key={i}>
                                    <td colSpan={7} className="px-6 py-4">
                                        <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                                    </td>
                                </tr>
                            ))
                        ) : projects.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
                                    No projects found.
                                </td>
                            </tr>
                        ) : projects.map(project => (
                            <tr key={project.id} className={`transition-colors ${selectedIds.includes(project.id) ? 'bg-primary/5' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'}`}>
                                {/* Checkbox */}
                                <td className="px-4 py-4 text-center">
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                                        checked={selectedIds.includes(project.id)}
                                        onChange={() => handleSelectToggle(project.id)}
                                    />
                                </td>

                                {/* Project name */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-base">folder</span>
                                        </div>
                                        <p className="font-medium text-slate-900 dark:text-white text-sm truncate max-w-[160px]">
                                            {project.name}
                                        </p>
                                    </div>
                                </td>

                                {/* Organization */}
                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                    {project.organizationName || '—'}
                                </td>

                                {/* Type */}
                                <td className="px-6 py-4">
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium capitalize">
                                        {project.projectType}
                                    </span>
                                </td>

                                {/* Generated code badge */}
                                <td className="px-6 py-4">
                                    {project.hasGeneratedCode ? (
                                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-medium">
                                            <span className="material-symbols-outlined text-[12px]">check_circle</span>
                                            Generated
                                        </span>
                                    ) : (
                                        <span className="text-xs text-slate-400">—</span>
                                    )}
                                </td>

                                {/* Created */}
                                <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                    {project.createdAt
                                        ? new Date(project.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                                        : '—'}
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-3 text-sm">
                                        <button
                                            onClick={() => setPreviewProjectId(project.id)}
                                            className="font-semibold text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1"
                                            title="Preview Project & Prompts"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                                            Preview
                                        </button>
                                        <button
                                            onClick={() => handleDelete(project)}
                                            disabled={deletingId === project.id}
                                            className="font-semibold text-red-500 hover:text-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">delete</span>
                                            {deletingId === project.id ? '...' : 'Delete'}
                                        </button>
                                    </div>
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
                        Page {page} of {totalPages} ({totalRow.toLocaleString()} projects)
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

            {/* Preview Modal */}
            <ProjectPreviewModal
                isOpen={!!previewProjectId}
                onClose={() => setPreviewProjectId(null)}
                projectId={previewProjectId}
            />
        </div>
    );
};

export default AdminProjects;
