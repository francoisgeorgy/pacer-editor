import React, {Component} from 'react';
import {inject, observer} from "mobx-react";
import {TARGET_PRESET} from "../pacer/constants";

class PresetNameEditor extends Component {

    onNameUpdate = (event) => {
        this.props.state.updatePresetName(this.props.presetIndex, event.target.value.length > 5 ? event.target.value.substr(0, 5) : event.target.value);
    };

    render() {
        console.log("PresetNameEditor render");
        const name= this.props.state.data[TARGET_PRESET][this.props.presetIndex]["name"];
        return (
            <div className="preset-name-editor">
                <input defaultValue={name} onChange={this.onNameUpdate} size={8} />
                The preset name is limited to 5 characters.
            </div>
        );
    }
}

export default inject('state')(observer(PresetNameEditor));
