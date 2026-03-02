import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface Repo {
  id: string;
  name: string;
  url?: string;
  lastUpdated?: string;
  branch?: string;
}

const Repositories: React.FC = () => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const base = import.meta.env.VITE_API_BASE_URL || '';
        const url = `${base}/api/Repository`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
        });
        if (res.ok) {
          const data = await res.json();
          const list = data?.content ?? data?.items ?? (Array.isArray(data) ? data : []);
          setRepos(
            (Array.isArray(list) ? list : []).map((r: Record<string, unknown>, i: number) => ({
              id: String(r.id ?? r.Id ?? i),
              name: String(r.name ?? r.Name ?? (r as { repositoryName?: string }).repositoryName ?? 'Repository'),
              url: r.url != null ? String(r.url) : (r.htmlUrl != null ? String(r.htmlUrl) : undefined),
              lastUpdated: (r.updatedAt ?? r.lastUpdated) as string | undefined,
              branch: (r.defaultBranch ?? r.branch) as string | undefined,
            }))
          );
        }
      } catch {
        setRepos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRepos();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">Repositories</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Connected Git repositories for your projects.</p>
        </div>
        <Link
          to="/github-integration"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Connect repository
        </Link>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="animate-pulse h-14 bg-slate-100 dark:bg-slate-800" />
          <div className="animate-pulse h-14 bg-slate-100 dark:bg-slate-800" />
          <div className="animate-pulse h-14 bg-slate-100 dark:bg-slate-800" />
        </div>
      ) : repos.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-12 text-center">
          <span className="material-symbols-outlined text-4xl text-slate-400 dark:text-slate-500 mb-4">folder</span>
          <p className="text-slate-600 dark:text-slate-400">No repositories connected.</p>
          <Link to="/github-integration" className="inline-flex items-center gap-2 mt-4 text-primary font-medium hover:underline">
            Connect GitHub
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <ul className="divide-y divide-slate-200 dark:divide-slate-700">
            {repos.map((repo) => (
              <li key={repo.id} className="flex items-center justify-between gap-4 px-4 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">code</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate">{repo.name}</p>
                    {repo.branch && <p className="text-xs text-slate-500 dark:text-slate-400">{repo.branch}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {repo.url && (
                    <a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                      Open
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Repositories;
