import React from 'react'
import MidiStore from "../stores/MidiStore";
import StateStore from "../stores/StateStore";

export const storesContext = React.createContext({
    midiStore: MidiStore,
    stateStore: StateStore
});
