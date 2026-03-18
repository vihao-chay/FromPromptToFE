import axios from "axios"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

/** JWT has 3 base64 parts separated by dots; if token doesn't match, it's invalid (e.g. old GitHub ID stored by mistake). */
function isJwtLike(token: string): boolean {
    if (!token || typeof token !== "string") return false;
    const parts = token.trim().split(".");
    return parts.length === 3 && parts.every((p) => p.length > 0);
}

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token && isJwtLike(token)) {
            // Safe assignment for Axios config headers
            config.headers.Authorization = `Bearer ${token}`;
        } else if (token) {
            // Invalid token (e.g. not a JWT) – clear it so we don't keep sending it and get 401
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.dispatchEvent(new Event("auth-logout"));
        }
        return config;
    },
    (error) => {
        throw error;
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Don't clear token on 401 from /api/auth/me – avoids kicking user to login when RequireOnboarding calls getMe()
            const url = (error.config?.url ?? "") as string;
            const isMe = url.includes("/me") || url.endsWith("me");
            if (!isMe) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.dispatchEvent(new Event("auth-logout"));
            }
        }
        throw error;
    }
);

export default api;
