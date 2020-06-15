import React, {Component, Fragment} from 'react';
import {
    COLORS,
    MSG_CTRL_OFF,
    MSG_SW_NOTE,
    MSG_SW_NOTE_TGGLE, MSG_TYPES_DATA_HELP,
    MSG_TYPES_FULLNAME_SW,
    MSG_TYPES_FULLNAME_SW_SORTED
} from "../pacer/constants";
import * as Note from "tonal-note";
import "./ControlStepsEditor.css";

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
            {
                Object.keys(COLORS).map(
                    key => {
                        return <option key={key} value={key}>{COLORS[key]}</option>
                    })
            }
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

const Step = ({ index, config, updateCallback }) => {

    let inactive = config.msg_type === MSG_CTRL_OFF;

    if (inactive) {
        return (
            <Fragment>
                <div className="step-row-header">Step {index}:</div>
                <div>
                    <select value={config.msg_type} onChange={(event) => updateCallback("msg_type", null, event.target.value)}>
                        {
                            Object.keys(MSG_TYPES_FULLNAME_SW).map(
                                key => {
                                    return <option key={key} value={key}>{MSG_TYPES_FULLNAME_SW[key]}</option>
                                })
                        }
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

    let d0, d1, d2;
    if ((config.msg_type === MSG_SW_NOTE) || (config.msg_type === MSG_SW_NOTE_TGGLE)) {
        d0 = <MidiNote note={config.data[0]} onChange={(value) => updateCallback("data", 0, value)} />;
        d1 = <input type="text" value={config.data[1]} onChange={(event) => updateCallback("data", 1, event.target.value)} />;
        d2 = '';
    } else {
        d0 = <input type="text" value={config.data[0]} onChange={(event) => updateCallback("data", 0, event.target.value)} />;
        d1 = <input type="text" value={config.data[1]} onChange={(event) => updateCallback("data", 1, event.target.value)} />;
        d2 = <input type="text" value={config.data[2]} onChange={(event) => updateCallback("data", 2, event.target.value)} />;
    }

    return (
        <Fragment>
            <div className="step-row-header">Step {index}:</div>
            <div>
                <select value={config.msg_type} onChange={(event) => updateCallback("msg_type", null, event.target.value)}>
                {
                    MSG_TYPES_FULLNAME_SW_SORTED.map(
                        v => {
                            return <option key={v.key} value={v.key}>{v.value}</option>
                        })
                }
                </select>
            </div>
            <div>{d0}<div className="data-help">{MSG_TYPES_DATA_HELP[config.msg_type] ? MSG_TYPES_DATA_HELP[config.msg_type][0] : ''}</div></div>
            <div>{d1}<div className="data-help">{MSG_TYPES_DATA_HELP[config.msg_type] ? MSG_TYPES_DATA_HELP[config.msg_type][1] : ''}</div></div>
            <div>{d2}<div className="data-help">{MSG_TYPES_DATA_HELP[config.msg_type] ? MSG_TYPES_DATA_HELP[config.msg_type][2] : ''}</div></div>
            <div>
                <select value={config.channel} onChange={(event) => updateCallback("channel", null, event.target.value)}>
                    {
                        Array.from(Array(17).keys()).map(i => <option key={i} value={i}>{i === 0 ? 'global' : i}</option>)
                    }
                </select>
            </div>
            <div>
                <LEDColor current_value={config.led_inactive_color} onChange={(value) => updateCallback("led_inactive_color", null, value)} />
            </div>
            <div>
                <LEDColor current_value={config.led_active_color} onChange={(value) => updateCallback("led_active_color", null, value)} />
            </div>
            <div>
                <LEDNum current_value={config.led_num} onChange={(value) => updateCallback("led_num", null, value)} />
            </div>
            <div>
                <LEDMidi current_value={config.led_midi_ctrl} onChange={(value) => updateCallback("led_midi_ctrl", null, value)} />
            </div>
        </Fragment>
    );
};

class ControlStepsEditor extends Component {

    onStepUpdate = (stepIndex, dataType, dataIndex, value) => {
        this.props.onUpdate(stepIndex, dataType, dataIndex, value);    // stepIndex, dataIndex, value
    };

    render() {

        const steps = this.props.steps;

        // console.log("ControlStepsEditor", steps);

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
                {Object.keys(steps).map(i =>
                    <Step key={i} index={i} config={steps[i]} updateCallback={(dataType, dataIndex, value) => this.onStepUpdate(i, dataType, dataIndex, value)} />
                )}
            </div>
        );
    }
}

export default ControlStepsEditor;
