// src/screens/Favorite.jsx
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Platform,
  UIManager,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Screenn from "../ui/Screenn";
import NavBar from "../ui/NavBar";
import { useFavorites } from "../context/FavoritesContext"; // make sure App is wrapped with FavoritesProvider

const BASE_W = 390, BASE_H = 844;
const LINE = "#E4ECF2";
const ROW_BG = "#E6F6FF";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Favorite({ navigation }) {
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

  const { favorites = [], addFavorite, removeFavorite } = useFavorites() || {};

  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(null);

  const filtered = favorites.filter((x) =>
    (x?.name || "").toLowerCase().includes(query.trim().toLowerCase())
  );

  const openPayment = (item) => {
    navigation.navigate("Payment", { product: item });
  };

  return (
    <Screenn bgColor="#fff" useDefaultBg={false}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: contentPadBottom, paddingHorizontal: sx(14) }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={{ paddingTop: headerTop, paddingBottom: sy(16) }}>
          <Text style={{ fontSize: sx(35), fontWeight: "800", color: "#000a52ff" }}>
            Favorite
          </Text>
        </View>

        {/* Search */}
        <View
          style={[
            styles.searchWrap,
            { height: sy(40), borderRadius: sy(20), paddingHorizontal: sx(12), marginBottom: sy(18) },
          ]}
        >
          <Ionicons name="search" size={sx(18)} color="#1D1B20" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search"
            placeholderTextColor="rgba(14,27,59,0.35)"
            style={{ flex: 1, marginLeft: sx(8), color: "#0E1B3B", fontSize: sx(14) }}
          />
        </View>

        {/* Grid */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: sx(12) }}>
          {filtered.map((app) => (
            <Pressable
              key={app.id}
              onPress={() => {
                setActiveId(app.id);
                openPayment(app);
              }}
              onLongPress={() => removeFavorite?.(app.id)}
              style={[
                styles.card,
                {
                  width: (W - sx(14) * 3) / 2,
                  borderRadius: sx(10),
                  borderColor: activeId === app.id ? "#2F8CFF" : LINE,
                },
              ]}
            >
              <View style={{ backgroundColor: "#D0D0D0", height: sy(90) }} />
              <View style={{ paddingVertical: sy(6) }}>
                <Text
                  numberOfLines={1}
                  style={{ textAlign: "center", color: "#0E1B3B", fontSize: sx(13), fontWeight: "600" }}
                >
                  {app.name || "Item"}
                </Text>
              </View>
            </Pressable>
          ))}

          {filtered.length === 0 && (
            <Text style={{ color: "#687189", padding: sx(8) }}>
              {favorites.length ? `No favorites match “${query}”.` : "No favorites yet."}
            </Text>
          )}
        </View>
      </ScrollView>

      {/* white cover behind navbar */}
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
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: ROW_BG,
    borderWidth: 1,
    borderColor: LINE,
  },
  card: {
    overflow: "hidden",
    backgroundColor: "#fff",
    borderWidth: 2,
  },
});
