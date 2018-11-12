import React, {Fragment} from "react";
import "./PresetSelector.css";
import "./selector.css";
import {presetXYToIndex} from "../pacer/utils";

const Selector = ({ name, id, selected, onClick }) =>
    <div className={selected ? "selector selected" : "selector"} onClick={() => onClick(id)}>{name}</div>;

const PresetSelector = ({ currentPreset, onClick }) =>
    <Fragment>
        <div className="preset-selectors">
            <Selector name={"0"} id={0} selected={0 === currentPreset} onClick={onClick} key={0} />
        {
            ['A', 'B', 'C', 'D'].map(
                letter => {
                    return (
                        <Fragment key={letter}>
                        {
                            (letter !== 'A') && <div></div>
                        }
                        {
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
        </div>
    </Fragment>;

export default PresetSelector;
