import { fetchApiWithAuth } from "./authService";

function getContent(data) {
    if (!data) return undefined;
    return data.content ?? data.Content;
}

/** Get project outputs (generated versions) for a project. Returns { items, totalRow }. Same API as FE. */
const projectOutputService = {
    getByProjectId: async (projectId, params = {}) => {
        const q = new URLSearchParams({ projectId });
        if (params.pageIndex != null) q.set("pageIndex", String(params.pageIndex));
        if (params.pageSize != null) q.set("pageSize", String(params.pageSize));
        if (params.sortBy) q.set("sortBy", params.sortBy);
        if (params.sortOrder) q.set("sortOrder", params.sortOrder);
        const response = await fetchApiWithAuth(`/api/ProjectOutput?${q.toString()}`, { method: "GET" });
        if (!response.ok) {
            const text = await response.text();
            let msg = "Failed to load outputs.";
            try {
                const j = JSON.parse(text);
                msg = j.message ?? j.Message ?? msg;
            } catch (_) {}
            throw new Error(msg);
        }
        const data = await response.json();
        const content = getContent(data);
        const items = content?.items ?? content?.Items ?? content?.totalItems ?? content?.TotalItems ?? (Array.isArray(content) ? content : []);
        const list = Array.isArray(items) ? items : [];
        const totalRow = content?.totalRow ?? content?.TotalRow ?? list.length;
        return { items: list, totalRow };
    },

    getById: async (outputId) => {
        const response = await fetchApiWithAuth(`/api/ProjectOutput/${outputId}`, { method: "GET" });
        if (!response.ok) {
            const text = await response.text();
            let msg = "Failed to load output.";
            try {
                const j = JSON.parse(text);
                msg = j.message ?? j.Message ?? msg;
            } catch (_) {}
            throw new Error(msg);
        }
        const data = await response.json();
        return getContent(data) ?? data;
    },
};

export default projectOutputService;
