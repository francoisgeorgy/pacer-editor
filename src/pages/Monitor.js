import React, {Component} from 'react';
import Midi from "../components/Midi";
import {produce} from "immer";
import MidiPort from "../components/MidiPort";
import parseMidi from 'parse-midi';
import {h, hs} from "../utils/hexstring";
import {CONTROLER, MESSAGE} from "../utils/midi";
import * as Note from "tonal-note";
import "./Monitor.css";

class Monitor extends Component {

    state = {
        messages: []
    };

    handleMidiInputEvent = (event) => {
        console.log("Monitor.handleMidiInputEvent", event, event.type, event.data);
        // if (event instanceof MIDIMessageEvent) {
        this.setState(
            produce(draft => {
                let len = draft.messages.unshift(event.data);
                if (len > 20) draft.messages.pop();
            })
        )
        // }
    };

    renderPort = (port, selected, clickHandler) => {
        if (port === undefined || port === null) return null;
        return (
            <MidiPort key={port.id} port={port} selected={selected} clickHandler={clickHandler} />
        )
    };

    render() {

        return (

            <div className="wrapper">
                <div className="content">
                    <div>

                        <Midi inputRenderer={this.renderPort} outputRenderer={this.renderPort}
                              autoConnect={/.*/i} onMidiInputEvent={this.handleMidiInputEvent}

                              className="sub-header" />

                        <div className="main">
                            <div>
                                <h2>MIDI messages</h2>
                                <p>The messages are displayed in reverse chronological order (the most recent on top). Only the last 20 messages are displayed.</p>
                            </div>
                            <div className="messages">
                                {this.state.messages.map((msg, i) => {
                                    let m = parseMidi(msg);
// {messageCode: 128, channel: 1, messageType: "noteoff", key: 93, velocity: 0}
// {messageCode: 176, channel: 1, messageType: "controlchange", controlNumber: 7, controlFunction: "volume", …}

// {messageCode: 176, channel: 4, messageType: "controlchange", controlNumber: 32, controlFunction: "bankselectfine", …} "B0"
// {messageCode: 176, channel: 4, messageType: "controlchange", controlNumber: 0, controlFunction: "bankselect", …} "B0"
                                    console.log(m, h(m.messageCode));
                                    let info2 = '';
                                    let info3 = '';
                                    switch (m.messageCode) {
                                        case 0x80:      // {messageCode: 144, channel: 1, messageType: "noteon", key: 70, velocity: 21}
                                        case 0x90:
                                            info2 = Note.fromMidi(m.key);
                                            info3 = `velocity: ${m.velocity}`;
                                            break;
                                        case 0xA0:  // "AfterTouch",
                                            break;
                                        case 0xB0:
                                            info2 = CONTROLER[m.controlNumber];
                                            info3 = m.controlValue;
                                            break;
                                        case 0xC0:          // {messageCode: 192, channel: 4, messageType: "programchange", program: 102} "C0"
                                            info2 = `program: ${m.program}`;
                                            info3 = '';
                                            break;
                                        case 0xD0:  // "Channel Pressure\",\n"
                                            break;
                                        case 0xE0:          // {messageCode: 224, channel: 1, messageType: "pitchbendchange", pitchBend: 8283, pitchBendMultiplier: 0.011109754608716884}
                                            info2 = `bend: ${m.pitchBend}`;
                                            info3 = `multiplier: ${m.pitchBendMultiplier}`;
                                            break;
                                    }
                                    return (
                                        <div>
                                            <span className="code">[{hs(msg)}]</span>
                                            <span className="msg-channel">Channel {m.channel}</span>
                                            <span className="msg-name">{MESSAGE[m.messageCode]}</span>
                                            <span className="msg-data">{info2}</span>
                                            <span className="msg-data">{info3}</span>
                                        </div>
                                    );
                                    // return <div key={i}>{Object.keys(m).map(k => <span>{`${k}: ${m[k]}`} </span>)}</div>
                                    // return <pre key={i}>{hs(msg)} {parseMidi(msg)}</pre>
                                })}
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

export default Monitor;
