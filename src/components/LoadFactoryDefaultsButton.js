import React, {Component} from "react";
import {inject, observer} from "mobx-react";
import {mergeDeep, parseSysexDump} from "../pacer/sysex";
import FACTORY_PRESETS from "../factory-presets.json";

class LoadFactoryDefaultsButton extends Component {

    loadFactoryDefaults = () => {
        // console.log("FACTORY_PRESETS", typeof FACTORY_PRESETS, FACTORY_PRESETS);
        const data = Uint8Array.from(Object.values(FACTORY_PRESETS));
        // console.log("data", data);
        this.props.state.data = mergeDeep(parseSysexDump(data));
        this.props.state.storeBytes(data);
    }

/*
    loadFactoryDefaults = async () => {

        let response = await fetch("patches/factory-defaults.syx");
        // this.props.state.presets = await response.json();

        console.log("loadFactoryDefaults", response);


        const d = await response.arrayBuffer();
        console.log("loadFactoryDefaults", typeof d, d);

        console.log(JSON.stringify({d}));

        const data = new Uint8Array(d);
        // const data = new Uint8Array(await response.arrayBuffer(d));

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
*/

    render() {

        // const data = this.props.state.data;
        // if (data) return null;

        return (
            <div>
                <button className="action-button" onClick={this.loadFactoryDefaults}>Load Factory</button>
            </div>
        );
    }
}

export default inject('state')(observer(LoadFactoryDefaultsButton));
