import React, {Component, Fragment} from 'react';
import {inject, observer} from "mobx-react";
import {CONTROLS_DATA} from "../pacer/sysex";
import ControlSelector from "../components/ControlSelector";
import {CONTROLS_FULLNAME, TARGET_PRESET} from "../pacer/constants";
import {setAutoFreeze} from "immer";
import ControlStepsEditor from "../components/ControlStepsEditor";
import Dropzone from "react-dropzone";
import ControlModeEditor from "../components/ControlModeEditor";
import PresetNameEditor from "../components/PresetNameEditor";
import {dropOverlayStyle, isVal} from "../utils/misc";
import {PresetSelectorAndButtons} from "../components/PresetSelectorAndButtons";
import UpdateMessages from "../components/UpdateMessages";
import {presetIndexToXY} from "../pacer/utils";
import "./Preset.css";

//FIXME: fix this:
setAutoFreeze(false);   // needed to be able to update name and copy a preset at the same time. Otherwise immerjs freez the state in updateMessageName() and it is no longer possible to copy a preset.

class Preset extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dropZoneActive: false,
            copyPresetFrom: "-1",
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
            { dropZoneActive: false },
            () => { this.props.state.readFiles(files) }   // returned promise from readFiles() is ignored, this is normal.
        );
    };

    /**
     * dataIndex is only used when dataType == "data"
     */
    updateControlMode = (controlId, value) => {
        this.props.state.setControlMode(parseInt(value, 10))
    };

    copyPresetFrom = (presetIdFrom, presetIdTo) => {
        //FIXME: use immerjs
/*
        const { data, updateMessages } = this.state;

        if (data && data[TARGET_PRESET][presetIdFrom]) {

            if (!data[TARGET_PRESET][presetIdTo]) data[TARGET_PRESET][presetIdTo] = {};
            data[TARGET_PRESET][presetIdTo]["changed"] = true;

            if (!updateMessages.hasOwnProperty(presetIdTo)) updateMessages[presetIdTo] = {};
            if (!updateMessages[presetIdTo].hasOwnProperty(CONTROLS_DATA)) updateMessages[presetIdTo][CONTROLS_DATA] = {};

            //
            // Only copy CONTROLS (for the current version)
            //
            //FIXME: copy EXP and FS config
            CONTROLS_WITH_SEQUENCE.forEach(controlId => {
                // data[TARGET_PRESET][presetIdTo][CONTROLS_DATA][controlId] = Object.assign({}, data[TARGET_PRESET][presetIdFrom][CONTROLS_DATA][controlId]);
                // ugly / deep copy without shallow references:
                data[TARGET_PRESET][presetIdTo][CONTROLS_DATA][controlId] = JSON.parse(JSON.stringify(data[TARGET_PRESET][presetIdFrom][CONTROLS_DATA][controlId]));
                updateMessages[presetIdTo][CONTROLS_DATA][controlId] = getControlUpdateSysexMessages(presetIdTo, controlId, data, true);
            });
            // Object.assign(data[TARGET_PRESET][presetIdTo], data[TARGET_PRESET][presetIdFrom]);

            //we do not copy the name
            //updateMessages[presetIdTo]["name"] = buildPresetNameSysex(presetIdTo, data);

            // CONTROLS_WITH_SEQUENCE.forEach(controlId => updateMessages[presetIdTo][CONTROLS_DATA][controlId] = getControlUpdateSysexMessages(presetIdTo, controlId, data, true));

            this.setState({data, updateMessages, changed: true});
        }
*/
    };

    render() {

        const presetIndex = this.props.state.currentPresetIndex;
        const controlId = this.props.state.currentControl;
        const data = this.props.state.data;

        const showEditor =
            isVal(presetIndex) &&
            data &&
            (TARGET_PRESET in data) &&
            (presetIndex in data[TARGET_PRESET]) &&
            (CONTROLS_DATA in data[TARGET_PRESET][presetIndex]) &&
            (controlId in data[TARGET_PRESET][presetIndex][CONTROLS_DATA]) &&
            ("steps" in data[TARGET_PRESET][presetIndex][CONTROLS_DATA][controlId]) &&
            (Object.keys(data[TARGET_PRESET][presetIndex][CONTROLS_DATA][controlId]["steps"]).length === 6);

        let presetLabel = "";
        if (data &&
            (TARGET_PRESET in data) &&
            (presetIndex in data[TARGET_PRESET]) &&
            ("name" in data[TARGET_PRESET][presetIndex])) {
            presetLabel = presetIndexToXY(presetIndex) + ": " + data[TARGET_PRESET][presetIndex]["name"];
        }

        // const showControls = isVal(presetIndex);

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

                        {data && data[TARGET_PRESET][presetIndex] &&
                        <div className="content-row-content">
                            <h2>Preset {presetLabel}</h2>
                            <PresetNameEditor />
                        </div>}

                        {data && data[TARGET_PRESET][presetIndex] &&
                        <div className="content-row-content">
                            <Fragment>
                                {/*<h2>Controls for preset {presetLabel}</h2>*/}
                                {isVal(presetIndex) && <ControlSelector />}

{/*
                                {data && presetIndex in data[TARGET_PRESET] && Object.keys(data[TARGET_PRESET]).length > 1 &&
                                <Fragment>
                                    (experimental) <button onClick={() => this.copyPresetFrom(this.state.copyPresetFrom, presetIndex)}>copy</button> from preset <select value={this.state.copyPresetFrom} onChange={(event) => this.setState({copyPresetFrom: event.target.value})}>
                                        <option value="">-</option>
                                    {
                                        Object.keys(data[TARGET_PRESET]).map((key, index) => {
                                            if (data[TARGET_PRESET][key]) {
                                                return (<option key={index} value={key}>{presetIndexToXY(key)} {data[TARGET_PRESET][key].name}</option>);
                                            } else {
                                                return null;
                                            }
                                        })
                                    }
                                    </select> <span className="small">(copy the configuration for the footswitches A..D and 1..6 only)</span>
                                </Fragment>
                                }
*/}

                                {showEditor && <h3>{CONTROLS_FULLNAME[controlId]}:</h3>}

                                {showEditor &&
                                <ControlModeEditor
                                    controlId={controlId}
                                    mode={data[TARGET_PRESET][presetIndex][CONTROLS_DATA][controlId]["control_mode"]}
                                    onUpdate={(value) => this.updateControlMode(controlId, value)}/>}

                                {showEditor &&
                                <ControlStepsEditor presetIndex={presetIndex} controlId={controlId} />}

                                {!isVal(presetIndex) && <div className="please">Select a preset.</div>}

                            </Fragment>
                        </div>}

                        {this.props.state.changed && this.props.state.midi.output !== 0 &&         // FIXME: midiConnected(output) &&
                        <div className="content-row-content">
                            {/*<h2>Send the updated config to the Pacer</h2>*/}
                            <div className="actions">
                                <button className="update" onClick={() => this.props.state.updatePacer()}>Update Pacer</button>
                            </div>
                        </div>}

                        {/* this.props.debug && this.props.state.changed &&
                        <div className="content-row-content">
                            <div className="debug">
                                <h4>[Debug] Update messages to send:</h4>
                                <div className="dump code">
                                </div>
                            </div>
                        </div> */}

                        <div className="content-row-content">
                            <UpdateMessages/>
                        </div>

                    </div>

                </div>

            </Dropzone>

        );
    }

}

export default inject('state')(observer(Preset));
