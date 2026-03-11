import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BottomTabBar({ state, descriptors, navigation, active, onChange }) {
    const insets = useSafeAreaInsets();
    
    // For manual usage (e.g. AdminTabBar might be separate, but if they reused this)
    if (!state) {
        const tabs = [
            { name: "Dashboard", icon: "grid-view" },
            { name: "Profile", icon: "person" },
        ];
        return (
            <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
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

    return (
        <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <View style={styles.content}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const label =
                        options.tabBarLabel !== undefined
                            ? options.tabBarLabel
                            : options.title !== undefined
                            ? options.title
                            : route.name;

                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name, route.params);
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({
                            type: 'tabLongPress',
                            target: route.key,
                        });
                    };

                    let iconName = "grid-view";
                    if (route.name === "Profile") iconName = "person";

                    return (
                        <TouchableOpacity
                            key={route.key}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            testID={options.tabBarTestID}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            style={styles.tabItem}
                        >
                            <MaterialIcons
                                name={iconName}
                                size={24}
                                color={isFocused ? "#2563eb" : "#64748b"}
                            />
                            <Text
                                style={[
                                    styles.tabText,
                                    isFocused ? styles.activeText : styles.inactiveText
                                ]}
                            >
                                {label}
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
