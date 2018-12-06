import React, {Component} from 'react';
import Dropzone from "react-dropzone";
import {produce} from "immer";
import {isSysexData, mergeDeep, parseSysexDump} from "../pacer/sysex";
import Midi from "../components/Midi";
import {ANY_MIDI_PORT, PACER_MIDI_PORT_NAME, TARGET_PRESET} from "../pacer/constants";
import PortsGrid from "../components/PortsGrid";
import {presetIndexToXY} from "../pacer/utils";
import DumpSysex from "../components/DumpSysex";
import Download from "../components/Download";

const MAX_FILE_SIZE = 5 * 1024*1024;


const Preset = ({ index, data }) => {
    if (data === null || data === undefined) return null;
    return (
        <div>
            <h3>Preset {presetIndexToXY(parseInt(index, 10))} (#{index}): {data["name"]}</h3>
            <Download data={data}
                      filename={`pacer-preset-${presetIndexToXY(index)}`}
                      addTimestamp={true} label="Download as a binary sysex file" />
        </div>
    );
};

const Presets = ({ presets }) => {
    console.log("Presets", presets);
    if (presets === null || presets === undefined) return null;
    return (
        <div>
            {Object.keys(presets).map(idx => <Preset key={idx} index={idx} data={presets[idx]} />)}
        </div>
    );
};


class Files extends Component {

    state = {
        data: null
    };

    /**
     * Ad-hoc method to show the busy flag and set a timeout to make sure the busy flag is hidden after a timeout.
     */
    showBusy = () =>  {
        setTimeout(() => this.props.onBusy(false), 20000);
        this.props.onBusy(true);
    };

    /**
     *
     * @param files
     * @returns {Promise<void>}
     */
/*
    async readFiles(files) {
        await Promise.all(files.map(
            async file => {
                if (file.size > MAX_FILE_SIZE) {
                    console.warn(`${file.name}: file too big, ${file.size}`);
                } else {
                    this.showBusy();
                    const data = new Uint8Array(await new Response(file).arrayBuffer());
                    if (isSysexData(data)) {
                        this.setState(
                            produce(draft => {
                                draft.data = mergeDeep(draft.data || {}, parseSysexDump(data));
                                this.props.onBusy(false);
                            })
                        );
                        // this.addInfoMessage("sysfile decoded");
                    // } else {
                    //     console.log("readFiles: not a sysfile", hs(data.slice(0, 5)));
                    }
                    this.props.onBusy(false);
                    // non sysex files are ignored
                }
                // too big files are ignored
            }
        ));
    }
*/

    handleMidiInputEvent = (event) => {
        console.log("Files.handleMidiInputEvent", event, event.data);
        // if (event instanceof MIDIMessageEvent) {
        if (isSysexData(event.data)) {
            console.log("Files.handleMidiInputEvent: data is SysEx");
            this.setState(
                produce(draft => {
                    draft.data = mergeDeep(draft.data || {}, parseSysexDump(event.data));
                    // this.props.onBusy(false);
                })
            )
        } else {
            console.log("MIDI message is not a sysex message")
        }
        // }
    };


    /**
     * @returns {*}
     */
    render() {

        const { data } = this.state;

        // console.log("Files.render", this.props);

        console.log("Files.render", data);

        return (
            <div className="wrapper">

                <div className="subheader">
                    <Midi only={ANY_MIDI_PORT} autoConnect={PACER_MIDI_PORT_NAME}
                          portsRenderer={(groupedPorts, clickHandler) => <PortsGrid groupedPorts={groupedPorts} clickHandler={clickHandler} />}
                          onMidiInputEvent={this.handleMidiInputEvent}
                          className="sub-header" >
                        <div className="no-midi">Please connect your Pacer to your computer.</div>
                    </Midi>
                </div>

                <div className="content">
                    <div className="content-row-content no-grad">
                        <div className="content-row-content-content">
{/*
                            <div className="instructions">
                                Send a dump from your Pacer.
                            </div>
*/}
                            <div>
                                {data && <Presets presets={data[TARGET_PRESET]} />}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        );
    }
}

export default Files;
