import React, {Component} from 'react';
import PropTypes from 'prop-types';
import * as WebMidi from "webmidi";
import {inputById, portById} from "../utils/ports";


const propTypes = {
    classname: PropTypes.string,
    autoConnect: PropTypes.string,
    inputRenderer: PropTypes.func,
    outputRenderer: PropTypes.func,
    onMidiInputEvent: PropTypes.func,
    onMidiOutputEvent: PropTypes.func,
    onInputConnection: PropTypes.func,      // callback with port.id as parameter
    onOutputConnection: PropTypes.func,     // callback with port.id as parameter
    onInputDisconnection: PropTypes.func,   // callback with port.id as parameter
    onOutputDisconnection: PropTypes.func,  // callback with port.id as parameter
    setOutput: PropTypes.func,              // callback with port.id as parameter
    children: PropTypes.node
};

const defaultProps = {
    classname: '',
};

/**
 *
 * @param props
 * @constructor
 */
export default class Midi extends Component {

    //TODO: allow specification of channel and message types to listen to

    state = {
        inputs: [],         // array of MIDI inputs (copied from WebMidi object)
        outputs: [],        // array of MIDI outputs (copied from WebMidi object)
        input: null,        // MIDI output port enabled
        output: null,       // MIDI output port enabled
    };

    connectInput = port => {
        if (this.props.onMidiInputEvent) {
            if (port) {
                if (port.hasListener('midimessage', 'all', this.props.onMidiInputEvent)) {
                    console.warn(`Midi.connectInput: sysex messages on all channels listener already connected`);
                } else {
                    console.log(`Midi.connectInput: add listener for sysex messages on all channels`);
                    port.addListener('midimessage', 'all', this.props.onMidiInputEvent);
                    if (this.props.onInputConnection) {
                        this.props.onInputConnection(port.id);
                    }
                }
            }
        }
    };

    disconnectInput = port => {
        if (port) {
            port.removeListener();
            console.log(`disconnectInput: input ${port.id} disconnected`);
            if (this.props.onInputDisconnection) {
                this.props.onInputDisconnection(port.id);
            }
        }
    };

    connectOutput = port => {
        if (port) {
            this.setState({output: port.id});
            console.log(`connectOutput: output ${port.id} connected`);
            if (this.props.onOutputConnection) {
                this.props.onOutputConnection(port.id);
            }
        }
    };

    disconnectOutput = () => {
        if (this.state.output) {
            let port_id = this.state.output;
            this.setState({output: null});
            console.log(`disconnectOutput: output ${port_id} disconnected`);
            if (this.props.onOutputDisconnection) {
                this.props.onOutputDisconnection(port_id);
            }
        }

    };

    autoConnectInput = () => {

        if (this.props.autoConnect) {

            console.log(`Midi.autoConnectInput: autoConnect ${this.props.autoConnect}`, this.state.inputs);

            if (this.state.input === null) {

                for (let port of this.state.inputs) {      //WebMidi.inputs) {

                    console.log(`Midi.autoConnectInput: port ${port.name} ${port.id}`);

                    if (port.type === 'input' && port.name.match(this.props.autoConnect)) {  // TODO: check manufacturer too; TODO: match case insensitive

                        console.log(`Midi.autoConnectInput: connect ${port.name}`);

                        this.setState({input: port.id});

                        this.connectInput(port);

                        // if (port.hasListener('noteon', 'all', this.props.onMidiInputEvent)) {
                        //     console.warn(`Midi.autoConnectInput: autoConnect: listener already connected`);
                        // } else {
                        //     console.log(`Midi.autoConnectInput: autoConnect: add listener`);
                        //     port.addListener('noteon', 'all', this.props.onMidiInputEvent);
                        // }
                        break;
                    }
                }

            } else {
                console.log(`Midi.autoConnectInput: autoConnect skipped, already connected`);
            }
        }
    };

    autoConnectOutput = () => {

        if (this.props.autoConnect) {

            console.log(`Midi.autoConnectOutput: autoConnect ${this.props.autoConnect}`);

            if (this.state.output === null) {

                for (let port of this.state.outputs) {

                    console.log(`Midi.autoConnectOutput: port ${port.name} ${port.id}`);

                    if (port.type === 'output' && port.name.match(this.props.autoConnect)) {  // TODO: check manufacturer too; TODO: match case insensitive

                        console.log(`Midi.autoConnectOutput: autoConnect: auto-connect ${port.name}`);

                        // this.setState({output: port.id});
                        this.connectOutput(port);

                        break;
                    }
                }

            } else {
                console.log(`Midi.autoConnectOutput: autoConnect skipped, already connected`);
            }
        }
    };

    registerInputs = () => {
        console.log("Midi.registerInputs");
        this.setState({ inputs: WebMidi.inputs }, () => this.autoConnectInput());
    };

    registerOutputs = () => {
        console.log("Midi.registerOutputs");
        this.setState({ outputs: WebMidi.outputs }, () => this.autoConnectOutput());
    };

    unRegisterInputs = () => {
        console.log("Midi.registerInputs");
        this.disconnectInput(portById(this.state.input));
        this.setState({ inputs: [], input: null });
    };

    unRegisterOutputs = () => {
        console.log("Midi.registerOutputs");
        this.setState({ outputs: [], output: null });
    };

    handleMidiConnectEvent = e => {

        console.group(`Midi: handleMidiConnectEvent: ${e.port.type} ${e.type}: ${e.port.name}`, e);

        // TODO: is disconnect event, remove the existing input listeners
        /*
        if (e.type === "disconnected") {
            // console.log(`must disconnect ${e.port} ${e.port.id}`);
            this.disconnectInput(e.port.id);
        }
        */

        if (e.port.type === 'input') {
            // console.log(`ignore MIDI input connect event`);
            console.log("Midi: call registerInputs");
            this.registerInputs();
        }

        if (e.port.type === 'output') {
            console.log("Midi: call registerOutputs");
            this.registerOutputs();
        }

        // Note: if we don't display the events, than the UI will not be updated if we don't update the state.

        console.groupEnd();

    };

    togglePort = (port_id) => {
        let p = portById(port_id);
        if (p.type === 'input') {
            console.log("toggle input", port_id);
            let prev = this.state.input;
            if (this.state.input) {
                this.disconnectInput(portById(this.state.input));
                // this.setState({ input: null });
            }
            if (port_id !== prev) {
                this.connectInput(inputById(port_id));
                // this.setState({ input: port_id });
            }
            this.setState({ input: port_id === prev ? null : port_id });
        } else {
            console.log("toggle output", port_id);
            // There is nothing to "connect" for an output port since this type of port does not generate any event.
            // if (this.state.output) this.disconnectOutput(this.state.output);
            if (this.state.output) {
                this.disconnectOutput();
            } else {
                this.connectOutput(portById(port_id));
            }
            // this.setState({ output: port_id === this.state.output ? null : port_id });
        }
    };

    midiOn = err => {
        if (err) {
            console.warn("Midi.midiOn: WebMidi could not be enabled.", err);
        } else {
            console.log("Midi.midiOn: WebMidi enabled");
            WebMidi.addListener("connected", this.handleMidiConnectEvent);
            WebMidi.addListener("disconnected", this.handleMidiConnectEvent);

            /*
            if (WebMidi.hasListener("connected", this.handleMidiConnectEvent)) {
                console.log("MidiPorts.componentDidMount: handleMidiConnectEvent already set on 'connected' event");
            } else {
                WebMidi.addListener("connected", this.handleMidiConnectEvent);
            }
            if (WebMidi.hasListener("disconnected", this.handleMidiConnectEvent)) {
                console.log("MidiPorts.componentDidMount: handleMidiConnectEvent already set on 'disconnected' event");
            } else {
                WebMidi.addListener("disconnected", this.handleMidiConnectEvent);
            }
            */
        }
    };

    componentDidMount() {
        console.log(`Midi: component did mount: WebMidi.enabled=${WebMidi.enabled}`);
        if (WebMidi.enabled) {
            console.log(`Midi: component did mount: already enabled, register ports`);
            this.registerInputs();
            this.registerOutputs();
        } else {
            console.log("Midi: component did mount: Calling WebMidi.enable");
            WebMidi.enable(this.midiOn, true);  // true to enable sysex support
        }
    }

    componentWillUnmount() {
        console.log("Midi: component will unmount: unregister ports");
        this.unRegisterInputs();
        this.unRegisterOutputs();
    }

    render() {

        let {inputs, outputs} = this.state;

        if (inputs.length === 0 && outputs.length === 0) {
            return (
                <div className={this.props.className}>
                    {this.props.children}
                </div>
            );
        } else {
            return (
                <div className={this.props.className}>
                    {inputs.map(port => this.props.inputRenderer(port, port.id === this.state.input, this.togglePort))}
                    {outputs.map(port => this.props.outputRenderer(port, port.id === this.state.output, this.togglePort))}
                </div>
            );
        }
    }

}

Midi.propTypes = propTypes;
Midi.defaultProps = defaultProps;
