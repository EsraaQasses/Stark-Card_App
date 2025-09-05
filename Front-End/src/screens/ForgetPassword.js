// src/screens/ForgotPassword.js
import React, { useState } from "react";
import { View, Image, Text, TextInput, StyleSheet, Alert } from "react-native";
import Screen from "../ui/Screen";
import Button from "../ui/Button";
import theme from "../ui/Theme";

export default function ForgetPassword({ navigation }) {
  const [email, setEmail] = useState("");

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSend = validEmail;

  return (
    <Screen>
      {/* Header / Logo */}
      <View style={styles.header}>
        <Image
          source={require("../assets/Logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Body */}
      <View style={styles.form}>
        <Text style={styles.title}>Forgot Password</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your account email"
          placeholderTextColor="rgba(0,0,0,0.5)"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Button
          title="Send Code"
          width={143}
          onPress={() => {
            // TODO: call your API to send reset code to email
            // e.g. await api.auth.sendResetCode({ email })
            Alert.alert("Check your inbox", "We’ve sent you a verification code.");
            navigation.navigate("Verification"); // reuse your Verification screen
          }}
          disabled={!canSend}
          style={{ marginTop: 16, opacity: canSend ? 1 : 0.6 }}
        />
      </View>

      {/* Divider + link back to Login */}
      <View style={styles.bottomBlock}>
        <View style={styles.bottomRow}>
          <View style={styles.line} />
          <Text style={styles.muted}>Remembered your password?</Text>
          <View style={styles.line} />
        </View>
        <Text style={styles.link} onPress={() => navigation.replace("Login")}>
          Log in
        </Text>
      </View>

      <Text style={styles.footer}>©2025 STARK-CARD</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", marginTop: 36, marginBottom: 8 },
  logo: { width: 370, height: 250 },

  form: { flex: 1, marginTop: 8, alignItems: "center" },

  title: {
    color: theme.colors.textPrimary,
    fontWeight: "700",
    fontSize: 22,
    marginBottom: 12,
    textAlign: "center",
  },

  label: {
    width: "100%",
    color: theme.colors.textPrimary,
    opacity: 0.9,
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    width: "100%",
    height: 40,
    borderRadius: 25,
    paddingHorizontal: 14,
    color: "#000",
    borderWidth: 1,
    borderColor: "rgba(34, 9, 255, 0.35)",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },

  bottomBlock: { alignItems: "center", marginBottom: 6 },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: 4,
  },
  line: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.5)" },
  muted: { color: theme.colors.textMuted, fontWeight: "600", marginHorizontal: 8 },
  link: { color: theme.colors.textPrimary, fontWeight: "800", marginTop: 4, textAlign: "center" },

  footer: {
    textAlign: "center",
    color: theme.colors.textPrimary,
    opacity: 0.8,
    fontSize: theme.typography.footer.fontSize,
  },
});
