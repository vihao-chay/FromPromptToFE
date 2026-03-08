import api from "./api"

const organizationMemberService = {
    getAll: (organizationId: string) => {
        return api.get(`/api/OrganizationMember/org/${organizationId}`)
    },
    getProjectsByMemberId: (memberId: string) => {
        return api.get(`/api/OrganizationMember/user/${memberId}`)
    },
    addMember: (organizationId: string, email: string, role: string) => {
        return api.post(`/api/OrganizationMember/invite`, { organizationId, email, role })
    },
    removeMember: (memberId: string) => {
        return api.delete(`/api/OrganizationMember/${memberId}`)
    },
    updateMember: (memberId: string, role: string) => {
        return api.put(`/api/OrganizationMember/${memberId}/role`, { role })
    }
}

export default organizationMemberService