import React, { useState, useEffect, useRef } from 'react';
import { ListViewData } from "../../utils/ApiClient";
import MultiSelectStatic from "../../common/components/selects/MultiSelectStatic";
import { whereToPost, status, channelImages } from "../../utils/Constants";
import { truncateName, formatCount, formattedDateTime } from "../../utils/CommonFunctions";
import Loader from "../../common/components/Loader";
import ImageLazyLoading from "../../common/components/ImageLazyLoading";
import InfiniteScrollWrapper from "../../common/components/InfinityScrollWrapper";
import { Modal } from 'react-bootstrap';
import { useNavigate } from "react-router-dom"; // Add this import

// Add NoDataMessage component at the top of the file after imports
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
    }
  };

  const { icon, title, description } = messages[type];

  return (
    <div className="col-12">
      <div className="text-center p-5">
        <div className="no-data-wrapper">
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#6c757d' }}>
            {icon}
          </span>
          <h5 className="mt-3">{title}</h5>
          <p className="text-muted">{description}</p>
        </div>
      </div>
    </div>
  );
};

// Add helper function for status text
const getStatusText = (statusCode) => {
  if (!status || !status[statusCode]) {
    return 'Unknown Status';
  }
  return status[statusCode];
};

// Modify truncateText function to be simpler
const truncateText = (text, isModal = false) => {
  if (!text) return '';

  // Strip any HTML tags
  const strippedText = text.replace(/<[^>]*>/g, '');

  // If it's in modal, return full text
  if (isModal) return strippedText;

  // For card view, always truncate to 5 words
  const words = strippedText.split(' ');
  return words.slice(0, 5).join(' ') + (words.length > 5 ? '...' : '');
};

// Add this constant at the top of your file
const PLATFORMS = {
  FACEBOOK: '1',
  INSTAGRAM: '2',
  TWITTER: '3',
  TWITTER: '3',
  LINKEDIN: '4'
};

// Add this constant at the top of the file after other imports
const ASPECT_RATIOS = {
  SQUARE: '1:1',
  STANDARD: '4:3',
  WIDESCREEN: '16:9',
  VERTICAL: '9:16',
  ULTRAWIDE: '21:9',
  CLASSIC: '3:2',
  MEDIUM: '5:4'
};

// Add this helper function
const getMediaDimensions = (aspectRatio) => {
  const [width, height] = aspectRatio.split(':').map(Number);
  const ratio = height / width;

  // Base width on viewport size
  const maxWidth = Math.min(window.innerWidth * 0.7, 1200); // 70% of viewport width up to 1200px
  const maxHeight = window.innerHeight * 0.8; // 80% of viewport height

  let finalWidth = maxWidth;
  let finalHeight = maxWidth * ratio;

  // If height exceeds max height, scale down
  if (finalHeight > maxHeight) {
    finalHeight = maxHeight;
    finalWidth = maxHeight / ratio;
  }

  return {
    width: Math.round(finalWidth),
    height: Math.round(finalHeight)
  };
};

// Combine all platform icon styles into one declaration
const platformIconStyles = `
  .platform-icon-small {
    cursor: pointer;
    padding: 2px;
    border-radius: 50%;
  }

  .platform-icon-small img {
    width: 24px;
    height: 24px;
    border-radius: 50%;
  }

  .platform-icon-small.active {
    border: 1px solid #1da1f2;
  }

  .platform-icon-wrapper {
    position: relative;
    width: 40px;
    height: 40px;
  }

  .platform-icon-static {
    position: absolute;
    top: 0;
    left: 0;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid #fff;
    animation: rotateIcons 4s infinite;
    opacity: 0;
  }

  @keyframes rotateIcons {
    0%, 100% { opacity: 0; }
    25%, 75% { opacity: 1; }
  }

  .engagement-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 0.5rem;
    border-bottom: 1px solid rgba(0,0,0,0.1);
  }

  .engagement-item {
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 4px;
  }

  .engagement-item.active {
    background: rgba(29, 161, 242, 0.1);
  }

  .modal-media-container {
    position: relative;
    width: 100%;
    height: calc(100vh - 300px);
    min-height: 400px;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .modal-media-content {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  /* Platform Icon Animations */
  .platform-icon-small {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    position: relative;
    z-index: 1;
  }

  .platform-icon-small:hover {
    transform: scale(1.1);
  }

  .platform-icon-small::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle, rgba(29,161,242,0.1) 0%, rgba(29,161,242,0) 70%);
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: -1;
  }

  .platform-icon-small:hover::after {
    opacity: 1;
  }

  .platform-icon-small.active {
    transform: scale(1.15);
    box-shadow: 0 0 15px rgba(29,161,242,0.3);
  }

  .platform-icon-small.active img {
    border: 2px solid #1da1f2;
  }

  .platform-icon-small:not(.active) {
    opacity: 0.7;
    filter: grayscale(40%);
  }

  .platform-icons-container {
    display: flex;
    gap: 1rem;
    padding: 0.5rem;
  }

  .platform-icon-wrapper {
    transition: transform 0.3s ease;
  }

  .platform-icon-wrapper:hover {
    transform: translateY(-2px);
  }

  /* Pulse animation for active icon */
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(29,161,242,0.4);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(29,161,242,0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(29,161,242,0);
    }
  }

  .platform-icon-small.active {
    animation: pulse 2s infinite;
  }

  /* Smooth transition between icons */
  .platform-icon-small img {
    transition: all 0.3s ease;
  }

  /* Hover effect for platform icons */
  .platform-icon-wrapper img {
    transition: all 0.3s ease;
  }

  .platform-icon-wrapper:hover img {
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }

  /* Active state for platform icons */
  .platform-icon-wrapper.active img {
    border: 2px solid #1da1f2;
    transform: scale(1.1);
    box-shadow: 0 0 15px rgba(29,161,242,0.3);
  }

  /* Entrance animation for icons */
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

  .platform-icon-small {
    animation: iconEntrance 0.3s ease forwards;
  }

  /* Staggered entrance for multiple icons */
  .platform-icons-container > * {
    animation: iconEntrance 0.3s ease forwards;
  }

  .platform-icons-container > *:nth-child(1) { animation-delay: 0s; }
  .platform-icons-container > *:nth-child(2) { animation-delay: 0.1s; }
  .platform-icons-container > *:nth-child(3) { animation-delay: 0.2s; }
  .platform-icons-container > *:nth-child(4) { animation-delay: 0.3s; }

  /* Z-index fixes */
  .select__menu {
    z-index: 99999 !important; /* Increased z-index */
    position: relative;
  }

  .select__menu-portal {
    z-index: 99999 !important; /* Increased z-index */
  }

  .select__dropdown-indicator {
    z-index: 2;
  }

  .select__control {
    z-index: 2;
    position: relative;
  }

  /* Ensure dropdown stays above other elements */
  .select__menu-list {
    position: relative;
    z-index: 99999 !important; /* Increased z-index */
  }

  /* Fix for MultiSelect container */
  .select__container {
    position: relative;
    z-index: 9999 !important; /* Higher than regular content */
  }

  /* Ensure value container is above other elements */
  .select__value-container {
    z-index: 3;
    position: relative;
  }

  /* Modal z-index adjustments */
  .modal {
    z-index: 1050 !important;
  }

  .modal-backdrop {
    z-index: 1040 !important;
  }

  /* Platform icons z-index fixes */
  .platform-icon-small {
    z-index: 4;
    position: relative;
  }

  .platform-icons-container {
    position: relative;
    z-index: 3;
  }

  /* Card adjustments */
  .card {
    position: relative;
    z-index: 1;
  }

  /* Ensure the MultiSelect component stays on top */
  .col-md-3 .select__container {
    position: relative;
    z-index: 9999 !important;
  }

  /* Additional fixes for dropdown positioning */
  .select__menu-portal {
    position: absolute !important;
    top: 100% !important;
    left: 0 !important;
    width: 100% !important;
  }

  /* Ensure dropdown options are clickable */
  .select__option {
    position: relative;
    z-index: 99999 !important;
  }
`;

// Add these new style declarations after existing styles
const modalStyles = `
  .modal {
    display: none;
  }

  .modal.show {
    display: block;
  }

  .modal-backdrop {
    background-color: rgba(0, 0, 0, 0.5);
  }

  .modal-dialog-centered {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    margin: 0 auto !important;
    padding: 1rem;
  }

  .video-loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1;
  }

  .video-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .lazy-video {
    opacity: 0;
    transition: opacity 0.3s;
  }

  .lazy-video.loaded {
    opacity: 1;
  }

  .modal-media-content {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 12px; /* Added border radius for images */
  }

  .video-wrapper video {
    border-radius: 12px; /* Added border radius for videos */
  }

  .modal-media-container {
    padding: 8px; /* Added padding to prevent border-radius from being cut off */
    background-color: transparent !important;
  }
`;

// Add style tag to document (keep only one instance)
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = platformIconStyles;
document.head.appendChild(styleSheet);

// Update the VideoPlayer component
const VideoPlayer = ({ src, poster, autoPlay = true }) => {
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      if (autoPlay) {
        // Try to autoplay when video is loaded
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

  const handleLoadedData = () => {
    setIsLoading(false);
  };

  const handleError = (e) => {
    console.error("Video loading error:", e);
    setIsLoading(false);
  };

  return (
    <div className="video-wrapper" style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      backgroundColor: 'transparent',
      borderRadius: '12px', /* Added border radius to wrapper */
      overflow: 'hidden' /* Ensure child elements respect border radius */
    }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.1)',
          zIndex: 1
        }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      <video
        ref={videoRef}
        className="w-100 h-100"
        poster={poster}
        preload="auto"
        playsInline
        controls
        style={{
          objectFit: 'contain',
          maxHeight: '100%',
          maxWidth: '100%',
          background: 'transparent',
          borderRadius: '12px' /* Added border radius to video element */
        }}
        onLoadedData={handleLoadedData}
        onError={handleError}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

// Add this new component for rotating platform icons
const RotatingPlatformIcons = ({ channelIds }) => {
  return (
    <div className="platform-icon-wrapper">
      {channelIds.map((channelId, index) => (
        <img
          key={channelId}
          className="platform-icon-static border border-2 rounded-circle user-post-profile"
          src={`assets/images/icon/${channelImages[channelId]}`}
          alt="platform-icon"
          style={{
            animationDelay: `${index * (4 / channelIds.length)}s`
          }}
        />
      ))}
    </div>
  );
};

// Add this new component at the top level
const PlatformIconsDisplay = ({ channelIds, activeId, onPlatformClick }) => {
  return (
    <div className="platform-icons-container d-flex align-items-center gap-2">
      {channelIds.map((channelId) => (
        <div
          key={channelId}
          className={`platform-icon-wrapper ${activeId === channelId ? 'active' : ''}`}
          onClick={() => onPlatformClick(channelId)}
          style={{ cursor: 'pointer' }}
        >
          <img
            src={`assets/images/icon/${channelImages[channelId]}`}
            alt={`Platform ${channelId}`}
            className="rounded-circle"
            style={{
              width: '32px',
              height: '32px',
              border: activeId === channelId ? '2px solid #1da1f2' : '2px solid transparent',
              transition: 'all 0.3s ease'
            }}
          />
        </div>
      ))}
    </div>
  );
};

const FeedView = () => {
  // State management
  const [userData, setUserData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedChannels, setSelectedChannels] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedPost, setSelectedPost] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [activeTab, setActiveTab] = useState("likes");
  const [showModal, setShowModal] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const perPageLimit = 9;
  const [initialLoading, setInitialLoading] = useState(true); // Add this new state
  const [isExpandedInModal, setIsExpandedInModal] = useState(false);

  // Remove expandedPosts state since we don't need it anymore
  // const [expandedTexts, setExpandedTexts] = useState({});

  // Modify modal handling
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [activePlatform, setActivePlatform] = useState(null);
  // Add new state for active platform in cards
  const [activeCardPlatforms, setActiveCardPlatforms] = useState({});
  // Add new state for active platforms
  const [activePlatforms, setActivePlatforms] = useState({});

  const navigate = useNavigate(); // Add this line

  // Add this after your existing useEffect hooks
  useEffect(() => {
    // Add modal styles
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = modalStyles;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  // Add this useEffect for additional styles inside the component
  useEffect(() => {
    const additionalStyles = `
      .modal-media-container {
        background-color: transparent !important;
      }

      .video-wrapper video {
        background: transparent !important;
      }

      .modal-content {
        background-color: #fff;
      }

      .lazy-video {
        opacity: 1 !important;
      }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = additionalStyles;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  // API function
  const fetchViewList = async (page, keyword = "", status = "", channel_id, isLoadMore = false) => {
    if (!isLoadMore) {
      setInitialLoading(true);
    } else {
      setIsLoading(true);
    }

    try {
      // Ensure channel_id is always an array and remove any empty values
      const channelIds = Array.isArray(channel_id)
        ? channel_id.filter(id => id)
        : channel_id
          ? [channel_id]
          : [];

      const params = {
        page_number: page,
        page_size: perPageLimit,
        keyword: keyword,
        status: status,
        channel_id: channelIds // Send the cleaned array of channel IDs
      };

      const response = await ListViewData(params);
      const response_data = response.data;

      if (response_data?.error_code === 200) {
        const newPosts = response_data.results.posts;

        // If no channels are selected, show all posts
        // Otherwise, filter posts that match any of the selected channel IDs
        const filteredPosts = channelIds.length === 0
          ? newPosts
          : newPosts.filter(post => {
            // Check if post's channel_id array has any intersection with selected channelIds
            return post.channel_id.some(id => channelIds.includes(id));
          });

        // Filter posts based on selected platform if any
        const finalFilteredPosts = selectedPlatform
          ? filteredPosts.filter(post => post.channel_id.includes(selectedPlatform))
          : filteredPosts;

        setUserData(prev => isLoadMore ? [...prev, ...finalFilteredPosts] : finalFilteredPosts);
        setHasMore(finalFilteredPosts.length >= perPageLimit);
      } else {
        setUserData(prev => isLoadMore ? prev : []);
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error?.response?.data?.message || "Something went wrong!");
      setHasMore(false);
    } finally {
      if (!isLoadMore) {
        setInitialLoading(false);
      }
      setIsLoading(false);
    }
  };

  // Add loadMore function for infinite scroll
  const loadMore = () => {
    if (!isLoading && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchViewList(nextPage, searchKeyword, selectedStatus, selectedChannels, true);
    }
  };

  // Modified search handlers
  const handleListSearch = (e) => {
    const keyword = e.target.value;
    setSearchKeyword(keyword);
    setCurrentPage(1);
    fetchViewList(1, keyword, selectedStatus, selectedChannels);
  };

  const handleSearchClick = () => {
    setShowModal(true);
  };

  const handleStatusChange = (e) => {
    const status = e.target.value;
    setSelectedStatus(status);
    setCurrentPage(1);
    fetchViewList(1, searchKeyword, status, selectedChannels);
  };

  const handleSelectedChannels = (selected) => {
    const channelIds = selected.map(item => item.value);
    setSelectedChannels(channelIds);
    setCurrentPage(1);
    fetchViewList(1, searchKeyword, selectedStatus, channelIds);
  };

  const handlePageClick = (selected) => {
    setCurrentPage(selected.selected + 1);
  };

  const handleImageClick = (item) => {
    setupInitialModalData(item);
    setIsExpandedInModal(false);
    setModalOpen(true);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
    setSelectedImage('');
    setSelectedPost('');
    setIsExpandedInModal(false);
  };

  // Add safe format function
  const safeFormatCount = (count) => {
    return count !== undefined && count !== null ? formatCount(count) : '0';
  };

  // Add platform selection handler
  const handlePlatformClick = (platformId) => {
    setSelectedPlatform(platformId === selectedPlatform ? null : platformId);
    setCurrentPage(1);
    fetchViewList(1, searchKeyword, selectedStatus, selectedChannels);
  };

  // Add this platform selection handler
  const handlePlatformSelection = (platformId) => {
    setSelectedPlatform(prevPlatform => prevPlatform === platformId ? null : platformId);
    // Filter data based on selected platform
    const filteredData = platformId
      ? userData.filter(post => post.channel_id.includes(platformId))
      : userData;
    setUserData(filteredData);
  };

  // Keep this component but use it only in the modal
  const renderPlatformIcons = (channelIds) => {
    return (
      <div className="d-flex gap-3 mb-3">
        {channelIds.map((channelId) => (
          <div
            key={channelId}
            className={`platform-icon ${selectedPlatform === channelId ? 'active' : ''}`}
            onClick={() => handlePlatformSelection(channelId)}
          >
            <img
              src={`assets/images/icon/${channelImages[channelId]}`}
              alt={`Platform ${channelId}`}
              className="rounded-circle avatar-40"
            />
          </div>
        ))}
      </div>
    );
  };

  const handleModalPlatformClick = (channelId) => {
    setActivePlatform(channelId);

    // Find the corresponding post data for this platform
    if (selectedItem) {
      const platformSpecificData = selectedItem.platform_data?.[channelId];

      // Update media content based on platform-specific data
      if (platformSpecificData) {
        setSelectedImage(platformSpecificData.media_url || platformSpecificData.image_url || selectedItem.image_urls);
        setSelectedPost({
          ...selectedItem,
          like_count: platformSpecificData.likes || 0,
          comments_count: platformSpecificData.comments || 0,
          share_count: platformSpecificData.shares || 0,
          // Add any other platform-specific fields you need
        });
      } else {
        // Fallback to default post data if platform-specific data isn't available
        setSelectedImage(selectedItem.image_urls);
        setSelectedPost(selectedItem);
      }
    }
  };

  // Add handler for card platform clicks
  const handleCardPlatformClick = (postId, platformId) => {
    setActiveCardPlatforms(prev => ({
      ...prev,
      [postId]: prev[postId] === platformId ? null : platformId
    }));
  };

  // Add this new function to handle initial modal data setup
  const setupInitialModalData = (item) => {
    setSelectedItem(item);
    setSelectedImage(item.image_urls);
    setSelectedPost(item);

    // Set initial active platform (prefer the first platform in the list)
    const initialPlatform = item.channel_id[0];
    setActivePlatform(initialPlatform);

    // Set up initial platform-specific data if available
    if (item.platform_data?.[initialPlatform]) {
      const platformData = item.platform_data[initialPlatform];
      setSelectedImage(platformData.media_url || platformData.image_url || item.image_urls);
      setSelectedPost({
        ...item,
        like_count: platformData.likes || item.like_count,
        comments_count: platformData.comments || item.comments_count,
        share_count: platformData.shares || item.share_count,
      });
    }
  };

  // Initial load
  useEffect(() => {
    fetchViewList(1, searchKeyword, selectedStatus, selectedChannels);
  }, []);

  // Add this effect to handle platform data updates
  useEffect(() => {
    if (selectedItem && activePlatform) {
      const platformData = selectedItem.platform_data?.[activePlatform];
      if (platformData) {
        setSelectedImage(platformData.media_url || platformData.image_url || selectedItem.image_urls);
      }
    }
  }, [activePlatform, selectedItem]);

  // Keep existing return/UI structure but update with dynamic data
  return (
    <div>

      <div id="content-page" className="content-page">
        <div className="container">
          <div className="row mt-3">
            <div className="d-flex align-items-center justify-content-between flex-wrap mb-4">
              <h4 className="fw-bold text-primary">Grid View</h4>
            </div>
          </div>
          <div className="row">
            {/* Back to Dashboard Button */}
            <div className="mb-3">
              <button
                className="btn btn-outline-primary float-end"
                onClick={() => navigate('/dashboard')}
              >
                &larr; Back to Dashboard
              </button>
            </div>
            <div className="col-sm-12">
              <div className="card">
                <div className="card-header">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="iq-search-bar device-search position-relative">
                        <form className="searchbox">
                          <a
                            className="search-link d-none d-lg-block"
                            onClick={handleSearchClick}
                          >
                            <span className="material-symbols-outlined">
                              search
                            </span>
                          </a>
                          <input
                            type="text"
                            className="text search-input form-control bg-soft-primary"
                            placeholder="Search here..."
                            onChange={handleListSearch}
                          />
                          <a
                            className="d-lg-none d-flex"
                            onClick={handleSearchClick}
                          >
                            <span className="material-symbols-outlined">
                              search
                            </span>
                          </a>
                        </form>
                      </div>
                    </div>

                    <div className="col-md-3" style={{ position: 'relative', zIndex: 9999 }}>
                      <MultiSelectStatic
                        options={whereToPost}
                        onSelect={handleSelectedChannels}
                        placeholder="Select Platforms"
                        styles={{
                          menu: (base) => ({
                            ...base,
                            zIndex: 99999,
                            position: 'absolute'
                          }),
                          control: (base) => ({
                            ...base,
                            zIndex: 2
                          }),
                          container: (base) => ({
                            ...base,
                            zIndex: 9999
                          })
                        }}
                      />
                    </div>
                    <div className="col-md-3">
                      <select
                        className="form-select"
                        value={selectedStatus}
                        onChange={handleStatusChange}
                      >
                        <option value="" disabled hidden>
                          Select Status
                        </option>
                        <option value="1">Published</option>
                        <option value="2">Save to Draft</option>
                        <option value="3">Schedule</option>
                        <option value="4">Send for approval</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  {initialLoading ? (
                    <Loader />
                  ) : (
                    <InfiniteScrollWrapper
                      dataLength={userData.length}
                      next={loadMore}
                      hasMore={hasMore}
                      loader={<Loader />}
                      scrollThreshold={0.8}
                    >
                      {userData?.length === 0 ? (
                        <NoDataMessage type="feed" />
                      ) : (
                        <div className="row mb-5">
                          {userData.map((item, index) => (
                            <div key={index} className="col-sm-4 social-post mb-4">
                              <div className="card card-stretch card-view h-100">
                                {/* Card header */}
                                <div className="card-header">
                                  <div className="user-post-data">
                                    <div className="d-flex align-items-center justify-content-between">
                                      <div className="me-2 flex-shrik-0">
                                        {item.channel_id.length > 1 ? (
                                          <PlatformIconsDisplay
                                            channelIds={item.channel_id}
                                            activeId={activePlatforms[item.id]}
                                            onPlatformClick={(platformId) => {
                                              setActivePlatforms(prev => ({
                                                ...prev,
                                                [item.id]: prev[item.id] === platformId ? null : platformId
                                              }));
                                            }}
                                          />
                                        ) : (
                                          <img
                                            src={`assets/images/icon/${channelImages[item.channel_id[0]]}`}
                                            alt="platform"
                                            className="rounded-circle"
                                            style={{ width: '32px', height: '32px' }}
                                          />
                                        )}
                                      </div>
                                      <div className="w-100">
                                        <div className="d-flex align-items-center justify-content-between">
                                          <div className="lh-sm">
                                            <h6 className="mb-0 d-inline-block">{item?.username || 'Anonymous'}</h6>
                                            <p className="mb-0">
                                              {item?.action === 3
                                                ? formattedDateTime(item?.when_to_post)
                                                : formattedDateTime(item?.created_at)}
                                            </p>
                                          </div>
                                          <div className="card-post-toolbar">
                                            <div className="dropdown">
                                              <span
                                                className="dropdown-toggle material-symbols-outlined"
                                                role="button"
                                                onClick={() => handleImageClick(item)}
                                              >
                                                open_in_new
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Add platform switcher after header */}
                                {/* {item.channel_id.length > 1 && (
                                  <div className="platform-switcher">
                                    {item.channel_id.map(channelId => (
                                      <img
                                        key={channelId}
                                        src={`assets/images/icon/${channelImages[channelId]}`}
                                        alt={`Platform ${channelId}`}
                                        className={`platform-icon-card ${activeCardPlatforms[item.id] === channelId ? 'active' : ''}`}
                                        onClick={() => handleCardPlatformClick(item.id, channelId)}
                                      />
                                    ))}
                                  </div>
                                )} */}

                                {/* Show platform-specific data if a platform is selected */}
                                {activeCardPlatforms[item.id] && (
                                  <div className="platform-data">
                                    <div className="platform-metrics">
                                      <div className="metric-item">
                                        <span className="material-symbols-outlined md-18">thumb_up</span>
                                        <span>{safeFormatCount(item.platform_data?.[activeCardPlatforms[item.id]]?.likes || item.like_count)}</span>
                                      </div>
                                      <div className="metric-item">
                                        <span className="material-symbols-outlined md-18">comment</span>
                                        <span>{safeFormatCount(item.platform_data?.[activeCardPlatforms[item.id]]?.comments || item.comments_count)}</span>
                                      </div>
                                      <div className="metric-item">
                                        <span className="material-symbols-outlined md-18">share</span>
                                        <span>{safeFormatCount(item.platform_data?.[activeCardPlatforms[item.id]]?.shares || item.share_count)}</span>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Card body */}
                                <div className="card-body">
                                  <div className="post-content">
                                    <p className="mb-2">
                                      {truncateText(item.description)}
                                    </p>
                                    {item?.hashtags && (
                                      <ul className="list-inline m-0 p-0 d-flex flex-wrap gap-1">
                                        {item.hashtags.map((tag, idx) => (
                                          <li key={idx}>
                                            <a href="javascript:void(0);">#{tag}</a>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                  <div className="user-post mt-4">
                                    <div className="post-media position-relative">
                                      {item?.post_type === "post" ? (
                                        <div className="post-image-container" style={{ height: '300px', overflow: 'hidden' }}>
                                          <ImageLazyLoading
                                            src={item?.image_urls || ''}
                                            alt="post-image"
                                            className="w-100 h-100"
                                            style={{ objectFit: 'cover', objectPosition: 'center' }}
                                            onError={(e) => {
                                              e.target.src = 'assets/images/default-post.png';
                                            }}
                                          />
                                        </div>
                                      ) : (
                                        <div className="post-video-container" style={{ height: '300px', overflow: 'hidden' }}>
                                          <video
                                            className="w-100 h-100"
                                            style={{ objectFit: 'cover' }}
                                            controls
                                          >
                                            <source src={item?.image_urls} type="video/mp4" />
                                            Your browser does not support the video tag.
                                          </video>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Card footer */}
                                <div className="card-footer pt-0">
                                  <div className="d-flex justify-content-between mt-4">
                                    <div className="w-100 text-margin">
                                      <div className="d-flex justify-content-between align-items-center flex-wrap">
                                        <div className="d-flex justify-content-between align-items-center">
                                          <div className="d-flex align-items-center me-3">
                                            <span className="material-symbols-outlined md-18">comment</span>
                                            <span className="card-text-1 ms-1">{safeFormatCount(item?.comments_count)}</span>
                                          </div>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center">
                                          <div className="d-flex align-items-center me-3">
                                            <span className="material-symbols-outlined md-18">thumb_up</span>
                                            <span className="card-text-1 ms-1">{safeFormatCount(item?.like_count)}</span>
                                          </div>
                                          <div className="d-flex align-items-center me-3">
                                            <span className="material-symbols-outlined md-18">visibility</span>
                                            <span className="card-text-1 ms-1">{safeFormatCount(item?.share_count)}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </InfiniteScrollWrapper>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Replace existing modal with ListView modal */}
      <Modal
        show={modalOpen}
        onHide={handleCloseModal}
        size="xl"
        centered
        backdrop="static"
        keyboard={false}
        dialogClassName="modal-90w"
        contentClassName="h-90vh"
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
              {/* User info */}
              <div className="p-3">
                <div className="user-post-data">
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      {selectedItem && (
                        <img
                          className="border border-2 rounded-circle user-post-profile"
                          src={`assets/images/icon/${channelImages[activePlatform] || channelImages[selectedItem?.channel_id?.[0]] || 'default.png'}`}
                          alt="user-image"
                          style={{ width: '40px', height: '40px' }}
                        />
                      )}
                    </div>
                    <div>
                      <h6 className="mb-0">{selectedItem?.username || 'Anonymous'}</h6>
                      <small>
                        {selectedItem?.action === 3
                          ? formattedDateTime(selectedItem?.when_to_post)
                          : formattedDateTime(selectedItem?.created_at)}
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="px-3 mb-3">
                <p className="mb-2">
                  {selectedItem && (
                    <>
                      {isExpandedInModal
                        ? selectedItem.description
                        : truncateText(selectedItem.description)}
                      {selectedItem.description && selectedItem.description.split(' ').length > 5 && (
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

              {/* Media content */}
              <div className="modal-media-container"
                style={{
                  height: 'calc(80vh - 200px)',
                  backgroundColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {selectedItem?.post_type === "post" ? (
                  <ImageLazyLoading
                    src={selectedImage}
                    alt="post-image"
                    className="modal-media-content"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      display: 'block',
                      margin: 'auto'
                    }}
                    onError={(e) => {
                      e.target.src = 'assets/images/default-post.png';
                    }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'transparent' }}>
                    <VideoPlayer
                      src={selectedImage}
                      poster={selectedItem?.thumbnail_url}
                      autoPlay={true}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Engagement stats */}
            <div className="col-md-12 col-lg-5 border-start">
              <div className="fixed-suggestion">
                <div className="card mb-0 card-feed">
                  <div className="card-body pt-0">
                    {/* Platform Icons Section */}
                    {selectedItem && selectedItem.channel_id.length > 1 && (
                      <div className="d-flex justify-content-center gap-3 mb-3 p-2 border-bottom">
                        {selectedItem.channel_id.map((channelId) => (
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
  );
};

export default FeedView;
