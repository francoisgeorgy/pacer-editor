import midi_name, {NEKTAR_TECHNOLOGY_INC} from "midi-manufacturers";
import {h, hs} from "./hexstring";
import {TARGETS, CONTROLS} from "../pacer";
export const SYSEX_START = 0xF0;
export const SYSEX_END = 0xF7;

// offsets from start of sysex data, right after SYSEX_START
const CMD = 4;
const TGT = 5;
const IDX = 6;
const OBJ = 7;
const ELM = 8;

/**
 * https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge/34749873#34749873
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge/34749873#34749873
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export function mergeDeep(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                mergeDeep(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return mergeDeep(target, ...sources);
}

/**
 *
 * @param data ArrayBuffer
 */
function isSysexData(data) {
    let view = new Uint8Array(data);
    if (view[0] !== SYSEX_START) return false;
    if (view[view.byteLength - 1] !== SYSEX_END) return false;
    return true;
}

function getManufacturerName(id) {
    return id in midi_name ? midi_name[id] : "manufacturer unknown";
}

function getControlStep(data) {

    // console.log("getControlStep", hs(data));

    // 01 01 0F 00      midi channel
    // 02 01 47 00      message type
    // 03 01 44 00      data 1
    // 04 01 55 00      data 2
    // 05 01 66 00      data 3
    // 06 01 01         active

    // the second byte is the length of the data that follows

    //FIXME: use length

    return {
        index: (data[0] - 1) / 6 + 1,
        config: {
            channel: data[2],
            msg_type: data[6],
            data: [data[10], data[14], data[18]],
            active: data[22]
        }
    };
}


function getControlLED(data) {

    // console.log("getControlLED", hs(data));

    // 01 01 0F 00      midi channel
    // 02 01 47 00      message type
    // 03 01 44 00      data 1
    // 04 01 55 00      data 2
    // 05 01 66 00      data 3
    // 06 01 01         active

    // we ignore the first byte, which seems to always be 0x01

    return {
        midi: data[2],
        on_color: data[6],
        off_color: data[10]
    };
}


/**
 * Parse a single sysex message
 * @param data
 * @returns {*}
 */
function parseSysexMessage(data) {

    // console.log("parseSysex", hs(data));

    //TODO: verify checksum

    const message = {};

    let cmd = data[CMD];
    let tgt = data[TGT];
    let idx = data[IDX];
    let obj = data[OBJ];

    switch (cmd) {
        case 0x01:
            // console.log(`command is set_data (${h(cmd)})`);
            break;
        case 0x02:
            // console.log(`command is get_data (${h(cmd)})`);
            break;
        default:
            console.warn(`invalid command (${h(cmd)})`);
            return null;
    }

    if (!(tgt in TARGETS)) {
        console.warn("invalid target", h(tgt), tgt, TARGETS);
        return null;
    }

    message[tgt] = {};

    if (idx >= 0x19 && idx <= 0x7E) {
        console.warn("invalid/ignored idx", idx);
    }

    message[tgt][idx] = {};

    if (!(obj in CONTROLS)) {
        console.warn("invalid/ignored object", h(obj));
        return null;
    }

    let obj_type;
    if (obj === 0x01) {
        obj_type = "name";
    } else if ((obj >= 0x0D && obj <= 0x12) ||
        (obj >= 0x14 && obj <= 0x1B) ||
        (obj >= 0x36 && obj <= 0x37)) {
        obj_type = "control";
    } else if (obj === 0x7E) {
        obj_type = "midi";
    } else {
        console.warn('invalid obj', obj);
        return null;
    }

    // console.log(`target=${TARGET[tgt]} (${h(tgt)}), idx=${h(idx)}, object=${OBJECT[obj]} (${h(obj)}), type=${obj_type}`);
    console.log(`${TARGETS[tgt]} ${h(idx)} : ${CONTROLS[obj]} ${obj_type}`);

    if (obj_type === "name") {
        //TODO: parse name
    }

    if (obj_type === "control") {

        message[tgt][idx]["controls"] = {
            [obj]: {
                steps: {}
            }
        };

        // which element?
        let e = data[ELM];
        if (e >= 0x01 && e <= 0x24) {

            // STEPS
            if (data.length > ELM+22) {
                let s = getControlStep(data.slice(ELM, ELM + 23));
                message[tgt][idx]["controls"][obj]["steps"][s.index] = s.config;
            } else {
                console.warn(`data does not contains steps. data.length=${data.length}`, hs(data));
            }

        } else if (e === 0x60) {

            // CONTROL MODE
            console.log('CONTROL MODE');

        } else if (e === 0x40) {

            // CONTROL MODE
            console.log('LED MIDI CTRL');

        // } else if (e >= 0x61 && e <= 0x63) {
        } else if (e >= 0x41 && e <= 0x43) {

            // LED
            console.error('LED');
            message[tgt][idx]["controls"][obj]["led"] = getControlLED(data.slice(ELM, ELM + 3));

        } else if (e === 0x7F) {

            // ALL
            console.log('ALL');

        } else {
            console.warn(`unknown element: ${h(e)}`);
            return null;
        }

    }

    if (obj_type === "midi") {
        //TODO: parse midi
    }

    // console.log('MESSAGE', message);

    return message;

} // parseSysex()


/**
 * Parse a sysex dump. A dump can contains multiple sysex messages.
 * Return a array of presets.
 * @param data ArrayBuffer
 */
function parseSysexDump(data) {

    // console.log(`parseSysexData`, data);
    console.log("parseSysexData");

    if (data === null) return null;

    let d = new Uint8Array(data);
    let presets = {};   // Collection of presets. The key is the preset's index. The value is the preset.
    let global = {};    // global conf

    let i = 0;
    let cont = true;
    while (cont) {

        i = d.indexOf(SYSEX_START, i);
        if (i < 0) break;

        i++;

        let k = d.indexOf(SYSEX_END, i);

        let manufacturer_id = (Array.from(d.slice(i, i+3)).map(n => h(n))).join(" ");    // Array.from() is necessary to get a non-typed array
        if (manufacturer_id !== NEKTAR_TECHNOLOGY_INC) {
            console.log("file does not contain a Nektar Pacer patch");
            return null;
        }

        if (d[i+3] !== 0x7F) {
            console.warn(`invalid byte after manufacturer id: ${d[i+3]}`);
            return null;
        }

        let config = parseSysexMessage(d.slice(i, k));  // d.slice(i, k) are the data between SYSEX_START and SYSEX_END

        if (config) {
            mergeDeep(presets, config);
        }

    }

    // console.log(JSON.stringify(presets));

    return presets;

}


export {
    isSysexData,
    parseSysexDump
};

