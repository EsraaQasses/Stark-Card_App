// src/ui/Theme.js
const theme = {
  colors: {
    // Background (fallback behind the image)
    appBg: "#2137fbec",

    // Button gradient (from your Figma)
    btnGradientStart: "#092D67",
    btnGradientMid: "rgba(9,45,103,0.10)",
    btnGradientEnd: "#092D67",

    // Text
    textPrimary: "#FFFFFF",
    textMuted: "rgba(255,255,255,0.8)",

    // Borders (subtle)
    border: "rgba(255,255,255,0.35)",
  },
  sizes: {
    buttonWidth: 350,
    buttonHeight: 72,
    buttonRadius: 20,
    pagePaddingH: 20,
    pagePaddingTop: 24,
    pagePaddingBottom: 24,
  },
  shadow: {
    // iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    // Android
    elevation: 5,
  },
  typography: {
    title: { fontSize: 28, fontWeight: "700" },
    button: { fontSize: 22, fontWeight: "700" }, // ~32px Figma feel
    footer: { fontSize: 12, opacity: 0.8 },
  },
};

export default theme;
