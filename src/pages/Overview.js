import React, {Component} from 'react';
import {inject, observer} from "mobx-react";
import Dropzone from "react-dropzone";
import {dropOverlayStyle} from "../utils/misc";
import {PresetSelectorAndButtons} from "../components/PresetSelectorAndButtons";
import PresetsOverview from "../components/PresetsOverview";
import LoadFactoryDefaultsButton from "../components/LoadFactoryDefaultsButton";
import "./Overview.css";

class Overview extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dropZoneActive: false
        };
    }

    onDragEnter = () => {
        this.setState({
            dropZoneActive: true
        });
    };

    onDragLeave= () => {
        this.setState({
            dropZoneActive: false
        });
    };

    /**
     * Drop Zone handler
     * @param files
     */
    onDrop = (files) => {
        // this.props.state.clear();
        this.props.state.changed = true;
        this.setState(
            { dropZoneActive: false },
            () => {this.props.state.readFiles(files)}   // returned promise from readFiles() is ignored, this is normal.
        );
    };

    render() {
        // console.log("Overview: current preset", this.props.state.currentPresetIndex);
        return (
            <Dropzone
                disableClick
                style={{position: "relative"}}
                onDrop={this.onDrop}
                onDragEnter={this.onDragEnter}
                onDragLeave={this.onDragLeave}>
                {this.state.dropZoneActive &&
                <div style={dropOverlayStyle}>
                    Drop sysex file...
                </div>}
                <div className="wrapper">
                    <div className="content">
                        <PresetSelectorAndButtons showClearButton={true} />
                        <div className="content-row-content">
                            <PresetsOverview data={this.props.state.data}
                                             hexDisplay={!this.props.state.decBase}
                                             extControls={this.props.state.extControls}
                                             currentPreset={this.props.state.currentPresetIndex}/>
                        </div>
                        <LoadFactoryDefaultsButton />
                    </div>
                </div>
            </Dropzone>
        );
    }
}

export default inject('state')(observer(Overview));
