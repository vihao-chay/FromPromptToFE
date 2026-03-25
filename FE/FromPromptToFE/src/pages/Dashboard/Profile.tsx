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
  const [avatarInput, setAvatarInput] = useState('');
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (jpg, png, gif...)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must not exceed 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatarInput(result);
      setShowAvatarModal(false);
    };
    reader.readAsDataURL(file);
  };
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
        const content = res.data?.content as unknown as Record<string, unknown> | undefined;
        const u = normalizeUser(content ?? null);
        if (cancelled) return;
        setUser(u);
        if (u) {
          setNameInput(u.name ?? '');
          setAvatarInput(u.avatarUrl ?? '');
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
      const res = await authService.updateProfile({ name: nameInput.trim(), avatarUrl: avatarInput.trim() || undefined });
      const content = res.data?.content as unknown as Record<string, unknown> | undefined;
      const updated = normalizeUser(content ?? null);
      if (updated) {
        setUser(updated);
        setAvatarInput(updated.avatarUrl ?? '');
      }
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
        <div className="flex flex-col max-w-[1000px] flex-1 w-full gap-4">
          <div className="flex flex-col gap-1 px-2">
            <h1 className="text-slate-900 dark:text-white text-2xl sm:text-3xl font-black leading-tight tracking-tight">Profile Settings</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your account information and preferences.</p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-sm font-medium">{error}</div>
          )}
          {successMessage && (
            <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 text-sm font-medium">{successMessage}</div>
          )}

          <div className="bg-white dark:bg-[#1c1f27] border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row">

            {/* LEFT COLUMN: Account Summary */}
            <div className="w-full md:w-1/3 bg-slate-50 dark:bg-[#14171d] border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col">
              <div className="p-6 md:p-8 flex flex-col items-center text-center flex-1">
                <div className="relative mb-5">
                  <div
                    className="h-28 w-28 rounded-full bg-white dark:bg-slate-800 bg-cover bg-center border-4 border-white dark:border-slate-900 shadow-lg overflow-hidden flex items-center justify-center shrink-0"
                  >
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-4xl font-bold text-white bg-gradient-to-br from-primary to-purple-600 w-full h-full flex items-center justify-center">
                        {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-1 right-1 bg-primary text-white p-1 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                    <span className="material-symbols-outlined text-xs">verified</span>
                  </div>
                </div>
                <div className="space-y-1.5 w-full">
                  <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white truncate px-2">{user?.name || user?.email || '—'}</h3>
                  <a href={`mailto:${user?.email}`} className="text-primary font-medium hover:underline text-sm break-all truncate px-2 block">{user?.email ?? '—'}</a>
                  <div className="flex items-center justify-center gap-1.5 mt-3 text-slate-500 text-xs">
                    <span className="material-symbols-outlined text-sm">calendar_today</span>
                    <span>{joinedDate ? `Joined ${joinedDate}` : (createdDate !== '—' ? `Joined ${createdDate}` : '—')}</span>
                  </div>
                </div>

                <div className="w-full mt-8 bg-white dark:bg-[#1c1f27] rounded-xl border border-slate-200 dark:border-slate-700 p-4 shrink-0">
                  <div className="grid grid-cols-2 gap-4 divide-x divide-slate-100 dark:divide-slate-800">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Plan</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-full px-1">{firstOrg?.organizationPlan ?? '—'}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Status</span>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-200 dark:border-slate-800 shrink-0">
                <button type="button" onClick={handleLogout} className="w-full h-11 flex items-center justify-center gap-2 bg-slate-200/50 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-lg transition-colors border border-slate-300 dark:border-slate-700">
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Account Details & Editing */}
            <div className="w-full md:w-2/3 flex flex-col">
              <div className="p-6 md:p-8 flex-1">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800/50">
                  <h2 className="text-slate-900 dark:text-white text-lg font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">badge</span>
                    Account Details
                  </h2>
                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white hover:bg-blue-700 transition-colors text-sm font-bold shadow-sm shadow-primary/20"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                      Edit Profile
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setNameInput(user?.name ?? '');
                        setAvatarInput(user?.avatarUrl ?? '');
                        setShowPasswordSection(false);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-bold border border-slate-200 dark:border-slate-700"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                      Cancel
                    </button>
                  )}
                </div>

                <div className="space-y-6 max-w-lg">
                  <div className="flex flex-col gap-2">
                    <label className="flex flex-col w-full">
                      <p className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-normal pb-1.5 flex justify-between items-center">
                        Email Address
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">Read-only</span>
                      </p>
                      <div className="flex items-center relative">
                        <input className="form-input flex w-full min-w-0 flex-1 rounded-lg text-slate-500 dark:text-slate-500 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#14171d] h-11 px-4 text-sm font-normal cursor-not-allowed outline-none" readOnly value={user?.email ?? ''} />
                        <span className="material-symbols-outlined absolute right-3 text-slate-400 text-lg pointer-events-none">lock</span>
                      </div>
                    </label>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="flex flex-col w-full">
                      <p className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-normal pb-1.5">Full Name</p>
                      <input
                        className={`form-input flex w-full min-w-0 flex-1 rounded-lg text-sm transition-all h-11 px-4 outline-none
                          ${!isEditing
                            ? 'text-slate-900 dark:text-white border-transparent bg-slate-50 dark:bg-[#14171d] font-semibold read-only:focus:ring-0 cursor-default'
                            : 'text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 focus:border-primary/50 bg-white dark:bg-[#1c1f27] font-normal focus:ring-4 focus:ring-primary/10'
                          }
                        `}
                        placeholder="Enter your full name"
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        readOnly={!isEditing}
                      />
                    </label>
                  </div>

                  {isEditing && (
                    <div className="flex flex-col gap-3 py-2 border-t border-slate-100 dark:border-slate-800/50 mt-4 pt-6">
                      <p className="text-slate-900 dark:text-white text-sm font-bold leading-normal">Profile Picture</p>
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center shrink-0">
                          {avatarInput ? (
                            <img src={avatarInput} alt="Avatar" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          ) : (
                            <span className="material-symbols-outlined text-slate-400 text-2xl">image</span>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => setShowAvatarModal(true)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
                          >
                            <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                            Upload New
                          </button>
                          {avatarInput && (
                            <button
                              type="button"
                              onClick={() => setAvatarInput('')}
                              className="text-[11px] text-red-500 hover:text-red-600 font-semibold px-1 w-fit"
                            >
                              Remove picture
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 flex flex-col gap-1">
                        <input
                          className="form-input flex w-full min-w-0 flex-1 rounded-lg text-slate-900 dark:text-white outline-none border border-slate-300 dark:border-slate-600 focus:border-primary/50 bg-white dark:bg-[#1c1f27] font-normal focus:ring-4 focus:ring-primary/10 h-10 px-3 text-xs transition-all"
                          placeholder="Or paste image URL here..."
                          type="url"
                          value={avatarInput}
                          onChange={(e) => setAvatarInput(e.target.value)}
                        />
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                    </div>
                  )}

                  {/* Change password section */}
                  {isEditing && (
                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800/50">
                      {!showPasswordSection ? (
                        <button
                          type="button"
                          onClick={() => { setShowPasswordSection(true); setPasswordError(null); }}
                          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary font-bold text-sm transition-colors py-1"
                        >
                          <span className="material-symbols-outlined text-lg">lock_reset</span>
                          Change Password
                        </button>
                      ) : (
                        <div className="space-y-4 bg-slate-50 dark:bg-[#14171d] p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[18px]">key</span>
                            Update Password
                          </h3>
                          <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{PASSWORD_RULE}</p>
                          {passwordError && (
                            <div className="p-3 rounded-lg bg-amber-100/50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-xs font-medium">{passwordError}</div>
                          )}
                          <div className="space-y-4 pt-1">
                            <div className="flex flex-col gap-1.5">
                              <label className="flex flex-col w-full relative">
                                <p className="text-slate-700 dark:text-slate-300 text-xs font-medium leading-normal pb-1">New password</p>
                                <div className="relative flex items-center">
                                  <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    className="form-input flex w-full min-w-0 flex-1 rounded-lg text-slate-900 dark:text-white outline-none border border-slate-300 dark:border-slate-600 focus:border-primary/50 bg-white dark:bg-[#1c1f27] font-normal focus:ring-4 focus:ring-primary/10 h-10 px-3 pr-10 text-sm transition-all"
                                    autoComplete="new-password"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowNewPassword((v) => !v)}
                                    className="absolute right-2 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">{showNewPassword ? 'visibility_off' : 'visibility'}</span>
                                  </button>
                                </div>
                              </label>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="flex flex-col w-full relative">
                                <p className="text-slate-700 dark:text-slate-300 text-xs font-medium leading-normal pb-1">Confirm password</p>
                                <div className="relative flex items-center">
                                  <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm password"
                                    className="form-input flex w-full min-w-0 flex-1 rounded-lg text-slate-900 dark:text-white outline-none border border-slate-300 dark:border-slate-600 focus:border-primary/50 bg-white dark:bg-[#1c1f27] font-normal focus:ring-4 focus:ring-primary/10 h-10 px-3 pr-10 text-sm transition-all"
                                    autoComplete="new-password"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword((v) => !v)}
                                    className="absolute right-2 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                                  </button>
                                </div>
                              </label>
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                              <button
                                type="button"
                                disabled={changingPassword}
                                onClick={handleChangePassword}
                                className="px-4 py-2 rounded-lg bg-slate-800 dark:bg-slate-700 text-white text-xs font-bold hover:bg-slate-900 dark:hover:bg-slate-600 disabled:opacity-60 transition-colors shadow-sm"
                              >
                                {changingPassword ? 'Saving...' : 'Save Password'}
                              </button>
                              <button
                                type="button"
                                onClick={() => { setShowPasswordSection(false); setPasswordError(null); setNewPassword(''); setConfirmPassword(''); }}
                                className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons (Footer of Right Column) */}
              {isEditing && (
                <div className="px-6 py-4 md:px-8 md:py-5 bg-slate-50 dark:bg-[#14171d] border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 shrink-0 rounded-br-xl rounded-bl-xl md:rounded-bl-none">
                  <button type="button" onClick={() => {
                    setIsEditing(false);
                    setNameInput(user?.name ?? '');
                    setAvatarInput(user?.avatarUrl ?? '');
                    setShowPasswordSection(false);
                  }} className="px-5 h-10 rounded-lg text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                    Discard
                  </button>
                  <button type="button" disabled={saving} onClick={async () => {
                    await handleSave();
                    setIsEditing(false);
                  }} className="px-6 h-10 rounded-lg bg-primary text-white font-bold text-sm hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center gap-2 shadow-md shadow-primary/20 disabled:opacity-60">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    {saving ? 'Saving...' : 'Save Updates'}
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </main >

      {/* Avatar Upload Modal */}
      {
        showAvatarModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Choose Profile Picture</h3>
                  <button
                    type="button"
                    onClick={() => setShowAvatarModal(false)}
                    className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>

                {/* Drop zone */}
                <div
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      const dt = new DataTransfer();
                      dt.items.add(file);
                      if (fileInputRef.current) {
                        fileInputRef.current.files = dt.files;
                        fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
                      }
                    }
                  }}
                >
                  <span className="material-symbols-outlined text-4xl text-slate-400 dark:text-slate-500 mb-3 block">cloud_upload</span>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Drag and drop image here
                  </p>
                  <p className="text-xs text-slate-500 font-medium">or click to browse</p>
                  <p className="text-[10px] text-slate-400 mt-3 uppercase tracking-wider font-bold">JPG, PNG, GIF — Max 5MB</p>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAvatarModal(false)}
                    className="px-5 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default Profile;
