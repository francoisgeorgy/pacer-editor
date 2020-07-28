import React, {Component, Fragment} from 'react';
import {
    MSG_CTRL_OFF,
    MSG_SW_NOTE,
    MSG_TYPES_FULLNAME_MIDI_SORTED,
    MSG_TYPES_DATA_HELP, TARGET_PRESET
} from "../pacer/constants";
import * as Note from "tonal-note";
import {inject, observer} from "mobx-react";
import {state} from "../stores/StateStore";
import "./MidiSettingsEditor.css";

const MidiNote = ({ note, onChange }) => {
    return (
        <select onChange={(event) => onChange(event.target.value)} value={note}>
            {
                Array.from(Array(127).keys()).map(
                    i => {
                        let n = Note.fromMidi(i, true);
                        return <option key={i} value={i}>{n}</option>
                    })
            }
        </select>
    );
};

const Setting = observer(({ index, config  }) => {

    // console.log("Setting", index, config.msg_type);

    let inactive = config.msg_type === MSG_CTRL_OFF;

    if (inactive) {
        return (
            <Fragment>
                <div className="setting-row-header">message {index}:</div>
                <div>
                    <select onChange={(event) => state.updateMidiSettings(index, "msg_type", null, event.target.value)} value={config.msg_type}>
                        {MSG_TYPES_FULLNAME_MIDI_SORTED.map(v => <option key={v.key} value={v.key}>{v.value}</option>)}
                    </select>
                </div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </Fragment>
        );
    }

    if (!config.data) return null;

    let d0, d1, d2;
    if (config.msg_type === MSG_SW_NOTE) {
        d0 = <MidiNote note={config.data[0]} onChange={(value) => state.updateMidiSettings(index, "data", 0, value)} />;
        d1 = <input type="text" value={config.data[1]} onChange={(event) => state.updateMidiSettings(index, "data", 1, event.target.value)} />;
        d2 = '';
    } else {
        d0 = <input type="text" value={config.data[0]} onChange={(event) => state.updateMidiSettings(index, "data", 0, event.target.value)} />;
        d1 = <input type="text" value={config.data[1]} onChange={(event) => state.updateMidiSettings(index, "data", 1, event.target.value)} />;
        d2 = <input type="text" value={config.data[2]} onChange={(event) => state.updateMidiSettings(index, "data", 2, event.target.value)} />;
    }

    return (
        <Fragment>
            <div className="setting-row-header">Setting {index}:</div>
            <div>
                <select onChange={(event) => state.updateMidiSettings(index, "msg_type", null, event.target.value)} value={config.msg_type}>
                    {MSG_TYPES_FULLNAME_MIDI_SORTED.map(v => <option key={v.key} value={v.key}>{v.value}</option>)}
                </select>
            </div>
            <div>{d0}<div className="data-help">{MSG_TYPES_DATA_HELP[config.msg_type][0]}</div></div>
            <div>{d1}<div className="data-help">{MSG_TYPES_DATA_HELP[config.msg_type][1]}</div></div>
            <div>{d2}<div className="data-help">{MSG_TYPES_DATA_HELP[config.msg_type][2]}</div></div>
            <div>
                <select onChange={(event) => state.updateMidiSettings(index, "channel", null, event.target.value)} value={config.channel}>
                    {Array.from(Array(17).keys()).map(i => <option key={i} value={i}>{i === 0 ? 'global' : i}</option>)}
                </select>
            </div>
        </Fragment>
    );
});

class MidiSettingsEditor extends Component {

    render() {

        const settings = this.props.state.data[TARGET_PRESET][this.props.state.currentPresetIndex]["midi"]

        return (
            <div className="settings">
                <div></div>
                <div className="setting-col-header">Type</div>
                <div className="setting-col-header">Data 1</div>
                <div className="setting-col-header">Data 2</div>
                <div className="setting-col-header">Data 3</div>
                <div className="setting-col-header">MIDI Ch.</div>
                {Object.keys(settings).map(i =>
                    <Setting key={i} index={i} config={settings[i]} />
                )}
            </div>
        );
    }
}

export default inject('state')(observer(MidiSettingsEditor));
