import React, { createContext, useState, useContext } from "react";
import { Alert } from "react-native";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Mock login function
    const login = async (email, password) => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            if (email.trim() === 'admin' && password === '12345') {
                setUser({ email: email.trim(), name: "Admin User", role: 'admin' });
            } else {
                Alert.alert("Login Failed", "Invalid email or password. Try admin/12345");
            }
            setIsLoading(false);
        }, 1000);
    };

    // Mock logout function
    const logout = () => {
        setUser(null);
    };

    // Mock register function
    const register = async (email, password) => {
        setIsLoading(true);
        setTimeout(() => {
            setUser({ email, name: "User" });
            setIsLoading(false);
        }, 1000);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
