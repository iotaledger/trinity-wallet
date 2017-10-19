import { isToday, isYesterday, formatTimeAs, formatDayAs } from './dateUtils';

export const formatTime = ts => {
    if (isToday(ts)) {
        return formatTimeAs.twelveHours(ts);
    } else if (isYesterday(ts)) {
        return 'Yesterday';
    }

    return formatDayAs.dayMonthYear(ts);
};

export const formatModalTime = ts => {
    return formatTimeAs.hoursMinutesDayMonthYear(ts);
};

export const formatValue = value => {
    var negative = false;
    if (value < 0) {
        negative = true;
        value = -value;
    }
    switch (true) {
        case value < 1000:
            break;
        case value < 1000000:
            value /= 1000;
            break;
        case value < 1000000000:
            value /= 1000000;
            break;
        case value < 1000000000000:
            value /= 1000000000;
            break;
        case value < 1000000000000000:
            value /= 1000000000000;
            break;
    }
    if (negative == true) {
        return -value;
    } else {
        return value;
    }
};

export const formatUnit = value => {
    const unit = '';
    switch (true) {
        case value < 1000:
            return 'i';
        case value < 1000000:
            return 'Ki';
        case value < 1000000000:
            return 'Mi';
        case value < 1000000000000:
            return 'Gi';
        case value < 1000000000000000:
            return 'Ti';
    }
};

export function formatIota(value) {
    const iota = formatValue(value);
    const unit = formatUnit(value);
    const formatted = `${iota} ${unit}`;
    return formatted;
}

export function round(value, precision) {
    const multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

export const isValidServerAddress = server => {
    if (!server.startsWith('http://') && !server.startsWith('https://')) {
        return false;
    }
    return true;
};

export const isValidSeed = seed => /^[A-Z9]{81}$/.test(seed);

export const guid = () => {
    const s4 = () =>
        Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
};

export const createRandomSeed = (randomBytesFn, length = 81) => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9';
    const bytes = randomBytesFn(100);
    let seed = '';

    if (length > 81 || length < 1) {
        length = 81;
    }

    Object.keys(bytes).forEach(key => {
        if (bytes[key] < 243 && seed.length < length) {
            const randomNumber = bytes[key] % 27;
            const randomLetter = charset.charAt(randomNumber);
            seed += randomLetter;
        }
    });

    return seed;
};

export const getCurrentYear = () => new Date().getFullYear();

export const isValidPassword = (password = '') => password.length >= 12;

/*
    Exports for utils that reside in other files
 */
export accountUtils from './accountUtils';
