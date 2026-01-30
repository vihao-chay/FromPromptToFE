import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function Logo({ style, textStyle, iconSize = 16, showText = true }) {
    return (
        <View style={[styles.container, style]}>
            <LinearGradient
                colors={["#3B82F6", "#2563EB"]}
                style={styles.iconBox}
            >
                <Text style={[styles.icon, { fontSize: iconSize }]}>✨</Text>
            </LinearGradient>
            {showText && <Text style={[styles.text, textStyle]}>AI CodeGen</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
    },
    icon: {
        color: "white",
    },
    text: {
        color: "white",
        fontSize: 18,
        fontWeight: "600",
    },
});
