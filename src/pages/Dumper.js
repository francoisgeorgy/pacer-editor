import React, {Component} from 'react';
import Dropzone from "react-dropzone";
import {produce} from "immer";
import {isSysexData, mergeDeep, parseSysexDump} from "../utils/sysex";
import DumpSysex from "../components/DumpSysex";
import MidiPorts from "../components/MidiPorts";
import './Dumper.css';
// import * as WebMidi from "webmidi";

const MAX_FILE_SIZE = 5 * 1024*1024;

class Dumper extends Component {

    state = {
        // inputs: [],         // array of MIDI inputs (copied from WebMidi object)
        // outputs: [],        // array of MIDI outputs (copied from WebMidi object)
        // currentPreset: "",  // preset name, like "B2",
        data: null  //,
        // busy: false
    };

    handleMidiInputEvent = (event) => {
        console.log("Dumper.handleMidiInputEvent", event, event.data);
        // if (event instanceof MIDIMessageEvent) {
        if (isSysexData(event.data)) {
            console.log("Dumper.handleMidiInputEvent: data is SysEx");
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
                    const data = await new Response(file).arrayBuffer();
                    if (isSysexData(data)) {
                        this.setState(
                            produce(draft => {
                                draft.data = mergeDeep(draft.data || {}, parseSysexDump(data));
                                this.props.onBusy(false);
                            })
                        )
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

/*
    midiOn = err => {
        if (err) {
            console.warn("Dumper: WebMidi could not be enabled.", err);
        } else {
            console.log("Dumper: WebMidi enabled!");
        }
    };
    componentDidMount() {
        console.log("Dumper.componentDidMount", WebMidi.enabled);
        WebMidi.enable(this.midiOn, true);  // true to enable sysex support
    }
*/



    /**
     * @returns {*}
     */
    render() {

        const { data } = this.state;

        console.log("dumper.render", this.props);

        return (
            <div>
                <div className="sub-header">
                    {/*<h2>sysex<br />dumper</h2>*/}
                    {this.props.inputPorts && <MidiPorts ports={this.props.inputPorts} type="input" onMidiEvent={this.handleMidiInputEvent} />}
                </div>

                <div className="main">

                    <Dropzone onDrop={this.onDrop} className="drop-zone">
                        Drop a binary sysex file here or click to open the file dialog
                    </Dropzone>

                    <DumpSysex data={data} />

                </div>

            </div>

        );
    }
}

export default Dumper;
