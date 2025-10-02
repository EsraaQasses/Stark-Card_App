import { Dimensions, PixelRatio, Platform } from "react-native";
const { width: W, height: H } = Dimensions.get("window");
const BASE_W = 390; // iPhone 14 width
const BASE_H = 844; // iPhone 14 height


export const sx = (n) => (W / BASE_W) * n; // scale by width
export const sy = (n) => (H / BASE_H) * n; // scale by height
export const s = (n) => (W / BASE_W + H / BASE_H) / 2 * n; // average scale
export const sp = (size) => PixelRatio.roundToNearestPixel(s(size)); // scaled font size


export const isSmallDevice = W < 360;
export const isTablet = Math.min(W, H) >= 768;