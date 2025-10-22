// src/screens/SignUp/Email.js
import React, { useState } from "react";
import { View, Image, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import Screen from "../../ui/Screen";
import Button from "../../ui/Button";
import theme from "../../ui/Theme";
import { sx, sy, sp } from "../../ui/scale";

const Field = ({ label, placeholder, secureTextEntry, value, onChangeText, keyboardType }) => (
  <View style={{ marginBottom: sy(12) }}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="rgba(0,0,0,0.5)"
      secureTextEntry={secureTextEntry}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
    />
  </View>
);

export default function Email({ navigation }) {
  const [fullName, setFullName] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const nonEmpty = (s) => s.trim().length > 0;
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const strongPass = password.trim().length >= 6;
  const canContinue = [fullName, userName].every(nonEmpty) && strongPass && validEmail;

  return (
    <Screen>
      <View style={styles.header}>
        <Image source={require("../../assets/Logo.png")} style={styles.logo} resizeMode="contain" />
      </View>

      <View style={styles.form}>
        <Field label="Full Name" placeholder="Full Name" value={fullName} onChangeText={setFullName} />
        <Field label="User Name" placeholder="Name" value={userName} onChangeText={setUserName} />
        <Field label="Password" placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
        <Field label="Email" placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />

        <Button
          title="Continue"
          width={sx(143)}
          height={sy(55)}
          onPress={() => navigation.navigate("Extra", { phoneRequired: false })}
          disabled={!canContinue}
          style={{ marginTop: sy(16) }}
        />
      </View>

      <View style={styles.bottom}>
        <View style={styles.bottomRow}>
          <View style={styles.line} />
          <Text style={styles.muted}>Already Have an Account?</Text>
          <View style={styles.line} />
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.link}>Log in</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>©2025 STARK-CARD</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", marginTop: sy(10), marginBottom: sy(2) },
  logo: { width: sx(370), height: sy(250) },
  form: { flex: 1, marginTop: sy(10) },
  label: { color: theme.colors.textPrimary, opacity: 0.9, marginBottom: sy(8), fontWeight: "600", marginLeft: sx(12), fontSize: sp(14) },
  input: {
    height: sy(44),
    borderRadius: sy(25),
    paddingHorizontal: sx(14),
    color: "#000",
    borderWidth: 1,
    borderColor: "rgba(34, 9, 255, 0.35)",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },

  bottom: { position: "absolute", left: sx(20), right: sx(20), bottom: sy(60), alignItems: "center" },
  bottomRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", width: "100%", marginBottom: sy(4) },
  line: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: "rgba(255,255,255,0.5)" },
  muted: { color: theme.colors.textMuted, fontWeight: "600", marginHorizontal: sx(8), fontSize: sp(12) },
  link: { color: theme.colors.textPrimary, fontWeight: "800", marginTop: sy(4), textAlign: "center", fontSize: sp(14) },

  footer: { position: "absolute", left: 0, right: 0, bottom: sy(30), textAlign: "center", color: theme.colors.textPrimary, opacity: 0.8, fontSize: theme.typography.footer.fontSize },
});
