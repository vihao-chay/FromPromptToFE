import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import AdminTabBar from "../../components/AdminTabBar";
import ConfirmModal from "../../components/ConfirmModal";
import adminService from "../../services/adminService";
import ProjectPreviewModal from "./ProjectPreviewModal";

const PAGE_SIZE = 20;

function normProject(p) {
    return {
        id: String(p.id ?? p.Id ?? ""),
        name: String(p.name ?? p.Name ?? ""),
        projectType: String(p.projectType ?? p.ProjectType ?? ""),
        organizationId: String(p.organizationId ?? p.OrganizationId ?? ""),
        organizationName: p.organizationName ?? p.OrganizationName ?? null,
        createdAt: p.createdAt ?? p.CreatedAt ?? null,
        hasGeneratedCode: !!(p.hasGeneratedCode ?? p.HasGeneratedCode),
    };
}

export default function AdminProjectsScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const [projects, setProjects] = useState([]);
    const [totalRow, setTotalRow] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkDeleting, setBulkDeleting] = useState(false);
    const [previewProjectId, setPreviewProjectId] = useState(null);
    const [confirmDeleteProject, setConfirmDeleteProject] = useState(null);
    const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

    const fetchProjects = useCallback(async (currentPage, currentSearch) => {
        setLoading(true);
        setError(null);
        setSelectedIds([]);
        try {
            const content = await adminService.getProjects({
                search: currentSearch || undefined,
                pageIndex: currentPage,
                pageSize: PAGE_SIZE,
            });
            const list = content?.totalItems ?? content?.TotalItems ?? content?.totalitems ?? [];
            const total = content?.totalRow ?? content?.TotalRow ?? 0;
            setProjects(Array.isArray(list) ? list.map(normProject) : []);
            setTotalRow(total);
        } catch {
            setError("Failed to load projects.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects(page, search);
    }, [page, search, fetchProjects]);

    useEffect(() => {
        const t = setTimeout(() => {
            setPage(1);
            setSearch(searchInput);
        }, 300);
        return () => clearTimeout(t);
    }, [searchInput]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchProjects(page, search);
    };

    const handleDelete = (project) => setConfirmDeleteProject(project);

    const doDeleteProject = async () => {
        if (!confirmDeleteProject) return;
        setDeletingId(confirmDeleteProject.id);
        setError(null);
        try {
            await adminService.deleteProject(confirmDeleteProject.id);
            setProjects((prev) => prev.filter((p) => p.id !== confirmDeleteProject.id));
            setTotalRow((prev) => prev - 1);
            setConfirmDeleteProject(null);
        } catch {
            setError("Failed to delete project.");
        } finally {
            setDeletingId(null);
        }
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        setConfirmBulkDelete(true);
    };

    const doBulkDelete = async () => {
        setBulkDeleting(true);
        setError(null);
        try {
            await adminService.deleteProjectsBulk(selectedIds);
            setProjects((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
            setTotalRow((prev) => Math.max(0, prev - selectedIds.length));
            setSelectedIds([]);
            setConfirmBulkDelete(false);
        } catch (e) {
            setError(e?.message ?? "Failed to delete selected projects.");
        } finally {
            setBulkDeleting(false);
        }
    };

    const toggleSelectAll = () => {
        setSelectedIds((prev) => (prev.length === projects.length ? [] : projects.map((p) => p.id)));
    };
    const toggleSelect = (id) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const totalPages = Math.max(1, Math.ceil(totalRow / PAGE_SIZE));

    return (
        <View style={styles.container}>
            <View style={[styles.header, { paddingTop: Math.max(14, insets.top + 6) }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
                    <MaterialIcons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Project Monitor</Text>
            </View>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
            >
                <Text style={styles.totalText}>{totalRow} projects across all organizations</Text>
                <View style={styles.searchRow}>
                    <View style={styles.searchWrap}>
                        <MaterialIcons name="search" size={20} color="#64748b" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search by name or org..."
                            placeholderTextColor="#64748b"
                            value={searchInput}
                            onChangeText={setSearchInput}
                        />
                    </View>
                </View>

                {selectedIds.length > 0 ? (
                    <View style={styles.bulkBar}>
                        <Text style={styles.bulkText}>{selectedIds.length} project(s) selected</Text>
                        <TouchableOpacity style={styles.bulkDeleteBtn} onPress={handleBulkDelete} disabled={bulkDeleting}>
                            {bulkDeleting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.bulkDeleteText}>Delete Selected</Text>}
                        </TouchableOpacity>
                    </View>
                ) : null}

                {error ? (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : null}

                {loading ? (
                    <View style={styles.loadingWrap}>
                        <ActivityIndicator size="large" color="#2563eb" />
                    </View>
                ) : projects.length === 0 ? (
                    <Text style={styles.emptyText}>No projects found.</Text>
                ) : (
                    <View style={styles.list}>
                        {projects.map((project) => (
                            <ScrollView
                                key={project.id}
                                horizontal
                                showsHorizontalScrollIndicator={true}
                                style={styles.rowScroll}
                                contentContainerStyle={styles.rowScrollContent}
                            >
                                <View style={[styles.row, selectedIds.includes(project.id) && styles.rowSelected]}>
                                    <TouchableOpacity style={styles.cellCheck} onPress={() => toggleSelect(project.id)}>
                                        <View style={[styles.checkbox, selectedIds.includes(project.id) && styles.checkboxChecked]}>
                                            {selectedIds.includes(project.id) ? (
                                                <MaterialIcons name="check" size={14} color="#fff" />
                                            ) : null}
                                        </View>
                                    </TouchableOpacity>
                                    <View style={styles.cellProject}>
                                        <MaterialIcons name="folder" size={20} color="#3b82f6" style={{ marginRight: 8 }} />
                                        <Text style={styles.projectName} numberOfLines={1}>{project.name}</Text>
                                    </View>
                                    <Text style={styles.cellOrg} numberOfLines={1}>{project.organizationName || "—"}</Text>
                                    <Text style={styles.cellType}>{project.projectType}</Text>
                                    <View style={styles.cellCode}>
                                        {project.hasGeneratedCode ? (
                                            <Text style={styles.badgeGenerated}>Generated</Text>
                                        ) : (
                                            <Text style={styles.cellCodeEmpty}>—</Text>
                                        )}
                                    </View>
                                    <View style={styles.cellActions}>
                                        <TouchableOpacity onPress={() => setPreviewProjectId(project.id)}>
                                            <Text style={[styles.actionLink, { color: "#3b82f6" }]}>Preview</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDelete(project)} disabled={deletingId === project.id}>
                                            <Text style={[styles.actionLink, { color: "#ef4444" }]}>{deletingId === project.id ? "..." : "Delete"}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </ScrollView>
                        ))}
                    </View>
                )}

                {totalPages > 1 ? (
                    <View style={styles.pagination}>
                        <TouchableOpacity style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]} onPress={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                            <MaterialIcons name="chevron-left" size={24} color={page === 1 ? "#475569" : "#e2e8f0"} />
                        </TouchableOpacity>
                        <Text style={styles.pageInfo}>Page {page} of {totalPages}</Text>
                        <TouchableOpacity style={[styles.pageBtn, page >= totalPages && styles.pageBtnDisabled]} onPress={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                            <MaterialIcons name="chevron-right" size={24} color={page >= totalPages ? "#475569" : "#e2e8f0"} />
                        </TouchableOpacity>
                    </View>
                ) : null}
            </ScrollView>

            <ProjectPreviewModal
                visible={!!previewProjectId}
                onClose={() => setPreviewProjectId(null)}
                projectId={previewProjectId}
            />
            <ConfirmModal
                visible={!!confirmDeleteProject}
                title="Confirm delete"
                message={confirmDeleteProject ? `Delete project "${confirmDeleteProject.name}"? This cannot be undone.` : ""}
                onCancel={() => setConfirmDeleteProject(null)}
                onConfirm={doDeleteProject}
                confirmLabel="Delete"
                loading={deletingId === confirmDeleteProject?.id}
                destructive
            />
            <ConfirmModal
                visible={confirmBulkDelete}
                title="Confirm delete"
                message={`Delete ${selectedIds.length} selected project(s)? This cannot be undone.`}
                onCancel={() => setConfirmBulkDelete(false)}
                onConfirm={doBulkDelete}
                confirmLabel="Delete"
                loading={bulkDeleting}
                destructive
            />
            <AdminTabBar active="Dashboard" onChange={(tab) => { if (tab === "Profile") navigation.navigate("MainTabs", { screen: "Profile" }); if (tab === "Dashboard") navigation.navigate("AdminDashboard"); }} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0f172a" },
    header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#1e293b" },
    backBtn: { marginRight: 12, paddingVertical: 8, paddingHorizontal: 4 },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },
    scrollContent: { padding: 20, paddingBottom: 120 },
    totalText: { fontSize: 14, color: "#94a3b8", marginBottom: 12 },
    searchRow: { marginBottom: 16 },
    searchWrap: { flexDirection: "row", alignItems: "center", backgroundColor: "#1e293b", borderRadius: 12 },
    searchIcon: { position: "absolute", left: 12 },
    searchInput: { paddingVertical: 12, paddingLeft: 40, paddingRight: 12, color: "#fff", fontSize: 14 },
    bulkBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 12, backgroundColor: "rgba(239,68,68,0.15)", borderRadius: 12, marginBottom: 12 },
    bulkText: { color: "#f87171", fontWeight: "600", fontSize: 14 },
    bulkDeleteBtn: { backgroundColor: "#ef4444", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
    bulkDeleteText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
    errorBox: { padding: 12, backgroundColor: "rgba(239,68,68,0.2)", borderRadius: 12, marginBottom: 12 },
    errorText: { color: "#f87171", fontSize: 14 },
    loadingWrap: { paddingVertical: 48, alignItems: "center" },
    emptyText: { color: "#94a3b8", textAlign: "center", paddingVertical: 24 },
    list: { gap: 0 },
    rowScroll: { borderBottomWidth: 1, borderBottomColor: "#1e293b", maxHeight: 56 },
    rowScrollContent: { flexGrow: 1, minWidth: 520 },
    row: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 12, gap: 8, minWidth: 500 },
    rowSelected: { backgroundColor: "rgba(37, 99, 235, 0.1)" },
    cellCheck: { width: 36 },
    checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: "#475569", alignItems: "center", justifyContent: "center" },
    checkboxChecked: {
        backgroundColor: "#2563eb",
        borderColor: "#fff",
        borderWidth: 1.5,
        shadowColor: "#fff",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 4,
    },
    cellProject: { width: 140, flexDirection: "row", alignItems: "center", minWidth: 0 },
    projectName: { fontSize: 14, fontWeight: "600", color: "#fff", flex: 1 },
    cellOrg: { width: 80, fontSize: 12, color: "#94a3b8" },
    cellType: { width: 56, fontSize: 11, color: "#94a3b8" },
    cellCode: { width: 72 },
    badgeGenerated: { fontSize: 11, color: "#10b981", fontWeight: "600" },
    cellCodeEmpty: { fontSize: 12, color: "#64748b" },
    cellActions: { flexDirection: "row", gap: 10 },
    actionLink: { fontSize: 12, fontWeight: "600" },
    pagination: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 24 },
    pageBtn: { padding: 8 },
    pageBtnDisabled: { opacity: 0.5 },
    pageInfo: { fontSize: 13, color: "#94a3b8" },
});
