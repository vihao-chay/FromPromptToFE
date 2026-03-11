import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import adminService from "../../services/adminService";

export default function ProjectPreviewModal({ visible, onClose, projectId }) {
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("prompt");

    useEffect(() => {
        if (visible && projectId) {
            setLoading(true);
            setError(null);
            setActiveTab("prompt");
            adminService
                .getProjectPreview(projectId)
                .then((content) => setPreview(content))
                .catch((e) => setError(e?.message ?? "Failed to load preview"))
                .finally(() => setLoading(false));
        } else {
            setPreview(null);
        }
    }, [visible, projectId]);

    if (!visible) return null;

    const name = preview?.name ?? preview?.Name ?? "Project Preview";
    const orgName = preview?.organizationName ?? preview?.OrganizationName;
    const systemPrompt = preview?.systemPrompt ?? preview?.SystemPrompt ?? "";
    const userPrompt = preview?.userPrompt ?? preview?.UserPrompt ?? "";
    const promptHistory = preview?.promptHistory ?? preview?.PromptHistory;
    const generatedTsx = preview?.generatedTsx ?? preview?.GeneratedTsx;
    const generatedHtml = preview?.generatedHtml ?? preview?.GeneratedHtml;

    let historyContent = null;
    if (promptHistory) {
        try {
            const parsed = JSON.parse(promptHistory);
            if (Array.isArray(parsed)) {
                historyContent = (
                    <View style={styles.historyList}>
                        {parsed.map((msg, i) => (
                            <View key={i} style={[styles.historyItem, (msg.role === "user" ? styles.historyUser : styles.historyAssistant)]}>
                                <Text style={styles.historyRole}>{msg.role}</Text>
                                <Text style={styles.historyText}>{msg.content || msg.text || JSON.stringify(msg)}</Text>
                            </View>
                        ))}
                    </View>
                );
            } else {
                historyContent = <Text style={styles.preText}>{promptHistory}</Text>;
            }
        } catch {
            historyContent = <Text style={styles.preText}>{promptHistory}</Text>;
        }
    } else {
        historyContent = <Text style={styles.placeholder}>No chat history available.</Text>;
    }

    return (
        <Modal transparent visible={visible} animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.modalHeader}>
                        <View>
                            <Text style={styles.modalTitle}>{loading ? "Loading..." : name}</Text>
                            {orgName ? <Text style={styles.modalSub}>Org: {orgName}</Text> : null}
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <MaterialIcons name="close" size={24} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.tabBar}>
                        <TouchableOpacity style={[styles.tab, activeTab === "prompt" && styles.tabActive]} onPress={() => setActiveTab("prompt")}>
                            <Text style={[styles.tabText, activeTab === "prompt" && styles.tabTextActive]}>Initial Prompts</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.tab, activeTab === "history" && styles.tabActive]} onPress={() => setActiveTab("history")}>
                            <Text style={[styles.tabText, activeTab === "history" && styles.tabTextActive]}>Chat History</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.tab, activeTab === "code" && styles.tabActive]} onPress={() => setActiveTab("code")}>
                            <Text style={[styles.tabText, activeTab === "code" && styles.tabTextActive]}>Generated Output</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
                        {loading ? (
                            <View style={styles.loadingWrap}>
                                <ActivityIndicator size="large" color="#2563eb" />
                                <Text style={styles.loadingText}>Loading project details...</Text>
                            </View>
                        ) : error ? (
                            <View style={styles.errorWrap}>
                                <MaterialIcons name="error" size={40} color="#ef4444" />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : activeTab === "prompt" ? (
                            <View style={styles.promptGrid}>
                                <View style={styles.promptBlock}>
                                    <Text style={styles.promptBlockTitle}>User Prompt</Text>
                                    <ScrollView style={styles.promptScroll}>
                                        <Text style={styles.preText}>{userPrompt || "Empty"}</Text>
                                    </ScrollView>
                                </View>
                                <View style={styles.promptBlock}>
                                    <Text style={[styles.promptBlockTitle, { backgroundColor: "rgba(245,158,11,0.2)", color: "#f59e0b" }]}>System Prompt</Text>
                                    <ScrollView style={styles.promptScroll}>
                                        <Text style={[styles.preText, styles.mono]}>{systemPrompt || "Empty"}</Text>
                                    </ScrollView>
                                </View>
                            </View>
                        ) : activeTab === "history" ? (
                            historyContent
                        ) : (
                            <View style={styles.codeBlock}>
                                {generatedTsx ? (
                                    <Text style={styles.codeText}>{generatedTsx}</Text>
                                ) : generatedHtml ? (
                                    <Text style={styles.codeText}>{generatedHtml}</Text>
                                ) : (
                                    <Text style={styles.placeholder}>No code generated yet.</Text>
                                )}
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
    modal: { flex: 1, marginTop: 40, backgroundColor: "#0f172a", borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: "hidden" },
    modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: "#1e293b" },
    modalTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },
    modalSub: { fontSize: 12, color: "#64748b", marginTop: 2 },
    closeBtn: { padding: 8 },
    tabBar: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#1e293b" },
    tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
    tabActive: { borderBottomWidth: 2, borderBottomColor: "#6366f1" },
    tabText: { fontSize: 13, color: "#64748b", fontWeight: "600" },
    tabTextActive: { color: "#6366f1" },
    body: { flex: 1 },
    bodyContent: { padding: 16, paddingBottom: 40 },
    loadingWrap: { paddingVertical: 48, alignItems: "center" },
    loadingText: { color: "#94a3b8", marginTop: 12 },
    errorWrap: { padding: 24, alignItems: "center" },
    errorText: { color: "#f87171", marginTop: 12, textAlign: "center" },
    promptGrid: { gap: 16 },
    promptBlock: { backgroundColor: "#1e293b", borderRadius: 12, overflow: "hidden", marginBottom: 12 },
    promptBlockTitle: { backgroundColor: "rgba(99, 102, 241, 0.3)", paddingVertical: 8, paddingHorizontal: 12, fontSize: 13, fontWeight: "600", color: "#a5b4fc" },
    promptScroll: { maxHeight: 200, padding: 12 },
    preText: { fontSize: 13, color: "#e2e8f0", fontFamily: Platform?.OS === "ios" ? "Menlo" : "monospace" },
    mono: { fontSize: 12 },
    placeholder: { color: "#64748b", fontStyle: "italic" },
    historyList: { gap: 12 },
    historyItem: { padding: 12, borderRadius: 12, marginBottom: 8 },
    historyUser: { backgroundColor: "rgba(99, 102, 241, 0.2)", borderWidth: 1, borderColor: "rgba(99, 102, 241, 0.3)" },
    historyAssistant: { backgroundColor: "#1e293b", borderWidth: 1, borderColor: "#334155" },
    historyRole: { fontSize: 11, color: "#64748b", marginBottom: 4, textTransform: "capitalize" },
    historyText: { fontSize: 13, color: "#e2e8f0" },
    codeBlock: { backgroundColor: "#1e1e1e", borderRadius: 12, padding: 16 },
    codeText: { fontSize: 11, color: "#93c5fd", fontFamily: Platform?.OS === "ios" ? "Menlo" : "monospace" },
});
