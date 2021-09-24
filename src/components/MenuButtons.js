import React, {Component} from "react";
import {inject, observer} from "mobx-react";
import FACTORY_PRESETS from "../factory-presets.json";
import {mergeDeep, parseSysexDump} from "../pacer/sysex";

/* copied from ActionButtons */

class MenuButtons extends Component {

    constructor(props) {
        super(props);
        this.inputOpenFileRef = React.createRef();
    }

    onInputFile = (e) => {
        this.inputOpenFileRef.current.click()
    };

    onChangeFile = (e) => {
        let file = e.target.files[0];
        // noinspection JSIgnoredPromiseFromCall
        if (file) {
            this.props.state.readFiles([file]);
        }
    };

    loadFactoryDefaults = () => {
        // console.log("FACTORY_PRESETS", typeof FACTORY_PRESETS, FACTORY_PRESETS);
        const data = Uint8Array.from(Object.values(FACTORY_PRESETS));
        // console.log("data", data);
        this.props.state.data = mergeDeep(parseSysexDump(data));
        this.props.state.storeBytes(data);
    }

    clearData = () => {
        this.props.state.clear();
        this.props.state.clearPresetSelection();
    };

/*
    toggleExtControls = e => {
        const extControls = !this.state.extControls;
        this.setState({extControls});
    };
    toggleBase = e => {
        const decBase = !this.state.decBase;
        this.setState({decBase});
    };
*/

    render() {
        // const output = this.props.state.midi.output;
        // const data = this.props.state.data;

        // console.log("connected", this.props.state.connected);

        const canRead = this.props.state.connected;
        const canWrite = this.props.state.connected && this.props.state.changed;

        return (
            <div className="menu-buttons">

                <button className={`action-button read ${canRead ? "" : "disabled"}`}
                        disabled={canRead ? "" : "true"}
                        onClick={() => this.props.state.readFullDump()}
                        title="Read all presets from the Pacer">Read Pacer</button>

                <button className={`action-button update ${canWrite ? "" : "disabled"}`}
                        disabled={canWrite ? "" : "true"}
                        onClick={() => this.props.state.updatePacer()}
                        title="Save the changes in the Pacer">Update Pacer</button>

                <input ref={this.inputOpenFileRef} type="file" style={{display:"none"}} onChange={this.onChangeFile} />
                <button className="action-button" onClick={this.onInputFile}
                        title="Import the presets configuration with a SysEx file">Load sysex file</button>

                <button className="action-button" onClick={this.loadFactoryDefaults}
                        title="Load the Factory Preset">Load Factory</button>

                <button className="action-button" onClick={this.clearData}
                        title="Clear the editor memory">Reset editor</button>

            </div>
        );
    }
}

/*
    <div className="preset-buttons col align-col-bottom">
        <div>Click any preset to load only this preset.</div>
        {data && <button onClick={this.toggleExtControls}>{this.state.extControls ? "Hide external controls" : "Show external controls"}</button>}
        {data && <button onClick={this.toggleBase}>{this.state.decBase ? "Display numbers in hex" : "Display numbers in dec"}</button>}
    </div>
*/

export default inject('state')(observer(MenuButtons));
