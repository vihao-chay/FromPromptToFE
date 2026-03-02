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
            // Backend returns ResponseEntity with 'content' field
            const userData = response.content || response.data || response;

            setUser(userData);
            await AsyncStorage.setItem("user", JSON.stringify(userData));

            if (userData.token) {
                await AsyncStorage.setItem("token", userData.token);
            }
            showToast("Login successful!", "success");
        } catch (error) {
            console.error(error);
            showToast(error.message || "Login failed. Please try again.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const googleLogin = async (idToken) => {
        setIsLoading(true);
        try {
            const response = await googleLoginService(idToken);
            // Backend returns ResponseEntity. 
            // Handle both camelCase and PascalCase (common in .NET)
            // ResponseEntity structure: { success: true, message: "...", content: { ... } }
            const userData = response.content || response.Content || response.data || response.Data || response;

            console.log("[AuthContext] Setting User Data:", JSON.stringify(userData, null, 2));
            setUser(userData);
            await AsyncStorage.setItem("user", JSON.stringify(userData));

            const token = userData.token || userData.Token;
            if (token) {
                await AsyncStorage.setItem("token", token);
            }
            showToast("Google Login successful!", "success");
        } catch (error) {
            console.error(error);
            showToast(error.message || "Google Login failed", "error");
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
