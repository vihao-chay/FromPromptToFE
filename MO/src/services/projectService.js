import { fetchApiWithAuth } from "./authService";

function getContent(data) {
    if (!data) return undefined;
    return data.content ?? data.Content;
}

/**
 * @param {{ organizationId?: string; pageIndex?: number; pageSize?: number }} params
 */
const projectService = {
    getAll: async (params = {}) => {
        const q = new URLSearchParams();
        if (params.organizationId) q.set("organizationId", params.organizationId);
        if (params.pageIndex != null) q.set("pageIndex", String(params.pageIndex));
        if (params.pageSize != null) q.set("pageSize", String(params.pageSize));
        const qs = q.toString();
        const response = await fetchApiWithAuth(`/api/projects${qs ? `?${qs}` : ""}`, { method: "GET" });
        if (!response.ok) {
            const text = await response.text();
            let msg = "Failed to load projects.";
            try {
                const j = JSON.parse(text);
                msg = j.message ?? j.Message ?? msg;
            } catch (_) {}
            throw new Error(msg);
        }
        const data = await response.json();
        const content = getContent(data);
        const items = content?.totalItems ?? content?.TotalItems ?? (Array.isArray(content) ? content : []);
        return Array.isArray(items) ? items : [];
    },

    getById: async (id) => {
        const response = await fetchApiWithAuth(`/api/projects/${id}`, { method: "GET" });
        if (!response.ok) throw new Error("Project not found.");
        const data = await response.json();
        return getContent(data) ?? data;
    },

    create: async (payload) => {
        const body = {
            organizationId: payload.organizationId,
            name: payload.name,
            projectType: payload.projectType ?? "Draft",
        };
        const response = await fetchApiWithAuth("/api/projects", {
            method: "POST",
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const text = await response.text();
            let msg = "Failed to create project.";
            try {
                const j = JSON.parse(text);
                msg = j.message ?? j.Message ?? msg;
            } catch (_) {}
            throw new Error(msg);
        }
        const data = await response.json();
        const content = getContent(data) ?? data;
        const id = content?.id ?? content?.Id;
        return { id, ...content };
    },
};

export default projectService;
export { getContent };
