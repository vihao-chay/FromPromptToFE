import api from './api';

export interface CreateChangeLogPayload {
  organizationId?: string;
  entityType: string;
  entityId?: string;
  action: string;
}

export interface ChangeLogDto {
  id: string;
  organizationId?: string;
  actorId?: string;
  entityType?: string;
  entityId?: string;
  action?: string;
  createdAt?: string;
}

const changeLogService = {
  create: (payload: CreateChangeLogPayload) => {
    const body: Record<string, unknown> = {
      entityType: payload.entityType,
      action: payload.action,
    };
    if (payload.organizationId) body.organizationId = payload.organizationId;
    if (payload.entityId) body.entityId = payload.entityId;
    return api.post<{ content: ChangeLogDto }>('/api/ChangeLog', body);
  },

  getAll: (params?: { organizationId?: string; pageIndex?: number; pageSize?: number }) => {
    const query = new URLSearchParams();
    if (params?.organizationId) query.set('organizationId', params.organizationId);
    if (params?.pageIndex != null) query.set('pageIndex', String(params.pageIndex));
    if (params?.pageSize != null) query.set('pageSize', String(params.pageSize));
    const qs = query.toString();
    return api.get<{ content: { TotalItems: ChangeLogDto[]; totalItems?: ChangeLogDto[]; TotalRow: number } }>(
      `/api/ChangeLog${qs ? `?${qs}` : ''}`
    );
  },
};

export default changeLogService;
