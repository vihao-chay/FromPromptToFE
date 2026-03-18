import { fetchApiWithAuth } from "./authService";

/**
 * Change log API – same as FE: GET /api/change-logs (paged, sort by CreatedAt desc).
 * Requires auth (Bearer token).
 */
const changeLogService = {
    getAll: async (params = {}) => {
        const q = new URLSearchParams();
        if (params.organizationId) q.set("organizationId", params.organizationId);
        if (params.entityId) q.set("entityId", params.entityId);
        if (params.search) q.set("search", params.search);
        if (params.entityType) q.set("entityType", params.entityType);
        if (params.action) q.set("action", params.action);
        if (params.sortBy != null) q.set("sortBy", params.sortBy);
        else q.set("sortBy", "CreatedAt");
        if (params.sortOrder != null) q.set("sortOrder", params.sortOrder);
        else q.set("sortOrder", "desc");
        if (params.pageIndex != null) q.set("pageIndex", String(params.pageIndex));
        if (params.pageSize != null) q.set("pageSize", String(params.pageSize));
        const path = `/api/change-logs${q.toString() ? `?${q.toString()}` : ""}`;
        const response = await fetchApiWithAuth(path, { method: "GET" });
        if (!response.ok) {
            const text = await response.text();
            let msg = "Failed to load change logs.";
            try {
                const j = JSON.parse(text);
                msg = j.message ?? j.Message ?? msg;
            } catch (_) {}
            throw new Error(msg);
        }
        const data = await response.json();
        const content = data.content ?? data.Content ?? data;
        const list = content?.TotalItems ?? content?.totalItems ?? (Array.isArray(content) ? content : []);
        return Array.isArray(list) ? list : [];
    },
};

export default changeLogService;
