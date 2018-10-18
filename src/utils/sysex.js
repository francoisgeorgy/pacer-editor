import midi_name, {NEKTAR_TECHNOLOGY_INC} from "midi-manufacturers";
import hash from "object-hash";

export const SYSEX_START = 0xF0;
export const SYSEX_END = 0xF7;

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

/**
 * Return a array of patches.
 * @param data ArrayBuffer
 */
function parseSysexData(data) {
    let d = new Uint8Array(data);
    let patches = [];
    let patch;
    let patch_index = 0;    // ordinal index for the patch
    let offset;
    let multi_bytes_id = false;
    let dd;
    for (let i = 0; i < d.length; i++) {
        if (d[i] === SYSEX_START) {
            patch = {};                     // new patch
            dd = [];
            offset = i;
            continue;
        }
        if (i - offset === 1) {
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
        if (multi_bytes_id && (i - offset === 2)) {
            patch.manufacturer_id += " " + d[i].toString(16).padStart(2, "0");
            continue;
        }
        if (multi_bytes_id && (i - offset === 3)) {
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

            // patch name and patch info, specific to Bass Station 2
            if (patch.manufacturer_id === NEKTAR_TECHNOLOGY_INC) {

                console.log("file contains Nektar sysex");

                //TODO

                /*
                let infos = getInfos(patch.data);
                //TODO: if no name, try to get name from file
                patch.name = infos.patch_name ? infos.patch_name : "no name";
                patch.number = infos.patch_number;
                */
            } else {
                patch.name = "unknown";
            }

            patch.hash = hash.sha1(patch.data);

            patch_index++;
            patch.index = patch_index;

            patch.rating = 0;

            patches.push(patch);
            continue;
        }

        dd.push(d[i]);

    }
    return patches;
}

export {
    isSysexData,
    parseSysexData
};

