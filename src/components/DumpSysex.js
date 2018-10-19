import React from "react";
import "./DumpSysex.css";
import {parseSysexData} from "../utils/sysex";
import {CONTROL_ELEMENT, MIDI_ELEMENT, OBJECT, TARGET} from "../pacer";
import {h, hs} from "../utils/hexstring";
import * as _ from "underscore";

const Preset = ({ name, data }) => {
    // console.log(name, data );
    let byObj = _.groupBy(data, e => `${OBJECT[e.obj]}`);
    return (
        <div>
            <h2>{name}</h2>
            {_.map(byObj, (value, key) =>
                <div>
                    <h4>{key}</h4>
                    {
                        value.map(v =>
                            <div>
                                <div>[{h(v.element)}] {v.element_type === "control" ? CONTROL_ELEMENT[v.element] : MIDI_ELEMENT[v.element]}</div>
                                <div className="data">{hs(v.data)}</div>
                            </div>
                        )
                    }
                </div>)}
        </div>
    );
};

const DumpSysex = ({ data }) => {
    let presets = _.groupBy(parseSysexData(data), e => `${TARGET[e.target]} ${e.index}`);
    if (presets === null) return null;
    // console.log(presets);
    return (
        <div className="dump">
            {
                _.map(presets, (value, key) => <Preset name={key} data={value} />)
            }
{/*
            {
                JSON.stringify(presets, null, 4)
            }
*/}
        </div>
    );
};


export default DumpSysex;
