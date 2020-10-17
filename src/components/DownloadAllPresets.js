import React, {Component} from "react";
import {inject, observer} from "mobx-react";
import Download from "./Download";

class DownloadAllPresets extends Component {

    render() {
        console.log("DownloadAllPresets render");
        if (this.props.state.isBytesPresetEmpty()) return null;
        return (
            <Download data={() => this.props.state.getBytesPresetsAsBlob()} filename={`pacer-patch`} addTimestamp={true} label="Save to file" />
        );
    }

}

export default inject('state')(observer(DownloadAllPresets));
