import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  ImageBackground,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TextField from "../ui/TextField";

const { height: H } = Dimensions.get("window");
const BASE_H = 844;                            // Figma baseline (iPhone 14)
const sy = (n) => (H / BASE_H) * n;            // scale Y to device height

export default function SignUpEmail({ navigation }) {
  const [fullName, setFullName] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const insets = useSafeAreaInsets();

  const canContinue = useMemo(
    () =>
      fullName.trim().length >= 2 &&
      userName.trim().length >= 2 &&
      password.trim().length >= 6 &&
      /\S+@\S+\.\S+/.test(email.trim()),
    [fullName, userName, password, email]
  );

  const onRegister = () => {
    if (!canContinue) return;
    navigation.navigate("SignUpPhone", {
      seed: {
        fullName: fullName.trim(),
        userName: userName.trim(),
        password: password.trim(),
        email: email.trim(),
      },
    });
  };

  return (
    <View style={styles.roundedScreen}>
      <ImageBackground source={require("../assets/bg.png")} style={styles.bg} resizeMode="cover">
        <StatusBar barStyle="light-content" />

        {/* decorative glows to match mock */}
        <LinearGradient
          colors={["rgba(0,200,255,0)", "rgba(0,200,255,0.35)", "rgba(0,200,255,0)"]}
          start={{ x: 0.2, y: 0.5 }}
          end={{ x: 0.9, y: 0.5 }}
          style={[styles.cyanGlow, { top: "34%" }]}
          pointerEvents="none"
        />
        <LinearGradient
          colors={["rgba(255,255,255,0.25)", "rgba(255,255,255,0)"]}
          start={{ x: 0.1, y: 0.1 }}
          end={{ x: 0.6, y: 0.6 }}
          style={styles.cornerBloom}
          pointerEvents="none"
        />

        <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
            {/* LOGO — sized/placed to match the screenshot */}
            <View style={[styles.header, { marginTop: sy(8) }]}>
              <Image source={require("../assets/Logo.png")} style={{ width: 350, height: 250 }} resizeMode="contain" />
            </View>

            {/* FORM — spacing tuned for the mock */}
            <View style={[styles.form, { marginTop: sy(8) }]}>
              <TextField label="Full Name" value={fullName} onChangeText={setFullName} placeholder="Full Name" />
              <TextField label="User Name" value={userName} onChangeText={setUserName} placeholder="Name" autoCapitalize="none" />
              <TextField label="Password" value={password} onChangeText={setPassword} placeholder="Enter Your Password" secureTextEntry />
              <TextField label="Email" value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" keyboardType="email-address" />
            </View>

            {/* REGISTER pill — exact size, centered, with soft shadow */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={onRegister}
              disabled={!canContinue}
              style={[
                styles.registerWrap,
                {
                  bottom: sy(130), // sits just above the divider like the mock
                  opacity: canContinue ? 1 : 0.7,
                },
              ]}
            >
              <LinearGradient
                colors={["#092D67", "rgba(9,45,103,0.10)", "#092D67"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.registerBg}
              >
                <Text style={styles.registerText}>Register</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* DIVIDER + LOGIN — pinned to bottom exactly like your design */}
            <View style={[styles.dividerRow, { bottom: sy(92) }]}>
              <View style={styles.hr} />
              <Text style={styles.dividerText}>Already Have an Account?</Text>
              <View style={styles.hr} />
            </View>

            <TouchableOpacity onPress={() => navigation.navigate("Login")} style={[styles.loginBtn, { bottom: sy(64) }]}>
              <Text style={styles.loginText}>Log in</Text>
            </TouchableOpacity>

            <Text style={[styles.copy, { bottom: 10 + insets.bottom }]}>©2025 STARK-CARD</Text>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  roundedScreen: { flex: 1, backgroundColor: "#06122A", borderRadius: 28, overflow: "hidden" },
  bg: { flex: 1 },

  cyanGlow: { position: "absolute", left: -40, right: -40, height: 140, opacity: 0.6 },
  cornerBloom: { position: "absolute", left: -60, top: -40, width: 220, height: 220, borderRadius: 200 },

  header: { alignItems: "center" },

  form: { gap: 14, paddingHorizontal: 22, marginTop: 6 },

  /* REGISTER button geometry from your spec (143 × 53.96 px, pill radius 30) */
  registerWrap: {
    position: "absolute",
    alignSelf: "center",
    width: 143,
    height: 53.96,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 8,
  },
  registerBg: { flex: 1, borderRadius: 30, justifyContent: "center", alignItems: "center" },
  registerText: { fontFamily: "IstokWeb-Bold", fontWeight: "700", fontSize: 24, lineHeight: 35, color: "#FFFFFF" },

  dividerRow: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  hr: { height: StyleSheet.hairlineWidth, flex: 1, backgroundColor: "rgba(255,255,255,0.9)" },
  dividerText: { color: "#FFFFFF", fontWeight: "700" },

  loginBtn: { position: "absolute", alignSelf: "center" },
  loginText: { color: "#FFFFFF", fontWeight: "700", textDecorationLine: "underline" },

  copy: { position: "absolute", left: 0, right: 0, textAlign: "center", color: "#E6F0FF", fontSize: 10, letterSpacing: 0.3, opacity: 0.9 },
});
