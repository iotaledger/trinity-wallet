import moment from 'moment';
import i18next from '../i18next';

if (!global.Intl) {
    global.Intl = require('intl'); // polyfill for `Intl`
}
const IntlRelativeFormat = require('intl-relativeformat');

export const formatTimeAs = {
    timeOnly: (time) => moment(time).format('LT'),
    hoursMinutesDayMonthYear: (time) => moment(time).format('HH:mm DD/MM/YYYY'),
    hoursMinutesSecondsDayMonthYear: (time) => moment(time).format('hh:mm:ss DD/MM/YYYY'),
};

export const formatDayAs = {
    dayMonthYear: (day) => moment(day).format('L'),
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

export const formatTime = (ts) => {
    const m = moment(ts).locale(i18next.languages);
    const rf = new IntlRelativeFormat(i18next.languages);
    if (isToday(ts)) {
        return m.format('LT');
    }
    if (isYesterday(ts)) {
        return rf.format(ts);
    }

    return formatDayAs.dayMonthYear(ts);
};

export const formatModalTime = (ts) => {
    return formatTimeAs.hoursMinutesDayMonthYear(ts);
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
