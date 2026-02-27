import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import changeLogService, { type ChangeLogDto } from '../../services/changeLogService';

interface LogEntry {
  id: string;
  title: string;
  description?: string;
  date: string;
  type: 'deploy' | 'edit' | 'create' | 'api';
}

const actionToType = (action: string): LogEntry['type'] => {
  const a = (action || '').toLowerCase();
  if (a === 'create') return 'create';
  if (a === 'update' || a === 'edit') return 'edit';
  if (a === 'deploy') return 'deploy';
  return 'api';
};

const ChangeLogs: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    changeLogService.getAll({ pageIndex: 1, pageSize: 50 })
      .then((res) => {
        const content = res.data?.content;
        const list = content?.TotalItems ?? content?.totalItems ?? (Array.isArray(content) ? content : []);
        const items = (Array.isArray(list) ? list : []) as (ChangeLogDto & { Id?: string; Action?: string; EntityType?: string; CreatedAt?: string })[];
        setLogs(
          items.map((l, i) => ({
            id: String(l.id ?? l.Id ?? i),
            title: `${l.action ?? l.Action ?? 'Update'} ${l.entityType ?? l.EntityType ?? 'Item'}`,
            description: l.entityId ? `Entity ID: ${l.entityId}` : undefined,
            date: l.createdAt ?? l.CreatedAt ?? new Date().toISOString(),
            type: actionToType(l.action ?? l.Action ?? ''),
          }))
        );
      })
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  const typeIcon: Record<LogEntry['type'], string> = {
    deploy: 'rocket_launch',
    edit: 'edit',
    create: 'add_circle',
    api: 'code',
  };

  const typeColor: Record<LogEntry['type'], string> = {
    deploy: 'bg-green-500/20 text-green-600 dark:text-green-400',
    edit: 'bg-primary/20 text-primary',
    create: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
    api: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
  };

  const formatDate = (d: string) => {
    try {
      const date = new Date(d);
      return date.toLocaleDateString(undefined, { dateStyle: 'medium' }) + ' ' + date.toLocaleTimeString(undefined, { timeStyle: 'short' });
    } catch {
      return d;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">Change Logs</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Timeline of project and deployment changes.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700 h-24 w-full" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-12 text-center">
          <span className="material-symbols-outlined text-4xl text-slate-400 dark:text-slate-500 mb-4">history</span>
          <p className="text-slate-600 dark:text-slate-400">No change logs yet.</p>
          <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">Deploy or edit projects to see activity here.</p>
          <Link to="/editor" className="inline-flex items-center gap-2 mt-4 text-primary font-medium hover:underline">
            Go to Editor
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-700" />
          <ul className="space-y-0">
            {logs.map((log) => (
              <li key={log.id} className="relative flex gap-4 pb-8 last:pb-0">
                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${typeColor[log.type]}`}>
                  <span className="material-symbols-outlined text-[20px]">{typeIcon[log.type]}</span>
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="font-semibold text-slate-900 dark:text-white">{log.title}</p>
                  {log.description && <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{log.description}</p>}
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{formatDate(log.date)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ChangeLogs;
