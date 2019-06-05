export const isDefined = obj => obj !== null && obj !== undefined;
export const isFunction = value => typeof value === 'function';
export const isString = value => typeof value === 'string';
export const isNumber = value => typeof value === 'number' && !isNaN(value);
export const isInteger = value => isNumber(value) && value % 1 === 0;
export const isArray = value => ({}.toString.call(value) === '[object Array]');
export const isObject = obj => obj === Object(obj);
export const isBoolean = value => typeof value === 'boolean';
export const isDate = obj => obj instanceof Date;
export const isPromise = obj => !!obj && isFunction(obj.then);

export const isEmpty = value => {
    var attr;
    if (!isDefined(value)) {
        return true;
    }
    if (isFunction(value)) {
        return false;
    }
    if (isString(value)) {
        return /^\s*$/.test(value);
    }
    if (isArray(value)) {
        return value.length === 0;
    }
    if (isDate(value)) {
        return false;
    }
    if (isObject(value)) {
        for (attr in value) {
            return false;
        }
        return true;
    }

    return false;
}

const EMAIL_PATTERN = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/i;

export const isEmail = value => {
    if (!isDefined(value)) {
        return false;
    }
    if (!isString(value)) {
        return false;
    }
    if (!EMAIL_PATTERN.exec(value)) {
        return false;
    }
    return true;
}

