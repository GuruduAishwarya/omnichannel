import React, { useState, useEffect, useRef } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { triggerAlert } from "../../utils/CommonFunctions";

const AudioRecorder = ({ onBase64Ready }) => {
    const [recording, setRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [audioURL, setAudioURL] = useState(null);
    const [isBrowserSupported, setIsBrowserSupported] = useState(true);
    const [elapsedTime, setElapsedTime] = useState("00:00");
    const [audioBlob, setAudioBlob] = useState(null);
    const [base64File, setBase64File] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const audioRef = useRef(null);
    const audioRecorderRef = useRef(null);
    const timerRef = useRef(null);


    // Check if the browser supports the media devices
    useEffect(() => {
        if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
            setIsBrowserSupported(false);
            alert("Browser not supported. Please use a modern browser like Chrome or Firefox.");
        }
    }, []);

    // Automatically start recording when component mounts
    useEffect(() => {
        if (isBrowserSupported) {
            startRecording();
        }
    }, [isBrowserSupported]); // Ensure recording starts only if the browser is supported

    const ffmpeg = new FFmpeg();

    const convertToM4A = async (blob) => {
        if (!ffmpeg.loaded) {
            await ffmpeg.load(); // Load FFmpeg into memory
        }

        const inputFileName = "input.mp4";
        const outputFileName = "output.m4a";

        // Load the recorded audio file into FFmpeg
        await ffmpeg.writeFile(inputFileName, new Uint8Array(await blob.arrayBuffer()));

        // Run FFmpeg command to convert MP4 to M4A
        await ffmpeg.exec(["-i", inputFileName, "-vn", "-acodec", "aac", outputFileName]);

        // Retrieve the converted file
        const m4aData = await ffmpeg.readFile(outputFileName);

        // Convert Uint8Array to Blob
        const m4aBlob = new Blob([m4aData.buffer], { type: "audio/mp4" });

        // **File size check (16 MB limit)**
        const fileSizeMB = m4aBlob.size / (1024 * 1024); // Convert bytes to MB
        if (fileSizeMB > 16) {
            triggerAlert('info', 'Media file size too big.', "Max file size we currently support: 16MB.Please try a shorter recording.");
            return null; // Stop further processing
        }

        return m4aBlob;
    };

    const startRecording = () => {
        if (!isBrowserSupported) return;

        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((stream) => {
                const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/mp4" });
                // console.log("Using MIME Type:", mediaRecorder.mimeType);
                audioRecorderRef.current = { mediaRecorder, stream, audioBlobs: [] };

                mediaRecorder.ondataavailable = (event) => {
                    if (audioRecorderRef.current) {
                        audioRecorderRef.current.audioBlobs.push(event.data);
                    }
                };

                mediaRecorder.onstop = async () => {
                    if (audioRecorderRef.current) {
                        const recordedMimeType = mediaRecorder.mimeType;
                        // console.log("Recorded MIME Type:", recordedMimeType);

                        const audioBlob = new Blob(audioRecorderRef.current.audioBlobs, {
                            type: recordedMimeType,
                        });

                        // console.log("Converting to .m4a...");
                        const m4aBlob = await convertToM4A(audioBlob);

                        setAudioBlob(m4aBlob);
                        convertToBase64(m4aBlob);
                        playAudio(m4aBlob);
                        stopTimer();
                        stopStream();
                        resetRecorder();
                    }
                };

                mediaRecorder.start();
                setRecording(true);
                startTimer();
            })
            .catch((error) => {
                console.error("Error starting recording:", error.message);
            });
    };

    const convertToBase64 = (blob) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            const fileInfo = {
                file_name: "audio_file.m4a", // Force M4A extension
                file_type: "audio/mp4", // Ensure correct MIME type
                file_size: blob.size,
                file: reader.result.split(",")[1], // Extract Base64 without prefix
            };

            // console.log("Base64 file info:", fileInfo);
            setBase64File(fileInfo);
        };
    };


    // const convertToBase64 = (blob) => {
    //     const reader = new FileReader();
    //     reader.readAsDataURL(blob);
    //     reader.onloadend = () => {
    //         // Clean the MIME type to remove codecs information
    //         const mimeType = blob.type.split(";")[0]; // Extract only "audio/mp4" without ";codecs=opus"
    //         const fileExtension = mimeType.split("/")[1]; // Extract file extension

    //         const fileInfo = {
    //             file_name: `audio_file.${fileExtension}`, // Ensure correct file extension
    //             file_type: mimeType, // Send cleaned MIME type
    //             file_size: blob.size, // Preserve actual file size
    //             file: reader.result.split(",")[1], // Extract Base64 without prefix
    //         };

    //         console.log("Base64 file info:", fileInfo); // Debugging
    //         setBase64File(fileInfo); // Save the base64 file info to state
    //     };
    // };
    const playAudio = (blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setAudioURL(reader.result);
            audioRef?.current?.load();
            audioRef?.current?.play();
            setIsPlaying(true);
        };
        reader.readAsDataURL(blob);
    };


    const handleSubmit = () => {
        if (base64File) {
            // console.log('Submitted Base64 file:', base64File);
            // alert('Audio file submitted successfully!');
            onBase64Ready(base64File); // Pass the base64 object to the parent component
            setIsLoading(true);
        } else {
            console.log('No audio file recorded.');
            setIsLoading(false);
        }
    };

    const stopRecording = () => {
        if (audioRecorderRef.current) {
            audioRecorderRef.current.mediaRecorder.stop();
            setRecording(false);
            stopTimer(); // Stop the timer when recording stops
        }
    };

    const cancelRecording = () => {
        if (audioRecorderRef.current) {
            audioRecorderRef.current.mediaRecorder.stop();
            stopStream();
            resetRecorder();
            setRecording(false);
        }
    };

    const stopStream = () => {
        if (audioRecorderRef.current) {
            const { stream } = audioRecorderRef.current;
            stream.getTracks().forEach((track) => track.stop());
        }
    };

    const resetRecorder = () => {
        audioRecorderRef.current = null; // Reset only after stop
        clearInterval(timerRef.current);
        if (recording) {
            setElapsedTime("00:00"); // Reset only if starting a new recording
        }
    };

    const startTimer = () => {
        const startTime = Date.now();
        timerRef.current = setInterval(() => {
            const timeDiff = Date.now() - startTime;
            setElapsedTime(formatElapsedTime(timeDiff));
        }, 1000);
    };

    const stopTimer = () => {
        clearInterval(timerRef.current);
    };

    const formatElapsedTime = (timeDiff) => {
        const seconds = Math.floor((timeDiff / 1000) % 60);
        const minutes = Math.floor((timeDiff / 60000) % 60);
        const hours = Math.floor(timeDiff / 3600000);
        return `${hours > 0 ? hours + ":" : ""}${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };


    const handleToggleRecording = () => {
        if (recording) {
            stopRecording();
        } else {
            startRecording();
        }
    }



    return (
        <div className="audio-recorder">
            {!isBrowserSupported && (
                <div className="overlay">
                    <p>Browser not supported</p>
                </div>
            )}
            <p className="text-start mb-0">Recording... (click bottom mic icon to stop audio recording)</p>
            <div className="d-flex justify-content-between align-items-center">
                {/* <button
                    className="start-recording-button"
                    onClick={startRecording}
                    disabled={recording}
                >
                    Start Recording
                </button>

                <button
                    className="stop-recording-button"
                    onClick={stopRecording}
                    disabled={!recording}
                >
                    Stop Recording
                </button>

                <button
                    className="cancel-recording-button"
                    onClick={cancelRecording}
                    disabled={!recording}
                >
                    Cancel Recording
                </button> */}

                {/* <button
                    className="submit-button"
                    onClick={handleSubmit}
                    disabled={!base64File}
                >
                    Submit
                </button> */}

                <div className="d-flex align-items-center">
                    <a href="#/" class={`d-flex align-items-center pe-3 ${recording ? 'blinking' : ''}`} onClick={handleToggleRecording} title={recording ? 'stop recording' : 'start recording'}>
                        <svg class="icon-24" width="18" height="23" viewBox="0 0 18 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.00021 21.5V18.3391" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M9.00021 14.3481V14.3481C6.75611 14.3481 4.9384 12.5218 4.9384 10.2682V5.58095C4.9384 3.32732 6.75611 1.5 9.00021 1.5C11.2433 1.5 13.061 3.32732 13.061 5.58095V10.2682C13.061 12.5218 11.2433 14.3481 9.00021 14.3481Z" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                            <path d="M17 10.3006C17 14.7394 13.418 18.3383 9 18.3383C4.58093 18.3383 1 14.7394 1 10.3006" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                            <path d="M11.0689 6.25579H13.0585" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                            <path d="M10.0704 9.59344H13.0605" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                        </svg>
                    </a>
                    <p className="elapsed-time mb-0">{elapsedTime}</p>
                </div>

                <div>
                    {/* <button class="btn btn-warning d-flex align-items-center" onClick={cancelRecording}
                        disabled={!recording}>
                        Cancel
                    </button> */}
                    <button type="submit" class="btn btn-primary d-flex align-items-center" onClick={handleSubmit}
                        disabled={!base64File || isLoading}
                    >
                        <svg class="icon-20" width="18" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13.8325 6.67463L8.10904 12.4592L1.59944 8.38767C0.66675 7.80414 0.860765 6.38744 1.91572 6.07893L17.3712 1.55277C18.3373 1.26963 19.2326 2.17283 18.9456 3.142L14.3731 18.5868C14.0598 19.6432 12.6512 19.832 12.0732 18.8953L8.10601 12.4602" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                        </svg>
                        <span class="d-none d-lg-block ms-1" >{isLoading ? 'Sending...' : 'Send'}</span>
                    </button>

                </div>

            </div>

            {/* {audioURL && (
                <div>
                    <audio className="audio-element" ref={audioRef} controls>
                        <source src={audioURL} type={audioBlob?.type} />
                    </audio>
                    {isPlaying && <p className="text-indication-of-audio-playing">Playing...</p>}
                </div>
            )} */}
        </div>
    );
};

export default AudioRecorder;