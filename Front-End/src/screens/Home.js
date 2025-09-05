// src/screens/Home.js
import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  useWindowDimensions,
  FlatList,
  Animated,
  I18nManager,
  Text as RNText,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";

import Screenn from "../ui/Screenn";
import CornerSpinner from "../ui/CornerSpinner";
import NavBar from "../ui/NavBar";
import { setAppLanguage } from "../utils/lang";

// ---- palette
const COLOR = {
  primary: "#0B63D8",
  text: "#0E1B3B",
  muted: "#7C8DA6",
  bgSoft: "#F3F7FB",
  line: "#E4ECF2",
  white: "#FFFFFF",
};

// ---- base for responsive scaling
const BASE_W = 390;
const BASE_H = 844;

const BANNERS = [{ id: "b1" }, { id: "b2" }, { id: "b3" }];
const SECTIONS = ["Section 1", "Section 2", "Section 3", "Section 4", "Section 5", "Section 6"];

export default function Home({ navigation }) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  // responsive helpers that update on every render
  const { width: W, height: H } = useWindowDimensions();
  const sx = (n) => (W / BASE_W) * n;
  const sy = (n) => (H / BASE_H) * n;
  const RADIUS = sx(20);

  // keep text boxes stable across devices (ignore OS font scaling)
  if (!RNText.defaultProps) RNText.defaultProps = {};
  RNText.defaultProps.allowFontScaling = false;

  // OPTIONAL: match Android system nav bar to white theme (no weird band below)
  useEffect(() => {
    (async () => {
      if (Platform.OS === "android") {
        try {
          const NavigationBar = await import("expo-navigation-bar");
          await NavigationBar.setBackgroundColorAsync(COLOR.white);
          await NavigationBar.setButtonStyleAsync("dark");
        } catch {}
      }
    })();
  }, []);

  const [currency, setCurrency] = useState("USD");
  const [flag, setFlag] = useState(require("../assets/flags/us.png"));
  const [search, setSearch] = useState("");
  const pagerX = useRef(new Animated.Value(0)).current;
  const [pageWidth, setPageWidth] = useState(W); // banner width (after clamp)

  const headerTop = useMemo(() => insets.top + sy(8), [insets.top, H]);

  // bottom nav sizes
  const NAV_HEIGHT = sy(64);
  const NAV_BOTTOM_OFFSET = sy();

  // content bottom padding so last row is never hidden under nav bar
  const contentPadBottom = useMemo(
    () => NAV_HEIGHT + insets.bottom + sy(12),
    [NAV_HEIGHT, insets.bottom, H]
  );

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

  // max content width (keeps things neat on tablets)
  const MAX_W = 480;

  return (
    <Screenn useDefaultBg={false} bgColor={COLOR.white}>
      {/* Sticky header is the FIRST direct child of the ScrollView */}
      <ScrollView
        style={{ backgroundColor: COLOR.white }}
        stickyHeaderIndices={[0]}
        bounces={false}
        overScrollMode="never"
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: contentPadBottom }}
      >
        {/* HEADER (sticky) */}
        <View style={{ backgroundColor: "transparent" }}>
          <View style={{ alignSelf: "center", width: "100%", maxWidth: MAX_W }}>
            <View style={{ marginTop: headerTop, paddingHorizontal: sx(14) }}>
              <View
                style={[
                  styles.header,
                  { flexDirection: I18nManager.isRTL ? "row-reverse" : "row", borderRadius: RADIUS },
                ]}
              >
                <Image
                  source={flag}
                  style={[styles.flag, { width: sx(30), height: sy(22) }]}
                  resizeMode="contain"
                />

                <Segment options={["SYR", "USD"]} value={currency} onChange={handleCurrency} sx={sx} sy={sy} />

                <View style={{ flex: 1 }} />

                <IconButton
                  src={require("../assets/icons/bell.png")}
                  onPress={() => navigation.navigate("Notifications")} hitSlop={10}
                  alt="Notifications"
                  sx={sx}
                  sy={sy}
                />
                <IconButton
                  src={require("../assets/icons/user.png")}
                  alt="Profile"
                  sx={sx}
                  sy={sy}
                  onPress={() => navigation.navigate("Profile")}
                />
              </View>
            </View>
          </View>
          {/* subtle bottom divider for the sticky header */}
          <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: COLOR.line }} />
        </View>

        {/* Corner spinner background */}
        <View pointerEvents="none" style={styles.spinnerBg}>
          <CornerSpinner
            size={sx(800)}
            image={require("../assets/home-corner.png")}
            speedMs={16000}
            opacity={0.88}
          />
        </View>

        {/* BODY (inside a centered clamp) */}
        <View style={{ alignSelf: "center", width: "100%", maxWidth: MAX_W }}>
          {/* Banner carousel */}
          <View
            style={[styles.bannerWrap, { marginTop: sy(10), paddingHorizontal: sx(14) }]}
            onLayout={(e) => setPageWidth(e.nativeEvent.layout.width)}
          >
            <FlatList
              data={BANNERS}
              keyExtractor={(it) => it.id}
              horizontal
              pagingEnabled
              snapToInterval={pageWidth}
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              bounces={false}
              overScrollMode="never"
              onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: pagerX } } }], {
                useNativeDriver: false,
              })}
              renderItem={() => (
                <View style={[styles.bannerCard, { width: pageWidth, borderRadius: RADIUS }]}>
                  <LinearGradient
                    colors={["#ECF4FF", "#E7F5FF"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                </View>
              )}
            />
          </View>

          <Dots count={BANNERS.length} pagerX={pagerX} pageW={pageWidth} sx={sx} sy={sy} />

          {/* Search */}
          <View style={{ paddingHorizontal: sx(14), marginTop: sy(12) }}>
            <View
              style={[
                styles.search,
                {
                  flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
                  borderRadius: sy(25),
                  height: sy(50),
                },
              ]}
            >
              <View style={[styles.searchIconWrap, { width: sy(34), height: sy(34), borderRadius: sy(17) }]}>
                <Image
                  source={require("../assets/icons/search.png")}
                  style={{ width: sx(18), height: sx(18), tintColor: COLOR.primary }}
                  resizeMode="contain"
                />
              </View>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={t("search") || "Search"}
                placeholderTextColor={COLOR.text}
                style={[
                  styles.searchInput,
                  {
                    textAlign: I18nManager.isRTL ? "right" : "left",
                    fontSize: sx(18),
                    color: COLOR.text,
                  },
                ]}
                returnKeyType="search"
              />
            </View>
          </View>

          {/* 2-column grid */}
          <View style={[styles.grid, { paddingHorizontal: sx(14), marginTop: sy(14), rowGap: sy(14) }]}>
            {SECTIONS.map((label) => (
              <Pressable
                key={label}
                style={({ pressed }) => [
                  styles.card,
                  { width: "48.5%", borderRadius: RADIUS },
                  pressed && { transform: [{ scale: 0.98 }], opacity: 0.95 },
                ]}
              >
                <View
                  style={{
                    width: "100%",
                    aspectRatio: 1,
                    borderRadius: sx(12),
                    backgroundColor: "#E8EFF7",
                    borderWidth: 1,
                    borderColor: COLOR.line,
                  }}
                />
                <Text
                  style={{
                    marginTop: sx(10),
                    textAlign: "center",
                    color: COLOR.text,
                    fontWeight: "800",
                    fontSize: sx(16),
                  }}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* white cover under the nav bar (like before) */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: insets.bottom + NAV_HEIGHT + NAV_BOTTOM_OFFSET + sy(6),
          backgroundColor: COLOR.white,
          zIndex: 5,
        }}
      />

      {/* THE ONLY bottom nav bar (shared component) */}
      <NavBar
        active="home"
        insetBottom={insets.bottom + NAV_BOTTOM_OFFSET}
        onPressHome={() => navigation.navigate("Home")}
        onPressMenu={() => navigation.navigate("Menu")}
        onPressDownloads={() => navigation.navigate("Downloads")}
        onPressQR={() => navigation.navigate("QR")}
        onPressSend={() => navigation.navigate("Send")}
      />
    </Screenn>
  );
}

/* ---------- small building blocks inline ---------- */

function IconButton({ src, onPress, alt, sx, sy }) {
  return (
    <Pressable onPress={onPress} accessibilityLabel={alt} style={[styles.iconBtn, { borderRadius: sx(18) }]}>
      <Image source={src} style={{ width: sx(18), height: sy(18), tintColor: COLOR.text }} />
    </Pressable>
  );
}

function Segment({ options, value, onChange, sx, sy }) {
  return (
    <View style={[styles.segment, { padding: sx(3), borderRadius: sx(10) }]}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={[
              styles.segPill,
              { paddingVertical: sy(6), paddingHorizontal: sx(12), borderRadius: sx(8) },
              active && styles.segPillActive,
            ]}
          >
            <Text style={[styles.segText, active && styles.segTextActive]}>{opt}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Dots({ count, pagerX, pageW, sx, sy }) {
  return (
    <View style={[styles.dotsRow, { marginTop: sy(8) }]}>
      {Array.from({ length: count }).map((_, i) => {
        const input = [(i - 1) * pageW, i * pageW, (i + 1) * pageW];
        const dotW = pagerX.interpolate({
          inputRange: input,
          outputRange: [sx(6), sx(16), sx(6)],
          extrapolate: "clamp",
        });
        const op = pagerX.interpolate({
          inputRange: input,
          outputRange: [0.45, 1, 0.45],
          extrapolate: "clamp",
        });
        return (
          <Animated.View
            key={i}
            style={[styles.dot, { width: dotW, height: sy(6), borderRadius: sy(3), opacity: op }]}
          />
        );
      })}
    </View>
  );
}

/* ---------------- styles ---------------- */
const styles = StyleSheet.create({
  header: {
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLOR.line,
  },
  flag: { borderRadius: 4, marginHorizontal: 8 },

  segment: {
    flexDirection: "row",
    backgroundColor: COLOR.bgSoft,
    borderWidth: 1,
    borderColor: COLOR.line,
  },
  segPill: {},
  segPillActive: {
    backgroundColor: COLOR.white,
    borderWidth: 1,
    borderColor: COLOR.line,
  },
  segText: { color: COLOR.muted, fontWeight: "700" },
  segTextActive: { color: COLOR.primary },

  iconBtn: {
    width: 36,
    height: 36,
    marginStart: 8,
    backgroundColor: COLOR.bgSoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLOR.line,
  },

  bannerWrap: {},
  bannerCard: {
    aspectRatio: 16 / 9,
    justifyContent: "center",
    overflow: "hidden",
  },

  dotsRow: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  dot: { backgroundColor: COLOR.primary, marginHorizontal: 3 },

  search: {
    alignSelf: "stretch",
    backgroundColor: "rgba(235,245,255,0.85)",
    borderWidth: 1,
    borderColor: COLOR.line,
    alignItems: "center",
    paddingHorizontal: 10,
  },
  searchIconWrap: {
    backgroundColor: "#EAF3FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLOR.line,
    marginHorizontal: 6,
  },
  searchInput: { flex: 1 },

  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  card: {
    padding: 10,
    backgroundColor: COLOR.white,
    borderWidth: 1,
    borderColor: COLOR.line,
  },

  // spinner container (kept from your previous setup)
  spinnerBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 0, // it's absolutely positioned; height not needed
  },
});
