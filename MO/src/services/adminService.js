import { fetchApiWithAuth } from "./authService";

/**
 * Admin API – same as FE. All endpoints require Admin role (Bearer token).
 * GET /api/admin/stats, /api/admin/users, /api/admin/projects, etc.
 */
function getJson(response) {
    return response.json();
}
function getContent(data) {
    return data.content ?? data.Content ?? data;
}

function normalizeChartPoint(p) {
    if (!p || typeof p !== "object") return { name: "", value: 0 };
    return {
        name: String(p.name ?? p.Name ?? ""),
        value: Number(p.value ?? p.Value ?? 0),
    };
}

const adminService = {
    getDashboardStats: async () => {
        const res = await fetchApiWithAuth("/api/admin/stats", { method: "GET" });
        if (!res.ok) throw new Error(await res.text());
        const data = await getJson(res);
        const raw = getContent(data);
        if (!raw) return raw;
        const userGrowthRaw = raw.userGrowth ?? raw.UserGrowth;
        const projectsByTypeRaw = raw.projectsByType ?? raw.ProjectsByType;
        return {
            ...raw,
            userGrowth: Array.isArray(userGrowthRaw) ? userGrowthRaw.map(normalizeChartPoint) : [],
            projectsByType: Array.isArray(projectsByTypeRaw) ? projectsByTypeRaw.map(normalizeChartPoint) : [],
        };
    },

    getUsers: async (params = {}) => {
        const q = new URLSearchParams();
        if (params.search) q.set("search", params.search);
        if (params.pageIndex != null) q.set("pageIndex", String(params.pageIndex));
        if (params.pageSize != null) q.set("pageSize", String(params.pageSize));
        const path = `/api/admin/users${q.toString() ? `?${q.toString()}` : ""}`;
        const res = await fetchApiWithAuth(path, { method: "GET" });
        if (!res.ok) throw new Error(await res.text());
        const data = await getJson(res);
        return getContent(data);
    },

    createUser: async (body) => {
        const res = await fetchApiWithAuth("/api/admin/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        const data = await getJson(res);
        if (!res.ok) {
            const msg = data?.message ?? data?.Message ?? "Failed to create user";
            throw new Error(msg);
        }
        return getContent(data);
    },

    updateUser: async (id, body) => {
        const res = await fetchApiWithAuth(`/api/admin/users/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        const data = await getJson(res);
        if (!res.ok) {
            const msg = data?.message ?? data?.Message ?? "Failed to update user";
            throw new Error(msg);
        }
        return getContent(data);
    },

    deleteUser: async (id) => {
        const res = await fetchApiWithAuth(`/api/admin/users/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error(await res.text());
        const data = await getJson(res);
        return getContent(data);
    },

    deleteUsersBulk: async (ids) => {
        const res = await fetchApiWithAuth("/api/admin/users/bulk", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids }),
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await getJson(res);
        return getContent(data);
    },

    toggleUserStatus: async (id) => {
        const res = await fetchApiWithAuth(`/api/admin/users/${id}/toggle-status`, { method: "PUT" });
        if (!res.ok) throw new Error(await res.text());
        const data = await getJson(res);
        return getContent(data);
    },

    getProjects: async (params = {}) => {
        const q = new URLSearchParams();
        if (params.search) q.set("search", params.search);
        if (params.pageIndex != null) q.set("pageIndex", String(params.pageIndex));
        if (params.pageSize != null) q.set("pageSize", String(params.pageSize));
        const path = `/api/admin/projects${q.toString() ? `?${q.toString()}` : ""}`;
        const res = await fetchApiWithAuth(path, { method: "GET" });
        if (!res.ok) throw new Error(await res.text());
        const data = await getJson(res);
        return getContent(data);
    },

    deleteProject: async (id) => {
        const res = await fetchApiWithAuth(`/api/admin/projects/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error(await res.text());
        const data = await getJson(res);
        return getContent(data);
    },

    deleteProjectsBulk: async (ids) => {
        const res = await fetchApiWithAuth("/api/admin/projects/bulk", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids }),
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await getJson(res);
        return getContent(data);
    },

    getProjectPreview: async (id) => {
        const res = await fetchApiWithAuth(`/api/admin/projects/${id}/preview`, { method: "GET" });
        if (!res.ok) throw new Error(await res.text());
        const data = await getJson(res);
        return getContent(data);
    },
};

export default adminService;
