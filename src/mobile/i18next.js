import i18next from 'i18next';
import { reactI18nextModule } from 'react-i18next';
// import LanguageDetector from 'i18next-browser-languagedetector';

export default i18next.use(reactI18nextModule).init(
    {
        fallbackLng: 'en',
        fallbackNS: 'global',
        parseMissingKeyHandler: value => `Translation not available for ${value}`,
        resources: {
            ar: require('../shared/locales/ar/translation.json'),
            da: require('../shared/locales/da/translation.json'),
            de: require('../shared/locales/de/translation.json'),
            el: require('../shared/locales/el/translation.json'),
            en: require('../shared/locales/en/translation.json'),
            es_ES: require('../shared/locales/es-ES/translation.json'),
            es_LA: require('../shared/locales/es-LA/translation.json'),
            fi: require('../shared/locales/fi/translation.json'),
            fr: require('../shared/locales/fr/translation.json'),
            he: require('../shared/locales/he/translation.json'),
            hi: require('../shared/locales/hi/translation.json'),
            id: require('../shared/locales/id/translation.json'),
            it: require('../shared/locales/it/translation.json'),
            ja: require('../shared/locales/ja/translation.json'),
            ko: require('../shared/locales/ko/translation.json'),
            lv: require('../shared/locales/lv/translation.json'),
            nl: require('../shared/locales/nl/translation.json'),
            no: require('../shared/locales/no/translation.json'),
            pl: require('../shared/locales/pl/translation.json'),
            pt_BR: require('../shared/locales/pt-BR/translation.json'),
            pt_PT: require('../shared/locales/pt-PT/translation.json'),
            ro: require('../shared/locales/ro/translation.json'),
            ru: require('../shared/locales/ru/translation.json'),
            sl: require('../shared/locales/sl/translation.json'),
            sv_SE: require('../shared/locales/sv-SE/translation.json'),
            tr: require('../shared/locales/tr/translation.json'),
            ur: require('../shared/locales/ur/translation.json'),
            vi: require('../shared/locales/vi/translation.json'),
            zh_CN: require('../shared/locales/zh-CN/translation.json'),
            zh_TW: require('../shared/locales/zh-TW/translation.json'),
        },
        interpolation: {
            escapeValue: false,
            format: function(value, format, lng) {
                if (format === 'uppercase') return value.toUpperCase();
                return value;
            },
        },
        react: {
            wait: false,
            bindI18n: 'languageChanged loaded',
            bindStore: 'added removed',
            nsMode: 'default',
        },
    },
    function(err, t) {
        if (err) {
            console.error(err);
        }
    },
);
