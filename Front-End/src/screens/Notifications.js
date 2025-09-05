// src/screens/Notifications.js
import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  Pressable,
  StyleSheet,
  I18nManager,
  useWindowDimensions,
  Platform,
  ActionSheetIOS,
  Animated,
  PanResponder,
  RefreshControl,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Screenn from "../ui/Screenn";
import NavBar from "../ui/NavBar";

const COLOR = {
  white: "#FFFFFF",
  text: "#0E1B3B",
  muted: "#7C8DA6",
  line: "rgba(0,0,0,0.13)",
  titleBg: "#D6F5FF",
  chipBg: "#C8CEFB",
  blue: "#2F8CFF",
  danger: "#EF4444",
  success: "#10B981",
};

const BASE_W = 390, BASE_H = 844;

const SEED = [
  { id: "1", title: "Payment Received", details: "You received 50 USD.", date: "12:30", unread: true },
  { id: "2", title: "Bill Reminder",   details: "Electricity due tomorrow.", date: "09:15", unread: true },
  { id: "3", title: "Wallet Update",    details: "Balance increased by 100.", date: "Yesterday", unread: false },
  { id: "4", title: "Promo",            details: "New offer available.", date: "Mon", unread: false },
];

export default function Notifications({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width: W, height: H } = useWindowDimensions();
  const sx = (n) => (W / BASE_W) * n;
  const sy = (n) => (H / BASE_H) * n;
  const RTL = I18nManager.isRTL;

  const NAV_HEIGHT = sy(64);
  const NAV_BOTTOM_OFFSET = sy();

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState(
    SEED.map((x) => ({ ...x, _expanded: false }))
  );
  const [tab, setTab] = useState("all"); // "all" | "unread"

  const unreadCount = useMemo(() => items.filter((x) => x.unread).length, [items]);

  const filtered = useMemo(() => {
    if (tab === "unread") return items.filter((x) => x.unread);
    return items;
  }, [items, tab]);

  const onRefresh = async () => {
    setLoading(true);
    // TODO: replace with your backend call
    setTimeout(() => setLoading(false), 600);
  };

  const markAllRead = () =>
    setItems((arr) => arr.map((x) => ({ ...x, unread: false })));

  const deleteAllRead = () =>
    setItems((arr) => arr.filter((x) => x.unread));

  const openRowMenu = (item) => {
    const options = ["Cancel", item.unread ? "Mark as read" : "Mark as unread", "Delete"];
    const cb = (idx) => {
      if (idx === 1) toggleRead(item.id);
      if (idx === 2) removeItem(item.id);
    };
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: 0, destructiveButtonIndex: 2, userInterfaceStyle: "light" },
        cb
      );
    } else {
      // simple Android fallback: small modal with the two actions
      setSheet({ type: "row", item });
    }
  };

  const [sheet, setSheet] = useState(null); // { type: "row" | null, item }

  const toggleExpand = (id) =>
    setItems((arr) => arr.map((x) => (x.id === id ? { ...x, _expanded: !x._expanded } : x)));

  const toggleRead = (id) =>
    setItems((arr) => arr.map((x) => (x.id === id ? { ...x, unread: !x.unread } : x)));

  const removeItem = (id) =>
    setItems((arr) => arr.filter((x) => x.id !== id));

  const renderItem = ({ item }) => (
    <SwipeableRow
      sx={sx}
      sy={sy}
      RTL={RTL}
      onRead={() => toggleRead(item.id)}
      onDelete={() => removeItem(item.id)}
    >
      <Pressable
        onPress={() => toggleExpand(item.id)}
        onLongPress={() => openRowMenu(item)}
        android_ripple={{ color: "rgba(0,0,0,0.05)" }}
        style={{ paddingVertical: sy(8) }}
      >
        <Row sx={sx} sy={sy} RTL={RTL} data={item} />
      </Pressable>

      {/* divider (thin line like Arrow 13/15/17/19) */}
      <View
        style={{
          marginTop: sy(10),
          height: 0,
          borderBottomWidth: 2,
          borderBottomColor: COLOR.line,
          width: "96%",
          alignSelf: RTL ? "flex-end" : "flex-start",
        }}
      />
    </SwipeableRow>
  );

  return (
    <Screenn bgColor={COLOR.white}>
      <View style={{ flex: 1, paddingTop: insets.top + sy(10) }}>
        {/* Title pill (Rectangle 23) with actions */}
        <View
          style={{
            marginTop: sy(10),
            marginHorizontal: sx(18),
            height: sy(71),
            backgroundColor: COLOR.titleBg,
            borderRadius: sx(30),
            flexDirection: RTL ? "row-reverse" : "row",
            alignItems: "center",
            paddingHorizontal: sx(16),
          }}
        >
          <Text style={{ flex: 1, textAlign: "center", fontSize: sx(26), fontWeight: "600", color: COLOR.text }}>
            Notifications
          </Text>

          {/* Blue bell with badge + mark-all button behavior */}
          <Pressable
            onPress={markAllRead}
            hitSlop={10}
            style={{ width: sx(46), height: sx(46), borderRadius: sx(23), alignItems: "center", justifyContent: "center" }}
          >
            <Image
              source={require("../assets/icons/bell.png")}
              style={{ width: sx(22), height: sx(22), tintColor: COLOR.blue }}
              resizeMode="contain"
            />
            {unreadCount > 0 && (
              <View
                style={{
                  position: "absolute",
                  top: sy(6),
                  right: RTL ? undefined : sx(6),
                  left: RTL ? sx(6) : undefined,
                  minWidth: sx(18),
                  height: sx(18),
                  borderRadius: sx(9),
                  paddingHorizontal: sx(4),
                  backgroundColor: "#E11D48",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#fff", fontSize: sx(10), fontWeight: "700" }}>{unreadCount}</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Filter chips (Read / Unread) with counts */}
        <View
          style={{
            flexDirection: RTL ? "row-reverse" : "row",
            gap: sx(12),
            marginTop: sy(12),
            paddingHorizontal: sx(40),
          }}
        >
          <Chip
            label={`All (${items.length})`}
            active={tab === "all"}
            onPress={() => setTab("all")}
            sx={sx}
          />
          <Chip
            label={`Unread (${unreadCount})`}
            active={tab === "unread"}
            onPress={() => setTab("unread")}
            sx={sx}
          />
          {/* quick clean-up for read items */}
          <Pressable
            onPress={deleteAllRead}
            style={{
              marginStart: "auto",
              backgroundColor: "rgba(239,68,68,0.08)",
              borderWidth: 1,
              borderColor: "rgba(239,68,68,0.25)",
              borderRadius: sx(50),
              paddingVertical: sy(6),
              paddingHorizontal: sx(12),
            }}
          >
            <Text style={{ color: COLOR.danger, fontSize: sx(12), fontWeight: "700" }}>Clear read</Text>
          </Pressable>
        </View>

        {/* List */}
        <FlatList
          style={{ marginTop: sy(8) }}
          contentContainerStyle={{ paddingHorizontal: sx(23), paddingBottom: insets.bottom + sy(110) }}
          data={filtered}
          keyExtractor={(it) => String(it.id)}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: sy(40) }}>
              <Text style={{ color: COLOR.muted }}>
                {tab === "unread" ? "No unread notifications" : "No notifications"}
              </Text>
            </View>
          }
        />
      </View>

      {/* Android fallback sheet for row actions */}
      <Modal visible={!!sheet} transparent animationType="fade" onRequestClose={() => setSheet(null)}>
        <View style={styles.backdrop}>
          <View style={[styles.sheet, { width: W - sx(40), borderRadius: sx(14) }]}>
            <Pressable style={styles.sheetItem} onPress={() => setSheet(null)}>
              <Text style={{ fontWeight: "700" }}>Cancel</Text>
            </Pressable>
            <View style={styles.sheetDivider} />
            <Pressable
              style={styles.sheetItem}
              onPress={() => {
                toggleRead(sheet?.item?.id);
                setSheet(null);
              }}
            >
              <Text>{sheet?.item?.unread ? "Mark as read" : "Mark as unread"}</Text>
            </Pressable>
            <View style={styles.sheetDivider} />
            <Pressable
              style={styles.sheetItem}
              onPress={() => {
                removeItem(sheet?.item?.id);
                setSheet(null);
              }}
            >
              <Text style={{ color: COLOR.danger }}>Delete</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* cover behind navbar */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 0, right: 0, bottom: 0,
          height: insets.bottom + NAV_HEIGHT + NAV_BOTTOM_OFFSET + sy(6),
          backgroundColor: COLOR.white,
          zIndex: 5,
        }}
      />

      <NavBar
        active="menu"
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

/* ---------- row + interactions ---------- */

function Row({ sx, sy, RTL, data }) {
  const { title, details, date, unread, _expanded } = data;
  return (
    <View>
      <View style={{ flexDirection: RTL ? "row-reverse" : "row", alignItems: "flex-start" }}>
        <Image
          source={require("../assets/icons/bell.png")}
          style={{
            width: sx(50),
            height: sx(50),
            marginEnd: RTL ? 0 : sx(10),
            marginStart: RTL ? sx(10) : 0,
          }}
          resizeMode="contain"
        />
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: "#000",
              fontSize: sx(18),
              lineHeight: sx(24),
              fontWeight: "700",
              opacity: unread ? 1 : 0.75,
            }}
            numberOfLines={1}
          >
            {title}
          </Text>
          {!_expanded && (
            <Text style={{ color: "#111827", fontSize: sx(13), marginTop: sy(4) }} numberOfLines={1}>
              {details}
            </Text>
          )}
          {_expanded && (
            <View
              style={{
                marginTop: sy(8),
                padding: sx(10),
                borderRadius: sx(12),
                backgroundColor: "rgba(214,245,255,0.35)",
              }}
            >
              <Text style={{ color: "#111827", fontSize: sx(14) }}>{details}</Text>
            </View>
          )}
        </View>
        <View style={{ width: sx(60), alignItems: RTL ? "flex-start" : "flex-end" }}>
          <Text style={{ color: COLOR.muted, fontSize: sx(12) }} numberOfLines={1}>
            {date}
          </Text>
          {unread && (
            <View style={{ marginTop: sy(6), width: sx(8), height: sx(8), borderRadius: sx(4), backgroundColor: "#E11D48" }} />
          )}
        </View>
      </View>
    </View>
  );
}

function Chip({ label, active, onPress, sx }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 999,
        backgroundColor: active ? "rgba(21,2,91,0.1)" : COLOR.chipBg,
        borderWidth: active ? 1 : 0,
        borderColor: "rgba(21,2,91,0.25)",
      }}
    >
      <Text style={{ color: active ? "#15025B" : "#111827", fontWeight: "700", fontSize: sx(12) }}>
        {label}
      </Text>
    </Pressable>
  );
}

/* Swipe-to-reveal actions (Read/Delete) without extra libs) */
function SwipeableRow({ sx, sy, RTL, onRead, onDelete, children }) {
  const tx = useRef(new Animated.Value(0)).current;
  const OPEN = sx(120), THRESH = sx(40);

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 6,
      onPanResponderMove: (_, g) => {
        const d = RTL ? Math.max(0, Math.min(OPEN, -g.dx)) : Math.max(0, Math.min(OPEN, g.dx));
        tx.setValue(d);
      },
      onPanResponderRelease: (_, g) => {
        const d = RTL ? -g.dx : g.dx;
        Animated.spring(tx, {
          toValue: d > THRESH ? OPEN : 0,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  const close = () => Animated.spring(tx, { toValue: 0, useNativeDriver: true }).start();
  const doRead = () => { onRead?.(); close(); };
  const doDelete = () => {
    Animated.timing(tx, { toValue: sx(500), duration: 200, useNativeDriver: true }).start(() => onDelete?.());
  };

  return (
    <View style={{ overflow: "hidden" }}>
      {/* actions underlay */}
      <View
        style={{
          position: "absolute",
          top: 0, bottom: 0, left: 0, right: 0,
          flexDirection: RTL ? "row-reverse" : "row",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: sx(10),
          paddingHorizontal: sx(8),
        }}
      >
        <Pressable
          onPress={doRead}
          style={{ backgroundColor: COLOR.success, paddingVertical: sy(8), paddingHorizontal: sx(14), borderRadius: sx(10) }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Read</Text>
        </Pressable>
        <Pressable
          onPress={doDelete}
          style={{ backgroundColor: COLOR.danger, paddingVertical: sy(8), paddingHorizontal: sx(14), borderRadius: sx(10) }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Delete</Text>
        </Pressable>
      </View>

      {/* content overlay */}
      <Animated.View
        {...pan.panHandlers}
        style={{
          transform: [{ translateX: RTL ? Animated.multiply(tx, -1) : tx }],
        }}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.25)", alignItems: "center", justifyContent: "center" },
  sheet: { backgroundColor: "#fff", overflow: "hidden" },
  sheetItem: { paddingVertical: 14, paddingHorizontal: 16, alignItems: "center" },
  sheetDivider: { height: 1, backgroundColor: "#E5E7EB" },
});
