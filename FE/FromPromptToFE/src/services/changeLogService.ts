import api from './api';

export interface CreateChangeLogPayload {
  organizationId?: string;
  entityType: string;
  entityId?: string;
  action: string;
  oldValues?: string;
  newValues?: string;
}

export interface ChangeLogDto {
  id?: string;
  Id?: string;
  organizationId?: string;
  actorId?: string;
  entityType?: string;
  entityId?: string;
  action?: string;
  createdAt?: string;
  CreatedAt?: string;
  actorName?: string;
  actorEmail?: string;
  oldValues?: string;
  newValues?: string;
}

const changeLogService = {
  /** Create a changelog entry (stored in DB). Call after create/update/delete/generate actions. */
  create: (payload: CreateChangeLogPayload) => {
    const body: Record<string, unknown> = {
      entityType: payload.entityType,
      action: payload.action,
    };
    if (payload.organizationId) body.organizationId = payload.organizationId;
    if (payload.entityId) body.entityId = payload.entityId;
    if (payload.oldValues != null) body.oldValues = payload.oldValues;
    if (payload.newValues != null) body.newValues = payload.newValues;
    return api.post<{ content: ChangeLogDto }>('/api/ChangeLog', body);
  },

  /** Get paginated changelogs from API (database). Default sort: newest first. */
  getAll: (params?: {
    organizationId?: string;
    search?: string;
    entityType?: string;
    action?: string;
    sortBy?: string;
    sortOrder?: string;
    pageIndex?: number;
    pageSize?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.organizationId) query.set('organizationId', params.organizationId);
    if (params?.search) query.set('search', params.search);
    if (params?.entityType) query.set('entityType', params.entityType);
    if (params?.action) query.set('action', params.action);
    if (params?.sortBy) query.set('sortBy', params.sortBy);
    if (params?.sortOrder) query.set('sortOrder', params.sortOrder);
    if (params?.pageIndex != null) query.set('pageIndex', String(params.pageIndex));
    if (params?.pageSize != null) query.set('pageSize', String(params.pageSize));
    if (!query.has('sortBy')) query.set('sortBy', 'CreatedAt');
    if (!query.has('sortOrder')) query.set('sortOrder', 'desc');
    const qs = query.toString();
    return api.get<{ content: { TotalItems: ChangeLogDto[]; totalItems?: ChangeLogDto[]; TotalRow: number } }>(
      `/api/ChangeLog${qs ? `?${qs}` : ''}`
    );
  },
};

export default changeLogService;
