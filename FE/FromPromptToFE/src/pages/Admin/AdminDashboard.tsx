import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import adminService, { DashboardStats } from '../../services/adminService';
import StatCard from './StatCard';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        adminService.getDashboardStats()
            .then(res => setStats(res.data.content))
            .catch(() => setError('Failed to load dashboard stats.'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-1">
                    Admin Dashboard
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                    System-wide overview — FromPromptToFE platform
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Stat Cards */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                    ))}
                </div>
            ) : stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        title="Total Users"
                        value={stats.totalUsers}
                        icon="group"
                        iconBg="bg-indigo-100 dark:bg-indigo-900/30"
                        iconColor="text-indigo-600 dark:text-indigo-400"
                    />
                    <StatCard
                        title="Organizations"
                        value={stats.totalOrganizations}
                        icon="corporate_fare"
                        iconBg="bg-pink-100 dark:bg-pink-900/30"
                        iconColor="text-pink-600 dark:text-pink-400"
                    />
                    <StatCard
                        title="Projects"
                        value={stats.totalProjects}
                        icon="folder"
                        iconBg="bg-blue-100 dark:bg-blue-900/30"
                        iconColor="text-blue-600 dark:text-blue-400"
                    />
                    <StatCard
                        title="AI Generations"
                        value={stats.totalAIGenerations}
                        icon="auto_awesome"
                        iconBg="bg-orange-100 dark:bg-orange-900/30"
                        iconColor="text-orange-600 dark:text-orange-400"
                    />
                </div>
            )}

            {/* Verified breakdown */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                    <StatCard
                        title="Verified Users"
                        value={stats.verifiedUsers}
                        icon="verified"
                        iconBg="bg-green-100 dark:bg-green-900/30"
                        iconColor="text-green-600 dark:text-green-400"
                    />
                    <StatCard
                        title="Unverified Users"
                        value={stats.unverifiedUsers}
                        icon="pending"
                        iconBg="bg-amber-100 dark:bg-amber-900/30"
                        iconColor="text-amber-600 dark:text-amber-400"
                    />
                </div>
            )}

            {/* Quick nav */}
            <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                    Quick Access
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link
                        to="/admin/users"
                        className="flex items-center gap-4 p-5 bg-white dark:bg-[#1c2230] border border-slate-200 dark:border-slate-800 rounded-xl hover:border-primary/50 hover:shadow-md transition-all group"
                    >
                        <span className="material-symbols-outlined text-primary text-2xl">manage_accounts</span>
                        <div>
                            <p className="font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                                Manage Users
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                View, search, and toggle user status
                            </p>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 ml-auto">chevron_right</span>
                    </Link>

                    <Link
                        to="/admin/projects"
                        className="flex items-center gap-4 p-5 bg-white dark:bg-[#1c2230] border border-slate-200 dark:border-slate-800 rounded-xl hover:border-primary/50 hover:shadow-md transition-all group"
                    >
                        <span className="material-symbols-outlined text-primary text-2xl">grid_view</span>
                        <div>
                            <p className="font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                                Monitor Projects
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                View and delete projects across all orgs
                            </p>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 ml-auto">chevron_right</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
