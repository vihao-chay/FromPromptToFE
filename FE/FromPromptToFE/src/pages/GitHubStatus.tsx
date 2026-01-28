
import React from 'react';
import { Link } from 'react-router-dom';

const GitHubStatus: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10 font-display">
      <main className="flex flex-col max-w-[800px] mx-auto flex-1">
        <div className="flex flex-col items-center text-center pb-8 pt-4">
          <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-primary text-[48px]">check_circle</span>
          </div>
          <h1 className="text-slate-900 dark:text-white tracking-tight text-[32px] font-bold leading-tight px-4">
            Code pushed to GitHub successfully
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md">Your latest changes are now live on your repository and ready for deployment.</p>
        </div>

        <div className="p-4">
          <div className="flex flex-col md:flex-row items-stretch justify-between gap-6 rounded-xl bg-white dark:bg-[#1c1f27] p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex flex-[2_2_0px] flex-col justify-between gap-4">
              <div className="flex flex-col gap-2">
                <p className="text-slate-900 dark:text-white text-base font-bold leading-tight">Repository URL</p>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#282e39] p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="material-symbols-outlined text-slate-400 text-sm">link</span>
                  <p className="text-slate-700 dark:text-[#9da6b9] text-sm font-mono truncate">https://github.com/alexdev/student-ai-project</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="flex min-w-[120px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-slate-200 dark:bg-[#282e39] text-slate-700 dark:text-white hover:bg-slate-300 dark:hover:bg-[#343b48] transition-all gap-2 text-sm font-medium">
                  <span className="material-symbols-outlined text-[18px]">content_copy</span>
                  <span className="truncate">Copy URL</span>
                </button>
              </div>
            </div>
            <div className="hidden md:block w-48 h-32 bg-center bg-no-repeat bg-cover rounded-lg ring-1 ring-slate-200 dark:ring-slate-700" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDoZUvm3zLAN6trwHm_b6P8tpRtTEsaXyi9ltL4s9hTuGoNhT4BukfFE4jbj-wU8MyATxTXBHDlRGNJ6BOAZiwBqpRScR2A3VvmPJ6gKhZN1QA0js8_l5i9PwplPV_0ior9OzSnZv94O9pSfyA5I2Ddqs8LwUBiFehx4uHX3fesGLkrQjxuGNUY5jp-JMAMzg5jBork1S_74_uPXQeqlrXK7UBd5mXNjTd0p_irTX2S6ri6-cpVNs0EhXsNbMXyebVYelIxBNeZgz1G")' }}></div>
          </div>
        </div>

        <div className="flex px-4 py-6 justify-center">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex min-w-[200px] cursor-pointer items-center justify-center rounded-xl h-14 px-8 bg-primary text-white hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 gap-3 text-base font-bold tracking-tight">
            <span className="material-symbols-outlined text-[24px]">open_in_new</span>
            <span className="truncate">View on GitHub</span>
          </a>
        </div>

        <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-4">
          <h2 className="text-slate-900 dark:text-white text-[22px] font-bold leading-tight tracking-tight px-4 pb-4 pt-5">Recent Activity</h2>
          <div className="flex flex-col gap-3 px-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 dark:bg-[#1c1f27] border border-slate-100 dark:border-slate-800/50">
              <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[20px]">upload</span>
              </div>
              <div className="flex-1">
                <p className="text-slate-900 dark:text-white text-sm font-bold">Successfully pushed to main</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Pushed 3 modified components to GitHub</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-xs">Just now</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-transparent border border-slate-200 dark:border-slate-800/30">
              <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-[20px]">build</span>
              </div>
              <div className="flex-1">
                <p className="text-slate-700 dark:text-slate-300 text-sm font-medium">Build successful</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Production build completed in 42s</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-xs">4 mins ago</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 mb-10 flex justify-center px-4">
          <Link to="/preview" className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Code Editor
          </Link>
        </div>
      </main>
    </div>
  );
};

export default GitHubStatus;
