
/*
String.prototype.padZero = function (len, c) {
    var s = '', c = c || '0', len = (len || 2) - this.length;
    while (s.length < len) s += c;
    return s + this;
};
*/

export const padZero = (str, len, char) => {
    let s = '';
    let c = char || '0';
    let n = (len || 2) - str.length;
    while (s.length < n) s += c;
    return s + str;
};

export const h = v => {
    // return (v === null || v === undefined) ? "" : padZero(v.toString(16).toUpperCase(), 2);
    return (v === null || v === undefined) ? "" : padZero(v.toString(16), 2);
};

export const hs = data => (data === null || data === undefined) ? "" : (Array.from(data).map(n => h(n))).join(" ");    // Array.from() is necessary to get a non-typed array


/**
 *
 * @param string
 * @param sep
 * @returns {*}
 */
export const fromHexString = function(string, sep) {
    let s = sep ? string.replace(sep, '') : string;
    if ((s.length % 2) > 0) {
        return null;
    }
    if (s.length === 0) return null;
    let a = new Uint8Array(s.length / 2);
    for (let i=0; i < (s.length / 2); i++) {
        a[i] = parseInt(s.substr(i * 2, 2), 16);
    }
    return a;
};

export const toHexDump = function(data, width = 16) {
    let s = [];
    if (!data || data.length < 1) return s;
    let i = 0;
    do {
        s.push(`${padZero(i.toString(width), 8)}: ${hs(data.slice(i, i+width))}`);
        i+= width;
    } while (i < data.length);
    return s;
}
