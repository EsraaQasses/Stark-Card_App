// src/ui/Theme.js

const colors = {
  appBg: "#2137EC", // ✅ fixed invalid hex
  btnGradientStart: "#092D67",
  btnGradientMid: "rgba(9,45,103,0.10)",
  btnGradientEnd: "#092D67",
  textPrimary: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.8)",
  border: "rgba(255,255,255,0.35)",

  primary: "#0B63D8",
  white: "#FFFFFF",
  line: "#E4ECF2",
  muted: "#7C8DA6",
  bgSoft: "#F3F7FB",
};

const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
const radius = { xs: 6, sm: 10, md: 14, lg: 18, xl: 24 };
const fontSizes = { xs: 12, sm: 14, md: 16, lg: 18, xl: 22 };

const sizes = {
  buttonWidth: 350,
  buttonHeight: 72,
  buttonRadius: 20,
  pagePaddingH: 20,
  pagePaddingTop: 24,
  pagePaddingBottom: 24,
};

const shadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.5,
  shadowRadius: 4,
  elevation: 5,
};

const typography = {
  title: { fontSize: 28, fontWeight: "700" },
  button: { fontSize: 22, fontWeight: "700" },
  footer: { fontSize: 12, opacity: 0.8 },
};

const Theme = { colors, spacing, radius, fontSizes, sizes, shadow, typography };
export default Theme;
export { colors, spacing, radius, fontSizes, sizes, shadow, typography, Theme };
