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
import Button from "../../components/Button";
import Logo from "../../components/Logo";

export default function LoginScreen({ navigation }) {
    const { login, isLoading } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Logo style={styles.logo} />
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

                <Button
                    title="Forgot Password?"
                    variant="link"
                    onPress={() => navigation.navigate("ForgotPassword")}
                    style={styles.forgotPasswordButton}
                    textStyle={styles.forgotPasswordText}
                />

                <Button
                    title={isLoading ? "Signing in..." : "Sign In"}
                    onPress={() => login(email, password)}
                    loading={isLoading}
                    style={styles.signInButton}
                />
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
    logo: {
        marginBottom: 30,
        alignSelf: "center",
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
    forgotPasswordButton: {
        alignSelf: 'flex-end',
        marginTop: 10,
    },
    forgotPasswordText: {
        color: "#2563eb",
        fontWeight: "600",
    },
});
