import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService, { getMyOrganizations, type UserDto, type UserOrganizationDto } from '../../services/authService';

function normalizeUser(c: Record<string, unknown> | null): UserDto | null {
  if (!c) return null;
  return {
    id: String(c.id ?? c.Id ?? ''),
    email: String(c.email ?? c.Email ?? ''),
    name: c.name != null ? String(c.name) : (c.Name != null ? String(c.Name) : undefined),
    avatarUrl: c.avatarUrl != null ? String(c.avatarUrl) : (c.AvatarUrl != null ? String(c.AvatarUrl) : undefined),
    createdAt: c.createdAt != null ? String(c.createdAt) : (c.CreatedAt != null ? String(c.CreatedAt) : undefined),
    provider: c.provider != null ? String(c.provider) : (c.Provider != null ? String(c.Provider) : undefined),
  };
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [organizations, setOrganizations] = useState<UserOrganizationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const navigate = useNavigate();

  const firstOrg = organizations[0] ?? null;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await authService.getMe();
        const content = res.data?.content as Record<string, unknown> | undefined;
        const u = normalizeUser(content ?? null);
        if (cancelled) return;
        setUser(u);
        if (u) {
          setNameInput(u.name ?? '');
          const orgs = await getMyOrganizations(u.id);
          if (!cancelled) setOrganizations(orgs);
        }
      } catch (e) {
        if (!cancelled) {
          const msg = (e as { response?: { data?: { message?: string }; status?: number } })?.response?.data?.message;
          setError(msg || 'Failed to load profile. Please log in again.');
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await authService.updateProfile({ name: nameInput.trim() });
      const content = res.data?.content as Record<string, unknown> | undefined;
      const updated = normalizeUser(content ?? null);
      if (updated) setUser(updated);
      const message = (res.data as { message?: string })?.message;
      setSuccessMessage(message || 'Profile updated successfully.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (e) {
      const err = e as { response?: { data?: { message?: string }; status?: number }; message?: string };
      const status = err.response?.status;
      const msg = err.response?.data?.message ?? err.message;
      if (status === 401) setError(msg || 'Session expired. Please log in again.');
      else if (status === 404) setError(msg || 'User not found.');
      else if (status && status >= 500) setError(msg || 'Server error. Try again later.');
      else setError(msg || `Update failed${status ? ` (${status})` : ''}. Try again.`);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('auth-logout'));
    navigate('/login', { replace: true });
  };

  const PASSWORD_RULE = 'At least 8 characters, with uppercase, lowercase, number and special character (@$!%*?&).';

  const handleChangePassword = async () => {
    setPasswordError(null);
    if (!newPassword.trim()) {
      setPasswordError('New password is required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/\d/.test(newPassword) || !/[@$!%*?&]/.test(newPassword)) {
      setPasswordError(PASSWORD_RULE);
      return;
    }
    setChangingPassword(true);
    setPasswordError(null);
    setSuccessMessage(null);
    try {
      await authService.changePassword(null, newPassword);
      setSuccessMessage('Password changed successfully.');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (e) {
      const err = e as { response?: { data?: Record<string, unknown>; status?: number } };
      const data = err.response?.data;
      let msg = (e as Error).message;
      if (data && typeof data === 'object') {
        const m = (data as { message?: string }).message ?? (data as { Message?: string }).Message;
        if (m) msg = m;
        const errors = (data as { errors?: Record<string, string[]> }).errors;
        if (errors && typeof errors === 'object') {
          const first = Object.values(errors).flat().find(Boolean);
          if (first) msg = first;
        }
      }
      setPasswordError(msg || 'Failed to change password. Try again.');
    } finally {
      setChangingPassword(false);
    }
  };

  const createdDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
  const joinedDate = firstOrg?.joinedAt ? new Date(firstOrg.joinedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : null;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 font-display bg-slate-50 dark:bg-[#0d0e12] min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-slate-500 dark:text-slate-400">Loading...</div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 font-display bg-slate-50 dark:bg-[#0d0e12] min-h-[60vh] flex items-center justify-center">
        <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/20 p-6 text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <Link to="/login" className="inline-block mt-4 px-4 py-2 bg-primary text-white rounded-lg font-medium">Log in again</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10 font-display min-h-0">
      <main className="flex flex-1 justify-center">
        <div className="flex flex-col max-w-[800px] flex-1 w-full">
          <div className="flex flex-wrap justify-between gap-3 p-2 sm:p-4 mb-4">
            <div className="flex min-w-0 flex-col gap-2">
              <h1 className="text-slate-900 dark:text-white text-2xl sm:text-4xl font-black leading-tight tracking-tight">Edit Profile Settings</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">Manage your personal information and password.</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-sm">{error}</div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 text-sm">{successMessage}</div>
          )}

          {/* One card: Email, Full Name, Change password */}
          <div className="bg-white dark:bg-[#1c1f27] border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 sm:p-6">
              <h2 className="text-slate-900 dark:text-white text-lg sm:text-[22px] font-bold leading-tight mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">person</span>
                Profile & password
              </h2>

              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="flex flex-col w-full">
                    <div className="flex items-center gap-2 pb-2">
                      <p className="text-slate-700 dark:text-white text-sm font-medium leading-normal">Email Address</p>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#282e39] text-slate-500 dark:text-[#9da6b9]">Read-only</span>
                    </div>
                    <div className="flex items-center relative">
                      <input className="form-input flex w-full min-w-0 flex-1 rounded-lg text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 h-12 sm:h-14 px-4 text-base font-normal cursor-not-allowed" readOnly value={user?.email ?? ''} />
                      <span className="material-symbols-outlined absolute right-4 text-slate-400 pointer-events-none">lock</span>
                    </div>
                  </label>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="flex flex-col w-full">
                    <p className="text-slate-700 dark:text-white text-sm font-medium leading-normal pb-2">Full Name</p>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/40 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800/50 h-12 sm:h-14 px-4 text-base font-normal transition-all"
                      placeholder="Enter your full name"
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                    />
                  </label>
                </div>

                {/* Change password: hidden by default, expand when clicked */}
                <div className="pt-4 border-t border-slate-200 dark:border-[#282e39]">
                  {!showPasswordSection ? (
                    <button
                      type="button"
                      onClick={() => { setShowPasswordSection(true); setPasswordError(null); }}
                      className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-primary font-medium text-sm"
                    >
                      <span className="material-symbols-outlined text-primary text-lg">lock</span>
                      Change password
                    </button>
                  ) : (
                    <div className="space-y-6">
                      <p className="text-slate-500 dark:text-slate-400 text-xs">{PASSWORD_RULE}</p>
                      {passwordError && (
                        <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-sm">{passwordError}</div>
                      )}
                      <div className="space-y-6 max-w-full">
                        <div className="flex flex-col gap-2">
                          <label className="flex flex-col w-full">
                            <p className="text-slate-700 dark:text-white text-sm font-medium leading-normal pb-2">New password</p>
                            <div className="relative flex items-center">
                              <input
                                type={showNewPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                className="form-input flex w-full min-w-0 flex-1 rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/40 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800/50 h-12 sm:h-14 px-4 pr-12 text-base font-normal transition-all"
                                autoComplete="new-password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword((v) => !v)}
                                className="absolute right-4 p-1 rounded text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 focus:outline-none"
                                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                              >
                                <span className="material-symbols-outlined text-xl">{showNewPassword ? 'visibility_off' : 'visibility'}</span>
                              </button>
                            </div>
                          </label>
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="flex flex-col w-full">
                            <p className="text-slate-700 dark:text-white text-sm font-medium leading-normal pb-2">Confirm password</p>
                            <div className="relative flex items-center">
                              <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm password"
                                className="form-input flex w-full min-w-0 flex-1 rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/40 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800/50 h-12 sm:h-14 px-4 pr-12 text-base font-normal transition-all"
                                autoComplete="new-password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword((v) => !v)}
                                className="absolute right-4 p-1 rounded text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 focus:outline-none"
                                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                              >
                                <span className="material-symbols-outlined text-xl">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                              </button>
                            </div>
                          </label>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            disabled={changingPassword}
                            onClick={handleChangePassword}
                            className="px-6 h-12 rounded-lg bg-primary text-white font-bold hover:brightness-110 disabled:opacity-60 flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-lg">key</span>
                            {changingPassword ? 'Changing...' : 'Change password'}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setShowPasswordSection(false); setPasswordError(null); setNewPassword(''); setConfirmPassword(''); }}
                            className="px-6 h-12 rounded-lg text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-[#282e39] transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-4 sm:px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end bg-white dark:bg-[#1c1f27]">
              <button type="button" disabled={saving} className="px-8 h-12 rounded-lg bg-primary text-white font-bold hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-60" onClick={handleSave}>
                <span className="material-symbols-outlined text-lg">save</span>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          <div className="mt-10 sm:mt-16 w-full max-w-md mx-auto bg-white dark:bg-[#1c1f27] border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
            <div className="pt-8 pb-4 text-center border-b border-slate-100 dark:border-slate-800/50">
              <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400 dark:text-slate-500">Account Summary</h2>
            </div>
            <div className="p-8 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div
                  className="h-24 w-24 rounded-full bg-slate-200 dark:bg-slate-800 bg-cover bg-center border-4 border-white dark:border-slate-900 shadow-lg"
                  style={{ backgroundImage: user?.avatarUrl ? `url(${user.avatarUrl})` : 'url("https://picsum.photos/200/200")' }}
                />
                <div className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full border-2 border-white dark:border-slate-900">
                  <span className="material-symbols-outlined text-xs">verified</span>
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{user?.name || user?.email || '—'}</h3>
                <a href={`mailto:${user?.email}`} className="text-primary font-medium hover:underline">{user?.email ?? '—'}</a>
                <div className="flex items-center justify-center gap-2 mt-2 text-slate-500 text-sm">
                  <span className="material-symbols-outlined text-base">calendar_today</span>
                  <span>{joinedDate ? `Member since ${joinedDate}` : (createdDate !== '—' ? `Member since ${createdDate}` : '—')}</span>
                </div>
              </div>
            </div>
            <div className="px-8 py-4 bg-slate-50/50 dark:bg-slate-800/20 grid grid-cols-2 gap-4">
              <div className="flex flex-col border-r border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Plan</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{firstOrg?.organizationPlan ?? '—'}</span>
              </div>
              <div className="flex flex-col pl-4">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Status</span>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">Active</span>
                </div>
              </div>
            </div>
            <div className="p-8 border-t border-slate-100 dark:border-slate-800">
              <button type="button" onClick={handleLogout} className="w-full h-12 flex items-center justify-center gap-2 bg-primary hover:bg-blue-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined">logout</span>
                <span>Logout Account</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
