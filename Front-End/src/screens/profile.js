// src/screens/Profile.js
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  I18nManager,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Screenn from "../ui/Screenn";
import NavBar from "../ui/NavBar";

const COLOR = {
  primary: "#0B63D8",
  text: "#0E1B3B",
  line: "#E4ECF2",
  pill: "#D6F5FF",
  white: "#FFFFFF",
  danger: "#FF4E4E",
  success: "#22C55E",
};

const BASE_W = 390, BASE_H = 844;

export default function Profile({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width: W, height: H } = useWindowDimensions();
  const RTL = I18nManager.isRTL;
  const sx = (n) => (W / BASE_W) * n;
  const sy = (n) => (H / BASE_H) * n;

  // nav sizes (same as Home)
  const NAV_HEIGHT = sy(64);
  const NAV_BOTTOM_OFFSET = sy();

  // form state
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("Stark");
  const [phone, setPhone] = useState("963999999999");
  const [dark, setDark] = useState(false);

  const GAP_SM = sy(8);
  const GAP_XS = sy(6);
  const R = sx(18);

  return (
    <Screenn bgColor={COLOR.white}>
      {/* title */}
      <View style={{ paddingTop: insets.top + sy(30), alignItems: "center" }}>
        <Text style={{ fontSize: sx(25), fontWeight: "700", color: "#0F172A" }}>My Profile</Text>
      </View>

      {/* avatar */}
      <View style={{ alignItems: "center", marginTop: sy(25), marginBottom: sy(50) }}>
        <View
          style={{
            width: sx(125),
            height: sx(125),
            borderRadius: sx(60),
            borderWidth: sx(4),
            borderColor: COLOR.primary,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#F2F7FF",
          }}
        >
          <Image
            source={require("../assets/icons/user.png")}
            resizeMode="contain"
            style={{ width: sx(75), height: sx(75), tintColor: COLOR.primary }}
          />
        </View>
      </View>

      {/* form */}
      <View style={{ paddingHorizontal: sx(20), paddingBottom: sy(110) /* keep clear of navbar */ }}>
        {/* First + Last (half width each) */}
        <View
          style={{
            flexDirection: RTL ? "row-reverse" : "row",
            justifyContent: "space-between",
            marginBottom: GAP_SM,
          }}
        >
          <Field
            label="First Name"
            value={first}
            onChangeText={setFirst}
            placeholder="First"
            sx={sx}
            sy={sy}
            pillStyle={{ borderRadius: R }}
            containerStyle={{ width: "48.5%" }}
          />
          <Field
            label="Last Name"
            value={last}
            onChangeText={setLast}
            placeholder="Last"
            sx={sx}
            sy={sy}
            pillStyle={{ borderRadius: R }}
            containerStyle={{ width: "48.5%" }}
          />
        </View>

        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="name@gmail.com"
          keyboardType="email-address"
          sx={sx}
          sy={sy}
          showPen
          containerStyle={{ marginBottom: GAP_SM }}
          pillStyle={{ borderRadius: R }}
        />

        <Field
          label="User Name"
          value={userName}
          onChangeText={setUserName}
          placeholder="Stark"
          sx={sx}
          sy={sy}
          showPen
          containerStyle={{ marginBottom: GAP_SM }}
          pillStyle={{ borderRadius: R }}
        />

        <Field
          label="Phone"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          sx={sx}
          sy={sy}
          showPen
          containerStyle={{ marginBottom: GAP_XS }}
          pillStyle={{ borderRadius: R }}
        />

        {/* Dark Mode */}
        <View
          style={{
            marginTop: GAP_XS,
            marginBottom: sy(12),
            flexDirection: RTL ? "row-reverse" : "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ fontSize: sx(14), color: "#000" }}>Dark Mode</Text>
          <Toggle
            active={dark}
            onPress={() => setDark((v) => !v)}
            sx={sx}
            sy={sy}
            onColor={COLOR.success}
            offColor={COLOR.danger}
          />
        </View>

        {/* Save */}
        <Pressable
          onPress={() => {}}
          style={{
            alignSelf: "center",
            height: sy(48),
            minWidth: sx(178),
            borderRadius: sx(18),
            backgroundColor: "#3A86FF",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: sy(12),
          }}
        >
          <Text style={{ color: COLOR.white, fontSize: sx(18), fontWeight: "700" }}>Save</Text>
        </Pressable>
      </View>

      {/* white cover behind navbar (same as Home) */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: insets.bottom + NAV_HEIGHT + NAV_BOTTOM_OFFSET + sy(6),
          backgroundColor: COLOR.white,
          zIndex: 5, // NavBar has higher zIndex
        }}
      />

      {/* shared NavBar — menu highlighted */}
      <NavBar
        active="menu"
        insetBottom={insets.bottom + NAV_BOTTOM_OFFSET}
        onPressHome={() => navigation.navigate("Home")}
        onPressMenu={() => {}}
        onPressDownloads={() => navigation.navigate("Downloads")}
        onPressQR={() => navigation.navigate("QR")}
        onPressSend={() => navigation.navigate("Send")}
      />
    </Screenn>
  );
}

/* ---------- subcomponents ---------- */
function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  showPen = true,
  containerStyle,
  pillStyle,
  sx,
  sy,
}) {
  const RTL = I18nManager.isRTL;
  return (
    <View style={[{ width: "100%" }, containerStyle]}>
      <Text style={{ fontSize: sx(12.5), color: "#000", marginBottom: sy(4) }}>{label}</Text>
      <View
        style={[
          {
            height: sy(46),
            backgroundColor: COLOR.pill,
            borderWidth: 1,
            borderColor: COLOR.line,
            flexDirection: RTL ? "row-reverse" : "row",
            alignItems: "center",
            paddingHorizontal: sx(14),
          },
          pillStyle,
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(0,0,0,0.5)"
          keyboardType={keyboardType}
          style={{ flex: 1, fontSize: sx(16), color: COLOR.text, textAlign: RTL ? "right" : "left" }}
        />
        {showPen && (
          <Pressable style={{ width: sx(24), height: sx(24), alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: COLOR.primary, fontSize: sx(14), fontWeight: "700" }}>✎</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function Toggle({ active, onPress, sx, sy, onColor, offColor }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: sx(50),
        height: sy(25),
        borderRadius: sy(14),
        padding: sy(3),
        backgroundColor: active ? onColor : offColor,
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: sy(20),
          height: sy(20),
          borderRadius: sy(11),
          backgroundColor: "#fff",
          alignSelf: active ? "flex-end" : "flex-start",
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowRadius: 3,
          shadowOffset: { width: 0, height: 1 },
          elevation: 2,
        }}
      />
    </Pressable>
  );
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({});
