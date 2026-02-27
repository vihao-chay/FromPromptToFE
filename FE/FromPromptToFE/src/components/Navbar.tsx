
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

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
              Change Logs
            </Link>
            <Link
              className={`text-sm font-medium transition-colors ${isActive('/github-integration') || isActive('/github-status') ? 'text-primary' : 'text-slate-600 dark:text-slate-400 hover:text-primary'}`}
              to="/github-integration"
            >
              GitHub
            </Link>
            <Link
              className={`text-sm font-medium transition-colors ${isActive('/profile') ? 'text-primary' : 'text-slate-600 dark:text-slate-400 hover:text-primary'}`}
              to="/profile"
            >
              Profile
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
            </button>
            <Link to="/profile" className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden ring-2 ring-primary/20">
              <div className="w-full h-full bg-gradient-to-br from-primary to-purple-600"></div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
