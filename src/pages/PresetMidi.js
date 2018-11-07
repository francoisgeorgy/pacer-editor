import React, {Component, Fragment} from 'react';
import PresetSelector from "../components/PresetSelector";
import {
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
import {MSG_CTRL_OFF, SYSEX_SIGNATURE, TARGET_PRESET} from "../pacer";
import {hs} from "../utils/hexstring";
import MidiSettingsEditor from "../components/MidiSettingsEditor";
import {inputName, outputById, outputName} from "../utils/ports";

const MAX_FILE_SIZE = 5 * 1024*1024;

const MAX_STATUS_MESSAGES = 40;

class PresetMidi extends Component {

    state = {
        output: null,       // MIDI output port used for output
        presetIndex: "",    // preset name, like "B2"
        // controlId: "",      //
        changed: false,     // true when the control has been edited
        data: null,
        statusMessages: []
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
                        this.setState(
                            produce(draft => {
                                // draft.data = mergeDeep(draft.data || {}, parseSysexDump(data));
                                draft.data = parseSysexDump(data);
                                // this.props.onBusy(false);
                                let pId = Object.keys(draft.data[TARGET_PRESET])[0];
                                // let cId = Object.keys(draft.data[TARGET_PRESET][pId]["controls"])[0];
                                draft.presetIndex = parseInt(pId, 10);
                                // draft.controlId = parseInt(cId, 10);
                            })
                        );
                        this.addInfoMessage("sysfile decoded");
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
        // this.props.onBusy(true);
        this.readFiles(files);  // returned promise is ignored, this is normal.
    };

    selectPreset = (id) => {
        console.log(`selectPreset ${id}`);
        this.setState({
            presetIndex: id
        });
/*
        if (id && this.state.controlId) {
            this.sendSysex(requestPresetObj(id, this.state.controlId));
        }
*/
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

    /**
     *
     */
    handleMidiInputEvent = (event) => {
        console.log("PresetMidi.handleMidiInputEvent", event, event.data);
        // if (event instanceof MIDIMessageEvent) {
        if (isSysexData(event.data)) {
            this.setState(
                produce(draft => {
                    draft.data = mergeDeep(draft.data || {}, parseSysexDump(event.data));
                    // this.props.onBusy(false);
                })
            );
            this.addInfoMessage(`sysex received (${event.data.length} bytes)`);
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

    updatePacer = (messages) => {
        for (let m of messages) {
            this.sendSysex(m);
        }
        this.addInfoMessage(`update${messages.length > 1 ? 's' : ''} sent to Pacer`);
    };

    render() {

        const { presetIndex, data, changed } = this.state;

        let showEditor = false;

        if (data) {

            console.log("data length", Object.keys(data[TARGET_PRESET][presetIndex]["midi"]).length);

            showEditor = true;

            if (!(TARGET_PRESET in data)) {
                console.log(`Presets: invalid data`, data);
                showEditor = false;
            }

            if (showEditor && !(presetIndex in data[TARGET_PRESET])) {
                console.log(`Presets: preset ${presetIndex} not found in data`);
                showEditor = false;
            }

            if (showEditor && !("midi" in data[TARGET_PRESET][presetIndex])) {
                console.log(`Presets: midi not found in data`);
                showEditor = false;
            }

        }

        showEditor = showEditor && (Object.keys(data[TARGET_PRESET][presetIndex]["midi"]).length === 16);

        let updateMessages = [];
        if (showEditor) {
            updateMessages = getMidiSettingUpdateSysexMessages(presetIndex, data);
        }

        console.log("PresetMidi.render", showEditor, presetIndex);

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
                            <Midi inputRenderer={this.renderPort} outputRenderer={this.renderPort}
                                  autoConnect={/.*/i} onMidiInputEvent={this.handleMidiInputEvent}
                                  onInputConnection={this.onInputConnection}
                                  onInputDisconnection={this.onInputDisconnection}
                                  onOutputConnection={this.onOutputConnection}
                                  onOutputDisconnection={this.onOutputDisconnection}
                                  className="sub-header" >
                                <div>Please connect your Pacer to your computer.</div>
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
                                <h2>Edit the selected control:</h2>
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
                                    <button onClick={() => this.updatePacer(updateMessages)}>Update Pacer</button>
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

                    <h3>Log:</h3>
                    <Status messages={this.state.statusMessages} />

                </div>

            </div>
        );
    }

}

export default PresetMidi;
