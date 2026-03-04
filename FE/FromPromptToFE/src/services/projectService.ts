import api from './api';

export interface CreateProjectPayload {
  organizationId: string;
  name: string;
  projectType: string;
  systemPrompt?: string;
  entitySchema?: string;
  repoUrl?: string;
  generatedTsx?: string;
  generatedHtml?: string;
}

export interface UpdateProjectPayload {
  name?: string;
  projectType?: string;
  systemPrompt?: string;
  entitySchema?: string;
  repoUrl?: string;
  generatedTsx?: string;
  generatedHtml?: string;
}

export interface ProjectDto {
  id: string;
  organizationId: string;
  name: string;
  projectType: string;
  systemPrompt?: string;
  entitySchema?: string;
  createdAt?: string;
  repoUrl?: string;
  generatedTsx?: string;
  generatedHtml?: string;
}

export interface ProjectFilter {
  organizationId?: string;
  projectType?: string;
  search?: string;
  pageIndex?: number;
  pageSize?: number;
}

/** Backend may return content or Content (PascalCase). */
export function getContent<T>(data: { content?: T; Content?: T } | undefined): T | undefined {
  if (!data) return undefined;
  return (data as { content?: T }).content ?? (data as { Content?: T }).Content;
}

const projectService = {
  getAll: (params?: ProjectFilter) => {
    const query = new URLSearchParams();
    if (params?.organizationId) query.set('organizationId', params.organizationId);
    if (params?.projectType) query.set('projectType', params.projectType);
    if (params?.search) query.set('search', params.search);
    if (params?.pageIndex != null) query.set('pageIndex', String(params.pageIndex));
    if (params?.pageSize != null) query.set('pageSize', String(params.pageSize));
    const qs = query.toString();
    return api.get<{ content: { TotalItems: ProjectDto[]; totalItems?: ProjectDto[] } }>(
      `/api/Project${qs ? `?${qs}` : ''}`
    );
  },

  getById: (id: string) => api.get<{ content: ProjectDto }>(`/api/Project/${id}`),

  create: (payload: CreateProjectPayload) => {
    const body: Record<string, unknown> = {
      organizationId: payload.organizationId,
      name: payload.name,
      projectType: payload.projectType,
    };
    if (payload.systemPrompt != null) body.systemPrompt = payload.systemPrompt;
    if (payload.entitySchema != null) body.entitySchema = payload.entitySchema;
    if (payload.repoUrl != null) body.repoUrl = payload.repoUrl;
    if (payload.generatedTsx != null) body.generatedTsx = payload.generatedTsx;
    if (payload.generatedHtml != null) body.generatedHtml = payload.generatedHtml;
    return api.post<{ content: ProjectDto }>('/api/Project', body);
  },

  update: (id: string, payload: UpdateProjectPayload) => api.put(`/api/Project/${id}`, payload),

  delete: (id: string) => api.delete(`/api/Project/${id}`),
};

export default projectService;
