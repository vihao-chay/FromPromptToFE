import api from "./api"

const organizationMemberService = {
    getAll: (organizationId: string) => {
        return api.get(`/api/organization-members/by-org/${organizationId}`)
    },
    getProjectsByMemberId: (memberId: string) => {
        return api.get(`/api/organization-members/by-user/${memberId}`)
    },
    addMember: (organizationId: string, email: string, role: string) => {
        return api.post(`/api/organization-members/invite`, { organizationId, email, role })
    },
    removeMember: (memberId: string) => {
        return api.delete(`/api/organization-members/${memberId}`)
    },
    updateMember: (memberId: string, role: string) => {
        return api.put(`/api/organization-members/${memberId}/role`, { role })
    }
}

export default organizationMemberService