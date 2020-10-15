import React, {Component} from "react";
import {inject, observer} from "mobx-react";

class BusyIndicator extends Component {

    render() {

        const { busy, busyMessage, progress } = this.props.state;
        return busy ?
            <div className={this.props.className || 'busy'}>
                {this.props.busyMessage ? this.props.busyMessage : busyMessage}
                {/*{<span> {progress} %</span>}*/}
                {progress >= 0 && <span> {progress}%</span>}
            </div>
            : null;
    }

}

export default inject('state')(observer(BusyIndicator));

