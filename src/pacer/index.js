
export const SYSEX_SIGNATURE = [0x00, 0x01, 0x77];

export const SYSEX_HEADER = [0x7F];

export function checksum(bytes) {
    let sum = Uint8Array.from(bytes).reduce((previousValue, currentValue) => previousValue + currentValue);
    return 128 - (sum % 128);
}

/**
 * return the sysex message to send to the Pacer to request some data
 */
export function requestPreset(index, obj) {
    let msg = [0x02, 0x01, index, obj];
    let cs = checksum(msg);
    msg.push(cs);
    return SYSEX_HEADER.concat(msg);
}

export const TARGET_PRESET = 0x01;
export const TARGET_GLOBAL = 0x05;
export const TARGET_BACKUP = 0x07;

export const TARGET = {
    [TARGET_PRESET]: "preset",
    [TARGET_GLOBAL]: "global",
    [TARGET_BACKUP]: "full backup"
};

export const OBJECT = {
    0x0D: "stompswitch 1",
    0x0E: "stompswitch 2",
    0x0F: "stompswitch 3",
    0x10: "stompswitch 4",
    0x11: "stompswitch 5",
    0x12: "stompswitch 6",
    0x13: "RESERVED",
    0x14: "stompswitch A",
    0x15: "stompswitch B",
    0x16: "stompswitch C",
    0x17: "stompswitch D",
    0x18: "footswitch 1",
    0x19: "footswitch 2",
    0x1A: "footswitch 3",
    0x1B: "footswitch 4",
    0x36: "expression pedal 1",
    0x37: "expression pedal 2",
    0x7E: "MIDI configuration",
    0x7F: "ALL"
};

export const CONTROL_ELEMENT = {
    // 0x00: "",

    0x01: "step 1: channel",
    0x02: "step 1: message type",
    0x03: "step 1: data 1",
    0x04: "step 1: data 2",
    0x05: "step 1: data 3",
    0x06: "step 1: step active",

    0x07: "step 2: channel",
    0x08: "step 2: message type",
    0x09: "step 2: data 1",
    0x0A: "step 2: data 2",
    0x0B: "step 2: data 3",
    0x0C: "step 2: step active",

    0x0D: "step 3: channel",
    0x0E: "step 3: message type",
    0x0F: "step 3: data 1",
    0x10: "step 3: data 2",
    0x11: "step 3: data 3",
    0x12: "step 3: step active",

    0x13: "step 4: channel",
    0x14: "step 4: message type",
    0x15: "step 4: data 1",
    0x16: "step 4: data 2",
    0x17: "step 4: data 3",
    0x18: "step 4: step active",

    0x19: "step 5: channel",
    0x1A: "step 5: message type",
    0x1B: "step 5: data 1",
    0x1C: "step 5: data 2",
    0x1D: "step 5: data 3",
    0x1E: "step 5: step active",

    0x1F: "step 6: channel",
    0x20: "step 6: message type",
    0x21: "step 6: data 1",
    0x22: "step 6: data 2",
    0x23: "step 6: data 3",
    0x24: "step 6: step active",

    // 0x25: "",
    // 0x26: "",
    // 0x27: "",
    // 0x28: "",
    // 0x29: "",
    // 0x2A: "",
    // 0x2B: "",
    // 0x2C: "",
    // 0x2D: "",
    // 0x2E: "",
    // 0x2F: "",
    // 0x30: "",
    // 0x31: "",
    // 0x32: "",
    // 0x33: "",
    // 0x34: "",
    // 0x35: "",
    // 0x36: "",
    // 0x37: "",
    // 0x38: "",
    // 0x39: "",
    // 0x3A: "",
    // 0x3B: "",
    // 0x3C: "",
    // 0x3D: "",
    // 0x3E: "",
    // 0x3F: "",
    // 0x40: "",
    // 0x41: "",
    // 0x42: "",
    // 0x43: "",
    // 0x44: "",
    // 0x45: "",
    // 0x46: "",
    // 0x47: "",
    // 0x48: "",
    // 0x49: "",
    // 0x4A: "",
    // 0x4B: "",
    // 0x4C: "",
    // 0x4D: "",
    // 0x4E: "",
    // 0x4F: "",
    // 0x50: "",
    // 0x51: "",
    // 0x52: "",
    // 0x53: "",
    // 0x54: "",
    // 0x55: "",
    // 0x56: "",
    // 0x57: "",
    // 0x58: "",
    // 0x59: "",
    // 0x5A: "",
    // 0x5B: "",
    // 0x5C: "",
    // 0x5D: "",
    // 0x5E: "",
    // 0x5F: "",

    0x60: "control mode",
    0x61: "LED MIDI Ctrl",
    0x62: "LED On Color",
    0x63: "LED Off Color",

    // 0x64: "",
    // 0x65: "",
    // 0x66: "",
    // 0x67: "",
    // 0x68: "",
    // 0x69: "",
    // 0x6A: "",
    // 0x6B: "",
    // 0x6C: "",
    // 0x6D: "",
    // 0x6E: "",
    // 0x6F: "",
    // 0x70: "",
    // 0x71: "",
    // 0x72: "",
    // 0x73: "",
    // 0x74: "",
    // 0x75: "",
    // 0x76: "",
    // 0x77: "",
    // 0x78: "",
    // 0x79: "",
    // 0x7A: "",
    // 0x7B: "",
    // 0x7C: "",
    // 0x7D: "",
    // 0x7E: "",

    0x7F: "ALL"
};

export const MIDI_ELEMENT = {
    // 0x00: "",
    0x01: "setting 1: channel",
    0x02: "setting 1: message type",
    0x03: "setting 1: data 1",
    0x04: "setting 1: data 2",
    0x05: "setting 1: data 3",
    // 0x06: "",

    0x07: "setting 2: channel",
    0x08: "setting 2: message type",
    0x09: "setting 2: data 1",
    0x0A: "setting 2: data 2",
    0x0B: "setting 2: data 3",
    // 0x0C: "",

    0x0D: "setting 3: channel",
    0x0E: "setting 3: message type",
    0x0F: "setting 3: data 1",
    0x10: "setting 3: data 2",
    0x11: "setting 3: data 3",
    // 0x12: "",

    0x13: "setting 4: channel",
    0x14: "setting 4: message type",
    0x15: "setting 4: data 1",
    0x16: "setting 4: data 2",
    0x17: "setting 4: data 3",
    // 0x18: "",

    0x19: "setting 5: channel",
    0x1A: "setting 5: message type",
    0x1B: "setting 5: data 1",
    0x1C: "setting 5: data 2",
    0x1D: "setting 5: data 3",
    // 0x1E: "",

    0x1F: "setting 6: channel",
    0x20: "setting 6: message type",
    0x21: "setting 6: data 1",
    0x22: "setting 6: data 2",
    0x23: "setting 6: data 3",
    // 0x24: "",

    0x25: "setting 7: channel",
    0x26: "setting 7: message type",
    0x27: "setting 7: data 1",
    0x28: "setting 7: data 2",
    0x29: "setting 7: data 3",
    // 0x2A: "",

    0x2B: "setting 8: channel",
    0x2C: "setting 8: message type",
    0x2D: "setting 8: data 1",
    0x2E: "setting 8: data 2",
    0x2F: "setting 8: data 3",
    0x30: "",

    0x31: "setting 9: channel",
    0x32: "setting 9: message type",
    0x33: "setting 9: data 1",
    0x34: "setting 9: data 2",
    0x35: "setting 9: data 3",
    // 0x36: "",

    0x37: "setting 10: channel",
    0x38: "setting 10: message type",
    0x39: "setting 10: data 1",
    0x3A: "setting 10: data 2",
    0x3B: "setting 10: data 3",
    // 0x3C: "",

    0x3D: "setting 11: channel",
    0x3E: "setting 11: message type",
    0x3F: "setting 11: data 1",
    0x40: "setting 11: data 2",
    0x41: "setting 11: data 3",
    // 0x42: "",

    0x43: "setting 12: channel",
    0x44: "setting 12: message type",
    0x45: "setting 12: data 1",
    0x46: "setting 12: data 2",
    0x47: "setting 12: data 3",
    // 0x48: "",

    0x49: "setting 13: channel",
    0x4A: "setting 13: message type",
    0x4B: "setting 13: data 1",
    0x4C: "setting 13: data 2",
    0x4D: "setting 13: data 3",
    // 0x4E: "",

    0x4F: "setting 14: channel",
    0x50: "setting 14: message type",
    0x51: "setting 14: data 1",
    0x52: "setting 14: data 2",
    0x53: "setting 14: data 3",
    // 0x54: "",

    0x55: "setting 15: channel",
    0x56: "setting 15: message type",
    0x57: "setting 15: data 1",
    0x58: "setting 15: data 2",
    0x59: "setting 15: data 3",
    // 0x5A: "",

    0x5B: "setting 16: channel",
    0x5C: "setting 16: message type",
    0x5D: "setting 16: data 1",
    0x5E: "setting 16: data 2",
    0x5F: "setting 16: data 3",
    // 0x60: "",

    // 0x61: "",
    // 0x62: "",
    // 0x63: "",
    // 0x64: "",
    // 0x65: "",
    // 0x66: "",
    // 0x67: "",
    // 0x68: "",
    // 0x69: "",
    // 0x6A: "",
    // 0x6B: "",
    // 0x6C: "",
    // 0x6D: "",
    // 0x6E: "",
    // 0x6F: "",
    // 0x70: "",
    // 0x71: "",
    // 0x72: "",
    // 0x73: "",
    // 0x74: "",
    // 0x75: "",
    // 0x76: "",
    // 0x77: "",
    // 0x78: "",
    // 0x79: "",
    // 0x7A: "",
    // 0x7B: "",
    // 0x7C: "",
    // 0x7D: "",
    // 0x7E: "",

    0x7F: "ALL"
};

// message types:

export const MSG_TYPE_CC = 0x40;
export const MSG_TYPE_NOTE = 0x43;
export const MSG_TYPE_PC = 0x45;



