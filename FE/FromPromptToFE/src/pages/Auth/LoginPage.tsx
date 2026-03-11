import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";

function getRoleFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return (
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
      payload["role"] ??
      null
    );
  } catch {
    return null;
  }
}

import authService, { getAuthErrorMessage } from "@/src/services/authService";
import { Google } from "@/src/assets/icons/Google";
import { GitHub } from "@/src/assets/icons/Github";
import { GITHUB_OAUTH_URL } from "@/src/constants/githubConfig";

interface LoginPageProps {
  onLogin?: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Backend now accepts Access Token
        const response = await authService.loginWithGoogle(
          tokenResponse.access_token,
        );
        console.log("Google Login Success", response.data);
        const raw = response.data as Record<string, unknown> | undefined;
        const content = (raw?.content ?? raw?.Content ?? raw) as
          | Record<string, unknown>
          | undefined;
        const token = (content?.token ??
          content?.Token ??
          raw?.token ??
          raw?.Token) as string | undefined;

        if (
          token &&
          /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)
        ) {
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(content ?? {}));
          onLogin?.();
          navigate(
            getRoleFromToken(token) === "Admin" ? "/admin" : "/dashboard",
          );
        } else {
          setError("Login succeeded but token invalid. Please try again.");
        }
      } catch (err: unknown) {
        console.error("Google Login Backend Error", err);
        setError(getAuthErrorMessage(err));
      }
    },
    onError: () => {
      console.log("Login Failed");
      setError("Google Login Failed");
    },
  });

  const handleGitHubLogin = () => {
    if (!GITHUB_OAUTH_URL) {
      setError(
        "GitHub OAuth is not configured. Add VITE_GITHUB_CLIENT_ID to .env (create OAuth App at https://github.com/settings/developers).",
      );
      return;
    }
    window.location.href = GITHUB_OAUTH_URL;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authService.login(email, password);
      console.log("Data user:", response.data);
      const raw = response.data as Record<string, unknown> | undefined;
      const content = (raw?.content ?? raw?.Content ?? raw) as
        | Record<string, unknown>
        | undefined;
      const token = (content?.token ??
        content?.Token ??
        raw?.token ??
        raw?.Token) as string | undefined;

      if (
        token &&
        /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)
      ) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(content ?? {}));
        onLogin?.();
        navigate(getRoleFromToken(token) === "Admin" ? "/admin" : "/dashboard");
      } else {
        console.warn("Token not found or invalid:", response.data);
        setError("Login succeeded but failed to retrieve valid token.");
      }
    } catch (err: unknown) {
      console.error("Login error", err);
      setError(getAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display transition-colors duration-300">
      {/* Top Navigation Bar (Simplified for Login) */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 dark:border-[#282e39] px-6 py-4 lg:px-10">
        <div className="flex items-center gap-3 text-gray-900 dark:text-white">
          <div className="size-8 text-primary">
            <svg
              fill="none"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clipRule="evenodd"
                d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z"
                fill="currentColor"
                fillRule="evenodd"
              ></path>
              <path
                clipRule="evenodd"
                d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z"
                fill="currentColor"
                fillRule="evenodd"
              ></path>
            </svg>
          </div>
          <h2 className="text-gray-900 dark:text-white text-xl font-bold leading-tight tracking-tight">
            AI CodeGen
          </h2>
        </div>
        <div>
          <a
            className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
            href="#"
          >
            Documentation
          </a>
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
            <h1 className="text-gray-900 dark:text-white tracking-tight text-3xl font-bold leading-tight text-center pb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-base font-normal leading-normal text-center">
              Enter your details to access your dashboard
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg text-center">
              {error}
            </div>
          )}

          {/* Login Form */}

          <form className="space-y-5" onSubmit={handleLogin}>
            {/* Email Field */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-900 dark:text-white text-sm font-medium leading-normal">
                Email Address
              </label>
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
                <label className="text-gray-900 dark:text-white text-sm font-medium leading-normal">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative flex items-center">
                <input
                  className="form-input w-full rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-200 dark:border-[#3b4354] bg-gray-50 dark:bg-[#111318] focus:border-primary h-12 placeholder:text-gray-400 dark:placeholder:text-[#9da6b9] px-4 text-sm transition-all"
                  placeholder="••••••••"
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  className="absolute right-3 text-gray-400 dark:text-[#9da6b9] hover:text-primary transition-colors focus:outline-none pt-1.5"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 py-1">
              <input
                className="w-4 h-4 rounded border-gray-300 dark:border-[#3b4354] bg-gray-50 dark:bg-[#111318] text-primary focus:ring-primary"
                id="remember"
                type="checkbox"
              />
              <label
                className="text-xs text-gray-600 dark:text-gray-400"
                htmlFor="remember"
              >
                Keep me logged in for 30 days
              </label>
            </div>

            {/* Action Button */}
            {/* Action Button */}
            <button
              className={`w-full flex cursor-pointer items-center justify-center rounded-lg h-12 px-4 bg-primary hover:bg-primary/90 text-white text-base font-bold transition-all shadow-lg shadow-primary/20 ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Social Logins */}
          <div className="mt-8">
            <div className="relative flex items-center justify-center mb-6">
              <div className="border-t border-gray-200 dark:border-[#3b4354] w-full"></div>
              <span className="absolute bg-white dark:bg-[#1c1f27] px-4 text-xs text-gray-500 dark:text-gray-400">
                Or continue with
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => loginWithGoogle()}
                className="flex items-center justify-center gap-2 h-11 border border-gray-200 dark:border-[#3b4354] rounded-lg hover:bg-gray-50 dark:hover:bg-[#282e39] transition-colors text-gray-700 dark:text-white text-sm font-medium"
              >
                <Google width={20} height={20} />
                Google
              </button>
              <button
                onClick={handleGitHubLogin}
                className="flex items-center justify-center gap-2 h-11 border border-gray-200 dark:border-[#3b4354] rounded-lg hover:bg-gray-50 dark:hover:bg-[#282e39] transition-colors text-gray-700 dark:text-white text-sm font-medium"
              >
                <GitHub width={20} height={20} />
                GitHub
              </button>
            </div>
          </div>

          {/* Footer Link */}
          <div className="mt-10 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-normal">
              Don't have an account?
              <Link
                to="/register"
                className="text-primary font-bold hover:underline transition-all ml-1"
              >
                Sign up
              </Link>
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
