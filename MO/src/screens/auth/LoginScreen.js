import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";

import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";

import { useAuth } from "../../context/AuthContext";
import Button from "../../components/Button";
import Logo from "../../components/Logo";
import { GoogleConfig } from "../../constants/googleConfig";
import { useToast } from "../../context/ToastContext";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }) {
    const { login, googleLogin, isLoading } = useAuth();
    const { showToast } = useToast();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    // Redirect URI uses Expo proxy for Expo Go
    const redirectUri = makeRedirectUri({
        scheme: "https",
        path: "auth.expo.io/@vinyalo/mo",
    });

    // Google Auth Request
    const [request, response, promptAsync] =
        Google.useIdTokenAuthRequest({
            clientId: GoogleConfig.webClientId,
            redirectUri,
            scopes: ["openid", "profile", "email"],
        });

    // Handle Google response
    useEffect(() => {
        if (response?.type === "success") {
            const { id_token } = response.params;
            if (id_token) {
                handleGoogleLogin(id_token);
            } else {
                showToast("No ID token received", "error");
            }
        }
        if (response?.type === "error") {
            showToast("Google login failed", "error");
        }
    }, [response]);

    const handleGoogleLogin = async (idToken) => {
        try {
            setIsGoogleLoading(true);
            await googleLogin(idToken);
        } catch (error) {
            showToast("Backend login failed", "error");
        } finally {
            setIsGoogleLoading(false);
        }
    };

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
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordWrap}>
                    <TextInput
                        style={styles.inputWithIcon}
                        placeholder="••••••••"
                        placeholderTextColor="#94a3b8"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                    />
                    <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowPassword((v) => !v)}
                        activeOpacity={0.7}
                    >
                        <MaterialIcons
                            name={showPassword ? "visibility-off" : "visibility"}
                            size={22}
                            color="#94a3b8"
                        />
                    </TouchableOpacity>
                </View>

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

            {/* Divider */}
            <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
                <View style={styles.dividerLine} />
            </View>

            {/* Google Button */}
            <TouchableOpacity
                style={styles.googleButton}
                onPress={() => promptAsync()}
                disabled={!request || isGoogleLoading || isLoading}
            >
                {isGoogleLoading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <>
                        <AntDesign
                            name="google"
                            size={24}
                            color="white"
                            style={{ marginRight: 10 }}
                        />
                        <Text style={styles.googleButtonText}>Google</Text>
                    </>
                )}
            </TouchableOpacity>

            <Text style={styles.signupText}>
                Don't have an account?{" "}
                <Text
                    style={styles.signupLink}
                    onPress={() => navigation.navigate("Register")}
                >
                    Sign up
                </Text>
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
    passwordWrap: {
        position: "relative",
    },
    inputWithIcon: {
        backgroundColor: "#020617",
        borderRadius: 12,
        padding: 14,
        paddingRight: 48,
        color: "white",
    },
    eyeButton: {
        position: "absolute",
        right: 12,
        top: 0,
        bottom: 0,
        justifyContent: "center",
        padding: 4,
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
        alignSelf: "flex-end",
        marginTop: 10,
    },
    forgotPasswordText: {
        color: "#2563eb",
        fontWeight: "600",
    },
    dividerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: "#334155",
    },
    dividerText: {
        color: "#64748b",
        paddingHorizontal: 16,
        fontSize: 12,
        fontWeight: "600",
    },
    googleButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1E293B",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#334155",
    },
    googleButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
});

