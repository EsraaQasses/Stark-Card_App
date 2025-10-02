import { StyleSheet } from "react-native";
import { Colors } from "./Theme";
import { sp } from "./scale";


export const Typography = StyleSheet.create({
h1: { fontSize: sp(28), fontWeight: "700", color: Colors.text },
h2: { fontSize: sp(22), fontWeight: "700", color: Colors.text },
title: { fontSize: sp(18), fontWeight: "600", color: Colors.text },
body: { fontSize: sp(16), color: Colors.text },
small: { fontSize: sp(13), color: Colors.subtext },
});