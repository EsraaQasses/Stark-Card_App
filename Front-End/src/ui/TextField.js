import React from "react";
import { View, TextInput, Text, StyleSheet } from "react-native";
import { Colors, Radius, Spacing } from "./Theme";
import { sp, sy } from "./scale";


export default function TextField({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType }) {
return (
<View style={styles.wrap}>
{label ? <Text style={styles.label}>{label}</Text> : null}
<TextInput
style={styles.input}
placeholder={placeholder}
placeholderTextColor={Colors.subtext}
value={value}
onChangeText={onChangeText}
secureTextEntry={secureTextEntry}
keyboardType={keyboardType}
/>
</View>
);
}


const styles = StyleSheet.create({
wrap: { marginBottom: Spacing.md },
label: { color: Colors.subtext, fontSize: sp(12), marginBottom: 6 },
input: {
height: sy(52),
borderRadius: Radius.lg,
backgroundColor: "#0E141B",
borderWidth: 1,
borderColor: Colors.line,
paddingHorizontal: Spacing.lg,
color: Colors.text,
fontSize: sp(15),
},
});