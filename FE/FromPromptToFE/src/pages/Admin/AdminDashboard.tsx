import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import adminService, { DashboardStats } from '../../services/adminService';
import StatCard from './StatCard';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

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

    // Helper calculate Token percentage
    const tokenLimit = stats ? stats.totalTokensUsed + stats.totalTokensRemaining : 1;
    const tokenUsedPercent = stats ? Math.min(100, Math.round((stats.totalTokensUsed / tokenLimit) * 100)) : 0;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">

            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-1">
                    System Overview
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                    Comprehensive platform analytics and AI consumption
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm flex items-center gap-2 font-medium">
                    <span className="material-symbols-outlined">error</span>
                    {error}
                </div>
            )}

            {loading ? (
                <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
                    <span className="material-symbols-outlined animate-spin text-4xl text-primary mb-4">progress_activity</span>
                    <p className="font-medium animate-pulse">Loading system metrics...</p>
                </div>
            ) : stats && (
                <div className="space-y-8">
                    {/* Top KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            title="Total Users"
                            value={stats.totalUsers}
                            icon="group"
                            iconBg="bg-indigo-100 dark:bg-indigo-900/40"
                            iconColor="text-indigo-600 dark:text-indigo-400"
                        />
                        <StatCard
                            title="Organizations"
                            value={stats.totalOrganizations}
                            icon="corporate_fare"
                            iconBg="bg-pink-100 dark:bg-pink-900/40"
                            iconColor="text-pink-600 dark:text-pink-400"
                        />
                        <StatCard
                            title="Projects Generated"
                            value={stats.totalProjects}
                            icon="folder"
                            iconBg="bg-blue-100 dark:bg-blue-900/40"
                            iconColor="text-blue-600 dark:text-blue-400"
                        />
                        <StatCard
                            title="Successful AI Prompts"
                            value={stats.totalAIGenerations}
                            icon="auto_awesome"
                            iconBg="bg-orange-100 dark:bg-orange-900/40"
                            iconColor="text-orange-600 dark:text-orange-400"
                        />
                    </div>

                    {/* Charts & AI Tokens Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Area Chart: User Growth */}
                        <div className="lg:col-span-2 bg-white dark:bg-[#1a1e28] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-[20px]">trending_up</span>
                                New Users (Last 7 Days)
                            </h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.userGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3b4354" opacity={0.2} />
                                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
                                        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                                        />
                                        <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Right Column: Tokens & Verification */}
                        <div className="flex flex-col gap-6">

                            {/* AI Token Allocation Box */}
                            <div className="bg-gradient-to-br from-indigo-900/90 to-purple-900/90 border border-indigo-700/50 rounded-2xl p-6 shadow-lg shadow-indigo-900/20 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <span className="material-symbols-outlined text-8xl">memory</span>
                                </div>
                                <h3 className="text-lg font-bold mb-1 relative z-10 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-indigo-300 text-[20px]">api</span>
                                    AI Token Pool
                                </h3>
                                <p className="text-indigo-200 text-xs mb-6 relative z-10">Global monthly limit for code generation.</p>

                                <div className="mb-2 flex justify-between items-end relative z-10">
                                    <div>
                                        <p className="text-4xl font-black tracking-tight">{stats.totalTokensUsed.toLocaleString()}</p>
                                        <p className="text-indigo-300 text-xs mt-1 font-medium">Tokens Consumed</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-indigo-100">{stats.totalTokensRemaining.toLocaleString()}</p>
                                        <p className="text-indigo-300 text-xs mt-1 font-medium">Remaining</p>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full h-3 bg-black/30 rounded-full mt-4 overflow-hidden relative z-10">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ease-out ${tokenUsedPercent > 85 ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-gradient-to-r from-blue-400 to-indigo-400 shadow-[0_0_10px_#818cf8]'}`}
                                        style={{ width: `${tokenUsedPercent}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between mt-2 text-[11px] font-bold text-indigo-200 relative z-10">
                                    <span>0%</span>
                                    <span>{tokenUsedPercent}% Used</span>
                                    <span>100%</span>
                                </div>
                            </div>

                            {/* Verification Stats */}
                            <div className="bg-white dark:bg-[#1a1e28] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex-1 flex flex-col justify-center">
                                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">User Verification</h3>

                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-green-600 dark:text-green-400">verified_user</span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Verified</p>
                                            <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.verifiedUsers}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-lg">
                                        {Math.round((stats.verifiedUsers / Math.max(1, stats.totalUsers)) * 100)}%
                                    </span>
                                </div>

                                <div className="w-full h-[1px] bg-slate-100 dark:bg-slate-800 my-2"></div>

                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">mark_email_unread</span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Unverified</p>
                                            <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.unverifiedUsers}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg">
                                        {Math.round((stats.unverifiedUsers / Math.max(1, stats.totalUsers)) * 100)}%
                                    </span>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Bottom Row: Pie Chart & Quick Access */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Pie Chart: Project Types */}
                        <div className="bg-white dark:bg-[#1a1e28] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col items-center">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 w-full flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-[20px]">pie_chart</span>
                                Projects by Category
                            </h3>
                            <div className="h-[260px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.projectsByType}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={85}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {stats.projectsByType.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Quick Access */}
                        <div className="lg:col-span-2 space-y-4 flex flex-col justify-center bg-transparent">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white w-full">Quick Administrative Access</h3>

                            <Link
                                to="/admin/users"
                                className="flex items-center gap-5 p-5 bg-white dark:bg-[#1c2230] border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-[#202736] transition-all group shadow-sm"
                            >
                                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-3xl">manage_accounts</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                                        Manage Users & Access
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        View details, toggle verification status, and batch delete system accounts.
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-colors">
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </div>
                            </Link>

                            <Link
                                to="/admin/projects"
                                className="flex items-center gap-5 p-5 bg-white dark:bg-[#1c2230] border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-[#202736] transition-all group shadow-sm"
                            >
                                <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-3xl">dashboard_customize</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">
                                        Monitor Global Projects
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        Preview system prompts, review generated code snippets, and manage workspaces.
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-500 transition-colors">
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </div>
                            </Link>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
