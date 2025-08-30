import React from "react";
import { View, TextInput, Text, StyleSheet } from "react-native";

export default function TextField({
  label,
  noLabel = false,
  containerStyle,
  ...props
}) {
  return (
    <View style={[styles.container, containerStyle]}>
      {!noLabel && !!label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputWrap}>
        <TextInput
          placeholderTextColor="rgba(0,0,0,0.35)"
          style={styles.input}
          {...props}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  label: { color: "#fff", marginLeft: 6, marginBottom: 6, fontWeight: "700" },
  inputWrap: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 24,
    height: 46,
    justifyContent: "center",
    paddingHorizontal: 16,
    shadowColor: "#001842",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  input: { fontSize: 16, color: "#001433" },
});
