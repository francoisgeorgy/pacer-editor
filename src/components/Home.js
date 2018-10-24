import React, {Component} from 'react';
import PresetSelectors from "./PresetSelectors";
import Preset from "./Preset";
import MidiPorts from "./MidiPorts";
import {isSysexData} from "../utils/sysex";
import "./Home.css";

class Home extends Component {

    state = {
        output: null,       // MIDI output port enabled
        currentPreset: "",  // preset name, like "B2"
        data: null
    };

    selectPreset = (name) => {
        console.log(`onPresetSelection: ${name}`);
        this.setState({currentPreset: name});
    };

    handleMidiInputEvent = (event) => {
        console.log("Home.handleMidiInputEvent", event, event.data);
        // if (event instanceof MIDIMessageEvent) {
        if (isSysexData(event.data)) {
            this.setState({data: event.data});
        } else {
            console.log("MIDI message is not a sysex message")
        }
        // }
    };

    enablePort = (port_id) => {
        console.warn(`SendTester.componentDidMount.enablePort ${port_id}`);
        this.setState({output: port_id});
    };

/*
    componentDidMount() {
        console.log("Home.componentDidMount");
    }

    componentWillUnmount() {
        console.log("Home.componentWillUnmount");
    }
*/

    render() {
        const { currentPreset } = this.state;
        return (
            <div>

                <div className="sub-header">
                    {/*<h2>home</h2>*/}
                    {this.props.inputPorts && <MidiPorts ports={this.props.inputPorts} type="input" onMidiEvent={this.handleMidiInputEvent} />}
                    {this.props.outputPorts && <MidiPorts ports={this.props.outputPorts} type="output" onPortSelection={this.enablePort} />}
                </div>

                <div className="main">

                    <PresetSelectors currentPreset={currentPreset} onClick={this.selectPreset}/>

                    {currentPreset && <Preset name={currentPreset}/>}

                </div>
            </div>
        );
    }

}

export default Home;
