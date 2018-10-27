import React, {Component} from 'react';
import PresetSelectors from "../components/PresetSelectors";
import MidiPorts from "../components/MidiPorts";
import {isSysexData, mergeDeep, parseSysexDump} from "../utils/sysex";
import Controls from "../components/Controls";
import {CONTROLS, presetIndexToXY, requestPresetObj, SYSEX_SIGNATURE} from "../pacer";
import {hs} from "../utils/hexstring";
import {produce} from "immer";
import DumpSysex from "../components/DumpSysex";
import {outputFromId} from "../utils/ports";
import ControlStepsEditor from "../components/ControlStepsEditor";
import {A5SW5} from "../debug/A5.stompswitch-5";    // DEBUG ONLY  //TODO: remove after debug

class Presets extends Component {

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
        console.log("Presets.handleMidiInputEvent", event, event.data);
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

    controlStepsUpdate = (controlId, stepIndex, dataIndex, value) => {
        console.log("controlStepsUpdate", controlId, stepIndex, dataIndex, value);
        this.setState(
            produce(draft => {
                draft["1"][draft.presetIndex]["controls"][controlId]["steps"][stepIndex]["data"][dataIndex] = value;
                // this.props.onBusy(false);
            })
        );
    };

    render() {
        const { presetIndex, controlId, message, data } = this.state;

        let ok = false;

        if (data) {

            ok = true;

            if (!("1" in data)) {        // TODO: replace "1" by a constant
                console.log(`invalid data`, data);
                ok = false;
            }

            if (!(presetIndex in data["1"])) {        // TODO: replace "1" by a constant
                console.log(`preset ${presetIndex} not found in data`);
                ok = false;
            }

            if (!("controls" in data["1"][presetIndex])) {
                console.log(`controls not found in data`);
                ok = false;
            }

            if (!(controlId in data["1"][presetIndex]["controls"])) {
                console.log(`control ${controlId} not found in data`);
                ok = false;
            }

            if (!("steps" in data["1"][presetIndex]["controls"][controlId])) {
                console.log(`steps not found in data`);
                ok = false;
            }
        }

        if (ok) {
            console.log("Presets.render", ok, Object.keys(data["1"][presetIndex]["controls"][controlId]["steps"]).length, data);
        } else {
            console.log("Presets.render", ok);
        }

        ok = ok && (Object.keys(data["1"][presetIndex]["controls"][controlId]["steps"]).length === 6);

        const showEditor = ok;  // && presetIndex && controlId;

        return (
            <div className="wrapper">
                <div className="content">

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

                        {/* presetIndex && controlId &&
                        <div>
                            <h3>preset {presetIndexToXY(presetIndex)}, control {CONTROLS[controlId]}</h3>
                            <div>
                                sysex message to request config: <span className="code">{hs(message)}</span>
                            </div>

                            <h3>Response:</h3>
                            <div className="message code">
                                <DumpSysex data={data} />
                            </div>
                        </div>
                        */}

                        {/*{showEditor && <ControlEditor config={data} />}*/}

                        {/*{JSON.stringify(data)}*/}

                        {/*
                            {"1":
                                 {"5":{"controls":{"13":{"steps":{"1":{"channel":0,"msg_type":67,"data":[52,127,0],"active":1},"2":{"channel":0,"msg_type":67,"data":[28,127,0],"active":1},"3":{"channel":0,"msg_type":67,"data":[40,127,0],"active":1},"4":{"channel":0,"msg_type":67,"data":[64,127,0],"active":1},"5":{"channel":0,"msg_type":67,"data":[76,127,0],"active":1},"6":{"channel":0,"msg_type":97,"data":[0,127,0],"active":0}}}}}}}
                        */}

                        {showEditor && <ControlStepsEditor controlId={controlId}
                                                           steps={data["1"][presetIndex]["controls"][controlId]["steps"]}
                                                           onUpdate={(stepIndex, dataIndex, value) => this.controlStepsUpdate(controlId, stepIndex, dataIndex, value)} />}
                        {/*<ControlEditor presetIndex={5} config={A5SW5["1"]["5"]["controls"]["17"]} />*/}

                    </div>
                </div>

                <div className="help">
                    <h2>Help</h2>
                </div>

            </div>
        );
    }

}

export default Presets;
