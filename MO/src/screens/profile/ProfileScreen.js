import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { getMe, getMyOrganizations, updateProfile, changePassword } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/Button";
import { useToast } from "../../context/ToastContext";

const PASSWORD_RULE = "At least 8 characters, with uppercase, lowercase, number and special character (@$!%*?&).";

function normalizeUser(c) {
    if (!c) return null;
    return {
        id: String(c.id ?? c.Id ?? ""),
        email: String(c.email ?? c.Email ?? ""),
        name: c.name != null ? String(c.name) : (c.Name != null ? String(c.Name) : undefined),
        avatarUrl: c.avatarUrl != null ? String(c.avatarUrl) : (c.AvatarUrl != null ? String(c.AvatarUrl) : undefined),
    };
}

export default function ProfileScreen({ navigation }) {
    const { user: contextUser, logout } = useAuth();
    const { showToast } = useToast();
    const [user, setUser] = useState(null);
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [nameInput, setNameInput] = useState("");
    const [avatarInput, setAvatarInput] = useState("");
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState(null);
    const [changingPassword, setChangingPassword] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const me = await getMe();
                const u = normalizeUser(me);
                if (cancelled) return;
                setUser(u);
                if (u) {
                    setNameInput(u.name ?? "");
                    setAvatarInput(u.avatarUrl ?? "");
                    const orgs = await getMyOrganizations(u.id);
                    if (!cancelled) setOrganizations(Array.isArray(orgs) ? orgs : []);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err?.message ?? "Failed to load profile. Please log in again.");
                    setUser(null);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, []);

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        setError(null);
        setSuccess(null);
        try {
            const updated = await updateProfile({
                name: nameInput.trim() || undefined,
                avatarUrl: avatarInput.trim() || undefined,
            });
            const u = normalizeUser(updated);
            if (u) {
                setUser(u);
                setAvatarInput(u.avatarUrl ?? "");
            }
            setSuccess("Profile updated successfully.");
            showToast("Profile updated.", "success");
            setIsEditing(false);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err?.message ?? "Update failed. Try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        setPasswordError(null);
        if (!newPassword.trim()) {
            setPasswordError("New password is required.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError("New password and confirmation do not match.");
            return;
        }
        if (
            newPassword.length < 8 ||
            !/[A-Z]/.test(newPassword) ||
            !/[a-z]/.test(newPassword) ||
            !/\d/.test(newPassword) ||
            !/[@$!%*?&]/.test(newPassword)
        ) {
            setPasswordError(PASSWORD_RULE);
            return;
        }
        setChangingPassword(true);
        setPasswordError(null);
        try {
            await changePassword(null, newPassword);
            setSuccess("Password changed successfully.");
            setNewPassword("");
            setConfirmPassword("");
            setShowPasswordSection(false);
            showToast("Password changed.", "success");
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setPasswordError(err?.message ?? "Failed to change password. Try again.");
        } finally {
            setChangingPassword(false);
        }
    };

    const firstOrg = organizations[0];

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    if (error && !user) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Text style={styles.errorText}>{error}</Text>
                <Button title="Log in again" onPress={() => logout()} style={styles.mt16} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backBtn}
                        activeOpacity={0.8}
                    >
                        <MaterialIcons name="arrow-back" size={20} color="#2563eb" style={styles.backIcon} />
                        <Text style={styles.backText}>Dashboard</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.title}>Profile Settings</Text>
                <Text style={styles.subtitle}>Manage your account and preferences.</Text>

                {error ? <Text style={styles.errorLine}>{error}</Text> : null}
                {success ? <Text style={styles.successLine}>{success}</Text> : null}

                <View style={styles.card}>
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarWrap}>
                            {user?.avatarUrl ? (
                                <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Text style={styles.avatarLetter}>
                                        {(user?.name || user?.email || "?").charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.displayName}>{user?.name || user?.email || "—"}</Text>
                        <Text style={styles.email}>{user?.email ?? "—"}</Text>
                        {firstOrg ? (
                            <Text style={styles.plan}>Plan: {firstOrg.organizationPlan ?? "—"}</Text>
                        ) : null}
                    </View>

                    <View style={styles.formSection}>
                        <View style={styles.row}>
                            <Text style={styles.label}>Email</Text>
                            <Text style={styles.readOnly}>Read-only</Text>
                        </View>
                        <TextInput
                            style={[styles.input, styles.inputReadOnly]}
                            value={user?.email ?? ""}
                            editable={false}
                        />

                        <Text style={styles.label}>Full name</Text>
                        <TextInput
                            style={styles.input}
                            value={nameInput}
                            onChangeText={setNameInput}
                            placeholder="Enter your full name"
                            placeholderTextColor="#64748b"
                            editable={isEditing}
                        />

                        {isEditing && (
                            <>
                                <Text style={styles.label}>Avatar URL</Text>
                                <TextInput
                                    style={styles.input}
                                    value={avatarInput}
                                    onChangeText={setAvatarInput}
                                    placeholder="Or paste image URL..."
                                    placeholderTextColor="#64748b"
                                    autoCapitalize="none"
                                />
                            </>
                        )}

                        {!isEditing ? (
                            <Button
                                title="Edit Profile"
                                onPress={() => setIsEditing(true)}
                                style={styles.mt16}
                            />
                        ) : (
                            <View style={styles.editActions}>
                                <TouchableOpacity
                                    style={styles.cancelBtn}
                                    onPress={() => {
                                        setIsEditing(false);
                                        setNameInput(user?.name ?? "");
                                        setAvatarInput(user?.avatarUrl ?? "");
                                    }}
                                >
                                    <Text style={styles.cancelBtnText}>Cancel</Text>
                                </TouchableOpacity>
                                <Button
                                    title={saving ? "Saving..." : "Save Updates"}
                                    onPress={handleSave}
                                    disabled={saving}
                                    loading={saving}
                                    style={styles.saveBtn}
                                />
                            </View>
                        )}
                    </View>

                    {/* Change password */}
                    <View style={styles.passwordSection}>
                        {!showPasswordSection ? (
                            <TouchableOpacity
                                onPress={() => {
                                    setShowPasswordSection(true);
                                    setPasswordError(null);
                                }}
                            >
                                <Text style={styles.changePwLink}>Change Password</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.passwordForm}>
                                <Text style={styles.passwordTitle}>Update Password</Text>
                                <Text style={styles.passwordRule}>{PASSWORD_RULE}</Text>
                                {passwordError ? (
                                    <Text style={styles.passwordError}>{passwordError}</Text>
                                ) : null}
                                <Text style={styles.label}>New password</Text>
                                <TextInput
                                    style={styles.input}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    placeholder="Enter new password"
                                    placeholderTextColor="#64748b"
                                    secureTextEntry
                                    autoCapitalize="none"
                                />
                                <Text style={styles.label}>Confirm password</Text>
                                <TextInput
                                    style={styles.input}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="Confirm password"
                                    placeholderTextColor="#64748b"
                                    secureTextEntry
                                    autoCapitalize="none"
                                />
                                <View style={styles.passwordActions}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setShowPasswordSection(false);
                                            setPasswordError(null);
                                            setNewPassword("");
                                            setConfirmPassword("");
                                        }}
                                    >
                                        <Text style={styles.cancelBtnText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <Button
                                        title={changingPassword ? "Saving..." : "Save Password"}
                                        onPress={handleChangePassword}
                                        disabled={changingPassword}
                                        loading={changingPassword}
                                        style={styles.saveBtn}
                                    />
                                </View>
                            </View>
                        )}
                    </View>

                    <Button
                        title="Logout"
                        onPress={() => logout()}
                        variant="outline"
                        textStyle={{ color: "#ef4444" }}
                        style={[styles.logoutBtn, { borderColor: "#ef4444" }]}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
        </SafeAreaView>
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
        paddingBottom: 120,
    },
    header: {
        marginBottom: 16,
        paddingTop: 8,
    },
    backBtn: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: "rgba(37, 99, 235, 0.12)",
        borderWidth: 1,
        borderColor: "rgba(37, 99, 235, 0.35)",
        gap: 8,
    },
    backIcon: {
        marginLeft: -2,
    },
    backText: {
        color: "#2563eb",
        fontSize: 15,
        fontWeight: "700",
    },
    loadingText: {
        color: "#94a3b8",
        marginTop: 12,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: "#94a3b8",
        marginBottom: 20,
    },
    errorLine: {
        color: "#f87171",
        fontSize: 14,
        marginBottom: 12,
    },
    successLine: {
        color: "#4ade80",
        fontSize: 14,
        marginBottom: 12,
    },
    card: {
        backgroundColor: "#1e293b",
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: "#334155",
    },
    avatarSection: {
        alignItems: "center",
        marginBottom: 24,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#334155",
    },
    avatarWrap: {
        width: 80,
        height: 80,
        borderRadius: 40,
        overflow: "hidden",
        backgroundColor: "#334155",
    },
    avatar: {
        width: 80,
        height: 80,
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#2563eb",
        justifyContent: "center",
        alignItems: "center",
    },
    avatarLetter: {
        color: "#fff",
        fontSize: 28,
        fontWeight: "bold",
    },
    displayName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
        marginTop: 12,
    },
    email: {
        fontSize: 14,
        color: "#2563eb",
        marginTop: 4,
    },
    plan: {
        fontSize: 12,
        color: "#94a3b8",
        marginTop: 8,
    },
    formSection: {
        marginBottom: 24,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    label: {
        fontSize: 12,
        fontWeight: "600",
        color: "#e2e8f0",
        marginBottom: 6,
        marginTop: 12,
    },
    readOnly: {
        fontSize: 10,
        color: "#64748b",
        textTransform: "uppercase",
    },
    input: {
        backgroundColor: "#0f172a",
        borderRadius: 12,
        padding: 12,
        color: "#fff",
        fontSize: 14,
        borderWidth: 1,
        borderColor: "#334155",
    },
    inputReadOnly: {
        color: "#64748b",
        opacity: 0.9,
    },
    mt16: {
        marginTop: 16,
    },
    editActions: {
        flexDirection: "row",
        gap: 12,
        marginTop: 20,
        alignItems: "center",
    },
    cancelBtn: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    cancelBtnText: {
        color: "#94a3b8",
        fontSize: 14,
        fontWeight: "600",
    },
    saveBtn: {
        flex: 1,
    },
    passwordSection: {
        marginTop: 8,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: "#334155",
    },
    changePwLink: {
        color: "#2563eb",
        fontSize: 14,
        fontWeight: "600",
    },
    passwordForm: {
        marginTop: 12,
    },
    passwordTitle: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 4,
    },
    passwordRule: {
        fontSize: 11,
        color: "#94a3b8",
        marginBottom: 12,
    },
    passwordError: {
        color: "#f87171",
        fontSize: 12,
        marginBottom: 8,
    },
    passwordActions: {
        flexDirection: "row",
        gap: 12,
        marginTop: 16,
        alignItems: "center",
    },
    logoutBtn: {
        marginTop: 24,
    },
});
