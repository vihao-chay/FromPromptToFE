import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { getMe, getMyOrganizations } from "../../services/authService";
import projectService from "../../services/projectService";
import { useAuth } from "../../context/AuthContext";

const STATUS = { checking: "checking", noOrg: "noOrg", noProject: "noProject", ready: "ready", error: "error", unauthorized: "unauthorized" };

export default function OnboardingCheckScreen({ navigation }) {
    const { logout, user: authUser } = useAuth();
    const [status, setStatus] = useState(STATUS.checking);
    const [firstOrgId, setFirstOrgId] = useState(null);

    useEffect(() => {
        let cancelled = false;
        const check = async () => {
            try {
                const me = await getMe();
                const userId = me?.id ?? me?.Id;
                if (cancelled) return;
                if (!userId) {
                    setStatus(STATUS.ready);
                    return;
                }
                const orgs = await getMyOrganizations(String(userId));
                if (cancelled) return;
                const isAdmin = (authUser?.role ?? authUser?.Role ?? "") === "Admin";
                if (!orgs || orgs.length === 0) {
                    if (isAdmin) {
                        setStatus(STATUS.ready);
                        return;
                    }
                    setStatus(STATUS.noOrg);
                    return;
                }
                const orgId = orgs[0].organizationId ?? orgs[0].OrganizationId;
                setFirstOrgId(orgId);
                const projects = await projectService.getAll({ organizationId: orgId, pageIndex: 1, pageSize: 1 });
                if (cancelled) return;
                const hasProjects = Array.isArray(projects) && projects.length > 0;
                if (!hasProjects && !isAdmin) {
                    setStatus(STATUS.noProject);
                    return;
                }
                setStatus(STATUS.ready);
            } catch (err) {
                if (cancelled) return;
                const msg = (err?.message || "").toLowerCase();
                const isAuthError =
                    err?.response?.status === 401 ||
                    msg.includes("401") ||
                    msg.includes("unauthorized") ||
                    msg.includes("incorrect email") ||
                    msg.includes("token") ||
                    msg.includes("expired");
                const isNetworkOrTimeout =
                    msg.includes("timeout") ||
                    msg.includes("network request failed") ||
                    msg.includes("failed to fetch");
                if (isAuthError || isNetworkOrTimeout) {
                    setStatus(STATUS.unauthorized);
                    return;
                }
                setStatus(STATUS.error);
            }
        };
        check();
        return () => { cancelled = true; };
    }, [authUser?.role, authUser?.Role]);

    useEffect(() => {
        if (status !== STATUS.checking) return;
        const t = setTimeout(() => {
            setStatus(STATUS.error);
        }, 12000);
        return () => clearTimeout(t);
    }, [status]);

    useEffect(() => {
        if (status === STATUS.noOrg) {
            navigation.replace("NewOrganization", { fromOnboarding: true });
        } else if (status === STATUS.noProject && firstOrgId) {
            navigation.replace("NewProject", { organizationId: firstOrgId, fromOnboarding: true });
        } else if (status === STATUS.ready) {
            navigation.replace("Dashboard");
        } else if (status === STATUS.unauthorized) {
            logout();
        }
    }, [status, firstOrgId, navigation, logout]);

    if (status === STATUS.checking) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.text}>Checking...</Text>
                <Text style={[styles.retry, { marginTop: 24 }]} onPress={() => logout()}>
                    Logout
                </Text>
            </View>
        );
    }

    if (status === STATUS.error) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>Could not verify. Please try again.</Text>
                <Text style={styles.retry} onPress={() => setStatus(STATUS.checking)}>
                    Retry
                </Text>
                <Text style={[styles.retry, { marginTop: 16 }]} onPress={() => logout()}>
                    Go to Login
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#2563eb" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0f172a",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    text: {
        color: "#94a3b8",
        marginTop: 16,
        fontSize: 14,
    },
    retry: {
        color: "#2563eb",
        marginTop: 12,
        fontSize: 14,
        fontWeight: "600",
    },
});
