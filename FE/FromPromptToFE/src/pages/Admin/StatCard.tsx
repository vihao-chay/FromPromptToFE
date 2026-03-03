import React from 'react';

interface StatCardProps {
    title: string;
    value: number;
    icon: string;
    iconBg: string;
    iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, iconBg, iconColor }) => {
    return (
        <div className="flex items-center gap-4 p-5 bg-white dark:bg-[#1c2230] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}>
                <span className="material-symbols-outlined">{icon}</span>
            </div>
            <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {value.toLocaleString()}
                </p>
            </div>
        </div>
    );
};

export default StatCard;
