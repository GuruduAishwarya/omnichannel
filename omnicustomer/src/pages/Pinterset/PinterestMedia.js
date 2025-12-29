import React, { useState, useEffect } from 'react';
import { Modal, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import Emojis from '../../common/components/Emojis';
// import { postPintrestReply, postPintrestComment, MediaListPintrestComments } from '../../utils/ApiClient';

const PinterestMedia = ({ show, onHide, media, activeTab }) => {
  // const [showEmojis, setShowEmojis] = useState(false);
  // const [isLoadingComments, setLoadingComments] = useState(false);
  // const [errorMessage, setErrorMessage] = useState(null);
  // const [replyInfo, setReplyInfo] = useState({});
  // const [selectedPost, setSelectedPost] = useState("");
  // const [showFullTitle, setShowFullTitle] = useState(false);
  // const [showCommentModal, setShowCommentModal] = useState(false);
  // const [comments, setComments] = useState([]);
  // const [isLoading, setLoading] = useState(false);
  // const [totalNumberPagesComments, setTotalNumberPagesComments] = useState(0);
  // const [pageNumber, setPageNumber] = useState(1);
  // const [hasMoreComments, setHasMoreComments] = useState(true);
  // const [pageNumberComments, setPageNumberComments] = useState(1);

  // const {
  //   register: registerComment,
  //   handleSubmit: handleSubmitComment,
  //   formState: { errors: errorsComment },
  //   setValue: setValueComment,
  //   reset: resetComment,
  //   control: controlComment,
  //   getValues: getValuesComment,
  //   watch: watchComment,
  //   setError: setErrorComment,
  //   clearErrors: clearErrorsComment,
  // } = useForm();

  // useEffect(() => {
  //   if (show) {
  //     resetComment();
  //     setShowEmojis(false);
  //     setErrorMessage(null);
  //     setComments([]);
  //     setSelectedPost("");
  //   }
  // }, [show, resetComment]);

  // const handleCloseReply = () => {
  //   setReplyInfo({});
  //   resetComment();
  //   setShowEmojis(false);
  // };

  // const closeCommentModal = () => {
  //   setShowCommentModal(false);
  //   handleCloseReply();
  //   setErrorMessage(null); // Clear any existing error message
  //   setComments([]); // Reset comments
  //   setSelectedPost(""); // Reset selected post
  // };

  // const handleEmojiSelect = (emoji) => {
  //   const currentMessage = watchComment("message") || "";
  //   setValueComment("message", currentMessage + emoji);
  // };

  // const sendComment = async (data) => {
  //   setLoadingComments(true);
  //   setErrorMessage(null);

  //   try {
  //     const params = {
  //       reply_id: replyInfo?.id ? replyInfo?.id : selectedPost?.image_id,
  //     };

  //     const api_call = replyInfo?.id
  //       ? postPintrestReply(params, data)
  //       : postPintrestComment(params, data);

  //     const response = await api_call;
  //     const response_data = response.data;
  //     const successCode = replyInfo?.id ? 201 : 200;
  //     if (response_data.error_code === successCode) {
  //       // After successful comment, set showFullTitle to false to collapse the title
  //       setShowFullTitle(false);
  //       await fetchMediaListComment(selectedPost?.image_id);
  //       handleCloseReply();
  //       // Reset the comment input
  //       resetComment();
  //     } else {
  //       setErrorMessage(response_data.message || "Failed to post comment/reply.");
  //       hideErrorAfterDelay();
  //     }
  //   } catch (error) {
  //     console.error("Error posting comment:", error);
  //     setErrorMessage("Failed to post comment/reply.");
  //     hideErrorAfterDelay();
  //   } finally {
  //     setLoadingComments(false);
  //   }
  // };

  // const hideErrorAfterDelay = () => {
  //   setTimeout(() => setErrorMessage(null), 5000); // Hide after 5 seconds
  // };

  // const fetchMediaListComment = async (imgId, page = 1) => {
  //   if (!imgId) {
  //     console.warn("No image ID provided");
  //     return;
  //   }

  //   setLoading(true);

  //   try {
  //     const params = {
  //       page_number: page, // Dynamic page number
  //       page_size: 10, // Default page size
  //     };

  //     const response = await MediaListPintrestComments(imgId, params);
  //     const response_data = response.data;

  //     if (response_data.error_code === 200) {
  //       const data = response_data.results.data;
  //       const total_pages = response_data.results.pagination.total_pages;
  //       setTotalNumberPagesComments(total_pages);

  //       if (page === 1) {
  //         setComments(data); // Initial fetch
  //       } else {
  //         setComments((prevComments) => [...prevComments, ...data]); // Append more comments
  //       }
  //       return data; // Return fetched data
  //     } else {
  //       console.warn("Error code is not 200:", response_data.error_code);
  //       return [];
  //     }
  //   } catch (error) {
  //     console.error("Error fetching media data:", error);
  //     return [];
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const fetchMoreComments = async () => {
  //   const nextPageNumber = pageNumber + 1;

  //   const nextPageComments = await fetchMediaListComment(
  //     selectedPost?.image_id,
  //     nextPageNumber
  //   );
  //   if (Array.isArray(nextPageComments)) {
  //     setPageNumberComments(nextPageNumber); // Update page number after fetch
  //   } else {
  //     console.error("Fetched data is not an array:", nextPageComments);
  //   }
  // };

  // const handleFetchMoreComments = async () => {
  //   if (pageNumberComments < totalNumberPagesComments) {
  //     await fetchMoreComments();
  //   } else {
  //     setHasMoreComments(false); // Disable further loading if no more pages
  //   }
  // };

  return (
    <Modal show={show} onHide={onHide}  centered>
      <Modal.Header closeButton>
        <Modal.Title>Preview</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-2">
        <div className="row">
          <div className="col-sm-12">
            <div className="card h-100">
              {activeTab === 'video' || media?.video_urls?.includes('.mp4') ? (
                <video
                  className="img-fluid"
                  controls
                  autoPlay
                  src={media?.video_urls}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={media?.video_urls || "assets/images/page-img/pin-1.jpg"}
                  className=""
                  alt="photo-profile"
                  loading="lazy"
                />
              )}
            </div>
          </div>
          {/* <div className="col-md-12 col-lg-5">
            <div className="card card-comment mb-0">
              <div className="card-header border-bottom d-flex justify-content-between pb-2 mb-3">
                <div className="header-title">
                  <div className="d-flex justify-content-between">
                    <div className="d-flex justify-content-between">
                      <div className="me-2">
                        <img src="https://takie.vitelglobal.com/websites/vitet-social-mediasync/assets/images/user/1.jpg" alt="userimg" className="avatar-40 rounded-circle img-fluid" loading="lazy" />
                      </div>
                      <div className="w-100 text-margin">
                        <div>
                          <h5 className="mb-0 d-inline-block me-1">{media?.username || 'Username'}</h5>
                          <small className="mb-0 d-inline-block">{media?.description || 'No description'}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-body pt-0 overflow-scroll">
                {/* Comment section 
                <div className="comments-section">
                  {/* Example comment 
                  <div className="d-flex justify-content-between">
                    <div className="me-2">
                      <img src="https://takie.vitelglobal.com/websites/vitet-social-mediasync/assets/images/user/1.jpg" alt="userimg" className="avatar-40 rounded-circle img-fluid" loading="lazy" />
                    </div>
                    <div className="w-100 text-margin">
                      <div>
                        <h5 className="mb-0 d-inline-block me-1">Kehar</h5>
                        <small className="mb-0 d-inline-block">2w</small>
                      </div>
                      <p className="mb-0 font-13">Lorem Ipsum is simply dummy text of the printing</p>
                      <div className="d-flex justify-content-between align-items-center flex-wrap">
                        <div className="d-flex align-items-center me-3">
                          <a href="#"><span className="card-text-1">Reply</span></a>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Replies section 
                  <div className="Reply">
                    <ul className="post-comments p-0 mt-2 ms-5">
                      <li className="mb-2">
                        {/* Reply content structure similar to main comment 
                        {/* ... Add reply structure here ... 
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="card-footer px-3 py-3 border-top rounded-0">
                <Form className="d-flex align-items-center" noValidate="novalidate" onSubmit={handleSubmitComment(sendComment)}>
                  <div className="flex-shrink-0">
                    <img src="https://takie.vitelglobal.com/websites/vitet-social-mediasync/assets/images/user/1.jpg" alt="userimg" className="avatar-40 rounded-circle img-fluid" loading="lazy" />
                  </div>
                  <input
                    type="text"
                    className="form-control me-2 ms-2"
                    placeholder="Type your message"
                    name='message'
                    {...registerComment("message", {
                      required: "Message is required",
                    })}
                  />
                  
                  <div className="chat-attagement position-relative">
                    <a href="#" className="d-flex align-items-center pe-3" onClick={() => setShowEmojis(!showEmojis)}>
                      <span className="material-symbols-outlined">mood</span>
                    </a>
                    {showEmojis && <Emojis onEmojiSelect={handleEmojiSelect} pickerSize={{ height: 330, width: 240 }}
                      style={{
                        position: "absolute",
                        bottom: "38px",
                        right: "-3em",
                      }} />}
                  </div>
                  <button type="submit" className="btn btn-primary d-flex align-items-center">
                    <span className="material-symbols-outlined">send</span>
                  </button>
                </Form>
              </div>
              {errorsComment.message && (
                <div
                className='ms-4'
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
          </div> */}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default PinterestMedia;
