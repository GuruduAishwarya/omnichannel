import React, { useEffect, useRef, useState } from 'react';
import { Button, Modal, Form, Dropdown } from 'react-bootstrap';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { fetchPins, pinstrestSectionDetails, pintrestBoardDetails, pintrestBoardSection, pintrestEditSection, pintrestDeleteSection, boardpinslisting } from '../../utils/ApiClient';
import { useForm } from 'react-hook-form';
import { MaxLengthValidation } from '../../utils/Constants';
import { ConfirmationAlert, getBase64, triggerAlert } from '../../utils/CommonFunctions';
import { pinsImage } from './constants';
import { FaRegFolder } from 'react-icons/fa6';
import { GrGallery } from 'react-icons/gr';
import { formatDateTime } from '../../utils/CommonFunctions';
import Loader from '../../common/components/Loader';
import InfiniteScrollWrapper from '../../common/components/InfinityScrollWrapper';
import './pintrest.css';
import SectionPinsView from './SectionPinsView';

const PintrestView = () => {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();
  const [boardData, setBoardData] = useState(null);
  const [data, setData] = useState([]);
  const [show, setShow] = useState(false);
  const [modifyMode, setModifyMode] = useState("create");
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedSection, setSelectedSection] = useState({});
  const fileInputRef = useRef(null);
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const [totalNumberPages, setTotalNumberPages] = useState(0);
  const [pinsData, setPinsData] = useState([]);
  const [hasMoreContacts, setHasMoreContacts] = useState(true);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [showContainer, setShowContainer] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [show1, setShow1] = useState(false);
  const scrollRef = useRef(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [showSectionPins, setShowSectionPins] = useState(false);
  const [allBoardPins, setAllBoardPins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pinName, setPinname] = useState({});

  const location = useLocation();
  const navigate = useNavigate();
  const { boardItem } = location.state || {};

  const scroll = (direction) => {
    const { current } = scrollRef;
    if (current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const boardItemId = location.state?.boardItem;
    setBoardData(boardItemId);
    fetchBoardDetails();
    fetchAllPins();
  }, [id]);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleCloseModal = () => {
    setShow1(false);
    setAlertMessage("");
    setSelectedFile(null);
    reset();
  };
  const handleShowModal = () => setShow1(true);

  const handleSelectedPost = (item) => {
    if (item) setSelectedSection(item);
  };

  const handleBack = () => setShowContainer(false);

  const handleSectionDetails = (item) => {
    handleShowModal();
    handleSelectedPost(item);
    reset();
  };

  const handleDeleteSection = async (item) => {
    ConfirmationAlert('You want to continue!', 'Continue', async () => {
      setLoading(true);
      try {
        const response = await pintrestDeleteSection(item);
        if (response.status === 200) {
          triggerAlert('success', "", "Successfully deleted");
          await fetchBoardDetails();
        } else {
          triggerAlert('error', "", "Failed to delete section");
        }
      } catch (error) {
        console.error("Error deleting section:", error);
        triggerAlert('error', "", error.response?.data?.message || "Error deleting section");
      } finally {
        setLoading(false);
      }
    });
  };

  const handleAddSection = () => {
    handleShow();
    setModifyMode("create");
    reset();
  };

  const handleEditSection = (item) => {
    handleShow();
    setModifyMode("edit");
    setValue('name', item.name);
    setValue('description', item.description);
    setSelectedSectionId(item.section_board_id);
  };

  const fetchBoardDetails = async () => {
    try {
      setLoading(true);
      const response = await pintrestBoardDetails(id);
      setData(response.data.results);
    } catch (err) {
      console.log(err.message);
      triggerAlert('error', "", "Failed to fetch board details");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToBoard = () => {
    navigate('/pinterest/profile', { state: { active: 'board' } });
  };

  const handleModalShow = (mediaUrl, mediaType) => {
    setSelectedImage({
      url: mediaUrl,
      type: mediaType || (isVideoUrl(mediaUrl, 'unknown') ? 'video' : 'image')
    });
    setShowModal(true);
  };

  const handleModalClose = () => {
    setSelectedImage(null);
    setShowModal(false);
  };

  const createSectionData = async (sectionData) => {
    // Close the modal first before any API operations
    handleClose();

    try {
      let response;
      let errorCode;

      if (modifyMode === "create") {
        response = await pintrestBoardSection(id, sectionData);
        errorCode = 201;
      } else {
        response = await pintrestEditSection(selectedSectionId, sectionData);
        errorCode = 200;
      }

      const responseSection = response.data;
      if (responseSection.error_code === errorCode) {
        triggerAlert('success', responseSection?.message || (modifyMode === "create" ? 'Section created successfully' : 'Section updated successfully'));
        await fetchBoardDetails();
      } else {
        triggerAlert('error', '', responseSection?.message || "Operation failed with unexpected response");
      }
    } catch (error) {
      const responseData = error?.response?.data;
      triggerAlert('error', '', responseData ? responseData.message : "Something went wrong!");
      return false;
    }
  };

  const sectionDetails = async (values) => {
    try {
      if (!boardData || !boardData.board_id || !selectedSection || !selectedSection.section_board_id || !selectedFile || !selectedFile.preview) {
        throw new Error("Required data is missing");
      }

      const params = {
        title: values?.name || "Untitled",
        description: values?.description || "No description",
        board_id: boardData.board_id,
        board_section_id: selectedSection.section_board_id,
        image_data: selectedFile.base64WithoutPrefix,
      };
      await pinstrestSectionDetails(params);
      handleCloseModal();
      triggerAlert('success', 'Pin added successfully');
    } catch (error) {
      console.error("Error adding pin:", error);
      triggerAlert('error', 'Failed to add pin');
    }
  };

  const limitPerPage = 5;

  const pintrestPinData = async (id, page, limitPerPage) => {
    setShowContainer(true);
    setSelectedSectionId(id);
    setLoading(page === 1 ? true : false);
    setIsMoreLoading(page > 1 ? true : false);

    try {
      const params = { board_section_id: id, page, page_size: limitPerPage };
      const response = await fetchPins(params);

      if (response.data.error_code === 200) {
        const data = response.data.results.pins;
        const total_items = response.data.results.total_pages;

        setTotalNumberPages(total_items);
        setPinsData(prevData => page === 1 ? data : [...prevData, ...data]);
        setHasMoreContacts(page < total_items);
        setPageNumber(page);
      } else {
        if (page === 1) setPinsData([]);
        setHasMoreContacts(false);
      }
    } catch (err) {
      console.error("Error fetching pins:", err);
      if (page === 1) setPinsData([]);
      setHasMoreContacts(false);
    } finally {
      setLoading(false);
      setIsMoreLoading(false);
    }
  };

  const handleFetchMoreContacts = async () => {
    if (isMoreLoading || pageNumber >= totalNumberPages) return;
    await pintrestPinData(selectedSectionId, pageNumber + 1, limitPerPage);
  };

  const handleThumbnail = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setAlertMessage({ type: "warning", message: "Thumbnail size must be less than 20MB" });
      return;
    }

    const allowedFormats = ["image/jpeg", "image/png"];
    if (!allowedFormats.includes(file.type)) {
      setAlertMessage({ type: "warning", message: "Only JPG or PNG formats are allowed" });
      return;
    }

    const base64 = await getBase64(file);
    setSelectedFile({
      preview: base64,
      base64WithoutPrefix: base64.split(',')[1]
    });
    setAlertMessage(null);
  };

  const handleUploadClick = () => fileInputRef.current.click();

  const handleViewSection = (sectionId) => {
    setSelectedSectionId(sectionId.id);
    setPinname(sectionId);
    setShowSectionPins(true);
  };

  const handleBackFromSectionPins = () => {
    setShowSectionPins(false);
    setSelectedSectionId(null);
  };

  const fetchAllPins = async () => {
    setIsLoading(true);
    try {
      const response = await boardpinslisting(id);
      if (response.data && response.data.error_code === 200 && response.data.results) {
        setAllBoardPins(response.data.results);
      } else {
        setAllBoardPins([]);
      }
    } catch (error) {
      console.error('Error fetching board pins:', error);
      setAllBoardPins([]);
    } finally {
      setIsLoading(false);
    }
  };

  const isVideoUrl = (url, postType) => {
    return postType === 'video' || url.endsWith('.mp4') || url.endsWith('.mov') || url.endsWith('.avi');
  };

  const renderMedia = (pin) => {
    const isVideo = isVideoUrl(pin.video_urls || pin.media_url);

    if (isVideo) {
      return (
        <div className="video-wrapper">
          <video
            className="img-fluid rounded"
            preload="metadata"
            poster={pin.thumbnail_url || ''}
            style={{ objectFit: 'cover', height: '100%', width: '100%' }}
          >
            <source src={pin.video_urls || pin.media_url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="video-overlay">
            <button className="btn btn-light btn-sm rounded-circle play-button">
              <i className="material-symbols-outlined">play_arrow</i>
            </button>
          </div>
        </div>
      );
    } else {
      return (
        <img
          src={pin.video_urls || pin.media_url}
          alt={pin.title}
          className="img-fluid rounded"
          style={{ objectFit: 'cover', height: '100%', width: '100%' }}
        />
      );
    }
  };

  const renderPinsSection = () => {
    if (isLoading) return <Loader />;

    if (!allBoardPins || allBoardPins.length === 0) {
      return (
        <div className="card">
          <div className="card-header">
            <h3>All Pins</h3>
            <p>Browse all pins in this board</p>
          </div>
          <div className="card-body">
            <div className="text-center p-5">
              <GrGallery size={40} className="mb-3" />
              <h5>No Pins Available</h5>
              <p className="text-muted">This board doesn't have any pins yet.</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="card">
        <div className="card-header">
          <h3>All Pins</h3>
          <p>Browse all pins in this board</p>
        </div>
        <div className="card-body container-fluid">
          <div className="masonry-grid">
            {allBoardPins.map((pin) => (
              <div className="masonry-item" key={pin.id}>
                <div className="image-container shadow-sm" style={{ height: '250px', overflow: 'hidden' }}>
                  {renderMedia(pin)}
                  <div className="image-overlay d-flex flex-column justify-content-between">
                    <div className="action-buttons d-flex justify-content-between">
                      <Button
                        variant="light"
                        className="btn-icon mx-2 fullscreen-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleModalShow(pin.video_urls || pin.media_url, pin.post_type);
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ color: '#0d6efd', fontSize: '24px' }}>
                          fullscreen
                        </span>
                      </Button>
                    </div>
                    <div className="image-caption text-center mt-2">
                      <strong>{pin.title}</strong>
                      {pin.description && (
                        <small className="d-block text-muted">{pin.description}</small>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderModalContent = () => {
    if (!selectedImage) return null;

    const mediaUrl = selectedImage.url;
    const isVideo = selectedImage.type === 'video';

    if (isVideo) {
      return (
        <div className="video-modal-container">
          <video controls autoPlay className="w-100">
            <source src={mediaUrl} type="video/mp4" />
            Your browser does not support video playback.
          </video>
        </div>
      );
    } else {
      return (
        <div className="image-modal-container">
          <img src={mediaUrl} alt="Preview" className="w-100" />
        </div>
      );
    }
  };

  const videoStyles = `
    .video-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      cursor: pointer;
    }
    
    .video-wrapper video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .video-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(0,0,0,0.2);
      opacity: 1;
      transition: opacity 0.3s ease;
    }
    
    .video-wrapper:hover .video-overlay {
      opacity: 1;
      background-color: rgba(0,0,0,0.4);
    }
    
    .play-button {
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: white;
      border-radius: 50%;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      transition: transform 0.2s ease;
    }
    
    .play-button:hover {
      transform: scale(1.1);
    }
    
    .fullscreen-btn {
      position: relative;
      z-index: 10;
      background-color: rgba(255, 255, 255, 0.8);
      border-radius: 50%;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      transition: all 0.2s ease;
    }
    
    .fullscreen-btn:hover {
      background-color: white;
      transform: scale(1.1);
    }
    
    .image-container {
      position: relative;
      overflow: hidden;
      border-radius: 8px;
      margin-bottom: 15px;
    }
    
    .image-overlay {
      background: linear-gradient(to bottom, rgba(0,0,0,0.01) 0%, rgba(0,0,0,0.5) 100%);
    }
    
    .btn-icon {
      cursor: pointer;
    }
  `;

  if (showSectionPins && selectedSectionId) {
    return (
      <SectionPinsView
        sectionId={selectedSectionId}
        handleBack={handleBackFromSectionPins}
        name={pinName}
      />
    );
  }

  return (
    <div>
      <style>{videoStyles}</style>
      {showContainer ? (
        <div id="content-page" className="content-page">
          <div className="row justify-content-center">
            <div className="col-lg-11">
              <div className="card">
                <div className="card-header d-flex justify-content-between">
                  <div>
                    <h3>All Pins</h3>
                    <p>Browse all pins in this board</p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-warning ms-2 d-flex align-items-center"
                    onClick={handleBack}
                  >
                    Back to Section
                  </button>
                </div>

                {pinsData.length > 0 ? (
                  <div className="card-body container-fluid">
                    <InfiniteScrollWrapper
                      className="masonry-grid"
                      dataLength={pinsData.length}
                      next={handleFetchMoreContacts}
                      hasMore={hasMoreContacts}
                      loader={<div className="col-12 text-center p-3"><Loader /></div>}
                      endMessage={<p className="text-center mt-3">No more pins to load</p>}
                    >
                      {pinsData.map((item) => (
                        <div className="masonry-item" key={item.id}>
                          <div className="image-container shadow-sm">
                            <img
                              src={item.media_url}
                              alt={item.title}
                              className="img-fluid rounded"
                            />
                            <div className="image-overlay d-flex flex-column justify-content-between">
                              <div className="action-buttons d-flex justify-content-end">
                                <Button
                                  variant="light"
                                  className="btn-icon mx-2 fullscreen-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleModalShow(item.media_url, 'image');
                                  }}
                                >
                                  <span className="material-symbols-outlined" style={{ color: '#0d6efd', fontSize: '24px' }}>
                                    fullscreen
                                  </span>
                                </Button>
                              </div>
                              <div className="image-caption text-center mt-2">
                                {item.title}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </InfiniteScrollWrapper>
                  </div>
                ) : (
                  <div className='card-body'>
                    <div className="border border-light text-center p-5">
                      <GrGallery className='fs-3' />
                      <h6 className="fs-4">No Pins Available</h6>
                      <p>There are no pins uploaded yet. Pins will appear here once they are added.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div id="content-page" className="content-page">
            <div className="container">
              <div className="row">
                <div className="card">
                  <div className="card-header">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="item2">
                        <h4 className="fw-bold text-primary">{boardData?.name}</h4>
                        <p>{boardData?.description}</p>
                      </div>
                      <div className="item4 ms-1">
                        <button
                          type="button"
                          className="btn btn-warning ms-2 d-flex align-items-center"
                          onClick={handleBackToBoard}
                        >
                          Back to Board
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="card w-100">
                  <div className="card-header">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="item2 ms-5">
                        <h4>Board Sections</h4>
                        <p>Access the pins by clicking on a section</p>
                      </div>
                      <div className="item4 ms-1">
                        {data.length > 0 && (
                          <button
                            type="button"
                            className="btn btn-primary me-5 d-flex align-items-center"
                            onClick={handleAddSection}
                          >
                            New Section
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  {data.length > 0 ? (
                    <div className="border-dashed border-2 rounded-3 p-4 mt-4 mb-4 pt-4 position-relative">
                      <button
                        onClick={() => scroll('left')}
                        className="btn btn-light position-absolute start-0 top-50 translate-middle-y"
                        style={{ zIndex: 1 }}
                      >
                        &lt;
                      </button>
                      <div className="row flex-nowrap overflow-auto" ref={scrollRef} style={{ overflowX: 'hidden', scrollbarWidth: 'none', scrollBehavior: 'smooth' }}>
                        {data.map((item) => (
                          <div key={item.id} className="col-md-4 col-lg-3 mb-3">
                            <div
                              className="card mt-4 pt-4 rounded-4 d-flex flex-column section-card"
                              style={{ maxWidth: '18rem', marginLeft: '20px', transition: 'all 0.3s ease', cursor: 'pointer' }}
                              onClick={() => handleViewSection(item)}
                            >
                              <div className="card-header bg-transparent p-1">
                                <div className="d-flex justify-content-between align-items-center">
                                  <span style={{ paddingLeft: '1rem' }}>
                                    <FaRegFolder size={20} />
                                  </span>
                                  <div onClick={(e) => e.stopPropagation()}>
                                    <Dropdown>
                                      <Dropdown.Toggle
                                        as="button"
                                        className="btn btn-sm btn-md btn-lg border-0 bg-transparent p-2 ms-auto"
                                        style={{ fontSize: '2rem' }}
                                      />
                                      <Dropdown.Menu>
                                        <Dropdown.Item className="d-flex align-items-center" onClick={(e) => { e.stopPropagation(); handleEditSection(item); }}>
                                          <span className="material-symbols-outlined me-2">edit</span>Edit
                                        </Dropdown.Item>
                                        <Dropdown.Item className="d-flex align-items-center" onClick={(e) => { e.stopPropagation(); handleDeleteSection(item.section_board_id); }}>
                                          <span className="material-symbols-outlined me-2">delete</span>Delete
                                        </Dropdown.Item>
                                        <Dropdown.Item className="d-flex align-items-center" onClick={(e) => { e.stopPropagation(); handleSectionDetails(item); }}>
                                          <span className="material-symbols-outlined me-2">add</span>Add
                                        </Dropdown.Item>
                                      </Dropdown.Menu>
                                    </Dropdown>
                                  </div>
                                </div>
                              </div>
                              <div className="card-body">
                                <h5 className="card-title">{item.name}</h5>
                                <p className="card-text">{item.description}</p>
                                <small>Created {formatDateTime(item.created_at, 'month dd, yyyy')}</small>
                              </div>
                              <hr className="my-2" style={{ borderTop: '6px solid grey' }} />
                              <div className="card-footer bg-transparent" />
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => scroll('right')}
                        className="btn btn-light position-absolute end-0 top-50 translate-middle-y"
                        style={{ zIndex: 1 }}
                      >
                        &gt;
                      </button>
                    </div>
                  ) : (
                    <div className="card-body">
                      <div className="border border-light text-center p-5">
                        <h6 className="fs-4">No Sections yet</h6>
                        <p>Create sections to organise Pins</p>
                        <Button variant="outline-primary" onClick={handleAddSection}>
                          Create your First Section
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="row">
                {renderPinsSection()}
              </div>

              <Modal show={show} onHide={handleClose} centered size="md" aria-labelledby="addToBoardModal">
                <Modal.Header closeButton>
                  <Modal.Title id="addToBoardModal">Create Section</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit(createSectionData)}>
                  <Modal.Body>
                    <Form.Group className="mb-3" controlId="boardName">
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter section name"
                        {...register("name", { required: "Section name is required", maxLength: MaxLengthValidation(100) })}
                      />
                      {errors.name && <div className="text-danger small mt-1">{errors.name.message}</div>}
                    </Form.Group>
                    <Form.Group controlId="boardDescription">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Enter section description"
                        {...register("description", { required: "Section description is required", maxLength: MaxLengthValidation(300) })}
                      />
                      {errors.description && <div className="text-danger small mt-1">{errors.description.message}</div>}
                    </Form.Group>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="outline-secondary" onClick={handleClose}>Cancel</Button>
                    <Button variant="primary" type="submit">
                      {modifyMode === "create" ? "Create" : "Update"}
                    </Button>
                  </Modal.Footer>
                </Form>
              </Modal>

              <Modal show={show1} onHide={handleCloseModal} centered size="xl" aria-labelledby="addToBoardModal">
                <Modal.Header closeButton>
                  <Modal.Title id="addToBoardModal">Add Pins</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit(sectionDetails)}>
                  <Modal.Body>
                    <div className="row align-items-center">
                      <div className="col-lg-6">
                        {!selectedFile ? (
                          <>
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleThumbnail}
                              className="d-none"
                              accept="image/*"
                            />
                            <div
                              onClick={handleUploadClick}
                              className="upload-area p-4 border-dashed rounded w-100"
                              style={{ borderWidth: '3px' }}
                            >
                              <div className="mb-2">
                                <svg className="upload-icon" width="64" height="64" viewBox="0 0 24 24" style={{ strokeWidth: '3' }}>
                                  <path
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                    stroke="currentColor"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                  />
                                </svg>
                              </div>
                              <div className="text-center">
                                <span className="text-muted">Upload Pin</span><br /><br />
                                <p className='text-primary'>Only: JPG, PNG, JPEG<br />File size below 20MB</p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="d-inline-block border-dashed rounded position-relative w-100">
                            <img src={selectedFile.preview} alt='thumbnail' style={{ height: '7.2rem', width: '10rem', objectFit: 'contain' }} />
                            <button
                              onClick={() => setSelectedFile(null)}
                              style={{
                                position: "absolute",
                                top: "-10px",
                                right: "-10px",
                                background: "black",
                                color: "white",
                                width: "20px",
                                height: "20px",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "none",
                                cursor: "pointer"
                              }}
                            >
                              ×
                            </button>
                          </div>
                        )}
                        {alertMessage && (
                          <div className={`alert alert-${alertMessage.type} mb-3`} role="alert" style={{ color: "black", fontWeight: 'bold' }}>
                            {alertMessage.message}
                          </div>
                        )}
                      </div>
                      <div className="col-lg-6">
                        <div className="card p-2 h-100">
                          <div className="mb-3">
                            <Form.Group controlId="boardName">
                              <Form.Label>Title</Form.Label>
                              <Form.Control
                                type="text"
                                placeholder="Enter board title"
                                {...register("name", { required: "Board name is required", maxLength: MaxLengthValidation(100) })}
                              />
                              {errors.name && <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>{errors.name.message}</div>}
                            </Form.Group>
                          </div>
                          <div className="mb-3">
                            <Form.Group controlId="boardDescription">
                              <Form.Label>Description</Form.Label>
                              <Form.Control
                                type="text"
                                placeholder="Enter board description"
                                {...register("description", { required: "Board Description Is Required", maxLength: MaxLengthValidation(300) })}
                              />
                              {errors.description && <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>{errors.description.message}</div>}
                            </Form.Group>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="warning" onClick={handleCloseModal}>Cancel</Button>
                    <Button variant="primary" type="submit">Done</Button>
                  </Modal.Footer>
                </Form>
              </Modal>

              <Modal
                show={showModal}
                onHide={handleModalClose}
                centered
                id="imageDetailModal"
                backdrop="static"
              >
                <Modal.Header closeButton>
                  <Modal.Title>
                    {selectedImage && selectedImage.type === 'video' ? 'Video Preview' : 'Image Preview'}
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0">
                  {renderModalContent()}
                </Modal.Body>
              </Modal>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PintrestView;