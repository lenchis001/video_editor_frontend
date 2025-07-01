import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import ru from './locales/ru.json';
import uk from './locales/uk.json';
import be from './locales/be.json';
import de from './locales/de.json';
import it from './locales/it.json';
import es from './locales/es.json';
import zh from './locales/zh.json';
import pl from './locales/pl.json';

const savedLang = localStorage.getItem('selectedLanguage') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      uk: { translation: uk },
      be: { translation: be },
      de: { translation: de },
      it: { translation: it },
      es: { translation: es },
      zh: { translation: zh },
      pl: { translation: pl },
    },
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;
