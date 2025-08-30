// /src/screens/FirstPage.js
import React, { useEffect } from "react";
import {
  SafeAreaView,
  View,
  ImageBackground,
  Image,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function FirstPage({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("SignUp"); // navigate after 5s
    }, 5000);

    return () => clearTimeout(timer); // cleanup
  }, [navigation]);

  return (
    <ImageBackground
      source={require("../assets/bg.png")} // background image
      style={styles.bg}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe}>
        {/* Cyan glow */}
        <LinearGradient
          colors={["rgba(0,200,255,0.0)", "rgba(0,200,255,0.35)", "rgba(0,200,255,0.0)"]}
          start={{ x: 0.2, y: 0.5 }}
          end={{ x: 0.9, y: 0.5 }}
          style={styles.cyanGlow}
        />

        {/* Dark vignette edges */}
        <LinearGradient
          colors={[
            "rgba(0,0,0,0.40)",
            "rgba(0,0,0,0.15)",
            "rgba(0,0,0,0.00)",
            "rgba(0,0,0,0.15)",
            "rgba(0,0,0,0.40)",
          ]}
          locations={[0, 0.18, 0.5, 0.82, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* Glossy diagonal highlight */}
        <LinearGradient
          colors={["rgba(255,255,255,0.22)", "rgba(255,255,255,0.06)", "transparent"]}
          locations={[0, 0.55, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gloss}
          pointerEvents="none"
        />

        {/* Main content */}
        <View style={styles.content}>
          {/* Centered Logo */}
          <Image
            source={require("../assets/Logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          {/* Footer */}
          <Text style={styles.copyright}>©2025 STARK-CARD</Text>

        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: "#06122A",
    borderRadius: 1,
    overflow: "hidden",
  },
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center", // centers vertically
    alignItems: "center", // centers horizontally
    paddingBottom: Platform.select({ ios: 24, android: 20 }),
  },
  logo: {
    width: 350,
    height: 900,
    marginBottom: 30, // push it slightly above footer
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
  opacity: 0.80,
},

});
