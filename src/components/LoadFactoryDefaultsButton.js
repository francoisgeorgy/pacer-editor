import React, {Component} from "react";
import {inject, observer} from "mobx-react";
import {isSysexData, mergeDeep, parseSysexDump} from "../pacer/sysex";

class LoadFactoryDefaultsButton extends Component {

    loadFactoryDefaults = async () => {

        let response = await fetch("patches/factory-defaults.syx");
        // this.props.state.presets = await response.json();

        console.log("loadFactoryDefaults", response);

        const data = new Uint8Array(await response.arrayBuffer());

        console.log("loadFactoryDefaults", data);

        if (isSysexData(data)) {

            console.log("loadFactoryDefaults OK");

            this.props.state.data = mergeDeep(parseSysexDump(data));
            this.props.state.storeBytes(data);
            // this.setState(
            //     produce(draft => {
            //         draft.binData = data;
            //         draft.data = mergeDeep(draft.data || {}, parseSysexDump(data));
            //     })
            // );
            // this.addInfoMessage("sysfile decoded");
            // } else {
            //     console.log("readFiles: not a sysfile", hs(data.slice(0, 5)));
        }
    };

    render() {

        const data = this.props.state.data;

        if (data) return null;

        return (
            <div className="Xpreset-buttons">
                <button className="action-button" onClick={this.loadFactoryDefaults}>Load Factory defaults</button>
            </div>
        );
    }
}

export default inject('state')(observer(LoadFactoryDefaultsButton));
