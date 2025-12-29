import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import SocialContent from "./Preview"; // Ensure the correct path to SocialContent

const PreviewView = () => {
    const location = useLocation();
    const [previewData, setPreviewData] = useState(null);
    const [previewViewProps, setPreviewViewProps] = useState({
        containerStyle: {
            position: "fixed",
            top: "0",
            left: "0",
            width: "100vw",
            height: "100vh",
            backgroundColor: "white",
            zIndex: 1000,
            // overflow: "auto",
            wordWrap: 'break-word',
            padding:'8px'
        },
        imageStyle: {
            width: "100%",
            height: "100%",
            objectFit: "cover",
            maxHeight: "100vh"
        },
        contentStyle: {
            width: "100%",
            height: "100%",
            padding: "20px",
            boxSizing: "border-box"
        }
    });

    useEffect(() => {
        try {
            const searchParams = new URLSearchParams(location.search);
            const previewId = searchParams.get('id');

            if (previewId) {
                const data = sessionStorage.getItem(previewId);
                if (data) {
                    setPreviewData(JSON.parse(data));
                }
            }
        } catch (error) {
            console.error('Error loading preview data:', error);
        }
    }, [location.search]);

    if (!previewData) {
        return null;
    }

    return (
        <div className="w-screen h-screen bg-white">
            <div className="w-full h-full">
                <div style={previewViewProps.containerStyle} className="preview-container">
                    <SocialContent
                        upload={previewData.upload}
                        userData={previewData.userData}
                        watch={previewData.caption}
                        truncateName={name => name}
                        selectedPlatform={previewData.selectedPlatform}
                        youtubeTitle={previewData.youtubeTitle}
                        previewViewProps={previewViewProps}
                        type="preview"
                    />
                </div>
            </div>
        </div>
    );
};

export default PreviewView;