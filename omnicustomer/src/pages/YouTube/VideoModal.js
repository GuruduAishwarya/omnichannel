import React, { useState, useEffect, useRef } from "react";
import { Modal } from "react-bootstrap";
import {
  YoutubeEdit,
  YoutubeDelete,
  YoutubeCommentsListView,
  YoutubeComment,
  YoutubeReply,
  YoutubeCommentDelete,
  YoutubeAddToPlaylist,
  YoutubeReplyCommentDelete, // Import the new API function
} from "../../utils/ApiClient";
import { ConfirmationAlert, triggerAlert,  formatTimeToAmandPM, formatDateTime, } from "../../utils/CommonFunctions";
import InfiniteScrollWrapper from "../../common/components/InfinityScrollWrapper";
import SpinnerLoader from "../../common/components/SpinnerLoader";
import EmojiPicker from "./EmojiPicker";
import ReplyPreview from "./ReplyPreview";
// import "./CommentsSection.css";
import { useForm } from "react-hook-form";
import Playlist from "./PlaylistModal";

// Update props to include activeTab
const VideoModal = ({ 
  video, 
  onHide, 
  onVideoDeleted, 
  onVideoEdited, 
  fetchVideos, 
  isPlaylistView,
  playlistId,
  fetchPlaylistVideos,
  activeTab 
}) => {
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [showShares, setShowShares] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [message, setMessage] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [editedVideo, setEditedVideo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [comments, setComments] = useState([]);
  const [replyToCommentId, setReplyToCommentId] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [shouldCloseModal, setShouldCloseModal] = useState(false);
  const [pagination, setPagination] = useState({
    page_number: 1,
    page_size: 9,
    total_pages: 0,
    total_items: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [replyPreview, setReplyPreview] = useState(null);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [loadingMoreComments, setLoadingMoreComments] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  const dropdownRef = useRef(null);
  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  useEffect(() => {
    if (video) {
      setValue("title", video.title || "");
      setValue("description", video.description || "");
      fetchComments();
    }
  }, [video, setValue]);

  useEffect(() => {
    if (shouldCloseModal) {
      onHide();
      if (alertMessage) {
        triggerAlert(alertType, "Notification", alertMessage);
        setAlertMessage("");
        setAlertType("");
      }
      setShouldCloseModal(false);
    }
  }, [shouldCloseModal, alertMessage, alertType, onHide]);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const fetchComments = async (pageNumber = 1) => {
    try {
      const response = await YoutubeCommentsListView({
        post_id: video.post_id,
        page_number: pageNumber,
        page_size: pagination.page_size,
      });

      if (response.status === 200) {
        const { data } = response.data.results;
        const { pagination: newPagination } = response.data.results;

        if (data) {
          setComments((prevComments) =>
            pageNumber === 1 ? data : [...prevComments, ...data]
          );
          setPagination(newPagination);
        } else {
          console.error("Unexpected response structure:", response);
          triggerAlert("error", "Oops...", "Unexpected response structure");
        }
      } else if (response.status === 204) {
        console.log("No content available for the requested page.");
      } else {
        console.error("Error fetching comments:", response.data.message);
        triggerAlert(
          "error",
          "Oops...",
          `Error fetching comments: ${response.data.message} (Status: ${response.status})`
        );
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleFetchMoreComments = async () => {
    if (pagination.page_number < pagination.total_pages) {
      setLoadingMoreComments(true);
      await fetchComments(pagination.page_number + 1);
      setLoadingMoreComments(false);
      if (pagination.page_number + 1 >= pagination.total_pages) {
        setHasMoreComments(false);
      }
    } else {
      setHasMoreComments(false);
    }
  };

  const handleSendMessage = async () => {
    setIsPostingComment(true);
    try {
      if (replyToCommentId) {
        await handleReplyComment();
      } else {
        await handleNewComment();
      }
      fetchComments();
    } catch (error) {
      console.error("Error posting comment:", error);
      triggerAlert(
        "error",
        "Oops...",
        error?.response?.data?.message || "Something went wrong!"
      );
    } finally {
      setIsPostingComment(false);
    }

    setMessage("");
    setReplyMessage("");
    setReplyToCommentId(null);
    setReplyPreview(null);
  };

  const handleNewComment = async () => {
    try {
      const response = await YoutubeComment({
        post_id: video.post_id,
        message,
      });

      if (response.status === 200) {
        setComments([...comments, response.data]);
      } else {
        console.error("Error posting comment:", response.data.message);
        triggerAlert(
          "error",
          "Oops...",
          `Error posting comment: ${response.data.message} (Status: ${response.status})`
        );
        setShouldCloseModal(true);
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      triggerAlert(
        "error",
        "Oops...",
        error?.response?.data?.message || "Something went wrong!"
      );
      setShouldCloseModal(true);
    }
  };

  const handleReplyComment = async () => {
    try {
      const response = await YoutubeReply({
        comment_id: replyToCommentId,
        message: replyMessage,
      });

      if (response.status === 200) {
        setComments(
          comments.map((comment) =>
            comment.comment_id === replyToCommentId
              ? { ...comment, replies: [...comment.replies, response.data] }
              : comment
          )
        );
        setReplyMessage("");
        setReplyPreview(null);
        setReplyToCommentId(null);
      } else {
        console.error("Error posting reply:", response.data.message);
      }
    } catch (error) {
      console.error("Error posting reply:", error);
      triggerAlert(
        "error",
        "Oops...",
        error?.response?.data?.message || "Something went wrong!"
      );
      setShouldCloseModal(true);
    }
  };

  const handleDeleteComment = async (commentId, type) => {
    setIsDeletingComment(true);

    try {
      const response = await YoutubeCommentDelete({ comment_id: commentId });

      if (response.status === 200) {
        setComments((prevComments) =>
          prevComments
            .map((comment) => {
              if (type === "reply") {
                return {
                  ...comment,
                  replies: comment.replies.filter(
                    (reply) => reply.reply_id !== commentId
                  ),
                };
              }
              return comment.comment_id === commentId ? null : comment;
            })
            .filter(Boolean)
        );
      } else {
        console.error("Error deleting comment:", response.data.message);
        setShouldCloseModal(true);
        setAlertType("error");
        triggerAlert(
          "error",
          "Oops...",
          `Error deleting comment: ${response.data.message}`
        );
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      setShouldCloseModal(true);
      setAlertType("error");
      triggerAlert(
        "error",
        "Oops...",
        error?.response?.data?.message || "Something went wrong!"
      );
    } finally {
      setIsDeletingComment(false);
    }
  };

  const handleDeleteReplyComment = async (replyId) => {
    setIsDeletingComment(true);

    try {
      const response = await YoutubeReplyCommentDelete(replyId);

      if (response.status === 200) {
        setComments((prevComments) =>
          prevComments.map((comment) => ({
            ...comment,
            replies: comment.replies.filter((reply) => reply.reply_id !== replyId),
          }))
        );
      } else {
        console.error("Error deleting reply comment:", response.data.message);
        setShouldCloseModal(true);
        setAlertType("error");
        triggerAlert(
          "error",
          "Oops...",
          `Error deleting reply comment: ${response.data.message}`
        );
      }
    } catch (error) {
      console.error("Error deleting reply comment:", error);
      setShouldCloseModal(true);
      setAlertType("error");
      triggerAlert(
        "error",
        "Oops...",
        error?.response?.data?.message || "Something went wrong!"
      );
    } finally {
      setIsDeletingComment(false);
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    setShowComments(false);
    setShowShares(false);
    setShowEmojis(false);
  };

  const handleEditVideo = async (data) => {
    try {
      setIsLoading(true);
  
      const api_input = {
        post_id: video.post_id,
        title: data.title || undefined,
        description: data.description || undefined,
      };
  
      const response = await YoutubeEdit(api_input);
  
      if (response.status === 200) {
        // Update local state
        setEditedVideo(response.data);
        setIsEditing(false);
        setShowEditModal(false);
  
        // Call onVideoEdited to update parent state immediately
        if (onVideoEdited) {
          onVideoEdited({
            ...video,
            ...response.data,
            post_type: video.post_type // Preserve post_type
          });
        }
  
        // Close modal first
        setShouldCloseModal(true);
  
        // Refresh the current active list
        await fetchVideos(video.post_type || activeTab);
  
        // Update playlist if needed
        if (isPlaylistView && fetchPlaylistVideos && playlistId) {
          await fetchPlaylistVideos({ playlist_id: playlistId });
        }
  
        // Show success message after modal is closed
        triggerAlert("success", "Success", "Video edited successfully!");
      } else {
        // Close modal first
        setShowEditModal(false);
        setShouldCloseModal(true);
  
        // Then show error message
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error(`Error editing ${video.post_type}:`, error);
      
      // Close modal first
      setShowEditModal(false);
      setShouldCloseModal(true);
  
      // Then show error message
      triggerAlert(
        "error",
        "Oops...",
        error?.response?.data?.message || "Something went wrong!"
      );
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleDeleteVideo = async () => {
    if (!video.post_id) {
      triggerAlert("error", "Oops...", `Please select a ${video.post_type || 'video'}`);
      return;
    }

    setShouldCloseModal(true);
  
    ConfirmationAlert(
      `Are you sure you want to delete this ${video.post_type || 'video'}?`,
      'Continue',
      async () => {
        try {
          setIsLoading(true);
          const response = await YoutubeDelete(video.post_id);
  
          if (response.status === 200) {
            // Call onVideoDeleted first to update parent state immediately
            if (onVideoDeleted) {
              onVideoDeleted(video.post_id);
            }
  
            // Show success message
            triggerAlert(
              "success", 
              "Success", 
              `${video.post_type || 'Video'} deleted successfully!`
            );
  
            // Close modal
            setShouldCloseModal(true);
  
            // Refresh the current active list
            await fetchVideos(video.post_type || activeTab);
  
            // Update playlist if needed
            if (isPlaylistView && fetchPlaylistVideos && playlistId) {
              await fetchPlaylistVideos({ playlist_id: playlistId });
            }
          } else {
            throw new Error(response.data.message);
          }
        } catch (error) {
          console.error(`Error deleting ${video.post_type}:`, error);
          triggerAlert(
            "error",
            "Oops...",
            error?.response?.data?.message || "Something went wrong!"
          );
        } finally {
          setIsLoading(false);
        }
      }
    );
  };
  

  const handleAddToPlaylist = async (selectedPlaylists) => {
    if (!selectedPlaylists || selectedPlaylists.length === 0) {
      setShouldCloseModal(true); // Close the modal
      triggerAlert("error", "Oops...", "No playlist selected");
      return;
    }

    try {
      const payload = {
        id: selectedPlaylists.map(playlist => playlist.id),
        post_id: video?.post_id,
      };

      if (!payload.post_id) {
        setShouldCloseModal(true); // Close the modal
        triggerAlert("error", "Oops...", "No video selected");
        return;
      }

      const response = await YoutubeAddToPlaylist(payload);

      if (response.status === 200) {
        triggerAlert("success", "Success", "Playlist updated successfully!");
        setShouldCloseModal(true);
      } else {
        triggerAlert(
          "error",
          "Oops...",
          response.data.message || "Something went wrong!"
        );
        setShouldCloseModal(true);
      }
    } catch (error) {
      console.error("Error adding video to playlist:", error);
      triggerAlert(
        "error",
        "Oops...",
        error?.response?.data?.message || "Something went wrong!"
      );
      setShouldCloseModal(true);
    }
  };

  const handleCloseReplyPreview = (commentId) => {
    if (replyToCommentId === commentId) {
      setReplyToCommentId(null);
      setReplyMessage("");
      setReplyPreview(null);
    }
  };

  if (!video) {
    return null;
  }

  const getUpdatedUrl = (url) => {
    if (!url) return "";
    const unwantedPath = "/home/vitel/omni_channel_api";
    return url.replace(unwantedPath, baseUrl);
  };

  const CommentsSection = ({
    comments,
    onReplyClick,
    onDeleteClick,
    onDeleteReplyClick,
    replyPreview,
    onCloseReplyPreview,
    isDeletingComment,
    isPostingComment,
  }) => {
    return (
      <>
      <div className="card-header border-bottom d-flex justify-content-between pb-3 mb-3   ">
              <div className="header-title">
                <div className="d-flex justify-content-between">
                  <div className="">
                    <h5 className="mb-0 d-inline-block me-1">Comments</h5>
                  </div>
                </div>
              </div>
              {/* <div className="share-block d-flex align-items-center feather-icon">
                <a
                  href="javascript:void(0);"
                  className="d-flex align-items-center"
                  data-bs-target="#exampleModalShare"
                >
                  <span className="material-symbols-outlined text-dark">
                    share
                  </span>
                  <span className="ms-1 fw-500 text-dark">Share</span>
                </a>
              </div> */}
            </div>

            
        <div className="card-comment mb-0">
        
          <div
            className="card-body  pt-0 overflow-scroll"
            id="scrollableDivComments"
          >
            

            <InfiniteScrollWrapper
              dataLength={comments.length}
              next={handleFetchMoreComments}
              hasMore={hasMoreComments}
              inverse={false}
              scrollableTarget="scrollableDivComments"
            >
              {isDeletingComment || isPostingComment ? (
                <SpinnerLoader />
              ) : comments.length === 0 ? (
                // Add this new no comments message
                <div className="text-center p-5">
                  <div className="no-data-wrapper">
                    <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#6c757d' }}>
                      chat_bubble_outline
                    </span>
                    <h5 className="mt-3">No Comments Yet</h5>
                    <p className="text-muted">Be the first to comment on this video!</p>
                  </div>
                </div>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.comment_id}
                    className="d-flex justify-content-between mb-0"
                  >
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
                          Anonymous User
                        </h5>
                        <small className="mb-0 d-inline-block fw-500">
                          {formatTimeToAmandPM(comment.created_at)}
                        </small>
                       
                      </div>
                      <p className="mb-0 font-13">{comment.comments}</p>
                      <div className="d-flex justify-content-between align-items-center flex-wrap">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center me-3">
                            <a
                              href="javascript:void(0);"
                              onClick={() => onReplyClick(comment.comment_id, comment.comments)}
                            >
                              <span className="card-text-1">Reply</span>
                            </a>
                            <a
                              href="javascript:void(0);"
                              className="ms-3"
                              onClick={() =>
                                onDeleteClick(comment.comment_id, "comment")
                              }
                            >
                              <span className="card-text-1">Delete</span>
                            </a>
                          </div>
                        </div>
                      </div>

                      {comment.replies && comment.replies.length > 0 && (
                        <div className="Reply">
                          <ul className="post-comments p-0 mt-2">
                            {comment.replies.map((reply) => (
                              <li key={reply.reply_id} className="mb-2">
                                <div className="d-flex justify-content-between">
                                  <div className="me-3">
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
                                        Anonymous User
                                      </h5>
                                      <small className="mb-0 d-inline-block ms-1 fw-500">
                                        {formatTimeToAmandPM(reply.created_at)}
                                      </small>
                                      {/* <i class="fa fa-reply text-warning ms-1" aria-hidden="true"></i> */}
                                    </div>
                                    <p className="mb-0 font-13">
                                      {reply.comments}
                                    </p>
                                    <div className="d-flex justify-content-between align-items-center flex-wrap">
                                      <div className="d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center me-3">
                                          {/* <a
                                            href="javascript:void(0);"
                                            onClick={() =>
                                              onReplyClick(comment.comment_id, comment.comments)
                                            }
                                          >
                                            <span className="card-text-1">
                                              Reply
                                            </span>
                                          </a> */}
                                          <a
                                            href="javascript:void(0);"
                                            className="ms-3"
                                            onClick={() =>
                                              onDeleteReplyClick(reply.reply_id)
                                            }
                                          >
                                            <span className="card-text-1">
                                              Delete
                                            </span>
                                          </a>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {loadingMoreComments && (
                <div className="text-center my-3">
                  <SpinnerLoader />
                  <p>Loading more comments...</p>
                </div>
              )}
            </InfiniteScrollWrapper>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <Modal.Header>
        <Modal.Title>
        {/* {editedVideo ? editedVideo.title : video.title} */}
        YouTube
        </Modal.Title>
        <div className="d-flex align-items-center">
          {/* <small className="me-3 text-muted">
            {formatDateTime(video.created_at, 'month dd, hh:mm')}
          </small> */}
          <button
            type="button"
            className="btn btn-secondary me-2"
            onClick={toggleFullScreen}
          >
            <span className="material-symbols-outlined">
              {isFullScreen ? "fullscreen_exit" : "fullscreen"}
            </span>
          </button>
          {!isPlaylistView && (
            <div className="dropdown" ref={dropdownRef}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <span className="material-symbols-outlined">more_vert</span>
              </button>
              {showDropdown && (
                <div className="dropdown-menu dropdown-menu-end show">
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setShowEditModal(true);
                      setShowDropdown(false);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      handleDeleteVideo();
                      setShowDropdown(false);
                    }}
                  >
                    Delete
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setShowPlaylistModal(true);
                      setShowDropdown(false);
                    }}
                  >
                    Save PlayList
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal.Header>
      <Modal.Body>
        <div className="row g-3">
          <div
            className={`${isFullScreen ? "col-12" : "col-lg-7"} social-post`}
          >
            <div className="card  card-youtube">
              <div className="card-body p-0">
            <p style={{ fontSize: "15px" }}>  {editedVideo ? editedVideo.title : video.title}</p>
                <div className="position-relative">
                  <video
                    width="100%"
                    height="676"
                    style={{ objectFit: "cover" }}
                    src={getUpdatedUrl(
                      editedVideo ? editedVideo.video_urls : video.video_urls
                    )}
                    controls
                    controlsList="nodownload"
                    title="Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  ></video>
                </div>
              </div>
            </div>
          </div>
          {(!isFullScreen || showComments || showShares) && (
            <div className={`${isFullScreen ? "col-12" : "col-lg-5"}`}>
              <div className="card card-comment mb-0">
                <CommentsSection
                  comments={comments}
                  onReplyClick={(commentId, commentText) => {
                    setReplyToCommentId(commentId);
                    setReplyPreview({ commentId, message: replyMessage, userComment: commentText });
                  }}
                  onDeleteClick={(commentId, type) =>
                    handleDeleteComment(commentId, type)
                  }
                  onDeleteReplyClick={(replyId) =>
                    handleDeleteReplyComment(replyId)
                  }
                  replyPreview={replyPreview}
                  onCloseReplyPreview={handleCloseReplyPreview}
                  isDeletingComment={isDeletingComment}
                  isPostingComment={isPostingComment}
                />
                <ReplyPreview
                  replyPreview={replyPreview}
                  onCloseReplyPreview={handleCloseReplyPreview}
                />
                <div className="card-footer px-3 py-3 border-top rounded-0">
                  <form
                    className="d-flex align-items-center"
                    onSubmit={handleSubmit((data) => {
                      if (replyToCommentId) {
                        setReplyMessage(data.replyMessage);
                      } else {
                        setMessage(data.message);
                      }
                      handleSendMessage();
                    })}
                  >
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
                      // {...register("message", { required: "Comment is required" })}
                      value={replyToCommentId ? replyMessage : message}
                      onChange={(e) => {
                        if (replyToCommentId) {
                          setReplyMessage(e.target.value);
                          setReplyPreview({
                            commentId: replyToCommentId,
                            message: e.target.value,
                            userComment: replyPreview.userComment,
                          });
                        } else {
                          setMessage(e.target.value);
                        }
                      }}
                    />
                    {errors.message && (
                      <span className="text-danger">{errors.message.message}</span>
                    )}
                    <div className="chat-container">
                      <div className="chat-input-container">
                        <EmojiPicker
                          showEmojis={showEmojis}
                          setShowEmojis={setShowEmojis}
                          message={replyToCommentId ? replyMessage : message}
                          setMessage={
                            replyToCommentId ? setReplyMessage : setMessage
                          }
                        />
                      </div>
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
                  </form>
                  <div class="d-flex justify-content-between mt-4">
                    <div class="w-100 text-margin">
                      <div class="d-flex justify-content-between align-items-center flex-wrap">
                        <div class="d-flex justify-content-between align-items-center">
                          <div class="d-flex align-items-center me-3">
                            <span class="material-symbols-outlined md-18">
                              comment
                            </span>
                            <span class="card-text-1 ms-1">{pagination.total_items || 0}</span>
                          </div>
                        </div>
                        {/* <div class="d-flex justify-content-between align-items-center">
                          <div class="d-flex align-items-center me-3">
                            <span class="material-symbols-outlined md-18">
                              thumb_up
                            </span>
                            <span class="card-text-1 ms-1">15k</span>
                          </div>
                          <div class="d-flex align-items-center me-3">
                            <span class="material-symbols-outlined md-18">
                              visibility
                            </span>
                            <span class="card-text-1 ms-1">20k</span>
                          </div>
                        </div> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal.Body>
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Video</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit(handleEditVideo)}>
            <div className="mb-3">
              <label htmlFor="title" className="form-label">
                Title
              </label>
              <input
                type="text"
                className="form-control"
                id="title"
                {...register("title", { required: true })}
              />
              {errors.title && (
                <span className="text-danger">Title is required</span>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                className="form-control"
                id="description"
                rows="3"
                {...register("description", { required: true })}
              ></textarea>
              {errors.description && (
                <span className="text-danger">Description is required</span>
              )}
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Save changes
            </button>
          </form>
        </Modal.Body>
        <Modal.Footer>
        </Modal.Footer>
      </Modal>
      <Playlist
        isOpen={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
        onPlaylistsSelected={handleAddToPlaylist}
        isCreatePlaylistAvailable={false}
      />
    </>
  );
};

export default VideoModal;
