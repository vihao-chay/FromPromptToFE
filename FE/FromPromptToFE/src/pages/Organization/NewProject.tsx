import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import projectService, { getContent } from '../../services/projectService';
import organizationService from '../../services/organizationService';
import authService, { getMyOrganizations, UserOrganizationDto } from '../../services/authService';
import changeLogService from '../../services/changeLogService';

const ONBOARDING_STORAGE_KEY = 'onboardingComplete';
const NEW_PROJECT_ORG_KEY = 'newProjectOrganizationId';

const NewProject: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const stateOrgId = (location.state as { organizationId?: string } | null)?.organizationId;
  const fromOnboarding = (location.state as { fromOnboarding?: boolean } | null)?.fromOnboarding;
  const storedOrgId = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(NEW_PROJECT_ORG_KEY) : null;
  const initialOrgId = stateOrgId ?? storedOrgId ?? '';

  const [organizationId, setOrganizationId] = useState<string>(initialOrgId);
  const [myOrgs, setMyOrgs] = useState<UserOrganizationDto[]>([]);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrgs = async () => {
      try {
        const meRes = await authService.getMe();
        const content = getContent(meRes.data) as { id?: string; Id?: string } | undefined;
        const userId = content?.id ?? content?.Id;
        if (!userId) { setLoading(false); return; }

        const orgs = await getMyOrganizations(String(userId));
        setMyOrgs(orgs);

        // If we already have an orgId from state/storage, keep it; otherwise pick the first one
        const preselected = stateOrgId ?? storedOrgId ?? '';
        if (preselected && orgs.some(o => o.organizationId === preselected)) {
          setOrganizationId(preselected);
        } else if (orgs.length > 0) {
          setOrganizationId(orgs[0].organizationId);
          sessionStorage.setItem(NEW_PROJECT_ORG_KEY, orgs[0].organizationId);
        }
      } catch {
        // fallback — try loading single org if we have an id
        if (initialOrgId) {
          try {
            const res = await organizationService.getById(initialOrgId);
            const c = getContent(res.data) as { name?: string; Name?: string; id?: string; Id?: string } | undefined;
            setMyOrgs([{
              organizationId: initialOrgId,
              organizationName: c?.name ?? c?.Name ?? 'Unnamed',
              role: 'Owner',
            }]);
          } catch { /* ignore */ }
        }
      } finally {
        setLoading(false);
      }
    };
    loadOrgs();
  }, [stateOrgId, storedOrgId, initialOrgId]);

  const MIN_PROJECT_NAME = 3;
  const MAX_PROJECT_NAME = 200;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedName = name.trim();
    if (trimmedName.length < MIN_PROJECT_NAME) {
      setError(`Project name must be at least ${MIN_PROJECT_NAME} characters.`);
      return;
    }
    if (trimmedName.length > MAX_PROJECT_NAME) {
      setError(`Project name must be at most ${MAX_PROJECT_NAME} characters.`);
      return;
    }
    if (!organizationId) {
      setError('Please select an organization.');
      return;
    }
    setSubmitting(true);
    try {
      const createRes = await projectService.create({
        organizationId,
        name: trimmedName,
        projectType: 'Draft',
      });
      const created = getContent(createRes.data) as { id?: string; Id?: string } | undefined;
      const projectId = created?.id ?? (created as { Id?: string })?.Id;
      if (projectId && organizationId) {
        changeLogService.create({ organizationId, entityType: 'Project', entityId: projectId, action: 'Create' }).catch(() => {});
      }
      sessionStorage.removeItem(NEW_PROJECT_ORG_KEY);
      sessionStorage.setItem(ONBOARDING_STORAGE_KEY, '1');
      if (fromOnboarding) {
        navigate(projectId ? `/editor?projectId=${encodeURIComponent(projectId)}` : '/editor', { replace: true });
      } else {
        navigate(projectId ? `/editor?projectId=${encodeURIComponent(projectId)}` : '/dashboard', { replace: true });
      }
    } catch (err) {
      const e = err as { response?: { data?: Record<string, unknown>; status?: number }; message?: string };
      const data = e.response?.data;
      let msg = 'Could not create project. Please try again.';
      if (data != null && typeof data === 'object') {
        const m = (data as { message?: string }).message ?? (data as { Message?: string }).Message;
        if (typeof m === 'string' && m.trim()) msg = m;
      }
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary mb-6"
      >
        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        Back to Dashboard
      </Link>
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-6 md:p-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display mb-2">New project</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
          {fromOnboarding
            ? 'Name your first project. You will then be taken to the Code Gen page.'
            : 'Create a project in your organization.'}
        </p>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <span className="material-symbols-outlined animate-spin text-primary text-3xl">refresh</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="orgSelect" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Organization
              </label>
              {myOrgs.length === 0 ? (
                <p className="text-sm text-red-500 dark:text-red-400">
                  You are not in any organization yet. Please <Link to="/new-organization" className="text-primary underline">create an organization</Link> first.
                </p>
              ) : (
                <select
                  id="orgSelect"
                  value={organizationId}
                  onChange={(e) => {
                    setOrganizationId(e.target.value);
                    sessionStorage.setItem(NEW_PROJECT_ORG_KEY, e.target.value);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                >
                  {myOrgs.map((org) => (
                    <option key={org.organizationId} value={org.organizationId}>
                      {org.organizationName?.trim() || 'Unnamed'} ({org.role})
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Project name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="e.g. Landing page, Dashboard..."
                minLength={MIN_PROJECT_NAME}
                maxLength={MAX_PROJECT_NAME}
              />
            </div>
            {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting || !organizationId}
                className="px-6 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 disabled:opacity-50"
              >
                {submitting ? 'Creating…' : 'Create project'}
              </button>
              <Link
                to="/dashboard"
                className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default NewProject;
