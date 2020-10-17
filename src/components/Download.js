import React, {Component} from "react";
import {inject, observer} from "mobx-react";
import {flatDeep} from "../utils/misc";

class Download extends Component {

    handleClick = (event) => {

        // const d = typeof this.props.data === 'function' ? this.props.data() : this.props.data;
        // console.log("Download: ", this.props.data, d.length, d);
        // let url = window.URL.createObjectURL(new Blob([d], {type: "application/octet-stream"}));

        // const d = this.props.state.getBytesPresetsAsBlob();
        const byteArray = new Uint8Array(flatDeep(this.props.state.bytesPresets, 10));
        // console.log("Download: ", typeof d, d.length, d);
        console.log("Download: ", byteArray);
        let url = window.URL.createObjectURL(new Blob([byteArray], {type: "application/octet-stream"}));

        // const d = flatDeep(this.props.state.bytesPresets, 10);
        // console.log("Download: ", typeof d, d.length, d, d.buffer);
        // let url = window.URL.createObjectURL(new Blob([d], {type: "application/octet-stream"}));

        let filename = this.props.filename;

        if (this.props.addTimestamp) {
            let now = new Date();
            let timestamp =
                now.getUTCFullYear() + "-" +
                ("0" + (now.getUTCMonth() + 1)).slice(-2) + "-" +
                ("0" + now.getUTCDate()).slice(-2) + "-" +
                ("0" + now.getUTCHours()).slice(-2) + "" +
                ("0" + now.getUTCMinutes()).slice(-2) + "" +
                ("0" + now.getUTCSeconds()).slice(-2);
            filename += '.' + timestamp;
        }

        let shadowlink = document.createElement("a");
        shadowlink.download = filename + ".syx";
        shadowlink.style.display = "none";
        shadowlink.href = url;

        document.body.appendChild(shadowlink);
        shadowlink.click();
        document.body.removeChild(shadowlink);

        setTimeout(function() {
            return window.URL.revokeObjectURL(url);
        }, 1000);

    };

    render() {
        if (this.props.disabled) {
            return (
                <button disabled={true} className={`action-button ${this.props.className}`}>{this.props.label}</button>
            );
        } else {
            return (
                <button onClick={this.handleClick} className={`action-button ${this.props.className}`}>{this.props.label}</button>
            );
        }
    }

}

export default inject('state')(observer(Download));
