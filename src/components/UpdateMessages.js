import React from "react";
import {hs} from "../utils/hexstring";

const UpdateMessages = ({ messages }) =>
    <div className="message-to-send">
        {
            Object.getOwnPropertyNames(messages).map(
                (v, i) => {
                    return Object.getOwnPropertyNames(messages[v]).map(
                        (w, j) => {
                            return messages[v][w].map(
                                (m, k) => {
                                    return (<div key={`${i}-${j}-${k}`} className="code">{hs(m)}</div>);
                                }
                            );
                        }
                    );
                }
            )
        }
    </div>;

export default UpdateMessages;
