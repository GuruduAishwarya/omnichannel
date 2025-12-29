import React, { useEffect, useState } from 'react'
import { fetchPintrestFollowers } from '../../utils/ApiClient'
import InfiniteScrollWrapper from '../../common/components/InfinityScrollWrapper'
import { triggerAlert } from '../../utils/CommonFunctions'
import SpinnerLoader from '../../common/components/SpinnerLoader'
import { Button, Modal } from 'react-bootstrap'

const Followers = ({ handlFollowersModalClose, IsfollowersModal }) => {
    const [followers, setFollowers] = useState([])
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [pageNumber, setPageNumber] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [initialLoading, setInitialLoading] = useState(true)

    useEffect(() => {
        fetchFollowersData(pageNumber, limitsize)
    }, [])

    const fetchFollowersData = async (pageNumber, limitsize) => {
        try {
            const response = await fetchPintrestFollowers(pageNumber, limitsize)
            if (response.data.error_code === 200) {
                setFollowers(response.data.results.followers)
                setTotalPages(response.data.results.total_pages)
            } else {
                console.log("Error fetching profile:", response.data.message);
                triggerAlert("error", "Oops...", response.data.message || "Failed to fetch profile data");
            }
            setInitialLoading(false)
            console.log(response.data)
            return response.data.results.followers;
        }
        catch (error) {
            console.log('Error fetching profile:', error.message);
            triggerAlert("error", "An error occurred while fetching profile data");
            setInitialLoading(false)
            return [];
        }
    }

    const limitsize = 10

    const fetchMoreData = async () => {
        try {
            const nextPageNumber = pageNumber + 1;
            const nextPageData = await fetchFollowersData(nextPageNumber, limitsize);
            if (Array.isArray(nextPageData)) {
                setFollowers(prevFollowers => [...prevFollowers, ...nextPageData]);
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
        <Modal show={IsfollowersModal} onHide={handlFollowersModalClose}>
            <Modal.Header closeButton>
                <Modal.Title>Followers</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <InfiniteScrollWrapper
                    dataLength={followers.length}
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
                            {followers.length > 0 ? (
                                <ul className="list-unstyled">
                                    {followers.map((item, index) => (
                                        <li key={index} className="mb-2" style={{ cursor: 'pointer' }}>
                                            <span className="me-2">•</span>
                                            {item.username}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center">No Followers found!</p>
                            )}
                        </>
                    )}
                </InfiniteScrollWrapper>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handlFollowersModalClose} className="w-100">
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default Followers
