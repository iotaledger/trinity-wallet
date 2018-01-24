// The order here matters for right now :/
export const I18N_LOCALES = [
    'en',
    'ar',
    'da',
    'de',
    'el',
    'es_ES',
    'es_LA',
    'fi',
    'fr',
    'he',
    'hi',
    'id',
    'it',
    'ja',
    'ko',
    'lv',
    'nl',
    'no',
    'pl',
    'pt_BR',
    'pt_PT',
    'ro',
    'ru',
    'sl',
    'sv_SE',
    'tr',
    'ur',
    'zh_CN',
    'zh_TW'
];

export const I18N_LOCALE_LABELS = [
    'English (International)',
    'عربى - Arabic',
    'Dansk - Danish',
    'Deutsch - German',
    'Ελληνικά - Greek',
    'Español (España) - Spanish (Spain)',
    'Español (Latinoamérica) - Spanish (Latin America)',
    'Suomi - Finnish',
    'Français - French',
    'עִברִית - Hebrew',
    'हिंदी - Hindi',
    'Bahasa Indonesia - Indonesian',
    'Italiano - Italian',
    '日本語 - Japanese',
    '한국어 - Korean',
    'Latviešu - Latvian',
    'Nederlands - Dutch',
    'Norsk - Norwegian',
    'Polski - Polish',
    'Português (Brasil) - Portuguese (Brazil)',
    'Português (Portugal) - Portuguese (Portugal)',
    'Română - Romanian',
    'Pусский - Russian',
    'Slovenščina - Slovenian',
    'Svenska - Swedish',
    'Türkçe - Turkish',
    'اردو - Urdu',
    '中文 (简体) - Chinese (Simplified)',
    '中文 (繁體) - Chinese (Traditional)'
];

export const getLocaleFromLabel = label => {
    const languageIndex = I18N_LOCALE_LABELS.findIndex(l => l === label);
    return I18N_LOCALES[languageIndex];
};
