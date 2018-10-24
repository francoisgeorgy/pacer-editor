import React from "react";
import "./Preset.css";
// import StompSwitch from "./StompSwitch";

const Control = ({ name, onClick }) =>
    <div className="switch" onClick={onClick}>
        <div className="name">{name}</div>
    </div>;


const Preset = ({ name, currentControl, onClick }) =>
    <div className="preset">

        <h2>Preset {name}:</h2>

        {/*<h3>Stompswitches:</h3>*/}

        <div className="controls">
            {
                Array.from(Array(4).keys()).map(
                    i => {
                        let id = `FS ${(i+1)}`;
                        return <Control name={id} onClick={onClick} />
                    }
                )
            }
            {
                Array.from(Array(2).keys()).map(
                    i => {
                        let id = `EXP ${(i+1)}`;
                        return <Control name={id} onClick={onClick} />
                    }
                )
            }
            {
                ['', 'A', 'B', 'C', 'D', ''].map(
                    e => <Control name={e} onClick={onClick} />
                )
            }
            {
                Array.from(Array(6).keys()).map(
                    i => {
                        let id = (i+1);
                        return <Control name={id} onClick={onClick} />
                    }
                )
            }
        </div>
        {/*<h3>External footswitches:</h3>*/}
        <div className="external-footswitches">
        </div>
        {/*<h3>Expression pedals:</h3>*/}
        <div className="expression-pedals">
        </div>
    </div>;


export default Preset;
