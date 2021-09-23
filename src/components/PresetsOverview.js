import React, {Fragment} from "react";
import {
    TARGET_PRESET,
    STOMPSWITCHES_TOP,
    STOMPSWITCHES_BOTTOM,
    FOOTSWITCHES,
    EXPPEDALS,
    CONTROLS,
    MSG_TYPES_DATA_HELP,
    NOT_USED,
    MSG_SW_NOTE,
    COLORS,
    COLORS_HTML, MSG_CTRL_OFF, CONTROL_MODES
} from "../pacer/constants";
import {MessageSummary, presetIndexToXY} from "../pacer/utils";
import {STEPS_DATA} from "../pacer/sysex";
import {h} from "../utils/hexstring";
import * as Note from "tonal-note";
import {observer} from "mobx-react";
import {withRouter} from "react-router-dom";
import {state} from "../stores/StateStore";


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

const Message = observer(({ message, hexDisplay }) => {

    if (message === null || message === undefined || (message.constructor === Object && Object.keys(message).length === 0)) return null;

    const t = message["msg_type"];

    // console.log("Message type", t, message, message["msg_type"], message.msg_type, JSON.stringify(message), typeof message, Object.keys(message));

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

    let channel = '';
    if (hexDisplay) {
        channel = h(message["channel"]);
    } else {
        channel = message["channel"] === 0 ? 'global ch.' : `ch. ${message["channel"]}`;
    }

    let colorOn = null;
    let colorOff = null;
    if (message["led_active_color"] || message["led_inactive_color"]) {
        colorOn = message["led_active_color"] === 127 ? 0x00 : message["led_active_color"];
        colorOff = message["led_inactive_color"] === 127 ? 0x00 : message["led_inactive_color"];
    }
    const displayColor = colorOn > 0 || colorOff > 0;

    // console.log(message["led_active_color"], message["led_inactive_color"], colorOn, colorOff);

    return (
        <Fragment>
            <div className="overview-message">
                <div className="overview-message-type">{MessageSummary(message)}</div>
            </div>
            {message["msg_type"] !== MSG_CTRL_OFF &&
            <div className="overview-message-ch-colors">
                <div className="msg-midi-channel">{channel}</div>
                {displayColor &&
                <div className="overview-step-color">
                    <div className={`color-off ${colorOff === 0 ? 'color-0' : ''}`} style={{backgroundColor: COLORS_HTML[colorOff]}} title={`OFF color is ${COLORS[colorOff]}`}></div>
                    <div className={`color-off ${colorOn === 0 ? 'color-0' : ''}`} style={{backgroundColor: COLORS_HTML[colorOn]}} title={`ON color is ${COLORS[colorOn]}`}></div>
                </div>}
            </div>}
        </Fragment>
    );
});

const Step = observer(({ step, hexDisplay }) => {
    if (step === null || step === undefined) return null;
    if (step["active"] === 0) return null;
    return (
        <div className="overview-step">
            <Message message={step} hexDisplay={hexDisplay} />
        </div>
    );
});

const Control = withRouter(observer(({ history, presetIndex, controlIndex, control, hexDisplay, stompswitch=true } = {}) => {

    const gotoPreset = () => {
        state.selectPreset(presetIndex);
        state.selectControl(controlIndex);
        history.push('/preset');
    }

    if (control === null || control === undefined) return null;

    if (!control[STEPS_DATA]) return null;

    const n_active_steps = Object.keys(control[STEPS_DATA]).filter(n => control[STEPS_DATA][n]["active"]>0).length;

    return (
        <div className={`overview-control ${stompswitch?'stompswitch':''} ${state.currentControl === controlIndex ? 'selected' : ''}`} onClick={gotoPreset} title="click to edit">
            <div className="control-header">
                <div className="control-name">{CONTROLS[controlIndex]}</div>
                {/*<div className="control-name"><Link to="/preset">{CONTROLS[id]}</Link></div>*/}
                {n_active_steps > 1 && <div>{CONTROL_MODES[control["control_mode"]]}</div>}
            </div>
            {Object.keys(control[STEPS_DATA]).map(n => <Step key={n} step={control[STEPS_DATA][n]} hexDisplay={hexDisplay} />)}
        </div>
    );

}));

const Controls = observer(({ presetIndex, controls, hexDisplay, extControls }) => {
    if (controls === null || controls === undefined) return null;
    // console.log("Controls", presetIndex, typeof presetIndex);
    const props = {presetIndex, hexDisplay};
    return (
        <div className="overview-controls">
            {extControls && FOOTSWITCHES.map(controlId => <Control key={controlId} controlIndex={controlId} control={controls[controlId]} {...props} stompswitch={false} />)}
            {extControls && EXPPEDALS.map(controlId => <Control key={controlId} controlIndex={controlId} control={controls[controlId]} {...props} stompswitch={false} />)}
            <div></div>
            {STOMPSWITCHES_TOP.map(controlId => <Control key={controlId} controlIndex={controlId} control={controls[controlId]} {...props} />)}
            <div></div>
            {STOMPSWITCHES_BOTTOM.map(controlId => <Control key={controlId} controlIndex={controlId} control={controls[controlId]} {...props} />)}
        </div>
    );
});

const MidiSetting = observer(({ setting, hexDisplay }) => {
    if (setting === null || setting === undefined) return null;
    if (!setting["msg_type"]) return null;
    if (setting.msg_type === MSG_CTRL_OFF) return null;
    return (
        <div className="overview-midi">
            <Message message={setting} hexDisplay={hexDisplay} />
        </div>
    );
});

const MidiSettings = observer(({ settings, hexDisplay }) => {
    // console.log("MidiSettings", settings);
    if (settings === null || settings === undefined) return null;
    return (
        <div className="overview-midi-settings">
            <div className="control-name">MIDI</div>
            {Object.keys(settings).map(i =>                     // TODO: .filter(msg_type !== MSG_CTRL_OFF)
                <MidiSetting key={i} index={i} setting={settings[i]} hexDisplay={hexDisplay} />
            )}
        </div>
    );
});


const PresetTitle = withRouter(observer(({ history, presetIndex, presetName} = {}) => {

    const gotoPreset = () => {
        state.selectPreset(presetIndex);
        state.selectControl("13");
        history.push('/preset');
    }

    let additionalInfos = null;
    if (presetIndex === "0") {
        additionalInfos = <span className="grow right-align mt-5 mr-15 font-normal small text-555">This is the currently loaded preset. Changes here are not saved in permanent memory.</span>;
    }

    return (
        <h3 className="preset-title" onClick={gotoPreset} title="click to edit">
            {presetIndexToXY(parseInt(presetIndex, 10))}<span className="bullet">•</span><span className="bold"> {presetName}</span>{additionalInfos}
        </h3>
    );

}));

export const PresetOverview = observer(({ index, data, hexDisplay, extControls, title }) => {
    if (data === null || data === undefined) return null;
    // console.log("Preset", index, typeof index);
    return (
        <div className={`overview-preset ${state.currentPresetIndex === index ? 'selected' : ''}`}>
            {title && <PresetTitle presetIndex={index} presetName={data["name"]} />}
            {/*<h3>{presetIndexToXY(parseInt(index, 10))}: <span className="bold">{data["name"]}</span></h3>*/}
            <Controls presetIndex={index} controls={data["controls"]} hexDisplay={hexDisplay} extControls={extControls} />
            {hasMidiConfig(data) && <MidiSettings settings={data["midi"]} hexDisplay={hexDisplay} />}
        </div>
    );
});

const Presets = observer(({ presets, hexDisplay, extControls, currentPreset }) => {
    if (presets === null || presets === undefined) return null;
    return (
        <div className="overview-presets">
            {Object.keys(presets)
                .filter(presetIndex => presetIndex === currentPreset || currentPreset === '')
                .map(presetIndex => <PresetOverview key={presetIndex} index={presetIndex} data={presets[presetIndex]} title={true} hexDisplay={hexDisplay} extControls={extControls} />)}
        </div>
    );
    // {Object.keys(presets).map(presetIndex => <Preset key={presetIndex} index={presetIndex} data={presets[presetIndex]} hexDisplay={hexDisplay} extControls={extControls} />)}
});

const PresetsOverview = observer(({ data, hexDisplay, extControls, currentPreset }) => {
    if (data === null || data === undefined) return null;
    // console.log("PresetOverview render");
    return (
        <div className="overview">
            <Presets presets={data[TARGET_PRESET]} hexDisplay={hexDisplay} extControls={extControls} currentPreset={currentPreset} />
        </div>
    );
});

export default PresetsOverview;
