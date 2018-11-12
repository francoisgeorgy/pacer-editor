import React, {Component, Fragment} from 'react';
import PresetSelector from "../components/PresetSelector";
import {
    buildPresetNameSysex,
    getMidiSettingUpdateSysexMessages,
    isSysexData,
    mergeDeep,
    parseSysexDump
} from "../utils/sysex";
import Midi from "../components/Midi";
import MidiPort from "../components/MidiPort";
import Dropzone from "react-dropzone";
import "./Preset.css";
import Status from "../components/Status";
import {produce} from "immer";
import {
    MSG_CTRL_OFF,
    PACER_MIDI_PORT_NAME,
    requestPreset,
    SYSEX_SIGNATURE,
    TARGET_PRESET
} from "../pacer";
import {hs} from "../utils/hexstring";
import MidiSettingsEditor from "../components/MidiSettingsEditor";
import {inputName, outputById, outputName} from "../utils/ports";
import PresetNameEditor from "../components/PresetNameEditor";

const MAX_FILE_SIZE = 5 * 1024*1024;

const MAX_STATUS_MESSAGES = 40;

function batchMessages(callback, wait) {

    let messages = [];  // array of data arrays

    let timeout;

    return function() {
        console.log("func enter", arguments);

        // first, reset the timeout
        clearTimeout(timeout);

        // const context = this;

        let event = arguments[0];
        // console.log(event.type);

        //TODO: filter by type, name, port, ...

        // channel: 1
        // data: Uint8Array(3) [144, 47, 115]
        // note: {number: 47, name: "B", octave: 2}
        // rawVelocity: 115
        // target: Input {_userHandlers: {…}, _midiInput: MIDIInput, …}
        // timestamp: 9612.800000000789
        // type: "noteon"
        // velocity: 0.905511811023622

        messages.push(event.data);
        console.log("messages", messages);

        timeout = setTimeout(() => {
            console.log("timeout elapsed");
            timeout = null;
            callback(messages);
        }, wait);
    };

}

class PresetMidi extends Component {

    state = {
        output: null,       // MIDI output port used for output
        presetIndex: null,  //
        changed: false,     // true when the control has been edited
        data: null,
        statusMessages: []
    };

    /**
     * Ad-hoc method to show the busy flag and set a timeout to make sure the busy flag is hidden after a timeout.
     */
    showBusy = () =>  {
        // let context = this;
        setTimeout(() => this.props.onBusy(false), 20000);
        this.props.onBusy(true);
    };

    addStatusMessage = (type, message) => {
        this.setState(
            produce(draft => {
                let m = { type, message };
                // let len = draft.statusMessages.unshift(m);
                // if (len > MAX_STATUS_MESSAGES) draft.statusMessages.pop();
                let len = draft.statusMessages.push(m);
                if (len > MAX_STATUS_MESSAGES) draft.statusMessages.shift();
            })
        );
    };

    addInfoMessage= message => {
        this.addStatusMessage("info", message);
    };

    addWarningMessage= message => {
        this.addStatusMessage("warning", message);
    };

    addErrorMessage= message => {
        this.addStatusMessage("error", message);
    };

/*
     handleMidiInputEvent = (event) => {
        // console.log("PresetMidi.handleMidiInputEvent", event, event.data);
        // if (event instanceof MIDIMessageEvent) {
        if (isSysexData(event.data)) {
            // this.props.onBusy(true);
            this.setState(
                produce(draft => {
                    draft.data = mergeDeep(draft.data || {}, parseSysexDump(event.data));
                    let pId = Object.keys(draft.data[TARGET_PRESET])[0];
                    draft.presetIndex = parseInt(pId, 10);
                    // console.log(`PresetMidi.handleMidiInputEvent, preset Id from data is ${draft.presetIndex}`);
                    // this.props.onBusy(false);
                })
            );
            this.addInfoMessage(`sysex received (${event.data.length} bytes)`);
        } else {
            console.log("MIDI message is not a sysex message")
        }
        // }
    };
 */

    handleMidiInputEvent = batchMessages(
        messages => {
            this.setState(
                produce(
                    draft => {
                        for (let m of messages) {
                            if (isSysexData(m)) {
                                draft.data = mergeDeep(m || {}, parseSysexDump(m));
                            } else {
                                console.log("MIDI message is not a sysex message")
                            }
                        }
                        let pId = Object.keys(draft.data[TARGET_PRESET])[0];
                        draft.presetIndex = parseInt(pId, 10);
                    }
                )
            );
            let bytes = messages.reduce((accumulator, element) => accumulator + element.length, 0);
            this.addInfoMessage(`${messages.length} messages received (${bytes} bytes)`);
            this.props.onBusy(false);
        },
        2000
    );

    /**
     *
     * @param files
     * @returns {Promise<void>}
     */
    async readFiles(files) {
        await Promise.all(files.map(
            async file => {
                if (file.size > MAX_FILE_SIZE) {
                    console.warn(`readFiles: ${file.name}: file too big, ${file.size}`);
                    this.addWarningMessage("file too big");
                } else {
                    const data = new Uint8Array(await new Response(file).arrayBuffer());
                    if (isSysexData(data)) {
                        //this.props.onBusy(true);
                        this.showBusy();
                        this.setState(
                            produce(draft => {
                                // draft.data = mergeDeep(draft.data || {}, parseSysexDump(data));
                                draft.data = parseSysexDump(data);
                                let pId = Object.keys(draft.data[TARGET_PRESET])[0];
                                draft.presetIndex = parseInt(pId, 10);
                            })
                        );
                        this.addInfoMessage("sysfile decoded");
                        this.props.onBusy(false);
                    } else {
                        this.addWarningMessage("not a sysfile");
                        console.log("readFiles: not a sysfile", hs(data.slice(0, 5)));
                    }
                    // non sysex files are ignored
                }
                // too big files are ignored
            }
        ));
    }

    /**
     * Drop Zone handler
     * @param files
     */
    onDrop = (files) => {
        console.log('drop', files);
        this.setState(
            {
                data: null,
                changed: false
            },
            () => {this.readFiles(files)}   // returned promise from readFiles() is ignored, this is normal.
        );
    };

    selectPreset = (id) => {
        // console.log(`selectPreset ${id}`);
        // if the user selects another preset or control, then clear the data in the state

/* TODO: delete after test new implementation.
        if (id !== this.state.presetIndex) {
            this.setState({
                presetIndex: id,
                data: null
            });
        } else {
            this.setState({
                presetIndex: id
            });
        }
*/
        this.setState(
            produce(draft => {
                draft.presetIndex = id;
                if (id !== this.state.presetIndex) {
                    draft.data = null;
                    draft.data = null;
                }
            })
        );
        this.sendSysex(requestPreset(id));
    };

    /**
     * dataIndex is only used when dataType == "data"
     */
    updateMidiSettings = (settingIndex, dataType, dataIndex, value) => {
        console.log("PresetMidi.updateMidiSettings", settingIndex, dataIndex, value);
        let v = parseInt(value, 10);
        this.setState(
            produce(draft => {
                if (dataType === "data") {
                    draft.data[TARGET_PRESET][draft.presetIndex]["midi"][settingIndex]["data"][dataIndex] = v;
                } else {
                    draft.data[TARGET_PRESET][draft.presetIndex]["midi"][settingIndex][dataType] = v;
                }
                if (dataType === "msg_type") {
                    console.log('msg_type', dataType, value);
                    if (v === MSG_CTRL_OFF) {
                        console.log('set active 0');
                        draft.data[TARGET_PRESET][draft.presetIndex]["midi"][settingIndex]["active"] = 0;
                    } else {
                        console.log('set active 1');
                        draft.data[TARGET_PRESET][draft.presetIndex]["midi"][settingIndex]["active"] = 1;
                    }
                }
                draft.data[TARGET_PRESET][draft.presetIndex]["midi"][settingIndex]["changed"] = true;
                draft.changed = true;
            })
        );
    };

    updatePresetName = (name) => {
        console.log("PresetMidi.updateName", name);
        if (name === undefined || name === null) return;
        if (name.length > 5) {
            console.warn(`PresetMidi.updateName: name too long: ${name}`);
            return;
        }
        this.setState(
            produce(draft => {
                draft.data[TARGET_PRESET][draft.presetIndex]["name"] = name;    // TODO : buld update message
                draft.data[TARGET_PRESET][draft.presetIndex]["changed"] = true;
                draft.changed = true;
            })
        );
    };

    renderPort = (port, selected, clickHandler) => {
        if (port === undefined || port === null) return null;
        return (
            <MidiPort key={port.id} port={port} selected={selected} clickHandler={clickHandler} />
        )
    };

    onInputConnection = (port_id) => {
        this.addInfoMessage(`input ${inputName(port_id)} connected`);
    };

    onInputDisconnection = (port_id) => {
        this.addInfoMessage(`input ${inputName(port_id)} disconnected`);
    };

    onOutputConnection = (port_id) => {
        this.setState(
            produce(draft => {
                draft.output = port_id;
            })
        );
        this.addInfoMessage(`output ${outputName(port_id)} connected`);
    };

    onOutputDisconnection = (port_id) => {
        this.addInfoMessage(`output ${outputName(port_id)} disconnected`);
    };

    sendSysex = msg => {
        console.log("sendSysex", msg);
        if (!this.state.output) {
            console.warn("no output enabled to send the message");
            return;
        }
        let out = outputById(this.state.output);
        if (!out) {
            console.warn(`send: output ${this.state.output} not found`);
            return;
        }
        // this.props.onBusy(true);
        this.showBusy();
        // this.setState(
        //     // {data: null},
        //     () => out.sendSysex(SYSEX_SIGNATURE, msg)
        // );
        out.sendSysex(SYSEX_SIGNATURE, msg);
    };

    updatePacer = (messages) => {
        console.log("PresetMidi.updatePacer");
        for (let m of messages) {
            this.sendSysex(m);
        }
        this.addInfoMessage(`update${messages.length > 1 ? 's' : ''} sent to Pacer`);
    };

    render() {

        const { presetIndex, data, changed } = this.state;

        // console.log("PresetMidi.render: ", presetIndex);

        let showEditor = false;

        if (data) {

            showEditor = true;

            if (!(TARGET_PRESET in data)) {
                console.log(`PresetMidi: invalid data`, data);
                showEditor = false;
            }

            if (showEditor && !(presetIndex in data[TARGET_PRESET])) {
                // console.log(`PresetMid: preset ${presetIndex} not found in data`);
                showEditor = false;
            }

            if (showEditor && !("midi" in data[TARGET_PRESET][presetIndex])) {
                // console.log(`PresetMidi: midi not found in data`);
                showEditor = false;
            }

        }

        showEditor = showEditor && (Object.keys(data[TARGET_PRESET][presetIndex]["midi"]).length === 16);

        let updateMessages = [];
        if (showEditor) {
            updateMessages = getMidiSettingUpdateSysexMessages(presetIndex, data);
            let n = buildPresetNameSysex(presetIndex, data);
            if (n) {
                updateMessages.push(n);
            }
        }

        // console.log("PresetMidi.render", showEditor, presetIndex);

        return (
            <div className="wrapper">
                <div className="content">

                    <div className="content-row step-1">
{/*
                        <div className="background">
                            Connect
                        </div>
                        <div className="content-row-header">
                            1
                        </div>
*/}
                        <div className="content-row-content row-middle-aligned">
                            <Midi only={PACER_MIDI_PORT_NAME} autoConnect={PACER_MIDI_PORT_NAME}
                                  inputRenderer={this.renderPort} outputRenderer={this.renderPort}
                                  onMidiInputEvent={this.handleMidiInputEvent}
                                  onInputConnection={this.onInputConnection}
                                  onInputDisconnection={this.onInputDisconnection}
                                  onOutputConnection={this.onOutputConnection}
                                  onOutputDisconnection={this.onOutputDisconnection}
                                  className="sub-header" >
                                <div className="no-midi">Please connect your Pacer to your computer.</div>
                            </Midi>
                        </div>
                    </div>
                    <div className="content-row step-2">
{/*
                        <div className="background">
                            Select
                        </div>
                        <div className="content-row-header">
                            2
                        </div>
*/}
                        <div className="content-row-content">

                            <h2>Choose the preset to edit:</h2>

                            <div className="selectors">
                                <PresetSelector currentPreset={presetIndex} onClick={this.selectPreset} />
                            </div>
                        </div>
                    </div>

                    <div className="content-row step-3">
{/*
                        <div className="background">
                            Edit
                        </div>
                        <div className="content-row-header">
                            3
                        </div>
*/}
                        <div className="content-row-content">
                            {showEditor &&
                            <Fragment>
                                <h2>Preset name:</h2>
                                <PresetNameEditor name={data[TARGET_PRESET][presetIndex]["name"]}
                                                    onUpdate={(name) => this.updatePresetName(name)} />
                                <h2>Preset MIDI settings:</h2>
                                <MidiSettingsEditor settings={data[TARGET_PRESET][presetIndex]["midi"]}
                                                    onUpdate={(settingIndex, dataType, dataIndex, value) => this.updateMidiSettings(settingIndex, dataType, dataIndex, value)} />
                            </Fragment>
                            }
                        </div>
                    </div>

                    <div className="content-row step-4">
{/*
                        <div className="background">
                            Write
                        </div>
                        <div className="content-row-header">
                            4
                        </div>
*/}
                        <div className="content-row-content">
                            {changed &&
                            <Fragment>
                                <h2>Send the updated config to the Pacer:</h2>
                                <div className="actions">
                                    <button className="update" onClick={() => this.updatePacer(updateMessages)}>Update Pacer</button>
                                </div>
                            </Fragment>
                            }
                        </div>
                    </div>

                    <div>
                        {showEditor && <div className="debug">
                            <h4>[Debug] update message to send to Pacer:</h4>
                            <div className="message-to-send">
                                {updateMessages.map((m, i) => <div key={i} className="code">{hs(m)}</div>)}
                            </div>
                        </div>}

{/*
                        {data && <div className="debug">
                            <h4>[Debug] sysex data:</h4>
                            <pre>{JSON.stringify(data, null, 4)}</pre>
                        </div>}
*/}

                    </div>
                </div>

                <div className="help">

                    <Dropzone onDrop={this.onDrop} className="drop-zone">
                        Drop a binary sysex file here<br />or click to open the file dialog
                    </Dropzone>

                    <h3>Log:</h3>
                    <Status messages={this.state.statusMessages} />

                </div>

            </div>
        );
    }

}

export default PresetMidi;
