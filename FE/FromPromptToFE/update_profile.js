const fs = require('fs');

const file = './src/pages/Dashboard/Profile.tsx';
let content = fs.readFileSync(file, 'utf8');

// Insert isEditing state
content = content.replace(
  'const [avatarInput, setAvatarInput] = useState(\'\');',
  'const [avatarInput, setAvatarInput] = useState(\'\');\n  const [isEditing, setIsEditing] = useState(false);'
);

// Replace layout
const startIdx = content.indexOf('return (');
const endIdx = content.lastIndexOf('</main>');

if (startIdx !== -1 && endIdx !== -1) {
  const newLayout = `return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10 font-display min-h-0">
      <main className="flex flex-1 justify-center">
        {/* We use a grid layout. On mobile it's 1 column, on large screens it's 2 columns (1/3 and 2/3 ratio approx) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1000px] w-full items-start">
          
          {/* LEFT COLUMN: Account Summary */}
          <div className="w-full bg-white dark:bg-[#1c1f27] border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              <div className="pt-8 pb-4 text-center border-b border-slate-100 dark:border-slate-800/50">
                <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400 dark:text-slate-500">Account Summary</h2>
              </div>
              <div className="p-8 flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div
                    className="h-24 w-24 rounded-full bg-slate-200 dark:bg-slate-800 bg-cover bg-center border-4 border-white dark:border-slate-900 shadow-lg overflow-hidden flex items-center justify-center"
                  >
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-white bg-gradient-to-br from-primary to-purple-600 w-full h-full flex items-center justify-center">
                        {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full border-2 border-white dark:border-slate-900">
                    <span className="material-symbols-outlined text-xs">verified</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{user?.name || user?.email || '—'}</h3>
                  <a href={\`mailto:\${user?.email}\`} className="text-primary font-medium hover:underline break-all">{user?.email ?? '—'}</a>
                  <div className="flex items-center justify-center gap-2 mt-2 text-slate-500 text-sm">
                    <span className="material-symbols-outlined text-base">calendar_today</span>
                    <span>{joinedDate ? \`Member since \${joinedDate}\` : (createdDate !== '—' ? \`Member since \${createdDate}\` : '—')}</span>
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
            </div>
            
            <div className="p-6 border-t border-slate-100 dark:border-slate-800">
              <button type="button" onClick={handleLogout} className="w-full h-11 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg transition-all border border-slate-200 dark:border-slate-700">
                <span className="material-symbols-outlined text-[20px]">logout</span>
                <span className="text-sm">Logout Account</span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Profile & Settings */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex flex-col gap-1 mb-2">
              <h1 className="text-slate-900 dark:text-white text-2xl sm:text-3xl font-black leading-tight tracking-tight">Account Details</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your personal information and password.</p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-sm">{error}</div>
            )}
            {successMessage && (
              <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 text-sm">{successMessage}</div>
            )}

            <div className="bg-white dark:bg-[#1c1f27] border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="text-slate-900 dark:text-white text-lg font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">badge</span>
                    Profile Information
                  </h2>
                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-bold"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                      Edit
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
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-bold"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                      Cancel
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <label className="flex flex-col w-full">
                      <p className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-normal pb-1.5">Email Address</p>
                      <div className="flex items-center relative">
                        <input className="form-input flex w-full min-w-0 flex-1 rounded-lg text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#14171d] h-11 px-4 text-sm font-normal cursor-not-allowed" readOnly value={user?.email ?? ''} />
                        <span className="material-symbols-outlined absolute right-4 text-slate-400 text-lg pointer-events-none">lock</span>
                      </div>
                    </label>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="flex flex-col w-full">
                      <p className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-normal pb-1.5">Full Name</p>
                      <input
                        className={\`form-input flex w-full min-w-0 flex-1 rounded-lg text-sm transition-all h-11 px-4
                          \${!isEditing 
                            ? 'text-slate-700 dark:text-white border-transparent bg-slate-50 dark:bg-[#14171d] font-semibold read-only:focus:ring-0 cursor-default' 
                            : 'text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/40 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/50 font-normal focus:border-primary/50'
                          }
                        \`}
                        placeholder="Enter your full name"
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        readOnly={!isEditing}
                      />
                    </label>
                  </div>

                  {isEditing && (
                    <div className="flex flex-col gap-3 pt-2">
                      <p className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-normal">Profile Picture</p>
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                          {avatarInput ? (
                            <img src={avatarInput} alt="Avatar" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          ) : (
                            <span className="material-symbols-outlined text-slate-400 text-xl">person</span>
                          )}
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <button
                            type="button"
                            onClick={() => setShowAvatarModal(true)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
                          >
                            <span className="material-symbols-outlined text-[16px]">upload</span>
                            Upload New
                          </button>
                          {avatarInput && (
                            <button
                              type="button"
                              onClick={() => setAvatarInput('')}
                              className="text-[11px] text-red-500 hover:text-red-600 font-medium text-left px-1"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="mt-1 flex flex-col gap-1">
                        <input
                          className="form-input flex w-full min-w-0 flex-1 rounded-md text-slate-900 dark:text-white focus:outline-0 focus:ring-1 focus:ring-primary/40 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/50 h-9 px-3 text-xs transition-all"
                          placeholder="Or paste image URL here..."
                          type="url"
                          value={avatarInput}
                          onChange={(e) => setAvatarInput(e.target.value)}
                        />
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                    </div>
                  )}

                  {/* Change password only visible when editing */}
                  {isEditing && (
                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-2">
                      {!showPasswordSection ? (
                        <button
                          type="button"
                          onClick={() => { setShowPasswordSection(true); setPasswordError(null); }}
                          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary font-medium text-sm transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg">lock_reset</span>
                          Want to change password?
                        </button>
                      ) : (
                        <div className="space-y-4 bg-slate-50 dark:bg-[#14171d] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[18px]">key</span>
                            Update Password
                          </h3>
                          <p className="text-slate-500 dark:text-slate-400 text-xs mb-3">{PASSWORD_RULE}</p>
                          {passwordError && (
                            <div className="p-2.5 rounded-lg bg-amber-100/50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-xs mb-3">{passwordError}</div>
                          )}
                          <div className="space-y-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="flex flex-col w-full relative">
                                <p className="text-slate-700 dark:text-slate-300 text-xs font-medium leading-normal pb-1">New password</p>
                                <div className="relative flex items-center">
                                  <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    className="form-input flex w-full min-w-0 flex-1 rounded-md text-slate-900 dark:text-white focus:outline-0 focus:ring-1 focus:ring-primary/40 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/80 h-10 px-3 pr-10 text-sm transition-all"
                                    autoComplete="new-password"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowNewPassword((v) => !v)}
                                    className="absolute right-2 p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
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
                                    className="form-input flex w-full min-w-0 flex-1 rounded-md text-slate-900 dark:text-white focus:outline-0 focus:ring-1 focus:ring-primary/40 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/80 h-10 px-3 pr-10 text-sm transition-all"
                                    autoComplete="new-password"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword((v) => !v)}
                                    className="absolute right-2 p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
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
                                className="px-4 py-2 rounded-md bg-slate-800 dark:bg-slate-700 text-white text-xs font-bold hover:bg-slate-900 dark:hover:bg-slate-600 disabled:opacity-60 transition-colors"
                              >
                                {changingPassword ? 'Saving...' : 'Save Password'}
                              </button>
                              <button
                                type="button"
                                onClick={() => { setShowPasswordSection(false); setPasswordError(null); setNewPassword(''); setConfirmPassword(''); }}
                                className="px-4 py-2 rounded-md text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
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

              {isEditing && (
                <div className="px-6 py-4 bg-slate-50 dark:bg-[#14171d] border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 rounded-b-xl">
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
                  }} className="px-6 h-10 rounded-lg bg-primary text-white font-bold text-sm hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 shadow-md shadow-primary/20 disabled:opacity-60">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    {saving ? 'Saving...' : 'Save Updates'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>`;
  content = content.substring(0, startIdx) + newLayout + content.substring(endIdx + 7);
  fs.writeFileSync(file, content);
  console.log('Successfully updated profile UI!');
} else {
  console.log('Failed to match indices.');
}
