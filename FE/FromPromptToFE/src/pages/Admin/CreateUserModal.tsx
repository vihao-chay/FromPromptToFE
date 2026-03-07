import React, { useState } from 'react';
import adminService, { AdminUser } from '../../services/adminService';

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUserCreated: (user: AdminUser) => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onUserCreated }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await adminService.createUser({ email, name, password, isAdmin });
            onUserCreated(res.data.content);
            onClose();
            // Reset state
            setName(''); setEmail(''); setPassword(''); setIsAdmin(false);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to create user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#1c1f27] rounded-xl p-6 md:p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Create User</h3>
                {error && (
                    <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg text-center">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="form-input w-full rounded-lg border border-slate-300 dark:border-[#3b4354] bg-slate-50 dark:bg-[#111318] text-slate-900 dark:text-white px-4 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-input w-full rounded-lg border border-slate-300 dark:border-[#3b4354] bg-slate-50 dark:bg-[#111318] text-slate-900 dark:text-white px-4 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-input w-full rounded-lg border border-slate-300 dark:border-[#3b4354] bg-slate-50 dark:bg-[#111318] text-slate-900 dark:text-white px-4 py-2"
                        />
                        <p className="text-xs text-slate-500 mt-1">Must contain 8+ chars, uppercase, lowercase, number, and special character.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={isAdmin}
                            onChange={(e) => setIsAdmin(e.target.checked)}
                            id="isAdmin"
                            className="rounded border-slate-300 dark:border-[#3b4354] text-primary focus:ring-primary"
                        />
                        <label htmlFor="isAdmin" className="text-sm font-medium text-slate-900 dark:text-white">Is Admin?</label>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700">Cancel</button>
                        <button type="submit" disabled={loading} className={`px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                            {loading ? 'Creating...' : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateUserModal;
