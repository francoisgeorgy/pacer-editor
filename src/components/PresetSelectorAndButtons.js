import {observer} from "mobx-react";
import {state} from "../stores/StateStore";
import PresetSelector from "./PresetSelector";
import ActionButtons from "./ActionButtons";
import React from "react";

export const PresetSelectorAndButtons = observer(() => {
    return (
        <div className="content-row-content first">
            <h2>Presets</h2>
            <div className="row align-bottom">
                <div>
                    <div className="row align-bottom">
                        <PresetSelector />
                        <ActionButtons />
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
