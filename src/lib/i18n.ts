import { DEFAULT_LANGUAGE } from "@/lib/constants";
import en from "@/locales/en.json";
import ru from "@/locales/ru.json";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ru: { translation: ru },
  },
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: {
    // React already escapes values in JSX
    escapeValue: false,
  },
});

export default i18n;
