import React from "react";
import "./DumpSysex.css";
import {CONTROL_ELEMENT, MIDI_ELEMENT, OBJECT, TARGET, TARGET_PRESET} from "../pacer";
import {h, hs} from "../utils/hexstring";
import "./DumpSysex.css";

const ControlElement = ({ data }) => {
    if (data.element === undefined) return null;
    if (!(data.element in CONTROL_ELEMENT)) return null;
    return <div>{CONTROL_ELEMENT[data.element]} = {h(data.element_data)}</div>;
};

const MidiElement = ({ data }) => {
    return <span>midi element</span>;
};

const Midis = ({ midis }) => {
    if (midis === null) return null;
    return (
        <div></div>
    );
};

const Control = ({ obj, config }) => {
    if (config === null) return null;
    return (
        <div>
            <h3>{OBJECT[obj]}</h3>
            <div>
                <h4>steps</h4>
                <div>
                {Object.keys(config["steps"]).map(i =>
                    <div key={`${obj}.${i}`}>
                        <div>step #{i}</div>
                        <ul>
                            <li>MIDI channel: {h(config["steps"][i]["channel"])}</li>
                            <li>message type: {h(config["steps"][i]["msg_type"])}</li>
                            <li>data: {hs(config["steps"][i]["data"])}</li>
                            <li>active: {config["steps"][i]["active"]}</li>
                        </ul>
                    </div>
                )}
                </div>
                <h4>LED</h4>
                <h4>control</h4>
            </div>
        </div>
    );
};

const ControlTable = ({ obj, config }) => {
    if (config === null) return null;
    return (
        <div className="control">
            <table>
                <tbody>
                    <tr>
                        <td colSpan={5} className="name">{OBJECT[obj]}</td>
                    </tr>
                    {Object.keys(config["steps"]).map(i =>
                        <tr key={`${obj}.${i}`}>
                            <td>step #{i}</td>
                            <td>ch. {h(config["steps"][i]["channel"])}</td>
                            <td>msg {h(config["steps"][i]["msg_type"])}</td>
                            <td>{hs(config["steps"][i]["data"])}</td>
                            <td>active {config["steps"][i]["active"]}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

const Controls = ({ controls }) => {
    if (controls === null) return null;
    return (
        <div className="controls">
            {Object.keys(controls).map(obj => <ControlTable key={obj} obj={obj} config={controls[obj]} />)}
        </div>
    );
};

const Preset = ({ index, data }) => {
    if (data === null) return null;
    return (
        <div>
            <h2>Preset #{index}</h2>
            <Controls controls={data["controls"]} />
            <Midis controls={data["controls"]} />
            {/*<pre>{JSON.stringify(data, null, 4)}</pre>*/}
        </div>
    );
};

const Presets = ({ presets }) => {
    if (presets === null) return null;
    return (
        <div>
            {Object.keys(presets).map(idx => <Preset key={idx} index={idx} data={presets[idx]} />)}
        </div>
    );
};

const DumpSysex = ({ data }) => {
    return (
        <div className="dump">
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
