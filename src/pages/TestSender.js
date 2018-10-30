import React, {Component} from 'react';
import {isSysexData, mergeDeep, parseSysexDump} from "../utils/sysex";
import {requestPreset, requestPresetObj, SYSEX_SIGNATURE} from "../pacer/index";
import {outputById} from "../utils/ports";
import {fromHexString, h, hs} from "../utils/hexstring";
import "./TestSender.css";
import {produce} from "immer";
import DumpSysex from "../components/DumpSysex";
import {checksum, SYSEX_HEADER} from "../pacer";
import Midi from "../components/Midi";
import MidiPort from "../components/MidiPort";

class TestSender extends Component {

    state = {
        output: null,           // MIDI output port used for output
        data: null,
        messages: [
            requestPreset(5),
            requestPresetObj(5, 0x0D)
        ],
        customMessage: ""
    };

    updateCustomMessage = (event) => {
        let s = (event.target.value.match(/[0-9a-fA-F]+/g) || []).join('');
        let h = '';
        for (let i=0; i<s.length; i++) {
            if ((i > 0) && (i % 2 === 0)) h += ' ';
            h += s[i];
        }
        this.setState({
            customMessage: h    //,
            // cs: checksum(fromHexString(h, / /g))
        });
    };

    sendCustomMessage = () => {
        let data = Array.from(fromHexString(this.state.customMessage, / /g));
        if (data && data.length > 0) {
            data.push(checksum(data));
            this.sendSysex(SYSEX_HEADER.concat(data));
        }
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

    renderPort = (port, selected, clickHandler) => {
        if (port === undefined || port === null) return null;
        return (
            <MidiPort key={port.id} port={port} selected={selected} clickHandler={clickHandler} />
        )
    };

    setOutput = (port_id) => {
        console.log(`Page.setOutput ${port_id}`);
        this.setState({output: port_id});
    };

    sendSysex = msg => {
        console.log("sendSysex", msg);
        if (!this.state.output) return;
        let out = outputById(this.state.output);
        if (!out) {
            console.warn(`send: output ${this.state.output} not found`);
            return;
        }
        this.setState(
            {data: null},
            () => out.sendSysex(SYSEX_SIGNATURE, msg)
        );
    };

    sendMessage = (msg) => {
        this.sendSysex(msg);
    };

    /**
     * @returns {*}
     */
    render() {

        // console.log("SendTester.render", this.props);

        const { data, messages, customMessage } = this.state;

        // console.log("SendTester.render", messages, customMessage.length % 2);

        const cs = checksum(fromHexString(customMessage, / /g));

        return (
            <div className="wrapper">
                <div className="content">
                    <div className="content-row step-1">
                        <div className="background">
                            Connect
                        </div>
                        <div className="content-row-header">
                            1
                        </div>
                        <div className="content-row-content row-middle-aligned">
                            <Midi inputRenderer={this.renderPort} outputRenderer={this.renderPort}
                                  autoConnect={/Pacer midi1/i} onMidiInputEvent={this.handleMidiInputEvent}
                                  setOutput={this.setOutput}
                                  className="sub-header" />
                        </div>
                    </div>
                    <div className="content-row step-2">
                        <div className="background">
                            Send
                        </div>
                        <div className="content-row-header">
                            2
                        </div>
                        <div className="content-row-content">
                            <h2>Test messages:</h2>
                            <div>
                            {messages.map((msg, i) =>
                                <div key={i} className="send-message">
                                    <button onClick={() => this.sendMessage(msg)}>send</button>
                                    <span className="code light">{ hs(SYSEX_SIGNATURE.concat(msg.slice(0, 1))) } </span>
                                    <span className="code">{ hs(msg.slice(1, -1)) } </span>
                                    <span className="code light"> {hs(msg.slice(-1))}</span>
                                </div>
                            )}
                            </div>
                            <h2>Custom message:</h2>
                            <div>
                                <div className="send-message">
                                    <button onClick={this.sendCustomMessage} disabled={customMessage.length === 0}>send</button>
                                    <span className="code light">{hs(SYSEX_SIGNATURE)} {hs(SYSEX_HEADER)} </span>
                                    <input type="text" className="code" size="30" value={customMessage}
                                           placeholder={"hex digits only"} onChange={this.updateCustomMessage} />
                                    <span className="code light"> {h(cs)}</span>
                                </div>
                            </div>

                        </div>
                    </div>
                    <div className="content-row step-3">
                        <div className="background">
                            Receive
                        </div>
                        <div className="content-row-header">
                            3
                        </div>
                        <div className="content-row-content">
                            <h2>Response:</h2>
                            <div className="message code">
                                {/*{data && JSON.stringify(data)}*/}
                                <DumpSysex data={data} />
                            </div>
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
