import React from "react";
import "./Status.css";

const Status = ({ messages }) =>
    <div className="status">
        {
            messages.map(
                (msg, i) => <div key={i} className={`status-${msg.type}`}>{msg.message}</div>
            )
        }
    </div>;

export default Status;
