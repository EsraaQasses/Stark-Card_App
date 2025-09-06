// src/screens/Notifications.js
import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  useWindowDimensions,
  I18nManager,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BASE_W = 390, BASE_H = 844;

const COLOR = {
  bg: "#FFFFFF",
  card: "#F7F8FA",
  text: "#0E1B3B",
  sub: "#5C6B8A",
  blue: "#0B63D8",
  blueSoft: "#E6EFFD",
  danger: "#E94560",
  border: "#E9EDF4",
  chip: "#EEF2F8",
  unreadDot: "#2BD576",
  shadow: "rgba(14,27,59,0.06)",
};

const INITIAL = [
  {
    id: "n1",
    title: "Payment received",
    body: "You got $120 from Ahmad for order #3912.",
    ts: Date.now() - 1000 * 60 * 8,
    type: "system",
    read: false,
  },
  {
    id: "n2",
    title: "Order packed",
    body: "Order #3913 is ready for shipment.",
    ts: Date.now() - 1000 * 60 * 60 * 3,
    type: "general",
    read: false,
  },
  {
    id: "n3",
    title: "Update available",
    body: "Version 1.2.4 is ready. Tap to learn what’s new.",
    ts: Date.now() - 1000 * 60 * 60 * 26,
    type: "system",
    read: true,
  },
];

export default function Notifications({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width: W, height: H } = useWindowDimensions();
  const sx = (n) => (W / BASE_W) * n;
  const sy = (n) => (H / BASE_H) * n;
  const RTL = I18nManager.isRTL;

  const [items, setItems] = useState(INITIAL);
  const [filter, setFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    switch (filter) {
      case "unread": return items.filter((x) => !x.read);
      case "system": return items.filter((x) => x.type === "system");
      default: return items;
    }
  }, [items, filter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setItems((prev) => [
        {
          id: "n" + (prev.length + 1),
          title: "Welcome 👋",
          body: "Thanks for checking notifications!",
          ts: Date.now(),
          type: "general",
          read: false,
        },
        ...prev,
      ]);
      setRefreshing(false);
    }, 900);
  }, []);

  const toggleRead = (id) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));

  const removeItem = (id) =>
    setItems((prev) => prev.filter((n) => n.id !== id));

  const markAllRead = () =>
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));

  const timeAgo = (ts) => {
    const diff = Math.max(1, Math.floor((Date.now() - ts) / 1000));
    if (diff < 60) return `${diff}s`;
    const m = Math.floor(diff / 60);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    const d = Math.floor(h / 24);
    return `${d}d`;
  };

  const labelFromType = (t) => (t === "system" ? "System" : "General");

  const renderItem = ({ item }) => (
    <Pressable
      onPress={() => toggleRead(item.id)}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${item.read ? "read" : "unread"}`}
      style={({ pressed }) => [
        styles.card,
        {
          flexDirection: RTL ? "row-reverse" : "row",
          opacity: pressed ? 0.85 : 1,
          backgroundColor: item.read ? COLOR.card : COLOR.blueSoft,
          borderColor: item.read ? COLOR.border : COLOR.blue,
        },
      ]}
    >
      {/* Left: unread dot / bell */}
      <View style={[styles.left, { marginStart: RTL ? 0 : sx(12), marginEnd: RTL ? sx(12) : 0 }]}>
        {item.read ? (
          <Text style={{ fontSize: sx(20), color: COLOR.blue }} accessibilityElementsHidden>
            🔔
          </Text>
        ) : (
          <View style={styles.dot} />
        )}
      </View>

      {/* Body */}
      <View style={{ flex: 1, gap: sy(4) }}>
        <Text numberOfLines={1} style={styles.title}>{item.title}</Text>
        <Text numberOfLines={2} style={styles.body}>{item.body}</Text>
        <View style={[styles.metaRow, { flexDirection: RTL ? "row-reverse" : "row" }]}>
          <View style={[styles.badge, item.type === "system" ? styles.badgeSystem : styles.badgeGeneral]}>
            <Text style={styles.badgeText}>{labelFromType(item.type)}</Text>
          </View>
          <Text style={styles.time}>{timeAgo(item.ts)}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={[styles.actions, { alignItems: RTL ? "flex-start" : "flex-end" }]}>
        <Pressable onPress={() => toggleRead(item.id)} hitSlop={10}>
          <Text style={[styles.link, { color: item.read ? COLOR.blue : COLOR.text }]}>
            {item.read ? "Mark unread" : "Mark read"}
          </Text>
        </Pressable>
        <Pressable onPress={() => removeItem(item.id)} hitSlop={10} style={{ marginTop: sy(6) }}>
          <Text style={[styles.link, { color: COLOR.danger }]}>Delete</Text>
        </Pressable>
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top + sy(6) }]}>
      {/* Header */}
      <View style={[styles.header, { flexDirection: RTL ? "row-reverse" : "row" }]}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ flex: 1 }} />
        <View style={styles.bellWrap} accessible accessibilityLabel="Notifications">
          <Text style={styles.bell}>🔔</Text>
        </View>
      </View>

      {/* Quick actions row (no Mentions) */}
      <View style={[styles.quickRow, { flexDirection: RTL ? "row-reverse" : "row" }]}>
        <FilterChip label="All" active={filter === "all"} onPress={() => setFilter("all")} />
        <FilterChip label="Unread" active={filter === "unread"} onPress={() => setFilter("unread")} />
        <FilterChip label="System" active={filter === "system"} onPress={() => setFilter("system")} />
        <View style={{ flex: 1 }} />
        <Pressable onPress={markAllRead} hitSlop={10}>
          <Text style={[styles.link, { color: COLOR.blue }]}>Mark all read</Text>
        </Pressable>
      </View>

      {/* Content */}
      {filtered.length === 0 ? (
        <EmptyState onReset={() => setFilter("all")} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(x) => x.id}
          contentContainerStyle={{ padding: sx(16), paddingBottom: insets.bottom + sy(24), gap: sy(10) }}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLOR.blue]}
              tintColor={COLOR.blue}
            />
          }
        />
      )}

      {/* <NavBar navigation={navigation} active="menu" /> */}
    </View>
  );
}

function FilterChip({ label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && { backgroundColor: COLOR.blue, borderColor: COLOR.blue },
        pressed && { opacity: 0.9 },
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
    >
      <Text style={[styles.chipText, active && { color: "#fff" }]}>{label}</Text>
    </Pressable>
  );
}

function EmptyState({ onReset }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyBell}>
        <Text style={{ fontSize: 28, color: COLOR.blue }}>🔔</Text>
      </View>
      <Text style={styles.emptyTitle}>No notifications</Text>
      <Text style={styles.emptySub}>You’re all caught up. New updates will appear here.</Text>
      <Pressable onPress={onReset} style={styles.emptyBtn} hitSlop={10}>
        <Text style={styles.emptyBtnText}>Show all</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLOR.bg },
  header: { paddingHorizontal: 16, paddingBottom: 10, alignItems: "center" },
  headerTitle: { fontSize: 22, fontWeight: "700", color: COLOR.text },
  bellWrap: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLOR.blueSoft,
    alignItems: "center", justifyContent: "center",
  },
  bell: { fontSize: 20, color: COLOR.blue },

  quickRow: { paddingHorizontal: 12, paddingVertical: 8, gap: 8, alignItems: "center" },
  chip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16,
    backgroundColor: COLOR.chip, borderWidth: 1, borderColor: COLOR.border,
  },
  chipText: { fontSize: 13, color: COLOR.text, fontWeight: "600" },

  card: {
    padding: 14, borderRadius: 16, backgroundColor: COLOR.card,
    borderWidth: 1, borderColor: COLOR.border,
    shadowColor: COLOR.shadow, shadowOpacity: 1, shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 }, elevation: 1,
    alignItems: "flex-start", gap: 8,
  },
  left: { width: 24, alignItems: "center", marginTop: 2 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLOR.unreadDot },
  title: { fontSize: 15.5, fontWeight: "700", color: COLOR.text },
  body: { fontSize: 13.5, color: COLOR.sub },
  metaRow: { marginTop: 4, alignItems: "center", gap: 10 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  badgeGeneral: { backgroundColor: "#F6F8FF" },
  badgeSystem: { backgroundColor: "#F2F5FF" },
  badgeText: { fontSize: 11, color: COLOR.sub, fontWeight: "600" },
  time: { fontSize: 11, color: COLOR.sub },
  actions: { gap: 6, marginStart: 10 },
  link: { fontSize: 12.5, fontWeight: "700" },

  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  emptyBell: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: COLOR.blueSoft,
    alignItems: "center", justifyContent: "center", marginBottom: 10,
  },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: COLOR.text },
  emptySub: { fontSize: 13.5, color: COLOR.sub, textAlign: "center", marginTop: 6 },
  emptyBtn: { marginTop: 14, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, backgroundColor: COLOR.blue },
  emptyBtnText: { color: "#fff", fontWeight: "700" },
});
