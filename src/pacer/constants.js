import {object2Array, sortObject} from "../utils/misc";

export const ANY_MIDI_PORT = ".*";

// export const PACER_MIDI_PORT_NAME = "vmpk.*";            // DEBUG
// export const PACER_MIDI_INPUT_PORT_NAME = "vmpk.*";      // DEBUG
// export const PACER_MIDI_OUTPUT_PORT_NAME = "vmpk.*";     // DEBUG
export const PACER_MIDI_PORT_NAME = "Pacer.*";          // can be a regex
export const PACER_MIDI_INPUT_PORT_NAME = "Pacer.*";
export const PACER_MIDI_OUTPUT_PORT_NAME = "Pacer.*";

export const SYSEX_SIGNATURE = [0x00, 0x01, 0x77];
export const SYSEX_HEADER = [0x7F];

export const COMMAND_SET = 0x01;
export const COMMAND_GET = 0x02;

export const TARGET_PRESET = 0x01;
export const TARGET_GLOBAL = 0x05;
export const TARGET_BACKUP = 0x7F;
// export const TARGET_BACKUP = 0x07;

export const TARGETS = {
    [TARGET_PRESET]: "preset",
    [TARGET_GLOBAL]: "global",
    [TARGET_BACKUP]: "full backup"
};

export const TARGET_NAME = [
    "switch 1",     // 1
    "switch 2",     // 2
    "switch 3",     // 3
    "switch 4",     // 4
    "switch 5",     // 5
    "switch 6",     // 6
    null,           // 7
    "switch A",     // 8
    "switch B",     // 9
    "switch C",     // 10    A
    "switch D",     // 11    B
    "FS 1",         // 12    C
    "FS 2",         // 13    D
    "FS 3",         // 14    E
    "FS 4",         // 15    F
    "EXP 1",        // 16   10
    "EXP 2"         // 17   11
];
/*
export const TARGET_NAME = [
    null,           // 0
    "switch 1",     // 1
    "switch 2",     // 2
    "switch 3",     // 3
    "switch 4",     // 4
    "switch 5",     // 5
    "switch 6",     // 6
    null,           // 7
    "switch A",     // 8
    "switch B",     // 9
    "switch C",     // 10    A
    "switch D",     // 11    B
    "FS 1",         // 12    C
    "FS 2",         // 13    D
    "FS 3",         // 14    E
    "FS 4",         // 15    F
    "EXP 1",        // 16   10
    "EXP 2"         // 17   11
];
*/

/*
export const TARGET_NAME_LONG = [
    "",
    "SW-1",
    "SW-2",
    "SW-3",
    "SW-4",
    "SW-5",
    "SW-6",
    "",
    "SW-A",
    "SW-B",
    "SW-C",
    "SW-D",
    "Footswitch 1",
    "Footswitch 2",
    "Footswitch 3",
    "Footswitch 4",
    "Expression Pedal 1",
    "Expression Pedal 2"
];
*/

export const PRESET_TARGET = [
    "Current",      // 0x01
    "Track",        // 0x02
    "Transport",    // 0x03
    "A1", // 0x04
    "A2", // 0x05
    "A3", // 0x06
    "A4", // 0x07
    "A5", // 0x08
    "A6", // 0x09
    "B1", // 0x0A
    "B2", // 0x0B
    "B3", // 0x0C
    "B4", // 0x0D
    "B5", // 0x0E
    "B6", // 0x0F
    "C1", // 0x10
    "C2", // 0x11
    "C3", // 0x12
    "C4", // 0x13
    "C5", // 0x14
    "C6", // 0x15
    "D1", // 0x16
    "D2", // 0x17
    "D3", // 0x18
    "D4", // 0x19
    "D5", // 0x1A
    "D6"    // 0x1B
]

export const CONTROL_NAME = 0x01;
export const CONTROL_STOMPSWITCH_1 = 0x0D;
export const CONTROL_STOMPSWITCH_2 = 0x0E;
export const CONTROL_STOMPSWITCH_3 = 0x0F;
export const CONTROL_STOMPSWITCH_4 = 0x10;
export const CONTROL_STOMPSWITCH_5 = 0x11;
export const CONTROL_STOMPSWITCH_6 = 0x12;
export const CONTROL_RESERVED = 0x13;
export const CONTROL_STOMPSWITCH_A = 0x14;
export const CONTROL_STOMPSWITCH_B = 0x15;
export const CONTROL_STOMPSWITCH_C = 0x16;
export const CONTROL_STOMPSWITCH_D = 0x17;
export const CONTROL_FOOTSWITCH_1 = 0x18;
export const CONTROL_FOOTSWITCH_2 = 0x19;
export const CONTROL_FOOTSWITCH_3 = 0x1A;
export const CONTROL_FOOTSWITCH_4 = 0x1B;
export const CONTROL_EXPRESSION_PEDAL_1 = 0x36;
export const CONTROL_EXPRESSION_PEDAL_2 = 0x37;
export const CONTROL_MIDI = 0x7E;
export const CONTROL_ALL = 0x7F;

// objects:
export const CONTROLS = {
    [CONTROL_NAME]: "name",
    [CONTROL_STOMPSWITCH_1]: "1",
    [CONTROL_STOMPSWITCH_2]: "2",
    [CONTROL_STOMPSWITCH_3]: "3",
    [CONTROL_STOMPSWITCH_4]: "4",
    [CONTROL_STOMPSWITCH_5]: "5",
    [CONTROL_STOMPSWITCH_6]: "6",
    [CONTROL_RESERVED]: "RESERVED",
    [CONTROL_STOMPSWITCH_A]: "A",
    [CONTROL_STOMPSWITCH_B]: "B",
    [CONTROL_STOMPSWITCH_C]: "C",
    [CONTROL_STOMPSWITCH_D]: "D",
    [CONTROL_FOOTSWITCH_1]: "FS 1",
    [CONTROL_FOOTSWITCH_2]: "FS 2",
    [CONTROL_FOOTSWITCH_3]: "FS 3",
    [CONTROL_FOOTSWITCH_4]: "FS 4",
    [CONTROL_EXPRESSION_PEDAL_1]: "EXP 1",
    [CONTROL_EXPRESSION_PEDAL_2]: "EXP 2",
    [CONTROL_MIDI]: "MIDI configuration",
    [CONTROL_ALL]: "ALL"
};

export const CONTROLS_FULLNAME = {      //FIXME: use constants for the key, like CONTROLS above
    0x01: "Preset Name",
    0x0D: "Stompswitch 1",
    0x0E: "Stompswitch 2",
    0x0F: "Stompswitch 3",
    0x10: "Stompswitch 4",
    0x11: "Stompswitch 5",
    0x12: "Stompswitch 6",
    0x13: "RESERVED",
    0x14: "Stompswitch A",
    0x15: "Stompswitch B",
    0x16: "Stompswitch C",
    0x17: "Stompswitch D",
    0x18: "Footswitch 1",
    0x19: "Footswitch 2",
    0x1A: "Footswitch 3",
    0x1B: "Footswitch 4",
    0x36: "Expression Pedal 1",
    0x37: "Expression Pedal 2",
    0x7E: "MIDI configuration",
    0x7F: "ALL"
};

//FIXME: add FS when ready
export const CONTROLS_WITH_SEQUENCE = [
    0x0D, 0x0E, 0x0F, 0x10, 0x11, 0x12, 0x14, 0x15, 0x16, 0x17  //, 0x18, 0x19, 0x1A, 0x1B
];

// subsets of CONTROLS keys:        // we convert to string because this ID will be used as object property (keys)
export const STOMPSWITCHES = [0x0D, 0x0E, 0x0F, 0x10, 0x11, 0x12, 0x14, 0x15, 0x16, 0x17].map(String);
export const STOMPSWITCHES_TOP = [0x14, 0x15, 0x16, 0x17].map(String);
export const STOMPSWITCHES_BOTTOM = [0x0D, 0x0E, 0x0F, 0x10, 0x11, 0x12].map(String);
export const FOOTSWITCHES = [0x18, 0x19, 0x1A, 0x1B].map(String);
export const EXPPEDALS = [0x36, 0x37].map(String);

// message types EXP PEDALS:
export const MSG_AD_MIDI_CC = 0x00;
export const MSG_AD_NRPN_COARSE = 0x03;
export const MSG_AD_NRPN_FINE = 0x04;
export const MSG_AD_PITCH_BEND = 0x01;
export const MSG_AD_ATCHAN = 0x02;
export const MSG_DAWFUNC = 0x7E;
export const MSG_CTRL_OFF = 0x61;

// message types STOMPSWITCHES and FOOTSWITCHES:
export const MSG_SW_MIDI_CC_TGGLE = 0x47;
export const MSG_SW_MIDI_CC = 0x40;
export const MSG_SW_MIDI_CC_STEP = 0x48;
export const MSG_SW_NOTE = 0x43;
export const MSG_SW_NOTE_TGGLE = 0x44;
export const MSG_SW_PRG_BANK = 0x45;
export const MSG_SW_PRG_STEP = 0x46;
export const MSG_SW_NRPN_COARSE = 0x57;
export const MSG_SW_NRPN_FINE = 0x58;
export const MSG_SW_MMC = 0x55;
export const MSG_SW_RELAY = 0x59;
export const MSG_SW_PRESET_SELECT = 0x62;
export const MSG_SW_PRESET_INC_DEC = 0x56;
export const MSG_SW_STEP_SELECT = 0x63;
export const MSG_SW_STEP_INC_DEC = 0x64;

// message types ENCODER:
export const MSG_ENC_CC = 0x12;
export const MSG_ENC_MIDICC_REL = 0x11;
export const MSG_ENC_NRPN_COARSE = 0x15;
export const MSG_ENC_NRPN_FINE = 0x16;
export const MSG_ENC_PITCH = 0x13;
export const MSG_ENC_ATCHAN = 0x14;
export const MSG_ENC_PROGRAM = 0x10;
export const MSG_ENC_PRESET_SELECT = 0x17;
export const MSG_ENC_STEP_SELECT = 0x18;

export const MSG_LOAD_CC = 0x65;

export const MSG_TYPES = {

    [MSG_AD_MIDI_CC]: "CC",
    [MSG_AD_NRPN_COARSE]: "NRPN C",
    [MSG_AD_NRPN_FINE]: "NRPN F",
    [MSG_AD_PITCH_BEND]: "PITCH",
    [MSG_AD_ATCHAN]: "AT CHAN",
    [MSG_DAWFUNC]: "DAW FUNC",
    [MSG_CTRL_OFF]: "CTRL_OFF",

    [MSG_SW_MIDI_CC_TGGLE]: "CC TOGGLE",
    [MSG_SW_MIDI_CC]: "CC",
    [MSG_SW_MIDI_CC_STEP]: "CC STEP",
    [MSG_SW_NOTE]: "NOTE",
    [MSG_SW_NOTE_TGGLE]: "NOTE TOGGLE",
    [MSG_SW_PRG_BANK]: "PRG BANK",
    [MSG_SW_PRG_STEP]: "PRG STEP",
    [MSG_SW_NRPN_COARSE]: "NRPN COARSE",
    [MSG_SW_NRPN_FINE]: "NRPN FINE",
    [MSG_SW_MMC]: "MMC",
    [MSG_SW_RELAY]: "RELAY",
    [MSG_SW_PRESET_SELECT]: "PRESET SELECT",
    [MSG_SW_PRESET_INC_DEC]: "Preset Inc Dec",
    [MSG_SW_STEP_SELECT]: "STEP SELECT",
    [MSG_SW_STEP_INC_DEC]: "STEP INC DEC",

    [MSG_ENC_CC]: "CC",
    [MSG_ENC_MIDICC_REL]: "CC REL",
    [MSG_ENC_NRPN_COARSE]: "NRPN C",
    [MSG_ENC_NRPN_FINE]: "NRPN F",
    [MSG_ENC_PITCH]: "PITCH",
    [MSG_ENC_ATCHAN]: "AT CHAN",
    [MSG_ENC_PROGRAM]: "PRG",
    [MSG_ENC_PRESET_SELECT]: "PRESET SEL",
    [MSG_ENC_STEP_SELECT]: "STEP SEL",

    [MSG_LOAD_CC]: "CC"
};

export const MSG_TYPES_SHORT_NAMES = {      // used in overview

    [MSG_AD_MIDI_CC]: "CC",
    [MSG_AD_NRPN_COARSE]: "NRPN C",
    [MSG_AD_NRPN_FINE]: "NRPN F",
    [MSG_AD_PITCH_BEND]: "Pitch",
    [MSG_AD_ATCHAN]: "AT CHAN",
    [MSG_DAWFUNC]: "DAW",
    [MSG_CTRL_OFF]: "OFF",

    [MSG_SW_MIDI_CC_TGGLE]: "CC tggl",
    [MSG_SW_MIDI_CC]: "CC",
    [MSG_SW_MIDI_CC_STEP]: "CC step",
    [MSG_SW_NOTE]: "Note",
    [MSG_SW_NOTE_TGGLE]: "Note tggl",
    [MSG_SW_PRG_BANK]: "Prg bank",
    [MSG_SW_PRG_STEP]: "Prg step",
    [MSG_SW_NRPN_COARSE]: "NRPN C",
    [MSG_SW_NRPN_FINE]: "NRPN F",
    [MSG_SW_MMC]: "MMC",
    [MSG_SW_RELAY]: "Relay",
    [MSG_SW_PRESET_SELECT]: "Preset sel",
    [MSG_SW_PRESET_INC_DEC]: "Preset +/-",
    [MSG_SW_STEP_SELECT]: "Step sel",
    [MSG_SW_STEP_INC_DEC]: "Step +/-",

    [MSG_ENC_CC]: "CC",
    [MSG_ENC_MIDICC_REL]: "CC rel",
    [MSG_ENC_NRPN_COARSE]: "NRPN C",
    [MSG_ENC_NRPN_FINE]: "NRPN F",
    [MSG_ENC_PITCH]: "Pitch",
    [MSG_ENC_ATCHAN]: "AT chan",
    [MSG_ENC_PROGRAM]: "Prg",
    [MSG_ENC_PRESET_SELECT]: "Preset sel",
    [MSG_ENC_STEP_SELECT]: "Step sel",

    [MSG_LOAD_CC]: "CC"
};

// Message types for stompswitches
export const MSG_TYPES_FULLNAME = {
    [MSG_CTRL_OFF]: "OFF",

    [MSG_AD_MIDI_CC]: "CC",
    [MSG_AD_NRPN_COARSE]: "NRPN Coarse",
    [MSG_AD_NRPN_FINE]: "NRPN Fine",
    [MSG_AD_PITCH_BEND]: "Pitch Bend",
    [MSG_AD_ATCHAN]: "Channel AfterTouch",
    [MSG_DAWFUNC]: "DAW Function",

    [MSG_SW_MIDI_CC_TGGLE]: "CC Toggle",
    [MSG_SW_MIDI_CC]: "CC Trigger",
    [MSG_SW_MIDI_CC_STEP]: "CC Step",
    [MSG_SW_NOTE]: "Note",
    [MSG_SW_NOTE_TGGLE]: "Note Toggle",
    [MSG_SW_PRG_BANK]: "Program & Bank",
    [MSG_SW_PRG_STEP]: "Program Step",
    [MSG_SW_NRPN_COARSE]: "NRPN Coarse",
    [MSG_SW_NRPN_FINE]: "NRPN Fine",
    [MSG_SW_MMC]: "MIDI Machine Control",
    [MSG_SW_RELAY]: "Relay Outputs",
    [MSG_SW_PRESET_SELECT]: "Preset Select",
    [MSG_SW_PRESET_INC_DEC]: "Preset Inc/Dec",
    [MSG_SW_STEP_SELECT]: "Step Select",
    [MSG_SW_STEP_INC_DEC]: "Step Inc/Dec",

    [MSG_ENC_CC]: "CC",
    [MSG_ENC_MIDICC_REL]: "CC REL",
    [MSG_ENC_NRPN_COARSE]: "NRPN Coarse",
    [MSG_ENC_NRPN_FINE]: "NRPN Fine",
    [MSG_ENC_PITCH]: "Pitch Bend",
    [MSG_ENC_ATCHAN]: "AT Chan.",
    [MSG_ENC_PROGRAM]: "Program",
    [MSG_ENC_PRESET_SELECT]: "Preset Sel",
    [MSG_ENC_STEP_SELECT]: "Step Sel"
};

// export const MSG_TYPES_FULLNAME_SW_SORTED = sortObject(MSG_TYPES_FULLNAME);


// Preset Midi Settings
export const MSG_TYPES_FULLNAME_MIDI = {
    [MSG_LOAD_CC]: "MIDI CC",
    [MSG_SW_NOTE]: "MIDI Note",
    [MSG_SW_PRG_BANK]: "MIDI Program & Bank",
    [MSG_SW_NRPN_COARSE]: "MIDI NRPN Coarse",
    [MSG_SW_NRPN_FINE]: "MIDI NRPN Fine",
    [MSG_SW_MMC]: "MIDI Machine Control",
    [MSG_SW_RELAY]: "Relay Outputs",
    // [MSG_DAWFUNC]: "DAW Func.",
    [MSG_CTRL_OFF]: "OFF"
};

// export const MSG_TYPES_FULLNAME_MIDI_SORTED = object2Array(MSG_TYPES_FULLNAME_MIDI);
// export const MSG_TYPES_FULLNAME_MIDI_SORTED = sortObject(MSG_TYPES_FULLNAME_MIDI);

export const MSG_TYPES_FULLNAME_MIDI_SORTED = [
    MSG_LOAD_CC,
    MSG_SW_NOTE,
    MSG_SW_PRG_BANK,
    MSG_SW_NRPN_COARSE,
    MSG_SW_NRPN_FINE,
    MSG_SW_MMC,
    MSG_SW_RELAY,
    // MSG_DAWFUNC,
    MSG_CTRL_OFF
];



export const NOT_USED = "not used";

export const MSG_TYPES_DATA_HELP = {

    // each value must be a array of 3 values
    [MSG_CTRL_OFF]: ["", "", ""],

    [MSG_AD_MIDI_CC]: ["Controller", "Min", "Max"],
    [MSG_AD_NRPN_COARSE]: ["Max", "NRPN LSB", "NRPN MSB"],
    [MSG_AD_NRPN_FINE]: ["Max", "NRPN LSB", "NRPN MSB"],
    [MSG_AD_PITCH_BEND]: [NOT_USED, "Min", "Max"],
    [MSG_AD_ATCHAN]: [NOT_USED, "Min", "Max"],
    [MSG_DAWFUNC]: ["function", NOT_USED, NOT_USED],

    [MSG_SW_MIDI_CC_TGGLE]: ["controller", "value 1", "value 2"],
    [MSG_SW_MIDI_CC]: ["controller", "down", "up"],
    [MSG_SW_MIDI_CC_STEP]: ["controller", "start", "end"],
    [MSG_SW_NOTE]: ["note", "velocity", NOT_USED],
    [MSG_SW_NOTE_TGGLE]: ["note", "velocity", NOT_USED],
    [MSG_SW_PRG_BANK]: ["program", "bank LSB", "bank MSB"],
    [MSG_SW_PRG_STEP]: [NOT_USED, "start", "end"],
    [MSG_SW_NRPN_COARSE]: ["value", "NRPN LSB", "NRPN MSB"],
    [MSG_SW_NRPN_FINE]: ["value", "NRPN LSB", "NRPN MSB"],
    [MSG_SW_MMC]: ["device", "command", NOT_USED],
    [MSG_SW_RELAY]: ["mode", "relay #", NOT_USED],
    [MSG_SW_PRESET_SELECT]: ["preset", NOT_USED, NOT_USED],
    [MSG_SW_PRESET_INC_DEC]: ["inc/dec", NOT_USED, NOT_USED],
    [MSG_SW_STEP_SELECT]: ["target", "step", NOT_USED],
    [MSG_SW_STEP_INC_DEC]: ["target", "inc/dec", NOT_USED],

    [MSG_ENC_CC]: ["", "", ""],
    [MSG_ENC_MIDICC_REL]: ["", "", ""],
    [MSG_ENC_NRPN_COARSE]: ["", "", ""],
    [MSG_ENC_NRPN_FINE]: ["", "", ""],
    [MSG_ENC_PITCH]: ["", "", ""],
    [MSG_ENC_ATCHAN]: ["", "", ""],
    [MSG_ENC_PROGRAM]: ["", "", ""],
    [MSG_ENC_PRESET_SELECT]: ["", "", ""],
    [MSG_ENC_STEP_SELECT]: ["", "", ""],

    [MSG_LOAD_CC]: ["controller", "value", NOT_USED]
};

export const MSG_TYPES_DATA_USAGE = {

    // each value must be a array of 3 values

    [MSG_AD_MIDI_CC]: [true, true, true],
    [MSG_AD_NRPN_COARSE]: [true, true, true],
    [MSG_AD_NRPN_FINE]: [true, true, true],
    [MSG_AD_PITCH_BEND]: [true, true, true],
    [MSG_AD_ATCHAN]: [true, true, true],
    [MSG_DAWFUNC]: [true, false, false],
    [MSG_CTRL_OFF]: [true, true, true],

    [MSG_SW_MIDI_CC_TGGLE]: [true, true, true],
    [MSG_SW_MIDI_CC]: [true, true, true],
    [MSG_SW_MIDI_CC_STEP]: [true, true, true],
    [MSG_SW_NOTE]: [true, true, false],
    [MSG_SW_NOTE_TGGLE]: [true, true, false],
    [MSG_SW_PRG_BANK]: [true, true, true],
    [MSG_SW_PRG_STEP]: [false, true, true],
    [MSG_SW_NRPN_COARSE]: [true, true, true],
    [MSG_SW_NRPN_FINE]: [true, true, true],
    [MSG_SW_MMC]: [true, true, false],
    [MSG_SW_RELAY]: [true, true, false],
    [MSG_SW_PRESET_SELECT]: [true, false, false],
    [MSG_SW_PRESET_INC_DEC]: [true, false, false],
    [MSG_SW_STEP_SELECT]: [true, true, false],
    [MSG_SW_STEP_INC_DEC]: [true, true, false],

    [MSG_ENC_CC]: [true, true, true],
    [MSG_ENC_MIDICC_REL]: [true, true, true],
    [MSG_ENC_NRPN_COARSE]: [true, true, true],
    [MSG_ENC_NRPN_FINE]: [true, true, true],
    [MSG_ENC_PITCH]: [true, true, true],
    [MSG_ENC_ATCHAN]: [true, true, true],
    [MSG_ENC_PROGRAM]: [true, true, true],
    [MSG_ENC_PRESET_SELECT]: [true, true, true],
    [MSG_ENC_STEP_SELECT]: [true, true, true],

    [MSG_LOAD_CC]: [true, true, false]
};



// MSG_DAWFUNC,
//     MSG_ENC_CC,
// MSG_ENC_MIDICC_REL,
// MSG_ENC_NRPNC,
// MSG_ENC_NRPNF,
// MSG_ENC_PITCH,
// MSG_ENC_ATCHAN,
// MSG_ENC_PROGRAM,
// MSG_ENC_PRESETSELECT,
// MSG_ENC_STEPSELECT,
//
// MSG_LOAD_CC,


export const MSG_TYPES_STOMPSWITCH = [
    MSG_SW_MIDI_CC_TGGLE,
    MSG_SW_MIDI_CC,
    MSG_SW_MIDI_CC_STEP,
    MSG_SW_NOTE,
    MSG_SW_NOTE_TGGLE,
    MSG_SW_PRG_BANK,
    MSG_SW_PRG_STEP,
    MSG_SW_NRPN_COARSE,
    MSG_SW_NRPN_FINE,
    MSG_SW_MMC,
    MSG_SW_RELAY,
    MSG_SW_PRESET_SELECT,
    MSG_SW_PRESET_INC_DEC,
    MSG_SW_STEP_SELECT,
    MSG_SW_STEP_INC_DEC,
    MSG_CTRL_OFF
];

export const MSG_TYPES_FOOTWITCH = [
    MSG_SW_MIDI_CC_TGGLE,
    MSG_SW_MIDI_CC,
    MSG_SW_MIDI_CC_STEP,
    MSG_SW_NOTE,
    MSG_SW_NOTE_TGGLE,
    MSG_SW_PRG_BANK,
    MSG_SW_PRG_STEP,
    MSG_SW_NRPN_COARSE,
    MSG_SW_NRPN_FINE,
    MSG_SW_MMC,
    MSG_SW_RELAY,
    MSG_SW_PRESET_SELECT,
    MSG_SW_PRESET_INC_DEC,
    MSG_SW_STEP_SELECT,
    MSG_SW_STEP_INC_DEC,
    MSG_CTRL_OFF
];

export const MSG_TYPES_EXP_PEDAL = [
    MSG_AD_MIDI_CC,
    MSG_AD_NRPN_COARSE,
    MSG_AD_NRPN_FINE,
    MSG_AD_PITCH_BEND,
    MSG_AD_ATCHAN,
    MSG_CTRL_OFF
];

export const RELAY_MODE_LABEL = [
    "Auto Detect",
    "Normally Open",
    "Normally Closed",
    "Latching"
];

export const RELAY_MODE_LABEL_SHORT = [
    "Auto",
    "N. Open",
    "N. Closed",
    "Latching"
];

/*
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

    0x40: "control mode",
    0x41: "LED MIDI Ctrl",
    0x42: "LED On Color",
    0x43: "LED Off Color",

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

    // 0x60: "control mode",
    // 0x61: "LED MIDI Ctrl",
    // 0x62: "LED On Color",
    // 0x63: "LED Off Color",

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
*/

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

export const COLORS = {
    0x00 : "Off",
    0x01 : "1A Pink",
    0x02 : "1B Dim Pink",
    0x03 : "2A Red",
    0x04 : "2B Dim Red",
    0x05 : "3A Orange",
    0x06 : "3B Dim Orange",
    0x07 : "4A Amber",
    0x08 : "4B Dim Amber",
    0x09 : "5A Yellow",
    0x0A : "5B Dim Yellow",
    0x0B : "6A Lime",
    0x0C : "6B Dim Lime",
    0x0D : "7A Green",
    0x0E : "7B Dim Green",
    0x0F : "8A Teal",
    0x10 : "8B Dim Teal",
    0x11 : "9A Blue",
    0x12 : "9B Dim Blue",
    0x13 : "10A Lavender",
    0x14 : "10B Dim Lavender",
    0x15 : "11A Purple",
    0x16 : "11B Dim Purple",
    0x17 : "12A White",
    0x18 : "12B Dim White",
};


export const COLORS_HTML = {        // https://en.wikipedia.org/wiki/Web_colors
    // 0x00 : "#000000",
    0x00 : "transparent",
    0x01 : "#FFC0CB",
    0x02 : "rgba(255, 192, 203, 0.5)", // 50% transparent
    0x03 : "#FF0000",
    0x04 : "rgba(255, 0, 0, 0.5)",
    0x05 : "#FF8C00",
    0x06 : "rgba(255, 140, 0, 0.5)",
    0x07 : "#FFBF00",                // https://simple.wikipedia.org/wiki/Amber_(color)
    0x08 : "rgba(255, 191, 0, 0.5)",
    0x09 : "#FFFF00",
    0x0A : "rgba(255, 255, 0, 0.5)",
    0x0B : "#00FF00",
    0x0C : "rgba(0, 255, 0, 0.5)",
    0x0D : "#008000",
    0x0E : "rgba(0, 128, 0, 0.5)",
    0x0F : "#008080",
    0x10 : "rgba(0, 128, 128, 0.5)",
    0x11 : "#0000FF",
    0x12 : "rgba(0, 0, 255, 0.5)",
    0x13 : "#E6E6FA",                // https://en.wikipedia.org/wiki/Lavender_(color)
    0x14 : "rgba(230, 230, 250, 0.5)",
    0x15 : "#800080",
    0x16 : "rgba(128, 0, 128, 0.5)",
    0x17 : "#FFFFFF",
    0x18 : "#FFFFFF"
};


export const CONTROL_MODE_ELEMENT = 0x60;

export const CONTROL_MODE_ALL = 0x00;
// export const CONTROL_MODE_EXT_STEP = 0x01;
// export const CONTROL_MODE_SEQUENCE = 0x02;
export const CONTROL_MODE_EXT_STEP = 0x02;
export const CONTROL_MODE_SEQUENCE = 0x01;

export const CONTROL_MODES = {
    [CONTROL_MODE_ALL]: "All steps in one shot",
    [CONTROL_MODE_EXT_STEP]: "External Step Select",
    [CONTROL_MODE_SEQUENCE]: "Sequence",
};

export const CONTROL_MODES_SHORT_NAME = {
    [CONTROL_MODE_ALL]: "All",
    [CONTROL_MODE_EXT_STEP]: "ESS",
    [CONTROL_MODE_SEQUENCE]: "Seq",
};
