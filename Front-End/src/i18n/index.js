// /src/i18n/index.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// If you prefer to keep JSON files, import them instead:
// import en from "../locales/en.json";
// import ar from "../locales/ar.json";

const en = {
  common: {
    appName: "Stark",
    ok: "OK",
    cancel: "Cancel",
    save: "Save",
    close: "Close",
    approve: "Approve",
    delete: "Delete",
    back: "Back",
    search: "Search",
    system: "System",
    general: "General",
    unread: "Unread",
    all: "All",
    markAllRead: "Mark all read",
    markRead: "Mark read",
    markUnread: "Mark unread",
    noNotifications: "No notifications",
    caughtUp: "You’re all caught up. New updates will appear here.",
    showAll: "Show all",
  },
  home: {
    headerNotificationsAlt: "Notifications",
    headerProfileAlt: "Profile",
    section: "Section {{n}}",
  },
  products: {
    pageTitleFor: "Products Page for {{title}}",
  },
  payment: {
    title: "Payment",
    gamerId: "Gamer ID",
    enterYourId: "Enter Your ID",
    approve: "Approve",
    cancel: "Cancel",
    price: "Price",
  },
  menu: {
    myProfile: "My Profile",
    myPayments: "My Payments",
    myWallet: "My Wallet",
    myOrders: "My Orders",
    favorite: "Favorite",
    ourAgents: "Our Agents",
    contactUs: "Contact Us",
    logout: "Log Out",
    userName: "User Name",
    logoutTitle: "Log out",
    logoutBody: "Are you sure you want to log out?",
  },
  nav: {
    send_pop_title1: "Stark To Stark",
    send_pop_sub1: "Instant transfer",
    send_pop_title2: "Take Money",
    send_pop_sub2: "Cash / Agent",
    dl_whish_money: "Wish Money",
    dl_cash: "Cash",
    dl_usdt_trc20: "USDT Trc20",
    dl_binance_id: "Binance Pay ID",
  },
  notifications: {
    title: "Notifications",
    paymentReceived: "Payment received",
    orderPacked: "Order packed",
    updateAvailable: "Update available",
  },
  currency: {
    syr: "SYR",
    usd: "USD",
  }
};

const ar = {
  common: {
    appName: "ستارك",
    ok: "حسناً",
    cancel: "إلغاء",
    save: "حفظ",
    close: "إغلاق",
    approve: "تأكيد",
    delete: "حذف",
    back: "رجوع",
    search: "بحث",
    system: "نظام",
    general: "عام",
    unread: "غير مقروء",
    all: "الكل",
    markAllRead: "تحديد الكل كمقروء",
    markRead: "تحديد كمقروء",
    markUnread: "تحديد كغير مقروء",
    noNotifications: "لا توجد إشعارات",
    caughtUp: "أنت على اطلاع كامل، ستظهر التحديثات الجديدة هنا.",
    showAll: "عرض الكل",
  },
  home: {
    headerNotificationsAlt: "الإشعارات",
    headerProfileAlt: "الملف الشخصي",
    section: "قسم {{n}}",
  },
  products: {
    pageTitleFor: "صفحة المنتجات لـ {{title}}",
  },
  payment: {
    title: "الدفع",
    gamerId: "معرّف اللاعب",
    enterYourId: "أدخل المعرّف",
    approve: "تأكيد",
    cancel: "إلغاء",
    price: "السعر",
  },
  menu: {
    myProfile: "ملفي الشخصي",
    myPayments: "مدفوعاتي",
    myWallet: "محفظتي",
    myOrders: "طلباتي",
    favorite: "المفضلة",
    ourAgents: "وكلاؤنا",
    contactUs: "اتصل بنا",
    logout: "تسجيل الخروج",
    userName: "اسم المستخدم",
    logoutTitle: "تسجيل الخروج",
    logoutBody: "هل أنت متأكد أنك تريد تسجيل الخروج؟",
  },
  nav: {
    send_pop_title1: "ستارك إلى ستارك",
    send_pop_sub1: "تحويل فوري",
    send_pop_title2: "سحب أموال",
    send_pop_sub2: "نقدًا / عبر وكيل",
    dl_whish_money: "ويش موني",
    dl_cash: "نقدًا",
    dl_usdt_trc20: "USDT‏ TRC20",
    dl_binance_id: "Binance Pay ID",
  },
  notifications: {
    title: "الإشعارات",
    paymentReceived: "تم استلام دفعة",
    orderPacked: "تم تجهيز الطلب",
    updateAvailable: "تحديث متاح",
  },
  currency: {
    syr: "ل.س",
    usd: "دولار",
  }
};

export function initI18n(lang = "en") {
  // if already initialized, just change language & return instance
  if (i18n.isInitialized) {
    i18n.changeLanguage(lang);
    return i18n;
  }

  i18n
    .use(initReactI18next)
    .init({
      lng: lang,
      fallbackLng: "en",
      compatibilityJSON: "v3",
      resources: { en: { translation: en }, ar: { translation: ar } },
      interpolation: { escapeValue: false },
      returnNull: false,
    });

  return i18n;
}
