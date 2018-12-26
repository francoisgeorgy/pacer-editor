import React, {Component, Fragment} from 'react';
import PresetSelector from "../components/PresetSelector";
import {
    ALL_PRESETS_EXPECTED_BYTES,
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
import {outputById} from "../utils/ports";
import PresetNameEditor from "../components/PresetNameEditor";
import PortsGrid from "../components/PortsGrid";
import {batchMessages, outputIsPacer} from "../utils/midi";
import {dropOverlayStyle, MAX_FILE_SIZE} from "../utils/misc";
import {updateMessageName} from "../utils/state";
import UpdateMessages from "../components/UpdateMessages";

function isVal(v) {
    return v !== undefined && v !== null && v !== '';
}

class PresetMidi extends Component {

    constructor(props) {
        super(props);
        this.inputOpenFileRef = React.createRef();
        this.state = {
            output: null,       // MIDI output port used for output
            presetIndex: null,  //
            changed: false,     // true when the control has been edited
            updateMessages: {},
            data: null          // ,
            // statusMessages: []
        };
    }

    clearData = () => {
        this.setState({data: null, updateMessages: {}, changed: false});
    };

    /**
     * Ad-hoc method to show the busy flag and set a timeout to make sure the busy flag is hidden after a timeout.
     */
    showBusy = ({busy = false, busyMessage = null, bytesExpected = -1, bytesReceived = -1} = {}) =>  {
        // console.log("show busy", busyMessage);
        setTimeout(() => this.props.onBusy({busy: false}), 20000);
        this.props.onBusy({busy: true, busyMessage, bytesExpected, bytesReceived});
    };

/*
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
*/

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
                        // let pId = Object.keys(draft.data[TARGET_PRESET])[0];
                        // draft.presetIndex = parseInt(pId, 10);
                    }
                )
            );
            // let bytes = messages.reduce((accumulator, element) => accumulator + element.length, 0);
            // this.addInfoMessage(`${messages.length} messages received (${bytes} bytes)`);
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
                                // if the file contains only one preset, then automatically select it:
                                if (Object.keys(draft.data[TARGET_PRESET]).length === 1) {
                                    draft.presetIndex = parseInt(Object.keys(draft.data[TARGET_PRESET])[0], 10);
                                }
                            })
                        );
                        // this.addInfoMessage("sysfile decoded");
                    } else {
                        // this.addWarningMessage("not a sysfile");
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
        let file = e.target.files[0];
        console.log(file);
        // noinspection JSIgnoredPromiseFromCall
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
        this.setState(
            {
                data: null,
                changed: false,
                dropZoneActive: false
            },
            () => { this.readFiles(files) }   // returned promise from readFiles() is ignored, this is normal.
        );
    };

    selectPreset = (index) => {
        //if (!outputIsPacer(this.state.output)) return;
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
                }),
                () => {
                    if (outputIsPacer(this.state.output) && isVal(index)) {
                        this.readPacer(requestPreset(index), SINGLE_PRESET_EXPECTED_BYTES);
                    }
                }
            );
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

                // we use a similar data structure as in Preset.js, with controlId replaced by "midi"
                if (!draft.updateMessages.hasOwnProperty(draft.presetIndex)) draft.updateMessages[draft.presetIndex] = {};
                if (!draft.updateMessages[draft.presetIndex].hasOwnProperty("midi")) draft.updateMessages[draft.presetIndex]["midi"] = {};

                //FIXME: update the methods that read updateMessages to allow object or array
                draft.updateMessages[draft.presetIndex]["midi"]["dummy"] = getMidiSettingUpdateSysexMessages(draft.presetIndex, draft.data);

            })
        );
    };

    updatePresetName = (name) => {
        this.setState(updateMessageName(this.state, {name}));
    };

    onInputConnection = (port_id) => {
        // this.addInfoMessage(`input ${inputName(port_id)} connected`);
    };

    onInputDisconnection = (port_id) => {
        // this.addInfoMessage(`input ${inputName(port_id)} disconnected`);
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
        // this.addInfoMessage(`output ${outputName(port_id)} disconnected`);
    };

    sendSysex = msg => {
        // console.log("sendSysex", hs(msg));
        if (!this.state.output) {
            console.warn("no output enabled to send the message");
            return;
        }
        let out = outputById(this.state.output);
        if (!out) {
            console.warn(`send: output ${this.state.output} not found`);
            return;
        }
        out.sendSysex(SYSEX_SIGNATURE, msg);
    };

    readPacer = (msg, bytesExpected) => {
        this.showBusy({busy: true, busyMessage: "receiving data...", bytesReceived: 0, bytesExpected});
        this.sendSysex(msg);
    };

    updatePacer = (messages) => {
        //FIXME: externalize this method

        this.showBusy({busy: true, busyMessage: "write Preset..."});

        Object.getOwnPropertyNames(messages).forEach(
            presetId => {
                Object.getOwnPropertyNames(messages[presetId]).forEach(
                    ctrlType => {
                        Object.getOwnPropertyNames(messages[presetId][ctrlType]).forEach(
                            ctrl => {
                                messages[presetId][ctrlType][ctrl].forEach(
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

        setTimeout(() => {
            // console.log("updatePacer: clear changed flag and updateMessages array");
            this.setState({changed: false, updateMessages: {}}, () => this.readPacer(requestPreset(this.state.presetIndex), SINGLE_PRESET_EXPECTED_BYTES, "read updated preset"));
        }, 1000);
    };

    render() {

        const { output, presetIndex, data, changed, updateMessages, dropZoneActive } = this.state;

        let showEditor = false;

        if (data) {
            showEditor = (TARGET_PRESET in data) &&
                         (presetIndex in data[TARGET_PRESET]) &&
                         ("midi" in data[TARGET_PRESET][presetIndex]) &&
                         (Object.keys(data[TARGET_PRESET][presetIndex]["midi"]).length === 16)
        }

        return (

            <Dropzone
                disableClick
                style={{position: "relative"}}
                // accept={accept}
                onDrop={this.onDrop}
                onDragEnter={this.onDragEnter}
                onDragLeave={this.onDragLeave}>

                {dropZoneActive &&
                <div style={dropOverlayStyle}>
                    Drop sysex file...
                </div>}

                <div className="wrapper">

                    <div className="subheader">
                        <Midi only={ANY_MIDI_PORT} autoConnect={PACER_MIDI_PORT_NAME}
                              portsRenderer={(groupedPorts, clickHandler) => <PortsGrid groupedPorts={groupedPorts} clickHandler={clickHandler} />}
                              messageType="sysex"
                              onMidiInputEvent={this.handleMidiInputEvent}
                              onInputConnection={this.onInputConnection}
                              onInputDisconnection={this.onInputDisconnection}
                              onOutputConnection={this.onOutputConnection}
                              onOutputDisconnection={this.onOutputDisconnection}>
                            <div className="no-midi">Please connect your Pacer to your computer.</div>
                        </Midi>
                    </div>

                    <div className="content">

                        <div className="instructions">
                            <div className="instruction">
                                You can click on a preset to only load this specific preset from the Pacer.
                            </div>
                            <div className="instruction">
                                Or you can use the ad-hoc button to read ALL the presets from the Pacer.
                            </div>
                            <div className="instruction">
                                You can also load a patch file or send a dump from the Pacer.
                            </div>
                        </div>

                        <div className="content-row-content first">
                            <h2>Preset:</h2>
                            <div className="selectors">
                                <PresetSelector data={data} currentPreset={presetIndex} onClick={this.selectPreset} />
                            </div>
                            <div className="preset-buttons">
                                {output && <button className="space-right" onClick={() => this.readPacer(requestAllPresets(), ALL_PRESETS_EXPECTED_BYTES)}>Read all presets from Pacer</button>}
                                <input ref={this.inputOpenFileRef} type="file" style={{display:"none"}}  onChange={this.onChangeFile} />
                                <button onClick={this.onInputFile}>Load preset(s) from file</button>
                                {/*data &&
                                    <Download data={this.state.binData} filename={`pacer-preset-${presetIndexToXY(presetIndex)}`} addTimestamp={true}
                                              label="Download preset" />
                                    */}
                                <button onClick={this.clearData}>CLEAR</button>
                            </div>
                            {data && data[TARGET_PRESET][presetIndex] && <PresetNameEditor name={data[TARGET_PRESET][presetIndex]["name"]} onUpdate={(name) => this.updatePresetName(name)} />}
                        </div>

                        {showEditor &&
                        <div className="content-row-content">
                            <Fragment>
                                <h2>Preset MIDI settings:</h2>
                                <MidiSettingsEditor settings={data[TARGET_PRESET][presetIndex]["midi"]}
                                                    onUpdate={(settingIndex, dataType, dataIndex, value) => this.updateMidiSettings(settingIndex, dataType, dataIndex, value)} />
                            </Fragment>
                        </div>
                        }

                        {changed && outputIsPacer(output) &&
                        <div className="content-row-content">
                            <Fragment>
                                <h2>Send the updated config to the Pacer:</h2>
                                <div className="actions">
                                    <button className="update" onClick={() => this.updatePacer(updateMessages)}>Update Pacer</button>
                                </div>
                            </Fragment>
                        </div>
                        }

                        {this.props.debug && showEditor &&
                        <div className="content-row-content first">
                            <div className="debug">
                                <h4>[Debug] Update messages to send:</h4>
                                <UpdateMessages messages={updateMessages} />
{/*
                                <div className="dump code">
                                    {
                                        JSON.stringify(updateMessages, null, 4)
                                    }
                                </div>
*/}
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
