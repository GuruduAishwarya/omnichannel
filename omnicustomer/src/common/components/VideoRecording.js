import React, { useState, useRef, useEffect } from 'react';
import { FFmpeg } from "@ffmpeg/ffmpeg";
export default function VideoRecording({ onRecordingComplete }) {
    const [isRecording, setIsRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [recordedChunks, setRecordedChunks] = useState([]);
    const [elapsedTime, setElapsedTime] = useState(0); // State to track elapsed time
    const mediaStreamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const timerRef = useRef(null);
    const videoRef = useRef(null);
    const ffmpeg = new FFmpeg();
    const constraints = { video: { width: { max: 320 } }, audio: true };

    useEffect(() => {
        // Request camera access and display video when component mounts
        const requestCameraAccess = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                mediaStreamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (e) {
                console.error('getUserMedia() failed: ' + e);
                // Handle error, e.g., show an alert or notify the user
            }
        };

        requestCameraAccess();

        // Cleanup function to stop the stream when component unmounts
        return () => {
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = mediaStreamRef.current;
            const recorder = new MediaRecorder(stream, { mimeType: "video/webm" }); // WebM for compatibility
            mediaRecorderRef.current = recorder;

            recorder.ondataavailable = (event) => {
                setRecordedChunks((prevChunks) => [...prevChunks, event.data]);
            };
            recorder.start(100);
            setIsRecording(true);

            // Start the timer
            timerRef.current = setInterval(() => {
                setElapsedTime((prevTime) => prevTime + 1);
            }, 1000);
        } catch (e) {
            console.error("Exception while creating MediaRecorder: " + e);
        }
    };
    const convertToMP4 = async (blob) => {
        if (!ffmpeg.loaded) {
            await ffmpeg.load();
        }

        const inputFileName = "input.webm";
        const outputFileName = "output.mp4";

        await ffmpeg.writeFile(inputFileName, new Uint8Array(await blob.arrayBuffer()));
        await ffmpeg.exec(["-i", inputFileName, "-c:v", "libx264", "-preset", "fast", outputFileName]);
        const mp4Data = await ffmpeg.readFile(outputFileName);
        const mp4Blob = new Blob([mp4Data.buffer], { type: "video/mp4" });

        const fileSizeMB = mp4Blob.size / (1024 * 1024);
        if (fileSizeMB > 16) {
            alert("The converted file size exceeds 16 MB. Please try a shorter recording.");
            return null;
        }

        return mp4Blob;
    };
    const getFileInfo = (blob) => {
        const mimeType = blob.type; // Extract MIME type dynamically
        const fileExtension = mimeType.split("/")[1]; // Extract extension dynamically

        return {
            file_name: `video_file.${fileExtension}`, // Use dynamic extension
            file_type: mimeType, // Use dynamic MIME type
            file_size: blob.size,
        };
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            // Stop the timer
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
    };

    const getBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = (error) => reject(error);
        });
    };
    const downloadRecording = async () => {
        if (recordedChunks.length) {
            setIsLoading(true);
            const webmBlob = new Blob(recordedChunks, { type: "video/webm" });

            const mp4Blob = await convertToMP4(webmBlob);
            if (!mp4Blob) return;

            const base64String = await getBase64(mp4Blob);
            const fileInfo = getFileInfo(mp4Blob); // Get dynamic file info

            const base64_files = [
                {
                    ...fileInfo, // Spread dynamic properties
                    file: base64String,
                },
            ];

            if (onRecordingComplete) {
                onRecordingComplete(base64_files);

            }

            setRecordedChunks([]);
        }
    };
    // const downloadRecording = async () => {
    //     if (recordedChunks.length) {
    //         // const blob = new Blob(recordedChunks, { type: 'video/webm' });
    //         const blob = new Blob(recordedChunks, { type: 'video/mp4' });
    //         const base64String = await getBase64(blob);

    //         const base64_files = [{
    //             file_name: 'video_file.mp4', // Updated to .webm
    //             file_type: 'video/mp4', // Correct MIME type
    //             file_size: blob.size,
    //             file: base64String,
    //         }]

    //         // Pass Base64 file data back to parent component
    //         if (onRecordingComplete) {
    //             onRecordingComplete(base64_files);
    //         }

    //         setRecordedChunks([]); // Clear recorded chunks
    //     }
    // };

    return (
        <div className='d-flex justify-content-between flex-column align-items-center'>


            <video ref={videoRef} width="320" height="240" autoPlay muted />
            <div>Recording Time: {elapsedTime} seconds</div> {/* Display elapsed time */}
            <div>

                <button className='btn btn-primary' onClick={startRecording} disabled={isRecording || isLoading}>Start Recording</button>
                <button className='btn btn-primary ms-2' onClick={downloadRecording} disabled={recordedChunks.length === 0 || isLoading || isRecording}>{isLoading ? "Sending..." : "Send"}</button>
                {/* <button className='btn btn-warning' onClick={stopRecording} disabled={!isRecording}>Stop Recording</button> */}
                <button className='btn btn-warning ms-2' onClick={stopRecording} disabled={!isRecording}>Stop Recording</button>

            </div>
        </div>
    );
};
