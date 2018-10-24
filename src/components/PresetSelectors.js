import React from "react";
import "./PresetSelectors.css";
import {presetXYToIndex} from "../pacer";

const PresetSelector = ({ name, id, selected, onClick }) =>
    <div className={selected ? "selected" : ""} onClick={() => onClick(id)}>{name}</div>;

const PresetSelectors = ({ currentPreset, onClick }) =>
    <div className="selectors">
    {
        ['A', 'B', 'C', 'D'].map(
            e => {
                return (
                    <div key={e}>{
                        Array.from(Array(6).keys()).map(
                            i => {
                                let name = e + (i + 1);
                                let id = presetXYToIndex(name);
                                return <PresetSelector name={name} id={id} selected={id === currentPreset} onClick={onClick} key={id} />
                            })
                    }</div>)
            }
        )
    }
    </div>;

/*

    with CSS grid

const PresetSelectors = ({ currentPreset }) =>
    <div>
        <h2>Preset:</h2>
        <div className="selectors">
            {
                ['A', 'B', 'C', 'D'].map(
                    e => {
                        return Array.from(Array(6).keys()).map(
                            i => {
                                let id = e + (i+1);
                                console.log(id, currentPreset);
                                return <PresetSelector name={id} selected={id === currentPreset} />
                            }
                        )
                    }
                )
            }
        </div>
    </div>;
*/

export default PresetSelectors;
