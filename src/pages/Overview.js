import React, {Component} from 'react';
import {produce} from "immer";
import {
    ALL_PRESETS_EXPECTED_BYTES,
    isSysexData,
    mergeDeep,
    parseSysexDump,
    requestAllPresets, requestPreset, SINGLE_PRESET_EXPECTED_BYTES
} from "../pacer/sysex";
import Midi from "../components/Midi";
import {ANY_MIDI_PORT, PACER_MIDI_PORT_NAME, SYSEX_SIGNATURE, TARGET_PRESET} from "../pacer/constants";
import PortsGrid from "../components/PortsGrid";
import PresetSelector from "../components/PresetSelector";
import {outputById} from "../utils/ports";
import Dropzone from "react-dropzone";
import "./Patch.css";
import {batchMessages, outputIsPacer} from "../utils/midi";
import {dropOverlayStyle, isVal, MAX_FILE_SIZE} from "../utils/misc";
import PresetOverview from "../components/PresetOverview";
import "./Overview.css";
import {hs} from "../utils/hexstring";

class Overview extends Component {

    // one data structure per preset

    constructor(props) {
        super(props);
        this.inputOpenFileRef = React.createRef();
        this.state = {
            output: null,   // MIDI output port used for output
            data: null,     // json
            presetIndex: null,  //
            dropZoneActive: false,
            decBase: true  // true --> decimal base, false --> hex base for number
        };
    }

    toggleBase= (e) => {
        const decBase = !this.state.decBase;
        this.setState({decBase});
    };

    clearData = () => {
        this.setState({data: null});
    };

    /**
     * Ad-hoc method to show the busy flag and set a timeout to make sure the busy flag is hidden after a timeout.
     */
    showBusy = ({busy = false, busyMessage = null, bytesExpected = -1, bytesReceived = -1} = {}) =>  {
        setTimeout(() => this.props.onBusy({busy: false}), 20000);
        this.props.onBusy({busy: true, busyMessage, bytesExpected, bytesReceived});
    };

    hideBusy = (delay = 0) => {
        if (delay < 1) {
            this.props.onBusy({busy: false});
        } else {
            setTimeout(() => this.props.onBusy({busy: false}), delay);
        }
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
                    }
                )
            );
            this.hideBusy();
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
                    console.warn(`${file.name}: file too big, ${file.size}`);
                    this.hideBusy();
                } else {
                    this.showBusy({busy: true, busyMessage: "loading file..."});
                    const data = new Uint8Array(await new Response(file).arrayBuffer());
                    if (isSysexData(data)) {
                        this.setState(
                            produce(draft => {
                                draft.data = mergeDeep(draft.data || {}, parseSysexDump(data));
                            })
                        );
                        // this.addInfoMessage("sysfile decoded");
                    } else {
                        console.log("readFiles: not a sysfile", hs(data.slice(0, 5)));
                    }
                    this.hideBusy();
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
                // data: null,
                dropZoneActive: false
            },
            () => {this.readFiles(files)}   // returned promise from readFiles() is ignored, this is normal.
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


    onOutputConnection = (port_id) => {
        this.setState(
            produce(draft => {
                draft.output = port_id;
            })
        );
    };

    onOutputDisconnection = (port_id) => {
        this.setState(
            produce(draft => {
                draft.output = null;        // we manage only one output connection at a time
            })
        );
    };

    sendSysex = msg => {
        // console.log("sendSysex", msg.length > 32 ? hs(msg.slice(0, 32)) + '...' : hs(msg), bytesExpected);
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

    /**
     * @returns {*}
     */
    render() {

        const { presetIndex, data, output, dropZoneActive } = this.state;

        return (

            <Dropzone
                disableClick
                style={{position: "relative"}}
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
                            <h2>Presets:</h2>
                            <div className="selectors">
                                <PresetSelector data={data} currentPreset={presetIndex} onClick={this.selectPreset} />
                            </div>
                            <div className="preset-buttons">
                                {output && <button onClick={() => this.readPacer(requestAllPresets(), ALL_PRESETS_EXPECTED_BYTES)}>Read all presets from Pacer</button>}
                                <input ref={this.inputOpenFileRef} type="file" style={{display:"none"}}  onChange={this.onChangeFile} />
                                <button onClick={this.onInputFile}>Load preset(s) from file</button>
                                {data && <button onClick={this.clearData}>CLEAR</button>}
                                {data && <button onClick={this.toggleBase}>{this.state.decBase ? "Display numbers in hex" : "Display numbers in dec"}</button>}
                            </div>
                        </div>

                        <div className="content-row-content">
                            <PresetOverview data={data} hexDisplay={!this.state.decBase}/>
                        </div>

                    </div>

                </div>

            </Dropzone>
        );
    }
}

export default Overview;
