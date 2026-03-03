import api from './api';

export interface CodeDto {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  repoName?: string;
  branchName?: string;
  description?: string;
  status?: string;
  userId?: string;
  prLink?: string;
  downloadLink?: string;
  projectName?: string;
}

export interface CodeFilter {
  search?: string;
  userId?: string;
  status?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface CodePagingResult {
  totalItems: CodeDto[];
  totalRow: number;
  pageIndex: number;
  pageSize: number;
  totalPages?: number;
}

function normalizeCode(d: Record<string, unknown>): CodeDto {
  return {
    id: String(d.id ?? d.Id ?? ''),
    createdAt: d.createdAt != null ? String(d.createdAt) : (d.CreatedAt != null ? String(d.CreatedAt) : undefined),
    updatedAt: d.updatedAt != null ? String(d.updatedAt) : (d.UpdatedAt != null ? String(d.UpdatedAt) : undefined),
    repoName: d.repoName != null ? String(d.repoName) : (d.RepoName != null ? String(d.RepoName) : undefined),
    branchName: d.branchName != null ? String(d.branchName) : (d.BranchName != null ? String(d.BranchName) : undefined),
    description: d.description != null ? String(d.description) : (d.Description != null ? String(d.Description) : undefined),
    status: d.status != null ? String(d.status) : (d.Status != null ? String(d.Status) : undefined),
    userId: d.userId != null ? String(d.userId) : (d.UserId != null ? String(d.UserId) : undefined),
    prLink: d.prLink != null ? String(d.prLink) : (d.PrLink != null ? String(d.PrLink) : undefined),
    downloadLink: d.downloadLink != null ? String(d.downloadLink) : (d.DownloadLink != null ? String(d.DownloadLink) : undefined),
    projectName: d.projectName != null ? String(d.projectName) : (d.ProjectName != null ? String(d.ProjectName) : undefined),
  };
}

const codeService = {
  getAll: async (params?: CodeFilter): Promise<CodePagingResult> => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.userId) query.set('userId', params.userId);
    if (params?.status) query.set('status', params.status);
    if (params?.pageIndex != null) query.set('pageIndex', String(params.pageIndex));
    if (params?.pageSize != null) query.set('pageSize', String(params.pageSize));
    const qs = query.toString();
    const res = await api.get<{ content: CodePagingResult }>(`/api/Code${qs ? `?${qs}` : ''}`);
    const content = res.data?.content;
    if (!content) return { totalItems: [], totalRow: 0, pageIndex: 1, pageSize: 10 };
    const items = content.totalItems ?? content.TotalItems ?? [];
    const list = Array.isArray(items) ? items.map((x: Record<string, unknown>) => normalizeCode(x)) : [];
    return {
      totalItems: list,
      totalRow: content.totalRow ?? content.TotalRow ?? 0,
      pageIndex: content.pageIndex ?? content.PageIndex ?? 1,
      pageSize: content.pageSize ?? content.PageSize ?? 10,
      totalPages: content.totalPages ?? content.TotalPages,
    };
  },

  getById: async (id: string): Promise<CodeDto | null> => {
    const res = await api.get<{ content: CodeDto }>(`/api/Code/${id}`);
    const content = res.data?.content;
    if (!content) return null;
    return normalizeCode(content as unknown as Record<string, unknown>);
  },
};

export default codeService;
