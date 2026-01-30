
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Editor: React.FC = () => {
  const [uiPrompt, setUiPrompt] = useState('');
  const [schemaPrompt, setSchemaPrompt] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    setIsSaving(true);
    // Persist prompts to session storage or local storage for the preview page
    sessionStorage.setItem('last_ui_prompt', uiPrompt);
    sessionStorage.setItem('last_schema_prompt', schemaPrompt);
    
    // Simulate brief processing
    setTimeout(() => {
      navigate('/preview');
    }, 1500);
  };

  return (
    <div className="max-w-[1000px] mx-auto w-full px-6 py-8 flex flex-col gap-6">
      {/* Breadcrumbs */}
      <div className="flex flex-wrap items-center gap-2 text-sm font-display">
        <Link className="text-slate-500 dark:text-[#9da6b9] hover:text-primary transition-colors font-medium" to="/">Projects</Link>
        <span className="text-slate-400 dark:text-[#9da6b9] material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-slate-900 dark:text-white font-medium">New Project</span>
      </div>

      {/* Page Heading */}
      <div className="flex flex-wrap justify-between items-end gap-3 py-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-tight font-display">Create New Project</h1>
          <p className="text-slate-600 dark:text-[#9da6b9] text-base font-normal">Define the visual and technical parameters for your AI-generated application.</p>
        </div>
        <div className="flex gap-3">
          <button 
            className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
            onClick={() => navigate('/')}
          >
            Discard Draft
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 mt-4">
        {/* UI Description Section */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-1">
            <span className="material-symbols-outlined text-primary">palette</span>
            <h3 className="text-slate-900 dark:text-white text-xl font-bold font-display">UI & Visual Description</h3>
          </div>
          <div className="group relative">
            <textarea 
              className="custom-scrollbar form-input flex w-full min-h-[280px] resize-none overflow-y-auto rounded-xl text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-200 dark:border-[#3b4354] bg-white dark:bg-[#1c1f27] focus:border-primary placeholder:text-slate-400 dark:placeholder:text-[#9da6b9] p-5 text-base font-normal leading-relaxed transition-all shadow-sm" 
              placeholder="Describe the layout, components, and style in natural language... e.g., 'A modern dashboard with a sidebar, using a neon-purple and dark-gray theme with glassy cards.'"
              value={uiPrompt}
              onChange={(e) => setUiPrompt(e.target.value)}
            />
            <div className="absolute bottom-4 right-4 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-medium">
              <span>{uiPrompt.length} / 2000 characters</span>
            </div>
          </div>
        </section>

        {/* API/ERD Description Section */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-1">
            <span className="material-symbols-outlined text-primary">database</span>
            <h3 className="text-slate-900 dark:text-white text-xl font-bold font-display">Data Schema & API Logic</h3>
          </div>
          <div className="group relative">
            <textarea 
              className="custom-scrollbar form-input flex w-full min-h-[160px] resize-none overflow-y-auto rounded-xl text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-200 dark:border-[#3b4354] bg-white dark:bg-[#1c1f27] focus:border-primary placeholder:text-slate-400 dark:placeholder:text-[#9da6b9] p-5 text-sm font-mono leading-relaxed transition-all shadow-sm" 
              placeholder="Define your ERD, endpoints, or data structures... e.g., 'User has many Posts. Post has title:string, content:text, and author_id.'"
              value={schemaPrompt}
              onChange={(e) => setSchemaPrompt(e.target.value)}
            />
            <div className="absolute bottom-4 right-4 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-medium">
              <span>{schemaPrompt.length} / 1000 characters</span>
            </div>
          </div>
        </section>
      </div>

      {/* Footer Action */}
      <div className="flex justify-end items-center gap-4 py-8 border-t border-slate-200 dark:border-[#282e39] mt-4">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm italic mr-auto">
          <span className="material-symbols-outlined text-sm">cloud_done</span>
          Draft saved just now
        </div>
        <button 
          className="flex items-center gap-2 min-w-[180px] cursor-pointer rounded-xl h-14 px-8 bg-primary text-white text-base font-bold hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleGenerate}
          disabled={!uiPrompt || isSaving}
        >
          {isSaving ? (
             <span className="material-symbols-outlined animate-spin">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined">rocket_launch</span>
          )}
          <span>{isSaving ? 'Processing...' : 'Save & Generate'}</span>
        </button>
      </div>

      {/* Status Footer */}
      <footer className="bg-white dark:bg-[#111318] border-t border-slate-200 dark:border-[#282e39] fixed bottom-0 left-0 right-0 px-6 py-3 flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-600">
        <div className="flex gap-4">
          <span>IDE VERSION: 2.4.0</span>
          <span>AI ENGINE: GEMINI-3-PRO</span>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-1.5">
            <div className="size-1.5 rounded-full bg-emerald-500"></div>
            <span>SYSTEM ONLINE</span>
          </div>
          <span>LATENCY: 42MS</span>
        </div>
      </footer>
    </div>
  );
};

export default Editor;
