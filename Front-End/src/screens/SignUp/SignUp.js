// src/screens/SignUp/SignUp.js
import React from "react";
import { View, ImageBackground, Image, Text, StyleSheet, StatusBar, StyleSheet as RNStyleSheet } from "react-native";
import Botton from "../../ui/Button";
import { sx, sy, sp } from "../../ui/scale";

export default function SignUp({ navigation }) {
  return (
    <View style={styles.root}>
      <ImageBackground
        source={require("../../assets/bg.png")}
        style={RNStyleSheet.absoluteFill}
        imageStyle={styles.bgImage}
        resizeMode="cover"
      />
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <View style={styles.header}>
          <Image source={require("../../assets/Logo.png")} style={styles.logo} resizeMode="contain" />
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>Continue to the app by</Text>

          <Botton title="By Email" onPress={() => navigation.navigate("Email")} width={sx(300)} height={sy(60)} />
          <Botton title="By Phone Number" onPress={() => navigation.navigate("Phone")} width={sx(300)} height={sy(60)} />
          <Botton title="By Google" onPress={() => {}} width={sx(300)} height={sy(60)} />
        </View>

        <Text style={styles.footer}>©2025 STARK-CARD</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#2137fbec" },
  bgImage: { width: "101%", height: "113%" },
  content: { flex: 1, paddingHorizontal: sx(20), paddingTop: sy(24), paddingBottom: sy(24) },
  header: { alignItems: "center", marginTop: sy(24) },
  logo: { width: sx(370), height: sy(250) },
  body: { flex: 1, justifyContent: "center", gap: sy(16) },
  title: { color: "white", fontSize: sp(28), textAlign: "center", marginBottom: sy(25), fontWeight: "600" },
  footer: { textAlign: "center", color: "#cfe8ff", opacity: 0.8, fontSize: sp(12) },
});
