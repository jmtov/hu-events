import i18n from 'i18next';
import HttpBackend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

// Supported locales — add new locales here and create the matching
// public/locales/<locale>/<namespace>.json files.
export const SUPPORTED_LOCALES = ['en', 'es', 'pt-BR'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LOCALES,
    ns: ['common', 'attendee', 'admin'],
    defaultNS: 'common',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
