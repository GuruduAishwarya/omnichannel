import React, { useEffect, useState } from "react";
import { socialMediaMap } from "../../utils/Constants";
import NoDataMessage from "../../common/components/NoDataMessage";

const SocialContent = ({
    upload,
    userData,
    watch,
    truncateName,
    selectedPlatform,
    youtubeTitle,
    previewViewProps = {}, // Default to an empty object if not provided
    type = ""
}) => {
    const isImage = upload?.file_type && ["jpg", "jpeg", "png", "gif", "bmp"].includes(
        upload.file_type.toLowerCase()
    );
    const isVideo =
        upload?.file_type &&
        ["mp4", "webm", "ogg"].includes(upload.file_type.toLowerCase());
    const contentType = upload?.content_type;
    const socialMedia = selectedPlatform;
    // console.log("InPreview", contentType)
    const formatDate = (date) => {
        const options = {
            day: "numeric",
            month: "long",
            hour: "numeric",
            minute: "numeric",
        };
        return new Intl.DateTimeFormat("en-US", options).format(date);
    };

    const currentDate = new Date();
    const formattedDate = formatDate(currentDate);

    const contentRenderMap = {
        instagram: {
            story: () =>
                <section>
                    <div className="story__container" style={{ height: type === 'preview' ? '98vh' : "290px" }}>
                        <div className="d-flex justify-content-center align-items-center my-auto">
                            <section className="post">
                                <img
                                    src={upload?.preview}
                                    alt="Post"
                                    className="story__image"
                                    style={previewViewProps.imageStyle}
                                />
                            </section>
                            <div className="story__content">
                                <div
                                    className="reel__reply w-100"
                                    style={{ display: "flex", alignItems: "center" }}
                                >
                                    <input
                                        type="text"
                                        className="form-control reply-input"
                                        placeholder="Write a reply..."
                                        disabled
                                        style={{ flex: 1, backgroundColor: "#rgb(233 236 239 / 90%)" }}
                                    />
                                    <button
                                        disabled
                                        className="reply-send-button"
                                        style={{
                                            border: "none",
                                            background: "transparent",
                                            color: "white",
                                        }}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="icon icon-tabler icon-tabler-send"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            strokeWidth="2"
                                            stroke="currentColor"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                            <line x1="10" y1="14" x2="21" y2="3" />
                                            <path d="M21 3l-6.5 18a0.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a0.55 .55 0 0 1 0 -1l18 -6.5" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>,

            post: (isImage) =>
                isImage && <div className="feed">
                    <section className="username">
                        <div className="image">
                            <a href='#/' className="no-cursor">
                                <img src="/assets/images/icon-7797704_1280.png" alt="userimg" />
                            </a>
                        </div>
                        <div className="id">
                            <a href='#/' className="no-cursor">
                                Vitel global
                            </a>
                        </div>
                    </section>
                    <section className="post" style={{ height: type === 'preview' ? '75vh' : "180px" }} >
                        <img src={upload?.preview} alt="post-img" style={{
                            ...previewViewProps.imageStyle,
                            maxHeight: type === 'preview' ? '85vh' : '180px',
                            //objectFit: type === 'preview' ? 'contain' : 'cover'
                        }} />
                    </section>
                    <section className="btn-group">
                        <a href="#/" className="like no-cursor me-2">
                            <span className="material-symbols-outlined">maps_ugc</span>
                        </a>
                        <a href="#/" className="share no-cursor me-2">
                            <span className="material-symbols-outlined">share</span>
                        </a>
                        <a href="#/" className="bookmark no-cursor me-2">
                            <span className="material-symbols-outlined">bookmark</span>
                        </a>
                    </section>
                    <section className="caption" style={{ height: type === 'preview' ? '140px' : "50px", overflow: type === 'preview' ? "scroll" : 'hidden' }}>
                        <p>
                            <b>
                                <a
                                    className="id no-cursor"
                                    href='#/'
                                >
                                    Vitel global
                                </a>
                            </b>{" "}
                            {watch ? (
                                type === "preview" ?
                                    watch // Show full content in preview
                                    : `${watch?.substring(0, 25)}${watch?.length > 25 ? "..." : ""}` // Truncate in new window
                            ) : (
                                "Check out the caption here..."
                            )}
                        </p>
                    </section>
                </div>,
            reel: (isVideo) =>
                isVideo ? <section>
                    <div className="reel__container" style={{ height: type === 'preview' ? '' : "240px" }}>
                        <video className="reel__video" autoPlay loop muted playsInline style={previewViewProps.imageStyle}
                            src={upload.preview}
                            type={`video/${upload.file_type}`}
                        >
                            Your browser does not support the video tag.
                        </video>
                        <div className="reel__content" style={{ marginTop: type === 'preview' ? ' 30%' : "" }}>
                            <div className="reel__desc">
                                {/* <div className="reel__user">
                                    <img
                                        src="/assets/images/icon-7797704_1280.png"
                                        className="reel__avatar"
                                        alt="User Avatar"
                                    />
                                    <p className="reel__username mb-0">Vitel global</p>
                                    <button className="btn btn-outline-light" disabled>
                                        Follow
                                    </button>
                                </div> */}
                            </div>
                            <div className="reel__options">
                                <div>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="icon icon-tabler icon-tabler-heart"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        strokeWidth="2"
                                        stroke="currentColor"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                        <path d="M19.5 13.572l-7.5 7.428l-7.5 -7.428m0 0a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572"></path>
                                    </svg>
                                </div>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="icon icon-tabler icon-tabler-message-circle"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2"
                                    stroke="currentColor"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                    <path d="M3 20l1.3 -3.9a9 8 0 1 1 3.4 2.9l-4.7 1"></path>
                                </svg>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="icon icon-tabler icon-tabler-send"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2"
                                    stroke="currentColor"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                    <line x1="10" y1="14" x2="21" y2="3"></line>
                                    <path d="M21 3l-6.5 18a0.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a0.55 .55 0 0 1 0 -1l18 -6.5"></path>
                                </svg>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="icon icon-tabler icon-tabler-dots-vertical"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2"
                                    stroke="currentColor"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                    <circle cx="12" cy="12" r="1"></circle>
                                    <circle cx="12" cy="19" r="1"></circle>
                                    <circle cx="12" cy="5" r="1"></circle>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="reel__caption-container" style={{
                        padding: '10px',
                        maxHeight: type === 'preview' ? '392px' : '60px', // Adjusted height
                        overflowY: type === 'preview' ? 'auto' : 'auto',
                        background: '#fff',
                        borderTop: '1px solid #ddd',
                        margin: 0
                    }}>
                        <p className="mb-0">
                            {watch ? (
                                type === "preview" ?
                                    watch // Show full content in preview
                                    : `${watch?.substring(0, 25)}${watch?.length > 25 ? "..." : ""}` // Truncate in new window
                            ) : (
                                "Check out the caption here..."
                            )}
                        </p>
                    </div>
                </section> : null,
        },
       facebook: {
        post: (isImage) =>
            isImage && <div id="facebook_text">
                {/* <div className="header">
                    <div className="left-info">
                        <div className="thumbnail">
                            <img src="/assets/images/icon-7797704_1280.png" alt="user-img" />
                        </div>
                        <div className="name-info">
                            <div className="name">
                                <a href='#/' className="no-cursor" >
                                    Vitel global
                                </a>
                            </div>
                            <div className="time">{formattedDate}</div>
                        </div>
                    </div>
                    <div className="right-info"></div>
                </div> */}

                {upload?.preview && (
                    <div className="facebook-post-image" >
                        <img
                            src={upload?.preview}
                            alt="post-img"
                            className="img-fluid"
                            // style={previewViewProps.imageStyle}
                            style={{  height: type === 'preview' ? '73vh' : "219px", objectFit: 'contain' }}
                        />

                    </div>
                )}
                <div className="feedback-action mt-2 ms-2">
                    <div className="fb-wrapper">
                        <i className="material-symbols-outlined" style={{ marginRight: '5px' }}>
                            thumb_up
                        </i>Like
                    </div>
                    <div className="fb-wrapper">
                        <i className="material-symbols-outlined" style={{ marginRight: '5px' }}>
                            maps_ugc
                        </i>
                        Comment
                    </div>
                    <div className="fb-wrapper">
                        <i className="fb-icon share"></i>Share
                    </div>
                </div>
                <div className="content" style={{
                    wordWrap: type === "preview" && "break-word",
                    overflow: "auto",
                    maxHeight: type === "preview" ? "150px" : "60px", // Reduced height for non-preview
                    overflowY: type === "preview" ? "auto" : "auto",
                    // padding: "10px",
                    background: '#fff',
                    // border: '1px solid #ddd'
                }}>
                    {watch ? (
                        type === "preview" ?
                            watch // Show full content in preview with scroll
                            : `${watch?.substring(0, 25)}${watch?.length > 25 ? "..." : ""}` // Truncate in new window
                    ) : (
                        "Check out the caption here..."
                    )}
                </div>
            </div>,
        text: () => <div id="facebook_text">
            <div className="header">
                <div className="left-info">
                    <div className="thumbnail">
                        <img src="/assets/images/icon-7797704_1280.png" alt="userimg" />
                    </div>
                    <div className="name-info">
                        <div className="name">
                            <a href='#/' className="no-cursor" >
                                Vitel global
                            </a>
                        </div>
                        <div className="time">{formattedDate}</div>
                    </div>
                </div>
                <div className="right-info"></div>
            </div>
            <div className="content" style={{
                wordWrap: type === "preview" && "break-word",
                overflow: "auto",
                maxHeight: type === "preview" ? "850px" : "250px", // Taller height for default view
                overflowY: "auto", // Always show scroll when needed
                padding: "10px",
                background: '#fff',
                // border: '1px solid #ddd',
                margin: "10px 0"
            }}>
                {watch ? (
                    type === "preview" ?
                        watch // Show truncated content in preview mode
                        : `${watch?.substring(0, 250)}${watch?.length > 250 ? "..." : ""}` // Show full content in default view
                ) : (
                    "Check out the caption here..."
                )}
            </div>
            <div className="feedback-action">
                <div className="fb-wrapper">
                    <i className="material-symbols-outlined" style={{ marginRight: '5px' }}>
                        thumb_up
                    </i>Like
                </div>
                <div className="fb-wrapper">
                    <i className="material-symbols-outlined" style={{ marginRight: '5px' }}>
                        maps_ugc
                    </i>
                    Comment
                </div>
                <div className="fb-wrapper">
                    <i className="fb-icon share"></i>Share
                </div>
            </div>
        </div>,
        video: (isVideo) =>
            isVideo && <section>
                <div className="reel__container" style={{ height: type === 'preview' ? '' : "240px" }}>
                    <a href="#/">

                        <video
                            src={upload.preview}
                            className="reel__video img-fluid"
                            muted
                            loop
                            controls
                            controlsList="nodownload"
                            autoPlay playsInline
                            style={previewViewProps.imageStyle}
                            type={`video/${upload.file_type}`}
                        >
                            Your browser does not support the video tag.
                        </video>
                        <div className="reel__content" style={{ marginTop: type === 'preview' ? ' 30%' : "" }}>
                            <div className="reel__desc">
                                {/* <div className="reel__user">
                                    <img
                                        src="/assets/images/icon-7797704_1280.png"
                                        className="reel__avatar"
                                        alt="User Avatar"
                                    />
                                    <p className="reel__username mb-0">Vitel global</p>
                                    <button className="btn btn-outline-light" disabled>
                                        Follow
                                    </button>
                                </div> */}
                            </div>
                            <div className="reel__options">
                                <div>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="icon icon-tabler icon-tabler-message-circle"
                                        width="25"
                                        height="25"
                                        fill="currentColor"
                                        // className="bi bi-hand-thumbs-up"
                                        viewBox="0 0 16 16"
                                    >
                                        <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2 2 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a10 10 0 0 0-.443.05 9.4 9.4 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a9 9 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.006.005.041.05.041.17a.9.9 0 0 1-.121.416c-.165.288-.503.56-1.066.56z" />
                                    </svg>
                                </div>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="icon icon-tabler icon-tabler-message-circle"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2"
                                    stroke="currentColor"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                    <path d="M3 20l1.3 -3.9a9 8 0 1 1 3.4 2.9l-4.7 1"></path>
                                </svg>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="icon icon-tabler icon-tabler-message-circle"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2"
                                    stroke="white"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="5" cy="12" r="2" fill="white"></circle>
                                    <circle cx="19" cy="5" r="2" fill="white"></circle>
                                    <circle cx="19" cy="19" r="2" fill="white"></circle>
                                    <path
                                        d="M7 12l10-7m0 14L7 12"
                                        stroke="white"
                                        stroke-width="2"
                                    ></path>
                                </svg>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="icon icon-tabler icon-tabler-dots-vertical"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2"
                                    stroke="currentColor"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                    <circle cx="12" cy="12" r="1"></circle>
                                    <circle cx="12" cy="19" r="1"></circle>
                                    <circle cx="12" cy="5" r="1"></circle>
                                </svg>
                            </div>
                        </div>
                    </a>
                </div>
                <div className="facebook-video-caption" style={{
                    padding: '10px',
                    maxHeight: type === 'preview' ? '392px' : '60px', // Adjusted height
                    overflowY: type === 'preview' ? 'auto' : 'auto',
                    background: '#fff',
                    borderTop: '1px solid #ddd',
                    margin: 0
                }}>
                    <p className="mb-0">
                        {watch ? (
                            type === "preview" ?
                                watch // Show full content in preview with scroll
                                : `${watch?.substring(0, 25)}${watch?.length > 25 ? "..." : ""}` // Truncate in new window
                        ) : (
                            "Check out the caption here..."
                        )}
                    </p>
                </div>
            </section>,
    },
        youtube: {
            video: (isVideo) =>
                isVideo &&
                <div className="user-images user-images-icon-play custom-border rounded mb-3">
                    <a href="#/">
                        <video
                            src={upload.preview}
                            className="img-fluid"
                            muted
                            loop
                            controls
                            style={{
                                width: '100%',
                                height: type === 'preview' ? '' : '250px', // increased height for video
                                objectFit: 'contain',
                                backgroundColor: '#000',
                                padding: '10px',       // added padding
                                margin: '10px 0'        // added margin
                            }}
                            type={`video/${upload.file_type}`}
                        >
                            Your browser does not support the video tag.
                        </video>
                        <div className="center-icon-plays">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width={50}
                                height={50}
                                fill="currentColor"
                                className="bi bi-play-circle-fill"
                                viewBox="0 0 16 16"
                            >
                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814z" />
                            </svg>
                        </div>
                    </a>
                    <div>
                        <ul className="notification-list m-0 p-0">
                            <li className="d-flex align-items-center justify-content-between">
                                <div className="w-100">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="ms-2">
                                            <h6 className="fw-500">
                                                {youtubeTitle != '' ? truncateName(youtubeTitle, 40) : upload.file_name || "-"}
                                            </h6>
                                            <p className="mb-0">
                                                No View &#9679; 1 second ago
                                            </p>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <div className="card-header-toolbar d-flex align-items-center">
                                                <div className="dropdown">
                                                    <div
                                                        className="dropdown-toggle"
                                                        id="dropdownMenuButton"
                                                    >
                                                        {/* <span className="material-symbols-outlined">
                                                            more_vert
                                                        </span> */}
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>,
            short: (isVideo) =>
                isVideo && <section>
                    <div className="reel__container" style={{ height: type === 'preview' ? '' : "240px" }}>
                        <video className="reel__video" autoPlay loop muted playsInline style={previewViewProps.imageStyle}>
                            <source
                                src={upload.preview}
                                type={`video/${upload.file_type}`}
                            />
                            Your browser does not support the video tag.
                        </video>
                        <div className="reel__content" style={{ marginTop: type === 'preview' ? ' 30%' : "" }}>
                            <div className="reel__desc">
                                <div className="reel__user">
                                    <img
                                        src="/assets/images/icon-7797704_1280.png"
                                        className="reel__avatar"
                                        alt="User Avatar"
                                    />
                                    <p className="reel__username mb-0 text-secondary">Vitel global</p>
                                    <button className="btn btn-outline-light" disabled>
                                        Follow
                                    </button>
                                </div>
                            </div>
                            <div className="reel__options">

                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="25"
                                    height="25"
                                    fill="currentColor"
                                    className="bi bi-hand-thumbs-up"
                                    viewBox="0 0 16 16"
                                >
                                    <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2 2 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a10 10 0 0 0-.443.05 9.4 9.4 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a9 9 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.006.005.041.05.041.17a.9.9 0 0 1-.121.416c-.165.288-.503.56-1.066.56z" />
                                </svg>
                                {/* <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="25"
                                    height="25"
                                    fill="currentColor"
                                    className="bi bi-hand-thumbs-down"
                                    viewBox="0 0 16 16"
                                >
                                    <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2 2 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a10 10 0 0 0-.443.05 9.4 9.4 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a9 9 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.006.005.041.05.041.17a.9.9 0 0 1-.121.416c-.165.288-.503.56-1.066.56z" />
                                </svg> */}


                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2"
                                    stroke="white"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="5" cy="12" r="2" fill="white"></circle>
                                    <circle cx="19" cy="5" r="2" fill="white"></circle>
                                    <circle cx="19" cy="19" r="2" fill="white"></circle>
                                    <path
                                        d="M7 12l10-7m0 14L7 12"
                                        stroke="white"
                                        stroke-width="2"
                                    ></path>
                                </svg>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="icon icon-tabler icon-tabler-dots-vertical"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2"
                                    stroke="currentColor"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                    <circle cx="12" cy="12" r="1"></circle>
                                    <circle cx="12" cy="19" r="1"></circle>
                                    <circle cx="12" cy="5" r="1"></circle>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="facebook-video-caption" style={{
                        padding: '10px',
                        maxHeight: type === 'preview' ? '392px' : '60px', // Adjusted height
                        overflowY: type === 'preview' ? 'auto' : 'auto',
                        background: '#fff',
                        borderTop: '1px solid #ddd',
                        margin: 0
                    }}>
                        <p className="mb-0">
                            {watch ? (
                                type === "preview" ?
                                    watch // Show full content in preview with scroll
                                    : `${watch?.substring(0, 25)}${watch?.length > 25 ? "..." : ""}` // Truncate in new window
                            ) : (
                                "Check out the caption here..."
                            )}
                        </p>
                    </div>
                </section>,
        },
        pinterest: {
            post: (isImage) =>
                isImage && <div id="facebook_text" className="pinterest-post">
                    {/* <div className="header">
                        <div className="left-info">
                            <div className="thumbnail">
                                <img src="/assets/images/icon-7797704_1280.png" alt="user-img" />
                            </div>
                            <div className="name-info">
                                <div className="name">
                                    <a href='#/' className="no-cursor" >
                                        Vitel global
                                    </a>
                                </div>
                                <div className="time">{formattedDate}</div>
                            </div>
                        </div>
                        <div className="right-info"></div>
                    </div> */}
                    {upload?.preview && (
                        <div className="facebook-post-image" >
                            <img
                                src={upload?.preview}
                                alt="post-img"
                                className="img-fluid"
                                style={{ height: type === 'preview' ? '73vh' : "219px", objectFit: 'contain' }}
                            />
                        </div>
                    )}
                    <div className="feedback-action mt-2 ms-2">
                        <div className="fb-wrapper">
                            {/* Pinterest Like Icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#E60023" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                            Like
                        </div>
                        <div className="fb-wrapper">
                            {/* Pinterest Comment Icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#E60023" viewBox="0 0 24 24">
                                <path d="M21 6.5a2.5 2.5 0 0 0-2.5-2.5h-13A2.5 2.5 0 0 0 3 6.5v7A2.5 2.5 0 0 0 5.5 16H7v3l4-3h5.5A2.5 2.5 0 0 0 21 13.5v-7z" />
                            </svg>
                            Comment
                        </div>
                        <div className="fb-wrapper">
                            {/* Pinterest Share Icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#E60023" viewBox="0 0 24 24">
                                <path d="M18 8.59V7a5 5 0 0 0-10 0v1.59l-1.7 1.7A1 1 0 0 0 7 12h10a1 1 0 0 0 .7-1.71z" />
                            </svg>
                            Share
                        </div>
                    </div>
                    <div className="content" style={{
                        wordWrap: type === "preview" && "break-word",
                        overflow: "auto",
                        maxHeight: type === "preview" ? "150px" : "60px",
                        overflowY: type === "preview" ? "auto" : "auto",
                        background: '#fff',
                    }}>
                        {watch ? (
                            type === "preview" ?
                                watch
                                : `${watch?.substring(0, 25)}${watch?.length > 25 ? "..." : ""}`
                        ) : (
                            "Check out the caption here..."
                        )}
                    </div>
                </div>,
            video: (isVideo) =>
                isVideo && <section>
                    <div className="reel__container" style={{ height: type === 'preview' ? '' : "240px" }}>
                        <video className="reel__video" autoPlay loop muted playsInline style={previewViewProps.imageStyle}>
                            <source
                                src={upload.preview}
                                type={`video/${upload.file_type}`}
                            />
                            Your browser does not support the video tag.
                        </video>
                        <div className="reel__content" style={{ marginTop: type === 'preview' ? ' 30%' : "" }}>
                            <div className="reel__desc">
                                <div className="reel__user">
                                    <img
                                        src="/assets/images/icon-7797704_1280.png"
                                        className="reel__avatar"
                                        alt="User Avatar"
                                    />
                                    <p className="reel__username mb-0">Vitel global</p>
                                    <button className="btn btn-outline-light" disabled>
                                        Follow
                                    </button>
                                </div>
                            </div>
                            <div className="reel__options">
                                <div>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="25"
                                        height="25"
                                        fill="currentColor"
                                        className="bi bi-hand-thumbs-up"
                                        viewBox="0 0 16 16"
                                    >
                                        <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2 2 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a10 10 0 0 0-.443.05 9.4 9.4 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a9 9 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.006.005.041.05.041.17a.9.9 0 0 1-.121.416c-.165.288-.503.56-1.066.56z" />
                                    </svg>
                                </div>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="icon icon-tabler icon-tabler-message-circle"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2"
                                    stroke="currentColor"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                    <path d="M3 20l1.3 -3.9a9 8 0 1 1 3.4 2.9l-4.7 1"></path>
                                </svg>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2"
                                    stroke="white"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="5" cy="12" r="2" fill="white"></circle>
                                    <circle cx="19" cy="5" r="2" fill="white"></circle>
                                    <circle cx="19" cy="19" r="2" fill="white"></circle>
                                    <path
                                        d="M7 12l10-7m0 14L7 12"
                                        stroke="white"
                                        stroke-width="2"
                                    ></path>
                                </svg>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="icon icon-tabler icon-tabler-dots-vertical"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2"
                                    stroke="currentColor"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                    <circle cx="12" cy="12" r="1"></circle>
                                    <circle cx="12" cy="19" r="1"></circle>
                                    <circle cx="12" cy="5" r="1"></circle>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="facebook-video-caption" style={{
                        padding: '10px',
                        maxHeight: type === 'preview' ? '392px' : '60px', // Adjusted height
                        overflowY: type === 'preview' ? 'auto' : 'auto',
                        background: '#fff',
                        borderTop: '1px solid #ddd',
                        margin: 0
                    }}>
                        <p className="mb-0">
                            {watch ? (
                                type === "preview" ?
                                    watch // Show full content in preview with scroll
                                    : `${watch?.substring(0, 25)}${watch?.length > 25 ? "..." : ""}` // Truncate in new window
                            ) : (
                                "Check out the caption here..."
                            )}
                        </p>
                    </div>
                </section>,
        },
        linkedin: {
            post: (isImage) =>
                isImage && <div id="facebook_text" className="linkedin-post">
                    <div className="header">
                        <div className="left-info">
                            <div className="thumbnail">
                                <img src="/assets/images/icon-7797704_1280.png" alt="user-img" />
                            </div>
                            <div className="name-info">
                                <div className="name">
                                    <a href='#/' className="no-cursor">
                                        Vitel global
                                    </a>
                                    <span className="linkedin-dot">•</span>
                                    <span className="linkedin-follow">Follow</span>
                                </div>
                                <div className="time">{formattedDate}</div>
                            </div>
                        </div>
                        <div className="right-info">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="2" fill="currentColor" />
                                <circle cx="12" cy="4" r="2" fill="currentColor" />
                                <circle cx="12" cy="20" r="2" fill="currentColor" />
                            </svg>
                        </div>
                    </div>

                    {upload?.preview && (
                        <div className="linkedin-media-container">
                            <div className="facebook-post-image" style={{
                                height: type === 'preview' ? '73vh' : "120px",
                                background: `url(${upload?.preview})`,
                                borderRadius: '8px'
                            }} />
                        </div>
                    )}
                    {/* 
                    <div className="linkedin-engagement">
                        <div className="linkedin-reactions">
                            <span className="reaction-icons">
                                <img src="/assets/images/linkedin-like.png" alt="like" width="16"/>
                                <img src="/assets/images/linkedin-celebrate.png" alt="celebrate" width="16"/>
                                <img src="/assets/images/linkedin-support.png" alt="support" width="16"/>
                            </span>
                            <span className="reaction-count">324</span>
                        </div>
                        <div className="linkedin-comments-shares">
                            <span>48 comments</span>
                            <span>•</span>
                            <span>12 shares</span>
                        </div>
                    </div> */}

                    <div className="feedback-action mt-2">
                        {/* Common action buttons for all types */}
                        <div className="linkedin-action-button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                            </svg>
                            <span>Like</span>
                        </div>
                        <div className="linkedin-action-button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            <span>Comment</span>
                        </div>
                        <div className="linkedin-action-button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                                <polyline points="16 6 12 2 8 6" />
                                <line x1="12" y1="2" x2="12" y2="15" />
                            </svg>
                            <span>Share</span>
                        </div>
                        <div className="linkedin-action-button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                            </svg>
                            <span>Send</span>
                        </div>
                    </div>

                    <div className="content linkedin-content" style={{
                        wordWrap: type === "preview" && "break-word",
                        overflow: "auto",
                        maxHeight: type === "preview" ? "150px" : "60px",
                        overflowY: type === "preview" ? "auto" : "auto",
                        padding: "10px",
                        background: '#fff',
                    }}>
                        {watch ? (
                            type === "preview" ?
                                watch
                                : `${watch?.substring(0, 25)}${watch?.length > 25 ? "..." : ""}`
                        ) : (
                            "Check out the caption here..."
                        )}
                    </div>
                </div>,

            text: () => <div id="facebook_text" className="linkedin-post">
                <div className="header">
                    <div className="left-info">
                        <div className="thumbnail">
                            <img src="/assets/images/icon-7797704_1280.png" alt="userimg" />
                        </div>
                        <div className="name-info">
                            <div className="name">
                                <a href='#/' className="no-cursor">
                                    Vitel global
                                </a>
                                <span className="linkedin-dot">•</span>
                                <span className="linkedin-follow">Follow</span>
                            </div>
                            <div className="time">{formattedDate}</div>
                        </div>
                    </div>
                    <div className="right-info">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="2" fill="currentColor" />
                            <circle cx="12" cy="4" r="2" fill="currentColor" />
                            <circle cx="12" cy="20" r="2" fill="currentColor" />
                        </svg>
                    </div>
                </div>

                <div className="feedback-action mt-2">
                    <div className="linkedin-action-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                        </svg>
                        <span>Like</span>
                    </div>
                    <div className="linkedin-action-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        <span>Comment</span>
                    </div>
                    <div className="linkedin-action-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                            <polyline points="16 6 12 2 8 6" />
                            <line x1="12" y1="2" x2="12" y2="15" />
                        </svg>
                        <span>Share</span>
                    </div>
                    <div className="linkedin-action-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                        </svg>
                        <span>Send</span>
                    </div>
                </div>

                <div className="content linkedin-content" style={{
                    wordWrap: type === "preview" && "break-word",
                    overflow: "auto",
                    maxHeight: type === "preview" ? "150px" : "60px",
                    overflowY: type === "preview" ? "auto" : "auto",
                    padding: "10px",
                    background: '#fff',
                }}>
                    {watch ? (
                        type === "preview" ?
                            watch
                            : `${watch?.substring(0, 25)}${watch?.length > 25 ? "..." : ""}`
                    ) : (
                        "Check out the caption here..."
                    )}
                </div>
            </div>,
            video: (isVideo) =>
                isVideo && <section>
                    <div className="reel__container" style={{ height: type === 'preview' ? '' : "240px" }}>
                        <a href="#/">
                            <video
                                src={upload.preview}
                                className="reel__video img-fluid"
                                muted
                                loop
                                autoPlay playsInline
                                style={previewViewProps.imageStyle}
                                type={`video/${upload.file_type}`}
                            >
                                Your browser does not support the video tag.
                            </video>
                            <div className="reel__content" style={{ marginTop: type === 'preview' ? ' 30%' : "" }}>
                                <div className="reel__desc">
                                    <div className="reel__user">
                                        <img
                                            src="/assets/images/icon-7797704_1280.png"
                                            className="reel__avatar"
                                            alt="User Avatar"
                                        />
                                        <p className="reel__username mb-0">Vitel global</p>
                                        <button className="btn btn-outline-light" disabled>
                                            Follow
                                        </button>
                                    </div>
                                </div>
                                <div className="reel__options">
                                    <div>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                                        </svg>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                                    </svg>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                        <polyline points="15 3 21 3 21 9"></polyline>
                                        <line x1="10" y1="14" x2="21" y2="3"></line>
                                    </svg>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="1"></circle>
                                        <circle cx="12" cy="5" r="1"></circle>
                                        <circle cx="12" cy="19" r="1"></circle>
                                    </svg>
                                </div>
                            </div>
                        </a>
                    </div>
                    <div className="facebook-video-caption" style={{
                        padding: '10px',
                        maxHeight: type === 'preview' ? '392px' : '60px',
                        overflowY: type === 'preview' ? 'auto' : 'auto',
                        background: '#fff',
                        borderTop: '1px solid #ddd',
                        margin: 0
                    }}>
                        <p className="mb-0">
                            {watch ? (
                                type === "preview" ?
                                    watch
                                    : `${watch?.substring(0, 25)}${watch?.length > 25 ? "..." : ""}`
                            ) : (
                                "Check out the caption here..."
                            )}
                        </p>
                    </div>
                </section>,
            document: () => <div id="facebook_text" className="linkedin-post">
                <div className="header">
                    <div className="left-info">
                        <div className="thumbnail">
                            <img src="/assets/images/icon-7797704_1280.png" alt="userimg" />
                        </div>
                        <div className="name-info">
                            <div className="name">
                                <a href='#/' className="no-cursor">
                                    Vitel global
                                </a>
                                <span className="linkedin-dot">•</span>
                                <span className="linkedin-follow">Follow</span>
                            </div>
                            <div className="time">{formattedDate}</div>
                        </div>
                    </div>
                    <div className="right-info">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="2" fill="currentColor" />
                            <circle cx="12" cy="4" r="2" fill="currentColor" />
                            <circle cx="12" cy="20" r="2" fill="currentColor" />
                        </svg>
                    </div>
                </div>

                <div className="content linkedin-content" style={{
                    wordWrap: type === "preview" && "break-word",
                    overflow: "auto",
                    maxHeight: type === "preview" ? "100px" : "40px",
                    overflowY: type === "preview" ? "auto" : "auto",
                    padding: "10px",
                    background: '#fff',
                }}>
                    {watch ? (
                        type === "preview" ?
                            watch
                            : `${watch?.substring(0, 25)}${watch?.length > 25 ? "..." : ""}`
                    ) : (
                        "Check out the caption here..."
                    )}
                </div>

                <div className="linkedin-document-preview" style={{
                    border: "1px solid #e0e0e0",
                    borderRadius: "12px",
                    overflow: "hidden",
                    margin: "10px 0",
                    backgroundColor: "#f9f9f9",
                    display: "flex",
                    flexDirection: "column",
                    height: type === "preview" ? "70vh" : "140px",
                    boxShadow: "0px 3px 10px rgba(0, 0, 0, 0.08)"
                }}>
                    <div className="document-preview-header" style={{
                        padding: "15px",
                        borderBottom: "1px solid #e0e0e0",
                        backgroundColor: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                    }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            {/* Document type icon based on file type */}
                            {upload?.file_type?.toLowerCase() === 'pdf' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="#E74C3C" viewBox="0 0 16 16">
                                    <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z" />
                                    <path d="M4.603 14.087a.81.81 0 0 1-.438-.42c-.195-.388-.13-.776.08-1.102.198-.307.526-.568.897-.787a7.68 7.68 0 0 1 1.482-.645 19.697 19.697 0 0 0 1.062-2.227 7.269 7.269 0 0 1-.43-1.295c-.086-.4-.119-.796-.046-1.136.075-.354.274-.672.65-.823.192-.077.4-.12.602-.077a.7.7 0 0 1 .477.365c.088.164.12.356.127.538.007.188-.012.396-.047.614-.084.51-.27 1.134-.52 1.794a10.954 10.954 0 0 0 .98 1.686 5.753 5.753 0 0 1 1.334.05c.364.066.734.195.96.465.12.144.193.32.2.518.007.192-.047.382-.138.563a1.04 1.04 0 0 1-.354.416.856.856 0 0 1-.51.138c-.331-.014-.654-.196-.933-.417a5.712 5.712 0 0 1-.911-.95 11.651 11.651 0 0 0-1.997.406 11.307 11.307 0 0 1-1.02 1.51c-.292.35-.609.656-.927.787a.793.793 0 0 1-.58.029zm1.379-1.901c-.166.076-.32.156-.459.238-.328.194-.541.383-.647.547-.094.145-.096.25-.04.361.01.022.02.036.026.044a.266.266 0 0 0 .035-.012c.137-.056.355-.235.635-.572.33-.4.582-.79.803-1.156a5.593 5.593 0 0 1-.36.364l.007-.016zm5.96.024a.23.23 0 0 0 .14-.05.133.133 0 0 0 .063-.108.19.19 0 0 0-.036-.137.544.544 0 0 0-.262-.167c-.19-.058-.44-.084-.689-.081a4.096 4.096 0 0 0-.872.111 2.889 2.889 0 0 1 .5.519c.196.159.454.278.784.278.196 0 .306-.045.372-.065zm-2.831-2.3a25.25 25.25 0 0 1-.448-.889 12.962 12.962 0 0 1-.354-.806c.048.017.096.033.144.055.305.136.515.326.644.519.075.111.118.23.117.344a.66.66 0 0 1-.12.236.45.45 0 0 1-.198.173c-.096.045-.197.066-.277.066-.077 0-.14-.016-.203-.034-.057-.022-.115-.046-.171-.073-.088-.05-.168-.109-.241-.175a2.13 2.13 0 0 0-.124-.097c-.196-.197-.368-.405-.526-.612-.108-.142-.212-.285-.309-.43-.496-.01-.924.03-1.284.141-.144.044-.28.102-.394.172a.674.674 0 0 0-.162.143.798.798 0 0 1 .202-.307 1.89 1.89 0 0 1 .47-.313c.417-.19.964-.273 1.603-.24.53.02 1.066.11 1.633.3.215.065.424.148.624.245.1.05.198.105.294.165" />
                                </svg>
                            ) : upload?.file_type?.toLowerCase() === 'docx' || upload?.file_type?.toLowerCase() === 'doc' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="#2B579A" viewBox="0 0 16 16">
                                    <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z" />
                                    <path d="M4.085 15.8a.5.5 0 0 1-.316-.632l2.321-7.508a.5.5 0 0 1 .948.316L4.717 15.48a.5.5 0 0 1-.632.32zm6.352-7.508a.5.5 0 0 1 .948.316l-2.321 7.508a.5.5 0 0 1-.948-.316l2.321-7.508z" />
                                </svg>
                            ) : upload?.file_type?.toLowerCase() === 'xlsx' || upload?.file_type?.toLowerCase() === 'xls' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="#217346" viewBox="0 0 16 16">
                                    <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z" />
                                    <path d="M3 8.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5zm8 4a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="#0073b1" viewBox="0 0 16 16">
                                    <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z" />
                                    <path d="M8.5 6.5a.5.5 0 0 0-1 0V8H6a.5.5 0 0 0 0 1h1.5v1.5a.5.5 0 0 0 1 0V9H10a.5.5 0 0 0 0-1H8.5V6.5z" />
                                </svg>
                            )}
                            <div style={{ marginLeft: "15px" }}>
                                <h6 className="document-name mb-1" style={{ fontWeight: "600" }}>
                                    {upload?.file_name || "Document name"}
                                </h6>
                                <p className="document-type mb-0 text-muted" style={{ fontSize: "12px" }}>
                                    {upload?.file_type ? upload.file_type.toUpperCase() : "PDF"} • {formattedDate} •
                                    <span style={{ color: "#0073b1", marginLeft: "5px" }}>
                                        {Math.floor(Math.random() * 10) + 1} pages
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="document-preview-body" style={{
                        flex: 1,
                        display: "flex",
                        backgroundColor: type === "preview" ? "#f5f5f5" : "#f9f9f9",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "15px",
                        position: "relative"
                    }}>
                        {/* Document preview mockup */}
                        <div style={{
                            width: type === "preview" ? "60%" : "80%",
                            height: type === "preview" ? "80%" : "70%",
                            backgroundColor: "#fff",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "3px",
                            padding: "20px",
                            position: "relative",
                            overflow: "hidden"
                        }}>
                            {/* Document watermark */}
                            <div style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%) rotate(-45deg)",
                                color: "rgba(0,0,0,0.06)",
                                fontSize: type === "preview" ? "60px" : "30px",
                                fontWeight: "bold",
                                textTransform: "uppercase",
                                whiteSpace: "nowrap"
                            }}>
                                {upload?.file_type ? upload.file_type.toUpperCase() : "Document"}
                            </div>

                            {/* Document content representation */}
                            <div style={{
                                width: "90%",
                                marginBottom: "10px",
                                height: "8px",
                                backgroundColor: "#e0e0e0",
                                borderRadius: "4px"
                            }}></div>
                            <div style={{
                                width: "70%",
                                marginBottom: "10px",
                                height: "8px",
                                backgroundColor: "#e0e0e0",
                                borderRadius: "4px"
                            }}></div>
                            <div style={{
                                width: "80%",
                                marginBottom: "20px",
                                height: "8px",
                                backgroundColor: "#e0e0e0",
                                borderRadius: "4px"
                            }}></div>

                            {/* Open document button */}
                            <button style={{
                                backgroundColor: "#0073b1",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "24px",
                                padding: "8px 20px",
                                fontSize: "14px",
                                fontWeight: "600",
                                display: "flex",
                                alignItems: "center",
                                cursor: "pointer",
                                marginTop: type === "preview" ? "20px" : "5px",
                                boxShadow: "0 2px 5px rgba(0,115,177,0.3)",
                                transition: "all 0.2s ease"
                            }} onClick={(e) => {
                                e.preventDefault();
                                if (upload?.preview) {
                                    // For base64 data URLs
                                    if (upload.preview.startsWith('data:')) {
                                        // Create a blob from the base64 data
                                        const byteString = atob(upload.preview.split(',')[1]);
                                        const mimeType = upload.preview.split(',')[0].split(':')[1].split(';')[0];
                                        const ab = new ArrayBuffer(byteString.length);
                                        const ia = new Uint8Array(ab);

                                        for (let i = 0; i < byteString.length; i++) {
                                            ia[i] = byteString.charCodeAt(i);
                                        }

                                        const blob = new Blob([ab], { type: mimeType });
                                        const blobUrl = URL.createObjectURL(blob);

                                        // Open in new window
                                        const newWindow = window.open(blobUrl, '_blank');

                                        // Clean up the blob URL when the window closes
                                        if (newWindow) {
                                            newWindow.onunload = () => URL.revokeObjectURL(blobUrl);
                                        } else {
                                            URL.revokeObjectURL(blobUrl); // Clean up if window was blocked
                                            alert('Pop-up blocked! Please allow pop-ups to view documents.');
                                        }
                                    }
                                    // For regular URLs
                                    else {
                                        window.open(upload.preview, '_blank');
                                    }
                                } else {
                                    alert('Document preview not available');
                                }
                            }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: "8px" }}>
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                                </svg>
                                Open Document
                            </button>
                        </div>
                    </div>
                </div>
            </div>,
        },
    };

    const renderContent = () => {
        const platform = socialMediaMap[socialMedia];
        // console.log("Debug - Platform:", platform, "Content Type:", contentType, "Upload:", upload);

        if (!platform) {
            console.warn("Platform not found for:", socialMedia);
            return <p>Unsupported platform</p>;
        }

        const platformContent = contentRenderMap[platform];
        if (!platformContent) {
            console.warn("Content not found for platform:", platform);
            return <p>Content not found</p>;
        }

        // Special case for LinkedIn document
        if (platform === 'linkedin' &&
            (contentType === 'document' ||
                (upload?.file_type && ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].includes(upload.file_type.toLowerCase())))) {
            return contentRenderMap.linkedin.document();
        }

        const renderFn = platformContent[contentType];
        if (!renderFn) {
            console.warn(
                `Render function not found for content type: ${contentType} on platform: ${platform}`
            );
            // For LinkedIn, default to document view if content type seems like a document
            if (platform === 'linkedin' && upload?.file_type &&
                ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].includes(upload.file_type.toLowerCase())) {
                return contentRenderMap.linkedin.document();
            }
            return <NoDataMessage type="newKey" icon="broken_image" title="Unsupported Post Type" description="The selected platforms do not share a common post type. Please choose a valid platform to proceed" />;
        }

        // Call the render function dynamically
        return typeof renderFn === "function"
            ? renderFn(contentType === "post" ? isImage : isVideo)
            : renderFn;
    };

    return (
        // <div style={previewViewProps.containerStyle} className="social-content">
        renderContent()
        // </div>
    );
};

export default SocialContent;