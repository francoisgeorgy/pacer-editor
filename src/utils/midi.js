import * as WebMidi from "webmidi";
import {SYSEX_START} from "../pacer/sysex";

export const MESSAGE = {
    0x80: "Note Off",
    0x90: "Note On",
    0xA0: "AfterTouch",
    0xB0: "Control Change",
    0xC0: "Program Change",
    0xD0: "Channel Pressure",
    0xE0: "Pitch Wheel"
};

export const CONTROLER = {
    0: "Bank Select (coarse)",
    1: "Modulation Wheel (coarse)",
    2: "Breath controller (coarse)",
    4: "Foot Pedal (coarse)",
    5: "Portamento Time (coarse)",
    6: "Data Entry (coarse)",
    7: "Volume (coarse)",
    8: "Balance (coarse)",
    10: "Pan position (coarse)",
    11: "Expression (coarse)",
    12: "Effect Control 1 (coarse)",
    13: "Effect Control 2 (coarse)",
    16: "General Purpose Slider 1",
    17: "General Purpose Slider 2",
    18: "General Purpose Slider 3",
    19: "General Purpose Slider 4",
    32: "Bank Select (fine)",
    33: "Modulation Wheel (fine)",
    34: "Breath controller (fine)",
    36: "Foot Pedal (fine)",
    37: "Portamento Time (fine)",
    38: "Data Entry (fine)",
    39: "Volume (fine)",
    40: "Balance (fine)",
    42: "Pan position (fine)",
    43: "Expression (fine)",
    44: "Effect Control 1 (fine)",
    45: "Effect Control 2 (fine)",
    64: "Hold Pedal (on/off)",
    65: "Portamento (on/off)",
    66: "Sustenuto Pedal (on/off)",
    67: "Soft Pedal (on/off)",
    68: "Legato Pedal (on/off)",
    69: "Hold 2 Pedal (on/off)",
    70: "Sound Variation",
    71: "Sound Timbre",
    72: "Sound Release Time",
    73: "Sound Attack Time",
    74: "Sound Brightness",
    75: "Sound Control 6",
    76: "Sound Control 7",
    77: "Sound Control 8",
    78: "Sound Control 9",
    79: "Sound Control 10",
    80: "General Purpose Button 1 (on/off)",
    81: "General Purpose Button 2 (on/off)",
    82: "General Purpose Button 3 (on/off)",
    83: "General Purpose Button 4 (on/off)",
    91: "Effects Level",
    92: "Tremulo Level",
    93: "Chorus Level",
    94: "Celeste Level",
    95: "Phaser Level",
    96: "Data Button increment",
    97: "Data Button decrement",
    98: "Non-registered Parameter (fine)",
    99: "Non-registered Parameter (coarse)",
    100: "Registered Parameter (fine)",
    101: "Registered Parameter (coarse)",
    120: "All Sound Off",
    121: "All Controllers Off",
    122: "Local Keyboard (on/off)",
    123: "All Notes Off",
    124: "Omni Mode Off",
    125: "Omni Mode On",
    126: "Mono Operation",
    127: "Poly Operation"
};

export const groupPortsByName = () => {
    let g = {};
    for (let p of WebMidi.inputs) {
        g[p.name] = {
            input: p.id,
            output: null
        };
    }
    for (let p of WebMidi.outputs) {
        if (!(p.name in g)) {
            g[p.name] = {input: null, output: null};
        }
        g[p.name].output = p.id
    }
    return g;
};

/**
 *
 * @param port
 * returns true if the midi port is the Pacer
 */
export const midiConnected = portId => {
    // return true;

    return !!portId;

    //FIXME: return true if at least one output and one input are connected

    // let port = portById(portId);
    // return port ? port.name.match(new RegExp(PACER_MIDI_PORT_NAME, 'i')) : false
};


export const batchMessages = (callback, callbackBusy, wait) => {

    // console.log("batchMessages: init", wait);

    let messages = [];  // batch of received messages
    let timeout;

    return function() {

        console.log("batchMessages: clear timeout");
        clearTimeout(timeout);

        let event = arguments[0];

        //
        // We ignore all messages that are NOT sysex messages:
        //
        if (event.data[0] !== SYSEX_START) {
            console.log("non sysex message ignored");
            return;
        }

        messages.push(event.data);

        // console.log("batchMessages, bytes received:", messages.length);

        callbackBusy(messages.length);  // messages.length is the total number of bytes received so far

        timeout = setTimeout(() => {
            console.log("batchMessages: timeout elapsed");
            timeout = null;
            callback(messages);
            messages = [];
        }, wait);

        console.log("batchMessages: done");

    };
};

