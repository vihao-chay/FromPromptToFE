
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProjectStatus, Project, Activity } from '../../types';
import organizationService from '../../services/organizationService';

interface Organization {
  id: string;
  name: string;
  plan?: string;
  memberCount?: number;
}

const ICON_STYLES = [
  { icon: "school", iconBg: "bg-indigo-100 dark:bg-indigo-900/30", iconColor: "text-indigo-600 dark:text-indigo-400" },
  { icon: "rocket_launch", iconBg: "bg-pink-100 dark:bg-pink-900/30", iconColor: "text-pink-600 dark:text-pink-400" },
  { icon: "code", iconBg: "bg-teal-100 dark:bg-teal-900/30", iconColor: "text-teal-600 dark:text-teal-400" },
  { icon: "design_services", iconBg: "bg-orange-100 dark:bg-orange-900/30", iconColor: "text-orange-600 dark:text-orange-400" },
  { icon: "work", iconBg: "bg-purple-100 dark:bg-purple-900/30", iconColor: "text-purple-600 dark:text-purple-400" },
  { icon: "groups", iconBg: "bg-cyan-100 dark:bg-cyan-900/30", iconColor: "text-cyan-600 dark:text-cyan-400" },
];

const Dashboard: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 4;

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await organizationService.getAll();
        console.log(response.data);
        const items = response.data?.content?.totalItems || [];
        setOrganizations(items);
      } catch (error) {
        console.error('Error fetching organizations:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrganizations();
  }, []);

  const totalPages = Math.ceil(organizations.length / itemsPerPage);
  const displayedOrganizations = organizations.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  const getIconStyle = (index: number) => ICON_STYLES[index % ICON_STYLES.length];

  const recentProjects: Project[] = [
    { id: '1', name: 'SaaS Dashboard', status: ProjectStatus.ACTIVE, createdAt: 'Oct 24, 2023', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFZ15yGEJzDjxuKMNX9N5WwzSFdseT3DP7WBeaauRuaI29RWgupqcioIhdzxjnzpgsDnZawZjpBpFzwpl_5Dp_LUXN8qJBBXcRFzaJzxa5ImuGVYbo8LU69IZt1sOp-YD0o9p19ul8Dl2D38J0jBay1FeM1lc9pWTz89BFq8in84epk2fnPOEU40QbXBf13E9WCvBK6ITRk9zC9fNnCahf0GdkpeI0NkJeu6vZphd9n2aOGSj0lZypnJFAEv1sPJb5Bm4vaPr0p7NX' },
    { id: '2', name: 'E-commerce Page', status: ProjectStatus.DRAFT, createdAt: 'Oct 20, 2023', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCA6qhKIZZKzSPjdMRDeOG3MI1q2RjqK0TJVfItimhb2FJ1pXC8OAxdWMdYVRwf13r3V7edqhSeUCzzFRIYhnIqxXGP-ejjIuU_xbuSkbUEWDLlbXlvD9v6ScuwhLTKCBTC960vop_2ouchY65F9Ikk7KXe4ojjs9DDbUUNgr9LXPQEtgBY8vJ798pdYfLjq9Osjet9M5RUHLh3irq15aaiYXRBZffPL2oLYr46gj9I5J7tmsy9V01iXJ1zO9MbwtVgjUhm5W_gGQxE' },
    { id: '3', name: 'Blog Template', status: ProjectStatus.COMPLETED, createdAt: 'Oct 15, 2023', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAD7kQkqjxWcEx8tItv1WiMpTfPHd8r4IkcZG0ZDNm7jQ-V4sHjgWM4b4rGZTZw9tcWP0234r1t_pH0vISzJkjJkUhwE3EFa0ikfr6RkKLnjAe7zVESWMjEGBhY8bMUsr36vPeBqfu6F1efX1_YnaS-xjvefWPfjnUH_OxBnMYNwk_RpKL6QZ1Wz4JDzzCmsizXqPL0ECioV18Wak3qWmGOzoTsXwhDqBoKTDL3moybfq7COm1wXe9_b3knsh_bBf8-MuvR88KV9C6' },
    { id: '4', name: 'Weather App Widget', status: ProjectStatus.ARCHIVED, createdAt: 'Oct 12, 2023', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDZ0mVMRcs7ABDeLxippQXH3Yag2lO2mGidrSK4Y83ULbdvxpWXagEp-4fGc_dngbvvwxfFYtK2ZCTnCpZX6HEC1WCzjc0l7JYHI_kbid_j3r8rJKKbzxhwanjKk175Z0BOaqE45PQudY2PaK6O0CWppGRJJtmf2IGAliLL2OBVWfHiJaApjhBFl2A06K2Kp0K_ePkD45kO-0C5gazFjzCktrfWE_v3T54mArOvq3iUeDQGJcFWk8EPCEm9R7Z2cA0ZcFrWyZmmCp5u' }
  ];

  const activityList: Activity[] = [
    { id: '1', name: 'Blog Template', date: 'Oct 10, 2023', status: ProjectStatus.STABLE },
    { id: '2', name: 'Contact Form', date: 'Oct 08, 2023', status: ProjectStatus.IN_PROGRESS },
    { id: '3', name: 'Portfolio Website', date: 'Oct 05, 2023', status: ProjectStatus.ARCHIVED }
  ];

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.ACTIVE: return 'bg-green-500/10 text-green-500 border-green-500/20';
      case ProjectStatus.DRAFT: return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case ProjectStatus.COMPLETED: return 'bg-primary/10 text-primary border-primary/20';
      case ProjectStatus.ARCHIVED: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
      case ProjectStatus.STABLE: return 'bg-primary/10 text-primary';
      case ProjectStatus.IN_PROGRESS: return 'bg-amber-500/10 text-amber-600';
      default: return 'bg-slate-500/10 text-slate-500';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Heading & CTA */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2 font-display">Your Projects</h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
            Manage and generate your modern frontend components using AI. Select a project to continue building or start a fresh design.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/new-organization"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-all active:scale-95"
          >
            <span className="material-symbols-outlined">group_add </span>
            <span>Create Organization</span>
          </Link>
          <Link
            to="/editor"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined">add_circle</span>
            <span>Create New Project</span>
          </Link>
        </div>
      </div>

      <div className="mb-12">
        {/* Section Header Organizations*/}
        <h3 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-900 dark:text-white">
          <span className="material-symbols-outlined text-primary">groups</span>
          My Organizations
        </h3>

        {/* Organization Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <span className="material-symbols-outlined animate-spin text-primary text-3xl">refresh</span>
          </div>
        ) : organizations.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            No organizations found. Create your first organization!
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {displayedOrganizations.map((org, index) => {
                const iconStyle = getIconStyle(currentPage * itemsPerPage + index);
                return (
                  <div key={org.id} className="group flex items-center gap-4 p-4 bg-white dark:bg-[#1c2230] border border-slate-200 dark:border-slate-800 rounded-xl hover:border-primary/50 transition-all cursor-pointer shadow-sm hover:shadow-md">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${iconStyle.iconBg} ${iconStyle.iconColor}`}>
                      <span className="material-symbols-outlined">{iconStyle.icon}</span>
                    </div>
                    <div className="flex flex-col">
                      <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{org.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{org.memberCount ?? 0} members</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Arrows */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 0}
                  className={`p-2 rounded-lg border transition-all ${currentPage === 0
                    ? 'border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                    : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-primary/50'
                    }`}
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {currentPage + 1} / {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages - 1}
                  className={`p-2 rounded-lg border transition-all ${currentPage === totalPages - 1
                    ? 'border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                    : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-primary/50'
                    }`}
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>


      {/* Section Header Projects*/}
      <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
        <h3 className="text-xl font-bold flex items-center gap-2 font-display">
          <span className="material-symbols-outlined text-primary">grid_view</span>
          Recent Projects
        </h3>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-md bg-slate-100 dark:bg-slate-800 text-primary">
            <span className="material-symbols-outlined">grid_view</span>
          </button>
          <button className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <span className="material-symbols-outlined">format_list_bulleted</span>
          </button>
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {recentProjects.map((project) => (
          <div key={project.id} className="group flex flex-col bg-white dark:bg-[#1c2230] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-2xl hover:shadow-primary/5">
            <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
              <div
                className="w-full h-full bg-center bg-no-repeat bg-cover transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url('${project.imageUrl}')` }}
              ></div>
              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button className="bg-white text-primary px-4 py-2 rounded-lg font-bold text-sm shadow-xl">Open Editor</button>
              </div>
            </div>
            <div className="p-5 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors font-display">{project.name}</h4>
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">calendar_today</span>
                Created on {project.createdAt}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Table */}
      <div className="mt-16">
        <h3 className="text-xl font-bold flex items-center gap-2 mb-6 font-display">
          <span className="material-symbols-outlined text-primary">history</span>
          All Activity
        </h3>
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1c2230]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Project Name</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Created Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {activityList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{item.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-primary hover:text-primary/70 font-bold text-sm">
                      {item.status === ProjectStatus.ARCHIVED ? 'Restore' : item.status === ProjectStatus.IN_PROGRESS ? 'Edit' : 'View'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
