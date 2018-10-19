import React, {Component} from 'react';
import * as WebMidi from "webmidi";
import './App.css';
import {inputFromId, portFromId} from "./utils/ports";
import Midi from "./components/Midi";
import MidiPorts from "./components/MidiPorts";
import {isSysexData, parseSysexData} from "./utils/sysex";
import Dropzone from "react-dropzone";
import PresetSelectors from "./components/PresetSelectors";
import Preset from "./components/Preset";
import DumpSysex from "./components/DumpSysex";


const MAX_FILE_SIZE = 5 * 1024*1024;

class App extends Component {

    state = {
        inputs: {},         // MIDI inputs
        outputs: {},        // MIDI outputs
        currentPreset: "",  // preset name, like "B2",
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
                    console.log(`${file.name}: file too big, ${file.size}`);
                } else {
                    const data = await new Response(file).arrayBuffer();
                    if (isSysexData(data)) {
                        this.setState({data});
                        // let patches = parseSysexData(data);
                        // let num_patches = patches.length;        // number of patches found in file
                        /*
                        patches.map(p => {
                            p.rating = this.state.stars.hasOwnProperty(p.hash) ? this.state.stars[p.hash] : 0;
                            return p;
                        });
                        */
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
            i.addListener('noteon', 'all', this.handleMidiInputEvent);
            console.log(`connectInput: input ${id} connected`, i);
        } else {
            console.log(`connectInput: input ${id} not found`);
        }
        console.log('add input to state.connectedInputs');
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
        let p = portFromId(port_id);
        let ins = this.state.inputs;
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
    };

    /**
     *
     * @param port_id
     */
    toggleOutputPort = (port_id) => {
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
    };

    selectPreset = (name) => {
        console.log(`onPresetSelection: ${name}`);
        this.setState({currentPreset: name});
    };

    /**
     * Main app render
     * @returns {*}
     */
    render() {

        const { inputs, outputs, currentPreset, data } = this.state;

        return (
            <div className="App">

                <Midi onOutputChange={this.onOutputChange} />

                <header className="App-header">
                    <h1>Nektar Pacer Editor</h1>
                </header>

                <div className="all-ports">
                    <MidiPorts ports={WebMidi.inputs} enabledPorts={inputs} onToggle={this.toggleInputPort} />
                    <MidiPorts ports={WebMidi.outputs} enabledPorts={outputs} onToggle={this.toggleOutputPort} />
                </div>

                <Dropzone onDrop={this.onDrop} className="drop-zone">
                    Drop patch file here or click to open the file dialog
                </Dropzone>

                <DumpSysex data={data} />

                {/*<PresetSelectors currentPreset={currentPreset} onClick={this.selectPreset} />*/}

                {/*{currentPreset && <Preset name={currentPreset}/>}*/}

            </div>
        );
    }
}

export default App;
