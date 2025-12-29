import React, { useEffect, useState, useCallback } from 'react';
import { PintrestUserProfile, PintrestMediaList, pintrestBoardDelete, pintrestBoardCreate, pintrestBoardEdit, boardpinslisting } from '../../utils/ApiClient';
import { Modal, Form, Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { MaxLengthValidation } from '../../utils/Constants';
import { ConfirmationAlert, triggerAlert } from '../../utils/CommonFunctions';
import { useLocation, useNavigate } from 'react-router-dom';
import InfiniteScrollWrapper from '../../common/components/InfinityScrollWrapper';
import Loader from '../../common/components/Loader';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import PinterestMedia from './PinterestMedia';
import Followers from './Followers';
import Following from './Following';

const SkeletonLoader = ({ count = 9 }) => {
  return (
    <>
      {Array(count).fill(0).map((_, index) => (
        <div key={index} className="col-lg-4 col-md-6 mb-3">
          <div className="card">
            <div style={{ paddingBottom: '56.25%', position: 'relative', background: '#f8f9fa', borderRadius: '8px', overflow: 'hidden' }}>
              <Skeleton height="100%" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, transform: 'none' }} />
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

const NoDataMessage = ({ type }) => {
  const messages = {
    post: { icon: 'photo_library', title: 'No Posts Available', description: 'There are no posts uploaded yet.' },
    video: { icon: 'videocam', title: 'No Videos Available', description: 'There are no videos uploaded yet.' },
    board: { icon: 'dashboard', title: 'No Board Items Available', description: 'There are no items on the board yet.' }
  };
  const { icon, title, description } = messages[type];

  return (
    <div className="col-12 text-center p-5">
      <div className="no-data-wrapper">
        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#6c757d' }}>{icon}</span>
        <h5 className="mt-3">{title}</h5>
        <p className="text-muted">{description}</p>
      </div>
    </div>
  );
};

const BoardImageDisplay = ({ board, pins, onClick }) => {
  const defaultImage = "/assets/images/pinterset.png";

  const handleClick = (e) => {
    e.preventDefault();
    onClick(board);
  };

  console.log(`Board: ${board.name}, ID: ${board.id}, Pins:`, pins); // Debug log

  // Filter pins to only include post_type: "post" (exclude "video")
  const filteredPins = pins ? pins.filter(pin => pin.post_type === "post") : [];

  if (!filteredPins.length) {
    return (
      <div
        className="board-image-container"
        style={{
          height: '200px',
          position: 'relative',
          cursor: 'pointer',
          borderRadius: '12px',
          overflow: 'hidden'
        }}
        onClick={handleClick}
      >
        <img
          src={defaultImage}
          alt="Default board"
          className="img-fluid w-100 h-100 object-fit-cover"
          loading="lazy"
        />
      </div>
    );
  }

  const displayPins = filteredPins.slice(0, 3); // Take up to 3 pins

  // Dynamic layout based on number of pins
  if (displayPins.length === 1) {
    return (
      <div
        className="board-image-container"
        style={{
          height: '200px',
          cursor: 'pointer',
          borderRadius: '12px',
          overflow: 'hidden'
        }}
        onClick={handleClick}
      >
        <img
          src={displayPins[0]?.video_urls || defaultImage}
          alt={board.name}
          className="img-fluid w-100 h-100 object-fit-cover"
          loading="lazy"
        />
      </div>
    );
  }

  if (displayPins.length === 2) {
    return (
      <div
        className="board-image-container"
        style={{
          height: '200px',
          display: 'flex',
          gap: '2px',
          cursor: 'pointer',
          borderRadius: '12px',
          overflow: 'hidden'
        }}
        onClick={handleClick}
      >
        <div style={{ flex: '1', overflow: 'hidden' }}>
          <img
            src={displayPins[0]?.video_urls || defaultImage}
            alt={board.name}
            className="img-fluid w-100 h-100 object-fit-cover"
            loading="lazy"
            style={{ borderRadius: '12px 0 0 12px' }}
          />
        </div>
        <div style={{ flex: '1', overflow: 'hidden' }}>
          <img
            src={displayPins[1]?.video_urls || defaultImage}
            alt={`${board.name} 2`}
            className="img-fluid w-100 h-100 object-fit-cover"
            loading="lazy"
            style={{ borderRadius: '0 12px 12px 0' }}
          />
        </div>
      </div>
    );
  }

  // Default case: 3 pins
  const mainImage = displayPins[0];
  const secondaryImages = displayPins.slice(1, 3);
  return (
    <div
      className="board-image-container"
      style={{
        height: '200px',
        display: 'flex',
        gap: '2px',
        cursor: 'pointer',
        borderRadius: '12px',
        overflow: 'hidden'
      }}
      onClick={handleClick}
    >
      <div style={{ flex: '1', overflow: 'hidden' }}>
        <img
          src={mainImage?.video_urls || defaultImage}
          alt={board.name}
          className="img-fluid w-100 h-100 object-fit-cover"
          loading="lazy"
          style={{ borderRadius: '12px 0 0 12px' }}
        />
      </div>
      <div style={{ flex: '0.5', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {secondaryImages.map((pin, index) => (
          <div key={index} style={{ height: '50%', overflow: 'hidden' }}>
            <img
              src={pin?.video_urls || defaultImage}
              alt={`${board.name} ${index + 1}`}
              className="img-fluid w-100 h-100 object-fit-cover"
              loading="lazy"
              style={{
                borderRadius: index === 0 ? '0 12px 0 0' : '0 0 12px 0'
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const PintrestProfile = () => {
  const [data, setData] = useState({});
  const [mediaList, setMediaList] = useState([]);
  const [boardPins, setBoardPins] = useState({});
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState("post");
  const [previousTab, setPreviousTab] = useState(null);
  const [selectedPost, setSelectedPost] = useState({});
  const [isChecked, setIsChecked] = useState(false);
  const [show, setShow] = useState(false);
  const [modifyMode, setModifyMode] = useState("add");
  const [editId, setEditId] = useState(null);
  const [isExpanded, setIsExpanded] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isApiCallInProgress, setIsApiCallInProgress] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();
  const PAGE_SIZE = 9;
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isFollowersModal, setIsFollowersModal] = useState(false);
  const [isFollowingModal, setIsFollowingModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Track fetched board IDs
  const [fetchedBoardIds, setFetchedBoardIds] = useState(new Set());
  const [hasFetchedInitialPins, setHasFetchedInitialPins] = useState(false); // New flag to track initial fetch

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        await userProfile();
        await fetchMediaList(activeTab, false);
      } catch (error) {
        console.error("Initial data fetch error:", error);
        triggerAlert("error", "Oops...", "Failed to load initial data");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []); // Runs only once on mount

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const activeTabFromUrl = params.get('active');
    const newTab = activeTabFromUrl || (location.state?.active) || 'post';
    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  }, [location, activeTab]);

  useEffect(() => {
    if (activeTab !== previousTab && !loading) {
      setMediaList([]);
      setCurrentPage(1);
      setHasMore(true);
      setInitialLoading(true);
      setPreviousTab(activeTab);
      setHasFetchedInitialPins(false); // Reset flag when tab changes
      fetchMediaList(activeTab, false);
    }
  }, [activeTab, previousTab, loading]);

  // Fetch board pins only once for the initial board list
  useEffect(() => {
    if (activeTab === "board" && mediaList.length > 0 && !hasFetchedInitialPins) {
      fetchAllBoardPins(mediaList);
      setHasFetchedInitialPins(true); // Mark as fetched
    }
  }, [mediaList, activeTab, hasFetchedInitialPins]);

  const userProfile = async () => {
    try {
      const response = await PintrestUserProfile();
      if (response.data.error_code === 200) {
        setData(response.data.results || {});
      } else {
        // Only trigger alert if error code is not 204
        if (response.data.error_code !== 204) {
          triggerAlert("error", "Oops...", response.data.message || "Failed to fetch profile data");
        }
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
      triggerAlert("error", "Oops...", "Failed to fetch profile data");
    }
  };

  const fetchMediaList = async (post_type, isLoadMore = false) => {
    if (isApiCallInProgress) return;
    setIsApiCallInProgress(true);

    if (!isLoadMore) {
      setMediaList([]);
      setInitialLoading(true);
      setCurrentPage(1);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const params = {
        post_type: post_type,
        page: isLoadMore ? currentPage + 1 : 1,
        page_size: PAGE_SIZE,
      };

      const response = await PintrestMediaList(params);
      const responseData = response?.data;
      console.log(`Media List Response (${post_type}):`, responseData); // Debug log

      if (responseData?.error_code === 200 || responseData.error_code === 204) {
        const newData = responseData.results.data || [];
        const totalPages = responseData.results.pagination?.total_pages || 1;
        setMediaList(prevData => isLoadMore ? [...prevData, ...newData] : newData);
        setCurrentPage(isLoadMore ? currentPage + 1 : 1);
        setHasMore(params.page < totalPages);
      }
    } catch (error) {
      console.error("Fetch media list error:", error);
      triggerAlert("error", "Oops...", error?.response?.data?.message || "Something went wrong!");
      setHasMore(false);
    } finally {
      setIsApiCallInProgress(false);
      setIsLoadingMore(false);
      setInitialLoading(false);
    }
  };


  const fetchAllBoardPins = async (boards) => {
    const boardIds = boards.map(board => board.id).filter(Boolean); // Use id instead of board_id
    const newBoardIds = boardIds.filter(id => !fetchedBoardIds.has(id)); // Only fetch new IDs
    if (newBoardIds.length === 0) return; // Skip if all IDs are already fetched

    const pinsData = {};

    try {
      const pinPromises = newBoardIds.map(async (id) => {
        try {
          const response = await boardpinslisting(id); // Use simple id (e.g., 1)
          console.log(`Pins Response for id ${id}:`, response.data); // Debug log
          if (response.data.error_code === 200 && response.data.results) {
            pinsData[id] = response.data.results || [];
          } else {
            pinsData[id] = [];
            console.warn(`No pins found for id ${id}`);
          }
          setFetchedBoardIds(prev => new Set(prev).add(id)); // Mark as fetched
        } catch (error) {
          console.error(`Error fetching pins for id ${id}:`, error);
          pinsData[id] = [];
          setFetchedBoardIds(prev => new Set(prev).add(id)); // Still mark as fetched to avoid retries
        }
      });

      await Promise.all(pinPromises);
      console.log("Fetched Pins Data:", pinsData); // Debug log
      setBoardPins(prev => ({ ...prev, ...pinsData }));
    } catch (error) {
      console.error("Fetch all board pins error:", error);
      triggerAlert("error", "Oops...", "Failed to load board pins");
    }
  };

  const handleAddBoard = () => {
    handleShow();
    setModifyMode("add");
    setEditId(null);
    setIsChecked(false);
    reset();
  };

  const handleEditBoard = (selectedPost) => {
    setModifyMode("edit");
    handleShow();
    setValue('name', selectedPost.name);
    setValue('description', selectedPost.description);
    setValue('privacy', selectedPost.privacy);
    setEditId(selectedPost.board_id); // Still use board_id for edit API
  };

  const createBoard = async (data) => {
    // Close the modal first before any API operations
    handleClose();

    setLoading(true);
    const secretMsg = isChecked ? "PROTECTED" : "PUBLIC";
    const payload = {
      name: data.name,
      description: data.description,
      privacy: secretMsg,
    };

    try {
      let response = modifyMode === "add"
        ? await pintrestBoardCreate(payload)
        : await pintrestBoardEdit(editId, payload);

      const responseData = response.data;
      const expectedCode = modifyMode === "add" ? 201 : 200;

      if (responseData && responseData.error_code === expectedCode) {
        triggerAlert('success', "", responseData?.message || `Board ${modifyMode === "add" ? "created" : "updated"} successfully`);
        fetchMediaList("board", false);
      } else {
        triggerAlert('error', 'Oops...', responseData?.message || "Failed to save board");
      }
    } catch (error) {
      console.error("Board creation/update error:", error);
      triggerAlert('error', 'Server Error', error.response?.data?.message || "Server encountered an error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    ConfirmationAlert('You want to delete this board?', 'Delete', async () => {
      setLoading(true);
      try {
        const response = await pintrestBoardDelete(id);
        if (response.status === 204 || (response.data && response.data.error_code >= 200 && response.data.error_code < 300)) {
          triggerAlert('success', "", response.data?.message || "Board deleted successfully");
          fetchMediaList("board", false);
        } else {
          triggerAlert('error', 'Delete Failed', "Failed to delete the board");
        }
      } catch (error) {
        console.error("Board delete error:", error);
        triggerAlert('error', 'Delete Failed', error.response?.data?.message || "Failed to delete the board");
      } finally {
        setLoading(false);
      }
    });
  };

  const handleActiveTab = (media_type) => {
    setActiveTab(media_type);
    const newParams = new URLSearchParams(location.search);
    newParams.set('active', media_type);
    navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
    fetchMediaList(media_type, false);
  };

  // Debounce function to limit how often handleLoadMore can be called
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const handleLoadMore = useCallback(
    debounce(async () => {
      if (!isLoadingMore && !isApiCallInProgress && hasMore) {
        console.log("Loading more data..."); // Debug log to confirm single call
        await fetchMediaList(activeTab, true);
      }
    }, 500), // 500ms debounce
    [isLoadingMore, isApiCallInProgress, hasMore, activeTab]
  );

  const handlePostClick = (item) => {
    if (item) {
      setSelectedVideo(item);
      setShowVideoModal(true);
    }
  };

  const handleBoardClick = (item) => {
    if (item) {
      setSelectedPost(item);
      navigate(`/pintrest_view/${item.id}`, { state: { boardItem: item } }); // Use id for routing
    }
  };

  const toggleExpanded = (id) => {
    setIsExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const renderContent = () => {
    if (initialLoading) {
      return <div className="row"><SkeletonLoader count={PAGE_SIZE} /></div>;
    }

    if (!initialLoading && !mediaList?.length) {
      return <NoDataMessage type={activeTab} />;
    }

    return (
      <InfiniteScrollWrapper
        className="row"
        dataLength={mediaList?.length || 0}
        next={handleLoadMore}
        hasMore={hasMore}
        loader={isLoadingMore && (
          <div className="col-12 text-center py-4">
            <Loader />
            <p className="mt-2">Loading more items...</p>
          </div>
        )}
        scrollThreshold={0.9} // Trigger closer to the bottom
        endMessage={mediaList.length > 0 && (
          <div className="col-12 text-center py-3">
            <p className="text-muted">No more items to load</p>
          </div>
        )}
      >
        {mediaList?.map((item) => (
          <div key={item.id} className="col-lg-4 col-md-6">
            <div className="user-images position-relative overflow-hidden mb-3">
              {activeTab === "post" && (
                <div onClick={() => handlePostClick(item)}>
                  <img
                    src={item.video_urls || "/assets/images/default-placeholder.png"} // Use video_url
                    className="img-fluid rounded w-100 h-100"
                    alt={item.title || "Post"}
                    loading="lazy"
                  />
                  <div className="image-hover-data">
                    <div className="product-elements-icon d-flex">
                      <ul className="d-flex align-items-center m-0 p-0 list-inline">
                        <li><a href="#" className="pe-3 text-white d-flex align-items-center">{item.likes || 0} <i className="material-symbols-outlined md-14 ms-1">thumb_up</i></a></li>
                        <li><a href="#" className="pe-3 text-white d-flex align-items-center">{item.dislikes || 0} <i className="material-symbols-outlined md-14 ms-1">thumb_down</i></a></li>
                      </ul>
                    </div>
                  </div>
                  <a href="#" className="image-edit-btn material-symbols-outlined md-16">fullscreen</a>
                </div>
              )}
              {activeTab === "video" && (
                <video
                  muted
                  className="w-100 h-100"
                  loop
                  src={item.video_urls || ""} // Use video_url
                  type="video/mp4"
                  height="265"
                  onClick={() => handlePostClick(item)}
                ></video>
              )}
              {activeTab === "board" && (
                <div className="col-lg-12 col-md-12 d-flex flex-column h-100 cursor-pointer">
                  <div className="user-images user-images-icon-play custom-border mb-0 d-flex flex-column h-100">
                    <BoardImageDisplay
                      board={item}
                      pins={boardPins[item.id] || []} // Use id
                      onClick={handleBoardClick}
                    />
                    <div className="w-100 p-2 d-flex flex-column flex-grow-1">
                      <ul className="notification-list m-0 p-0 w-100">
                        <li className="d-flex align-items-center justify-content-between w-100">
                          <div className="w-100">
                            <div className="d-flex justify-content-between align-items-center w-100">
                              <div className="ms-2 w-100">
                                <h6 className="fw-500">{item.name || "Untitled Board"}</h6>
                                {item.description && item.description.length > 25 ? (
                                  isExpanded[item.id] ? (
                                    <p className="mb-0" onClick={(e) => { e.stopPropagation(); toggleExpanded(item.id); }}>{item.description}</p>
                                  ) : (
                                    <p className="mb-0">{item.description.slice(0, 25)} <span className="cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleExpanded(item.id); }}>...</span></p>
                                  )
                                ) : (
                                  <p className="mb-0" onClick={(e) => e.stopPropagation()}>{item.description || "No description"}</p>
                                )}
                                <p className="mb-0">{item.privacy || "Public"}</p>
                              </div>
                              <div className="d-flex align-items-center">
                                <div className="card-header-toolbar d-flex align-items-center">
                                  <div className="dropdown" style={{ cursor: "pointer" }}>
                                    <div className="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button" onClick={(e) => e.stopPropagation()}>
                                      <span className="material-symbols-outlined">more_horiz</span>
                                    </div>
                                    <div className="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton">
                                      <a className="dropdown-item d-flex align-items-center" onClick={(e) => { e.stopPropagation(); handleEditBoard(item); }}>
                                        <span className="material-symbols-outlined me-2 md-18">edit</span>Edit
                                      </a>
                                      <a className="dropdown-item d-flex align-items-center" onClick={(e) => { e.stopPropagation(); handleDelete(item?.board_id); }}>
                                        <span className="material-symbols-outlined me-2 md-18">delete</span>Delete
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
              )}
            </div>
          </div>
        ))}
      </InfiniteScrollWrapper>
    );
  };

  return (
    <div>
      <div id="content-page" className="content-page">
        <div className="container">
          {loading ? (
            <div className="row">
              <div className="col-lg-12">
                <div className="card">
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col-lg-2 col-md-2">
                        <Skeleton circle={true} height={100} width={100} />
                      </div>
                      <div className="col-lg-10 col-md-10">
                        <Skeleton width="40%" height={30} />
                        <div className="row mt-3">
                          <div className="col-lg-12">
                            <Skeleton count={4} width="60%" height={20} />
                            <div className="row mt-3">
                              {Array(6).fill(0).map((_, idx) => (
                                <div key={idx} className="col">
                                  <Skeleton height={80} />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="row">
              <div className="col-lg-12">
                <div className="card">
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col-lg-2 col-md-2">
                        <div className="item1 ms-1 text-center">
                          <img
                            src={data.profile_image || "/assets/images/default-placeholder.png"}
                            className="img-fluid rounded-circle profile-image object-cover"
                            alt="profile-image"
                            loading="lazy"
                          />
                        </div>
                      </div>
                      <div className="col-lg-10 col-md-10">
                        <div className="d-flex justify-content-between">
                          <div className="item2">
                            <h4 className="text-info fw-bold">{data.business_name || "Business Name"}</h4>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-lg-12">
                            <div className="item5 mt-2">
                              <div className="d-flex align-items-center mb-2">
                                <span className="material-symbols-outlined md-18">account_circle</span>
                                <span className="ms-2">{data.username || "Username"}</span>
                              </div>
                              <div className="d-flex align-items-center mb-2">
                                <span className="material-symbols-outlined md-18">border_color</span>
                                <span className="ms-2">{data.about || "No about info"}</span>
                              </div>
                              <div className="d-flex align-items-center mb-2">
                                <span className="material-symbols-outlined md-18">link</span>
                                <span className="ms-2">
                                  <a href="#" className="fw-500 h6">{data.website_url || "No website"}</a>
                                </span>
                              </div>
                              <div className="d-flex align-items-center mb-2">
                                <span className="material-symbols-outlined md-18">schedule</span>
                                <span className="ms-2">{new Date().toLocaleDateString()} | {new Date().toLocaleTimeString()}</span>
                              </div>
                            </div>
                            <div className="row mt-3">
                              <div className="col">
                                <div className="card">
                                  <div className="card-body text-center p-2">
                                    <div className="item1 ms-1 text-center mb-2">
                                      <img src="https://takie.vitelglobal.com/websites/vitet-social-mediasync/assets/images/icon/pin-view-icon.png" className="img-fluid" alt="profile-image" loading="lazy" style={{ width: "40px" }} />
                                    </div>
                                    <h6 className="mt-1 fw-500 text-info">{data.monthly_views || "0"} <br /> Total View</h6>
                                  </div>
                                </div>
                              </div>
                              <div className="col" onClick={() => setIsFollowersModal(true)}>
                                <div className="card">
                                  <div className="card-body text-center p-2">
                                    <div className="item1 ms-1 text-center mb-2">
                                      <img src="https://takie.vitelglobal.com/websites/vitet-social-mediasync/assets/images/icon/pin-followers-icon.png" className="img-fluid" alt="profile-image" loading="lazy" style={{ width: "40px" }} />
                                    </div>
                                    <h6 className="mt-1 fw-500 text-info" style={{ cursor: 'pointer' }}>{data.follower_count || "0"} <br /> Followers</h6>
                                  </div>
                                </div>
                              </div>
                              {isFollowersModal && <Followers handlFollowersModalClose={() => setIsFollowersModal(false)} IsfollowersModal={isFollowersModal} />}
                              <div className="col" onClick={() => setIsFollowingModal(true)}>
                                <div className="card">
                                  <div className="card-body text-center p-2">
                                    <div className="item1 ms-1 text-center mb-2">
                                      <img src="https://takie.vitelglobal.com/websites/vitet-social-mediasync/assets/images/icon/pin-following-icon.png" className="img-fluid" alt="profile-image" loading="lazy" style={{ width: "40px" }} />
                                    </div>
                                    <h6 className="mt-1 fw-500 text-info" style={{ cursor: 'pointer' }}>{data.following_count || "0"} <br /> Following</h6>
                                  </div>
                                </div>
                              </div>
                              {isFollowingModal && <Following handleFollowingModalClose={() => setIsFollowingModal(false)} isFollowingModal={isFollowingModal} />}
                              <div className="col">
                                <div className="card">
                                  <div className="card-body text-center p-2">
                                    <div className="item1 ms-1 text-center mb-2">
                                      <img src="\assets\images\small\07.png" className="img-fluid" alt="profile-image" loading="lazy" style={{ width: "40px" }} />
                                    </div>
                                    <h6 className="mt-1 fw-500 text-info">{data.pin_count || "0"} <br /> Pins</h6>
                                  </div>
                                </div>
                              </div>
                              <div className="col">
                                <div className="card">
                                  <div className="card-body text-center p-2">
                                    <div className="item1 ms-1 text-center mb-2">
                                      <img src="\assets\images\small\07.png" className="img-fluid" alt="profile-image" loading="lazy" style={{ width: "40px" }} />
                                    </div>
                                    <h6 className="mt-1 fw-500 text-info">{data.board_count || "0"} <br /> Boards</h6>
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
              </div>
            </div>
          )}
          <div className="row">
            <div className="col-lg-12">
              <div className="card">
                <div className="card-header">
                  <div className="d-flex justify-content-between">
                    <ul className="nav nav-pills mb-3" id="pills-tab-1" role="tablist">
                      <li className="nav-item" role="presentation" onClick={() => handleActiveTab("post")}>
                        <a className={`nav-link ${activeTab === "post" ? "active" : ""}`} id="pills-home-tab-fill" data-bs-toggle="pill" href="#pills-home-filla" role="tab" aria-controls="pills-homea" aria-selected={activeTab === "post"}>Pins</a>
                      </li>
                      <li className="nav-item" role="presentation" onClick={() => handleActiveTab("video")}>
                        <a className={`nav-link ms-1 ${activeTab === "video" ? "active" : ""}`} id="pills-profile-tab-fill" data-bs-toggle="pill" href="#pills-profile-filla" role="tab" aria-controls="pills-profilea" aria-selected={activeTab === "video"}>Videos</a>
                      </li>
                      <li className="nav-item" role="presentation" onClick={() => handleActiveTab("board")}>
                        <a className={`nav-link ms-1 ${activeTab === "board" ? "active" : ""}`} id="pills-contact-tab-fill" data-bs-toggle="pill" href="#pills-contact-filla" role="tab" aria-controls="pills-contacta" aria-selected={activeTab === "board"}>Boards</a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="card-body">
                  {activeTab === "board" && (
                    <div className='d-flex justify-content-end me-1 mb-1'>
                      <button type="button" className="btn btn-primary" onClick={handleAddBoard}>Add to Board</button>
                    </div>
                  )}
                  <div className="tab-content" id="pills-tabContent-1">
                    <div className={`tab-pane fade ${activeTab === "post" ? "show active" : ""}`} id="pills-home-filla" role="tabpanel" aria-labelledby="pills-home-tab-filla">{renderContent()}</div>
                    <div className={`tab-pane fade ${activeTab === "video" ? "show active" : ""}`} id="pills-profile-filla" role="tabpanel" aria-labelledby="pills-profile-tab-fill">{renderContent()}</div>
                    <div className={`tab-pane fade ${activeTab === "board" ? "show active" : ""}`} id="pills-contact-filla" role="tabpanel" aria-labelledby="pills-contact-tab-fill">{renderContent()}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal show={show} onHide={handleClose} centered size="md" aria-labelledby="addToBoardModal">
        <Modal.Header closeButton>
          <Modal.Title id="addToBoardModal">{modifyMode === "add" ? "Create " : "Edit "}Board</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit(createBoard)}>
          <Modal.Body>
            <div className="mb-3">
              <Form.Group controlId="boardName">
                <Form.Label>Name of the Board</Form.Label>
                <Form.Control type="text" placeholder="enter board name" name="board_name" {...register("name", { required: "board name is required", maxLength: MaxLengthValidation(100) })} />
                {errors.name && <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>{errors.name.message}</div>}
              </Form.Group>
            </div>
            <div className="mb-3">
              <Form.Group controlId="boardDescription">
                <Form.Label>Description</Form.Label>
                <Form.Control as="textarea" placeholder="enter board description" name="board_description" {...register("description", { required: "board description is required", maxLength: MaxLengthValidation(300) })} />
                {errors.description && <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>{errors.description.message}</div>}
              </Form.Group>
            </div>
            <div className="mb-3">
              <Form.Label className="fw-500 mb-0">Secret</Form.Label>
              <Form.Check type="switch" id="secretSwitch" checked={isChecked} onChange={() => setIsChecked(!isChecked)} />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="warning" onClick={handleClose}>Cancel</Button>
            <Button variant="primary" type="submit">{modifyMode === "add" ? "Create" : "Update"}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <PinterestMedia
        show={showVideoModal}
        onHide={() => setShowVideoModal(false)}
        media={selectedVideo}
        activeTab={activeTab}
      />
    </div>
  );
};

export default PintrestProfile;