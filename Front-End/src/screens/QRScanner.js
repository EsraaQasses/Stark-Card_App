import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  useWindowDimensions, Vibration, ActivityIndicator, Platform
} from "react-native";

const BLUE = "#3A86FF";

export default function QRScanner({ navigation }) {
  const { width: W, height: H } = useWindowDimensions();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const FRAME_SIZE = Math.min(W * 0.7, 260);
  const frameLeft = (W - FRAME_SIZE) / 2;
  const frameTop = (H - FRAME_SIZE) / 2;

  const handleScan = ({ data }) => {
    if (scanned) return;
    setScanned(true);
    try { Vibration.vibrate(40); } catch {}
    navigation.goBack();
    // or: navigation.navigate("SomeScreen", { qr: data });
  };

  if (hasPermission === null) {
    return (
      <View style={[styles.center, { backgroundColor: "#000" }]}>
        <ActivityIndicator color="#fff" />
        <Text style={styles.info}>Requesting camera permission…</Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View style={[styles.center, { padding: 24 }]}>
        <Text style={[styles.info, { color: "#000" }]}>
          Camera access is required to scan QR codes.
        </Text>
        <TouchableOpacity
          onPress={async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === "granted");
          }}
          style={styles.btn}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleScan}
        barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* dim around square */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[styles.dim, { top: 0, left: 0, right: 0, height: frameTop }]} />
        <View style={[styles.dim, { top: frameTop, left: 0, width: frameLeft, height: FRAME_SIZE }]} />
        <View style={[styles.dim, { top: frameTop, right: 0, width: frameLeft, height: FRAME_SIZE }]} />
        <View style={[styles.dim, { top: frameTop + FRAME_SIZE, left: 0, right: 0, bottom: 0 }]} />
        <View style={[styles.frame, { width: FRAME_SIZE, height: FRAME_SIZE, top: frameTop, left: frameLeft }]} />
        <Text style={[styles.hint, { top: frameTop + FRAME_SIZE + 18 }]}>Align the QR inside the square</Text>
      </View>

      <TouchableOpacity style={styles.close} onPress={() => navigation.goBack()}>
        <Text style={styles.closeTxt}>×</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  info: { color: "#fff", marginTop: 10, opacity: 0.85, textAlign: "center" },
  btn: { marginTop: 14, backgroundColor: BLUE, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  dim: { position: "absolute", backgroundColor: "rgba(0,0,0,0.45)" },
  frame: { position: "absolute", borderColor: BLUE, borderWidth: 3, borderRadius: 16 },
  hint: { position: "absolute", alignSelf: "center", color: "#fff", fontWeight: "600" },
  close: { position: "absolute", top: Platform.select({ ios: 54, android: 24 }), right: 20,
    width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center", justifyContent: "center" },
  closeTxt: { color: "#fff", fontSize: 24, lineHeight: 24, marginTop: -2 },
});
