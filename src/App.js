import React, {Component} from 'react';
import './App.css';
import { HashRouter as Router, Route, Link, Switch } from "react-router-dom";
import Home from "./pages/Home";
import TestSender from "./pages/TestSender";
import Preset from "./pages/Preset";
import Monitor from "./pages/Monitor";
import Footer from "./components/Footer";
import Global from "./pages/Global";
import DumpDecoder from "./pages/DumpDecoder";
// import Chords from "./pages/Chords";
import PresetMidi from "./pages/PresetMidi";


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
        busy: false
    };

    /**
     *
     * @param busy boolean
     */
    onBusy = (busy) => {
        if (busy !== this.state.busy) this.setState({ busy });
    };

    /**
     * Main app render
     * @returns {*}
     */
    render() {
        const { busy } = this.state;

        return (
            <Router>
                <div className="app">

                    <header className="header">
                        {/*<h1>Pacer Editor</h1>*/}
                        <MenuLink activeOnlyWhenExact={true} to="/" label="Home" />
                        <MenuLink to="/preset" label="Preset Controls" />
                        <MenuLink to="/presetmidi" label="Preset Name & MIDI" />
                        <MenuLink to="/global" label="Global config" />
                        {/*<MenuLink to="/chords" label="Chords" />*/}
                        <MenuLink to="/monitor" label="MIDI monitor" />
                        <MenuLink to="/dumpdecoder" label="Dump decoder" />
                        <MenuLink to="/testsender" label="Debug" />
                        <div className="spacer">
                        </div>
                        {busy && <div className="busy">busy</div>}
                        <div className="header-app-name">Pacer editor 0.2.0</div>
                    </header>

                    {/*<div className="wrapper">*/}
                        {/*<div className="content">*/}
                            <Switch>
                                <Route exact={true} path="/" render={
                                    props => (
                                        <Home />
                                    )
                                }/>
                                <Route path="/preset" render={
                                    props => (
                                        <Preset onBusy={this.onBusy} />
                                    )
                                }/>
                                <Route path="/presetmidi" render={
                                    props => (
                                        <PresetMidi onBusy={this.onBusy} />
                                    )
                                }/>
                                <Route path="/global" render={
                                    props => (
                                        <Global onBusy={this.onBusy} />
                                    )
                                }/>
{/*
                                <Route path="/chords" render={
                                    props => (
                                        <Chords onBusy={this.onBusy} />
                                    )
                                }/>
*/}
                                <Route path="/monitor" render={
                                    props => (
                                        <Monitor onBusy={this.onBusy} />
                                    )
                                }/>
                                <Route path="/dumpdecoder" render={
                                    props => (
                                        <DumpDecoder onBusy={this.onBusy} />
                                    )
                                }/>
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
