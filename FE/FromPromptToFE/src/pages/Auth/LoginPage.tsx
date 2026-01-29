import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface LoginPageProps {
    onLogin?: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (email === 'admin@gmail.com' && password === '123456') {
            onLogin?.();
            navigate('/dashboard');
        } else {
            setError('Invalid email or password. Try admin@gmail.com / 123456');
        }
    };

    const handleDemoLogin = () => {
        // Auto-fill and login
        setEmail('admin@gmail.com');
        setPassword('123456');
        onLogin?.();
        navigate('/dashboard');
    };

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display transition-colors duration-300">
            {/* Top Navigation Bar (Simplified for Login) */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 dark:border-[#282e39] px-6 py-4 lg:px-10">
                <div className="flex items-center gap-3 text-gray-900 dark:text-white">
                    <div className="size-8 text-primary">
                        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
                            <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
                        </svg>
                    </div>
                    <h2 className="text-gray-900 dark:text-white text-xl font-bold leading-tight tracking-tight">AI CodeGen</h2>
                </div>
                <div>
                    <a className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary transition-colors" href="#">Documentation</a>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center p-6 bg-mesh relative">
                <style>{`
            .bg-mesh {
                background-color: #101622;
                background-image: 
                    radial-gradient(at 0% 0%, rgba(19, 91, 236, 0.15) 0px, transparent 50%),
                    radial-gradient(at 100% 100%, rgba(19, 91, 236, 0.1) 0px, transparent 50%);
            }
        `}</style>
                <div className="layout-content-container flex flex-col w-full max-w-[440px] bg-white dark:bg-[#1c1f27] border border-gray-200 dark:border-[#3b4354] rounded-xl shadow-2xl overflow-hidden p-8 lg:p-10">
                    {/* Headline and Subtext */}
                    <div className="mb-8">
                        <h1 className="text-gray-900 dark:text-white tracking-tight text-3xl font-bold leading-tight text-center pb-2">Welcome Back</h1>
                        <p className="text-gray-600 dark:text-gray-400 text-base font-normal leading-normal text-center">Enter your details to access your dashboard</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    {/* Login Form */}
                    <form className="space-y-5">
                    <form className="space-y-5" onSubmit={handleLogin}>
                        {/* Email Field */}
                        <div className="flex flex-col gap-2">
                            <label className="text-gray-900 dark:text-white text-sm font-medium leading-normal">Email Address</label>
                            <input
                                className="form-input w-full rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-200 dark:border-[#3b4354] bg-gray-50 dark:bg-[#111318] focus:border-primary h-12 placeholder:text-gray-400 dark:placeholder:text-[#9da6b9] px-4 text-sm transition-all"
                                placeholder="user@gmail.com"
                                required
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {/* Password Field */}
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <label className="text-gray-900 dark:text-white text-sm font-medium leading-normal">Password</label>
                                <Link to="/forgot-password" className="text-xs font-semibold text-primary hover:underline">Forgot password?</Link>
                            </div>
                            <div className="relative flex items-center">
                                <input
                                    className="form-input w-full rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-200 dark:border-[#3b4354] bg-gray-50 dark:bg-[#111318] focus:border-primary h-12 placeholder:text-gray-400 dark:placeholder:text-[#9da6b9] px-4 text-sm transition-all"
                                    placeholder="••••••••"
                                    required
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    className="absolute right-3 text-gray-400 dark:text-[#9da6b9] hover:text-primary transition-colors focus:outline-none pt-1.5"
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <span className="material-symbols-outlined text-[20px]">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center gap-2 py-1">
                            <input className="w-4 h-4 rounded border-gray-300 dark:border-[#3b4354] bg-gray-50 dark:bg-[#111318] text-primary focus:ring-primary" id="remember" type="checkbox" />
                            <label className="text-xs text-gray-600 dark:text-gray-400" htmlFor="remember">Keep me logged in for 30 days</label>
                        </div>

                        {/* Action Button */}
                        <button className="w-full flex cursor-pointer items-center justify-center rounded-lg h-12 px-4 bg-primary hover:bg-primary/90 text-white text-base font-bold transition-all shadow-lg shadow-primary/20" type="submit">
                            Sign In
                        </button>

                        {/* DEV ONLY: Bypass Login Button */}
                        <button
                            type="button"
                            onClick={onLogin}
                            className="w-full flex cursor-pointer items-center justify-center rounded-lg h-10 px-4 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-all"
                        >
                            ⚡ DEV: Quick Login (Bypass)
                        </button>
                    </form>

                    {/* Social Logins */}
                    <div className="mt-8">
                        <div className="relative flex items-center justify-center mb-6">
                            <div className="border-t border-gray-200 dark:border-[#3b4354] w-full"></div>
                            <span className="absolute bg-white dark:bg-[#1c1f27] px-4 text-xs text-gray-500 dark:text-gray-400">Or continue with</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex items-center justify-center gap-2 h-11 border border-gray-200 dark:border-[#3b4354] rounded-lg hover:bg-gray-50 dark:hover:bg-[#282e39] transition-colors text-gray-700 dark:text-white text-sm font-medium">
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M12 12.713V24h4.662C21.053 24 24 20.927 24 17.112v-4.399h-12z" fill="#4285F4"></path>
                                    <path d="M0 12.713h12V24H0V12.713z" fill="#34A853"></path>
                                    <path d="M0 0h12v12.713H0V0z" fill="#FBBC05"></path>
                                    <path d="M12 0h7.338C21.913 0 24 2.087 24 4.662v8.051H12V0z" fill="#EA4335"></path>
                                </svg>
                                Google
                            </button>
                            <button className="flex items-center justify-center gap-2 h-11 border border-gray-200 dark:border-[#3b4354] rounded-lg hover:bg-gray-50 dark:hover:bg-[#282e39] transition-colors text-gray-700 dark:text-white text-sm font-medium">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
                                </svg>
                                GitHub
                            </button>
                        </div>
                    </div>

                    {/* Footer Link */}
                    <div className="mt-10 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-normal">
                            Don't have an account?
                            <Link to="/register" className="text-primary font-bold hover:underline transition-all ml-1">Sign up</Link>
                        </p>
                    </div>
                </div>
            </main>

            {/* Simple Footer */}
            <footer className="p-6 text-center text-xs text-gray-500 dark:text-gray-500 border-t border-gray-200 dark:border-[#282e39]">
                <p>© 2024 AI CodeGen Project. Built for students, by students.</p>
            </footer>
        </div>
    );
}
