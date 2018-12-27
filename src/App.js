import React, {Component} from 'react';
import './App.css';
import { HashRouter as Router, Route, Link, Switch } from "react-router-dom";
import Home from "./pages/Home";
import Debug from "./pages/Debug";
import Preset from "./pages/Preset";
import Monitor from "./pages/Monitor";
import Footer from "./components/Footer";
import Global from "./pages/Global";
import DumpDecoder from "./pages/DumpDecoder";
import PresetMidi from "./pages/PresetMidi";
import * as QueryString from "query-string";
import Patch from "./pages/Patch";
import {produce} from "immer";
import Overview from "./pages/Overview";

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

    state = {
        busy: false,
        busyMessage: "please wait",
        bytesExpected: -1,
        progress: -1    // 0..100
    };

    /**
     *
     * @param busy
     * @param busyMessage
     * @param bytesExpected
     * @param bytesReceived
     */
    onBusy = ({busy = false, busyMessage = null, bytesExpected = -1, bytesReceived = -1} = {}) => {
        // console.log("app.onBusy", busy, busyMessage, bytesExpected, bytesReceived);

        let show = busy !== this.state.busy;
        show = show || (busyMessage !== null && busyMessage !== this.state.busyMessage);
        show = show || (bytesExpected > 0 && bytesExpected !== this.state.bytesExpected);

        let progress = -1;
        if (this.state.bytesExpected > 0 && bytesReceived > 0) {
            progress = Math.round(bytesReceived / this.state.bytesExpected * 100 / 5) * 5;
            show = show || ((progress >= 0) && (progress !== this.state.progress));
        }

        if (show) {
            this.setState(
                produce(draft => {
                    if (draft.busy !== busy) draft.busy = busy;
                    if (busyMessage !== null) draft.busyMessage = busyMessage;
                    if (bytesExpected > 0 && bytesExpected !== draft.bytesExpected) draft.bytesExpected = bytesExpected;
                    if (busy === false) {
                        draft.bytesExpected = -1;
                        progress = -1;
                    } else {
                        if (bytesExpected > 0) draft.bytesExpected = bytesExpected;
                        if (draft.progress !== progress) {
                            draft.progress = progress;
                        }
                    }
                    // let m = { type, message };
                    // let len = draft.statusMessages.push(m);
                    // if (len > MAX_STATUS_MESSAGES) draft.statusMessages.shift();
                })
            );
        }
    };

    /**
     * Main app render
     * @returns {*}
     */
    render() {
        const { busy, busyMessage, progress } = this.state;

        const q =  QueryString.parse(window.location.search);
        const debug = q.debug ? q.debug === '1' : false;

        return (
            <Router>
                <div className="app">

                    {busy && <div className="busy">{busyMessage}{progress >= 0 && <div>{progress} %</div>}</div>}

                    <header className="header">
                        <MenuLink activeOnlyWhenExact={true} to="/" label="Home" />
                        <MenuLink to="/overview" label="Overview" />
                        <MenuLink to="/preset" label="Controls" />
                        <MenuLink to="/presetmidi" label="MIDI" />
                        <MenuLink to="/global" label="Global" />
                        <MenuLink to="/patch" label="Patch" />
                        {/*<MenuLink to="/files" label="Files" />*/}
                        <MenuLink to="/monitor" label="Monitor" />
                        {debug && <MenuLink to="/dumpdecoder" label="Dump decoder" />}
                        {debug && <MenuLink to="/debug" label="Debug" />}
                        <div className="spacer"> </div>
                        <div className="header-app-name">Pacer editor 0.8.1</div>
                    </header>

                        <Switch>
                            <Route exact={true} path="/" render={
                                props => (
                                    <Home />
                                )
                            }/>
                            <Route path="/overview" render={
                                props => (
                                    <Overview onBusy={this.onBusy} debug={debug} />
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
                            <Route path="/patch" render={
                                props => (
                                    <Patch onBusy={this.onBusy} debug={debug} />
                                )
                            }/>
                            {/*<Route path="/files" render={*/}
                                {/*props => (*/}
                                    {/*<Files onBusy={this.onBusy} debug={debug} />*/}
                                {/*)*/}
                            {/*}/>*/}
                            <Route path="/monitor" render={
                                props => (
                                    <Monitor onBusy={this.onBusy} debug={debug} />
                                )
                            }/>
                            {debug &&
                            <Route path="/dumpdecoder" render={
                                props => (
                                    <DumpDecoder onBusy={this.onBusy} debug={debug}/>
                                )
                            }/>
                            }
                            {debug &&
                            <Route path="/debug" render={
                                props => (
                                    <Debug onBusy={this.onBusy} debug={debug} />
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
