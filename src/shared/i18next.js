import i18next from 'i18next';
//import LanguageDetector from 'i18next-browser-languagedetector';
const I18N_DEFAULT_LANGUAGE = 'en';

export const I18N_LOCALE_LABELS = [
    'English (International)',
    'عربى - Arabic',
    'Dansk - Danish',
    'Deutsch - German',
    'Ελληνικά - Greek',
    'Español - Spanish',
    'Suomi - Finnish',
    'Français - French',
    'עִברִית - Hebrew',
    'हिंदी - Hindi',
    'Italiano - Italian',
    '日本語 - Japanese',
    '한국어 - Korean',
    'Nederlands - Dutch',
    'Norsk - Norwegian',
    'Polski - Polish',
    'Português (Brasil) - Portuguese (Brazil)',
    'Português (Portugal) - Portuguese (Portugal)',
    'Română - Romanian',
    'Pусский - Russian',
    'Svenska - Swedish',
    'Türkçe - Turkish',
    '中文 (简体) - Chinese (Simplified)',
    '中文 (繁體) - Chinese (Traditional)',
];

i18next
    //.use(LanguageDetector)
    .init({
        fallbackLng: I18N_DEFAULT_LANGUAGE,
        fallbackNS: 'Common',
        order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
        resources: {
            ar: { Common: require('./locales/ar/translation.json') },
            da: { Common: require('./locales/da/translation.json') },
            de: { Common: require('./locales/de/translation.json') },
            el: { Common: require('./locales/el/translation.json') },
            en: { Common: require('./locales/en/translation.json') },
            es_ES: { Common: require('./locales/es-ES/translation.json') },
            es_LA: { Common: require('./locales/es-LA/translation.json') },
            fi: { Common: require('./locales/fi/translation.json') },
            fr: { Common: require('./locales/fr/translation.json') },
            he: { Common: require('./locales/he/translation.json') },
            hi: { Common: require('./locales/hi/translation.json') },
            id: { Common: require('./locales/id/translation.json') },
            it: { Common: require('./locales/it/translation.json') },
            ja: { Common: require('./locales/ja/translation.json') },
            ko: { Common: require('./locales/ko/translation.json') },
            lv: { Common: require('./locales/lv/translation.json') },
            nl: { Common: require('./locales/nl/translation.json') },
            no: { Common: require('./locales/no/translation.json') },
            pl: { Common: require('./locales/pl/translation.json') },
            pt_BR: { Common: require('./locales/pt-BR/translation.json') },
            pt_PT: { Common: require('./locales/pt-PT/translation.json') },
            ro: { Common: require('./locales/ro/translation.json') },
            ru: { Common: require('./locales/ru/translation.json') },
            sl: { Common: require('./locales/sl/translation.json') },
            sv_SE: { Common: require('./locales/sv-SE/translation.json') },
            tr: { Common: require('./locales/tr/translation.json') },
            ur: { Common: require('./locales/ur/translation.json') },
            zh_CN: { Common: require('./locales/zh-CN/translation.json') },
            zh_TW: { Common: require('./locales/zh-TW/translation.json') },
        },
    });

export default i18next;
