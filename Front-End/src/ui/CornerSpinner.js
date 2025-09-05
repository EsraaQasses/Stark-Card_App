import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet } from "react-native";

export default function CornerSpinner({ size = 300, image, speedMs = 12000, opacity = 0.95 }) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: speedMs,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [spin, speedMs]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.Image
      source={image}
      resizeMode="contain"
      pointerEvents="none"
      style={[
        styles.corner,
        {
          width: size,
          height: size,
          top: -size / 2,   // center the image at top-left (0,0)
          left: -size / 2,
          opacity,
          transform: [{ rotate }],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  corner: {
    position: "absolute",
    zIndex: 0,
  },
});
