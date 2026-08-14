import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
 

export const DEFAULT_LANGUAGE = 'de';
 
// Get saved language from localStorage or use DEFAULT_LANGUAGE
const savedLanguage = localStorage.getItem('language') || DEFAULT_LANGUAGE;
 
i18n
  .use(HttpApi) // Load translations using HTTP
  .use(initReactI18next) // Passes i18n instance to react-i18next
  .init({
    backend: {
      loadPath: '/locals/{{lng}}/{{lng}}.json', // Path to translation files in public folder
    },
    lng: savedLanguage, // Use saved language or default to 'en'
    fallbackLng: 'de', // Fallback language if the chosen language translation is missing
    returnObjects: true, // Return arrays/objects for list keys (e.g. hostData.items)
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
  });
 
export default i18n;
 
 