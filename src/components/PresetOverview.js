import React, {Fragment} from "react";
import {
    TARGET_PRESET,
    STOMPSWITCHES_TOP,
    STOMPSWITCHES_BOTTOM,
    FOOTSWITCHES,
    EXPPEDALS,
    CONTROLS, MSG_TYPES_SHORT_NAMES, MSG_TYPES_DATA_HELP, NOT_USED, CONTROL_MODES_SHORT_NAME, MSG_SW_NOTE
} from "../pacer/constants";
import {presetIndexToXY} from "../pacer/utils";
import {STEPS_DATA} from "../pacer/sysex";
import {h} from "../utils/hexstring";
import * as Note from "tonal-note";

const Step = ({ step, hexDisplay }) => {
    if (step === null || step === undefined) return null;
    if (step["active"] === 0) return null;
    const t = step["msg_type"];
    const used = MSG_TYPES_DATA_HELP[t];
    const data = step["data"];
    let d = [null, null, null];
    for (let i=0; i<3; i++) {
        if (used[i] === NOT_USED) continue;
        d[i] = hexDisplay ? h(data[i]) : data[i];
        if (i === 0 && t === MSG_SW_NOTE) {
            d[i] += ' (' + Note.fromMidi(data[i], true) + ')';
        }
    }
    return (
        <div className="overview-step">
            <div className="overview-message">
                {MSG_TYPES_SHORT_NAMES[t]}
                <span>{d[0]}</span>
                <span>{d[1]}</span>
                <span>{d[2]}</span>
            </div>
            <div>ch. {step["channel"]}</div>
        </div>
    );
};

/*
    "13": {
        "steps": {
            "1": {
                "channel": 0,
                "msg_type": 69,
                "data": [
                    0,
                    0,
                    0
                ],
                "active": 1,
                "led_midi_ctrl": 0,
                "led_active_color": 127,
                "led_inactive_color": 127,
                "led_num": 0
            },
            "2": ...
        },
        "control_mode": 0
    },
*/
const Control = ({ id, control, hexDisplay }) => {
    if (control === null || control === undefined) return null;
    return (
        <div>
            <div className="control-header">
                <div className="control-name">{CONTROLS[id]}</div>
                <div><span className="dim">steps:</span> {CONTROL_MODES_SHORT_NAME[control["control_mode"]]}</div>
            </div>
            {Object.keys(control[STEPS_DATA]).map(n => <Step key={n} step={control[STEPS_DATA][n]} hexDisplay={hexDisplay} />)}
        </div>
    );
};

const Controls = ({ controls, hexDisplay }) => {
    if (controls === null || controls === undefined) return null;
    return (
        <div className="overview-controls">
            {/* {{Object.keys(controls).map(obj => <ControlTable key={obj} obj={obj} config={controls[obj]} />)}} */}
            {STOMPSWITCHES_TOP.map(obj => <Control key={obj} id={obj} control={controls[obj]} hexDisplay={hexDisplay} />)}
            <div></div><div></div>
            {STOMPSWITCHES_BOTTOM.map(obj => <Control key={obj} id={obj} control={controls[obj]} hexDisplay={hexDisplay} />)}
            {FOOTSWITCHES.map(obj => <Control key={obj} id={obj} control={controls[obj]} hexDisplay={hexDisplay} />)}
            {EXPPEDALS.map(obj => <Control key={obj} id={obj} control={controls[obj]} hexDisplay={hexDisplay} />)}
        </div>
    );
/*
    return (
        <div className="overview-controls">
            {/!*{Object.keys(controls).map(obj => <ControlTable key={obj} obj={obj} config={controls[obj]} />)}*!/}
            {Object.keys(controls).map(obj => <Control control={controls[obj]} />)}
        </div>
    );
*/
};

const Preset = ({ index, data, hexDisplay }) => {
    if (data === null || data === undefined) return null;
    return (
        <Fragment>
            <h3>Preset {presetIndexToXY(parseInt(index, 10))} (#{index}): {data["name"]}</h3>
            {/*<PresetName name= />*/}
            <Controls controls={data["controls"]} hexDisplay={hexDisplay} />
            {/*<MidiSettings settings={data["midi"]}/>*/}
        </Fragment>
    );
};

const Presets = ({ presets, hexDisplay }) => {
    if (presets === null || presets === undefined) return null;
    return (
        <div className="overview-presets">
            {Object.keys(presets).map(idx => <Preset key={idx} index={idx} data={presets[idx]} hexDisplay={hexDisplay} />)}
        </div>
    );
};

const PresetOverview = ({ data, hexDisplay }) => {
    if (data === null || data === undefined) return null;
    return (
        <div className="overview">
            <Presets presets={data[TARGET_PRESET]} hexDisplay={hexDisplay} />
        </div>
    );
};

export default PresetOverview;
