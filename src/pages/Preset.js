import React, {Component, Fragment} from 'react';
import PresetSelector from "../components/PresetSelector";
import {
    buildPresetNameSysex,
    getControlUpdateSysexMessages,
    isSysexData,
    mergeDeep,
    parseSysexDump, requestPreset
} from "../pacer/sysex";
import ControlSelector from "../components/ControlSelector";
import {
    ANY_MIDI_PORT,
    CONTROLS_FULLNAME,
    MSG_CTRL_OFF,
    PACER_MIDI_PORT_NAME,
    SYSEX_SIGNATURE,
    TARGET_PRESET
} from "../pacer/constants";
import {hs} from "../utils/hexstring";
import {produce} from "immer";
import {inputName, outputById, outputName} from "../utils/ports";
import ControlStepsEditor from "../components/ControlStepsEditor";
import Midi from "../components/Midi";
import Dropzone from "react-dropzone";
import "./Preset.css";
import ControlModeEditor from "../components/ControlModeEditor";
// import Status from "../components/Status";
import PresetNameEditor from "../components/PresetNameEditor";
import PortsGrid from "../components/PortsGrid";
import Download from "../components/Download";
import {presetIndexToXY} from "../pacer/utils";
// import Download from "../components/Download";
// import {presetIndexToXY} from "../pacer/utils";

const MAX_FILE_SIZE = 5 * 1024*1024;

const MAX_STATUS_MESSAGES = 40;

function isVal(v) {
    return v !== undefined && v !== null && v !== '';
}

function batchMessages(callback, wait) {

    let messages = [];  // batch of received messages
    let timeout;

    return function() {
        clearTimeout(timeout);
        let event = arguments[0];
        messages.push(event.data);
        timeout = setTimeout(() => {
            // console.log("timeout elapsed");
            timeout = null;
            callback(messages);
            messages = [];
        }, wait);
    };
}

class Preset extends Component {

/*
    state = {
        output: null,       // MIDI output port used for output
        presetIndex: null,
        controlId: null,
        changed: false,     // true when the control has been edited
        data: null,         // json
        binData: null,      // binary, will be used to download as .syx file
        statusMessages: [],

        // accept: '',
        // files: [],
        dropZoneActive: false

    };
*/

    constructor(props) {
        super(props);
        this.inputOpenFileRef = React.createRef();
        this.state = {
            output: null,       // MIDI output port used for output
            presetIndex: null,
            controlId: null,
            changed: false,     // true when the control has been edited
            data: null,         // json
            binData: null,      // binary, will be used to download as .syx file
            statusMessages: [],
            // accept: '',
            // files: [],
            dropZoneActive: false
        };
    }

    /**
     * Ad-hoc method to show the busy flag and set a timeout to make sure the busy flag is hidden after a timeout.
     */
    showBusy = () =>  {
        setTimeout(() => this.props.onBusy(false), 20000);
        this.props.onBusy(true);
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

    addInfoMessage= message => {
        this.addStatusMessage("info", message);
    };

    addWarningMessage= message => {
        this.addStatusMessage("warning", message);
    };

    addErrorMessage= message => {
        this.addStatusMessage("error", message);
    };

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
                                console.log("MIDI message is not a sysex message")
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

            this.addInfoMessage(`${messages.length} messages received (${bytes} bytes)`);
            this.props.onBusy(false);
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
                    this.addWarningMessage("file too big");
                } else {
                    this.showBusy();
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
                        this.addInfoMessage("sysfile decoded");
                    } else {
                        this.addWarningMessage("not a sysfile");
                        console.log("readFiles: not a sysfile", hs(data.slice(0, 5)));
                    }
                    this.props.onBusy(false);
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
        console.log('drop', files);
        this.setState(
            {
                data: null,
                changed: false,
                dropZoneActive: false
            },
            () => {this.readFiles(files)}   // returned promise from readFiles() is ignored, this is normal.
        );
    };

    selectPreset = (id) => {
        // if the user selects another preset or control, then clear the data in the state
        this.setState(
            produce(draft => {
                draft.presetIndex = id;
                if (id !== this.state.presetIndex) {
                    draft.data = null;
                    draft.changed = false;
                }
            })
        );
        if (isVal(id)) {   // && this.state.controlId) {
            // this.sendSysex(requestPresetObj(id, this.state.controlId));
            // To get the LED data, we need to request the complete preset config instead of just the specific control's config.
            this.sendSysex(requestPreset(id));
        }
    };

    selectControl = (controlId) => {

        //TODO: no need to read the preset data again. Just select the control from the data we must already have.

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
            // this.sendSysex(requestPresetObj(this.state.presetIndex, controlId));
            // To get the LED data, we need to request the complete preset config instead of just the specific control's config.
            this.sendSysex(requestPreset(this.state.presetIndex));
        }
        */
    };

    /**
     * dataIndex is only used when dataType == "data"
     */
    updateControlStep = (controlId, stepIndex, dataType, dataIndex, value) => {
        // console.log("Presets.updateControlStep", controlId, stepIndex, dataIndex, value);
        let v = parseInt(value, 10);
        this.setState(
            produce(draft => {
                if (dataType === "data") {
                    draft.data[TARGET_PRESET][draft.presetIndex]["controls"][controlId]["steps"][stepIndex]["data"][dataIndex] = v;
                } else {
                    draft.data[TARGET_PRESET][draft.presetIndex]["controls"][controlId]["steps"][stepIndex][dataType] = v;
                }
                if (dataType === "msg_type") {
                    if (v === MSG_CTRL_OFF) {
                        draft.data[TARGET_PRESET][draft.presetIndex]["controls"][controlId]["steps"][stepIndex]["active"] = 0;
                    } else {
                        draft.data[TARGET_PRESET][draft.presetIndex]["controls"][controlId]["steps"][stepIndex]["active"] = 1;
                    }
                }
                draft.data[TARGET_PRESET][draft.presetIndex]["controls"][controlId]["steps"][stepIndex]["changed"] = true;
                draft.changed = true;
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
                draft.data[TARGET_PRESET][draft.presetIndex]["controls"][controlId]["changed"] = true;
                draft.changed = true;
            })
        );
    };

    updatePresetName = (name) => {
        console.log("Presets.updateName", name);
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
        this.setState(
            produce(draft => {
                draft.output = port_id;
            })
        );
        this.addInfoMessage(`output ${outputName(port_id)} connected`);
    };

    onOutputDisconnection = (port_id) => {
        this.setState(
            produce(draft => {
                draft.output = null;        // we manage only one output connection at a time
            })
        );
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
        this.showBusy();
        out.sendSysex(SYSEX_SIGNATURE, msg);
    };

    updatePacer = (messages) => {
        console.log("PresetMidi.updatePacer");
        for (let m of messages) {
            this.sendSysex(m);
        }
        this.addInfoMessage(`update${messages.length > 1 ? 's' : ''} sent to Pacer`);
    };

    // componentDidMount() {
    //     window.addEventListener('drop', this.onDrop);
    // }

    render() {

        const { presetIndex, controlId, data, changed } = this.state;

        let showEditor = false;

        if (data) {

            showEditor = true;

            if (!(TARGET_PRESET in data)) {
                console.log(`Presets: invalid data`, data);
                showEditor = false;
            }

            if (showEditor && !(presetIndex in data[TARGET_PRESET])) {
                console.log(`Presets: preset ${presetIndex} not found in data`);
                showEditor = false;
            }

            if (showEditor && !("controls" in data[TARGET_PRESET][presetIndex])) {
                console.log(`Presets: controls not found in data`);
                showEditor = false;
            }

            if (showEditor && !(controlId in data[TARGET_PRESET][presetIndex]["controls"])) {
                console.log(`Presets: control ${controlId} not found in data`);
                showEditor = false;
            }

            if (showEditor && !("steps" in data[TARGET_PRESET][presetIndex]["controls"][controlId])) {
                console.log(`Presets: steps not found in data`);
                showEditor = false;
            }

        }

        showEditor = showEditor && (Object.keys(data[TARGET_PRESET][presetIndex]["controls"][controlId]["steps"]).length === 6);

        let updateMessages = [];
        if (showEditor) {
            updateMessages = getControlUpdateSysexMessages(presetIndex, controlId, data);
            let n = buildPresetNameSysex(presetIndex, data);
            if (n) {
                updateMessages.push(n);
            }
        }

        const { /*accept, files,*/ dropZoneActive } = this.state;

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

        // console.log("Presets.render", showEditor, presetIndex, controlId);

        // const inputOpenFileRef = React.createRef();

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

                    <div className="content-row-content first">
                        <div className="download-upload">
                            {data &&
                            <Download data={this.state.binData} filename={`pacer-preset-${presetIndexToXY(presetIndex)}`} addTimestamp={true}
                                      label="Download the preset as a binary sysex file" />
                            }
                            <input ref={this.inputOpenFileRef} type="file" style={{display:"none"}}  onChange={this.onChangeFile} />
                            <button className="myButton" onClick={this.onInputFile}>Load preset from a binary sysex file</button>
                        </div>
                    </div>

                    <div className="content-row-content">
                        <h2>Select preset and control:</h2>
                        <div className="content-row-content-content">
                            <div className="selectors">
                                <PresetSelector currentPreset={presetIndex} onClick={this.selectPreset} />
                                {isVal(presetIndex) && <ControlSelector currentControl={controlId} onClick={this.selectControl} />}
                            </div>
                        </div>
                    </div>

                    {showEditor &&
                    <div className="content-row-content">
                        <Fragment>
                            <h2>Preset name:</h2>
                            <div className="content-row-content-content">
                                <PresetNameEditor name={data[TARGET_PRESET][presetIndex]["name"]} onUpdate={(name) => this.updatePresetName(name)} />
                            </div>
                        </Fragment>
                    </div>
                    }

                    {showEditor &&
                    <div className="content-row-content">
                        <Fragment>
                            <h2>{CONTROLS_FULLNAME[controlId]}:</h2>
                            <div className="content-row-content-content">
                                <ControlStepsEditor controlId={controlId}
                                                    steps={data[TARGET_PRESET][presetIndex]["controls"][controlId]["steps"]}
                                                    onUpdate={(stepIndex, dataType, dataIndex, value) => this.updateControlStep(controlId, stepIndex, dataType, dataIndex, value)} />
                                <ControlModeEditor controlId={controlId}
                                                   mode={data[TARGET_PRESET][presetIndex]["controls"][controlId]["control_mode"]}
                                                   onUpdate={(value) => this.updateControlMode(controlId, value)} />
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

{/*
                <div className="right-column">

                    <Midi only={ANY_MIDI_PORT} autoConnect={PACER_MIDI_PORT_NAME}
                          portsRenderer={(groupedPorts, clickHandler) => <PortsGrid groupedPorts={groupedPorts} clickHandler={clickHandler} />}
                          onMidiInputEvent={this.handleMidiInputEvent}
                          onInputConnection={this.onInputConnection}
                          onInputDisconnection={this.onInputDisconnection}
                          onOutputConnection={this.onOutputConnection}
                          onOutputDisconnection={this.onOutputDisconnection}
                          className="sub-header" >
                        <div className="no-midi">Please connect your Pacer to your computer.</div>
                    </Midi>

                    <h3>Load preset from file:</h3>

                    <Dropzone onDrop={this.onDrop} className="drop-zone">
                        Drop a binary sysex file here<br />or click to open the file dialog
                    </Dropzone>

                    <h3>Log:</h3>
                    <Status messages={this.state.statusMessages} />

                </div>
*/}

            </div>

            </Dropzone>

        );
    }

}

export default Preset;
