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
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import ProjectCard from "../../components/ProjectCard";
import BottomTabBar from "../../components/BottomTabBar";
import Logo from "../../components/Logo";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import { getMe, getMyOrganizations } from "../../services/authService";
import projectService from "../../services/projectService";
import projectOutputService from "../../services/projectOutputService";

function normalizeUser(c) {
    if (!c) return null;
    return {
        id: String(c.id ?? c.Id ?? ""),
        email: String(c.email ?? c.Email ?? ""),
        name: c.name != null ? String(c.name) : (c.Name != null ? String(c.Name) : undefined),
        avatarUrl: c.avatarUrl != null ? String(c.avatarUrl) : (c.AvatarUrl != null ? String(c.AvatarUrl) : undefined),
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
    const [activeTab, setActiveTab] = useState("Dashboard");
    useAuth();
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

    const loadData = async () => {
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
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === "Profile") {
            navigation.navigate("Profile");
        }
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

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Logo />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />
                }
            >
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
            </ScrollView>

            <BottomTabBar active={activeTab} onChange={handleTabChange} />

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
        </View>
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
