// src/screens/Login.js
import React, { useState } from "react";
import { View, Image, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import Screen from "../ui/Screen";
import Button from "../ui/Button";
import theme from "../ui/Theme";
import { sx, sy, sp } from "../ui/scale";

export default function Login({ navigation }) {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  const canLogin = userName.trim() && password.trim();

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

      {/* Form */}
      <View style={styles.form}>
        <Text style={styles.label}>User Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Your Name"
          placeholderTextColor="rgba(0,0,0,0.5)"
          value={userName}
          onChangeText={setUserName}
        />

        <View style={{ marginTop: sy(12) }}>
          <Text style={styles.label}>Password</Text>
          <View style={{ position: "relative" }}>
            <TextInput
              style={styles.input}
              placeholder="Enter Your Password"
              placeholderTextColor="rgba(0,0,0,0.5)"
              secureTextEntry={!show}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.eye}
              onPress={() => setShow((s) => !s)}
              hitSlop={{ top: sy(8), bottom: sy(8), left: sx(8), right: sx(8) }}
            >
              <Text style={styles.eyeText}>{show ? "🙈" : "👁️"}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("ForgetPassword")}>
            <Text style={styles.forgot}>Forget Password</Text>
          </TouchableOpacity>
        </View>

        <Button
          title="Login"
          width={sx(143)}
          height={sy(55)}
          onPress={() => navigation.navigate("Verification")}
          disabled={!canLogin}
          style={{ marginTop: sy(22), alignSelf: "center", opacity: canLogin ? 1 : 0.6 }}
        />
      </View>

      {/* OR divider */}
      <View style={styles.orBlock}>
        <View style={styles.line} />
        <Text style={styles.orText}>OR</Text>
        <View style={styles.line} />
      </View>

      {/* Register link */}
      <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
        <Text style={styles.register}>Register</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>©2025 STARK-CARD</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", marginTop: sy(6), marginBottom: sy(2) },
  logo: { width: sx(370), height: sy(250) },

  form: { flex: 1, marginTop: sy(8) },

  label: {
    color: theme.colors.textPrimary,
    opacity: 0.9,
    marginBottom: sy(6),
    fontWeight: "600",
    fontSize: sp(14),
    marginLeft: sx(2),
  },
  input: {
    height: sy(44),
    borderRadius: sy(25),
    paddingHorizontal: sx(14),
    color: "#000",
    borderWidth: 1,
    borderColor: "rgba(34, 9, 255, 0.35)",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  eye: { position: "absolute", right: sx(14), top: sy(9) },
  eyeText: { fontSize: sp(18) },
  forgot: {
    color: theme.colors.textPrimary,
    textAlign: "right",
    marginTop: sy(6),
    fontWeight: "700",
    fontSize: sp(13),
  },

  orBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: sx(8),
    width: "100%",
    marginBottom: sy(12),
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  orText: { color: theme.colors.textPrimary, fontWeight: "800", fontSize: sp(13) },
  register: {
    color: theme.colors.textPrimary,
    fontWeight: "800",
    textAlign: "center",
    marginTop: sy(4),
    marginBottom: sy(15),
    fontSize: sp(14),
  },

  footer: {
    textAlign: "center",
    color: theme.colors.textPrimary,
    opacity: 0.8,
    fontSize: theme.typography.footer.fontSize,
  },
});
