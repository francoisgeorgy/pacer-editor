import React, {Component} from "react";
import {CONTROL_MODES} from "../pacer";
import"./ControlModeEditor.css";

class ControlModeEditor extends Component {

    render() {
        return (
            <div className="control-mode">
                <span className="step-row-header">Control mode:</span>
                <select onChange={(event) => this.props.onUpdate(event.target.value)} defaultValue={this.props.mode}>
                    {
                        Object.keys(CONTROL_MODES).map(
                            key => {
                                return <option key={key} value={key}>{CONTROL_MODES[key]}</option>
                            })
                    }
                </select>
            </div>
        );
    }

}

export default ControlModeEditor;
