import React, {Component} from 'react';
import "./Home.css";


class Home extends Component {


    render() {

        return (
            <div className="content">

                <h2>Requirements</h2>

                <div>
                    <p>This application requires a browser that support
                        the <a href="http://webaudio.github.io/web-midi-api/" target="_blank" rel="noopener noreferrer">Web MIDI API</a>.</p>

                    <p>Currently, only <span className="strong">Chrome</span> and <span className="strong">Opera</span> support this standard.
                        This application will therefore <span className="italic">not</span> work in Firefox, Safari, IE or Edge.</p>
                </div>

                <h2>Limitations</h2>

                <div>
                    <p>The current version only allows you to edit the Controls' Steps.</p>
                </div>

{/*
                <h2>Usage</h2>

                <div>
                    <ol>
                        <li>Connect your Pacer to your computer</li>
                    </ol>
                </div>
*/}

                <h2>FAQ</h2>

                <div className="empty"></div>

            </div>
        );
    }

}

export default Home;
