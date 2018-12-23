import React, {Component} from 'react';
import Midi from "../components/Midi";
import {produce} from "immer";
import parseMidi from 'parse-midi';
import {hs} from "../utils/hexstring";
import {CONTROLER, MESSAGE} from "../utils/midi";
import * as Note from "tonal-note";
import "./Monitor.css";
import PortsGrid from "../components/PortsGrid";
import {ANY_MIDI_PORT} from "../pacer/constants";

const MAX_MESSAGES = 40;

class Monitor extends Component {

    state = {
        messages: []
    };

    handleMidiInputEvent = (event) => {
        // if (event instanceof MIDIMessageEvent) {
        this.setState(
            produce(draft => {
                let len = draft.messages.unshift(event.data);
                if (len > MAX_MESSAGES) draft.messages.pop();
            })
        )
        // }
    };

    render() {

        return (

            <div className="wrapper">

                <div className="subheader">
                    <Midi only={ANY_MIDI_PORT} autoConnect={ANY_MIDI_PORT}
                          portsRenderer={(groupedPorts, clickHandler) => <PortsGrid groupedPorts={groupedPorts} clickHandler={clickHandler} />}
                        // inputRenderer={this.renderPort} outputRenderer={this.renderPort}
                          onMidiInputEvent={this.handleMidiInputEvent}>
                        <div className="no-midi">Please connect your Pacer or any other MIDI device to your computer.</div>
                    </Midi>
                </div>

                <div className="content">
                    <div>

                        <div className="instructions">
                            <div className="instruction">
                                The messages are displayed in reverse chronological order (the most recent on top). Only the last 40 messages are displayed.
                            </div>
                        </div>

                        <div className="content-row-content first">
                            <h2>MIDI messages</h2>
                            <div className="content-row-content-content">
                                <div className="messages">
                                    {this.state.messages.map((msg, i) => {      //TODO: display timestamp
                                        let m = parseMidi(msg);
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
                                            <div key={i}>
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
            </div>
        );
    }

}

export default Monitor;
