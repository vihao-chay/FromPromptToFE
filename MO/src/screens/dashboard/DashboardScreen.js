import React, { useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import ProjectCard from "../../components/ProjectCard";
import BottomTabBar from "../../components/BottomTabBar";
import Logo from "../../components/Logo";

export default function DashboardScreen() {
    const [activeTab, setActiveTab] = useState("Projects");

    return (
        <View style={styles.container}>

            {/* HEADER */}
            <View style={styles.header}>
                <Logo />

                <Image
                    source={{
                        uri: "https://i.pravatar.cc/100",
                    }}
                    style={styles.avatar}
                />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* TITLE */}
                <View style={styles.titleRow}>
                    <Text style={styles.screenTitle}>
                        Projects
                    </Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                            12 Total
                        </Text>
                    </View>
                </View>

                {/* SEARCH */}
                <View style={styles.searchRow}>
                    <View style={styles.searchContainer}>
                        <TextInput
                            placeholder="Search projects..."
                            placeholderTextColor="#94a3b8"
                            style={styles.searchInput}
                        />
                        <MaterialIcons
                            name="search"
                            size={20}
                            color="#94a3b8"
                            style={styles.searchIcon}
                        />
                    </View>

                    <TouchableOpacity style={styles.addButton}>
                        <MaterialIcons name="add" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* PROJECT LIST */}
                <View style={styles.projectList}>
                    <ProjectCard
                        title="SaaS Landing Page"
                        tech="React"
                        updated="Updated 2h ago"
                        logo="https://cdn.worldvectorlogo.com/logos/react-2.svg"
                    />

                    <ProjectCard
                        title="E-commerce UI"
                        tech="Vue"
                        updated="Updated 1d ago"
                        logo="https://cdn.worldvectorlogo.com/logos/vue-9.svg"
                    />

                    <ProjectCard
                        title="Crypto Portfolio"
                        tech="Next.js"
                        updated="Updated 5d ago"
                        logo="https://cdn.worldvectorlogo.com/logos/nextjs-2.svg"
                    />

                    <ProjectCard
                        title="Static Blog"
                        tech="HTML/CSS"
                        updated="Archived"
                        logo="https://cdn.worldvectorlogo.com/logos/tailwind-css-2.svg"
                        archived
                    />
                </View>

                {/* CREATE BUTTON */}
                <TouchableOpacity style={styles.createButton}>
                    <MaterialIcons name="add-circle" size={22} color="white" />
                    <Text style={styles.createButtonText}>
                        Create New Project
                    </Text>
                </TouchableOpacity>

            </ScrollView>

            <BottomTabBar active={activeTab} onChange={setActiveTab} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0f172a", // slate-900
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#1e293b", // slate-800
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 120, // space for bottom tab bar
    },
    titleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    screenTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "white",
    },
    badge: {
        backgroundColor: "#1e293b", // slate-800
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 9999,
    },
    badgeText: {
        fontSize: 12,
        color: "#64748b", // slate-500
    },
    searchRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 24,
    },
    searchContainer: {
        flex: 1,
        position: "relative",
        backgroundColor: "#1e293b", // slate-800
        borderRadius: 16,
    },
    searchInput: {
        paddingVertical: 12,
        paddingLeft: 40,
        paddingRight: 16,
        color: "white",
        fontSize: 14,
    },
    searchIcon: {
        position: "absolute",
        left: 12,
        top: 12,
    },
    addButton: {
        width: 48,
        height: 48,
        backgroundColor: "#2563eb", // blue-600
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    projectList: {
        gap: 16,
    },
    createButton: {
        marginTop: 24,
        backgroundColor: "#2563eb", // blue-600
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    createButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    }
});
