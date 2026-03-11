import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Logo from "../../components/Logo";
import AdminTabBar from "../../components/AdminTabBar";
import adminService from "../../services/adminService";

function StatCard({ title, value, icon, iconBg, iconColor }) {
    return (
        <View style={[styles.statCard, { backgroundColor: "#1e293b" }]}>
            <View style={[styles.statIconWrap, { backgroundColor: iconBg }]}>
                <MaterialIcons name={icon} size={24} color={iconColor} />
            </View>
            <View style={styles.statBody}>
                <Text style={styles.statTitle}>{title}</Text>
                <Text style={styles.statValue}>{String(value)}</Text>
            </View>
        </View>
    );
}

export default function AdminDashboardScreen({ navigation }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        adminService
            .getDashboardStats()
            .then((content) => setStats(content))
            .catch(() => setError("Failed to load dashboard stats."))
            .finally(() => setLoading(false));
    }, []);

    const totalUsed = stats ? (stats.totalTokensUsed ?? stats.TotalTokensUsed ?? 0) : 0;
    const totalRemaining = stats ? (stats.totalTokensRemaining ?? stats.TotalTokensRemaining ?? 0) : 0;
    const tokenUsedPercent = (totalUsed + totalRemaining) > 0 ? Math.min(100, Math.round((totalUsed / (totalUsed + totalRemaining)) * 100)) : 0;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Logo />
                <TouchableOpacity
                    style={styles.backToDashboard}
                    onPress={() => navigation.navigate("MainTabs")}
                    activeOpacity={0.7}
                >
                    <MaterialIcons name="home" size={22} color="#2563eb" />
                    <Text style={styles.backToDashboardText}>My Dashboard</Text>
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.titleRow}>
                    <Text style={styles.screenTitle}>System Overview</Text>
                </View>
                <Text style={styles.subtitle}>Comprehensive platform analytics and AI consumption</Text>

                {error ? (
                    <View style={styles.errorBox}>
                        <MaterialIcons name="error" size={20} color="#ef4444" />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : null}

                {loading ? (
                    <View style={styles.loadingWrap}>
                        <ActivityIndicator size="large" color="#2563eb" />
                        <Text style={styles.loadingText}>Loading system metrics...</Text>
                    </View>
                ) : stats ? (
                    <>
                        {/* Admin: only users & AI metrics. No organizations, no create project. */}
                        <View style={styles.statGrid}>
                            <StatCard
                                title="Total Users"
                                value={stats.totalUsers ?? stats.TotalUsers ?? 0}
                                icon="group"
                                iconBg="rgba(99, 102, 241, 0.3)"
                                iconColor="#818cf8"
                            />
                            <StatCard
                                title="Successful AI Prompts"
                                value={stats.totalAIGenerations ?? stats.TotalAIGenerations ?? 0}
                                icon="auto-awesome"
                                iconBg="rgba(249, 115, 22, 0.3)"
                                iconColor="#f97316"
                            />
                        </View>

                        <View style={styles.tokenBox}>
                            <Text style={styles.tokenTitle}>AI Token Pool</Text>
                            <Text style={styles.tokenSub}>Global monthly limit for code generation.</Text>
                            <View style={styles.tokenRow}>
                                <View>
                                    <Text style={styles.tokenUsedNum}>{String(totalUsed)}</Text>
                                    <Text style={styles.tokenLabel}>Tokens Consumed</Text>
                                </View>
                                <View style={{ alignItems: "flex-end" }}>
                                    <Text style={styles.tokenRemNum}>{String(totalRemaining)}</Text>
                                    <Text style={styles.tokenLabel}>Remaining</Text>
                                </View>
                            </View>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: `${tokenUsedPercent}%` }]} />
                            </View>
                            <Text style={styles.progressLegend}>{tokenUsedPercent}% Used</Text>
                        </View>

                        <View style={styles.verificationBox}>
                            <Text style={styles.verifyTitle}>User Verification</Text>
                            <View style={styles.verifyRow}>
                                <View style={styles.verifyItem}>
                                    <MaterialIcons name="verified-user" size={24} color="#10b981" />
                                    <View>
                                        <Text style={styles.verifyLabel}>Verified</Text>
                                        <Text style={styles.verifyValue}>{stats.verifiedUsers ?? stats.VerifiedUsers ?? 0}</Text>
                                    </View>
                                </View>
                                <View style={styles.verifyItem}>
                                    <MaterialIcons name="mark-email-unread" size={24} color="#f59e0b" />
                                    <View>
                                        <Text style={styles.verifyLabel}>Unverified</Text>
                                        <Text style={styles.verifyValue}>{stats.unverifiedUsers ?? stats.UnverifiedUsers ?? 0}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <Text style={styles.quickTitle}>Quick Administrative Access</Text>

                        <TouchableOpacity
                            style={styles.quickCard}
                            onPress={() => navigation.navigate("AdminUsers")}
                            activeOpacity={0.8}
                        >
                            <View style={styles.quickIconWrap}>
                                <MaterialIcons name="manage-accounts" size={32} color="#6366f1" />
                            </View>
                            <View style={styles.quickBody}>
                                <Text style={styles.quickCardTitle}>Manage Users & Access</Text>
                                <Text style={styles.quickCardSub}>View details, toggle status, and batch delete accounts.</Text>
                            </View>
                            <MaterialIcons name="arrow-forward" size={24} color="#64748b" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.quickCard}
                            onPress={() => navigation.navigate("AdminProjects")}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.quickIconWrap, { backgroundColor: "rgba(59, 130, 246, 0.2)" }]}>
                                <MaterialIcons name="dashboard-customize" size={32} color="#3b82f6" />
                            </View>
                            <View style={styles.quickBody}>
                                <Text style={styles.quickCardTitle}>Monitor Global Projects</Text>
                                <Text style={styles.quickCardSub}>Preview prompts, review generated code, manage workspaces.</Text>
                            </View>
                            <MaterialIcons name="arrow-forward" size={24} color="#64748b" />
                        </TouchableOpacity>
                    </>
                ) : null}
            </ScrollView>
            <AdminTabBar active="Dashboard" onChange={(tab) => { if (tab === "Profile") navigation.navigate("MainTabs", { screen: "Profile" }); if (tab === "Dashboard") navigation.navigate("MainTabs"); }} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0f172a" },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#1e293b",
    },
    backToDashboard: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 6, paddingHorizontal: 10 },
    backToDashboardText: { fontSize: 13, fontWeight: "600", color: "#2563eb" },
    scrollContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 120 },
    titleRow: { marginBottom: 4 },
    screenTitle: { fontSize: 24, fontWeight: "bold", color: "#fff" },
    subtitle: { fontSize: 14, color: "#94a3b8", marginBottom: 20 },
    errorBox: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, backgroundColor: "rgba(239,68,68,0.15)", borderRadius: 12, marginBottom: 16 },
    errorText: { color: "#f87171", fontSize: 14 },
    loadingWrap: { paddingVertical: 48, alignItems: "center" },
    loadingText: { color: "#94a3b8", marginTop: 12 },
    statGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 20 },
    statCard: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 16, width: "48%", gap: 12 },
    statIconWrap: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    statBody: { flex: 1 },
    statTitle: { fontSize: 12, color: "#94a3b8" },
    statValue: { fontSize: 20, fontWeight: "bold", color: "#fff" },
    tokenBox: { backgroundColor: "rgba(99, 102, 241, 0.2)", borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: "rgba(99, 102, 241, 0.4)" },
    tokenTitle: { fontSize: 16, fontWeight: "bold", color: "#fff", marginBottom: 4 },
    tokenSub: { fontSize: 12, color: "#a5b4fc", marginBottom: 16 },
    tokenRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
    tokenUsedNum: { fontSize: 28, fontWeight: "bold", color: "#fff" },
    tokenRemNum: { fontSize: 18, fontWeight: "bold", color: "#c7d2fe" },
    tokenLabel: { fontSize: 11, color: "#a5b4fc" },
    progressBarBg: { height: 10, backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 5, overflow: "hidden" },
    progressBarFill: { height: "100%", backgroundColor: "#6366f1", borderRadius: 5 },
    progressLegend: { fontSize: 11, color: "#a5b4fc", marginTop: 6 },
    verificationBox: { backgroundColor: "#1e293b", borderRadius: 16, padding: 20, marginBottom: 24 },
    verifyTitle: { fontSize: 12, fontWeight: "bold", color: "#64748b", marginBottom: 12, textTransform: "uppercase" },
    verifyRow: { flexDirection: "row", justifyContent: "space-between" },
    verifyItem: { flexDirection: "row", alignItems: "center", gap: 12 },
    verifyLabel: { fontSize: 12, color: "#64748b" },
    verifyValue: { fontSize: 18, fontWeight: "bold", color: "#fff" },
    quickTitle: { fontSize: 16, fontWeight: "bold", color: "#fff", marginBottom: 12 },
    quickCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#1e293b", borderRadius: 16, padding: 16, marginBottom: 12, gap: 16, borderWidth: 1, borderColor: "#334155" },
    quickIconWrap: { width: 56, height: 56, borderRadius: 12, backgroundColor: "rgba(99, 102, 241, 0.2)", alignItems: "center", justifyContent: "center" },
    quickBody: { flex: 1 },
    quickCardTitle: { fontSize: 16, fontWeight: "bold", color: "#fff" },
    quickCardSub: { fontSize: 13, color: "#94a3b8", marginTop: 4 },
});
