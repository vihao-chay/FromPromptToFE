
import React from 'react';
import { useNavigate } from 'react-router-dom';

const GitHubIntegration: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-display">
      <main className="flex flex-col max-w-[800px] mx-auto flex-1 gap-6">
        <div className="flex flex-wrap justify-between gap-3">
          <div className="flex min-w-72 flex-col gap-2">
            <p className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">GitHub Integration</p>
            <p className="text-slate-600 dark:text-[#9da6b9] text-base font-normal">Connect your project to a remote repository to automate deployments and version control.</p>
          </div>
        </div>

        <div className="px-0">
          <div className="flex items-center justify-between gap-6 rounded-xl bg-white dark:bg-[#1c1f27] p-6 border border-slate-200 dark:border-[#282e39] shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <span className="material-symbols-outlined text-primary text-[32px]">account_circle</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <p className="text-slate-900 dark:text-white text-lg font-bold leading-tight">Connected as @student-dev</p>
                  <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-wider border border-green-500/30">Active</span>
                </div>
                <p className="text-slate-500 dark:text-[#9da6b9] text-sm font-normal">Last synced 2 minutes ago</p>
              </div>
            </div>
            <button className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-slate-100 dark:bg-[#282e39] hover:bg-slate-200 dark:hover:bg-[#3b4354] text-slate-900 dark:text-white gap-2 text-sm font-medium transition-all border border-slate-200 dark:border-[#3b4354]">
              <span className="material-symbols-outlined text-[18px]">link_off</span>
              <span className="truncate">Disconnect</span>
            </button>
          </div>
        </div>

        <div className="pt-4">
          <h2 className="text-slate-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">Repository Configuration</h2>
          <div className="mt-1">
            <div className="h-1 w-12 bg-primary rounded-full"></div>
          </div>
        </div>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <label className="flex flex-col flex-1">
              <p className="text-slate-700 dark:text-white text-sm font-medium leading-normal pb-2">Repository Name</p>
              <div className="flex w-full items-stretch rounded-lg shadow-sm">
                <input className="form-input flex w-full min-w-0 flex-1 rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-1 focus:ring-primary border border-slate-200 dark:border-[#3b4354] bg-white dark:bg-[#1c1f27] focus:border-primary h-14 placeholder:text-slate-400 dark:placeholder:text-[#4d576e] p-[15px] rounded-r-none border-r-0 pr-2 text-base font-normal" placeholder="my-awesome-frontend-app" defaultValue="ai-generator-student-project" />
                <div className="text-slate-400 dark:text-[#9da6b9] flex border border-slate-200 dark:border-[#3b4354] bg-slate-50 dark:bg-[#1c1f27] items-center justify-center pr-[15px] rounded-r-lg border-l-0">
                  <span className="material-symbols-outlined">account_tree</span>
                </div>
              </div>
            </label>
            <p className="text-slate-500 dark:text-[#5d6a85] text-xs">A new public repository will be created if it doesn't exist.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col flex-1">
              <p className="text-slate-700 dark:text-white text-sm font-medium leading-normal pb-2">Frontend Framework</p>
              <div className="flex w-full items-stretch rounded-lg opacity-80 cursor-not-allowed">
                <div className="flex w-full min-w-0 flex-1 items-center rounded-lg text-slate-600 dark:text-white border border-slate-200 dark:border-[#3b4354] bg-slate-100 dark:bg-[#161921] h-14 px-[15px] rounded-r-none border-r-0 pr-2 text-base font-normal">
                  React (Vite)
                </div>
                <div className="text-slate-400 dark:text-[#9da6b9] flex border border-slate-200 dark:border-[#3b4354] bg-slate-100 dark:bg-[#161921] items-center justify-center pr-[15px] rounded-r-lg border-l-0">
                  <span className="material-symbols-outlined">inventory_2</span>
                </div>
              </div>
            </label>
            <label className="flex flex-col flex-1">
              <p className="text-slate-700 dark:text-white text-sm font-medium leading-normal pb-2">Target Branch</p>
              <div className="flex w-full items-stretch rounded-lg">
                <select className="form-select flex w-full min-w-0 flex-1 rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-1 focus:ring-primary border border-slate-200 dark:border-[#3b4354] bg-white dark:bg-[#1c1f27] focus:border-primary h-14 px-[15px] text-base font-normal appearance-none">
                  <option>main</option>
                  <option>develop</option>
                  <option>staging</option>
                </select>
              </div>
            </label>
          </div>

          <label className="flex flex-col flex-1">
            <p className="text-slate-700 dark:text-white text-sm font-medium leading-normal pb-2">Initial Commit Message</p>
            <div className="flex w-full items-stretch rounded-lg">
              <textarea className="form-textarea flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-1 focus:ring-primary border border-slate-200 dark:border-[#3b4354] bg-white dark:bg-[#1c1f27] focus:border-primary min-h-[100px] placeholder:text-slate-400 dark:placeholder:text-[#4d576e] p-[15px] text-base font-normal" placeholder="Describe your changes...">Initial commit: Scaffolding generated by AI Frontend Generator</textarea>
            </div>
          </label>
        </div>

        <div className="py-6 border-t border-slate-200 dark:border-[#282e39] mt-4">
          <button 
            className="w-full flex cursor-pointer items-center justify-center rounded-xl h-16 px-6 bg-primary hover:bg-primary/90 text-white gap-3 text-lg font-bold transition-all shadow-[0_0_20px_rgba(19,91,236,0.3)] group"
            onClick={() => navigate('/github-status')}
          >
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">cloud_upload</span>
            <span>Push Code to GitHub</span>
          </button>
          <p className="text-center text-slate-500 dark:text-[#5d6a85] text-sm mt-4">
            By clicking, you agree to create a repository and push the generated source code to your GitHub account.
          </p>
        </div>

        <div className="pb-10">
          <div className="rounded-lg border border-slate-200 dark:border-[#282e39] bg-[#0d1117] overflow-hidden">
            <div className="bg-slate-50 dark:bg-[#1c2128] px-4 py-2 border-b border-slate-200 dark:border-[#282e39] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-[#ff5f56]"></div>
                <div className="size-3 rounded-full bg-[#ffbd2e]"></div>
                <div className="size-3 rounded-full bg-[#27c93f]"></div>
                <span className="ml-4 text-xs text-slate-500 dark:text-[#9da6b9] font-mono">deployment_preview.sh</span>
              </div>
              <span className="material-symbols-outlined text-slate-400 dark:text-[#4d576e] text-sm">content_copy</span>
            </div>
            <div className="p-6 font-mono text-xs text-green-400 leading-relaxed">
              <p><span className="text-blue-400">git</span> init</p>
              <p><span className="text-blue-400">git</span> add .</p>
              <p><span className="text-blue-400">git</span> commit -m "Initial commit from AI Generator"</p>
              <p><span className="text-blue-400">git</span> remote add origin https://github.com/student-dev/ai-generator-project.git</p>
              <p><span className="text-blue-400">git</span> push -u origin main</p>
              <p className="text-white mt-2 animate-pulse">_</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GitHubIntegration;
