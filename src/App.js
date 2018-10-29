import React, {Component} from 'react';
// import * as WebMidi from "webmidi";
import './App.css';
// import Midi from "./components/Midi";
import { HashRouter as Router, Route, Link, Switch } from "react-router-dom";
import Home from "./pages/Home";
import DumpDecoder from "./pages/DumpDecoder";
import TestSender from "./pages/TestSender";
import Global from "./pages/Global";
import Presets from "./pages/Presets";
import Monitor from "./pages/Monitor";
import Footer from "./components/Footer";


const MenuLink = ({ label, to, activeOnlyWhenExact }) => (
    <Route
        path={to}
        exact={activeOnlyWhenExact}
        children={({ match }) => (
            <span className={match ? "header-link active" : "header-link"}>
                <Link to={to}>{label}</Link>
            </span>
        )}
    />
);


class App extends Component {

    state = {
        // inputs: [],         // array of MIDI inputs (copied from WebMidi object)
        // outputs: [],        // array of MIDI outputs (copied from WebMidi object)
        // data: null,
        busy: false
    };

    /**
     * MIDI output port handler
     */
    // onInputChange = () => {
    //     this.setState({ inputs: WebMidi.inputs });
    // };

    /**
     * MIDI output port handler
     */
    // onOutputChange = () => {
    //     this.setState({ outputs: WebMidi.outputs });
    // };

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

                    {/*<Midi onInputChange={this.onInputChange} onOutputChange={this.onOutputChange} />*/}

                    <header className="header">
                        {/*<h1>Pacer Editor</h1>*/}
                        <MenuLink activeOnlyWhenExact={true} to="/" label="Home" />
                        <MenuLink to="/presets" label="Presets" />
                        <MenuLink to="/global" label="Global config" />
                        <MenuLink to="/monitor" label="MIDI monitor" />
                        <MenuLink to="/dumpdecoder" label="Dump decoder" />
                        <MenuLink to="/testsender" label="Debug message" />
                        <div className="spacer">
                        </div>
                        {busy && <div className="busy">busy</div>}
                    </header>

                    {/*<div className="wrapper">*/}
                        {/*<div className="content">*/}
                            <Switch>
                                <Route exact={true} path="/" render={
                                    props => (
                                        <Home />
                                    )
                                }/>
                                <Route path="/presets" render={
                                    props => (
                                        <Presets onBusy={this.onBusy} />
                                    )
                                }/>
{/*
                                <Route path="/global" render={
                                    props => (
                                        <Global inputPorts={inputs} outputPorts={outputs} onBusy={this.onBusy} />
                                    )
                                }/>
*/}
                                <Route path="/monitor" render={
                                    props => (
                                        <Monitor inputPorts={inputs} onBusy={this.onBusy} />
                                    )
                                }/>
{/*
                                <Route path="/dumpdecoder" render={
                                    props => (
                                        <DumpDecoder inputPorts={inputs} onBusy={this.onBusy} />
                                    )
                                }/>
*/}
                                <Route path="/testsender" render={
                                    props => (
                                        <TestSender onBusy={this.onBusy} />
                                    )
                                }/>
                            </Switch>
                        {/*</div>*/}
                    {/*</div>*/}

                    <Footer />

                </div>
            </Router>
        );
    }
}

export default App;
