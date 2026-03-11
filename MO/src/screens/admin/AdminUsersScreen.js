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
    Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import AdminTabBar from "../../components/AdminTabBar";
import ConfirmModal from "../../components/ConfirmModal";
import adminService from "../../services/adminService";
import CreateUserModal from "./CreateUserModal";
import EditUserModal from "./EditUserModal";

const PAGE_SIZE = 20;

function normUser(u) {
    return {
        id: String(u.id ?? u.Id ?? ""),
        email: String(u.email ?? u.Email ?? ""),
        name: u.name ?? u.Name ?? null,
        avatarUrl: u.avatarUrl ?? u.AvatarUrl ?? null,
        provider: String(u.provider ?? u.Provider ?? ""),
        isVerified: !!(u.isVerified ?? u.IsVerified),
        isAdmin: !!(u.isAdmin ?? u.IsAdmin),
        isActive: !!(u.isActive ?? u.IsActive),
        createdAt: u.createdAt ?? u.CreatedAt ?? null,
        updatedAt: u.updatedAt ?? u.UpdatedAt ?? null,
    };
}

export default function AdminUsersScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const [users, setUsers] = useState([]);
    const [totalRow, setTotalRow] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [togglingId, setTogglingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkDeleting, setBulkDeleting] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);
    const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

    const fetchUsers = useCallback(async (currentPage, currentSearch) => {
        setLoading(true);
        setError(null);
        setSelectedIds([]);
        try {
            const content = await adminService.getUsers({
                search: currentSearch || undefined,
                pageIndex: currentPage,
                pageSize: PAGE_SIZE,
            });
            const list = content?.totalItems ?? content?.TotalItems ?? content?.totalitems ?? [];
            const total = content?.totalRow ?? content?.TotalRow ?? 0;
            setUsers(Array.isArray(list) ? list.map(normUser) : []);
            setTotalRow(total);
        } catch {
            setError("Failed to load users.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers(page, search);
    }, [page, search, fetchUsers]);

    useEffect(() => {
        const t = setTimeout(() => {
            setPage(1);
            setSearch(searchInput);
        }, 300);
        return () => clearTimeout(t);
    }, [searchInput]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchUsers(page, search);
    };

    const handleToggleStatus = async (user) => {
        setTogglingId(user.id);
        try {
            await adminService.toggleUserStatus(user.id);
            setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isVerified: !u.isVerified, isActive: !u.isActive } : u)));
        } catch {
            setError("Failed to toggle user status.");
        } finally {
            setTogglingId(null);
        }
    };

    const handleDeleteUser = (user) => setConfirmDeleteUser(user);

    const doDeleteUser = async () => {
        if (!confirmDeleteUser) return;
        setDeletingId(confirmDeleteUser.id);
        setError(null);
        try {
            await adminService.deleteUser(confirmDeleteUser.id);
            setUsers((prev) => prev.filter((u) => u.id !== confirmDeleteUser.id));
            setTotalRow((prev) => prev - 1);
            setConfirmDeleteUser(null);
        } catch (e) {
            setError(e?.message ?? "Failed to delete user.");
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
            await adminService.deleteUsersBulk(selectedIds);
            setUsers((prev) => prev.filter((u) => !selectedIds.includes(u.id)));
            setTotalRow((prev) => Math.max(0, prev - selectedIds.length));
            setSelectedIds([]);
            setConfirmBulkDelete(false);
        } catch (e) {
            setError(e?.message ?? "Failed to delete selected users.");
        } finally {
            setBulkDeleting(false);
        }
    };

    const toggleSelectAll = () => {
        setSelectedIds((prev) => (prev.length === users.length ? [] : users.map((u) => u.id)));
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
                <Text style={styles.headerTitle}>User Management</Text>
            </View>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
            >
                <Text style={styles.totalText}>{totalRow} users total</Text>
                <View style={styles.searchRow}>
                    <View style={styles.searchWrap}>
                        <MaterialIcons name="search" size={20} color="#64748b" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search by name or email..."
                            placeholderTextColor="#64748b"
                            value={searchInput}
                            onChangeText={setSearchInput}
                        />
                    </View>
                    <TouchableOpacity style={styles.createBtn} onPress={() => setCreateModalOpen(true)}>
                        <MaterialIcons name="add" size={20} color="#fff" />
                        <Text style={styles.createBtnText}>Create User</Text>
                    </TouchableOpacity>
                </View>

                {selectedIds.length > 0 ? (
                    <View style={styles.bulkBar}>
                        <Text style={styles.bulkText}>{selectedIds.length} user(s) selected</Text>
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
                ) : users.length === 0 ? (
                    <Text style={styles.emptyText}>No users found.</Text>
                ) : (
                    <View style={styles.list}>
                        {users.map((user) => (
                            <ScrollView
                                key={user.id}
                                horizontal
                                showsHorizontalScrollIndicator={true}
                                style={styles.rowScroll}
                                contentContainerStyle={styles.rowScrollContent}
                            >
                                <View style={[styles.row, selectedIds.includes(user.id) && styles.rowSelected]}>
                                    <TouchableOpacity style={styles.cellCheck} onPress={() => toggleSelect(user.id)}>
                                        <View style={[styles.checkbox, selectedIds.includes(user.id) && styles.checkboxChecked]}>
                                            {selectedIds.includes(user.id) ? (
                                                <MaterialIcons name="check" size={14} color="#fff" />
                                            ) : null}
                                        </View>
                                    </TouchableOpacity>
                                    <View style={styles.cellUser}>
                                        <View style={styles.avatarWrap}>
                                            <View style={styles.avatarCircle}>
                                                {user.avatarUrl ? (
                                                    <Image source={{ uri: user.avatarUrl }} style={styles.avatarImg} />
                                                ) : (
                                                    <View style={styles.avatarPlaceholder}>
                                                        <Text style={styles.avatarLetter}>{(user.name || user.email || "?").charAt(0).toUpperCase()}</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <View style={styles.cellUserText}>
                                                <Text style={styles.userName} numberOfLines={1}>{user.name || "No Name"}</Text>
                                                <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <Text style={styles.cellProvider} numberOfLines={1}>{user.provider}</Text>
                                    <View style={styles.cellStatus}>
                                        <Text style={[styles.badge, user.isActive ? styles.badgeActive : styles.badgeInactive]}>
                                            {user.isActive ? "Active" : "Inactive"}
                                        </Text>
                                    </View>
                                    <View style={styles.cellRole}>
                                        <Text style={[styles.badge, user.isAdmin && styles.badgeAdmin]}>{user.isAdmin ? "ADMIN" : "User"}</Text>
                                    </View>
                                    <View style={styles.cellActions}>
                                        <TouchableOpacity onPress={() => handleToggleStatus(user)} disabled={togglingId === user.id}>
                                            <Text style={styles.actionLink}>{user.isActive ? "Deactivate" : "Activate"}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => setEditingUser(user)}>
                                            <Text style={[styles.actionLink, { color: "#3b82f6" }]}>Edit</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDeleteUser(user)} disabled={deletingId === user.id}>
                                            <Text style={[styles.actionLink, { color: "#ef4444" }]}>{deletingId === user.id ? "..." : "Delete"}</Text>
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

            <CreateUserModal
                visible={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onUserCreated={() => {
                    setCreateModalOpen(false);
                    fetchUsers(page, search);
                }}
            />
            <EditUserModal
                visible={!!editingUser}
                onClose={() => setEditingUser(null)}
                user={editingUser}
                onUserUpdated={(updated) => {
                    setUsers((prev) => prev.map((u) => (u.id === editingUser?.id ? { ...u, ...normUser(updated) } : u)));
                    setEditingUser(null);
                }}
            />
            <ConfirmModal
                visible={!!confirmDeleteUser}
                title="Confirm delete"
                message={confirmDeleteUser ? `Delete user ${confirmDeleteUser.email}? This action cannot be undone.` : ""}
                onCancel={() => setConfirmDeleteUser(null)}
                onConfirm={doDeleteUser}
                confirmLabel="Delete"
                loading={deletingId === confirmDeleteUser?.id}
                destructive
            />
            <ConfirmModal
                visible={confirmBulkDelete}
                title="Confirm delete"
                message={`Delete ${selectedIds.length} selected user(s)? This action cannot be undone.`}
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
    searchRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
    searchWrap: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "#1e293b", borderRadius: 12 },
    searchIcon: { position: "absolute", left: 12 },
    searchInput: { flex: 1, paddingVertical: 12, paddingLeft: 40, paddingRight: 12, color: "#fff", fontSize: 14 },
    createBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#6366f1", paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12 },
    createBtnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
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
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#fff",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 4,
    },
    cellUser: { width: 160, minWidth: 0 },
    avatarWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
    avatarCircle: { width: 36, height: 36, borderRadius: 18, overflow: "hidden", backgroundColor: "#1e293b" },
    avatarImg: { width: 36, height: 36, borderRadius: 18 },
    avatarPlaceholder: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "#1e293b" },
    avatarLetter: { fontSize: 14, fontWeight: "bold", color: "#64748b" },
    cellUserText: { flex: 1, minWidth: 0 },
    userName: { fontSize: 14, fontWeight: "600", color: "#fff" },
    userEmail: { fontSize: 12, color: "#64748b" },
    cellProvider: { fontSize: 11, color: "#94a3b8", width: 56 },
    cellStatus: { width: 64 },
    cellRole: { width: 52 },
    badge: { fontSize: 11, color: "#94a3b8" },
    badgeActive: { color: "#10b981" },
    badgeInactive: { color: "#64748b" },
    badgeAdmin: { color: "#a78bfa", fontWeight: "bold" },
    cellActions: { flexDirection: "row", gap: 10 },
    actionLink: { fontSize: 12, color: "#94a3b8", fontWeight: "600" },
    pagination: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 24 },
    pageBtn: { padding: 8 },
    pageBtnDisabled: { opacity: 0.5 },
    pageInfo: { fontSize: 13, color: "#94a3b8" },
});
