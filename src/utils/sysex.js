import {NEKTAR_TECHNOLOGY_INC} from "midi-manufacturers";
import {h, hs} from "./hexstring";
import {TARGETS, CONTROLS, checksum, SYSEX_HEADER} from "../pacer";
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
 * @param data Uint8Array
 */
function isSysexData(data) {
    // let view = new Uint8Array(data);
    // if (view[0] !== SYSEX_START) return false;
    // if (view[view.byteLength - 1] !== SYSEX_END) return false;
    if (data[0] !== SYSEX_START) return false;
    if (data[data.byteLength - 1] !== SYSEX_END) return false;
    return true;
}

/*
function getManufacturerName(id) {
    return id in midi_name ? midi_name[id] : "manufacturer unknown";
}
*/

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

    console.log("getControlLED", hs(data));

    // 54 01 00     54 == LED, 01 == 1 byte of data, 00 = data itself

    //
    // 40 01 00 00
    // 41 01 7F 00
    // 42 01 7F 00
    // 43 01 00
    // 68 F7

    // 0x40	<data>-MIDICtrl	Step 1: LED MIDI Ctrl
    // 0x41	<data>-Color	Step 1: LED Active Color
    // 0x42	<data>-Color	Step 1: LED Inactive Color
    // 0x43	<data>-LEDNum	Step 1: LED num

    let cfg = {steps:{}};

    let data_len;
    let bytes;
    let step;

    let i = 0;
    while (i<data.length) {
        let d = data[i];
        // let step = "" + ((d - 0x40) / 4 + 1);
        // if (i===0) console.log(`getControlLED: [${h(d)}], step ${step}`);
        if (i===0) {
            step = "" + ((d - 0x40) / 4 + 1);
            console.log(`getControlLED: [${h(d)}], step ${step}`);
        }
        // if (!(step in cfg.steps)) cfg.steps[step] = {led:{}};
        if (!(step in cfg.steps)) cfg.steps[step] = {};
        switch (d) {
            case 0x40:
            case 0x44:
            case 0x48:
            case 0x4C:
            case 0x50:
            case 0x54:
                i++;
                data_len = data[i];
                // console.log(`getControlLED: ${data_len} data byte(s)`);
                i++;
                if (data_len === 1) {
                    bytes = data[i];
                } else {
                    bytes = Array.from(data.slice(i, i + data_len));
                }
                // console.log(`getControlLED: data bytes=[${hs(bytes)}]`);
                i += data_len;
                // cfg.steps[step]["led"].midi_ctrl = bytes;
                cfg.steps[step]["led_midi_ctrl"] = bytes;
                break;
            case 0x41:
            case 0x45:
            case 0x49:
            case 0x4D:
            case 0x51:
            case 0x55:
                i++;
                data_len = data[i];
                // console.log(`getControlLED: ${data_len} data byte(s)`);
                i++;
                if (data_len === 1) {
                    bytes = data[i];
                } else {
                    bytes = Array.from(data.slice(i, i + data_len));
                }
                // console.log(`getControlLED: data bytes=[${hs(bytes)}]`);
                i += data_len;
                // cfg.steps[step]["led"].active_color = bytes;
                cfg.steps[step]["led_active_color"] = bytes;
                break;
            case 0x42:
            case 0x46:
            case 0x4A:
            case 0x4E:
            case 0x52:
            case 0x56:
                i++;
                data_len = data[i];
                // console.log(`getControlLED: ${data_len} data byte(s)`);
                i++;
                if (data_len === 1) {
                    bytes = data[i];
                } else {
                    bytes = Array.from(data.slice(i, i + data_len));
                }
                // console.log(`getControlLED: data bytes=[${hs(bytes)}]`);
                i += data_len;
                // cfg.steps[step]["led"].inactive_color = bytes;
                cfg.steps[step]["led_inactive_color"] = bytes;
                break;
            case 0x43:
            case 0x47:
            case 0x4B:
            case 0x4F:
            case 0x53:
            case 0x57:
                i++;
                data_len = data[i];
                // console.log(`getControlLED: ${data_len} data byte(s)`);
                i++;
                if (data_len === 1) {
                    bytes = data[i];
                } else {
                    bytes = Array.from(data.slice(i, i + data_len));
                }
                // console.log(`getControlLED: data bytes=[${hs(bytes)}]`);
                i += data_len;
                // cfg.steps[step]["led"].num = bytes;
                cfg.steps[step]["led_num"] = bytes;
                break;
            case 0x7F:
                // console.log(`getControlLED: end if data`);
                i = data.length;
                break;
            default:
                // console.log(`getControlLED: ignore byte ${h(d)}`);
                i++;
                break;
        }
    }

    console.log("getControlLED", cfg);
    return cfg;
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
            console.warn(`parseSysexMessage: invalid command (${h(cmd)})`);
            return null;
    }

    if (!(tgt in TARGETS)) {
        console.warn("parseSysexMessage: invalid target", h(tgt), tgt, TARGETS);
        return null;
    }

    message[tgt] = {};

    if (idx >= 0x19 && idx <= 0x7E) {
        console.warn("parseSysexMessage: invalid/ignored idx", idx);
    }

    message[tgt][idx] = {};

    if (!(obj in CONTROLS)) {
        console.warn("parseSysexMessage: invalid/ignored object", h(obj));
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
        console.warn('parseSysexMessage: invalid obj', obj);
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

        // console.log("LEM", e, h(e));

        if (e >= 0x01 && e <= 0x24) {

            // STEPS
            if (data.length > ELM+22) {
                let s = getControlStep(data.slice(ELM, ELM + 23));
                message[tgt][idx]["controls"][obj]["steps"][s.index] = s.config;
            } else {
                console.warn(`parseSysexMessage: data does not contains steps. data.length=${data.length}`, hs(data));
            }

        } else if (e === 0x60) {

            // CONTROL MODE
            console.log('parseSysexMessage: CONTROL MODE');

        // } else if (e === 0x40) {
        //
        //     // CONTROL MODE
        //     console.log('parseSysexMessage: LED MIDI CTRL');

        // } else if (e >= 0x61 && e <= 0x63) {
        } else if (e >= 0x40 && e <= 0x57) {

            // LED
            console.log('parseSysexMessage: LED');
            //message[tgt][idx]["controls"][obj]["led"] = getControlLED(data.slice(ELM, data.length-1 /*, ELM + 3*/ ));
            let led_cfg = getControlLED(data.slice(ELM, data.length-1));

            message[tgt][idx]["controls"][obj] = mergeDeep(message[tgt][idx]["controls"][obj], led_cfg);
            // message[tgt][idx]["controls"][obj]["steps"] = led_cfg;

        } else if (e === 0x7F) {

            // ALL
            console.log('parseSysexMessage: ALL');

        } else {
            console.warn(`parseSysexMessage: unknown element: ${h(e)}`);
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

    console.log("parseSysexDump", hs(data));

    if (data === null) return null;

    // let d = new Uint8Array(data);
    let d = data;   //TODO: use data variable
    let presets = {};   // Collection of presets. The key is the preset's index. The value is the preset.
    // let global = {};    // global conf

    // let k = data[0] === SYSEX_START ? 1 : 0;

    let i = 0;
    let cont = true;
    while (cont) {

        i = d.indexOf(SYSEX_START, i);
        if (i < 0) break;

        i++;

        let k = d.indexOf(SYSEX_END, i);

        let manufacturer_id = (Array.from(d.slice(i, i+3)).map(n => h(n))).join(" ");    // Array.from() is necessary to get a non-typed array
        if (manufacturer_id !== NEKTAR_TECHNOLOGY_INC) {
            console.log("parseSysexDump: file does not contain a Nektar Pacer patch", i, k, manufacturer_id, "-", hs(d));
            return null;
        }

        if (d[i+3] !== 0x7F) {
            console.warn(`parseSysexDump: invalid byte after manufacturer id: ${d[i+1 +3]}`);
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


/**
 * Return an array of sysex messages to update a control's steps.
 * @param presetIndex
 * @param controlId
 * @param steps
 * @returns {*}
 */
function buildControlStepSysex(presetIndex, controlId, steps) {

    console.log(`buildControlStepSysex(${presetIndex}, ${controlId}, ...)`);

    // 00 01 77
    // 7F SYSEX_HEADER
    // 01 cmd
    // 01 tgt
    // 05 presetIndex
    // 0D controlId
    // 01 01 00 00      channel
    // 02 01 43 00      msg type
    // 03 01 34 00      data 1
    // 04 01 7F 00      data 2
    // 05 01 00 00      data 3
    // 06 01 01         active

    let msgs = [];

    for (let i of Object.keys(steps)) {

        let step = steps[i];

        if (!step.changed) continue;

        let msg = [
            0x01,       // cmd                   // TODO: replace numbers by constants
            0x01,       // tgt is preset
            presetIndex,
            controlId];

        console.log(`buildControlStepSysex: i=${i}, ${h(i*6 + 1)}`);

        msg.push((i-1)*6 + 0x01, 0x01, step.channel, 0x00);
        msg.push((i-1)*6 + 0x02, 0x01, step.msg_type, 0x00);
        msg.push((i-1)*6 + 0x03, 0x01, step.data[0], 0x00);
        msg.push((i-1)*6 + 0x04, 0x01, step.data[1], 0x00);
        msg.push((i-1)*6 + 0x05, 0x01, step.data[2], 0x00);
        msg.push((i-1)*6 + 0x06, 0x01, step.active);

        let cs = checksum(msg);
        msg.push(cs);

        msgs.push(SYSEX_HEADER.concat(msg));
    }

    console.log("buildControlStepSysex", msgs);

    return msgs;
}


export {
    isSysexData,
    parseSysexDump,
    buildControlStepSysex
};

