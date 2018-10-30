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
        // console.log("Monitor.handleMidiInputEvent", event, event.type, event.data);
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
                        <div className="content-row step-1">
                            <div className="background">
                                Connect
                            </div>
                            <div className="content-row-header">
                                1
                            </div>
                            <div className="content-row-content row-middle-aligned">
                                <Midi inputRenderer={this.renderPort} outputRenderer={this.renderPort}
                                      autoConnect={/.*/i} onMidiInputEvent={this.handleMidiInputEvent}
                                      className="sub-header" />
                            </div>
                        </div>
                        <div className="content-row step-2">
                            <div className="background">
                                View
                            </div>
                            <div className="content-row-header">
                                2
                            </div>
                            <div className="content-row-content">
                                <div>
                                    <h2>MIDI messages</h2>
                                    <p>The messages are displayed in reverse chronological order (the most recent on top). Only the last 20 messages are displayed.</p>
                                </div>
                                <div className="messages">
                                    {this.state.messages.map((msg, i) => {
                                        let m = parseMidi(msg);
                                        // console.log(m, h(m.messageCode));
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
                                            default:
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
                                    })}
                                </div>
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
