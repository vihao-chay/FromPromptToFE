import React from "react";

import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Logo from "./Logo";

export default function Header() {
  return (
    <View style={styles.header}>
      <Logo />

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
