// src/screens/Menu.js
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  I18nManager,
  Alert,
  Linking,
  Platform,
  UIManager,
  LayoutAnimation,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Screenn from "../ui/Screenn";
import NavBar from "../ui/NavBar";
import Theme from "../ui/Theme";

const { colors } = Theme;
const BASE_W = 390, BASE_H = 844;

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Menu({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width: W, height: H } = useWindowDimensions();
  const sx = (n) => (W / BASE_W) * n;
  const sy = (n) => (H / BASE_H) * n;
  const isRTL = I18nManager.isRTL;

  const NAV_BOTTOM_OFFSET = sy(0);
  const NAV_HEIGHT = sy(64);

  const [contactOpen, setContactOpen] = useState(false);

  const confirmLogout = () => {
    Alert.alert(
      "Log out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Log Out", style: "destructive", onPress: () => navigation.replace("Login") },
      ],
      { cancelable: true }
    );
  };

  const openWhatsApp = () => Linking.openURL("https://wa.me/0000000000"); // TODO: real number
  const openTelegram = () => Linking.openURL("https://t.me/your_handle");  // TODO: real handle

  const ITEMS = [
    { key: "profile",  label: "My Profile",   onPress: () => navigation.navigate("Profile") },
    { key: "payments", label: "My Payments",  onPress: () => navigation.navigate("MyPayments") },
    { key: "wallet",   label: "My Wallet",    onPress: () => navigation.navigate("MyWallet") },
    { key: "orders",   label: "My Orders" },
    { key: "favorite", label: "Favorite",     onPress: () => navigation.navigate("Favorite") },
    { key: "agents",   label: "Our Agents",   onPress: () => navigation.navigate("OurAgents") },
    // we will insert Contact Us here (before logout)
    { key: "logout",   label: "Log Out", danger: true, onPress: confirmLogout },
  ];

  const Row = ({ label, onPress, danger, chevronRotate = "0deg" }) => (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={({ pressed }) => [
        styles.row,
        {
          height: sy(60),
          paddingHorizontal: sx(25),
          flexDirection: isRTL ? "row-reverse" : "row",
        },
        pressed && { opacity: 0.85 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text
        style={[
          styles.chev,
          { transform: [{ rotate: chevronRotate }] },
        ]}
      >
        ›
      </Text>
      <Text
        style={[
          styles.rowText,
          { color: danger ? "#D32F2F" : "#0E1B3B", fontSize: sx(23) },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );

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
          {ITEMS.map((it, idx) => {
            // when we hit "logout", inject Contact Us block first, then render logout
            if (it.key === "logout") {
              return (
                <View key="contact-insert">
                  {/* Contact Us header row */}
                  <Row
                    label="Contact Us"
                    onPress={() => {
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                      setContactOpen((s) => !s);
                    }}
                    chevronRotate={
                      contactOpen
                        ? (isRTL ? "0deg" : "90deg")
                        : (isRTL ? "180deg" : "0deg")
                    }
                  />
                  {/* divider under Contact Us header */}
                  <View
                    style={{
                      height: StyleSheet.hairlineWidth,
                      backgroundColor: colors.line,
                      marginHorizontal: sx(18),
                    }}
                  />

                  {/* dropdown content */}
                  {contactOpen && (
                    <View
                      style={{
                        paddingHorizontal: sx(25),
                        paddingVertical: sy(12),
                        flexDirection: "row",
                        gap: sx(12),
                      }}
                    >
                      <Pressable
                        onPress={openWhatsApp}
                        hitSlop={10}
                        style={[
                          styles.contactBtn,
                          { backgroundColor: "#E7FFF0", borderRadius: sx(10) },
                        ]}
                        accessibilityLabel="Open WhatsApp"
                      >
                        <Text style={{ fontSize: sx(18) }}>🟢 WhatsApp</Text>
                      </Pressable>

                      <Pressable
                        onPress={openTelegram}
                        hitSlop={10}
                        style={[
                          styles.contactBtn,
                          { backgroundColor: "#E6F4FF", borderRadius: sx(10) },
                        ]}
                        accessibilityLabel="Open Telegram"
                      >
                        <Text style={{ fontSize: sx(18) }}>📨 Telegram</Text>
                      </Pressable>
                    </View>
                  )}

                  {/* divider above Logout */}
                  <View
                    style={{
                      height: StyleSheet.hairlineWidth,
                      backgroundColor: colors.line,
                      marginHorizontal: sx(18),
                    }}
                  />

                  {/* Logout row */}
                  <Row
                    label={it.label}
                    onPress={it.onPress}
                    danger
                    chevronRotate={isRTL ? "180deg" : "0deg"}
                  />
                </View>
              );
            }

            // normal rows
            return (
              <View key={it.key}>
                <Row
                  label={it.label}
                  onPress={it.onPress}
                  chevronRotate={isRTL ? "180deg" : "0deg"}
                />
                {/* divider under each normal row */}
                <View
                  style={{
                    height: StyleSheet.hairlineWidth,
                    backgroundColor: colors.line,
                    marginHorizontal: sx(18),
                  }}
                />
              </View>
            );
          })}
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

      {/* bottom nav */}
      <NavBar
        active="menu"
        insetBottom={insets.bottom + NAV_BOTTOM_OFFSET}
        onPressHome={() => navigation.navigate("Home")}
        onPressMenu={() => navigation.navigate("Menu")}
        onPressDownloads={() => navigation.navigate("Downloads")}
        onPressQR={() => navigation.navigate("QRScanner")}
        onPressSend={() => {}}
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
    paddingVertical: 0,
  },
  chev: {
    width: 16,
    textAlign: "center",
    fontSize: 25,
    color: "#7C8DA6",
    marginHorizontal: 15,
  },
  rowText: { fontWeight: "600", margin: 2 },
  contactBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
});
