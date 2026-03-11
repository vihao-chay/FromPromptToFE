import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import adminService from "../../services/adminService";

export default function CreateUserModal({ visible, onClose, onUserCreated }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            const content = await adminService.createUser({
                email,
                name: name || email,
                password,
                isAdmin,
            });
            onUserCreated(content);
            onClose();
            setName("");
            setEmail("");
            setPassword("");
            setIsAdmin(false);
        } catch (err) {
            setError(err?.message ?? "Failed to create user");
        } finally {
            setLoading(false);
        }
    };

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.box}>
                    <Text style={styles.title}>Create User</Text>
                    {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}
                    <Text style={styles.label}>Name</Text>
                    <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Name" placeholderTextColor="#64748b" />
                    <Text style={styles.label}>Email</Text>
                    <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#64748b" />
                    <Text style={styles.label}>Password</Text>
                    <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry placeholderTextColor="#64748b" />
                    <Text style={styles.hint}>8+ chars, uppercase, lowercase, number, special character.</Text>
                    <TouchableOpacity style={styles.checkRow} onPress={() => setIsAdmin(!isAdmin)}>
                        <View style={[styles.checkbox, isAdmin && styles.checkboxChecked]}>
                            {isAdmin ? <MaterialIcons name="check" size={14} color="#fff" /> : null}
                        </View>
                        <Text style={styles.checkLabel}>Is Admin?</Text>
                    </TouchableOpacity>
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
                            {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.submitText}>Create User</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 24 },
    box: { backgroundColor: "#1e293b", borderRadius: 16, padding: 24 },
    title: { fontSize: 20, fontWeight: "bold", color: "#fff", marginBottom: 16 },
    errorBox: { padding: 12, backgroundColor: "rgba(239,68,68,0.2)", borderRadius: 8, marginBottom: 12 },
    errorText: { color: "#f87171", fontSize: 14 },
    label: { fontSize: 14, fontWeight: "600", color: "#e2e8f0", marginBottom: 6 },
    input: { backgroundColor: "#0f172a", borderRadius: 10, padding: 12, color: "#fff", fontSize: 14, marginBottom: 12 },
    hint: { fontSize: 11, color: "#64748b", marginBottom: 12 },
    checkRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
    checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: "#475569", marginRight: 10, alignItems: "center", justifyContent: "center" },
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
    checkLabel: { fontSize: 14, color: "#e2e8f0" },
    actions: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
    cancelBtn: { paddingVertical: 10, paddingHorizontal: 16 },
    cancelText: { color: "#94a3b8", fontWeight: "600" },
    submitBtn: { backgroundColor: "#6366f1", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, minWidth: 120, alignItems: "center" },
    submitText: { color: "#fff", fontWeight: "bold" },
});
