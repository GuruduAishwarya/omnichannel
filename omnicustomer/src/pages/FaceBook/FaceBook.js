import React, { useRef, useState, useEffect } from 'react';
import { getBase64, pageReload, triggerAlert, ConfirmationAlert, truncateName, formatDateTime, formatCount, transformText, getCookie, get_user_menu_permission, isCustomerUser } from '../../utils/CommonFunctions';
import { FacebookProfile, FacebookProfileListing, FaceBookDelete, FaceBookEditPost, FaceBookListComment, FaceBookComments, FaceBookCommentDelete, postFacebookReply, FaceBookPostLike } from '../../utils/ApiClient';
import InfiniteScrollWrapper from "../../common/components/InfinityScrollWrapper";
import { Modal } from 'react-bootstrap';
import ImageLazyLoading from '../../common/components/ImageLazyLoading';
import SpinnerLoader from '../../common/components/SpinnerLoader';
import Loader from '../../common/components/Loader';
import Skeleton from 'react-loading-skeleton';
import { getMenuId } from "../../utils/Constants";

const NoDataMessage = ({ type, customMessage }) => {
    const messages = {
        post: {
            icon: 'diversity_3',
            title: 'Your Feed is Empty',
            description: 'Start sharing your experiences and engaging with the community. Your updates will be displayed here',
            iconColor: '#4f46e5',
            backgroundColor: '#fff',
        },
        comment: {
            icon: 'forum',
            title: 'Start the Conversation',
            description: 'Be the first to share your thoughts on this post.',
            iconColor: '#0891b2'
        },
        profile: {
            icon: 'account_circle',
            title: 'Profile Not Available',
            description: 'This profile information is currently unavailable.',
            iconColor: '#0d9488'
        },
        image: {
            icon: 'image_not_supported',
            title: 'Image Not Available',
            description: 'The image content cannot be displayed at the moment.',
            iconColor: '#dc2626'
        },
        video: {
            icon: 'smart_display',
            title: 'Video Not Available',
            description: 'The video content cannot be displayed at the moment.',
            iconColor: '#9333ea'
        },
        custom: {
            icon: 'info',
            title: customMessage || 'Content Unavailable',
            description: 'The requested content is not available at this time.',
            iconColor: '#64748b'
        }
    };

    const messageData = messages[type] || messages.custom;

    return (
        <div className="col-12">
            <div className="text-center p-4">
                <div className="no-data-wrapper"
                    style={{
                        background: `${messageData.backgroundColor} ? ${messageData.backgroundColor} : ${messageData.iconColor}08`,
                        padding: '.5rem',
                        borderRadius: '12px',
                    }}>
                    <div
                        className="icon-wrapper mb-3"
                        style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            background: `${messageData.iconColor}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto',
                            marginBottom: '1rem'
                        }}>
                        <span
                            className="material-symbols-outlined"
                            style={{
                                fontSize: '32px',
                                color: messageData.iconColor,
                                animation: 'fadeIn 0.5s ease-in-out'
                            }}>
                            {messageData.icon}
                        </span>
                    </div>
                    <h4
                        style={{
                            color: '#1f2937',
                            fontWeight: '600',
                            marginBottom: '0.75rem'
                        }}>
                        {messageData.title}
                    </h4>
                    <p
                        style={{
                            color: '#6b7280',
                            fontSize: '0.95rem',
                            lineHeight: '1.5',
                            maxWidth: '300px',
                            margin: '0 auto'
                        }}>
                        {messageData.description}
                    </p>
                </div>
            </div>
        </div>
    );
};

const styles = `
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.no-data-wrapper {
    animation: fadeIn 0.4s ease-out;
    transition: all 0.3s ease;
}

.no-data-wrapper:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.no-data-wrapper .icon-wrapper {
    transition: transform 0.3s ease;
}

.no-data-wrapper:hover .icon-wrapper {
    transform: scale(1.1);
}`;

export default function FaceBook() {
    const [userData, setUserData] = useState([]);
    const [facebookList, setFacebookList] = useState([]);
    const [perPageLimit, setPerPageLimit] = useState(10);
    const [totalNumberPages, setTotalNumberPages] = useState(0);
    const [hasMorePosts, setHasMorePosts] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingComments, setIsLoadingComments] = useState(null);
    const [isLoadingCommentSubmit, setIsLoadingCommentSubmit] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [showEditModal, setShowEditModal] = useState(false);
    const [comments, setComments] = useState({});
    const [newComment, setNewComment] = useState({});
    const [replyInfo, setReplyInfo] = useState({});
    const [selectedPost, setSelectedPost] = useState({});
    const [visibleComments, setVisibleComments] = useState(null);
    const [likeCount, setLikeCount] = useState({});
    const [commentCount, setCommentCount] = useState({});
    const [validationError, setValidationError] = useState({});
    const [expandedTitles, setExpandedTitles] = useState({});
    const [totalItems, setTotalItems] = useState(0);
    const [postLoading, setPostLoading] = useState({});
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [loadingComments, setLoadingComments] = useState({});
    const defaultImage = "/assets/images/icon-7797704_1280.png";
    const [deletingPostId, setDeletingPostId] = useState(null);
    const [postTypes, setPostTypes] = useState({});
    const videoRefs = useRef({});
    const [hasMoreComments, setHasMoreComments] = useState(true);
    const [commentInput, setCommentInput] = useState('');

    const [viewPermission, setViewPermission] = useState(true);
    const [addPermission, setAddPermission] = useState(false);
    const [editPermission, setEditPermission] = useState(false);
    const [deletePermission, setDeletePermission] = useState(false);
    const [exportPermission, setExportPermission] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const handleShowEditModal = (postItem) => {
        console.log("DEBUG - Edit modal attempted with permission:", editPermission);
        if (!editPermission) {
            setErrorMessage("You don't have permission to edit posts");
            hideErrorAfterDelay();
            console.log("DEBUG - Edit blocked due to permissions");
            return;
        }

        setShowEditModal(true);
        setSelectedPost({
            id: postItem.post_id,
            title: postItem.description,
            image_urls: postItem.image_urls,
            created_at: postItem.created_at
        });
        console.log("DEBUG - Edit modal opened for post:", postItem.post_id);
    };

    const hideErrorAfterDelay = () => {
        setTimeout(() => setErrorMessage(null), 5000);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
    };

    const handleChange = (e) => {
        setSelectedPost((prevPost) => ({
            ...prevPost,
            title: e.target.value,
        }));
    };
    const workspace_id_from_cookie = getCookie('selected_workspace_id');
    const [workspaceId, setWorkspaceId] = useState(workspace_id_from_cookie || "");
    const fetchProfileData = async () => {
        if (!workspaceId || !viewPermission) {
            return;
        }
        const user_id = '17841464028464664';
        const access_token = 'EAAFZBkHk1F7cBOxNdLxwae8IdFRBso26psWeCxdNRqY2tz2H5q8hQj7RLWUEt2dq3vwveF0ZAAx9QEQyZBa29vKK5kuJF4gHe4CKv2ZA0ZAW7v2gorLcy8UTSJMm2ebtBZAxAfhN6KjxE1FREwFrsN6tQLsVrjoDXWhJlrFGd5jYvZAj54SRdXL1rpwQTm5qgWgSW2x7xKL';

        try {
            const params = {
                access_token: access_token,
            };

            const response = await FacebookProfile(workspaceId);
            const response_data = response.data;

            if (response_data.error_code === 200) {
                const data = response_data.results;
                setUserData(data);
            } else {
                setUserData([]);
            }
        } catch (error) {
            const response_data = error?.response?.data;
            console.error('Error fetching sub-user data:', response_data?.message || 'Something went wrong!');
        }
    };

    const fetchProfileListing = async (page) => {
        if (!workspaceId || !viewPermission) {
            return;
        }
        if (isLoading) return;
        setIsLoading(true);
        setLoadingPosts(true);
        try {
            const params = {
                page_number: page,
                page_size: perPageLimit,
            };

            const response = await FacebookProfileListing(params, workspaceId);
            const responseData = response.data;

            if (responseData.error_code === 200) {
                const newPosts = responseData.results.data;
                console.log("Fetched posts:", newPosts.length);

                const newPostTypes = {};
                const newLikeCounts = {};
                const newCommentCounts = {};

                newPosts.forEach(post => {
                    newPostTypes[post.post_id] = post.post_type;
                    // Store initial like and comment counts
                    newLikeCounts[post.post_id] = post.like_count || 0;
                    newCommentCounts[post.post_id] = post.comment_count || 0;
                });

                setPostTypes(prev => ({ ...prev, ...newPostTypes }));
                setLikeCount(prev => ({ ...prev, ...newLikeCounts }));
                setCommentCount(prev => ({ ...prev, ...newCommentCounts }));

                // Use id instead of post_id for deduplication
                setFacebookList(prevList => {
                    const uniquePosts = [...prevList, ...newPosts].reduce((acc, current) => {
                        const x = acc.find(item => item.id === current.id);
                        if (!x) {
                            return acc.concat([current]);
                        } else {
                            return acc;
                        }
                    }, []);
                    console.log("Total unique posts after update:", uniquePosts.length);
                    return uniquePosts;
                });

                // Update pagination info
                setTotalNumberPages(responseData.results.pagination.total_pages);
                setTotalItems(responseData.results.pagination.total_items || 0);
                setCurrentPage(page + 1);
                setHasMorePosts(page < responseData.results.pagination.total_pages);
            } else {
                console.error("API returned error:", responseData);
            }
        } catch (error) {
            console.error("Error fetching profile listing:", error.message);
        } finally {
            setIsLoading(false);
            setLoadingPosts(false);
        }
    };

    const fetchFacebookDelete = async (id) => {
        console.log("DEBUG - Delete attempted with permission:", deletePermission);
        if (!deletePermission) {
            setErrorMessage("You don't have permission to delete posts");
            hideErrorAfterDelay();
            console.log("DEBUG - Delete blocked due to permissions");
            return;
        }

        if (!id) {
            triggerAlert("error", "Oops...", "Please select a row");
            return;
        }

        ConfirmationAlert('You want to continue!', 'Continue', async () => {
            setDeletingPostId(id);

            try {
                const response = await FaceBookDelete(id);
                const response_data = response.data;

                if (response_data.error_code === 200) {
                    const successMessage = transformText(response.data.message, 'capitalize') || "Deleted successfully!";
                    triggerAlert('success', 'Success', successMessage);

                    // Make sure we filter by id not post.id
                    setFacebookList(prevList => prevList.filter(post => post.id !== id));
                    setExpandedTitles(prev => {
                        const { [id]: _, ...rest } = prev;
                        return rest;
                    });
                } else {
                    triggerAlert('error', 'Oops...', 'Failed to delete');
                }
            } catch (error) {
                const response_data = error?.response?.data;
                triggerAlert('error', 'Oops...', response_data?.message || "Something went wrong!");
            } finally {
                setDeletingPostId(null);
            }
        });
    };

    const deleteComment = async (id, post_id, post_type) => {
        if (!deletePermission) {
            setErrorMessage("You don't have permission to delete comments");
            hideErrorAfterDelay();
            return;
        }

        if (!id) return;

        setIsLoadingComments(id);
        try {
            const response = await FaceBookCommentDelete(id);
            const response_data = response.data;

            if (response_data.error_code === 200) {
                // Create the comment key for referencing the right comment array
                const commentKey = `${post_type}_${post_id}`;

                // Immediately remove the deleted comment from the local state
                setComments(prevComments => {
                    if (!prevComments[commentKey]) return prevComments;

                    return {
                        ...prevComments,
                        [commentKey]: prevComments[commentKey].filter(comment => comment.id !== id)
                    };
                });

                // Update the comment count
                setCommentCount(prevCounts => ({
                    ...prevCounts,
                    [post_id]: Math.max(0, (prevCounts[post_id] || 1) - 1)
                }));
            } else {
                triggerAlert('error', 'Oops...', 'Failed to delete the comment');
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            triggerAlert('error', 'Oops...', 'Failed to delete the comment!');
        } finally {
            setIsLoadingComments(null);
        }
    };

    const handleCommentChange = (post_id, value) => {
        setNewComment(prevComments => ({
            ...prevComments,
            [post_id]: value
        }));
        setValidationError(prev => ({
            ...prev,
            [post_id]: false
        }));
    };

    const handleCommentSubmit = async (post_id, post_type) => {
        console.log("DEBUG - Comment submit attempted with permission:", addPermission);
        if (!addPermission) {
            setErrorMessage("You don't have permission to add comments");
            hideErrorAfterDelay();
            console.log("DEBUG - Comment submit blocked due to permissions");
            return;
        }

        const commentKey = `${post_type}_${post_id}`;
        if (!newComment[commentKey]?.trim()) {
            setValidationError(prev => ({
                ...prev,
                [commentKey]: true
            }));
            return;
        }

        setIsLoadingCommentSubmit(prevState => ({
            ...prevState,
            [commentKey]: true
        }));

        try {
            const params = {
                message: newComment[commentKey],
                post_id: post_id
            };

            if (replyInfo[post_id]?.id) {
                params.id = replyInfo[post_id].id;
                delete params.post_id;
            }

            const api_call = replyInfo[post_id]?.id
                ? postFacebookReply(params)
                : FaceBookComments(params);

            const response = await api_call;
            const response_data = response.data;

            if (response_data.error_code === 201) {
                setNewComment(prevComments => ({
                    ...prevComments,
                    [commentKey]: ''
                }));

                if (replyInfo[post_id]?.id) {
                    setReplyInfo(prevState => ({ ...prevState, [post_id]: {} }));
                }

                await handleFacebookComment(post_id, post_type, 1, true);
            }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Something went wrong!';
            const alertMessage = replyInfo[post_id]?.id ? 'Failed to reply!' : 'Failed to comment!';
            triggerAlert('error', 'Oops...', alertMessage);
        } finally {
            setIsLoadingCommentSubmit(prevState => ({
                ...prevState,
                [commentKey]: false
            }));
        }
    };

    const handleFacebookComment = async (post_id, post_type, page = 1, isAutoRefresh = false) => {
        if (!viewPermission) {
            setErrorMessage("You don't have permission to view comments");
            hideErrorAfterDelay();
            return;
        }

        const commentKey = `${post_type}_${post_id}`;
        setLoadingComments((prevState) => ({ ...prevState, [commentKey]: true }));

        if (!isAutoRefresh) {
            if (visibleComments === commentKey) {
                setVisibleComments(null);
                return;
            }
            setVisibleComments(commentKey);
        }

        try {
            const params = {
                page_number: page,
                page_size: perPageLimit,
            };

            const response = await FaceBookListComment(post_id, params);
            const responseData = response.data;

            if (responseData.error_code === 200) {
                const fetchedComments = responseData.results.data;
                setComments(prevComments => ({
                    ...prevComments,
                    [commentKey]: fetchedComments
                }));

                // Update comment count when comments are fetched
                setCommentCount(prevCounts => ({
                    ...prevCounts,
                    [post_id]: responseData.results.pagination?.total_records || fetchedComments.length || 0
                }));

                setTotalNumberPages(responseData.results.pagination.total_pages);
                setCurrentPage(page + 1)
                setHasMoreComments(page < responseData.results.pagination.total_pages)
            }
        } catch (error) {
            console.error(
                "Error fetching comments:",
                error?.response?.data?.message || "Something went wrong!"
            );
        } finally {
            setLoadingComments((prevState) => ({ ...prevState, [commentKey]: false }));
        }
    };

    const postEdit = async () => {
        if (!editPermission) {
            setErrorMessage("You don't have permission to edit posts");
            hideErrorAfterDelay();
            closeEditModal();
            return;
        }

        setIsLoading(true);
        try {
            const api_input = {
                post_id: selectedPost?.id,
                message: selectedPost?.title,
            };
            const response = await FaceBookEditPost(api_input);
            const response_data = response.data;

            if (response_data.error_code === 200) {
                triggerAlert('success', 'Success!', 'Text updated successfully.');
                closeEditModal();
                setSelectedPost({});

                setFacebookList(prevList =>
                    prevList.map(post =>
                        post.post_id === selectedPost.id ? { ...post, description: selectedPost.title } : post
                    )
                );

                setIsLoading(false);
            } else {
                triggerAlert('error', 'Oops...', response_data.message);
                setIsLoading(false);
            }
        } catch (err) {
            closeEditModal();
            setIsLoading(false);

            console.error(err);
            setIsLoading(false);
            triggerAlert('error', 'Oops...', err?.response?.data?.message || 'Failed to update');

        }
    };

    useEffect(() => {
        const menu_id = getMenuId('facebook', 'profile');
        console.log("DEBUG - Permission Check Starting for Facebook", { menuId: menu_id });
        console.log("DEBUG - Is Customer User:", isCustomerUser());

        // Always set viewPermission to true for all users
        setViewPermission(true);
        console.log("DEBUG - View Permission set to true for all users");

        if (isCustomerUser()) {
            // Customer users have all permissions
            setAddPermission(true);
            setEditPermission(true);
            setDeletePermission(true);
            setExportPermission(true);
            console.log("DEBUG - Customer user detected, all permissions granted");
        } else {
            // For sub-users, check individual permissions except view
            const addPerm = get_user_menu_permission(menu_id, 'add');
            const editPerm = get_user_menu_permission(menu_id, 'edit');
            const deletePerm = get_user_menu_permission(menu_id, 'delete');
            const exportPerm = get_user_menu_permission(menu_id, 'export');

            console.log("DEBUG - Sub-user permissions:", {
                menuId: menu_id,
                add: addPerm,
                edit: editPerm,
                delete: deletePerm,
                export: exportPerm
            });

            setAddPermission(addPerm);
            setEditPermission(editPerm);
            setDeletePermission(deletePerm);
            setExportPermission(exportPerm);
        }

        // Since viewPermission is always true, this will always execute
        console.log("DEBUG - Fetching Facebook data with permissions:", {
            view: true,
            add: isCustomerUser() ? true : get_user_menu_permission(menu_id, 'add'),
            edit: isCustomerUser() ? true : get_user_menu_permission(menu_id, 'edit'),
            delete: isCustomerUser() ? true : get_user_menu_permission(menu_id, 'delete')
        });

        fetchProfileData();
        fetchProfileListing(currentPage);
    }, []);

    const fetchFacebookPostLike = async (post_id) => {
        if (!addPermission || !post_id) return;

        try {
            const response = await FaceBookPostLike(post_id);
            const responseData = response.data;

            if (responseData.success) {
                setLikeCount(prevLikeCounts => ({
                    ...prevLikeCounts,
                    [post_id]: responseData.like_count || 0
                }));
            } else {
                console.error("Failed to fetch likes:", responseData.message);
            }
        } catch (error) {
            console.error("Error fetching likes:", error.response ? error.response.data : error.message);
        }
    };

    const handleCommentReply = (replyId, replyMessage, replyName, post_id) => {
        if (!addPermission) {
            setErrorMessage("You don't have permission to reply to comments");
            hideErrorAfterDelay();
            return;
        }

        const replyInfo = {
            id: replyId,
            message: replyMessage,
            name: replyName,
        };
        setReplyInfo(prevState => ({ ...prevState, [post_id]: replyInfo }));
    };

    const handleCloseReply = (post_id) => {
        setReplyInfo(prevState => ({ ...prevState, [post_id]: {} }));
        setNewComment(prevComments => ({ ...prevComments, [post_id]: '' }));
    };

    const toggleShowMore = (postId) => {
        setExpandedTitles(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    const renderPostContent = (item) => {
        const isExpanded = expandedTitles[item.post_id];
        const description = item.description || '';

        if (description.length <= 100) {
            return description;
        }

        return (
            <>
                {isExpanded ? description : `${description.slice(0, 100)}`}
                <button
                    className="btn btn-link p-0 ms-1"
                    style={{ color: "orange" }}
                    onClick={() => toggleShowMore(item.post_id)}
                >
                    {isExpanded ? "Show Less" : "...Show More"}
                </button>
            </>
        );
    };

    const handleVideoPlay = (postId) => {
        const videoElements = videoRefs.current;
        Object.keys(videoElements).forEach(id => {
            if (id !== postId && videoElements[id]) {
                videoElements[id].pause();
            }
        });
    };


    return (
        <div>
            <div className="position-relative">
            </div>
            <div id="content-page" className="content-page">
                <div className="container">
                    {errorMessage && (
                        <div className="alert alert-danger" role="alert">
                            {errorMessage}
                        </div>
                    )}
                    {!viewPermission ? (
                        <div className="row">
                            <div className="col-12">
                                <div className="card">
                                    <div className="card-body text-center p-5">
                                        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#6c757d' }}>
                                            no_accounts
                                        </span>
                                        <h4 className="mt-3">Permission Denied</h4>
                                        <p>You don't have permission to view Facebook content.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="row">
                            <div className="col-sm-12">
                                <div className="card">
                                    <div className="card-body profile-page p-0">
                                        {isLoading ? (
                                            <Skeleton height={200} width="100%" />
                                        ) : (
                                            <div
                                                className="cover-photo"
                                                style={{
                                                    backgroundImage: `url(${userData?.cover?.source || defaultImage})`,
                                                    width: "100%",
                                                    height: "auto",
                                                    paddingTop: "30.25%",
                                                    backgroundSize: "cover",
                                                    backgroundPosition: "center",
                                                    backgroundRepeat: "no-repeat",
                                                    borderRadius: "0.5rem",
                                                    border: "2px solid #dfe5f3b8",
                                                }}
                                            ></div>
                                        )}

                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-3">
                                <div className="">
                                    <div className="card-body">
                                        <div className="text-center">
                                            {isLoading ? (
                                                <Skeleton circle={true} height={200} width={200} />
                                            ) : (
                                                <img
                                                    className="img-fluid rounded-circle avatar-200"
                                                    src={userData?.picture?.data?.url || "/assets/images/icon-7797704_1280.png"}
                                                    alt="profile-img"
                                                    loading="lazy"
                                                    style={{ height: '200px', width: '200px' }}
                                                />
                                            )}
                                            <h4 className="mt-2 text-warning" style={{ height: '24px' }}>
                                                {isLoading ? <Skeleton width={150} /> : userData.name ? userData.name : "-"}
                                            </h4>
                                            <div className="d-flex justify-content-center align-items-center">
                                                <h4 className="mt-2 text-primary" style={{ height: '24px' }}>
                                                    {isLoading ? <Skeleton width={100} /> : userData?.fan_count ? `${userData.fan_count} Likes` : "0 Likes"}
                                                </h4>
                                                <span className="mx-2">.</span>
                                                <h4 className="mt-2 text-primary" style={{ height: '24px' }}>
                                                    {isLoading ? <Skeleton width={100} /> : userData?.followers_count ? `${userData.followers_count} Followers` : "0 Followers"}
                                                </h4>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card mt-5">
                                    <div className="card-header d-flex justify-content-between">
                                        <div className="header-title">
                                            <h5 className="card-title">Profile Information</h5>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <div className="d-flex flex-column justify-content-between">
                                            <div className="d-flex mb-1">
                                                <span className="md-18 me-2">
                                                    <i className="fa fa-user-circle-o fs-5" aria-hidden="true"></i>
                                                </span>
                                                <p className="mb-2" style={{ height: '24px' }}>
                                                    {isLoading ? <Skeleton width={150} /> : userData.name ? userData.name : "-"}
                                                </p>
                                            </div>
                                            <div className="d-flex mb-1">
                                                <span className="md-18 me-2">
                                                    <i className="fa fa-pencil-square fs-5" aria-hidden="true"></i>
                                                </span>
                                                <p className="mb-2" style={{ height: '24px' }}>
                                                    {isLoading ? <Skeleton width={200} /> : userData.about ? userData.about : "-"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-9 row m-0 p-0">
                                <InfiniteScrollWrapper
                                    className="row"
                                    dataLength={facebookList.length}
                                    next={() => fetchProfileListing(currentPage)}
                                    hasMore={hasMorePosts}
                                >
                                    {loadingPosts ? (
                                        Array.from({ length: 5 }, (_, index) => (
                                            <div className="col-sm-12" key={`skeleton-post-${index}`}>
                                                <div className="card">
                                                    <div className="card-body">
                                                        <ul className="post-comments p-0 m-0">
                                                            <li className="mb-2">
                                                                <div className="d-flex justify-content-between">
                                                                    <div className="user-img me-3">
                                                                        <Skeleton circle width={40} height={40} />
                                                                    </div>
                                                                    <div className="w-100 text-margin">
                                                                        <div className="d-flex  justify-content-between">
                                                                            <div className="">
                                                                                <Skeleton height={20} width={150} />
                                                                                <Skeleton height={14} width={100} />
                                                                                <Skeleton count={3} height={12} width='100%' />
                                                                            </div>
                                                                        </div>
                                                                        <div className="user-post mt-2 mb-2">
                                                                            <Skeleton height={200} width={'100%'} />
                                                                        </div>
                                                                        <div className="d-flex justify-content-between align-items-center flex-wrap mt-4">
                                                                            <div className="d-flex justify-content-between align-items-center">
                                                                                <div className="d-flex align-items-center me-3">
                                                                                    <Skeleton width={20} height={20} />
                                                                                    <span className="card-text-1 ms-1">
                                                                                        <Skeleton width={40} height={20} />
                                                                                    </span>
                                                                                </div>
                                                                                <div className="d-flex align-items-center me-3">
                                                                                    <Skeleton width={20} height={20} />
                                                                                    <span className="card-text-1 ms-1"><Skeleton width={60} height={20} /></span>
                                                                                </div>
                                                                            </div>
                                                                            <span className="card-text-2">
                                                                                <Skeleton width={100} height={20} />
                                                                            </span>
                                                                        </div>

                                                                    </div>
                                                                </div>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        ))

                                    ) : facebookList.length > 0 ? (
                                        facebookList.map((item) => (
                                            <div className={`col-sm-12 post-item ${deletingPostId === item.id ? 'opacity-50' : ''}`} key={item.id}>
                                                <div className="card">
                                                    <div className="card-body">
                                                        <ul className="post-comments p-0 m-0">
                                                            <li className="mb-2">
                                                                <div className="d-flex justify-content-between">
                                                                    <div className="user-img me-3">
                                                                        <img
                                                                            src={userData?.picture?.data?.url || "/assets/images/icon-7797704_1280.png"}
                                                                            alt="userimg"
                                                                            className="avatar-40 rounded-circle img-fluid"
                                                                            loading="lazy"
                                                                        />
                                                                    </div>
                                                                    <div className="w-100 text-margin">
                                                                        <div className="d-flex  justify-content-between">
                                                                            <div className="">
                                                                                <h5>{userData.name ? userData.name : "-"}</h5>
                                                                                <small className=" d-flex align-items-center "> <i className="material-symbols-outlined md-14 me-1">
                                                                                    schedule
                                                                                </i> {item.created_at ? formatDateTime(item.created_at, 'month dd, hh:mm') : '-'}</small>
                                                                                <p>
                                                                                    {renderPostContent(item)}
                                                                                </p>
                                                                            </div>
                                                                            <div className="card-post-toolbar">
                                                                                {(editPermission || deletePermission) && (
                                                                                    <div className="dropdown">
                                                                                        <span className="dropdown-toggle material-symbols-outlined" id={`postdata-${item.post_id}`} data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" role="button">
                                                                                            more_horiz
                                                                                        </span>
                                                                                        <div className="dropdown-menu m-0 p-0" aria-labelledby={`postdata-${item.post_id}`}>
                                                                                            {editPermission && item?.post_type === 'post' &&
                                                                                                <a className="dropdown-item p-3" href="#/" onClick={() => handleShowEditModal(item)}>
                                                                                                    <div className="d-flex align-items-top">
                                                                                                        <span className="material-symbols-outlined">
                                                                                                            edit
                                                                                                        </span>
                                                                                                        <div className="data ms-2" >
                                                                                                            <h6>Edit Post</h6>
                                                                                                            <p className="mb-0">Modify posts like this.</p>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </a>
                                                                                            }
                                                                                            {deletePermission &&
                                                                                                <a className={`dropdown-item p-3 ${deletingPostId === item.id ? 'disabled' : ''}`} href="javascript:void(0)" onClick={() => fetchFacebookDelete(item.id)}>
                                                                                                    <div className="d-flex align-items-top">
                                                                                                        <span className="material-symbols-outlined">
                                                                                                            {deletingPostId === item.id ? 'hourglass_empty' : 'delete'}
                                                                                                        </span>
                                                                                                        <div className="data ms-2">
                                                                                                            <h6>{deletingPostId === item.id ? 'Deleting...' : 'Delete'}</h6>
                                                                                                            <p className="mb-0">See fewer posts like this.</p>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </a>
                                                                                            }
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        {item.post_type === "post" && (
                                                                            <>
                                                                                <div className="user-post">
                                                                                    <a href="#!" className="ratio ratio-4x3">
                                                                                        <ImageLazyLoading
                                                                                            src={item.image_urls}
                                                                                            effect="blur"
                                                                                            alt="post-image"
                                                                                            wrapperClassName="img-fluid w-100 object-fit-contain"
                                                                                            style={{
                                                                                                objectFit: "contain",
                                                                                                cursor: "default",
                                                                                                filter: "blur(10px)",
                                                                                                transition: "filter 0.5s ease-in-out"
                                                                                            }}
                                                                                            onLoad={(e) => e.target.style.filter = "blur(0)"}
                                                                                        />
                                                                                    </a>
                                                                                </div>
                                                                                <div className="d-flex justify-content-between align-items-center flex-wrap mt-4">
                                                                                    <div className="d-flex justify-content-between align-items-center">
                                                                                        <div className="d-flex align-items-center me-3">
                                                                                            <span className="material-symbols-outlined md-18">
                                                                                                thumb_up
                                                                                            </span>
                                                                                            <span className="card-text-1 ms-1">
                                                                                                {likeCount[item.post_id] !== undefined
                                                                                                    ? formatCount(likeCount[item.post_id])
                                                                                                    : 0}
                                                                                            </span>
                                                                                        </div>
                                                                                        <div className="d-flex align-items-center me-3"
                                                                                            type='button'
                                                                                            onClick={() => handleFacebookComment(item.post_id, item.post_type)}>
                                                                                            <span className="material-symbols-outlined md-18">
                                                                                                comment
                                                                                            </span>
                                                                                            <span className="card-text-1 ms-1">
                                                                                                Comment ({formatCount(commentCount[item.post_id] || 0)})
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                    <span className="card-text-2">
                                                                                        {/* Replace hardcoded value with actual like count */}
                                                                                        {likeCount[item.post_id] > 0
                                                                                            ? `${formatCount(likeCount[item.post_id])} ${likeCount[item.post_id] === 1 ? 'person Likes' : 'people Like'}`
                                                                                            : 'No Likes yet'}
                                                                                    </span>
                                                                                </div>
                                                                                <div className="d-flex justify-content-between" style={{ maxHeight: '23rem', overflowY: 'auto' }}
                                                                                    id={`scrollableDiv-${item.post_id}`}>
                                                                                    {visibleComments === `${item.post_type}_${item.post_id}` && (
                                                                                        <>
                                                                                            {comments[`${item.post_type}_${item.post_id}`]?.length > 0 ? (
                                                                                                <InfiniteScrollWrapper
                                                                                                    className="row"
                                                                                                    dataLength={comments[`${item.post_type}_${item.post_id}`].length}
                                                                                                    next={() => handleFacebookComment(item.post_id, item.post_type, currentPage, true)}
                                                                                                    hasMore={hasMoreComments}
                                                                                                    scrollableTarget={`scrollableDiv-${item.post_id}`}
                                                                                                >
                                                                                                    <ul className="post-comments p-2 m-0 rounded">
                                                                                                        {comments[`${item.post_type}_${item.post_id}`].slice().reverse().map((comment, index) => (
                                                                                                            <li key={index} className="mb-2">
                                                                                                                <div className="d-flex justify-content-between">
                                                                                                                    <div className="user-img me-3">
                                                                                                                        <img
                                                                                                                            src="/assets/images/icon-7797704_1280.png"
                                                                                                                            alt="userimg"
                                                                                                                            className="avatar-40 rounded-circle img-fluid"
                                                                                                                            loading="lazy"
                                                                                                                        />
                                                                                                                    </div>
                                                                                                                    <div className="w-100 text-margin">
                                                                                                                        <div>
                                                                                                                            <h5 className="mb-0 d-inline-block me-1">{comment.comments}</h5>
                                                                                                                        </div>
                                                                                                                        <p className="mb-0">{comment.text}</p>
                                                                                                                        <div className="d-flex justify-content-between align-items-center flex-wrap ">
                                                                                                                            <div className="d-flex justify-content-between align-items-center">
                                                                                                                                <div className="d-flex align-items-center me-3">
                                                                                                                                    <span className="material-symbols-outlined md-18">
                                                                                                                                        thumb_up
                                                                                                                                    </span>
                                                                                                                                    <span className="card-text-1 ms-1">{comment.comment_likes}</span>
                                                                                                                                </div>
                                                                                                                                {addPermission && (
                                                                                                                                    <div className="d-flex align-items-center me-3" type='button' onClick={() =>
                                                                                                                                        handleCommentReply(comment?.id, comment?.comments, comment?.comments, item.post_id)
                                                                                                                                    }>
                                                                                                                                        <span className="material-symbols-outlined md-18">comment</span>
                                                                                                                                        <span className="card-text-1 ms-1">Reply</span>
                                                                                                                                    </div>
                                                                                                                                )}
                                                                                                                                {deletePermission && (
                                                                                                                                    <div className={`d-flex align-items-center me-3 ${isLoadingComments == comment?.id ? 'disabled' : ''}`} type='button' onClick={() => deleteComment(comment?.id, item.post_id, item.post_type)}>
                                                                                                                                        <span className="material-symbols-outlined md-18">delete</span>
                                                                                                                                        <span className="card-text-1 ms-1">{isLoadingComments == comment?.id ? 'Deleting...' : 'Delete'}</span>
                                                                                                                                    </div>
                                                                                                                                )}
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                        {comment.replies && comment.replies.length > 0 && (
                                                                                                                            <ul className="post-comments p-0 mt-4 ">
                                                                                                                                {comment.replies.map((reply, replyIndex) => (
                                                                                                                                    <li key={reply.reply_id} className="mb-2">
                                                                                                                                        <div className="d-flex justify-content-between">
                                                                                                                                            <div className="user-img me-3">
                                                                                                                                                <img
                                                                                                                                                    src="/assets/images/icon-7797704_1280.png"
                                                                                                                                                    alt="userimg"
                                                                                                                                                    className="avatar-40 rounded-circle img-fluid avatar-1"
                                                                                                                                                    loading="lazy"
                                                                                                                                                />
                                                                                                                                            </div>
                                                                                                                                            <div className="w-100 text-margin">
                                                                                                                                                <div>
                                                                                                                                                    {/* <h5 className="mb-0 d-inline-block me-1">{reply.username ? reply.username : '-'}</h5> */}
                                                                                                                                                </div>
                                                                                                                                                <p className="mb-0">{reply.comments}</p>
                                                                                                                                                {/* <small className=" d-flex align-items-center "> <i className="material-symbols-outlined md-14 me-1">
                                                                                                                                                                                schedule
                                                                                                                                                                            </i> {item.created_at ? formatDateTime(item.created_at, 'month dd, hh:mm') : '-'}</small> */}
                                                                                                                                                {/* <div className={`d-flex align-items-center me-3 ${isLoadingComments == reply?.reply_id ? 'disabled' : ''}`} type='button' onClick={() => deleteComment(reply?.reply_id, item.post_id, item.post_type)}>
                                                                                                                                                                                <span className="material-symbols-outlined md-18">delete</span>
                                                                                                                                                                                <span className="card-text-1 ms-1">{isLoadingComments == reply?.reply_id ? 'Deleting...' : 'Delete'}</span>
                                                                                                                                                                            </div> */}
                                                                                                                                            </div>
                                                                                                                                        </div>
                                                                                                                                    </li>
                                                                                                                                ))}
                                                                                                                            </ul>
                                                                                                                        )}
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </li>
                                                                                                        ))}
                                                                                                    </ul>
                                                                                                </InfiniteScrollWrapper>
                                                                                            ) : (
                                                                                                <NoDataMessage type="comment" />
                                                                                            )}
                                                                                        </>
                                                                                    )}
                                                                                </div>
                                                                                {replyInfo[item.post_id]?.id && (
                                                                                    <div
                                                                                        className="reply-info-preview position-relative"
                                                                                        style={{
                                                                                            margin: "8px 5px 1px",
                                                                                            padding: "10px",
                                                                                            border: "1px solid #ccc",
                                                                                            borderRadius: "5px",
                                                                                            backgroundColor: "rgb(255 255 255)",
                                                                                        }}
                                                                                    >
                                                                                        <p>
                                                                                            {replyInfo[item.post_id]?.message ? replyInfo[item.post_id]?.message : '-'}
                                                                                        </p>
                                                                                        <button
                                                                                            onClick={() => handleCloseReply(item.post_id)}
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
                                                                                {addPermission ? (
                                                                                    <div className="input-group mt-3 d-flex gap-2">
                                                                                        <textarea
                                                                                            className={`form-control rounded ${validationError[`post_${item.post_id}`] ? 'border-red' : ''}`}
                                                                                            placeholder="Write your comment"
                                                                                            value={newComment[`post_${item.post_id}`] || ''}
                                                                                            onChange={(e) => handleCommentChange(`post_${item.post_id}`, e.target.value)}
                                                                                            style={{ height: '40px', ...(validationError[`post_${item.post_id}`] ? { borderColor: 'red' } : {}) }}
                                                                                        />
                                                                                        <div className="input-group-append d-flex align-items-center">
                                                                                            <span
                                                                                                className={`btn btn-primary d-flex align-items-center justify-content-center gap-2 ${isLoadingCommentSubmit[`${item.post_type}_${item.post_id}`] ? 'disabled' : ''
                                                                                                    }`}
                                                                                                onClick={() => !isLoadingCommentSubmit[`${item.post_type}_${item.post_id}`] &&
                                                                                                    handleCommentSubmit(item.post_id, item.post_type)}
                                                                                                style={{
                                                                                                    cursor: isLoadingCommentSubmit[`${item.post_type}_${item.post_id}`] ? 'not-allowed' : 'pointer',
                                                                                                    minWidth: '100px',
                                                                                                    position: 'relative'
                                                                                                }}
                                                                                            >
                                                                                                {isLoadingCommentSubmit[`${item.post_type}_${item.post_id}`] ? (
                                                                                                    <>
                                                                                                        <div
                                                                                                            className="spinner-border spinner-border-sm text-light"
                                                                                                            style={{
                                                                                                                width: '16px',
                                                                                                                height: '16px'
                                                                                                            }}
                                                                                                            role="status"
                                                                                                        >
                                                                                                            <span className="visually-hidden">Loading...</span>
                                                                                                        </div>
                                                                                                        <span>Loading...</span>
                                                                                                    </>
                                                                                                ) : (
                                                                                                    replyInfo[item.post_id]?.id ? 'Reply' : 'Comment'
                                                                                                )}
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="text-center text-muted mt-3">
                                                                                        <small>You don't have permission to add comments</small>
                                                                                    </div>
                                                                                )}
                                                                            </>
                                                                        )}

                                                                        {item.post_type === "video" && (
                                                                            <>
                                                                                <div className="mt-2 mb-2 ratio">
                                                                                    <video
                                                                                        width="320" height="240"
                                                                                        // controls
                                                                                        playing={true}
                                                                                        controls={true}
                                                                                        controlsList="nodownload"
                                                                                        title="Video"
                                                                                        frameBorder="0"
                                                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                                                        referrerPolicy="strict-origin-when-cross-origin"
                                                                                        allowFullScreen
                                                                                        ref={el => videoRefs.current[item.post_id] = el}
                                                                                        onPlay={() => handleVideoPlay(item.post_id)}
                                                                                        onError={(e) =>
                                                                                            console.error(
                                                                                                "Video playback error:",
                                                                                                e
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        <source
                                                                                            src={item.image_urls}
                                                                                            type="video/mp4"
                                                                                        />
                                                                                        Your browser does not support the video tag.
                                                                                    </video>
                                                                                </div>
                                                                                <div className="d-flex justify-content-between align-items-center flex-wrap">
                                                                                    <div className="d-flex justify-content-between align-items-center">
                                                                                        <div className="d-flex align-items-center me-3">
                                                                                            <span className="material-symbols-outlined md-18">
                                                                                                thumb_up
                                                                                            </span>
                                                                                            <span className="card-text-1 ms-1">
                                                                                                {likeCount[item.post_id] !== undefined
                                                                                                    ? formatCount(likeCount[item.post_id])
                                                                                                    : 0}
                                                                                            </span>
                                                                                        </div>
                                                                                        <div className="d-flex align-items-center me-3"
                                                                                            type='button'
                                                                                            onClick={() => handleFacebookComment(item.post_id, item.post_type)}>
                                                                                            <span className="material-symbols-outlined md-18">
                                                                                                comment
                                                                                            </span>
                                                                                            <span className="card-text-1 ms-1">
                                                                                                Comment ({formatCount(commentCount[item.post_id] || 0)})
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                    <span className="card-text-2">
                                                                                        {/* Replace hardcoded value with actual like count */}
                                                                                        {likeCount[item.post_id] > 0
                                                                                            ? `${formatCount(likeCount[item.post_id])} ${likeCount[item.post_id] === 1 ? 'person Likes' : 'people Like'}`
                                                                                            : 'No Likes yet'}
                                                                                    </span>
                                                                                </div>
                                                                                <div className="d-flex justify-content-between" style={{ maxHeight: '23rem', overflowY: 'auto' }}
                                                                                    id={`scrollableDiv-${item.post_id}`}>
                                                                                    {visibleComments === `${item.post_type}_${item.post_id}` && (
                                                                                        <>
                                                                                            {comments[`${item.post_type}_${item.post_id}`]?.length > 0 ? (
                                                                                                <InfiniteScrollWrapper
                                                                                                    className="row"
                                                                                                    dataLength={comments[`${item.post_type}_${item.post_id}`].length}
                                                                                                    next={() => handleFacebookComment(item.post_id, item.post_type, currentPage, true)}
                                                                                                    hasMore={hasMoreComments}
                                                                                                    scrollableTarget={`scrollableDiv-${item.post_id}`}
                                                                                                >

                                                                                                    <ul className="post-comments p-2 m-0 rounded">
                                                                                                        {comments[`${item.post_type}_${item.post_id}`].slice().reverse().map((comment, index) => (
                                                                                                            <li key={index} className="mb-2">
                                                                                                                <div className="d-flex justify-content-between">
                                                                                                                    <div className="user-img me-3">
                                                                                                                        <img
                                                                                                                            src="/assets/images/icon-7797704_1280.png"
                                                                                                                            alt="userimg"
                                                                                                                            className="avatar-40 rounded-circle img-fluid"
                                                                                                                            loading="lazy"
                                                                                                                        />
                                                                                                                    </div>
                                                                                                                    <div className="w-100 text-margin">
                                                                                                                        <div>
                                                                                                                            <h5 className="mb-0 d-inline-block me-1">{comment.comments}</h5>
                                                                                                                        </div>
                                                                                                                        <p className="mb-0">{comment.text}</p>
                                                                                                                        <div className="d-flex justify-content-between align-items-center flex-wrap ">
                                                                                                                            <div className="d-flex justify-content-between align-items-center">
                                                                                                                                <div className="d-flex align-items-center me-3">
                                                                                                                                    <span className="material-symbols-outlined md-18">
                                                                                                                                        thumb_up
                                                                                                                                    </span>
                                                                                                                                    <span className="card-text-1 ms-1">{comment.comment_likes}</span>
                                                                                                                                </div>
                                                                                                                                {addPermission && (
                                                                                                                                    <div className="d-flex align-items-center me-3" type='button' onClick={() =>
                                                                                                                                        handleCommentReply(comment?.id, comment?.comments, comment?.comments, item.post_id)
                                                                                                                                    }>
                                                                                                                                        <span className="material-symbols-outlined md-18">comment</span>
                                                                                                                                        <span className="card-text-1 ms-1">Reply</span>
                                                                                                                                    </div>
                                                                                                                                )}
                                                                                                                                {deletePermission && (
                                                                                                                                    <div className={`d-flex align-items-center me-3 ${isLoadingComments == comment?.id ? 'disabled' : ''}`} type='button' onClick={() => deleteComment(comment?.id, item.post_id, item.post_type)}>
                                                                                                                                        <span className="material-symbols-outlined md-18">delete</span>
                                                                                                                                        <span className="card-text-1 ms-1">{isLoadingComments == comment?.id ? 'Deleting...' : 'Delete'}</span>
                                                                                                                                    </div>
                                                                                                                                )}
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                        {comment.replies && comment.replies.length > 0 && (
                                                                                                                            <ul className="post-comments p-0 mt-4 ">
                                                                                                                                {comment.replies.map((reply, replyIndex) => (
                                                                                                                                    <li key={reply.reply_id} className="mb-2">
                                                                                                                                        <div className="d-flex justify-content-between">
                                                                                                                                            <div className="user-img me-3">
                                                                                                                                                <img
                                                                                                                                                    src="/assets/images/icon-7797704_1280.png"
                                                                                                                                                    alt="userimg"
                                                                                                                                                    className="avatar-40 rounded-circle img-fluid avatar-1"
                                                                                                                                                    loading="lazy"
                                                                                                                                                />
                                                                                                                                            </div>
                                                                                                                                            <div className="w-100 text-margin">
                                                                                                                                                <div>
                                                                                                                                                    <h5 className="mb-0 d-inline-block me-1">{reply.username ? reply.username : '-'}</h5>
                                                                                                                                                    <small className="mb-0 d-inline-block">{reply.timestamp ? reply.timestamp : '-'}</small>
                                                                                                                                                </div>
                                                                                                                                                <p className="mb-0">{reply.comments}</p>
                                                                                                                                                {/* <small className=" d-flex align-items-center "> <i className="material-symbols-outlined md-14 me-1">
                                                                                                                                                                                schedule
                                                                                                                                                                            </i> {item.created_at ? formatDateTime(item.created_at, 'month dd, hh:mm') : '-'}</small> */}
                                                                                                                                                {/* <div className={`d-flex align-items-center me-3 ${isLoadingComments == reply?.reply_id ? 'disabled' : ''}`} type='button' onClick={() => deleteComment(reply?.reply_id, item.post_id, item.post_type)}>
                                                                                                                                                                                <span className="material-symbols-outlined md-18">delete</span>
                                                                                                                                                                                <span className="card-text-1 ms-1">{isLoadingComments == reply?.reply_id ? 'Deleting...' : 'Delete'}</span>
                                                                                                                                                                            </div> */}
                                                                                                                                            </div>
                                                                                                                                        </div>
                                                                                                                                    </li>
                                                                                                                                ))}
                                                                                                                            </ul>
                                                                                                                        )}
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </li>
                                                                                                        ))}
                                                                                                    </ul>

                                                                                                </InfiniteScrollWrapper>
                                                                                            ) : (
                                                                                                <NoDataMessage type="comment" />
                                                                                            )}
                                                                                        </>
                                                                                    )}
                                                                                </div>
                                                                                {replyInfo[item.post_id]?.id && (
                                                                                    <div
                                                                                        className="reply-info-preview position-relative"
                                                                                        style={{
                                                                                            margin: "8px 5px 1px",
                                                                                            padding: "10px",
                                                                                            border: "1px solid #ccc",
                                                                                            borderRadius: "5px",
                                                                                            backgroundColor: "rgb(255 255 255)",
                                                                                        }}
                                                                                    >
                                                                                        <p>
                                                                                            {replyInfo[item.post_id]?.message ? replyInfo[item.post_id]?.message : '-'}
                                                                                        </p>
                                                                                        <button
                                                                                            onClick={() => handleCloseReply(item.post_id)}
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
                                                                                {addPermission ? (
                                                                                    <div className="input-group mt-3 d-flex gap-2">
                                                                                        <textarea
                                                                                            className={`form-control rounded ${validationError[`video_${item.post_id}`] ? 'border-red' : ''}`}
                                                                                            placeholder="Write your comment"
                                                                                            value={newComment[`video_${item.post_id}`] || ''}
                                                                                            onChange={(e) => handleCommentChange(`video_${item.post_id}`, e.target.value)}
                                                                                            style={{ height: '40px', ...(validationError[`video_${item.post_id}`] ? { borderColor: 'red' } : {}) }}
                                                                                        />
                                                                                        <div className="input-group-append d-flex align-items-center">
                                                                                            <span
                                                                                                className={`btn btn-primary d-flex align-items-center justify-content-center gap-2 ${isLoadingCommentSubmit[`${item.post_type}_${item.post_id}`] ? 'disabled' : ''
                                                                                                    }`}
                                                                                                onClick={() => !isLoadingCommentSubmit[`${item.post_type}_${item.post_id}`] &&
                                                                                                    handleCommentSubmit(item.post_id, item.post_type)}
                                                                                                style={{
                                                                                                    cursor: isLoadingCommentSubmit[`${item.post_type}_${item.post_id}`] ? 'not-allowed' : 'pointer',
                                                                                                    minWidth: '100px',
                                                                                                    position: 'relative'
                                                                                                }}
                                                                                            >
                                                                                                {isLoadingCommentSubmit[`${item.post_type}_${item.post_id}`] ? (
                                                                                                    <>
                                                                                                        <div
                                                                                                            className="spinner-border spinner-border-sm text-light"
                                                                                                            style={{
                                                                                                                width: '16px',
                                                                                                                height: '16px'
                                                                                                            }}
                                                                                                            role="status"
                                                                                                        >
                                                                                                            <span className="visually-hidden">Loading...</span>
                                                                                                        </div>
                                                                                                        <span>Loading...</span>
                                                                                                    </>
                                                                                                ) : (
                                                                                                    replyInfo[item.post_id]?.id ? 'Reply' : 'Comment'
                                                                                                )}
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="text-center text-muted mt-3">
                                                                                        <small>You don't have permission to add comments</small>
                                                                                    </div>
                                                                                )}
                                                                            </>
                                                                        )}

                                                                        {item.post_type === "text" && (
                                                                            <>
                                                                                <div className="d-flex justify-content-between align-items-center flex-wrap">
                                                                                    <div className="d-flex justify-content-between align-items-center">
                                                                                        <div className="d-flex align-items-center me-3">
                                                                                            <span className="material-symbols-outlined md-18">
                                                                                                thumb_up
                                                                                            </span>
                                                                                            <span className="card-text-1 ms-1">
                                                                                                {likeCount[item.post_id] !== undefined
                                                                                                    ? formatCount(likeCount[item.post_id])
                                                                                                    : 0}
                                                                                            </span>
                                                                                        </div>
                                                                                        <div className="d-flex align-items-center me-3"
                                                                                            type='button'
                                                                                            onClick={() => handleFacebookComment(item.post_id, item.post_type)}>
                                                                                            <span className="material-symbols-outlined md-18">
                                                                                                comment
                                                                                            </span>
                                                                                            <span className="card-text-1 ms-1">
                                                                                                Comment ({formatCount(commentCount[item.post_id] || 0)})
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                    <span className="card-text-2">
                                                                                        {/* Replace hardcoded value with actual like count */}
                                                                                        {likeCount[item.post_id] > 0
                                                                                            ? `${formatCount(likeCount[item.post_id])} ${likeCount[item.post_id] === 1 ? 'person Likes' : 'people Like'}`
                                                                                            : 'No Likes yet'}
                                                                                    </span>
                                                                                </div>
                                                                                <div className="d-flex justify-content-between"
                                                                                    style={{ maxHeight: '23rem', overflowY: 'auto' }}
                                                                                    id={`scrollableDiv-${item.post_id}`}>
                                                                                    {visibleComments === `${item.post_type}_${item.post_id}` && (
                                                                                        <>
                                                                                            {comments[`${item.post_type}_${item.post_id}`]?.length > 0 ? (
                                                                                                <InfiniteScrollWrapper
                                                                                                    className="row"
                                                                                                    dataLength={comments[`${item.post_type}_${item.post_id}`].length}
                                                                                                    next={() => handleFacebookComment(item.post_id, item.post_type, currentPage, true)}
                                                                                                    hasMore={hasMoreComments}
                                                                                                    scrollableTarget={`scrollableDiv-${item.post_id}`}
                                                                                                >

                                                                                                    <ul className="post-comments p-2 m-0 rounded">
                                                                                                        {comments[`${item.post_type}_${item.post_id}`].slice().reverse().map((comment, index) => (
                                                                                                            <li key={index} className="mb-2">
                                                                                                                <div className="d-flex justify-content-between">
                                                                                                                    <div className="user-img me-3">
                                                                                                                        <img
                                                                                                                            src="/assets/images/icon-7797704_1280.png"
                                                                                                                            alt="userimg"
                                                                                                                            className="avatar-40 rounded-circle img-fluid"
                                                                                                                            loading="lazy"
                                                                                                                        />
                                                                                                                    </div>
                                                                                                                    <div className="w-100 text-margin">
                                                                                                                        <div>
                                                                                                                            <h5 className="mb-0 d-inline-block me-1">{comment.comments}</h5>
                                                                                                                        </div>
                                                                                                                        <p className="mb-0">{comment.text}</p>
                                                                                                                        <div className="d-flex justify-content-between align-items-center flex-wrap">
                                                                                                                            <div className="d-flex justify-content-between align-items-center">
                                                                                                                                <div className="d-flex align-items-center me-3">
                                                                                                                                    <span className="material-symbols-outlined md-18">
                                                                                                                                        thumb_up
                                                                                                                                    </span>
                                                                                                                                    <span className="card-text-1 ms-1">{comment.comment_likes}</span>
                                                                                                                                </div>
                                                                                                                                {addPermission && (
                                                                                                                                    <div className="d-flex align-items-center me-3" type='button' onClick={() =>
                                                                                                                                        handleCommentReply(comment?.id, comment?.comments, comment?.comments, item.post_id)
                                                                                                                                    }>
                                                                                                                                        <span className="material-symbols-outlined md-18">comment</span>
                                                                                                                                        <span className="card-text-1 ms-1">Reply</span>
                                                                                                                                    </div>
                                                                                                                                )}
                                                                                                                                {deletePermission && (
                                                                                                                                    <div className={`d-flex align-items-center me-3 ${isLoadingComments == comment?.id ? 'disabled' : ''}`} type='button' onClick={() => deleteComment(comment?.id, item.post_id, item.post_type)} >
                                                                                                                                        <span className="material-symbols-outlined md-18">delete</span>
                                                                                                                                        <span className="card-text-1 ms-1">{isLoadingComments == comment?.id ? 'Deleting...' : 'Delete'}</span>
                                                                                                                                    </div>
                                                                                                                                )}
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                        {comment.replies && comment.replies.length > 0 && (
                                                                                                                            <ul className="post-comments p-0 mt-4 ">
                                                                                                                                {comment.replies.map((reply, replyIndex) => (
                                                                                                                                    <li key={reply.reply_id} className="mb-2">
                                                                                                                                        <div className="d-flex justify-content-between">
                                                                                                                                            <div className="user-img me-3">
                                                                                                                                                <img
                                                                                                                                                    src="/assets/images/icon-7797704_1280.png"
                                                                                                                                                    alt="userimg"
                                                                                                                                                    className="avatar-40 rounded-circle img-fluid avatar-1"
                                                                                                                                                    loading="lazy"
                                                                                                                                                />
                                                                                                                                            </div>
                                                                                                                                            <div className="w-100 text-margin">
                                                                                                                                                <div>
                                                                                                                                                    <h5 className="mb-0 d-inline-block me-1">{reply.username ? reply.username : '-'}</h5>
                                                                                                                                                    <small className="mb-0 d-inline-block">{reply.timestamp ? reply.timestamp : '-'}</small>
                                                                                                                                                </div>
                                                                                                                                                <p className="mb-0">{reply.comments}</p>
                                                                                                                                                {/* <small className=" d-flex align-items-center "> <i className="material-symbols-outlined md-14 me-1">
                                                                                                                                                                                schedule
                                                                                                                                                                            </i> {item.created_at ? formatDateTime(item.created_at, 'month dd, hh:mm') : '-'}</small> */}
                                                                                                                                                {/* <div className={`d-flex align-items-center me-3 ${isLoadingComments == reply?.reply_id ? 'disabled' : ''}`} type='button' onClick={() => deleteComment(reply?.reply_id, item.post_id, item.post_type)}>
                                                                                                                                                                                <span className="material-symbols-outlined md-18">delete</span>
                                                                                                                                                                                <span className="card-text-1 ms-1">{isLoadingComments == reply?.reply_id ? 'Deleting...' : 'Delete'}</span>
                                                                                                                                                                            </div> */}
                                                                                                                                            </div>
                                                                                                                                        </div>
                                                                                                                                    </li>
                                                                                                                                ))}
                                                                                                                            </ul>
                                                                                                                        )}
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </li>
                                                                                                        ))}
                                                                                                    </ul>

                                                                                                </InfiniteScrollWrapper>
                                                                                            ) : (
                                                                                                <NoDataMessage type="comment" />
                                                                                            )}
                                                                                        </>
                                                                                    )}
                                                                                </div>
                                                                                {replyInfo[item.post_id]?.id && (
                                                                                    <div
                                                                                        className="reply-info-preview position-relative"
                                                                                        style={{
                                                                                            margin: "8px 5px 1px",
                                                                                            padding: "10px",
                                                                                            border: "1px solid #ccc",
                                                                                            borderRadius: "5px",
                                                                                            backgroundColor: "rgb(255 255 255)",
                                                                                        }}
                                                                                    >
                                                                                        <p>
                                                                                            {replyInfo[item.post_id]?.message ? replyInfo[item.post_id]?.message : '-'}
                                                                                        </p>
                                                                                        <button
                                                                                            onClick={() => handleCloseReply(item.post_id)}
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
                                                                                {addPermission ? (
                                                                                    <div className="input-group mt-3 d-flex gap-2">
                                                                                        <textarea
                                                                                            className={`form-control rounded ${validationError[`text_${item.post_id}`] ? 'border-red' : ''}`}
                                                                                            placeholder="Write your comment"
                                                                                            value={newComment[`text_${item.post_id}`] || ''}
                                                                                            onChange={(e) => handleCommentChange(`text_${item.post_id}`, e.target.value)}
                                                                                            style={{ height: '40px', ...(validationError[`text_${item.post_id}`] ? { borderColor: 'red' } : {}) }}
                                                                                        />
                                                                                        <div className="input-group-append d-flex align-items-center">
                                                                                            <span
                                                                                                className={`btn btn-primary d-flex align-items-center justify-content-center gap-2 ${isLoadingCommentSubmit[`${item.post_type}_${item.post_id}`] ? 'disabled' : ''
                                                                                                    }`}
                                                                                                onClick={() => !isLoadingCommentSubmit[`${item.post_type}_${item.post_id}`] &&
                                                                                                    handleCommentSubmit(item.post_id, item.post_type)}
                                                                                                style={{
                                                                                                    cursor: isLoadingCommentSubmit[`${item.post_type}_${item.post_id}`] ? 'not-allowed' : 'pointer',
                                                                                                    minWidth: '100px',
                                                                                                    position: 'relative'
                                                                                                }}
                                                                                            >
                                                                                                {isLoadingCommentSubmit[`${item.post_type}_${item.post_id}`] ? (
                                                                                                    <>
                                                                                                        <div
                                                                                                            className="spinner-border spinner-border-sm text-light"
                                                                                                            style={{
                                                                                                                width: '16px',
                                                                                                                height: '16px'
                                                                                                            }}
                                                                                                            role="status"
                                                                                                        >
                                                                                                            <span className="visually-hidden">Loading...</span>
                                                                                                        </div>
                                                                                                        <span>Loading...</span>
                                                                                                    </>
                                                                                                ) : (
                                                                                                    replyInfo[item.post_id]?.id ? 'Reply' : 'Comment'
                                                                                                )}
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="text-center text-muted mt-3">
                                                                                        <small>You don't have permission to add comments</small>
                                                                                    </div>
                                                                                )}
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <NoDataMessage type="post" />
                                    )}
                                </InfiniteScrollWrapper>
                                <Modal
                                    show={showEditModal}
                                    onHide={closeEditModal}
                                    backdrop="static"
                                    size="lg"
                                >
                                    <Modal.Header closeButton>
                                        <Modal.Title>Edit post</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <div className="card h-100">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between">
                                                    <div className="me-3">
                                                        <img
                                                            className="rounded-circle img-fluid"
                                                            src={userData.picture?.data?.url ? userData.picture?.data?.url : "/assets/images/icon-7797704_1280.png"}
                                                            alt=""
                                                            loading="lazy"
                                                            style={{
                                                                width: "50px",
                                                                height: "50px",
                                                                objectFit: "cover",
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="w-100">
                                                        <div className="d-flex justify-content-between">
                                                            <div className="">
                                                                <h5 className="mb-0 d-inline-block">{userData.name ? userData.name : "-"}</h5>
                                                                <small className="d-flex align-items-center "><i className="material-symbols-outlined md-16 me-1">
                                                                    schedule
                                                                </i>{selectedPost.created_at ? formatDateTime(selectedPost.created_at, 'month dd, hh:mm') : "-"}</small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ padding: '10px', fontSize: '16px', lineHeight: '1.5' }}>
                                                    <input
                                                        type="text"
                                                        value={selectedPost?.title}
                                                        onChange={handleChange}
                                                        autoFocus
                                                        style={{
                                                            fontSize: 'inherit',
                                                            border: 'none',
                                                            outline: 'none',
                                                            background: 'none',
                                                            width: '100%',
                                                        }}
                                                    />
                                                </div>
                                                {selectedPost?.image_urls ? (
                                                    <div className="text-center ratio ratio-4x3">
                                                        <ImageLazyLoading
                                                            src={selectedPost?.image_urls}
                                                            effect="blur"
                                                            alt="post-image"
                                                            wrapperClassName="img-fluid rounded w-100"
                                                            style={{
                                                                objectFit: "contain",
                                                                border: "1px solid lightgrey",
                                                                borderRadius: "5px",
                                                                filter: "blur(10px)",
                                                                transition: "filter 0.5s ease-in-out"
                                                            }}
                                                            onLoad={(e) => e.target.style.filter = "blur(0)"}
                                                        />
                                                    </div>
                                                ) : (
                                                    <NoDataMessage
                                                        type="custom"
                                                        customMessage="No Image Available"
                                                    />
                                                )}
                                                <div className='mt-2 d-flex'>
                                                    <button className="btn btn-primary w-100" onClick={postEdit} disabled={isLoading || !editPermission} > {isLoading ? 'Loading...' : 'Save Post'}</button>
                                                </div>
                                            </div>
                                        </div>
                                    </Modal.Body>
                                </Modal>
                            </div>
                        </div>
                    )}
                </div>
            </div >
        </div >
    );
}