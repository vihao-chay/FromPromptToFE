import React from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet, ActivityIndicator } from "react-native";

export default function ConfirmModal({
    visible,
    title = "Confirm",
    message,
    cancelLabel = "Cancel",
    confirmLabel = "Delete",
    onCancel,
    onConfirm,
    loading = false,
    destructive = true,
}) {
    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.box}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={styles.cancelBtn}
                            onPress={onCancel}
                            disabled={loading}
                        >
                            <Text style={styles.cancelText}>{cancelLabel}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.confirmBtn, destructive && styles.confirmBtnDestructive]}
                            onPress={onConfirm}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.confirmText}>{confirmLabel}</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    box: {
        backgroundColor: "#1e293b",
        borderRadius: 16,
        padding: 24,
        width: "100%",
        maxWidth: 340,
        borderWidth: 1,
        borderColor: "#334155",
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 12,
    },
    message: {
        fontSize: 14,
        color: "#94a3b8",
        lineHeight: 20,
        marginBottom: 24,
    },
    actions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 12,
    },
    cancelBtn: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        backgroundColor: "#334155",
    },
    cancelText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#e2e8f0",
    },
    confirmBtn: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        minWidth: 88,
        alignItems: "center",
        backgroundColor: "#6366f1",
    },
    confirmBtnDestructive: {
        backgroundColor: "#ef4444",
    },
    confirmText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#fff",
    },
});
