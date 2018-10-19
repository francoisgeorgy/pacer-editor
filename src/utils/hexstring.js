
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

export const b = v => {
    return padZero(v.toString(2), 8);
};

export const b7 = v => {
    return padZero(v.toString(2), 7);    // 7 bits !!!
};

export const h = v => {
    return padZero(v.toString(16).toUpperCase(), 2);
};

export const hs = data => (Array.from(data).map(n => h(n))).join(" ");    // Array.from() is necessary to get a non-typed array
