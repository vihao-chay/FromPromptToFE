import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Header from "../components/Header";

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Header />

      <View style={styles.main}>
        <Text style={styles.title}>
          Transform <Text style={styles.highlight}>Ideas</Text> into Interfaces
        </Text>

        <Text style={styles.subtitle}>
          The next-generation AI platform for building stunning mobile
          interfaces at the speed of thought.
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate("Login")}
        >
          <LinearGradient
            colors={["#3B82F6", "#2563EB"]}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.smallText}>
          NO CREDIT CARD REQUIRED
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © 2026 AI CodeGen. Built for creators.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    paddingHorizontal: 24,
    paddingTop: 60,
    justifyContent: "space-between",
  },
  main: {
    alignItems: "center",
  },
  title: {
    fontSize: 40,
    fontWeight: "800",
    color: "white",
    textAlign: "center",
    lineHeight: 46,
  },
  highlight: {
    color: "#3B82F6",
  },
  subtitle: {
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    marginTop: 16,
    fontSize: 16,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  button: {
    marginTop: 40,
    width: 260,
    height: 60,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
  },
  smallText: {
    marginTop: 16,
    fontSize: 12,
    color: "rgba(255,255,255,0.3)",
    letterSpacing: 1,
  },
  footer: {
    alignItems: "center",
    marginBottom: 20,
  },
  footerText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.3)",
  },
});
