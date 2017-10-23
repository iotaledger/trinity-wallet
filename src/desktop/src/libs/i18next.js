import i18next from 'i18next';

const I18N_DEFAULT_LANGUAGE = 'en';

export default i18next.init({
    // lng: I18N_DEFAULT_LANGUAGE,
    fallbackLng: I18N_DEFAULT_LANGUAGE,
    fallbackNS: 'Common',
    parseMissingKeyHandler: missing => `NOT TRANSLATED: ${missing}`,
    resources: {
        de: require('../../../shared/locales/de/translation.json'),
        en: require('../../../shared/locales/en/translation.json'),
        es: require('../../../shared/locales/es/translation.json'),
    },
});
