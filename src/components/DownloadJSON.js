import React, {Component} from "react";

class DownloadJSON extends Component {

    handleClick = (event) => {

        const url = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.props.data));

        // let url = window.URL.createObjectURL(new Blob([this.props.data], {type: "application/octet-stream"}));

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
        shadowlink.download = filename + ".json";
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
        return (
            <button onClick={this.handleClick} className={this.props.className}>{this.props.label}</button>
        );
    }

}

export default DownloadJSON;
