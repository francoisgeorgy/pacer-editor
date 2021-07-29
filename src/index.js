import 'mobx-react-lite/batchingForReactDom';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import "typeface-open-sans-condensed";
import './index.css';

// function noop() {}
// if (process.env.NODE_ENV !== 'development') {
//     console.log = noop;
//     console.warn = noop;
//     console.error = noop;
// }

ReactDOM.render(<App />, document.getElementById('root'));

serviceWorkerRegistration.register();
