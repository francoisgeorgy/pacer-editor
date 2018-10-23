import React, {Component} from 'react';
import * as WebMidi from "webmidi";
import './App.css';
import Midi from "./components/Midi";
// import MidiPorts from "./components/MidiPorts";
// import { isSysexData } from "./utils/sysex";
import { HashRouter as Router, Route, Link, Switch } from "react-router-dom";
import Home from "./components/Home";
import Dumper from "./components/Dumper";
import TestSender from "./components/TestSender";


class App extends Component {

    state = {
        inputs: [],         // array of MIDI inputs (copied from WebMidi object)
        outputs: [],        // array of MIDI outputs (copied from WebMidi object)
        // data: null,
        busy: false
    };

    /**
     * MIDI output port handler
     */
    onInputChange = () => {
        this.setState({ inputs: WebMidi.inputs });
    };

    /**
     * MIDI output port handler
     */
    onOutputChange = () => {
        this.setState({ outputs: WebMidi.outputs });
    };

    /**
     *
     * @param busy boolean
     */
    onBusy = (busy) => {
        this.setState({ busy });
    };

    /**
     * Main app render
     * @returns {*}
     */
    render() {
        const { inputs, outputs, busy } = this.state;

        return (
            <Router>
                <div className="app">

                    <Midi onInputChange={this.onInputChange} onOutputChange={this.onOutputChange} />

                    <header className="header">
                        <h1>Nektar Pacer Editor</h1>
                        <Link className="header-link" to="/">Home</Link>
                        <Link className="header-link" to="/dumper">Dumper</Link>
                        <Link className="header-link" to="/testsender">TestSender</Link>
                        <div className="spacer"></div>
                        {busy && <div className="busy">busy</div>}
                    </header>

                    <Switch>
                        <Route exact={true} path="/" render={
                            props => (
                                <Home inputPorts={inputs} outputPorts={outputs} onBusy={this.onBusy} />
                            )
                        }/>
                        <Route path="/dumper" render={
                            props => (
                                <Dumper inputPorts={inputs} onBusy={this.onBusy} />
                            )
                        }/>
                        <Route path="/testsender" render={
                            props => (
                                <TestSender inputPorts={inputs} outputPorts={outputs} onBusy={this.onBusy} />
                            )
                        }/>
                    </Switch>

                </div>

            </Router>
        );
    }
}

export default App;
