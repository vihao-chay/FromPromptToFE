import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import authService, { getMyOrganizations } from '../services/authService';
import projectService, { getContent } from '../services/projectService';

const ONBOARDING_STORAGE_KEY = 'onboardingComplete';

type Status = 'checking' | 'no-org' | 'no-project' | 'ready' | 'error' | 'unauthorized';

/** Always verify against API/DB (JWT). Do not trust sessionStorage — if user has no org in DB, redirect to create org. */
const RequireOnboarding: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<Status>('checking');
  const [firstOrgId, setFirstOrgId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const meRes = await authService.getMe();
        const content = getContent(meRes?.data) as { id?: string; Id?: string } | undefined;
        const userId = content?.id ?? content?.Id;
        if (cancelled) return;
        if (!userId) {
          sessionStorage.removeItem(ONBOARDING_STORAGE_KEY);
          setStatus('ready');
          return;
        }

        const orgsRaw = await getMyOrganizations(String(userId));
        const orgs = Array.isArray(orgsRaw) ? orgsRaw : [];
        if (cancelled) return;

        if (orgs.length === 0) {
          sessionStorage.removeItem(ONBOARDING_STORAGE_KEY);
          setStatus('no-org');
          return;
        }

        const orgId = orgs[0].organizationId;
        setFirstOrgId(orgId);

        const projectsRes = await projectService.getAll({ organizationId: orgId, pageIndex: 1, pageSize: 1 });
        const projContent = getContent(projectsRes?.data) as { TotalItems?: unknown[]; totalItems?: unknown[] } | undefined;
        const list = Array.isArray(projContent?.TotalItems) ? projContent.TotalItems : Array.isArray(projContent?.totalItems) ? projContent.totalItems : [];
        const hasProjects = Array.isArray(list) && list.length > 0;

        if (cancelled) return;
        if (!hasProjects) {
          sessionStorage.removeItem(ONBOARDING_STORAGE_KEY);
          setStatus('no-project');
          return;
        }

        sessionStorage.setItem(ONBOARDING_STORAGE_KEY, '1');
        setStatus('ready');
      } catch (err) {
        if (cancelled) return;
        const statusCode = (err as { response?: { status?: number } })?.response?.status;
        if (statusCode === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.dispatchEvent(new Event('auth-logout'));
          setStatus('unauthorized');
          return;
        }
        setStatus('error');
      }
    };

    if (status === 'checking') check();
    return () => { cancelled = true; };
  }, [status]);

  if (status === 'checking') {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-pulse text-slate-500 dark:text-slate-400">Checking...</div>
      </div>
    );
  }

  if (status === 'no-org') {
    return <Navigate to="/new-organization" replace state={{ fromOnboarding: true }} />;
  }

  if (status === 'no-project' && firstOrgId) {
    return <Navigate to="/new-project" replace state={{ organizationId: firstOrgId, fromOnboarding: true }} />;
  }

  if (status === 'unauthorized') {
    return <Navigate to="/login" replace />;
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-2">
        <p className="text-slate-600 dark:text-slate-400">Could not verify your organizations. Please try again.</p>
        <button
          type="button"
          className="px-3 py-1.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
          onClick={() => setStatus('checking')}
        >
          Retry
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export default RequireOnboarding;
