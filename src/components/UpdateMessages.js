import React from "react";
import {CONTROLS_FULLNAME} from "../pacer/constants";

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

const updateMessage = (ctrlType, ctrl, messages) => {
    switch (ctrlType) {
        case "controls":
            return <div>update control {CONTROLS_FULLNAME[ctrl]}</div>;
        case "midi":
            return <div>update midi</div>;
        case "name":
            return <div>update name</div>;
        default:
            return null;
    }
};

const UpdateMessages = ({ messages }) =>
    <div className="message-to-send">
    {
        //FIXME: allow object or array
        Object.getOwnPropertyNames(messages).map(       // preset
            (presetId, i) => {
                return Object.getOwnPropertyNames(messages[presetId]).map(     // control type
                    (ctrlType, j) => {
                        return Object.getOwnPropertyNames(messages[presetId][ctrlType]).map(      // control
                            (ctrl, k) => {
                                return updateMessage(ctrlType, ctrl, messages[presetId][ctrlType][ctrl])
                            }
                        );
                    }
                );
            }
        )
    }
    </div>;

export default UpdateMessages;
