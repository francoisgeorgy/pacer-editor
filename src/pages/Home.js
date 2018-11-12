import React, {Component} from 'react';
import "./Home.css";


class Home extends Component {


    render() {

        return (
            <div className="content">

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
                    <p>This editor does not offer patches management either.</p>
                </div>

{/*
                <h2>Usage</h2>

                <div className="doc">
                    <ol>
                        <li>Connect your Pacer to your computer</li>
                    </ol>
                </div>
*/}

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
                    Thank you to the Nektar support service for having provided precious informations regarding the SysEx data format of the Pacer.
                    This editor would not have been possible without their support.
                </div>

            </div>
        );
    }

}

export default Home;
