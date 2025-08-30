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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import TextField from "../ui/TextField";
import Select from "../ui/Select";

const COUNTRIES = [
  { label: "Syria", value: "SY" },
  { label: "United Arab Emirates", value: "AE" },
  { label: "Saudi Arabia", value: "SA" },
  { label: "Lebanon", value: "LB" },
  { label: "Turkey", value: "TR" },
];
const CURRENCIES = [
  { label: "SYP — Syrian Pound", value: "SYP" },
  { label: "USD — US Dollar", value: "USD" },
  { label: "AED — UAE Dirham", value: "AED" },
  { label: "SAR — Saudi Riyal", value: "SAR" },
  { label: "TRY — Turkish Lira", value: "TRY" },
];

export default function SignUpPhone({ route, navigation }) {
  const seed = route?.params?.seed || {};
  const [country, setCountry] = useState("SY");
  const [currency, setCurrency] = useState("SYP");
  const [phone, setPhone] = useState("");

  const cc = useMemo(() => {
    // simple mapping; feel free to expand
    const map = { SY: "+963", AE: "+971", SA: "+966", LB: "+961", TR: "+90" };
    return map[country] || "+963";
  }, [country]);

  const onRegister = () => {
    const payload = { ...seed, country, currency, phone: phone ? `${cc}${phone}` : "" };
    // TODO: call your API with payload
    // For now, go to the next step or home
    navigation.replace("Home", { user: payload });
  };

  return (
    <ImageBackground
      source={require("../assets/bg.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe}>
        <LinearGradient
          colors={["rgba(0,200,255,0)", "rgba(0,200,255,0.35)", "rgba(0,200,255,0)"]}
          start={{ x: 0.2, y: 0.5 }}
          end={{ x: 0.9, y: 0.5 }}
          style={styles.cyanGlow}
          pointerEvents="none"
        />
        <LinearGradient
          colors={["rgba(255,255,255,0.25)", "rgba(255,255,255,0)"]}
          start={{ x: 0.1, y: 0.1 }}
          end={{ x: 0.6, y: 0.6 }}
          style={styles.cornerBloom}
          pointerEvents="none"
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
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
            <Select
              label="Country"
              value={country}
              options={COUNTRIES}
              onChange={setCountry}
            />
            <Select
              label="Currency"
              value={currency}
              options={CURRENCIES}
              onChange={setCurrency}
            />

            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.phoneRow}>
              <View style={styles.codePill}>
                <Text style={styles.codeText}>{cc}</Text>
              </View>
              <TextField
                containerStyle={{ flex: 1, marginLeft: 10 }}
                placeholder="optional"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                noLabel
              />
            </View>
          </View>

          {/* CTA */}
          <View style={styles.ctaWrap}>
            <TouchableOpacity activeOpacity={0.9} onPress={onRegister}>
              <LinearGradient
                colors={["#1D5DF6", "#0C2D7A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Register</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.orRow}>
              <View style={styles.hr} />
              <Text style={styles.or}>Already Have an Account?</Text>
              <View style={styles.hr} />
            </View>

            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.footerLink}>Log in</Text>
            </TouchableOpacity>

            <Text style={styles.copyright}>©2025 STARK-CARD</Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "#06122A", borderRadius: 1, overflow: "hidden" },
  safe: { flex: 1 },
  cyanGlow: {
    position: "absolute", left: -40, right: -40, top: "35%", height: 140,
    opacity: 0.6,
  },
  cornerBloom: {
    position: "absolute", left: -60, top: -40, width: 220, height: 220, borderRadius: 200,
  },
  header: { alignItems: "center", paddingTop: 12 },
  logo: {
    width: 350,
    height: 230,
    marginBottom: 0,
  },
  form: { gap: 14, paddingHorizontal: 22, marginTop: 24 },
  label: { color: "#fff", marginLeft: 6, marginBottom: 6, fontWeight: "700" },
  phoneRow: { flexDirection: "row", alignItems: "center" },
  codePill: {
    paddingHorizontal: 12, height: 46, minWidth: 72,
    borderRadius: 24, backgroundColor: "rgba(255,255,255,0.92)",
    justifyContent: "center", alignItems: "center",
  },
  codeText: { fontWeight: "700", color: "#001433" },
  ctaWrap: { marginTop: 28, alignItems: "center", paddingHorizontal: 22, flex: 1 },
  button: {
    width: 180, height: 48, borderRadius: 26, justifyContent: "center", alignItems: "center",
    shadowColor: "#001842", shadowOpacity: 0.45, shadowRadius: 12, shadowOffset: { width: 0, height: 8 },
    elevation: 7,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 18, letterSpacing: 0.2 },
  orRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 18 },
  hr: { height: 1, width: 180, backgroundColor: "rgba(255,255,255,0.7)" },
  or: { color: "#fff", fontWeight: "700" },
  footerLink: { color: "#ffffff", fontWeight: "700", marginTop: 8, textDecorationLine: "underline" },
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
  },});
