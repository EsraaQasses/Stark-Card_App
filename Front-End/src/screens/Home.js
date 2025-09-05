// /src/screens/Home.js
import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  Dimensions,
  FlatList,
  Animated,
  I18nManager,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useTranslation } from "react-i18next";

import Screenn from "../ui/Screenn";
import CornerSpinner from "../ui/CornerSpinner";
import { setAppLanguage } from "../utils/lang";

const { width: W, height: H } = Dimensions.get("window");
const BASE_W = 390, BASE_H = 844;
const sx = (n) => (W / BASE_W) * n;
const sy = (n) => (H / BASE_H) * n;
const RADIUS = sx(22);

const BANNERS = [{ id: "b1" }, { id: "b2" }, { id: "b3" }];
const GRID = [
  { id: "g1", titleKey: "games" },
  { id: "g2", titleKey: "" },
  { id: "g3", titleKey: "entertainments" },
  { id: "g4", titleKey: "liveApps" },
  { id: "g5", titleKey: "" },
  { id: "g6", titleKey: "" },
];

export default function Home({ navigation }) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const [currency, setCurrency] = useState("USD");
  const [flag, setFlag] = useState(require("../assets/flags/us.png"));
  const [search, setSearch] = useState("");
  const pagerX = useRef(new Animated.Value(0)).current;

  const headerTop = useMemo(() => insets.top + sy(12), [insets.top]);
  const NAV_H = sy(64) + Math.max(insets.bottom, sy(10));

  const handleCurrency = async (opt) => {
    setCurrency(opt);
    if (opt === "SYR") {
      setFlag(require("../assets/flags/sy.png"));
      await setAppLanguage("ar");
    } else {
      setFlag(require("../assets/flags/us.png"));
      await setAppLanguage("en");
    }
  };

  return (
    <Screenn useDefaultBg={false} bgColor="#ffffff">
      {/* corner ornament */}
      <View pointerEvents="none" style={styles.cornerWrap}>
        <CornerSpinner
          size={sx(1500)}
          image={require("../assets/home-corner.png")}
          speedMs={12000}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: NAV_H + sy(24) }}
      >
        {/* frosted header */}
        <View style={[styles.headerWrap, { marginTop: headerTop }]}>
          <BlurView intensity={55} tint="light" style={styles.headerRow}>
            <Pressable
              style={styles.iconBtn}
              accessibilityLabel="profile"
              onPress={() => navigation.navigate("profile")}
            > 
                <Image source={require("../assets/icons/user.png")} style={styles.headerIcon} />
            </Pressable>

            <Pressable style={styles.iconBtn} accessibilityLabel="Notifications">
              <Image source={require("../assets/icons/bell.png")} style={styles.headerIcon} />
            </Pressable>

            <View style={{ flex: 1 }} />

            <View style={styles.currencyWrap}>
              <TogglePill
                options={["USD", "SYR"]}
                value={currency}
                onChange={handleCurrency}
              />
            </View>

            <Image source={flag} style={styles.flag} resizeMode="contain" />
          </BlurView>
        </View>

        {/* banner */}
        <View style={styles.bannerWrap}>
          <FlatList
            data={BANNERS}
            keyExtractor={(it) => it.id}
            horizontal
            pagingEnabled
            removeClippedSubviews
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: pagerX } } }],
              { useNativeDriver: false }
            )}
            renderItem={() => (
              <View style={styles.bannerCard}>
                <LinearGradient
                  colors={["#E8EEF9", "#DCEBFF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              </View>
            )}
          />
        </View>

        {/* dots */}
        <Dots count={BANNERS.length} pagerX={pagerX} />

        {/* glassy search — Figma accurate */}
        <View style={{ paddingHorizontal: sx(16), marginTop: sy(10) }}>
          {/* The ScrollView content is our positioning context.
              We mimic Figma’s 390×50 box and text starting at x=50.
              Since our container has left padding 16, paddingLeft becomes 50-14=36 -> sx(34) approx (we used 34 to account for 16 vs 14). */}
          <BlurView intensity={40} tint="light" style={[styles.searchWrap, { paddingLeft: sx(34) }]}>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={t("search") || "Search"}
              placeholderTextColor="#15025B"
              style={styles.searchInput}
              returnKeyType="search"
              onSubmitEditing={() => {}}
            />
            {/* Right ellipse 41×41 with 24×24 icon */}
            <View style={styles.searchCircle}>
              <Pressable style={styles.searchCircleBtn} onPress={() => {}} accessibilityLabel="Search">
                <Image
                  source={require("../assets/icons/search.png")} // change to .jpg if needed
                  style={{ width: sx(24), height: sx(24) }}
                  resizeMode="contain"
                />
              </Pressable>
            </View>
          </BlurView>
        </View>

        {/* grid */}
        <View style={styles.gridWrap}>
          {GRID.map((c) => (
            <CategoryCard key={c.id} title={c.titleKey ? t(c.titleKey) : ""} />
          ))}
        </View>
      </ScrollView>

      {/* floating bottom bar */}
      <BottomNav insetBottom={insets.bottom} />
    </Screenn>
  );
}

/* ---------- sub components ---------- */

function TogglePill({ options, value, onChange }) {
  return (
    <View style={styles.toggleV2}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={[styles.toggleChip, active && styles.toggleChipActive]}
          >
            <Text style={[styles.toggleChipTxt, active && styles.toggleChipTxtActive]}>
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Dots({ count, pagerX }) {
  const [w] = useState(W);
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: count }).map((_, i) => {
        const input = [(i - 1) * w, i * w, (i + 1) * w];
        const dotW = pagerX.interpolate({
          inputRange: input,
          outputRange: [sx(6), sx(18), sx(6)],
          extrapolate: "clamp",
        });
        const op = pagerX.interpolate({
          inputRange: input,
          outputRange: [0.4, 1, 0.4],
          extrapolate: "clamp",
        });
        return <Animated.View key={i} style={[styles.dot, { width: dotW, opacity: op }]} />;
      })}
    </View>
  );
}

function CategoryCard({ title }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.catCard,
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
      ]}
    >
      <View style={styles.catThumb} />
      {!!title && <Text style={styles.catTitle}>{title}</Text>}
    </Pressable>
  );
}

function BottomNav({ insetBottom = 0 }) {
  const Item = ({ icon, label }) => (
    <Pressable style={styles.navItem} accessibilityLabel={label}>
      <Image source={icon} style={styles.navIcon} />
    </Pressable>
  );
  return (
    <View style={[styles.navBar, { paddingBottom: insetBottom }]}>
      <View style={styles.homeWrap}>
        <Image source={require("../assets/icons/home.png")} style={styles.homeIcon} />
      </View>
      <Item icon={require("../assets/icons/send.png")} label="Send" />
      <Item icon={require("../assets/icons/qr.png")} label="QR" />
      <Item icon={require("../assets/icons/downloads.png")} label="Downloads" />
      <Item icon={require("../assets/icons/menu.png")} label="Menu" />
    </View>
  );
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  cornerWrap: { position: "absolute", top: 0, left: 0, zIndex: 0 },

  headerWrap: { paddingHorizontal: sx(16) },
  headerRow: {
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    alignItems: "center",
    paddingHorizontal: sx(14),
    paddingVertical: sy(8),
    borderRadius: sx(20),
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.35)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(15,23,42,0.06)",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  iconBtn: {
    width: sx(40),
    height: sy(40),
    borderRadius: sx(20),
    alignItems: "center",
    justifyContent: "center",
    marginStart: sx(8),
    backgroundColor: "rgba(244,247,251,0.8)",
  },
  headerIcon: { width: sx(20), height: sy(20), tintColor: "#111827" },
  currencyWrap: { marginStart: sx(10) },
  flag: { width: sx(32), height: sy(22), borderRadius: sx(4), marginStart: sx(8) },

  bannerWrap: { marginTop: sy(12), height: sy(132) },
  bannerCard: {
    width: W,
    paddingHorizontal: sx(16),
    height: "100%",
    justifyContent: "center",
    borderRadius: RADIUS,
    overflow: "hidden",
  },

  dotsRow: {
    marginTop: sy(8),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    height: sy(6),
    borderRadius: sy(3),
    backgroundColor: "#3B82F6",
    marginHorizontal: sx(3),
  },

  /* Search (Figma-style) */
  searchWrap: {
    width: sx(360),               // exact Figma width scaled to device
    height: sy(50),
    borderRadius: sy(25),         // Figma radius 24 -> 25 for crisp scaling
    overflow: "hidden",
    backgroundColor: "#d6f5ffd0",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.10)",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 15 },
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingRight: sx(10),
  },
  searchInput: {
    flex: 1,
    fontSize: sx(20),
    lineHeight: sy(24),
    color: "#15025B",
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  searchCircle: {
  width: sy(41),
  height: sy(41),
  borderRadius: sy(20.5),
  backgroundColor: "rgba(214,245,255,0.55)",   // light aqua tint
  alignItems: "center",
  justifyContent: "center",

  // outer soft shadow (depth)
  shadowColor: "#000",
  shadowOpacity: 0.12,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 3 },

  // subtle border to make it crisp
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: "rgba(0,0,0,0.05)",
},

  searchCircleBtn: {
    width: "100%",
    height: "100%",
    borderRadius: sy(20.5),
    alignItems: "center",
    justifyContent: "center",
  },

  gridWrap: {
    paddingHorizontal: sx(16),
    marginTop: sy(16),
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  catCard: {
    width: (W - sx(16) * 2 - sx(12)) / 2,
    padding: sx(10),
    borderRadius: RADIUS,
    backgroundColor: "#F7FAFF",
    marginBottom: sy(14),
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  catThumb: { height: sy(92), borderRadius: sx(16), backgroundColor: "#D9E3F0" },
  catTitle: {
    marginTop: sx(10),
    fontSize: sx(14),
    fontWeight: "600",
    color: "#15223B",
    textAlign: "center",
  },

  navBar: {
    position: "absolute",
    left: sx(16),
    right: sx(16),
    bottom: sy(10),
    paddingHorizontal: sx(16),
    height: sy(64),
    backgroundColor: "#fff",
    borderRadius: sx(20),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  navItem: { width: sx(56), height: sy(56), alignItems: "center", justifyContent: "center" },
  navIcon: { width: sx(26), height: sy(26), tintColor: "#1F2A44" },
  homeWrap: {
    width: sx(46),
    height: sy(40),
    borderRadius: sx(10),
    borderWidth: 3,
    borderColor: "#2F8CFF",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(47,140,255,0.08)",
  },
  homeIcon: { width: sx(24), height: sy(24), tintColor: "#2F8CFF" },

  toggleV2: {
    flexDirection: "row",
    backgroundColor: "rgba(234,242,254,0.9)",
    padding: sx(3),
    borderRadius: sx(12),
  },
  toggleChip: {
    paddingVertical: sy(6),
    paddingHorizontal: sx(12),
    borderRadius: sx(9),
  },
  toggleChipActive: {
    backgroundColor: "#fff",
    shadowColor: "#3B82F6",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  toggleChipTxt: { fontSize: sx(12.5), color: "#475569" },
  toggleChipTxtActive: { color: "#0B63D8", fontWeight: "700" },
});
