import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { WebView } from "react-native-webview";
import { MaterialIcons } from "@expo/vector-icons";
import projectOutputService from "../../services/projectOutputService";

const CODE_BLOCK_HEIGHT = 220;
const PREVIEW_HEIGHT = 340;

/** Wrap HTML with viewport + base styles so preview renders like FE (iframe). */
function htmlForPreview(raw) {
    if (!raw || typeof raw !== "string") {
        return "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1, maximum-scale=1\"></head><body style=\"margin:0;padding:24px;font-family:system-ui;background:#fff;color:#111\"><p>No preview available.</p></body></html>";
    }
    const style = `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<style>html,body{margin:0;padding:0;-webkit-font-smoothing:antialiased;}*{box-sizing:border-box;}</style>`;
    if (/<head[\s>]/i.test(raw)) {
        return raw.replace(/<head([^>]*)>/i, `<head$1>${style}`);
    }
    return `<!DOCTYPE html><html><head><meta charset="utf-8">${style}</head><body>${raw}</body></html>`;
}

const SNIPPET_LEN = 80;

function norm(o) {
    if (!o) return {};
    return {
        id: o.id ?? o.Id ?? "",
        projectId: o.projectId ?? o.ProjectId ?? "",
        version: o.version ?? o.Version ?? "",
        status: o.status ?? o.Status ?? "",
        triggeredBy: o.triggeredBy ?? o.TriggeredBy ?? "",
        createdAt: o.createdAt ?? o.CreatedAt ?? "",
        systemPrompt: o.systemPrompt ?? o.SystemPrompt ?? "",
        generatedTsx: o.generatedTsx ?? o.GeneratedTsx ?? "",
        generatedHtml: o.generatedHtml ?? o.GeneratedHtml ?? "",
    };
}

export default function ProjectLogsScreen({ route, navigation }) {
    const { projectId, projectName } = route.params || {};
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [detail, setDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const scrollRef = useRef(null);

    const loadLogs = useCallback(async () => {
        if (!projectId) return;
        try {
            const { items: list } = await projectOutputService.getByProjectId(projectId, {
                pageIndex: 1,
                pageSize: 100,
                sortBy: "CreatedAt",
                sortOrder: "desc",
            });
            setItems(Array.isArray(list) ? list.map(norm) : []);
        } catch (_) {
            setItems([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [projectId]);

    useEffect(() => {
        loadLogs();
    }, [loadLogs]);

    const onRefresh = () => {
        setRefreshing(true);
        loadLogs();
    };

    const onSelectLog = async (item) => {
        const id = item.id;
        setSelectedId(id);
        setDetail(null);
        setDetailLoading(true);
        try {
            const full = await projectOutputService.getById(id);
            const d = norm(full);
            setDetail(d);
            setTimeout(() => {
                scrollRef.current?.scrollToEnd({ animated: true });
            }, 100);
        } catch (_) {
            setDetail(norm(item));
            setTimeout(() => {
                scrollRef.current?.scrollToEnd({ animated: true });
            }, 100);
        } finally {
            setDetailLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        const d = new Date(dateStr);
        return d.toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const snippet = (s) => {
        if (!s || typeof s !== "string") return "—";
        const t = s.trim();
        return t.length <= SNIPPET_LEN ? t : t.slice(0, SNIPPET_LEN) + "…";
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <MaterialIcons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    {projectName ? `Logs: ${projectName}` : "Generation logs"}
                </Text>
            </View>

            <ScrollView
                ref={scrollRef}
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />
                }
            >
                {loading ? (
                    <View style={styles.loadingWrap}>
                        <ActivityIndicator size="large" color="#2563eb" />
                        <Text style={styles.loadingText}>Loading logs...</Text>
                    </View>
                ) : items.length === 0 ? (
                    <Text style={styles.emptyText}>No generation logs for this project.</Text>
                ) : (
                    <View style={styles.logList}>
                        {items.map((item) => {
                            const isSelected = selectedId === item.id;
                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[styles.logRow, isSelected && styles.logRowSelected]}
                                    onPress={() => onSelectLog(item)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.logRowTop}>
                                        <Text style={styles.logDate}>{formatDate(item.createdAt)}</Text>
                                        <View style={[styles.statusBadge, item.status === "Success" && styles.statusSuccess, item.status === "Failed" && styles.statusFailed]}>
                                            <Text style={styles.statusText}>{item.status || "—"}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.logSnippet} numberOfLines={2}>
                                        {snippet(item.systemPrompt)}
                                    </Text>
                                    {item.version ? (
                                        <Text style={styles.logVersion}>v {item.version}</Text>
                                    ) : null}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                {selectedId && (
                    <View style={styles.detailSection}>
                        <Text style={styles.detailTitle}>Preview</Text>
                        {detailLoading ? (
                            <ActivityIndicator size="small" color="#2563eb" style={styles.detailLoader} />
                        ) : detail ? (
                            <>
                                {/* Visual Preview — same as FE iframe: render generated HTML as UI */}
                                <Text style={styles.previewLabel}>Visual Preview</Text>
                                <View style={styles.previewFrame}>
                                    <WebView
                                        source={{ html: htmlForPreview(detail.generatedHtml || "") }}
                                        style={styles.webView}
                                        scrollEnabled
                                        nestedScrollEnabled
                                        originWhitelist={["*"]}
                                        showsVerticalScrollIndicator
                                        mixedContentMode="compatibility"
                                    />
                                </View>
                                <Text style={[styles.detailTitle, styles.codeSectionTitle]}>Code</Text>
                                <View style={styles.detailBlocks}>
                                    <View style={styles.block}>
                                        <Text style={styles.blockLabel}>TSX</Text>
                                        <ScrollView
                                            style={[styles.codeScroll, { height: CODE_BLOCK_HEIGHT }]}
                                            nestedScrollEnabled
                                            showsVerticalScrollIndicator
                                        >
                                            <Text style={styles.codeText} selectable>
                                                {detail.generatedTsx || "—"}
                                            </Text>
                                        </ScrollView>
                                    </View>
                                    <View style={styles.block}>
                                        <Text style={styles.blockLabel}>HTML</Text>
                                        <ScrollView
                                            style={[styles.codeScroll, { height: CODE_BLOCK_HEIGHT }]}
                                            nestedScrollEnabled
                                            showsVerticalScrollIndicator
                                        >
                                            <Text style={styles.codeText} selectable>
                                                {detail.generatedHtml || "—"}
                                            </Text>
                                        </ScrollView>
                                    </View>
                                </View>
                            </>
                        ) : null}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0f172a",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingTop: 48,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#334155",
    },
    backBtn: {
        padding: 8,
        marginRight: 8,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: "600",
        color: "#fff",
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },
    loadingWrap: {
        paddingVertical: 32,
        alignItems: "center",
    },
    loadingText: {
        color: "#94a3b8",
        marginTop: 8,
    },
    emptyText: {
        color: "#94a3b8",
        textAlign: "center",
        paddingVertical: 24,
    },
    logList: {
        gap: 12,
    },
    logRow: {
        backgroundColor: "#1e293b",
        borderRadius: 12,
        padding: 14,
        borderWidth: 2,
        borderColor: "transparent",
    },
    logRowSelected: {
        borderColor: "#2563eb",
        backgroundColor: "#1e3a5f",
    },
    logRowTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
    logDate: {
        fontSize: 12,
        color: "#94a3b8",
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        backgroundColor: "#475569",
    },
    statusSuccess: {
        backgroundColor: "rgba(34,197,94,0.2)",
    },
    statusFailed: {
        backgroundColor: "rgba(239,68,68,0.2)",
    },
    statusText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#e2e8f0",
    },
    logSnippet: {
        fontSize: 14,
        color: "#e2e8f0",
        lineHeight: 20,
    },
    logVersion: {
        fontSize: 11,
        color: "#64748b",
        marginTop: 4,
    },
    detailSection: {
        marginTop: 24,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#334155",
    },
    detailTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
        marginBottom: 12,
    },
    codeSectionTitle: {
        marginTop: 20,
    },
    previewLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#94a3b8",
        marginBottom: 8,
    },
    previewFrame: {
        height: PREVIEW_HEIGHT,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#334155",
    },
    webView: {
        flex: 1,
        backgroundColor: "#fff",
    },
    detailLoader: {
        marginVertical: 16,
    },
    detailBlocks: {
        gap: 16,
    },
    block: {
        backgroundColor: "#1e293b",
        borderRadius: 10,
        overflow: "hidden",
    },
    blockLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "#94a3b8",
        paddingHorizontal: 12,
        paddingTop: 10,
        paddingBottom: 4,
    },
    codeScroll: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        paddingBottom: 12,
    },
    codeText: {
        fontFamily: "monospace",
        fontSize: 12,
        color: "#e2e8f0",
    },
});
