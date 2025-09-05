// src/screens/FirstPage.js
import React, { useEffect, useRef } from "react";
import { View, Image, Text, StyleSheet, Pressable } from "react-native";
import Screen from "../ui/Screen";
import theme from "../ui/Theme";
import { sx, sy, sp } from "../ui/scale";

export default function FirstPage({ navigation }) {
  const fired = useRef(false);
  const timerRef = useRef(null);

  const go = () => {
    if (fired.current) return;
    fired.current = true;
    navigation.replace("SignUp");
  };

  useEffect(() => {
    timerRef.current = setTimeout(go, 3000);
    return () => timerRef.current && clearTimeout(timerRef.current);
  }, []);

  return (
    <Screen>
      <Pressable style={styles.flex} onPress={go}>
        <View style={styles.center}>
          <Image source={require("../assets/Logo.png")} style={styles.logo} resizeMode="contain" />
        </View>

        <Text style={styles.tap}>Tap to skip</Text>
        <Text style={styles.footer}>©2025 STARK-CARD</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  logo: { width: sx(380), height: sy(331) },
  tap: { textAlign: "center", color: "rgba(255,255,255,0.7)", marginBottom: sy(8), fontSize: sp(12) },
  footer: { textAlign: "center", color: theme.colors.textPrimary, opacity: 0.8, fontSize: theme.typography.footer.fontSize },
});
