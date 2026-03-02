import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import organizationService from '../../services/organizationService';
import organizationMemberService from '../../services/oganizationMemberService';

interface Member {
  id: string;
  userId?: string;
  role?: string;
  email?: string;
  name?: string;
}

const OrganizationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [name, setName] = useState('');
  const [plan, setPlan] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await organizationService.getById(id);
        const data = res.data ?? res;
        const content = data.content ?? data;
        setName(content.name ?? content.Name ?? '');
        setPlan(content.plan ?? content.Plan ?? '');
      } catch (e) {
        setError('Could not load organization.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const fetchMembers = async () => {
      try {
        const res = await organizationMemberService.getAll(id);
        const data = res.data ?? res;
        const list = Array.isArray(data) ? data : data?.content ?? data?.items ?? [];
        setMembers(
          list.map((m: Record<string, unknown>) => ({
            id: String(m.id ?? m.Id ?? ''),
            userId: m.userId != null ? String(m.userId) : undefined,
            role: m.role != null ? String(m.role) : undefined,
            email: m.email != null ? String(m.email) : undefined,
            name: m.name != null ? String(m.name) : undefined,
          }))
        );
      } catch {
        setMembers([]);
      }
    };
    fetchMembers();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700 h-12 w-48 mb-6" />
        <div className="animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700 h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-red-500 dark:text-red-400">{error}</p>
        <Link to="/dashboard" className="text-primary hover:underline mt-2 inline-block">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary mb-6">
        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        Back to Dashboard
      </Link>
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-6 md:p-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 font-display">{name || 'Organization'}</h1>
        {plan && (
          <p className="text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider mb-6">{plan}</p>
        )}
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Members ({members.length})</h2>
        {members.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400">No members yet.</p>
        ) : (
          <ul className="space-y-3">
            {members.map((m) => (
              <li key={m.id} className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">person</span>
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{m.name || m.email || 'Member'}</p>
                  {m.role && <p className="text-xs text-slate-500 dark:text-slate-400">{m.role}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default OrganizationDetail;
