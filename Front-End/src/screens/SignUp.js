// /src/screens/SignUp.js
import React from "react";
import {
  SafeAreaView,
  View,
  ImageBackground,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function SignUp({ navigation }) {
  const go = (route) => {
    if (navigation?.navigate) navigation.navigate(route);
    else Alert.alert("Navigation not available", `Tried to navigate to: ${route}`);
  };

  return (
    <ImageBackground
      source={require("../assets/bg.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe}>
        {/* Overlays */}
        <LinearGradient
          colors={["rgba(0,200,255,0)", "rgba(0,200,255,0.35)", "rgba(0,200,255,0)"]}
          start={{ x: 0.2, y: 0.5 }}
          end={{ x: 0.9, y: 0.5 }}
          style={styles.cyanGlow}
          pointerEvents="none"
        />
        <LinearGradient
          colors={[
            "rgba(0,0,0,0.40)",
            "rgba(0,0,0,0.15)",
            "rgba(0,0,0,0)",
            "rgba(0,0,0,0.15)",
            "rgba(0,0,0,0.40)",
          ]}
          locations={[0, 0.18, 0.5, 0.82, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <LinearGradient
          colors={["rgba(255,255,255,0.22)", "rgba(255,255,255,0.06)", "transparent"]}
          locations={[0, 0.3, 1]}
          start={{ x: 0.01, y: 0 }}
          end={{ x: 0.1, y: 0.1 }}
          style={styles.gloss}
          pointerEvents="none"
        />

        {/* CONTENT */}
        <View style={styles.container}>
          <Image
            source={require("../assets/Logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>Continue to the app by</Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.btnOuter}
              activeOpacity={0.9}
              onPress={() => go("SignUpEmail")}
            >
              <View style={styles.btnInner}>
                <Text style={styles.btnText}>By Email</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnOuter}
              activeOpacity={0.9}
              onPress={() => go("SignUpPhone")}
            >
              <View style={styles.btnInner}>
                <Text style={styles.btnText}>By Phone Number</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnOuter}
              activeOpacity={0.9}
              onPress={() => go("GoogleAuth")}
            >
              <View style={styles.btnInner}>
                <Text style={styles.btnText}>By Google</Text>
              </View>
            </TouchableOpacity>
          </View>

          <Text style={styles.copyright}>©2025 STARK-CARD</Text>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "#06122A", borderRadius: 1, overflow: "hidden" },
  safe: { flex: 1 },

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  logo: {
    width: 350,
    height: 250,
    marginBottom: 10,
  },
  title: {
    fontWeight: "700",
    fontSize: 24,
    lineHeight: 32,
    color: "#FFFFFF",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 4,
    marginBottom: 30,
  },

  actions: {
    width: "100%",
    maxWidth: 350,
    marginBottom: 50,
  },
  btnOuter: {
    width: "100%",
    height: 60,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.28)",
    justifyContent: "center",
    padding: 9,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  btnInner: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

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

  // overlays
  cyanGlow: {
    position: "absolute",
    left: "35%",
    right: -60,
    top: "25%",
    bottom: "25%",
    borderRadius: 160,
    transform: [{ scaleX: 1.2 }],
  },
  gloss: {
    position: "absolute",
    width: "170%",
    height: "70%",
    top: -80,
    left: -60,
    transform: [{ rotate: "-17deg" }],
    borderRadius: 40,
  },
});
