import React, {Component} from 'react';
import {
    checksum,
    parseSysexDump,
    requestAllPresets,
    requestPreset,
    requestPresetObj, SYSEX_END, SYSEX_START
} from "../pacer/sysex";
import {SYSEX_SIGNATURE} from "../pacer/constants";
import {fromHexString, h, hs} from "../utils/hexstring";
import "./Debug.css";
import DumpSysex from "../components/DumpSysex";
import {SYSEX_HEADER} from "../pacer/constants";
import {inject, observer} from "mobx-react";
import DownloadJSON from "../components/DownloadJSON";

function replacerDec2Hex(key, value) {
    return typeof value === 'number' ? '0x' + h(value) : value;
}

function toSysExMessage(data) {
    // console.log("toSysExMessage", data, typeof data);
    if (data === null) return null;
    return [SYSEX_START, ...SYSEX_SIGNATURE, ...data, SYSEX_END];
}

// function batchMessages(callback, wait) {
//
//     let messages = [];  // batch of received messages
//     let timeout;
//
//     return function() {
//         clearTimeout(timeout);
//         let event = arguments[0];
//         messages.push(event.data);
//         timeout = setTimeout(() => {
//             // console.log("timeout elapsed");
//             timeout = null;
//             callback(messages);
//             messages = [];
//         }, wait);
//     };
// }

class Debug extends Component {

    state = {
        output: null,           // MIDI output port used for output
        data: null,
        messages: [{
            name: "read current preset",
            message: requestPreset(0),
            bytesExpected: 189
        }, {
            name: "read preset A1",
            message: requestPreset(1),
            bytesExpected: 189
        }, {
            name: "read stompswitch #1 of preset #5",
            message: requestPresetObj(5, 0x0D),
            bytesExpected: 7
        }, {
            name: "read all presets (takes some time)",
            message: requestAllPresets(),
            bytesExpected: 4536
        }],
        customMessage: ""
    };

    /**
     * Ad-hoc method to show the busy flag and set a timeout to make sure the busy flag is hidden after a timeout.
     */
    showBusy = ({busy = false, busyMessage = null, bytesExpected = -1, bytesReceived = -1} = {}) =>  {
        // console.log("show busy", busyMessage);
        setTimeout(() => this.props.onBusy({busy: false}), 20000);
        this.props.onBusy({busy: true, busyMessage, bytesExpected, bytesReceived});
    };


/*
    handleMidiInputEvent = batchMessages(
        messages => {
            console.log(`total bytes received = ${messages.length}`);
            this.setState(
                produce(
                    draft => {
                        for (let m of messages) {
                            if (isSysexData(m)) {
                                draft.data = mergeDeep(draft.data || {}, parseSysexDump(m));
                            } else {
                                console.log("MIDI message is not a sysex message")
                            }
                        }
                        // let pId = Object.keys(draft.data[TARGET_PRESET])[0];
                        // draft.presetIndex = parseInt(pId, 10);
                    }
                )
            );
            // let bytes = messages.reduce((accumulator, element) => accumulator + element.length, 0);
            // this.addInfoMessage(`${messages.length} messages received (${bytes} bytes)`);
            this.props.onBusy({busy: false});
        },
        (n) => {
            // console.log(n);
            this.props.onBusy({busy: true, bytesReceived: n});
        },
        1000
    );
*/

/*
    onOutputConnection = (port_id) => {
        console.log("onOutputConnection");
        this.setState(
            produce(draft => {
                draft.output = port_id;
            })
        );
        // this.addInfoMessage(`output ${outputName(port_id)} connected`);
    };

    onOutputDisconnection = (port_id) => {
        console.log("onOutputDisconnection");
        this.setState(
            produce(draft => {
                draft.output = null;        // we manage only one output connection at a time
            })
        );
        // this.addInfoMessage(`output ${outputName(port_id)} disconnected`);
    };
*/

/*
    /!**
     *
     * @param msg
     *!/
    sendSysex = msg => {
        // console.log("sendSysex", msg);
        if (!this.state.output) {
            console.warn("no output enabled to send the message");
            return;
        }
        let out = outputById(this.state.output);
        if (!out) {
            console.warn(`send: output ${this.state.output} not found`);
            return;
        }
        this.showBusy();
        this.setState(
            {data: null},
            () => out.sendSysex(SYSEX_SIGNATURE, msg)
        );
    };
*/

    updateCustomMessage = (event) => {
        let s = (event.target.value.toUpperCase().match(/[0-9A-F ]+/g) || []).join('');
        this.setState({
            customMessage: s
        });
    };

    getCustomMessageData = () => {
        if (this.state.customMessage && this.state.customMessage !== "") {
            let d = fromHexString(this.state.customMessage, / /g);
            if (d) {
                let data = Array.from(d);
                // console.log("getCustomMessageData", data, typeof data);
                if (data && data.length > 0) {
                    data.push(checksum(data));
                    // let tmp = SYSEX_HEADER.concat(d);
                    // console.log("return custom message data", tmp, hs(data));
                    // return SYSEX_HEADER.concat(d);
                    return [SYSEX_HEADER, ...d];
                    // return data;
                }
            }
        }
        return null;
    };

    sendCustomMessage = () => {
        let d = this.getCustomMessageData();
        if (d && d.length > 0) {
            this.showBusy({busy: true, busyMessage: "receiving data...", bytesReceived: 0, bytesExpected: -1});
            this.sendSysex(d);
        }
        // if (this.state.customMessage) {
        //     let data = Array.from(fromHexString(this.state.customMessage, / /g));
        //     if (data && data.length > 0) {
        //         data.push(checksum(data));
        //         this.sendSysex(SYSEX_HEADER.concat(data));
        //     }
        // }
    };

    sendMessage = (msg) => {
        this.showBusy({busy: true, busyMessage: "receiving data...", bytesReceived: 0, bytesExpected: msg.bytesExpected});
        this.props.state.sendSysex(msg.message);
    };

    iniData = () => {

    }

    /**
     * @returns {*}
     */
    render() {

        console.log("Debug render");

        const { messages, customMessage } = this.state;
        const { data } = this.props.state;

        const cs = checksum(fromHexString(customMessage, / /g));

        let hex_msg = '';
        let s = (customMessage.toUpperCase().match(/[0-9A-F]+/g) || []).join('');
        for (let i=0; i < s.length; i++) {
            if ((i > 0) && (i % 2 === 0)) hex_msg += ' ';
            hex_msg += s[i];
        }

        let u = toSysExMessage(this.getCustomMessageData());
        let v = u ? JSON.stringify(parseSysexDump(Uint8Array.from(toSysExMessage(this.getCustomMessageData()))), replacerDec2Hex, 4) : "";

        return (
            <div className="wrapper">

{/*
                <div className="subheader">
                    <Midi only={ANY_MIDI_PORT} autoConnect={PACER_MIDI_PORT_NAME}
                          portsRenderer={(groupedPorts, clickHandler) => <PortsGrid groupedPorts={groupedPorts} clickHandler={clickHandler} />}
                          onMidiInputEvent={this.handleMidiInputEvent}
                          onOutputConnection={this.onOutputConnection}
                          onOutputDisconnection={this.onOutputDisconnection}>
                        <div className="no-midi">Please connect your Pacer to your computer.</div>
                    </Midi>
                </div>
*/}

                <div className="content">

                    <div>
                        <button onClick={() => this.props.state.initData()}>init data</button>
                    </div>

                    <div className="content-row-content">
                        <div className="debug">
                            {/*<DownloadJSON label="download as json" filename="data" data={this.props.state.data}/>*/}
                            <pre>{JSON.stringify(data, null, 4)}</pre>
                        </div>
                    </div>

{/*
                    <div className="content-row-content first">
                        <h2>Test messages:</h2>
                        <div className="content-row-content-content">
                        {messages.map((msg, i) =>
                            <div key={i} className="send-message">
                                <button onClick={() => this.sendMessage(msg)}>send</button>
                                <span className="code light">{ hs(SYSEX_SIGNATURE.concat(msg.message.slice(0, 1))) } </span>
                                <span className="code">{ hs(msg.message.slice(1, -1)) } </span>
                                <span className="code light"> {hs(msg.message.slice(-1))}</span>
                                <span className="message-name"> {msg.name}</span>
                            </div>
                        )}
                        </div>
                    </div>
*/}

{/*
                    <div className="content-row-content">
                        <h2>Custom message:</h2>
                        <div className="content-row-content-content">
                            <div className="send-message">
                                <button onClick={this.sendCustomMessage} disabled={(s.length % 2) !== 0}>send</button>
                                <span className="code light">{hs(SYSEX_SIGNATURE)} {hs(SYSEX_HEADER)} </span>
                                <input type="text" className="code" size="80" value={customMessage}
                                       placeholder={"hex digits only"} onChange={this.updateCustomMessage} />
                                <span className="code light"> {h(cs)}</span>
                            </div>

                            <div className="custom-message code">
                                <span className="code light">{hs(SYSEX_SIGNATURE)} {hs(SYSEX_HEADER)}</span> {hex_msg} <span className="code light">{h(cs)}</span>
                            </div>

                            <div className="debug">
                                {v ? <pre>{v}</pre> : <div>Invalid message. Send at your own risk.</div>}
                                <pre>{hs(toSysExMessage(this.getCustomMessageData()))}</pre>
                            </div>
                        </div>
                    </div>
*/}

{/*
                    <div className="content-row-content">
                        <h2>Response:</h2>
                        <div className="content-row-content-content">
                            <div className="message code">
                                <DumpSysex data={data} />
                            </div>
                        </div>
                    </div>
*/}

                    <div className="content-row-content">
                    </div>

{/*
                    <div className="content-row-content">
                        {messages.map((msg, i) => {
                            let d = Uint8Array.from(toSysExMessage(msg.message));
                            console.log('d', d);
                            return isSysexData(d) ?
                                <div className="debug" key={i}>
                                    <h4>[Debug] sysex data to send:</h4>
                                    <pre>{JSON.stringify(parseSysexDump(d), null, 4)}</pre>
                                </div> :
                                <div key={i}>nop {hs(d)}</div>
                            }
                        )}
                    </div>
*/}
{/*
                    <div className="content-row-content">
                        {data &&
                        <div className="debug">
                            <h4>[Debug] sysex data received:</h4>
                            <pre>{JSON.stringify(data, null, 4)}</pre>
                        </div>
                        }
                    </div>
*/}

                </div>

            </div>

        );
    }
}

export default inject('state')(observer(Debug));

