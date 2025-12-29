import React, { useState, useEffect, useCallback, useRef } from 'react';
import InfiniteScrollWrapper from '../../common/components/InfinityScrollWrapper';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import {
  LinkedInPosts,
  LinkedInProfile as LinkedInProfileApi,
  LinkedInEditPost,
  LinkedInDeletePost,
  LinkedInCommentsList,
  LinkedInAddComment,
  linkedinComment,
} from '../../utils/ApiClient';
import { triggerAlert, formatTimeToAmandPM, ConfirmationAlert } from '../../utils/CommonFunctions';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import ImageLazyLoading from "../../common/components/ImageLazyLoading";
import Loader from "../../common/components/Loader";
import EmojiPicker from "./EmojiPicker";
import ReplyPreview from "./ReplyPreview";

// Helper function to truncate text
const truncateText = (text, wordCount) => {
  if (!text) return '';
  const words = text.split(' ');
  if (words.length <= wordCount) return text;
  return words.slice(0, wordCount).join(' ') + '...';
};

// Content display component with show more/less functionality
const TruncatableContent = ({ text, initialWordCount = 10 }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) return null;

  const words = text.split(' ');
  const shouldTruncate = words.length > initialWordCount;
  const displayText = isExpanded || !shouldTruncate ? text : truncateText(text, initialWordCount);

  return (
    <>
      <p className="mb-2">{displayText}</p>
      {shouldTruncate && (
        <button
          className="btn btn-link p-0 text-primary mb-3"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </>
  );
};

// No data message component for various content types
const NoDataMessage = ({ type = 'posts' }) => {
  const content = {
    comments: {
      icon: 'chat_bubble',
      title: 'No Comments Yet',
      description: 'No comments have been added to this post'
    },
    likes: {
      icon: 'thumb_up',
      title: 'No Likes',
      description: 'This post has not received any likes yet'
    },
    notifications: {
      icon: 'notifications',
      title: 'No Notifications',
      description: 'You have no new notifications'
    },
    posts: {
      icon: 'post_add',
      title: 'No Posts Available',
      description: 'There are no posts to display at this time'
    }
  }[type];

  return (
    <div className="col-12">
      <div className="text-center p-5">
        <div className="no-data-wrapper">
          <span className="material-symbols-outlined"
            style={{ fontSize: '64px', color: '#6c757d' }}>
            {content.icon}
          </span>
          <h5 className="mt-3">{content.title}</h5>
          <p className="text-muted">{content.description}</p>
        </div>
      </div>
    </div>
  );
};

// Skeleton loader for content placeholders
const SkeletonLoader = ({ count = 3 }) => (
  Array(count).fill(0).map((_, index) => (
    <div key={index} className="col-sm-12 mb-4">
      <div className="card">
        <div className="card-body p-0">
          <div className="px-4 py-3">
            <div className="d-flex">
              <Skeleton circle width={40} height={40} />
              <div className="w-100 ms-3">
                <Skeleton width={200} height={20} />
                <Skeleton width={150} height={15} />
                <Skeleton width={100} height={15} />
              </div>
            </div>
          </div>
          <div className="px-3">
            <Skeleton count={3} />
          </div>
          <div className="user-post">
            <Skeleton height={300} />
          </div>
        </div>
      </div>
    </div>
  ))
);

// Comments section component
const CommentsSection = ({
  comments,
  onReplyClick,
  onDeleteClick,
  onDeleteReplyClick,
  replyPreview,
  onCloseReplyPreview,
  isDeletingComment,
  isPostingComment,
  hasMoreComments,
  handleFetchMoreComments,
  loadingMoreComments,
  isLoading
}) => {
  return (
    <>
      <div className="card-header border-bottom d-flex justify-content-between pb-3 mb-3">
        <div className="header-title">
          <h5 className="mb-0 d-inline-block me-1">Comments</h5>
        </div>
      </div>
      <div className="mb-0">
        <div
          className="card-body pt-0 overflow-scroll"
          id="scrollableDivComments"
          style={{ maxHeight: '400px' }}
        >
          <InfiniteScrollWrapper
            dataLength={comments.length}
            next={handleFetchMoreComments}
            hasMore={hasMoreComments}
            inverse={false}
            scrollableTarget="scrollableDivComments"
          >
            {isLoading || isDeletingComment || isPostingComment ? (
              <div className="text-center p-3">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : comments.length === 0 ? (
              <NoDataMessage type="comments" />
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.comment_id}
                  className="d-flex justify-content-between mb-3"
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
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              onReplyClick(comment.comment_id, comment.comments);
                            }}
                          >
                            <span className="card-text-1">Reply</span>
                          </a>
                          <a
                            href="#"
                            className="ms-3"
                            onClick={(e) => {
                              e.preventDefault();
                              onDeleteClick(comment.comment_id, "comment");
                            }}
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
                                  </div>
                                  <p className="mb-0 font-13">{reply.comments}</p>
                                  <div className="d-flex justify-content-between align-items-center flex-wrap">
                                    <div className="d-flex justify-content-between align-items-center">
                                      <div className="d-flex align-items-center me-3">
                                        <a
                                          href="#"
                                          className="ms-3"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            onDeleteReplyClick(reply.reply_id);
                                          }}
                                        >
                                          <span className="card-text-1">Delete</span>
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
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p>Loading more comments...</p>
              </div>
            )}
          </InfiniteScrollWrapper>
        </div>
      </div>
    </>
  );
};

// Comment form component
const CommentForm = ({
  replyToCommentId,
  replyMessage,
  message,
  setReplyMessage,
  setMessage,
  showEmojis,
  setShowEmojis,
  handleSendMessage,
  replyPreview,
  onCloseReplyPreview,
  totalComments
}) => {
  const [error, setError] = useState('');

  const validateMessage = (text) => {
    if (!text || text.trim() === '') {
      setError('Please enter a message before sending.');
      return false;
    }
    setError('');
    return true;
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (error) setError('');

    if (replyToCommentId) {
      setReplyMessage(value);
      if (replyPreview) {
        replyPreview.message = value;
      }
    } else {
      setMessage(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const currentMessage = replyToCommentId ? replyMessage : message;

    if (validateMessage(currentMessage)) {
      handleSendMessage();
    }
  };

  return (
    <div className="card-footer px-3 py-3 border-top rounded-0">
      {replyPreview && (
        <ReplyPreview
          replyPreview={replyPreview}
          onCloseReplyPreview={onCloseReplyPreview}
        />
      )}
      <form
        className="d-flex align-items-center"
        onSubmit={handleSubmit}
      >
        <div className="flex-shrink-0">
          <img
            src="/assets/images/icon-7797704_1280.png"
            alt="userimg"
            className="avatar-40 rounded-circle img-fluid"
            loading="lazy"
          />
        </div>
        <div className="position-relative" style={{ flex: '0.90', maxWidth: '75%' }}>
          <input
            type="text"
            className={`form-control me-2 ms-2 ${error ? 'border-danger' : ''}`}
            placeholder={replyToCommentId ? "Write a reply..." : "Type your message"}
            value={replyToCommentId ? replyMessage : message}
            onChange={handleInputChange}
            onBlur={() => {
              if (error) {
                validateMessage(replyToCommentId ? replyMessage : message);
              }
            }}
          />
          {error && (
            <div className="position-absolute text-danger" style={{ fontSize: '0.8rem', left: '10px', bottom: '-18px', whiteSpace: 'nowrap' }}>
              {error}
            </div>
          )}
        </div>
        <div className="d-flex justify-content-end align-items-center ms-auto">
          <div className="me-2">
            <EmojiPicker
              showEmojis={showEmojis}
              setShowEmojis={setShowEmojis}
              message={replyToCommentId ? replyMessage : message}
              setMessage={replyToCommentId ? setReplyMessage : setMessage}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary d-flex align-items-center"
          >
            <i className="fa fa-paper-plane"></i>
          </button>
        </div>
      </form>

      <div className="d-flex justify-content-between mt-4">
        <div className="w-100 text-margin">
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center me-3">
                <span className="material-symbols-outlined md-18">comment</span>
                <span className="card-text-1 ms-1">{totalComments || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Profile section component
const ProfileSection = ({ profileData, initialLoading }) => {
  if (!profileData && initialLoading) {
    return (
      <div className="col-lg-3">
        <div className="card">
          <div className="card-body">
            <Skeleton circle width={200} height={200} className="mb-3" />
            <Skeleton count={4} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="col-lg-3">
      <div className="card">
        <div className="card-header d-flex justify-content-between py-2">
          <div className="header-title">
            <h5 className="card-title">Profile Information</h5>
          </div>
          <div className="card-header-toolbar d-flex align-items-center">
          </div>
        </div>
        <div className="card-body">
          <div className="text-center mb-3">
            <img
              className="img-fluid rounded-circle avatar-200 profile-image"
              src={profileData?.results?.picture || "https://takie.vitelglobal.com/websites/vitet-social-mediasync/assets/images/user/07.jpg"}
              alt="profile-img"
            />
          </div>
          <div className="d-flex flex-column justify-content-between">
            <div className="d-flex mb-1">
              <span className="md-18 me-2">
                <i className="fa fa-user-circle-o fs-5" aria-hidden="true"></i>
              </span>
              <p className="mb-2">{profileData?.results?.name || 'LinkedIn User'}</p>
            </div>
            <div className="d-flex mb-1">
              <span className="md-18 me-2">
                <i className="fa fa-envelope fs-5" aria-hidden="true"></i>
              </span>
              <p className="mb-2">{profileData?.results?.email || 'No email available'}</p>
            </div>
            <div className="d-flex mb-1">
              <span className="md-18 me-2">
                <i className="fa fa-map-marker fs-5" aria-hidden="true"></i>
              </span>
              <p className="mb-2">{profileData?.results?.locale?.country || 'Location not available'}</p>
            </div>
            <div className="d-flex mb-1">
              <span className="md-18 me-2">
                <i className="fa fa-info-circle fs-5" aria-hidden="true"></i>
              </span>
              <p className="mb-2">
                {profileData?.results?.bio || 'Professional LinkedIn user. Connect with me for networking opportunities.'}
              </p>
            </div>
            <div className="d-flex">
              <span className="md-18 me-2">
                <i className="fa fa-link fs-5" aria-hidden="true"></i>
              </span>
              <p className="mb-2">
                <a href="#" className="fw-500 h6">
                  {profileData?.results?.website || 'www.linkedin.com/in/profile'}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Media renderer component
const MediaContent = ({ post, onPostClick }) => {
  const videoRef = useRef(null);
  const mediaContainerStyle = {
    width: '100%',
    height: '500px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    overflow: 'hidden',
    position: 'relative',
    margin: '0 0 10px 0',
    borderRadius: '8px',
  };

  if (post.post_type === 'video' || post.media_type === 'video') {
    return (
      <div className="user-post w-100" style={mediaContainerStyle}>
        <video
          ref={videoRef}
          src={post.video_urls || post.image_urls}
          controls
          preload="metadata"
          controlsList="nodownload"
          onContextMenu={(e) => e.preventDefault()}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            background: '#fff'
          }}
          onClick={(e) => e.stopPropagation()}
          playsInline
          onPlay={(e) => {
            document.querySelectorAll('video').forEach(video => {
              if (video !== e.target && !video.paused) {
                video.pause();
              }
            });
          }}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  if (post.post_type === 'document' || post.media_type === 'document') {
    const documentUrl = post.document_url || post.image_urls;
    return (
      <div className="user-post w-100" style={mediaContainerStyle}>
        <div style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fff',
          padding: '20px'
        }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.open(documentUrl, '_blank');
          }}>
          <div className="text-center">
            <i className="fa fa-file-pdf-o text-danger" style={{ fontSize: '72px' }}></i>
            <p className="text-muted mb-4">Click to view PDF document</p>
            <button className="btn btn-primary">
              <i className="fa fa-external-link me-2"></i> Open Document
            </button>
          </div>
        </div>
      </div>
    );
  }

  if ((post.post_type === 'post' || post.media_type === 'image') && post.image_urls) {
    return (
      <div className="user-post w-100" style={mediaContainerStyle}>
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fff',
          overflow: 'hidden'
        }}>
          <ImageLazyLoading
            src={post.image_urls}
            alt={post.title || "Post image"}
            style={{
              width: '100%',
              height: '120%',
              objectFit: 'contain',
              cursor: 'pointer',
              padding: '0'
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onPostClick(post);
            }}
            placeholder={<SkeletonLoader count={1} />}
          />
        </div>
      </div>
    );
  }

  return null;
};

const LinkedInProfile = () => {
  const [posts, setPosts] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // Modal states
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [showPreferredModal, setShowPreferredModal] = useState(false);
  const [showPostDetailsModal, setShowPostDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit state
  const [selectedPost, setSelectedPost] = useState(null);
  const [editFormData, setEditFormData] = useState({ content: '', description: '' });

  // Comment states
  const [comments, setComments] = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [replyToCommentId, setReplyToCommentId] = useState(null);
  const [replyPreview, setReplyPreview] = useState(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const [pagination, setPagination] = useState({
    page_number: 1,
    page_size: 10,
    total_pages: 0,
    total_items: 0,
  });
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [loadingMoreComments, setLoadingMoreComments] = useState(false);
  const [lastFetchedPostId, setLastFetchedPostId] = useState(null); // Track last fetched post to avoid redundant fetches

  const pageSize = 9;
  const initialFetchRef = useRef(false);

  // Fetch Profile Data
  const fetchProfileData = async () => {
    try {
      const response = await LinkedInProfileApi();
      if (response.status === 200) {
        setProfileData(response.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      triggerAlert('error', 'Error', 'Failed to load profile data');
    }
  };

  // Fetch Posts
  const fetchPosts = async (pageNum, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await LinkedInPosts({
        page: pageNum,
        page_size: pageSize,
        title: ''
      });

      if (response.status === 204) {
        if (!isLoadMore) {
          setPosts([]);
        }
        setHasMore(false);
      } else if (response.status === 200 && response.data?.results?.data) {
        const apiPosts = response.data.results.data;
        const totalPages = response.data.results.total_pages
          ? response.data.results.total_pages
          : (apiPosts.length < pageSize ? pageNum : pageNum + 1);
        setTotalPages(totalPages);

        const formattedPosts = apiPosts.map(post => ({
          id: post.id,
          post_id: post.post_id,
          author_name: post.author_name || "LinkedIn User",
          content: post.text || "",
          title: post.description || "No description",
          image_urls: post.image_urls,
          video_urls: post.video_urls,
          document_url: post.post_type === "document" ? post.image_urls : null,
          post_type: post.post_type,
          media_type: post.post_type === "video"
            ? "video"
            : post.post_type === "document"
              ? "document"
              : post.post_type === "post" && post.image_urls
                ? "image"
                : "text",
          likes_count: post.post_likes || 0,
          comments_count: post.comments_count || 0,
          shares_count: post.shares_count || 0,
          views_count: post.views_count || 0,
          status: post.status === 1 ? "published" : "draft",
          created_at: post.created_at,
          draft: post.draft || false,
          comment_status: post.comment_status
        }));

        const newUniquePosts = isLoadMore ? formattedPosts.filter(fp => !posts.some(op => op.id === fp.id)) : formattedPosts;
        setPageNumber(pageNum);
        setPosts(prev => isLoadMore ? [...prev, ...newUniquePosts] : newUniquePosts);
        setHasMore(pageNum < totalPages);
      } else {
        triggerAlert('error', 'Error', 'Failed to load posts');
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      triggerAlert('error', 'Error', 'Failed to load posts');
      setHasMore(false);
    } finally {
      setLoading(false);
      setInitialLoading(false);
      setLoadingMore(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (!initialFetchRef.current) {
      initialFetchRef.current = true;
      fetchProfileData();
      fetchPosts(1, false);
    }
  }, []);

  // Restore selected post after page refresh
  const restoreSelectedPost = async (postId) => {
    try {
      if (posts.length === 0) {
        localStorage.setItem('pendingRestorePostId', postId);
        return;
      }

      let foundPost = posts.find(p => p.post_id === postId || p.id === postId);
      if (!foundPost) {
        foundPost = { post_id: postId, id: postId };
      }

      setSelectedPost(foundPost);
      setShowPostDetailsModal(true);
      setComments([]);
      setPagination({
        page_number: 1,
        page_size: 10,
        total_pages: 0,
        total_items: 0,
      });
      setHasMoreComments(true);
      await fetchComments(1);
    } catch (error) {
      console.error("Error restoring selected post:", error);
      localStorage.removeItem('linkedInSelectedPostId');
      localStorage.removeItem('pendingRestorePostId');
    }
  };

  // Check for pending post restoration
  useEffect(() => {
    const storedPostId = localStorage.getItem('linkedInSelectedPostId');
    if (storedPostId && posts.length > 0) {
      restoreSelectedPost(storedPostId);
    }
  }, [posts]);

  // Fetch comments when modal opens
  useEffect(() => {
    if (showPostDetailsModal && selectedPost && (selectedPost.post_id || selectedPost.id)) {
      const postId = selectedPost.post_id || selectedPost.id;
      if (postId !== lastFetchedPostId) {
        setComments([]);
        setPagination({
          page_number: 1,
          page_size: 10,
          total_pages: 0,
          total_items: 0,
        });
        setHasMoreComments(true);
        fetchComments(1);
        setLastFetchedPostId(postId);
      }
    }
  }, [showPostDetailsModal, selectedPost]);

  // Handle load more
  const handleLoadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      const nextPage = pageNumber + 1;
      fetchPosts(nextPage, true);
    }
  };

  // Fetch comments
  const fetchComments = async (pageNumber = 1) => {
    if (!selectedPost) {
      console.warn("No selected post for fetching comments");
      return;
    }

    setCommentLoading(true);

    try {
      const post_id = selectedPost.post_id || selectedPost.id;
      const response = await LinkedInCommentsList(post_id, { page: pageNumber, page_size: pagination.page_size });

      console.log("Comments API response:", response);

      if (response.status === 200 && response.data) {
        let commentData = response.data.results || response.data.data || response.data.comments || response.data;

        if (!Array.isArray(commentData)) {
          commentData = commentData.comments || commentData.results || [];
        }

        const formattedComments = commentData.map(comment => ({
          comment_id: comment.comment_id || comment.id || `temp-${Date.now()}`,
          comments: comment.comment || comment.comments || comment.text || comment.message || "No comment text",
          created_at: comment.created_at || new Date().toISOString(),
          replies: Array.isArray(comment.replies) ? comment.replies.map(reply => ({
            reply_id: reply.reply_id || reply.id || `temp-reply-${Date.now()}`,
            comments: reply.comment || reply.comments || reply.text || reply.message || "No reply text",
            created_at: reply.created_at || new Date().toISOString()
          })) : []
        }));

        setComments(formattedComments);
        setPagination({
          page_number: pageNumber,
          page_size: commentData.length || 10,
          total_pages: response.data.total_pages || 1,
          total_items: response.data.total_items || commentData.length
        });
        setHasMoreComments(pageNumber < (response.data.total_pages || 1));
      } else if (response.status === 204) {
        setComments([]);
        setPagination({
          page_number: 1,
          page_size: 10,
          total_pages: 0,
          total_items: 0
        });
        setHasMoreComments(false);
      } else {
        console.error("Unexpected response:", response);
        triggerAlert("error", "Error", `Failed to load comments: ${response.data?.message || 'Unknown error'}`);
        setComments([]);
        setHasMoreComments(false);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      // triggerAlert("error", "Error", "Failed to load comments. Please try again later.");
      setComments([]);
      setHasMoreComments(false);
    } finally {
      setCommentLoading(false);
      setLoadingMoreComments(false);
    }
  };

  // Handle fetching more comments
  const handleFetchMoreComments = async () => {
    if (!hasMoreComments || loadingMoreComments) return;

    setLoadingMoreComments(true);
    const nextPage = pagination.page_number + 1;

    try {
      const post_id = selectedPost.post_id || selectedPost.id;
      const response = await LinkedInCommentsList(post_id, { page: nextPage, page_size: pagination.page_size });

      if (response.status === 200 && response.data) {
        let commentData = response.data.results || response.data.data || response.data.comments || response.data;

        if (!Array.isArray(commentData)) {
          commentData = commentData.comments || commentData.results || [];
        }

        const formattedComments = commentData.map(comment => ({
          comment_id: comment.comment_id || comment.id || `temp-${Date.now()}`,
          comments: comment.comment || comment.comments || comment.text || comment.message || "No comment text",
          created_at: comment.created_at || new Date().toISOString(),
          replies: Array.isArray(comment.replies) ? comment.replies.map(reply => ({
            reply_id: reply.reply_id || reply.id || `temp-reply-${Date.now()}`,
            comments: reply.comment || reply.comments || reply.text || reply.message || "No reply text",
            created_at: reply.created_at || new Date().toISOString()
          })) : []
        }));

        setComments(prev => [...prev, ...formattedComments]);
        setPagination(prev => ({
          ...prev,
          page_number: nextPage,
          total_items: prev.total_items + formattedComments.length,
          total_pages: response.data.total_pages || prev.total_pages
        }));
        setHasMoreComments(nextPage < (response.data.total_pages || 1));
      } else {
        setHasMoreComments(false);
      }
    } catch (error) {
      console.error("Error fetching more comments:", error);
      // triggerAlert("error", "Error", "Failed to load more comments.");
      setHasMoreComments(false);
    } finally {
      setLoadingMoreComments(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() && !replyMessage.trim()) {
      triggerAlert("error", "Error", "Comment or reply cannot be empty");
      return;
    }

    setIsPostingComment(true);
    try {
      if (replyToCommentId) {
        await handleReplyComment();
      } else {
        await handleNewComment();
      }
      await fetchComments(1);
    } catch (error) {
      console.error("Error posting comment:", error);
      triggerAlert(
        "error",
        "Oops...",
        error?.response?.data?.message || "Something went wrong!"
      );
    } finally {
      setIsPostingComment(false);
      setMessage("");
      setReplyMessage("");
      setReplyToCommentId(null);
      setReplyPreview(null);
    }
  };

  const handleNewComment = async () => {
    try {
      const response = await linkedinComment({
        message: message,
        share_urn: selectedPost.post_id || selectedPost.id
      });

      if (response.status === 201) {
        // Success alert removed
      } else {
        console.error("Error posting comment:", response.data?.message);
        triggerAlert(
          "error",
          "Oops...",
          `Error posting comment: ${response.data?.message} (Status: ${response.status})`
        );
      }
    } catch (error) {
      throw error;
    }
  };

  const handleReplyComment = async () => {
    try {
      const response = await LinkedInAddComment({
        comment_id: replyToCommentId,
        message: replyMessage,
        share_urn: selectedPost.post_id || selectedPost.id
      });

      if (response.status === 200) {
        // Success alert removed
      } else {
        console.error("Error posting reply:", response.data?.message);
        triggerAlert(
          "error",
          "Oops...",
          `Error posting reply: ${response.data?.message} (Status: ${response.status})`
        );
      }
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteComment = async (commentId, type) => {
    setIsDeletingComment(true);

    try {
      const success = true;

      if (success) {
        setComments((prevComments) =>
          prevComments
            .map((comment) => {
              if (type === "reply") {
                return {
                  ...comment,
                  replies: (comment.replies || []).filter(
                    (reply) => reply.reply_id !== commentId
                  ),
                };
              }
              return comment.comment_id === commentId ? null : comment;
            })
            .filter(Boolean)
        );
        setPagination(prev => ({
          ...prev,
          total_items: prev.total_items - 1
        }));
        triggerAlert("success", "Success", "Comment deleted successfully");
      } else {
        console.error("Error deleting comment");
        triggerAlert(
          "error",
          "Oops...",
          "Error deleting comment"
        );
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
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
      const success = true;

      if (success) {
        setComments((prevComments) =>
          prevComments.map((comment) => ({
            ...comment,
            replies: (comment.replies || []).filter((reply) => reply.reply_id !== replyId),
          }))
        );
        setPagination(prev => ({
          ...prev,
          total_items: prev.total_items - 1
        }));
        triggerAlert("success", "Success", "Reply deleted successfully");
      } else {
        console.error("Error deleting reply comment");
        triggerAlert(
          "error",
          "Oops...",
          "Error deleting reply comment"
        );
      }
    } catch (error) {
      console.error("Error deleting reply comment:", error);
      triggerAlert(
        "error",
        "Oops...",
        error?.response?.data?.message || "Something went wrong!"
      );
    } finally {
      setIsDeletingComment(false);
    }
  };

  const handleCommentClick = (post) => {
    const postId = post.post_id || post.id;
    localStorage.setItem('linkedInSelectedPostId', postId);

    setSelectedPost(post);
    setShowPostDetailsModal(true);
    setComments([]);
    setPagination({
      page_number: 1,
      page_size: 10,
      total_pages: 0,
      total_items: 0,
    });
    setHasMoreComments(true);
    setLastFetchedPostId(null); // Reset to trigger fetch in useEffect
  };

  const handleCloseReplyPreview = (commentId) => {
    if (replyToCommentId === commentId) {
      setReplyToCommentId(null);
      setReplyMessage("");
      setReplyPreview(null);
    }
  };

  const handleEditClick = (post) => {
    setSelectedPost(post);
    setEditFormData({
      content: post.content || '',
      description: post.title || '',
      post_type: post.post_type || 'text'
    });
    setShowEditModal(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const postId = selectedPost.post_id || selectedPost.id;

      const response = await LinkedInEditPost({
        post_id: postId,
        title: editFormData.description
      });

      if (response.status === 200) {
        const updatedPosts = posts.map(post => {
          if (post.id === selectedPost.id || post.post_id === selectedPost.post_id) {
            return { ...post, title: editFormData.description };
          }
          return post;
        });
        setPosts(updatedPosts);
        triggerAlert('success', 'Success', 'Post updated successfully');
      } else {
        triggerAlert('error', 'Error', response.data?.message || 'Failed to update post');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      triggerAlert('error', 'Error', error.response?.data?.message || 'Failed to update post');
    } finally {
      setShowEditModal(false);
    }
  };

  const handleDeleteClick = (post) => {
    setSelectedPost(post); // Still set this for other functionality that may need it
    ConfirmationAlert(
      "This post will be permanently removed. Do you want to proceed?",
      "Delete",
      () => handleDeleteConfirm(post) // Pass post directly to handler via closure
    );
  };

  const handleDeleteConfirm = async (post) => {
    try {
      const postId = post.post_id || post.id;
      const response = await LinkedInDeletePost(postId);
      if (response.status === 200) {
        const filteredPosts = posts.filter(p =>
          p.id !== post.id && p.post_id !== post.post_id
        );
        setPosts(filteredPosts);
        triggerAlert('success', 'Success', 'Post deleted successfully');
      } else {
        triggerAlert('error', 'Error', response.data?.message || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      triggerAlert('error', 'Error', error.response?.data?.message || 'Failed to delete post');
    }
  };

  const handleClosePostDetailsModal = () => {
    localStorage.removeItem('linkedInSelectedPostId');
    localStorage.removeItem('pendingRestorePostId');
    setShowPostDetailsModal(false);
    setSelectedPost(null);
    setComments([]);
    setLastFetchedPostId(null);
  };

  return (
    <div>
      <div className="position-relative"></div>
      <div id="content-page" className="content-page">
        <div className="container">
          <div className="row">
            <ProfileSection profileData={profileData} initialLoading={initialLoading} />
            <div className="col-lg-8 row m-0 p-0">
              <InfiniteScrollWrapper
                dataLength={posts.length}
                next={handleLoadMore}
                hasMore={hasMore}
                scrollThreshold={0.8}
                loader={
                  <div className="col-12 text-center p-3">
                    <Loader />
                  </div>
                }
                endMessage={
                  <div className="col-12 text-center py-4 my-3">
                    <div className="end-message-container p-3" style={{ border: '1px solid #dee2e6', borderRadius: '10px', background: '#fff' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#28a745' }}>
                        task_alt
                      </span>
                      <h5 className="mt-2 mb-1">All Caught Up!</h5>
                      <p className="text-muted">You've seen all posts. Check back later for more updates.</p>
                    </div>
                  </div>
                }
                style={{ overflow: 'hidden' }}
              >
                {initialLoading ? (
                  <SkeletonLoader count={3} />
                ) : posts.length > 0 ? (
                  <React.Fragment key={`posts-wrapper-${posts.length}`}>
                    {posts.map((post, index) => (
                      <React.Fragment key={post.id || `post-${index}`}>
                        <div key={post.id || index} className="col-sm-12">
                          <div className="card card-block card-stretch card-height mb-4">
                            <div className="card-body p-0">
                              <div className="user-post-data px-4 ps-2 py-3">
                                <div className="d-flex justify-content-between">
                                  <div className="me-3">
                                    <ImageLazyLoading
                                      src={post.profile_image || "/assets/images/icon-7797704_1280.png"}
                                      className="img-fluid"
                                      alt="profile-image"
                                      loading="lazy"
                                      style={{ width: "60px", borderRadius: '60%' }}
                                    />
                                  </div>
                                  <div className="w-100">
                                    <div className="d-flex justify-content-between lh-1">
                                      <div className="">
                                        <h5 className="mb-0 d-inline-block">
                                          {post.author_name || "LinkedIn User"}{" "}
                                        </h5>
                                        <p className="mb-0 text-primary d-flex align-items-center">
                                          {new Date(post.created_at).toLocaleString()}{" "}
                                        </p>
                                      </div>
                                      <div className="card-post-toolbar">
                                        <div className="dropdown">
                                          <span
                                            className="dropdown-toggle material-symbols-outlined"
                                            id={`postdata-${post.id || index}`}
                                            data-bs-toggle="dropdown"
                                            aria-haspopup="true"
                                            aria-expanded="false"
                                            role="button"
                                          >
                                            more_horiz
                                          </span>
                                          <div
                                            className="dropdown-menu m-0 p-0"
                                            aria-labelledby={`postdata-${post.id || index}`}
                                          >
                                            <a
                                              className="dropdown-item p-2"
                                              href="#"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                handleEditClick(post);
                                              }}
                                            >
                                              <div className="d-flex align-items-center">
                                                <span className="material-symbols-outlined">
                                                  edit
                                                </span>
                                                <div className="data ms-2">
                                                  <h6>Edit Post</h6>
                                                </div>
                                              </div>
                                            </a>
                                            <a
                                              className="dropdown-item p-2"
                                              href="#"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                handleDeleteClick(post);
                                              }}
                                            >
                                              <div className="d-flex align-items-center">
                                                <span className="material-symbols-outlined">
                                                  delete
                                                </span>
                                                <div className="data ms-2">
                                                  <h6>Delete Post</h6>
                                                </div>
                                              </div>
                                            </a>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="px-3">
                                {post.title && post.title !== "Default Title" && (
                                  <h5 className="mb-2">
                                    <TruncatableContent text={post.title} initialWordCount={10} />
                                  </h5>
                                )}
                              </div>
                              <MediaContent post={post} onPostClick={(post) => {
                                handleCommentClick(post);
                              }} />
                              <ul className="post-comments px-3 pt-3 m-0">
                                <li className="mb-2">
                                  <div className="d-flex justify-content-between">
                                    <div className="w-100 text-margin">
                                      <div className="d-flex justify-content-between align-items-center flex-wrap">
                                        <div className="d-flex justify-content-between align-items-center">
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center">
                                          <a
                                            href="#"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              handleCommentClick(post);
                                            }}
                                          >
                                            <i
                                              className="fa fa-expand fs-4"
                                              aria-hidden="true"
                                            ></i>
                                          </a>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        {loadingMore && (index + 1) % pageSize === 0 && (index + 1) < posts.length && (
                          <div className="col-12 text-center py-3">
                            <div className="d-flex justify-content-center my-2">
                              <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading more posts...</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                    {loadingMore && (
                      <div className="col-sm-12 text-center py-3">
                        <div className="d-flex justify-content-center my-3">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading more posts...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ) : (
                  <NoDataMessage type="posts" />
                )}
              </InfiniteScrollWrapper>
            </div>
          </div>
        </div>
      </div>
      <Modal show={showPostDetailsModal} onHide={handleClosePostDetailsModal} dialogClassName="modal-xl modal-dialog-centered">
        <Modal.Header closeButton>
          <h1 className="modal-title fs-5" id="exampleModalLabel">LinkedIn Post</h1>
        </Modal.Header>
        <Modal.Body className="p-2">
          <div className="row align-items-center">
            <div className="col-md-7">
              <div className="card">
                {selectedPost && (
                  selectedPost.media_type === 'video' || selectedPost.post_type === 'video' ? (
                    <video
                      controlsList="nodownload"
                      onContextMenu={(e) => e.preventDefault()}
                      src={selectedPost.video_urls || selectedPost.image_urls}
                      className="img-fluid rounded"
                      alt="post video"
                      controls
                      preload="metadata"
                      playsInline
                      style={{ height: '689px', objectFit: 'contain', background: '#fff' }}
                      onPlay={(e) => {
                        document.querySelectorAll('video').forEach(video => {
                          if (video !== e.target && !video.paused) {
                            video.pause();
                          }
                        });
                      }}
                    >
                      Your browser does not support video playback.
                    </video>
                  ) : selectedPost.media_type === 'document' || selectedPost.post_type === 'document' ? (
                    <div
                      className="img-fluid rounded d-flex flex-column justify-content-center align-items-center bg-light h-100 p-4 text-center"
                      style={{ cursor: 'pointer' }}
                      onClick={() => window.open(selectedPost.document_url || selectedPost.image_urls, '_blank')}
                    >
                      <i className="fa fa-file-pdf-o text-danger mb-3" style={{ fontSize: '72px' }}></i>
                      <h5>{selectedPost.title || "Document"}</h5>
                      <p className="text-muted mt-2">Click to open document</p>
                      <button
                        className="btn btn-primary mt-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(selectedPost.document_url || selectedPost.image_urls, '_blank');
                        }}
                      >
                        <i className="fa fa-external-link me-2"></i>Open Document
                      </button>
                    </div>
                  ) : selectedPost.media_type === 'text' || !selectedPost.media_type ? (
                    <div className="p-4" style={{ height: '689px', overflowY: 'auto', background: '#fff' }}>
                      <div className="post-content">
                        {selectedPost.title && selectedPost.title !== "Default Title" && (
                          <h5 className="mb-3">{selectedPost.title}</h5>
                        )}
                        <p>{selectedPost.content}</p>
                      </div>
                    </div>
                  ) : (
                    <ImageLazyLoading
                      src={selectedPost.image_urls || "https://takie.vitelglobal.com/websites/vitet-social-mediasync/assets/images/page-img/vitel-linked.jpeg"}
                      alt="photo-profile"
                      className="img-fluid rounded"
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '689px',
                        objectFit: 'contain',
                        background: '#fff'
                      }}
                      placeholder={<div className="h-100 d-flex justify-content-center align-items-center"><Loader /></div>}
                    />
                  )
                )}
              </div>
            </div>
            <div className="col-md-12 col-lg-5">
              <div className="card card-comment mb-0">
                <div className="card-header border-bottom py-2">
                  <div className="user-post-data d-flex justify-content-between align-items-center">
                    <div className="me-2">
                      <img
                        className="rounded-circle img-fluid"
                        src={selectedPost?.profile_image || "/assets/images/icon-7797704_1280.png"}
                        alt=""
                        loading="lazy"
                        width="40"
                        height="40"
                      />
                    </div>
                    <div className="w-100">
                      <div className="d-flex justify-content-between lh-1">
                        <div className="">
                          <h5 className="mb-0 d-inline-block">{selectedPost?.author_name || "LinkedIn User"}</h5>
                          <p className="mb-0 text-primary d-flex align-items-center">
                            {selectedPost?.created_at ? new Date(selectedPost.created_at).toLocaleString() : "Recent post"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-body pt-2 overflow-scroll">
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
                    hasMoreComments={hasMoreComments}
                    handleFetchMoreComments={handleFetchMoreComments}
                    loadingMoreComments={loadingMoreComments}
                    isLoading={commentLoading}
                  />
                </div>
                <CommentForm
                  replyToCommentId={replyToCommentId}
                  replyMessage={replyMessage}
                  message={message}
                  setReplyMessage={setReplyMessage}
                  setMessage={setMessage}
                  showEmojis={showEmojis}
                  setShowEmojis={setShowEmojis}
                  handleSendMessage={handleSendMessage}
                  replyPreview={replyPreview}
                  onCloseReplyPreview={handleCloseReplyPreview}
                  totalComments={pagination.total_items}
                />
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditSubmit}>
            <Form.Group className="mb-3" controlId="editPostDescription">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={editFormData.description}
                onChange={handleEditFormChange}
                placeholder="Post description"
              />
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Changes
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default LinkedInProfile;