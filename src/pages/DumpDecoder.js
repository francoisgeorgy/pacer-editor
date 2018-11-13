import React, {Component} from 'react';
import Dropzone from "react-dropzone";
import {produce} from "immer";
import {isSysexData, mergeDeep, parseSysexDump} from "../pacer/sysex";
import DumpSysex from "../components/DumpSysex";
import './DumpDecoder.css';
import {hs} from "../utils/hexstring";
import Midi from "../components/Midi";
import {PACER_MIDI_PORT_NAME} from "../pacer/constants";
import PortsGrid from "../components/PortsGrid";

const MAX_FILE_SIZE = 5 * 1024*1024;

class DumpDecoder extends Component {

    state = {
        data: null
    };

    /**
     * Ad-hoc method to show the busy flag and set a timeout to make sure the busy flag is hidden after a timeout.
     */
    showBusy = () =>  {
        setTimeout(() => this.props.onBusy(false), 20000);
        this.props.onBusy(true);
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
                    this.showBusy();
                    const data = new Uint8Array(await new Response(file).arrayBuffer());
                    if (isSysexData(data)) {
                        this.setState(
                            produce(draft => {
                                draft.data = mergeDeep(draft.data || {}, parseSysexDump(data));
                                this.props.onBusy(false);
                            })
                        );
                        // this.addInfoMessage("sysfile decoded");
                    } else {
                        console.log("readFiles: not a sysfile", hs(data.slice(0, 5)));
                    }
                    this.props.onBusy(false);
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
        this.setState({ data: null }, () => {this.readFiles(files)});
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


    /**
     * @returns {*}
     */
    render() {

        const { data } = this.state;

        console.log("DumpDecoder.render", this.props);

        return (
            <div className="wrapper">
                <div className="content">
                    <div className="content-row-content no-grad">
                        <div className="content-row-content-content">
                            <div className="instructions">
                                Send a dump from your Pacer or drop a binary sysex file onto the drop zone on the right.
                            </div>
                            <div>
                                <DumpSysex data={data} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="right-column">

                    <Midi only={PACER_MIDI_PORT_NAME} autoConnect={PACER_MIDI_PORT_NAME}
                          portsRenderer={(groupedPorts, clickHandler) => <PortsGrid groupedPorts={groupedPorts} clickHandler={clickHandler} />}
                          onMidiInputEvent={this.handleMidiInputEvent}
                          className="sub-header" >
                        <div className="no-midi">Please connect your Pacer to your computer.</div>
                    </Midi>

                    <Dropzone onDrop={this.onDrop} className="drop-zone">
                        Drop a binary sysex file here<br />or click to open the file dialog
                    </Dropzone>

                    {/*<h3>Log:</h3>*/}
                    {/*<Status messages={this.state.statusMessages} />*/}

                </div>

            </div>

        );
    }
}

export default DumpDecoder;
