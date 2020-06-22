import React, {Component, Fragment} from 'react';
import {
    COLORS,
    MSG_CTRL_OFF,
    MSG_TYPES_DATA_HELP,
    MSG_TYPES_FULLNAME, TARGET_PRESET
} from "../pacer/constants";
import "./ControlStepsEditor.css";
import {getAvailableMessageTypes} from "../pacer/model";
import {DataInputField} from "./DataInputField";
import {inject, observer} from "mobx-react";
import {CONTROLS_DATA} from "../pacer/sysex";
import {state} from "../stores/StateStore";

const LEDMidi = ({ current_value, onChange }) => {
    return (
        <select value={current_value} onChange={(event) => onChange(event.target.value)}>
            <option value="0">0</option>
            <option value="1">1</option>
        </select>
    );
};

const LEDColor = ({ current_value, onChange }) => {
    return (
        <select value={current_value} onChange={(event) => onChange(event.target.value)}>
            {Object.keys(COLORS).map(colorIndex => <option key={colorIndex} value={colorIndex}>{COLORS[colorIndex]}</option>)}
        </select>
    );
};

const LEDNum = ({ current_value, onChange }) => {
    return (
        <select value={current_value} onChange={(event) => onChange(event.target.value)}>
            <option value="0">default</option>
            <option value="3">top</option>
            <option value="2">middle</option>
            <option value="1">bottom</option>
        </select>
    );
};

/*
const MidiNote = ({ note, onChange }) => {
    return (
        <select value={note} onChange={(event) => onChange(event.target.value)} className="notes">
            {
                Array.from(Array(127).keys()).map(
                    i => {
                        let n = Note.fromMidi(i, true);
                        return <option key={i} value={i}>{n} ({i})</option>
                    })
            }
        </select>
    );
};
*/

const Step = observer(({ presetIndex, controlId, stepIndex, config }) => {

    // console.log(presetIndex, controlId, stepIndex, typeof presetIndex, typeof controlId, typeof stepIndex, JSON.stringify(config));

    const updateData = (dataIndex, value) => {
        state.updateControlStep(controlId, stepIndex, "data", dataIndex, value, presetIndex);
    }
    const updateChannel = (value) => {
        state.updateControlStep(controlId, stepIndex, "channel", null, value, presetIndex);
    }
    const updateLED = (led, value) => {
        state.updateControlStep(controlId, stepIndex, led, null, value, presetIndex);
    }

    let inactive = config.msg_type === MSG_CTRL_OFF;

    // console.log("config.msg_type", config.msg_type, inactive, getAvailableMessageTypes(controlId));

    if (inactive) {
        return (
            <Fragment>
                <div className="step-row-header">Step {stepIndex}:</div>
                <div>
                    <select value={config.msg_type} onChange={(event) => state.updateControlStepMessageType(controlId, stepIndex, event.target.value, presetIndex)}>
                        {getAvailableMessageTypes(controlId).map(mtype => <option key={mtype} value={mtype}>{MSG_TYPES_FULLNAME[mtype]}</option>)}
                    </select>
                </div>
                <div>
                </div>
                <div>
                </div>
                <div>
                </div>
                <div>
                </div>
                <div>
                </div>
                <div>
                </div>
                <div>
                </div>
                <div>
                </div>
            </Fragment>
        );
    }

    if (!config.data) return null;

    let d0, d1, d2;
    d0 = <DataInputField msgType={config.msg_type} value={config.data[0]} dataIndex={0} onChange={updateData} />;
    d1 = <DataInputField msgType={config.msg_type} value={config.data[1]} dataIndex={1} onChange={updateData} />;
    d2 = <DataInputField msgType={config.msg_type} value={config.data[2]} dataIndex={2} onChange={updateData} />;

    // console.log("config.msg_type", config.msg_type, typeof config.msg_type);

    return (
        <Fragment>
            <div className="step-row-header">Step {stepIndex}:</div>
            <div>
                <select value={config.msg_type} onChange={(event) => state.updateControlStepMessageType(controlId, stepIndex, event.target.value, presetIndex)}>
                    {getAvailableMessageTypes(controlId).map(mtype => <option key={mtype} value={mtype}>{MSG_TYPES_FULLNAME[mtype]}</option>)}
                </select>
            </div>
            <div>{d0}<div className="data-help">{MSG_TYPES_DATA_HELP[config.msg_type] ? MSG_TYPES_DATA_HELP[config.msg_type][0] : ''}</div></div>
            <div>{d1}<div className="data-help">{MSG_TYPES_DATA_HELP[config.msg_type] ? MSG_TYPES_DATA_HELP[config.msg_type][1] : ''}</div></div>
            <div>{d2}<div className="data-help">{MSG_TYPES_DATA_HELP[config.msg_type] ? MSG_TYPES_DATA_HELP[config.msg_type][2] : ''}</div></div>
            <div>
                <select value={config.channel} onChange={(event) => updateChannel(event.target.value)}>
                    {Array.from(Array(17).keys()).map(i => <option key={i} value={i}>{i === 0 ? 'global' : i}</option>)}
                </select>
            </div>
            <div>
                <LEDColor current_value={config.led_inactive_color} onChange={(value) => updateLED("led_inactive_color", value)} />
            </div>
            <div>
                <LEDColor current_value={config.led_active_color} onChange={(value) => updateLED("led_active_color", value)} />
            </div>
            <div>
                <LEDNum current_value={config.led_num} onChange={(value) => updateLED("led_num", value)} />
            </div>
            <div>
                <LEDMidi current_value={config.led_midi_ctrl} onChange={(value) => updateLED("led_midi_ctrl", value)} />
            </div>
        </Fragment>
    );
});

class ControlStepsEditor extends Component {

    render() {

        const steps = this.props.state.data[TARGET_PRESET][this.props.presetIndex][CONTROLS_DATA][this.props.controlId]["steps"];

        // console.log(JSON.stringify(steps), Object.keys(steps));

        //FIXME: do not display LED for EXP and FS

        return (
            <div className="steps">
                <div></div>
                <div className="step-col-header">Type</div>
                <div className="step-col-header">Data 1</div>
                <div className="step-col-header">Data 2</div>
                <div className="step-col-header">Data 3</div>
                <div className="step-col-header">MIDI Ch.</div>
                <div className="step-col-header">LED Off</div>
                <div className="step-col-header">LED On</div>
                <div className="step-col-header">LED Num</div>
                <div className="step-col-header">LED MIDI</div>
                {Object.keys(steps).map(stepIndex =>
                    <Step key={stepIndex} presetIndex={this.props.presetIndex} controlId={this.props.controlId} stepIndex={stepIndex} config={steps[stepIndex]} />
                )}
            </div>
        );
    }
}

export default inject('state')(observer(ControlStepsEditor));
