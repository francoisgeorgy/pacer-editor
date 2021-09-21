import {
    MSG_AD_ATCHAN,
    MSG_AD_MIDI_CC,
    MSG_AD_NRPN_COARSE,
    MSG_AD_NRPN_FINE,
    MSG_AD_PITCH_BEND,
    MSG_CTRL_OFF,
    MSG_DAWFUNC,
    MSG_ENC_ATCHAN,
    MSG_ENC_CC,
    MSG_ENC_MIDICC_REL,
    MSG_ENC_NRPN_COARSE,
    MSG_ENC_NRPN_FINE,
    MSG_ENC_PITCH, MSG_ENC_PRESET_SELECT,
    MSG_ENC_PROGRAM, MSG_ENC_STEP_SELECT, MSG_LOAD_CC,
    MSG_SW_MIDI_CC,
    MSG_SW_MIDI_CC_STEP,
    MSG_SW_MIDI_CC_TGGLE,
    MSG_SW_MMC,
    MSG_SW_NOTE,
    MSG_SW_NOTE_TGGLE,
    MSG_SW_NRPN_COARSE,
    MSG_SW_NRPN_FINE,
    MSG_SW_PRESET_INC_DEC,
    MSG_SW_PRESET_SELECT,
    MSG_SW_PRG_BANK,
    MSG_SW_PRG_STEP,
    MSG_SW_RELAY,
    MSG_SW_STEP_INC_DEC,
    MSG_SW_STEP_SELECT, PRESET_TARGET, RELAY_MODE_LABEL, TARGET_NAME
} from "./constants";
// SYSEX:
// 0x01	Current user
// 0x02	Track
// 0x03	Transport
// 0x04	1A
// 0x05	2A
// 0x06	3A
// 0x07	4A
// 0x08	5A
// 0x09	6A
// 0x0A	1B
// 0x0B	2B
// 0x0C	3B
// 0x0D	4B
// 0x0E	5B
// 0x0F	6B
// 0x10	1C
// 0x11	2C
// 0x12	3C
// 0x13	4C
// 0x14	5C
// 0x15	6C
// 0x16	1D
// 0x17	2D
// 0x18	3D
// 0x19	4D
// 0x1A	5D
// 0x1B	6D


/**
 * Example: 23 => "D5"
 * @param index
 * @returns {string}
 */
export const presetIndexToXY = index => {
    let ii = parseInt(index);
    if (ii === 0) return "current";
    //TODO: check valid range
    let b = Math.floor((ii - 1) / 6);
    let i = (ii - 1) % 6 + 1;
    return String.fromCharCode(b + 65) + i.toString();
};

/**
 * Exampe: "D5" => "23"
 * @param xy
 * @returns {String}
 */
export const presetXYToIndex = xy => {
    // if (xy === "CUR") return 0;
    //TODO: check valid range
    let bank = xy.charCodeAt(0) - 65;
    let num = parseInt(xy[1], 10);
    return (bank * 6 + num).toString();
};

const UP_ARROW = '\u21E7';
const DOWN_ARROW = '\u21E9';

export const MessageSummary = message => {

    if (message === null || message === undefined) return '';

    const data = message["data"];
    switch (message["msg_type"]) {

        // case MSG_AD_MIDI_CC: return `CC${data[0]} min ${data[1]} max ${data[2]}`;
        case MSG_AD_MIDI_CC: return `CC${data[0]} ${data[1]} to ${data[2]}`;

        case MSG_AD_NRPN_COARSE: return `NRPN C max ${data[0]} ${data[1]}: ${data[2]}`;
        case MSG_AD_NRPN_FINE: return `NRPN F max ${data[0]} ${data[1]}:${data[2]}`;
        case MSG_AD_PITCH_BEND: return `Pitch min ${data[1]} max ${data[2]}`;
        case MSG_AD_ATCHAN: return `AT Chan min ${data[1]} max ${data[2]}`;
        case MSG_DAWFUNC: return `DAW Func ${data[0]}`;
        case MSG_CTRL_OFF: return `OFF`;

        case MSG_SW_MIDI_CC_TGGLE: return `CC${data[0]} toggle ${data[1]} \u21C4 ${data[2]}`;
        case MSG_SW_MIDI_CC: return `CC${data[0]} ${DOWN_ARROW}${data[1]} ${UP_ARROW}${data[2]}`;
        case MSG_SW_MIDI_CC_STEP: return `CC${data[0]} step ${data[1]} to ${data[2]}`;

        case MSG_SW_NOTE: return `Note ${data[0]} vel ${data[1]}`;
        case MSG_SW_NOTE_TGGLE: return `Note Toggle ${data[0]} vel ${data[1]}`;

        // case MSG_SW_PRG_BANK: return `PRG BANK ${data[0]} ${data[1]}:${data[2]}`;
        case MSG_SW_PRG_BANK:
            if (data[2] || data[2])
                return `Prog & Bank ${data[0]} ${data[1]}:${data[2]}`;
            else
                return `Prog Change ${data[0]}`;

        case MSG_SW_PRG_STEP: return `Prog step ${data[1]} to ${data[2]}`;

        case MSG_SW_NRPN_COARSE: return `NRPN C ${data[0]} ${data[1]}:${data[2]}`;
        case MSG_SW_NRPN_FINE: return `NRPN F ${data[0]} ${data[1]}:${data[2]}`;

        case MSG_SW_MMC: return `MMC ID ${data[0]} cmd ${data[1]}`;

        case MSG_SW_RELAY: return `Relay ${data[1]} ${RELAY_MODE_LABEL[data[0]]}`;

        case MSG_SW_PRESET_SELECT:
            switch (data[0]) {
                case 1: return `Select ${PRESET_TARGET[1]}`;
                case 2: return `Select ${PRESET_TARGET[2]}`;
                default: return `Preset Select ${PRESET_TARGET[data[0]]}`;
            }

        case MSG_SW_PRESET_INC_DEC:
            return `Preset ${data[0]?'Dec':'Inc'}`;

        case MSG_SW_STEP_SELECT: return `${TARGET_NAME[data[0]]} step ${data[1]}`;
        case MSG_SW_STEP_INC_DEC: return `Step ${data[1]?'Dec':'Inc'} '${TARGET_NAME[data[0]]}'`;

        case MSG_ENC_CC: return `MSG_ENC_CC ${data[0]} ${data[1]} ${data[2]}`;
        case MSG_ENC_MIDICC_REL: return `CC Rel ${data[0]}`;
        case MSG_ENC_NRPN_COARSE: return `NRPN C max ${data[0]} ${data[1]}:${data[2]}`;
        case MSG_ENC_NRPN_FINE: return `NRPN F max ${data[0]} ${data[1]}:${data[2]}`;
        case MSG_ENC_PITCH: return `Pitch min ${data[1]} max ${data[2]}`;
        case MSG_ENC_ATCHAN: return `AT Chan min ${data[1]} max ${data[2]}`;
        case MSG_ENC_PROGRAM: return `Prg ${data[1]} to ${data[2]}`;
        case MSG_ENC_PRESET_SELECT: return `Preset Sel ${data[1]} to ${data[2]}`;
        case MSG_ENC_STEP_SELECT: return `Step Select '${TARGET_NAME[data[0]]}', ${data[1]} to ${data[2]}`;

        case MSG_LOAD_CC: return `CC${data[0]} ${data[1]}`;

        default: return `?${message["msg_type"]}? ${data[0]} ${data[1]} ${data[2]}`;
    }
};