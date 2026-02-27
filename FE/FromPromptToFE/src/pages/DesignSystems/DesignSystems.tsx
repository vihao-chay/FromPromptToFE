import React from 'react';
import { Link } from 'react-router-dom';

const DesignSystems: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">Design Systems</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Manage design tokens, components, and style guides.</p>
      </div>
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-12 text-center">
        <span className="material-symbols-outlined text-4xl text-slate-400 dark:text-slate-500 mb-4">palette</span>
        <p className="text-slate-600 dark:text-slate-400">Design system management will be available here.</p>
        <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">Define colors, typography, and reusable components for generated code.</p>
        <Link to="/editor" className="inline-flex items-center gap-2 mt-4 text-primary font-medium hover:underline">
          Editor
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
};

export default DesignSystems;
