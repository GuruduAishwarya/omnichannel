import React, { useState, useEffect } from "react";

const TextToSpeech = ({ text }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [utterance, setUtterance] = useState(null);
    const [voice, setVoice] = useState(null);
    const [pitch, setPitch] = useState(1);
    const [rate, setRate] = useState(1);
    const [volume, setVolume] = useState(1);
    useEffect(() => {
        const synth = window.speechSynthesis;
        const u = new SpeechSynthesisUtterance(text);
        const voices = synth.getVoices();
        // console.log("voices", voices)

        setUtterance(u);
        // setVoice(voices[0]);
        setVoice(voices[4]);

        return () => {
            synth.cancel();
        };
    }, [text]);

    const handlePlay = () => {
        const synth = window.speechSynthesis;

        if (isPaused) {
            synth.resume();
        } else {
            utterance.voice = voice;
            utterance.pitch = pitch;
            utterance.rate = rate;
            utterance.volume = volume;
            synth.speak(utterance);
        }

        setIsPaused(false);
        setIsPlaying(true); // Set to playing

        // Event listener for when the speech ends
        utterance.onend = () => {
            setIsPlaying(false); // Go back to normal state
        };
    };

    const handlePause = () => {
        const synth = window.speechSynthesis;

        synth.pause();

        setIsPaused(true);
        setIsPlaying(false); // Set to not playing
    };

    const handleStop = () => {
        const synth = window.speechSynthesis;

        synth.cancel();

        setIsPaused(false);
        setIsPlaying(false); // Set to not playing
    };

    const handleVoiceChange = (event) => {
        const voices = window.speechSynthesis.getVoices();
        setVoice(voices.find((v) => v.name === event.target.value));
    };

    const handlePitchChange = (event) => {
        setPitch(parseFloat(event.target.value));
    };

    const handleRateChange = (event) => {
        setRate(parseFloat(event.target.value));
    };

    const handleVolumeChange = (event) => {
        setVolume(parseFloat(event.target.value));
    };

    return (
        <div>
            {/* <label>
                Voice:
                <select value={voice?.name} onChange={handleVoiceChange}>
                    {window.speechSynthesis.getVoices().map((voice) => (
                        <option key={voice.name} value={voice.name}>
                            {voice.name}
                        </option>
                    ))}
                </select>
            </label>

            <br />

            <label>
                Pitch:
                <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={pitch}
                    onChange={handlePitchChange}
                />
            </label>

            <br />

            <label>
                Speed:
                <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={rate}
                    onChange={handleRateChange}
                />
            </label>
            <br />
            <label>
                Volume:
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                />
            </label> */}

            {/* <br /> */}
            {/* <button onClick={handlePlay}>{isPaused ? "Resume" : "Play"}</button> */}
            {/* <button onClick={handlePause}>Pause</button> */}
            {/* <button onClick={handleStop}>Stop</button> */}
            <div class="ms-2"><a href="#/" onClick={handlePlay}>
                <svg xmlns="http://www.w3.org/2000/svg"
                    width="25" height="25" fill="currentColor" className={isPlaying ? 'blinking' : ''} // Apply the blinking class when playing
                    viewBox="0 0 24 24" id="speak-button173" ng-if="g_msgs.attachment == '' || g_msgs.attachment == 'NULL'"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path></svg></a></div>
        </div>
    );
};

export default TextToSpeech;