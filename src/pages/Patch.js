import React, {Component} from 'react';
import {
    ALL_PRESETS_EXPECTED_BYTES,
    requestAllPresets
} from "../pacer/sysex";
import {TARGET_PRESET} from "../pacer/constants";
import {presetIndexToXY} from "../pacer/utils";
import Dropzone from "react-dropzone";
import Download from "../components/Download";
import {midiConnected} from "../utils/midi";
import {dropOverlayStyle} from "../utils/misc";
import DownloadJSON from "../components/DownloadJSON";
import {inject, observer} from "mobx-react";
import * as QueryString from "query-string";
import "./Patch.css";
import {toHexDump} from "../utils/hexstring";
import BusyIndicator from "../components/BusyIndicator";

class Patch extends Component {

    // one data structure per preset

    constructor(props) {
        super(props);
        this.inputOpenFileRef = React.createRef();
        this.state = {
            // output: null,   // MIDI output port used for output
            // data: null,     // json
            // bytes: null,  // binary, will be used to download as .syx file
            dropZoneActive: false,
            status: null
        };
    }


/*
    handleMidiInputEvent = batchMessages(
        messages => {

            let bytes = messages.reduce((accumulator, element) => accumulator + element.length, 0);

            this.setState(
                produce(
                    draft => {

                        // draft.bytes = new Uint8Array(bytes);
                        // let bin_index = 0;

                        let buffer = new Uint8Array(bytes);
                        let bin_index = 0;

                        for (let m of messages) {

                            // draft.bytes.set(m, bin_index);
                            buffer.set(m, bin_index);
                            bin_index += m.length;

                            if (isSysexData(m)) {
                                draft.data = mergeDeep(draft.data || {}, parseSysexDump(m));
                            } else {
                                console.log("MIDI message is not a sysex message")
                            }
                        }

                        if (draft.bytes === null) {
                            draft.bytes = buffer;
                        } else {
                            // merge sysex bytes
                            const a = new Uint8Array(draft.bytes.length + buffer.length);
                            a.set(draft.bytes);
                            a.set(buffer, draft.bytes.length);
                            draft.bytes = a;
                        }

                    }
                )
            );

            // this.addInfoMessage(`${messages.length} messages received (${bytes} bytes)`);
            // this.props.onBusy(false);
            this.hideBusy();
        },
        (n) => {
            // this.props.onBusy({busy: true, bytesReceived: n});
        },
        1000
    );
*/

    /**
     *
     * @param files
     * @returns {Promise<void>}
     */
/*
    async readFiles(files) {
        await Promise.all(files.map(
            async file => {
                if (file.size > MAX_FILE_SIZE) {
                    console.warn(`${file.name}: file too big, ${file.size}`);
                    this.setState(
                        produce(draft => {
                            draft.status = {
                                severity: "error",
                                message: `The file ${file.name} is too big.`
                            };
                        })
                    );
                    // this.hideBusy();
                } else {
                    // this.showBusy({busy: true, busyMessage: "loading file..."});
                    const data = new Uint8Array(await new Response(file).arrayBuffer());
                    if (isSysexData(data)) {
                        this.setState(
                            produce(draft => {
                                //draft.bytes = data;
                                if (draft.bytes === null) {
                                    draft.bytes = data;
                                } else {
                                    // merge sysex bytes
                                    const a = new Uint8Array(draft.bytes.length + data.length);
                                    a.set(draft.bytes);
                                    a.set(data, draft.bytes.length);
                                    draft.bytes = a;
                                }
                                draft.data = mergeDeep(draft.data || {}, parseSysexDump(data));
                                draft.status = {
                                    severity: "info",
                                    message: `Patch file loaded: ${file.name}`
                                };
                            })
                        );
                    } else {
                        this.setState(
                            produce(draft => {
                                draft.status = {
                                    severity: "error",
                                    message: `The file ${file.name} does not contain a patch (is not a binary sysex file)`
                                };
                            })
                        );
                    }
                    // this.hideBusy();
                    // non sysex files are ignored
                }
                // too big files are ignored
            }
        ));
    }
*/

    onChangeFile = (e) => {
        let file = e.target.files[0];
        // noinspection JSIgnoredPromiseFromCall
        //TODO
        // this.readFiles([file]);
    };

    onInputFile = (e) => {
        this.inputOpenFileRef.current.click();
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
            () => {
                //TODO
                // this.readFiles(files)
            }   // returned promise from readFiles() is ignored, this is normal.
        );
    };


    /**
     * Send the current data
     * @param patch
     */
/*
    sendPatch = () => {

        if (!this.state.output) {
            console.warn("no output enabled to send the message");
            return;
        }

        let out = outputById(this.state.output);
        if (!out) {
            console.warn(`send: output ${this.state.output} not found`);
            return;
        }

        this.showBusy({busy: true, busyMessage: "sending patch..."});
        splitDump(Array.from(this.state.bytes)).forEach(
            msg => {
                // console.log("sendPatch", msg.length > 32 ? hs(msg.slice(0, 32)) + '...' : hs(msg));
                out.sendSysex(SYSEX_SIGNATURE, msg);
            }
        );
        this.hideBusy(1000);
    };
*/

    /**
     * @returns {*}
     */
    render() {

        const { status, bytes, dropZoneActive } = this.state;
        const output = this.props.state.midi.output;
        const data = this.props.state.data;

        const q =  QueryString.parse(window.location.search);
        const debug = q.debug ? q.debug === '1' : false;

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
                    <div className="content">

                        <div className="content-row-content first">

                            <h2>Import/Export full config</h2>

                            <div className="row">
                                Full Pacer import and export.
{/*
                                <div className="local-help">
                                    A patch is a full dump of the Pacer.<br />
                                    Presets marked "no data" are ignored. They will NOT erase the preset config in your Pacer.
                                </div>
*/}
                            </div>

                            <div>
                                <div>
                                    <h3>Pacer --> file</h3>
                                    {midiConnected(output) && <button onClick={() => this.props.state.readFullDump()}>Read Pacer</button>}
                                    <BusyIndicator />
                                    <Download disabled={!this.props.state.bytes} data={this.props.state.bytes} filename={`pacer-patch`} addTimestamp={true} label="Save to file" className="space-left" />
                                </div>
                                <div>
                                    <h3>File --> Pacer</h3>
                                    <input ref={this.inputOpenFileRef} type="file" style={{display:"none"}} onChange={this.onChangeFile} />
                                    <button onClick={this.onInputFile}>Load file</button>
                                    <button disabled={!(data && midiConnected(output))} onClick={() => this.props.state.sendDump()} className="space-left">Send to Pacer</button>
                                </div>
                            </div>

                            <div>
                                <h3>Data:</h3>
                            </div>

                            <div className="patch-content">
                            {
                                Array.from(Array(24+1).keys()).map(
                                index => {
                                    let id = presetIndexToXY(index);
                                    let show = data && data[TARGET_PRESET] && data[TARGET_PRESET][index];
                                    let name = show ? data[TARGET_PRESET][index]["name"] : "";

                                    if (index === 0) return null;

                                    return (
                                        <div key={index}>
                                            {/*<div className="right-align">{index}</div>*/}
                                            <div>{id}</div>
                                            {show ? <div>{name}</div> : <div className="placeholder">no data</div>}
                                        </div>
                                    );
                                })
                            }
                            </div>

                            {status &&
                            <div className={`status ${status.severity}`}>
                                {status.message}
                            </div>
                            }

                            {data && <div className="Xpreset-buttons">
                                <button onClick={() => this.props.state.clear()}>CLEAR DATA</button>
                            </div>}

                        </div>

                    </div>

                </div>

                <div>
                    bytes: {this.props.state.bytes ? this.props.state.bytes.length : '-1'}
                    <pre>{toHexDump(this.props.state.bytes).map(s => s+'\n')}</pre>
                </div>

            </Dropzone>
        );
    }
}

export default inject('state')(observer(Patch));
