import moment from 'moment-timezone';
import 'moment/min/locales';
import i18next from './i18next';

export const formatTimeAs = {
    timeOnly: (locale, timezone, time) => {
        const m = moment.tz(time, timezone);
        locale = chooseMomentLocale(locale);
        m.locale(locale);
        return m.format('LT');
    },
    hoursMinutesDayMonthYear: (locale, timezone, time) => {
        const m = moment.tz(time, timezone);
        locale = chooseMomentLocale(locale);
        m.locale(locale);
        return m.format('LT L');
    },
    hoursMinutesSecondsDayMonthYear: (locale, timezone, time) => {
        const m = moment.tz(time, timezone);
        locale = chooseMomentLocale(locale);
        m.locale(locale);
        return m.format('LTS L');
    },
    dayMonthYearHoursMinutes: (locale, timezone, time) => {
        const m = moment.tz(time, timezone);
        locale = chooseMomentLocale(locale);
        m.locale(locale);
        return m.format('L LT');
    },
};

export const formatDayAs = {
    dayMonthYear: (locale, timezone, day) => {
        const m = moment.tz(day, timezone);
        locale = chooseMomentLocale(locale);
        m.locale(locale);
        return m.format('L');
    },
};

export const isToday = (day, timezone) => moment.tz(timezone).isSame(moment(day), 'day');

export const convertUnixTimeToDateObject = (time) => moment.unix(time);

export const isYesterday = (day, timezone) => {
    const yesterday = moment.tz(timezone).subtract(1, 'day');
    return moment.tz(day, timezone).isSame(yesterday, 'day');
};

export const isMinutesAgo = (time, timezone, minutes) => {
    return moment.tz(time, timezone).isBefore(moment().subtract(minutes, 'minutes'));
};

export const isValid = (dateString, format = 'YYYY MMM DD') => moment(dateString, format).isValid();

export const getCurrentYear = () => new Date().getFullYear();

export const formatTime = (locale, timezone, ts) => {
    const m = moment.tz(ts, timezone);
    locale = chooseMomentLocale(locale);
    m.locale(locale);
    if (isToday(ts)) {
        return m.format('LT');
    }
    if (isYesterday(ts)) {
        return i18next.t('history:yesterday');
    }

    return formatDayAs.dayMonthYear(locale, timezone, ts);
};

export const formatModalTime = (locale, timezone, ts) => {
    return formatTimeAs.hoursMinutesDayMonthYear(locale, timezone, ts);
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

export const detectedTimezone = moment.tz.guess();
