
import React from 'react';
import { Link } from 'react-router-dom';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display transition-colors duration-300">
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-[#282e39] px-6 py-4 lg:px-10">
        <div className="flex items-center gap-3 text-slate-900 dark:text-white">
          <div className="size-8 text-primary">
            <span className="material-symbols-outlined text-3xl">auto_awesome</span>
          </div>
          <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-tight">AI CodeGen</h2>
        </div>
        <div>
          <a className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" href="#">Documentation</a>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 relative">
        {/* Background Mesh */}
        <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-40">
           <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(at 0% 0%, rgba(19, 91, 236, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(19, 91, 236, 0.1) 0px, transparent 50%)' }}></div>
        </div>

        <div className="layout-content-container relative flex flex-col w-full max-w-[440px] bg-white dark:bg-[#1c1f27] border border-slate-200 dark:border-[#3b4354] rounded-xl shadow-2xl overflow-hidden p-8 lg:p-10">
          <div className="mb-8">
            <h1 className="text-slate-900 dark:text-white tracking-tight text-3xl font-bold leading-tight text-center pb-2">Welcome Back</h1>
            <p className="text-slate-600 dark:text-slate-400 text-base font-normal leading-normal text-center">Enter your details to access your dashboard</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label className="text-slate-900 dark:text-white text-sm font-medium">Email Address</label>
              <input className="form-input w-full rounded-lg text-slate-900 dark:text-white border border-slate-200 dark:border-[#3b4354] bg-slate-50 dark:bg-[#111318] focus:ring-2 focus:ring-primary/50 focus:border-primary h-12 px-4 text-sm transition-all" placeholder="name@university.edu" required type="email" />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-slate-900 dark:text-white text-sm font-medium">Password</label>
                <Link className="text-xs font-semibold text-primary hover:underline" to="/forgot-password">Forgot password?</Link>
              </div>
              <div className="relative flex items-center">
                <input className="form-input w-full rounded-lg text-slate-900 dark:text-white border border-slate-200 dark:border-[#3b4354] bg-slate-50 dark:bg-[#111318] focus:ring-2 focus:ring-primary/50 focus:border-primary h-12 px-4 text-sm transition-all" placeholder="••••••••" required type="password" />
                <button className="absolute right-3 text-slate-400 dark:text-[#9da6b9] hover:text-primary transition-colors" type="button">
                  <span className="material-symbols-outlined text-[20px]">visibility</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 py-1">
              <input className="w-4 h-4 rounded border-slate-300 dark:border-[#3b4354] bg-slate-50 dark:bg-[#111318] text-primary focus:ring-primary" id="remember" type="checkbox" />
              <label className="text-xs text-slate-600 dark:text-slate-400" htmlFor="remember">Keep me logged in for 30 days</label>
            </div>

            <button className="w-full flex cursor-pointer items-center justify-center rounded-lg h-12 px-4 bg-primary hover:bg-primary/90 text-white text-base font-bold transition-all shadow-lg shadow-primary/20" type="submit">
              Sign In
            </button>
          </form>

          <div className="mt-8">
            <div className="relative flex items-center justify-center mb-6">
              <div className="border-t border-slate-200 dark:border-[#3b4354] w-full"></div>
              <span className="absolute bg-white dark:bg-[#1c1f27] px-4 text-xs text-slate-500 dark:text-slate-400">Or continue with</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 h-11 border border-slate-200 dark:border-[#3b4354] rounded-lg hover:bg-slate-50 dark:hover:bg-[#282e39] transition-colors text-slate-700 dark:text-white text-sm font-medium">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M12 12.713V24h4.662C21.053 24 24 20.927 24 17.112v-4.399h-12z" fill="#4285F4"></path>
                  <path d="M0 12.713h12V24H0V12.713z" fill="#34A853"></path>
                  <path d="M0 0h12v12.713H0V0z" fill="#FBBC05"></path>
                  <path d="M12 0h7.338C21.913 0 24 2.087 24 4.662v8.051H12V0z" fill="#EA4335"></path>
                </svg>
                Google
              </button>
              <button className="flex items-center justify-center gap-2 h-11 border border-slate-200 dark:border-[#3b4354] rounded-lg hover:bg-slate-50 dark:hover:bg-[#282e39] transition-colors text-slate-700 dark:text-white text-sm font-medium">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
                </svg>
                GitHub
              </button>
            </div>
          </div>

          <div className="mt-10 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400 font-normal">
              Don't have an account? <a className="text-primary font-bold hover:underline" href="#">Sign up</a>
            </p>
          </div>
        </div>
      </main>

      <footer className="p-6 text-center text-xs text-slate-500 border-t border-slate-200 dark:border-[#282e39]">
        <p>© 2024 AI CodeGen Project. Built for professional engineers.</p>
      </footer>
    </div>
  );
};

export default Login;
