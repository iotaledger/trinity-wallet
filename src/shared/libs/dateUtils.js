import moment from 'moment';

export const formatTimeAs = {
    twelveHours: (time) => moment(time).format('h:mm a'),
    hoursMinutesDayMonthYear: (time) => moment(time).format('hh:mm DD/MM/YYYY'),
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
        return formatTimeAs.twelveHours(ts);
    } else if (isYesterday(ts)) {
        return 'Yesterday';
    }
    return formatDayAs.dayMonthYear(ts);
};

export const formatModalTime = (ts) => {
    return formatTimeAs.hoursMinutesDayMonthYear(ts);
};

export const convertUnixTimeToJSDate = (time) => convertUnixTimeToDateObject(time);
