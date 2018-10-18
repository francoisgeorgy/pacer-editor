import {Component} from 'react';
import * as WebMidi from "webmidi";

/**
 *
 * @param props
 * @constructor
 */
class Midi extends Component {

    constructor(props) {
        super(props);
        this.onOutputChange = props.onOutputChange;
    }

    handleMidiEvent = e => {

        console.log(`handleMidiEvent: ${e.port.type} ${e.type}: ${e.port.name}`, e);

        // is disconnect event, remove the existing input listeners
        /*
        if (e.type === "disconnected") {
            // console.log(`must disconnect ${e.port} ${e.port.id}`);
            this.disconnectInput(e.port.id);
        }
        */

        if (e.port.type === 'input') {
            console.log(`ignore MIDI input`);
            return;
        }

        if (e.port.type === 'output') {
            console.log("call onOutputChange");
            this.onOutputChange();
        }

        // Note: if we don't display the events, than the UI will not be updated if we don't update the state.
        //       In that case we should call forceUpdate().
        //       More info in README.md.

        // We store all the events in order to display them.
        // In a real app, only store the last event per port and type.
        // console.log('add event to state.events');
        // this.setState({ events: [...this.state.events, e]})

        // this.handleMidiState();
    };
/*
    connectInput = id => {
        // const i = inputById(id);
        // if (i) {
        //     i.addListener('noteon', 'all', this.handleMidiInputEvent);
        //     console.log(`connectInput: input ${id} connected`);
        // } else {
        //     console.log(`connectInput: input ${id} not found`);
        // }
        console.log('add input to state.connectedInputs');
        // this.setState({connectedInputs: [...this.state.connectedInputs, id]});
    };
*/
/*
    disconnectInput = id => {
        // const i = inputById(id);
        // if (i) {
        //     i.removeListener();
        //     console.log(`disconnectInput: input ${id} disconnected`);
        // } else {
        //     console.log(`disconnectInput: input ${id} not found`);
        // }

        // let current = this.state.connectedInputs;
        // current.splice(current.indexOf(id), 1);     // remove id from array
        // console.log('remove input from state.connectedInputs');
        // this.setState({connectedInputs: current});
    };
*/
    midiOn = err => {
        if (err) {
            console.warn("WebMidi could not be enabled.", err);
        } else {
            console.log("WebMidi enabled!");
            WebMidi.addListener("connected", this.handleMidiEvent);
            WebMidi.addListener("disconnected", this.handleMidiEvent);
        }
    };

    componentDidMount() {
        WebMidi.enable(this.midiOn, true);  // true to enable sysex support
    }

    render() {
        return null;
    }

}

export default Midi;

