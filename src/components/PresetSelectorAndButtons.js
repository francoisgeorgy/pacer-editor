import {observer} from "mobx-react";
import React from "react";
import {state} from "../stores/StateStore";
import PresetSelector from "./PresetSelector";
import OverviewPresetSelector from "./OverviewPresetSelector";

export const PresetSelectorAndButtons = observer((props) => {
    return (
        <div className="content-row-content first mb-20">
            <h2>Presets</h2>
            <div className="row align-bottom">
                <div>
                    <div className="row align-bottom">
                        {props.overview && <OverviewPresetSelector showClearButton={props.showClearButton} />}
                        {!props.overview && <PresetSelector showClearButton={props.showClearButton} />}
                        {/*<ActionButtons />*/}
                    </div>
                    {state.D6InfoVisible &&
                    <div className="d6info">
                        Please, click the "Read Pacer" button to get the D6 preset data.
                        <div className="dismiss" onClick={() => state.hideD6Info()}>[hide]</div>
                    </div>}
                </div>
            </div>
        </div>
    );
});
