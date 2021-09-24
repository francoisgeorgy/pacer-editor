
export const MAX_FILE_SIZE = 200 * 1024;

// export const MAX_STATUS_MESSAGES = 40;

export const wait = ms => new Promise(r => setTimeout(r, ms));

export function isVal(v) {
    return v !== undefined && v !== null && v !== '' && v >= 0;
}

export function sortObject(obj) {
    let arr = [];
    for (let prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            arr.push({
                'key': prop,
                'value': obj[prop]
            });
        }
    }
    arr.sort((a, b) => a.value.localeCompare(b.value));
    return arr;
}

export function object2Array(obj) {
    let arr = [];
    for (let prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            arr.push({
                'key': prop,
                'value': obj[prop]
            });
        }
    }
    return arr;
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat
// Array.isArray() does not work with typed arrays; replaced with typeof === 'object'
//
export function flatDeep(arr, d = 1) {
    // console.log("flatDeep", d);
    return d > 0 ?
               arr.reduce(
                   (acc, val) => acc.concat(typeof val === 'object' ? flatDeep(val, d - 1) : val), []
               ) :
           arr.slice();
}

export const dropOverlayStyle = {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    paddingTop: '4rem',
    background: 'rgba(0,0,0,0.4)',
    textAlign: 'center',
    color: '#fff',
    fontSize: '4rem'
};
