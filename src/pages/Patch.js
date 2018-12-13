import React, {Component} from 'react';
import {produce} from "immer";
import {isSysexData, mergeDeep, parseSysexDump, requestAllPresets} from "../pacer/sysex";
import Midi from "../components/Midi";
import {ANY_MIDI_PORT, PACER_MIDI_PORT_NAME, SYSEX_SIGNATURE, TARGET_PRESET} from "../pacer/constants";
import PortsGrid from "../components/PortsGrid";
import {outputById} from "../utils/ports";
import {presetIndexToXY} from "../pacer/utils";
import Dropzone from "react-dropzone";
import "./Patch.css";
import Download from "../components/Download";

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

const MAX_FILE_SIZE = 5 * 1024*1024;

class Patch extends Component {

    // one data structure per preset

    constructor(props) {
        super(props);
        this.inputOpenFileRef = React.createRef();
        this.state = {
            output: null,   // MIDI output port used for output
            data: null,     // json
            bytes: null,  // binary, will be used to download as .syx file
            // presets: [],            // array of {data, bytes}, array index is preset index, 0 = current preset
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

    handleMidiInputEvent = batchMessages(
        messages => {

            let bytes = messages.reduce((accumulator, element) => accumulator + element.length, 0);

            this.setState(
                produce(
                    draft => {

                        draft.bytes = new Uint8Array(bytes);
                        let bin_index = 0;

                        for (let m of messages) {

                            draft.bytes.set(m, bin_index);
                            bin_index += m.length;

                            if (isSysexData(m)) {
                                draft.data = mergeDeep(draft.data || {}, parseSysexDump(m));
                            } else {
                                console.log("MIDI message is not a sysex message")
                            }
                        }
                    }
                )
            );

            // this.addInfoMessage(`${messages.length} messages received (${bytes} bytes)`);
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
                    console.warn(`${file.name}: file too big, ${file.size}`);
                } else {
                    this.showBusy();
                    const data = new Uint8Array(await new Response(file).arrayBuffer());
                    if (isSysexData(data)) {
                        this.setState(
                            produce(draft => {
                                draft.bytes = data;
                                draft.data = mergeDeep(draft.data || {}, parseSysexDump(data));
                                this.props.onBusy(false);
                            })
                        );
                        // this.addInfoMessage("sysfile decoded");
                        // } else {
                        //     console.log("readFiles: not a sysfile", hs(data.slice(0, 5)));
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
                draft.output = null;
            })
        );
    };

    sendSysex = msg => {
        console.log("sendSysex", msg);
        if (!this.state.output) return;
        let out = outputById(this.state.output);
        if (!out) {
            console.warn(`send: output ${this.state.output} not found`);
            return;
        }
        this.showBusy();
        this.setState(
            {data: null},
            () => out.sendSysex(SYSEX_SIGNATURE, msg)
        );
    };

    sendMessage = (msg) => {
        this.sendSysex(msg);
    };


    updatePacer = (messages) => {
        // for (let m of messages) {
        //     this.sendSysex(m);
        // }
        // this.addInfoMessage(`update${messages.length > 1 ? 's' : ''} sent to Pacer`);
    };


    /**
     * @returns {*}
     */
    render() {

        const { data, output, dropZoneActive } = this.state;

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
                onDragLeave={this.onDragLeave}>
                {dropZoneActive &&
                <div style={overlayStyle}>
                    Drop sysex file...
                </div>}

                <div className="wrapper">

                    <div className="subheader">
                        <Midi only={ANY_MIDI_PORT} autoConnect={PACER_MIDI_PORT_NAME}
                              portsRenderer={(groupedPorts, clickHandler) => <PortsGrid groupedPorts={groupedPorts} clickHandler={clickHandler} />}
                              onMidiInputEvent={this.handleMidiInputEvent}
                              onOutputConnection={this.onOutputConnection}
                              onOutputDisconnection={this.onOutputDisconnection}
                              className="" >
                            <div className="no-midi">Please connect your Pacer to your computer.</div>
                        </Midi>
                    </div>

                    <div className="content">

                        <div className="instructions">
                            A patch is a full dump of the Pacer.
                        </div>

                        <div className="content-row-content first">

                            <h2>From Pacer</h2>

                            <div>
                                {output && <button className="space-right" onClick={() => this.sendSysex(requestAllPresets())}>Read patch from Pacer</button>}
                            </div>

                            <div>
                                {data && <Download data={data} filename={`pacer-preset`} addTimestamp={true} className="small" label="Download patch" />}
                            </div>

                        </div>

                        <div className="content-row-content first">

                            <h2>To Pacer</h2>

                            <div>
                                {/*{output && <button className="space-right" onClick={() => this.sendSysex(requestAllPresets())}>Read all presets from Pacer</button>}*/}
                                <input ref={this.inputOpenFileRef} type="file" style={{display:"none"}} onChange={this.onChangeFile} />
                                <button onClick={this.onInputFile}>Load patch from file</button>
                            </div>

                            <div>
                                {data && <button onClick={() => this.updatePacer()}>Send patch to Pacer</button>}
                            </div>

                        </div>

                        <div className="content-row-content">


                            <div className="instructions">
                                Presets marked "no data" are ignored. They will NOT erase the preset config in your Pacer.
                            </div>


                            <h2>Patch content:</h2>
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

                        </div>

                    </div>

                </div>

            </Dropzone>
        );
    }
}

export default Patch;
