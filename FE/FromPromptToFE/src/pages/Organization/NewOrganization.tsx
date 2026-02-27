import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import organizationService from '../../services/organizationService';

const NewOrganization: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [plan, setPlan] = useState('Free');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Organization name is required.');
      return;
    }
    setSubmitting(true);
    try {
      await organizationService.create(name.trim(), plan);
      navigate('/dashboard');
    } catch (err) {
      setError('Could not create organization. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary mb-6">
        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        Back to Dashboard
      </Link>
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-6 md:p-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display mb-2">New Organization</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">Create a new organization to manage projects and members.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Organization name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              placeholder="e.g. Acme Inc."
            />
          </div>
          <div>
            <label htmlFor="plan" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Plan</label>
            <select
              id="plan"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="Free">Free</option>
              <option value="Pro">Pro</option>
              <option value="Team">Team</option>
            </select>
          </div>
          {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? 'Creating…' : 'Create'}
            </button>
            <Link to="/dashboard" className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewOrganization;
