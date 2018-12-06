import React, {Fragment} from 'react';
import Switch from "react-switch";

const PortsGrid = ({ groupedPorts, clickHandler }) => {

    // console.log("PortsGrid", groupedPorts);

    return (
        <div className="ports-grid">
            {/*<div className="grid-header">MIDI port</div>*/}
            {/*<div className="grid-header">IN</div>*/}
            {/*<div className="grid-header">OUT</div>*/}
            {Object.keys(groupedPorts).map((name, index) =>
                <div className="port" key={index}>
                    <div className="port-name">{name}</div>
                    {groupedPorts[name].input &&
                    <div className="port-switch">
                        <Fragment>
                            in&nbsp;<Switch
                                onChange={() => clickHandler(groupedPorts[name].input.id)}
                                checked={groupedPorts[name].input.selected}
                                className="react-switch"
                                id={`switch-${groupedPorts[name].input.id}`}
                                height={16} width={36}
                            />
                        </Fragment>
                    </div>}
                    {groupedPorts[name].output &&
                    <div className="port-switch">
                        <Fragment>
                            out&nbsp;<Switch
                                onChange={() => clickHandler(groupedPorts[name].output.id)}
                                checked={groupedPorts[name].output.selected}
                                className="react-switch"
                                id={`switch-${groupedPorts[name].output.id}`}
                                height={16} width={36}
                            />
                        </Fragment>
                    </div>}
                </div>
            )}
        </div>
    );

};

export default PortsGrid;
