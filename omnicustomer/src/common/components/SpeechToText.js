import React, { useState, useRef } from 'react';
import PropTypes from "prop-types";
import { triggerAlert } from '../../utils/CommonFunctions';

export default function SpeechToText({ onTranscription }) {
    const [transcription, setTranscription] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [status, setStatus] = useState("");
    const [language, setLanguage] = useState("en-US");

    const recognitionRef = useRef(null);
    const transcriptionRef = useRef(""); // ✅ useRef to track live transcript

    const startRecording = () => {
        try {
            const recognition = new window.webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.lang = language;
            // ✅ Reset transcription when starting fresh
            transcriptionRef.current = "";
            setTranscription("");
            onTranscription("");
            recognition.onstart = () => {
                setStatus("Speech recognition in progress...");
            };

            recognition.onresult = (event) => {
                let transcript = "";
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                }

                transcriptionRef.current += transcript; // ✅ update ref
                console.log("transcriptionRef.current:", transcriptionRef.current);
                console.log("transcript:", transcript);
                setTranscription(transcriptionRef.current); // ✅ update UI
                onTranscription(transcriptionRef.current);  // ✅ pass to parent
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                setStatus("Error: Speech recognition encountered an error.");
                triggerAlert('error', 'Oops..', "Speech recognition encountered an error.");
                stopRecording();
            };

            recognition.onnomatch = () => {
                setStatus("No speech recognized. Please check your microphone permissions.");
                triggerAlert('info', '', "No speech recognized. Please check your microphone permissions.");
            };

            recognition.onend = () => {
                setStatus("Speech recognition stopped.");
                setIsListening(false);
            };

            recognition.start();
            recognitionRef.current = recognition;
            setIsListening(true);
        } catch (error) {
            console.error("Error while starting speech recognition:", error);
            setStatus("Error: Speech recognition could not be started.");
            triggerAlert('error', 'Oops..', "Speech recognition could not be started.");
        }
    };

    const stopRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        // transcriptionRef.current = ""; // ✅ clear transcript ref
        // setTranscription("");          // ✅ clear UI
        // onTranscription("");           // ✅ clear in parent
        setIsListening(false);
        setStatus("");
    };

    const toggleListening = () => {
        if (isListening) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const handleLanguageChange = (event) => {
        setLanguage(event.target.value);
        if (isListening) {
            stopRecording();
        }
    };

    return (
        <a href="#/" className={`d-flex align-items-center pe-3 ${isListening ? 'blinking' : ''}`} onClick={toggleListening}>
            <svg className="icon-24" width="18" height="23" viewBox="0 0 18 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.00021 21.5V18.3391" stroke="currentcolor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path fillRule="evenodd" clipRule="evenodd" d="M9.00021 14.3481V14.3481C6.75611 14.3481 4.9384 12.5218 4.9384 10.2682V5.58095C4.9384 3.32732 6.75611 1.5 9.00021 1.5C11.2433 1.5 13.061 3.32732 13.061 5.58095V10.2682C13.061 12.5218 11.2433 14.3481 9.00021 14.3481Z" stroke="currentcolor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M17 10.3006C17 14.7394 13.418 18.3383 9 18.3383C4.58093 18.3383 1 14.7394 1 10.3006" stroke="currentcolor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M11.0689 6.25579H13.0585" stroke="currentcolor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10.0704 9.59344H13.0605" stroke="currentcolor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </a>
    );
}

SpeechToText.propTypes = {
    onTranscription: PropTypes.func.isRequired
};
