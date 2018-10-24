import React from "react";
import "./Controls.css";
import {FOOTSWITCHES, STOMPSWITCHES_TOP, STOMPSWITCHES_BOTTOM, EXPPEDALS, CONTROLS} from "../pacer";

const Control = ({ name, id, selected, onClick }) =>
    <div className={selected ? "selected" : ""} onClick={() => onClick(id)}>
        <div className="name">{name}</div>
    </div>;


const Controls = ({ currentControl, onClick }) =>
    <div className="controls">
        {
            FOOTSWITCHES.map(
                key => <Control key={key} name={CONTROLS[key]} id={key} selected={key === currentControl} onClick={onClick} />
            )
        }
        {
            EXPPEDALS.map(
                key => <Control key={key} name={CONTROLS[key]} id={key} selected={key === currentControl} onClick={onClick} />
            )
        }
        <div className="empty">&nbsp;</div>
        {
            STOMPSWITCHES_TOP.map(
                key => <Control key={key} name={CONTROLS[key]} id={key} selected={key === currentControl} onClick={onClick} />
            )
        }
        <div className="empty">&nbsp;</div>
        {
            STOMPSWITCHES_BOTTOM.map(
                key => <Control key={key} name={CONTROLS[key]} id={key} selected={key === currentControl} onClick={onClick} />
            )
        }
    </div>;


export default Controls;
