import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import authService, { getAuthErrorMessage } from "../../services/authService";

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing signature (token).');
        }
    }, [token]);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!token) {
            setError('Missing reset token.');
            return;
        }

        if (!newPassword || !confirmPassword) {
            setError('Please fill in all fields.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await authService.resetPassword(token, newPassword);

            // Auto Login Logic
            if (response && response.data && response.data.token) {
                const { token, refreshToken, role, email: userEmail, name, avatarUrl } = response.data;
                localStorage.setItem('accessToken', token);
                localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('user', JSON.stringify({ email: userEmail, role, name, avatarUrl }));

                setSuccess(true);
                // Delay redirect slightly to show success message
                setTimeout(() => {
                    navigate('/');
                }, 1500);
            } else {
                // Fallback
                setSuccess(true);
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }

        } catch (err: any) {
            console.error(err);
            setError(getAuthErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

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
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-[440px] bg-white dark:bg-[#1c1f27] border border-slate-200 dark:border-[#3b4354] rounded-xl p-8 shadow-2xl">

                    {/* Header Section */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center size-12 rounded-full bg-primary/20 mb-4">
                            <span className="material-symbols-outlined text-primary text-2xl">key</span>
                        </div>
                        <h1 className="text-slate-900 dark:text-white text-3xl font-bold font-display mb-3">Reset Password</h1>
                        <p className="text-slate-600 dark:text-[#9da6b9] text-base font-normal leading-relaxed">
                            Enter your new password below.
                        </p>
                    </div>

                    {/* Success Message */}
                    {success && (
                        <div className="flex items-start gap-3 bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
                            <span className="material-symbols-outlined text-green-500 text-xl">check_circle</span>
                            <div>
                                <h4 className="text-slate-900 dark:text-white font-bold text-sm mb-1">Success!</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-tight">
                                    Your password has been reset. Redirecting to Dashboard...
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                            <span className="material-symbols-outlined text-red-500 text-xl">error</span>
                            <p className="text-sm text-red-600 dark:text-red-400 font-medium leading-tight">
                                {error}
                            </p>
                        </div>
                    )}

                    {!success && (
                        <form className="space-y-6" onSubmit={handleResetPassword}>
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-slate-900 dark:text-white text-sm font-medium leading-none ml-1">New Password</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#9da6b9] text-xl">lock</span>
                                        <input
                                            className="form-input flex w-full rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-200 dark:border-[#3b4354] bg-slate-50 dark:bg-[#111318] focus:border-primary h-14 placeholder:text-slate-400 dark:placeholder:text-[#5d6b82] pl-12 pr-4 text-base font-normal transition-all"
                                            placeholder="Enter new password"
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-slate-900 dark:text-white text-sm font-medium leading-none ml-1">Confirm Password</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#9da6b9] text-xl">lock_clock</span>
                                        <input
                                            className="form-input flex w-full rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-200 dark:border-[#3b4354] bg-slate-50 dark:bg-[#111318] focus:border-primary h-14 placeholder:text-slate-400 dark:placeholder:text-[#5d6b82] pl-12 pr-4 text-base font-normal transition-all"
                                            placeholder="Confirm new password"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                className="group flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 px-5 bg-primary hover:bg-primary/90 text-white text-base font-bold leading-normal tracking-[0.015em] transition-all relative disabled:opacity-70 disabled:cursor-not-allowed"
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                                        <span>Resetting...</span>
                                    </div>
                                ) : (
                                    <span className="truncate">Reset Password</span>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </main>

            <footer className="p-8 text-center">
                <p className="text-slate-400 dark:text-[#3b4354] text-xs font-medium tracking-widest uppercase">
                    © 2024 AI Code Gen Student Project
                </p>
            </footer>
        </div>
    );
}
