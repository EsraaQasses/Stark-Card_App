import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  ScrollView,
  useWindowDimensions,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import Screenn from "../ui/Screenn";
import NavBar from "../ui/NavBar";

const BASE_W = 390, BASE_H = 844;
const LINE = "#E4ECF2";
const ROW_BG = "#E6F6FF";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function OurAgents({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width: W, height: H } = useWindowDimensions();
  const sx = (n) => (W / BASE_W) * n;
  const sy = (n) => (H / BASE_H) * n;

  const NAV_HEIGHT = sy(64);
  const NAV_BOTTOM_OFFSET = sy(0);

  const headerTop = useMemo(() => insets.top + sy(30), [insets.top, H]);
  const contentPadBottom = useMemo(
    () => NAV_HEIGHT + insets.bottom + sy(12),
    [NAV_HEIGHT, insets.bottom, H]
  );

  const [agents, setAgents] = useState([
    { id: "a1", name: "Agent Name", address: "Agent Address", phone: "+1 555-210-9876", open: false },
    { id: "a2", name: "Agent Name", address: "Agent Address", phone: "+1 555-313-2244", open: true  },
    { id: "a3", name: "Agent Name", address: "Agent Address", phone: "+1 555-888-1122", open: false },
  ]);

  const toggle = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, open: !a.open } : a)));
  };

  const copy = async (text) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied", text);
  };

  return (
    <Screenn bgColor="#fff" useDefaultBg={false}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: contentPadBottom, paddingHorizontal: sx(14) }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={{ paddingTop: headerTop, paddingBottom: sy(16) }}>
          <Text style={{ fontSize: sx(32), fontWeight: "800", color: "#0E1B3B" }}>Our Agents</Text>
        </View>

        {/* Rows */}
        <View style={{ gap: sy(12) }}>
          {agents.map((ag) => (
            <View key={ag.id}>
              <Pressable
                onPress={() => toggle(ag.id)}
                style={[
                  styles.row,
                  {
                    paddingVertical: sy(12),
                    paddingHorizontal: sx(12),
                    borderRadius: sx(12),
                  },
                ]}
              >
                <Text style={styles.leftText}>{ag.name}</Text>
                <View style={{ flex: 1 }} />
                <Text style={styles.rightText}>{ag.address}</Text>
                <Ionicons
                  name={ag.open ? "chevron-down" : "chevron-forward"}
                  size={sx(18)}
                  color="#0E1B3B"
                  style={{ marginLeft: sx(6) }}
                />
              </Pressable>

              {ag.open && (
                <View
                  style={{
                    marginTop: sy(8),
                    backgroundColor: ROW_BG,
                    borderWidth: 2,
                    borderColor: "#2F8CFF",
                    borderRadius: sx(8),
                    padding: sx(12),
                  }}
                >
                  <Text style={styles.detail}>Agent Address</Text>
                  <Text style={[styles.detail, { marginTop: sy(6) }]}>Agent Phone</Text>

                  <Pressable
                    onPress={() => copy(`${ag.address} · ${ag.phone}`)}
                    hitSlop={10}
                    style={{ position: "absolute", right: sx(10), bottom: sy(10) }}
                  >
                    <Ionicons name="copy-outline" size={sx(18)} color="#0E1B3B" />
                  </Pressable>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* bottom cover */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute", left: 0, right: 0, bottom: 0,
          height: insets.bottom + NAV_HEIGHT + NAV_BOTTOM_OFFSET + sy(6),
          backgroundColor: "#fff", zIndex: 5,
        }}
      />

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
  row: {
    backgroundColor: ROW_BG,
    borderWidth: 1,
    borderColor: LINE,
    flexDirection: "row",
    alignItems: "center",
  },
  leftText:  { fontSize: 16, color: "#0E1B3B", fontWeight: "600" },
  rightText: { fontSize: 14, color: "#0E1B3B", opacity: 0.9 },
  detail:    { color: "#0E1B3B", fontSize: 14 },
});
