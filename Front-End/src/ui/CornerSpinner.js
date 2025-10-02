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
      resizeMode="cover"
      pointerEvents="none"
      style={[
        styles.corner,
        {
          width: size,
          height: size,
          top: -size / 2,   // يخلي المركز عند الزاوية العليا اليسار
          left: -size / 2,
          borderRadius: size / 2, // ⬅️ هي اللي بتخليه دائري
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
  top: 0, left: 0, right: 0,
  height: 300,   
  zIndex: -2,    
},

});
