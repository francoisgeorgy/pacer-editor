import React, {Fragment} from "react";
import "./PresetSelector.css";
import {presetXYToIndex} from "../pacer";

const Selector = ({ name, id, selected, onClick }) =>
    <div className={selected ? "selected" : ""} onClick={() => onClick(id)}>{name}</div>;


/*
const PresetSelectors = ({ currentPreset, onClick }) =>
    <div className="preset-selectors">
        {
            Array.from(Array(6).keys()).map(
                digit => {
                    return (
                        <Fragment>{
                            ['A', 'B', 'C', 'D'].map(
                                letter => {
                                    let name = letter + (digit + 1);
                                    let id = presetXYToIndex(name);
                                    return <PresetSelector name={name} id={id} selected={id === currentPreset} onClick={onClick} key={id} />
                                })
                        }</Fragment>)
                }
            )
        }
    </div>;
*/

//FIXME: allow the selection of preset #0 (CUR)

const PresetSelector = ({ currentPreset, onClick }) =>
    <div className="preset-selectors">
    {
        ['A', 'B', 'C', 'D'].map(
            letter => {
                return (
                    <Fragment key={letter}>{
                        Array.from(Array(6).keys()).map(
                            digit => {
                                let name = letter + (digit + 1);
                                let id = presetXYToIndex(name);
                                return <Selector name={name} id={id} selected={id === currentPreset} onClick={onClick} key={id} />
                            })
                    }</Fragment>)
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

export default PresetSelector;
