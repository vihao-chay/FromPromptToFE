import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function Button({
    title,
    onPress,
    variant = "primary", // 'primary', 'gradient', 'link', 'outline'
    colors = ["#3B82F6", "#2563EB"], // Default for gradient
    style,
    textStyle,
    disabled = false,
    loading = false,
    ...props
}) {
    const isGradient = variant === "gradient";
    const isLink = variant === "link";
    const isOutline = variant === "outline";

    if (isLink) {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={disabled || loading}
                style={[styles.linkButton, style]}
                {...props}
            >
                {loading ? (
                    <ActivityIndicator size="small" color="#2563eb" />
                ) : (
                    <Text style={[styles.linkText, textStyle]}>{title}</Text>
                )}
            </TouchableOpacity>
        );
    }

    const ButtonContent = () => (
        <>
            {loading ? (
                <ActivityIndicator size="small" color="white" />
            ) : (
                <Text style={[
                    styles.buttonText,
                    isOutline && styles.outlineText,
                    textStyle
                ]}>{title}</Text>
            )}
        </>
    );

    if (isGradient) {
        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={onPress}
                disabled={disabled || loading}
                style={[styles.container, style]}
                {...props}
            >
                <LinearGradient
                    colors={colors}
                    style={styles.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <ButtonContent />
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            disabled={disabled || loading}
            style={[
                styles.button,
                isOutline && styles.outlineButton,
                disabled && styles.disabledButton,
                style,
            ]}
            {...props}
        >
            <ButtonContent />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    gradient: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 16,
    },
    button: {
        backgroundColor: "#2563eb",
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    outlineButton: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "#2563eb",
    },
    disabledButton: {
        opacity: 0.6,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    outlineText: {
        color: "#2563eb",
    },
    linkButton: {
        paddingVertical: 8,
    },
    linkText: {
        color: "#2563eb",
        fontWeight: "600",
        fontSize: 14,
    },
});
