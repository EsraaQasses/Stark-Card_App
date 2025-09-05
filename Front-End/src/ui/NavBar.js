// src/ui/NavBar.js
import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import AppIcon from "./AppIcon";

const TINT_ACTIVE = "#2F8CFF";

export default function NavBar({
  active = "home",
  onPressHome,
  onPressSend,
  onPressQR,
  onPressDownloads,
  onPressMenu,
  insetBottom = 0,
}) {
  const Item = ({ k, name, onPress }) => {
    const isActive = k === active;
    return (
      <Pressable
        style={[styles.wrap, isActive ? styles.wrapActive : styles.wrapIdle]}
        onPress={onPress}
        accessibilityLabel={k}
      >
        <AppIcon name={name} size={22} active={isActive} />
      </Pressable>
    );
  };

  return (
    <View style={[styles.bar, { paddingBottom: insetBottom }]}>
      <Item k="menu"       name="menu"       onPress={onPressMenu} />
      <Item k="downloads"  name="downloads"  onPress={onPressDownloads} />
      <Item k="qr"         name="qr"         onPress={onPressQR} />
      <Item k="send"       name="send"       onPress={onPressSend} />
      <Item k="home"       name="home"       onPress={onPressHome} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: 16, right: 16, bottom: 10,
    height: 64, borderRadius: 20, backgroundColor: "#fff",
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16,
    shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 16, zIndex: 20,
  },
  wrap: {
    width: 46, height: 40,
    borderRadius: 10,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2,
  },
  wrapActive: {
    borderColor: TINT_ACTIVE,
    backgroundColor: "rgba(47,140,255,0.08)",
  },
  wrapIdle: {
    borderColor: "rgba(255, 255, 255, 0.08)",
    backgroundColor: "transparent",
  },
});
