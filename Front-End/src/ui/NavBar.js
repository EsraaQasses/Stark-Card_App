// src/ui/NavBar.js
import React, { useRef, useState } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  Animated,
  Modal,
  TouchableWithoutFeedback,
  useWindowDimensions,
  Text,
  Image,
} from "react-native";
import AppIcon from "./AppIcon";

const BAR_HEIGHT = 64;
const POP_GAP = 6;              // small space above the bar
const BLUE = "#3A86FF";

export default function NavBar({
  active = "home",
  onPressHome,
  onPressQR,          // e.g., () => navigation.navigate("QRScanner")
  onPressDownloads,   // optional long-press
  onPressMenu,
  // Send actions
  onSendStark,
  onTakeMoney,
  // Download actions
  onWhishMoney,
  onCash,
  onUSDTTRC20,
  onBinancePayId,
  insetBottom = 0,
}) {
  const { width: W } = useWindowDimensions();

  // which popover is open: null | "send" | "downloads"
  const [openMenu, setOpenMenu] = useState(null);
  const scale = useRef(new Animated.Value(0.98)).current;
  const fade = useRef(new Animated.Value(0)).current;

  const openPopover = (key) => {
    setOpenMenu(key);
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 7 }),
      Animated.timing(fade, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  };
  const closePopover = () => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 0.98, duration: 120, useNativeDriver: true }),
    ]).start(({ finished }) => finished && setOpenMenu(null));
  };

  const Item = ({ k, name, onPress, onLongPress }) => {
    // Only the opened tab is active-blue; otherwise follow "active" prop
    const isActive = openMenu ? k === openMenu : k === active;
    return (
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        accessibilityLabel={k}
        style={[styles.navItem, isActive && styles.navItemActive]}
      >
        <AppIcon name={name} size={22} active={isActive} />
      </Pressable>
    );
  };

  const CARD_W = Math.min(360, W - 28);
  const POP_BOTTOM = 10 + insetBottom + BAR_HEIGHT + POP_GAP;

  return (
    <>
      {/* One modal handles both popovers */}
      <Modal visible={!!openMenu} transparent animationType="fade" onRequestClose={closePopover}>
        <TouchableWithoutFeedback onPress={closePopover}>
          <Animated.View style={[styles.scrim, { opacity: fade }]} />
        </TouchableWithoutFeedback>

        <Animated.View
          pointerEvents="box-none"
          style={[styles.popWrap, { transform: [{ scale }], opacity: fade }]}
        >
          <View style={[styles.card, { width: CARD_W, marginBottom: POP_BOTTOM }]}>
            {openMenu === "send" && (
              <View style={styles.row}>
                <Tile
                  title="Stark To Stark"
                  img={require("../assets/icons/money.png")}
                  onPress={() => {
                    closePopover();
                    onSendStark?.();
                  }}
                />
                <Tile
                  title="Take Money"
                  img={require("../assets/icons/funds-transfer.png")}
                  onPress={() => {
                    closePopover();
                    onTakeMoney?.();
                  }}
                />
              </View>
            )}

            {openMenu === "downloads" && (
              <>
                <View style={styles.row}>
                  <Tile
                    title="Whish Money"
                    img={require("../assets/icons/whish-money.png")}
                    onPress={() => {
                      closePopover();
                      onWhishMoney?.();
                    }}
                  />
                  <Tile
                    title="Cash"
                    img={require("../assets/icons/cash.png")}
                    onPress={() => {
                      closePopover();
                      onCash?.();
                    }}
                  />
                </View>
                <View style={[styles.row, { marginTop: 12 }]}>
                  <Tile
                    title="USDT Trc20"
                    img={require("../assets/icons/usdt-trc20.png")}
                    onPress={() => {
                      closePopover();
                      onUSDTTRC20?.();
                    }}
                  />
                  <Tile
                    title="Binance Pay ID"
                    img={require("../assets/icons/binance.png")}
                    onPress={() => {
                      closePopover();
                      onBinancePayId?.();
                    }}
                  />
                </View>
              </>
            )}
          </View>
        </Animated.View>
      </Modal>

      {/* Bottom bar */}
      <View style={[styles.bar, { paddingBottom: insetBottom }]}>
        <Item k="menu"      name="menu"      onPress={onPressMenu} />
        <Item
          k="downloads"
          name="downloads"
          onPress={() => (openMenu === "downloads" ? closePopover() : openPopover("downloads"))}
          onLongPress={onPressDownloads}
        />
       <Item
          k="qr"
          name="qr"
          onPress={() => {
            if (openMenu) closePopover(); // close send/download popovers
            onPressQR?.();                // navigation.navigate("QRScanner")
          }}
        />

        <Item
          k="send"
          name="send"
          onPress={() => (openMenu === "send" ? closePopover() : openPopover("send"))}
        />
        <Item k="home"      name="home"      onPress={onPressHome} />
      </View>
    </>
  );
}

// Reusable blue tile with PNG image
function Tile({ title, img, onPress }) {
  const press = useRef(new Animated.Value(1)).current;
  const onIn  = () => Animated.spring(press, { toValue: 0.97, useNativeDriver: true }).start();
  const onOut = () => Animated.spring(press, { toValue: 1,    useNativeDriver: true }).start();

  return (
    <Animated.View style={[styles.tileWrap, { transform: [{ scale: press }] }]}>
      <Pressable onPressIn={onIn} onPressOut={onOut} onPress={onPress} style={styles.tile}>
        <Image source={img} resizeMode="contain" style={styles.tileImg} />
        <Text style={styles.tileText}>{title}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: 16, right: 16, bottom: 10,
    height: BAR_HEIGHT,
    borderRadius: 20,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
    zIndex: 20,
  },
  navItem: {
    width: 46, height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1, borderColor: "transparent",
  },
  navItemActive: {
    backgroundColor: "rgba(58,134,255,0.12)",
    borderColor: BLUE,
  },

  // Modal layers
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.12)" },
  popWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 14,
  },

  // Popover card (rectangle)
  card: {
    backgroundColor: "#bbe4e9ff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BLUE,           // subtle blue outline
    paddingVertical: 14,
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 16,
    margin:60
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  // Tile
  tileWrap: { marginHorizontal: 6 },
  tile: {
    width: 130,
    height: 120,
    borderRadius: 22,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  tileImg: { width: 50, height: 40, tintColor: "#FFF", marginBottom: 8 },
  tileText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 18,
  },
});
