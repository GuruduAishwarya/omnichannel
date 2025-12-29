import React, { useEffect, useState, useRef } from "react";
import {
  SubUserList,
  MediaListData,
  getInstaComments,
  deleteInstaComment,
  postInstaComment,
  postInstaReply,
  MediaListComments,
  InstagramReplyCommentDelete,
} from "../../utils/ApiClient";
import {
  truncateName,
  triggerAlert,
  formatCount,
  formatTimeToAmandPM,
  get_user_menu_permission,
  isCustomerUser
} from "../../utils/CommonFunctions";
import { getMenuId } from "../../utils/Constants";
import Loader from "../../common/components/Loader";
import { Modal, ProgressBar } from "react-bootstrap";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import "./InstagramStoryPost.css";
import { useForm } from "react-hook-form";
import Emojis from "../../common/components/Emojis";
import ImageLazyLoading from "../../common/components/ImageLazyLoading";
import InfiniteScrollWrapper from "../../common/components/InfinityScrollWrapper";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function Instagram() {
  const {
    register: registerComment,
    handleSubmit: handleSubmitComment,
    formState: { errors: errorsComment },
    setValue: setValueComment,
    reset: resetComment,
    control: controlComment,
    getValues: getValuesComment,
    watch: watchComment,
    setError: setErrorComment,
    clearErrors: clearErrorsComment,
  } = useForm();

  const [mediaData, setMediaData] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [userData, setUserData] = useState({});
  const [isLoadingPosts, setLoadingPosts] = useState(false);
  const [isLoadingMedia, setLoadingMedia] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [showEmojis, setShowEmojis] = useState(false);
  const [hasMoreContacts, setHasMoreContacts] = useState(true);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);
  const [isLoadingComments, setLoadingComments] = useState(false);
  const [selectedPost, setSelectedPost] = useState("");
  const userID = "17841464028464664";
  const token =
    "EAAFZBkHk1F7cBOxNdLxwae8IdFRBso26psWeCxdNRqY2tz2H5q8hQj7RLWUEt2dq3vwveF0ZAAx9QEQyZBa29vKK5kuJF4gHe4CKv2ZA0ZAW7v2gorLcy8UTSJMm2ebtBZAxAfhN6KjxE1FREwFrsN6tQLsVrjoDXWhJlrFGd5jYvZAj54SRdXL1rpwQTm5qgWgSW2x7xKL";
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [replyInfo, setReplyInfo] = useState({});
  const [comments, setComments] = useState([]);
  const [isCommentHovered, setIsCommentHovered] = useState(null);
  const [isReplyHovered, setIsReplyHovered] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const [pageNumber, setPageNumber] = useState(1);
  const [totalNumberPages, setTotalNumberPages] = useState(0);
  const [loadingMoreContacts, setLoadingMoreContacts] = useState(false);
  const contactsContainerRef = useRef(null);
  const mediaPageLimit = 9;
  const [pageNumberComments, setPageNumberComments] = useState(1);
  const [totalNumberPagesComments, setTotalNumberPagesComments] = useState(0);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const storyDuration = 5000;
  const progressUpdateInterval = 260;

  const [showFullTitle, setShowFullTitle] = useState(false);

  const toggleTitleDisplay = () => {
    setShowFullTitle(!showFullTitle);
  };

  const truncateTitle = (title, wordLimit, charLimit) => {
    if (!title) return { truncated: "", isTruncated: false };
    const words = title.split(" ");
    if (words.length > wordLimit || title.length > charLimit) {
      return {
        truncated: words.slice(0, wordLimit).join(" ") + "...",
        isTruncated: true,
      };
    }
    return { truncated: title, isTruncated: false };
  };

  const handleShowCommentModal = () => {
    setShowCommentModal(true);
  };

  const closeCommentModal = () => {
    setShowCommentModal(false);
    handleCloseReply();
    setErrorMessage(null); // Clear any existing error message
    setComments([]); // Reset comments
    setSelectedPost(""); // Reset selected post
  };

  const workspaceId = localStorage.getItem('workspace_id');

  // Add permission state variables
  const [viewPermission, setViewPermission] = useState(true); // Default to true
  const [addPermission, setAddPermission] = useState(false);
  const [editPermission, setEditPermission] = useState(false);
  const [deletePermission, setDeletePermission] = useState(false);
  const [exportPermission, setExportPermission] = useState(false);

  // Function to fetch sub-user data
  const fetchSubUser = async () => {
    if (!workspaceId) {
      return;
    }

    try {
      const response = await SubUserList(workspaceId);
      const response_data = response.data;
      if (response_data.error_code === 200) {
        const stories = response_data.results?.stories?.data;
        setUserData(response_data.results);
        setProfiles(stories.reverse());
      } else {
        console.error("Error fetching data:", response_data.message);
      }
    } catch (error) {
      console.error("Error fetching sub-user data:", error);
    }
  };

  useEffect(() => {
    if (showModal && profiles.length > 0) {
      startStoryProgress();
    } else {
      stopStoryProgress();
    }
    return () => stopStoryProgress();
  }, [showModal, currentStoryIndex]);

  const startStoryProgress = () => {
    stopStoryProgress();
    setProgress(0);

    intervalRef.current = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          nextStory();
          return 0;
        }
        return prevProgress + 100 / (storyDuration / progressUpdateInterval);
      });
    }, progressUpdateInterval);
  };

  const stopStoryProgress = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const nextStory = () => {
    if (currentStoryIndex < profiles.length - 1) {
      setCurrentStoryIndex((prevIndex) => prevIndex + 1);
      setProgress(0);
    } else {
      setShowModal(false);
    }
  };

  const prevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prevIndex) => prevIndex - 1);
      setProgress(0);
    }
  };

  const showLeftArrow = currentStoryIndex > 0;
  const showRightArrow = currentStoryIndex < profiles.length - 1;

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const perPageLimit = 9;

  const fetchImageList = async (media_type, page = 1, title = " ") => {
    if (page === 1) {
      setLoadingPosts(true);
    } else {
      setIsLoadingMore(true);
    }
    if (!workspaceId) {
      return;
    }
    try {
      const params = {
        post_type: media_type,
        page: page,
        page_size: perPageLimit,
        title: title,
      };
      const response = await MediaListData(params, workspaceId);
      const response_data = response.data;
      if (response_data.error_code === 200) {
        const data = response_data.results.data;
        const total_items = response_data.results.pagination.total_pages;
        setTotalNumberPages(total_items);

        if (page === 1) {
          setMediaData(data);
        } else {
          setMediaData(prevData => [...prevData, ...data]);
        }

        setHasMoreContacts(page < total_items);
        return data;
      } else {
        setMediaData([]);
        setHasMoreContacts(false);
      }
    } catch (error) {
      console.error("Error fetching media data:", error);
      setMediaData([]);
      setHasMoreContacts(false);
    } finally {
      setLoadingPosts(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchImageList("post");
    fetchSubUser();

    // Debug logs for permission checking
    console.log("DEBUG - Permission Check Starting");
    console.log("DEBUG - Is Customer User:", isCustomerUser());

    // Fix: Use instagram menu ID instead of profile
    const menu_id = getMenuId("instagram", "profile");
    console.log("DEBUG - Menu ID:", menu_id);

    if (isCustomerUser()) {
      // Customers have full access
      console.log("DEBUG - User is a customer, granting full permissions");
      setViewPermission(true);
      setAddPermission(true);
      setEditPermission(true);
      setDeletePermission(true);
      setExportPermission(true);
    } else {
      // Sub-users follow permission system
      console.log("DEBUG - User is a sub-user, checking specific permissions");
      const viewPerm = get_user_menu_permission(menu_id, 'view');
      const addPerm = get_user_menu_permission(menu_id, 'add');
      const editPerm = get_user_menu_permission(menu_id, 'edit');
      const deletePerm = get_user_menu_permission(menu_id, 'delete');
      const exportPerm = get_user_menu_permission(menu_id, 'export');

      console.log("DEBUG - View Permission:", viewPerm);
      console.log("DEBUG - Add Permission:", addPerm);
      console.log("DEBUG - Edit Permission:", editPerm);
      console.log("DEBUG - Delete Permission:", deletePerm);
      console.log("DEBUG - Export Permission:", exportPerm);

      setViewPermission(viewPerm);
      setAddPermission(addPerm);
      setEditPermission(editPerm);
      setDeletePermission(deletePerm);
      setExportPermission(exportPerm);
    }
    console.log("DEBUG - Permission Check Complete");
  }, []);

  const handleTabClick = (media_type) => {
    handleCloseReply();
    setActiveTab(media_type);
    setMediaData([]);
    setPageNumber(1);
    fetchImageList(media_type === "posts" ? "post" : "reel", 1);
  };

  const handlePostClick = (item) => {
    if (item) {
      setComments([]); // Reset comments
      setSelectedPost(item);
      handleShowCommentModal();
    }
  };

  const getComments = async (imgId) => {
    if (!imgId || !viewPermission) return; // Check for view permission
    setLoadingComments(true);

    try {
      const params = {
        image_Id: imgId,
      };

      const response = await getInstaComments(params);
      const response_data = response.data;

      if (response_data.error_code === 200) {
        const data = response_data.results.comments;
        setComments(data);
        setLoadingComments(false);
      } else {
        setComments([]);
        setLoadingComments(false);
      }
    } catch (error) {
      console.error("Error fetching media data:", error);
      const error_msg = error?.response?.data?.message;
      setComments([]);
      setLoadingComments(false);
      triggerAlert("error", "Oops..", error_msg || "Something went wrong");
    } finally {
      setLoadingComments(false);
    }
  };

  const organizeComments = (commentsArray) => {
    const mainComments = [];
    const replyMap = new Map();

    commentsArray.forEach(comment => {
      if (comment.reply) {
        const parentId = comment.parent_id || comment.reply_to;
        if (!replyMap.has(parentId)) {
          replyMap.set(parentId, []);
        }
        replyMap.get(parentId).push(comment);
      } else {
        mainComments.push(comment);
      }
    });

    return mainComments.map(comment => ({
      ...comment,
      replies: replyMap.get(comment.parentId) || []
    }));
  };

  const postCommentOrReply = async (data) => {
    // Check for add permission before attempting to post
    if (!addPermission) {
      setErrorMessage("You don't have permission to add comments");
      hideErrorAfterDelay();
      return;
    }

    setLoadingComments(true);
    setErrorMessage(null);

    try {
      const params = {
        reply_id: replyInfo?.id ? replyInfo?.id : selectedPost?.image_id,
      };

      const api_call = replyInfo?.id
        ? postInstaReply(params, data)
        : postInstaComment(params, data);

      const response = await api_call;
      const response_data = response.data;
      const successCode = replyInfo?.id ? 201 : 200;
      if (response_data.error_code === successCode) {
        setShowFullTitle(false);
        await fetchMediaListComment(selectedPost?.image_id);
        handleCloseReply();
        resetComment();
      } else {
        setErrorMessage(response_data.message || "Failed to post comment/reply.");
        hideErrorAfterDelay();
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      setErrorMessage("Failed to post comment/reply.");
      hideErrorAfterDelay();
    } finally {
      setLoadingComments(false);
    }
  };

  const deleteComment = async (commentId) => {
    // Check for delete permission before attempting to delete
    if (!deletePermission) {
      setErrorMessage("You don't have permission to delete comments");
      hideErrorAfterDelay();
      return;
    }

    if (!commentId) return;
    setLoadingComments(true);
    setErrorMessage(null);

    try {
      const params = {
        comment_id: commentId,
      };

      const response = await deleteInstaComment(params);
      const response_data = response.data;

      if (response_data.error_code === 200) {
        setComments((prevComments) => {
          const updatedComments = prevComments.filter(
            (comment) => comment.comment_id !== commentId
          );

          return updatedComments.map((comment) => {
            if (comment.replies) {
              comment.replies = comment.replies.filter(
                (reply) => reply.comment_id !== commentId
              );
            }
            return comment;
          });
        });
      } else {
        setErrorMessage(response_data.message || "Failed to delete comment.");
        hideErrorAfterDelay();
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      setErrorMessage("Failed to delete comment.");
      hideErrorAfterDelay();
    } finally {
      setLoadingComments(false);
    }
  };

  const deleteReplyComment = async (replyId, replyToId) => {
    // Check for delete permission before attempting to delete
    if (!deletePermission) {
      setErrorMessage("You don't have permission to delete replies");
      hideErrorAfterDelay();
      return;
    }

    if (!replyId) return;
    setLoadingComments(true);
    setErrorMessage(null);

    try {
      const response = await InstagramReplyCommentDelete(replyToId);
      const response_data = response.data;

      if (response_data.error_code === 200) {
        setComments(prevComments =>
          prevComments.map(comment => {
            if (comment.replies) {
              return {
                ...comment,
                replies: comment.replies.filter(reply => reply.reply_id !== replyToId)
              };
            }
            return comment;
          })
        );
      } else {
        setErrorMessage(response_data.message || "Failed to delete reply.");
        hideErrorAfterDelay();
      }
    } catch (error) {
      console.error("Error deleting reply:", error);
      setErrorMessage("Failed to delete reply.");
      hideErrorAfterDelay();
    } finally {
      setLoadingComments(false);
    }
  };

  const hideErrorAfterDelay = () => {
    setTimeout(() => setErrorMessage(null), 5000);
  };

  const handleCommentReply = async (replyId, userName, replyMessage) => {
    // Check for add permission before allowing reply
    if (!addPermission) {
      setErrorMessage("You don't have permission to reply to comments");
      hideErrorAfterDelay();
      return;
    }

    const replyInfo = {
      id: replyId,
      name: userName,
      message: replyMessage,
    };
    setReplyInfo(replyInfo);
    setValueComment("message", "");
  };

  const handleCloseReply = () => {
    setReplyInfo({});
    resetComment();
    setShowEmojis(false);
  };

  const handleEmojiSelect = (emoji) => {
    const currentMessage = watchComment("message") || "";
    setValueComment("message", currentMessage + emoji);
  };

  const toggleDropdown = (id) => {
    setOpenDropdownId((prevId) => (prevId === id ? null : id));
  };

  const handleFetchMoreContacts = async () => {
    if (!isLoadingMore && hasMoreContacts) {
      const nextPage = Math.ceil(mediaData.length / perPageLimit) + 1;
      await fetchMoreContacts(nextPage);
    }
  };

  const fetchMoreContacts = async (nextPage) => {
    try {
      await fetchImageList(
        activeTab === "posts" ? "post" : "reel",
        nextPage
      );
      setPageNumber(nextPage);
    } catch (error) {
      console.error("Error fetching more contacts:", error);
    }
  };

  const fetchMediaListComment = async (imgId, page = 1) => {
    if (!imgId) {
      console.warn("No image ID provided");
      return;
    }

    setLoadingComments(true);

    try {
      const params = {
        page_number: page,
        page_size: 10,
      };

      const response = await MediaListComments(imgId, params);
      const response_data = response.data;

      if (response_data.error_code === 200) {
        const data = response_data.results.data;
        const total_pages = response_data.results.pagination.total_pages;
        setTotalNumberPagesComments(total_pages);

        if (page === 1) {
          setComments(data);
        } else {
          setComments((prevComments) => [...prevComments, ...data]);
        }
        return data;
      } else {
        console.warn("Error code is not 200:", response_data.error_code);
        return [];
      }
    } catch (error) {
      console.error("Error fetching media data:", error);
      return [];
    } finally {
      setLoadingComments(false);
    }
  };

  const fetchMoreComments = async () => {
    const nextPageNumber = pageNumberComments + 1;

    const nextPageComments = await fetchMediaListComment(
      selectedPost?.image_id,
      nextPageNumber
    );
    if (Array.isArray(nextPageComments)) {
      setPageNumberComments(nextPageNumber);
    } else {
      console.error("Fetched data is not an array:", nextPageComments);
    }
  };

  const handleFetchMoreComments = async () => {
    if (pageNumberComments < totalNumberPagesComments) {
      await fetchMoreComments();
    } else {
      setHasMoreComments(false);
    }
  };

  useEffect(() => {
    if (showCommentModal && selectedPost?.image_id) {
      fetchMediaListComment(selectedPost.image_id);
    }
  }, [showCommentModal]);

  const noDataMessages = {
    posts: {
      icon: 'photo_library',
      title: 'No Posts Available',
      description: 'There are no posts uploaded yet. Posts will appear here once they are added.'
    },
    reels: {
      icon: 'movie',
      title: 'No Reels Available',
      description: 'There are no reels uploaded yet. Reels will appear here once they are added.'
    },
    comments: {
      icon: 'comment',
      title: 'No Comments Yet',
      description: 'Be the first to comment on this post.'
    }
  };

  const renderNoData = (type) => {
    const { icon, title, description } = noDataMessages[type];
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

  const renderContent = () => {
    if (isLoadingPosts) {
      return <Loader />;
    }

    if (!mediaData?.length) {
      return renderNoData(activeTab === "posts" ? "posts" : "reels");
    }

    return (
      <InfiniteScrollWrapper
        className="row"
        dataLength={mediaData.length}
        next={handleFetchMoreContacts}
        hasMore={hasMoreContacts}
        loader={
          <div className="col-12 text-center p-3">
            <Loader />
          </div>
        }
        endMessage={
          <div className="col-12 text-center p-3">
            <p>No more items to load</p>
          </div>
        }
      >
        {mediaData.map((item) => (
          <div
            className="col-lg-4 col-md-6"
            key={item.image_id}
          >
            <div className="user-images rounded position-relative overflow-hidden mb-3">
              <a
                href="#/"
                className="stretched-link"
                onClick={() => handlePostClick(item)}
              >
                {activeTab === "posts" ? (
                  <ImageLazyLoading
                    src={item.image_urls}
                    effect="blur"
                    alt="photo-profile"
                    width="100%"
                    height="330"
                    onClick={() => handlePostClick(item)}
                    style={{
                      objectFit: "cover",
                      borderRadius: "5px",
                      filter: "blur(10px)",
                      transition: "filter 0.5s ease-in-out"
                    }}
                    onLoad={(e) => e.target.style.filter = "blur(0)"}
                  />
                ) : (
                  <div className="video-wrapper" style={{ height: "330px" }}>
                    <video
                      style={{
                        objectFit: "cover",
                        width: "100%",
                        height: "100%"
                      }}
                      controls
                      controlsList="nodownload"
                      preload="metadata"
                      onError={(e) => console.error("Video playback error:", e)}
                    >
                      <source src={item.image_urls} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
              </a>
              <div className="image-hover-data">
                <div className="product-elements-icon">
                  <ul className="d-flex align-items-center m-0 p-0 list-inline">
                    <li>
                      <a
                        href="#/"
                        className="pe-3 text-white d-flex align-items-center"
                      >
                        {item.title
                          ? truncateName(item.title, 40)
                          : "-"}
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </InfiniteScrollWrapper>
    );
  };

  const renderComments = () => {
    if (isLoadingComments) {
      return <Loader />;
    }

    if (!comments?.length) {
      return renderNoData("comments");
    }

    return (
      <InfiniteScrollWrapper
        className="row"
        dataLength={comments.length}
        next={handleFetchMoreComments}
        hasMore={hasMoreComments}
        inverse={false}
        scrollableTarget="scrollableDivComments"
      >
        {comments.map((comment) => (
          <div key={comment.comment_id}>
            <div className="d-flex justify-content-between">
              <div className="me-2">
                <img
                  src="/assets/images/icon-7797704_1280.png"
                  alt="userimg"
                  className="avatar-40 rounded-circle img-fluid"
                  loading="lazy"
                />
              </div>
              <div className="w-100 text-margin">
                <div className="">
                  <p className="mb-0 font-13">{comment.comments}</p>
                  <small className=" d-flex align-items-center "> <i className="material-symbols-outlined md-14 me-1">
                    schedule
                  </i> {comment.created_at ? formatTimeToAmandPM(comment.created_at) : '-'}</small>
                  <div className="d-flex justify-content-between align-items-center flex-wrap">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center me-3">
                        {/* Only show Reply button if add permission exists */}
                        {addPermission && (
                          <a
                            href="#/"
                            onClick={() => handleCommentReply(comment.comment_id, comment.user_id, comment.comments)}
                          >
                            <span className="card-text-1">Reply</span>
                          </a>
                        )}
                        {/* Only show Delete button if delete permission exists */}
                        {deletePermission && (
                          <a
                            href="#/"
                            onClick={(e) => {
                              e.preventDefault();
                              deleteComment(comment.comment_id);
                            }}
                            className="ms-3"
                          >
                            <span className="card-text-1">Delete</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {comment.replies && comment.replies.length > 0 && (
              <div className="ms-5">
                {comment.replies.map((reply) => (
                  <div key={reply.comment_id} className="d-flex justify-content-between mt-2">
                    <div className="me-2">
                      <img
                        src="/assets/images/icon-7797704_1280.png"
                        alt="userimg"
                        className="avatar-30 rounded-circle img-fluid"
                        loading="lazy"
                      />
                    </div>
                    <div className="w-100 text-margin">
                      <div className="">
                        <p className="mb-0 font-13">{reply.comments}</p>
                        <small className=" d-flex align-items-center "> <i className="material-symbols-outlined md-14 me-1">
                          schedule
                        </i> {reply.created_at ? formatTimeToAmandPM(reply.created_at) : '-'}</small>
                        <div className="d-flex justify-content-between align-items-center flex-wrap">
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center me-3">
                              {/* Only show Delete reply button if delete permission exists */}
                              {deletePermission && (
                                <a
                                  href="#/"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    deleteReplyComment(reply.comment_id, reply.reply_id);
                                  }}
                                  className="ms-3"
                                >
                                  <span className="card-text-1">Delete</span>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </InfiniteScrollWrapper>
    );
  };

  // Conditionally render comment form based on permissions
  const renderCommentForm = () => {
    if (!addPermission) {
      return (
        <div className="card-footer px-3 py-3 border-top rounded-0">
          <div className="text-center text-muted">
            You don't have permission to post comments
          </div>
        </div>
      );
    }

    return (
      <div className="card-footer px-3 py-3 border-top rounded-0">
        <div className="d-flex align-items-center">
          <div className="flex-shrink-0">
            <img
              src="/assets/images/icon-7797704_1280.png"
              alt="userimg"
              className="avatar-40 rounded-circle img-fluid"
              loading="lazy"
            />
          </div>
          <input
            type="text"
            className="form-control me-2 ms-2"
            placeholder="Type your message"
            name="message"
            {...registerComment("message", {
              required: "Message is required",
            })}
          />
          <div className="chat-attachment position-relative">
            <a
              href="#/"
              className="d-flex align-items-center pe-3"
              onClick={() => setShowEmojis(!showEmojis)}
            >
              <svg
                className="icon-24"
                width="24"
                viewBox="0 0 24 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_156_599)">
                  <path
                    d="M20.4853 4.01473C18.2188 1.74823 15.2053 0.5 12 0.5C8.79469 0.5 5.78119 1.74823 3.51473 4.01473C1.24819 6.28119 0 9.29469 0 12.5C0 15.7053 1.24819 18.7188 3.51473 20.9853C5.78119 23.2518 8.79469 24.5 12 24.5C15.2053 24.5 18.2188 23.2518 20.4853 20.9853C22.7518 18.7188 24 15.7053 24 12.5C24 9.29469 22.7518 6.28119 20.4853 4.01473ZM12 23.0714C6.17091 23.0714 1.42856 18.3291 1.42856 12.5C1.42856 6.67091 6.17091 1.92856 12 1.92856C17.8291 1.92856 22.5714 6.67091 22.5714 12.5C22.5714 18.3291 17.8291 23.0714 12 23.0714Z"
                    fill="currentcolor"
                  ></path>
                  <path
                    d="M9.40398 9.3309C8.23431 8.16114 6.33104 8.16123 5.16136 9.3309C4.88241 9.60981 4.88241 10.0621 5.16136 10.3411C5.44036 10.62 5.89266 10.62 6.17157 10.3411C6.78432 9.72836 7.78126 9.7284 8.39392 10.3411C8.53342 10.4806 8.71618 10.5503 8.89895 10.5503C9.08171 10.5503 9.26457 10.4806 9.40398 10.3411C9.68293 10.0621 9.68293 9.60986 9.40398 9.3309Z"
                    fill="currentcolor"
                  ></path>
                  <path
                    d="M18.8384 9.3309C17.6688 8.16123 15.7655 8.16114 14.5958 9.3309C14.3169 9.60981 14.3169 10.0621 14.5958 10.3411C14.8748 10.62 15.3271 10.62 15.606 10.3411C16.2187 9.72836 17.2156 9.72831 17.8284 10.3411C17.9679 10.4806 18.1506 10.5503 18.3334 10.5503C18.5162 10.5503 18.699 10.4806 18.8384 10.3411C19.1174 10.0621 19.1174 9.60986 18.8384 9.3309Z"
                    fill="currentcolor"
                  ></path>
                  <path
                    d="M18.3335 13.024H5.6668C5.2723 13.024 4.95251 13.3438 4.95251 13.7383C4.95251 17.6243 8.11409 20.7859 12.0001 20.7859C15.8862 20.7859 19.0477 17.6243 19.0477 13.7383C19.0477 13.3438 18.728 13.024 18.3335 13.024ZM12.0001 19.3573C9.14366 19.3573 6.77816 17.215 6.42626 14.4525H17.574C17.2221 17.215 14.8566 19.3573 12.0001 19.3573Z"
                    fill="currentcolor"
                  ></path>
                </g>
                <defs>
                  <clipPath>
                    <rect
                      width="24"
                      height="24"
                      fill="white"
                      transform="translate(0 0.5)"
                    ></rect>
                  </clipPath>
                </defs>
              </svg>
            </a>
            {showEmojis && (
              <Emojis
                onEmojiSelect={handleEmojiSelect}
                pickerSize={{ height: 330, width: 240 }}
                style={{
                  position: "absolute",
                  bottom: "38px",
                  right: "-3em",
                }}
              />
            )}
          </div>
          <button
            type="submit"
            className="btn btn-primary d-flex align-items-center"
          >
            <svg
              className="icon-20"
              width="18"
              viewBox="0 0 20 21"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.8325 6.67463L8.10904 12.4592L1.59944 8.38767C0.66675 7.80414 0.860765 6.38744 1.91572 6.07893L17.3712 1.55277C18.3373 1.26963 19.2326 2.17283 18.9456 3.142L14.3731 18.5868C14.0598 19.6432 12.6512 19.832 12.0732 18.8953L8.10601 12.4602"
                stroke="currentcolor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
          </button>
        </div>
        {errorsComment.message && (
          <div
            style={{
              color: "red",
              fontSize: "14px",
              marginTop: "5px",
            }}
          >
            {errorsComment.message.message}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div>
        <div className="position-relative"></div>
        <div id="content-page" className="content-page">
          <div
            className="container"
          >
            <div className="row">
              <div className="col-lg-12">
                <div className="card">
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col-lg-2 col-md-2">
                        <div className="item1 ms-1 text-center">
                          {userData.profile_picture_url ? (
                            <img
                              src={userData.profile_picture_url}
                              className={"img-fluid rounded-circle avatar-200"}
                              alt="profile"
                              style={{
                                cursor: "pointer",
                                objectFit: "cover",
                                boxShadow:
                                  profiles.length > 0
                                    ? "0 0 10px rgba(0,123,255,0.5)"
                                    : "0 0 10px rgba(108,117,125,0.5)",
                                transition: "box-shadow 0.5s ease-in-out",
                                backgroundColor: "#ffba68",
                                padding: profiles.length > 0 ? "4px" : "0px",
                                borderRadius: "50%",
                              }}
                              onClick={() => {
                                if (profiles.length > 0) {
                                  setShowModal(true);
                                  setCurrentStoryIndex(0);
                                  setProgress(0);
                                }
                              }}
                            />
                          ) : (
                            <Skeleton circle={true} height={170} width={170} />
                          )}
                        </div>
                      </div>
                      <div className="col-lg-10 col-md-10">
                        <div className="d-flex justify-content-between">
                          <div className="item2">
                            <h4 className="text-info fw-bold">
                              {userData.username ? userData.username : <Skeleton width={150} />}
                            </h4>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-lg-12">
                            <div className="item5 mt-2">
                              <div className="d-flex align-items-center mb-2">
                                <span className="material-symbols-outlined md-18">
                                  account_circle
                                </span>
                                <span className="ms-2">
                                  {userData.name ? userData.name : <Skeleton width={150} />}
                                </span>
                              </div>
                              <div className="d-flex align-items-center mb-2">
                                <span className="material-symbols-outlined md-18">
                                  border_color
                                </span>
                                <span className="ms-2">
                                  {userData.biography ? userData.biography : <Skeleton width={200} />}
                                </span>
                              </div>
                            </div>
                            <div className="row mt-1">
                              <div className="col-auto">
                                <div className="card" style={{ width: "200px" }}>
                                  <div className="card-body text-center p-2">
                                    <div className="item1 ms-1 text-center mb-2">
                                      <img
                                        src="https://cdn-icons-png.flaticon.com/128/5978/5978105.png"
                                        className="img-fluid"
                                        alt="profile-image"
                                        loading="lazy"
                                        style={{ width: "30px" }}
                                      />
                                    </div>
                                    <h6 className="mt-1 fw-bold text-info" style={{ fontSize: "13px" }}>
                                      {userData?.media_count !== undefined ? formatCount(userData?.media_count || 0) : "0"}
                                      <br /> Total Post
                                    </h6>

                                  </div>
                                </div>
                              </div>

                              <div className="col-auto">
                                <div className="card" style={{ width: "200px" }}>
                                  <div className="card-body text-center p-2">
                                    <div className="item1 ms-1 text-center mb-2">
                                      <img
                                        src="https://cdn-icons-png.flaticon.com/128/166/166258.png"
                                        className="img-fluid"
                                        alt="profile-image"
                                        loading="lazy"
                                        style={{ width: "30px" }}
                                      />
                                    </div>
                                    <h6 className="mt-1 fw-bold text-info" style={{ fontSize: "13px" }}>
                                      {userData?.followers_count !== undefined ? formatCount(userData?.followers_count || 0) : "0"}
                                      <br />Followers
                                    </h6>
                                  </div>
                                </div>
                              </div>

                              <div className="col-auto">
                                <div className="card" style={{ width: "200px" }}>
                                  <div className="card-body text-center p-2">
                                    <div className="item1 ms-1 text-center mb-2">
                                      <img
                                        src="https://cdn-icons-png.flaticon.com/128/4907/4907500.png"
                                        className="img-fluid"
                                        alt="profile-image"
                                        loading="lazy"
                                        style={{ width: "30px" }}
                                      />
                                    </div>
                                    <h6 className="mt-1 fw-bold text-info" style={{ fontSize: "13px" }}>
                                      {userData?.follows_count !== undefined ? formatCount(userData?.follows_count || 0) : "0"}
                                      <br />Following
                                    </h6>
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
            <div className="row">
              <div className="col-lg-12">
                <div className="card">
                  <div className="card-header">
                    <div className="d-flex justify-content-between">
                      <ul className="nav nav-pills mb-3" id="pills-tab-1" role="tablist">
                        <li className="nav-item" role="presentation">
                          <a
                            className={`nav-link ${activeTab === "posts" ? "active" : ""}`}
                            id="pills-home-tab-fill"
                            data-bs-toggle="pill"
                            href="#pills-home-filla"
                            role="tab"
                            aria-controls="pills-homea"
                            aria-selected={activeTab === "posts"}
                            onClick={() => handleTabClick("posts")}
                          >
                            Posts
                          </a>
                        </li>
                        <li className="nav-item" role="presentation">
                          <a
                            className={`nav-link ${activeTab === "reels" ? "active" : ""}`}
                            id="pills-profile-tab-fill"
                            data-bs-toggle="pill"
                            href="#pills-home-filla"
                            role="tab"
                            aria-controls="pills-profilea"
                            aria-selected={activeTab === "reels"}
                            onClick={() => handleTabClick("reels")}
                          >
                            Reels
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="card-body">
                    <div id="scrollableDivContacts">
                      <div className="tab-content" id="pills-tabContent-1">
                        <div
                          className="tab-pane fade show active"
                          id="pills-home-filla"
                          role="tabpanel"
                          aria-labelledby="pills-home-tab-filla"
                        >
                          {isLoadingPosts ? (
                            <div>
                              <Skeleton count={5} height={50} />
                            </div>
                          ) : (
                            renderContent()
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
        show={showCommentModal}
        onHide={closeCommentModal}
        backdrop="static"
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title>Comments</Modal.Title>
        </Modal.Header>
        <form
          id="creditCardForm"
          className="g-3 fv-plugins-bootstrap5 fv-plugins-framework fv-plugins-icon-container"
          noValidate="novalidate"
          onSubmit={handleSubmitComment(postCommentOrReply)}
        >
          <Modal.Body>
            <div className="row g-3 ">
              <div className="col-md-12 col-lg-7 social-post">
                <div className="card card-insta">
                  <div className="card-body">
                    <div className="text-center insta-post-image-bg">
                      {activeTab === "posts" ? (
                        <ImageLazyLoading
                          src={selectedPost?.image_urls}
                          effect="blur"
                          alt="post-image"
                          wrapperClassName="img-fluid rounded w-100"
                          style={{
                            objectFit: "cover",
                            borderRadius: "5px",
                            filter: "blur(10px)",
                            transition: "filter 0.5s ease-in-out"
                          }}
                          onLoad={(e) => e.target.style.filter = "blur(0)"}
                        />
                      ) : (
                        <video style={{ objectFit: "cover" }}
                          width="100%"
                          height="679"
                          controls
                          controlsList="nodownload"
                        >
                          <source
                            src={selectedPost?.image_urls}
                            type="video/mp4"
                          />
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-12 col-lg-5">
                <div className="card card-comment mb-0">
                  <div className="card-header border-bottom d-flex justify-content-between pb-2 mb-3">
                    <div className="header-title">
                      <div className="d-flex justify-content-between">
                        <div className="d-flex justify-content-between">
                          <div className="me-2">
                            <img
                              src="/assets/images/icon-7797704_1280.png"
                              alt="userimg"
                              className="avatar-40 rounded-circle img-fluid"
                              loading="lazy"
                            />
                          </div>
                          <div className="w-100 text-margin">
                            <div className="">
                              <h5 className="mb-0 d-inline-block me-1">
                                {userData.username ? userData.username : <Skeleton width={150} />}
                              </h5>
                              <div className="d-flex align-items-center mt-1">
                                <span className="me-3">
                                  <i className="fa fa-heart me-1 text-danger"></i>
                                  {selectedPost?.like_count || 0}
                                </span>
                                <span className="me-3">
                                  <i className="fa fa-comment me-1 text-primary"></i>
                                  {selectedPost?.comment_count || 0}
                                </span>
                              </div>
                              <div className="mt-2">
                                <small className="mb-0 d-inline-block">
                                  {showFullTitle ? selectedPost?.title : truncateTitle(selectedPost?.title, 5, 60).truncated}
                                </small>
                                {truncateTitle(selectedPost?.title, 5, 60).isTruncated && (
                                  <button
                                    type="button"
                                    className="btn btn-link btn-sm p-0 ms-2"
                                    onClick={toggleTitleDisplay}
                                  >
                                    {showFullTitle ? "Show Less" : "Show More"}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card-body pt-0 overflow-scroll" id="scrollableDivComments">
                    {renderComments()}
                  </div>
                  {errorMessage && (
                    <div className="alert alert-danger mt-3" role="alert" style={{
                      margin: "8px 5px 1px",
                      border: "1px solid #ccc",
                      borderRadius: "5px",
                      backgroundColor: "red",
                      color: "white",
                      padding: "10px",
                      fontWeight: "bold",
                      boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
                      transition: "all 0.3s ease-in-out",
                    }}>
                      {errorMessage}
                    </div>
                  )}
                  {Object.keys(replyInfo).length > 0 && (
                    <div
                      className="reply-info-preview position-relative"
                      style={{
                        margin: "8px 5px 1px",
                        padding: "10px",
                        border: "1px solid #ccc",
                        borderRadius: "5px",
                        backgroundColor: "#f1f1f1",
                      }}
                    >
                      <p>
                        {replyInfo.message}
                      </p>
                      <button
                        onClick={handleCloseReply}
                        style={{
                          position: "absolute",
                          top: "5px",
                          right: "5px",
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
                  )}
                  {/* Use the conditional render for comment form */}
                  {renderCommentForm()}
                </div>
              </div>
            </div>
          </Modal.Body>

        </form>
      </Modal>
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        className="story-modal"
        onExited={stopStoryProgress}
      >
        <Modal.Header closeButton style={{ borderRadius: "10px 10px 0 0" }}></Modal.Header>
        <Modal.Body
          className="d-flex justify-content-center align-items-center flex-column story-modal-body"
          style={{ borderRadius: "0 0 10px 10px" }}
        >
          <div className="d-flex justify-content-between w-100 mb-2">
            {profiles.map((_, index) => (
              <ProgressBar
                key={index}
                now={
                  index === currentStoryIndex
                    ? progress
                    : index < currentStoryIndex
                      ? 100
                      : 0
                }
                className="story-progress-bar"
                style={{
                  height: "3px",
                  width: "100%",
                  marginRight: index !== profiles.length - 1 ? "5px" : "0",
                }}
              />
            ))}
          </div>
          {profiles.map((story, index) => (
            <div
              key={index}
              style={{
                display: index === currentStoryIndex ? "block" : "none",
                transition: "opacity 0.9s ease",
              }}
            >
              <img
                src={story?.media_url}
                alt="story"
                className="story-image"
                style={{ width: "600px", height: "400px", objectFit: "cover" }}
              />
            </div>
          ))}
          {showLeftArrow && (
            <FaArrowLeft
              onClick={prevStory}
              className="story-navigation prev"
            />
          )}
          {showRightArrow && (
            <FaArrowRight
              onClick={nextStory}
              className="story-navigation next"
            />
          )}
        </Modal.Body>
      </Modal>
    </div >
  );
}