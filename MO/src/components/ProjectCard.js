import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

export default function ProjectCard({
    title,
    tech,
    updated,
    logo,
    archived = false,
}) {
    return (
        <View
            style={[
                styles.card,
                archived && styles.archived
            ]}
        >
            <View style={styles.iconContainer}>
                {logo ? (
                    <Image source={{ uri: logo }} style={styles.icon} resizeMode="contain" />
                ) : (
                    <Text style={styles.iconLetter}>{(title || "?").charAt(0).toUpperCase()}</Text>
                )}
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>
                    {title}
                </Text>

                <View style={styles.metaContainer}>
                    <View style={styles.techBadge}>
                        <Text style={styles.techText}>{tech}</Text>
                    </View>
                    <Text style={styles.updatedText}>{updated}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 16,
        borderRadius: 16,
        backgroundColor: "#1e293b", // slate-800
        borderWidth: 1,
        borderColor: "#334155", // slate-700
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        marginBottom: 16,
    },
    archived: {
        opacity: 0.6,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: "#0f172a", // slate-900
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#334155", // slate-700
    },
    icon: {
        width: 32,
        height: 32,
    },
    iconLetter: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#60a5fa",
    },
    content: {
        flex: 1,
    },
    title: {
        fontWeight: "bold",
        color: "white",
        fontSize: 16,
    },
    metaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 4,
    },
    techBadge: {
        backgroundColor: "rgba(37,99,235,0.1)", // blue-600/10
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    techText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#60a5fa', // blue-400
        textTransform: 'uppercase',
    },
    updatedText: {
        fontSize: 12,
        color: '#94a3b8', // slate-400
    }
});
