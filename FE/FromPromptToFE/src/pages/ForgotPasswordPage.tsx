import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col text-slate-900 dark:text-white font-display">
            {/* Top Navigation Bar */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-[#282e39] px-6 md:px-10 py-3 bg-white dark:bg-background-dark">
                <div className="flex items-center gap-4 text-slate-900 dark:text-white">
                    <div className="size-6 text-primary">
                        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" fill="currentColor"></path>
                        </svg>
                    </div>
                    <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] font-display">AI Code Gen</h2>
                </div>
                <div className="flex items-center gap-4">
                    <a className="text-sm font-medium text-slate-500 dark:text-[#9da6b9] hover:text-slate-900 dark:hover:text-white transition-colors" href="#">Help</a>
                    <Link to="/register" className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors">
                        <span className="truncate">Sign Up</span>
                    </Link>
                </div>
            </header>

            {/* Main Content: Forgot Password Card */}
            <main className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-[440px] bg-white dark:bg-[#1c1f27] border border-slate-200 dark:border-[#3b4354] rounded-xl p-8 shadow-2xl">
                    {/* Success Message (Initial Hidden State Concept) */}
                    <div className="hidden flex items-start gap-3 bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6">
                        <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                        <p className="text-sm text-slate-900 dark:text-white font-medium leading-tight">
                            Password reset instructions have been sent to your email.
                        </p>
                    </div>

                    {/* Header Section */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center size-12 rounded-full bg-primary/20 mb-4">
                            <span className="material-symbols-outlined text-primary text-2xl">lock_reset</span>
                        </div>
                        <h1 className="text-slate-900 dark:text-white text-3xl font-bold font-display mb-3">Forgot Password?</h1>
                        <p className="text-slate-600 dark:text-[#9da6b9] text-base font-normal leading-relaxed">
                            Enter the email address associated with your account and we'll send you a link to reset your password.
                        </p>
                    </div>

                    {/* Recovery Form */}
                    <form className="space-y-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-slate-900 dark:text-white text-sm font-medium leading-none ml-1">Email Address</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#9da6b9] text-xl">mail</span>
                                <input className="form-input flex w-full rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-200 dark:border-[#3b4354] bg-slate-50 dark:bg-[#111318] focus:border-primary h-14 placeholder:text-slate-400 dark:placeholder:text-[#5d6b82] pl-12 pr-4 text-base font-normal transition-all" placeholder="e.g., alex@example.com" required type="email" />
                            </div>
                        </div>

                        {/* Action Button with Loading State Representation */}
                        <div className="flex flex-col gap-4">
                            <button className="group flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 px-5 bg-primary hover:bg-primary/90 text-white text-base font-bold leading-normal tracking-[0.015em] transition-all relative" type="submit">
                                {/* Loading indicator (simulated) */}
                                <div className="absolute inset-0 flex items-center justify-center bg-primary opacity-0 group-active:opacity-100 transition-opacity">
                                    <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                                    <span>Processing...</span>
                                </div>
                                <span className="truncate group-active:hidden">Send Reset Link</span>
                            </button>

                            {/* Back to Login Link */}
                            <Link to="/login" className="flex items-center justify-center gap-2 text-slate-500 dark:text-[#9da6b9] hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium py-2">
                                <span className="material-symbols-outlined text-lg">arrow_back</span>
                                Back to Login
                            </Link>
                        </div>
                    </form>
                </div>
            </main>

            {/* Footer Decoration */}
            <footer className="p-8 text-center">
                <p className="text-slate-400 dark:text-[#3b4354] text-xs font-medium tracking-widest uppercase">
                    © 2024 AI Code Gen Student Project
                </p>
            </footer>

            {/* Success Message Preview (Visible for the prompt's requirement) */}
            <div className="fixed bottom-10 right-10 max-w-sm animate-fade-in">
                <div className="flex items-start gap-4 bg-white dark:bg-[#1c1f27] border-l-4 border-primary rounded-lg p-5 shadow-2xl border border-slate-100 dark:border-none">
                    <div className="flex-shrink-0">
                        <span className="material-symbols-outlined text-primary text-3xl">mark_email_read</span>
                    </div>
                    <div>
                        <h4 className="text-slate-900 dark:text-white font-bold text-sm mb-1">Link Sent!</h4>
                        <p className="text-slate-600 dark:text-[#9da6b9] text-xs leading-normal">
                            Password reset instructions have been sent to your email. Please check your inbox.
                        </p>
                    </div>
                    <button className="text-slate-400 dark:text-[#5d6b82] hover:text-slate-900 dark:hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
