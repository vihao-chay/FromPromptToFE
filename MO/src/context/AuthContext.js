import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login as loginService, googleLogin as googleLoginService } from "../services/authService";
import { useToast } from "./ToastContext";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSplashLoading, setIsSplashLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    const checkUserLoggedIn = async () => {
        try {
            const userData = await AsyncStorage.getItem("user");
            if (userData) {
                setUser(JSON.parse(userData));
            }
        } catch (error) {
            console.log("Error checking user login status:", error);
        } finally {
            setIsSplashLoading(false);
        }
    };

    const login = async (email, password) => {
        setIsLoading(true);
        try {
            const response = await loginService(email, password);
            const userData = response.content || response.data || response;
            const token = userData.token || userData.Token;

            // Lưu user + token TRƯỚC khi setUser để OnboardingCheck getMe() đọc được token ngay
            await AsyncStorage.setItem("user", JSON.stringify(userData));
            if (token) await AsyncStorage.setItem("token", token);

            setUser(userData);
            showToast("Login successful!", "success");
        } catch (error) {
            console.error(error);
            const msg = error?.message || "";
            const isNetworkFailed = msg === "Network request failed" || msg.includes("Network request failed");
            showToast(
                isNetworkFailed
                    ? "Cannot reach server. Same WiFi? Backend running (dotnet run)? Correct IP in config.js? Emulator: set USE_EMULATOR=true."
                    : msg || "Login failed. Please try again.",
                "error"
            );
        } finally {
            setIsLoading(false);
        }
    };

    const googleLogin = async (idToken) => {
        setIsLoading(true);
        try {
            const response = await googleLoginService(idToken);
            const userData = response.content || response.Content || response.data || response.Data || response;
            const token = userData.token || userData.Token;

            // Lưu user + token TRƯỚC khi setUser để OnboardingCheck getMe() đọc được token ngay
            await AsyncStorage.setItem("user", JSON.stringify(userData));
            if (token) await AsyncStorage.setItem("token", token);

            setUser(userData);
            showToast("Google Login successful!", "success");
        } catch (error) {
            console.error(error);
            const msg = error?.message || "";
            const isNetworkFailed = msg === "Network request failed" || msg.includes("Network request failed");
            showToast(
                isNetworkFailed
                    ? "Cannot reach server. Same WiFi? Backend running (dotnet run)? Correct IP in config.js? Emulator: set USE_EMULATOR=true."
                    : msg || "Google Login failed",
                "error"
            );
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem("user");
            await AsyncStorage.removeItem("token");
            setUser(null);
            showToast("Logged out successfully", "success");
        } catch (error) {
            console.log("Error during logout:", error);
            showToast("Logout failed", "error");
        }
    };

    // Keep mock register for now unless we want to fix that too
    const register = async (email, password) => {
        setIsLoading(true);
        setTimeout(() => {
            setUser({ email, name: "User" });
            setIsLoading(false);
        }, 1000);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, isSplashLoading, login, logout, register, googleLogin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
