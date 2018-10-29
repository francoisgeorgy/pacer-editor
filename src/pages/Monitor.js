import React, {Component} from 'react';
import Midi from "../components/Midi";
import {produce} from "immer";
import MidiPort from "../components/MidiPort";
import {hs} from "../utils/hexstring";

class Monitor extends Component {

    state = {
        messages: []
    };

    handleMidiInputEvent = (event) => {
        console.log("Monitor.handleMidiInputEvent", event, event.type, event.data);
        // if (event instanceof MIDIMessageEvent) {
        this.setState(
            produce(draft => { draft.messages.push(event.data) })
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
                              autoConnect={/Pacer/i} onMidiInputEvent={this.handleMidiInputEvent}

                              className="sub-header" />

                        <div className="main">
                            <div>
                                <h2>2. MIDI messages:</h2>
                            </div>
                            <div>
                                {this.state.messages.map((msg, i) => <pre key={i}>{hs(msg)}</pre>)}
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
