//New File
import React, { useState, useRef, useEffect, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { ListViewDataCalender } from "../../utils/ApiClient";
import { channelImages, whereToPost, eventColors } from "../../utils/Constants";
import MultiSelectStatic from "../../common/components/selects/MultiSelectStatic";
import { truncateName, formattedDateTime, formatCount } from "../../utils/CommonFunctions";
import './CalenderView.css';
import ImageLazyLoading from "../../common/components/ImageLazyLoading";
import listPlugin from "@fullcalendar/list";
import { Modal } from 'react-bootstrap';
import Compose from "../Compose/Compose";
import Loader from "../../common/components/Loader";
import { useNavigate } from "react-router-dom"; // Add this import

const NoDataMessage = ({ type }) => {
    const messages = {
        feed: {
            icon: 'feed',
            title: 'No Posts Available',
            description: 'There are no posts available yet. Posts will appear here once they are created.'
        },
        likes: {
            icon: 'thumb_up_off',
            title: 'No Likes Yet',
            description: 'This post has not received any likes yet.'
        },
        comments: {
            icon: 'comment',
            title: 'No Comments Yet',
            description: 'There are no comments on this post yet.'
        },
        shares: {
            icon: 'share',
            title: 'No Share Data',
            description: 'No sharing data is available for this post.'
        },
        noData: {
            icon: 'info',
            title: 'No Data Found',
            description: 'No records found matching your search criteria.'
        }
    };

    const { icon, title, description } = messages[type] || messages.noData;

    const noDataStyles = {
        wrapper: {
            textAlign: 'center',
            padding: '2rem',
            backgroundColor: '#fff',
            borderRadius: '8px',
            margin: '1rem 0'
        },
        icon: {
            fontSize: '48px',
            color: '#6c757d',
            marginBottom: '1rem',
            opacity: '0.7'
        },
        title: {
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#343a40',
            marginBottom: '0.5rem'
        },
        description: {
            color: '#6c757d',
            fontSize: '0.875rem'
        }
    };

    return (
        <div className="col-12">
            <div style={noDataStyles.wrapper}>
                <div className="no-data-wrapper">
                    <span
                        className="material-symbols-outlined"
                        style={noDataStyles.icon}
                    >
                        {icon}
                    </span>
                    <h5 style={noDataStyles.title}>{title}</h5>
                    <p style={noDataStyles.description}>{description}</p>
                </div>
            </div>
        </div>
    );
};


// Update VideoPlayer component
const VideoPlayer = ({ src, poster, autoPlay = true }) => {
    const [isLoading, setIsLoading] = useState(true);
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.load();
            if (autoPlay) {
                const playVideo = async () => {
                    try {
                        await videoRef.current.play();
                    } catch (err) {
                        console.log("Autoplay prevented:", err);
                    }
                };
                playVideo();
            }
        }
    }, [src, autoPlay]);

    return (
        <div className="video-wrapper">
            {/* {isLoading && (
                <div className="video-loading-overlay">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )} */}
            <video
                ref={videoRef}
                className="w-100 h-100"
                poster={poster}
                preload="auto"
                playsInline
                controls
                onLoadedData={() => setIsLoading(false)}
                style={{ objectFit: 'contain', maxHeight: '100%', background: 'transparent' }}
            >
                <source src={src} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>
    );
};

// Update modalStyles with FeedView's exact styling
const modalStyles = `
  .modal-90w {
    width: 90%;
    max-width: 1200px !important;
  }

  .modal-dialog-centered {
    display: flex;
    align-items: center;
    min-height: calc(100vh - 60px);
    margin: 30px auto !important;
  }

  .modal-content {
    background-color: #fff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  }

  .modal-header {
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
  }

  .modal-body {
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
  }

  .modal-media-container {
    position: relative;
    width: 100%;
    height: calc(80vh - 200px);
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent !important;
    overflow: hidden; /* Changed from 'auto' to 'hidden' */
    border-radius: 8px;
    margin: 10px;
  }

  .modal-media-content {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    transition: transform 0.3s ease;
    border-radius: 8px;
    margin: auto;
    display: block;
  }

  /* Add these new styles */
  .media-scroll-container {
    max-height: 80vh;
    overflow-y: auto;
  }

  .media-content-wrapper {
    height: calc(80vh - 200px);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background-color: transparent;
  }

  .video-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent !important;
    border-radius: 8px;
    overflow: hidden;
  }

  .video-wrapper video {
    max-width: 100%;
    max-height: 100%;
    background: transparent !important;
    border-radius: 8px;
  }

  .card-body {
    border-radius: 8px;
  }

  .nav-tabs {
    border-radius: 8px 8px 0 0;
  }

  .tab-content {
    border-radius: 0 0 8px 8px;
  }

  .platform-icon-small img {
    border-radius: 50%;
  }

  .tab-pane {
    border-radius: 8px;
    margin: 5px;
    padding: 5px;
  }

  .no-data-wrapper {
    border-radius: 8px;
    padding: 15px;
  }

  .user-post-data {
    border-radius: 8px;
    padding: 5px;
  }
`;

// Add new platform icon animations
const platformIconAnimations = `
  .platform-icon-small {
    transition: all 0.3s ease;
    transform-origin: center;
  }

  .platform-icon-small:hover {
    transform: scale(1.1);
  }

  .platform-icon-small.active {
    animation: pulse 2s infinite;
  }

  .platform-icon-small.active img {
    border-color: #1da1f2;
    box-shadow: 0 0 10px rgba(29,161,242,0.3);
  }

  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(29,161,242,0.4); }
    70% { box-shadow: 0 0 0 10px rgba(29,161,242,0); }
    100% { box-shadow: 0 0 0 0 rgba(29,161,242,0); }
  }

  .platform-icons-container > * {
    animation: iconEntrance 0.3s ease forwards;
  }

  @keyframes iconEntrance {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .platform-icons-container > *:nth-child(1) { animation-delay: 0s; }
  .platform-icons-container > *:nth-child(2) { animation-delay: 0.1s; }
  .platform-icons-container > *:nth-child(3) { animation-delay: 0.2s; }
  .platform-icons-container > *:nth-child(4) { animation-delay: 0.3s; }
`;

export default function CompleteCalendar() {
    const calendarComponentRef = useRef(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedChannels, setSelectedChannels] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [showComposeModal, setShowComposeModal] = useState(false);

    const [ComposeDate, setComposeDate] = useState(null);
    const [selectedStartDate, setSelectedStartDate] = useState(null);
    const [selectedEndDate, setSelectedEndDate] = useState(null);
    const [selectedMonthWise, setSelectedMonthWise] = useState(true);
    const [isExpandedInModal, setIsExpandedInModal] = useState(false);
    const [activePlatform, setActivePlatform] = useState(null);
    const [selectedImage, setSelectedImage] = useState("");
    const [selectedPost, setSelectedPost] = useState("");
    const [activeTab, setActiveTab] = useState("likes");
    const [modalOpen, setModalOpen] = useState(false);
    const [calendarKey, setCalendarKey] = useState(0);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate(); // Add this line

    const handleDatesRender = useCallback((info) => {
        const newYear = info.view.currentStart.getFullYear();
        const newMonth = info.view.currentStart.getMonth(); // getMonth() returns a zero-indexed month
        console.log("New Month (zero-indexed):", newMonth);
        console.log("New Year:", newYear);

        setSelectedYear(newYear);
        setSelectedMonth(newMonth + 1); // Adjust for display if necessary

        if (info.view.type === 'dayGridWeek') {
            const endDate = info.view.currentEnd;
            const startDate = new Date(endDate);
            startDate.setDate(endDate.getDate() - 6);
            setSelectedStartDate(startDate);
            setSelectedEndDate(endDate);
            setSelectedMonthWise(false);
        } else {
            setSelectedStartDate(null);
            setSelectedEndDate(null);
            setSelectedMonthWise(true);
        }
    }, []);


    const handleSelectedDates = useCallback((info) => {
        const { startStr, endStr } = info;
        setShowComposeModal(true);
    }, []);

    const fetchViewList = useCallback(async (status = "", channel_id = []) => {
        setIsLoading(true);
        try {
            const formattedChannelId = Array.isArray(channel_id) ? channel_id : [channel_id];
            const params = {
                month_wise: selectedMonthWise,
                year: selectedYear,
                month: selectedMonth,
                status: status.toString(),
                channel_id: formattedChannelId,
                keyword: searchKeyword,
                ...(selectedStartDate && selectedEndDate && !selectedMonthWise ? {
                    start_date: selectedStartDate.toISOString().split('T')[0],
                    end_date: selectedEndDate.toISOString().split('T')[0]
                } : {}),
            };

            const response = await ListViewDataCalender(params);
            const response_data = response?.data;

            if (response_data?.error_code === 200) {
                const { results } = response_data;

                if (Array.isArray(results)) {
                    const updatedEvents = results.map((event, index) => {
                        const backgroundColor = eventColors[index % eventColors.length];
                        return {
                            id: event.id,
                            title: event.title,
                            start: new Date(status === "3" ? event.when_to_post : event.when_to_post || event.created_at),
                            extendedProps: {
                                description: event.description,
                                created_at: event.created_at,
                                when_to_post: event.when_to_post,
                                channel_id: event.channel_id,
                                image_urls: Array.isArray(event.image_urls) ? event.image_urls : [event.image_urls],
                                video_urls: Array.isArray(event.video_urls) ? event.video_urls : [event.video_urls],
                            },
                            backgroundColor: backgroundColor,
                        };
                    });

                    setEvents(updatedEvents);
                } else {
                    setEvents([]); // Set empty array if no results
                }
            } else {
                setEvents([]); // Set empty array on error
            }
        } catch (error) {
            console.error(
                "Error fetching view list:",
                error?.response?.data?.message || error.message || "Something went wrong!"
            );
            setEvents([]); // Set empty array on error
        } finally {
            setIsLoading(false);
        }
    }, [selectedYear, selectedMonth, selectedStartDate, selectedEndDate, selectedMonthWise, searchKeyword]);


    console.log("events", events);

    useEffect(() => {
        fetchViewList(selectedStatus, selectedChannels);
    }, [currentPage, selectedStatus, selectedChannels, selectedYear, selectedMonth, selectedStartDate, selectedEndDate, selectedMonthWise, fetchViewList]);

    useEffect(() => {
        console.log("Selected Month:", selectedMonth);
        console.log("Selected Year:", selectedYear);
    }, [selectedMonth, selectedYear]);




    const handleEventClick = useCallback((info) => {
        const { title, extendedProps } = info.event;
        const { description, created_at, image_urls, channel_id } = extendedProps;

        // Match FeedView's data structure
        const selectedItemData = {
            title,
            description,
            created_at,
            image_urls,
            channel_id,
            // Add these fields to match FeedView
            username: 'Anonymous', // Or get from your data
            post_type: image_urls[0]?.endsWith('.mp4') ? 'video' : 'post',
            like_count: 0, // Get from your data if available
            comments_count: 0, // Get from your data if available
            share_count: 0, // Get from your data if available
            platform_data: channel_id.reduce((acc, id) => {
                acc[id] = {
                    likes: 0, // Get platform specific data if available
                    comments: 0,
                    shares: 0,
                    media_url: image_urls[0],
                };
                return acc;
            }, {}),
        };

        setSelectedEvent(selectedItemData);
        setSelectedImage(image_urls[0]);
        setSelectedPost(selectedItemData);
        setActivePlatform(channel_id[0]);
        setModalOpen(true);
    }, []);

    const handleSelectedChannels = useCallback((selected) => {
        const channel_id = selected.map((item) => item.value);
        setSelectedChannels(channel_id);
        setCurrentPage(1);
        // fetchViewList(selectedStatus, channel_id, selectedPlatform);
    }, [selectedStatus, fetchViewList]);

    const handleStatusChange = useCallback((e) => {
        const status = e.target.value;
        setSelectedStatus(status);
        setCurrentPage(1);
        // fetchViewList(status, selectedChannels, selectedPlatform);
    }, [selectedChannels, fetchViewList]);


    // const start_date = new Date(selectedEndDate);
    // start_date.setDate(start_date.getDate() - 6);

    const handleModalPlatformClick = (channelId) => {
        setActivePlatform(channelId);

        if (selectedEvent) {
            const platformData = selectedEvent.platform_data?.[channelId];

            if (platformData) {
                setSelectedImage(platformData.media_url || selectedEvent.image_urls[0]);
                setSelectedPost({
                    ...selectedEvent,
                    like_count: platformData.likes || 0,
                    comments_count: platformData.comments || 0,
                    share_count: platformData.shares || 0,
                });
            } else {
                setSelectedImage(selectedEvent.image_urls[0]);
                setSelectedPost(selectedEvent);
            }
        }
    };

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const safeFormatCount = (count) => {
        return count !== undefined && count !== null ? formatCount(count) : '0';
    };

    const platformIconStyles = `
    .platform-icon-small {
      cursor: pointer;
      padding: 2px;
      border-radius: 50%;
      transition: all 0.3s ease;
    }

    .platform-icon-small img {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 2px solid transparent;
    }

    .platform-icon-small.active {
      background-color: rgba(29, 161, 242, 0.1);
    }

    .platform-icon-small.active img {
      border-color: #1da1f2;
    }

    .platform-icons-container {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 15px;
    }

    .video-container {
      position: relative;
      width: 82px;
      height: 50px;
      background-color: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      overflow: hidden;
    }

    .video-container video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }`;

    // Update useEffect for styles
    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = modalStyles + platformIconStyles + platformIconAnimations;
        document.head.appendChild(styleSheet);

        return () => {
            document.head.removeChild(styleSheet);
        };
    }, []);


    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedEvent(null);
        setSelectedImage('');
        setSelectedPost('');
        setIsExpandedInModal(false);
    };

    const handleButtonClick = (date) => {
        // const formattedDate = date.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
        const formattedDate = date; // Format date as YYYY-MM-DD
        const composeData = {
            action: '3',
            when_to_post: formattedDate,
        }

        setComposeDate(composeData); // Set the clicked date in state
        setShowComposeModal(true); // Open the modal

    };
    console.log("ComposeDate", ComposeDate, showComposeModal);

    const handleComposeClose = () => {
        setShowComposeModal(false); // Close the modal
        setComposeDate(null);
    };

    const handleListSearch = (e) => {
        const keyword = e.target.value;
        setSearchKeyword(keyword);
        // Debounce the search to avoid too many API calls
        const timeoutId = setTimeout(() => {
            fetchViewList(selectedStatus, selectedChannels);
        }, 500);
        return () => clearTimeout(timeoutId);
    };

    return (
        <div id="content-page" className="content-page">
            <div className="container">

                <div className="card">
                    {/* Back to Dashboard Button */}
                    <div className="mb-3">
                        <button
                            className="btn btn-outline-primary float-end"
                            onClick={() => navigate('/dashboard')}
                        >
                            &larr; Back to Dashboard
                        </button>
                    </div>
                    <div className="card-header" style={{ backgroundColor: '#fff' }}>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <div className="iq-search-bar device-search position-relative">
                                    <form className="searchbox" onSubmit={(e) => e.preventDefault()}>
                                        <input
                                            type="text"
                                            className="text search-input form-control bg-soft-primary"
                                            placeholder="Search here..."
                                            value={searchKeyword}
                                            onChange={handleListSearch}
                                        />
                                        <span className="material-symbols-outlined search-link">
                                            search
                                        </span>
                                    </form>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <MultiSelectStatic
                                    options={whereToPost}
                                    onSelect={handleSelectedChannels}
                                    placeholder="Select Platforms"
                                />
                            </div>
                            <div className="col-md-3">
                                <select
                                    className="form-select"
                                    value={selectedStatus}
                                    onChange={handleStatusChange}
                                >
                                    <option value="" disabled hidden>Select Status</option>
                                    <option value="1">Published</option>
                                    <option value="2">Save to Draft</option>
                                    <option value="3">Schedule</option>
                                    <option value="4">Send for approval</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="card-body">
                        {isLoading ? (
                            <Loader />
                        ) : (
                            <FullCalendar
                                key={calendarKey}
                                schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
                                ref={calendarComponentRef}
                                initialView="dayGridMonth"
                                initialDate={new Date(selectedYear, selectedMonth - 1, 1)} // Use selectedMonth - 1 because months are zero-indexed
                                headerToolbar={{
                                    left: 'prev,next',
                                    center: 'title',
                                    right: 'dayGridMonth,dayGridWeek'
                                }}
                                selectable={true}
                                plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin]}
                                events={events}
                                select={handleSelectedDates}
                                eventClick={handleEventClick}
                                eventLimit={3}
                                datesSet={handleDatesRender}
                                dayCellDidMount={(info) => {
                                    const { date, el } = info;
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);

                                    if (date >= today) {
                                        const button = document.createElement('button');
                                        button.innerText = 'Compose';
                                        button.style.display = 'none';
                                        button.style.position = 'absolute';
                                        button.style.top = '10px';
                                        button.style.left = '0px';
                                        button.style.zIndex = '10';
                                        button.style.class = 'btn btn-outline-primary';
                                        button.style.backgroundColor = 'white';
                                        button.style.color = '#0D47A1';
                                        button.style.border = '2px dotted #0D47A1';
                                        button.style.borderRadius = '5px';
                                        button.style.cursor = 'pointer';
                                        button.style.fontSize = '14px';
                                        button.style.fontWeight = 'bold';
                                        button.style.outline = 'none';
                                        button.style.width = '100%';

                                        button.addEventListener('click', () => handleButtonClick(date));

                                        el.style.position = 'relative';
                                        el.appendChild(button);

                                        el.addEventListener('mouseenter', () => {
                                            button.style.display = 'block';
                                        });
                                        el.addEventListener('mouseleave', () => {
                                            button.style.display = 'none';
                                        });
                                    } else {
                                        el.style.opacity = '0.85';
                                    }
                                }}
                                eventContent={(arg) => {
                                    const { channel_id, description, created_at, when_to_post } = arg.event.extendedProps;
                                    const eventDate = selectedStatus === "3" ? when_to_post : created_at;
                                    const time = eventDate ? new Date(eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                                    const backgroundColor = arg.event.backgroundColor;

                                    return (
                                        <div className="post-tile--container" style={{ backgroundColor }}>
                                            <div className="d-flex align-items-center justify-content-between" style={{ padding: '5px' }}>
                                                <div className="d-flex align-items-center" style={{ overflow: 'hidden' }}>
                                                    {channel_id && channel_id.length > 0 ? (
                                                        channel_id.map((id, index) => (
                                                            channelImages[id] ? (
                                                                <img
                                                                    key={index}
                                                                    src={`/assets/images/icon/${channelImages[id]}`}
                                                                    alt={`Channel Icon for ${id}`}
                                                                    width="20"
                                                                    height="20"
                                                                    style={{ marginRight: '5px', backgroundColor }}
                                                                />
                                                            ) : null
                                                        ))
                                                    ) : (
                                                        <span>No icon</span>
                                                    )}
                                                    <span style={{ marginLeft: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                                                        {truncateName(description, 20)}
                                                    </span>
                                                </div>
                                                <div style={{ marginLeft: 'auto', fontSize: '12px', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                                                    {time}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }}
                            />
                        )}
                        {!isLoading && events.length === 0 && <NoDataMessage type="noData" />}
                    </div>


                    <Modal
                        show={modalOpen}
                        onHide={handleCloseModal}
                        size="xl"
                        centered
                        backdrop="static"
                        keyboard={false}
                        dialogClassName="modal-80w"
                        contentClassName="h-80vh"
                        style={{ display: modalOpen ? 'block' : 'none' }}
                    >
                        <Modal.Header className="py-2">
                            <Modal.Title className="fs-5">View Post</Modal.Title>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={handleCloseModal}
                                aria-label="Close"
                            ></button>
                        </Modal.Header>
                        <Modal.Body className="p-0">
                            <div className="row g-0">
                                {/* Left side with unified scroll */}
                                <div className="col-md-12 col-lg-7" style={{ maxHeight: '80vh', overflow: 'auto' }}>
                                    <div className="media-scroll-container">
                                        {/* User info */}
                                        <div className="p-3">
                                            <div className="user-post-data">
                                                <div className="d-flex align-items-center">
                                                    <div className="me-3">
                                                        {selectedEvent && (
                                                            <img
                                                                className="border border-2 rounded-circle user-post-profile"
                                                                src={`assets/images/icon/${channelImages[activePlatform] || channelImages[selectedEvent?.channel_id?.[0]] || 'default.png'}`}
                                                                alt="user-image"
                                                                style={{ width: '40px', height: '40px' }}
                                                            />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h6 className="mb-0">{selectedEvent?.username || 'Anonymous'}</h6>
                                                        <small>
                                                            {selectedEvent?.action === 3
                                                                ? formattedDateTime(selectedEvent?.when_to_post)
                                                                : formattedDateTime(selectedEvent?.created_at)}
                                                        </small>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div className="px-3 mb-3">
                                            <p className="mb-2">
                                                {selectedEvent && (
                                                    <>
                                                        {isExpandedInModal
                                                            ? selectedEvent.description
                                                            : truncateName(selectedEvent.description, 150)}
                                                        {selectedEvent.description?.length > 150 && (
                                                            <button
                                                                onClick={() => setIsExpandedInModal(!isExpandedInModal)}
                                                                className="btn btn-link p-0 ms-1"
                                                                style={{ textDecoration: 'none', color: '#007bff' }}
                                                            >
                                                                {isExpandedInModal ? 'Show Less' : 'Show More'}
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </p>
                                        </div>

                                        {/* Media container */}
                                        <div className="media-content-wrapper">
                                            {selectedEvent?.image_urls?.[0]?.endsWith('.mp4') ? (
                                                <div style={{ width: '100%', height: '100%', background: 'transparent' }}>
                                                    <VideoPlayer
                                                        src={selectedImage}
                                                        poster={selectedEvent?.thumbnail_url}
                                                        autoPlay={true}
                                                    />
                                                </div>
                                            ) : (
                                                <ImageLazyLoading
                                                    src={selectedImage}
                                                    alt="post-image"
                                                    className="modal-media-content"
                                                    style={{
                                                        maxWidth: '100%',
                                                        maxHeight: '100%',
                                                        objectFit: 'contain',
                                                        display: 'block',
                                                        margin: 'auto',
                                                        padding: '20px',
                                                    }}
                                                    onError={(e) => {
                                                        e.target.src = 'assets/images/default-post.png';
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right side - Engagement stats */}
                                <div className="col-md-12 col-lg-5 border-start">
                                    <div className="fixed-suggestion">
                                        <div className="card mb-0 card-feed">
                                            <div className="card-body pt-0">
                                                {/* Platform Icons Section */}
                                                {selectedEvent?.channel_id?.length > 1 && (
                                                    <div className="d-flex justify-content-center gap-3 mb-3 p-2 border-bottom">
                                                        {selectedEvent.channel_id.map((channelId) => (
                                                            <div
                                                                key={channelId}
                                                                className={`platform-icon-small ${activePlatform === channelId ? 'active' : ''}`}
                                                                onClick={() => handleModalPlatformClick(channelId)}
                                                            >
                                                                <img
                                                                    src={`assets/images/icon/${channelImages[channelId]}`}
                                                                    alt={`Platform ${channelId}`}
                                                                    title={`Switch to ${whereToPost.find(p => p.value === channelId)?.label || 'platform'}`}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Tabs Section */}
                                                <div className="tab-bottom-bordered">
                                                    <ul className="mb-0 nav nav-tabs rounded-top border-0 d-flex align-items-center justify-content-center profile-feed-items p-0 m-0">
                                                        <li className="nav-item col-6 p-0" role="presentation">
                                                            <button
                                                                className={`nav-link w-100 ${activeTab === "likes" ? "active" : ""}`}
                                                                onClick={() => handleTabClick("likes")}
                                                            >
                                                                <div className="d-flex align-items-center justify-content-center">
                                                                    <span className="material-symbols-outlined me-2">thumb_up</span>
                                                                    {safeFormatCount(selectedPost?.like_count)}
                                                                </div>
                                                            </button>
                                                        </li>
                                                        <li className="nav-item col-6 p-0" role="presentation">
                                                            <button
                                                                className={`nav-link w-100 ${activeTab === "comments" ? "active" : ""}`}
                                                                onClick={() => handleTabClick("comments")}
                                                            >
                                                                <div className="d-flex align-items-center justify-content-center">
                                                                    <span className="material-symbols-outlined me-2">comment</span>
                                                                    {safeFormatCount(selectedPost?.comments_count)}
                                                                </div>
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>

                                                {/* Tab Content */}
                                                <div className="tab-content">
                                                    {/* Likes Tab */}
                                                    <div className={`tab-pane fade ${activeTab === "likes" ? "show active" : ""}`}>
                                                        {selectedPost?.like_count > 0 ? (
                                                            <div className="d-flex align-items-center p-3">
                                                                <div className="d-flex align-items-center">
                                                                    <span className="material-symbols-outlined text-primary me-2">thumb_up</span>
                                                                    <span>{safeFormatCount(selectedPost.like_count)} likes</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <NoDataMessage type="likes" />
                                                        )}
                                                    </div>

                                                    {/* Comments Tab */}
                                                    <div className={`tab-pane fade ${activeTab === "comments" ? "show active" : ""}`}>
                                                        {selectedPost?.comments_count > 0 ? (
                                                            <div className="d-flex align-items-center p-3">
                                                                <div className="d-flex align-items-center">
                                                                    <span className="material-symbols-outlined text-primary me-2">comment</span>
                                                                    <span>{safeFormatCount(selectedPost.comments_count)} comments</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <NoDataMessage type="comments" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Modal.Body>
                    </Modal>

                </div>
                {/* Conditionally render Compose component */}
                {ComposeDate && showComposeModal && (<Compose calendar={ComposeDate} showComposeModal={showComposeModal} // Pass modal visibility state
                    handleComposeClose={handleComposeClose} // Pass close handler
                />)}
            </div>
        </div>
    );
}