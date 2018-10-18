import React, {Component} from 'react';
import './App.css';
import {portFromId} from "./utils/ports";
import Midi from "./components/Midi";
import MidiPorts from "./components/MidiPorts";
import {isSysexData, parseSysexData} from "./utils/sysex";
import Dropzone from "react-dropzone";
import PresetSelectors from "./components/PresetSelectors";
import Preset from "./components/Preset";


const MAX_FILE_SIZE = 5 * 1024*1024;

class App extends Component {

    state = {
        outputs: {},        // MIDI outputs
        currentPreset: ""   // preset name, like "B2"
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
                        let patches = parseSysexData(data);
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

    /**
     *
     * @param port_id
     */
    togglePort = (port_id) => {
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

        const { outputs, currentPreset } = this.state;

        return (
            <div className="App">

                <Midi onOutputChange={this.onOutputChange} />

                <header className="App-header">
                    <h1>Nektar Pacer Editor</h1>
                </header>

                <MidiPorts outputs={outputs} onToggle={this.togglePort} />

                <Dropzone onDrop={this.onDrop} className="drop-zone">
                    Drop patch file here or click to open the file dialog
                </Dropzone>

                <PresetSelectors currentPreset={currentPreset} onClick={this.selectPreset} />

                {currentPreset && <Preset name={currentPreset}/>}

            </div>
        );
    }
}

export default App;
