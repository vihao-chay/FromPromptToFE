import api from "./api"

const organizationService = {
    getAll: () => {
        return api.get("/api/organizations")
    },
    getById: (id: string) => {
        return api.get(`/api/organizations/${id}`)
    },
    create: (name: string, plan: string) => {
        return api.post("/api/organizations", { name, plan })
    },
    update: (id: string, name: string, plan: string) => {
        return api.put(`/api/organizations/${id}`, { name, plan })
    },
    delete: (id: string) => {
        return api.delete(`/api/organizations/${id}`)
    }
}

export default organizationService