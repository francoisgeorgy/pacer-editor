import React, {Component} from 'react';
import PresetSelectors from "../components/PresetSelectors";
import MidiPorts from "../components/MidiPorts";
import {isSysexData} from "../utils/sysex";
import Controls from "../components/Controls";
import {CONTROLS, presetIndexToXY, presetXYToIndex, requestPresetObj} from "../pacer";
import {hs} from "../utils/hexstring";
import "./Home.css";

class Home extends Component {

    state = {
        output: null,           // MIDI output port enabled
        presetIndex: "",      // preset name, like "B2"
        controlId: "",     //
        message: null,
        data: null
    };



    selectPreset = (name) => {
        this.setState({presetIndex: name});
    };

    selectControl = (id) => {
        console.log(`selectControl ${id}`);
        this.setState({
            controlId: id,
            message: requestPresetObj(this.state.presetIndex, id)
        });
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
        const { presetIndex, controlId, message } = this.state;

        return (
            <div>

                <div className="sub-header">
                    {/*<h2>home</h2>*/}
                    {this.props.inputPorts && <MidiPorts ports={this.props.inputPorts} type="input" onMidiEvent={this.handleMidiInputEvent} />}
                    {this.props.outputPorts && <MidiPorts ports={this.props.outputPorts} type="output" onPortSelection={this.enablePort} />}
                </div>

                <div className="main">

                    <div>
                        <h2>Choose preset and control:</h2>

                        <PresetSelectors currentPreset={presetIndex} onClick={this.selectPreset} />

                        {presetIndex && <Controls currentControl={controlId} onClick={this.selectControl} />}
                    </div>

                    {presetIndex && controlId &&
                    <div>
                        <div>
                            <h2>preset {presetIndexToXY(presetIndex)}, control {CONTROLS[controlId]}</h2>
                        </div>

                        <div>
                            sysex message to request config: <span className="code">{hs(message)}</span>
                        </div>
                    </div>
                    }

                </div>
            </div>
        );
    }

}

export default Home;
