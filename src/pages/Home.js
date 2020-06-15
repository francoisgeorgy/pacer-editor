import React, {Component} from 'react';
import "./Home.css";

class Home extends Component {

    render() {

        return (
            <div className="content home">

                <h1>Requirements</h1>

                <div className="doc">
                    <p>This editor requires a browser that support
                        the <a href="http://webaudio.github.io/web-midi-api/" target="_blank" rel="noopener noreferrer">Web MIDI API</a>.</p>
                    <p>Currently, only <span className="strong">Chrome</span> and <span className="strong">Opera</span> support this standard.
                        This application will therefore <span className="italic">not</span> work in Firefox, Safari, IE or Edge.</p>
                    <p>This editor does not work on iPad or Android tablet either.</p>
                    <p>Ensure your Pacer is running the <a href="https://nektartech.com/updating-firmware-pacer/" target="_blank" rel="noopener noreferrer">latest firmware v10112</a>.</p>
                </div>

                <h1>Limitations</h1>

                <div className="doc">
                    <p>The current version of this editor isn't able to edit the Global configuration of the Pacer. This is planned for a future release.</p>
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

                <h1>Controls settings</h1>
                <div className="doc">
                    <p>Each control (buttons 1-6 & A-D, external FS1-FS4 & EXP1-EXP2) can be configured with up to 6 steps.</p>
                    <p>At the most basic level, each step has a <span className="italic fluo">type</span> value that determines the message or action the step will send or execute, as well as 3 data fields
                        that configure the options and parameters for the step depending on the selected type.</p>

                    <table className="doc-controls">
                        <thead>
                        <tr>
                            <th><br />Type</th>
                            <th><br />Description</th>
                            <th>Data 1<br />desc.</th>
                            <th>Data 1<br />values</th>
                            <th>Data 2<br />desc.</th>
                            <th>Data 2<br />values</th>
                            <th>Data 3<br />desc.</th>
                            <th>Data 3<br />values</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td className="ctrl-type">CC Toggle</td>
                            <td className="ctrl-desc">Sends a MIDI CC message that toggles between two values each time the button is pressed</td>
                            <td>MIDI CC</td>
                            <td>0-127</td>
                            <td className="allow-break">Value to send on Press 1</td>
                            <td>0-127</td>
                            <td className="allow-break">Value to send on Press 2</td>
                            <td>0-127</td>
                        </tr>
                        <tr>
                            <td className="ctrl-type">CC Trigger</td>
                            <td className="ctrl-desc">Sends a MIDI CC message when the button is pressed</td>
                            <td>MIDI CC</td>
                            <td>0-127</td>
                            <td className="allow-break">Value to send when pressing down</td>
                            <td>0-127</td>
                            <td className="allow-break">Value to send when releasing</td>
                            <td>0-127</td>
                        </tr>
                        <tr>
                            <td className="ctrl-type">CC Step</td>
                            <td className="ctrl-desc"> ??? </td>
                            <td>MIDI CC</td>
                            <td>0-127</td>
                            <td>Start value</td>
                            <td>0-127</td>
                            <td>End value</td>
                            <td>0-127</td>
                        </tr>
                        <tr>
                            <td className="ctrl-type">Note</td>
                            <td className="ctrl-desc">Send a note when the button is pressed, stop when released</td>
                            <td>Note</td>
                            <td>0-127</td>
                            <td>Velocity</td>
                            <td>0-127</td>
                            <td className="italic">not used</td>
                            <td>--</td>
                        </tr>
                        <tr>
                            <td className="ctrl-type">Note Toggle</td>
                            <td className="ctrl-desc">Send a note when the button is pressed, stop when pressed again</td>
                            <td>Note</td>
                            <td>0-127</td>
                            <td>Velocity</td>
                            <td>0-127</td>
                            <td className="italic">not used</td>
                            <td>--</td>
                        </tr>
                        <tr>
                            <td className="ctrl-type">Program & Bank</td>
                            <td className="ctrl-desc">Send a MIDI Program Change message when the button is pressed</td>
                            <td>Program</td>
                            <td>0-127</td>
                            <td>Bank LSB</td>
                            <td>0-127</td>
                            <td>Bank MSB</td>
                            <td>0-127</td>
                        </tr>
                        <tr>
                            <td className="ctrl-type">Program Step</td>
                            <td className="ctrl-desc">Send a MIDI Program Step message ??? </td>
                            <td className="italic">not used</td>
                            <td>--</td>
                            <td>Start</td>
                            <td>0-127</td>
                            <td>End</td>
                            <td>0-127</td>
                        </tr>
                        <tr>
                            <td className="ctrl-type">NRPN Coarse</td>
                            <td className="ctrl-desc">Send a MIDI Non-Registered Parameter Number Coarse message</td>
                            <td>Value</td>
                            <td>0-127</td>
                            <td>LSB</td>
                            <td>0-127</td>
                            <td>MSB</td>
                            <td>0-127</td>
                        </tr>
                        <tr>
                            <td className="ctrl-type">NRPN Fine</td>
                            <td className="ctrl-desc">Send a MIDI Non-Registered Parameter Number Fine message</td>
                            <td>Value</td>
                            <td>0-127</td>
                            <td>LSB</td>
                            <td>0-127</td>
                            <td>MSB</td>
                            <td>0-127</td>
                        </tr>
                        <tr>
                            <td className="ctrl-type">MIDI Machine Control</td>
                            <td className="ctrl-desc">Send a MIDI Machine Control message</td>
                            <td>Device ID</td>
                            <td>0-127</td>
                            <td>Command</td>
                            <td>0-127</td>
                            <td className="italic">not used</td>
                            <td>--</td>
                        </tr>
                        <tr>
                            <td className="ctrl-type">Relay Outputs</td>
                            <td className="ctrl-desc">Action a Pacer Relay</td>
                            <td>Mode</td>
                            <td>N.O.: 1<br />N.C.: 2<br />Lat.: 3</td>
                            <td>Relay</td>
                            <td>R1: 0<br />R2: 1<br />R3: 2<br />R4: 3</td>
                            <td className="italic">not used</td>
                            <td>--</td>
                        </tr>
                        <tr>
                            <td className="ctrl-type">Preset Select</td>
                            <td className="ctrl-desc">Switch to the target Preset</td>
                            <td>Target</td>
                            <td><span className="no-break">(Bank * 6) + Num</span><br />Bank A=0,<br />Bank B=1..</td>
                            <td className="italic">not used</td>
                            <td>--</td>
                            <td className="italic">not used</td>
                            <td>--</td>
                        </tr>
                        <tr>
                            <td className="ctrl-type">Preset Inc/Dec</td>
                            <td className="ctrl-desc">Switch to the next/previous Preset</td>
                            <td>Direction</td>
                            <td>Increment: ??<br />Decrement: ??</td>
                            <td className="italic">not used</td>
                            <td>--</td>
                            <td className="italic">not used</td>
                            <td>--</td>
                        </tr>
                        <tr>
                            <td className="ctrl-type">Step Select</td>
                            <td className="ctrl-desc">?? Action a specific Step for a Control</td>
                            <td>Control Target</td>
                            <td>?? A-D,<br />1-6,<br />FS1-4,<br />EXP1-2</td>
                            <td>Step</td>
                            <td>?? 1-6 (0-indexed?)</td>
                            <td className="italic">not used</td>
                            <td>--</td>
                        </tr>
                        <tr>
                            <td className="ctrl-type">Step Inc/Dec</td>
                            <td className="ctrl-desc">?? Action the next/prev Step for a Control</td>
                            <td>Control Target</td>
                            <td>?? A-D,<br />1-6,<br />FS1-4,<br />EXP1-2</td>
                            <td>Direction</td>
                            <td>Increment: ??<br />Decrement: ??</td>
                            <td className="italic">not used</td>
                            <td>--</td>
                        </tr>
                        <tr>
                            <td className="ctrl-type">OFF</td>
                            <td className="ctrl-desc">Disable the control, do not action nor send anything</td>
                            <td className="italic">not used</td>
                            <td>--</td>
                            <td className="italic">not used</td>
                            <td>--</td>
                            <td className="italic">not used</td>
                            <td>--</td>
                        </tr>
                        </tbody>
                    </table>
                </div>

                <h1>In case of problem</h1>
                <div className="doc">
                    <p>Try the following:</p>
                    <p>- Check the MIDI configuration.</p>
                    <p>- Reload the editor (F5 or Cmd-R or Ctrl-R)</p>
                    <p>- Restart the Pacer.</p>
                    <p>- Close any other applications that may be connected to the Pacer.</p>
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

                <h1>Known issues</h1>

                <div className="doc">
                    <p>- The preset D6 can not be read by sending a "read preset" sysex. You have to dump it from the Pacer.</p>
                    <p>- LED configuration is displayed for external footswitch and expression pedals.</p>
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
