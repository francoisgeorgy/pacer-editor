import React, {Component} from 'react';
import {Provider} from "mobx-react";
import {state as globalState} from "./stores/StateStore";
import { HashRouter as Router, Route, Link, Switch } from "react-router-dom";
import Home from "./pages/Home";
import Debug from "./pages/Debug";
import Preset from "./pages/Preset";
import Monitor from "./pages/Monitor";
import Footer from "./components/Footer";
import DumpDecoder from "./pages/DumpDecoder";
import PresetMidi from "./pages/PresetMidi";
import Overview from "./pages/Overview";
import Midi from "./components/Midi";
import {ANY_MIDI_PORT, PACER_MIDI_PORT_NAME} from "./pacer/constants";
import BusyIndicator from "./components/BusyIndicator";
import * as QueryString from "query-string";
import Patch from "./pages/Patch";
import './App.css';

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
    <div className="content home">
        <div className="error">
            Invalid URL
        </div>
    </div>;


class App extends Component {

    render() {

        const q =  QueryString.parse(window.location.search);
        const debug = q.debug ? q.debug === '1' : false;

        return (
            <Provider state={globalState}>
                <Router>
                    <div className="app">

                        <header className="header">
                            <MenuLink activeOnlyWhenExact={true} to="/" label="Overview" />
                            <MenuLink to="/preset"          label="Preset Controls" />
                            <MenuLink to="/presetmidi"      label="Preset MIDI" />
                            {/*<MenuLink to="/global"          label="Global" />*/}
                            <MenuLink to="/patch"           label="Import/Export" />
                            <MenuLink to="/monitor"         label="Monitor" />
                            {debug && <MenuLink to="/dumpdecoder" label="Dump decoder" />}
                            {debug && <MenuLink to="/debug" label="Debug" />}
                            <MenuLink to="/help"            label="Help" />
                            <div className="spacer"> </div>
                            <div className="header-app-name">
                                Pacer editor {process.env.REACT_APP_VERSION} by <a href="https://studiocode.dev/" target="_blank" rel="noopener noreferrer">StudioCode.dev</a>
                            </div>
                        </header>

                        <div className="subheader row">
                            <Midi only={ANY_MIDI_PORT} autoConnect={PACER_MIDI_PORT_NAME} />
                            <BusyIndicator />
                        </div>

                        <div className="main-content-wrapper">
                        <Switch>
                            <Route exact={true} path="/" render={props => <Overview debug={debug}/>} />
                            <Route path="/preset"        render={props => <Preset debug={debug}/>} />
                            <Route path="/presetmidi"    render={props => <PresetMidi debug={debug} />} />
                            {/*<Route path="/global"        render={props => <Global debug={debug} />} />*/}
                            <Route path="/patch"         render={props => <Patch debug={debug} />} />
                            <Route path="/monitor"       render={props => <Monitor debug={debug}/>} />
                            {debug && <Route path="/dumpdecoder" render={props => <DumpDecoder debug={debug}/>} />}
                            {debug && <Route path="/debug"       render={props => <Debug debug={debug} />} />}
                            <Route exact={true} path="/help"     render={props => <Home />} />
                            <Route component={NoMatch} />
                        </Switch>

                        {/*<Instructions />*/}

                        {/*<Debug />*/}

                        </div>

                        <Footer />

                    </div>
                </Router>
            </Provider>
        );
    }
}

export default App;
