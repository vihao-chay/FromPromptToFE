import { API_URL, API_CONFIG } from "../constants/config";

/**
 * Fetch with timeout
 * @param {string} url - API endpoint
 * @param {object} options - Fetch options
 * @param {number} timeout - Timeout in milliseconds (default: 15s)
 */
const fetchWithTimeout = (url, options = {}, timeout = API_CONFIG.TIMEOUT) => {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout. Check if API server is running and IP is correct.')), timeout)
        )
    ]);
};

export const login = async (email, password) => {
    try {
        console.log(`[LOGIN] Connecting to: ${API_URL}/auth/login`);

        const response = await fetchWithTimeout(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Login failed (${response.status})`);
        }

        return response.json();
    } catch (error) {
        console.error("[LOGIN ERROR]", error.message);
        throw error;
    }
};

export const register = async (email, password) => {
    try {
        console.log(`[REGISTER] Connecting to: ${API_URL}/auth/register`);

        const response = await fetchWithTimeout(`${API_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Registration failed (${response.status})`);
        }

        return response.json();
    } catch (error) {
        console.error("[REGISTER ERROR]", error.message);
        throw error;
    }
};

export const verifyEmail = async (token) => {
    try {
        console.log(`[VERIFY] Connecting to: ${API_URL}/auth/verify-email`);

        const response = await fetchWithTimeout(`${API_URL}/auth/verify-email`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ token })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Verification failed (${response.status})`);
        }

        return response.json();
    } catch (error) {
        console.error("[VERIFY ERROR]", error.message);
        throw error;
    }
};

export const forgotPassword = async (email) => {
    try {
        console.log(`[FORGOT PASSWORD] Connecting to: ${API_URL}/auth/forgot-password`);

        const response = await fetchWithTimeout(`${API_URL}/auth/forgot-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to send reset link (${response.status})`);
        }

        return response.json();
    } catch (error) {
        console.error("[FORGOT PASSWORD ERROR]", error.message);
        throw error;
    }
};

export const resetPassword = async (token, newPassword) => {
    try {
        console.log(`[RESET PASSWORD] Connecting to: ${API_URL}/auth/reset-password`);

        const response = await fetchWithTimeout(`${API_URL}/auth/reset-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ token, newPassword })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Password reset failed (${response.status})`);
        }

        return response.json();
    } catch (error) {
        console.error("[RESET PASSWORD ERROR]", error.message);
        throw error;
    }
};

export const googleLogin = async (idToken) => {
    try {
        console.log(`[GOOGLE LOGIN] Connecting to: ${API_URL}/auth/google`);

        const response = await fetchWithTimeout(`${API_URL}/auth/google`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ IdToken: idToken })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Google Login failed (${response.status})`);
        }

        return response.json();
    } catch (error) {
        console.error("[GOOGLE LOGIN ERROR]", error.message);
        throw error;
    }
};
