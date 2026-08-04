import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import ar from "./locales/ar.json";
import tr from "./locales/tr.json";

const resources = {
  en: { translation: en },
  ar: { translation: ar },
  tr: { translation: tr },
};

i18n.use(initReactI18next).init({
  resources,

  // اللغة الافتراضية للموقع
  lng: "en",

  // عند فقدان ترجمة، استخدم الإنجليزية
  fallbackLng: "en",

  supportedLngs: ["en", "ar", "tr"],

  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
