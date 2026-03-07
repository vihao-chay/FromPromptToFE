import api from './api';

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalOrganizations: number;
  totalProjects: number;
  totalAIGenerations: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  totalTokensUsed: number;
  totalTokensRemaining: number;
  projectsByType: ChartDataPoint[];
  userGrowth: ChartDataPoint[];
}

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  provider: string;
  isVerified: boolean;
  isAdmin: boolean;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface AdminProject {
  id: string;
  name: string;
  projectType: string;
  organizationId: string;
  organizationName: string | null;
  createdAt: string | null;
  hasGeneratedCode: boolean;
}

export interface AdminProjectPreview {
  id: string;
  name: string;
  organizationName: string | null;
  systemPrompt: string | null;
  userPrompt: string | null;
  promptHistory: string | null;
  generatedTsx: string | null;
  generatedHtml: string | null;
}

export interface PagingResult<T> {
  totalItems: T[];
  totalRow: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}

const adminService = {
  getDashboardStats: () =>
    api.get<{ content: DashboardStats }>('/api/admin/stats'),

  getUsers: (params: { search?: string; pageIndex?: number; pageSize?: number }) =>
    api.get<{ content: PagingResult<AdminUser> }>('/api/admin/users', { params }),

  createUser: (data: any) =>
    api.post<{ content: AdminUser }>('/api/admin/users', data),

  updateUser: (id: string, data: any) =>
    api.put<{ content: AdminUser }>(`/api/admin/users/${id}`, data),

  deleteUser: (id: string) =>
    api.delete<{ content: boolean }>(`/api/admin/users/${id}`),

  deleteUsersBulk: (ids: string[]) => 
    api.delete<{ content: boolean }>('/api/admin/users/bulk', { data: { ids } }),

  toggleUserStatus: (id: string) =>
    api.put<{ content: boolean }>(`/api/admin/users/${id}/toggle-status`),

  getProjects: (params: { search?: string; pageIndex?: number; pageSize?: number }) =>
    api.get<{ content: PagingResult<AdminProject> }>('/api/admin/projects', { params }),

  deleteProject: (id: string) =>
    api.delete<{ content: boolean }>(`/api/admin/projects/${id}`),

  deleteProjectsBulk: (ids: string[]) =>
    api.delete<{ content: boolean }>('/api/admin/projects/bulk', { data: { ids } }),

  getProjectPreview: (id: string) =>
    api.get<{ content: AdminProjectPreview }>(`/api/admin/projects/${id}/preview`)
};

export default adminService;
