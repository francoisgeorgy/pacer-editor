import React, {Component} from 'react';
import PresetSelector from "../components/PresetSelector";
import ChordsSelector from "../components/ChordsSelector";
import "./Chords.css";
import * as Scale from "tonal-scale"


class Chords extends Component {

    state = {
        output: null,       // MIDI output port used for output
        presetIndex: "",    // preset name, like "B2"
        // controlId: "",      //
        // changed: false,     // true when the control has been edited
        // data: null,
        // statusMessages: []
        scale: null
    };

    setScale = (event) => {
        this.setState({scale: event.target.value});
    };

    render() {

        // console.log(Scale.chords("major"));

        const { presetIndex, scale } = this.state;

        return (
            <div className="wrapper">
                <div className="content">
                    <div className="content-row step-1">
{/*
                        <div className="background">
                            Connect
                        </div>
                        <div className="content-row-header">
                            1
                        </div>
*/}
                        <div className="content-row-content row-middle-aligned">
                            <div className="sorry">Sorry, this feature is not implemented yet.</div>
                        </div>
                    </div>
                    <div className="content-row step-2">
{/*
                        <div className="background">
                            Select
                        </div>
                        <div className="content-row-header">
                            2
                        </div>
*/}
                        <div className="content-row-content">
                            <h2>Choose the preset:</h2>
                            <div className="selectors">
                                <PresetSelector currentPreset={presetIndex} onClick={this.selectPreset} />
                            </div>
                        </div>
                    </div>
                    <div className="content-row step-3">
{/*
                        <div className="background">
                            Edit
                        </div>
                        <div className="content-row-header">
                            3
                        </div>
*/}
                        <div className="content-row-content">
                            <p>Choose six chords, with up to six notes per chords, and assign them to the stompswitches 1-6.</p>
                            <p>Choose if you want the notes to be played in one shot (like a regular chord) or in sequence (like an arpeggio).</p>

                            <div className="harmony">
                                <div>
                                    Scale:
                                    <select defaultValue={scale} onChange={this.setScale}>
                                    {
                                        Scale.names().map(
                                            (scale, index) => <option key={scale} value={scale}>{scale}</option>
                                        )
                                    }
                                    </select>
                                </div>
                                <div>
                                    Tonic: <select></select>
                                </div>
                            </div>
                            <ChordsSelector scale={scale}/>
                        </div>
                    </div>
                    <div className="content-row step-4">
{/*
                        <div className="background">
                            Write
                        </div>
                        <div className="content-row-header">
                            4
                        </div>
*/}
                        <div className="content-row-content">
                        </div>
                    </div>
                </div>
                <div className="help">
                    <h3>Help</h3>
                </div>
            </div>
        );
    }

}

export default Chords;
