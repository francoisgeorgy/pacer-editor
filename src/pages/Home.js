import React, {Component} from 'react';
import "./Home.css";

class Home extends Component {

    render() {

        return (
            <div className="content home">

                <h1>Requirements</h1>

                <div className="doc">
                    <p>This application requires a browser that support
                        the <a href="http://webaudio.github.io/web-midi-api/" target="_blank" rel="noopener noreferrer">Web MIDI API</a>.</p>

                    <p>Currently, only <span className="strong">Chrome</span> and <span className="strong">Opera</span> support this standard.
                        This application will therefore <span className="italic">not</span> work in Firefox, Safari, IE or Edge.</p>
                </div>

                <h1>Limitations</h1>

                <div className="doc">
                    <p>The current version of this editor isn't able to edit the Global configuration of the Pacer.</p>
                    <p>This editor is provided as-is, without warranty of any kind, express or implied. If you encounter a bug, please fill a bug report with <a href="https://github.com/francoisgeorgy/pacer-editor/issues/new" target="_blank" rel="noopener noreferrer">this form</a>.</p>
                </div>

                <h1>Connecting your Pacer</h1>
                <div className="doc">
                    <p>1. Make sure your Pacer is connected to your computer and switched-on.</p>
                    <p>2. In the application, check the MIDI settings.</p>
                    <p>You need to enable the following input and output ports:</p>
                    <p><span className="bold" >Mac</span>:</p>
                    <img src="ports-mac.png" alt="" />
                    <p><span className="bold" >Windows</span>:</p>
                    <img src="ports-windows.png" alt="" />
                    <p>This editor listen on all MIDI ports. A future version may offer the possibility to choose a specific port.</p>
                </div>

                <h1>Editing presets</h1>
                <div className="doc">
                    <p>The preset <span className="strong">CUR</span> is the <span className="italic fluo">current</span> preset.
                        When you edit preset <span className="strong">CUR</span> your changes are immediately applied.</p>
                    <p>When you edit any other presets, you edit the <span className="fluo">saved</span> settings of the preset
                        and your changes will only be applied when you <span className="fluo">load</span> this preset in the Pacer.</p>

                    <p>It is currently not possible to load the preset from this editor.</p>

                    <div>
                        <h3>Example 1:</h3>
                        <p>The currently loaded preset (CUR) is preset <span className="strong">A5</span>.</p>
                        <p>You edit the preset <span className="strong">A5</span>.</p>
                        <p>After you save your modifications, the display will show dots. That means the current preset does not reflect the saved preset anymore.
                            You have to <span className="fluo">reload</span> the preset to be able to use your updated version:</p>
                        <p>- long-press <span className="strong">Preset</span> switch, then press switch <span className="strong">A</span>, then press switch <span className="strong">5</span>.</p>
                    </div>

                    <div>
                        <h3>Example 1:</h3>
                        <p>The currently loaded preset (CUR) is preset <span className="strong">A1</span>.</p>
                        <p>You edit the preset <span className="strong">D3</span>.</p>
                        <p>After you save your modifications of preset <span className="strong">D3</span>, if you want to use it, of course you have to load it:</p>
                        <p>- long-press <span className="strong">Preset</span> switch, then press switch <span className="strong">D</span>, then press switch <span className="strong">3</span>.</p>
                    </div>

                </div>

                <h1>In case of problem</h1>
                <div className="doc">
                    <p>Try the following:</p>
                    <p>- Check the MIDI configuration.</p>
                    <p>- Reload the editor (F5 or Cmd-R or Ctrl-R)</p>
                    <p>- Restart the Pacer.</p>
                    <p>If you mess up the configuration of your Pacer, do a <span className="fluo">Factory Restore</span>. See page 21 of the Pacer User Guide for the procedure.</p>
                </div>

                <h1>MIDI in your browser</h1>

                <div className="doc">
                    <div>
                        <p>You need to allow your browser to use your MIDI device:</p>
                        <img src="help-01.png" alt="" />
                    </div>
                    <div>
                        <p>In case you didn't allow the use of MIDI device and want to change that, you can right-click on the URL icon and change the setting:</p>
                        <img src="help-02.png" alt="" />
                    </div>
                </div>

                <h1>FAQ</h1>

                <div className="doc">
                    <p><i>To be completed...</i></p>
                </div>

                <h1>Contribute</h1>

                <div className="doc">
                    <p>This editor is an Open Source project. You are welcome to contribute.</p>
                    <p>The source-code is hosted
                    by GitHub: <a href="https://github.com/francoisgeorgy/pacer-editor" target="_blank" rel="noopener noreferrer">pacer-editor</a></p>
                    <p>To contribute your bug fixes, new features, etc.: 1) fork the project, 2) create a pull-request.</p>
                </div>

                <h1>Thanks</h1>

                <div className="doc">
                    <p>Thank you to the Nektar support service for having provided precious informations regarding the SysEx data format of the Pacer.
                        This editor would not have been possible without their support.</p>
                </div>

            </div>
        );
    }

}

export default Home;
