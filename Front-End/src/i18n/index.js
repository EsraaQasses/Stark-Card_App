import i18n from "i18next";
import { initReactI18next } from "react-i18next";

export const resources = {
  en: {
    translation: {
      search: "Search",
      games: "Games",
      entertainments: "Entertainments",
      liveApps: "Live Apps",
    },
  },
  ar: {
    translation: {
      search: "بحث",
      games: "الألعاب",
      entertainments: "الترفيه",
      liveApps: "تطبيقات مباشرة",
    },
  },
};

export function initI18n(lang = "en") {
  if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
      resources,
      lng: lang,
      fallbackLng: "en",
      compatibilityJSON: "v3",
      interpolation: { escapeValue: false },
    });
  } else {
    i18n.changeLanguage(lang);
  }
  return i18n;
}
