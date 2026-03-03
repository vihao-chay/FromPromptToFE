
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProjectStatus, Project, Activity } from '../../types';
import organizationService from '../../services/organizationService';
import projectService from '../../services/projectService';

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

const PREVIEW_CACHE_PREFIX = 'project_preview_';

const getLastPreviewHtml = (): string | null => {
  try { return localStorage.getItem('editor_last_preview_html'); } catch { return null; }
};

/** Preview for a specific project (from cache when API has no generatedHtml). */
const getProjectPreviewHtml = (projectId: string): string | null => {
  try { return localStorage.getItem(PREVIEW_CACHE_PREFIX + projectId); } catch { return null; }
};

/** Injects overflow:hidden into HTML so iframe preview shows only the top part, no scrollbar. */
const htmlForPreview = (raw: string): string => {
  const style = '<style>html,body{overflow:hidden !important;}</style>';
  if (/<head[\s>]/i.test(raw)) {
    return raw.replace(/<head([^>]*)>/i, `<head$1>${style}`);
  }
  return `<!DOCTYPE html><html><head><meta charset="utf-8">${style}</head><body>${raw}</body></html>`;
};

const mapApiProjectToProject = (p: {
  id?: string; Id?: string; name?: string; Name?: string; projectType?: string;
  createdAt?: string; CreatedAt?: string; generatedHtml?: string; GeneratedHtml?: string;
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
  };
};

const Dashboard: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const itemsPerPage = 4;

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await organizationService.getAll();
        const content = response.data?.content;
        const list = content?.totalItems ?? content?.TotalItems ?? (Array.isArray(content) ? content : []);
        const items = Array.isArray(list) ? list : [];
        setOrganizations(
          items.map((o: { id?: string; Id?: string; name?: string; Name?: string; organizationMembers?: unknown[] }) => ({
            id: (o.id ?? o.Id ?? '').toString(),
            name: String(o.name ?? o.Name ?? '').trim() || 'Unnamed organization',
            plan: (o as { plan?: string; Plan?: string }).plan ?? (o as { Plan?: string }).Plan,
            memberCount: Array.isArray((o as { organizationMembers?: unknown[] }).organizationMembers)
              ? (o as { organizationMembers: unknown[] }).organizationMembers.length
              : 0,
          }))
        );
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
        type RawProject = { id?: string; Id?: string; name?: string; Name?: string; projectType?: string; createdAt?: string; CreatedAt?: string; generatedHtml?: string; GeneratedHtml?: string };
        const raw: RawProject[] = [];
        results.forEach((res) => {
          const c = res.data?.content as { TotalItems?: RawProject[]; totalItems?: RawProject[] } | undefined;
          const items = Array.isArray(c?.TotalItems) ? c.TotalItems : Array.isArray(c?.totalItems) ? c.totalItems : [];
          items.forEach((p) => raw.push(p));
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
            to="/editor"
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
                return (
                  <Link key={org.id} to={`/organizations/${org.id}`}>
                    <div className="group flex items-center gap-4 p-4 bg-white dark:bg-[#1c2230] border border-slate-200 dark:border-slate-800 rounded-xl hover:border-primary/50 transition-all cursor-pointer shadow-sm hover:shadow-md">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${iconStyle.iconBg} ${iconStyle.iconColor}`}>
                        <span className="material-symbols-outlined">{iconStyle.icon}</span>
                      </div>
                      <div className="flex flex-col">
                        <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{org.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{org.memberCount ?? 0} members</p>
                      </div>
                    </div>
                  </Link>
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
            No projects yet. Generate code in the Editor and choose an organization to save — projects will appear here after refresh.
          </div>
        ) : recentProjects.map((project, projectIndex) => {
          const previewHtml = project.generatedHtml ?? getProjectPreviewHtml(project.id) ?? (projectIndex === 0 ? getLastPreviewHtml() : null);
          return (
          <div key={project.id} className="group flex flex-col bg-white dark:bg-[#1c2230] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-xl transition-all duration-300 min-h-0">
            <div className="relative aspect-video w-full min-h-0 flex-shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-900 rounded-t-2xl">
              {previewHtml ? (
                <div className="absolute inset-2 flex items-center justify-center overflow-hidden rounded-lg bg-slate-200/50 dark:bg-slate-800/50 min-h-0">
                  <div
                    className="shrink-0 max-w-full max-h-full"
                    style={{
                      width: '200%',
                      height: '200%',
                      transform: 'scale(0.5)',
                      transformOrigin: 'center center',
                    }}
                  >
                    <iframe
                      title="Preview"
                      srcDoc={htmlForPreview(previewHtml)}
                      className="w-full h-full border-0 pointer-events-none block rounded max-h-full"
                      sandbox="allow-same-origin"
                    />
                  </div>
                </div>
              ) : (
                <div
                  className="w-full h-full bg-center bg-no-repeat bg-cover transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url('${project.imageUrl}')` }}
                ></div>
              )}
              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Link to="/editor" className="bg-white text-primary px-4 py-2 rounded-lg font-bold text-sm shadow-xl">Open Editor</Link>
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
                    <Link to="/editor" className="text-primary hover:text-primary/70 font-bold text-sm">
                      {item.status === ProjectStatus.ARCHIVED ? 'Restore' : item.status === ProjectStatus.IN_PROGRESS ? 'Edit' : 'View'}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
