import React from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

/**
 * Reusable "+" action button for Create Organization / Create Project.
 */
export default function AddActionButton({ onPress, label, accessibilityLabel }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={styles.wrap}
            activeOpacity={0.85}
            accessibilityLabel={accessibilityLabel ?? `Add ${label}`}
        >
            <View style={styles.circle}>
                <MaterialIcons name="add" size={24} color="#fff" />
            </View>
            <Text style={styles.label} numberOfLines={1}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    wrap: {
        alignItems: "center",
        justifyContent: "center",
        minWidth: 56,
    },
    circle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#2563eb",
        alignItems: "center",
        justifyContent: "center",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        shadowRadius: 2,
    },
    label: {
        marginTop: 4,
        fontSize: 10,
        fontWeight: "600",
        color: "#94a3b8",
        textTransform: "uppercase",
    },
});
