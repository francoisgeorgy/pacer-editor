import React, {Fragment} from "react";
import "./PresetSelector.css";
import "./selector.css";
import {presetXYToIndex} from "../pacer/utils";
import {TARGET_PRESET} from "../pacer/constants";

const Selector = ({ id, index, name, selected, onClick }) =>
    <div className={selected ? "selector selected" : "selector"} onClick={() => onClick(index)}>
        <span className="preset-id">{id}</span> <span className="preset-name">{name}</span>
    </div>;

const PresetSelector = ({ data, currentPreset, onClick }) =>
    <Fragment>
        <div className="preset-selectors">
            <Selector id={"CUR"} index={0} name={"-"} selected={0 === currentPreset} onClick={onClick} key={0} />
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        {
            ['A', 'B', 'C', 'D'].map(
            letter =>
                <Fragment key={letter}>
{/*
                {
                    (letter !== 'A') && <div></div>
                }
*/}
                {
                    Array.from(Array(6).keys()).map(
                    digit => {
                        let id = letter + (digit + 1);
                        let index = presetXYToIndex(id);

                        let show = data && data[TARGET_PRESET] && data[TARGET_PRESET][index];
                        let name = show ? data[TARGET_PRESET][index]["name"] : "";

                        return <Selector id={id} index={index} name={name} selected={index === currentPreset} onClick={onClick} key={index} />
                    })
                }
                </Fragment>
            )
        }
        </div>
    </Fragment>;

export default PresetSelector;
