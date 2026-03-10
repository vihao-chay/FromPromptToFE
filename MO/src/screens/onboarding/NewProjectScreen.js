import React, { useState, useEffect } from "react";
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
import projectService from "../../services/projectService";
import { getMyOrganizations } from "../../services/authService";
import Button from "../../components/Button";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

export default function NewProjectScreen({ navigation, route }) {
    const organizationIdParam = route?.params?.organizationId;
    const fromOnboarding = route?.params?.fromOnboarding ?? false;
    const { user } = useAuth();
    const [organizationId, setOrganizationId] = useState(organizationIdParam ?? "");
    const [organizations, setOrganizations] = useState([]);
    const [projectName, setProjectName] = useState("");
    const [loadingOrgs, setLoadingOrgs] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const { showToast } = useToast();

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            const userId = user?.id ?? user?.Id;
            if (!userId) {
                setLoadingOrgs(false);
                return;
            }
            try {
                const orgs = await getMyOrganizations(String(userId));
                if (cancelled) return;
                setOrganizations(Array.isArray(orgs) ? orgs : []);
                if (organizationIdParam && orgs.some((o) => (o.organizationId ?? o.OrganizationId) === organizationIdParam)) {
                    setOrganizationId(organizationIdParam);
                } else if (orgs.length > 0 && !organizationId) {
                    setOrganizationId(orgs[0].organizationId ?? orgs[0].OrganizationId ?? "");
                }
            } catch (_) {
                if (!cancelled) setOrganizations([]);
            } finally {
                if (!cancelled) setLoadingOrgs(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [user?.id, user?.Id, organizationIdParam]);

    const handleSubmit = async () => {
        setError(null);
        if (!organizationId) {
            setError("Please select an organization.");
            return;
        }
        if (!projectName.trim()) {
            setError("Please enter a project name.");
            return;
        }
        setSubmitting(true);
        try {
            const created = await projectService.create({
                organizationId,
                name: projectName.trim(),
                projectType: "Draft",
            });
            const projectId = created?.id ?? created?.Id;
            showToast("Project created.", "success");
            if (fromOnboarding) {
                navigation.replace("Dashboard");
            } else {
                navigation.replace("Dashboard");
            }
        } catch (err) {
            setError(err?.message ?? "Could not create project. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingOrgs) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Text style={styles.text}>Loading organizations...</Text>
            </View>
        );
    }

    if (organizations.length === 0) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Text style={styles.text}>You are not in any organization yet.</Text>
                <TouchableOpacity
                    style={styles.linkBtn}
                    onPress={() => navigation.replace("NewOrganization", { fromOnboarding: true })}
                >
                    <Text style={styles.linkText}>Create an organization first</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                <Text style={styles.title}>
                    {fromOnboarding ? "Name your first project" : "New project"}
                </Text>
                <Text style={styles.subtitle}>
                    {fromOnboarding
                        ? "You will then see your projects and outputs on the dashboard."
                        : "Create a project in your organization."}
                </Text>

                <Text style={styles.label}>Organization</Text>
                <View style={styles.pickerWrap}>
                    {organizations.map((org) => {
                        const id = org.organizationId ?? org.OrganizationId ?? "";
                        const name = org.organizationName ?? org.OrganizationName ?? "Unnamed";
                        const isSelected = organizationId === id;
                        return (
                            <TouchableOpacity
                                key={id}
                                style={[styles.orgOption, isSelected && styles.orgOptionActive]}
                                onPress={() => setOrganizationId(id)}
                            >
                                <Text style={[styles.orgText, isSelected && styles.orgTextActive]} numberOfLines={1}>
                                    {name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <Text style={styles.label}>Project name</Text>
                <TextInput
                    style={styles.input}
                    value={projectName}
                    onChangeText={setProjectName}
                    placeholder="e.g. My App, Landing Page..."
                    placeholderTextColor="#64748b"
                    autoCapitalize="words"
                />

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <Button
                    title={submitting ? "Creating…" : "Create project"}
                    onPress={handleSubmit}
                    disabled={submitting || !organizationId}
                    loading={submitting}
                    style={styles.submitBtn}
                />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0f172a",
    },
    centered: {
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    scroll: {
        padding: 24,
        paddingTop: 48,
    },
    text: {
        color: "#94a3b8",
        fontSize: 14,
        textAlign: "center",
    },
    linkBtn: {
        marginTop: 12,
    },
    linkText: {
        color: "#2563eb",
        fontSize: 14,
        fontWeight: "600",
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
    pickerWrap: {
        marginBottom: 20,
        gap: 8,
    },
    orgOption: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: "#1e293b",
        borderWidth: 1,
        borderColor: "#334155",
    },
    orgOptionActive: {
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.15)",
    },
    orgText: {
        color: "#94a3b8",
        fontSize: 16,
    },
    orgTextActive: {
        color: "#2563eb",
        fontWeight: "600",
    },
    input: {
        backgroundColor: "#1e293b",
        borderRadius: 12,
        padding: 14,
        color: "#fff",
        fontSize: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#334155",
    },
    error: {
        color: "#f87171",
        fontSize: 14,
        marginBottom: 16,
    },
    submitBtn: {
        marginBottom: 12,
    },
});
