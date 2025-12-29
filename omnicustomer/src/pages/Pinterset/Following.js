import React, { useState, useEffect } from 'react'
import { fetchPintrestFollowing } from '../../utils/ApiClient'
import InfiniteScrollWrapper from '../../common/components/InfinityScrollWrapper'
import { triggerAlert } from '../../utils/CommonFunctions'
import SpinnerLoader from '../../common/components/SpinnerLoader'
import { Button, Modal } from 'react-bootstrap'


const Following = ({ isFollowingModal, handleFollowingModalClose }) => {
    const [following, setFollowing] = useState([])
    const [pageNumber, setPageNumber] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true)

    const limitsize = 10
    const fetchFollowingData = async (pageNumber, limitsize) => {
        try {
            const response = await fetchPintrestFollowing(pageNumber, limitsize)
            if (response.data.error_code === 200) {
                setFollowing(response.data.results.following)
                setTotalPages(response.data.results.total_pages)
            } else {
                console.log("Error fetching profile:", response.data.message);
                triggerAlert("error", "Oops...", response.data.message || "Failed to fetch profile data");
            }
            setInitialLoading(false)
            return response.data.results.following;
        }
        catch (error) {
            console.log('Error fetching profile:', error.message);
            triggerAlert("error", "Oops...", "An error occurred while fetching profile data");
            setInitialLoading(false)
            return [];
        }
    }

    useEffect(() => {
        fetchFollowingData(pageNumber, limitsize)
    }, [])

    const fetchMoreData = async () => {
        try {
            const nextPageNumber = pageNumber + 1;
            const nextPageData = await fetchFollowingData(nextPageNumber, limitsize);
            if (Array.isArray(nextPageData)) {
                // Append the new data to the existing data
                setFollowing(prevFollowing => [...prevFollowing, ...nextPageData]);
                setPageNumber(nextPageNumber);
            } else {
                console.error('The fetched data is not an array:', nextPageData);
            }
        } catch (error) {
            console.error('Failed to fetch more data:', error);
        }
    };

    const handleFetchMoreData = async () => {
        if (pageNumber < totalPages) {
            setLoadingMore(true);
            await fetchMoreData();
            setLoadingMore(false);

            if (pageNumber + 1 >= totalPages) {
                setHasMore(false);
            }
        } else {
            setHasMore(false);
        }
    };

    // Skeleton loading component
    const SkeletonLoading = () => (
        <div>
            {[1, 2, 3, 4, 5].map(item => (
                <div key={item} className="d-flex align-items-center mb-2">
                    <div className="me-2">•</div>
                    <div className="skeleton-line" style={{
                        height: '20px',
                        width: '80%',
                        backgroundColor: '#e0e0e0',
                        borderRadius: '4px',
                        animation: 'pulse 1.5s infinite ease-in-out'
                    }}></div>
                </div>
            ))}
            <style jsx>{`
                @keyframes pulse {
                    0% { opacity: 0.6; }
                    50% { opacity: 1; }
                    100% { opacity: 0.6; }
                }
            `}</style>
        </div>
    );

    return (
        <Modal show={isFollowingModal} onHide={handleFollowingModalClose}>
            <Modal.Header closeButton>
                <Modal.Title>Following</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <InfiniteScrollWrapper
                    dataLength={following.length}
                    next={handleFetchMoreData}
                    hasMore={hasMore}
                    inverse={false}
                    loader={null}
                    scrollableTarget="scrollableDivContacts"
                >
                    {initialLoading ? (
                        <SkeletonLoading />
                    ) : (
                        <>
                            {loadingMore && (
                                <h4 className="text-center text-danger">
                                    <SpinnerLoader />
                                </h4>
                            )}
                            {following.length > 0 ? (
                                <ul className="list-unstyled">
                                    {following.map((item, index) => (
                                        <li key={index} className="mb-2" style={{ cursor: 'pointer' }}>
                                            <span className="me-2">•</span>
                                            {item.username}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center">No users found!</p>
                            )}
                        </>
                    )}
                </InfiniteScrollWrapper>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleFollowingModalClose} className="w-100">
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default Following
