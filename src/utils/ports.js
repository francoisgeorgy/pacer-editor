import WebMidi from "webmidi";

function portById(id) {
    let p = WebMidi.inputs.find(item => item.id === id);
    if (p) {
        return p;
    } else {
        return WebMidi.outputs.find(item => item.id === id);
    }
}

function inputById(id) {
    return WebMidi.inputs.find(item => item.id === id);
}

/**
 * Return webmidi input name from input id
 * @param id
 */
function inputName(id) {
    let i = WebMidi.inputs.find(item => item.id === id);
    return i ? i.name : null;
}

function outputById(id) {
    return WebMidi.outputs.find(item => item.id === id);
}

export {
    portById,
    inputById,
    inputName,
    outputById
}
