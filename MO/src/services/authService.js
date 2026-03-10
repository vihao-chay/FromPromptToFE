import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_CONFIG, getAPIUrl } from "../constants/config";

const fetchWithTimeout = (url, options = {}, timeout = API_CONFIG.TIMEOUT) => {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Request timeout. Check if API server is running and IP is correct.")), timeout)
        ),
    ]);
};

/** Header so localtunnel (.loca.lt) does not return "Click to continue" page – required for API. */
function getApiHeaders(customHeaders = {}) {
    const base = getAPIUrl();
    const isLocaltunnel = base && base.includes("loca.lt");
    return {
        "Content-Type": "application/json",
        ...(isLocaltunnel && { "Bypass-Tunnel-Reminder": "1" }),
        ...customHeaders,
    };
}

/** Parse error message from backend (message or Message). Fallback by status if JSON unavailable. */
const STATUS_MESSAGES = {
    400: "Invalid data. Please check and try again.",
    401: "Incorrect email or password.",
    403: "You do not have permission to perform this action.",
    404: "Not found.",
    500: "Server error. Please try again later.",
};

async function getErrorMessage(response, context = "Request") {
    const status = response.status;
    try {
        const text = await response.text();
        if (!text || !text.trim()) return STATUS_MESSAGES[status] || `${context} failed (${status}).`;
        const data = JSON.parse(text);
        const msg = data.message ?? data.Message ?? data.error ?? data.Error;
        if (msg && typeof msg === "string") return msg;
        return STATUS_MESSAGES[status] || `${context} failed (${status}).`;
    } catch {
        return STATUS_MESSAGES[status] || `${context} failed (${status}).`;
    }
}

/** Call API; on "Network request failed" retry with emulator URL (10.0.2.2) when using emulator. */
async function fetchApi(path, options) {
    const base = getAPIUrl();
    const headers = getApiHeaders(options.headers || {});
    const opts = { ...options, headers: { ...headers, ...(options.headers || {}) } };
    try {
        const url = `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
        return await fetchWithTimeout(url, opts);
    } catch (err) {
        const isNetworkFail = err?.message === "Network request failed" || String(err?.message || "").includes("Network request failed");
        const fallback = API_CONFIG.EMULATOR;
        if (isNetworkFail && base !== fallback && fallback) {
            try {
                const url = `${fallback.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
                console.log("[API] Retry with emulator URL:", url);
                return await fetchWithTimeout(url, options);
            } catch (e2) {
                throw err;
            }
        }
        throw err;
    }
}

/** Authenticated API: adds Bearer token from AsyncStorage. Use for /auth/me, /api/Organization, etc. */
export async function fetchApiWithAuth(path, options = {}) {
    const token = await AsyncStorage.getItem("token");
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
    const headers = { ...getApiHeaders(options.headers || {}), ...authHeaders };
    return fetchApi(path, { ...options, headers });
}

/** Get current user (requires token). Returns normalized user object. */
export const getMe = async () => {
    const response = await fetchApiWithAuth("/auth/me", { method: "GET" });
    if (!response.ok) throw new Error(await getErrorMessage(response, "Get profile"));
    const data = await response.json();
    const content = data.content ?? data.Content ?? data;
    return content;
};

/** Update profile (name, avatarUrl). Returns updated user. */
export const updateProfile = async (payload) => {
    const response = await fetchApiWithAuth("/auth/me", {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(await getErrorMessage(response, "Update profile"));
    const data = await response.json();
    const content = data.content ?? data.Content ?? data;
    return content;
};

/** Change password (oldPassword can be null for OAuth users). */
export const changePassword = async (oldPassword, newPassword) => {
    const body = { NewPassword: newPassword };
    if (oldPassword != null && oldPassword !== "") body.OldPassword = oldPassword;
    const response = await fetchApiWithAuth("/auth/change-password", {
        method: "POST",
        body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(await getErrorMessage(response, "Change password"));
    return response.json();
};

/** Get organizations the user belongs to (by userId). Requires auth. */
export async function getMyOrganizations(userId) {
    const response = await fetchApiWithAuth(`/api/OrganizationMember/user/${userId}`, { method: "GET" });
    if (!response.ok) throw new Error(await getErrorMessage(response, "Get organizations"));
    const data = await response.json();
    const content = data.content ?? data.Content;
    const raw = Array.isArray(content) ? content : (content?.totalItems ?? content?.TotalItems ?? []);
    const list = Array.isArray(raw) ? raw : [];
    return list.map((o) => ({
        organizationId: String(o.organizationId ?? o.OrganizationId ?? ""),
        organizationName: String(o.organizationName ?? o.OrganizationName ?? ""),
        organizationPlan: o.organizationPlan ?? o.OrganizationPlan,
        role: String(o.role ?? o.Role ?? ""),
        joinedAt: o.joinedAt ?? o.JoinedAt,
    }));
}

export const login = async (email, password) => {
    try {
        console.log("[LOGIN] Connecting to:", getAPIUrl(), "/auth/login");

        const response = await fetchApi("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const msg = await getErrorMessage(response, "Login");
            throw new Error(msg);
        }

        return response.json();
    } catch (error) {
        console.error("[LOGIN ERROR]", error.message);
        throw error;
    }
};

export const register = async (email, password) => {
    try {
        const response = await fetchApi("/auth/register", {
            method: "POST",
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const msg = await getErrorMessage(response, "Registration");
            throw new Error(msg);
        }

        return response.json();
    } catch (error) {
        console.error("[REGISTER ERROR]", error.message);
        throw error;
    }
};

export const verifyEmail = async (token) => {
    try {
        const response = await fetchApi("/auth/verify-email", {
            method: "POST",
            body: JSON.stringify({ token })
        });

        if (!response.ok) {
            const msg = await getErrorMessage(response, "Email verification");
            throw new Error(msg);
        }

        return response.json();
    } catch (error) {
        console.error("[VERIFY ERROR]", error.message);
        throw error;
    }
};

export const forgotPassword = async (email) => {
    try {
        const response = await fetchApi("/auth/forgot-password", {
            method: "POST",
            body: JSON.stringify({ email })
        });

        if (!response.ok) {
            const msg = await getErrorMessage(response, "Forgot password");
            throw new Error(msg);
        }

        return response.json();
    } catch (error) {
        console.error("[FORGOT PASSWORD ERROR]", error.message);
        throw error;
    }
};

export const resetPassword = async (token, newPassword) => {
    try {
        const response = await fetchApi("/auth/reset-password", {
            method: "POST",
            body: JSON.stringify({ token, newPassword })
        });

        if (!response.ok) {
            const msg = await getErrorMessage(response, "Reset password");
            throw new Error(msg);
        }

        return response.json();
    } catch (error) {
        console.error("[RESET PASSWORD ERROR]", error.message);
        throw error;
    }
};

export const googleLogin = async (idToken) => {
    try {
        console.log("[GOOGLE LOGIN] Connecting to:", getAPIUrl(), "/auth/google");

        const response = await fetchApi("/auth/google", {
            method: "POST",
            body: JSON.stringify({ idToken }),
        });

        if (!response.ok) {
            const msg = await getErrorMessage(response, "Google login");
            throw new Error(msg);
        }

        return response.json();
    } catch (error) {
        console.error("[GOOGLE LOGIN ERROR]", error.message);
        throw error;
    }
};
