import React from "react";

const VideoPlayer = ({ src, isFullScreen, toggleFullScreen }) => {
  return (
    <div className="position-relative">
      <video
        width="100%"
        height="680"
        src={src}
        title="Video"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      ></video>
      <button
        onClick={toggleFullScreen}
        className="btn btn-primary position-absolute top-0 end-0 m-2"
      >
        <span className="material-symbols-outlined">
          {isFullScreen ? "fullscreen_exit" : "fullscreen"}
        </span>
      </button>
    </div>
  );
};

export default VideoPlayer;
