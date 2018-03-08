export function detectLocale(locale) {
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
    if (adaptedLocale === 'zh' && !locale.match(/Hant/)) {
        // Catch all non-Traditional Chinese
        return 'zh_CN';
    }
    if (locale.match(/Hant/)) {
        // Catch all Traditional Chinese
        return 'zh_TW';
    }
    if (adaptedLocale === 'nb') {
        // Norwegian Bokmål
        return 'no';
    }
    return adaptedLocale;
}

export function selectLocale(lang) {
    if (lang === 'ar') {
        return 'عربى - Arabic';
    }
    if (lang === 'da') {
        return 'Dansk - Danish';
    }
    if (lang === 'de') {
        return 'Deutsch - German';
    }
    if (lang === 'el') {
        return 'Ελληνικά - Greek';
    }
    if (lang === 'es_ES') {
        return 'Español (España) - Spanish (Spain)';
    }
    if (lang === 'es_LA') {
        return 'Español (Latinoamérica) - Spanish (Latin America)';
    }
    if (lang === 'fi') {
        return 'Suomi - Finnish';
    }
    if (lang === 'fr') {
        return 'Français - French';
    }
    if (lang === 'he') {
        return 'עִברִית - Hebrew';
    }
    if (lang === 'hi') {
        return 'हिंदी - Hindi';
    }
    if (lang === 'id') {
        return 'Bahasa Indonesia - Indonesian';
    }
    if (lang === 'it') {
        return 'Italiano - Italian';
    }
    if (lang === 'ja') {
        return '日本語 - Japanese';
    }
    if (lang === 'ko') {
        return '한국어 - Korean';
    }
    if (lang === 'lv') {
        return 'Latviešu - Latvian';
    }
    if (lang === 'nl') {
        return 'Nederlands - Dutch';
    }
    if (lang === 'no') {
        return 'Norsk - Norwegian';
    }
    if (lang === 'pl') {
        return 'Polski - Polish';
    }
    if (lang === 'pt_BR') {
        return 'Português (Brasil) - Portuguese (Brazil)';
    }
    if (lang === 'pt_PT') {
        return 'Português (Portugal) - Portuguese (Portugal)';
    }
    if (lang === 'ro') {
        return 'Română - Romanian';
    }
    if (lang === 'ru') {
        return 'Pусский - Russian';
    }
    if (lang === 'sl') {
        return 'Slovenščina - Slovenian';
    }
    if (lang === 'sv_SE') {
        return 'Svenska - Swedish';
    }
    if (lang === 'tr') {
        return 'Türkçe - Turkish';
    }
    if (lang === 'ur') {
        return 'اردو - Urdu';
    }
    if (lang === 'vi') {
        return 'Tiếng Việt - Vietnamese';
    }
    if (lang === 'zh_CN') {
        return '中文 (简体) - Chinese (Simplified)';
    }
    if (lang === 'zh_TW') {
        return '中文 (繁體) - Chinese (Traditional)';
    }
    return 'English (International)';
}
