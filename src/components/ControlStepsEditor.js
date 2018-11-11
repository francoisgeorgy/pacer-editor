import React, {Component, Fragment} from 'react';
import {
    COLORS,
    MSG_CTRL_OFF,
    MSG_SW_NOTE,
    MSG_SW_NOTE_TGGLE, MSG_TYPES_DATA_HELP,
    MSG_TYPES_FULLNAME_SW,
    MSG_TYPES_FULLNAME_SW_SORTED
} from "../pacer";
import * as Note from "tonal-note";
import "./ControlStepsEditor.css";

const LEDMidi = ({ current_value, onChange }) => {
    return (
        <select defaultValue={current_value} onChange={(event) => onChange(event.target.value)}>
            <option value="0">0</option>
            <option value="1">1</option>
        </select>
    );
};

const LEDColor = ({ current_value, onChange }) => {
    console.log("LEDColor", current_value, typeof current_value);
    // let v = (typeof current_value === 'number') ? current_value.toString() : null;
    let v = current_value ? 3 : null;
    // let v = current_value;
    return (
        <select defaultValue={v} onChange={(event) => onChange(event.target.value)}>
            {
                Object.keys(COLORS).map(
                    key => {
                        // let n = Note.fromMidi(i, true);
                        // console.log("LEDColor v key", v, key, typeof v, typeof key);
                        return <option key={key} value={key}>{COLORS[key]}</option>
                    })
            }
        </select>
    );
};

const LEDNum = ({ current_value, onChange }) => {
    return (
        <select defaultValue={current_value} onChange={(event) => onChange(event.target.value)}>
            <option value="0">default</option>
            <option value="1">bottom</option>
            <option value="2">middle</option>
            <option value="3">top</option>
        </select>
    );
};

/*
const LED = ({ config, onChange }) => {
    if ((config === undefined) || (config === null)) return <div> </div>;
    return (
        <div>
            <input name="" type="checkbox" checked={config.midi_ctrl} onChange={(event) => onChange(event.target.value)} />
            <LEDColor current_value={config.active_color} />
            <LEDColor current_value={config.inactive_color} />
            <LEDNum current_value={config.num} />
        </div>
    );
};
*/

const MidiNote = ({ note, onChange }) => {
    // console.log(`MidiNote ${note}`, typeof note);
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

    console.log("Step", index, config);

    let inactive = config.msg_type === MSG_CTRL_OFF;

    if (inactive) {
        return (
            <Fragment>
                <div className="step-row-header">Step {index}:</div>
                <div>
                    <select onChange={(event) => updateCallback("msg_type", null, event.target.value)} defaultValue={config.msg_type}>
                        {
                            Object.keys(MSG_TYPES_FULLNAME_SW).map(
                                key => {
                                    // let n = Note.fromMidi(i, true);
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
                <select onChange={(event) => updateCallback("msg_type", null, event.target.value)} defaultValue={config.msg_type}>
                {
                    MSG_TYPES_FULLNAME_SW_SORTED.map(
                        v => {
                            return <option key={v.key} value={v.key}>{v.value}</option>
                        })
                }
                </select>
            </div>
            <div>{d0}<div className="data-help">{MSG_TYPES_DATA_HELP[config.msg_type][0]}</div></div>
            <div>{d1}<div className="data-help">{MSG_TYPES_DATA_HELP[config.msg_type][1]}</div></div>
            <div>{d2}<div className="data-help">{MSG_TYPES_DATA_HELP[config.msg_type][2]}</div></div>
            <div>
                <LEDColor current_value={config.led_active_color} onChange={(value) => updateCallback("led_active_color", null, value)} />
            </div>
            <div>
                <LEDColor current_value={config.led_inactive_color} onChange={(value) => updateCallback("led_inactive_color", null, value)} />
            </div>
            <div>
                <LEDNum current_value={config.led_num} onChange={(value) => updateCallback("led_num", null, value)} />
            </div>
            <div>
{/*
                <input type="checkbox" checked={config.led_midi_ctrl} onChange={(event) => {
                        console.log("led_midi_ctrl", event.target.value);
                        updateCallback("led_midi_ctrl", null, event.target.value === 'on' ? 1 : 0)
                    }
                } />
*/}
                <LEDMidi current_value={config.led_midi_ctrl} onChange={(value) => updateCallback("led_midi_ctrl", null, value)} />
            </div>
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

    onStepUpdate = (stepIndex, dataType, dataIndex, value) => {
        console.log(`ControlStepsEditor.onStepUpdate`, stepIndex, dataType, dataIndex, value);
        this.props.onUpdate(stepIndex, dataType, dataIndex, value);    // stepIndex, dataIndex, value
    };

    render() {

        const steps = this.props.steps;

        // console.log("ControlStepsEditor.render", steps);

        return (
            <div className="steps">
                <div></div>
                <div className="step-col-header">Type</div>
                <div className="step-col-header">Data 1</div>
                <div className="step-col-header">Data 2</div>
                <div className="step-col-header">Data 3</div>
                <div className="step-col-header">LED On</div>
                <div className="step-col-header">LED Off</div>
                <div className="step-col-header">LED Num</div>
                <div className="step-col-header">LED MIDI</div>
                <div className="step-col-header">MIDI Ch.</div>

                <Step key={1} index={1} config={steps[1]} updateCallback={(dataType, dataIndex, value) => this.onStepUpdate(1, dataType, dataIndex, value)} />
{/*
                {Object.keys(steps).map(i =>
                    <Step key={i} index={i} config={steps[i]} updateCallback={(dataType, dataIndex, value) => this.onStepUpdate(i, dataType, dataIndex, value)} />
                )}
*/}
            </div>
        );
    }
}

export default ControlStepsEditor;
