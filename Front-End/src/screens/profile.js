// /src/screens/Profile.js
import React, { useState } from "react";
import {
  View, Text, TextInput, Image, Pressable, StyleSheet, Dimensions, I18nManager
} from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Screenn from "../ui/Screenn";

const { width: W, height: H } = Dimensions.get("window");
const BASE_W = 390, BASE_H = 844;
const sx = (n) => (W / BASE_W) * n;
const sy = (n) => (H / BASE_H) * n;

export default function Profile({ navigation }) {
  const insets = useSafeAreaInsets();

  const [first, setFirst] = useState("First");
  const [last, setLast]   = useState("Last");
  const [email, setEmail] = useState("name@gmail.com");
  const [user, setUser]   = useState("Stark");
  const [phone, setPhone] = useState("963999999999");
  const [dark, setDark]   = useState(false);

  return (
    <Screenn useDefaultBg={false} bgColor="#FFFFFF">
      {/* page title (light like your figma) */}
      <Text style={[styles.title, { marginTop: insets.top + sy(6) }]}>My Profile</Text>

      {/* avatar */}
      <View style={styles.avatarWrap}>
        <View style={styles.avatarCircle}>
          <Image
            source={require("../assets/icons/user.png")}
            style={{ width: sx(60), height: sx(60), tintColor: "#3B82F6" }}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* form */}
      <View style={styles.form}>
        <Row>
          <LabeledInput
            label="First Name"
            value={first}
            onChangeText={setFirst}
            placeholder="First"
          />
          <LabeledInput
            label="Last Name"
            value={last}
            onChangeText={setLast}
            placeholder="Last"
          />
        </Row>

        <LabeledInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="name@gmail.com"
        />

        <LabeledInput
          label="User Name"
          value={user}
          onChangeText={setUser}
          autoCapitalize="none"
          placeholder="Stark"
        />

        <LabeledInput
          label="Phone"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="963999999999"
        />

        {/* Dark Mode toggle (figma-like pill with red X) */}
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Dark Mode</Text>
          <Pressable
            onPress={() => setDark(!dark)}
            style={[
              styles.darkToggle,
              dark ? styles.darkToggleOn : styles.darkToggleOff,
            ]}
          >
            <View style={[styles.knob, dark ? styles.knobOn : styles.knobOff]}>
              {/* X icon when off / dot when on */}
              <Text style={{ fontSize: sx(12), color: dark ? "#fff" : "#fff" }}>
                {dark ? "●" : "✕"}
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Save */}
        <Pressable style={styles.saveBtn} onPress={() => { /* TODO: save to API */ }}>
          <Text style={styles.saveTxt}>Save</Text>
        </Pressable>
      </View>

      {/* simple bottom bar (same icons order as figma) */}
      <View style={[styles.navBar, { paddingBottom: insets.bottom }]}>
        <NavIcon
          src={require("../assets/icons/menu.png")}
          onPress={() => navigation.navigate("Menu")}
        />
        <NavIcon src={require("../assets/icons/downloads.png")} />
        <NavIcon src={require("../assets/icons/qr.png")} />
        <NavIcon src={require("../assets/icons/send.png")} />
        <Pressable style={styles.homeWrap} onPress={() => navigation.navigate("Home")}>
          <Image source={require("../assets/icons/home.png")} style={styles.homeIcon} />
        </Pressable>
      </View>
    </Screenn>
  );
}

/* ------- small subcomponents ------- */

function Row({ children }) {
  return <View style={styles.row}>{children}</View>;
}

function LabeledInput({ label, placeholder, ...rest }) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.label}>{label}</Text>
      <BlurView intensity={30} tint="light" style={styles.inputWrap}>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#9CC4D6"
          style={styles.input}
          {...rest}
        />
        <Image
          source={require("../assets/icons/user.png")} // provide this icon
          style={styles.editIcon}
          resizeMode="contain"
        />
      </BlurView>
    </View>
  );
}

function NavIcon({ src, onPress }) {
  return (
    <Pressable style={styles.navItem} onPress={onPress}>
      <Image source={src} style={styles.navIcon} />
    </Pressable>
  );
}

/* ------- styles ------- */
const styles = StyleSheet.create({
  title: {
    fontSize: sx(18),
    color: "rgba(0,0,0,0.18)",
    marginLeft: sx(16),
  },

  avatarWrap: { alignItems: "center", marginTop: sy(24) },
  avatarCircle: {
    width: sx(110), height: sx(110), borderRadius: sx(55),
    borderWidth: 4, borderColor: "#3B82F6",
    alignItems: "center", justifyContent: "center",
    backgroundColor: "#F4F9FF",
  },

  form: { paddingHorizontal: sx(16), marginTop: sy(20) },

  row: {
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    gap: sx(12),
  },

  fieldBlock: { flex: 1, marginTop: sy(14) },
  label: { fontSize: sx(12), color: "#666", marginBottom: sy(6) },

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    height: sy(44),
    borderRadius: sy(22),
    paddingLeft: sx(14), paddingRight: sx(10),
    overflow: "hidden",
    backgroundColor: "rgba(214,245,255,0.7)",
    borderColor: "rgba(0,0,0,0.06)",
    borderWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    fontSize: sx(14),
    color: "#0B2135",
  },
  editIcon: { width: sx(16), height: sx(16), opacity: 0.7 },

  toggleRow: {
    marginTop: sy(16),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleLabel: { fontSize: sx(13), color: "#333" },

  darkToggle: {
    width: sx(56), height: sy(28), borderRadius: sy(14),
    padding: 2, flexDirection: "row", alignItems: "center",
  },
  darkToggleOff: { backgroundColor: "#FF6B6B" }, // red with X
  darkToggleOn:  { backgroundColor: "#2E7CF6", justifyContent: "flex-end" },
  knob: {
    width: sy(24), height: sy(24), borderRadius: sy(12),
    alignItems: "center", justifyContent: "center",
    backgroundColor: "#fff",
  },
  knobOn:  {},
  knobOff: {},

  saveBtn: {
    marginTop: sy(18),
    alignSelf: "center",
    width: sx(180),
    height: sy(44),
    borderRadius: sy(22),
    backgroundColor: "#2E7CF6",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
  },
  saveTxt: { color: "#fff", fontWeight: "700", fontSize: sx(16) },

  /* bottom nav (matches your style) */
  navBar: {
    position: "absolute",
    left: sx(16), right: sx(16), bottom: sy(10),
    height: sy(64), borderRadius: sx(20), backgroundColor: "#fff",
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: sx(16),
    shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 18, shadowOffset: { width: 0, height: 10 },
  },
  navItem: { width: sx(56), height: sy(56), alignItems: "center", justifyContent: "center" },
  navIcon: { width: sx(26), height: sx(26), tintColor: "#1F2A44" },
  homeWrap: {
    width: sx(46), height: sy(40), borderRadius: sx(10),
    borderWidth: 3, borderColor: "#2F8CFF",
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(47,140,255,0.08)",
  },
  homeIcon: { width: sx(24), height: sx(24), tintColor: "#2F8CFF" },
});
