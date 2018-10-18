import React from "react";
import "./PresetSelectors.css";

const PresetSelector = ({ name, selected, onClick }) =>
    <div className={selected ? "selected" : ""} onClick={() => onClick(name)}>{name}</div>;

const PresetSelectors = ({ currentPreset, onClick }) =>
    <div>
        <h2>Choose preset to edit:</h2>
        <div className="selectors">
        {
            ['A', 'B', 'C', 'D'].map(
                e => {
                    return (
                        <div>{
                            Array.from(Array(6).keys()).map(
                                i => {
                                    let id = e + (i + 1);
                                    return <PresetSelector name={id} selected={id === currentPreset} onClick={onClick} />
                                })
                        }</div>)
                }
            )
        }
        </div>
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
