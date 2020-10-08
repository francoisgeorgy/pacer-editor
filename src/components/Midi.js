import React, {Component} from 'react';
import * as WebMidi from "webmidi";
import {portById} from "../utils/ports";
import {batchMessages} from "../utils/midi";
import {isSysexData, mergeDeep, parseSysexDump} from "../pacer/sysex";
import {hs} from "../utils/hexstring";
import {inject, observer} from "mobx-react";
import "./Midi.css";


class Midi extends Component {

    handleMidiInputEvent = batchMessages(

        messages => {
            // console.log("handleMidiInputEvent", messages);

            let numberBytes = 0;
            let bin_index = 0;
            let buffer = null;
            if (this.props.state.saveBytes) {
                numberBytes = messages.reduce((accumulator, element) => accumulator + element.length, 0);
                buffer = new Uint8Array(numberBytes);
                bin_index = 0;
            }

            let data = this.props.state.data;
            for (let m of messages) {

                if (this.props.state.saveBytes) {
                    buffer.set(m, bin_index);
                    bin_index += m.length;
                }

                if (isSysexData(m)) {
                    data = mergeDeep(data || {}, parseSysexDump(m))
                } else {
                    console.log("MIDI message is not a sysex message", hs(m))
                }
            }

            if (this.props.state.saveBytes) {
                if (this.props.state.bytes === null) {
                    this.props.state.bytes = buffer;
                } else {
                    // merge sysex bytes
                    const a = new Uint8Array(this.props.state.bytes.length + buffer.length);
                    a.set(this.props.state.bytes);
                    a.set(buffer, this.props.state.bytes.length);
                    this.props.state.bytes = a;
                }
            }

            console.log(`handleMidiInputEvent: ${messages.length} messages merged`);

            // When requesting a config via MIDI (and not via a file drag&drop), we do not
            // update the preset and control ID from the MIDI sysex received.
            // This is important because to get the LED data we need to request the complete
            // preset data instead of just the selected control's config.

            // let pId = Object.keys(draft.data[TARGET_PRESET])[0];
            // draft.presetIndex = parseInt(pId, 10);
            // draft.controlId = parseInt(Object.keys(draft.data[TARGET_PRESET][pId][CONTROLS_DATA])[0], 10);

            this.props.state.data = data;
            this.props.state.onBusy({busy: false});
        },
        (n) => {
            //TODO:
            // console.log("handleMidiInputEvent", n);
            this.props.state.onBusy({busy: true, bytesReceived: n});
        },
        1000
    );

    connectInput = port => {
        if (port) {
            if (port.hasListener("sysex", 'all', this.handleMidiInputEvent)) {
                console.log(`Midi.connectInput: sysex messages on all channels listener already connected`);
            } else {
                console.log(`Midi.connectInput: add listener for sysex messages on all channels`);
                port.addListener("sysex", 'all', this.handleMidiInputEvent);
                console.log("connectInput: ", port.name);
            }
        }
    };

    disconnectInput = port => {
        if (port) {
            if (port.removeListener) port.removeListener();
            console.log(`disconnectInput: input ${port.id} disconnected`);
            // pacerPresent: WebMidi.inputs.findIndex(port => port.name.match(r2) != null) >= 0,
            // if (port.name.match(new RegExp(PACER_MIDI_INPUT_PORT_NAME, 'i'))) {
            //     this.setState({ pacerInputConnected: false })
            // }
        }
    };

    connectOutput = port => {
        if (port) {
            console.log(`connectOutput: output ${port.id} connected`);
        }
    };

    disconnectOutput = () => {
        console.log(`disconnectOutput: output disconnected`);
    };

    autoConnectInput = () => {
        if (this.props.autoConnect) {
            console.log(`Midi.autoConnectInput: autoConnect ${this.props.autoConnect}`);
            if (!this.props.state.midi.input) {
                for (let port of this.props.state.midi.inputs) {      //WebMidi.inputs) {
                    if (port.type === 'input' && (port.name.match(new RegExp(this.props.autoConnect, 'i')) != null)) {
                        console.log(`Midi.autoConnectInput: connect ${port.name}`);
                        this.setState({input: port.id});
                        this.props.state.midi.input = port.id;
                        this.connectInput(port);
                        break;
                    }
                }
            }
        }
    };

    autoConnectOutput = () => {
        if (this.props.autoConnect) {
            console.log(`Midi.autoConnectOutput: autoConnect ${this.props.autoConnect}`);
            if (!this.props.state.midi.output) {
                for (let port of this.props.state.midi.outputs) {
                    if (port.type === 'output' && (port.name.match(new RegExp(this.props.autoConnect, 'i')) != null)) {
                        console.log(`Midi.autoConnectOutput: autoConnect: auto-connect ${port.name}`);
                        this.props.state.midi.output = port.id;
                        this.connectOutput(port);
                        break;
                    }
                }
            }
        }
    };

    registerInputs = () => {
        this.props.state.midi.inputs = WebMidi.inputs.filter(port => port.name.match(new RegExp(this.props.only, 'i')) != null);
        this.autoConnectInput();
    };

    registerOutputs = () => {
        this.props.state.midi.outputs = WebMidi.outputs.filter(port => port.name.match(new RegExp(this.props.only, 'i')) != null);
        this.autoConnectOutput();
    };

    unRegisterInputs = () => {
        console.log("Midi.unRegisterInputs");
        this.disconnectInput(portById(this.props.state.midi.input));
        this.props.state.midi.input = null;
        this.props.state.midi.inputs = [];
    };

    unRegisterOutputs = () => {
        console.log("Midi.unRegisterOutputs");
        this.disconnectOutput();
        this.props.state.midi.output = null;
        this.props.state.midi.outputs = [];
    };

    handleMidiConnectEvent = e => {
        // console.group(`Midi: handleMidiConnectEvent: ${e.port.type} ${e.type}: ${e.port.name}`, e);
        // TODO: is disconnect event, remove the existing input listeners
        if (e.type === "disconnected") {
            this.disconnectInput(e.port.id);
            this.disconnectOutput();
        }
        if (e.port.name.match(new RegExp(this.props.only, 'i'))) {
            if (e.port.type === 'input') {
                // console.log(`ignore MIDI input connect event`);
                // console.log("Midi.handleMidiConnectEvent: call registerInputs");
                this.registerInputs();
            }
            if (e.port.type === 'output') {
                // console.log("Midi.handleMidiConnectEvent: call registerOutputs");
                this.registerOutputs();
            }
        } else {
            console.log(`Midi.handleMidiConnectEvent: port ignored: ${e.port.name}`);
        }
        // Note: if we don't display the events, than the UI will not be updated if we don't update the state.
        // console.groupEnd();
    };

    selectInputPort = (event) => {
        if (this.props.state.midi.input) {
            this.disconnectInput(portById(this.props.state.midi.input));
        }
        const port = portById(event.target.value);
        if (port) {
            this.props.state.midi.input = port.id;
            this.connectInput(port);
        } else {
            console.warn("selectInputPort: port not found", event.target.value);
        }
    };

    selectOutputPort = (event) => {
        if (this.props.state.midi.output) {
            this.disconnectOutput(portById(this.props.state.midi.output));
        }
        const port = portById(event.target.value);
        if (port) {
            this.props.state.midi.output = port.id;
            this.connectOutput(port);
        } else {
            console.warn("selectOutputPort: port not found", event.target.value);
        }
    };

    midiOn = err => {
        if (err) {
            console.warn("Midi.midiOn: WebMidi could not be enabled.", err);
        } else {
            console.log("Midi.midiOn: WebMidi enabled");
            WebMidi.addListener("connected", this.handleMidiConnectEvent);
            WebMidi.addListener("disconnected", this.handleMidiConnectEvent);
        }
    };

    componentDidMount() {
        console.log(`Midi: component did mount: WebMidi.enabled=${WebMidi.enabled}`);
        if (WebMidi.enabled) {
            console.log(`Midi: component did mount: already enabled, register ports`);
            this.registerInputs();
            this.registerOutputs();
        } else {
            // console.log("Midi: component did mount: Calling WebMidi.enable");
            WebMidi.enable(this.midiOn, true);  // true to enable sysex support
        }
    }

    componentWillUnmount() {
        console.log("Midi: component will unmount: unregister ports");
        this.unRegisterInputs();
        this.unRegisterOutputs();
    }

    render() {
        return (
            <div className="midi-ports">
                <div className="midi-port-label">MIDI input:</div>
                <select value={this.props.state.midi.input} onChange={this.selectInputPort}>
                    <option value={0}>- select -</option>
                    {this.props.state.midi.inputs.map(
                        (port, index) => <option key={port.id} value={port.id}>{port.name}</option>
                    )}
                </select>
                <div className="midi-port-label">MIDI output:</div>
                <select value={this.props.state.midi.output} onChange={this.selectOutputPort}>
                    <option value={0}>- select -</option>
                    {this.props.state.midi.outputs.map(
                        (port, index) => <option key={port.id} value={port.id}>{port.name}</option>
                    )}
                </select>
            </div>
        );
    }

}

export default inject('state')(observer(Midi));
