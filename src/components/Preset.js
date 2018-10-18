import React from "react";
import "./Preset.css";
import StompSwitch from "./StompSwitch";

const Preset = ({ name }) =>
    <div className="preset">
        <h2>Preset {name}:</h2>
        <h3>Stompswitches:</h3>
        <div className="stompswitches">
            {
                ['', 'A', 'B', 'C', 'D', ''].map(
                    e => <StompSwitch name={e} />
                )
            }
            {
                Array.from(Array(6).keys()).map(
                    i => {
                        let id = (i+1);
                        return <StompSwitch name={id} />
                    }
                )
            }
        </div>
        <h3>External footswitches:</h3>
        <div className="external-footswitches">
            {
                Array.from(Array(4).keys()).map(
                    i => {
                        let id = `FS ${(i+1)}`;
                        return <StompSwitch name={id} />
                    }
                )
            }
        </div>
        <h3>Expression pedals:</h3>
        <div className="expression-pedals">
            {
                Array.from(Array(2).keys()).map(
                    i => {
                        let id = `EXP ${(i+1)}`;
                        return <StompSwitch name={id} />
                    }
                )
            }
        </div>
    </div>;


export default Preset;
