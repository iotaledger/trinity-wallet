import i18next from 'i18next';
//import LanguageDetector from 'i18next-browser-languagedetector';
const I18N_DEFAULT_LANGUAGE = 'en';

i18next
    //.use(LanguageDetector)
    .init({
        fallbackLng: I18N_DEFAULT_LANGUAGE,
        fallbackNS: 'Common',
        order: [
            'querystring', 
            'cookie', 
            'localStorage', 
            'navigator', 
            'htmlTag'
        ],
        resources: {
            de: { 'Common': require('./locales/de/translation.json') },
            en: { 'Common': require('./locales/en/translation.json') },
            fr: { 'Common': require('./locales/fr/translation.json') },
            it: { 'Common': require('./locales/it/translation.json') },
        },
    });

export default i18next;
