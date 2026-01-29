import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/Home/HomePage';
import Dashboard from './pages/Dashboard/Dashboard';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import Profile from './pages/Dashboard/Profile';
import Editor from './pages/Editor/Editor';
import Preview from './pages/Editor/Preview';
import GitHubStatus from './pages/Github/GitHubStatus';
import GitHubIntegration from './pages/Github/GitHubIntegration';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Default to false to show login

  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen">
        {isAuthenticated && <Navbar />}
        <main className="flex-1">
          <Routes>
            <Route path="/login" element={<LoginPage onLogin={() => setIsAuthenticated(true)} />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Public Route: Only for unauthenticated users */}
            <Route
              path="/"
              element={!isAuthenticated ? <HomePage /> : <Navigate to="/dashboard" replace />}
            />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />}
            />
            <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
            <Route path="/editor" element={isAuthenticated ? <Editor /> : <Navigate to="/login" />} />
            <Route path="/preview" element={isAuthenticated ? <Preview /> : <Navigate to="/login" />} />
            <Route path="/github-integration" element={isAuthenticated ? <GitHubIntegration /> : <Navigate to="/login" />} />
            <Route path="/github-status" element={isAuthenticated ? <GitHubStatus /> : <Navigate to="/login" />} />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        {isAuthenticated && (
          <footer className="border-t border-slate-200 dark:border-slate-800 py-8">
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-sm font-display">
              <p>© 2026 AI Code Gen. Built for Professional Developers.</p>
              <div className="flex items-center gap-6">
                <a className="hover:text-primary transition-colors" href="#">Documentation</a>
                <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
                <a className="hover:text-primary transition-colors" href="#">Support</a>
              </div>
            </div>
          </footer>
        )}
      </div>
    </HashRouter>
  );
};

export default App;
