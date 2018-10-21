import React, {Component} from "react";
// import * as WebMidi from "webmidi";
import "./MidiPorts.css";
import Switch from "react-switch";

class MidiPorts extends Component {

    isSelected = (port) => {
        return this.props.enabledPort === port.id;
    };

    /**
     * Render a group of midi connections
     * @param props
     * @returns {*}
     * @constructor
     */
    render() {
        // let ports = WebMidi.outputs;
        // if (!ports) return <div id={"ports"}></div>;
        return (
            <div id={"ports"}>
                {this.props.ports.map(
                    port => {
                        return (
                            <div key={port.id} className={this.isSelected(port) ? "port enabled" : "port"}>
                                <div className={"port-description"}>
                                    <div className="type">{port.type} {port.type === 'input' ? 'from' : 'to'}</div>
                                    <div className="port-name">{port.name}</div>
                                    <div className={port.manufacturer ? "port-manufacturer" : "port-manufacturer unknown"}>{port.manufacturer ? port.manufacturer : "unknown manufacturer"}</div>
                                </div>
                                <div className={"port-state"}>
                                    <Switch
                                        onChange={() => this.props.onToggle(port.id)}
                                        checked={this.isSelected(port)}
                                        className="react-switch"
                                        id="normal-switch"
                                        height={20} width={42}
                                    />
                                    <span className={this.isSelected(port) ? "port-usage selected" : "port-usage"}
                                          onClick={() => this.props.onToggle(port.id)}>{this.isSelected(port) ? "enabled" : "disabled"}</span>
                                </div>
                            </div>
                        );
                    }
                )}
            </div>
        );
    }

}

export default MidiPorts;
