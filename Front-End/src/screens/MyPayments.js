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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Screenn from "../ui/Screenn";
import NavBar from "../ui/NavBar";

const BASE_W = 390,
  BASE_H = 844;
const LINE = "#E4ECF2";
const ROW_BG = "#E6F6FF";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function MyPayments({ navigation }) {
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

  // demo data
  const [items, setItems] = useState(
    Array.from({ length: 7 }).map((_, i) => ({
      id: "p" + (i + 1),
      method: "payment way",
      status: "Accepted",
      total: (12.5 + i).toFixed(2),
      value: (0.66).toFixed(2),
      date: new Date(Date.now() - i * 864e5).toLocaleDateString(),
      processId: String(100040 + i),
      open: i === 3, // one open by default
    }))
  );

  const toggle = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, open: !x.open } : x)));
  };

  return (
    <Screenn bgColor="#fff" useDefaultBg={false}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: contentPadBottom,
          paddingHorizontal: sx(14),
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={{ paddingTop: headerTop, paddingBottom: sy(30) }}>
          <Text style={{ fontSize: sx(35), fontWeight: "800", color: "#000a52ff" }}>
            My Payments
          </Text>
        </View>

        {/* Rows */}
        <View style={{ gap: sy(10) }}>
          {items.map((it) => (
            <View key={it.id} style={[styles.card, { borderRadius: sx(12) }]}>
              <Pressable
                onPress={() => toggle(it.id)}
                style={[
                  styles.row,
                  {
                    paddingVertical: sy(12),
                    paddingHorizontal: sx(12),
                    borderRadius: sx(12),
                  },
                ]}
              >
                <Text style={{ fontWeight: "500", fontSize: sx(25), color: "#0E1B3B" }}>
                  {it.method}
                </Text>

                <View style={{ flex: 1 }} />

                {/* status pill */}
                <View style={[styles.pill, { height: sy(26), borderRadius: sy(13) }]}>
                  <Text style={{ fontSize: sx(18), fontWeight: "700", color: "#0E1B3B" }}>
                    {it.status}
                  </Text>
                  <Text style={{ marginLeft: 6, fontSize: sx(13) }}>✅</Text>
                </View>

                {/* chevron */}
                <Text
                  style={{
                    marginLeft: sx(8),
                    fontSize: sx(35),
                    color: "#0E1B3B",
                    transform: [{ rotate: it.open ? "180deg" : "0deg" }],
                  }}
                >
                  ▾
                </Text>
              </Pressable>

              {/* details */}
              {it.open && (
                <View
                  style={{
                    marginTop: sy(8),
                    backgroundColor: "rgba(0,0,0,0.02)",
                    borderWidth: 1,
                    borderColor: LINE,
                    borderRadius: sx(12),
                    padding: sx(12),
                  }}
                >
                  <Detail label="Process ID" value={it.processId} sx={sx} />
                  <Detail label="Total" value={it.total} sx={sx} />
                  <Detail label="Value" value={it.value} sx={sx} />
                  <Detail label="Date" value={it.date} sx={sx} />
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* cover behind navbar */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: insets.bottom + NAV_HEIGHT + NAV_BOTTOM_OFFSET + sy(6),
          backgroundColor: "#fff",
          zIndex: 5,
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

function Detail({ label, value, sx }) {
  return (
    <View style={{ flexDirection: "row", marginVertical: sx(4) }}>
      <Text style={{ width: "30%", color: "#0E1B3B", opacity: 0.8, fontSize: sx(16) }}>
        {label}:
      </Text>
      <Text style={{ flex: 1, color: "#0E1B3B", fontWeight: "700", fontSize: sx(15) }}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
  },
  row: {
    backgroundColor: ROW_BG,
    borderWidth: 1,
    borderColor: LINE,
    flexDirection: "row",
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    backgroundColor: "#DFF5E9",
    borderWidth: 1,
    borderColor: "#BFEBD3",
  },
});
