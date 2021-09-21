import React, {Component} from 'react';
import {TARGET_PRESET} from "../pacer/constants";
import {presetIndexToXY} from "../pacer/utils";
import Dropzone from "react-dropzone";
import {dropOverlayStyle} from "../utils/misc";
import {inject, observer} from "mobx-react";
import BusyIndicator from "../components/BusyIndicator";
import DownloadAllPresets from "../components/DownloadAllPresets";
import "./Patch.css";

class Patch extends Component {

    constructor(props) {
        super(props);
        this.inputOpenFileRef = React.createRef();
        this.state = {
            dropZoneActive: false,
            status: null
        };
    }

    onChangeFile = (e) => {
        let file = e.target.files[0];
        this.props.state.readFiles([file]);
    };

    onInputFile = (e) => {
        this.inputOpenFileRef.current.click();
    };

    onDragEnter = () => {
        this.setState({
            dropZoneActive: true
        });
    };

    onDragLeave= () => {
        this.setState({
            dropZoneActive: false
        });
    };

    /**
     * Drop Zone handler
     * @param files
     */
    onDrop = (files) => {
        this.setState(
            {
                dropZoneActive: false
            },
            () => {
                //TODO
                this.props.state.readFiles(files);
            }   // returned promise from readFiles() is ignored, this is normal.
        );
    };

    sendDump = () => {
        this.props.state.sendDump();
    }

    render() {

        // console.log("patch render");

        const { status, dropZoneActive } = this.state;
        // const output = this.props.state.midi.output;
        const data = this.props.state.data;

        // const q =  QueryString.parse(window.location.search);
        // const debug = q.debug ? q.debug === '1' : false;

        return (

            <Dropzone
                disableClick
                style={{position: "relative"}}
                onDrop={this.onDrop}
                onDragEnter={this.onDragEnter}
                onDragLeave={this.onDragLeave}>

                {dropZoneActive &&
                <div style={dropOverlayStyle}>
                    Drop sysex file...
                </div>}

                <div className="wrapper">
                    <div className="content">

                        <div className="content-row-content first dump-wrapper">

                            <h2>Import/Export presets</h2>

                            <div className="">
                                <p>
                                    This page allows you to import/export all the Pacer presets, or a selection, at once.
                                </p>
                                <p>
                                    The Global Config is not read or written by this tool.
                                </p>
                            </div>

                            <div className="mt-10">
                                <h3>Pacer &#x279C; save to file :</h3>
                                {this.props.state.connected &&
                                <div>
                                    {this.props.state.connected && <button className="action-button Xread" onClick={() => this.props.state.readFullDump()}>Read Pacer</button>}
                                    <DownloadAllPresets />
                                    <BusyIndicator className="space-left inline-busy" busyMessage={"reading pacer:"} />
                                </div>}
                                {!this.props.state.connected &&
                                <div className="mb-15 italic">
                                    Pacer not connected.
                                </div>}
                            </div>

                            <div className="mt-10">
                                <h3>Read file &#x279C; Pacer :</h3>
                                <input ref={this.inputOpenFileRef} type="file" style={{display:"none"}} onChange={this.onChangeFile} />
                                <button className="action-button" onClick={this.onInputFile}>Load sysex file</button>
                                {data && this.props.state.connected && <button className="action-button Xupdate" onClick={this.sendDump}>Send to Pacer</button>}
                                {this.props.state.sendProgress && <span>{this.props.state.sendProgress}</span>}
                            </div>

                            <div className="mt-10">
                                <h3>Data included in the dump:</h3>
                                <p>
                                    Presets marked "no data" are ignored and will not be sent to your Pacer or included in the sysex file.
                                </p>
                            </div>

                            <div className="patch-content">
                            {
                                Array.from(Array(24+1).keys()).map(
                                index => {
                                    let id = presetIndexToXY(index);
                                    let show = data && data[TARGET_PRESET] && data[TARGET_PRESET][index];
                                    let name = show ? data[TARGET_PRESET][index]["name"] : "";

                                    if (index === 0) return null;

                                    return (
                                        <div key={index}>
                                            {/*<div className="right-align">{index}</div>*/}
                                            <div>{id}</div>
                                            {show ? <div>{name}</div> : <div className="placeholder">no data</div>}
                                        </div>
                                    );
                                })
                            }
                            </div>

                            {status &&
                            <div className={`status ${status.severity}`}>
                                {status.message}
                            </div>
                            }

                            {data && <div className="Xpreset-buttons">
                                <button onClick={() => this.props.state.clear()}>CLEAR DATA</button>
                            </div>}

                        </div>

                    </div>

                </div>

{/*
                <div>
                    bytes: {this.props.state.bytes ? this.props.state.bytes.length : '-1'}
                    <pre>{toHexDump(this.props.state.bytes).map(s => s+'\n')}</pre>
                </div>
*/}

            </Dropzone>
        );
    }
}

export default inject('state')(observer(Patch));
