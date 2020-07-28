import React, {Component} from 'react';
import {inject, observer} from "mobx-react";
import {TARGET_PRESET} from "../pacer/constants";

class PresetNameEditor extends Component {

    onNameUpdate = (event) => {
        this.props.state.updatePresetName(this.props.state.currentPresetIndex, event.target.value.length > 5 ? event.target.value.substr(0, 5) : event.target.value);
    };

    render() {

        const presetIndex = this.props.state.currentPresetIndex;


        // console.log("PresetNameEditor render", presetIndex, this.props.state.data[TARGET_PRESET][presetIndex]);

        const name= this.props.state.data[TARGET_PRESET][presetIndex]["name"];
        return (
            <div className="preset-name-editor">
                <label>Name:</label> <input value={name} onChange={this.onNameUpdate} size={8} />
                max 5 characters
            </div>
        );
    }
}

export default inject('state')(observer(PresetNameEditor));
