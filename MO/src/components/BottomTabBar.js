import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function BottomTabBar({ active, onChange }) {
    const tabs = [
        { name: "Dashboard", icon: "grid-view" },
        { name: "Projects", icon: "folder" },
        { name: "Integrations", icon: "extension" },
        { name: "Settings", icon: "settings" },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {tabs.map((tab) => {
                    const isActive = active === tab.name;

                    return (
                        <TouchableOpacity
                            key={tab.name}
                            onPress={() => onChange && onChange(tab.name)}
                            style={styles.tabItem}
                        >
                            <MaterialIcons
                                name={tab.icon}
                                size={24}
                                color={isActive ? "#2563eb" : "#64748b"}
                            />
                            <Text
                                style={[
                                    styles.tabText,
                                    isActive ? styles.activeText : styles.inactiveText
                                ]}
                            >
                                {tab.name}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(15, 23, 42, 0.95)", // slate-900/95
        borderTopWidth: 1,
        borderTopColor: "#1e293b", // slate-800
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    content: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: 'center',
    },
    tabItem: {
        alignItems: "center",
        flex: 1,
    },
    tabText: {
        fontSize: 10,
        fontWeight: "bold",
        textTransform: "uppercase",
        marginTop: 4,
    },
    activeText: {
        color: "#2563eb", // blue-600
    },
    inactiveText: {
        color: "#94a3b8", // slate-400
    },
});
