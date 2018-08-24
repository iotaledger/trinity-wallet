import i18next from 'i18next';
import { reactI18nextModule } from 'react-i18next';

export default i18next.use(reactI18nextModule).init(
    {
        fallbackLng: 'en',
        fallbackNS: 'global',
        debug: false,
        parseMissingKeyHandler: (value) => `Translation not available for ${value}`,
        resources: {
            ar: require('shared-modules/locales/ar/translation.json'),
            cs: require('shared-modules/locales/cs/translation.json'),
            da: require('shared-modules/locales/da/translation.json'),
            de: require('shared-modules/locales/de/translation.json'),
            el: require('shared-modules/locales/el/translation.json'),
            en: require('shared-modules/locales/en/translation.json'),
            es_ES: require('shared-modules/locales/es-ES/translation.json'),
            es_LA: require('shared-modules/locales/es-LA/translation.json'),
            et: require('shared-modules/locales/et/translation.json'),
            fi: require('shared-modules/locales/fi/translation.json'),
            fr: require('shared-modules/locales/fr/translation.json'),
            he: require('shared-modules/locales/he/translation.json'),
            hi: require('shared-modules/locales/hi/translation.json'),
            hr: require('shared-modules/locales/hr/translation.json'),
            id: require('shared-modules/locales/id/translation.json'),
            it: require('shared-modules/locales/it/translation.json'),
            ja: require('shared-modules/locales/ja/translation.json'),
            ko: require('shared-modules/locales/ko/translation.json'),
            lt: require('shared-modules/locales/lt/translation.json'),
            lv: require('shared-modules/locales/lv/translation.json'),
            nl: require('shared-modules/locales/nl/translation.json'),
            no: require('shared-modules/locales/no/translation.json'),
            pl: require('shared-modules/locales/pl/translation.json'),
            pt_BR: require('shared-modules/locales/pt-BR/translation.json'),
            pt_PT: require('shared-modules/locales/pt-PT/translation.json'),
            ro: require('shared-modules/locales/ro/translation.json'),
            ru: require('shared-modules/locales/ru/translation.json'),
            sk: require('shared-modules/locales/sk/translation.json'),
            sl: require('shared-modules/locales/sl/translation.json'),
            sv_SE: require('shared-modules/locales/sv-SE/translation.json'),
            ta: require('shared-modules/locales/ta/translation.json'),
            th: require('shared-modules/locales/th/translation.json'),
            tr: require('shared-modules/locales/tr/translation.json'),
            ur: require('shared-modules/locales/ur/translation.json'),
            vi: require('shared-modules/locales/vi/translation.json'),
            zh_CN: require('shared-modules/locales/zh-CN/translation.json'),
            zh_TW: require('shared-modules/locales/zh-TW/translation.json'),
        },
        interpolation: {
            escapeValue: false,
            format: (value, format) => {
                if (format === 'uppercase') {
                    return value.toUpperCase();
                }

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
    (err) => {
        if (err) {
            console.error(err);
        }
    },
);
