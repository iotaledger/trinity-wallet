import moment from 'moment/min/moment-with-locales.min.js';
import i18next from '../i18next';

export const formatTimeAs = {
    timeOnly: (locale, time) => {
        const m = moment.utc(time);
        locale = chooseMomentLocale(locale);
        m.locale(locale);
        return m.format('LT');
    },
    hoursMinutesDayMonthYear: (locale, time) => {
        const m = moment.utc(time);
        locale = chooseMomentLocale(locale);
        m.locale(locale);
        return m.format('LT L');
    },
    hoursMinutesSecondsDayMonthYear: (locale, time) => {
        const m = moment.utc(time);
        locale = chooseMomentLocale(locale);
        m.locale(locale);
        return m.format('LTS L');
    },
};

export const formatDayAs = {
    dayMonthYear: (locale, day) => {
        const m = moment.utc(day);
        locale = chooseMomentLocale(locale);
        m.locale(locale);
        return m.format('L');
    },
};

export const isToday = (day) => moment.utc().isSame(moment(day), 'day');

export const convertUnixTimeToDateObject = (time) => moment.unix(time);

export const isYesterday = (day) => {
    const yesterday = moment.utc().subtract(1, 'day');
    return moment.utc(day).isSame(yesterday, 'day');
};

export const isMinutesAgo = (time, minutes) => {
    return moment.utc(time).isBefore(moment().subtract(minutes, 'minutes'));
};

export const isValid = (dateString, format = 'YYYY MMM DD') => moment(dateString, format).isValid();

export const getCurrentYear = () => new Date().getFullYear();

export const formatTime = (locale, ts) => {
    const m = moment.utc(ts);
    locale = chooseMomentLocale(locale);
    m.locale(locale);
    if (isToday(ts)) {
        return m.format('LT');
    }
    if (isYesterday(ts)) {
        return i18next.t('history:yesterday');
    }

    return formatDayAs.dayMonthYear(locale, ts);
};

export const formatModalTime = (locale, ts) => {
    return formatTimeAs.hoursMinutesDayMonthYear(locale, ts);
};

export const convertUnixTimeToJSDate = (time) => convertUnixTimeToDateObject(time);

/**
 *   Checks if time falls within specified minutes
 *
 *   @method isWithinMinutes
 *   @param {number} time
 *   @param {number} minutes
 *   @returns {boolean}
 **/
export const isWithinMinutes = (time, minutes) => {
    const now = Date.now();
    const lessThanMinutesAgo = now - minutes * 60 * 1000;

    return time > lessThanMinutesAgo;
};

/**
 * Checks if the device locale is available in moment and returns the locale to be loaded
 * Mitigates https://github.com/moment/moment/issues/4027
 * @param  {string} locale locale to be checked
 * @return {string}        locale to be loaded by moment
 */
const chooseMomentLocale = (locale) => {
    locale = locale.toLowerCase();
    if (moment.locales().includes(locale)) {
        return locale;
    } else if (moment.locales().includes(locale.substring(0, 2))) {
        return locale.substring(0, 2);
    }
    return 'en-gb';
};
