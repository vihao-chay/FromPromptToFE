import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./hooks/useTheme";
import Navbar from "./components/Navbar";
import HomePage from "./pages/Home/HomePage";
import Dashboard from "./pages/Dashboard/Dashboard";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import ForgotPasswordPage from "./pages/Auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/Auth/ResetPasswordPage";
import VerifyEmailPage from "./pages/Auth/VerifyEmailPage";
import GitHubCallback from "./pages/Auth/GitHubCallback";
import Profile from "./pages/Dashboard/Profile";
import Editor from "./pages/Editor/Editor";
import Preview from "./pages/Editor/Preview";
import GitHubStatus from "./pages/Github/GitHubStatus";
import GitHubIntegration from "./pages/Github/GitHubIntegration";
import OrganizationDetail from "./pages/Organization/OrganizationDetail";
import NewOrganization from "./pages/Organization/NewOrganization";
import NewProject from "./pages/Organization/NewProject";
import RequireOnboarding from "./components/RequireOnboarding";
import ChangeLogs from "./pages/ChangeLogs/ChangeLogs";
import Repositories from "./pages/Repositories/Repositories";
import ApiKeys from "./pages/ApiKeys/ApiKeys";
import DesignSystems from "./pages/DesignSystems/DesignSystems";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminProjects from "./pages/Admin/AdminProjects";

function getRoleFromToken(): string | null {
  const token = localStorage.getItem("token");
  if (!token) return null;
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

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem("token"),
  );
  const [role, setRole] = useState<string | null>(() => getRoleFromToken());

  const handleLogin = () => {
    setIsAuthenticated(true);
    setRole(getRoleFromToken());
  };

  useEffect(() => {
    const onLogout = () => {
      setIsAuthenticated(false);
      setRole(null);
    };
    window.addEventListener("auth-logout", onLogout);
    return () => window.removeEventListener("auth-logout", onLogout);
  }, []);

  return (
    <ThemeProvider>
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        {isAuthenticated && <Navbar />}
        <main className="flex-1 bg-slate-50 dark:bg-[#0d0e12] min-h-0">
          <Routes>
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate
                    to={role === "Admin" ? "/admin" : "/dashboard"}
                    replace
                  />
                ) : (
                  <LoginPage onLogin={handleLogin} />
                )
              }
            />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route
              path="/auth/github/callback"
              element={<GitHubCallback onLogin={handleLogin} />}
            />

            {/* Public Route: Only for unauthenticated users. */}
            <Route
              path="/"
              element={
                !isAuthenticated ? (
                  <HomePage />
                ) : (
                  <Navigate
                    to={role === "Admin" ? "/admin" : "/dashboard"}
                    replace
                  />
                )
              }
            />

            {/* Onboarding (no RequireOnboarding wrap): tạo tổ chức → tạo dự án → vào editor */}
            <Route
              path="/new-organization"
              element={
                isAuthenticated ? (
                  <NewOrganization />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/new-project"
              element={
                isAuthenticated ? (
                  <NewProject />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Protected Routes: sau khi đã có tổ chức + dự án (hoặc đã hoàn thành onboarding) */}
            <Route
              path="/dashboard"
              element={
                isAuthenticated ? (
                  <RequireOnboarding>
                    <Dashboard />
                  </RequireOnboarding>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/profile"
              element={
                isAuthenticated ? (
                  <RequireOnboarding>
                    <Profile />
                  </RequireOnboarding>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/editor"
              element={
                isAuthenticated ? (
                  <RequireOnboarding>
                    <Editor />
                  </RequireOnboarding>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/preview"
              element={
                isAuthenticated ? (
                  <RequireOnboarding>
                    <Preview />
                  </RequireOnboarding>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/github-integration"
              element={
                isAuthenticated ? (
                  <RequireOnboarding>
                    <GitHubIntegration />
                  </RequireOnboarding>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/github-status"
              element={
                isAuthenticated ? (
                  <RequireOnboarding>
                    <GitHubStatus />
                  </RequireOnboarding>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/organizations/:id"
              element={
                isAuthenticated ? (
                  <RequireOnboarding>
                    <OrganizationDetail />
                  </RequireOnboarding>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/change-logs"
              element={
                isAuthenticated ? (
                  <RequireOnboarding>
                    <ChangeLogs />
                  </RequireOnboarding>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/repositories"
              element={
                isAuthenticated ? (
                  <RequireOnboarding>
                    <Repositories />
                  </RequireOnboarding>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/api-keys"
              element={
                isAuthenticated ? (
                  <RequireOnboarding>
                    <ApiKeys />
                  </RequireOnboarding>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/design-systems"
              element={
                isAuthenticated ? (
                  <RequireOnboarding>
                    <DesignSystems />
                  </RequireOnboarding>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                isAuthenticated ? (
                  <RequireOnboarding>
                    <AdminDashboard />
                  </RequireOnboarding>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/admin/users"
              element={
                isAuthenticated ? (
                  <RequireOnboarding>
                    <AdminUsers />
                  </RequireOnboarding>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/admin/projects"
              element={
                isAuthenticated ? (
                  <RequireOnboarding>
                    <AdminProjects />
                  </RequireOnboarding>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        {isAuthenticated && (
          <footer className="border-t border-slate-200 dark:border-slate-800 py-8">
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-sm font-display">
              <p>© 2026 AI Code Gen. Built for Professional Developers.</p>
              <div className="flex items-center gap-6">
                <a className="hover:text-primary transition-colors" href="#">
                  Documentation
                </a>
                <a className="hover:text-primary transition-colors" href="#">
                  Privacy Policy
                </a>
                <a className="hover:text-primary transition-colors" href="#">
                  Support
                </a>
              </div>
            </div>
          </footer>
        )}
      </div>
    </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
