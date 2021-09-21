import React, {Component, Fragment} from "react";
import {inject, observer} from "mobx-react";
import {presetXYToIndex} from "../pacer/utils";
import {TARGET_PRESET} from "../pacer/constants";
import {state} from "../stores/StateStore";
import "./PresetSelector.css";

// TODO: is observer needed here?
const Selector = observer(({ xyId, presetIndex, hasData, name, onClick }) => {

    // console.log("Selector", xyId, presetIndex, state.currentPreset, typeof presetIndex, typeof state.currentPreset);

    let c = "selector";
    const selected = presetIndex === state.currentPresetIndex;
    if (selected) c += " selected";
    if (!selected && hasData) c += " loaded";

    if (xyId === "CURRENT" && name) {
        return (<div className={c} onClick={() => onClick(presetIndex)}>
            CUR: {name}
        </div>);
    } else {
        return (<div className={c} onClick={() => onClick(presetIndex)}>
            <span className="preset-id">{xyId}</span> <span className="preset-name">{name}</span>
        </div>);
    }

});

class PresetSelector extends Component {

    selectPreset = (index) => {     // index must be a string
        this.props.state.selectPreset(index);
        const data = this.props.state.data;
        if (index === "24") {
            // console.log("D6 loaded?", data && data[TARGET_PRESET] && data[TARGET_PRESET][index]);
            if (!(data && data[TARGET_PRESET] && data[TARGET_PRESET][index])) {
                this.props.state.showD6Info();
                return;
            }
        }
        if (!(!this.props.state.forceReread && data && data[TARGET_PRESET] && data[TARGET_PRESET][index])) {
            this.props.state.readPreset(index, "reading Pacer...");
        }
    };

    clearSelection = () => {
        this.props.state.clearPresetSelection();
    }

    render() {
        const {data, currentPresetIndex} = this.props.state;
        // console.log("PresetSelector render", currentPreset, typeof currentPreset);

        let curHasData = data && data[TARGET_PRESET] && data[TARGET_PRESET][0];

        let currName = curHasData ? data[TARGET_PRESET][0]["name"] : "";


        return (
            <div>
            <div className="selectors">
                <div className="preset-selectors">
                    <Selector xyId={"CURRENT"} presetIndex={"0"} name={currName} xselected={!!currentPresetIndex} onClick={this.selectPreset} key={0}/>
                    <div className="clear-selection">
                        {currentPresetIndex && <button onClick={this.clearSelection}>clear selection</button>}
                    </div>
                    <div></div>
                    <div className="force-read">
                        <label>
                            <input type="checkbox" checked={this.props.state.forceReread} onChange={this.props.state.toggleForceReread} />
                            Always read from Pacer
                        </label>
                    </div>
                    {
                        ['A', 'B', 'C', 'D'].map(
                            letter =>
                                <Fragment key={letter}>
                                {
                                    Array.from(Array(6).keys()).map(
                                        digit => {
                                            let xyId = letter + (digit + 1);
                                            let index = presetXYToIndex(xyId);
                                            let hasData = data && data[TARGET_PRESET] && data[TARGET_PRESET][index];
                                            let name = hasData ? data[TARGET_PRESET][index]["name"] : "";
                                            return <Selector xyId={xyId} presetIndex={index} hasData={hasData} name={name} key={index} onClick={this.selectPreset} />
                                        })
                                }
                                </Fragment>
                        )
                    }
                </div>
            </div>
            </div>
        );
    }
}

export default inject('state')(observer(PresetSelector));
