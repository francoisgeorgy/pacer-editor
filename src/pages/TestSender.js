import React, {Component} from 'react';
import {isSysexData, mergeDeep, parseSysexDump} from "../utils/sysex";
import MidiPorts from "../components/MidiPorts";
import {requestPreset, requestPresetObj, SYSEX_SIGNATURE} from "../pacer/index";
import {outputFromId} from "../utils/ports";
import {fromHexString, h, hs} from "../utils/hexstring";
import "./TestSender.css";
import {produce} from "immer";
import DumpSysex from "../components/DumpSysex";
import {checksum} from "../pacer";

class TestSender extends Component {

    state = {
        output: null,           // MIDI output port enabled
        data: null,
        messages: [
            requestPreset(5),
            requestPresetObj(5, 0x0D)
        ],
        customMessage: "",
        checksum: null
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

    updateCustomMessage = (event) => {
        let s = (event.target.value.match(/[0-9a-fA-F]+/g) || []).join('');
        let h = '';
        for (let i=0; i<s.length; i++) {
            if ((i > 0) && (i % 2 === 0)) h += ' ';
            h += s[i];
        }
        this.setState({
            customMessage: h,
            cs: checksum(fromHexString(h, / /g))
        });
    };

    sendCustomMessage = () => {
        let data = fromHexString(this.state.customMessage, / /g);
        if (data && data.length > 0) this.sendSysex(data);
    };

    /**
     * @returns {*}
     */
    render() {

        console.log("SendTester.render", this.props);

        const { data, messages, customMessage, cs } = this.state;

        console.log("SendTester.render", messages, customMessage.length % 2);

        return (
            <div className="wrapper">
                <div className="content">

                    <h2>1. Enable the input and output MIDI ports used with your Pacer:</h2>

                    <div className="sub-header">
                        {this.props.inputPorts && <MidiPorts ports={this.props.inputPorts} type="input" onMidiEvent={this.handleMidiInputEvent} />}
                        {this.props.outputPorts && <MidiPorts ports={this.props.outputPorts} type="output" onPortSelection={this.enablePort} />}
                    </div>

                    <div className="main">


                        <h2>Test messages:</h2>
                        <div>
                            {messages.map((msg, i) =>
                                <div key={i} className="send-message">
                                    <button onClick={() => this.sendMessage(msg)}>send</button>
                                    <span className="code light">{hs(SYSEX_SIGNATURE)} </span>
                                    <span className="code">{hs(msg)}</span>
                                    <span className="code light"> {h(checksum(msg))}</span>
                                </div>
                            )}
                        </div>

                        <h2>Custom message:</h2>
                        <div>
                            <div className="send-message">
                                <button onClick={this.sendCustomMessage} disabled={customMessage.length === 0}>send</button>
                                <span className="code light">{hs(SYSEX_SIGNATURE)} </span>
                                <input type="text" className="code" size="30" value={customMessage} placeholder={"hex digits only"} onChange={this.updateCustomMessage} />
                                <span className="code light"> {h(cs)}</span>
                            </div>
                        </div>

                        <h2>Response:</h2>
                        <div className="message code">
                            {data && JSON.stringify(data)}
                            <DumpSysex data={data} />
                        </div>

                    </div>
                </div>

                <div className="help">
                    <h2>Help</h2>
                </div>

            </div>

        );
    }
}

export default TestSender;
