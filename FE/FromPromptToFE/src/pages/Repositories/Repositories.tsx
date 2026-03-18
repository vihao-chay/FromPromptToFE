import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import codeService, { type CodeDto, type CodeFilter } from '../../services/codeService';

const Repositories: React.FC = () => {
  const [items, setItems] = useState<CodeDto[]>([]);
  const [totalRow, setTotalRow] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [searchParam, setSearchParam] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params: CodeFilter = { pageIndex, pageSize };
      if (statusFilter) params.status = statusFilter;
      if (searchParam) params.search = searchParam;
      const result = await codeService.getAll(params);
      setItems(result.totalItems);
      setTotalRow(result.totalRow);
    } catch {
      setItems([]);
      setTotalRow(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [pageIndex, statusFilter, searchParam]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParam(search.trim());
    setPageIndex(1);
  };

  const totalPages = Math.max(1, Math.ceil(totalRow / pageSize));
  const from = (pageIndex - 1) * pageSize + 1;
  const to = Math.min(pageIndex * pageSize, totalRow);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">Code records</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Data from code table (Supabase) via BE API.</p>
        </div>
        <Link
          to="/github-integration"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Connect repository
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-0">
          <input
            type="text"
            placeholder="Search by repo, project, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-0 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <button type="submit" className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-600">
            Search
          </button>
        </form>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPageIndex(1); }}
          className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="Success">Success</option>
          <option value="Failure">Failure</option>
        </select>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="animate-pulse h-14 bg-slate-100 dark:bg-slate-800" />
          <div className="animate-pulse h-14 bg-slate-100 dark:bg-slate-800" />
          <div className="animate-pulse h-14 bg-slate-100 dark:bg-slate-800" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-12 text-center">
          <span className="material-symbols-outlined text-4xl text-slate-400 dark:text-slate-500 mb-4">code</span>
          <p className="text-slate-600 dark:text-slate-400">No code records yet. Data is from API /api/codes (code table).</p>
          <button onClick={() => load()} className="mt-4 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90">
            Refresh
          </button>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <th className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Project / Repo</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Branch</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Description</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Created</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Links</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row) => (
                    <tr key={row.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{row.projectName || row.repoName || '—'}</p>
                          {row.repoName && row.projectName !== row.repoName && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">{row.repoName}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{row.branchName || '—'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            row.status === 'Success'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : row.status === 'Failure'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {row.status || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 max-w-[200px] truncate" title={row.description ?? ''}>
                        {row.description || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                        {row.createdAt ? new Date(row.createdAt).toLocaleString('vi-VN') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {row.prLink && (
                            <a href={row.prLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                              PR
                            </a>
                          )}
                          {row.downloadLink && (
                            <a href={row.downloadLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                              Download
                            </a>
                          )}
                          {!row.prLink && !row.downloadLink && '—'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Showing {from}–{to} of {totalRow}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
                  disabled={pageIndex <= 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPageIndex((p) => Math.min(totalPages, p + 1))}
                  disabled={pageIndex >= totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Repositories;
