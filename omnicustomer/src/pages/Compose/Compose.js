import React, { useRef, useState, useEffect, useReducer } from 'react';
import { getBase64, pageReload, triggerAlert, transformText } from '../../utils/CommonFunctions';
import { useForm, Controller } from 'react-hook-form';
import { Modal } from 'react-bootstrap';
import { commonComposeAPI, SubUserList, subUserData, composeChannelListing, composePostingAction, aiGeneratedContent } from '../../utils/ApiClient';
import './Compose.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ShowComposeModal from './ShowComposeModal';
import { truncateName } from '../../utils/CommonFunctions'
import SocialContent from './Preview';
import Loader from '../../common/components/Loader';
import MultiSelectStatic from '../../common/components/selects/MultiSelectStatic';
import { platformLimits, socialMediaMap, whereToPost } from '../../utils/Constants';
import Emojis from '../../common/components/Emojis';
import PlaylistModal from '../YouTube/PlaylistModal';
import { VscOpenPreview } from "react-icons/vsc";
import PintrestModal from '../Pinterset/PintrestModal';
import CreatePintrestBoard from '../Pinterset/CreatePintrestBoard';


const initialState = {
    selectedPlatform: [],
    activePlatform: null,
    selectedPostType: '',
    alertMessage: null,
    fileType: null,  // Store selected file type (image/video)
    uploads: {
        video: null,
        reel: null,
        story: null,
        post: null,
        short: null,
        document: null,
        board: null,
        pin: null // Add document to the initial state
    },
    showEmojisReaction: false
};

const platformReducer = (state, action) => {
    switch (action.type) {
        case 'SET_SELECTED_PLATFORM': {
            const previousPlatforms = state.selectedPlatform.map(p => p.value);
            const newPlatforms = action.payload.map(p => p.value);

            // Only clear uploads if YouTube is being added or removed
            // const hadYoutube = previousPlatforms.includes(3);
            // const hasYoutube = newPlatforms.includes(3);
            // const shouldClearUploads = hadYoutube !== hasYoutube;

            return {
                ...state,
                selectedPlatform: action.payload,
                activePlatform: action.payload.length > 0 ? action.payload[0].value : null,
                showEmojisReaction: false,
                // uploads: shouldClearUploads ? {} : state.uploads // Only clear uploads if YouTube status changed
                uploads: state.uploads // Only clear uploads if YouTube status changed
            };
        }
        case 'SET_SELECTED_POSTTYPE':
            return {
                ...state,
                selectedPostType: action.payload,
                uploads: {}, // Clear uploads when post type changes
                showEmojisReaction: false
            };
        case 'SET_ACTIVE_PLATFORM':
            return {
                ...state,
                activePlatform: action.payload,
            };
        case 'SET_ALERT_MESSAGE':
            return {
                ...state,
                alertMessage: action.payload,
            };
        case 'SET_FILE_TYPE':
            return {
                ...state,
                fileType: action.payload,
            };
        case 'SET_UPLOAD':
            return {
                ...state,
                uploads: {
                    ...state.uploads,
                    [action.payload.contentType]: action.payload.items,
                },
            };
        case "SHOW_EMOJIS":
            return {
                ...state,
                showEmojisReaction: action.payload,
            };
        case 'RESET_STATE':
            return initialState;
        default:
            return state;
    }
};

export default function Compose({ calendar, showComposeModal, handleComposeClose }) {
    const [state, dispatch] = useReducer(platformReducer, initialState);
    const fileInputRef = useRef(null);
    const fileThumbnailRef = useRef(null);
    const textareaRef = useRef(null); // Reference to the textarea
    const fileVideoRef = useRef(null);
    const fileShortRef = useRef(null);
    const fileDocumentRef = useRef(null); // New reference for document uploads
    const emojiContainerRef = useRef(null); // Add ref for emoji container
    const BASE_URL = process.env.REACT_APP_API_BASE_URL;
    // const [showComposeModal, setShowComposeModal] = useState(false);
    const [userData, setUserData] = useState([]);
    const [channelList, setChannelList] = useState([]); // New state for channel listing
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [showMediaModal, setShowMediaModal] = useState(false); // New state for media modal
    const [isLoading, setIsLoading] = useState(false);
    const [subUser, setSubUser] = useState([]);
    const [mediaFromCompose, setMediaFromCompose] = useState(null);
    const [selectedPlaylists, setSelectedPlaylists] = useState({});
    const [selectedBoard, setSelectedBoard] = useState({});
    const [selectedFile, setSelectedFile] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isOpenModal, setIsOpenModal] = useState(false)
    const [createModalOpen, setCreateModalOpen] = useState(false)
    const { register, handleSubmit, formState: { errors }, reset, setValue, setError, control, clearErrors, watch } = useForm({
        defaultValues: {
            post_type: 'post', // Set default value for post_type
            labels: '1', // Default value for labels is "1" (corresponding to "Advertising")
        }
    });
    const [postingActions, setPostingActions] = useState([]);

    // const handleShowComposeModal = () => {
    //     setShowComposeModal(true);
    // };


    // const handleComposeClose = () => {
    //     setShowComposeModal(false); // Close the modal
    //     reset(); // Reset form values (this will reset all form inputs, including 'post_type')
    //     dispatch({ type: 'RESET_STATE' }); // Clear all state values

    //     if (handleCloseModalfromCalendar) {
    //         handleCloseModalfromCalendar(); // Close calendar modal if applicable

    //     }
    // };

    const handleDateChange = (date, field) => {
        if (!date) {
            field.onChange(null);
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today’s date to compare only date

        const selectedDate = new Date(date);

        if (selectedDate < today) {

            dispatch({
                type: 'SET_ALERT_MESSAGE',
                payload: { type: "warning", message: "Date and time must be today or later." }
            });
            return;
        }


        field.onChange(date); // Store the exact selected date and time
        clearErrors('when_to_post');
    }


    // const fetchSubUser = async () => {
    //     try {
    //         // Pass user_id and params to the API function
    //         const response = await SubUserList();
    //         const response_data = response.data;

    //         if (response_data.error_code === 200) {
    //             const data = response_data.results; // Use response_data to access results
    //             setUserData(data);
    //         } else {
    //             setUserData([]);
    //         }
    //     } catch (error) {
    //         const response_data = error?.response?.data;
    //         console.error('Error fetching sub-user data:', response_data?.message || 'Something went wrong!');
    //     }
    // };
    const fetchSubUserData = async () => {
        try {
            // setIsLoading(true);
            const response = await subUserData(); // Your API call function

            if (response?.data?.results?.length) {
                setSubUser(response.data.results); // Update state with sub-user data
            }
        } catch (error) {
            // console.log(error, "error");
            triggerAlert('error', '', error?.response?.data?.message || "Something went wrong!");
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch channel listing function
    const fetchChannelListing = async () => {
        try {
            setIsLoading(true);
            const response = await composeChannelListing();

            if (response?.data?.error_code === 200) {
                // Transform API response to match the format needed for the dropdown
                const channels = response.data.results.map(channel => {
                    // Use the menu_image property from the API response
                    const iconPath = `/assets/images/icon/${channel.menu_image}`;

                    return {
                        value: channel.channel_id,
                        label: channel.menu_name,
                        icon: iconPath,
                        postTypes: getPostTypesForPlatform(channel.channel_id)
                    };
                });
                setChannelList(channels);
            } else {
                console.error('Error fetching channel listing:', response?.data?.message);
            }
        } catch (error) {
            console.error('Error fetching channel listing:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Helper function to determine post types for each platform
    const getPostTypesForPlatform = (channelId) => {
        switch (channelId) {
            case 1: // Instagram
                return ["post", "story", "reel"];
            case 2: // Facebook
                return ["post", "story", "reel"];
            case 3: // Youtube
                return ["video", "short"];
            case 4: // Pinterest
                return ["board", "pin"];
            default:
                return ["post"];
        }
    };

    useEffect(() => {
        // fetchSubUser(); // Initial fetch with user_id and access_token
        fetchSubUserData();
        fetchChannelListing(); // Call the new function to fetch channel listing
    }, []);
    useEffect(() => {
        // if (showComposeModal) {
        if (calendar) {
            const { action, when_to_post } = calendar;
            setValue('when_to_post', when_to_post);
            setValue('action', action);
        }
        // }

    }, [calendar, showComposeModal]);

    useEffect(() => {
        if (!showComposeModal) { // Run only when modal is closing
            reset(); // Reset form values
            dispatch({ type: 'RESET_STATE' }); // Clear state values

            if (handleComposeClose) {
                handleComposeClose(); // Call close handler only if defined
            }
        }
    }, [showComposeModal]); // Runs only when `showComposeModal` changes

    const handleVideoClick = () => {
        // Only allow video upload if video or reel type is selected and we have an active platform
        if ((state.selectedPostType === 'video' || state.selectedPostType === 'reel') && state.activePlatform) {

            if (fileVideoRef.current) {
                fileVideoRef.current.value = ""; // Reset input to allow re-uploading the same file
                fileVideoRef.current.click(); // Trigger file selection
            } else {
                console.warn("fileInputRef.current is null or undefined!");
            }
        } else {
            if (fileShortRef.current) {
                fileShortRef.current.value = ""; // Reset input to allow re-uploading the same file
                fileShortRef.current.click(); // Trigger file selection
            } else {
                console.warn("fileInputRef.current is null or undefined!");
            }
        }
    };

    const handleDocumentClick = () => {
        if (state.selectedPostType === 'document' && state.activePlatform) {
            if (fileDocumentRef.current) {
                fileDocumentRef.current.value = ""; // Reset input to allow re-uploading the same file
                fileDocumentRef.current.click(); // Trigger file selection
            } else {
                console.warn("fileDocumentRef.current is null or undefined!");
            }
        }
    };

    const handleImageClick = () => {
        // console.log("fileInputRef.current:", fileInputRef.current); // Debugging log
        if ((state.selectedPostType === "post" || state.selectedPostType === "story") && state.activePlatform) {
            if (fileInputRef.current) {
                fileInputRef.current.value = ""; // Reset input to allow re-uploading the same file
                fileInputRef.current.click(); // Trigger file selection
            } else {
                console.warn("fileInputRef.current is null or undefined!");
            }
        }
    };
    const handleMediaModalClose = () => {
        setShowMediaModal(false);
    };

    const handleAddToCompose = (mediaData) => {

        if (!mediaData) {
            triggerAlert("error", "Media Alert", "Please Select Media.")
            dispatch({
                type: 'SET_ALERT_MESSAGE',
                payload: { type: "error", message: "Media data is missing. Please try again." }
            });
            return;
        }
        const { file_upload } = mediaData;

        // Check if selected media type matches the expected type
        if (
            (["post", "story", "board", "pin"].includes(state.selectedPostType) && file_upload !== "image") ||
            (["video", "reel", "short"].includes(state.selectedPostType) && file_upload !== "video")
        ) {
            // alert(`Error: The selected media type (${file_upload}) is not supported for the post type (${state.selectedPostType}).`);
            dispatch({
                type: 'SET_ALERT_MESSAGE',
                payload: { type: "warning", message: `Error: The selected media type (${file_upload}) is not supported for the post type (${state.selectedPostType}).` }
            });
            return;
        }
        const data = mediaData;
        data.from = "common_gallery";
        data.preview = BASE_URL + data.doc_path;

        data.content_type = state.selectedPostType;
        data.platform = state.activePlatform;
        data.file_type = data.doc_path.split(".").pop();
        data.file_name = data.title;
        data.file = BASE_URL + data.doc_path
        const items = data;
        const contentType = state.selectedPostType;
        // Dispatch action to update the appropriate upload in state
        dispatch({
            type: 'SET_UPLOAD',
            payload: { contentType, items }
        });
        if (data.type === 'image') {
            setMediaFromCompose(data)
        } else if (data.type === 'video') {
            setMediaFromCompose(data)
        }

    };



    useEffect(() => {
        if (state.alertMessage) {
            // Clear the alert message after 5 seconds
            const timer = setTimeout(() => {
                dispatch({ type: 'SET_ALERT_MESSAGE', payload: null });  // or '' if you prefer to reset the message
            }, 5000);

            // Cleanup on component unmount or when alertMessage changes
            return () => clearTimeout(timer);
        }
    }, [state.alertMessage]); // This effect runs when alertMessage is set

    //     const value = e.target.value;
    //     setSelectedPlatform(value); // Update the selected platform
    //     reset({
    //         where_to_post: value, // Set the selected value as the new default
    //     });
    //     setImgUpload(null); // Clear uploaded image
    //     setVideoUpload(null); // Clear uploaded video
    //     setCaptionText(''); // Clear caption text
    //     setStoryUpload(null); // Clear story upload if needed
    //     setTextUpload(null);
    //     clearErrors(); // Clear validation errors
    //     setAlertMessage(""); // Clear any existing alert messages when platform changes

    //     // Reset post type based on the selected platform
    //     if (value === 'instagram' || value === 'facebook') {
    //         setSelectedPostType('post');
    //         setValue("post_type", "post");
    //     } else if (value === 'youtube') {
    //         setSelectedPostType('video');
    //         setValue("post_type", "video");
    //     }
    // };

    const handleWhereToPost = (selected) => {
        if (selected.length === 0) {
            // If "Where to Post" is cleared, reset post type to allow new selection
            dispatch({
                type: "RESET_STATE",
            });
            // setValue("post_type", ""); // Clear the post type field

        } else {
            const currentPostType = state.selectedPostType;

            if (currentPostType) {
                // Check if all selected platforms support the current post type
                const isValidSelection = selected.every((platform) => {
                    const match = whereToPost.find((item) => item.value === platform.value);
                    return match ? match.postTypes.includes(currentPostType) : false;
                });

                if (!isValidSelection) {
                    dispatch({
                        type: 'SET_ALERT_MESSAGE',
                        payload: { type: "warning", message: "The selected platforms do not support the currently chosen post type." }
                    });

                    return; // Prevent updating state
                }
            }
        }

        dispatch({
            type: 'SET_SELECTED_PLATFORM',
            payload: selected,
        });

        // Set active platform to YouTube if available, otherwise the first selected platform
        const activePlatform =
            selected.find((platform) => platform.label === 'Youtube')?.value ||
            selected.find((platform) => platform.label === 'Pinterest')?.value ||
            (selected.length > 0 ? selected[0].value : null);

        dispatch({
            type: 'SET_ACTIVE_PLATFORM',
            payload: activePlatform,
        });


        setValue('where_to_post', selected);
    };

    const handlePostType = (e) => {
        const newPostType = e.target.value;
        dispatch({
            type: 'SET_SELECTED_POSTTYPE',
            payload: newPostType,
        });
        setValue('post_type', newPostType);
        // Clear uploads when post type changes
        // dispatch({
        //     type: 'SET_UPLOAD',
        //     payload: { contentType: newPostType, items: null }
        // });

    };

    const handleShowEmojis = (showEmojis) => {
        dispatch({
            type: 'SHOW_EMOJIS',
            payload: !showEmojis
        })
    }

    const handleReactionSelect = async (emoji) => {
        const existingCaption = watch('caption');
        setValue('caption', existingCaption + emoji)
    }


    const getAllowedPostTypes = () => {
        if (state.selectedPlatform.length === 0) return [];
        // Get common post types for all selected platforms
        const selectedPostTypes = state.selectedPlatform.map((platform) => {
            const match = whereToPost.find((item) => item.value === platform.value);
            return match ? match.postTypes : [];
        });
        // Calculate the intersection of post types
        return selectedPostTypes.reduce((a, b) => a.filter((type) => b.includes(type)));
    };
    const allowedPostTypes = getAllowedPostTypes();

    // Handler to toggle active platform
    const handleActivePlatform = (platformValue) => {
        dispatch({
            type: 'SET_ACTIVE_PLATFORM',
            payload: platformValue,
        });
    };

    const processFile = async (file, items, contentType) => {
        try {
            const base64 = await getBase64(file);  // Convert file to base64
            items = {
                file_name: file.name,
                file_type: file.name.split(".").pop(),
                file_size: file.size,
                file: base64.substring(base64.indexOf(",") + 1),
                preview: base64,
                content_type: contentType,
                platform: state.activePlatform // Add platform information
            };

            // Dispatch action to update the appropriate upload in state
            dispatch({
                type: 'SET_UPLOAD',
                payload: { contentType, items }
            });

            // Clear alert message after successful file processing
            dispatch({ type: 'SET_ALERT_MESSAGE', payload: null });
        } catch (error) {
            console.error("Error converting file to base64:", error);
            dispatch({
                type: 'SET_ALERT_MESSAGE',
                payload: { type: "warning", message: "Failed to process the file." }
            });
        }
    };


    const handleFileChange = async (e, type) => {

        const file = e.target.files[0];
        if (!file) return;

        let items = {};
        let contentType = state.selectedPostType;

        // Clear previous alert message
        dispatch({ type: 'SET_ALERT_MESSAGE', payload: null });
        // e.target.value = '';

        // Size restrictions based on type
        const sizeLimit = type === "video" ? 5 * 1024 * 1024 : type === "document" ? 100 * 1024 * 1024 : 5 * 1024 * 1024;
        if (file.size > sizeLimit) {
            dispatch({
                type: 'SET_ALERT_MESSAGE',
                payload: {
                    type: "warning",
                    message: `File size should not exceed ${type === "video" ? "5MB" : type === "document" ? "100MB" : "5MB"}.`
                }
            });
            return;
        }

        // Type-specific validations
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");
        const isDocument = file.type === "application/pdf" ||
            file.type === "application/msword" ||
            file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
            file.type === "application/vnd.ms-excel" ||
            file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
            file.type === "application/vnd.ms-powerpoint" ||
            file.type === "application/vnd.openxmlformats-officedocument.presentationml.presentation";

        const allowedVideoTypes = ["video/mp4", "video/gif", "video/mov"];
        const allowedImageTypes = ["image/jpeg", "image/png", "image/gif"];
        const allowedDocumentTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        ];

        if (type === "document" && isDocument && allowedDocumentTypes.includes(file.type)) {
            // Document validation
            if (file.size > 100 * 1024 * 1024) { // 100MB limit for LinkedIn documents
                dispatch({
                    type: 'SET_ALERT_MESSAGE',
                    payload: {
                        type: "warning",
                        message: "Document size must not exceed 100MB"
                    }
                });
                return;
            }

            try {
                const base64 = await getBase64(file);  // Convert file to base64

                // For documents, create an object with specific document properties
                items = {
                    file_name: file.name,
                    file_type: file.name.split(".").pop(),
                    file_size: file.size,
                    file: base64.substring(base64.indexOf(",") + 1),
                    preview: base64,
                    content_type: "document", // Make sure content_type is set to document
                    platform: state.activePlatform,
                    is_document: true, // Flag to identify this as a document
                    mime_type: file.type // Store the mime type for proper rendering
                };

                // Dispatch action to update the uploads state with the document
                dispatch({
                    type: 'SET_UPLOAD',
                    payload: { contentType: "document", items }
                });

                // Clear alert message after successful file processing
                dispatch({ type: 'SET_ALERT_MESSAGE', payload: null });

                // Success message
                dispatch({
                    type: 'SET_ALERT_MESSAGE',
                    payload: {
                        type: "success",
                        message: `Document "${file.name}" uploaded successfully.`
                    }
                });
            } catch (error) {
                console.error("Error converting document to base64:", error);
                dispatch({
                    type: 'SET_ALERT_MESSAGE',
                    payload: {
                        type: "warning",
                        message: "Failed to process the document file."
                    }
                });
            }
        }

        else if (type === "video" && isVideo && allowedVideoTypes.includes(file.type)) {
            const video = document.createElement("video");
            video.src = URL.createObjectURL(file);

            video.onloadedmetadata = async () => {
                const minWidth = 320;
                const maxWidth = 1920;
                const minHeight = 180;
                const maxHeight = 1080;

                const isValidDimension =
                    video.videoWidth >= minWidth &&
                    video.videoWidth <= maxWidth &&
                    video.videoHeight >= minHeight &&
                    video.videoHeight <= maxHeight;

                const aspectRatio = video.videoWidth / video.videoHeight;
                const isShortVideo = aspectRatio === 9 / 16 && video.duration <= 60;
                const isOnlyYouTube = state.selectedPlatform.length === 1 && state.selectedPlatform[0].value === 3;

                // If neither valid dimensions nor a short video, show error
                if (!isValidDimension && !isShortVideo) {
                    dispatch({
                        type: 'SET_ALERT_MESSAGE',
                        payload: {
                            type: "warning",
                            message: `Video dimensions must be between ${minWidth}x${minHeight} and ${maxWidth}x${maxHeight} pixels.`,
                        }
                    });
                    return;
                }

                // If eligible for short video
                if (isShortVideo && isOnlyYouTube) {
                    dispatch({
                        type: 'SET_ALERT_MESSAGE',
                        payload: { type: "success", message: "Since your video is less than 60 seconds, it will be shared as a Short" }
                    });
                    dispatch({
                        type: 'SET_SELECTED_POSTTYPE',
                        payload: 'short',
                    });
                    setValue('post_type', 'short');
                    setTimeout(async () => {
                        await processFile(file, items, 'short');
                    }, 2000);
                } else {
                    // If valid dimensions but not a short video, proceed normally
                    await processFile(file, items, contentType);
                }
            };

            video.onerror = () => {
                dispatch({
                    type: 'SET_ALERT_MESSAGE',
                    payload: {
                        type: "warning",
                        message: "Error loading video. Please try another file."
                    }
                });
            };
        } else if (type === "short" && isVideo && allowedVideoTypes.includes(file.type)) {
            const video = document.createElement("video");
            video.src = URL.createObjectURL(file);

            video.onloadedmetadata = async () => {
                const aspectRatio = video.videoWidth / video.videoHeight;
                if (aspectRatio !== 9 / 16 && video.duration > 60) {
                    dispatch({
                        type: 'SET_ALERT_MESSAGE',
                        payload: {
                            type: "warning",
                            message: `Video must be in 9:16 aspect ratio and 60 seconds or less`
                        }
                    });
                    return;
                } else {
                    await processFile(file, items, 'short');
                }

            }

            video.onerror = () => {
                dispatch({
                    type: 'SET_ALERT_MESSAGE',
                    payload: {
                        type: "warning",
                        message: "Error loading video. Please try another file."
                    }
                });
            };
        } else if (type === "post" && isImage && allowedImageTypes.includes(file.type)) {
            const img = new Image();
            img.src = URL.createObjectURL(file);

            img.onload = async () => {
                const isValidResolution = contentType === "story"
                    ? img.width <= 1080 && img.height <= 1920
                    : img.width >= 320 && img.width <= 1080;

                if (file.type === "application/pdf") {
                    dispatch({
                        type: 'SET_ALERT_MESSAGE',
                        payload: { type: "warning", message: "PDF files are not allowed." }
                    });
                    return;
                }

                if (!isValidResolution) {
                    dispatch({
                        type: 'SET_ALERT_MESSAGE',
                        payload: {
                            type: "warning",
                            message: contentType === "story"
                                ? "Image resolution must be 1080 x 1920 pixels or smaller."
                                : "Image width must be between 320 and 1080 pixels."
                        }
                    });
                    return;
                }
                await processFile(file, items, contentType);
            };
        } else if (contentType === 'story') {
            const isImage = file.type.startsWith("image/");
            const isVideo = file.type.startsWith("video/");

            if (isImage || isVideo) {
                if (isImage) {
                    const img = new Image();
                    img.src = URL.createObjectURL(file);

                    img.onload = async () => {
                        // Story-specific dimension validation
                        if (img.width > 1080 || img.height > 1920) {
                            dispatch({
                                type: 'SET_ALERT_MESSAGE',
                                payload: {
                                    type: "warning",
                                    message: "Story image dimensions must not exceed 1080x1920 pixels"
                                }
                            });
                            return;
                        }
                        await processFile(file, items, contentType);
                    };
                } else if (isVideo) {
                    // Video validation for stories
                    const video = document.createElement("video");
                    video.src = URL.createObjectURL(file);

                    video.onloadedmetadata = async () => {
                        if (video.duration > 15) { // 15 seconds max for stories
                            dispatch({
                                type: 'SET_ALERT_MESSAGE',
                                payload: {
                                    type: "warning",
                                    message: "Story videos must not exceed 15 seconds"
                                }
                            });
                            return;
                        }
                        await processFile(file, items, contentType);
                    };
                }
            } else {
                dispatch({
                    type: 'SET_ALERT_MESSAGE',
                    payload: {
                        type: "warning",
                        message: "Only images and videos are allowed for stories"
                    }
                });
            }
        } else {
            dispatch({
                type: 'SET_ALERT_MESSAGE',
                payload: {
                    type: "warning",
                    message: type === "document"
                        ? "Invalid file type. Please upload a PDF, Word, or PowerPoint document."
                        : "Invalid file type. Please upload an image or video."
                }
            });
        }
    };

    const handlePlaylistsSelected = (selected) => {
        // console.log(selected)
        const selectedPlaylistIds = selected.map((playlist) => playlist.playlist_id).join(",");
        setSelectedPlaylists({
            for_api: selectedPlaylistIds,
            for_view: selected
        });
    }

    const handleBoardSelected = (selected) => {
        const selectedPlaylistIds = selected.map((playlist) => playlist.playlist_id).join(",");
        setSelectedBoard({
            for_api: selectedPlaylistIds,
            for_view: selected
        });
    }


    // console.log("errors", errors)
    const commonCompose = async (data) => {
        setIsLoading(true);
        try {
            const { selectedPostType, selectedPlatform, uploads } = state;
            let validationErrors = [];

            // Check requirements for each selected platform
            selectedPlatform.forEach(platform => {
                switch (platform.value) {
                    case 3: // YouTube
                        if (!data.title?.trim()) {
                            validationErrors.push("YouTube title is required");
                        }
                        if (!data.caption?.trim()) {
                            validationErrors.push("YouTube description is required");
                        }
                        break;
                    case 1: // Facebook
                    case 2: // Instagram
                        // Only require caption if it's not a story
                        if (selectedPostType !== 'story' && !data.caption?.trim()) {
                            validationErrors.push(`${platform.label} caption is required`);
                        }
                        break;
                    default:
                        break;

                }
            });

            // Check for uploads
            if (selectedPostType && selectedPostType !== "text" && !uploads[selectedPostType]?.file) {
                validationErrors.push("Please upload the required content");
            }

            // Loop through data.where_to_post and check if the caption exceeds the limit for each platform
            data.where_to_post.forEach(platform => {
                if (watch('caption')?.length > platformLimits[platform.value]) {
                    validationErrors.push(`Caption must not exceed ${platformLimits[platform.value]} characters in ${socialMediaMap[platform.value]}`);
                }
            });

            // If there are validation errors, show them and stop submission
            if (validationErrors.length > 0) {
                dispatch({
                    type: 'SET_ALERT_MESSAGE',
                    payload: {
                        type: "warning",
                        message: (
                            <div>
                                <strong>Please fix the following issues:</strong>
                                <ul className="mb-0 mt-1">
                                    {validationErrors.map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        ),
                    },
                });
                setIsLoading(false);
                return;
            }

            // If all validations pass, proceed with API call
            data.channel_id = data.where_to_post.map((item) => item.value);
            data.image_data = uploads[selectedPostType]?.file;
            if (selectedPostType === 'short') {
                data.thumbnail = ''; // we dont need thumbnail for short 
            } else {
                if (selectedFile?.preview) data.thumbnail = selectedFile?.preview?.substring(selectedFile?.preview?.indexOf(",") + 1)

            }

            if (selectedPlaylists?.for_api) {
                data.playlist_id = selectedPlaylists.for_api;
            }

            // Check if the uploaded YouTube video is in 9:16 aspect ratio and is 60 seconds or less
            if (selectedPostType === 'video' && state.activePlatform === 3) {
                const videoBlob = await fetch(uploads.video.preview).then(res => res.blob());
                const video = document.createElement("video");
                video.src = URL.createObjectURL(videoBlob);

                await new Promise((resolve, reject) => {
                    video.onloadedmetadata = () => {
                        const aspectRatio = video.videoWidth / video.videoHeight;
                        // console.log("aspectRatio", aspectRatio, video.duration)
                        if (aspectRatio === 9 / 16 && video.duration <= 60) {
                            data.post_type = 'short';
                        }

                        resolve();
                    };
                    video.onerror = reject;
                });
            }

            const { where_to_post, ...payload } = data;

            // Check if selectedBoard has data
            let postData;
            if (selectedBoard?.for_view?.length > 0) {
                postData = { ...payload, board_id: selectedBoard.for_view[0].id };
            } else {
                postData = { ...payload };
            }

            // console.log('postData', postData);

            let response;

            // Check board selection before calling API when activePlatform is 4
            if (state.activePlatform === 4) {
                if (selectedBoard?.for_view?.length > 0) {
                    response = await commonComposeAPI(postData);
                } else {
                    dispatch({
                        type: 'SET_ALERT_MESSAGE',
                        payload: {
                            type: "warning",
                            message: "Choose the board where you wish to save your posts"
                        }
                    });
                    // triggerAlert("warning", "Required", "Board is required");
                    setIsLoading(false);
                    return;
                }
            } else {
                response = await commonComposeAPI(payload);
            }

            if (response?.data?.error_code === 200 || response?.data?.error_code === 201) {
                const successMessage = transformText(response.data.message, 'capitalize') || "Posted successfully!";
                triggerAlert("success", "Success", successMessage);
                handleComposeClose();
                pageReload();
            } else {
                triggerAlert("error", "Error", "Failed to post the content.");
                handleComposeClose();
            }
        } catch (error) {
            const err_msg = error?.response?.data?.message;

            triggerAlert("error", "Oops...", err_msg || "Something went wrong while posting.");

            console.error(error)
            handleComposeClose();
        } finally {
            setIsLoading(false);
        }
    };

    const handleYoutubeThumbnailSelect = async (event) => {
        const file = event.target.files[0];

        if (file) {
            // Validate file size (less than 2MB)
            if (file.size > 2 * 1024 * 1024) {
                dispatch({
                    type: 'SET_ALERT_MESSAGE',
                    payload: { type: "warning", message: "Thumbnail size must be less than 2MB" }
                });
                return;
            }

            // Validate file format (JPG, PNG, or GIF)
            const allowedFormats = ["image/jpeg", "image/png"];
            if (!allowedFormats.includes(file.type)) {
                dispatch({
                    type: 'SET_ALERT_MESSAGE',
                    payload: { type: "warning", message: "Only JPG or PNG formats are allowed" }
                });
                return;
            }

            // Validate file resolution (1280x720 pixels, 16:9 ratio)
            const image = new Image();
            image.onload = async () => {
                if (image.width > 1280 || image.height > 720) {
                    dispatch({
                        type: 'SET_ALERT_MESSAGE',
                        payload: { type: "warning", message: "Image must be 1280 by 720 pixels (16:9 ratio)" }
                    });
                    return;
                }

                // If all validations pass, create a preview and proceed
                const preview = await getBase64(file);
                setSelectedFile({
                    file: file,
                    preview: preview,
                });
                // console.log("Selected file:", file);
            };
            image.src = URL.createObjectURL(file);
        }
    };

    const handleUploadClick = () => {
        if (fileThumbnailRef) {
            fileThumbnailRef.current.value = ""; // Reset input to allow re-uploading the same file
            fileThumbnailRef.current.click(); // Trigger file selection
        } else {
            console.warn("fileThumbnailRef.current is null or undefined!");
        }
    };


    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleModalOpen = () => {
        setIsOpenModal(true)
    }

    const handleModalClose = () => {
        setIsOpenModal(false)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const viewSocialPreview = async (state, watch, mediaFromCompose) => {
        try {
            // Get the upload based on selected post type
            const upload = mediaFromCompose
                ? mediaFromCompose
                : state.selectedPostType === "post"
                    ? state.uploads.post
                    : state.selectedPostType === "reel"
                        ? state.uploads.reel
                        : state.selectedPostType === "story"
                            ? state.uploads.story
                            : state.selectedPostType === "video"
                                ? state.uploads.video
                                : state.selectedPostType === "board"
                                    ? state.uploads.board
                                    : state.selectedPostType === "pin"
                                        ? state.uploads.pin
                                        : state.selectedPostType === "short"
                                            ? state.uploads.short
                                            : state.selectedPostType === "document"
                                                ? state.uploads.document
                                                : state.selectedPostType === "text"
                                                    ? { content_type: "text" }
                                                    : null;

            if ((!upload || !upload.preview) && state?.selectedPostType !== "text") {
                dispatch({
                    type: 'SET_ALERT_MESSAGE',
                    payload: {
                        type: 'warning',
                        message: 'Upload media to preview'
                    }
                });
                return;
            }

            let processedUpload = { ...upload };
            // Process document or video files
            if (upload?.is_document) {
                processedUpload = {
                    id: upload.id,
                    file_type: upload.file_type,
                    mime_type: upload.mime_type,
                    content_type: "document",
                    file_name: upload.file_name,
                    preview: upload.preview,
                    is_document: true
                };
            }

            const caption = watch("caption") || "";

            const previewData = {
                upload: processedUpload,
                userData: {
                    id: state.userData?.id,
                    username: state.userData?.username,
                    avatar: state.userData?.avatar
                },
                caption: caption,
                selectedPlatform: state.activePlatform,
                youtubeTitle: watch("title") || ""
            };

            const previewId = `preview_${Date.now()}`;

            try {
                // Clear old preview data
                const oldKeys = [];
                for (let i = 0; i < sessionStorage.length; i++) {
                    const key = sessionStorage.key(i);
                    if (key.startsWith('preview_')) {
                        oldKeys.push(key);
                    }
                }
                oldKeys.forEach(key => sessionStorage.removeItem(key));

                sessionStorage.setItem(previewId, JSON.stringify(previewData));

                const storedData = sessionStorage.getItem(previewId);
                if (!storedData) {
                    throw new Error('Data verification failed');
                }
            } catch (storageError) { // Fixed: Correct catch syntax
                console.error('Storage error details:', storageError);
                dispatch({
                    type: 'SET_ALERT_MESSAGE',
                    payload: {
                        type: 'warning',
                        message: 'As the video is too large, the preview will not be available.'
                    }
                });
                try {
                    const emergencyData = {
                        upload: {
                            file_type: processedUpload.file_type,
                            preview: processedUpload.preview
                        },
                        caption: caption
                    };
                    sessionStorage.setItem(previewId, JSON.stringify(emergencyData));
                } catch (finalError) {
                    throw new Error(`Storage failed: ${finalError.message}`);
                }
            }

            // Fixed width for all media types
            const windowWidth = Math.floor(window.screen.width * 0.4);

            // Calculate dynamic height based on caption length for all content types
            const captionLines = caption.length > 0 ? Math.ceil(caption.length / 40) : 0;
            const captionHeight = Math.max(captionLines * 28, 80); // Line height: 28px, min 80px
            const captionPadding = caption.length > 0 ? 100 : 40; // Padding: 100px with caption, 40px without

            // Define base heights for each content type
            const baseHeights = {
                video: 420, // Video, reel, short
                reel: 420,
                short: 420,
                post: 400, // Standard post
                story: 600, // Stories are typically taller
                document: 500, // Documents need space for file preview
                pin: 450, // Pins are medium-sized
                board: 450, // Boards are similar to pins
                text: 300 // Text posts are more compact
            };

            // Determine if the upload is a video
            const isVideo = (
                processedUpload.file_type === 'mp4' ||
                processedUpload.file_type === 'webm' ||
                processedUpload.file_type === 'ogg'
            );

            // Calculate window height based on content type
            let windowHeight;
            const contentType = state.selectedPostType;

            // Apply base height + dynamic caption height for all types
            const baseHeight = baseHeights[contentType] || 400; // Fallback to 400 if type is unknown
            windowHeight = baseHeight + captionHeight + captionPadding;
            windowHeight = Math.max(windowHeight, baseHeight + 80 + 66); // Ensure minimum height

            // Center the window on screen
            const left = Math.floor((window.screen.width - windowWidth) / 2);
            const top = Math.floor((window.screen.height - windowHeight) / 2);

            // Open the preview window with dynamic dimensions
            const newWindow = window.open(
                `/preview?id=${previewId}`,
                "_blank",
                `width=${windowWidth},height=${windowHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
            );

            if (!newWindow) {
                sessionStorage.removeItem(previewId);
                if (processedUpload.blobUrl) {
                    URL.revokeObjectURL(processedUpload.blobUrl);
                }
                throw new Error("Popup was blocked by the browser");
            }

            const checkWindow = setInterval(() => {
                if (newWindow.closed) {
                    sessionStorage.removeItem(previewId);
                    if (processedUpload.blobUrl) {
                        URL.revokeObjectURL(processedUpload.blobUrl);
                    }
                    clearInterval(checkWindow);
                }
            }, 1000);

        } catch (error) {
            console.error('Preview error:', error);
        }
    };

    const handleMediaIconClick = () => {
        setShowMediaModal(true); // Open media modal when icon is clicked
    };

    const openBoardModal = () => {
        setCreateModalOpen(true)
    }

    const closeBoardModal = () => {
        setCreateModalOpen(false)
    }


    // Approved by the Ropallin
    useEffect(() => {
        function handleClickOutside(event) {
            if (state.showEmojisReaction &&
                emojiContainerRef.current &&
                !emojiContainerRef.current.contains(event.target) &&
                !event.target.closest('button[type="button"]')?.querySelector('.fa-smile-o')) {
                dispatch({
                    type: 'SHOW_EMOJIS',
                    payload: false
                });
            }
        }

        // Add event listener when emoji picker is shown
        if (state.showEmojisReaction) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        // Clean up event listener
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [state.showEmojisReaction]);

    const fetchPostingAction = async () => {
        try {
            setIsLoading(true);
            const response = await composePostingAction();
            if (response?.data?.error_code === 200) {
                const { results } = response.data;
                setPostingActions(results); // store in state
            } else {
                console.error('Error fetching posting actions:', response?.data?.message);
                setPostingActions([]);
            }
        } catch (error) {
            console.error('Error fetching posting actions:', error);
            setPostingActions([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPostingAction();
    }, []);

    const handleAiContent = async () => {
        const { selectedPostType, uploads } = state;
        const currentUpload = uploads[selectedPostType];
        if (!currentUpload || !currentUpload.file) {
            dispatch({
                type: 'SET_ALERT_MESSAGE',
                payload: {
                    type: "warning",
                    message: "Please upload an image or video first to generate AI content."
                }
            });
            return;
        }

        const api_input = {
            base64: currentUpload.file,
        };

        try {
            setIsAiLoading(true); // Set loading state to true when starting the API call
            const response = await aiGeneratedContent(api_input);
            const response_data = response.data.results;

            if (response.data.error_code === 200) {
                // Set the generated content in the caption field
                setValue('caption', response_data.generated_content);
                triggerAlert('success', 'Success', 'Content generated successfully!');
            } else {
                triggerAlert('error', 'Oops...', 'Something went wrong.');
            }
        } catch (error) {
            console.error(error);
            triggerAlert('error', 'Oops...', 'Something went wrong.');
        } finally {
            setIsAiLoading(false); // Set loading state to false when the API call is complete
        }
    };
    return (
        <>
            {/* <li className="nav-item">
                <a className="d-flex align-items-center" href="#/" onClick={handleShowComposeModal}>
                    <button type="button" className="btn btn-primary">
                        <i className="fa fa-pencil" aria-hidden="true"></i> Compose
                    </button>
                </a>
            </li> */}

            <Modal show={showComposeModal} onHide={handleComposeClose} backdrop="static" size="xl" centered style={{ zIndex: 1040 }}>
                <Modal.Header closeButton>
                    <Modal.Title>Compose</Modal.Title>
                </Modal.Header>
                <form id="creditCardForm"
                    className="g-3 fv-plugins-bootstrap5 fv-plugins-framework fv-plugins-icon-container"
                    novalidate="novalidate" onSubmit={handleSubmit(commonCompose)}>
                    <Modal.Body>
                        {isLoading && (
                            <div className='loader-overlay text-white'>
                                <Loader />
                            </div>
                        )}
                        <div className="row  ">
                            <div className="form-group col-md-4">
                                <label className="form-label">Where to Post <span className="text-danger">*</span></label>
                                <Controller
                                    name="where_to_post"
                                    control={control}
                                    rules={{ required: 'Where to post is required' }}
                                    render={({ field }) => (
                                        <MultiSelectStatic
                                            {...field}
                                            options={channelList.length > 0 ? channelList : whereToPost} // Use API data if available
                                            value={field.value}
                                            onSelect={(selectedValue) => {
                                                const currentPostType = state.selectedPostType;

                                                if (currentPostType) {
                                                    const isValidSelection = selectedValue.every((platform) => {
                                                        const match = channelList.length > 0
                                                            ? channelList.find((item) => item.value === platform.value)
                                                            : whereToPost.find((item) => item.value === platform.value);
                                                        return match?.postTypes.includes(currentPostType);
                                                    });

                                                    if (!isValidSelection) {
                                                        dispatch({
                                                            type: 'SET_ALERT_MESSAGE',
                                                            payload: { type: "warning", message: "The selected platforms do not support the currently chosen post type." }
                                                        });
                                                        return; // Stop selection
                                                    }
                                                }
                                                field.onChange(selectedValue); // Update the field value
                                                clearErrors('where_to_post'); // Clear validation error for the field
                                                handleWhereToPost(selectedValue); // Optional: Additional logic for selection
                                            }}
                                            placeholder="Choose where to post"
                                        />
                                    )}
                                />

                                {errors.where_to_post && (
                                    <div
                                        style={{
                                            color: "red",
                                            fontSize: "13px",
                                            marginTop: "1px",
                                        }}
                                    >
                                        {errors.where_to_post.message}
                                    </div>
                                )}
                            </div>
                            {/* Post Type Dropdown */}
                            <div className="form-group col-md-4">
                                <label className="form-label">Post Type <span className="text-danger">*</span></label>
                                <select
                                    className="form-select"
                                    name="post_type"
                                    {...register("post_type", {
                                        required: "Post Type is required",
                                    })}
                                    onChange={(e) => {
                                        clearErrors("post_type"); // Clear validation error for "post_type"
                                        handlePostType(e); // Custom handler for additional logic
                                    }}
                                >
                                    <option value="" selected hidden>Select Post Type</option>
                                    {allowedPostTypes.length > 0 ? (
                                        allowedPostTypes.map((type) => (
                                            <option key={type} value={type}>
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="" disabled>
                                            {/* Select a platform first */}
                                            Post type not found for the selected platforms.
                                        </option>
                                    )}
                                </select>
                                {errors.post_type && (
                                    <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                                        {errors.post_type.message}
                                    </div>
                                )}
                            </div>
                            <div class="col-md-4">
                                <div id='selected-platform'>
                                    <ul class=" d-flex ms-4 list-inline justify-content-center">
                                        {state.selectedPlatform?.map((platform) => (
                                            <li key={platform.value} className="pe-3">
                                                <a
                                                    href="#!"
                                                    className={state.activePlatform === platform.value ? "active" : ""}
                                                    onClick={() => handleActivePlatform(platform.value)} // Set active platform
                                                >
                                                    <img
                                                        src={platform.icon} // Dynamically load icon based on selection
                                                        className="img-fluid rounded"
                                                        alt={platform.label}
                                                        loading="lazy"
                                                    />
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="row mb-4">
                            <div className="col-md-8">
                                <div>
                                    <div className="d-flex align-items-center">
                                        {/* <div className="user-img">
                                            <img src="/assets/images/icon-7797704_1280.png" alt="userimg" className="rounded-circle img-fluid" loading="lazy" width="40" />
                                        </div> */}
                                        <p className="px-5 mt-3 fw-bold">Content/Title/Desciption</p>
                                        {state.selectedPostType && ['post', 'reel', 'story', 'pin', 'video', 'short'].includes(state.selectedPostType) && (
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-info"
                                                onClick={handleAiContent}
                                                disabled={isAiLoading}
                                                title="Generate content with AI"
                                            >
                                                {isAiLoading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                        <span className="visually-hidden">Loading...</span>
                                                    </>
                                                ) : (
                                                    "✨  AI Assistant"
                                                )}
                                            </button>
                                        )}

                                    </div>
                                    {(state.activePlatform === 3 || state.activePlatform === 4) && (
                                        <div className="post-text ms-5 mb-2 position-relative ">
                                            {/* <label className="form-label">Title</label> */}
                                            <input
                                                type='text'
                                                className="form-control"
                                                {...register("title", {
                                                    required: "Title is required",
                                                    maxLength: {
                                                        value: 100,
                                                        message: "Title cannot exceed 100 characters.",
                                                    },
                                                    validate: (value) => {
                                                        return value.length > 3 || "Title must be more than 3 characters.";
                                                    }
                                                })}
                                                placeholder={
                                                    state.selectedPostType === 'short' && state.activePlatform === 3 ? 'Add a Title for your Short' :
                                                        state.selectedPostType === 'video' ? 'Add a Title for your video' :
                                                            state.selectedPostType === 'board' ? 'Add a Title for your board' :
                                                                state.selectedPostType === 'pin' ? 'Add a Title for your pin' :
                                                                    state.activePlatform === 4 ? 'Add a Title for your post' :
                                                                        'Add a Title for your post'
                                                }
                                                onChange={(e) => {
                                                    if (e.target.value !== '') {
                                                        setValue("title", e.target.value, { shouldValidate: true }); // Ensure validation updates
                                                    }
                                                }}
                                            />
                                            <div className='d-flex justify-content-between'>
                                                <div>
                                                    {errors.title && (
                                                        <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                                                            {errors.title.message}
                                                        </div>
                                                    )}
                                                </div>
                                                <span>
                                                    {watch("title") ? watch("title")?.length : 0} / 100
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="post-text ms-5 mb-2 position-relative">
                                        {/* {state.selectedPostType !== 'story' && ( */}
                                        <textarea
                                            className="form-control"
                                            id="captionTextArea"
                                            rows={5}
                                            data-gramm="false"
                                            placeholder={
                                                state.selectedPostType === 'short' && state.activePlatform === 3 ? 'Tell viewers about your Short' :
                                                    state.selectedPostType === 'video' ? 'Tell viewers about your video' :
                                                        state.selectedPostType === 'short' ? 'Add a description for your short' :
                                                            state.selectedPostType === 'reel' ? 'Add a caption for your reel' :
                                                                state.selectedPostType === 'story' ? 'Add a caption for your story' :
                                                                    state.selectedPostType === 'board' ? 'Describe your board' :
                                                                        state.selectedPostType === 'pin' ? 'Add a description for your pin' :
                                                                            state.activePlatform === 4 ? 'Add a description for your post' :
                                                                                'Tell viewers about your post'
                                            }
                                            disabled={state.selectedPostType === 'story'}
                                            name="caption"
                                            ref={textareaRef}
                                            {...register("caption", {
                                                required: state.selectedPostType !== 'story' ? "Caption is required" : false,
                                                maxLength: {
                                                    value: platformLimits[state.activePlatform], // Dynamically set maxLength based on activePlatform
                                                    message: `Caption cannot exceed ${platformLimits[state.activePlatform]} characters.`,
                                                },
                                            })}
                                            // value={captionText}
                                            onChange={(e) => {
                                                const maxLength = platformLimits[state.activePlatform]; // Get the current maxLength based on activePlatform

                                                // if (e.target.value.length <= maxLength) {
                                                //     setValue("caption", e.target.value, { shouldValidate: true }); // Ensure validation updates
                                                // }
                                                setValue("caption", e.target.value?.slice(0, maxLength), { shouldValidate: true }); // Ensure validation updates
                                            }}
                                        ></textarea>
                                        {/* )} */}

                                        {/* Wrapper for error message and character count */}
                                        {state.selectedPostType !== 'story' && (
                                            <div
                                                className="d-flex justify-content-between align-items-center mt-1"
                                                style={{
                                                    minHeight: '20px', // Prevent shifting when error message appears
                                                }}
                                            >
                                                <div>
                                                    {errors.caption && (
                                                        <span
                                                            style={{
                                                                color: "red",
                                                                fontSize: "14px",
                                                                marginRight: "10px", // Space between error and character count
                                                            }}
                                                        >
                                                            {errors.caption.message}
                                                        </span>
                                                    )}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: "14px",
                                                        color: "#555", // Optional: Customize color for character count
                                                    }}
                                                >
                                                    {state.activePlatform && (
                                                        <>
                                                            {watch("caption")?.length} / {platformLimits[state.activePlatform]}
                                                        </>
                                                    )}{/* Dynamically display character count */}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="d-flex align-items-center ms-5" style={{ position: 'relative' }}>
                                        {/* Image Upload Button */}
                                        {(state.selectedPostType === 'post' || state.selectedPostType === 'story') && (
                                            <button className="btn btn-soft-primary me-2" type='button' onClick={handleImageClick}>
                                                <i className="fa fa-picture-o fs-5" aria-hidden="true"></i>
                                            </button>

                                        )}

                                        {/* Document Upload Button - New button for document type */}
                                        {state.selectedPostType === 'document' && (
                                            <button className="btn btn-soft-primary me-2" type='button' onClick={handleDocumentClick}>
                                                <i className="fa fa-file-text-o fs-5" aria-hidden="true"></i>
                                            </button>
                                        )}

                                        {/* Video Upload Button */}
                                        {(state.selectedPostType === 'reel' || state.selectedPostType === 'video' || state.selectedPostType === 'short') && (
                                            <a href="#/" className="me-2" onClick={handleVideoClick}>
                                                <button className="btn btn-soft-primary" type='button'>
                                                    <i className="fa fa-file-video-o fs-5" aria-hidden="true"></i>
                                                </button>
                                            </a>
                                        )}
                                        {/* Media Gallery Button */}
                                        {state?.selectedPostType && state?.selectedPostType !== 'text' &&
                                            <a href="#/" className="me-2" onClick={handleMediaIconClick}>
                                                <button className="btn btn-soft-primary" type='button'>
                                                    <i className="fa fa-folder-open fs-5" aria-hidden="true"></i>
                                                </button>
                                            </a>
                                        }
                                        {/* Reactions Button */}
                                        {state.selectedPostType !== 'story' && (
                                            <a href="#/" className="me-2 " onClick={() => handleShowEmojis(state?.showEmojisReaction)}>
                                                <button className=" btn btn-soft-primary" type='button'><i class="fa fa-smile-o fs-5" aria-hidden="true"></i></button>
                                            </a>
                                        )}

                                        {/* Hidden file input for images */}
                                        <input
                                            type="file"
                                            ref={(el) => {
                                                fileInputRef.current = el; // Ensure ref is assigned properly
                                            }}
                                            style={{ display: 'none' }}
                                            onChange={(e) => handleFileChange(e, 'post')}
                                            accept="image/*"
                                        />

                                        {/* Hidden file input for documents */}
                                        <input
                                            type="file"
                                            ref={(el) => {
                                                fileDocumentRef.current = el;
                                            }}
                                            style={{ display: 'none' }}
                                            onChange={(e) => handleFileChange(e, 'document')}
                                            accept=".pdf,.doc,.docx,.ppt,.pptx"
                                        />

                                        {/* Hidden file input for videos */}
                                        <input
                                            type="file"
                                            ref={(el) => {
                                                fileVideoRef.current = el; // Ensure ref is assigned properly
                                            }}
                                            style={{ display: 'none' }}
                                            onChange={(e) => handleFileChange(e, 'video')}
                                        />
                                        <input
                                            type="file"
                                            ref={(el) => {
                                                fileShortRef.current = el; // Ensure ref is assigned properly
                                            }}
                                            style={{ display: 'none' }}
                                            onChange={(e) => handleFileChange(e, 'short')}
                                        />
                                        {/* // Approved by the Ropallin */}
                                        {state?.showEmojisReaction && (
                                            <div className='mt-3'
                                                ref={emojiContainerRef} // Add ref to emoji container
                                                style={{
                                                    position: "absolute",
                                                    zIndex: 1000,
                                                    // bottom: state.activePlatform === 3 ? '12.3em' : '34px', // Adjust position for YouTube
                                                    bottom: '-7px', // Adjust position for YouTube
                                                    left: '150px',
                                                    backgroundColor: "#fff",
                                                    overflowY: "auto",
                                                    maxHeight: "300px"
                                                }}
                                            >
                                                <Emojis
                                                    reaction={true}
                                                    allowExpand={true}
                                                    onEmojiSelect={
                                                        handleReactionSelect
                                                    }
                                                    pickerSize={{ height: 288, width: 450 }}
                                                />
                                            </div>
                                        )}
                                    </div>


                                    {state.activePlatform === 3 && (
                                        <div className="d-flex justify-content-center  gap-3 mt-3">
                                            {/* <label className="form-label">Thumbnail</label> */}
                                            {state.selectedPostType !== 'short' && (
                                                !Object.keys(selectedFile)?.length ? (
                                                    <div className="text-center" type='button'>
                                                        <input
                                                            type="file"
                                                            ref={(el) => {
                                                                fileThumbnailRef.current = el; // Ensure ref is assigned properly
                                                            }}
                                                            onChange={handleYoutubeThumbnailSelect}
                                                            className="d-none"
                                                            accept="image/*"
                                                        />
                                                        <div
                                                            onClick={handleUploadClick}
                                                            className="upload-area p-4 border-dashed rounded d-inline-block"
                                                        >
                                                            <div className="mb-2">
                                                                <svg className="upload-icon" width="32" height="32" viewBox="0 0 24 24">
                                                                    <path
                                                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                                                        stroke="currentColor"
                                                                        fill="none"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth="2"
                                                                    />
                                                                </svg>
                                                            </div>
                                                            <div className="text-center">
                                                                <span className="text-muted">Upload thumbnail</span>

                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (

                                                    <div
                                                        className='d-inline-block border-dashed rounded position-relative'

                                                    >
                                                        <img src={selectedFile?.preview} alt='thumbnail'
                                                            style={{ height: '7.2rem', width: '10rem', objectFit: 'contain' }} />
                                                        <button
                                                            onClick={() => setSelectedFile({})}
                                                            style={{
                                                                position: "absolute",
                                                                top: "-10px",
                                                                right: "-10px",
                                                                background: "black",
                                                                color: "white",
                                                                width: "20px",
                                                                height: "20px",
                                                                cursor: "pointer",
                                                                display: "flex",
                                                                justifyContent: "center",
                                                                alignItems: "center",
                                                                borderRadius: "50%",
                                                            }}
                                                        >
                                                            &times;
                                                        </button>
                                                    </div>

                                                )
                                            )
                                            }
                                            {selectedPlaylists?.for_view && selectedPlaylists?.for_view.length > 0 ? (

                                                <div className='rounded border-dashed p-5 position-relative'>
                                                    {selectedPlaylists.for_view.length === 1 ? ( // Check if only one playlist is selected -> yes display only the playlist name
                                                        selectedPlaylists.for_view.map((item) => (
                                                            <span key={item.playlist_id} >{item.title}</span> // Access `title` instead of `name`
                                                        ))
                                                    ) : (
                                                        <span >{selectedPlaylists.for_view.length} Playlists</span> // Display the number of selected playlists
                                                    )}
                                                    <button
                                                        onClick={() => setSelectedPlaylists({})}
                                                        style={{
                                                            position: "absolute",
                                                            top: "-10px",
                                                            right: "-10px",
                                                            background: "black",
                                                            color: "white",
                                                            width: "20px",
                                                            height: "20px",
                                                            cursor: "pointer",
                                                            display: "flex",
                                                            justifyContent: "center",
                                                            alignItems: "center",
                                                            borderRadius: "50%",
                                                        }}
                                                    >
                                                        &times;
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="text-center" type="button">
                                                    <div
                                                        className="upload-area p-4 border-dashed rounded d-inline-block"
                                                        onClick={handleOpenModal}
                                                    >
                                                        <div className="mb-2">
                                                            <svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="32" height="32" viewBox="0 0 512.000000 512.000000" preserveAspectRatio="xMidYMid meet">

                                                                <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" fill="#555770" stroke="none">
                                                                    <path d="M557 3825 c-82 -28 -126 -100 -127 -201 0 -82 30 -139 95 -179 l48 -30 1206 -3 c874 -2 1221 1 1261 9 131 27 197 174 136 305 -25 53 -58 83 -115 102 -54 19 -2453 16 -2504 -3z" />
                                                                    <path d="M545 2753 c-78 -41 -115 -103 -115 -193 0 -89 37 -152 112 -191 36 -18 78 -19 1270 -19 1175 0 1235 1 1273 19 154 69 154 313 0 382 -38 18 -98 19 -1275 18 -1107 0 -1238 -1 -1265 -16z" />
                                                                    <path d="M3757 2545 c-50 -17 -85 -50 -108 -100 -16 -35 -19 -68 -19 -282 l0 -243 -232 0 c-130 0 -250 -5 -270 -10 -85 -24 -137 -102 -138 -206 0 -82 30 -139 95 -179 l48 -30 249 -3 248 -4 0 -242 c0 -235 1 -244 23 -287 15 -29 40 -54 71 -74 41 -25 58 -29 116 -29 58 0 75 4 116 29 31 20 56 45 71 74 22 43 23 52 23 287 l0 242 248 4 249 3 48 30 c65 40 95 97 95 179 -1 104 -53 182 -138 206 -20 5 -140 10 -269 10 l-233 0 0 243 c0 213 -3 247 -19 282 -43 97 -163 140 -274 100z" />
                                                                    <path d="M582 1700 c-94 -22 -152 -102 -152 -206 1 -102 53 -180 138 -204 53 -14 1583 -14 1637 1 61 17 120 82 134 148 23 107 -15 197 -104 245 -40 21 -43 21 -830 23 -434 1 -805 -2 -823 -7z" />
                                                                </g>
                                                            </svg>
                                                        </div>
                                                        <div className="text-center">
                                                            <span className="text-muted">Add video to playlist</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {
                                        state.selectedPlatform.some(platform => platform.value === 4) && (
                                            <div className="d-flex justify-content-center gap-3 mt-3">
                                                {/* Thumbnail section (optional, kept as per your original code) */}
                                                {state.selectedPostType !== 'post' && state.activePlatform === 4 && (
                                                    !Object.keys(selectedFile)?.length ? (
                                                        null
                                                    ) : (
                                                        <div className='d-inline-block border-dashed rounded position-relative'>
                                                            <img
                                                                src={selectedFile?.preview}
                                                                alt='thumbnail'
                                                                style={{ height: '7.2rem', width: '10rem', objectFit: 'contain' }}
                                                            />
                                                            <button
                                                                onClick={() => setSelectedFile({})}
                                                                style={{
                                                                    position: "absolute",
                                                                    top: "-10px",
                                                                    right: "-10px",
                                                                    background: "black",
                                                                    color: "white",
                                                                    width: "20px",
                                                                    height: "20px",
                                                                    cursor: "pointer",
                                                                    display: "flex",
                                                                    justifyContent: "center",
                                                                    alignItems: "center",
                                                                    borderRadius: "50%",
                                                                }}
                                                            >
                                                                &times;
                                                            </button>
                                                        </div>
                                                    )
                                                )}
                                                {/* Board selection section */}
                                                {selectedBoard?.for_view && selectedBoard?.for_view.length > 0 && state.activePlatform === 4 ? (
                                                    <div className='rounded border-dashed p-5 position-relative'>
                                                        {selectedBoard.for_view.length === 1 ? (
                                                            selectedBoard.for_view.map((item) => (
                                                                <span key={item.id}>{item.title}</span>
                                                            ))
                                                        ) : (
                                                            <span>{selectedBoard.for_view.length} Boards</span>
                                                        )}
                                                        <button
                                                            onClick={() => setSelectedBoard({})}
                                                            style={{
                                                                position: "absolute",
                                                                top: "-10px",
                                                                right: "-10px",
                                                                background: "black",
                                                                color: "white",
                                                                width: "20px",
                                                                height: "20px",
                                                                cursor: "pointer",
                                                                display: "flex",
                                                                justifyContent: "center",
                                                                alignItems: "center",
                                                                borderRadius: "50%",
                                                            }}
                                                        >
                                                            &times;
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="text-center" type="button">
                                                        <div
                                                            className="upload-area p-4 border-dashed rounded d-inline-block"
                                                            onClick={state.activePlatform === 4 ? handleModalOpen : () => handleActivePlatform(4)} // Switch to Pinterest if not active
                                                        >
                                                            <div className="mb-2">
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    version="1.0"
                                                                    width="32"
                                                                    height="32"
                                                                    viewBox="0 0 512.000000 512.000000"
                                                                    preserveAspectRatio="xMidYMid meet"
                                                                >
                                                                    <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" fill="#555770" stroke="none">
                                                                        <path d="M557 3825 c-82 -28 -126 -100 -127 -201 0 -82 30 -139 95 -179 l48 -30 1206 -3 c874 -2 1221 1 1261 9 131 27 197 174 136 305 -25 53 -58 83 -115 102 -54 19 -2453 16 -2504 -3z" />
                                                                        <path d="M545 2753 c-78 -41 -115 -103 -115 -193 0 -89 37 -152 112 -191 36 -18 78 -19 1270 -19 1175 0 1235 1 1273 19 154 69 154 313 0 382 -38 18 -98 19 -1275 18 -1107 0 -1238 -1 -1265 -16z" />
                                                                        <path d="M3757 2545 c-50 -17 -85 -50 -108 -100 -16 -35 -19 -68 -19 -282 l0 -243 -232 0 c-130 0 -250 -5 -270 -10 -85 -24 -137 -102 -138 -206 0 -82 30 -139 95 -179 l48 -30 249 -3 248 -4 0 -242 c0 -235 1 -244 23 -287 15 -29 40 -54 71 -74 41 -25 58 -29 116 -29 58 0 75 4 116 29 31 20 56 45 71 74 22 43 23 52 23 287 l0 242 248 4 249 3 48 30 c65 40 95 97 95 179 -1 104 -53 182 -138 206 -20 5 -140 10 -269 10 l-233 0 0 243 c0 213 -3 247 -19 282 -43 97 -163 140 -274 100z" />
                                                                        <path d="M582 1700 c-94 -22 -152 -102 -152 -206 1 -102 53 -180 138 -204 53 -14 1583 -14 1637 1 61 17 120 82 134 148 23 107 -15 197 -104 245 -40 21 -43 21 -830 23 -434 1 -805 -2 -823 -7z" />
                                                                    </g>
                                                                </svg>
                                                            </div>
                                                            <div className="text-center">
                                                                <span className="text-muted">Add board to playlist</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card card-preview border-dashed mb-0">
                                    <div className="card-header py-2">
                                        <div className="header-title d-flex align-items-center justify-content-between">
                                            <h5 className="card-title">Preview</h5>
                                            <span class="fs-3" type="button" aria-hidden="true" title='Full Preview' onClick={() => {
                                                viewSocialPreview(state, watch, mediaFromCompose)
                                            }
                                            }
                                            >
                                                <VscOpenPreview />
                                            </span>
                                        </div>
                                    </div>
                                    <div className="card-body h-100 w-100 pt-2">
                                        {
                                            (mediaFromCompose || state.uploads.post || state.uploads.video || state.uploads.story || state.uploads.reel || state.selectedPostType === "text" || state.uploads.short || state.uploads.document || state.uploads.board || state.uploads.pins) ? (
                                                <SocialContent

                                                    upload={
                                                        mediaFromCompose
                                                            ? mediaFromCompose
                                                            : state.selectedPostType === "post"
                                                                ? state.uploads.post
                                                                : state.selectedPostType === "reel"
                                                                    ? state.uploads.reel
                                                                    : state.selectedPostType === "story"
                                                                        ? state.uploads.story
                                                                        : state.selectedPostType === "video"
                                                                            ? state.uploads.video
                                                                            : state.selectedPostType === "short"
                                                                                ? state.uploads.short
                                                                                : state.selectedPostType === "board"
                                                                                    ? state.uploads.board
                                                                                    : state.selectedPostType === "pin"
                                                                                        ? state.uploads.pin
                                                                                        : state.selectedPostType === "document"
                                                                                            ? state.uploads.document  // Add document here
                                                                                            : state.selectedPostType === "text"
                                                                                                ? { content_type: "text" }
                                                                                                : null
                                                    }
                                                    userData={userData}
                                                    watch={watch("caption")}
                                                    truncateName={truncateName}
                                                    selectedPlatform={state.activePlatform} // Pass the selected platform as a prop
                                                    youtubeTitle={watch("title") || ""}
                                                />
                                            ) : <span className='h-100 d-flex align-items-center'>Select the desired platform to preview your content.</span>
                                        }
                                    </div>
                                </div>
                                {state.alertMessage && (
                                    <div className="mt-1">
                                        <div className={`alert p-1 alert-${state.alertMessage?.type}`} role="alert">
                                            <div className="d-flex align-items-start mt-2">
                                                <div className="me-2">
                                                    {state.alertMessage?.type === 'warning' ? (
                                                        <span
                                                            className="material-symbols-outlined"
                                                            style={{ fontSize: "24px", color: "#000" }}
                                                        >
                                                            error
                                                        </span>
                                                    ) :
                                                        state.alertMessage?.type === 'success' ? (
                                                            <span
                                                                className="material-symbols-outlined"
                                                                style={{ fontSize: "24px", color: "#000" }}
                                                            >
                                                                check_circle
                                                            </span>
                                                        ) :
                                                            (
                                                                <span
                                                                    className="material-symbols-outlined"
                                                                    style={{ fontSize: "24px", color: "#000" }}
                                                                >
                                                                    info
                                                                </span>
                                                            )}
                                                </div>
                                                <div>
                                                    <div style={{ color: "black", fontSize: "14px", fontWeight: "500" }}>
                                                        {typeof state.alertMessage.message === 'string'
                                                            ? state.alertMessage.message
                                                            : state.alertMessage.message}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="row w-100">
                            <div className="form-group col-md-3">
                                <label className="form-label">Add Labels</label>
                                <select
                                    className="form-select"
                                    name="labels"
                                    {...register("labels", {
                                        required: "Labels is required",
                                    })}
                                    defaultValue="1" // Default value should be "1" for the payload
                                >
                                    <option value="" hidden>Select Label</option>
                                    <option value="1">Advertising</option>
                                    <option value="2">Announcement</option>
                                    <option value="3">Marketing</option>
                                    <option value="4">Educational</option>
                                    <option value="5">Testimonial</option>
                                    <option value="6">Behind-the-Scenes</option>
                                    <option value="7">Event</option>
                                    <option value="8">Product Showcase</option>
                                    <option value="9">Industry News</option>
                                    <option value="10">Community Engagement</option>
                                    <option value="11">Inspirational</option>
                                    <option value="12">FAQ</option>
                                    <option value="13">Promotional</option>
                                    <option value="14">Research/Insights</option>
                                    <option value="15">Sustainability</option>
                                    <option value="16">Collaboration</option>
                                    <option value="17">Celebration</option>
                                </select>
                                {errors.labels && (
                                    <div
                                        style={{
                                            color: "red",
                                            fontSize: "14px",
                                            marginTop: "5px",
                                        }}
                                    >
                                        {errors.labels.message}
                                    </div>
                                )}
                            </div>
                            <div className="form-group col-md-3">
                                <label className="form-label">
                                    Choose a Posting Action <span className="text-danger">*</span>
                                </label>
                                <select
                                    className="form-select"
                                    name="action"
                                    {...register("action", {
                                        required: "Choose a Posting Action is required",
                                    })}
                                >
                                    <option value="" hidden>Select</option>
                                    {postingActions.map(action => (
                                        <option key={action.id} value={action.id}>
                                            {action.name
                                                .split(" ")
                                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                .join(" ")}
                                        </option>
                                    ))}

                                </select>
                                {errors.action && (
                                    <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                                        {errors.action.message}
                                    </div>
                                )}
                            </div>
                            {watch("action") === "3" && (
                                <div className="col-md-3">
                                    <div className="form-group">
                                        <label className="form-label">When to Post (EST Timezone) <span className="text-danger">*</span></label>
                                        <Controller
                                            name="when_to_post" // Ensure this name matches your form structure
                                            control={control} // Pass control here
                                            render={({ field }) => (
                                                <>
                                                    <DatePicker
                                                        selected={field.value ? new Date(field.value) : new Date()} // Default to today's date if field.value is empty
                                                        onChange={(date) => handleDateChange(date, field)}
                                                        showTimeSelect
                                                        timeFormat="hh:mm aa" // AM/PM format
                                                        timeIntervals={15}
                                                        dateFormat="dd-MM-yyyy hh:mm aa" // Include AM/PM in date format
                                                        placeholderText="DD-MM-YYYY HH:MM"
                                                        className={`px-3 form-control ${watch('when_to_post') && field.error ? 'is-invalid' : ''}`}
                                                        minDate={new Date()} // Ensure the minimum date is today
                                                        todayButton="Today" // Button to quickly select today's date
                                                    />
                                                    {field.error && <div className="invalid-feedback">{field.error.message}</div>}

                                                </>
                                            )}
                                        />
                                        {errors.when_to_post?.type === 'manual' && (
                                            <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                {errors.when_to_post.message}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {watch("action") === "4" && (
                                <div className="col-md-3">
                                    <div className="form-group">
                                        <label className="form-label">Sub User <span className="text-danger">*</span></label>
                                        <select
                                            className="form-select"
                                            name="sub_user"
                                            {...register("sub_user", {
                                                required: "Sub user is required when sending for approval",
                                            })}
                                        >
                                            <option value="" hidden>Select Sub User</option>
                                            {subUser.map((user) => (
                                                <option key={user.id} value={user.id}>
                                                    {user.user_email}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.sub_user && (
                                            <div
                                                style={{
                                                    color: "red",
                                                    fontSize: "14px",
                                                    marginTop: "5px",
                                                }}
                                            >
                                                {errors.sub_user.message}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div className="col-md-3">
                                <button type="submit" className="btn btn-primary mt-5 px-3">Save</button>
                            </div>
                        </div>
                    </Modal.Footer>
                </form >
            </Modal >
            <ShowComposeModal
                show={showMediaModal}
                onHide={handleMediaModalClose}
                onMediaSelect={handleAddToCompose}
                source="compose"
                type={state.selectedPostType}
            />
            {/* Render Playlist Modal */}
            {isModalOpen &&
                <PlaylistModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    // playlists={playlists}
                    onPlaylistsSelected={handlePlaylistsSelected}
                />
            }
            {
                isOpenModal && <PintrestModal isOpen={isOpenModal}
                    onClose={handleModalClose}
                    // playlists={playlists}
                    onPlaylistsSelected={handleBoardSelected} />
            }
            {createModalOpen && <CreatePintrestBoard createModalOpen={createModalOpen} closeBoardModal={closeBoardModal} />}

        </>
    )
}