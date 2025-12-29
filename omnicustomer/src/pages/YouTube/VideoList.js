import React, { useRef, useState, useEffect } from "react";
import {
  YoutubeList,
  YoutubePlaylistDelete,
  YoutubePlayListEdit,
  YouTubePlayLists,
} from "../../utils/ApiClient";
import VideoModal from "./VideoModal";
import { Modal } from "react-bootstrap";
import { ConfirmationAlert, triggerAlert, formatDateTime } from "../../utils/CommonFunctions";
import CreatePlayList from "./CreatePlayList";
import InfiniteScrollWrapper from "../../common/components/InfinityScrollWrapper";
import SpinnerLoader from "../../common/components/SpinnerLoader";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Loader from '../../common/components/Loader';

const NoDataMessage = ({ type }) => {
  const messages = {
    video: {
      icon: 'videocam_off',
      title: 'No Videos Available',
      description: 'There are no videos uploaded yet. Videos will appear here once they are added.'
    },
    short: {
      icon: 'movie',
      title: 'No Shorts Available',
      description: 'There are no shorts uploaded yet. Shorts will appear here once they are added.'
    },
    playlist: {
      icon: 'playlist_play',  
      title: 'No Playlists Available',
      description: 'No playlists have been created yet. Create a playlist to organize your videos.'
    },
    playlistVideos: {
      icon: 'video_library',
      title: 'No Videos in Playlist',
      description: 'This playlist has no videos yet. Add some videos to get started.'
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

// Update SkeletonLoader to use data count
const SkeletonLoader = ({ type, count = 6 }) => {
  const getColumns = () => {
    switch (type) {
      case 'short':
        return 'col-lg-3 col-md-4 col-sm-6';
      default:
        return 'col-lg-4 col-md-6';
    }
  };

  // Calculate skeleton count based on previous data length or default to 6
  const skeletonCount = count > 0 ? count : 6;

  return (
    <>
      {Array(skeletonCount).fill(0).map((_, index) => (
        <div key={index} className={`${getColumns()} mb-4`}>
          <div className="card">
            <div style={{ 
              paddingBottom: type === 'short' ? '177.77%' : '56.25%', 
              position: 'relative',
              background: '#f8f9fa',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <Skeleton 
                height="100%" 
                style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  right: 0, 
                  bottom: 0,
                  transform: 'none'
                }}
              />
            </div>
            <div className="card-body">
              <Skeleton width="70%" height={20} className="mb-2" />
              <Skeleton width="40%" height={15} />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

const VideoList = ({ baseUrl, handleVideoClick }) => {
  const videoRefs = useRef([]);
  const [videos, setVideos] = useState([]);
  const [shorts, setShorts] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState({
    page_number: 1,
    page_size: 9,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState("video");
  const [previousTab, setPreviousTab] = useState(null); // Track the previously active tab
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [editPlaylist, setEditPlaylist] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null); // State to manage selected playlist
  const [playlistVideos, setPlaylistVideos] = useState([]); // State to manage playlist videos
  const [playlistError, setPlaylistError] = useState(null); // State to manage playlist video errors
  const [playlistPageNumber, setPlaylistPageNumber] = useState(1); // State to manage playlist video pagination
  const [playlistPageSize, setPlaylistPageSize] = useState(10); // State to manage playlist video pagination
  const [isPlaylistVideoView, setIsPlaylistVideoView] = useState(false); // State to manage playlist video view
  const [hasMoreYouTube, setHasMoreYouTube] = useState(true);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [lastFetchedPlaylist, setLastFetchedPlaylist] = useState(null); // Track the last fetched playlist
  const [loadingVideos, setLoadingVideos] = useState(false); // Loading state for videos
  const [loadingShorts, setLoadingShorts] = useState(false); // Loading state for shorts
  const [loadingPlaylists, setLoadingPlaylists] = useState(false); // Loading state for playlists
  const [loadingPlaylistVideos, setLoadingPlaylistVideos] = useState(false); // Loading state for playlist videos
  const [isLoading, setIsLoading] = useState(false);
  const [totalVideoCount, setTotalVideoCount] = useState(0); // State to manage total video count
  const [expandedTitles, setExpandedTitles] = useState({});
  const [playlistVideoCache, setPlaylistVideoCache] = useState({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isApiCallInProgress, setIsApiCallInProgress] = useState(false);

  // Add LoadingIndicator component at the top level
  const LoadingIndicator = () => (
    <div className="col-12 py-4 text-center">
      <div className="loading-wave">
        <div className="loading-bar"></div>
        <div className="loading-bar"></div>
        <div className="loading-bar"></div>
        <div className="loading-bar"></div>
      </div>
    </div>
  );

  // Add styles for the new loading animation
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .loading-wave {
        display: flex;
        justify-content: center;
        align-items: flex-end;
        height: 40px;
        gap: 8px;
      }
      .loading-bar {
        width: 8px;
        height: 10px;
        background: #007bff;
        border-radius: 4px;
        animation: loading-wave 1s ease-in-out infinite;
      }
      .loading-bar:nth-child(2) {
        animation-delay: 0.1s;
      }
      .loading-bar:nth-child(3) {
        animation-delay: 0.2s;
      }
      .loading-bar:nth-child(4) {
        animation-delay: 0.3s;
      }
      @keyframes loading-wave {
        0% { transform: scaleY(1) }
        50% { transform: scaleY(2) }
        100% { transform: scaleY(1) }
      }
      .loading-container {
        margin: 20px 0;
        background: rgba(0,0,0,0.03);
        border-radius: 8px;
        padding: 15px;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Update pagination state to match FeedView style
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const perPageLimit = 9;

  // Modified fetchVideos function to handle pagination better
  const fetchVideos = async (post_type, isLoadMore = false) => {
    if (isApiCallInProgress) {
      return;
    }
  
    try {
      setIsApiCallInProgress(true);
      
      const pageToFetch = isLoadMore ? currentPage : 1;
      if (!isLoadMore) {
        // Reset data when fetching fresh
        switch (post_type) {
          case 'video':
            setVideos([]);
            break;
          case 'short':
            setShorts([]);
            break;
          case 'playlist':
            setPlaylists([]);
            break;
        }
        setInitialLoading(true);
        setCurrentPage(1);
      }
  
      const response = await YoutubeList({
        page_number: pageToFetch,
        page_size: perPageLimit,
        post_type,
      });
  
      if (response.status === 200) {
        const newData = response.data.results.data;
        const totalPages = response.data.results.pagination.total_pages;
  
        // Update data based on post type
        switch (post_type) {
          case 'video':
            setVideos(prev => {
              const updatedVideos = isLoadMore ? [...prev, ...newData] : newData;
              // Remove duplicates based on post_id
              return Array.from(new Map(updatedVideos.map(item => [item.post_id, item])).values());
            });
            break;
          case 'short':
            setShorts(prev => {
              const updatedShorts = isLoadMore ? [...prev, ...newData] : newData;
              return Array.from(new Map(updatedShorts.map(item => [item.post_id, item])).values());
            });
            break;
          case 'playlist':
            setPlaylists(prev => {
              const updatedPlaylists = isLoadMore ? [...prev, ...newData] : newData;
              return Array.from(new Map(updatedPlaylists.map(item => [item.playlist_id, item])).values());
            });
            break;
        }
  
        setHasMore(pageToFetch < totalPages);
        setTotalPages(totalPages);
      }
    } catch (error) {
      console.error(`Error fetching ${post_type}:`, error);
      triggerAlert("error", "Oops...", error?.response?.data?.message || "Something went wrong!");
      setHasMore(false);
    } finally {
      setIsApiCallInProgress(false);
      setIsLoading(false);
      setInitialLoading(false);
    }
  };
  

  const truncateTitle = (title, wordLimit) => {
    const words = title.split(' ');
    if (words.length <= wordLimit) {
      return title;
    }
    const truncatedTitle = words.slice(0, wordLimit).join(' ');
    return truncatedTitle;
  };

  const handleToggleTitle = (playlistId) => {
    setExpandedTitles((prevState) => ({
      ...prevState,
      [playlistId]: !prevState[playlistId],
    }));
  };

  const renderPlaylistTitle = (playlist) => {
    const wordLimit = 4;
    const isExpanded = expandedTitles[playlist.playlist_id];
    const truncatedTitle = truncateTitle(playlist.title, wordLimit);

    return (
      <>
        {isExpanded ? playlist.title : truncatedTitle}
        {playlist.title.split(' ').length > wordLimit && (
          <button
            className="btn btn-link p-0 ml-2"
            onClick={() => handleToggleTitle(playlist.playlist_id)}
            style={{ color: 'dodgerblue', fontWeight: 'bold' }}
          >
            {isExpanded ? ' ... Less' : ' ...More'}
          </button>
        )}
      </>
    );
  };

  const fetchPlaylistVideos = async (id) => {
    try {
      setLoadingPlaylistVideos(true);
      const api_input = {
        page_number: playlistPageNumber,
        page_size: playlistPageSize,
        playlist_id: id.playlist_id,
      };

      const response = await YouTubePlayLists(api_input);

      if (response.status === 200) {
        const videos = response.data.results.videos;
        setPlaylistVideos(videos);
        setPlaylistVideoCache(prev => ({
          ...prev,
          [id.playlist_id]: videos
        }));
        setTotalVideoCount(response.data.total_video_count);
        
        // Update playlist video count in playlists list
        setPlaylists(prevPlaylists => 
          prevPlaylists.map(playlist => 
            playlist.playlist_id === id.playlist_id 
              ? { ...playlist, playlist_video_count: response.data.total_video_count }
              : playlist
          )
        );
      } else if (response.status === 204) {
        setPlaylistVideos([]);
        setPlaylistVideoCache(prev => ({
          ...prev,
          [id.playlist_id]: []
        }));
        setTotalVideoCount(0);
      }
    } catch (error) {
      console.error("Error fetching playlist videos:", error);
    } finally {
      setLoadingPlaylistVideos(false);
    }
  };

  const handleEditPlaylist = async (id, newTitle, newDescription) => {
    if (!id) {
      triggerAlert("error", "Oops...", "Playlist ID is missing!");
      return;
    }

    try {
      const payload = {
        playlist_id: id,
        title: newTitle,
        description: newDescription,
      };

      const response = await YoutubePlayListEdit(payload);

      if (response.status === 200) {
        // Update the playlists state locally instead of fetching
        setPlaylists(prevPlaylists =>
          prevPlaylists.map(playlist =>
            playlist.playlist_id === id
              ? { ...playlist, title: newTitle, description: newDescription }
              : playlist
          )
        );

        triggerAlert("success", "Success", "Playlist updated successfully!");
        setEditPlaylist(null);
      } else {
        console.error("Error updating playlist:", response.data.message);
        triggerAlert("error", "Oops...", response.data.message || "Something went wrong!");
      }
    } catch (error) {
      console.error("Error updating playlist:", error);
      triggerAlert("error", "Oops...", error?.response?.data?.message || "Something went wrong!");
    }
  };

  const handleDeletePlaylist = async (playlist_id) => {
    if (!playlist_id) {
      triggerAlert("error", "Oops...", "Playlist ID is missing!");
      return;
    }

    ConfirmationAlert(
      "Are you sure you want to delete this playlist?",
      "Continue",
      async () => {
        setIsLoading(true);

        try {
          const response = await YoutubePlaylistDelete({
            playlist_id: playlist_id,
          });

          if (response.status === 200) {
            // Update playlists state locally instead of fetching
            setPlaylists(prevPlaylists =>
              prevPlaylists.filter(playlist => playlist.playlist_id !== playlist_id)
            );

            triggerAlert("success", "Success", "Playlist deleted successfully!");
          } else {
            console.error("Error deleting playlist:", response?.data?.message);
            triggerAlert("error", "Oops...", response?.data?.message || "Something went wrong");
          }
        } catch (error) {
          console.error("Error deleting playlist:", error);
          triggerAlert("error", "Oops...", error.response?.data?.message || "An unexpected error occurred!");
        } finally {
          setIsLoading(false);
        }
      }
    );
  };

  // Add this function after the fetchVideos function
  const handleLoadMore = async () => {
    if (!isLoading && !isApiCallInProgress && hasMore) {
      setCurrentPage(prevPage => prevPage + 1);
      await fetchVideos(activeTab, true);
    }
  };

  // Add this new function to update playlist videos after edit
  const handlePlaylistVideoEdited = (editedVideo) => {
    // Update video in videos list if present
    setVideos(prevVideos =>
      prevVideos.map(video =>
        video.post_id === editedVideo.post_id ? editedVideo : video
      )
    );
  
    // Update video in shorts list if present
    setShorts(prevShorts =>
      prevShorts.map(video =>
        video.post_id === editedVideo.post_id ? editedVideo : video
      )
    );
  
    // Update video in playlist videos if in playlist view
    if (isPlaylistVideoView && selectedPlaylist) {
      setPlaylistVideos(prevVideos =>
        prevVideos.map(video =>
          video.video_id === editedVideo.video_id ? editedVideo : video
        )
      );
  
      // Update cache
      setPlaylistVideoCache(prev => ({
        ...prev,
        [selectedPlaylist.playlist_id]: prev[selectedPlaylist.playlist_id]?.map(video =>
          video.video_id === editedVideo.video_id ? editedVideo : video
        )
      }));
    }
  };
  

  useEffect(() => {
    if (activeTab !== previousTab) {
      // Clear current content immediately
      switch (activeTab) {
        case 'video':
          setVideos([]);
          break;
        case 'short':
          setShorts([]);
          break;
        case 'playlist':
          setPlaylists([]);
          break;
      }
      
      // Reset pagination state
      setCurrentPage(1);
      setHasMore(true);
      setPreviousTab(activeTab);
      
      // Fetch new content
      fetchVideos(activeTab, false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedPlaylist) {
      fetchPlaylistVideos(selectedPlaylist);
    }
  }, [selectedPlaylist, playlistPageNumber, playlistPageSize]);

  useEffect(() => {
    if (selectedVideo) {
      setShowModal(true);
    }
  }, [selectedVideo]);

  const handlePagination = (newPage) => {
    setPagination((prevPagination) => ({
      ...prevPagination,
      page_number: newPage,
    }));
  };

  const handlePlaylistPagination = (newPage) => {
    setPlaylistPageNumber(newPage);
  };

  const handleTabChange = (tab, playlist_id = null) => {
    setLoading(true); // Show loading state immediately
    setActiveTab(tab);
    setPagination({
      page_number: 1,
      page_size: 9,
    });
    if (tab === "playlist") {
      setSelectedPlaylistId(playlist_id);
    } else {
      setSelectedPlaylistId(null);
    }
    setIsPlaylistVideoView(false);
  };

  const handleMouseEnter = (index) => {
    if (videoRefs.current[index]) {
      videoRefs.current[index].play().catch((error) => {
        console.error(`Error playing video ${index}:`, error);
      });
    }
  };

  const handleMouseLeave = (index) => {
    if (videoRefs.current[index]) {
      videoRefs.current[index].pause();
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedVideo(null);
  };

  const getUpdatedUrl = (url) => {
    if (!url) return "";
    const unwantedPath = "/home/vitel/omni_channel_api";
    return url.replace(unwantedPath, baseUrl);
  };

  const openModal = (video) => {
    setSelectedVideo(video);
    setShowModal(true);
  };

  // Add unified state update function
  const handleVideoStateUpdate = (updatedVideo, action = 'edit') => {
    const updateVideoInList = (list, setList) => {
      if (action === 'edit') {
        setList(prev => prev.map(item => 
          item.post_id === updatedVideo.post_id ? updatedVideo : item
        ));
      } else if (action === 'delete') {
        setList(prev => prev.filter(item => item.post_id !== updatedVideo.post_id));
      }
    };
  
    // Update both videos and shorts lists
    updateVideoInList(videos, setVideos);
    updateVideoInList(shorts, setShorts);
  
    // Update playlist videos if in playlist view
    if (isPlaylistVideoView && selectedPlaylist) {
      updateVideoInList(playlistVideos, setPlaylistVideos);
    }
  };
  
  // Replace both handleVideoDeleted implementations with this single one
  const handleVideoDeleted = async (videoId, playlistId = null) => {
    handleVideoStateUpdate({ post_id: videoId }, 'delete');
    handleCloseModal();
  
    if (isPlaylistVideoView && selectedPlaylist) {
      const playlistId = selectedPlaylist.playlist_id;
      
      // Update playlist videos locally
      setPlaylistVideos(prevVideos =>
        prevVideos.filter(video => video.video_id !== videoId)
      );
      
      // Update cache
      setPlaylistVideoCache(prev => ({
        ...prev,
        [playlistId]: (prev[playlistId] || []).filter(video => video.video_id !== videoId)
      }));
      
      // Update playlist count in playlists list
      setPlaylists(prevPlaylists =>
        prevPlaylists.map(playlist =>
          playlist.playlist_id === playlistId
            ? { ...playlist, playlist_video_count: Math.max(0, playlist.playlist_video_count - 1) }
            : playlist
        )
      );
      
      // Update total count
      setTotalVideoCount(prev => Math.max(0, prev - 1));
    }
  
    // Refresh the appropriate list based on active tab after a short delay
    setTimeout(() => {
      fetchVideos(activeTab, false);
    }, 100);
  };
  

  const handlePlaylistVideoClick = (playlist) => {
    setSelectedPlaylist(playlist);
    setIsPlaylistVideoView(true);
    // fetchPlaylistVideos(playlist);
  };

  const handleBackButtonClick = () => {
    setIsPlaylistVideoView(false);
    setActiveTab("playlist");
    setSelectedPlaylist(null); // Reset selected playlist

    // Check if playlists are already fetched
    if (playlists.length === 0) {
      fetchVideos("playlist"); // Fetch playlists again to ensure correct data
    }
  };

  const handleFetchMoreYouTube = async () => {
    if (pagination.page_number < totalPages) {
      setLoadingMedia(true);
      const newPageNumber = pagination.page_number + 1;
      setPagination((prevPagination) => ({
        ...prevPagination,
        page_number: newPageNumber,
      }));
      await fetchVideos(activeTab);
      setLoadingMedia(false);

      if (newPageNumber >= totalPages) {
        setHasMoreYouTube(false);
      }
    } else {
      setHasMoreYouTube(false);
    }
  };

  const handleFetchMorePlaylistVideos = async () => {
    if (playlistPageNumber < totalPages) {
      setLoadingMedia(true);
      setPlaylistPageNumber((prevPageNumber) => prevPageNumber + 1);
      await fetchPlaylistVideos(selectedPlaylist);
      setLoadingMedia(false);

      if (playlistPageNumber + 1 >= totalPages) {
        setHasMoreYouTube(false);
      }
    } else {
      setHasMoreYouTube(false);
    }
  };

  // Fix the renderVideoItem function
  const renderVideoItem = (video, index, type) => (
    <div key={video.id || video.post_id || index} className={`${type === 'short' ? 'col-lg-3 col-md-4 col-sm-6' : 'col-lg-4 col-md-6'} mb-4`}>
      <div className={`user-images ${type === 'short' ? 'user-images-short' : 'user-images-icon'} custom-border rounded position-relative overflow-hidden ${type === 'short' ? 'mb-3' : ''}`}>
        <a href="#" onClick={(e) => {
          e.preventDefault();
          openModal(video);
        }}>
          <div className="media-container" style={{ 
            paddingBottom: type === 'short' ? '177.77%' : '56.25%',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {video.thumbnail ? (
              <img
                src={getUpdatedUrl(video.thumbnail)}
                alt={video.title}
                className="img-fluid lazy"
                loading="lazy"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <video
                ref={(el) => (videoRefs.current[index] = el)}
                src={getUpdatedUrl(video.video_urls)}
                className="img-fluid"
                muted
                loop
                controls={false}
                controlsList="nodownload"
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={() => handleMouseLeave(index)}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
          {type === 'short' ? (
            <div className="center-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 256 256">
                <g transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)">
                  <path d="M 25.049 54.331 c -1.651 -0.978 -3.118 -1.834 -4.646 -2.69 c -4.34 -2.506 -7.641 -6.174 -8.497 -11.126 c -1.345 -7.947 -0.122 -14.671 8.314 -19.745 c 10.637 -6.358 21.396 -12.41 32.155 -18.584 c 10.515 -5.991 24.391 0.978 25.981 13.021 c 1.1 7.336 -2.506 14.549 -9.047 18.095 c -1.406 0.795 -2.873 1.651 -4.463 2.629 c 1.589 0.917 2.934 1.773 4.34 2.567 c 11.187 6.296 12.654 21.151 2.812 29.343 c -1.956 1.589 -4.279 2.751 -6.48 4.035 c -9.231 5.38 -18.523 10.759 -27.815 16.016 c -8.619 4.646 -19.379 1.345 -24.024 -7.275 c -4.401 -8.192 -1.712 -18.339 6.113 -23.291 C 21.565 56.41 23.215 55.431 25.049 54.331 z" 
                    style={{ fill: 'rgb(253,0,0)' }} />
                  <polygon points="36.36,58.55 59.47,45.16 36.36,31.84" 
                    style={{ fill: 'rgb(255,255,255)' }} />
                </g>
              </svg>
            </div>
          ) : (
            <div className="center-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="currentColor" className="bi bi-play-circle-fill" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814z" />
              </svg>
            </div>
          )}
        </a>
        <div className="image-hover-data">
          <div className="product-elements-icon">
            <ul className="d-flex align-items-center m-0 p-0 list-inline">
              <li>
                <a href="#" className="pe-3 text-white d-flex align-items-center">
                  {video.title}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  // Fix the renderPlaylistItem function's dropdown structure
  const renderPlaylistItem = (playlist, index) => (
    <div key={playlist.playlist_id || index} className="col-lg-4 col-md-6 mb-4">
      <div className="user-images user-images-icon-play custom-border rounded mb-3">
        <a href="#" onClick={() => handlePlaylistVideoClick(playlist)}>
          <div className="media-container" style={{ paddingBottom: '56.25%', position: 'relative' }}>
            {playlist.thumbnail ? (
              <img
                src={getUpdatedUrl(playlist.thumbnail)}
                alt={playlist.title}
                className="img-fluid lazy"
                loading="lazy"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <video
                src={getUpdatedUrl(playlist.video_urls)}
                className="img-fluid"
                muted
                loop
                controls
                controlsList="nodownload"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
          <div className="center-icon-plays">
            <svg xmlns="http://www.w3.org/2000/svg" width={50} height={50} fill="currentColor" className="bi bi-play-circle-fill" viewBox="0 0 16 16">
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
                    <h6 className="fw-500">{renderPlaylistTitle(playlist)}</h6>
                    <p className="mb-0">Public : <span>Playlist</span></p>
                    <p className="mb-0">
                      Updated {formatDateTime(playlist.created_at, 'month dd, yyyy')}
                    </p>
                  </div>
                  <div className="d-flex">
                    <p className="mb-0">
                      <i className="material-symbols-outlined md-18 font-size-16">playlist_play</i>
                    </p>
                    <a href="#"><p className="mb-0">{playlist.playlist_video_count} Videos</p></a>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="card-header-toolbar d-flex align-items-center">
                      <div className="dropdown">
                        <div className="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                          <span className="material-symbols-outlined">more_horiz</span>
                        </div>
                        <div className="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton">
                          <a 
                            className="dropdown-item d-flex align-items-center" 
                            href="#" 
                            onClick={() => setEditPlaylist(playlist)}
                          >
                            <span className="material-symbols-outlined me-2 md-18">edit</span>
                            Edit
                          </a>
                          <a 
                            className="dropdown-item d-flex align-items-center" 
                            href="#" 
                            onClick={() => handleDeletePlaylist(playlist.playlist_id)}
                          >
                            <span className="material-symbols-outlined me-2 md-18">delete</span>
                            Delete
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Modify renderContent function to show single loader at bottom
  const renderContent = (items, type) => (
    <InfiniteScrollWrapper
      className="row"
      dataLength={items.length}
      next={handleLoadMore}
      hasMore={hasMore}
      loader={
        <div className="col-12 text-center py-3">
          <Loader />
        </div>
      }
      scrollThreshold={0.8}
      endMessage={
        items.length > 0 && (
          <div className="col-12 text-center py-3">
            <p>No more items to load.</p>
          </div>
        )
      }
    >
      {items.map((item, index) => (
        type === 'playlist' 
          ? renderPlaylistItem(item, index)
          : renderVideoItem(item, index, type)
      ))}
    </InfiniteScrollWrapper>
  );

  // Update the renderTabContent function
  const renderTabContent = (items, type) => {
    if (initialLoading) {
      return (
        <div className="row">
          <SkeletonLoader type={type} count={perPageLimit} />
        </div>
      );
    }
    
    if (!initialLoading && items.length === 0) {
      return <NoDataMessage type={type} />;
    }
    
    return renderContent(items, type);
  };

  // Update the playlist video section to use SkeletonLoader
  const renderPlaylistVideos = () => {
    if (loadingPlaylistVideos) {
      const count = playlistVideos.length || 9;
      return (
        <div className="row">
          <SkeletonLoader type="video" count={count} />
        </div>
      );
    }

    if (!loadingPlaylistVideos && playlistVideos.length === 0) {
      return <NoDataMessage type="playlistVideos" />;
    }

    return (
      <InfiniteScrollWrapper
        className="row"
        dataLength={playlistVideos.length}
        next={handleFetchMorePlaylistVideos}
        hasMore={hasMoreYouTube}
        loader={
          <div className="col-12 text-center py-3">
            <Loader />
          </div>
        }
        scrollThreshold={0.8}
        endMessage={
          playlistVideos.length > 0 && (
            <div className="col-12 text-center py-3">
              <p>No more videos to load.</p>
            </div>
          )
        }
      >
        {playlistVideos.map((video, index) => 
          renderVideoItem(video, index, 'video')
        )}
      </InfiniteScrollWrapper>
    );
  };

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="row">
      <div className="col-lg-12">
        <div className="card">
          <div className="card-header">
            <div className="d-flex justify-content-between">
              <ul
                className="nav nav-pills mb-0"
                id="pills-tab-1"
                role="tablist"
              >
                <li className="nav-item" role="presentation">
                  <a
                    className={`nav-link ${activeTab === "video" ? "active" : ""
                      }`}
                    id="pills-home-tab-fill"
                    data-bs-toggle="pill"
                    href="#pills-home-filla"
                    role="tab"
                    aria-controls="pills-homea"
                    aria-selected={activeTab === "video"}
                    onClick={() => handleTabChange("video")}
                  >
                    Videos
                  </a>
                </li>
                <li className="nav-item" role="presentation">
                  <a
                    className={`nav-link ${activeTab === "short" ? "active" : ""
                      }`}
                    id="pills-profile-tab-fill"
                    data-bs-toggle="pill"
                    href="#pills-profile-filla"
                    role="tab"
                    aria-controls="pills-profilea"
                    tabIndex="-1"
                    aria-selected={activeTab === "short"}
                    onClick={() => handleTabChange("short")}
                  >
                    Shorts
                  </a>
                  
                </li>
                <li className="nav-item" role="presentation">
                  <a
                    className={`nav-link ${activeTab === "playlist" ? "active" : ""
                      }`}
                    id="pills-Playlists-tab-fill"
                    data-bs-toggle="pill"
                    href="#pills-Playlists-filla"
                    role="tab"
                    aria-controls="pills-profilea"
                    tabIndex="-1"
                    aria-selected={activeTab === "playlist"}
                    onClick={() => handleTabChange("playlist")}
                  >
                    Playlists
                  </a>
                </li>
              </ul>
              {activeTab === "playlist" && (
                <CreatePlayList
                  buttonText="Create PlayList"
                  onPlaylistCreated={fetchVideos}
                  fetchPlaylistVideos={fetchPlaylistVideos}
                />
              )}
            </div>
          </div>
          <div className="card-body">
            <div className="container">
              <div className="tab-content" id="pills-tabContent-1">
                {!isPlaylistVideoView ? (
                  <>
                    <div className={`tab-pane fade ${activeTab === "video" ? "show active" : ""}`}>
                      {renderTabContent(videos, 'video')}
                    </div>
                    <div className={`tab-pane fade ${activeTab === "short" ? "show active" : ""}`}>
                      {renderTabContent(shorts, 'short')}
                    </div>
                    <div className={`tab-pane fade ${activeTab === "playlist" ? "show active" : ""}`}>
                      {renderTabContent(playlists, 'playlist')}
                    </div>
                  </>
                ) : (
                  <div className="tab-pane fade show active">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <button className="btn btn-secondary" onClick={handleBackButtonClick}>
                        Back
                      </button>
                    </div>
                    {renderPlaylistVideos()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {selectedVideo && (
        <Modal show={showModal} onHide={handleCloseModal} size="xl">
          <VideoModal
            video={selectedVideo}
            onHide={handleCloseModal}
            onVideoDeleted={handleVideoDeleted}
            onVideoEdited={handlePlaylistVideoEdited}
            fetchVideos={fetchVideos}
            isPlaylistView={isPlaylistVideoView}
            playlistId={selectedPlaylist?.playlist_id}
            fetchPlaylistVideos={fetchPlaylistVideos}
            activeTab={activeTab} // Add this prop
          />
        </Modal>
      )}
      {editPlaylist && (
        <Modal show={!!editPlaylist} onHide={() => setEditPlaylist(null)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Playlist</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const newTitle = e.target.elements.title.value;
                const newDescription = e.target.elements.description.value;
                handleEditPlaylist(editPlaylist.playlist_id, newTitle, newDescription);
                setEditPlaylist(null);
              }}
            >
              <div className="mb-3">
                <label htmlFor="title" className="form-label">
                  Title
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  defaultValue={editPlaylist.title}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <textarea
                  className="form-control"
                  id="description"
                  defaultValue={editPlaylist.description}
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary">
                Save changes
              </button>
            </form>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
}

export default VideoList;