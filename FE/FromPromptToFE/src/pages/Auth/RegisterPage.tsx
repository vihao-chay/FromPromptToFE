import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import authService from '@/src/services/authService';

export default function RegisterPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await authService.register(email, password);
            console.log("Register success", response.data);

            // Response structure: { success: true, message: "...", content: { verifyToken: "..." }, statusCode: 200 }
            if (response.data.success) {
                setSuccessMessage(response.data.message || 'Registration successful! Please check your email to verify your account.');
                // Optionally extract verifyToken if needed for next steps, but usually it's in the email.
                // const verifyToken = response.data.content?.verifyToken;

                // Clear form or redirect after a delay
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(response.data.message || 'Registration failed.');
            }

        } catch (err: any) {
            console.error("Register error", err);
            const errorMessage = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white min-h-screen flex flex-col font-display transition-colors duration-300">
            {/* Top Navigation Bar */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-[#282e39] px-6 md:px-10 py-3 bg-white dark:bg-background-dark">
                <div className="flex items-center gap-4 text-slate-900 dark:text-white">
                    <div className="size-6 text-primary">
                        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" fill="currentColor"></path>
                        </svg>
                    </div>
                    <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">AI Code Gen</h2>
                </div>
                <Link className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors" to="/login">
                    <span className="truncate">Login</span>
                </Link>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
                <div className="w-full max-w-[480px] flex flex-col">
                    {/* Headline and Body Text Section */}
                    <div className="mb-8">
                        <h1 className="text-slate-900 dark:text-white tracking-tight text-[32px] font-bold leading-tight text-center pb-2">Create an Account</h1>
                        <p className="text-slate-600 dark:text-slate-400 text-base font-normal leading-normal text-center">Start generating frontend code with AI.</p>
                    </div>

                    {/* Registration Form Card */}
                    <div className="bg-white dark:bg-[#1c1f27] border border-slate-200 dark:border-[#3b4354] rounded-xl p-6 md:p-8 shadow-xl">

                        {/* Success Message */}
                        {successMessage && (
                            <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm rounded-lg text-center">
                                <p className="font-bold mb-1">Success!</p>
                                {successMessage}
                                <p className="mt-2 text-xs">Redirecting to login in 3 seconds...</p>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg text-center">
                                {error}
                            </div>
                        )}

                        <form className="space-y-5" onSubmit={handleRegister}>
                            {/* Email Field */}
                            <div className="flex flex-col gap-2">
                                <label className="flex flex-col">
                                    <p className="text-slate-900 dark:text-white text-sm font-medium leading-normal pb-2">Email (Required)</p>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
                                        <input
                                            className="form-input flex w-full rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-200 dark:border-[#3b4354] bg-slate-50 dark:bg-[#111318] focus:border-primary h-14 placeholder:text-slate-400 dark:placeholder:text-[#9da6b9] pl-12 pr-4 text-base font-normal transition-all"
                                            placeholder="Enter your email address"
                                            required
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={isLoading}
                                        />
                                    </div>
                                </label>
                            </div>

                            {/* Password Field */}
                            <div className="flex flex-col gap-2">
                                <label className="flex flex-col">
                                    <p className="text-slate-900 dark:text-white text-sm font-medium leading-normal pb-2">Password (Required)</p>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                                        <input
                                            className="form-input flex w-full rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-200 dark:border-[#3b4354] bg-slate-50 dark:bg-[#111318] focus:border-primary h-14 placeholder:text-slate-400 dark:placeholder:text-[#9da6b9] pl-12 pr-12 text-base font-normal transition-all"
                                            placeholder="Create a strong password"
                                            required
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={isLoading}
                                        />
                                        <button
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors focus:outline-none"
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                        </button>
                                    </div>
                                </label>
                            </div>

                            {/* Confirm Password Field */}
                            <div className="flex flex-col gap-2">
                                <label className="flex flex-col">
                                    <p className="text-slate-900 dark:text-white text-sm font-medium leading-normal pb-2">Confirm Password (Required)</p>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock_reset</span>
                                        <input
                                            className="form-input flex w-full rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-200 dark:border-[#3b4354] bg-slate-50 dark:bg-[#111318] focus:border-primary h-14 placeholder:text-slate-400 dark:placeholder:text-[#9da6b9] pl-12 pr-12 text-base font-normal transition-all"
                                            placeholder="Repeat your password"
                                            required
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            disabled={isLoading}
                                        />
                                        <button
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors focus:outline-none"
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            <span className="material-symbols-outlined">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                                        </button>
                                    </div>
                                </label>
                                {/* Validation Hint (Optional) */}
                                <p className={`text-xs mt-1 transition-colors ${password && confirmPassword && password !== confirmPassword ? 'text-red-500 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                                    {password && confirmPassword && password !== confirmPassword ? 'Passwords do not match.' : 'Make sure your passwords match.'}
                                </p>
                            </div>

                            {/* Primary Action Button */}
                            <div className="pt-4">
                                <button
                                    className={`w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 px-4 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98] ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    <span className="truncate uppercase tracking-wider">
                                        {isLoading ? 'Creating Account...' : 'Create Account'}
                                    </span>
                                </button>
                            </div>
                        </form>

                        {/* Footer Links */}
                        <div className="mt-8 text-center border-t border-slate-100 dark:border-[#282e39] pt-6">
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                                Already have an account?
                                <Link className="text-primary font-bold hover:underline ml-1" to="/login">Login</Link>
                            </p>
                        </div>
                    </div>

                    {/* Additional Footer Content */}
                    <div className="mt-8 text-center flex flex-col items-center gap-2">
                        <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500 font-medium">
                            <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
                            <span>•</span>
                            <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
                        </div>
                        <p className="text-[10px] text-slate-400/50 uppercase tracking-widest mt-2">© 2024 AI Code Generator Project</p>
                    </div>
                </div>
            </main>

            {/* Decorative Element */}
            <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary/10 via-primary to-primary/10 opacity-30"></div>
        </div>
    );
}
