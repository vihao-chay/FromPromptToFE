
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProjectStatus, Project, Activity } from '../../types';
import organizationService from '../../services/organizationService';
import projectService from '../../services/projectService';
import organizationMemberService from '../../services/oganizationMemberService';
import changeLogService from '../../services/changeLogService';

interface Organization {
  id: string;
  name: string;
  plan?: string;
  memberCount?: number;
}

const ICON_STYLES = [
  { icon: "school", iconBg: "bg-indigo-100 dark:bg-indigo-900/30", iconColor: "text-indigo-600 dark:text-indigo-400" },
  { icon: "rocket_launch", iconBg: "bg-pink-100 dark:bg-pink-900/30", iconColor: "text-pink-600 dark:text-pink-400" },
  { icon: "code", iconBg: "bg-blue-100 dark:bg-primary/20", iconColor: "text-blue-600 dark:text-primary" },
  { icon: "design_services", iconBg: "bg-orange-100 dark:bg-orange-900/30", iconColor: "text-orange-600 dark:text-orange-400" },
  { icon: "work", iconBg: "bg-purple-100 dark:bg-purple-900/30", iconColor: "text-purple-600 dark:text-purple-400" },
  { icon: "groups", iconBg: "bg-cyan-100 dark:bg-cyan-900/30", iconColor: "text-cyan-600 dark:text-cyan-400" },
];

const PLACEHOLDER_IMAGE = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240"><rect fill="%23e2e8f0" width="400" height="240"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-family="sans-serif" font-size="14">Project</text></svg>');

/** Draft: no generated UI yet — show draft placeholder. */
const DRAFT_PLACEHOLDER = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240"><rect fill="%231e293b" width="400" height="240"/><text x="50%" y="42%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-family="sans-serif" font-size="16" font-weight="600">Draft</text><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="%23647b8b" font-family="sans-serif" font-size="12">No preview yet</text></svg>'
);
/** Completed but no preview data — show generic completed placeholder. */
const COMPLETED_PLACEHOLDER = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240"><rect fill="%231e3a5f" width="400" height="240"/><text x="50%" y="48%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-family="sans-serif" font-size="14">Generated</text></svg>'
);

const PREVIEW_CACHE_PREFIX = 'project_preview_';

/** Preview for a specific project only (API or localStorage cache). Do not use editor_last_preview_html for cards. */
const getProjectPreviewHtml = (projectId: string): string | null => {
  try { return localStorage.getItem(PREVIEW_CACHE_PREFIX + projectId); } catch { return null; }
};

/** Viewport width for thumbnail — content lays out at this width so preview looks crisp. */
const PREVIEW_VIEWPORT_WIDTH = 400;

/** Injects viewport + styles so iframe preview looks sharp (no scrollbar, clean thumbnail). */
const htmlForPreview = (raw: string): string => {
  const style = `<meta name="viewport" content="width=${PREVIEW_VIEWPORT_WIDTH}, initial-scale=1">
<style>
  html, body { overflow: hidden !important; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
  body { width: ${PREVIEW_VIEWPORT_WIDTH}px; min-width: ${PREVIEW_VIEWPORT_WIDTH}px; max-width: ${PREVIEW_VIEWPORT_WIDTH}px; box-sizing: border-box; }
  * { box-sizing: border-box; }
</style>`;
  if (/<head[\s>]/i.test(raw)) {
    return raw.replace(/<head([^>]*)>/i, `<head$1>${style}`);
  }
  return `<!DOCTYPE html><html><head><meta charset="utf-8">${style}</head><body>${raw}</body></html>`;
};

const mapApiProjectToProject = (p: {
  id?: string; Id?: string; name?: string; Name?: string; projectType?: string;
  createdAt?: string; CreatedAt?: string; generatedHtml?: string; GeneratedHtml?: string;
  organizationId?: string; OrganizationId?: string;
}): Project => {
  const status = (p.projectType === 'Generated' || p.projectType === 'Completed') ? ProjectStatus.COMPLETED : (p.projectType === 'Draft' ? ProjectStatus.DRAFT : ProjectStatus.ACTIVE);
  const created = p.createdAt ?? p.CreatedAt ?? '';
  const dateStr = created ? (() => { try { return new Date(created).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }); } catch { return created; } })() : '';
  return {
    id: String(p.id ?? p.Id ?? ''),
    name: String(p.name ?? p.Name ?? 'Unnamed'),
    status,
    createdAt: dateStr,
    imageUrl: PLACEHOLDER_IMAGE,
    generatedHtml: p.generatedHtml ?? p.GeneratedHtml ?? undefined,
    organizationId: p.organizationId ?? p.OrganizationId ?? undefined,
  };
};

const Dashboard: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const itemsPerPage = 4;
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<{ type: 'org'; id: string; name: string; plan?: string } | { type: 'project'; id: string; name: string; organizationId?: string } | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'org'; id: string; name: string } | { type: 'project'; id: string; name: string; organizationId?: string } | null>(null);
  const [confirmOrg, setConfirmOrg] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await organizationService.getAll();
        const content = response.data?.content;
        const list = content?.totalItems ?? content?.TotalItems ?? (Array.isArray(content) ? content : []);
        const items = Array.isArray(list) ? list : [];

        const orgsWithMembers = await Promise.all(
          items.map(async (o: any) => {
            const orgId = (o.id ?? o.Id ?? '').toString();
            let count = 0;
            try {
              const mRes = await organizationMemberService.getAll(orgId);
              const mData = mRes.data ?? mRes;
              const mContent = mData.content ?? mData;
              const mList = Array.isArray(mContent) ? mContent : (mContent?.totalItems ?? mContent?.items ?? []);
              count = mContent?.totalRow ?? mList.length;
            } catch (err) {
              // fallback count to 0 if failed
            }

            return {
              id: orgId,
              name: String(o.name ?? o.Name ?? '').trim() || 'Unnamed organization',
              plan: o.plan ?? o.Plan,
              memberCount: count,
            };
          })
        );

        setOrganizations(orgsWithMembers);
      } catch (error) {
        console.error('Error fetching organizations:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (organizations.length === 0) {
      setProjectsLoading(false);
      setAllProjects([]);
      return;
    }
    setProjectsLoading(true);
    const orgIds = organizations.map((o) => o.id);
    Promise.all(orgIds.map((id) => projectService.getAll({ organizationId: id, pageIndex: 1, pageSize: 100 })))
      .then((results) => {
        type RawProject = { id?: string; Id?: string; name?: string; Name?: string; projectType?: string; createdAt?: string; CreatedAt?: string; generatedHtml?: string; GeneratedHtml?: string; organizationId?: string; OrganizationId?: string };
        const raw: RawProject[] = [];
        results.forEach((res, idx) => {
          const orgId = orgIds[idx];
          const c = res.data?.content as { TotalItems?: RawProject[]; totalItems?: RawProject[] } | undefined;
          const items = Array.isArray(c?.TotalItems) ? c.TotalItems : Array.isArray(c?.totalItems) ? c.totalItems : [];
          items.forEach((p) => raw.push({ ...p, organizationId: p.organizationId ?? p.OrganizationId ?? orgId, OrganizationId: p.OrganizationId ?? orgId }));
        });
        raw.sort((a, b) => {
          const t1 = a.createdAt ?? a.CreatedAt ?? '';
          const t2 = b.createdAt ?? b.CreatedAt ?? '';
          return new Date(t2).getTime() - new Date(t1).getTime();
        });
        setAllProjects(raw.map(mapApiProjectToProject));
      })
      .catch(() => setAllProjects([]))
      .finally(() => setProjectsLoading(false));
  }, [organizations]);

  const totalPages = Math.ceil(organizations.length / itemsPerPage);
  const displayedOrganizations = organizations.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  const getIconStyle = (index: number) => ICON_STYLES[index % ICON_STYLES.length];

  const recentProjects = allProjects.slice(0, 12);
  const activityList: Activity[] = allProjects.map((p) => ({ id: p.id, name: p.name, date: p.createdAt, status: p.status }));

  const openEditModal = (target: { type: 'org'; id: string; name: string; plan?: string } | { type: 'project'; id: string; name: string }) => {
    setEditTarget(target);
    setEditName(target.name);
    setMenuOpen(null);
  };

  const saveEditName = () => {
    if (!editTarget || !editName.trim()) return;
    if (editTarget.type === 'org') {
      organizationService.update(editTarget.id, editName.trim(), editTarget.plan ?? '').then(() => {
        setOrganizations((prev) => prev.map((o) => (o.id === editTarget.id ? { ...o, name: editName.trim() } : o)));
        changeLogService.create({ organizationId: editTarget.id, entityType: 'Organization', entityId: editTarget.id, action: 'Update' }).catch(() => {});
      }).catch(() => { }).finally(() => { setEditTarget(null); setEditName(''); });
    } else {
      const orgId = editTarget.organizationId ?? allProjects.find((p) => p.id === editTarget.id)?.organizationId;
      projectService.update(editTarget.id, { name: editName.trim() }).then(() => {
        setAllProjects((prev) => prev.map((p) => (p.id === editTarget.id ? { ...p, name: editName.trim() } : p)));
        if (orgId) changeLogService.create({ organizationId: orgId, entityType: 'Project', entityId: editTarget.id, action: 'Update' }).catch(() => {});
      }).catch(() => { }).finally(() => { setEditTarget(null); setEditName(''); });
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'org') {
      organizationService.delete(deleteTarget.id).then(() => {
        setOrganizations((prev) => prev.filter((o) => o.id !== deleteTarget.id));
        changeLogService.create({ organizationId: deleteTarget.id, entityType: 'Organization', entityId: deleteTarget.id, action: 'Delete' }).catch(() => {});
      }).catch(() => { }).finally(() => { setDeleteTarget(null); setMenuOpen(null); });
    } else {
      const orgId = deleteTarget.organizationId ?? allProjects.find((p) => p.id === deleteTarget.id)?.organizationId;
      projectService.delete(deleteTarget.id).then(() => {
        setAllProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        if (orgId) changeLogService.create({ organizationId: orgId, entityType: 'Project', entityId: deleteTarget.id, action: 'Delete' }).catch(() => {});
      }).catch(() => { }).finally(() => { setDeleteTarget(null); setMenuOpen(null); });
    }
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.ACTIVE: return 'bg-green-500/10 text-green-500 border-green-500/20';
      case ProjectStatus.DRAFT: return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case ProjectStatus.COMPLETED: return 'bg-primary/10 text-primary border-primary/20';
      case ProjectStatus.ARCHIVED: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
      case ProjectStatus.STABLE: return 'bg-primary/10 text-primary';
      case ProjectStatus.IN_PROGRESS: return 'bg-amber-500/10 text-amber-600';
      default: return 'bg-slate-500/10 text-slate-500';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Heading & CTA */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2 font-display">Your Projects</h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
            Manage and generate your modern frontend components using AI. Select a project to continue building or start a fresh design.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/new-organization"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-all active:scale-95"
          >
            <span className="material-symbols-outlined">group_add </span>
            <span>Create Organization</span>
          </Link>
          <Link
            to="/new-project"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined">add_circle</span>
            <span>Create New Project</span>
          </Link>
        </div>
      </div>

      <div className="mb-12">
        {/* Section Header Organizations*/}
        <h3 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-900 dark:text-white">
          <span className="material-symbols-outlined text-primary">groups</span>
          My Organizations
        </h3>

        {/* Organization Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <span className="material-symbols-outlined animate-spin text-primary text-3xl">refresh</span>
          </div>
        ) : organizations.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            No organizations found. Create your first organization!
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {displayedOrganizations.map((org, index) => {
                const iconStyle = getIconStyle(currentPage * itemsPerPage + index);
                const isMenuOpen = menuOpen === 'org-' + org.id;
                return (
                  <div key={org.id} className="group relative flex items-center gap-4 p-4 bg-white dark:bg-[#1c2230] border border-slate-200 dark:border-slate-800 rounded-xl hover:border-primary/50 transition-all shadow-sm hover:shadow-md">
                    <button onClick={() => setConfirmOrg({ id: org.id, name: org.name })} className="flex items-center gap-4 flex-1 min-w-0 text-left">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${iconStyle.iconBg} ${iconStyle.iconColor}`}>
                        <span className="material-symbols-outlined">{iconStyle.icon}</span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate">{org.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{org.memberCount ?? 0} members</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setMenuOpen(isMenuOpen ? null : 'org-' + org.id); }}
                      className="flex-shrink-0 p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
                      aria-label="Menu"
                    >
                      <span className="material-symbols-outlined text-[20px]">more_vert</span>
                    </button>
                    {isMenuOpen && (
                      <div className="absolute right-2 top-full mt-1 z-20 py-1 min-w-[120px] bg-white dark:bg-[#1c2230] border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg">
                        <button type="button" onClick={() => openEditModal({ type: 'org', id: org.id, name: org.name, plan: org.plan })} className="w-full px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-t-lg flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                          Rename
                        </button>
                        <button type="button" onClick={() => { setDeleteTarget({ type: 'org', id: org.id, name: org.name }); setMenuOpen(null); }} className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-b-lg flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination Arrows */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 0}
                  className={`p-2 rounded-lg border transition-all ${currentPage === 0
                    ? 'border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                    : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-primary/50'
                    }`}
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {currentPage + 1} / {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages - 1}
                  className={`p-2 rounded-lg border transition-all ${currentPage === totalPages - 1
                    ? 'border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                    : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-primary/50'
                    }`}
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>


      {/* Section Header Projects*/}
      <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
        <h3 className="text-xl font-bold flex items-center gap-2 font-display">
          <span className="material-symbols-outlined text-primary">grid_view</span>
          Recent Projects
        </h3>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-md bg-slate-100 dark:bg-slate-800 text-primary">
            <span className="material-symbols-outlined">grid_view</span>
          </button>
          <button className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <span className="material-symbols-outlined">format_list_bulleted</span>
          </button>
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {projectsLoading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-pulse">
              <div className="aspect-video bg-slate-200 dark:bg-slate-700" />
              <div className="p-5 space-y-2">
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
              </div>
            </div>
          ))
        ) : recentProjects.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500 dark:text-slate-400">
            No projects yet. Create a new project (draft) with the button above, or generate code in the Editor — drafts and generated projects will appear here.
          </div>
        ) : recentProjects.map((project) => {
          const previewHtml = project.generatedHtml ?? getProjectPreviewHtml(project.id);
          const placeholderUrl = project.status === ProjectStatus.DRAFT
            ? DRAFT_PLACEHOLDER
            : project.status === ProjectStatus.COMPLETED
              ? COMPLETED_PLACEHOLDER
              : PLACEHOLDER_IMAGE;
          return (
            <div key={project.id} className="group relative flex flex-col bg-white dark:bg-[#1c2230] border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-primary/40 hover:shadow-xl transition-all duration-300 min-h-0">
              <div className="relative aspect-video w-full min-h-0 flex-shrink-0 overflow-hidden bg-slate-900">
                {previewHtml ? (
                  <div className="absolute inset-0 overflow-hidden min-h-0 min-w-0">
                    <div
                      className="absolute left-1/2 top-1/2 w-[200%] h-[200%] origin-center"
                      style={{
                        transform: 'translate(-50%, -50%) scale(0.5)',
                      }}
                    >
                      <iframe
                        title="Preview"
                        srcDoc={htmlForPreview(previewHtml)}
                        className="w-full h-full border-0 pointer-events-none block bg-white dark:bg-slate-900"
                        sandbox="allow-same-origin"
                      />
                    </div>
                  </div>
                ) : (
                  <div
                    className="w-full h-full bg-center bg-no-repeat bg-cover transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url('${placeholderUrl}')` }}
                  />
                )}
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Link to={`/editor${project.id ? `?projectId=${encodeURIComponent(project.id)}` : ''}`} className="bg-white text-primary px-4 py-2 rounded-lg font-bold text-sm shadow-xl">Open Editor</Link>
                </div>
              </div>
              <div className="p-4 flex flex-col gap-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-snug line-clamp-2 flex-1 min-w-0">{project.name}</h4>
                  <span className={`flex-shrink-0 px-2 py-0.5 rounded-md text-[10px] font-medium uppercase ${getStatusColor(project.status)}`}>{project.status}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  {project.createdAt}
                </p>
              </div>
            </div>
          );
        })
        }
      </div>

      {/* Activity Table */}
      <div className="mt-16">
        <h3 className="text-xl font-bold flex items-center gap-2 mb-6 font-display">
          <span className="material-symbols-outlined text-primary">history</span>
          All Activity
        </h3>
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1c2230]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Project Name</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Created Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {activityList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    No activity yet. Generate and save a project to see it here.
                  </td>
                </tr>
              ) : activityList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{item.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/editor${item.id ? `?projectId=${encodeURIComponent(item.id)}` : ''}`} className="text-primary hover:text-primary/70 font-bold text-sm">
                      {item.status === ProjectStatus.ARCHIVED ? 'Restore' : item.status === ProjectStatus.IN_PROGRESS || item.status === ProjectStatus.DRAFT ? 'Edit' : 'View'}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rename modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => { setEditTarget(null); setEditName(''); }}>
          <div className="bg-white dark:bg-[#1c2230] rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
            <h4 className="font-semibold text-slate-800 dark:text-white mb-3">{editTarget.type === 'org' ? 'Rename organization' : 'Rename project'}</h4>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              placeholder={editTarget.type === 'org' ? 'Organization name' : 'Project name'}
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" onClick={() => { setEditTarget(null); setEditName(''); }} className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium">
                Cancel
              </button>
              <button type="button" onClick={saveEditName} className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 text-sm font-medium">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white dark:bg-[#1c2230] rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
            <h4 className="font-semibold text-slate-800 dark:text-white mb-3">
              {deleteTarget.type === 'org' ? 'Delete organization' : 'Delete project'}
            </h4>
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
              {deleteTarget.type === 'org'
                ? 'Are you sure you want to delete this organization?'
                : 'Are you sure you want to delete this project?'}
            </p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium">
                Cancel
              </button>
              <button type="button" onClick={confirmDelete} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-medium">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Navigate Modal */}
      {confirmOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmOrg(null)}>
          <div className="bg-white dark:bg-[#1c2230] rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
              Confirm
            </h4>
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 leading-relaxed">
              Are you sure you want to navigate to Organization <strong className="text-slate-900 dark:text-white">"{confirmOrg.name}"</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmOrg(null)} className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors">
                No
              </button>
              <Link to={`/organizations/${confirmOrg.id}`} className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 text-sm font-medium transition-colors">
                Yes
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
