import api from "./api"

const organizationMemberService = {
    getAll: (organizationId: string) => {
        return api.get(`/OrganizationMember/org/${organizationId}`)
    }
}

export default organizationMemberService