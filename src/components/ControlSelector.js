import React, {Component} from "react";
import {FOOTSWITCHES, STOMPSWITCHES_TOP, STOMPSWITCHES_BOTTOM, EXPPEDALS, CONTROLS} from "../pacer/constants";
import {inject, observer} from "mobx-react";
import "./ControlSelector.css";

const Control = ({ name, controlIndex, selected, onSelect }) => {
    // console.log("Control", name, controlIndex, typeof name, typeof controlIndex);
    return (
        <div className={selected ? "selector selected" : "selector"} onClick={() => onSelect(controlIndex)}>
            <div className="name">{name}</div>
        </div>
    );
}


class ControlSelector extends Component {

    selectControl = (controlId) => {
        this.props.state.selectControl(controlId);
    };

    render() {
        const c = this.props.state.currentControl;
        return (
            <div className="controls">
                {FOOTSWITCHES.map(key => <Control key={key} name={CONTROLS[key]} controlIndex={key} selected={key === c} onSelect={this.selectControl} />)}
                {EXPPEDALS.map(key => <Control key={key} name={CONTROLS[key]} controlIndex={key} selected={key === c} onSelect={this.selectControl} />)}
                <div className="no-control">&nbsp;</div>
                {STOMPSWITCHES_TOP.map(key => <Control key={key} name={CONTROLS[key]} controlIndex={key} selected={key === c} onSelect={this.selectControl} />)}
                <div className="no-control">&nbsp;</div>
                {STOMPSWITCHES_BOTTOM.map(key => <Control key={key} name={CONTROLS[key]} controlIndex={key} selected={key === c} onSelect={this.selectControl} />)}
            </div>
        );
    }
}

export default inject('state')(observer(ControlSelector));
