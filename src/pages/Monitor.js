import React, {Component} from 'react';
import "./Monitor.css";

class Monitor extends Component {

    render() {
        return (
            <div className="wrapper">
                <div className="monitor-link">
                    Please use the new MIDI monitor available at <a href="https://studiocode.dev/midi-monitor/" target="_blank" rel="noopener noreferrer">https://studiocode.dev/midi-monitor/</a>
                </div>
            </div>
        );
    }

}

export default Monitor;
