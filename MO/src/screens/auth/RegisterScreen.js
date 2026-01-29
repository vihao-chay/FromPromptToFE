import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create an Account</Text>
      <Text style={styles.subtitle}>
        Start generating frontend code with AI.
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Email (Required)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#94a3b8"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Full Name (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
          placeholderTextColor="#94a3b8"
          value={fullName}
          onChangeText={setFullName}
        />

        <Text style={styles.label}>Password (Required)</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="Create a strong password"
          placeholderTextColor="#94a3b8"
          value={password}
          onChangeText={setPassword}
        />

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="Repeat your password"
          placeholderTextColor="#94a3b8"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.loginText}>
            Already have an account? Login
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#0f172a",
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    color: "#94a3b8",
    marginBottom: 30,
  },
  card: {
    backgroundColor: "#1e293b",
    padding: 20,
    borderRadius: 24,
  },
  label: {
    color: "#cbd5e1",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#020617",
    borderRadius: 16,
    padding: 14,
    color: "white",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#1d63ed",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  loginText: {
    marginTop: 20,
    textAlign: "center",
    color: "#1d63ed",
    fontWeight: "600",
  },
});
