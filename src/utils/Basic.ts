import * as Express from 'express';
import { Socket } from 'socket.io';

export function keys<T, K extends keyof T>(object: T): K[] {
  return <K[]>Object.keys(object);
}

export function getIp(request: Express.Request | Socket) {
  if ((request as Express.Request).ip || (request as Express.Request).ips) {
    const req: Express.Request = request as any;
    let ip: string;
    if (!req.ips || (Array.isArray(req.ips) && req.ips.length < 1)) {
      ip = req.ip;
    } else {
      if (Array.isArray(req.ips)) {
        ip = req.ips[0];
      } else {
        ip = req.ips;
      }
    }
    if (ip.indexOf(":") != -1) {
      let parts = ip.split(":");
      ip = parts[parts.length - 1];
    }
    return ip;
  } else {
    // socket handling
    return (request as Socket).request.connection.remoteAddress;
  }

}

export function isValidIP(value: string): boolean {
  if (!value || value.trim() == "") {
    return false;
  }

  // split by .
  let parts = value.split('.');
  if (parts.length != 4) {
    return false;
  }

  for (let part of parts) {
    if (part.length < 1 || part.length > 3 || Number(part) < 0 || Number(part) > 255) {
      return false;
    }
  }

  return true;
}

export function camelToUnder(camel: string, toUpper?: boolean) {
  let under = camel.replace(/([a-z][A-Z])/g, function (g) { return g[0] + '_' + g[1].toLowerCase(); });
  if (toUpper) {
    return under.toUpperCase();
  }
  return under;
}

export function toSnakeCase(str: string) {
  if (!str || str.trim() == "") {
    return str;
  }

  return str.replace(/(?:([a-z])([A-Z]))|(?:((?!^)[A-Z])([a-z]))/g, "$1_$3$2$4").toUpperCase();
}

export function isEmpty(val: any, allowEmptyArrayOrObject?: boolean): boolean {
  if (val == null) {
    return true;
  }

  if (Array.isArray(val)) {
    if (val.length < 1 && !allowEmptyArrayOrObject) {
      return true;
    }
    return false;
  }

  // lets check for object
  if (val.constructor === Object) {
    if (Object.keys(val).length < 1 && !allowEmptyArrayOrObject) {
      return true;
    }
    return false;
  }

  if (String(val).trim() == "") {
    return true;
  }

  return false;
}

export function sortByKey<T>(array: T[], key: keyof T, type: 'asc' | 'desc' = 'asc', nullsLast?: boolean): T[] {
  array.sort((a, b) => {
    if (nullsLast) {
      if (a[key] != null && b[key] == null) {
        return -1;
      }
      if (b[key] != null && a[key] == null) {
        return 1;
      }
    }
    if (a[key] > b[key]) {
      return type == 'asc' ? 1 : -1;
    }
    if (b[key] > a[key]) {
      return type == 'asc' ? -1 : 1;
    }
    return 0;
  });
  return array;
}

export function objectPush<T>(arrayObject: { [key: string]: T[] }, key: string | number, ...objects: T[]): void {
  if (isEmpty(arrayObject, true)) {
    throw 'object must be provided';
  }
  if (isEmpty(arrayObject[key], true)) {
    arrayObject[key] = [];
  }
  arrayObject[key].push(...objects);
}

export function utf8CharsToAsci(text: string): string {
  const chars: { [char: string]: string } = { ā: 'a', č: 'c', ē: 'e', ģ: 'g', ī: 'i', ķ: 'k', ļ: 'l', ņ: 'n', š: 's', ū: 'u', ž: 'z' };
  let outText = '';
  for (let i = 0; i < text.length; i++) {
    const textChar = text[i];
    // add normalized char if the text char is one of utf8
    if (chars[textChar]) outText += chars[textChar];
    // add text cahr otherwise
    else outText += textChar;
  }

  return outText;
}

export function dateToString(date: Date, time?: boolean, timezone?: number): string {
  let year: number;
  let month: number;
  let day: number;
  if (timezone) {
    // get the date parts from UTC date since we will need to set correct timezone
    year = date.getUTCFullYear();
    month = date.getUTCMonth() + 1;
    day = date.getUTCDate();
  } else {
    // get the date parts
    year = date.getFullYear();
    month = date.getMonth() + 1;
    day = date.getDate();
  }

  // convert the parts to dd.mm.yyyy
  let result = `${addZero(day)}.${addZero(month)}.${year}`;
  if (time) {
    let hours: number;
    if (typeof timezone == "number") {
      // if timeozone is set, then set the year as utc hours plus the timezone
      hours = date.getUTCHours() + timezone;
    } else {
      // set the hours as received in the date
      hours = date.getHours()
    }
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    // add time to the result
    result += ` ${addZero(hours)}:${addZero(minutes)}:${addZero(seconds)}`;
  }
  return result;
}

export function stringToDate(str: string | Date): Date | undefined {
  // return input as is if it is already a Date
  if (str instanceof Date) return str;

  // date should be in format dd.MM.yyyy
  let parts = str.split(".");

  // return nothing if we didn't get 3 parts
  if (parts.length < 3) return undefined;

  // return nothing if any of the parts are not the correct elngth
  if (parts[0].length != 2 || parts[1].length != 2 || parts[2].length != 4) return undefined;

  const day = Number(parts[0]);
  const month = Number(parts[1]);
  const year = Number(parts[2]);

  // return nothing if any of the parts is not a valid number
  if (isNaN(day) || isNaN(month) || isNaN(year)) return undefined;

  // return nothing if month is more than 12 or day is more than 31
  if (day > 31 || month > 12) return undefined;

  // prepare the date from the parts
  let date = new Date();
  date.setUTCFullYear(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  date.setUTCHours(12);
  date.setUTCMinutes(0);
  date.setUTCSeconds(0);
  date.setUTCMilliseconds(0);
  return date;
}

export function parseStringAmount(amount: string | number): string | undefined {
  // return nothing if nothing was received
  if (amount == null) return undefined;

  // return string representation of the number, if input is of number type
  if (typeof amount == "number") return String(amount);

  // replace all known seperators to a .
  let val = amount.replace(/[\,\']/g, ".");

  // get the index of the last ., so that we know which dot should stay
  const index = val.lastIndexOf(".");

  // replaces all dots before the last one with empty string
  if (index != -1) val = val.substring(0, index).replace(/\./g, "") + val.substring(index);

  //  return nothing if the result string is not a valid number
  if (Number.isNaN(val)) return undefined;

  // return the parsed number as a string
  return val;
}

export function addZero(val: number | string): string {
  // return a string representation of the input if it was not a valid number
  if (isNaN(Number(val))) return String(val);

  // if the input is less tahn 10, add a leading 0
  return (Number(val) < 10) ? `0${val}` : String(val);
}