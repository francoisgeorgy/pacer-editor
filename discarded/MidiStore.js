import {decorate, observable} from "mobx";

class MidiStore {

    constructor() {
        // console.log("MidiStore constructor");
        // this.rootStore = rootStore;
        // this.interface = null;
        // this.inputs = [];     //TODO: create array instead
        // this.outputs = [];
        this.onStateChange = this.onStateChange.bind(this);     // very important
        this.onMidiMessage = this.onMidiMessage.bind(this);     // very important
        this.requestMidi(); //.then(r => console.log(r));
    }
}

decorate(MidiStore, {
    interface: observable,
    inputs: observable,
    outputs: observable,
    inputInUseId: observable,
    outputInUseId: observable
});

export default new MidiStore();
