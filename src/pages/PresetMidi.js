import React, {Component} from 'react';
import Dropzone from "react-dropzone";
import {TARGET_PRESET} from "../pacer/constants";
import MidiSettingsEditor from "../components/MidiSettingsEditor";
import {dropOverlayStyle} from "../utils/misc";
import UpdateMessages from "../components/UpdateMessages";
import {inject, observer} from "mobx-react";
import {PresetSelectorAndButtons} from "../components/PresetSelectorAndButtons";
import "./Preset.css";

class PresetMidi extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dropZoneActive: false
        };
    }

    onDragEnter = () => {
        this.setState({
            dropZoneActive: true
        });
    };

    onDragLeave= () => {
        this.setState({
            dropZoneActive: false
        });
    };

    /**
     * Drop Zone handler
     * @param files
     */
    onDrop = (files) => {
        // this.props.state.clear();
        this.props.state.changed = true;
        this.setState(
            {dropZoneActive: false},
            () => { this.props.state.readFiles(files) }   // returned promise from readFiles() is ignored, this is normal.
        );
    };

    render() {

        const presetIndex = this.props.state.currentPresetIndex;
        const data = this.props.state.data;

        let showEditor = false;
        if (this.props.state.data) {
            showEditor = (TARGET_PRESET in data) &&
                         (presetIndex in data[TARGET_PRESET]) &&
                         ("midi" in data[TARGET_PRESET][presetIndex]) &&
                         (Object.keys(data[TARGET_PRESET][presetIndex]["midi"]).length === 16)
        }

        return (

            <Dropzone
                disableClick
                style={{position: "relative"}}
                onDrop={this.onDrop}
                onDragEnter={this.onDragEnter}
                onDragLeave={this.onDragLeave}>

                {this.state.dropZoneActive &&
                <div style={dropOverlayStyle}>
                    Drop sysex file...
                </div>}

                <div className="wrapper">
                    <div className="content">

                        <PresetSelectorAndButtons />

                        {showEditor &&
                        <div className="content-row-content">
                            <h2>Preset MIDI settings</h2>
                            <MidiSettingsEditor />
                        </div>}

                        {this.props.state.changed && this.props.state.midi.output !== 0 &&         // FIXME: midiConnected(output) &&
                        <div className="content-row-content">
                            <h2>Send the updated config to the Pacer</h2>
                            <div className="actions">
                                <button className="update" onClick={() => this.props.state.updatePacer()}>Update Pacer</button>
                            </div>
                        </div>}

                        <div className="content-row-content">
                            <UpdateMessages/>
                        </div>

                    </div>

                </div>

            </Dropzone>

        );
    }

}

export default inject('state')(observer(PresetMidi));
