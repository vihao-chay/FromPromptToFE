import { API_URL } from "../constants/api";

export const login = async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
        throw new Error("Login failed");
    }

    return response.json();

};

export const register = async (email, password) => {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Origin": "http://localhost:3000"
        },
        body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
    }

    return response.json();
};

export const verifyEmail = async (token) => {
    const response = await fetch(`${API_URL}/auth/verify-email`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Origin": "http://localhost:3000"
        },
        body: JSON.stringify({ token })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Verification failed");
    }

    return response.json();
    return response.json();
};

export const forgotPassword = async (email) => {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Origin": "http://localhost:3000"
        },
        body: JSON.stringify({ email })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send reset link");
    }

    return response.json();
};

export const resetPassword = async (token, newPassword) => {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Origin": "http://localhost:3000"
        },
        body: JSON.stringify({ token, newPassword })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Password reset failed");
    }

    return response.json();
};
