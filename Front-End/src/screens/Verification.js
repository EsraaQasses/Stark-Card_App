// src/screens/Verification.js
import React, { useState } from "react";
import { View, Image, Text, TextInput, StyleSheet } from "react-native";
import Screen from "../ui/Screen";
import Button from "../ui/Button";
import theme from "../ui/Theme";
import { sx, sy, sp } from "../ui/scale";

export default function Verification({ navigation }) {
  const [code, setCode] = useState("");
  const canEnter = code.trim().length >= 4;

  return (
    <Screen>
      <View style={styles.header}>
        <Image source={require("../assets/Logo.png")} style={styles.logo} resizeMode="contain" />
      </View>

      <View style={styles.center}>
        <Text style={styles.label}>Verification Code</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Your Code"
          placeholderTextColor="rgba(0,0,0,0.5)"
          keyboardType="number-pad"
          maxLength={6}
          value={code}
          onChangeText={setCode}
        />

        <Button
          title="Enter"
          width={sx(143)}
          height={sy(55)}
          onPress={() => {
            navigation.reset({ index: 0, routes: [{ name: "Home" }] });
          }}
          disabled={!canEnter}
          style={{ marginTop: sy(22), opacity: canEnter ? 1 : 0.6 }}
        />
      </View>

      <View style={styles.bottomBlock}>
        <View style={styles.bottomRow}>
          <View style={styles.line} />
          <Text style={styles.muted}>Already Have an Account?</Text>
          <View style={styles.line} />
        </View>
        <Text style={styles.register}>Register</Text>
      </View>

      <Text style={styles.footer}>©2025 STARK-CARD</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", marginTop: sy(10), marginBottom: sy(2) },
  logo: { width: sx(370), height: sy(250) },

  center: { flex: 1, alignItems: "center", marginTop: sy(10) },

  label: { color: theme.colors.textPrimary, opacity: 0.9, marginBottom: sy(6), fontWeight: "600", fontSize: sp(14) },
  input: {
    width: "100%",
    height: sy(44),
    borderRadius: sy(25),
    paddingHorizontal: sx(14),
    color: "#000",
    borderWidth: 1,
    borderColor: "rgba(34, 9, 255, 0.35)",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },

  bottomBlock: { alignItems: "center", marginBottom: sy(6) },
  bottomRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", width: "100%", marginBottom: sy(4) },
  line: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: "rgba(255,255,255,0.5)" },
  muted: { color: theme.colors.textMuted, fontWeight: "600", marginHorizontal: sx(8), fontSize: sp(12) },
  register: { color: theme.colors.textPrimary, fontWeight: "800", marginTop: sy(4), textAlign: "center", fontSize: sp(14) },

  footer: { textAlign: "center", color: theme.colors.textPrimary, opacity: 0.8, fontSize: theme.typography.footer.fontSize },
});
