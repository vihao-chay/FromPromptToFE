import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import organizationService from "../../services/organizationService";
import Button from "../../components/Button";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

const PLANS = ["Personal", "Team"];

export default function NewOrganizationScreen({ navigation, route }) {
    const fromOnboarding = route?.params?.fromOnboarding ?? false;
    const { logout } = useAuth();
    const [name, setName] = useState("");
    const [plan, setPlan] = useState("Personal");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const { showToast } = useToast();

    const handleSubmit = async () => {
        setError(null);
        if (!name.trim()) {
            setError("Please enter an organization name.");
            return;
        }
        setSubmitting(true);
        try {
            const created = await organizationService.create(name.trim(), plan);
            const orgId = created?.id ?? created?.Id;
            if (fromOnboarding && orgId) {
                navigation.replace("NewProject", { organizationId: orgId, fromOnboarding: true });
            } else {
                navigation.replace("MainTabs");
            }
            showToast("Organization created.", "success");
        } catch (err) {
            setError(err?.message ?? "Could not create organization. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                <Text style={styles.title}>
                    {fromOnboarding ? "Create your first organization" : "New organization"}
                </Text>
                <Text style={styles.subtitle}>
                    {fromOnboarding
                        ? "Create an organization, then add a project to get started."
                        : "Create an organization to manage projects and members."}
                </Text>

                <Text style={styles.label}>Organization name</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g. My Company, Work Team..."
                    placeholderTextColor="#64748b"
                    autoCapitalize="words"
                />

                <Text style={styles.label}>Plan</Text>
                <View style={styles.planRow}>
                    {PLANS.map((p) => (
                        <TouchableOpacity
                            key={p}
                            style={[styles.planOption, plan === p && styles.planOptionActive]}
                            onPress={() => setPlan(p)}
                        >
                            <Text style={[styles.planText, plan === p && styles.planTextActive]}>{p}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <Button
                    title={submitting ? "Creating…" : "Create organization"}
                    onPress={handleSubmit}
                    disabled={submitting}
                    loading={submitting}
                    style={styles.submitBtn}
                />
                {!fromOnboarding ? (
                    <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => navigation.replace("MainTabs")}
                    >
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.logoutBtn} onPress={() => logout()}>
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0f172a",
    },
    scroll: {
        padding: 24,
        paddingTop: 48,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: "#94a3b8",
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#e2e8f0",
        marginBottom: 8,
    },
    input: {
        backgroundColor: "#1e293b",
        borderRadius: 12,
        padding: 14,
        color: "#fff",
        fontSize: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#334155",
    },
    planRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 24,
    },
    planOption: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: "#1e293b",
        borderWidth: 1,
        borderColor: "#334155",
        alignItems: "center",
    },
    planOptionActive: {
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.15)",
    },
    planText: {
        color: "#94a3b8",
        fontWeight: "600",
    },
    planTextActive: {
        color: "#2563eb",
    },
    error: {
        color: "#f87171",
        fontSize: 14,
        marginBottom: 16,
    },
    submitBtn: {
        marginBottom: 12,
    },
    cancelBtn: {
        paddingVertical: 14,
        alignItems: "center",
    },
    cancelText: {
        color: "#94a3b8",
        fontSize: 14,
        fontWeight: "600",
    },
    logoutBtn: {
        paddingVertical: 14,
        alignItems: "center",
        marginTop: 8,
    },
    logoutText: {
        color: "#f87171",
        fontSize: 14,
        fontWeight: "600",
    },
});
