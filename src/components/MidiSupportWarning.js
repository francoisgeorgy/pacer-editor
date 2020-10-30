import React, {Component} from 'react';
import "./MidiSupportWarning.css";

export class MidiSupportWarning extends Component {

    state = {
        supported: true
    };

    componentDidMount() {
        if (navigator.requestMIDIAccess) {
            console.log(`MidiSupportWarning: midi supported`);
        } else {
            console.log(`MidiSupportWarning: midi not supported`);
            this.setState({supported: false});
        }
    }
    render() {

        if (this.state.supported) return null;

        return (
            <div className="midi-support-warning-top">
                This browser does not support MIDI.
                See <a href="https://webmidi.info/" target="_blank" rel="noreferrer noopener">webmidi.info</a> for a list of browsers that support MIDI.
            </div>
        );

/*
        return (
            <div className="midi-support-warning-fs">
                <div>
                    <div className="warning-message-fs">
                        <h1>This browser does not support MIDI.</h1>
                        <p>Currently the browsers that support MIDI are:</p>
                        <ul>
                            <li>Google Chrome version 54 and above</li>
                            <li>Opera version 42 and above</li>
                            <li>Microsoft Edge (Chromium version) version 80 and above</li>
                        </ul>
                        <p>You can check if a browser supports WebMIDI by going to <a href="https://webmidi.info/" target="_blank" rel="noreferrer noopener">webmidi.info</a></p>
                    </div>
                </div>
            </div>
        );
*/
    }

}
