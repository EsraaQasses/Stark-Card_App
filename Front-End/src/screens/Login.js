import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  ImageBackground,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import TextField from "../ui/TextField";

export default function Login({ navigation }) {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);

  const onLogin = () => {
    // TODO: call your auth API
    navigation.navigate("Verification", { via: "password" });
  };

  return (
    <ImageBackground source={require("../assets/bg.png")} style={styles.bg} resizeMode="cover">
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        {/* glows */}
        <LinearGradient
          colors={["rgba(0,200,255,0)", "rgba(0,200,255,0.35)", "rgba(0,200,255,0)"]}
          start={{ x: 0.2, y: 0.5 }} end={{ x: 0.9, y: 0.5 }}
          style={styles.cyanGlow} pointerEvents="none"
        />
        <LinearGradient
          colors={["rgba(255,255,255,0.25)", "rgba(255,255,255,0)"]}
          start={{ x: 0.1, y: 0.1 }} end={{ x: 0.6, y: 0.6 }}
          style={styles.cornerBloom} pointerEvents="none"
        />

        {/* Logo */}
        <View style={styles.header}>
          <Image source={require("../assets/Logo.png")} style={styles.logo} />

        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>User Name</Text>
          <TextField
            noLabel
            placeholder="Enter Your Name"
            autoCapitalize="none"
            value={userName}
            onChangeText={setUserName}
          />

          <Text style={[styles.label, { marginTop: 12 }]}>Password</Text>
          <View>
            <TextField
              noLabel
              placeholder="Enter Your Password"
              secureTextEntry={secure}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity style={styles.eye} onPress={() => setSecure((s) => !s)}>
              <Ionicons name={secure ? "eye-off" : "eye"} size={20} color="#001433" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={{ alignSelf: "flex-end", marginTop: 8 }}>
            <Text style={styles.forgot}>Forget Password</Text>
          </TouchableOpacity>
        </View>

        {/* Login button (absolute, centered) */}
        <TouchableOpacity activeOpacity={0.9} onPress={onLogin} style={styles.ctaWrap}>
          <LinearGradient
            colors={["#092D67", "rgba(9,45,103,0.10)", "#092D67"]}
            start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
            style={styles.ctaBg}
          >
            <Text style={styles.ctaText}>Login</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.hr} />
          <Text style={styles.or}>OR</Text>
          <View style={styles.hr} />
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("SignUpEmail")} style={{ alignSelf: "center" }}>
          <Text style={styles.footerLink}>Register</Text>
        </TouchableOpacity>

        <Text style={styles.copyright}>©2025 STARK-CARD</Text>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "#06122A", borderRadius: 1, overflow: "hidden" },
  cyanGlow: { position: "absolute", left: -40, right: -40, top: "35%", height: 140, opacity: 0.6 },
  cornerBloom: { position: "absolute", left: -60, top: -40, width: 220, height: 220, borderRadius: 200 },
  header: { alignItems: "center", paddingTop: 12 },
  logo: {
        width: 350,
        height: 230,
        marginBottom: 0,
    }, 
  form: { paddingHorizontal: 22, marginTop: 24 },
  label: { color: "#fff", marginLeft: 6, marginBottom: 6, fontWeight: "700" },
  eye: { position: "absolute", right: 18, top: 12, height: 46, justifyContent: "center" },
  forgot: { color: "#fff", fontWeight: "700", textDecorationLine: "underline" },

  // CTA pill (same geometry as “Register” spec)
  ctaWrap: {
    position: "absolute",
    width: 143,
    height: 53.96,
    alignSelf: "center",
    bottom: 160, // visually matches the mock (sits above footer). Tweak if needed.
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
  ctaBg: { flex: 1, borderRadius: 30, justifyContent: "center", alignItems: "center" },
  ctaText: {
    fontFamily: "IstokWeb-Bold",
    fontWeight: "700",
    fontSize: 24,
    lineHeight: 35,
    color: "#FFFFFF",
  },

  footer: { flexDirection: "row", alignItems: "center", gap: 10, position: "absolute", bottom: 84,right: 0, left:2.5},
  hr: { height: 1, width: 159, backgroundColor: "rgba(255,255,255,0.7)" },
  or: { color: "#fff", fontWeight: "700" },
  footerLink: { color: "#ffffff", fontWeight: "700", marginTop: 1, textDecorationLine: "underline", top: 270, right: 2},
copyright: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "#E6F0FF",
    fontSize: 9,
    letterSpacing: 0.4,
    opacity: 0.8,
  },
});
