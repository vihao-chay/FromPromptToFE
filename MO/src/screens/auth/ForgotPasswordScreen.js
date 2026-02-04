import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    Modal,
    ActivityIndicator,
    TouchableOpacity,
    Keyboard,
    TouchableWithoutFeedback
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Button from "../../components/Button";
import Logo from "../../components/Logo";
import { forgotPassword, resetPassword } from "../../services/authService";
import { useToast } from "../../context/ToastContext";

export default function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Modal State
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [token, setToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isResetting, setIsResetting] = useState(false);

    const { showToast } = useToast();

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSendResetLink = async () => {
        // 1. Validate Empty
        if (!email || email.trim() === "") {
            showToast("Please enter your email", "error");
            return;
        }

        // 2. Validate Format
        if (!isValidEmail(email)) {
            showToast("Please enter a valid email address", "error");
            return;
        }

        setIsLoading(true);
        try {
            await forgotPassword(email);
            // On success, show the verification modal
            setShowVerifyModal(true);
            showToast("Reset link sent! Check your email.", "success");
        } catch (error) {
            console.error(error);
            showToast(error.message || "Failed to send reset link", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!token || !newPassword || !confirmPassword) {
            showToast("Please fill in all fields", "error");
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast("Passwords do not match", "error");
            return;
        }

        setIsResetting(true);
        try {
            await resetPassword(token, newPassword);
            setShowVerifyModal(false);
            showToast("Password reset successful! Please login.", "success");
            navigation.navigate("Login");
        } catch (error) {
            showToast(error.message || "Reset failed", "error");
        } finally {
            setIsResetting(false);
        }
    };

    const handleCloseModal = () => {
        setShowVerifyModal(false);
        setToken("");
        setNewPassword("");
        setConfirmPassword("");
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Logo style={styles.logo} />
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
                Enter your email address and we'll send you a link to reset your password.
            </Text>

            <View style={styles.card}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="name@university.edu"
                    placeholderTextColor="#94a3b8"
                    style={styles.input}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <Button
                    title={isLoading ? "Sending..." : "Send Reset Link"}
                    onPress={handleSendResetLink}
                    loading={isLoading}
                    style={styles.button}
                />

                <Button
                    title="Remembered your password? Login"
                    variant="link"
                    onPress={() => navigation.navigate("Login")}
                    textStyle={styles.loginText}
                />
            </View>

            {/* VERIFY / RESET MODAL */}
            <Modal
                visible={showVerifyModal}
                transparent={true}
                animationType="fade"
                onRequestClose={handleCloseModal}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <MaterialIcons name="mark-email-read" size={48} color="#3b82f6" style={{ marginBottom: 16 }} />
                            <Text style={styles.modalTitle}>Check Your Email</Text>
                            <Text style={styles.modalText}>
                                We've sent a verification code to <Text style={{ fontWeight: 'bold', color: 'white' }}>{email}</Text>.
                                {'\n'}Please enter it below to reset your password.
                            </Text>

                            <ScrollView style={{ width: '100%' }}>
                                <TextInput
                                    style={styles.tokenInput}
                                    placeholder="Paste verification code here"
                                    placeholderTextColor="#64748b"
                                    value={token}
                                    onChangeText={setToken}
                                    autoCapitalize="none"
                                />

                                <Text style={styles.modalLabel}>New Password</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="Enter new password"
                                    placeholderTextColor="#64748b"
                                    secureTextEntry
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                />

                                <Text style={styles.modalLabel}>Confirm Password</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="Confirm new password"
                                    placeholderTextColor="#64748b"
                                    secureTextEntry
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                />

                                <Button
                                    title={isResetting ? "Resetting..." : "Reset Password"}
                                    onPress={handleResetPassword}
                                    loading={isResetting}
                                    style={{ marginTop: 20, marginBottom: 12 }}
                                />

                                <TouchableOpacity onPress={handleCloseModal}>
                                    <Text style={styles.secondaryLink}>Cancel</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
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
        fontSize: 26,
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
        borderRadius: 24,
    },
    label: {
        color: "#cbd5e1",
        marginBottom: 6,
        marginTop: 12,
    },
    input: {
        backgroundColor: "#020617",
        borderRadius: 16,
        padding: 14,
        color: "white",
    },
    button: {
        marginTop: 20,
    },
    loginText: {
        marginTop: 20,
        textAlign: "center",
        color: "#1d63ed",
        fontWeight: "600",
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: '#1E293B',
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
        width: '100%',
        maxWidth: 400,
        maxHeight: '90%', // Limit height for ScrollView
        alignSelf: 'center',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 12,
    },
    modalText: {
        color: '#94A3B8',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 24,
        fontSize: 16,
    },
    modalLabel: {
        color: "#cbd5e1",
        marginBottom: 6,
        marginTop: 12,
        alignSelf: 'flex-start',
    },
    modalInput: {
        backgroundColor: '#0F172A',
        width: '100%',
        padding: 14,
        borderRadius: 12,
        color: 'white',
        borderWidth: 1,
        borderColor: '#334155',
        textAlign: 'left',
    },
    tokenInput: {
        backgroundColor: '#0F172A',
        width: '100%',
        padding: 14,
        borderRadius: 12,
        color: 'white',
        borderWidth: 1,
        borderColor: '#334155',
        marginBottom: 16,
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 18,
    },
    secondaryLink: {
        color: '#3b82f6',
        fontSize: 14,
        textDecorationLine: 'underline',
        marginBottom: 8,
        textAlign: 'center',
        marginTop: 10,
    },
});
