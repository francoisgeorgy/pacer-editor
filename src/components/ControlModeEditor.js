import React from "react";
import {CONTROL_MODES} from "../pacer/constants";
import"./ControlModeEditor.css";

const ControlModeEditor = (props) => {
    // console.log("ControlModeEditor", props);
    return (
        <div className="control-mode">
            <span className="step-row-header">Control mode:</span>
            <select onChange={(event) => props.onUpdate(event.target.value)} value={props.mode}>
                {
                    Object.keys(CONTROL_MODES).map(
                        key => {
                            // console.log("ControlModeEditor key", key, props.mode);
                            return <option key={key} value={key}>{CONTROL_MODES[key]}</option>
                        })
                }
            </select>
        </div>
    );
};

export default ControlModeEditor;
