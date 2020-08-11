import React from 'react';
import {
    MSG_AD_ATCHAN,
    MSG_AD_MIDI_CC,
    MSG_AD_NRPN_COARSE,
    MSG_AD_NRPN_FINE,
    MSG_AD_PITCH_BEND,
    MSG_CTRL_OFF,
    MSG_DAWFUNC,
    MSG_ENC_ATCHAN,
    MSG_ENC_CC,
    MSG_ENC_MIDICC_REL,
    MSG_ENC_NRPN_COARSE,
    MSG_ENC_NRPN_FINE,
    MSG_ENC_PITCH, MSG_ENC_PRESET_SELECT,
    MSG_ENC_PROGRAM, MSG_ENC_STEP_SELECT, MSG_LOAD_CC,
    MSG_SW_MIDI_CC,
    MSG_SW_MIDI_CC_STEP,
    MSG_SW_MIDI_CC_TGGLE,
    MSG_SW_MMC,
    MSG_SW_NOTE,
    MSG_SW_NOTE_TGGLE,
    MSG_SW_NRPN_COARSE,
    MSG_SW_NRPN_FINE,
    MSG_SW_PRESET_INC_DEC,
    MSG_SW_PRESET_SELECT,
    MSG_SW_PRG_BANK,
    MSG_SW_PRG_STEP,
    MSG_SW_RELAY,
    MSG_SW_STEP_INC_DEC,
    MSG_SW_STEP_SELECT, MSG_TYPES_DATA_USAGE, PRESET_TARGET,
    TARGET_NAME
} from "../pacer/constants";
import * as Note from "tonal-note";

export const DataInputField = ({ msgType, value, dataIndex, onChange }) => {

    if (!MSG_TYPES_DATA_USAGE[msgType][dataIndex]) return '';

    switch (msgType) {

        case MSG_CTRL_OFF:
            return '';

        case MSG_SW_NOTE:
        case MSG_SW_NOTE_TGGLE:
            if (dataIndex !== 0) {
                return <input type="text" value={value} onChange={(event) => onChange(dataIndex, event.target.value)} />;
            } else {
                return (
                    <select value={value} onChange={(event) => onChange(dataIndex, event.target.value)} className="notes">{
                        Array.from(Array(127).keys()).map(i => {
                            const n = Note.fromMidi(i, true);
                            return <option key={i} value={i}>{n} ({i})</option>
                        })
                    }</select>
                );
            }

        case MSG_SW_STEP_SELECT:
            if (dataIndex === 0) {
                return (
                    <select value={value} onChange={(event) => onChange(dataIndex, event.target.value)}>{
                        TARGET_NAME.map((target, index) => {
                            return target ? <option key={index} value={index}>{target}</option> : null
                        })
                    }</select>);
            } else {
                return (
                    <select value={value} onChange={(event) => onChange(dataIndex, event.target.value)}>
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                        <option value={6}>6</option>
                    </select>);
            }

        case MSG_SW_STEP_INC_DEC:
            if (dataIndex === 0) {
                return (
                    <select value={value} onChange={(event) => onChange(dataIndex, event.target.value)}>{
                        TARGET_NAME.map((target, index) => {
                            return target ? <option key={index} value={index}>{target}</option> : null
                        })
                    }</select>);
            } else {
                return <input type="text" value={value} onChange={(event) => onChange(dataIndex, event.target.value)}/>;
            }

        case MSG_SW_RELAY:
            if (dataIndex === 0) {
                return (
                    <select value={value} onChange={(event) => onChange(dataIndex, event.target.value)}>
                        <option value={0}>Auto detect</option>
                        <option value={1}>Normally open</option>
                        <option value={2}>Normally closed</option>
                        <option value={3}>Latching</option>
                    </select>);
            } else {
                return (
                    <select value={value} onChange={(event) => onChange(dataIndex, event.target.value)}>
                        <option value={0}>Relay 1</option>
                        <option value={1}>Relay 2</option>
                        <option value={2}>Relay 3</option>
                        <option value={3}>Relay 4</option>
                    </select>);
            }

        case MSG_SW_PRESET_SELECT:
        case MSG_ENC_PRESET_SELECT:
            if (dataIndex === 0) {
                return (
                    <select value={value} onChange={(event) => onChange(dataIndex, event.target.value)}>
                        {PRESET_TARGET.map((name, index) => <option key={index} value={index}>{name}</option>)}
                    </select>);
            } else {
                return '';
            }

        case MSG_AD_MIDI_CC:
        case MSG_AD_NRPN_COARSE:
        case MSG_AD_NRPN_FINE: 
        case MSG_AD_PITCH_BEND: 
        case MSG_AD_ATCHAN: 
        case MSG_DAWFUNC:
        case MSG_SW_MIDI_CC_TGGLE:
        case MSG_SW_MIDI_CC: 
        case MSG_SW_MIDI_CC_STEP: 
        case MSG_SW_PRG_BANK:
        case MSG_SW_PRG_STEP: 
        case MSG_SW_NRPN_COARSE: 
        case MSG_SW_NRPN_FINE: 
        case MSG_SW_MMC: 
        case MSG_SW_PRESET_INC_DEC:
        case MSG_ENC_CC:
        case MSG_ENC_MIDICC_REL: 
        case MSG_ENC_NRPN_COARSE: 
        case MSG_ENC_NRPN_FINE: 
        case MSG_ENC_PITCH: 
        case MSG_ENC_ATCHAN: 
        case MSG_ENC_PROGRAM: 
        case MSG_ENC_STEP_SELECT:
        case MSG_LOAD_CC:
        default:
            return <input type="text" value={value} onChange={(event) => onChange(dataIndex, event.target.value)} />
    }

};
