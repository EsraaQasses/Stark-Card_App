// src/screens/SignUp/Email.js
import React, { useState } from "react";
import { View, Image, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import Screen from "../../ui/Screen";
import Button from "../../ui/Button";
import theme from "../../ui/Theme";

const Field = ({ label, placeholder, secureTextEntry, value, onChangeText, keyboardType }) => (
  <View style={{ marginBottom: 12 }}>
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
      {/* Header / Logo */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/Logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Field label="Full Name" placeholder="Full Name" value={fullName} onChangeText={setFullName} />
        <Field label="User Name" placeholder="Name" value={userName} onChangeText={setUserName} />
        <Field label="Password" placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
        <Field label="Email" placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />

        <Button
          title="Continue"
          width={143}
          onPress={() => navigation.navigate("Extra", { phoneRequired: true })}
          disabled={!canContinue}
        />

      </View>

          {/* Bottom links */}
    <View style={styles.bottomRow}>
    <View style={styles.line} />
    <Text style={styles.muted}>Already Have an Account?</Text>
    <View style={styles.line} />
    </View>

    <TouchableOpacity onPress={() => navigation.navigate("Login")}>
    <Text style={styles.link}>Log in</Text>
    </TouchableOpacity>


      <Text style={styles.footer}>©2025 STARK-CARD</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", marginTop: 10, marginBottom: 1 },
  logo: { width: 370, height: 250 },
  form: { flex: 1, marginTop: 10 },
  label: { color: theme.colors.textPrimary, opacity: 0.9, marginBottom: 8, fontWeight: "600", marginLeft:12 },
  input: {
    height: 40,
    borderRadius: 25,
    paddingHorizontal: 14,
    color: "#000",
    borderWidth: 1,
    borderColor: "rgba(34, 9, 255, 0.35)",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
bottomRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  width: "115%",       // ✅ make sure row spans full width
  marginBottom: 15,
  marginLeft: "-19"
},
line: {
  flex: 1,
  height: 1,
  width: 150,
  backgroundColor: "rgba(255,255,255,0.5)",
},
muted: {
  color: theme.colors.textMuted,
  fontWeight: "600",
  marginHorizontal: 2, // space between text and lines
},
link: {
  color: theme.colors.textPrimary,
  fontWeight: "800",
  marginTop: 10,
  textAlign: "center",
  marginBottom: 12
},
  footer: {
    textAlign: "center",
    color: theme.colors.textPrimary,
    opacity: 0.8,
    fontSize: theme.typography.footer.fontSize,
  },
});
