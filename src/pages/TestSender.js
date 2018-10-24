import React, {Component} from 'react';
import {isSysexData, mergeDeep, parseSysexDump} from "../utils/sysex";
import MidiPorts from "../components/MidiPorts";
import {requestPreset, requestPresetObj, SYSEX_SIGNATURE} from "../pacer/index";
import {outputFromId} from "../utils/ports";
import {hs} from "../utils/hexstring";
import "./TestSender.css";
import {produce} from "immer";
import DumpSysex from "../components/DumpSysex";

class TestSender extends Component {

    state = {
        output: null,           // MIDI output port enabled
        data: null,
        messages: [
            requestPreset(5),
            requestPresetObj(5, 0x0D)
        ]
    };

    handleMidiInputEvent = (event) => {
        console.log("TestSender.handleMidiInputEvent", event, event.data);
        // if (event instanceof MIDIMessageEvent) {
        if (isSysexData(event.data)) {
            console.log("TestSender.handleMidiInputEvent: update state");
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

    enablePort = (port_id) => {
        console.warn(`SendTester.componentDidMount.enablePort ${port_id}`);
        this.setState({output: port_id});
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

    sendMessage = (msg) => {
        this.sendSysex(msg);
    };

    /**
     * @returns {*}
     */
    render() {

        console.log("SendTester.render", this.props);

        const { data, messages } = this.state;

        return (
            <div>

                <div className="sub-header">
                    {this.props.inputPorts && <MidiPorts ports={this.props.inputPorts} type="input" onMidiEvent={this.handleMidiInputEvent} />}
                    {this.props.outputPorts && <MidiPorts ports={this.props.outputPorts} type="output" onPortSelection={this.enablePort} />}
                </div>

                <div className="main">

                    <h2>Messages:</h2>
                    <div>
                        {messages.map((msg, i) =>
                            <div key={i} className="send-message">
                                <button onClick={() => this.sendMessage(msg)}>send</button> <span className="code">{hs(msg)}</span>
                            </div>
                        )}
                    </div>

                    <h2>Response:</h2>
                    <div className="message code">
                        {JSON.stringify(data)}
                        <DumpSysex data={data} />
                    </div>

                </div>

            </div>

        );
    }
}

export default TestSender;
