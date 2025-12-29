import React, { useEffect, useState } from 'react';
import { Button, Modal, Dropdown } from 'react-bootstrap';
import { GrGallery } from 'react-icons/gr';
import Loader from '../../common/components/Loader';
import InfiniteScrollWrapper from '../../common/components/InfinityScrollWrapper';
import { fetchPins } from '../../utils/ApiClient';

const SectionPinsView = ({ sectionId, handleBack, name }) => {
  const [loading, setLoading] = useState(true);
  const [pinsData, setPinsData] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const PAGE_SIZE = 9;

  useEffect(() => {
    fetchSectionPins(1);
  }, [sectionId]);

  const fetchSectionPins = async (page) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const params = {
        board_section_id: sectionId,
        page: page,
        page_size: PAGE_SIZE,
      };

      const response = await fetchPins(params);

      if (response.data.error_code === 200) {
        const newPins = response.data.results.pins;
        const totalPages = response.data.results.total_pages;

        setPinsData(prevPins => 
          page === 1 ? newPins : [...prevPins, ...newPins]
        );
        
        setHasMore(page < totalPages);
        setPageNumber(page);
      } else {
        if (page === 1) setPinsData([]);
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching section pins:", error);
      if (page === 1) setPinsData([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchSectionPins(pageNumber + 1);
    }
  };

  const handleModalShow = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  return (
    <div id="content-page" className="content-page">
      <div className="container">
        <div className="row">
          <div className="col-sm-12">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <div className='ms-5'>
                  <h4 className="mb-0">{name.name}</h4>
                  <small className="text-muted">{name.description}</small>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-warning"
                  onClick={handleBack}
                >
                  Back to Section
                </button>
              </div>
              
              <div className="card-body p-0 px-2">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="d-flex flex-column align-items-center">
                      <Loader />
                      <p className="mt-3">Loading pins...</p>
                    </div>
                  </div>
                ) : pinsData.length > 0 ? (
                  <InfiniteScrollWrapper
                    className="masonry-grid"
                    dataLength={pinsData.length}
                    next={loadMore}
                    hasMore={hasMore}
                    loader={
                      isLoadingMore && (
                        <div className="col-12 text-center py-4">
                          <Loader />
                          <p className="mt-2">Loading more pins...</p>
                        </div>
                      )
                    }
                    endMessage={
                      <div className="col-12 text-center py-3">
                        <p className="text-muted">No more pins to load</p>
                      </div>
                    }
                    scrollThreshold={0.8}>
                    {pinsData.map((item) => (
                      <a  style={{color: 'white'}} onClick={() => handleModalShow(item.media_url)}><div className="masonry-item" key={item.id}>
                        <div className="image-container">
                          <img
                            src={item.media_url}
                            alt={item.title}
                            className="w-100 rounded"
                          />
                          <div className="image-overlay">
                            <div className="d-flex justify-content-end " style={{cursor: 'pointer'}}>
                                  <span className="material-symbols-outlined me-2 mt-2">fullscreen</span>
                            </div>
                            <div className="image-caption">
                              {item.title}
                            </div>
                          </div>
                        </div>
                      </div>
                      </a>
                    ))}
                  </InfiniteScrollWrapper>
                ) : (
                  <div className="text-center py-5">
                    <div className="border border-light rounded p-5">
                      <GrGallery size={40} className="mb-3 text-muted" />
                      <h5 className="mb-2">No Pins Available</h5>
                      <p className="text-muted mb-0">There are no pins uploaded yet in this section.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal show={showModal} onHide={handleModalClose} centered id="imageDetailModal">
        <Modal.Header closeButton>
          <Modal.Title>Image Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <img src={selectedImage} alt="Preview" className="w-100" />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default SectionPinsView;