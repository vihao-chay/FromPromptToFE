import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from "react-native";

import { useAuth } from "../../context/AuthContext";

export default function LoginScreen({ navigation }) {
    const { login, isLoading } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
                Enter your details to access your dashboard
            </Text>

            <View style={styles.card}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                    style={styles.input}
                    placeholder="name@university.edu"
                    placeholderTextColor="#94a3b8"
                    value={email}
                    onChangeText={setEmail}
                />

                <Text style={styles.label}>Password</Text>
                <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.signInButton}
                    onPress={() => login(email, password)}
                    disabled={isLoading}
                >
                    <Text style={styles.signInText}>
                        {isLoading ? "Signing in..." : "Sign In"}
                    </Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.signupText}>
                Don't have an account?{" "}
                <Text style={styles.signupLink} onPress={() => navigation.navigate("Register")}>Sign up</Text>
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: "#0f172a",
        padding: 24,
        justifyContent: "center",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "white",
        textAlign: "center",
    },
    subtitle: {
        textAlign: "center",
        color: "#94a3b8",
        marginBottom: 30,
    },
    card: {
        backgroundColor: "#1e293b",
        padding: 20,
        borderRadius: 20,
    },
    label: {
        color: "#cbd5e1",
        marginBottom: 6,
        marginTop: 10,
    },
    input: {
        backgroundColor: "#020617",
        borderRadius: 12,
        padding: 14,
        color: "white",
    },
    signInButton: {
        marginTop: 20,
        backgroundColor: "#2563eb",
        padding: 15,
        borderRadius: 12,
        alignItems: "center",
    },
    signInText: {
        color: "white",
        fontWeight: "bold",
    },
    signupText: {
        marginTop: 30,
        textAlign: "center",
        color: "#94a3b8",
    },
    signupLink: {
        color: "#2563eb",
        fontWeight: "bold",
    },
    forgotPasswordText: {
        color: "#2563eb",
        textAlign: "right",
        marginTop: 10,
        fontWeight: "600",
    },
});
