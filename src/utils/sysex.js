import midi_name, {NEKTAR_TECHNOLOGY_INC} from "midi-manufacturers";
import {h, hs} from "./hexstring";
import {CONTROL_ELEMENT, MIDI_ELEMENT, OBJECT, TARGET} from "../pacer";

export const SYSEX_START = 0xF0;
export const SYSEX_END = 0xF7;

// offset from start of sysex data, right after SYSEX_START

const CMD = 4;
const TGT = 5;
const IDX = 6;
const OBJ = 7;
const ELM = 8;

/**
 *
 * @param data ArrayBuffer
 */
function isSysexData(data) {
    let view = new DataView(data);
    if (view.getUint8(0) !== SYSEX_START) return false;
    if (view.getUint8(data.byteLength - 1) !== SYSEX_END) return false;

    //TODO: check that all bytes have msb=0 (only 7 bits values)

    return true;
}

function getManufacturerName(id) {
    return id in midi_name ? midi_name[id] : "manufacturer unknown";
}


function parseData(data) {

    const preset = {
        command: null,
        target: null,
        index: null,
        element: null,
        data: null
    };

    console.log("parseData", hs(data));

    let cmd = data[CMD];
    let tgt = data[TGT];
    let idx = data[IDX];
    let obj = data[OBJ];
    let elm = data[ELM];

    // console.log(h(cmd), h(tgt), h(idx), h(obj));

    switch (cmd) {
        case 0x01:
            console.log("set data");
            break;
        case 0x02:
            console.log("get data");
            break;
        default:
            console.log("invalid cmd", cmd);
            return null;
    }

    preset.command = cmd;

    if (tgt in TARGET) {
        console.log(`target is ${TARGET[tgt]}`);
    } else {
        console.log("invalid target", h(tgt));
        return null;
    }

    preset.target = tgt;

    //
    // switch (tgt) {
    //     case 0x01:
    //         console.log("target is preset");
    //         break;
    //     case 0x05:
    //         console.log("target is global");
    //         break;
    //     case 0x07:
    //         console.log("target is full backup");
    //         break;
    //     default:
    //         console.log("invalid target", tgt);
    //         break;
    // }

    if (idx >= 0x19 && idx <= 0x7E) {
        console.log("invalid/ignored idx", idx);
    }

    console.log(`idx is ${idx}`);

    preset.index = idx;

    if (obj in OBJECT) {
        console.log(`target is ${OBJECT[obj]}`);
    } else {
        console.log("invalid/ignored object", h(obj));
        return null;
    }

    preset.obj = obj;

    let control_elm;
    switch (true) {
        case (obj >= 0x0D && obj <= 0x12) ||
             (obj >= 0x14 && obj <= 0x1B) ||
             (obj >= 0x36 && obj <= 0x37):
            console.log('CONTROL');
            control_elm = CONTROL_ELEMENT;
            preset.element_type = "control";
            break;
        case obj === 0x7E:
            console.log('MIDI');
            control_elm = MIDI_ELEMENT;
            preset.element_type = "MIDI";
            break;
        default:
            console.log('invalid obj', obj);
            return;
    }

    if (elm in control_elm) {
        console.log(`element is ${control_elm[elm]}`);
    } else {
        console.log("invalid/ignored element", h(elm));
    }

    preset.element = elm;

    preset.data = data.slice(ELM+1);

    console.log("data", hs(data.slice(ELM+1)));

    return preset;

} // parseData()


/**
 * Return a array of patches.
 * @param data ArrayBuffer
 */
function parseSysexData(data) {

    // console.log(`parseSysexData`, data);

    if (data === null) return null;

    let d = new Uint8Array(data);
    let patches = [];
    // let patch = {};
    // let offset = 0;
    // let multi_bytes_id = false;
    // let dd;

    let i = 0;
    let cont = true;
    while (cont) {

        i = d.indexOf(SYSEX_START, i);
        if (i < 0) break;

        i++;

        let k = d.indexOf(SYSEX_END, i);

        // console.log(h(d[i]), h(d[k]), d.length);

        let manufacturer_id = (Array.from(d.slice(i, i+3)).map(n => h(n))).join(" ");    // Array.from() is necessary to get a non-typed array
        if (manufacturer_id !== NEKTAR_TECHNOLOGY_INC) {
            console.log("file does not contain a Nektar Pacer patch");
            return null;
        }

        if (d[i+3] !== 0x7F) {
            console.log(`invalid byte after manufacturer id: ${d[i+3]}`);
            return null;
        }

        //console.log(h(d[i+4]));
        //cont = false;

        let preset = parseData(d.slice(i, k));       // d.slice(i, k) are the data between SYSEX_START and SYSEX_END

        if (preset) {
            patches.push(preset);
        }

    }



    /*
        let manufacturer_id = (Array.from(d.slice(1, 4)).map(n => n.toString(16).padStart(2, "0"))).join(" ");    // Array.from() is necessary to get a non-typed array

        console.log(manufacturer_id);

        if (manufacturer_id !== NEKTAR_TECHNOLOGY_INC) {
            console.log("file does not contain a Nektar Pacer patch");
            return [];
        }

        patches = manufacturer_id;

        if (d[i] === SYSEX_START) {
            patch = {};                     // new patch
            dd = [];
            offset = i;
            continue;
        }
    */

/*
    for (let i = 0; i < d.length; i++) {



        if (d[i] === SYSEX_START) {
            patch = {};                     // new patch
            dd = [];
            offset = i;
            continue;
        }

        let k = i - offset; // relative index (index for the current patch)

        if (k === 1) {
            if (patch === undefined) {
                console.error("invalid sysex data");
                break;
            }
            if (d[i] !== 0x00) {
                patch.manufacturer_id = d[i].toString(16).padStart(2, "0");
                patch.manufacturer = getManufacturerName(patch.manufacturer_id);
            }
            if (d[i] === 0x00) {
                multi_bytes_id = true;
                patch.manufacturer_id = "00";    //d[i].toString(16);   // todo: hardcode "00"
            }
            continue;
        }

        if (multi_bytes_id && (k === 2)) {
            patch.manufacturer_id += " " + d[i].toString(16).padStart(2, "0");
            continue;
        }

        if (multi_bytes_id && (k === 3)) {
            patch.manufacturer_id += " " + d[i].toString(16).padStart(2, "0");
            patch.manufacturer = getManufacturerName(patch.manufacturer_id);
            multi_bytes_id = false;
            continue;
        }

        if (d[i] === SYSEX_END) {

            patch.manufacturer_id_bytes = patch.manufacturer_id.split(" ").map(n => parseInt(n,16));
            // let hexString = (dd.map(function (n) {return n.toString(16).padStart(2, "0");})).join(" ");
            // console.log(hexString);
            patch.data = new Uint8Array(dd);

            if (patch.manufacturer_id !== NEKTAR_TECHNOLOGY_INC) {
                console.log("file does not contain a Nektar Pacer patch");
                continue;
            }

            // let infos = getInfos(patch.data);
            // //TODO: if no name, try to get name from file
            // patch.name = infos.patch_name ? infos.patch_name : "no name";
            // patch.number = infos.patch_number;

            patches.push(patch);
        }

        if (k === 4) {
            if (d[i] === 0x7F) {
                continue;
            } else {
                console.log(`invalid byte after manufacturer id: ${d[i]}`);
                return null;
            }
        }

        let cmd = d[i];


        dd.push(d[i]);

    }
*/
    return patches;

}










/**
 * Return a array of patches.
 * @param data ArrayBuffer
 */
function parseSysexData2(data) {

    let d = new Uint8Array(data);
    let patches = [];
    let patch = {};
    let offset = 0;
    let multi_bytes_id = false;
    let dd;

/*
    let manufacturer_id = (Array.from(d.slice(1, 4)).map(n => n.toString(16).padStart(2, "0"))).join(" ");    // Array.from() is necessary to get a non-typed array

    console.log(manufacturer_id);

    if (manufacturer_id !== NEKTAR_TECHNOLOGY_INC) {
        console.log("file does not contain a Nektar Pacer patch");
        return [];
    }

    patches = manufacturer_id;

    if (d[i] === SYSEX_START) {
        patch = {};                     // new patch
        dd = [];
        offset = i;
        continue;
    }
*/


    for (let i = 0; i < d.length; i++) {



        if (d[i] === SYSEX_START) {
            patch = {};                     // new patch
            dd = [];
            offset = i;
            continue;
        }

        let k = i - offset; // relative index (index for the current patch)

        if (k === 1) {
            if (patch === undefined) {
                console.error("invalid sysex data");
                break;
            }
            if (d[i] !== 0x00) {
                patch.manufacturer_id = d[i].toString(16).padStart(2, "0");
                patch.manufacturer = getManufacturerName(patch.manufacturer_id);
            }
            if (d[i] === 0x00) {
                multi_bytes_id = true;
                patch.manufacturer_id = "00";    //d[i].toString(16);   // todo: hardcode "00"
            }
            continue;
        }

        if (multi_bytes_id && (k === 2)) {
            patch.manufacturer_id += " " + d[i].toString(16).padStart(2, "0");
            continue;
        }

        if (multi_bytes_id && (k === 3)) {
            patch.manufacturer_id += " " + d[i].toString(16).padStart(2, "0");
            patch.manufacturer = getManufacturerName(patch.manufacturer_id);
            multi_bytes_id = false;
            continue;
        }

        if (d[i] === SYSEX_END) {

            patch.manufacturer_id_bytes = patch.manufacturer_id.split(" ").map(n => parseInt(n,16));
            // let hexString = (dd.map(function (n) {return n.toString(16).padStart(2, "0");})).join(" ");
            // console.log(hexString);
            patch.data = new Uint8Array(dd);

            if (patch.manufacturer_id !== NEKTAR_TECHNOLOGY_INC) {
                console.log("file does not contain a Nektar Pacer patch");
                continue;
            }

            // let infos = getInfos(patch.data);
            // //TODO: if no name, try to get name from file
            // patch.name = infos.patch_name ? infos.patch_name : "no name";
            // patch.number = infos.patch_number;

            patches.push(patch);
        }

        if (k === 4) {
            if (d[i] === 0x7F) {
                continue;
            } else {
                console.log(`invalid byte after manufacturer id: ${d[i]}`);
                return null;
            }
        }

        let cmd = d[i];


        dd.push(d[i]);

    }

    return patches;

}

export {
    isSysexData,
    parseSysexData
};

