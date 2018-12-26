/**
 * Example: 23 => "D5"
 * @param index
 * @returns {string}
 */
export const presetIndexToXY = index => {
    let ii = parseInt(index);
    if (ii === 0) return "CUR";
    //TODO: check valid range
    let b = Math.floor((ii - 1) / 6);
    let i = (ii - 1) % 6 + 1;
    return String.fromCharCode(b + 65) + i.toString();
};

/**
 * Exampe: "D5" => 23
 * @param xy
 * @returns {number}
 */
export const presetXYToIndex = xy => {
    // if (xy === "CUR") return 0;
    //TODO: check valid range
    let bank = xy.charCodeAt(0) - 65;
    let num = parseInt(xy[1], 10);
    return bank * 6 + num;
};
