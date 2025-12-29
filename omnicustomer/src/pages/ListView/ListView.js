import React, { useEffect, useState, useRef } from "react";
import { ListViewData } from "../../utils/ApiClient";
import PaginationComponent from "../../common/components/PaginationComponent";
import Loader from "../../common/components/Loader";
import {
  truncateName,
  formatCount,
  formattedDateTime,
} from "../../utils/CommonFunctions";
import { FaVideo } from "react-icons/fa"; // Import the video icon
import { channelImages, status, whereToPost } from "../../utils/Constants";
import MultiSelectStatic from "../../common/components/selects/MultiSelectStatic";
import ImageLazyLoading from "../../common/components/ImageLazyLoading"; // Import ImageLazyLoading component
import { Modal } from 'react-bootstrap'; // Add this import
import { useNavigate } from "react-router-dom"; // Add this import

// Add VideoPlayer component
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
      backgroundColor: 'transparent'
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
          background: 'transparent'
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

// Add helper functions
const truncateText = (text, maxWords = 5) => {
  if (!text) return '';
  const words = text.trim().split(/\s+/);
  return words.length > maxWords ? `${words.slice(0, maxWords).join(' ')}...` : text;
};

const safeFormatCount = (count) => {
  return count !== undefined && count !== null ? formatCount(count) : '0';
};

export default function ListView() {
  // Move the platformIconStyles inside the component
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
    }
  `;

  // Move the useEffect for styles inside the component
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = platformIconStyles;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  // Add this helper function near the top of your component
  const getStatusText = (statusCode) => {
    if (!status || !status[statusCode]) {
      return 'Unknown Status';
    }
    return status[statusCode];
  };

  // Add new state variables
  const [isExpandedInModal, setIsExpandedInModal] = useState(false);
  const [activePlatform, setActivePlatform] = useState(null);

  const [userData, setUserData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const perPageLimit = 10;
  const [showModal, setShowModal] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState(""); // New state for search keyword
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedItem, setSelectedItem] = useState(null); // New state for selected item
  const [selectedPost, setSelectedPost] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [activeTab, setActiveTab] = useState("likes"); // New state for active tab
  const [selectedChannels, setSelectedChannels] = useState([]); // New state for active tab
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [activeCardPlatforms, setActiveCardPlatforms] = useState({});

  const navigate = useNavigate(); // Add this line

  const fetchViewList = async (page, keyword = "", status = "", channel_id) => {
    console.log("params", channel_id);

    setIsLoading(true);
    try {
      const params = {
        page_number: page,
        page_size: perPageLimit,
        keyword: keyword, // Pass keyword to API
        status: status, // Pass status to API
        channel_id: Array.isArray(channel_id) ? channel_id : [channel_id]
      };

      const response = await ListViewData(params);
      const response_data = response.data;

      console.log("API Response Data:", response_data); // Add this line

      if (response_data?.error_code === 200) {
        const { posts, pagination } = response_data.results;

        // Filter and sort based on status condition
        const sortedPosts = posts
          .filter(post => post.created_at || post.when_to_post)
          .sort((a, b) =>
            new Date(status === "3" ? b.when_to_post : b.when_to_post) -
            new Date(status === "3" ? a.when_to_post : a.when_to_post)
          );

        console.log("Posts:", sortedPosts);
        console.log("Total Pages:", pagination.total_pages);

        setUserData(sortedPosts); // Set the list of posts to state
        setPageCount(pagination.total_pages); // Set the total page count
      } else {
        setUserData([]); // Reset state if no data is available
      }
    } catch (error) {
      console.error(
        "Error fetching sub-user data:",
        error?.response?.data?.message || "Something went wrong!"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchViewList(currentPage, searchKeyword, selectedStatus, selectedChannels); // Fetch data with current page, search keyword, and selected status
  }, [currentPage, searchKeyword, selectedStatus, selectedChannels]);

  const handlePageClick = (selected) => {
    const selectedPage = selected.selected + 1; // Selected page is 0-based
    setCurrentPage(selectedPage);
  };

  const pgntn_props = {
    pageCount: pageCount,
    handlePageClick: handlePageClick,
    selectedPage: currentPage - 1,
  };

  const handleListSearch = (e) => {
    const keyword = e.target.value;
    setSearchKeyword(keyword); // Update search keyword state
    setCurrentPage(1); // Reset to the first page on a new search
  };

  const handleSearchClick = () => {
    setShowModal(true);
  };

  const handleStatusChange = (e) => {
    const status = e.target.value; // Update selected status
    setSelectedStatus(status);
    setCurrentPage(1); // Reset to the first page
  };

  const handleImageClick = (item) => {
    setupInitialModalData(item);
    setIsExpandedInModal(false);
    setModalOpen(true);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  // Modify the handleModalShown function
  const handleModalShown = () => {
    if (selectedItem?.post_type !== "post") {
      const videoElement = document.querySelector("#modalVideo");
      if (videoElement) {
        videoElement.load(); // Reload the video
        videoElement.play().catch(error => {
          console.error("Error playing video:", error);
        });
      }
    }
  };

  const handleModalHidden = () => {
    const videoElement = document.querySelector("#modalVideo");
    if (videoElement) {
      videoElement.pause();
      videoElement.currentTime = 0;
    }
  };

  const handleSelectedChannels = (selected) => {
    const channel_id = selected.map((item) => item.value)
    console.log("selectedChannels", channel_id)
    setSelectedChannels(channel_id);
  }

  // Add new handler
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
        });
      } else {
        // Fallback to default post data if platform-specific data isn't available
        setSelectedImage(selectedItem.image_urls);
        setSelectedPost(selectedItem);
      }
    }
  };

  // Add close modal handler
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
    setSelectedImage('');
    setSelectedPost('');
    setIsExpandedInModal(false);
  };

  // Update the table row video cell rendering
  const renderVideoCell = (item) => {
    if (item.post_type === "post") {
      return (
        <img
          src={item.image_urls}
          alt="story-img"
          className="rounded"
          width="82px"
          height="50px"
          style={{
            objectFit: 'contain',
            backgroundColor: 'black',
          }}
        />
      );
    } else {
      return (
        <div className="video-container">
          <video
            width="100%"
            height="100%"
            preload="metadata"
          >
            <source src={item.image_urls} type="video/mp4" />
          </video>
          <FaVideo
            style={{
              position: 'absolute',
              color: 'white',
              fontSize: '24px',
            }}
          />
        </div>
      );
    }
  };

  // Add new function to handle initial modal data setup
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

  // Add effect for platform data updates
  useEffect(() => {
    if (selectedItem && activePlatform) {
      const platformData = selectedItem.platform_data?.[activePlatform];
      if (platformData) {
        setSelectedImage(platformData.media_url || platformData.image_url || selectedItem.image_urls);
      }
    }
  }, [activePlatform, selectedItem]);

  return (
    <div>
      <div>
        <div className="position-relative"></div>
        <div id="content-page" className="content-page">
          <div className="container">
            <div className="row mt-3">
              <div className="d-flex align-items-center justify-content-between flex-wrap mb-4">
                <h4 className="fw-bold text-primary">List View</h4>
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
                <div className="card ">
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

                      <div class="col-md-3">
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
                          onChange={handleStatusChange} // Call handleStatusChange on change
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
                  <div className="card-body px-0">
                    <div className="row">
                      <div className="col-sm-12">
                        <div class="card-body ">
                          {isLoading ? (
                            <Loader /> // Display loading spinner while fetching data
                          ) : userData?.length === 0 ? (
                            <NoDataMessage type="noData" />
                          ) : (
                            <div className="table-responsive-sm">
                              <table className="table table-bordered hover table-striped">
                                <tbody className="text-nowrap">
                                  {Array.isArray(userData) && userData.map((item, index) => (
                                    <tr key={index}>
                                      <td>
                                        <a
                                          href="javascript:void(0);"
                                          onClick={() => handleImageClick(item)} // Remove data-bs attributes
                                        >
                                          <div className="d-flex align-items-center justify-content-between flex-nowrap">
                                            <div className="d-flex align-items-center">
                                              <div className="img-fluid border flex-shrink-0">
                                                {renderVideoCell(item)}
                                              </div>
                                              <p className="mb-0 ms-2">
                                                {item.description
                                                  ? truncateName
                                                    ? truncateName(item.description)
                                                    : item.description
                                                  : "---"}
                                              </p>
                                            </div>
                                            <div className="flex-grow-1 ms-3">
                                              <div className="d-flex justify-content-end align-items-center mt-2">
                                                <span className="material-symbols-outlined md-18 me-2">thumb_up</span>
                                                <span className="me-3">{item.like_count ? formatCount(item.like_count) : 0}</span>
                                                <span className="material-symbols-outlined md-18 me-2">comment</span>
                                                <span className="me-3">{item.comments_count ? formatCount(item.comments_count) : 0}</span>
                                                {/* <span className="material-symbols-outlined md-18 me-2">share</span>
                                                <span>{item.share_count ? formatCount(item.share_count) : 0}</span> */}
                                              </div>
                                            </div>
                                          </div>
                                        </a>
                                      </td>
                                      <td className="align-middle nowrap">
                                        {item?.action === 3
                                          ? new Date(item?.when_to_post).toLocaleString()
                                          : new Date(item?.created_at).toLocaleString()}
                                      </td>

                                      <td className="align-middle">{getStatusText(item.status)}</td>
                                      <td className="align-middle">
                                        <div className="img-fluid flex-shrink-0">
                                          {item.channel_id && Array.isArray(item.channel_id) && item.channel_id.map((channel) => {
                                            const imageName = channelImages[channel];
                                            return (
                                              <a href="javascript:void(0);" key={channel}>
                                                <img
                                                  src={`/assets/images/icon/${imageName}`}
                                                  alt={imageName ? imageName : 'story-img'}
                                                  className="rounded-circle avatar-30 me-1"
                                                  loading="lazy"
                                                />
                                              </a>
                                            );
                                          })}
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              <PaginationComponent {...pgntn_props} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
                      <small> {selectedItem?.action === 3
                        ? formattedDateTime(selectedItem?.when_to_post)
                        : formattedDateTime(selectedItem?.created_at)}</small>
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
}
