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
import * as QueryString from "query-string";
import Files from "./pages/Files";

const MenuLink = ({ label, to, activeOnlyWhenExact }) => (
    <Route
        path={to}
        exact={activeOnlyWhenExact}
        children={({ match }) => (
            <div className={match ? "header-link active" : "header-link"}>
                <Link to={to}>{label}</Link>
            </div>
        )}
    />
);

const NoMatch = () =>
    <div className="content home full-width">
        <div className="instructions">
            Invalid URL
        </div>
    </div>;


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

        const q =  QueryString.parse(window.location.search);
        const debug = q.debug ? q.debug === '1' : false;

        console.log("debug", q.debug, debug);

        return (
            <Router>
                <div className="app">

                    <header className="header">
                        <MenuLink activeOnlyWhenExact={true} to="/" label="Home" />
                        <MenuLink to="/preset" label="Preset Controls" />
                        <MenuLink to="/presetmidi" label="Preset Name & MIDI" />
                        <MenuLink to="/global" label="Global config" />
                        <MenuLink to="/files" label="Files" />
                        {/*<MenuLink to="/chords" label="Chords" />*/}
                        <MenuLink to="/monitor" label="MIDI monitor" />
                        <MenuLink to="/dumpdecoder" label="Dump decoder" />
                        {debug && <MenuLink to="/testsender" label="Debug" />}
                        {!busy && <div className="spacer"> </div>}
                        {busy && <div className="busy">please wait...</div>}
                        <div className="header-app-name">Pacer editor 0.4.0</div>
                    </header>

                        <Switch>
                            <Route exact={true} path="/" render={
                                props => (
                                    <Home />
                                )
                            }/>
                            <Route path="/preset" render={
                                props => (
                                    <Preset onBusy={this.onBusy} debug={debug} />
                                )
                            }/>
                            <Route path="/presetmidi" render={
                                props => (
                                    <PresetMidi onBusy={this.onBusy} debug={debug} />
                                )
                            }/>
                            <Route path="/global" render={
                                props => (
                                    <Global onBusy={this.onBusy} debug={debug} />
                                )
                            }/>
{/*
                            <Route path="/chords" render={
                                props => (
                                    <Chords onBusy={this.onBusy} debug={debug} />
                                )
                            }/>
*/}
{/*
                            <Route path="/files" render={
                                props => (
                                    <Files onBusy={this.onBusy} debug={debug} />
                                )
                            }/>
*/}
                            <Route path="/monitor" render={
                                props => (
                                    <Monitor onBusy={this.onBusy} debug={debug} />
                                )
                            }/>
                            <Route path="/dumpdecoder" render={
                                props => (
                                    <DumpDecoder onBusy={this.onBusy} debug={debug} />
                                )
                            }/>
                            {debug &&
                            <Route path="/testsender" render={
                                props => (
                                    <TestSender onBusy={this.onBusy} debug={debug} />
                                )
                            }/>
                            }
                            <Route component={NoMatch} />
                        </Switch>

                    <Footer />

                </div>
            </Router>

        );
    }
}

export default App;
