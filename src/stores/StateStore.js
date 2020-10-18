import {computed, decorate, observable} from "mobx";
import {outputById} from "../utils/ports";
import {MSG_CTRL_OFF, SYSEX_SIGNATURE, TARGET_PRESET} from "../pacer/constants";
import {
    ALL_PRESETS_EXPECTED_BYTES,
    buildPresetNameSysex,
    CONTROLS_DATA, getBytesIndex, getControlUpdateSysexMessages, getMidiSettingUpdateSysexMessages,
    isSysexData,
    mergeDeep,
    parseSysexDump, requestAllPresets,
    requestPreset,
    SINGLE_PRESET_EXPECTED_BYTES, splitDump, SYSEX_END, SYSEX_START
} from "../pacer/sysex";
import {flatDeep, MAX_FILE_SIZE, wait} from "../utils/misc";
import {hs} from "../utils/hexstring";

class StateStore {

    constructor() {

        // {
        //     "1":{                            // TARGET_PRESET
        //         "0":{                        // CURRENT preset
        //             "name":"NOTES",
        //             "controls":{...},
        //             "midi":{...}
        //         },
        //         "1":{                        // A1
        //             "name":"PRGM1",
        //             "controls":{...},
        //             "midi":{...}
        //         },
        //         ...
        //     },
        //     "5":{                            // TARGET_GLOBAL
        //         ...
        //     }
        // }

        this.data = null;

        this.bytesPresets = [[], [], [],    // current, track, transport
                             [], [], [], [], [], [],    // A1..A6
                             [], [], [], [], [], [],    // B1..B6
                             [], [], [], [], [], [],    // C1..C6
                             [], [], [], [], [], []]    // D1..D6
        this.bytesGlobal = [];

        this.sendProgress = null;

        this.currentPresetIndex = "";    // must be a string because it is used as a property name (object key) (https://stackoverflow.com/questions/3633362/is-there-any-way-to-use-a-numeric-type-as-an-object-key)
        this.currentControl = "";   // must be a string because it is used as a property name (object key) (https://stackoverflow.com/questions/3633362/is-there-any-way-to-use-a-numeric-type-as-an-object-key)
        this.updateMessages = {};
        this.midi = {
            inputs: [],         // array of MIDI inputs (filtered from WebMidi object)
            outputs: [],        // array of MIDI outputs (filtered from WebMidi object)
            input: 0,        // MIDI output port enabled
            output: 0        // MIDI output port enabled,
        };
        // this.pacerPresent = false;
        this.busy = false;
        this.busyMessage = "Receiving data, please wait...";
        this.bytesExpected = -1;
        this.progress = -1;    // 0..100
        //TODO:
        this.decBase = true;  // true --> decimal base, false --> hex base for number
        this.extControls = true;
        this.forceReread = false;
        this.changed = false;
        this.D6InfoVisible = false;
        this.D6InfoHidden = false;
    }

    //TODO:
    // bytes:
    // bytesPresets = [preset-index][]
    // bytesGlobals = []

    // pacerConnected() {
    //     return this.midi.output > 0 && this.midi.input > 0;
    // }

    get connected() {
        // console.log("get connected", this.midi.input, this.midi.output);
        return this.midi.output !== 0 && this.midi.input !== 0;
    }

    clearBytes() {
        this.bytesPresets = [[], [], [],    // current, track, transport
            [], [], [], [], [], [],    // A1..A6
            [], [], [], [], [], [],    // B1..B6
            [], [], [], [], [], [],    // C1..C6
            [], [], [], [], [], []]    // D1..D6
        this.bytesGlobal = [];
    }

    clear() {
        console.log("state: clear data");
        this.data = null;
        this.clearBytes();
        this.updateMessages = {};
    }

    showD6Info() {
        // if hidden, keep it hidden
        if (!this.D6InfoHidden) this.D6InfoVisible = true;
        console.log("showD6Info()", this.D6InfoVisible);
    }

    hideD6Info() {
        this.D6InfoVisible = false;
        this.D6InfoHidden = true;
    }

    toggleForceReread = () => {
        this.forceReread = !this.forceReread;
    }

    onBusy({busy = false, busyMessage = null, bytesExpected = -1, bytesReceived = -1} = {}) {

        // console.log("StateStore.onBusy", busy, busyMessage, bytesExpected, bytesReceived);

        let show = busy !== this.busy;
        show = show || (busyMessage !== null && busyMessage !== this.busyMessage);
        show = show || (bytesExpected > 0 && bytesExpected !== this.bytesExpected);

        let progress = -1;
        if (this.bytesExpected > 0 && bytesReceived > 0) {
            progress = Math.round(bytesReceived / this.bytesExpected * 100 / 5) * 5;
            show = show || ((progress >= 0) && (progress !== this.progress));
        }

        if (show) {
            if (this.busy !== busy) this.busy = busy;
            if (busyMessage !== null) this.busyMessage = busyMessage;
            if (bytesExpected > 0 && bytesExpected !== this.bytesExpected) this.bytesExpected = bytesExpected;
            if (busy === false) {
                this.bytesExpected = -1;
                this.progress = -1;
            } else {
                if (bytesExpected > 0) this.bytesExpected = bytesExpected;
                if (this.progress !== progress) {
                    this.progress = progress;
                }
            }
        }
    };

    showBusy({busy = false, busyMessage = null, bytesExpected = -1, bytesReceived = -1} = {}) {
        setTimeout(() => this.onBusy({busy: false}), 20000);
        this.onBusy({busy: true, busyMessage, bytesExpected, bytesReceived});
    }

    hideBusy(delay = 0) {
        if (delay < 1) {
            this.onBusy({busy: false});
            // this.sendProgress = null;
        } else {
            setTimeout(() => this.onBusy({busy: false}), delay);
        }
    }

    selectPreset(presetIndex) { // String
        // console.log("selectPreset", presetIndex, typeof presetIndex);
        this.currentPresetIndex = presetIndex;
    }

    selectControl(controlIndex) {
        // console.log("selectControl", controlIndex, typeof controlIndex);
        this.currentControl = controlIndex;
    }

    /**
     * Update the control mode of the currentControl of the currentPresetIndex
     * @param value
     */
    setControlMode(value) {
        this.data[TARGET_PRESET][this.currentPresetIndex][CONTROLS_DATA][this.currentControl]["control_mode"] = value;
        this.data[TARGET_PRESET][this.currentPresetIndex][CONTROLS_DATA][this.currentControl]["control_mode_changed"] = true;
        this.addControlUpdateMessage(this.currentControl, getControlUpdateSysexMessages(this.currentPresetIndex, this.currentControl, this.data));
        this.changed = true;
    }

    addControlUpdateMessage(controlId, msg) {
        if (!this.updateMessages.hasOwnProperty(this.currentPresetIndex)) {
            this.updateMessages[this.currentPresetIndex] = {};
        }
        if (!this.updateMessages[this.currentPresetIndex].hasOwnProperty(CONTROLS_DATA)) {
            this.updateMessages[this.currentPresetIndex][CONTROLS_DATA] = {};
        }
        this.updateMessages[this.currentPresetIndex][CONTROLS_DATA][controlId] = msg;
    }

    updatePresetName(presetIndex, name) {

        if (name === undefined || name === null) return;

        if (name.length > 5) {
            console.warn(`Presets.updateName: name too long: ${name}`);
            return;    // Calling .setState with null no longer triggers an update in React 16.
        }

        this.data[TARGET_PRESET][presetIndex]["name"] = name;
        this.data[TARGET_PRESET][presetIndex]["changed"] = true;     //TODO: used?


        if (!this.updateMessages.hasOwnProperty(presetIndex)) this.updateMessages[presetIndex] = {};
        if (!this.updateMessages[presetIndex].hasOwnProperty("name")) this.updateMessages[presetIndex]["name"] = {};

        this.updateMessages[presetIndex]["name"]["dummy"] = buildPresetNameSysex(presetIndex, this.data);

        this.changed = true;
    }

    /**
     * dataIndex is only used when dataType == "data"
     */
    updateControlStepMessageType(controlId, stepIndex, value, preset = this.currentPresetIndex) {

        // console.log(`updateControlStep(${controlId}, ${stepIndex}, ${dataType}, ${dataIndex}, ${value})`);

        let v = parseInt(value, 10);

        this.data[TARGET_PRESET][preset][CONTROLS_DATA][controlId]["steps"][stepIndex]["msg_type"] = v;

        if (v === MSG_CTRL_OFF) {
            this.data[TARGET_PRESET][preset][CONTROLS_DATA][controlId]["steps"][stepIndex]["active"] = 0;
        } else {
            this.data[TARGET_PRESET][preset][CONTROLS_DATA][controlId]["steps"][stepIndex]["active"] = 1;
        }

        this.data[TARGET_PRESET][preset][CONTROLS_DATA][controlId]["steps"][stepIndex]["changed"] = true;

        this.addControlUpdateMessage(controlId, getControlUpdateSysexMessages(preset, controlId, this.data));

        this.changed = true;
    }

    /**
     * dataIndex is only used when dataType == "data"
     */
    updateControlStep(controlId, stepIndex, dataType, dataIndex, value, preset = this.currentPresetIndex) {

        console.log(`updateControlStep(${controlId}, ${stepIndex}, ${dataType}, ${dataIndex}, ${value})`);

        let v = parseInt(value, 10);

        // const data = this.props.state.data;
        // const presetIndex = this.props.state.currentPreset;
        // const updateMessages = this.props.state.updateMessages;

        if (dataType === "data") {
            this.data[TARGET_PRESET][preset][CONTROLS_DATA][controlId]["steps"][stepIndex]["data"][dataIndex] = v;
        } else {
            this.data[TARGET_PRESET][preset][CONTROLS_DATA][controlId]["steps"][stepIndex][dataType] = v;
        }

        // if (dataType === "msg_type") {
        //     if (v === MSG_CTRL_OFF) {
        //         this.data[TARGET_PRESET][preset][CONTROLS_DATA][controlId]["steps"][stepIndex]["active"] = 0;
        //     } else {
        //         this.data[TARGET_PRESET][preset][CONTROLS_DATA][controlId]["steps"][stepIndex]["active"] = 1;
        //     }
        // }

        if (dataType.startsWith("led_")) {
            this.data[TARGET_PRESET][preset][CONTROLS_DATA][controlId]["steps"][stepIndex]["led_changed"] = true;
        } else {
            this.data[TARGET_PRESET][preset][CONTROLS_DATA][controlId]["steps"][stepIndex]["changed"] = true;
        }

        this.addControlUpdateMessage(controlId, getControlUpdateSysexMessages(preset, controlId, this.data));

        this.changed = true;
    }

    /**
     * dataIndex is only used when dataType == "data"
     */
    updateMidiSettings(settingIndex, dataType, dataIndex, value) {

        let v = parseInt(value, 10);

        const P = this.currentPresetIndex;

        // console.log("updateMidiSettings", settingIndex, dataType, dataIndex, value, v, P);

        // this.setState(
        //     produce(draft => {
                if (dataType === "data") {
                    this.data[TARGET_PRESET][P]["midi"][settingIndex]["data"][dataIndex] = v;
                } else {
                    this.data[TARGET_PRESET][P]["midi"][settingIndex][dataType] = v;
                }
                if (dataType === "msg_type") {
                    if (v === MSG_CTRL_OFF) {
                        this.data[TARGET_PRESET][P]["midi"][settingIndex]["active"] = 0;
                    } else {
                        this.data[TARGET_PRESET][P]["midi"][settingIndex]["active"] = 1;
                    }
                }
                this.data[TARGET_PRESET][P]["midi"][settingIndex]["changed"] = true;

                this.changed = true;

                if (!this.updateMessages.hasOwnProperty(P)) this.updateMessages[P] = {};
                if (!this.updateMessages[P].hasOwnProperty("midi")) this.updateMessages[P]["midi"] = {};

                //FIXME: update the methods that read updateMessages to allow object or array
                this.updateMessages[P]["midi"]["dummy"] = getMidiSettingUpdateSysexMessages(P, this.data);

            // })
        // );
    }

    sendSysex = (msg, sendForReal = true) => {
        if (!this.midi.output) {
            console.warn("no output enabled to send the message");
            return;
        }
        let out = outputById(this.midi.output);
        if (!out) {
            console.warn(`send: output ${this.midi.output} not found`);
            return;
        }
        // console.log("sendSysex", msg, hs(msg));
        if (sendForReal) out.sendSysex(SYSEX_SIGNATURE, msg);
    };

/*
    sendAny = msg => {
        if (!this.midi.output) {
            console.warn("no output enabled to send the message");
            return;
        }
        let out = outputById(this.midi.output);
        if (!out) {
            console.warn(`send: output ${this.midi.output} not found`);
            return;
        }
        console.log("sendAny", msg);
        out.send(msg);
    };
*/

    readPacer = (msg, bytesExpected, busyMessage = "Please wait...") => {
        this.showBusy({busy: true, busyMessage: busyMessage, bytesReceived: 0, bytesExpected});
        this.saveBytes = false;
        this.sendSysex(msg);
    };

    readPreset(index) {
        // if (midiConnected(this.state.output) && isVal(index)) {
        if (this.midi.output && this.midi.input) {
            this.readPacer(requestPreset(index), SINGLE_PRESET_EXPECTED_BYTES);
        }
    }

    /**
     * Request a full dump and save the data in state.bytes
     * @param busyMessage
     */
    readFullDump = (busyMessage = "Please wait...") => {
        // console.log("readFullDump()");
        this.showBusy({busy: true, busyMessage: busyMessage, bytesReceived: 0, bytesExpected: ALL_PRESETS_EXPECTED_BYTES});
        this.clearBytes();
        this.sendSysex(requestAllPresets());
    };


    getBytesPresetsAsBlob() {
        // const a = [];
        // this.bytesPresets.forEach(
        //     p => p.forEach(
        //         b => a.push(...b)
        //     )
        // );
        // return a;
        return new Uint8Array(flatDeep(this.bytesPresets, 100));
    }

    isBytesPresetEmpty() {
        return !this.bytesPresets.some(e => e && e.length > 0);
    }

    storeBytes(messages) {

        let i = 0;
        let cont = true;
        while (cont) {
            i = messages.indexOf(SYSEX_START, i);
            if (i < 0) break;

            i++;
            let k = messages.indexOf(SYSEX_END, i);
            let m = messages.slice(i-1, k+1)
            const bi = getBytesIndex(m);
            if (bi) {
                if (bi.isPresetName) {
                    // console.log("receiving a preset; clear bytes");
                    this.bytesPresets[bi.presetNum] = [];
                }
                if (bi.isPreset) {
                    this.bytesPresets[bi.presetNum].push(m);
                } else if (bi.isGlobal) {
                    this.bytesGlobal.push(m);
                    // console.log("storeBytes: global");
                } else {
                    console.warn("storeBytes: unsupported message", m);
                }
            }

        }
    }

    async readFiles(files) {

        // console.log("readFiles", files);

        // this.bytes = null;

        // let data = this.data;
        await Promise.all(files.map(
            async file => {
                if (file.size > MAX_FILE_SIZE) {
                    console.warn(`${file.name}: file too big, ${file.size}`);
                    this.hideBusy();
                } else {

                    console.log("readFiles: reading");

                    this.showBusy({busy: true, busyMessage: "loading file..."});

                    const data = new Uint8Array(await new Response(file).arrayBuffer());

                    if (isSysexData(data)) {
                        // console.log("readFiles: file is sysex");
                        this.data = mergeDeep(this.data || {}, parseSysexDump(data))
                        this.storeBytes(data);
                    } else {
                        console.log("readFiles: not a sysex file", hs(data.slice(0, 5)));
                    }
                    this.hideBusy();
                    // non sysex files are ignored
                }
                // too big files are ignored
            }
        ));
        // this.props.state.data = data;
    }

    updatePacer() {
        //FIXME: externalize this method

        this.showBusy({busy: true, busyMessage: "write Preset..."});

        Object.getOwnPropertyNames(this.updateMessages).forEach(
            presetId => {
                Object.getOwnPropertyNames(this.updateMessages[presetId]).forEach(
                    ctrlType => {
                        Object.getOwnPropertyNames(this.updateMessages[presetId][ctrlType]).forEach(
                            ctrl => {
                                this.updateMessages[presetId][ctrlType][ctrl].forEach(
                                    msg => {
                                        this.sendSysex(msg);
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );

        //FIXME: update this code
        setTimeout(
            () => {
                this.changed = false;
                this.updateMessages = {};
                this.readPreset(this.currentPresetIndex);
            },
            1000
        );
    }

    /**
     * Send the current data saved in state.bytes
     * @param patch
     */
    sendDump = async () => {

        // console.log("sendDump");

        if (!this.midi.output) {
            console.warn("sendPatch: no output enabled to send the message");
            return;
        }

        // let out = outputById(this.state.output);
        // if (!out) {
        //     console.warn(`send: output ${this.state.output} not found`);
        //     return;
        // }

        // this.showBusy({busy: true, busyMessage: "sending dump..."});

        this.sendProgress = 'building sysex messages...';
        await wait(20); // to force an update to of the UI to display the above message

        // console.log(this.sendProgress);

        const messages = splitDump(Array.from(this.getBytesPresetsAsBlob()));

        let i = 0;
        let t = messages.length;

        for (const message of messages) {
            i++;
            this.sendProgress = `sending message ${i} of ${t} (${Math.round(i*100/t)}%)`;
            this.sendSysex(message);
            await wait(10);
        }

        setTimeout(() => this.sendProgress = null, 2000);
    };


} // class StateStore

decorate(StateStore, {
    bytes: observable,

    bytesPresets: observable,
    bytesGlobal: observable,
    sendProgress: observable,
    // sendProgressTotal: observable,

    data: observable,
    currentPresetIndex: observable,
    currentControl: observable,
    // presetIndex: observable,
    updateMessages: observable,
    midi: observable,
    // pacerPresent: observable,
    connected: computed,
    busy: observable,
    busyMessage: observable,
    progress: observable,
    decBase: observable,
    extControls: observable,
    forceReread: observable,
    changed: observable,
    D6InfoVisible: observable
});

// export default new StateStore();
export const state = new StateStore();
