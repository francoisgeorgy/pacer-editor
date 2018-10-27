import React, {Component, Fragment} from 'react';
import {CONTROLS_FULLNAME, MSG_SW_NOTE, MSG_TYPES_FULLNAME, presetXYToIndex} from "../pacer";
import * as Note from "tonal-note";
import "./ControlStepsEditor.css";
import {produce} from "immer";
import {mergeDeep, parseSysexDump} from "../utils/sysex";

const MidiNote = ({ note, onChange }) => {
    console.log(`MidiNote ${note}`, typeof note);
    return (
        <select onChange={(event) => onChange(event.target.value)}>
            {
                Array.from(Array(127).keys()).map(
                    i => {
                        let n = Note.fromMidi(i, true);
                        return <option value={i} selected={i === note}>{n}</option>
                    })
            }
        </select>
    );
};

const Step = ({ index, config, updateCallback }) => {

    let d0, d1, d2;
    if (config.msg_type === MSG_SW_NOTE) {
        // d0 = `note ${Note.fromMidi(config.data[0], true)}`;
        d0 = <MidiNote note={config.data[0]} onChange={(value) => updateCallback(0, value)} />;
        d1 = <input type="text" value={config.data[1]} size="4" />;
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

class ControlStepsEditor extends Component {

    // state = {
    //     config: this.props.config
    // };

    onStepUpdate = (stepIndex, dataIndex, value) => {
        console.log(`onStepUpdate`, stepIndex, dataIndex, value);
        //
        // produce(draft => {
        //     draft.config.steps[stepIndex].data[dataIndex] = value;
        //     // this.props.onBusy(false);
        // });
        //
        this.props.onUpdate(this.props.controlId, null);
    };

    render() {

        // const presetIndex = this.props.presetIndex;
        // const controlId = this.props.controlId;

        //config={data["1"]["5"]["controls"][controlId]}

        const steps = this.props.steps;

        console.log("ControlStepsEditor.render", steps);

        // let c = config["1"][presetIndex]["controls"][controlId];
        /*
            <div className="control-editor">
                <h2>{CONTROLS_FULLNAME[controlId]}</h2>
                <div>
                    <h3>setup</h3>
                    <div></div>
                    <h3>steps</h3>
*/

        return (
                    <div className="steps">
                        <div>Type</div>
                        <div>Data 1</div>
                        <div>Data 2</div>
                        <div>Data 3</div>
                        <div>MIDI Channel</div>
                        {Object.keys(steps).map(i =>
                            <Step index={i} config={steps[i]} updateCallback={(dataIndex, value) => this.onStepUpdate(i, dataIndex, value)} />
                        )}
                    </div>

/*
                </div>
            </div>
*/
        );
    }
}

export default ControlStepsEditor;