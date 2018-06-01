import moment from 'moment';

export const formatTimeAs = {
    twentyFourHours: (time) => moment(time).format('HH:mm'),
    hoursMinutesDayMonthYear: (time) => moment(time).format('HH:mm DD/MM/YYYY'),
    hoursMinutesSecondsDayMonthYear: (time) => moment(time).format('hh:mm:ss DD/MM/YYYY'),
};

export const formatDayAs = {
    dayMonthYear: (day) => moment(day).format('DD/MM/YYYY'),
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
    if (isToday(ts)) {
        return formatTimeAs.twentyFourHours(ts);
    } else if (isYesterday(ts)) {
        return 'Yesterday';
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
