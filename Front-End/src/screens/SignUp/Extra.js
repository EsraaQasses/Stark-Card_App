// src/screens/SignUp/Extra.js
import React, { useMemo, useState, useEffect } from "react";
import { View, Image, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import Screen from "../../ui/Screen";
import Button from "../../ui/Button";
import theme from "../../ui/Theme";
import { sx, sy, sp } from "../../ui/scale";
import Select from "../../ui/Select";

/* === Country data (don't remove) === */
const COUNTRY_DATA = {
  Syria:          { currency: "SYP", phoneCode: "+963" },
  USA:            { currency: "USD", phoneCode: "+1"   },
};
const COUNTRY_OPTIONS = Object.keys(COUNTRY_DATA).map((c) => ({
  label: c,
  value: c,
}));
const COUNTRIES = Object.keys(COUNTRY_DATA);

export default function Extra({ navigation, route }) {
  const phoneRequired = route?.params?.phoneRequired === true;

  const [country, setCountry] = useState("Syria");
  const [localPhone, setLocalPhone] = useState("");
  const defaults = useMemo(() => COUNTRY_DATA[country], [country]);
  const [currency, setCurrency] = useState(defaults.currency);

  useEffect(() => setCurrency(defaults.currency), [defaults.currency]);

  const nonEmpty = (s) => s.trim().length > 0;
  const phoneOk = phoneRequired ? nonEmpty(localPhone) : true;
  const canSubmit = nonEmpty(country) && nonEmpty(currency) && phoneOk;

  const onRegister = () => {
    const fullPhone = defaults.phoneCode ? `${defaults.phoneCode} ${localPhone}` : localPhone;
    // TODO submit: { country, currency, phone: fullPhone, phoneRequired }
  };

  return (
    <Screen>
      {/* Logo */}
      <View style={styles.header}>
        <Image source={require("../../assets/Logo.png")} style={styles.logo} resizeMode="contain" />
      </View>

      {/* Form */}
      <View style={styles.form}>
       {/* Country */}
        <Text style={styles.label}>Country</Text>
        <View style={{ marginBottom: sy(12) }}>
          <Select
            value={country}
            options={COUNTRY_OPTIONS}
            onChange={(c) => setCountry(c)}
          />
        </View>
        {/* Currency (readonly) */}
        <Text style={styles.label}>Currency</Text>
        <TextInput
          style={[styles.input, styles.readonly]}
          value={currency}
          editable={false}
          placeholder="Currency"
          placeholderTextColor="rgba(0,0,0,0.5)"
        />

        {/* Phone */}
        <Text style={styles.label}>
          Phone Number {phoneRequired ? <Text style={{ color: "#ffcdcd" }}>*</Text> : null}
        </Text>
        <View style={styles.phoneRow}>
          <View style={styles.prefixBox}>
            <Text style={styles.prefixText}>{defaults.phoneCode || "+___"}</Text>
          </View>
          <TextInput
            style={[styles.input, styles.phoneInput]}
            placeholder={phoneRequired ? "Mandatory" : "Optional"}
            placeholderTextColor="rgba(0,0,0,0.5)"
            keyboardType="phone-pad"
            value={localPhone}
            onChangeText={setLocalPhone}
          />
        </View>

        <Button
          title="Register"
          width={sx(143)}
          height={sy(55)}
          disabled={!canSubmit}
          onPress={() => {
            onRegister();
            navigation.navigate("Login");
          }}
          style={{ marginTop: sy(22), alignSelf: "center", opacity: canSubmit ? 1 : 0.6 }}
        />
      </View>

      {/* Bottom */}
      <View style={styles.bottomBlock}>
        <View style={styles.bottomRow}>
          <View style={styles.line} />
          <Text style={styles.muted}>Already Have an Account?</Text>
          <View style={styles.line} />
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.link}>Log in</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>©2025 STARK-CARD</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", marginTop: sy(10), marginBottom: sy(2) },
  logo: { width: sx(370), height: sy(250) },

  form: { flex: 1, marginTop: sy(15) },

  label: {
    color: theme.colors.textPrimary,
    opacity: 0.9,
    marginBottom: sy(6),
    fontWeight: "600",
    fontSize: sp(14),
  },

  input: {
    height: sy(44),
    borderRadius: sy(25),
    paddingHorizontal: sx(14),
    color: "#000",
    borderWidth: 1,
    borderColor: "rgba(34, 9, 255, 0.35)",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    marginBottom: sy(12),
  },
  readonly: { opacity: 0.9 },

  phoneRow: { flexDirection: "row", gap: sx(8), alignItems: "center" },
  prefixBox: {
    height: sy(44),
    borderRadius: sy(25),
    paddingHorizontal: sx(14),
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: "rgba(34, 9, 255, 0.35)",
    minWidth: sx(90),
    marginBottom: sy(12),
  },
  prefixText: { color: "#000", fontWeight: "700", fontSize: sp(14) },
  phoneInput: { flex: 1 },

  bottomBlock: { alignItems: "center", marginBottom: sy(6) },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: sy(12),
  },
  line: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: "rgba(255,255,255,0.5)" },
  muted: { color: theme.colors.textMuted, fontWeight: "600", marginHorizontal: sx(8), fontSize: sp(12) },
  link: { color: theme.colors.textPrimary, fontWeight: "800", marginTop: sy(10), textAlign: "center", marginBottom: sy(12), fontSize: sp(14) },

  footer: {
    textAlign: "center",
    color: theme.colors.textPrimary,
    opacity: 0.8,
    fontSize: theme.typography.footer.fontSize,
  },
});
