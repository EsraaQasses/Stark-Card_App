import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import theme from "./Theme";

export default function Button({
  title,
  onPress,
  style,
  textStyle,
  disabled,
  width,
  height,
  colors,            // manual override (optional)
  start,
  end,
  loading,
  accessibilityLabel,
  variant = "app",   // ✅ "auth" | "app"
}) {
  const handlePress = () => {
    if (disabled || loading) return;
    onPress?.();
  };

  // pick gradient
  const pickVariant = () => {
    if (colors && Array.isArray(colors) && colors.length > 0) return colors; // explicit override
    if (variant === "auth") {
      return [
        theme.colors.authBtnGradientStart,
        theme.colors.authBtnGradientMid,
        theme.colors.authBtnGradientEnd,
      ];
    }
    // default app style
    return [
      theme.colors.appBtnGradientStart,
      theme.colors.appBtnGradientMid,
      theme.colors.appBtnGradientEnd,
    ];
  };

  const gradientColors = pickVariant();

  return (
    <View style={[styles.shadowWrap, style, { width: width ?? theme.sizes.buttonWidth }]}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handlePress}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled, busy: !!loading }}
        accessibilityLabel={accessibilityLabel || (typeof title === "string" ? title : "button")}
        hitSlop={{ top: 6, bottom: 6, left: 8, right: 8 }}
        style={{ width: "100%", height: height ?? theme.sizes.buttonHeight }}
      >
        <LinearGradient
          colors={gradientColors}
          start={start ?? { x: 0, y: 0.5 }}
          end={end ?? { x: 1, y: 0.5 }}
          style={[styles.btn, (disabled || loading) && { opacity: 0.6 }]}
        >
          <Text style={[styles.text, textStyle]}>{loading ? "…" : title}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    alignSelf: "center",
    marginVertical: 8,
    shadowColor: theme.shadow.shadowColor,
    shadowOffset: theme.shadow.shadowOffset,
    shadowOpacity: theme.shadow.shadowOpacity,
    shadowRadius: theme.shadow.shadowRadius,
    elevation: theme.shadow.elevation,
  },
  btn: {
    flex: 1,
    borderRadius: theme.sizes.buttonRadius,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight,
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
  },
});
