import React, { Component } from 'react';
import './Mixer.css';
import Wad from 'web-audio-daw';

class Mixer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchUrl: '',
            sourceUrl: null,
            sourceBPM: null,
            requestedBPM: null,
            requestedVolume: 100,
            soundLoaded: false,
            isPlaying: true,
            wad: null,
        };

        this.handleLinkChange = this.handleLinkChange.bind(this);
        this.handleBPMChange = this.handleBPMChange.bind(this);
        this.handleVolumeChange = this.handleVolumeChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handlePlayPauseClick = this.handlePlayPauseClick.bind(this);
    }

    handleLinkChange(event) {
        this.setState({ searchUrl: event.target.value });
    }

    handleBPMChange(event) {
        const requestedBPM = event.target.value;
        this.setState({ requestedBPM });
        this.state.wad.setSpeed(requestedBPM / this.state.sourceBPM);

    }

    handleVolumeChange(event) {
        const requestedVolume = event.target.value;
        this.setState({ requestedVolume });
        this.state.wad.setVolume(requestedVolume / 100);
    }

    handleSubmit(event) {
        event.preventDefault();
        const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = this.state.searchUrl.match(regExp);
        if (match && match[2].length == 11) {
            const youtubeId = match[2];
            fetch(`http://127.0.0.1:5000/download/${youtubeId}`)
            .then(() => {
                this.setState({
                    wad: new Wad({
                        source: `http://127.0.0.1:5000/files/${youtubeId}.wav`,
                        env: {
                            hold: 400,
                        },
                    }),
                });
                fetch(`http://127.0.0.1:5000/files/${youtubeId}.wav/bpm`)
                .then((response) => response.text())
                .then((sourceBPM) => {
                    const roundedSourceBPM = Math.round(sourceBPM * 100) / 100;
                    this.state.wad.setSpeed(roundedSourceBPM / sourceBPM);
                    this.setState({ requestedBPM: roundedSourceBPM, sourceBPM })
                });
                this.state.wad.play();
                this.setState({
                    soundLoaded: true,
                });
            });
        }
    }

    handlePlayPauseClick(event) {
        event.preventDefault();
        this.setState({
            isPlaying: !this.state.isPlaying
        });
    }

    render() {
        return (
            <div className="Mixer">
                <form onSubmit={this.handleSubmit}>
                    <label>
                        Youtube Link:
                        <input value={this.state.searchUrl} onChange={this.handleLinkChange} />
                    </label>
                    <input type="submit" value="Submit" />
                </form>
                {this.state.soundLoaded ? (
                    <div>
                        <button onClick={this.handlePlayPauseClick}>
                            {this.state.isPlaying ? 'Pause' : 'Play'}
                        </button>
                        <h3>Volume</h3>
                        <input
                            type="range"
                            value={this.state.requestedVolume}
                            onChange={this.handleVolumeChange}
                            min="0"
                            max="100"
                            step="1"
                            className="Mixer__slider"
                        />
                        <h4>{this.state.requestedVolume}</h4>
                    </div>
                ) : null}
                {this.state.requestedBPM ? (
                    <div>
                        <h3>BPM</h3>
                        <input
                            type="range"
                            value={this.state.requestedBPM}
                            onChange={this.handleBPMChange}
                            min="100"
                            max="140"
                            step="0.01"
                            className="Mixer__slider"
                        />
                        <h4>{this.state.requestedBPM}</h4>
                    </div>
                ) : null}
            </div>
        );
    }
}

export default Mixer;
