import api from "./api"

const organizationService = {
    getAll: () => {
        return api.get("/api/Organization")
    },
    getById: (id: string) => {
        return api.get(`/api/Organization/${id}`)
    },
    create: (name: string, plan: string) => {
        return api.post("/api/Organization", { name, plan })
    },
    update: (id: string, name: string, plan: string) => {
        return api.put(`/api/Organization/${id}`, { name, plan })
    },
    delete: (id: string) => {
        return api.delete(`/api/Organization/${id}`)
    }
}

export default organizationService