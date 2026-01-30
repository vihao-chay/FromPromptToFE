import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../components/Button";
import Logo from "../../components/Logo";

export default function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail] = useState("");
    const [success, setSuccess] = useState(false);

    const handleReset = () => {
        setTimeout(() => {
            setSuccess(true);
        }, 800);
    };

    return (
        <SafeAreaView style={styles.container}>

            {/* Header */}
            <View style={styles.header}>
                <Logo />

                <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                    <Text style={styles.loginLink}>
                        Login
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>
                        Forgot Password?
                    </Text>
                    <Text style={styles.subtitle}>
                        Enter your email address and we'll send you a link to reset your password.
                    </Text>
                </View>

                <View style={styles.card}>

                    {/* Success Message */}
                    {success && (
                        <View style={styles.successBox}>
                            <Text style={styles.successTitle}>
                                Check your email
                            </Text>
                            <Text style={styles.successText}>
                                We've sent a password reset link to your inbox.
                            </Text>
                        </View>
                    )}

                    {!success && (
                        <>
                            <Text style={styles.label}>
                                Email Address
                            </Text>

                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                placeholder="name@university.edu"
                                placeholderTextColor="#94a3b8"
                                style={styles.input}
                            />

                            <Button
                                title="Send Reset Link"
                                onPress={handleReset}
                                style={styles.resetButton}
                            />
                        </>
                    )}

                    {/* Back to login */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Remembered your password?
                        </Text>
                        <Button
                            title="Go back to login"
                            variant="link"
                            onPress={() => navigation.navigate("Login")}
                            textStyle={styles.footerLink}
                        />
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0f172a", // slate-900 equivalent
        paddingHorizontal: 24,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 16,
    },
    loginLink: {
        fontSize: 14,
        color: "#94a3b8", // slate-400
    },
    content: {
        flex: 1,
        justifyContent: "center",
    },
    titleContainer: {
        marginBottom: 32,
    },
    title: {
        fontSize: 30,
        fontWeight: "bold",
        marginBottom: 8,
        color: "white",
    },
    subtitle: {
        fontSize: 14,
        color: "#94a3b8", // slate-400
    },
    card: {
        backgroundColor: "#1e293b", // slate-800
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#334155", // slate-700
    },
    successBox: {
        marginBottom: 24,
        padding: 16,
        borderRadius: 12,
        backgroundColor: "#064e3b", // emerald-900 equivalent
    },
    successTitle: {
        fontWeight: "600",
        color: "#34d399", // emerald-400
    },
    successText: {
        fontSize: 12,
        marginTop: 4,
        color: "#10b981", // emerald-500
    },
    label: {
        fontSize: 12,
        textTransform: "uppercase",
        letterSpacing: 1,
        color: "#94a3b8", // slate-400
        marginBottom: 8,
    },
    input: {
        backgroundColor: "#0f172a", // slate-900
        borderWidth: 1,
        borderColor: "#334155", // slate-700
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        color: "white",
        marginBottom: 24,
    },
    resetButton: {
        marginTop: 10,
    },
    footer: {
        marginTop: 32,
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: "#334155", // slate-700
        alignItems: "center",
    },
    footerText: {
        fontSize: 14,
        color: "#94a3b8", // slate-400
    },
    footerLink: {
        color: "#2563eb", // blue-600
        fontWeight: "600",
        marginTop: 4,
    },
});
