import api from './api';

export interface DashboardStats {
  totalUsers: number;
  totalOrganizations: number;
  totalProjects: number;
  totalAIGenerations: number;
  verifiedUsers: number;
  unverifiedUsers: number;
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

export interface PagingResult<T> {
  totalItems: T[];
  totalRow: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}

const adminService = {
  getDashboardStats: () =>
    api.get<{ content: DashboardStats }>('/admin/dashboard'),

  getUsers: (params: { search?: string; pageIndex?: number; pageSize?: number }) =>
    api.get<{ content: PagingResult<AdminUser> }>('/admin/users', { params }),

  toggleUserStatus: (id: string) =>
    api.put<{ content: boolean }>(`/admin/users/${id}/toggle-status`),

  getProjects: (params: { search?: string; pageIndex?: number; pageSize?: number }) =>
    api.get<{ content: PagingResult<AdminProject> }>('/admin/projects', { params }),

  deleteProject: (id: string) =>
    api.delete<{ content: boolean }>(`/admin/projects/${id}`),
};

export default adminService;
