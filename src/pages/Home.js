import React, {Component} from 'react';
import PresetSelectors from "../components/PresetSelectors";
import MidiPorts from "../components/MidiPorts";
import {isSysexData, mergeDeep, parseSysexDump} from "../utils/sysex";
import Controls from "../components/Controls";
import {CONTROLS, presetIndexToXY, presetXYToIndex, requestPresetObj, SYSEX_SIGNATURE} from "../pacer";
import {hs} from "../utils/hexstring";
import "./Home.css";
import {produce} from "immer";
import DumpSysex from "../components/DumpSysex";
import {outputFromId} from "../utils/ports";

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
        let msg = requestPresetObj(this.state.presetIndex, id);
        this.sendSysex(msg);
        this.setState({
            controlId: id,
            message: msg
        });
    };

    handleMidiInputEvent = (event) => {
        console.log("Home.handleMidiInputEvent", event, event.data);
        // if (event instanceof MIDIMessageEvent) {
        if (isSysexData(event.data)) {
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

    sendSysex = msg => {
        console.log("sendSysex", msg);
        if (this.state.output) {
            this.setState(
                {data: null},
                () => outputFromId(this.state.output).sendSysex(SYSEX_SIGNATURE, msg)
            );
        }
    };

    enablePort = (port_id) => {
        console.warn(`SendTester.componentDidMount.enablePort ${port_id}`);
        this.setState({output: port_id});
    };

    render() {
        const { presetIndex, controlId, message, data } = this.state;

        return (
            <div>

                <h2>1. Enable the input and output MIDI ports used with your Pacer:</h2>

                <div className="sub-header">
                    {this.props.inputPorts && <MidiPorts ports={this.props.inputPorts} type="input" onMidiEvent={this.handleMidiInputEvent} />}
                    {this.props.outputPorts && <MidiPorts ports={this.props.outputPorts} type="output" onPortSelection={this.enablePort} />}
                </div>

                <div className="main">

                    <div>
                        <h2>2. Choose the preset and the control to view/edit:</h2>

                        <PresetSelectors currentPreset={presetIndex} onClick={this.selectPreset} />

                        {presetIndex && <Controls currentControl={controlId} onClick={this.selectControl} />}
                    </div>

                    {presetIndex && controlId &&
                    <div>
                        <div>
                            <h3>preset {presetIndexToXY(presetIndex)}, control {CONTROLS[controlId]}</h3>
                        </div>

                        <div>
                            sysex message to request config: <span className="code">{hs(message)}</span>
                        </div>
                    </div>
                    }

                    <div>

                        <h2>Response:</h2>
                        <div className="message code">
                            <DumpSysex data={data} />
                        </div>

                    </div>

                </div>
            </div>
        );
    }

}

export default Home;
