import React, { useState, useEffect } from 'react';
import adminService, { AdminUser } from '../../services/adminService';

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: AdminUser | null;
    onUserUpdated: (user: AdminUser) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, user, onUserUpdated }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [status, setStatus] = useState('Active');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email);
            setIsAdmin(user.isAdmin);
            setStatus(user.isActive ? 'Active' : 'Inactive');
        }
    }, [user]);

    if (!isOpen || !user) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await adminService.updateUser(user.id, { email, name, isAdmin, status });
            onUserUpdated(res.data.content);
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to update user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#1c1f27] rounded-xl p-6 md:p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Edit User</h3>
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
                        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="form-select w-full rounded-lg border border-slate-300 dark:border-[#3b4354] bg-slate-50 dark:bg-[#111318] text-slate-900 dark:text-white px-4 py-2"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={isAdmin}
                            onChange={(e) => setIsAdmin(e.target.checked)}
                            id="editIsAdmin"
                            className="rounded border-slate-300 dark:border-[#3b4354] text-primary focus:ring-primary"
                        />
                        <label htmlFor="editIsAdmin" className="text-sm font-medium text-slate-900 dark:text-white">Is Admin?</label>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700">Cancel</button>
                        <button type="submit" disabled={loading} className={`px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUserModal;
