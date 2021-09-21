import React, {Component} from "react";
import {inject, observer} from "mobx-react";

class ActionButtons extends Component {

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
        const data = this.props.state.data;

        // console.log("connected", this.props.state.connected);

        const canRead = this.props.state.connected;
        const canWrite = this.props.state.connected && this.props.state.changed;

        return (
            <div className="preset-buttons">

                {canRead &&
                <button className="action-button read"
                       onClick={() => this.props.state.readFullDump()}
                       title="Read all presets from Pacer">Read Pacer</button>}
                {!canRead && <div></div>}

                {canWrite && <button className="action-button update" onClick={() => this.props.state.updatePacer()}>Update Pacer</button>}
                {!canWrite && <div></div>}

                <input ref={this.inputOpenFileRef} type="file" style={{display:"none"}} onChange={this.onChangeFile} />
                <button className="action-button" onClick={this.onInputFile}>Load sysex file</button>

                <div>{/* empty grid cell */}</div>

                {data && <button className="action-button" onClick={this.clearData}>CLEAR ALL</button>}
                {!data && <div>{/* empty grid cell */}</div>}

                <div>
                </div>
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

export default inject('state')(observer(ActionButtons));
