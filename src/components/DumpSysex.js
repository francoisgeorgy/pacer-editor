import React from "react";
import "./DumpSysex.css";
import {parseSysexData} from "../utils/sysex";
import {CONTROL_ELEMENT, MIDI_ELEMENT, OBJECT, TARGET} from "../pacer";
import {h, hs} from "../utils/hexstring";
import * as _ from "underscore";

const ControlElement = ({ data }) => {
    // console.log('controlElement', data);
    if (data.element === undefined) return null;
    if (!(data.element in CONTROL_ELEMENT)) return null;
    return <div>{CONTROL_ELEMENT[data.element]} = {h(data.element_data)}</div>;
};

const MidiElement = ({ data }) => {
    return <span>midi element</span>;
};

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
                                {v.elements.map(e => v.element_type === "control" ? <ControlElement data={e}/> : <MidiElement data={e}/>)}
                            </div>
                        )
                    }
                </div>)}
        </div>
    );
};

// {"command":1,"target":1,"index":5,"elements":
// [{"element":1,"element_data":15},{"element":2,"element_data":71},{"element":3,"element_data":68},{"element":4,"element_data":85},{"element":5,"element_data":102},{"element":6,"element_data":1}],"obj":17,"element_type":"control"}

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
