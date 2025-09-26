import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFavorites } from "../context/FavoritesContext";
import Screenn from "../ui/Screenn";
import { sx, sy, sp } from "../ui/scale";
import theme from "../ui/Theme";
import Button from "../ui/Button";

export default function Payment({ navigation, route }) {
  const insets = useSafeAreaInsets();

  // --- Admin-provided product (via params). Fallback keeps screen usable in dev.
  const fallbackProduct = {
    id: "demo-100",
    name: "App Name",
    price: 0.66,
    currency: "USD",
    unitLabel: "",
    requiresGamerId: true,
    gamerIdLabel: "Gamer ID",
    qty: { min: 100, max: 10000, step: 100, defaultValue: 100 },
  };
  const product = route?.params?.product ?? fallbackProduct;
const { addFavorite } = useFavorites();
  const [gamerId, setGamerId] = useState("");
  const [qty, setQty] = useState(
    product?.qty?.defaultValue ?? product?.qty?.min ?? 1
  );

  const { min, max, step } = {
    min: product?.qty?.min ?? 1,
    max: product?.qty?.max ?? 999999,
    step: product?.qty?.step ?? 1,
  };

  const unitPrice = Number(product?.price ?? 0);
  const total = useMemo(() => {
    // If step is like 100 = price per step
    const factor = step > 0 ? qty / step : qty;
    return +(unitPrice * factor).toFixed(2);
  }, [qty, step, unitPrice]);

  const dec = () => setQty((q) => Math.max(min, q - step));
  const inc = () => setQty((q) => Math.min(max, q + step));

  const onApprove = () => {
    if (product?.requiresGamerId && !gamerId.trim()) {
      Alert.alert("Missing info", "Please enter your Gamer ID.");
      return;
    }
    // TODO: hook to your payment flow
    // e.g., navigation.navigate('Checkout', { productId: product.id, qty, gamerId, total })
    Alert.alert("Approved ✅", `Processing ${qty} for ${total} ${product.currency}`);
  };

  return (
    <Screenn bgColor="#FFFFFF" useDefaultBg={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={[styles.container, { paddingTop: insets.top + sy(24) }]}>
          {/* Header: app name + heart + price pill */}
          <View style={styles.headerRow}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={styles.appTitle}>
                {product?.name || "App Name"}
              </Text>
              <Pressable
                 onPress={() => {
                   addFavorite(product);
                   navigation.navigate("Favorite");
                 }}
                 hitSlop={12}
                 style={styles.heartBtn}
               >
                 <Text style={styles.heartText}>❤️</Text>
               </Pressable>
            </View>

            <View style={styles.pricePill}>
              <Text style={styles.priceText}>
                {unitPrice} {product?.currency || ""}
              </Text>
            </View>
          </View>

          {/* Gamer ID (if required) */}
          {product?.requiresGamerId && (
            <View style={{ marginTop: sy(28) }}>
              <Text style={styles.label}>
                {product?.gamerIdLabel || "Gamer ID"}
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Your ID"
                placeholderTextColor="rgba(14,27,59,0.35)"
                value={gamerId}
                onChangeText={setGamerId}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
              />
            </View>
          )}

          {/* Quantity stepper */}
          <View style={{ marginTop: sy(28) }}>
            <Text style={styles.label}>Quantity</Text>

            <View style={styles.qtyRow}>
              <Pressable onPress={dec} hitSlop={12} style={styles.qtyBtn}>
                <Text style={styles.qtyBtnText}>−</Text>
              </Pressable>

              <View style={styles.qtyMid}>
                <Text style={styles.qtyText}>{qty}</Text>
              </View>

              <Pressable onPress={inc} hitSlop={12} style={styles.qtyBtn}>
                <Text style={styles.qtyBtnText}>+</Text>
              </Pressable>
            </View>

            {product?.unitLabel ? (
              <Text style={styles.unitNote}>{product.unitLabel}</Text>
            ) : null}
          </View>

          {/* Total (derived) */}
          <View style={{ marginTop: sy(24) }}>
            <Text style={styles.totalText}>
              Total: {total} {product?.currency || ""}
            </Text>
          </View>

          {/* Approve button */}
          <View style={{ marginTop: sy(36) }}>
            <Button
              variant="app"
              title="Approve"
              onPress={onApprove}
              width="50%"
              height={sy(52)}
              colors={["#3B82F6", "#14146dff"]} // gradient blue
            />
          </View>

          <View style={{ flex: 1 }} />
        </View>
      </KeyboardAvoidingView>
    </Screenn>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: sx(20),
    marginTop: sy(50)

  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  appTitle: {
    fontSize: sp(40),
    fontWeight: "700",
    color: "#0E1B3B",
    marginTop : sx(10),
  },
  heartBtn: {
    marginLeft: sx(15),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: sx(14),
    paddingHorizontal: sx(6),
    paddingVertical: sy(2),
    marginTop : sx(10),
  },
  heartText: { fontSize: sp(30) },
  pricePill: {
    backgroundColor: "#4F9BFF",
    paddingHorizontal: sx(12),
    paddingVertical: sy(6),
    borderRadius: 999,
    marginTop : sx(20),

  },
  priceText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: sp(25),
    
  },
  label: {
    fontSize: sp(16),
    fontWeight: "700",
    color: "#14024C",
    marginBottom: sy(10),
    marginTop: sy(50)

  },
  input: {
    height: sy(56),
    borderRadius: 20,
    backgroundColor: "#DDF5FF",
    paddingHorizontal: sx(18),
    color: "#0E1B3B",
    fontSize: sp(16),
    
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  qtyBtn: {
    width: sx(44),
    height: sy(44),
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnText: { fontSize: sp(28), color: "#0E1B3B" },
  qtyMid: {
    flex: 1,
    height: sy(56),
    backgroundColor: "#DDF5FF",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: { fontSize: sp(18), fontWeight: "700", color: "#0E1B3B" },
  unitNote: {
    marginTop: sy(6),
    color: "#687189",
  },
  totalText: {
    fontSize: sp(16),
    fontWeight: "700",
    color: "#1547c6ff",
  },
});
