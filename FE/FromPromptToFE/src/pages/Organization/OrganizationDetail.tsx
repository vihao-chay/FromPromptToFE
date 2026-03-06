import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import organizationService from '../../services/organizationService';
import organizationMemberService from '../../services/oganizationMemberService';
import projectService from '../../services/projectService';
import authService from '../../services/authService';
import { getContent } from '../../services/projectService';

interface Member {
  id: string;
  organizationId?: string;
  userId?: string;
  userName?: string | null;
  userEmail?: string;
  userAvatar?: string | null;
  role?: string;
  createdAt?: string;
}

interface OrgProject {
  id: string;
  name: string;
  projectType?: string;
  createdAt?: string;
}

const OrganizationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [name, setName] = useState('');
  const [plan, setPlan] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Current user role in this org
  const [currentUserRole, setCurrentUserRole] = useState<string>('');

  // Invite states
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<{ type: 'success' | 'error' | '', text: string }>({ type: '', text: '' });
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Edit role states
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [editRoleLoading, setEditRoleLoading] = useState(false);
  const [editRoleMessage, setEditRoleMessage] = useState<{ type: 'success' | 'error' | '', text: string }>({ type: '', text: '' });
  const [newRole, setNewRole] = useState<string>('Member');

  // Projects states
  const [projects, setProjects] = useState<OrgProject[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  const isPersonal = plan?.toLowerCase() === 'personal';
  const isOwner = currentUserRole === 'Owner';

  // Fetch current user to determine role
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const meRes = await authService.getMe();
        const content = getContent(meRes.data) as { id?: string; Id?: string } | undefined;
        const userId = content?.id ?? content?.Id;
        if (userId) {
          // We'll match userId against member list later
          // Store it for now
          (window as any).__currentUserId = String(userId);
        }
      } catch { /* ignore */ }
    };
    fetchCurrentUser();
  }, []);

  const fetchMembers = useCallback(async () => {
    if (!id) return;
    try {
      const res = await organizationMemberService.getAll(id);
      const data = res.data ?? res;
      const content = data.content ?? data;
      const list = Array.isArray(content) ? content : (content?.totalItems ?? content?.items ?? []);
      const total = content?.totalRow ?? list.length;
      setTotalMembers(total);

      const mappedMembers = list.map((m: any) => ({
        id: String(m.id ?? m.Id ?? ''),
        organizationId: m.organizationId,
        userId: m.userId,
        userName: m.userName,
        userEmail: m.userEmail,
        userAvatar: m.userAvatar,
        role: m.role,
        createdAt: m.createdAt,
      }));
      setMembers(mappedMembers);

      // Determine current user's role in this org
      const currentUserId = (window as any).__currentUserId;
      if (currentUserId) {
        const me = mappedMembers.find((m: Member) => m.userId === currentUserId);
        if (me) setCurrentUserRole(me.role || '');
      }
    } catch {
      setMembers([]);
      setTotalMembers(0);
    }
  }, [id]);

  // Fetch projects for this org
  const fetchProjects = useCallback(async () => {
    if (!id) return;
    setProjectsLoading(true);
    try {
      const res = await projectService.getAll({ organizationId: id, pageIndex: 1, pageSize: 100 });
      const c = res.data?.content as any;
      const items = Array.isArray(c?.TotalItems) ? c.TotalItems : Array.isArray(c?.totalItems) ? c.totalItems : [];
      setProjects(
        items.map((p: any) => ({
          id: String(p.id ?? p.Id ?? ''),
          name: String(p.name ?? p.Name ?? 'Unnamed'),
          projectType: p.projectType,
          createdAt: p.createdAt ?? p.CreatedAt,
        }))
      );
    } catch {
      setProjects([]);
    } finally {
      setProjectsLoading(false);
    }
  }, [id]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !inviteEmail.trim()) return;
    try {
      setInviteLoading(true);
      setInviteMessage({ type: '', text: '' });
      await organizationMemberService.addMember(id, inviteEmail, 'Member');
      setInviteMessage({ type: 'success', text: 'Đã gửi lời mời thành công!' });
      setInviteEmail('');
      await fetchMembers();
      setTimeout(() => {
        setIsInviteModalOpen(false);
        setInviteMessage({ type: '', text: '' });
      }, 1500);
    } catch (err: any) {
      setInviteMessage({ type: 'error', text: err?.response?.data?.message || err?.message || 'Không thể gửi lời mời.' });
    } finally {
      setInviteLoading(false);
    }
  };

  const handleEditRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMember) return;
    try {
      setEditRoleLoading(true);
      setEditRoleMessage({ type: '', text: '' });
      await organizationMemberService.updateMember(editMember.id, newRole);
      setEditRoleMessage({ type: 'success', text: 'Cập nhật quyền thành công!' });
      await fetchMembers();
      setTimeout(() => {
        setEditMember(null);
        setEditRoleMessage({ type: '', text: '' });
      }, 1500);
    } catch (err: any) {
      setEditRoleMessage({ type: 'error', text: err?.response?.data?.message || err?.message || 'Không thể cập nhật quyền.' });
    } finally {
      setEditRoleLoading(false);
    }
  };

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
    fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

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

      {/* Organization Info */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-6 md:p-8 mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 font-display">{name || 'Organization'}</h1>
        {plan && (
          <p className="text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider mb-6">{plan}</p>
        )}

        {/* Members Section */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Members ({totalMembers})</h2>
          {/* Hide Invite button for PERSONAL plan */}
          {!isPersonal && (
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              Invite member
            </button>
          )}
        </div>
        {members.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400">No members yet.</p>
        ) : (
          <ul className="space-y-3">
            {members.map((m) => (
              <li key={m.id} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0 group">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden shrink-0">
                    {m.userAvatar ? (
                      <img src={m.userAvatar} alt="avatar" className="h-full w-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-primary">person</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{m.userName || m.userEmail || 'Member'}</p>
                    <div className="flex items-center gap-2">
                      {m.userEmail && m.userName && <p className="text-xs text-slate-500 dark:text-slate-400">{m.userEmail}</p>}
                      {m.role && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {m.role}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {/* Only Owner can edit member roles */}
                {isOwner && (
                  <button
                    onClick={() => {
                      setEditMember(m);
                      setNewRole(m.role || 'Member');
                    }}
                    className="p-1.5 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 group-hover:bg-slate-100 dark:group-hover:bg-slate-800 hover:text-primary transition-all"
                    title="Edit Role"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Projects Section */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-6 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            <span className="material-symbols-outlined text-primary align-middle mr-1">folder</span>
            Projects ({projects.length})
          </h2>
          <Link
            to="/new-project"
            state={{ organizationId: id }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Project
          </Link>
        </div>
        {projectsLoading ? (
          <div className="flex items-center justify-center py-8">
            <span className="material-symbols-outlined animate-spin text-primary text-3xl">refresh</span>
          </div>
        ) : projects.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400">No projects yet.</p>
        ) : (
          <ul className="space-y-2">
            {projects.map((p) => {
              const dateStr = p.createdAt
                ? (() => { try { return new Date(p.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }); } catch { return ''; } })()
                : '';
              return (
                <li key={p.id}>
                  <Link
                    to={`/editor?projectId=${encodeURIComponent(p.id)}`}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary/40 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary text-[20px]">code</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 dark:text-white text-sm truncate group-hover:text-primary transition-colors">{p.name}</p>
                        <div className="flex items-center gap-2">
                          {p.projectType && (
                            <span className="text-[10px] uppercase font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                              {p.projectType}
                            </span>
                          )}
                          {dateStr && <span className="text-xs text-slate-400">{dateStr}</span>}
                        </div>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-primary text-[18px]">arrow_forward</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Modal mời thành viên */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Mời thành viên mới</h3>
                <button
                  onClick={() => {
                    setIsInviteModalOpen(false);
                    setInviteMessage({ type: '', text: '' });
                    setInviteEmail('');
                  }}
                  className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label htmlFor="inviteEmail" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email address
                  </label>
                  <input
                    id="inviteEmail"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Nhập email..."
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    required
                    disabled={inviteLoading}
                  />
                </div>
                {inviteMessage.text && (
                  <div className={`p-3 rounded-lg text-sm ${inviteMessage.type === 'error' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'}`}>
                    {inviteMessage.text}
                  </div>
                )}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsInviteModalOpen(false);
                      setInviteMessage({ type: '', text: '' });
                      setInviteEmail('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={inviteLoading || !inviteEmail.trim()}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {inviteLoading && <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>}
                    Mời thành viên
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Role */}
      {editMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Chỉnh sửa quyền</h3>
                <button
                  onClick={() => {
                    setEditMember(null);
                    setEditRoleMessage({ type: '', text: '' });
                  }}
                  className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              <div className="mb-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Thành viên: <span className="font-medium text-slate-900 dark:text-white">{editMember.userName || editMember.userEmail}</span>
                </p>
              </div>
              <form onSubmit={handleEditRole} className="space-y-4">
                <div>
                  <label htmlFor="roleSelect" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Quyền hạn
                  </label>
                  <select
                    id="roleSelect"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    disabled={editRoleLoading}
                  >
                    <option value="Member">Member</option>
                    <option value="Owner">Owner</option>
                  </select>
                </div>
                {editRoleMessage.text && (
                  <div className={`p-3 rounded-lg text-sm ${editRoleMessage.type === 'error' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'}`}>
                    {editRoleMessage.text}
                  </div>
                )}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setEditMember(null);
                      setEditRoleMessage({ type: '', text: '' });
                    }}
                    className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={editRoleLoading}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {editRoleLoading && <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>}
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationDetail;
