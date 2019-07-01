// The order here matters for right now :/
export const I18N_LOCALES = [
    'en',
    'ar',
    'cs',
    'da',
    'de',
    'el',
    'es_ES',
    'es_LA',
    'et',
    'fa',
    'fi',
    'fr',
    'he',
    'hi',
    'hr',
    'hu',
    'id',
    'it',
    'ja',
    'kn',
    'ko',
    'lt',
    'lv',
    'nl',
    'no',
    'pl',
    'pt_BR',
    'pt_PT',
    'ro',
    'ru',
    'sk',
    'sl',
    'sr',
    'sv_SE',
    'ta',
    'th',
    'tr',
    'ur',
    'vi',
    'zh_CN',
    'zh_TW',
];

export const I18N_LOCALE_LABELS = [
    'English (International)',
    'عربى - Arabic',
    'Čeština - Czech',
    'Dansk - Danish',
    'Deutsch - German',
    'Ελληνικά - Greek',
    'Español (España) - Spanish (Spain)',
    'Español (Latinoamérica) - Spanish (Latin America)',
    'Eesti keel - Estonian',
    'فارسی - Persian',
    'Suomi - Finnish',
    'Français - French',
    'עִברִית - Hebrew',
    'हिंदी - Hindi',
    'Hrvatski - Croatian',
    'Magyar - Hungarian',
    'Bahasa Indonesia - Indonesian',
    'Italiano - Italian',
    '日本語 - Japanese',
    'ಕನ್ನಡ - Kannada',
    '한국어 - Korean',
    'Lietuviškai - Lithuanian',
    'Latviešu - Latvian',
    'Nederlands - Dutch',
    'Norsk - Norwegian',
    'Polski - Polish',
    'Português (Brasil) - Portuguese (Brazil)',
    'Português (Portugal) - Portuguese (Portugal)',
    'Română - Romanian',
    'Pусский - Russian',
    'Slovenský - Slovak',
    'Slovenščina - Slovenian',
    'Srpski (Latinica) - Serbian (Latin)',
    'Svenska - Swedish',
    'தமிழ் - Tamil',
    'ไทย - Thai',
    'Türkçe - Turkish',
    'اردو - Urdu',
    'Tiếng Việt - Vietnamese',
    '中文 (简体) - Chinese (Simplified)',
    '中文 (繁體) - Chinese (Traditional)',
];

/**
 * Gets the locale code for a locale label
 * @param  {string} label Locale label
 * @return {string}       Locale code
 */
export const getLocaleFromLabel = (label) => {
    const languageIndex = I18N_LOCALE_LABELS.findIndex((l) => l === label);
    return I18N_LOCALES[languageIndex];
};

/**
 * Gets the locale label for a locale code
 * Returns 'English (International)' if the locale code does not have a label
 * @param  {string} locale Locale code
 * @return {string}        Locale label
 */
export const getLabelFromLocale = (locale) => {
    const languageIndex = I18N_LOCALES.findIndex((l) => l === locale);
    if (languageIndex === -1) {
        return 'English (International)';
    }
    return I18N_LOCALE_LABELS[languageIndex];
};

/**
 * Handles edge cases where the locale code reported by the OS may not match a Trinity locale code
 * @param  {string} locale Locale code reported by OS
 * @return {string}        Trinity locale code
 */
export const detectLocale = (locale) => {
    const adaptedLocale = locale.substring(0, 2);
    if (adaptedLocale === 'es' && !locale.match(/ES/)) {
        // Catch all non-Spain Spanish
        return 'es_LA';
    }
    if (locale.match(/ES/)) {
        // Spanish (Spain)
        return 'es_ES';
    }
    if (adaptedLocale === 'pt' && !locale.match(/BR/)) {
        // Catch all non-Brazillian Portuguese
        return 'pt_PT';
    }
    if (adaptedLocale === 'sv') {
        // Swedish (Sweden)
        return 'sv_SE';
    }
    if (adaptedLocale === 'zh' && !locale.match(/Hant/) && !locale.match(/TW/)) {
        // Catch all non-Traditional Chinese
        return 'zh_CN';
    }
    if (locale.match(/Hant/) || locale.match(/TW/)) {
        // Catch all Traditional Chinese
        return 'zh_TW';
    }
    if (adaptedLocale === 'nb') {
        // Norwegian Bokmål
        return 'no';
    }
    return adaptedLocale;
};
