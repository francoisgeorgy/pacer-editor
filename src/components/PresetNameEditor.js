import React, {Component} from 'react';

class PresetNameEditor extends Component {

    onNameUpdate = (event) => {
        // console.log(`PresetNameEditor.onSettingUpdate`, event.target.value);
        this.props.onUpdate(event.target.value.length > 5 ? event.target.value.substr(0, 5) : event.target.value);
    };

    render() {
        const name = this.props.name;
        return (
            <div className="preset-name">
                <p>The preset name is limited to 5 characters.</p>
                <span className="strong">Name:</span> <input value={name} onChange={this.onNameUpdate} size={8} />
            </div>
        );
    }
}

export default PresetNameEditor;
