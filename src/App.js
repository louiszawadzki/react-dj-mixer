import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Mixer from './Mixer';

class App extends Component {
    render() {
        return (
            <div className="App">
                <div className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h2>Welcome to Bazar Mixer</h2>
                </div>
                <div className="Mixers">
                    <Mixer />
                    <Mixer />
                </div>
            </div>
        );
    }
}

export default App;
