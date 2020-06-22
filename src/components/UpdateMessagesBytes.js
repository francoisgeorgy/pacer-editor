import React from "react";
import {hs} from "../utils/hexstring";

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

const UpdateMessagesBytes = ({ messages }) =>
    <div className="messages-to-send">
    {
        //FIXME: allow object or array
        Object.getOwnPropertyNames(messages).map(       // preset
            (presetId, i) => {
                return Object.getOwnPropertyNames(messages[presetId]).map(     // control type
                    (ctrlType, j) => {
                        return Object.getOwnPropertyNames(messages[presetId][ctrlType]).map(      // control
                            (ctrl, k) => {
                                return messages[presetId][ctrlType][ctrl].map(
                                    (msg, h) => {
                                        return (<div key={`${i}-${j}-${k}-${h}`} className="code">{hs(msg)}</div>);
                                    }
                                );
                            }
                        );
                    }
                );
            }
        )
    }
    </div>;

export default UpdateMessagesBytes;
