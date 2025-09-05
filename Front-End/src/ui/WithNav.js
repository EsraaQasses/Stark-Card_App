// src/ui/WithNav.js
import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { sy } from "../utils/scale";
import NavBar from "./NavBar";

export default function WithNav({ children, navigation, active }) {
  const insets = useSafeAreaInsets();
  const NAV_HEIGHT = sy(64), NAV_BOTTOM_OFFSET = sy(10);

  return (
    <View style={{ flex: 1 }}>
      {children}
      <View
        pointerEvents="none"
        style={{
          position: "absolute", left: 0, right: 0, bottom: 0,
          height: insets.bottom + NAV_HEIGHT + NAV_BOTTOM_OFFSET + sy(6),
          backgroundColor: "#fff",
        }}
      />
      <NavBar
        active={active}
        insetBottom={insets.bottom + NAV_BOTTOM_OFFSET}
        onPressHome={() => navigation.navigate("Home")}
        onPressMenu={() => navigation.navigate("Menu")}
        onPressDownloads={() => navigation.navigate("Downloads")}
        onPressQR={() => navigation.navigate("QR")}
        onPressSend={() => navigation.navigate("Send")}
      />
    </View>
  );
}
