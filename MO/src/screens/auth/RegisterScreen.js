import React, { useState, useEffect, useRef } from "react";
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
import { register as registerService, login as loginService, verifyEmail as verifyEmailService } from "../../services/authService";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Verification Modal State
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  // Manual Verify State
  const [manualToken, setManualToken] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [isVerifyingManual, setIsVerifyingManual] = useState(false);

  const { showToast } = useToast();
  const { login } = useAuth();
  const timeoutRef = useRef(null);

  // Auto-polling effect
  useEffect(() => {
    let isMounted = true;

    const checkVerificationStatus = async () => {
      if (!showVerifyModal || !isMounted) return;
      if (showManualInput) return;

      try {
        // Poll silently using service
        const response = await loginService(email, password);


        // FIX: Check 'content.token' which is likely where the BE puts it
        const token = response?.token || response?.data?.token || response?.content?.token;

        if (token) {
          // Verified! 
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          setShowVerifyModal(false);

          // PERFORM AUTO-LOGIN
          showToast("Email verified! Logging in...", "success");
          await login(email, password);
          return;
        }
      } catch (error) {
        // Ignore (not verified yet)

      }

      if (isMounted && showVerifyModal && !showManualInput) {
        timeoutRef.current = setTimeout(checkVerificationStatus, 2000); // Check every 2s
      }
    };

    if (showVerifyModal && !showManualInput) {
      checkVerificationStatus();
    }

    return () => {
      isMounted = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [showVerifyModal, email, password, showManualInput]);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      showToast("Please fill in all fields", "error");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await registerService(email, password);

      // Auto-fill token if available
      const token = response?.token || response?.data?.token || response?.content?.token;
      if (token) {
        setManualToken(token);
        setShowManualInput(true); // Show input so user sees code is filled
      } else {
        setManualToken("");
        setShowManualInput(false);
      }

      setShowVerifyModal(true);
    } catch (error) {
      console.error(error);
      showToast(error.message || "Registration failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualVerify = async () => {
    if (!manualToken) {
      showToast("Please enter the token", "error");
      return;
    }
    setIsVerifyingManual(true);
    try {
      await verifyEmailService(manualToken);
      setShowVerifyModal(false);
      showToast("Email verified successfully! Logging you in...", "success");
      await login(email, password);
    } catch (error) {
      showToast(error.message || "Verification failed", "error");
    } finally {
      setIsVerifyingManual(false);
    }
  };

  const handleCloseVerifyModal = () => {
    setShowVerifyModal(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Logo style={styles.logo} />
      <Text style={styles.title}>Create an Account</Text>
      <Text style={styles.subtitle}>
        Start generating frontend code with AI.
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Email (Required)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#94a3b8"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Password (Required)</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="Create a strong password"
          placeholderTextColor="#94a3b8"
          value={password}
          onChangeText={setPassword}
        />

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="Repeat your password"
          placeholderTextColor="#94a3b8"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <Button
          title={isLoading ? "Creating Account..." : "Create Account"}
          onPress={handleRegister}
          loading={isLoading}
          style={styles.button}
        />

        <Button
          title="Already have an account? Login"
          variant="link"
          onPress={() => navigation.navigate("Login")}
          textStyle={styles.loginText}
        />
      </View>

      {/* VERIFY MODAL */}
      <Modal
        visible={showVerifyModal}
        transparent={true}
        animationType="fade"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <MaterialIcons name="mark-email-read" size={48} color="#3b82f6" style={{ marginBottom: 16 }} />
              <Text style={styles.modalTitle}>Check Your Email</Text>
              <Text style={styles.modalText}>
                We've sent a verification link to <Text style={{ fontWeight: 'bold', color: 'white' }}>{email}</Text>.
                {'\n'}Please click the link in your email to activate your account.
              </Text>

              {showManualInput ? (
                <View style={{ width: '100%' }}>
                  <TextInput
                    style={styles.tokenInput}
                    placeholder="Paste verification token here"
                    placeholderTextColor="#64748b"
                    value={manualToken}
                    onChangeText={setManualToken}
                    autoCapitalize="none"
                  />
                  <Button
                    title={isVerifyingManual ? "Verifying..." : "Verify Token"}
                    onPress={handleManualVerify}
                    loading={isVerifyingManual}
                    style={{ marginBottom: 12 }}
                  />
                  <TouchableOpacity onPress={() => setShowManualInput(false)}>
                    <Text style={styles.secondaryLink}>Back to auto-check</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ width: '100%', alignItems: 'center' }}>
                  <View style={styles.loaderContainer}>
                    <ActivityIndicator size="small" color="#94a3b8" />
                    <Text style={styles.loaderText}>Waiting for verification...</Text>
                  </View>

                  <TouchableOpacity onPress={() => setShowManualInput(true)} style={{ marginBottom: 20 }}>
                    <Text style={styles.secondaryLink}>Having trouble? Enter token manually</Text>
                  </TouchableOpacity>

                  <Button
                    title="Close"
                    variant="outline"
                    onPress={handleCloseVerifyModal}
                    style={styles.modalButton}
                  />
                </View>
              )}

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
  modalButton: {
    width: '100%',
    borderColor: '#334155',
    backgroundColor: 'transparent',
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
    backgroundColor: '#0F172A',
    padding: 12,
    paddingHorizontal: 20,
    borderRadius: 100,
  },
  loaderText: {
    color: '#cbd5e1',
    fontSize: 14,
  },
  secondaryLink: {
    color: '#3b82f6',
    fontSize: 14,
    textDecorationLine: 'underline',
    marginBottom: 8,
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
  }
});
