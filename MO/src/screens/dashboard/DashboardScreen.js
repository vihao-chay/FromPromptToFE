import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    Modal,
    Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import ProjectCard from "../../components/ProjectCard";
import SmoothAreaChart from "../../components/SmoothAreaChart";
import DonutChart from "../../components/DonutChart";
import BottomTabBar from "../../components/BottomTabBar";
import Logo from "../../components/Logo";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import { getMe, getMyOrganizations } from "../../services/authService";
import projectService from "../../services/projectService";
import projectOutputService from "../../services/projectOutputService";
import adminService from "../../services/adminService";

function normalizeUser(c) {
    if (!c) return null;
    return {
        id: String(c.id ?? c.Id ?? ""),
        email: String(c.email ?? c.Email ?? ""),
        name: c.name != null ? String(c.name) : (c.Name != null ? String(c.Name) : undefined),
        avatarUrl: c.avatarUrl != null ? String(c.avatarUrl) : (c.AvatarUrl != null ? String(c.AvatarUrl) : undefined),
        role: String(c.role ?? c.Role ?? ""),
    };
}

const ORG_ICON_STYLES = [
    { icon: "school", bg: "#4f46e5", color: "#fff" },
    { icon: "star", bg: "#db2777", color: "#fff" },
    { icon: "code", bg: "#2563eb", color: "#fff" },
    { icon: "palette", bg: "#ea580c", color: "#fff" },
    { icon: "work", bg: "#7c3aed", color: "#fff" },
    { icon: "groups", bg: "#0891b2", color: "#fff" },
];
function getOrgIconStyle(index) {
    return ORG_ICON_STYLES[index % ORG_ICON_STYLES.length];
}

export default function DashboardScreen({ navigation }) {
    const { user: authUser } = useAuth();
    const [user, setUser] = useState(null);
    const [organizations, setOrganizations] = useState([]);
    const [projects, setProjects] = useState([]);
    const [outputCountByProject, setOutputCountByProject] = useState({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    /** Currently selected organization (id). Projects shown are only from this org. */
    const [selectedOrgId, setSelectedOrgId] = useState(null);
    /** Pending org to switch to – show confirm modal. */
    const [confirmOrg, setConfirmOrg] = useState(null);
    /** Admin: stats for System Overview (shown inline when isAdmin). */
    const [adminStats, setAdminStats] = useState(null);
    const [adminLoading, setAdminLoading] = useState(false);
    const [adminError, setAdminError] = useState(null);

    const loadData = async (opts) => {
        try {
            const me = await getMe();
            const u = normalizeUser(me);
            setUser(u);
            if (!u?.id) {
                setOrganizations([]);
                setProjects([]);
                setSelectedOrgId(null);
                return;
            }
            const orgs = await getMyOrganizations(u.id);
            const orgList = Array.isArray(orgs) ? orgs : [];
            setOrganizations(orgList);
            if (!orgList.length) {
                setProjects([]);
                setSelectedOrgId(null);
                return;
            }
            const allProjects = [];
            for (const org of orgList) {
                const orgId = org.organizationId ?? org.OrganizationId ?? "";
                if (!orgId) continue;
                const list = await projectService.getAll({ organizationId: orgId, pageIndex: 1, pageSize: 100 });
                (list || []).forEach((p) => {
                    const id = p.id ?? p.Id ?? "";
                    allProjects.push({
                        id,
                        name: p.name ?? p.Name ?? "Unnamed",
                        projectType: p.projectType ?? p.ProjectType ?? "Draft",
                        createdAt: p.createdAt ?? p.CreatedAt ?? "",
                        organizationId: orgId,
                        organizationName: org.organizationName ?? org.OrganizationName ?? "",
                    });
                });
            }
            allProjects.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            setProjects(allProjects);
            const orgIds = orgList.map((o) => o.organizationId ?? o.OrganizationId ?? "");
            const firstId = orgIds[0] || null;
            setSelectedOrgId((prev) => {
                if (prev === null && firstId) return firstId;
                if (prev && !orgIds.includes(prev)) return firstId;
                return prev;
            });
            const counts = {};
            await Promise.all(
                allProjects.slice(0, 20).map(async (proj) => {
                    try {
                        const { totalRow } = await projectOutputService.getByProjectId(proj.id, { pageIndex: 1, pageSize: 1 });
                        counts[proj.id] = totalRow ?? 0;
                    } catch (_) {
                        counts[proj.id] = 0;
                    }
                })
            );
            setOutputCountByProject(counts);
        } catch (_) {
            setOrganizations([]);
            setProjects([]);
        } finally {
            setLoading(false);
            if (!opts?.fromRefresh) setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const isAdmin = (authUser?.role ?? authUser?.Role ?? user?.role ?? user?.Role ?? "") === "Admin";
    useEffect(() => {
        if (!isAdmin) return;
        setAdminLoading(true);
        setAdminError(null);
        adminService
            .getDashboardStats()
            .then((c) => setAdminStats(c))
            .catch(() => setAdminError("Failed to load dashboard stats."))
            .finally(() => setAdminLoading(false));
    }, [isAdmin]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData({ fromRefresh: true });
        if ((authUser?.role ?? authUser?.Role ?? user?.role ?? user?.Role ?? "") === "Admin") {
            setAdminError(null);
            try {
                const c = await adminService.getDashboardStats();
                setAdminStats(c);
            } catch (_) {
                setAdminError("Failed to load dashboard stats.");
            }
        }
        setRefreshing(false);
    };

    const handleOrgPress = (orgId, orgName) => {
        if (orgId === selectedOrgId) return;
        setConfirmOrg({ id: orgId, name: orgName });
    };

    const handleConfirmSwitchOrg = () => {
        if (confirmOrg) {
            setSelectedOrgId(confirmOrg.id);
            setConfirmOrg(null);
        }
    };

    const projectsInSelectedOrg = selectedOrgId
        ? projects.filter((p) => (p.organizationId || "") === selectedOrgId)
        : [];
    const filteredProjects = searchQuery.trim()
        ? projectsInSelectedOrg.filter(
            (p) =>
                (p.name || "").toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
                (p.organizationName || "").toLowerCase().includes(searchQuery.trim().toLowerCase())
        )
        : projectsInSelectedOrg;

    const selectedOrgName = organizations.find(
        (o) => (o.organizationId ?? o.OrganizationId) === selectedOrgId
    )?.organizationName ?? organizations.find((o) => (o.organizationId ?? o.OrganizationId) === selectedOrgId)?.OrganizationName ?? "Organization";

    const totalUsed = adminStats ? (adminStats.totalTokensUsed ?? adminStats.TotalTokensUsed ?? 0) : 0;
    const totalRemaining = adminStats ? (adminStats.totalTokensRemaining ?? adminStats.TotalTokensRemaining ?? 0) : 0;
    const tokenUsedPercent = (totalUsed + totalRemaining) > 0 ? Math.min(100, Math.round((totalUsed / (totalUsed + totalRemaining)) * 100)) : 0;

    const userGrowth = Array.isArray(adminStats?.userGrowth) ? adminStats.userGrowth : [];
    const projectsByType = Array.isArray(adminStats?.projectsByType) ? adminStats.projectsByType : [];
    const maxUserGrowth = userGrowth.length ? Math.max(...userGrowth.map((d) => Number(d.value)), 1) : 1;
    const totalByType = projectsByType.reduce((sum, e) => sum + Number(e.value), 0);

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <Logo />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />
                }
            >
                {isAdmin ? (
                    <>
                        <View style={styles.adminTitleRow}>
                            <Text style={styles.adminScreenTitle}>System Overview</Text>
                        </View>
                        <Text style={styles.adminSubtitle}>Comprehensive platform analytics and AI consumption</Text>
                        {adminError ? (
                            <View style={styles.adminErrorBox}>
                                <MaterialIcons name="error" size={20} color="#ef4444" />
                                <Text style={styles.adminErrorText}>{adminError}</Text>
                            </View>
                        ) : null}
                        {adminLoading ? (
                            <View style={styles.adminLoadingWrap}>
                                <ActivityIndicator size="large" color="#2563eb" />
                                <Text style={styles.adminLoadingText}>Loading system metrics...</Text>
                            </View>
                        ) : adminStats ? (
                            <>
                                <View style={styles.adminStatGrid}>
                                    <View style={styles.adminStatCard}>
                                        <View style={[styles.adminStatIconWrap, { backgroundColor: "rgba(99, 102, 241, 0.3)" }]}>
                                            <MaterialIcons name="group" size={24} color="#818cf8" />
                                        </View>
                                        <View style={styles.adminStatBody}>
                                            <Text style={styles.adminStatTitle}>Total Users</Text>
                                            <Text style={styles.adminStatValue}>{String(adminStats.totalUsers ?? adminStats.TotalUsers ?? 0)}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.adminStatCard}>
                                        <View style={[styles.adminStatIconWrap, { backgroundColor: "rgba(249, 115, 22, 0.3)" }]}>
                                            <MaterialIcons name="auto-awesome" size={24} color="#f97316" />
                                        </View>
                                        <View style={styles.adminStatBody}>
                                            <Text style={styles.adminStatTitle}>Successful AI Prompts</Text>
                                            <Text style={styles.adminStatValue}>{String(adminStats.totalAIGenerations ?? adminStats.TotalAIGenerations ?? 0)}</Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.adminChartCard}>
                                    <View style={styles.adminChartTitleRow}>
                                        <MaterialIcons name="trending-up" size={20} color="#6366f1" />
                                        <Text style={styles.adminChartTitle}>New Users (Last 7 Days)</Text>
                                    </View>
                                    {userGrowth.length > 0 ? (
                                        <View style={styles.adminAreaChartWrap}>
                                            <SmoothAreaChart
                                                data={userGrowth}
                                                width={Dimensions.get("window").width - 32}
                                                height={200}
                                                color="#6366f1"
                                                gradientOpacity={0.35}
                                            />
                                        </View>
                                    ) : (
                                        <Text style={styles.adminChartEmpty}>No new users in the last 7 days</Text>
                                    )}
                                </View>
                                <View style={styles.adminChartCard}>
                                    <View style={styles.adminChartTitleRow}>
                                        <MaterialIcons name="pie-chart" size={20} color="#6366f1" />
                                        <Text style={styles.adminChartTitle}>Projects by Category</Text>
                                    </View>
                                    {projectsByType.length > 0 ? (
                                        <View style={styles.adminDonutWrap}>
                                            <DonutChart
                                                data={projectsByType}
                                                size={200}
                                                strokeWidth={26}
                                                colors={["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]}
                                            />
                                        </View>
                                    ) : (
                                        <Text style={styles.adminChartEmpty}>No projects by type</Text>
                                    )}
                                </View>
                                <View style={styles.adminTokenBox}>
                                    <Text style={styles.adminTokenTitle}>AI Token Pool</Text>
                                    <Text style={styles.adminTokenSub}>Global monthly limit for code generation.</Text>
                                    <View style={styles.adminTokenRow}>
                                        <View>
                                            <Text style={styles.adminTokenUsedNum}>{String(totalUsed)}</Text>
                                            <Text style={styles.adminTokenLabel}>Tokens Consumed</Text>
                                        </View>
                                        <View style={{ alignItems: "flex-end" }}>
                                            <Text style={styles.adminTokenRemNum}>{String(totalRemaining)}</Text>
                                            <Text style={styles.adminTokenLabel}>Remaining</Text>
                                        </View>
                                    </View>
                                    <View style={styles.adminProgressBarBg}>
                                        <View style={[styles.adminProgressBarFill, { width: `${tokenUsedPercent}%` }]} />
                                    </View>
                                    <Text style={styles.adminProgressLegend}>{tokenUsedPercent}% Used</Text>
                                </View>
                                <View style={styles.adminVerificationBox}>
                                    <Text style={styles.adminVerifyTitle}>User Verification</Text>
                                    <View style={styles.adminVerifyRow}>
                                        <View style={styles.adminVerifyItem}>
                                            <MaterialIcons name="verified-user" size={24} color="#10b981" />
                                            <View>
                                                <Text style={styles.adminVerifyLabel}>Verified</Text>
                                                <Text style={styles.adminVerifyValue}>{adminStats.verifiedUsers ?? adminStats.VerifiedUsers ?? 0}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.adminVerifyItem}>
                                            <MaterialIcons name="mark-email-unread" size={24} color="#f59e0b" />
                                            <View>
                                                <Text style={styles.adminVerifyLabel}>Unverified</Text>
                                                <Text style={styles.adminVerifyValue}>{adminStats.unverifiedUsers ?? adminStats.UnverifiedUsers ?? 0}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                                <Text style={styles.adminQuickTitle}>Quick Administrative Access</Text>
                                <TouchableOpacity style={styles.adminQuickCard} onPress={() => navigation.navigate("AdminUsers")} activeOpacity={0.8}>
                                    <View style={styles.adminQuickIconWrap}>
                                        <MaterialIcons name="manage-accounts" size={32} color="#6366f1" />
                                    </View>
                                    <View style={styles.adminQuickBody}>
                                        <Text style={styles.adminQuickCardTitle}>Manage Users & Access</Text>
                                        <Text style={styles.adminQuickCardSub}>View details, toggle status, and batch delete accounts.</Text>
                                    </View>
                                    <MaterialIcons name="arrow-forward" size={24} color="#64748b" />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.adminQuickCard} onPress={() => navigation.navigate("AdminProjects")} activeOpacity={0.8}>
                                    <View style={[styles.adminQuickIconWrap, { backgroundColor: "rgba(59, 130, 246, 0.2)" }]}>
                                        <MaterialIcons name="dashboard-customize" size={32} color="#3b82f6" />
                                    </View>
                                    <View style={styles.adminQuickBody}>
                                        <Text style={styles.adminQuickCardTitle}>Monitor Global Projects</Text>
                                        <Text style={styles.adminQuickCardSub}>Preview prompts, review generated code, manage workspaces.</Text>
                                    </View>
                                    <MaterialIcons name="arrow-forward" size={24} color="#64748b" />
                                </TouchableOpacity>
                            </>
                        ) : null}
                    </>
                ) : (
                    <>
                        {/* My Organizations */}
                        <View style={styles.sectionTitleRow}>
                            <MaterialIcons name="groups" size={22} color="#2563eb" />
                            <Text style={styles.sectionTitle}>My Organizations</Text>
                        </View>
                        {loading ? (
                            <View style={styles.orgPlaceholder}>
                                <ActivityIndicator size="small" color="#2563eb" />
                            </View>
                        ) : organizations.length === 0 ? (
                            <Text style={styles.emptyOrgs}>No organizations. Create one first.</Text>
                        ) : (
                            <View style={styles.orgList}>
                                {organizations.map((org, index) => {
                                    const orgId = org.organizationId ?? org.OrganizationId ?? "";
                                    const orgName = org.organizationName ?? org.OrganizationName ?? "Unnamed";
                                    const plan = org.organizationPlan ?? org.OrganizationPlan ?? "";
                                    const isSelected = selectedOrgId === orgId;
                                    const iconStyle = getOrgIconStyle(index);
                                    const projectCount = projects.filter((p) => (p.organizationId || "") === orgId).length;
                                    return (
                                        <TouchableOpacity
                                            key={orgId}
                                            style={[styles.orgCard, isSelected && styles.orgCardSelected]}
                                            onPress={() => handleOrgPress(orgId, orgName)}
                                            activeOpacity={0.85}
                                        >
                                            <View style={[styles.orgIconWrap, { backgroundColor: iconStyle.bg }]}>
                                                <MaterialIcons name={iconStyle.icon} size={26} color={iconStyle.color} />
                                            </View>
                                            <View style={styles.orgCardBody}>
                                                <Text
                                                    style={[styles.orgCardName, isSelected && styles.orgCardNameSelected]}
                                                    numberOfLines={1}
                                                >
                                                    {orgName}
                                                </Text>
                                                <Text style={styles.orgCardMeta} numberOfLines={1}>
                                                    {plan ? `${plan} · ` : ""}{projectCount} project{projectCount !== 1 ? "s" : ""}
                                                </Text>
                                            </View>
                                            {isSelected ? (
                                                <View style={styles.orgSelectedBadge}>
                                                    <MaterialIcons name="check-circle" size={20} color="#2563eb" />
                                                </View>
                                            ) : (
                                                <MaterialIcons name="chevron-right" size={22} color="#475569" />
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}

                        <View style={styles.titleRow}>
                            <Text style={styles.screenTitle}>Projects</Text>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>
                                    {selectedOrgId ? `${projectsInSelectedOrg.length} in ${selectedOrgName}` : "0 Total"}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.searchRow}>
                            <View style={styles.searchContainer}>
                                <TextInput
                                    placeholder="Search projects..."
                                    placeholderTextColor="#94a3b8"
                                    style={styles.searchInput}
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                                <MaterialIcons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
                            </View>
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() =>
                                    navigation.navigate("NewProject", {
                                        fromOnboarding: false,
                                        organizationId: selectedOrgId || undefined,
                                    })
                                }
                            >
                                <MaterialIcons name="add" size={24} color="white" />
                            </TouchableOpacity>
                        </View>

                        {loading ? (
                            <View style={styles.loadingWrap}>
                                <ActivityIndicator size="large" color="#2563eb" />
                                <Text style={styles.loadingText}>Loading projects...</Text>
                            </View>
                        ) : (
                            <>
                                <View style={styles.projectList}>
                                    {filteredProjects.length === 0 ? (
                                        <Text style={styles.emptyText}>
                                            {selectedOrgId
                                                ? `No projects in this organization. Create a new project below.`
                                                : "Select an organization above or create one first."}
                                        </Text>
                                    ) : (
                                        filteredProjects.map((project) => {
                                            const dateStr = project.createdAt
                                                ? new Date(project.createdAt).toLocaleDateString(undefined, {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })
                                                : "—";
                                            const outputCount = outputCountByProject[project.id];
                                            const sub = outputCount != null
                                                ? `${outputCount} output(s) · ${dateStr}`
                                                : dateStr;
                                            return (
                                                <TouchableOpacity
                                                    key={project.id}
                                                    onPress={() =>
                                                        navigation.navigate("ProjectLogs", {
                                                            projectId: project.id,
                                                            projectName: project.name,
                                                        })
                                                    }
                                                    activeOpacity={0.8}
                                                >
                                                    <ProjectCard
                                                        title={project.name}
                                                        tech={project.projectType || "Draft"}
                                                        updated={sub}
                                                        logo={null}
                                                    />
                                                </TouchableOpacity>
                                            );
                                        })
                                    )}
                                </View>

                                <TouchableOpacity
                                    style={styles.createButton}
                                    onPress={() =>
                                        navigation.navigate("NewProject", {
                                            fromOnboarding: false,
                                            organizationId: selectedOrgId || undefined,
                                        })
                                    }
                                >
                                    <MaterialIcons name="add-circle" size={22} color="white" />
                                    <Text style={styles.createButtonText}>Create New Project</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </>
                )}
            </ScrollView>

            {/* Confirm switch organization modal */}
            <Modal
                visible={!!confirmOrg}
                transparent
                animationType="fade"
                onRequestClose={() => setConfirmOrg(null)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setConfirmOrg(null)}
                >
                    <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                        <Text style={styles.modalTitle}>Confirm</Text>
                        <Text style={styles.modalMessage}>
                            Are you sure you want to switch to organization{" "}
                            <Text style={styles.modalOrgName}>"{confirmOrg?.name}"</Text>?
                        </Text>
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.modalCancel}
                                onPress={() => setConfirmOrg(null)}
                            >
                                <Text style={styles.modalCancelText}>No</Text>
                            </TouchableOpacity>
                            <Button
                                title="Yes"
                                onPress={handleConfirmSwitchOrg}
                                style={styles.modalConfirm}
                            />
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0f172a", // slate-900
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#1e293b", // slate-800
    },
    adminTitleRow: { marginBottom: 4 },
    adminScreenTitle: { fontSize: 24, fontWeight: "bold", color: "#fff" },
    adminSubtitle: { fontSize: 14, color: "#94a3b8", marginBottom: 20 },
    adminErrorBox: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, backgroundColor: "rgba(239,68,68,0.15)", borderRadius: 12, marginBottom: 16 },
    adminErrorText: { color: "#f87171", fontSize: 14 },
    adminLoadingWrap: { paddingVertical: 48, alignItems: "center" },
    adminLoadingText: { color: "#94a3b8", marginTop: 12 },
    adminStatGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 20 },
    adminStatCard: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 16, width: "48%", gap: 12, backgroundColor: "#1e293b" },
    adminStatIconWrap: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    adminStatBody: { flex: 1 },
    adminStatTitle: { fontSize: 12, color: "#94a3b8" },
    adminStatValue: { fontSize: 20, fontWeight: "bold", color: "#fff" },
    adminChartCard: { backgroundColor: "#1e293b", borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: "#334155", overflow: "hidden" },
    adminChartTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
    adminChartTitle: { fontSize: 16, fontWeight: "bold", color: "#fff" },
    adminChartEmpty: { fontSize: 14, color: "#64748b", textAlign: "center", paddingVertical: 16 },
    adminAreaChartWrap: { marginTop: 4, marginBottom: 4, overflow: "hidden" },
    adminDonutWrap: { alignItems: "center", marginVertical: 8 },
    adminPieLegend: { gap: 12 },
    adminPieRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    adminPieDot: { width: 12, height: 12, borderRadius: 6 },
    adminPieLabel: { flex: 1, fontSize: 14, color: "#e2e8f0" },
    adminPieValue: { fontSize: 14, fontWeight: "600", color: "#94a3b8" },
    adminTokenBox: { backgroundColor: "rgba(99, 102, 241, 0.2)", borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: "rgba(99, 102, 241, 0.4)" },
    adminTokenTitle: { fontSize: 16, fontWeight: "bold", color: "#fff", marginBottom: 4 },
    adminTokenSub: { fontSize: 12, color: "#a5b4fc", marginBottom: 16 },
    adminTokenRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
    adminTokenUsedNum: { fontSize: 28, fontWeight: "bold", color: "#fff" },
    adminTokenRemNum: { fontSize: 18, fontWeight: "bold", color: "#c7d2fe" },
    adminTokenLabel: { fontSize: 11, color: "#a5b4fc" },
    adminProgressBarBg: { height: 10, backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 5, overflow: "hidden" },
    adminProgressBarFill: { height: "100%", backgroundColor: "#6366f1", borderRadius: 5 },
    adminProgressLegend: { fontSize: 11, color: "#a5b4fc", marginTop: 6 },
    adminVerificationBox: { backgroundColor: "#1e293b", borderRadius: 16, padding: 20, marginBottom: 24 },
    adminVerifyTitle: { fontSize: 12, fontWeight: "bold", color: "#64748b", marginBottom: 12, textTransform: "uppercase" },
    adminVerifyRow: { flexDirection: "row", justifyContent: "space-between" },
    adminVerifyItem: { flexDirection: "row", alignItems: "center", gap: 12 },
    adminVerifyLabel: { fontSize: 12, color: "#64748b" },
    adminVerifyValue: { fontSize: 18, fontWeight: "bold", color: "#fff" },
    adminQuickTitle: { fontSize: 16, fontWeight: "bold", color: "#fff", marginBottom: 12 },
    adminQuickCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#1e293b", borderRadius: 16, padding: 16, marginBottom: 12, gap: 16, borderWidth: 1, borderColor: "#334155" },
    adminQuickIconWrap: { width: 56, height: 56, borderRadius: 12, backgroundColor: "rgba(99, 102, 241, 0.2)", alignItems: "center", justifyContent: "center" },
    adminQuickBody: { flex: 1 },
    adminQuickCardTitle: { fontSize: 16, fontWeight: "bold", color: "#fff" },
    adminQuickCardSub: { fontSize: 13, color: "#94a3b8", marginTop: 4 },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 120,
    },
    sectionTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
    },
    orgPlaceholder: {
        paddingVertical: 16,
        alignItems: "center",
    },
    emptyOrgs: {
        color: "#94a3b8",
        fontSize: 14,
        marginBottom: 20,
    },
    orgList: {
        gap: 12,
        marginBottom: 24,
    },
    orgCard: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 16,
        backgroundColor: "#1e293b",
        borderWidth: 2,
        borderColor: "transparent",
        gap: 14,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    orgCardSelected: {
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.12)",
        elevation: 3,
        shadowOpacity: 0.25,
    },
    orgIconWrap: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    orgCardBody: {
        flex: 1,
        minWidth: 0,
    },
    orgCardName: {
        fontSize: 16,
        color: "#e2e8f0",
        fontWeight: "600",
        marginBottom: 2,
    },
    orgCardNameSelected: {
        color: "#2563eb",
        fontWeight: "700",
    },
    orgCardMeta: {
        fontSize: 12,
        color: "#64748b",
    },
    orgSelectedBadge: {},
    titleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    screenTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "white",
    },
    badge: {
        backgroundColor: "#1e293b", // slate-800
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 9999,
    },
    badgeText: {
        fontSize: 12,
        color: "#64748b", // slate-500
    },
    searchRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 24,
    },
    searchContainer: {
        flex: 1,
        position: "relative",
        backgroundColor: "#1e293b", // slate-800
        borderRadius: 16,
    },
    searchInput: {
        paddingVertical: 12,
        paddingLeft: 40,
        paddingRight: 16,
        color: "white",
        fontSize: 14,
    },
    searchIcon: {
        position: "absolute",
        left: 12,
        top: 12,
    },
    addButton: {
        width: 48,
        height: 48,
        backgroundColor: "#2563eb", // blue-600
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    projectList: {
        gap: 16,
    },
    createButton: {
        marginTop: 24,
        backgroundColor: "#2563eb", // blue-600
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    createButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    loadingWrap: {
        paddingVertical: 48,
        alignItems: "center",
    },
    loadingText: {
        color: "#94a3b8",
        marginTop: 12,
        fontSize: 14,
    },
    emptyText: {
        color: "#94a3b8",
        fontSize: 14,
        textAlign: "center",
        paddingVertical: 24,
    },
    changeLogEmpty: {
        paddingVertical: 48,
        alignItems: "center",
        backgroundColor: "#1e293b",
        borderRadius: 16,
        marginTop: 8,
        paddingHorizontal: 24,
    },
    changeLogEmptyText: {
        color: "#94a3b8",
        fontSize: 16,
        marginTop: 12,
    },
    changeLogEmptySub: {
        color: "#64748b",
        fontSize: 13,
        marginTop: 4,
    },
    changeLogFilterRow: {
        marginBottom: 10,
    },
    changeLogFilterLabel: {
        fontSize: 13,
        color: "#94a3b8",
    },
    changeLogProjectFilter: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 16,
    },
    changeLogProjectChip: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        backgroundColor: "#1e293b",
        borderWidth: 1,
        borderColor: "transparent",
    },
    changeLogProjectChipActive: {
        backgroundColor: "rgba(37, 99, 235, 0.25)",
        borderColor: "#2563eb",
    },
    changeLogProjectChipText: {
        fontSize: 13,
        color: "#94a3b8",
    },
    changeLogProjectChipTextActive: {
        color: "#60a5fa",
        fontWeight: "600",
    },
    changeLogList: {
        marginTop: 8,
        gap: 0,
    },
    changeLogItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#1e293b",
    },
    changeLogIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    changeLogBody: {
        flex: 1,
        minWidth: 0,
    },
    changeLogTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#e2e8f0",
    },
    changeLogDesc: {
        fontSize: 13,
        color: "#94a3b8",
        marginTop: 4,
    },
    changeLogDate: {
        fontSize: 12,
        color: "#64748b",
        marginTop: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    modalContent: {
        width: "100%",
        maxWidth: 340,
        backgroundColor: "#1e293b",
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: "#334155",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 12,
    },
    modalMessage: {
        fontSize: 14,
        color: "#94a3b8",
        marginBottom: 20,
        lineHeight: 20,
    },
    modalOrgName: {
        color: "#fff",
        fontWeight: "600",
    },
    modalActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 12,
    },
    modalCancel: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#334155",
    },
    modalCancelText: {
        color: "#94a3b8",
        fontSize: 14,
        fontWeight: "600",
    },
    modalConfirm: {
        minWidth: 80,
    },
});
