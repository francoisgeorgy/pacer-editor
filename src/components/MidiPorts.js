import React, {Component} from "react";
import "./MidiPorts.css";
import Switch from "react-switch";
import {inputFromId, outputFromId, portFromId} from "../utils/ports";

class MidiPorts extends Component {

    state = {
        input: null,        // MIDI input ID / we support only one connected Pacer at a time
        output: null        // MIDI output ID
    };

    connectInput = id => {
        const i = inputFromId(id);
        if (i) {
            // i.addListener('sysex', 'all', this.props.onMidiEvent);
            i.addListener('noteon', 'all', this.props.onMidiEvent);
            console.log(`connectInput: input ${id} connected`, i);
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
            console.log(`disconnectInput: input ${id} disconnected`);
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
            if (this.state.input) {
                this.disconnectInput(this.state.input);
                this.setState({ input: null });
            } else {
                this.connectInput(port_id);
                this.setState({ input: port_id });
            }
        } else {
            // There is nothing to "connect" for an output port since this type of port does not generate any event.
            // if (this.state.output) this.disconnectOutput(this.state.output);
            if (this.state.output) {
                // this.disconnectInput(this.state.input);
                this.props.onPortSelection(null);
                this.setState({ output: null });
            } else {
                // this.connectInput(port_id);
                this.props.onPortSelection(port_id);
                this.setState({ output: port_id });
            }
        }
    };

    /**
     *
     * @param port_id
     */
/*
    toggleOutputPort = (port_id) => {
        if (this.state.output) this.disconnectOutput(this.state.output);
        this.connectOutput(port_id);
        this.setState({ output: port_id });
        // let p = portFromId(port_id);
        // let outs = this.state.outputs;
        // if (outs.hasOwnProperty(p.id)) {
        //     delete outs[p.id];
        // } else {
        //     outs[p.id] = {
        //         manufacturer: p.manufacturer,
        //         name: p.name
        //     };
        // }
        // this.setState({ outputs: outs });
    };
*/

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


    componentDidMount() {
        console.warn("MidiPorts.componentDidMount", this.state);
    }

    componentWillUnmount() {
        console.warn("MidiPorts.componentWillUnmount", this.state);
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
                        console.log("MidiPorts render port", port);
                        let isSelected = port.type === 'input' ? this.state.input === port.id : this.state.output === port.id;
                        return this.isPacer(port) ? (
                            <div key={port.id} className={isSelected ? "port enabled" : "port"}>
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
