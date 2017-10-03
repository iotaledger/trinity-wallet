import i18next from 'i18next';

const I18N_DEFAULT_LANGUAGE = 'en';

export default i18next
    .init({
        // lng: I18N_DEFAULT_LANGUAGE,
        fallbackLng: I18N_DEFAULT_LANGUAGE,
        fallbackNS: 'Common',
        parseMissingKeyHandler: (missing) => `MISSING TRANSLATION: ${missing}`,
        resources: {
            de: { 'Common': require('../../../shared/locales/de/translation.json') },
            en: { 'Common': require('../../../shared/locales/en/translation.json') },
            'es-ES': { 'Common': require('../../../shared/locales/es-ES/translation.json') },
            fr: { 'Common': require('../../../shared/locales/fr/translation.json') },
        },
    });
