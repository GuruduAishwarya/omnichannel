import React, { useState, useRef, useEffect, useCallback } from "react";
import { Offcanvas, Button, Form, Modal } from "react-bootstrap";
import { FaCloudUploadAlt, FaExpand, FaTrash, FaPlus } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { getBase64, triggerAlert, ConfirmationAlert } from "../../utils/CommonFunctions";
import { mediaGallery, getMediaGallery, mediaGalleryDelete } from "../../utils/ApiClient";
import ImageLazyLoading from "../../common/components/ImageLazyLoading";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const debounce = (func, wait) => {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
};

const shortenFileName = (fileName, maxWords = 5) => {
  const nameWithoutExtension = fileName.split('.').slice(0, -1).join('.');
  const words = nameWithoutExtension.split(/[\s_-]/);
  if (words.length <= maxWords) return fileName;

  const extension = fileName.split('.').pop();
  const shortened = words.slice(0, maxWords).join(' ');
  return `${shortened}...${extension}`;
};

const NoDataMessage = ({ type, galleryType }) => {
  const messages = {
    imageGallery: {
      icon: 'image',
      title: 'No Images Available',
      description: 'There are no images available in the gallery .'
    },
    videoGallery: {
      icon: 'videocam',
      title: 'No Videos Available',
      description: 'There are no videos available in the gallery .'
    },
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
    gallery: {
      icon: 'photo_library',
      title: 'No Media Available',
      description: 'There are no media items available in the gallery yet.'
    }
  };

  const messageKey = type === 'gallery'
    ? (galleryType === 'image' ? 'imageGallery' : 'videoGallery')
    : type;

  const { icon, title, description } = messages[messageKey] || messages.imageGallery;

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

const ShowComposeModal = ({ show, onHide, onMediaSelect, source, type }) => {
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const [isBlue, setIsBlue] = useState(true);
  const [mediaUpload, setMediaUpload] = useState(null);
  const [mediaData, setMediaData] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("image");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpened, setModalOpened] = useState(false);
  const [singleSelectionforCompose, setSingleSelectionforCompose] = useState(null);
  const [currentPlayingVideo, setCurrentPlayingVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGalleryLoading, setIsGalleryLoading] = useState(false);
  const [expandedTitles, setExpandedTitles] = useState({});
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewMedia, setPreviewMedia] = useState(null);
  const [expandedModalTitle, setExpandedModalTitle] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const fileInputRef = useRef(null);
  const { register, handleSubmit, reset } = useForm();
  const resizeObserverRef = useRef(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const handleComposeClose = () => {
    onHide();
    reset();
    setMediaUpload(null);
    setModalOpened(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (isImage) {
      setSelectedFilter("image");
    } else if (isVideo) {
      setSelectedFilter("video");
    }

    if (
      file.size > 50 * 1024 * 1024 ||
      !["image/jpeg", "image/png", "image/jpg", "video/mp4", "video/webm", "video/ogg"].includes(file.type)
    ) {
      e.target.value = "";
      triggerAlert(
        "error",
        "Invalid File",
        "Please upload a valid image or video under 50MB."
      );
      setMediaUpload(null);
      return;
    }

    try {
      const base64 = await getBase64(file);
      const base64WithoutPrefix = base64.substring(base64.indexOf(",") + 1);
      const items = {
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file: base64WithoutPrefix,
        preview: base64,
      };

      setMediaUpload(items);
    } catch (error) {
      triggerAlert("error", "Oops...", "Failed to process the file.");
    }
  };

  const handleUploadClose = () => {
    setMediaUpload(null);
    reset();
  };

  const commonCompose = async (data) => {
    try {
      setIsLoading(true);
      const apiInput = {
        title: data.title,
        file_upload: mediaUpload ? mediaUpload.file : null,
      };

      if (!apiInput.file_upload) {
        triggerAlert("error", "No File", "Please upload an image or video.");
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("title", apiInput.title);
      formData.append("file_upload", apiInput.file_upload);

      const response = await mediaGallery(formData);

      if (response.data.error_code === 201) {
        triggerAlert("success", "Success", "File uploaded successfully!");

        const fileType = mediaUpload.file_type.startsWith("image/") ? "image" : "video";
        await fetchMediaGallery({ file_upload: fileType });

        setMediaUpload(null);
        reset();
      } else {
        triggerAlert("error", "Error", "Failed to upload file.");
      }
    } catch (error) {
      triggerAlert("error", "Oops...", "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMediaGallery = useCallback(async (params) => {
    try {
      setIsGalleryLoading(true);
      const response = await getMediaGallery(params);
      if (response.data.error_code === 200) {
        setMediaData(response.data.results);
      } else {
        triggerAlert("error", "Error", "Failed to fetch media gallery.");
      }
    } catch (error) {
      triggerAlert("error", "Oops...", "Something went wrong.");
    } finally {
      setIsGalleryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (show) {
      setModalOpened(true);
      fetchMediaGallery({ file_upload: selectedFilter, title: searchQuery });
    }
  }, [show, fetchMediaGallery, selectedFilter, searchQuery]);

  useEffect(() => {
    const handleScroll = debounce(() => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.scrollHeight - 2
      ) {
        loadMoreData();
      }
    }, 200);

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [page]);

  useEffect(() => {
    const handleResize = debounce(() => {
    }, 200);

    const element = document.querySelector(".offcanvas-body");
    if (element) {
      resizeObserverRef.current = new ResizeObserver(handleResize);
      resizeObserverRef.current.observe(element);
    }

    return () => {
      if (element && resizeObserverRef.current) {
        resizeObserverRef.current.unobserve(element);
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, []);

  const loadMoreData = useCallback(() => {
    if (!hasMore) return;

    const newData = mediaData.slice(page * 9, (page + 1) * 9);

    setTimeout(() => {
      setMediaData([...mediaData, ...newData]);
      setPage(page + 1);
      if (newData.length < 9) {
        setHasMore(false);
      }
    }, 2000);
  }, [page, mediaData, hasMore]);

  const handleMediaSelect = () => {
    if (onMediaSelect) {
      onMediaSelect(singleSelectionforCompose);
      handleComposeClose();
    }
  };

  const handleVideoPlay = (event) => {
    const videoElement = event.target;
    if (currentPlayingVideo && currentPlayingVideo !== videoElement) {
      currentPlayingVideo.pause();
    }
    setCurrentPlayingVideo(videoElement);
  };

  const toggleTitleExpansion = (index) => {
    setExpandedTitles((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const handlePreview = (e, media) => {
    e.stopPropagation();
    setPreviewMedia(media);
    setShowPreviewModal(true);
    setExpandedModalTitle(false);
  };

  const renderTitle = (title, isExpanded, maxWords = 3) => {
    const words = title.split(' ');
    if (words.length <= maxWords) return title;
    return isExpanded ? title : words.slice(0, maxWords).join(' ') + '...';
  };

  const handleCheckboxChange = (media) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(item => item.gallery_id === media.gallery_id);
      if (isSelected) {
        return prev.filter(item => item.gallery_id !== media.gallery_id);
      } else {
        return [...prev, media];
      }
    });
    setSingleSelectionforCompose(media);
  };

  const handleDeleteClick = (e, media) => {
    e.stopPropagation();
    setSelectedItems([media]);
    ConfirmationAlert(
      `Are you sure you want to delete`,
      "Delete",
      handleDeleteSelected
    );
  };

  const handleDeleteSelected = async () => {
    try {
      const galleryIds = selectedItems.map(item => item.gallery_id).filter(id => id != null);

      if (galleryIds.length === 0) {
        triggerAlert("error", "Error", "No valid items selected for deletion");
        return;
      }

      const response = await mediaGalleryDelete(galleryIds);

      if (response?.data?.error_code === 200) {
        triggerAlert("success", "Success", "Items deleted successfully!");

        setMediaData(prevData =>
          prevData.filter(item => !galleryIds.includes(item.gallery_id))
        );

        setSelectedItems([]);

        fetchMediaGallery({ file_upload: selectedFilter, title: searchQuery });
      } else {
        const errorMessage = response?.data?.message || "Failed to delete items.";
        triggerAlert("error", "Error", errorMessage);
      }
    } catch (error) {
      console.error("Delete error:", error);
      triggerAlert("error", "Error", "Something went wrong while deleting items. Please try again.");
    }
  };

  useEffect(() => {
    if (type) {
      if (["post", "story"].includes(type)) {
        setSelectedFilter("image");
      } else if (["video", "reel", "short"].includes(type)) {
        setSelectedFilter("video");
      }
    }
  }, [type]);

  return (
    <>
      <Offcanvas
        show={show}
        onHide={handleComposeClose}
        placement="end"
        style={{
          width: "550px",
          zIndex: 1050
        }}
      >
        <Offcanvas.Header
          closeButton={false}
          className="bg-white border-bottom"
          style={{
            padding: "1rem",
          }}
        >
          <div className="d-flex align-items-center w-100">
            <Offcanvas.Title
              style={{
                fontSize: "1.1rem",
                fontWeight: "500",
              }}
            >
              {!selectionMode ? (
                source === "compose" ?
                  <>
                    <Button onClick={handleMediaSelect}>
                      Add to Compose <FaPlus style={{ marginLeft: "8px" }} />
                    </Button>
                    <Button onClick={() => fileInputRef.current.click()} >
                      <FaCloudUploadAlt />
                    </Button>
                  </>
                  :
                  <Button onClick={() => fileInputRef.current.click()}>
                    Upload File <FaCloudUploadAlt style={{ marginLeft: "8px" }} />
                  </Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSelectionMode(false);
                    setSelectedItems([]);
                  }}
                >
                  Cancel Selection
                </Button>
              )}
            </Offcanvas.Title>

            <div className="ms-auto d-flex align-items-center">
              {!selectionMode ? (
                <Button
                  variant="outline-primary"
                  className="me-2"
                  onClick={() => setSelectionMode(true)}
                >
                  Select Multiple
                </Button>
              ) : (
                <>
                  {selectedItems.length > 0 && (
                    <Button
                      variant="danger"
                      onClick={() =>
                        ConfirmationAlert(
                          `Are you sure you want to delete`,
                          "Delete",
                          handleDeleteSelected
                        )
                      }
                    >
                      Delete Selected ({selectedItems.length})
                    </Button>
                  )}
                </>
              )}
              <button
                type="button"
                className="btn btn-light custom-close-btn"
                aria-label="Close"
                onClick={handleComposeClose}
                style={{
                  backgroundColor: "white",
                  borderColor: "white",
                  borderRadius: "50%",
                  width: "2rem",
                  height: "2rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  transition: "transform 0.3s ease, background-color 0.3s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "scale(1.1)";
                  e.currentTarget.style.backgroundColor = "#f0f0f0";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.backgroundColor = "white";
                }}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
          </div>
        </Offcanvas.Header>

        <Offcanvas.Body
          className="offcanvas-body"
          style={{
            backgroundColor: isBlue ? "white" : "orange",
            transition: "background-color 0.5s ease",
            padding: "1rem",
          }}
        >
          <Form.Group controlId="filter" style={{ marginBottom: "1rem" }}>
            {!mediaUpload && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <Form.Label style={{ fontWeight: "bold" }}>Select Gallery Type</Form.Label>
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <Form.Check
                      type="radio"
                      label="Image Gallery"
                      name="filter"
                      value="image"
                      checked={selectedFilter === "image"}
                      onChange={(e) => setSelectedFilter(e.target.value)}
                      style={{ fontSize: "0.9rem" }}
                    />
                    <Form.Check
                      type="radio"
                      id="video-filter"
                      label="Video Gallery"
                      name="filter"
                      value="video"
                      checked={selectedFilter === "video"}
                      onChange={(e) => setSelectedFilter(e.target.value)}
                      style={{
                        fontSize: "0.9rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "7px"
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </Form.Group>

          <form onSubmit={handleSubmit(commonCompose)}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,video/mp4,video/webm,video/ogg"
              style={{ display: "none" }}
            />
            {mediaUpload && (
              <div className="upload-preview">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0">Upload Preview</h6>
                  <Button
                    variant="light"
                    size="sm"
                    onClick={handleUploadClose}
                    className="close-btn"
                  >
                    <span aria-hidden="true">&times;</span>
                  </Button>
                </div>
                <input
                  type="text"
                  {...register("title", { required: true })}
                  placeholder="Enter title"
                  className="form-control mb-3"
                />
                {mediaUpload.file_type.startsWith("image") ? (
                  <div style={{ marginTop: "1rem" }}>
                    <img
                      src={mediaUpload.preview}
                      alt="Preview"
                      style={{ width: "100%", borderRadius: "8px" }}
                    />
                    <p style={{ marginTop: "0.5rem", fontWeight: "bold" }}>
                      {shortenFileName(mediaUpload.file_name)}
                    </p>
                  </div>
                ) : (
                  <div style={{ marginTop: "1rem" }}>
                    <video
                      src={mediaUpload.preview}
                      controls
                      style={{ width: "100%", borderRadius: "8px" }}
                    />
                    <p style={{ marginTop: "0.5rem", fontWeight: "bold" }}>
                      {shortenFileName(mediaUpload.file_name)}
                    </p>
                  </div>
                )}
                <button
                  type="submit"
                  className="btn-submit"
                  style={{
                    marginTop: "1rem",
                    padding: "10px 20px",
                    fontSize: "16px",
                    fontWeight: "bold",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "#ff7f50",
                    color: "#fff",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#ff4500";
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 12px rgba(0, 0, 0, 0.15)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "#ff7f50";
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 8px rgba(0, 0, 0, 0.1)";
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </form>

          {!mediaUpload && (
            <>
              <Form.Group controlId="search" style={{ marginBottom: "1rem" }}>
                <Form.Control
                  type="text"
                  placeholder="Search by title"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </Form.Group>

              <div className="row g-3">
                {isGalleryLoading ? (
                  Array.from({ length: 9 }).map((_, idx) => (
                    <div className="col-sm-4" key={idx}>
                      <div className="card mb-3 blur-effect position-relative media-card">
                        <div className="media-container position-relative">
                          <Skeleton height={150} style={{ borderRadius: "8px" }} />
                        </div>
                        <div className="card-body p-2">
                          <h6 className="card-title mb-0">
                            <Skeleton width={80} />
                          </h6>
                        </div>
                      </div>
                    </div>
                  ))
                ) : mediaData.length === 0 ? (
                  <NoDataMessage type="gallery" galleryType={selectedFilter} />
                ) : (
                  mediaData.map((media, index) => (
                    <div className="col-sm-4" key={media.gallery_id}>
                      <div
                        className={`card mb-3 blur-effect position-relative media-card ${selectedItems.some(item => item.gallery_id === media.gallery_id) ? 'selected' : ''
                          }`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleCheckboxChange(media);
                        }}
                      >
                        <div className="media-container position-relative" data-selection-mode={selectionMode}>
                          {selectionMode && (
                            <div className="selection-indicator">
                              <div className={`checkbox ${selectedItems.some(item => item.gallery_id === media.gallery_id) ? 'checked' : ''
                                }`}>
                                {selectedItems.some(item => item.gallery_id === media.gallery_id) && '✓'}
                              </div>
                            </div>
                          )}
                          {media.file_upload === "image" ? (
                            <ImageLazyLoading
                              src={`${BASE_URL}${media.doc_path}`}
                              alt={media.title}
                              effect="blur"
                              style={{ height: "150px", objectFit: "cover", width: "100%" }}
                            />
                          ) : (
                            <video
                              src={`${BASE_URL}${media.doc_path}`}
                              controls
                              style={{ height: "150px", objectFit: "cover", width: "100%" }}
                              onPlay={handleVideoPlay}
                            />
                          )}
                          <button
                            className="delete-button"
                            onClick={(e) => handleDeleteClick(e, media)}
                          >
                            <FaTrash />
                          </button>
                          <button
                            className="preview-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreview(e, media);
                            }}
                          >
                            <FaExpand />
                          </button>
                        </div>
                        <div className="card-body p-2">
                          <h6 className="card-title mb-0">
                            {renderTitle(media.title, expandedTitles[index])}
                            {media.title.split(' ').length > 3 && (
                              <span
                                className="toggle-text"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleTitleExpansion(index);
                                }}
                              >
                                {expandedTitles[index] ? " less" : " more"}
                              </span>
                            )}
                          </h6>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </Offcanvas.Body>
      </Offcanvas>

      <Modal
        show={showPreviewModal}
        onHide={() => {
          setShowPreviewModal(false);
          setExpandedModalTitle(false);
        }}
        centered
        className="preview-modal"
        size="md"
        style={{ zIndex: 1060 }}
      >
        <Modal.Header closeButton>
          <Modal.Title className="modal-title h6">
            {previewMedia && (
              <>
                {renderTitle(previewMedia.title, expandedModalTitle, Infinity)}
                {previewMedia.title.split(' ').length > 3 && (
                  <span
                    className="toggle-text modal-toggle"
                    onClick={() => setExpandedModalTitle(!expandedModalTitle)}
                  >
                    {expandedModalTitle ? " show less" : " show more"}
                  </span>
                )}
              </>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-2">
          {!previewMedia ? (
            <Skeleton height={250} />
          ) : previewMedia?.file_upload === "image" ? (
            <img
              src={`${BASE_URL}${previewMedia?.doc_path}`}
              alt={previewMedia?.title}
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "50vh",
                objectFit: "contain"
              }}
            />
          ) : (
            <video
              src={`${BASE_URL}${previewMedia?.doc_path}`}
              controls
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "50vh"
              }}
            />
          )}
        </Modal.Body>
      </Modal>

      <style jsx>{`
        .preview-modal .modal-content {
          z-index: 1060;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
        }

        .modal-backdrop {
          z-index: 1040;
        }

        .media-container {
          position: relative;
          overflow: hidden;
        }

        .preview-button {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(0, 0, 0, 0.5);
          border: none;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 3;
        }

        .media-container:hover .preview-button {
          opacity: 1;
        }

        .preview-modal .modal-content {
          max-width: 500px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
        }

        .preview-modal .modal-body {
          padding: 0.5rem;
        }

        .preview-modal .modal-header {
          padding: 0.5rem 1rem;
        }

        .preview-modal .modal-title {
          font-size: 1rem;
          margin-right: 15px;
        }

        .preview-modal.fade .modal-dialog {
          transform: scale(0.7);
          transition: transform 0.3s ease-out;
        }

        .preview-modal.show .modal-dialog {
          transform: scale(1);
        }

        .toggle-text {
          color: #ff7f50;
          cursor: pointer;
          font-size: 0.8rem;
          margin-left: 4px;
        }

        .selected {
          background-color: #ff7f50;
          transform: scale(1.05);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .modal-title {
          font-size: 1.1rem;
          line-height: 1.4;
          margin-right: 20px;
        }

        .modal-toggle {
          display: inline-block;
          margin-left: 8px;
          color: #ff7f50;
          cursor: pointer;
          font-size: 0.9rem;
          transition: color 0.3s ease;
        }

        .modal-toggle:hover {
          color: #ff4500;
        }

        .card-title {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        .checkbox-wrapper {
          position: absolute;
          top: 8px;
          right: 8px;
          z-index: 2;
        }

        .media-checkbox {
          width: 20px;
          height: 20px;
          cursor: pointer;
          opacity: 0.8;
          transition: opacity 0.3s ease;
        }

        .media-checkbox:hover {
          opacity: 1;
        }

        .delete-button {
          position: absolute;
          top: 8px;
          left: 40px;
          background: rgba(255, 0, 0, 0.5);
          border: none;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .media-container:hover .delete-button {
          opacity: 1;
        }

        .delete-button:hover {
          background: rgba(255, 0, 0, 0.8);
        }

        .select-all-wrapper {
          display: flex;
          align-items: center;
          margin-right: 1rem;
        }

        .delete-button {
          position: absolute;
          top: 8px;
          left: 8px;
          background: rgba(255, 0, 0, 0.5);
          border: none;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 2;
        }

        .media-container:hover .delete-button {
          opacity: 1;
        }

        .delete-button:hover {
          background: rgba(255, 0, 0, 0.8);
        }

        .checkbox-wrapper {
          position: absolute;
          top: 8px;
          right: 8px;
          z-index: 2;
        }

        .media-checkbox {
          margin: 0;
        }

        .media-card {
          cursor: default;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .media-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .media-card.selected {
          border-color: #007bff;
          background-color: rgba(0, 123, 255, 0.05);
        }

        .selection-indicator {
          position: absolute;
          top: 8px;
          right: 8px;
          z-index: 2;
        }

        .checkbox {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid white;
          background-color: rgba(255, 255, 255, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #007bff;
          font-weight: bold;
          transition: all 0.2s ease;
        }

        .checkbox.checked {
          background-color: #007bff;
          color: white;
        }

        .media-container {
          position: relative;
          overflow: hidden;
        }

        .media-container::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.1);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .selected .media-container::after {
          opacity: 1;
        }

        [data-selection-mode="true"] .delete-button,
        [data-selection-mode="true"] .preview-button {
          display: none !important;
        }

        .upload-preview {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 3rem;
        }

        .close-btn {
          width: 30px;
          height: 30px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }

        .close-btn:hover {
          background-color: #e9ecef;
        }

        .gallery-section {
          transition: all 0.3s ease;
        }

        .gallery-section.mt-4 {
          margin-top: 1.5rem;
        }
      `}</style>
    </>
  );
};

export default ShowComposeModal;