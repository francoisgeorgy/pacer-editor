import React from "react";
import {CONTROLS_FULLNAME} from "../pacer/constants";
import {observer} from "mobx-react";
import {presetIndexToXY} from "../pacer/utils";
import {state} from "../stores/StateStore";

/*
{
    17: {
        controls: {
            13: Array(13) [
                0: (9) [127, 1, 1, 17, 13, 96, 1, 0, 127]
                1: (29) [127, 1, 1, 17, 13, 1, 1, 0, 0, 2, 1, 71, 0, 3, 1, 22, 0, 4, 1, 127, 0, 5, 1, 0, 0, 6, 1, 1, 104]


{
    1:
        midi: Array(0)
            dummy: Array(1)
                0: Array(29)
                    0: 127
                    1: 1
                    2: 1

*/

const updateMessage = (presetId, ctrlType, ctrl, messages) => {
    switch (ctrlType) {
        case "controls":
            return <div key={`${presetId}-${ctrl}-ctrl`}>- preset {presetIndexToXY(presetId)}, control {CONTROLS_FULLNAME[ctrl]}</div>;
        case "midi":
            return <div key={`${presetId}-${ctrl}-midi`}>- preset {presetIndexToXY(presetId)}, midi</div>;
        case "name":
            return <div key={`${presetId}-${ctrl}-name`}>- preset {presetIndexToXY(presetId)}, name</div>;
        default:
            return null;
    }
};

const UpdateMessages = observer(() => {
    if (state.updateMessages && Object.getOwnPropertyNames(state.updateMessages).length) {
        return (
            <div className="messages-to-send">
                <div className="update-messages-title">Updates that will be sent to the Pacer:</div>
                {
                    //FIXME: allow object or array
                    Object.getOwnPropertyNames(state.updateMessages).map(       // preset
                        (presetId, i) => {
                            return Object.getOwnPropertyNames(state.updateMessages[presetId]).map(     // control type
                                (ctrlType, j) => {
                                    return Object.getOwnPropertyNames(state.updateMessages[presetId][ctrlType]).map(      // control
                                        (ctrl, k) => {
                                            return updateMessage(presetId, ctrlType, ctrl, state.updateMessages[presetId][ctrlType][ctrl])
                                        }
                                    );
                                }
                            );
                        }
                    )
                }
            </div>);
    } else {
        return null;
    }
});

export default UpdateMessages;
