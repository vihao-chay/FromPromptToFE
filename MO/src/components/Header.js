import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function Header() {
  return (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <LinearGradient
          colors={["#3B82F6", "#2563EB"]}
          style={styles.logoBox}
        >
          <Text style={styles.logoIcon}>✨</Text>
        </LinearGradient>
        <Text style={styles.logoText}>AI CodeGen</Text>
      </View>

      <TouchableOpacity style={styles.menuButton}>
        <Text style={styles.menuText}>≡</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  logoIcon: {
    color: "white",
    fontSize: 16,
  },
  logoText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuText: {
    color: "white",
    fontSize: 20,
  },
});
