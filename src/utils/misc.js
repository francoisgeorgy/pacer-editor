
export const MAX_FILE_SIZE = 200 * 1024;

// export const MAX_STATUS_MESSAGES = 40;

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
