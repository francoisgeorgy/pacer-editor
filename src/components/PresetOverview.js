import React, {Fragment} from "react";
import {
    TARGET_PRESET,
    STOMPSWITCHES_TOP,
    STOMPSWITCHES_BOTTOM,
    FOOTSWITCHES,
    EXPPEDALS,
    CONTROLS,
    MSG_TYPES_SHORT_NAMES,
    MSG_TYPES_DATA_HELP,
    NOT_USED,
    CONTROL_MODES_SHORT_NAME,
    MSG_SW_NOTE,
    COLORS,
    COLORS_HTML, MSG_CTRL_OFF
} from "../pacer/constants";
import {presetIndexToXY} from "../pacer/utils";
import {STEPS_DATA} from "../pacer/sysex";
import {h} from "../utils/hexstring";
import * as Note from "tonal-note";

function hasMidiConfig(preset) {
    if (preset && preset["midi"]) {
        for (let prop in preset.midi) {
            const m = preset.midi[prop];
            if (m.hasOwnProperty("msg_type")) {
                if (m.msg_type !== MSG_CTRL_OFF) return true;
            }
        }
    }
    return false;
}

const Message = ({ message, hexDisplay }) => {
    if (message === null || message === undefined) return null;
    const t = message["msg_type"];
    const used = MSG_TYPES_DATA_HELP[t];
    const data = message["data"];
    let d = [null, null, null];
    for (let i=0; i<3; i++) {
        if (used[i] === NOT_USED) continue;
        d[i] = hexDisplay ? h(data[i]) : data[i];
        if (i === 0 && t === MSG_SW_NOTE) {
            d[i] += ' (' + Note.fromMidi(data[i], true) + ')';
        }
    }
    return (
        <Fragment>
            <div className="overview-message">
                {MSG_TYPES_SHORT_NAMES[t]}
                <span>{d[0]}</span>
                <span>{d[1]}</span>
                <span>{d[2]}</span>
            </div>
            <div className="msg-midi-channel">ch. {hexDisplay ? h(message["channel"]) : message["channel"]}</div>
        </Fragment>
    );
};

const Step = ({ step, hexDisplay }) => {
    if (step === null || step === undefined) return null;
    if (step["active"] === 0) return null;
    let colorOn = null;
    let colorOff = null;
    if (step["led_active_color"] && step["led_inactive_color"]) {
        colorOn = step["led_active_color"] === 127 ? 0x00 : step["led_active_color"];
        colorOff = step["led_inactive_color"] === 127 ? 0x00 : step["led_inactive_color"];
    }
    const displayColor = colorOn > 0 && colorOff > 0;
    return (
        <Fragment>
            <div className="overview-step">
                <Message message={step} hexDisplay={hexDisplay} />
            </div>
            {displayColor &&
            <div className="overview-step-color">
                <div className="color-on" style={{backgroundColor: COLORS_HTML[colorOn]}} title={COLORS[colorOn]}></div>
                <div className="color-off" style={{backgroundColor: COLORS_HTML[colorOff]}} title={COLORS[colorOff]}></div>
            </div>
            }
        </Fragment>
    );
};

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

const Controls = ({ controls, hexDisplay, extControls }) => {
    if (controls === null || controls === undefined) return null;
    return (
        <div className="overview-controls">
            {extControls && FOOTSWITCHES.map(obj => <Control key={obj} id={obj} control={controls[obj]} hexDisplay={hexDisplay} />)}
            {extControls && EXPPEDALS.map(obj => <Control key={obj} id={obj} control={controls[obj]} hexDisplay={hexDisplay} />)}
            {STOMPSWITCHES_TOP.map(obj => <Control key={obj} id={obj} control={controls[obj]} hexDisplay={hexDisplay} />)}
            <div></div><div></div>
            {STOMPSWITCHES_BOTTOM.map(obj => <Control key={obj} id={obj} control={controls[obj]} hexDisplay={hexDisplay} />)}
        </div>
    );
};

const MidiSetting = ({ setting, hexDisplay }) => {
    if (setting === null || setting === undefined) return null;
    if (!setting["msg_type"]) return null;
    if (setting.msg_type === MSG_CTRL_OFF) return null;
    return (
        <div className="overview-midi">
            <Message message={setting} hexDisplay={hexDisplay} />
        </div>
    );
};

const MidiSettings = ({ settings, hexDisplay }) => {
    console.log("MidiSettings", settings);
    if (settings === null || settings === undefined) return null;
    return (
        <div className="overview-midi-settings">
            <div className="control-name">MIDI</div>
            {Object.keys(settings).map(i =>                     // TODO: .filter(msg_type !== MSG_CTRL_OFF)
                <MidiSetting key={i} index={i} setting={settings[i]} hexDisplay={hexDisplay} />
            )}
        </div>
    );
};

const Preset = ({ index, data, hexDisplay, extControls }) => {
    if (data === null || data === undefined) return null;
    return (
        <div className="overview-preset">
            <h3>Preset {presetIndexToXY(parseInt(index, 10))} (#{index}): <span className="bold">{data["name"]}</span></h3>
            {/*<PresetName name= />*/}
            <Controls controls={data["controls"]} hexDisplay={hexDisplay} extControls={extControls} />
            {hasMidiConfig(data) && <MidiSettings settings={data["midi"]} hexDisplay={hexDisplay} />}
        </div>
    );
};

const Presets = ({ presets, hexDisplay, extControls }) => {
    if (presets === null || presets === undefined) return null;
    return (
        <div className="overview-presets">
            {Object.keys(presets).map(idx => <Preset key={idx} index={idx} data={presets[idx]} hexDisplay={hexDisplay} extControls={extControls} />)}
        </div>
    );
};

const PresetOverview = ({ data, hexDisplay, extControls }) => {
    if (data === null || data === undefined) return null;
    return (
        <div className="overview">
            <Presets presets={data[TARGET_PRESET]} hexDisplay={hexDisplay} extControls={extControls} />
        </div>
    );
};

export default PresetOverview;
