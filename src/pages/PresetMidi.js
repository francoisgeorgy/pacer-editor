import React, {Component, Fragment} from 'react';
import PresetSelector from "../components/PresetSelector";
import {
    ALL_PRESETS_EXPECTED_BYTES,
    buildPresetNameSysex,
    getMidiSettingUpdateSysexMessages,
    isSysexData,
    mergeDeep,
    parseSysexDump, requestAllPresets, requestPreset, SINGLE_PRESET_EXPECTED_BYTES
} from "../pacer/sysex";
import Midi from "../components/Midi";
import Dropzone from "react-dropzone";
import "./Preset.css";
import {produce} from "immer";
import {
    ANY_MIDI_PORT,
    MSG_CTRL_OFF,
    PACER_MIDI_PORT_NAME,
    SYSEX_SIGNATURE,
    TARGET_PRESET
} from "../pacer/constants";
import {hs} from "../utils/hexstring";
import MidiSettingsEditor from "../components/MidiSettingsEditor";
import {inputName, outputById, outputName} from "../utils/ports";
import PresetNameEditor from "../components/PresetNameEditor";
import PortsGrid from "../components/PortsGrid";

const MAX_FILE_SIZE = 5 * 1024*1024;

const MAX_STATUS_MESSAGES = 40;

function isVal(v) {
    return v !== undefined && v !== null && v !== '';
}

function batchMessages(callback, callbackBusy, wait) {

    let messages = [];  // batch of received messages
    let timeout;

    return function() {
        clearTimeout(timeout);
        let event = arguments[0];
        messages.push(event.data);
        // console.log('rec sysex', messages.length);
        callbackBusy(messages.length);
        timeout = setTimeout(() => {
            // console.log("timeout elapsed");
            timeout = null;
            callback(messages);
            messages = [];
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
    showBusy = ({busy = false, busyMessage = null, bytesExpected = -1, bytesReceived = -1} = {}) =>  {
        // console.log("show busy", busyMessage);
        setTimeout(() => this.props.onBusy({busy: false}), 20000);
        this.props.onBusy({busy: true, busyMessage, bytesExpected, bytesReceived});
    };

    addStatusMessage = (type, message) => {
        this.setState(
            produce(draft => {
                let m = { type, message };
                let len = draft.statusMessages.push(m);
                if (len > MAX_STATUS_MESSAGES) draft.statusMessages.shift();
            })
        );
    };

    addInfoMessage = message => {
        this.addStatusMessage("info", message);
    };

    addWarningMessage = message => {
        this.addStatusMessage("warning", message);
    };

    addErrorMessage = message => {
        this.addStatusMessage("error", message);
    };

    handleMidiInputEvent = batchMessages(
        messages => {
            this.setState(
                produce(
                    draft => {
                        for (let m of messages) {
                            if (isSysexData(m)) {
                                draft.data = mergeDeep(draft.data || {}, parseSysexDump(m));
                            } else {
                                console.log("MIDI message is not a sysex message")
                            }
                        }
                        let pId = Object.keys(draft.data[TARGET_PRESET])[0];
                        draft.presetIndex = parseInt(pId, 10);
                    }
                )
            );
            // let bytes = messages.reduce((accumulator, element) => accumulator + element.length, 0);
            // this.addInfoMessage(`${messages.length} messages received (${bytes} bytes)`);
            // this.props.onBusy(false);
            this.props.onBusy({busy: false});
        },
        (n) => {
            // console.log(n);
            this.props.onBusy({busy: true, bytesReceived: n});
        },
        1000
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
                    // this.addWarningMessage("file too big");
                } else {
                    this.showBusy({busy: true, busyMessage: "loading file..."});
                    const data = new Uint8Array(await new Response(file).arrayBuffer());
                    if (isSysexData(data)) {
                        this.setState(
                            produce(draft => {
                                // draft.data = mergeDeep(draft.data || {}, parseSysexDump(data));
                                draft.data = parseSysexDump(data);
                                let pId = Object.keys(draft.data[TARGET_PRESET])[0];
                                draft.presetIndex = parseInt(pId, 10);
                            })
                        );
                        this.addInfoMessage("sysfile decoded");
                    } else {
                        this.addWarningMessage("not a sysfile");
                        console.log("readFiles: not a sysfile", hs(data.slice(0, 5)));
                    }
                    this.props.onBusy({busy: false});
                    // non sysex files are ignored
                }
                // too big files are ignored
            }
        ));
    }

    onChangeFile = (e) => {
        console.log("onChangeFile", e);
        var file = e.target.files[0];
        console.log(file);
        this.readFiles([file]);
    };

    onInputFile = (e) => {
        console.log("onInputFile", e);
        this.inputOpenFileRef.current.click()
    };

    onDragEnter = () => {
        this.setState({
            dropZoneActive: true
        });
    };

    onDragLeave= () => {
        this.setState({
            dropZoneActive: false
        });
    };

    /**
     * Drop Zone handler
     * @param files
     */
    onDrop = (files) => {
        // console.log('drop', files);
        this.setState(
            {
                data: null,
                changed: false,
                dropZoneActive: false
            },
            () => {this.readFiles(files)}   // returned promise from readFiles() is ignored, this is normal.
        );
    };

    selectPreset = (index) => {
        // if the user selects another preset or control, then clear the data in the state
        const { data } = this.state;
        if (data && data[TARGET_PRESET] && data[TARGET_PRESET][index]) {
            this.setState(
                produce(draft => {
                    draft.presetIndex = index;
                })
            );
        } else {
            this.setState(
                produce(draft => {
                    draft.presetIndex = index;
                    if (index !== this.state.presetIndex) {
                        draft.data = null;
                        draft.changed = false;
                    }
                })
            );
            if (isVal(index)) {   // && this.state.controlId) {
                // this.sendSysex(requestPresetObj(id, this.state.controlId));
                // To get the LED data, we need to request the complete preset config instead of just the specific control's config.
                this.sendSysex(requestPreset(index), SINGLE_PRESET_EXPECTED_BYTES);
            }
        }
    };

    /**
     * dataIndex is only used when dataType == "data"
     */
    updateMidiSettings = (settingIndex, dataType, dataIndex, value) => {
        // console.log("PresetMidi.updateMidiSettings", settingIndex, dataIndex, value);
        let v = parseInt(value, 10);
        this.setState(
            produce(draft => {
                if (dataType === "data") {
                    draft.data[TARGET_PRESET][draft.presetIndex]["midi"][settingIndex]["data"][dataIndex] = v;
                } else {
                    draft.data[TARGET_PRESET][draft.presetIndex]["midi"][settingIndex][dataType] = v;
                }
                if (dataType === "msg_type") {
                    if (v === MSG_CTRL_OFF) {
                        draft.data[TARGET_PRESET][draft.presetIndex]["midi"][settingIndex]["active"] = 0;
                    } else {
                        draft.data[TARGET_PRESET][draft.presetIndex]["midi"][settingIndex]["active"] = 1;
                    }
                }
                draft.data[TARGET_PRESET][draft.presetIndex]["midi"][settingIndex]["changed"] = true;
                draft.changed = true;
            })
        );
    };

    updatePresetName = (name) => {
        // console.log("PresetMidi.updateName", name);
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

    onInputConnection = (port_id) => {
        this.addInfoMessage(`input ${inputName(port_id)} connected`);
    };

    onInputDisconnection = (port_id) => {
        this.addInfoMessage(`input ${inputName(port_id)} disconnected`);
    };

    onOutputConnection = (port_id) => {
        console.log("onOutputConnection");
        this.setState(
            produce(draft => {
                draft.output = port_id;
            })
        );
        // this.addInfoMessage(`output ${outputName(port_id)} connected`);
    };

    onOutputDisconnection = (port_id) => {
        console.log("onOutputDisconnection");
        this.setState(
            produce(draft => {
                draft.output = null;        // we manage only one output connection at a time
            })
        );
        this.addInfoMessage(`output ${outputName(port_id)} disconnected`);
    };

    sendSysex = (msg, bytesExpected) => {
        console.log("sendSysex", msg, bytesExpected);
        if (!this.state.output) {
            console.warn("no output enabled to send the message");
            return;
        }
        let out = outputById(this.state.output);
        if (!out) {
            console.warn(`send: output ${this.state.output} not found`);
            return;
        }
        this.showBusy({busy: true, busyMessage: "receiving data...", bytesReceived: 0, bytesExpected});
        out.sendSysex(SYSEX_SIGNATURE, msg);
    };

    updatePacer = (messages) => {
        for (let m of messages) {
            this.sendSysex(m, 0);
        }
        // this.addInfoMessage(`update${messages.length > 1 ? 's' : ''} sent to Pacer`);
    };

    render() {

        const { output, presetIndex, data, changed, dropZoneActive } = this.state;

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

        const overlayStyle = {
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            paddingTop: '4rem',
            background: 'rgba(0,0,0,0.4)',
            textAlign: 'center',
            color: '#fff',
            fontSize: '4rem'
        };

        return (

            <Dropzone
                disableClick
                style={{position: "relative"}}
                // accept={accept}
                onDrop={this.onDrop}
                onDragEnter={this.onDragEnter}
                onDragLeave={this.onDragLeave}
            >
            {dropZoneActive &&
            <div style={overlayStyle}>
                Drop sysex file...
            </div>}

            <div className="wrapper">

                <div className="subheader">
                    <Midi only={ANY_MIDI_PORT} autoConnect={PACER_MIDI_PORT_NAME}
                          portsRenderer={(groupedPorts, clickHandler) => <PortsGrid groupedPorts={groupedPorts} clickHandler={clickHandler} />}
                          onMidiInputEvent={this.handleMidiInputEvent}
                          onInputConnection={this.onInputConnection}
                          onInputDisconnection={this.onInputDisconnection}
                          onOutputConnection={this.onOutputConnection}
                          onOutputDisconnection={this.onOutputDisconnection}
                          className="" >
                        <div className="no-midi">Please connect your Pacer to your computer.</div>
                    </Midi>
                </div>

                <div className="content">

                    <div className="instructions">
                        You can click on a preset to only load this specific preset from the Pacer. <br />
                        Or you can use the ad-hoc button to read ALL the presets from the Pacer. <br />
                        You can also load a patch file or send a dump from the Pacer.
                    </div>

                    <div className="content-row-content first">
                        <h2>Preset:</h2>
                        <div className="content-row-content-content">
                            <div className="selectors">
                                <PresetSelector data={data} currentPreset={presetIndex} onClick={this.selectPreset} />
                                <div className="preset-buttons">
                                    {output && <button className="space-right" onClick={() => this.sendSysex(requestAllPresets(), ALL_PRESETS_EXPECTED_BYTES)}>Read all presets from Pacer</button>}
                                    <input ref={this.inputOpenFileRef} type="file" style={{display:"none"}}  onChange={this.onChangeFile} />
                                    <button onClick={this.onInputFile}>Load preset(s) from file</button>
                                    {/*data &&
                                    <Download data={this.state.binData} filename={`pacer-preset-${presetIndexToXY(presetIndex)}`} addTimestamp={true}
                                              label="Download preset" />
                                    */}
                                </div>
                            </div>
                            {data && data[TARGET_PRESET][presetIndex] && <PresetNameEditor name={data[TARGET_PRESET][presetIndex]["name"]} onUpdate={(name) => this.updatePresetName(name)} />}
                        </div>
                    </div>

                    {showEditor &&
                    <div className="content-row-content">
                        <Fragment>
                            <h2>Preset MIDI settings:</h2>
                            <div className="content-row-content-content">
                                <MidiSettingsEditor settings={data[TARGET_PRESET][presetIndex]["midi"]}
                                                    onUpdate={(settingIndex, dataType, dataIndex, value) => this.updateMidiSettings(settingIndex, dataType, dataIndex, value)} />
                            </div>
                        </Fragment>
                    </div>
                    }

                    {changed &&
                    <div className="content-row-content">
                        <Fragment>
                            <h2>Send the updated config to the Pacer:</h2>
                            <div className="content-row-content-content">
                                <div className="actions">
                                    <button className="update" onClick={() => this.updatePacer(updateMessages)}>Update Pacer</button>
                                </div>
                            </div>
                        </Fragment>
                    </div>
                    }

                    {this.props.debug && showEditor &&
                    <div className="content-row-content first">
                        <div className="debug">
                            <h4>[Debug] Update messages to send:</h4>
                            <div className="message-to-send">
                                {updateMessages.map((m, i) => <div key={i} className="code">{hs(m)}</div>)}
                            </div>
                        </div>
                    </div>
                    }

                </div>

            </div>

            </Dropzone>

        );
    }

}

export default PresetMidi;
