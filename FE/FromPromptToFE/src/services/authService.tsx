import api from "./api"

const authService = {
    login: (email: string, password: string) => {
        return api.post("/auth/login", { email, password })
    },
    loginWithGoogle: (idToken: string) => {
        return api.post("/auth/google", { idToken })
    },
    register: (email: string, password: string) => {
        return api.post("/auth/register", { email, password })
    },
    verifyEmail: (token: string) => {
        return api.post("/auth/verify-email", { token })
    },
    resendVerificationEmail: (email: string) => {
        return api.post("/auth/resend-verification", { email })
    },
    forgotPassword: (email: string) => {
        return api.post("/auth/forgot-password", { email })
    },
    resetPassword: (token: string, newPassword: string) => {
        return api.post("/auth/reset-password", { token, newPassword })
    },
    changePassword: (oldPassword: string, newPassword: string) => {
        return api.post("/auth/change-password", { oldPassword, newPassword })
    },
    refreshToken: (refreshToken: string) => {
        return api.post("/auth/refresh-token", { refreshToken })
    }
}

export default authService