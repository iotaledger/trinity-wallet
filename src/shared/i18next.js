import i18next from 'i18next';
//import LanguageDetector from 'i18next-browser-languagedetector';
const I18N_DEFAULT_LANGUAGE = 'en';

i18next
    //.use(LanguageDetector)
    .init(
        {
            fallbackLng: I18N_DEFAULT_LANGUAGE,
            fallbackNS: 'global',
            resources: {
                ar: require('./locales/ar/translation.json'),
                da: require('./locales/da/translation.json'),
                de: require('./locales/de/translation.json'),
                el: require('./locales/el/translation.json'),
                en: require('./locales/en/translation.json'),
                es_ES: require('./locales/es-ES/translation.json'),
                es_LA: require('./locales/es-LA/translation.json'),
                fi: require('./locales/fi/translation.json'),
                fr: require('./locales/fr/translation.json'),
                he: require('./locales/he/translation.json'),
                hi: require('./locales/hi/translation.json'),
                id: require('./locales/id/translation.json'),
                it: require('./locales/it/translation.json'),
                ja: require('./locales/ja/translation.json'),
                ko: require('./locales/ko/translation.json'),
                lv: require('./locales/lv/translation.json'),
                nl: require('./locales/nl/translation.json'),
                no: require('./locales/no/translation.json'),
                pl: require('./locales/pl/translation.json'),
                pt_BR: require('./locales/pt-BR/translation.json'),
                pt_PT: require('./locales/pt-PT/translation.json'),
                ro: require('./locales/ro/translation.json'),
                ru: require('./locales/ru/translation.json'),
                sl: require('./locales/sl/translation.json'),
                sv_SE: require('./locales/sv-SE/translation.json'),
                tr: require('./locales/tr/translation.json'),
                ur: require('./locales/ur/translation.json'),
                zh_CN: require('./locales/zh-CN/translation.json'),
                zh_TW: require('./locales/zh-TW/translation.json'),
            },
            interpolation: {
                escapeValue: false,
                format: function(value, format, lng) {
                    if (format === 'uppercase') return value.toUpperCase();
                    return value;
                },
            },
        },
        function(err, t) {
            if (err) {
                console.error(err);
            }
        },
    );

export default i18next;
