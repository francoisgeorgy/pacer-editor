import React, {Component} from 'react';
import Dropzone from "react-dropzone";
import {produce} from "immer";
import {isSysexData, mergeDeep, parseSysexDump} from "../pacer/sysex";
import DumpSysex from "../components/DumpSysex";
import './DumpDecoder.css';
import {hs} from "../utils/hexstring";
import Midi from "../components/Midi";
import {ANY_MIDI_PORT, PACER_MIDI_PORT_NAME} from "../pacer/constants";
import PortsGrid from "../components/PortsGrid";
import {dropOverlayStyle} from "../utils/misc";

const MAX_FILE_SIZE = 5 * 1024*1024;

class DumpDecoder extends Component {

    state = {
        data: null
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
    () => {this.readFiles(files)});
    };

    handleMidiInputEvent = (event) => {
        // console.log("DumpDecoder.handleMidiInputEvent", event, event.data);
        // if (event instanceof MIDIMessageEvent) {
        if (isSysexData(event.data)) {
            // console.log("DumpDecoder.handleMidiInputEvent: data is SysEx");
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


    /**
     * @returns {*}
     */
    render() {

        const { data, dropZoneActive } = this.state;

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
                              onMidiInputEvent={this.handleMidiInputEvent}>
                            <div className="no-midi">Please connect your Pacer to your computer.</div>
                        </Midi>
                    </div>

                    <div className="content">

                        <div className="instructions">
                            <div className="instruction">
                                Send a dump from your Pacer or<br />drag & drop a patch file here.
                            </div>
                        </div>

                        <div className="content-row-content first">
                            <DumpSysex data={data} />
                        </div>

                    </div>

{/*
                <div className="right-column">
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

export default DumpDecoder;
