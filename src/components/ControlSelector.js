import React from "react";
import {FOOTSWITCHES, STOMPSWITCHES_TOP, STOMPSWITCHES_BOTTOM, EXPPEDALS, CONTROLS} from "../pacer";
import "./ControlSelector.css";

const Control = ({ name, id, selected, onClick }) =>
    <div className={selected ? "selected" : ""} onClick={() => onClick(id)}>
        <div className="name">{name}</div>
    </div>;


const ControlSelector = ({ currentControl, onClick }) =>
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
        <div className="no-control">&nbsp;</div>
        {
            STOMPSWITCHES_TOP.map(
                key => <Control key={key} name={CONTROLS[key]} id={key} selected={key === currentControl} onClick={onClick} />
            )
        }
        <div className="no-control">&nbsp;</div>
        {
            STOMPSWITCHES_BOTTOM.map(
                key => <Control key={key} name={CONTROLS[key]} id={key} selected={key === currentControl} onClick={onClick} />
            )
        }
    </div>;


export default ControlSelector;
