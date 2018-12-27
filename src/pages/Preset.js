import React, {Component, Fragment} from 'react';
import PresetSelector from "../components/PresetSelector";
import {
    ALL_PRESETS_EXPECTED_BYTES, CONTROLS_DATA,
    getControlUpdateSysexMessages,
    isSysexData,
    mergeDeep,
    parseSysexDump, requestAllPresets, requestPreset, SINGLE_PRESET_EXPECTED_BYTES
} from "../pacer/sysex";
import ControlSelector from "../components/ControlSelector";
import {
    ANY_MIDI_PORT, CONTROLS_WITH_SEQUENCE,
    MSG_CTRL_OFF,
    PACER_MIDI_PORT_NAME,
    SYSEX_SIGNATURE,
    TARGET_PRESET
} from "../pacer/constants";
import {hs} from "../utils/hexstring";
import {produce, setAutoFreeze} from "immer";
import {outputById} from "../utils/ports";
import ControlStepsEditor from "../components/ControlStepsEditor";
import Midi from "../components/Midi";
import Dropzone from "react-dropzone";
import "./Preset.css";
import ControlModeEditor from "../components/ControlModeEditor";
import PresetNameEditor from "../components/PresetNameEditor";
import PortsGrid from "../components/PortsGrid";
import {batchMessages, outputIsPacer} from "../utils/midi";
import {dropOverlayStyle, isVal, MAX_FILE_SIZE} from "../utils/misc";
import {updateMessageName} from "../utils/state";
import UpdateMessages from "../components/UpdateMessages";
import {presetIndexToXY} from "../pacer/utils";

//FIXME: fix this:
setAutoFreeze(false);   // needed to be able to update name and copy a preset at the same time. Otherwise immerjs freez the state in updateMessageName() and it is no longer possible to copy a preset.

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
            // binData: null,      // binary, will be used to download as .syx file
            // statusMessages: [],
            // accept: '',
            // files: [],
            dropZoneActive: false,
            copyPresetFrom: "-1"
        };
    }

    clearData = () => {
        this.setState({data: null, updateMessages: {}, changed: false});
    };

    /**
     * Ad-hoc method to show the busy flag and set a timeout to make sure the busy flag is hidden after a timeout.
     */
    showBusy = ({busy = false, busyMessage = null, bytesExpected = -1, bytesReceived = -1} = {}) =>  {
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
            // let bytes = messages.reduce((accumulator, element) => accumulator + element.length, 0);
            this.setState(
                produce(
                    draft => {

                        // draft.binData = new Uint8Array(bytes);
                        // let bin_index = 0;

                        for (let m of messages) {

                            // draft.binData.set(m, bin_index);
                            // bin_index += m.length;

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
                        // draft.controlId = parseInt(Object.keys(draft.data[TARGET_PRESET][pId][CONTROLS_DATA])[0], 10);
                    }
                )
            );

            // this.addInfoMessage(`${messages.length} messages received (${bytes} bytes)`);
            this.props.onBusy({busy: false});
        },
        (n) => {
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

                                // let cId = Object.keys(draft.data[TARGET_PRESET][pId][CONTROLS_DATA])[0];
                                // draft.controlId = parseInt(cId, 10);
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

        // if (!outputIsPacer(this.state.output)) return;

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
                }),
                () => {
                    if (outputIsPacer(this.state.output) && isVal(index)) {
                        // To get the LED data, we need to request the complete preset config instead of just the specific control's config.
                        this.readPacer(requestPreset(index), SINGLE_PRESET_EXPECTED_BYTES);
                    }
                }
            );
        }
    };

    selectControl = (controlId) => {
        if (isVal(this.state.presetIndex) && controlId) {
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


    updatePresetName = (name) => {
        this.setState(updateMessageName(this.state, {name}));
        // this.setState(updateMessageName);
    };

    /**
     * dataIndex is only used when dataType == "data"
     */
    updateControlStep = (controlId, stepIndex, dataType, dataIndex, value) => {
        let v = parseInt(value, 10);
        this.setState(
            produce(draft => {

                if (dataType === "data") {
                    draft.data[TARGET_PRESET][draft.presetIndex][CONTROLS_DATA][controlId]["steps"][stepIndex]["data"][dataIndex] = v;
                } else {
                    draft.data[TARGET_PRESET][draft.presetIndex][CONTROLS_DATA][controlId]["steps"][stepIndex][dataType] = v;
                }

                if (dataType === "msg_type") {
                    if (v === MSG_CTRL_OFF) {
                        draft.data[TARGET_PRESET][draft.presetIndex][CONTROLS_DATA][controlId]["steps"][stepIndex]["active"] = 0;
                    } else {
                        draft.data[TARGET_PRESET][draft.presetIndex][CONTROLS_DATA][controlId]["steps"][stepIndex]["active"] = 1;
                    }
                }

                if (dataType.startsWith("led_")) {
                    draft.data[TARGET_PRESET][draft.presetIndex][CONTROLS_DATA][controlId]["steps"][stepIndex]["led_changed"] = true;
                } else {
                    draft.data[TARGET_PRESET][draft.presetIndex][CONTROLS_DATA][controlId]["steps"][stepIndex]["changed"] = true;
                }

                draft.changed = true;

                if (!draft.updateMessages.hasOwnProperty(draft.presetIndex)) draft.updateMessages[draft.presetIndex] = {};
                if (!draft.updateMessages[draft.presetIndex].hasOwnProperty(CONTROLS_DATA)) draft.updateMessages[draft.presetIndex][CONTROLS_DATA] = {};

                draft.updateMessages[draft.presetIndex][CONTROLS_DATA][controlId] = getControlUpdateSysexMessages(draft.presetIndex, controlId, draft.data);
            })
        );
    };

    /**
     * dataIndex is only used when dataType == "data"
     */
    updateControlMode = (controlId, value) => {
        let v = parseInt(value, 10);
        this.setState(
            produce(draft => {
                draft.data[TARGET_PRESET][draft.presetIndex][CONTROLS_DATA][controlId]["control_mode"] = v;
                draft.data[TARGET_PRESET][draft.presetIndex][CONTROLS_DATA][controlId]["control_mode_changed"] = true;
                draft.changed = true;

                if (!draft.updateMessages.hasOwnProperty(draft.presetIndex)) draft.updateMessages[draft.presetIndex] = {};
                if (!draft.updateMessages[draft.presetIndex].hasOwnProperty(CONTROLS_DATA)) draft.updateMessages[draft.presetIndex][CONTROLS_DATA] = {};

                draft.updateMessages[draft.presetIndex][CONTROLS_DATA][controlId]  = getControlUpdateSysexMessages(draft.presetIndex, controlId, draft.data);
            })
        );
    };

    copyPresetFrom = (presetIdFrom, presetIdTo) => {

        //FIXME: use immerjs

        const { data, updateMessages } = this.state;

        if (data && data[TARGET_PRESET][presetIdFrom]) {

            if (!data[TARGET_PRESET][presetIdTo]) data[TARGET_PRESET][presetIdTo] = {};
            data[TARGET_PRESET][presetIdTo]["changed"] = true;

            if (!updateMessages.hasOwnProperty(presetIdTo)) updateMessages[presetIdTo] = {};
            if (!updateMessages[presetIdTo].hasOwnProperty(CONTROLS_DATA)) updateMessages[presetIdTo][CONTROLS_DATA] = {};

            //
            // Only copy CONTROLS (for the current version)
            //
            //FIXME: copy EXP and FS config
            CONTROLS_WITH_SEQUENCE.forEach(controlId => {
                // data[TARGET_PRESET][presetIdTo][CONTROLS_DATA][controlId] = Object.assign({}, data[TARGET_PRESET][presetIdFrom][CONTROLS_DATA][controlId]);
                // ugly / deep copy without shallow references:
                data[TARGET_PRESET][presetIdTo][CONTROLS_DATA][controlId] = JSON.parse(JSON.stringify(data[TARGET_PRESET][presetIdFrom][CONTROLS_DATA][controlId]));
                updateMessages[presetIdTo][CONTROLS_DATA][controlId] = getControlUpdateSysexMessages(presetIdTo, controlId, data, true);
            });
            // Object.assign(data[TARGET_PRESET][presetIdTo], data[TARGET_PRESET][presetIdFrom]);

            //we do not copy the name
            //updateMessages[presetIdTo]["name"] = buildPresetNameSysex(presetIdTo, data);

            // CONTROLS_WITH_SEQUENCE.forEach(controlId => updateMessages[presetIdTo][CONTROLS_DATA][controlId] = getControlUpdateSysexMessages(presetIdTo, controlId, data, true));

            this.setState({data, updateMessages, changed: true});
        }
    };

/*
    copyControlFrom = (presetIdFrom, presetIdTo, controlId) => {

        const { data, updateMessages } = this.state;

        if (data && data[TARGET_PRESET][presetIdFrom][CONTROLS_DATA][controlId] && data[TARGET_PRESET][presetIdFrom][CONTROLS_DATA][controlId]) {

            Object.assign(data[TARGET_PRESET][presetIdTo][CONTROLS_DATA][controlId], data[TARGET_PRESET][presetIdFrom][CONTROLS_DATA][controlId]);

            if (!updateMessages.hasOwnProperty(presetIdTo)) updateMessages[presetIdTo] = {};
            if (!updateMessages[presetIdTo].hasOwnProperty(CONTROLS_DATA)) updateMessages[presetIdTo][CONTROLS_DATA] = {};

            updateMessages[presetIdTo][CONTROLS_DATA][controlId] = getControlUpdateSysexMessages(presetIdTo, controlId, data, true);

            this.setState({data, updateMessages, changed: true});
        }
    };
*/

    onInputConnection = (port_id) => {
        // this.addInfoMessage(`input ${inputName(port_id)} connected`);
    };

    onInputDisconnection = (port_id) => {
        // this.addInfoMessage(`input ${inputName(port_id)} disconnected`);
    };

    onOutputConnection = (port_id) => {
        this.setState(
            produce(draft => {
                draft.output = port_id;
            })
        );
        // this.addInfoMessage(`output ${outputName(port_id)} connected`);
    };

    onOutputDisconnection = (port_id) => {
        this.setState(
            produce(draft => {
                draft.output = null;        // we manage only one output connection at a time
            })
        );
        // this.addInfoMessage(`output ${outputName(port_id)} disconnected`);
    };

    sendSysex = msg => {
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
        this.showBusy({busy: true, busyMessage: busyMessage, bytesReceived: 0, bytesExpected});
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
            this.setState({changed: false, updateMessages: {}}, () => this.readPacer(requestPreset(this.state.presetIndex), SINGLE_PRESET_EXPECTED_BYTES, "read updated preset"));
        }, 1000);
    };

    render() {

        const { output, presetIndex, controlId, data, changed, updateMessages, dropZoneActive } = this.state;

        let showEditor = false;

        if (data) {
            showEditor = (TARGET_PRESET in data) &&
                         (presetIndex in data[TARGET_PRESET]) &&
                         (CONTROLS_DATA in data[TARGET_PRESET][presetIndex]) &&
                         (controlId in data[TARGET_PRESET][presetIndex][CONTROLS_DATA]) &&
                         ("steps" in data[TARGET_PRESET][presetIndex][CONTROLS_DATA][controlId]) &&
                         (Object.keys(data[TARGET_PRESET][presetIndex][CONTROLS_DATA][controlId]["steps"]).length === 6);
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
                                {output && <button onClick={() => this.readPacer(requestAllPresets(), ALL_PRESETS_EXPECTED_BYTES)}>Read all presets from Pacer</button>}
                                <input ref={this.inputOpenFileRef} type="file" style={{display:"none"}}  onChange={this.onChangeFile} />
                                <button onClick={this.onInputFile}>Load preset(s) from file</button>
                                {/* data &&
                                    <Download data={this.state.binData} filename={`pacer-preset-${presetIndexToXY(presetIndex)}`} addTimestamp={true}
                                              label="Download preset" />
                                    */}
                                <button onClick={this.clearData}>CLEAR</button>
                            </div>
                            {data && data[TARGET_PRESET][presetIndex] && <PresetNameEditor name={data[TARGET_PRESET][presetIndex]["name"]} onUpdate={(name) => this.updatePresetName(name)} />}
                        </div>

                        <div className="content-row-content">
                            <Fragment>
                                <h2>Controls</h2>
                                {isVal(presetIndex) && <ControlSelector currentControl={controlId} onClick={this.selectControl} />}

                                {data && presetIndex in data[TARGET_PRESET] && Object.keys(data[TARGET_PRESET]).length > 1 &&
                                <Fragment>
                                    (experimental) <button onClick={() => this.copyPresetFrom(this.state.copyPresetFrom, presetIndex)}>copy</button> from preset <select value={this.state.copyPresetFrom} onChange={(event) => this.setState({copyPresetFrom: event.target.value})}>
                                        <option value="">-</option>
                                    {
                                        Object.keys(data[TARGET_PRESET]).map((key, index) => {
                                            if (data[TARGET_PRESET][key]) {
                                                return (<option key={index} value={key}>{presetIndexToXY(key)} {data[TARGET_PRESET][key].name}</option>);
                                            } else {
                                                return null;
                                            }
                                        })
                                    }
                                    </select> <span className="small">(copy the configuration for the footswitches A..D and 1..6 only)</span>
                                </Fragment>
                                }

{/*
                                {data && isVal(presetIndex) && showEditor && Object.keys(data[TARGET_PRESET]).length > 1 &&
                                <Fragment>
                                    copy from preset <select value={""} onChange={(event) => this.copyControlFrom(event.target.value, presetIndex, controlId)}>
                                    {
                                        Object.keys(data[TARGET_PRESET]).map((key, index) => {
                                            if (data[TARGET_PRESET][key]) {
                                                return (<option key={index} value={key}>{presetIndexToXY(key)} {data[TARGET_PRESET][key].name}</option>);
                                            } else {
                                                return null;
                                            }
                                        })
                                    }
                                    </select> <span className="small">(only the selected control configuration will be copied)</span>
                                </Fragment>
                                }
*/}

                                {showEditor &&
                                <Fragment>
                                    <ControlStepsEditor
                                        controlId={controlId}
                                        steps={data[TARGET_PRESET][presetIndex][CONTROLS_DATA][controlId]["steps"]}
                                        onUpdate={(stepIndex, dataType, dataIndex, value) => this.updateControlStep(controlId, stepIndex, dataType, dataIndex, value)}/>
                                    <ControlModeEditor
                                        controlId={controlId}
                                        mode={data[TARGET_PRESET][presetIndex][CONTROLS_DATA][controlId]["control_mode"]}
                                        onUpdate={(value) => this.updateControlMode(controlId, value)}/>
                                </Fragment>
                                }
                                {!isVal(presetIndex) &&
                                    <div className="please">Please first select a preset.</div>
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
                                <UpdateMessages messages={updateMessages} />
                                <div className="dump code">
                                {/*
                                    JSON.stringify(data, null, 4)
                                */}
                                {/*
                                    JSON.stringify(updateMessages, null, 4)
                                */}
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

export default Preset;
