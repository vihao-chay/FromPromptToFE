
import React from 'react';
import { Link } from 'react-router-dom';

const Profile: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10 font-display">
      <main className="flex flex-1 justify-center">
        <div className="flex flex-col max-w-[800px] flex-1">
          {/* Page Heading */}
          <div className="flex flex-wrap justify-between gap-3 p-4 mb-4">
            <div className="flex min-w-72 flex-col gap-3">
              <h1 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Edit Profile Settings</h1>
              <p className="text-slate-500 dark:text-[#9da6b9] text-base font-normal leading-normal">Manage your personal information and organization details for your workspace.</p>
            </div>
          </div>

          {/* Main Settings Card */}
          <div className="bg-white dark:bg-[#1c1f27] border border-slate-200 dark:border-[#282e39] rounded-xl overflow-hidden shadow-sm">
            {/* Section: Profile Details */}
            <div className="p-6 border-b border-slate-200 dark:border-[#282e39]">
              <h2 className="text-slate-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">person</span>
                Profile Details
              </h2>
              <div className="space-y-6">
                {/* Read-only Email Field */}
                <div className="flex flex-col gap-2">
                  <label className="flex flex-col w-full">
                    <div className="flex items-center gap-2 pb-2">
                      <p className="text-slate-700 dark:text-white text-sm font-medium leading-normal">Email Address</p>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#282e39] text-slate-500 dark:text-[#9da6b9]">Read-only</span>
                    </div>
                    <div className="flex items-center relative">
                      <input className="form-input flex w-full min-w-0 flex-1 rounded-lg text-slate-500 dark:text-[#9da6b9] border-none bg-slate-50 dark:bg-[#282e39]/50 h-14 p-4 text-base font-normal cursor-not-allowed" readOnly value="student.dev@aigen.edu" />
                      <span className="material-symbols-outlined absolute right-4 text-slate-400">lock</span>
                    </div>
                  </label>
                </div>
                {/* Editable Full Name Field */}
                <div className="flex flex-col gap-2">
                  <label className="flex flex-col w-full">
                    <p className="text-slate-700 dark:text-white text-sm font-medium leading-normal pb-2">Full Name</p>
                    <input className="form-input flex w-full min-w-0 flex-1 rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary border border-slate-200 dark:border-[#3b4354] bg-white dark:bg-[#1c1f27] h-14 p-4 text-base font-normal transition-all" placeholder="Enter your full name" type="text" defaultValue="Alex Rivera" />
                  </label>
                </div>
                {/* Read-only Created Date Field */}
                <div className="flex flex-col gap-2">
                  <label className="flex flex-col w-full">
                    <div className="flex items-center gap-2 pb-2">
                      <p className="text-slate-700 dark:text-white text-sm font-medium leading-normal">Account Created</p>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#282e39] text-slate-500 dark:text-[#9da6b9]">Read-only</span>
                    </div>
                    <div className="flex items-center relative">
                      <input className="form-input flex w-full min-w-0 flex-1 rounded-lg text-slate-500 dark:text-[#9da6b9] border-none bg-slate-50 dark:bg-[#282e39]/50 h-14 p-4 text-base font-normal cursor-not-allowed" readOnly value="October 14, 2023" />
                      <span className="material-symbols-outlined absolute right-4 text-slate-400">calendar_today</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Section: Organization Info */}
            <div className="p-6 bg-slate-50/50 dark:bg-[#21262e]/30">
              <h2 className="text-slate-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">corporate_fare</span>
                Organization Info
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <p className="text-slate-500 dark:text-[#9da6b9] text-xs font-bold uppercase tracking-wider">Organization Name</p>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-white dark:bg-[#1c1f27] border border-slate-200 dark:border-[#3b4354]">
                    <span className="material-symbols-outlined text-slate-400 text-sm">hub</span>
                    <p className="text-slate-900 dark:text-white text-base font-medium">Main Workspace</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-slate-500 dark:text-[#9da6b9] text-xs font-bold uppercase tracking-wider">Your Role</p>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-white dark:bg-[#1c1f27] border border-slate-200 dark:border-[#3b4354]">
                    <span className="material-symbols-outlined text-primary text-sm">verified_user</span>
                    <p className="text-slate-900 dark:text-white text-base font-medium">OWNER</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-[#282e39] flex justify-end gap-4 bg-white dark:bg-[#1c1f27]">
              <button className="px-6 h-12 rounded-lg text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-[#282e39] transition-all">
                Cancel
              </button>
              <button className="px-8 h-12 rounded-lg bg-primary text-white font-bold hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-lg">save</span>
                Save Changes
              </button>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-slate-500 dark:text-[#9da6b9] text-sm italic">
            <span className="material-symbols-outlined text-sm">info</span>
            <span>To change your organization name or role, please contact the system administrator.</span>
          </div>

          {/* Account Details Minimal Card (Extra from user screenshots) */}
          <div className="mt-16 w-full max-w-md mx-auto bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden">
            <div className="pt-8 pb-4 text-center border-b border-slate-100 dark:border-slate-800/50">
              <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400 dark:text-slate-500">Account Summary</h2>
            </div>
            <div className="p-8 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="h-24 w-24 rounded-full bg-slate-200 dark:bg-slate-800 bg-cover bg-center border-4 border-white dark:border-slate-900 shadow-lg" style={{ backgroundImage: 'url("https://picsum.photos/200/200")' }}></div>
                <div className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full border-2 border-white dark:border-slate-900">
                  <span className="material-symbols-outlined text-xs">verified</span>
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold tracking-tight">Alex Rivera</h3>
                <p className="text-primary font-medium">alex.rivera@university.edu</p>
                <div className="flex items-center justify-center gap-2 mt-2 text-slate-500 text-sm">
                  <span className="material-symbols-outlined text-base">calendar_today</span>
                  <span>Member since Sept 2023</span>
                </div>
              </div>
            </div>
            <div className="px-8 py-4 bg-slate-50/50 dark:bg-slate-800/20 grid grid-cols-2 gap-4">
              <div className="flex flex-col border-r border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Plan</span>
                <span className="text-sm font-semibold">Student Tier</span>
              </div>
              <div className="flex flex-col pl-4">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Status</span>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary"></span>
                  <span className="text-sm font-semibold">Active</span>
                </div>
              </div>
            </div>
            <div className="p-8 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-col gap-3">
                <Link to="/login" className="w-full h-12 flex items-center justify-center gap-2 bg-primary hover:bg-blue-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined">logout</span>
                  <span>Logout Account</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
