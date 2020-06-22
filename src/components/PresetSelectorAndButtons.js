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
                        Due to a yet unsolved problem, the editor can not read the preset D6. <br />
                        However, you can ask the Pacer to send the preset. Use the encoder knob
                        to select DUMP<br />in the top-level menu and then send either a full dump or only the D6 preset.
                        <div className="dismiss" onClick={() => state.hideD6Info()}>[hide]</div>
                    </div>}
                </div>
            </div>
        </div>
    );
});
