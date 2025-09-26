// src/screens/Products.js
import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  TextInput,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
  I18nManager,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Screenn from "../ui/Screenn";
import NavBar from "../ui/NavBar";
import { setAppLanguage } from "../utils/lang";

// ---- palette (same as Home)
const COLOR = {
  primary: "#0B63D8",
  text: "#0E1B3B",
  muted: "#7C8DA6",
  bgSoft: "#F3F7FB",
  line: "#E4ECF2",
  white: "#FFFFFF",
};

const BASE_W = 390, BASE_H = 844;
const MAX_W = 480;

// Minimal inline strings (no extra deps)
const STRINGS = {
  en: {
    productsFor: "Products Page for",
    defaultProductsTitle: "Games",
    search: "Search",
    notificationsAlt: "Notifications",
    profileAlt: "Profile",
  },
  ar: {
    productsFor: "صفحة المنتجات لـ",
    defaultProductsTitle: "الألعاب",
    search: "بحث",
    notificationsAlt: "الإشعارات",
    profileAlt: "الملف الشخصي",
  },
};

export default function Products({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { width: W, height: H } = useWindowDimensions();
  const sx = (n) => (W / BASE_W) * n;
  const sy = (n) => (H / BASE_H) * n;
  const RADIUS = sx(20);

  const NAV_HEIGHT = sy(64);
  const NAV_BOTTOM_OFFSET = 0;

  const headerTop = useMemo(() => insets.top + sy(8), [insets.top, H]);
  const contentPadBottom = useMemo(
    () => NAV_HEIGHT + insets.bottom + sy(12),
    [NAV_HEIGHT, insets.bottom, H]
  );

  const [currency, setCurrency] = useState("USD");
  const [flag, setFlag] = useState(require("../assets/flags/us.png"));
  const [search, setSearch] = useState("");

  // pick language literals by RTL
  const L = I18nManager.isRTL ? STRINGS.ar : STRINGS.en;

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

  const handleCurrency = async (opt) => {
    setCurrency(opt);
    if (opt === "SYR") {
      setFlag(require("../assets/flags/sy.png"));
      await setAppLanguage("ar"); // your existing RTL switch/reload
    } else {
      setFlag(require("../assets/flags/us.png"));
      await setAppLanguage("en");
    }
  };

  // demo products — replace with your real data
  const { sectionId, title } = route.params ?? {};
  const PRODUCTS = [
    { id: "Product1", name: "Product1", price: 0.66 },
    { id: "Product2", name: "Product2", price: 0.66 },
    { id: "Product3", name: "Product3", price: 0.66 },
    { id: "Product4", name: "Product4", price: 0.66 },
    { id: "Product5", name: "Product5", price: 0.66 },
    { id: "Product6", name: "Product6", price: 0.66 },
    { id: "Product7", name: "Product7", price: 0.66 },
    { id: "Product8", name: "Product8", price: 0.66 },
  ];

  return (
    <Screenn useDefaultBg={false} bgColor={COLOR.white}>
      <ScrollView
        style={{ backgroundColor: COLOR.white }}
        stickyHeaderIndices={[0]}
        contentContainerStyle={{ paddingBottom: contentPadBottom }}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* Sticky header (same look as Home) */}
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
                  onPress={() => navigation.navigate("Notifications")}
                  alt={L.notificationsAlt}
                  sx={sx}
                  sy={sy}
                />
                <IconButton
                  src={require("../assets/icons/user.png")}
                  onPress={() => navigation.navigate("Profile")}
                  alt={L.profileAlt}
                  sx={sx}
                  sy={sy}
                />
              </View>
            </View>
          </View>
          <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: COLOR.line }} />
        </View>

        {/* Title like the screenshot */}
        <View style={{ alignSelf: "center", width: "100%", maxWidth: MAX_W, paddingHorizontal: sx(16), marginTop: sy(10) }}>
          <Text
            style={{
              fontSize: sx(22),
              color: COLOR.text,
              fontWeight: "800",
              textAlign: I18nManager.isRTL ? "right" : "left",
            }}
          >
            {L.productsFor} {title || sectionId || L.defaultProductsTitle}
          </Text>
        </View>

        {/* Search */}
        <View style={{ alignSelf: "center", width: "100%", maxWidth: MAX_W, paddingHorizontal: sx(14), marginTop: sy(8) }}>
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
              placeholder={L.search}
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

        {/* Grid like the mock */}
        <View style={{ alignSelf: "center", width: "100%", maxWidth: MAX_W }}>
          <View style={[styles.grid, { paddingHorizontal: sx(14), marginTop: sy(12), rowGap: sy(18) }]}>
            {PRODUCTS.filter((p) =>
              p.name.toLowerCase().includes(search.trim().toLowerCase())
            ).map((p) => (
              <Pressable
                key={p.id}
                onPress={() =>
                  navigation.navigate("Payment", {
                    productId: p.id,
                    name: p.name,
                    price: p.price,
                  })
                }
                style={({ pressed }) => [
                  styles.card,
                  { width: "48.5%", borderRadius: sx(16) },
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
                <Text style={{ marginTop: sx(8), textAlign: "center", color: COLOR.text }}>
                  {p.name}
                </Text>
              </Pressable>
            ))}
          </View>
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
          backgroundColor: COLOR.white,
          zIndex: 5,
        }}
      />

      <NavBar
        active="home"
        insetBottom={insets.bottom + NAV_BOTTOM_OFFSET}
        onPressHome={() => navigation.navigate("Home")}
        onPressMenu={() => navigation.navigate("Menu")}
        onPressDownloads={() => navigation.navigate("Downloads")}
        onPressQR={() => navigation.navigate("QRScanner")}
        onPressSend={() => navigation.navigate("Send")}
      />
    </Screenn>
  );
}

/* small building blocks (copied from Home style) */
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

/* styles */
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
});
