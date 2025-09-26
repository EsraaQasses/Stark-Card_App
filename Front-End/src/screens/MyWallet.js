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
import { Ionicons } from "@expo/vector-icons"; // put at the top

const BASE_W = 390, BASE_H = 844;
const LINE = "#E4ECF2";
const ROW_BG = "#E6F6FF";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function MyWallet({ navigation }) {
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

  // --- demo data (replace with API/admin data)
  const [fromDate] = useState("21/12/2003");
  const [toDate] = useState("21/12/2003");
  const [active, setActive] = useState("all");

  const stats = [
    { key: "current", title: "Current Balance", value: "12.5$", bg: "#00BA00" },
    { key: "purchases", title: "Total Purchases", value: "12.5$", bg: "#DB0004" },
    { key: "received", title: "Recieved", value: "12.5$", bg: "#9C03B7" },
    { key: "depite", title: "Depite Balance", value: "12.5$", bg: "#3D42D9" },
  ];

  const categories = [
    { key: "all", label: "All", count: 55, color: "#00BA00" },
    { key: "orders", label: "Orders", count: 22, color: "#DB0004" },
    { key: "charging", label: "Charging", count: 15, color: "#3B82F6" },
  ];

  const allTx = [
    { id: "t1", title: "Fill Visa", subtitle: "Date and Time", amount: 10.56, type: "out" },
    { id: "t2", title: "payment method", subtitle: "Date and Time", amount: 10.56, type: "in" },
    { id: "t3", title: "Creat Visa", subtitle: "Date and Time", amount: 10.56, type: "out" },
  ];

  const filtered = useMemo(() => {
    if (active === "all") return allTx;
    if (active === "orders") return allTx.filter((t) => /order/i.test(t.title));
    if (active === "charging") return allTx.filter((t) => /charge/i.test(t.title));
    return allTx;
  }, [active]);

  const total = useMemo(
    () => filtered.reduce((s, t) => s + t.amount, 0).toFixed(2),
    [filtered]
  );

  return (
    <Screenn bgColor="#fff" useDefaultBg={false}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: contentPadBottom, paddingHorizontal: sx(14) }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={{ paddingTop: headerTop, paddingBottom: sy(20) }}>
          <Text style={{ fontSize: sx(35), fontWeight: "800", color: "#000a52ff" }}>
            My Wallet
          </Text>
        </View>

        {/* Stat cards (2 x 2) */}
        <View style={{ rowGap: sy(14) }}>
          <View style={{ flexDirection: "row", columnGap: sx(12) }}>
            {stats.slice(0, 2).map((s) => (
              <View key={s.key} style={[styles.stat, { backgroundColor: s.bg, borderRadius: sx(15) }]}>
                <Text style={styles.statTitle}>{s.title}</Text>
                <Text style={styles.statValue}>{s.value}</Text>
              </View>
            ))}
          </View>
          <View style={{ flexDirection: "row", columnGap: sx(12) }}>
            {stats.slice(2, 4).map((s) => (
              <View key={s.key} style={[styles.stat, { backgroundColor: s.bg, borderRadius: sx(15) }]}>
                <Text style={styles.statTitle}>{s.title}</Text>
                <Text style={styles.statValue}>{s.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Search + dates */}
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: sy(18), columnGap: sx(10) }}>
          <View
            style={{
                width: sx(41),
                height: sy(41),
                borderRadius: 999,
                backgroundColor: "#D6F5FF",
                alignItems: "center",
                justifyContent: "center",
            }}
            >
            <Ionicons name="search" size={20} color="#1D1B20" />
            </View>
          <View style={[styles.dateChip, { width: sx(133), height: sy(37), borderRadius: 25 }]}>
            <Text style={styles.dateText}>{fromDate}</Text>
          </View>
          <View style={[styles.dateChip, { width: sx(133), height: sy(37), borderRadius: 25 }]}>
            <Text style={styles.dateText}>{toDate}</Text>
          </View>
        </View>

        {/* Category chips */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: sy(14), gap: sy(8) }}>
          {categories.map((c) => (
            <Pressable
              key={c.key}
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setActive(c.key);
              }}
            >
              <View
                style={[
                  styles.catChip,
                  { borderRadius: 30, paddingHorizontal: sx(12), paddingVertical: sy(6) },
                  active === c.key && { backgroundColor: "#E6F6FF", borderColor: "#BFDFFF" },
                ]}
              >
                <Text style={{ fontSize: sx(14), color: "#0E1B3B", fontWeight: "700" }}>
                  {c.label}
                </Text>
                <View style={[styles.countBadge, { backgroundColor: c.color }]}>
                  <Text style={{ color: "#fff", fontWeight: "800", fontSize: sx(12) }}>{c.count}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Total pill */}
        <View style={{ alignItems: "center", marginTop: sy(12) }}>
          <View
            style={[
              styles.totalPill,
              { borderRadius: 999, paddingHorizontal: sx(12), paddingVertical: sy(6) },
            ]}
          >
            <Text style={{ fontWeight: "800", color: "#0E1B3B" }}>Total: {total}$</Text>
          </View>
        </View>

        {/* Transactions */}
        <View style={{ marginTop: sy(14), gap: sy(10) }}>
          {filtered.map((t) => (
            <View
              key={t.id}
              style={[
                styles.card,
                {
                  borderRadius: sx(12),
                  paddingVertical: sy(10),
                  paddingHorizontal: sx(12),
                  flexDirection: "row",
                  alignItems: "center",
                },
              ]}
            >
              <View
                style={[
                  styles.txIcon,
                  {
                    backgroundColor: t.type === "in" ? "#D3FFD4" : "#FFD2D2",
                    borderColor: t.type === "in" ? "#A6E6C1" : "#FFC7C7",
                  },
                ]}
              >
                <Text style={{ fontSize: sx(14) }}>{t.type === "in" ? "✅" : "↗️"}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: sx(16), color: "#000" }}>{t.title}</Text>
                <Text style={{ fontSize: sx(12), color: "#000" }}>Date and Time</Text>
              </View>

              <Text style={{ fontSize: sx(18), color: "#000", minWidth: sx(64), textAlign: "right" }}>
                {t.amount.toFixed(2)}$
              </Text>
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: ROW_BG,
    borderWidth: 1,
    borderColor: LINE,
  },
  stat: {
    flex: 1,
    height: 131,
    justifyContent: "center",
    alignItems: "center",
  },
  statTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 20,
    textAlign: "center",
  },
  statValue: {
    color: "#FFFFFF",
    fontWeight: "400",
    fontSize: 24,
    marginTop: 6,
  },
  circle: {
    backgroundColor: "#D6F5FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#BDEBFF",
  },
  dateChip: {
    backgroundColor: "#D6F5FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#BDEBFF",
  },
  dateText: {
    color: "#0E1B3B",
    fontWeight: "700",
  },
  catChip: {
    backgroundColor: "#EFEFEF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  totalPill: {
    backgroundColor: "#EEF5FF",
    borderWidth: 1,
    borderColor: "#D7E7FF",
  },
  txIcon: {
    width: 35,
    height: 35,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    borderWidth: 1,
  },
});
