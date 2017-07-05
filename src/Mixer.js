import React, { Component } from 'react';

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

class Mixer extends Component {
    constructor(props) {
        super(props);
        const gainNode = audioCtx.createGain();
        this.state = {
            searchUrl: '',
            sourceUrl: null,
            sourceBPM: null,
            requestedBPM: null,
            requestedVolume: 100,
            source: audioCtx.createBufferSource(),
            gainNode: audioCtx.createGain(),
            soundLoaded: false,
        };

        this.handleLinkChange = this.handleLinkChange.bind(this);
        this.handleBPMChange = this.handleBPMChange.bind(this);
        this.handleVolumeChange = this.handleVolumeChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleLinkChange(event) {
        this.setState({ searchUrl: event.target.value });
    }

    handleBPMChange(event) {
        const requestedBPM = event.target.value;
        this.setState({ requestedBPM });
        this.state.source.playbackRate.value = requestedBPM / this.state.sourceBPM;
    }

    handleVolumeChange(event) {
        const requestedVolume = event.target.value;
        this.setState({ requestedVolume });
        this.state.gainNode.gain.value = requestedVolume/100;
        console.log(this.state.gainNode.gain.value);
    }

    handleSubmit(event) {
        event.preventDefault();
        const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = this.state.searchUrl.match(regExp);
        if (match && match[2].length == 11) {
            const youtubeId = match[2];
            fetch(`http://127.0.0.1:5000/download/${youtubeId}`)
            .then(() => fetch(`http://127.0.0.1:5000/files/${youtubeId}.wav`))
            .then((response) => response.arrayBuffer())
            .then((audioData) => {
                audioCtx.decodeAudioData(audioData, (buffer) => {
                    const myBuffer = buffer;
                    this.state.source.buffer = myBuffer;
                    this.state.source.playbackRate.value = 1.0;
                    this.state.source.loop = true;
                    this.state.source.connect(this.state.gainNode);
                    this.state.gainNode.connect(audioCtx.destination);
                    this.state.source.start();
                    this.setState({ soundLoaded: true });
                }, (e) => "Error with decoding audio data" + e.err);
                return fetch(`http://127.0.0.1:5000/files/${youtubeId}.wav/bpm`);
            })
            .then((response) => response.text())
            .then((sourceBPM) => {
                const roundedSourceBPM = Math.round(sourceBPM * 100) / 100;
                this.state.source.playbackRate.value = roundedSourceBPM / sourceBPM;
                this.setState({ requestedBPM: roundedSourceBPM, sourceBPM })
            });
        }
    }

    render() {
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <label>
                        Youtube Link:
                        <input value={this.state.searchUrl} onChange={this.handleLinkChange} />
                    </label>
                    <input type="submit" value="Submit" />
                </form>
                {this.state.soundLoaded ? (
                    <div>
                        <h3>Volume</h3>
                        <input
                            type="range"
                            value={this.state.requestedVolume}
                            onChange={this.handleVolumeChange}
                            min="0"
                            max="100"
                            step="1"
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
                        />
                        <h4>{this.state.requestedBPM}</h4>
                    </div>
                ) : null}
            </div>
        );
    }
}

export default Mixer;
