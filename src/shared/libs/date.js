import moment from 'moment/min/moment-with-locales.min.js';

if (!global.Intl) {
    global.Intl = require('intl'); // polyfill for `Intl`
}
const IntlRelativeFormat = require('intl-relativeformat');

export const formatTimeAs = {
    timeOnly: (locale, time) => {
        const m = moment(time).locale(locale);
        return m.format('LT');
    },
    hoursMinutesDayMonthYear: (locale, time) => {
        const m = moment(time).locale(locale);
        return m.format('LT L');
    },
    hoursMinutesSecondsDayMonthYear: (locale, time) => {
        const m = moment(time).locale(locale);
        return m.format('LTS L');
    },
};

export const formatDayAs = {
    dayMonthYear: (locale, day) => {
        const m = moment(day).locale(locale);
        return m.format('L');
    },
};

export const isToday = (day) => moment().isSame(moment(day), 'day');

export const convertUnixTimeToDateObject = (time) => moment.unix(time);

export const isYesterday = (day) => {
    const yesterday = moment().subtract(1, 'day');
    return moment(day).isSame(yesterday, 'day');
};

export const isMinutesAgo = (time, minutes) => {
    return moment(time).isBefore(moment().subtract(minutes, 'minutes'));
};

export const isValid = (dateString, format = 'YYYY MMM DD') => moment(dateString, format).isValid();

export const getCurrentYear = () => new Date().getFullYear();

export const formatTime = (locale, ts) => {
    const m = moment.utc(ts);
    m.locale([locale, locale.substring(0, 2), 'en-gb']);
    const rf = new IntlRelativeFormat([locale, locale.substring(0, 2), 'en-UK']);
    if (isToday(ts)) {
        return m.format('LT');
    }
    if (isYesterday(ts)) {
        return rf.format(ts);
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
