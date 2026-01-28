
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col text-white font-display">
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#282e39] px-6 md:px-10 py-3 bg-white dark:bg-background-dark">
        <div className="flex items-center gap-4 text-primary dark:text-white">
          <span className="material-symbols-outlined text-3xl">auto_awesome</span>
          <h2 className="text-lg font-bold tracking-[-0.015em]">AI Code Gen</h2>
        </div>
        <div className="flex items-center gap-4">
          <a className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors" href="#">Help</a>
          <Link to="/login" className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold">
            <span className="truncate">Sign In</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[440px] bg-white dark:bg-[#1c1f27] border border-slate-200 dark:border-[#3b4354] rounded-xl p-8 shadow-2xl">
          {submitted && (
            <div className="flex items-start gap-3 bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6">
              <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
              <p className="text-sm text-slate-900 dark:text-white font-medium leading-tight">
                Password reset instructions have been sent to your email.
              </p>
            </div>
          )}

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center size-12 rounded-full bg-primary/20 mb-4">
              <span className="material-symbols-outlined text-primary text-2xl">lock_reset</span>
            </div>
            <h1 className="text-slate-900 dark:text-white text-3xl font-bold mb-3">Forgot Password?</h1>
            <p className="text-slate-600 dark:text-[#9da6b9] text-base font-normal leading-relaxed">
              Enter the email address associated with your account and we'll send you a link to reset your password.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label className="text-slate-900 dark:text-white text-sm font-medium leading-none ml-1">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#9da6b9] text-xl">mail</span>
                <input className="form-input flex w-full rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-200 dark:border-[#3b4354] bg-slate-50 dark:bg-[#111318] focus:border-primary h-14 placeholder:text-slate-400 dark:placeholder:text-[#5d6b82] pl-12 pr-4 text-base font-normal transition-all" placeholder="e.g., alex@example.com" required type="email" />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button className="group flex w-full cursor-pointer items-center justify-center rounded-lg h-14 px-5 bg-primary hover:bg-primary/90 text-white text-base font-bold transition-all" type="submit">
                <span>Send Reset Link</span>
              </button>
              <Link className="flex items-center justify-center gap-2 text-slate-500 dark:text-[#9da6b9] hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium py-2" to="/login">
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </main>

      <footer className="p-8 text-center">
        <p className="text-slate-400 dark:text-[#3b4354] text-xs font-medium tracking-widest uppercase">
          © 2024 AI Code Gen Platform
        </p>
      </footer>
    </div>
  );
};

export default ForgotPassword;
