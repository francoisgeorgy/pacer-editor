import React, {Component, Fragment} from 'react';
import {CONTROLS_FULLNAME, MSG_SW_NOTE, MSG_TYPES_FULLNAME} from "../pacer";
import * as Note from "tonal-note";
import "./ControlEditor.css";

const MidiNote = ({ note, onChange }) => {
    return (
        <select onChange={(event) => onChange(event.target.value)}>
            <option value={22}>C3</option>
            <option value={23}>C#3</option>
            <option value={24}>D3</option>
            <option value={25}>D#3</option>
        </select>
    );
};

const Step = ({ index, config, updateCallback }) => {

    let d0, d1, d2;
    if (config.msg_type === MSG_SW_NOTE) {
        // d0 = `note ${Note.fromMidi(config.data[0], true)}`;
        d0 = <MidiNote note={config.data[0]} onChange={(value) => updateCallback(0, value)} />;
        d1 = `velocity ${config.data[1]}`;
        d2 = '';
    } else {
        d0 = config.data[0];
        d1 = config.data[1];
        d2 = config.data[2];
    }

    return (
        <Fragment>
            <div>{MSG_TYPES_FULLNAME[config.msg_type]}</div>
            <div>{d0}</div>
            <div>{d1}</div>
            <div>{d2}</div>
            <div>{config.channel}</div>
        </Fragment>
    );
};

class ControlEditor extends Component {

    onStepUpdate = (stepIndex, dataIndex, value) => {
        console.log(`onStepUpdate`, stepIndex, dataIndex, value);
    };

    render() {

        const presetIndex = this.props.presetIndex;

        const config = this.props.config;

        console.log(config);

        return (
            <div className="control-editor">
                <h2>{CONTROLS_FULLNAME[presetIndex]}</h2>
                <div>
                    <h3>setup</h3>
                    <div></div>

                    <h3>steps</h3>
                    <div className="steps">
                        <div>Type</div>
                        <div>Data 1</div>
                        <div>Data 2</div>
                        <div>Data 3</div>
                        <div>MIDI Channel</div>
                        {Object.keys(config.steps).map(i =>
                            <Step index={i} config={config.steps[i]} updateCallback={(dataIndex, value) => this.onStepUpdate(i, dataIndex, value)} />
                        )}
                    </div>

                </div>
            </div>
        );
    }
}

export default ControlEditor;