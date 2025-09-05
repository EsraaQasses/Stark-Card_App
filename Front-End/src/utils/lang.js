// /src/utils/lang.js
import { I18nManager } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initI18n } from "../i18n";

let Updates;
try { Updates = require("expo-updates"); } catch (e) { Updates = null; }

const KEY = "app.lang";

export async function loadSavedLanguage() {
  const lang = (await AsyncStorage.getItem(KEY)) || "en";
  initI18n(lang);

  const rtl = lang === "ar";
  if (I18nManager.isRTL !== rtl) {
    I18nManager.allowRTL(rtl);
    I18nManager.forceRTL(rtl);
    I18nManager.swapLeftAndRightInRTL(true); // 🔑 mirror paddings/margins
  }
  return lang;
}

export async function setAppLanguage(lang) {
  await AsyncStorage.setItem(KEY, lang);
  initI18n(lang);

  const rtl = lang === "ar";
  let needsReload = false;

  if (I18nManager.isRTL !== rtl) {
    I18nManager.allowRTL(rtl);
    I18nManager.forceRTL(rtl);
    I18nManager.swapLeftAndRightInRTL(true);
    needsReload = true;
  }

  if (needsReload) {
    if (Updates?.reloadAsync) {
      try { await Updates.reloadAsync(); } catch {}
    } else {
      // If not using Expo, do a manual app restart or add `react-native-restart`.
      // RNRestart.Restart();
    }
  }
}
