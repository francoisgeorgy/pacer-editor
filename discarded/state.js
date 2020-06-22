import {produce} from "immer";
import {TARGET_PRESET} from "../pacer/constants";
import {buildPresetNameSysex} from "../pacer/sysex";

/*
export const updateMessageName =
    produce((draft, name) => {
        console.log("immer draft", draft.data);
        draft.data[TARGET_PRESET][draft.presetIndex]["name"] = name;
        draft.data[TARGET_PRESET][draft.presetIndex]["changed"] = true;
        draft.changed = true;

        if (!draft.updateMessages.hasOwnProperty(draft.presetIndex)) draft.updateMessages[draft.presetIndex] = {};
        if (!draft.updateMessages[draft.presetIndex].hasOwnProperty("name")) draft.updateMessages[draft.presetIndex]["name"] = [];

        draft.updateMessages[draft.presetIndex]["name"] = buildPresetNameSysex(draft.presetIndex, draft.data);
    });
*/

// (state, props) => stateChange
export const updateMessageName = (state, props) => {

    if (props.name === undefined || props.name === null) return null;

    if (props.name.length > 5) {
        console.warn(`Presets.updateName: name too long: ${props.name}`);
        return null;    // Calling .setState with null no longer triggers an update in React 16.
    }

    return produce(state, draft => {
        // console.log("immer draft", draft.data, props.name);
        draft.data[TARGET_PRESET][draft.presetIndex]["name"] = props.name;
        draft.data[TARGET_PRESET][draft.presetIndex]["changed"] = true;     //TODO: used?
        draft.changed = true;

        if (!draft.updateMessages.hasOwnProperty(draft.presetIndex)) draft.updateMessages[draft.presetIndex] = {};
        if (!draft.updateMessages[draft.presetIndex].hasOwnProperty("name")) draft.updateMessages[draft.presetIndex]["name"] = {};

        //FIXME: update the methods that read updateMessages to allow object or array
        draft.updateMessages[draft.presetIndex]["name"]["dummy"] = buildPresetNameSysex(draft.presetIndex, draft.data);
    });
};