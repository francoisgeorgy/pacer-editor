import React, {Component} from 'react';
import * as WebMidi from "webmidi";
import './App.css';
import {inputFromId, outputFromId, portFromId} from "./utils/ports";
import Midi from "./components/Midi";
import MidiPorts from "./components/MidiPorts";
import {isSysexData, parseSysexDump} from "./utils/sysex";
import Dropzone from "react-dropzone";
import PresetSelectors from "./components/PresetSelectors";
import Preset from "./components/Preset";
import DumpSysex from "./components/DumpSysex";
import {requestPreset, SYSEX_SIGNATURE} from "./pacer";
import {produce} from "immer";


const MAX_FILE_SIZE = 5 * 1024*1024;

class App extends Component {

    state = {
        input: null,        // MIDI input ID / we support only one connected Pacer at a time
        output: null,       // MIDI output ID
        currentPreset: "",  // preset name, like "B2",
        data: null,
        busy: false
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
                                draft.data = parseSysexDump(data);
                                draft.busy = false;
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
        this.setState({busy: true});
        this.readFiles(files);  // returned promise is ignored, this is normal.
    };

    /**
     * MIDI output port handler
     */
    onOutputChange = () => {
        let outs = {};
        this.setState({ outputs: outs });
    };

    handleMidiInputEvent = (event) => {
        console.log("handleMidiInputEvent", event, event.data);
        // if (event instanceof MIDIMessageEvent) {
            if (isSysexData(event.data)) {
                this.setState({data: event.data});
            } else {
                console.log("MIDI message is not a sysex message")
            }
        // }
    };

    connectInput = id => {
        const i = inputFromId(id);
        if (i) {
            i.addListener('sysex', 'all', this.handleMidiInputEvent);
            console.log(`connectInput: input ${id} connected`, i);
        } else {
            console.log(`connectInput: input ${id} not found`);
        }
        // console.log('add input to state.connectedInputs');
        // this.setState({connectedInputs: [...this.state.connectedInputs, id]});
    };

    disconnectInput = id => {
        const i = inputFromId(id);
        if (i) {
            i.removeListener();
            console.log(`disconnectInput: input ${id} disconnected`);
        } else {
            console.log(`disconnectInput: input ${id} not found`);
        }
        // let current = this.state.connectedInputs;
        // current.splice(current.indexOf(id), 1);     // remove id from array
        // console.log('remove input from state.connectedInputs');
        // this.setState({connectedInputs: current});
    };

    toggleInputPort = (port_id) => {
        if (this.state.input) this.disconnectInput(this.state.input);
        this.connectInput(port_id);
        this.setState({ input: port_id });
/*
        if (ins.hasOwnProperty(p.id)) {
            this.disconnectInput(p.id);
            delete ins[p.id];
        } else {
            this.connectInput(p.id);
            ins[p.id] = {
                manufacturer: p.manufacturer,
                name: p.name
            };
        }
        this.setState({ inputs: ins });
*/
    };

    connectOutput = id => {
        const i = outputFromId(id);
        if (i) {
            // i.addListener('sysex', 'all', this.handleMidiOutputEvent);
            console.log(`connectOutput: output ${id} connected`, i);
        } else {
            console.log(`connectOutput: output ${id} not found`);
        }
        // console.log('add output to state.connectedOutputs');
        // this.setState({connectedOutputs: [...this.state.connectedOutputs, id]});
    };

    disconnectOutput = id => {
        const i = outputFromId(id);
        if (i) {
            // i.removeListener();
            console.log(`disconnectOutput: output ${id} disconnected`);
        } else {
            console.log(`disconnectOutput: output ${id} not found`);
        }
        // let current = this.state.connectedOutputs;
        // current.splice(current.indexOf(id), 1);     // remove id from array
        // console.log('remove output from state.connectedOutputs');
        // this.setState({connectedOutputs: current});
    };

    /**
     *
     * @param port_id
     */
    toggleOutputPort = (port_id) => {
        if (this.state.output) this.disconnectOutput(this.state.output);
        this.connectOutput(port_id);
        this.setState({ output: port_id });
/*
        let p = portFromId(port_id);
        let outs = this.state.outputs;
        if (outs.hasOwnProperty(p.id)) {
            delete outs[p.id];
        } else {
            outs[p.id] = {
                manufacturer: p.manufacturer,
                name: p.name
            };
        }
        this.setState({ outputs: outs });
*/
    };

    selectPreset = (name) => {
        console.log(`onPresetSelection: ${name}`);
        this.setState({currentPreset: name});
    };

    sendSysex(msg) {
        if (this.state.output) {
            outputFromId(this.state.output).sendSysex(SYSEX_SIGNATURE, msg);
        }
    }

    onTest = () => {
        let msg = requestPreset(5, 0x0D);
        console.log(msg);
        this.sendSysex(msg);
    };

    /**
     * Main app render
     * @returns {*}
     */
    render() {

        const { input, output, currentPreset, data, busy } = this.state;

        return (
            <div className="App">

                <Midi onOutputChange={this.onOutputChange} />

                <header className="App-header">
                    {busy && <div className="busy">busy</div>}
                    <h1>Nektar Pacer Editor</h1>
                </header>

                <div className="all-ports">
                    <MidiPorts ports={WebMidi.inputs} enabledPort={input} onToggle={this.toggleInputPort} />
                    <MidiPorts ports={WebMidi.outputs} enabledPort={output} onToggle={this.toggleOutputPort} />
                </div>

                <Dropzone onDrop={this.onDrop} className="drop-zone">
                    Drop a binary sysex file here or click to open the file dialog
                </Dropzone>

                <DumpSysex data={data} />

                {/*<button onClick={this.onTest}>test</button>*/}

                {/*<PresetSelectors currentPreset={currentPreset} onClick={this.selectPreset} />*/}

                {/*{currentPreset && <Preset name={currentPreset}/>}*/}

            </div>
        );
    }
}

export default App;
