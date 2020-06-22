import React from "react";
import "./ChordsSelector.css";
import * as Scale from "tonal-scale";


const Chord = ({ scale }) =>
    <div className="chord">
        <select >
            {
                Scale.chords(scale).map(
                    (chord, index) => <option value={chord}>{chord}</option>
                )
            }
        </select>
    </div>;


const ChordsSelector = ({ scale }) =>
    <div className="chords">
        {
            Array.from(Array(6).keys()).map(
                digit => {
                    let name = (digit + 1);
                    // let id = presetXYToIndex(name);
                    return <Chord name={name} key={digit} />
                })
        }
    </div>;


export default ChordsSelector;
