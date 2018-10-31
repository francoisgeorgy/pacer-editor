import React, {Component, Fragment} from 'react';
import PresetSelector from "../components/PresetSelector";
import {buildControlStepSysex, isSysexData, mergeDeep, parseSysexDump} from "../utils/sysex";
import ControlSelector from "../components/ControlSelector";
import {requestPresetObj, SYSEX_SIGNATURE} from "../pacer";
import {hs} from "../utils/hexstring";
import {produce} from "immer";
import {outputById} from "../utils/ports";
import ControlStepsEditor from "../components/ControlStepsEditor";
import Midi from "../components/Midi";
import MidiPort from "../components/MidiPort";
import Dropzone from "react-dropzone";
import "./Presets.css";

const MAX_FILE_SIZE = 5 * 1024*1024;

class Presets extends Component {

    state = {
        output: null,       // MIDI output port used for output
        presetIndex: "",    // preset name, like "B2"
        controlId: "",      //
        changed: false,     // true when the control has been edited
        data: null
    };

    /**
     *
     * @param files
     * @returns {Promise<void>}
     */
    async readFiles(files) {
        await Promise.all(files.map(
            async file => {
                if (file.size > MAX_FILE_SIZE) {
                    console.warn(`${file.name}: file too big, ${file.size}`);
                } else {
                    const data = new Uint8Array(await new Response(file).arrayBuffer());
                    if (isSysexData(data)) {
                        this.setState(
                            produce(draft => {
                                // draft.data = mergeDeep(draft.data || {}, parseSysexDump(data));
                                draft.data = parseSysexDump(data);
                                // this.props.onBusy(false);
                                // data["1"]
                                let pId = Object.keys(draft.data["1"])[0];
                                // console.log(pId);
                                let cId = Object.keys(draft.data["1"][pId]["controls"])[0];
                                // console.log(cId);
                                draft.presetIndex = parseInt(pId, 10);
                                draft.controlId = parseInt(cId, 10);
                            })
                        )
                    } else {
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
        // this.props.onBusy(true);
        this.readFiles(files);  // returned promise is ignored, this is normal.
    };

    selectPreset = (id) => {
        console.log(`selectPreset ${id}`);
        this.setState({
            presetIndex: id
        });
        if (id && this.state.controlId) {
            this.sendSysex(requestPresetObj(id, this.state.controlId));
        }
    };

    selectControl = (id) => {
        console.log(`selectControl ${id}`);
        this.setState({
            controlId: id
        });
        if (this.state.presetIndex && id) {
            this.sendSysex(requestPresetObj(this.state.presetIndex, id));
        }
    };

    /**
     * dataIndex is only used when dataType == "data"
     */
    controlStepsUpdate = (controlId, stepIndex, dataType, dataIndex, value) => {
        console.log("Presets.controlStepsUpdate", controlId, stepIndex, dataIndex, value);
        this.setState(
            produce(draft => {
                if (dataType === "data") {
                    draft.data["1"][draft.presetIndex]["controls"][controlId]["steps"][stepIndex]["data"][dataIndex] = parseInt(value, 10);
                } else {
                    draft.data["1"][draft.presetIndex]["controls"][controlId]["steps"][stepIndex][dataType] = parseInt(value, 10);
                }
                draft.data["1"][draft.presetIndex]["controls"][controlId]["steps"][stepIndex]["changed"] = true;
                draft.changed = true;
                // this.props.onBusy(false);
            })
        );
    };


    handleMidiInputEvent = (event) => {
        console.log("Presets.handleMidiInputEvent", event, event.data);
        // if (event instanceof MIDIMessageEvent) {
        if (isSysexData(event.data)) {
            this.setState(
                produce(draft => {
                    draft.data = mergeDeep(draft.data || {}, parseSysexDump(event.data));
                    // this.props.onBusy(false);
                })
            )
        } else {
            console.log("MIDI message is not a sysex message")
        }
        // }
    };

    renderPort = (port, selected, clickHandler) => {
        if (port === undefined || port === null) return null;
        return (
            <MidiPort key={port.id} port={port} selected={selected} clickHandler={clickHandler} />
        )
    };

    setOutput = (port_id) => {
        console.log(`Page.setOutput ${port_id}`);
        this.setState({output: port_id});
    };

    sendSysex = msg => {
        console.log("sendSysex", msg);
        if (!this.state.output) return;
        let out = outputById(this.state.output);
        if (!out) {
            console.warn(`send: output ${this.state.output} not found`);
            return;
        }
        this.setState(
            {data: null},
            () => out.sendSysex(SYSEX_SIGNATURE, msg)
        );
    };

    render() {
        const { presetIndex, controlId, data, changed } = this.state;

        let showEditor = false;

        if (data) {

            showEditor = true;

            if (!("1" in data)) {        // TODO: replace "1" by a constant
                console.log(`Presets: invalid data`, data);
                showEditor = false;
            }

            if (showEditor && !(presetIndex in data["1"])) {        // TODO: replace "1" by a constant
                console.log(`Presets: preset ${presetIndex} not found in data`);
                showEditor = false;
            }

            if (showEditor && !("controls" in data["1"][presetIndex])) {
                console.log(`Presets: controls not found in data`);
                showEditor = false;
            }

            if (showEditor && !(controlId in data["1"][presetIndex]["controls"])) {
                console.log(`Presets: control ${controlId} not found in data`);
                showEditor = false;
            }

            if (showEditor && !("steps" in data["1"][presetIndex]["controls"][controlId])) {
                console.log(`Presets: steps not found in data`);
                showEditor = false;
            }
        }

        // if (showEditor) {
        //     console.log("Presets.render", showEditor, Object.keys(data["1"][presetIndex]["controls"][controlId]["steps"]).length, data);
        // } else {
            console.log("Presets.render", showEditor, presetIndex, controlId);
        // }

        showEditor = showEditor && (Object.keys(data["1"][presetIndex]["controls"][controlId]["steps"]).length === 6);

        console.log("Presets.render", showEditor, presetIndex, controlId);

        let updateMessages = [];
        if (showEditor) {
            updateMessages = buildControlStepSysex(presetIndex, controlId, data["1"][presetIndex]["controls"][controlId]["steps"]);
        }

        return (
            <div className="wrapper">
                <div className="content">

                    <div className="content-row step-1">
                        <div className="background">
                            Connect
                        </div>
                        <div className="content-row-header">
                            1
                        </div>
                        <div className="content-row-content row-middle-aligned">
                            <Midi inputRenderer={this.renderPort} outputRenderer={this.renderPort}
                                  autoConnect={/Pacer midi1/i} onMidiInputEvent={this.handleMidiInputEvent}
                                  setOutput={this.setOutput}
                                  className="sub-header" />
                        </div>
                    </div>
                    <div className="content-row step-2">
                        <div className="background">
                            Select
                        </div>
                        <div className="content-row-header">
                            2
                        </div>
                        <div className="content-row-content">

                            <h2>Choose the preset and the control to view/edit:</h2>

                            <div className="selectors">

                                <PresetSelector currentPreset={presetIndex} onClick={this.selectPreset} />

                                {presetIndex && <ControlSelector currentControl={controlId} onClick={this.selectControl} />}
                            </div>
                        </div>
                    </div>

                    <div className="content-row step-3">
                        <div className="background">
                            Edit
                        </div>
                        <div className="content-row-header">
                            3
                        </div>
                        <div className="content-row-content">
                            {showEditor &&
                            <Fragment>
                                <h2>Edit the selected control:</h2>
                                <ControlStepsEditor controlId={controlId}
                                                    steps={data["1"][presetIndex]["controls"][controlId]["steps"]}
                                                    onUpdate={(stepIndex, dataType, dataIndex, value) => this.controlStepsUpdate(controlId, stepIndex, dataType, dataIndex, value)} />
                            </Fragment>
                            }
                        </div>
                    </div>

                    <div className="content-row step-4">
                        <div className="background">
                            Write
                        </div>
                        <div className="content-row-header">
                            4
                        </div>
                        <div className="content-row-content">
                            {changed &&
                            <Fragment>
                                <h2>Send the updated config to the Pacer:</h2>
                                <div className="actions">
                                    <button>Update Pacer</button>
                                </div>
                            </Fragment>
                            }
                        </div>
                    </div>

                    <div>
                        {showEditor && <div className="debug">
                            <h4>[Debug] update message to send to Pacer:</h4>
                            <div className="message-to-send">
                                {updateMessages.map(m => <div className="code">{hs(m)}</div>)}
                            </div>
                        </div>}

                        {data && <div className="debug">
                            <h4>[Debug] sysex data:</h4>
                            <pre>{JSON.stringify(data, null, 4)}</pre>
                        </div>}

                    </div>
                </div>

                <div className="help">

                    <Dropzone onDrop={this.onDrop} className="drop-zone">
                        Drop a binary sysex file here<br />or click to open the file dialog
                    </Dropzone>

                    {/*<h2>Help</h2>*/}
                </div>

            </div>
        );
    }

}

export default Presets;
