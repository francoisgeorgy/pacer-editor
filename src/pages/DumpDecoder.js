import React, {Component} from 'react';
import Dropzone from "react-dropzone";
import {produce} from "immer";
import {isSysexData, mergeDeep, parseSysexDump} from "../utils/sysex";
import DumpSysex from "../components/DumpSysex";
import './DumpDecoder.css';
import {hs} from "../utils/hexstring";
import Midi from "../components/Midi";
import MidiPort from "../components/MidiPort";

const MAX_FILE_SIZE = 5 * 1024*1024;

class DumpDecoder extends Component {

    state = {
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
                                draft.data = mergeDeep(draft.data || {}, parseSysexDump(data));
                                this.props.onBusy(false);
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
        this.props.onBusy(true);
        this.readFiles(files);  // returned promise is ignored, this is normal.
    };

    handleMidiInputEvent = (event) => {
        console.log("DumpDecoder.handleMidiInputEvent", event, event.data);
        // if (event instanceof MIDIMessageEvent) {
        if (isSysexData(event.data)) {
            console.log("DumpDecoder.handleMidiInputEvent: data is SysEx");
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


    /**
     * @returns {*}
     */
    render() {

        const { data } = this.state;

        console.log("DumpDecoder.render", this.props);

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
                                  className="sub-header" >
                                <div>Please connect your Pacer to your computer.</div>
                            </Midi>
                        </div>
                    </div>
                    <div className="content-row step-2">
                        <div className="background">
                            Get dump
                        </div>
                        <div className="content-row-header">
                            2
                        </div>
                        <div className="content-row-content row-middle-aligned">
                            {/*<Dropzone onDrop={this.onDrop} className="drop-zone">*/}
                                {/*Drop a binary sysex file here or click to open the file dialog*/}
                            {/*</Dropzone>*/}
                            Send a dump from your Pacer or drop a binary sysex file onto the drop zone on the right.
                        </div>
                    </div>
                    <div className="content-row step-3">
                        <div className="background">
                            Decode
                        </div>
                        <div className="content-row-header">
                            3
                        </div>
                        <div className="content-row-content">
                            <DumpSysex data={data} />
                        </div>
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

export default DumpDecoder;
