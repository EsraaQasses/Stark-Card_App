// src/ui/Button.js
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import theme from "./Theme";

export default function Button({ title, onPress, style, textStyle, disabled, width, height }) {
  const handlePress = () => {
    if (disabled) return;        // hard guard
    onPress?.();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={[
        styles.shadowWrap,
        style,
        { width: width || theme.sizes.buttonWidth },
        { height: height || theme.sizes.buttonHeight },
        disabled && { opacity: 0.6 },
      ]}
    >
      <LinearGradient
        colors={[
          theme.colors.btnGradientStart,
          theme.colors.btnGradientMid,
          theme.colors.btnGradientEnd,
        ]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.btn}
      >
        <Text style={[styles.text, textStyle]}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    height: theme.sizes.buttonHeight,
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
