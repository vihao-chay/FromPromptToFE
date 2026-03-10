import { fetchApiWithAuth } from "./authService";

/** Parse backend content (content or Content). */
function getContent(data) {
    if (!data) return undefined;
    return data.content ?? data.Content;
}

const organizationService = {
    getAll: async () => {
        const response = await fetchApiWithAuth("/api/Organization", { method: "GET" });
        if (!response.ok) {
            const text = await response.text();
            let msg = "Failed to load organizations.";
            try {
                const j = JSON.parse(text);
                msg = j.message ?? j.Message ?? msg;
            } catch (_) {}
            throw new Error(msg);
        }
        const data = await response.json();
        const content = getContent(data);
        const list = content?.totalItems ?? content?.TotalItems ?? (Array.isArray(content) ? content : []);
        return Array.isArray(list) ? list : [];
    },

    getById: async (id) => {
        const response = await fetchApiWithAuth(`/api/Organization/${id}`, { method: "GET" });
        if (!response.ok) throw new Error("Organization not found.");
        const data = await response.json();
        return getContent(data) ?? data;
    },

    create: async (name, plan = "Personal") => {
        const response = await fetchApiWithAuth("/api/Organization", {
            method: "POST",
            body: JSON.stringify({ name: name.trim(), plan }),
        });
        if (!response.ok) {
            const text = await response.text();
            let msg = "Failed to create organization.";
            try {
                const j = JSON.parse(text);
                msg = j.message ?? j.Message ?? msg;
            } catch (_) {}
            throw new Error(msg);
        }
        const data = await response.json();
        const content = getContent(data);
        const id = content?.id ?? content?.Id;
        return { id, ...content };
    },
};

export default organizationService;
