// src/screens/Menu.js
import React from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  I18nManager,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Screenn from "../ui/Screenn";
import NavBar from "../ui/NavBar";
import Theme from "../ui/Theme";

const { colors } = Theme;
const BASE_W = 390, BASE_H = 844;

export default function Menu({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width: W, height: H } = useWindowDimensions();
  const sx = (n) => (W / BASE_W) * n;
  const sy = (n) => (H / BASE_H) * n;
  const isRTL = I18nManager.isRTL;

  // ✅ fixed: give sy a value
  const NAV_BOTTOM_OFFSET = sy();
  const NAV_HEIGHT = sy(64);

  const confirmLogout = () => {
    Alert.alert(
      "Log out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: () => {
            // go to Login and prevent going back
            navigation.replace("Login");
          },
        },
      ],
      { cancelable: true }
    );
  };

  const ITEMS = [
    { key: "profile",  label: "My Profile",   onPress: () => navigation.navigate("Profile") },
    { key: "payments", label: "My Payments" },
    { key: "wallet",   label: "My Wallet" },
    { key: "orders",   label: "My Orders" },
    { key: "favorite", label: "Favorite" },
    { key: "agents",   label: "Our Agents" },
    { key: "contact",  label: "Contact Us" },
    { key: "logout",   label: "Log Out", danger: true, onPress: confirmLogout },
  ];

  return (
    <Screenn bgColor="#fff" useDefaultBg={false}>
      <View style={{ flex: 1, paddingTop: insets.top + sy(36) }}>
        {/* user pill */}
        <View style={{ paddingHorizontal: sx(14) }}>
          <View
            style={[
              styles.userPill,
              {
                borderRadius: sx(16),
                paddingVertical: sy(10),
                paddingHorizontal: sx(12),
                flexDirection: isRTL ? "row-reverse" : "row",
              },
            ]}
          >
            <View
              style={[
                styles.avatar,
                {
                  width: sy(70),
                  height: sy(70),
                  borderRadius: sy(35),
                  marginEnd: isRTL ? 0 : sx(20),
                  marginStart: isRTL ? sx(20) : 0,
                },
              ]}
            >
              <Image
                source={require("../assets/icons/user.png")}
                style={{ width: sy(35), height: sy(35), tintColor: "#2F8CFF" }}
              />
            </View>
            <Text style={{ fontSize: sx(30), fontWeight: "700", color: "#0E1B3B" }}>
              User Name
            </Text>
          </View>
        </View>

        {/* rows */}
        <View style={{ marginTop: sy(25) }}>
          {ITEMS.map((it, idx) => (
            <View key={it.key}>
              <Pressable
                onPress={it.onPress}
                style={({ pressed }) => [
                  styles.row,
                  {
                    height: sy(60),
                    paddingHorizontal: sx(25),
                    flexDirection: isRTL ? "row-reverse" : "row",
                  },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text
                  style={[
                    styles.chev,
                    { transform: [{ rotate: isRTL ? "180deg" : "0deg" }] },
                  ]}
                >
                  ›
                </Text>
                <Text
                  style={[
                    styles.rowText,
                    { color: it.danger ? "#D32F2F" : "#0E1B3B", fontSize: sx(23) },
                  ]}
                >
                  {it.label}
                </Text>
              </Pressable>

              {idx < ITEMS.length - 1 && (
                <View
                  style={{
                    height: StyleSheet.hairlineWidth,
                    backgroundColor: colors.line,
                    marginHorizontal: sx(18),
                  }}
                />
              )}
            </View>
          ))}
        </View>
      </View>

      {/* white cover like Home */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: insets.bottom + NAV_HEIGHT + NAV_BOTTOM_OFFSET + sy(6),
          backgroundColor: "#fff",
        }}
      />

      {/* the ONLY navbar */}
      <NavBar
        active="menu"
        insetBottom={insets.bottom + NAV_BOTTOM_OFFSET}
        onPressHome={() => navigation.navigate("Home")}
        onPressMenu={() => {}}
        onPressDownloads={() => navigation.navigate("Downloads")}
        onPressQR={() => navigation.navigate("QR")}
        onPressSend={() => navigation.navigate("Send")}
      />
    </Screenn>
  );
}

const styles = StyleSheet.create({
  userPill: {
    backgroundColor: "#E6F3FF",
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
  },
  avatar: {
    backgroundColor: "#EAF3FF",
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    alignItems: "center",
    backgroundColor: "#fff",
    // use slender spacing; divider handles the separation
    paddingVertical: 0,
  },
  chev: {
    width: 16,
    textAlign: "center",
    fontSize: 25,
    color: "#7C8DA6",
    marginHorizontal: 15,
  },
  rowText: { fontWeight: "600",
    margin : 2
   },
});
