import React, {Component, Fragment} from 'react';
import PresetSelector from "../components/PresetSelector";
import {
    ALL_PRESETS_EXPECTED_BYTES,
    buildPresetNameSysex,
    getControlUpdateSysexMessages,
    isSysexData,
    mergeDeep,
    parseSysexDump, requestAllPresets, requestPreset, SINGLE_PRESET_EXPECTED_BYTES
} from "../pacer/sysex";
import ControlSelector from "../components/ControlSelector";
import {
    ANY_MIDI_PORT,
    MSG_CTRL_OFF,
    PACER_MIDI_PORT_NAME,
    SYSEX_SIGNATURE,
    TARGET_PRESET
} from "../pacer/constants";
import {hs} from "../utils/hexstring";
import {produce} from "immer";
import {outputById} from "../utils/ports";
import ControlStepsEditor from "../components/ControlStepsEditor";
import Midi from "../components/Midi";
import Dropzone from "react-dropzone";
import "./Preset.css";
import ControlModeEditor from "../components/ControlModeEditor";
import PresetNameEditor from "../components/PresetNameEditor";
import PortsGrid from "../components/PortsGrid";
import {batchMessages, outputIsPacer} from "../utils/midi";
import {dropOverlayStyle, MAX_FILE_SIZE} from "../utils/misc";

// const MAX_FILE_SIZE = 5 * 1024*1024;

// const MAX_STATUS_MESSAGES = 40;

function isVal(v) {
    return v !== undefined && v !== null && v !== '';
}

/*
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
*/

class Preset extends Component {

    constructor(props) {
        super(props);
        this.inputOpenFileRef = React.createRef();
        this.state = {
            output: null,       // MIDI output port used for output
            presetIndex: null,
            controlId: null,
            changed: false,     // true when the control has been edited
            updateMessages: {},
            data: null,         // json
            binData: null,      // binary, will be used to download as .syx file
            // statusMessages: [],
            // accept: '',
            // files: [],
            dropZoneActive: false
        };
    }

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

    addInfoMessage= message => {
        this.addStatusMessage("info", message);
    };

    addWarningMessage= message => {
        this.addStatusMessage("warning", message);
    };

    addErrorMessage= message => {
        this.addStatusMessage("error", message);
    };
*/

    handleMidiInputEvent = batchMessages(
        messages => {

            let bytes = messages.reduce((accumulator, element) => accumulator + element.length, 0);

            this.setState(
                produce(
                    draft => {

                        draft.binData = new Uint8Array(bytes);
                        let bin_index = 0;

                        for (let m of messages) {

                            draft.binData.set(m, bin_index);
                            bin_index += m.length;

                            if (isSysexData(m)) {
                                draft.data = mergeDeep(draft.data || {}, parseSysexDump(m));
                            } else {
                                console.log("MIDI message is not a sysex message", hs(m))
                            }
                        }

                        // When requesting a config via MIDI (and not via a file drag&drop), we do not
                        // update the preset and control ID from the MIDI sysex received.
                        // This is important because to get the LED data we need to request the complete
                        // preset data instead of just the selected control's config.

                        // let pId = Object.keys(draft.data[TARGET_PRESET])[0];
                        // draft.presetIndex = parseInt(pId, 10);
                        // draft.controlId = parseInt(Object.keys(draft.data[TARGET_PRESET][pId]["controls"])[0], 10);
                    }
                )
            );

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
                                let pId = Object.keys(draft.data[TARGET_PRESET])[0];
                                let cId = Object.keys(draft.data[TARGET_PRESET][pId]["controls"])[0];
                                draft.presetIndex = parseInt(pId, 10);
                                draft.controlId = parseInt(cId, 10);
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
        let file = e.target.files[0];
        // console.log(file);
        // noinspection JSIgnoredPromiseFromCall
        this.readFiles([file]);
    };

    onInputFile = (e) => {
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
            () => {     // noinspection JSIgnoredPromiseFromCall
                this.readFiles(files)}   // returned promise from readFiles() is ignored, this is normal.
        );
    };

    selectPreset = (index) => {

        if (!outputIsPacer(this.state.output)) return;

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
                    // if (index !== this.state.presetIndex) {
                    //     draft.data = null;
                    //     draft.changed = false;
                    // }
                })
            );
            if (isVal(index)) {   // && this.state.controlId) {
                // To get the LED data, we need to request the complete preset config instead of just the specific control's config.
                this.readPacer(requestPreset(index), SINGLE_PRESET_EXPECTED_BYTES);
            }
        }
    };

    selectControl = (controlId) => {

        //TODO: no need to read the preset data again. Just select the control from the data we must already have.

        // console.log(`selectControl ${controlId}`);

        if (isVal(this.state.presetIndex) && controlId) {

            // console.log(`selectControl setState ${controlId}`);

            this.setState({ controlId });
        }

        /*
        // if the user selects another preset or control, then clear the data in the state
        this.setState(
            produce(draft => {
                draft.controlId = controlId;
                if (controlId !== this.state.controlId) {
                    draft.data = null;
                    draft.changed = false;
                }
            })
        );
        if (isVal(this.state.presetIndex) && controlId) {
            // To get the LED data, we need to request the complete preset config instead of just the specific control's config.
            this.readPacer(requestPreset(this.state.presetIndex));
        }
        */
    };

    /**
     * dataIndex is only used when dataType == "data"
     */
    updateControlStep = (controlId, stepIndex, dataType, dataIndex, value) => {
        // console.log("Presets.updateControlStep", controlId, stepIndex, dataType, dataIndex, value);
        let v = parseInt(value, 10);
        this.setState(
            produce(draft => {

                if (dataType === "data") {
                    draft.data[TARGET_PRESET][draft.presetIndex]["controls"][controlId]["steps"][stepIndex]["data"][dataIndex] = v;
                    draft.data[TARGET_PRESET][draft.presetIndex]["controls"][controlId]["steps"][stepIndex]["changed"] = true;
                // } else {
                //     draft.data[TARGET_PRESET][draft.presetIndex]["controls"][controlId]["steps"][stepIndex][dataType] = v;
                }

                if (dataType === "msg_type") {
                    if (v === MSG_CTRL_OFF) {
                        draft.data[TARGET_PRESET][draft.presetIndex]["controls"][controlId]["steps"][stepIndex]["active"] = 0;
                    } else {
                        draft.data[TARGET_PRESET][draft.presetIndex]["controls"][controlId]["steps"][stepIndex]["active"] = 1;
                    }
                    draft.data[TARGET_PRESET][draft.presetIndex]["controls"][controlId]["steps"][stepIndex]["changed"] = true;
                }

                if (dataType.startsWith("led_")) {
                    draft.data[TARGET_PRESET][draft.presetIndex]["controls"][controlId]["steps"][stepIndex][dataType] = v;
                    // console.log("updateControlStep led changed");
                    draft.data[TARGET_PRESET][draft.presetIndex]["controls"][controlId]["steps"][stepIndex]["led_changed"] = true;
                }

                draft.changed = true;

                if (!draft.updateMessages.hasOwnProperty(draft.presetIndex)) draft.updateMessages[draft.presetIndex] = {};
                if (!draft.updateMessages[draft.presetIndex].hasOwnProperty(controlId)) draft.updateMessages[draft.presetIndex][controlId] = [];
                draft.updateMessages[draft.presetIndex][controlId] = this.getUpdateMessages(draft.presetIndex, controlId, draft.data);

            })
        );
    };

    /**
     * dataIndex is only used when dataType == "data"
     */
    updateControlMode = (controlId, value) => {
        // console.log("Presets.updateControlMode", controlId, value);
        let v = parseInt(value, 10);
        this.setState(
            produce(draft => {
                draft.data[TARGET_PRESET][draft.presetIndex]["controls"][controlId]["control_mode"] = v;
                draft.data[TARGET_PRESET][draft.presetIndex]["controls"][controlId]["control_mode_changed"] = true;
                draft.changed = true;

                if (!draft.updateMessages.hasOwnProperty(draft.presetIndex)) draft.updateMessages[draft.presetIndex] = {};
                if (!draft.updateMessages[draft.presetIndex].hasOwnProperty(controlId)) draft.updateMessages[draft.presetIndex][controlId] = [];

                draft.updateMessages[draft.presetIndex][controlId]  = this.getUpdateMessages(draft.presetIndex, controlId, draft.data);
            })
        );
    };

    /**
     *
     * @param name
     */
    updatePresetName = (name) => {
        // console.log("Presets.updateName", name);
        if (name === undefined || name === null) return;
        if (name.length > 5) {
            console.warn(`Presets.updateName: name too long: ${name}`);
            return;
        }

        this.setState(
            produce(draft => {
                draft.data[TARGET_PRESET][draft.presetIndex]["name"] = name;    // TODO : buld update message
                draft.data[TARGET_PRESET][draft.presetIndex]["changed"] = true;
                draft.changed = true;

                if (!draft.updateMessages.hasOwnProperty(draft.presetIndex)) draft.updateMessages[draft.presetIndex] = {};
                if (!draft.updateMessages[draft.presetIndex].hasOwnProperty("name")) draft.updateMessages[draft.presetIndex]["name"] = [];

                draft.updateMessages[draft.presetIndex]["name"] = buildPresetNameSysex(draft.presetIndex, draft.data);
            })
        );

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
        console.log("sendSysex", hs(msg));
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

    readPacer = (msg, bytesExpected, busyMessage = "reading Pacer...") => {
        // console.log(`readPacer, ${bytesExpected} bytes expected`);
        this.showBusy({busy: true, busyMessage: busyMessage, bytesReceived: 0, bytesExpected});
        this.sendSysex(msg);
    };

    updatePacer = (messages) => {
        // console.log("updatePacer");
        this.showBusy({busy: true, busyMessage: "write Preset..."});
        Object.getOwnPropertyNames(messages).forEach(
            v => {
                Object.getOwnPropertyNames(messages[v]).forEach(
                    w => {
                        messages[v][w].forEach(
                            m => {
                                this.sendSysex(m);
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

    getUpdateMessages = (presetIndex, controlId, data) => {

        // console.log("getUpdateMessages");

        let updateMessages = getControlUpdateSysexMessages(presetIndex, controlId, data);
        // console.log("updateMessages", updateMessages);

        // let n = buildPresetNameSysex(presetIndex, data);
        // if (n) {
        //     updateMessages.push(n);
        // }

        return updateMessages;
    };

    render() {

        const { output, presetIndex, controlId, data, changed, updateMessages, dropZoneActive } = this.state;

        let showEditor = false;

        if (data) {
            showEditor = (TARGET_PRESET in data) &&
                         (presetIndex in data[TARGET_PRESET]) &&
                         ("controls" in data[TARGET_PRESET][presetIndex]) &&
                         (controlId in data[TARGET_PRESET][presetIndex]["controls"]) &&
                         ("steps" in data[TARGET_PRESET][presetIndex]["controls"][controlId]) &&
                         (Object.keys(data[TARGET_PRESET][presetIndex]["controls"][controlId]["steps"]).length === 6);
        }

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
                <div style={dropOverlayStyle}>
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
                            <div className="selectors">
                                <PresetSelector data={data} currentPreset={presetIndex} onClick={this.selectPreset} />
                                <div className="preset-buttons">
                                    {output && <button className="space-right" onClick={() => this.readPacer(requestAllPresets(), ALL_PRESETS_EXPECTED_BYTES)}>Read all presets from Pacer</button>}
                                    <input ref={this.inputOpenFileRef} type="file" style={{display:"none"}}  onChange={this.onChangeFile} />
                                    <button onClick={this.onInputFile}>Load preset(s) from file</button>
                                    {/* data &&
                                    <Download data={this.state.binData} filename={`pacer-preset-${presetIndexToXY(presetIndex)}`} addTimestamp={true}
                                              label="Download preset" />
                                    */}
                                </div>
                            </div>
                            {data && data[TARGET_PRESET][presetIndex] && <PresetNameEditor name={data[TARGET_PRESET][presetIndex]["name"]} onUpdate={(name) => this.updatePresetName(name)} />}
                        </div>


                        <div className="content-row-content">
                            <Fragment>
                                {/*<h2>{CONTROLS_FULLNAME[controlId]}:</h2>*/}
                                <h2>Controls</h2>
                                {isVal(presetIndex) && <ControlSelector currentControl={controlId} onClick={this.selectControl} />}
                                {showEditor &&
                                <Fragment>
                                    <ControlStepsEditor
                                        controlId={controlId}
                                        steps={data[TARGET_PRESET][presetIndex]["controls"][controlId]["steps"]}
                                        onUpdate={(stepIndex, dataType, dataIndex, value) => this.updateControlStep(controlId, stepIndex, dataType, dataIndex, value)}/>
                                    <ControlModeEditor
                                        controlId={controlId}
                                        mode={data[TARGET_PRESET][presetIndex]["controls"][controlId]["control_mode"]}
                                        onUpdate={(value) => this.updateControlMode(controlId, value)}/>
                                </Fragment>
                                }
                            </Fragment>
                        </div>

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

                        {this.props.debug && changed &&
                        <div className="content-row-content">
                            <div className="debug">
                                <h4>[Debug] Update messages to send:</h4>
                                <div className="message-to-send">
                                    {
                                        Object.getOwnPropertyNames(updateMessages).map(
                                            (v, i) => {
                                                return Object.getOwnPropertyNames(updateMessages[v]).map(
                                                    (w, j) => {
                                                        return updateMessages[v][w].map(
                                                            (e, k) => {
                                                               return (<div key={`${i}-${j}-${k}`} className="code">{hs(e)}</div>);
                                                            }
                                                        );
                                                    }
                                                );
                                            }
                                        )
                                    }
                                </div>
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

export default Preset;
