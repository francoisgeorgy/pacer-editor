import React, {Component} from "react";
import "./MidiPorts.css";
import Switch from "react-switch";
import {inputFromId, outputFromId, portFromId} from "../utils/ports";

class MidiPorts extends Component {

    state = {
        input: null,        // MIDI input ID / we support only one connected Pacer at a time
        output: null        // MIDI output ID
    };

    static conInput = (id, onMidiEvent) => {
        const i = inputFromId(id);
        if (i) {
            // i.addListener('sysex', 'all', onMidiEvent);
            i.addListener('noteon', 'all', onMidiEvent);
        } else {
            console.log(`connectInput: input ${id} not found`);
        }
    };

    connectInput = id => {
        const i = inputFromId(id);
        if (i) {
            i.addListener('sysex', 'all', this.props.onMidiEvent);
            // console.log(`connectInput: input ${id} connected`, i);
        } else {
            console.log(`connectInput: input ${id} not found`);
        }
        // console.log('add input to state.connectedInputs');
        // this.setState({connectedInputs: [...this.state.connectedInputs, id]});
    };

    disconnectInput = id => {
        const i = inputFromId(id);
        if (i) {
            i.removeListener();
            // console.log(`disconnectInput: input ${id} disconnected`);
        } else {
            console.log(`disconnectInput: input ${id} not found`);
        }
        // let current = this.state.connectedInputs;
        // current.splice(current.indexOf(id), 1);     // remove id from array
        // console.log('remove input from state.connectedInputs');
        // this.setState({connectedInputs: current});
    };

/*
    connectOutput = id => {
        const i = outputFromId(id);
        if (i) {
            // i.addListener('sysex', 'all', this.handleMidiOutputEvent);
            console.log(`connectOutput: output ${id} connected`, i);
        } else {
            console.log(`connectOutput: output ${id} not found`);
        }
        // console.log('add output to state.connectedOutputs');
        // this.setState({connectedOutputs: [...this.state.connectedOutputs, id]});
    };

    disconnectOutput = id => {
        const i = outputFromId(id);
        if (i) {
            // i.removeListener();
            console.log(`disconnectOutput: output ${id} disconnected`);
        } else {
            console.log(`disconnectOutput: output ${id} not found`);
        }
        // let current = this.state.connectedOutputs;
        // current.splice(current.indexOf(id), 1);     // remove id from array
        // console.log('remove output from state.connectedOutputs');
        // this.setState({connectedOutputs: current});
    };
*/

    togglePort = (port_id) => {
        let p = portFromId(port_id);
        if (p.type === 'input') {
            let prev = this.state.input;
            if (this.state.input) {
                this.disconnectInput(this.state.input);
                this.setState({ input: null });
            }
            if (port_id !== prev) {
                this.connectInput(port_id);
                this.setState({ input: port_id });
            }
        } else {
            // There is nothing to "connect" for an output port since this type of port does not generate any event.
            // if (this.state.output) this.disconnectOutput(this.state.output);
            let prev = this.state.output;
            if (this.state.output) {
                // this.disconnectInput(this.state.input);
                this.props.onPortSelection(null);
                this.setState({output: null});
            }
            if (port_id !== prev) {
                // this.connectInput(port_id);
                this.props.onPortSelection(port_id);
                this.setState({ output: port_id });
            }
        }
    };


    isPacer = (port) => {
        return true;
        // return port.manufacturer.toLowerCase() === 'nektar';
    };

    // isSelected = (port) => {
    //     return this.state.enabledPort === port.id;
    // };

/*
    handleMidiConnectEvent = e => {

        console.log(`MidiPorts.handleMidiConnectEvent: ${e.port.type} ${e.type}: ${e.port.name}`, e);

        if (e.port.type === 'input') {
            console.log(`MidiPorts.handleMidiConnectEvent: ignore MIDI input connect event`);
            return;
        }

        if (e.port.type === 'output') {
            console.log("MidiPorts.handleMidiConnectEvent: call onOutputChange");
            this.onOutputChange();
            this.setState({ output: null });
        }
    };
*/

/*
    WebMidi must be enabled before checking event listeners

    componentDidMount() {
        if (this.props.type === "output") {
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
        }
    }
*/

    /**
     * This is to provide the auto-connect feature
     * @param props
     * @param state
     */
/*
    static getDerivedStateFromProps(props, state) {
        // console.log("MidiPorts.getDerivedStateFromProps", state, props.ports);
        let s = {};
        if (state.input === null) {
            for (let p of props.ports) {
                if (p.type === 'input' && p.manufacturer.toLowerCase() === 'nektar') {  // TODO: check name too
                    console.log(`MidiPorts.getDerivedStateFromProps: auto-connect ${p.name}`);
                    s.input = p.id;
                    if (props.onMidiEvent) MidiPorts.conInput(p.id, props.onMidiEvent);
                    break;
                }
            }
        }
        // if (state.output === null) {
        //     for (let p of props.ports) {
        //         if (p.type === 'output' && p.manufacturer.toLowerCase() === 'nektar') {
        //             s.output = p.id;
        //             break;
        //         }
        //     }
        // }
        return Object.keys(s).length ? s : null;
    }
*/

/*
    componentDidMount() {
        console.log("MidiPorts.componentDidMount", this.state, this.props.ports);
    }
*/

    componentWillUnmount() {
        console.log("MidiPorts.componentWillUnmount", this.state);
        if (this.state.input) {
            this.disconnectInput(this.state.input);
        }
    }

    /**
     * Render a group of midi connections
     * @param props
     * @returns {*}
     * @constructor
     */
    render() {
        console.log("MidiPorts render", this.props.type, this.props.ports);
        // let ports = this.props.type === "input" ? WebMidi.inputs : WebMidi.outputs;
        // if (!ports) return <div id={"ports"}></div>;
        return (
            <div id={"ports"}>
                {this.props.ports.map(
                    port => {
                        // console.log("MidiPorts render port", port);
                        let isSelected = port.type === 'input' ? this.state.input === port.id : this.state.output === port.id;
                        return this.isPacer(port) ? (
                            <div key={port.id} className={isSelected ? `port ${port.type} enabled` : `port ${port.type}`}>
                                <div className={"port-description"}>
                                    <div className="type">{port.type} {port.type === 'input' ? 'from' : 'to'}</div>
                                    <div className="port-name">{port.name}</div>
                                    {/*<div className={port.manufacturer ? "port-manufacturer" : "port-manufacturer unknown"}>{port.manufacturer ? port.manufacturer : "unknown manufacturer"}</div>*/}
                                </div>
                                <div className={"port-state"}>
                                    <Switch
                                        onChange={() => this.togglePort(port.id)}
                                        checked={isSelected}
                                        className="react-switch"
                                        id="normal-switch"
                                        height={20} width={42}
                                    />
                                    <span className={isSelected ? "port-usage selected" : "port-usage"}
                                          onClick={() => this.togglePort(port.id)}>{isSelected ? "enabled" : "disabled"}</span>
                                </div>
                            </div>
                        ) : null;
                    }
                )}
            </div>
        );
    }

}

export default MidiPorts;
