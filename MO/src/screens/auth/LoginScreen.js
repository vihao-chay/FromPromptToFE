import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import * as AuthSession from "expo-auth-session";
import * as Crypto from 'expo-crypto';
import { MaterialIcons } from "@expo/vector-icons";

import { useAuth } from "../../context/AuthContext";
import Button from "../../components/Button";
import Logo from "../../components/Logo";
import { GoogleConfig } from "../../constants/googleConfig";
import { useToast } from "../../context/ToastContext";

// 1. Setup WebBrowser to handle the redirect
WebBrowser.maybeCompleteAuthSession();

// 2. Define Google Discovery Endpoints explicitly
const discovery = {
    authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenEndpoint: "https://oauth2.googleapis.com/token",
    revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

// 3. Define Redirect URI dynamically
// This will generate the correct proxy URL for Expo Go (e.g., https://auth.expo.io/@user/slug)
const redirectUri = "https://auth.expo.io/@vuongcpmse180126/MO";

// Log Expo Redirect URI immediately
console.log("===== EXPO REDIRECT URI =====");
console.log(redirectUri);
console.log("=============================");

export { redirectUri };

export default function LoginScreen({ navigation }) {
    const { login, googleLogin, isLoading } = useAuth();
    const { showToast } = useToast();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [nonce, setNonce] = useState("");

    useEffect(() => {
        const generateNonce = async () => {
            const randomBytes = await Crypto.getRandomBytesAsync(16);
            const nonceString = Array.from(randomBytes)
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
            setNonce(nonceString);
        };
        generateNonce();
    }, []);

    // 4. Create the auth request using the dedicated hook
    // We strictly use the Web Client ID and Proxy for Expo Go development
    const [request, response, promptAsync] = Google.useIdTokenAuthRequest(
        {
            clientId: GoogleConfig.webClientId,
            redirectUri: redirectUri, // Use the generated URI
            selectAccount: true, // Force account selection
            nonce: nonce, // Required for id_token flow
        }
    );

    // 5. Log the Redirect URI exactly as requested
    useEffect(() => {
        if (request) {
            console.log("===== EXPO REDIRECT URI =====");
            console.log(request.redirectUri);
            console.log("=============================");
        }
    }, [request]);

    // 6. Handle the Auth Response
    useEffect(() => {
        if (response?.type === "success") {
            const { id_token } = response.params;
            handleGoogleLogin(id_token);
        } else if (response?.type === 'error') {
            showToast("Google Sign-In failed", "error");
            console.error("Auth Error:", response.error);
        }
    }, [response]);

    const handleGoogleLogin = async (token) => {
        if (!token) {
            alert("No ID token received from Google");
            return;
        }

        setIsGoogleLoading(true);
        try {
            await googleLogin(token);
            // STOP! Do not navigate manually. 
            // The RootNavigator will see the user state change and automatically switch to MainNavigator (Dashboard).
        } catch (error) {
            alert(`Login Error: ${error.message}`);
            console.error("Backend Login Error:", error);
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

            {/* Google Login Section */}
            <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
                <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
                style={styles.googleButton}
                onPress={() => promptAsync()}
                disabled={!request || isGoogleLoading || isLoading}
            >
                {isGoogleLoading ? (
                    <Text style={styles.googleButtonText}>Connecting...</Text>
                ) : (
                    <>
                        <MaterialIcons name="g-translate" size={24} color="white" style={{ marginRight: 10 }} />
                        <Text style={styles.googleButtonText}>Google</Text>
                    </>
                )}
            </TouchableOpacity>

            {/* Debug Info for User Convenience */}
            {request && (
                <View style={styles.debugContainer}>
                    <Text style={styles.debugLabel}>
                        👇 Thêm URI này vào Google Console 👇
                    </Text>
                    <Text selectable={true} style={styles.debugUri}>
                        {request.redirectUri}
                    </Text>
                </View>
            )}

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
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#334155',
    },
    dividerText: {
        color: '#64748b',
        paddingHorizontal: 16,
        fontSize: 12,
        fontWeight: '600',
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1E293B',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#334155',
    },
    googleButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    debugContainer: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#334155',
        borderRadius: 8
    },
    debugLabel: {
        color: '#cbd5e1',
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 5
    },
    debugUri: {
        color: '#ffffff',
        fontSize: 11,
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace'
    }
});
