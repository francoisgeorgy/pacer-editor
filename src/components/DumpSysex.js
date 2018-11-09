import React from "react";
import "./DumpSysex.css";
import {
    MSG_SW_NOTE,
    CONTROLS,
    TARGET_PRESET,
    MSG_TYPES,
    presetIndexToXY
} from "../pacer";
import {h, hs} from "../utils/hexstring";
import "./DumpSysex.css";
import * as Note from "tonal-note";

const PresetName = ({ name }) => {
    console.log("presetname", name);
    return (
    <div className="dump-preset-name">Preset name: {name}</div>
    );
};


const MidiTable = ({ settings }) => {
    if (settings === null || settings === undefined) return null;
    return (
        <div className="dump-control">
            <table>
                <tbody>
                <tr>
                    <td colSpan={6} className="name">MIDI settings</td>
                </tr>
                {Object.keys(settings).map(i => {
                    let t = MSG_TYPES[settings[i]["msg_type"]];
                    if (settings[i]["msg_type"] === MSG_SW_NOTE) {
                        t = t + ' ' + Note.fromMidi(settings[i]["data"][0], true) + ' vel. ' + settings[i]["data"][1];
                    }
                    return (
                        <tr key={i}>
                            <td>settings {i}</td>
                            <td>ch. {h(settings[i]["channel"])}</td>
                            <td>msg {h(settings[i]["msg_type"])}</td>
                            <td>{t}</td>
                            <td>{hs(settings[i]["data"])}</td>
                            {/*<td>{settings[i]["msg_type"] === MSG_SW_NOTE ? Note.fromMidi(settings[i]["data"][0], true) : "  "}</td>*/}
                            <td>{settings[i]["active"] ? "active" : "OFF"}</td>
                        </tr>
                    )}
                )}
                </tbody>
            </table>
        </div>
    );
};

const MidiSettings = ({ settings }) => {
    if (settings === null) return null;
    return (
        <div>
            <MidiTable settings={settings} />
        </div>
    );
};

const ControlTable = ({ obj, config }) => {
    if (config === null || config === undefined) return null;
    return (
        <div className="dump-control">
            <table>
                <tbody>
                    <tr>
                        <td colSpan={6} className="name">{CONTROLS[obj]}</td>
                    </tr>
                    {Object.keys(config["steps"]).map(i => {
                        let t = MSG_TYPES[config["steps"][i]["msg_type"]];
                        if (config["steps"][i]["msg_type"] === MSG_SW_NOTE) {
                            t = t + ' ' + Note.fromMidi(config["steps"][i]["data"][0], true) + ' vel. ' + config["steps"][i]["data"][1];
                        }
                        return (
                            <tr key={`${obj}.${i}`}>
                                <td>step {i}</td>
                                <td>ch. {h(config["steps"][i]["channel"])}</td>
                                <td>msg {h(config["steps"][i]["msg_type"])}</td>
                                <td>{t}</td>
                                <td>{hs(config["steps"][i]["data"])}</td>
                                {/*<td>{config["steps"][i]["msg_type"] === MSG_SW_NOTE ? Note.fromMidi(config["steps"][i]["data"][0], true) : "  "}</td>*/}
                                <td>{config["steps"][i]["active"] ? "active" : "OFF"}</td>
                            </tr>
                        )}
                    )}
                </tbody>
            </table>
        </div>
    );
};

const Controls = ({ controls }) => {
    if (controls === null || controls === undefined) return null;
    return (
        <div className="dump-controls">
            {Object.keys(controls).map(obj => <ControlTable key={obj} obj={obj} config={controls[obj]} />)}
        </div>
    );
};

const Preset = ({ index, data }) => {
    if (data === null || data === undefined) return null;
    return (
        <div>
            <h3>Preset {presetIndexToXY(parseInt(index, 10))} (#{index})</h3>
            <PresetName name={data["name"]} />
            <Controls controls={data["controls"]} />
            <MidiSettings settings={data["midi"]} />
            {/*<pre>{JSON.stringify(data, null, 4)}</pre>*/}
            {/*<pre>{JSON.stringify(data, null, 4)}</pre>*/}
        </div>
    );
};

const Presets = ({ presets }) => {
    if (presets === null || presets === undefined) return null;
    return (
        <div>
            {Object.keys(presets).map(idx => <Preset key={idx} index={idx} data={presets[idx]} />)}
        </div>
    );
};

const DumpSysex = ({ data }) => {
    return (
        <div className="dump code">
            {
                // _.map(data, (value, key) => <Preset name={key} data={value} />)
                data && <Presets presets={data[TARGET_PRESET]} />
            }
{/*
            {
                JSON.stringify(data, null, 4)
            }
*/}
        </div>
    );
};


export default DumpSysex;
