import React, {Component, Fragment} from 'react';
import {MSG_SW_NOTE, MSG_TYPES_FULLNAME} from "../pacer";
import * as Note from "tonal-note";
import "./ControlStepsEditor.css";


const MidiNote = ({ note, onChange }) => {
    console.log(`MidiNote ${note}`, typeof note);
    return (
        <select onChange={(event) => onChange(event.target.value)} defaultValue={note}>
            {
                Array.from(Array(127).keys()).map(
                    i => {
                        let n = Note.fromMidi(i, true);
                        return <option key={i} value={i}>{n}</option>
                    })
            }
        </select>
    );
};

const Step = ({ index, config, updateCallback }) => {

    let d0, d1, d2;
    if (config.msg_type === MSG_SW_NOTE) {
        // d0 = `note ${Note.fromMidi(config.data[0], true)}`;
        d0 = <MidiNote note={config.data[0]} onChange={(value) => updateCallback("data", 0, value)} />;
        d1 = <input type="text" value={config.data[1]} size="4" onChange={(event) => updateCallback("data", 1, event.target.value)} />;
        d2 = '';
    } else {
        d0 = <input type="text" value={config.data[0]} size="4" onChange={(event) => updateCallback("data", 0, event.target.value)} />;
        d1 = <input type="text" value={config.data[1]} size="4" onChange={(event) => updateCallback("data", 1, event.target.value)} />;
        d2 = <input type="text" value={config.data[2]} size="4" onChange={(event) => updateCallback("data", 2, event.target.value)} />;
    }

    return (
        <Fragment>
            <div>step {index}:</div>
            <div>
                <select onChange={(event) => updateCallback("msg_type", null, event.target.value)} defaultValue={config.msg_type}>
                {
                    Object.keys(MSG_TYPES_FULLNAME).map(
                        key => {
                            // let n = Note.fromMidi(i, true);
                            return <option key={key} value={key}>{MSG_TYPES_FULLNAME[key]}</option>
                        })
                }
                </select>
            </div>
            <div>{d0}</div>
            <div>{d1}</div>
            <div>{d2}</div>
            <div>
                <select onChange={(event) => updateCallback("channel", null, event.target.value)} defaultValue={config.channel}>
                {
                    Array.from(Array(16).keys()).map(i => <option key={i} value={i}>{i}</option>)
                }
                </select>
            </div>
        </Fragment>
    );
};

class ControlStepsEditor extends Component {

    // state = {
    //     config: this.props.config
    // };

    onStepUpdate = (stepIndex, dataType, dataIndex, value) => {
        console.log(`ControlStepsEditor.onStepUpdate`, stepIndex, dataIndex, value);
        //
        // produce(draft => {
        //     draft.config.steps[stepIndex].data[dataIndex] = value;
        //     // this.props.onBusy(false);
        // });
        //
        this.props.onUpdate(stepIndex, dataType, dataIndex, value);    // stepIndex, dataIndex, value
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
                        <div></div>
                        <div>Type</div>
                        <div>Data 1</div>
                        <div>Data 2</div>
                        <div>Data 3</div>
                        <div>MIDI Channel</div>
                        {Object.keys(steps).map(i =>
                            <Step key={i} index={i} config={steps[i]} updateCallback={(dataType, dataIndex, value) => this.onStepUpdate(i, dataType, dataIndex, value)} />
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