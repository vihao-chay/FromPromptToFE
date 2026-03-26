
import React, { useMemo, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import { useTheme } from '../hooks/useTheme';

/** Decode JWT payload without any library — just base64 the middle part */
const getJwtRole = (): string | null => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    // ASP.NET emits role under the long ClaimTypes.Role key OR short "role"
    return payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
      ?? payload['role']
      ?? null;
  } catch {
    return null;
  }
};

const Navbar: React.FC = () => {
  const location = useLocation();
  const role = useMemo(getJwtRole, [location.pathname]); // re-check on route change
  const { theme, toggleTheme } = useTheme();

  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userInitial, setUserInitial] = useState<string>('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await authService.getMe();
        const c = res.data?.content as unknown as Record<string, unknown> | undefined;
        if (!c) return;
        const avatar = c.avatarUrl ?? c.AvatarUrl;
        if (avatar && typeof avatar === 'string' && avatar.trim()) {
          setUserAvatar(avatar);
        }
        const name = (c.name ?? c.Name ?? c.email ?? c.Email ?? '') as string;
        setUserInitial(name.charAt(0).toUpperCase());
      } catch { /* ignore */ }
    };
    loadUser();

    const handleLogout = () => { setUserAvatar(null); setUserInitial(''); };
    window.addEventListener('auth-logout', handleLogout);
    return () => window.removeEventListener('auth-logout', handleLogout);
  }, [location.pathname]);

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
              <span className="material-symbols-outlined">auto_awesome</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display">AI Code Gen</h1>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {/* User links — hidden when JWT role === "Admin" */}
            {role !== 'Admin' && (
              <>
                <Link
                  className={`text-sm font-semibold transition-colors ${isActive('/dashboard') ? 'text-primary' : 'text-slate-600 dark:text-slate-400 hover:text-primary'}`}
                  to="/dashboard"
                >
                  Dashboard
                </Link>
                <Link
                  className={`text-sm font-medium transition-colors ${isActive('/change-logs') ? 'text-primary' : 'text-slate-600 dark:text-slate-400 hover:text-primary'}`}
                  to="/change-logs"
                >
                  ChangeLog
                </Link>
                <Link
                  className={`text-sm font-medium transition-colors ${isActive('/github-integration') || isActive('/github-status') ? 'text-primary' : 'text-slate-600 dark:text-slate-400 hover:text-primary'}`}
                  to="/github-integration"
                >
                  GitHub
                </Link>
              </>
            )}
            <Link
              className={`text-sm font-medium transition-colors ${isActive('/profile') ? 'text-primary' : 'text-slate-600 dark:text-slate-400 hover:text-primary'}`}
              to="/profile"
            >
              Profile
            </Link>

            {/* Admin link — only visible when JWT role === "Admin" */}
            {role === 'Admin' && (
              <Link
                className={`text-sm font-semibold transition-colors flex items-center gap-1 ${isActive('/admin')
                  ? 'text-primary'
                  : 'text-slate-600 dark:text-slate-400 hover:text-primary'
                  }`}
                to="/admin"
              >
                <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="relative h-9 w-9 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary transition-all duration-300 cursor-pointer"
              aria-label="Toggle dark mode"
              title={theme === 'dark' ? 'Chuyển sang Light Mode' : 'Chuyển sang Dark Mode'}
            >
              <span
                className={`material-symbols-outlined text-[20px] transition-transform duration-500 ${theme === 'dark' ? 'rotate-0' : 'rotate-[360deg]'}`}
              >
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <Link to="/profile" className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden ring-2 ring-primary/20 flex items-center justify-center">
              {userAvatar ? (
                <img src={userAvatar} alt="Avatar" className="h-full w-full object-cover" />
              ) : userInitial ? (
                <span className="text-sm font-bold text-white bg-gradient-to-br from-primary to-purple-600 w-full h-full flex items-center justify-center">
                  {userInitial}
                </span>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-purple-600"></div>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
