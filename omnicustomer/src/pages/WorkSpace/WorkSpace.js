import React, { useState, useEffect, useRef } from 'react';
import { CreateWorkspace, fetchExpiringPlansList, DeleteWorkspace, fetchWorkspace, fetchWorkspaceToken, UpdateWorkspace, fetchWorkSpaceList } from '../../utils/ApiClient';
import { ConfirmationAlert, formatDateTime, setToken, triggerAlert, truncateName, setCookie, getCookie } from '../../utils/CommonFunctions';
import { Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { MaxLengthValidation, onlyAlphaNumericSpaces } from '../../utils/Constants';
import Skeleton from 'react-loading-skeleton';
import InfiniteScrollWrapper from '../../common/components/InfinityScrollWrapper';

export default function WorkSpace() {
    const [isLoading, setLoading] = useState(false);
    const [workspaces, setWorkspaces] = useState([]);
    const [show, setShow] = useState(false);
    const [modifyMode, setModifyMode] = useState("add");
    const [editId, setEditId] = useState(null);
    const [shuffledImages, setShuffledImages] = useState([]);
    const [imageLoading, setImageLoading] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreWorkspaces, setHasMoreWorkspaces] = useState(true);
    const [pageNumber, setPageNumber] = useState(1); // To track the active chat
    const pageSize = 10;
    const [showExpiringPlansModal, setShowExpiringPlansModal] = useState(false);
    const [expiringPlans, setExpiringPlans] = useState([]);
    const [activeTab, setActiveTab] = useState('active');


    const { register, handleSubmit, formState: { errors }, reset, watch, setValue, setError } = useForm();
    const backgroundImages = [
        '/assets/images/workspace-bg-1.png',
        '/assets/images/workspace-bg-2.png',
        '/assets/images/workspace-bg-3.png',
        '/assets/images/workspace-bg-4.png',
        '/assets/images/workspace-bg-5.png',
        '/assets/images/workspace-bg-6.png',
        '/assets/images/workspace-bg-7.png',
        '/assets/images/workspace-bg-8.png',
    ];
    const navigate = useNavigate();
    const handleShow = () => {
        setShow(true);
    }
    const handleClose = () => {
        setShow(false);
    }

    const handleAddWorkspace = () => {
        handleShow();
        setModifyMode("add");
        setEditId(null);
        reset();
    }

    const handleEdit = (item) => {
        setModifyMode("edit");
        handleShow();
        setValue('company_name', item.company_name);
        setValue('workspace_timezone', item.workspace_timezone);
        setEditId(item.id);
    }

    const fetchWorkspaces = async (resetData = false, tab = activeTab) => {
        setLoading(true);

        const status = tabStatusMap[tab]; // Map tab to API status
        const pageToFetch = resetData ? 1 : pageNumber;

        if (resetData) {
            setPageNumber(1);
            setWorkspaces([]);
        }

        const params = {
            page: pageToFetch,
            page_size: pageSize,
            status: status,
        };

        try {
            const response = await fetchWorkSpaceList(params);
            const response_data = response.data;
            if (response_data.error_code === 200) {
                const data = response_data.results?.data || [];

                if (resetData) {
                    setWorkspaces(data);
                } else {
                    setWorkspaces((prevWorkspaces) => {
                        const existingIds = new Set(prevWorkspaces.map(w => w.id));
                        const newWorkspaces = data.filter(workspace => !existingIds.has(workspace.id));
                        return [...prevWorkspaces, ...newWorkspaces];
                    });
                }

                setHasMoreWorkspaces(data.length === pageSize);
            } else {
                if (resetData) setWorkspaces([]);
                setHasMoreWorkspaces(false);
            }
        } catch (error) {
            console.error("Error fetching workspaces:", error);
            triggerAlert('error', '', error?.response?.data?.message || "Something went wrong...");
            if (resetData) setWorkspaces([]);
            setHasMoreWorkspaces(false);
        } finally {
            setLoading(false);
        }
    };


    const CreateWorkspaces = async (data) => {
        setLoading(true);
        try {
            let response;
            let errorCode;
            if (modifyMode === "add") {
                response = await CreateWorkspace(data);
                errorCode = 201;
            } else {
                response = await UpdateWorkspace(editId, data);
                errorCode = 200;
            }

            const response_data = response.data;
            if (response_data.error_code === errorCode) {
                handleClose();
                triggerAlert('success', "", response_data?.message || "Success");

                // Reset everything before fetching again
                setPageNumber(1);
                setWorkspaces([]);
                setHasMoreWorkspaces(true);

                // Use the reset parameter to completely refresh the workspace list
                fetchWorkspaces(true);
            }
        } catch (error) {
            const response_data = error?.response?.data;
            if (response_data?.error_code === 400) {
                triggerAlert('error', ' ', response_data?.message);
            } else {
                triggerAlert('error', ' ', response_data ? response_data.message : "Something went wrong!");
            }
        } finally {
            setLoading(false);
            handleClose();
        }
    }

    const handleDelete = async (id) => {
        ConfirmationAlert('You want to continue!', 'Continue', async () => {
            setLoading(true);
            try {
                const response = await DeleteWorkspace(id);
                const response_data = response.data;
                if (response.status === 204) {
                    triggerAlert('success', "", "Successfully deleted");

                    // Reset everything before fetching again
                    setPageNumber(1);
                    setWorkspaces([]);
                    setHasMoreWorkspaces(true);

                    // Use the reset parameter to completely refresh the workspace list
                    fetchWorkspaces(true);
                }
            } catch (error) {
                console.error("Error deleting workspace:", error);
                triggerAlert('error', '', "Failed to delete workspace");
            } finally {
                setLoading(false);
            }
        })
    }

    const shuffleArray = (array) => {
        return array.sort(() => Math.random() - 0.5);
    };

    const handleImageLoad = (index) => {
        setImageLoading((prev) => ({ ...prev, [index]: false }));
    };

    const handleImageError = (index) => {
        setImageLoading((prev) => ({ ...prev, [index]: false }));
    };

    const imageRefs = useRef([]);


    const tabStatusMap = {
        active: 1,
        inactive: 0
    };


    useEffect(() => {
        // Only fetch if not already loading and not resetting
        if (!isLoading) {
            fetchWorkspaces(false);
        }
        setShuffledImages(shuffleArray([...backgroundImages]));
    }, [pageNumber]); // Remove pageSize dependency as it doesn't change

    useEffect(() => {
        fetchWorkspaces(true, activeTab);
    }, [activeTab]);


    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        observer.unobserve(img);
                    }
                });
            },
            { threshold: 0.1 }
        );

        imageRefs.current.forEach((img) => {
            if (img) {
                observer.observe(img);
            }
        });

        return () => {
            observer.disconnect();
        };
    }, [shuffledImages]);

    const handleNavigateLanding = (id, companyName) => {
        if (id) {
            fetchWToken(id);

            // 1. Store in cookie with explicit path and expiration
            document.cookie = `selected_workspace_id=${id}; path=/; max-age=86400`; // 1 day
            document.cookie = `selected_workspace_name=${companyName}; path=/; max-age=86400`;

            // 2. Store in localStorage (multiple keys for redundancy)
            localStorage.setItem('workspace_id', id);
            localStorage.setItem('current_workspace_id', id);
            localStorage.setItem('selected_workspace_name', companyName);

            // 3. Navigate with query param as additional fallback
            navigate(`/landing?workspace_id=${id}`);
        } else {
            navigate('/landing');
        }
    }

    const fetchWToken = async (id) => {
        try {
            const response = await fetchWorkspaceToken(id);
            const response_data = response.data;
            if (response_data.error_code === 200) {
                const w_token = response_data.results?.token;
                setToken(w_token);
            } else {
                console.error("Error fetching workspace token:", response_data.error_code);
            }
        } catch (error) {
            console.error("Error fetching media data:", error);
            const error_msg = error?.response?.data
            triggerAlert('error', '', error_msg?.message || "Something went wrong...");
        }
    }

    const handleFetchMoreWorkspaces = () => {
        if (hasMoreWorkspaces && !isLoading) {
            setPageNumber((prevPage) => prevPage + 1);
        }
    };

    const userType = getCookie('user_type'); // Fetch user_type from cookies
    useEffect(() => {
        const fetchExpiringPlans = async () => {
            try {
                const response = await fetchExpiringPlansList();
                const response_data = response.data;
                if (response_data.error_code === 200) {
                    const plans = response_data.results || [];
                    const currentDate = new Date('2025-05-20T13:24:00+05:30'); // Current date: May 20, 2025, 01:24 PM IST
                    const fourDaysFromNow = new Date(currentDate.getTime() + 4 * 24 * 60 * 60 * 1000); // May 24, 2025, 01:24 PM IST

                    // Filter plans that are active and replace underscores with spaces
                    const activePlans = plans
                        .filter(plan => plan.plan_expire === "Active")
                        .map(plan => ({
                            ...plan,
                            workspace_name: plan.workspace_name.replace(/_/g, ' '),
                            plan_type: plan.plan_type.replace(/_/g, ' '),
                            // Flag plans expiring within 4 days
                            isExpiringSoon: new Date(plan.expire_date) <= fourDaysFromNow
                        }));

                    setExpiringPlans(activePlans);
                    if (activePlans.length > 0) {
                        setShowExpiringPlansModal(true);
                    }
                } else {
                    triggerAlert('error', '', response_data?.message || "Something went wrong...");
                }
            } catch (error) {
                console.error("Error fetching expiring plans:", error);
                triggerAlert('error', '', "Failed to fetch expiring plans");
            }
        };

        fetchExpiringPlans();
    }, []);

    const formatPlanType = (type) => {
        const normalized = type.replace(/_/g, ' ').toLowerCase();

        if (normalized === 'sms') return 'SMS';
        if (normalized === 'whatsapp') return 'WhatsApp';
        if (normalized === 'social media') return 'Social Media';
        // Capitalize only the first letter
        return normalized.charAt(0).toUpperCase() + normalized.slice(1);
    };

    return (
        <>
            <div>
                <div className="position-relative"></div>
                <div id="content-page" className="content-page">
                    <div className="container">
                        <div className="row w-100 mb-4 mt-5">
                            <InfiniteScrollWrapper
                                dataLength={workspaces.length}
                                next={handleFetchMoreWorkspaces}
                                hasMore={hasMoreWorkspaces}
                                // loader={<Skeleton height={20} width={200} />}
                                scrollableTarget="scrollableDivworkspaces"
                            >
                                <div className="d-flex align-items-center justify-content-between flex-wrap">
                                    <h4 className="fw-bold text-primary">Workspaces</h4>
                                    <div className="iq-search-bar device-search  position-relative"></div>
                                </div>
                            </InfiniteScrollWrapper>
                        </div>
                        <div className="row mb-3">
                            <div className="col-12">
                                <ul className="nav nav-tabs" role="tablist">
                                    <li className="nav-item" role="presentation">
                                        <button
                                            className={`nav-link ${activeTab === 'active' ? 'active' : ''}`}
                                            onClick={() => {
                                                setActiveTab('active');
                                                setPageNumber(1);
                                                setWorkspaces([]);
                                                setHasMoreWorkspaces(true);
                                                fetchWorkspaces(true, 'active'); // fetch Active workspaces
                                            }}
                                            type="button"
                                        >
                                            Active
                                        </button>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <button
                                            className={`nav-link ${activeTab === 'inactive' ? 'active' : ''}`}
                                            onClick={() => {
                                                setActiveTab('inactive');
                                                setPageNumber(1);
                                                setWorkspaces([]);
                                                setHasMoreWorkspaces(true);
                                                fetchWorkspaces(true, 'inactive'); // fetch Inactive workspaces
                                            }}
                                            type="button"
                                        >
                                            Inactive
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="tab-content">
                            <div className={`tab-pane fade ${activeTab === 'active' ? 'show active' : ''}`}>
                                {activeTab === 'active' && (
                                    <div className="row g-3 mb-4">
                                        {isLoading ? (
                                            <>
                                                {[...Array(6)].map((_, index) => (
                                                    <div className="col-sm-6 col-md-4" key={index}>
                                                        <div className="card border-dashed card-hover card-bg">
                                                            <div className="card-header border-0 d-flex justify-content-between">
                                                                <div className="header-title">
                                                                    <Skeleton height={20} width={200} />
                                                                    <Skeleton height={20} width={150} />
                                                                </div>
                                                                <div className="card-header-toolbar d-flex align-items-center">
                                                                    <div className="dropdown btn btn-sm btn-primary pb-0">
                                                                        <div className="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span className="material-symbols-outlined">more_horiz</span>
                                                                        </div>
                                                                        <div className="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a className="dropdown-item d-flex align-items-center" href="#/">
                                                                                <span className="material-symbols-outlined me-2 md-18">edit_note</span>Edit</a>
                                                                            <a className="dropdown-item d-flex align-items-center" href="#/">
                                                                                <span className="material-symbols-outlined me-2 md-18">delete</span>Delete</a>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="card-body">
                                                                <Skeleton height={200} width={300} />
                                                            </div>
                                                            <div className="card-footer card-footer-bg">
                                                                <div className="row gy-3 justify-content-center">
                                                                    <div className="col-lg-2 col-sm-4 col-3">
                                                                        <Skeleton circle={true} height={45} width={45} />
                                                                    </div>
                                                                    <div className="col-lg-2 col-sm-4 col-3">
                                                                        <Skeleton circle={true} height={45} width={45} />
                                                                    </div>
                                                                    <div className="col-lg-2 col-sm-4 col-3">
                                                                        <Skeleton circle={true} height={45} width={45} />
                                                                    </div>
                                                                    <div className="col-lg-2 col-sm-4 col-3">
                                                                        <Skeleton circle={true} height={45} width={45} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </>
                                        ) : workspaces.length === 0 ? (
                                            <div className="col-12">
                                                {/* <div className="text-center p-5">
                                        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#6c757d' }}>business</span>
                                        <h5 className="mt-3">No Workspace Selected</h5>
                                        <p className="text-muted">No workspaces have been assigned yet.</p>
                                    </div> */}
                                            </div>
                                        ) : (
                                            workspaces?.map((item, index) => (
                                                <div className="col-sm-6 col-md-4" key={item?.id}>
                                                    <div className="card border-dashed card-hover card-bg" style={{ cursor: 'pointer', backgroundImage: `url("${shuffledImages[index % shuffledImages.length]}")` }}>
                                                        <div className="card-header border-0 d-flex justify-content-between">
                                                            <div className="header-title">
                                                                <h5 className="card-title-w fw-semibold">{item?.company_name ? truncateName(item.company_name, 30) : '-'}</h5>
                                                                <h5 className="card-title-w">{item?.created_at ? formatDateTime(item?.created_at, 'mm/dd/yyyy') : '-'}</h5>
                                                            </div>
                                                            <div className="card-header-toolbar d-flex align-items-center">
                                                                {userType !== 'sub_user' && (
                                                                    <div className="dropdown btn btn-sm btn-primary pb-0">
                                                                        <div className="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span className="material-symbols-outlined">more_horiz</span>
                                                                        </div>
                                                                        <div className="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a className="dropdown-item d-flex align-items-center" href="#/" onClick={() => handleEdit(item)}>
                                                                                <span className="material-symbols-outlined me-2 md-18">edit_note</span>Edit</a>
                                                                            <a className="dropdown-item d-flex align-items-center" href="#/" onClick={() => handleDelete(item?.id)}>
                                                                                <span className="material-symbols-outlined me-2 md-18">delete</span>Delete</a>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div
                                                            className="card-body"
                                                            onClick={() => {
                                                                if (activeTab === 'active') {
                                                                    handleNavigateLanding(item?.id, item?.company_name);
                                                                }
                                                            }}
                                                            style={{ cursor: activeTab === 'active' ? 'pointer' : 'not-allowed' }}
                                                        ></div>

                                                        <div className="card-footer card-footer-bg">
                                                            <div className="row gy-3 justify-content-center">
                                                                <div className="col-lg-2 col-sm-4 col-3">
                                                                    <a href="#/" className="d-inline-block">
                                                                        <span className="image">
                                                                            <img src="/assets/images/icon/facebook1.png" className="img-fluid" width="45" />
                                                                        </span>
                                                                    </a>
                                                                </div>
                                                                <div className="col-lg-2 col-sm-4 col-3">
                                                                    <a href="#/" className="d-inline-block">
                                                                        <span className="image">
                                                                            <img src="/assets/images/icon/twitter4.png" className="img-fluid" width="45" />
                                                                        </span>
                                                                    </a>
                                                                </div>
                                                                <div className="col-lg-2 col-sm-4 col-3">
                                                                    <a href="#/" className="d-inline-block">
                                                                        <span className="image">
                                                                            <img src="/assets/images/icon/pinterest3.png" className="img-fluid" width="45" />
                                                                        </span>
                                                                    </a>
                                                                </div>
                                                                <div className="col-lg-2 col-sm-4 col-3">
                                                                    <a href="#/" className="d-inline-block">
                                                                        <span className="image">
                                                                            <img src="/assets/images/icon/linkedin2.png" className="img-fluid" width="45" />
                                                                        </span>
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}

                                        {/* Conditionally render "Add New Workspace" card for customers */}
                                        {userType === 'customer' && (
                                            <div className="col-sm-6 col-md-4">
                                                <a href="#/" onClick={handleAddWorkspace}>
                                                    <div className="card border-dashed card-hover card-bg py-3 d-flex justify-content-center align-items-center" style={{ cursor: 'pointer' }}>
                                                        <div className="text-center">
                                                            <div className="justify-content-center md-36 text-primary bg-round2">
                                                                <i className="fa fa-plus-square-o fs-4" aria-hidden="true"></i>
                                                            </div>
                                                            <h5 className="mt-2 d-flex justify-content-center align-items-center">Add New <br /> Workspace</h5>
                                                        </div>
                                                    </div>
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className={`tab-pane fade ${activeTab === 'inactive' ? 'show active' : ''}`}>
                                {activeTab === 'inactive' && (
                                    <div className="row g-3 mb-4">
                                        {isLoading ? (
                                            <>
                                                {[...Array(6)].map((_, index) => (
                                                    <div className="col-sm-6 col-md-4" key={index}>
                                                        <div className="card border-dashed card-hover card-bg">
                                                            <div className="card-header border-0 d-flex justify-content-between">
                                                                <div className="header-title">
                                                                    <Skeleton height={20} width={200} />
                                                                    <Skeleton height={20} width={150} />
                                                                </div>
                                                            </div>
                                                            <div className="card-body">
                                                                <Skeleton height={200} width={300} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </>
                                        ) : workspaces.length === 0 ? (
                                            <div className="col-12">
                                                <div className="text-center p-5">
                                                    <h5 className="mt-3">No Inactive Workspaces</h5>
                                                    <p className="text-muted">All workspaces are currently active.</p>
                                                </div>
                                            </div>
                                        ) : (
                                            workspaces?.map((item, index) => (
                                                <div className="col-sm-6 col-md-4" key={item?.id}>
                                                    <div className="card border-dashed card-hover card-bg" style={{ cursor: 'pointer', backgroundImage: `url("${shuffledImages[index % shuffledImages.length]}")` }}>
                                                        <div className="card-header border-0 d-flex justify-content-between">
                                                            <div className="header-title">
                                                                <h5 className="card-title-w fw-semibold">{item?.company_name ? truncateName(item.company_name, 30) : '-'}</h5>
                                                                <h5 className="card-title-w">{item?.created_at ? formatDateTime(item?.created_at, 'mm/dd/yyyy') : '-'}</h5>
                                                            </div>
                                                            <div className="card-header-toolbar d-flex align-items-center">
                                                                {userType !== 'sub_user' && (
                                                                    <div className="dropdown btn btn-sm btn-primary pb-0">
                                                                        <div className="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                            <span className="material-symbols-outlined">more_horiz</span>
                                                                        </div>
                                                                        <div className="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" style={{}}>
                                                                            <a className="dropdown-item d-flex align-items-center" href="#/" onClick={() => handleEdit(item)}>
                                                                                <span className="material-symbols-outlined me-2 md-18">edit_note</span>Edit</a>
                                                                            <a className="dropdown-item d-flex align-items-center" href="#/" onClick={() => handleDelete(item?.id)}>
                                                                                <span className="material-symbols-outlined me-2 md-18">delete</span>Delete</a>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div
                                                            className="card-body"
                                                            onClick={() => {
                                                                if (activeTab === 'active') {
                                                                    handleNavigateLanding(item?.id, item?.company_name);
                                                                }
                                                            }}
                                                            style={{ cursor: activeTab === 'active' ? 'pointer' : 'not-allowed' }}
                                                        ></div>

                                                        <div className="card-footer card-footer-bg">
                                                            <div className="row gy-3 justify-content-center">
                                                                <div className="col-lg-2 col-sm-4 col-3">
                                                                    <a href="#/" className="d-inline-block">
                                                                        <span className="image">
                                                                            <img src="/assets/images/icon/facebook1.png" className="img-fluid" width="45" />
                                                                        </span>
                                                                    </a>
                                                                </div>
                                                                <div className="col-lg-2 col-sm-4 col-3">
                                                                    <a href="#/" className="d-inline-block">
                                                                        <span className="image">
                                                                            <img src="/assets/images/icon/twitter4.png" className="img-fluid" width="45" />
                                                                        </span>
                                                                    </a>
                                                                </div>
                                                                <div className="col-lg-2 col-sm-4 col-3">
                                                                    <a href="#/" className="d-inline-block">
                                                                        <span className="image">
                                                                            <img src="/assets/images/icon/pinterest3.png" className="img-fluid" width="45" />
                                                                        </span>
                                                                    </a>
                                                                </div>
                                                                <div className="col-lg-2 col-sm-4 col-3">
                                                                    <a href="#/" className="d-inline-block">
                                                                        <span className="image">
                                                                            <img src="/assets/images/icon/linkedin2.png" className="img-fluid" width="45" />
                                                                        </span>
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                show={show}
                onHide={handleClose}
                centered
                size="ml"
                aria-labelledby="exampleModalCenterTitle"
            >
                <Modal.Header closeButton>
                    <Modal.Title id="exampleModalCenterTitle">{modifyMode === "add" ? "Create" : "Edit"} a Workspace</Modal.Title>
                </Modal.Header>
                <form onSubmit={handleSubmit(CreateWorkspaces)}>
                    <Modal.Body>
                        <p className="text-center text-primary fw-bold">
                            A Workspace is a group of channels/Accounts and collaborators
                        </p>

                        <div className="row">
                            <div className="col-md-12 mb-3">
                                <label className="form-label" htmlFor="validationDefault01">
                                    Workspace name <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="validationDefault01"
                                    placeholder="Enter Workspace name"
                                    name="company_name"
                                    {...register("company_name", {
                                        required: "Workspace name is required",
                                        maxLength: MaxLengthValidation(100),
                                        pattern: {
                                            value: /^[a-zA-Z\s]+$/, // Allows only alphabets and spaces
                                            message: "Only alphabets and spaces are allowed",
                                        },
                                    })}
                                />
                                {errors.company_name && (
                                    <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                                        {errors.company_name.message}
                                    </div>
                                )}
                            </div>
                        </div>



                    </Modal.Body>
                    <Modal.Footer>
                        <button type="submit" className="btn btn-primary px-5" disabled={isLoading}>
                            {isLoading ? "Submitting..." : "Submit"}
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>
            <Modal
                show={showExpiringPlansModal}
                onHide={() => setShowExpiringPlansModal(false)}
                centered
                size="lg"
                aria-labelledby="expiringPlansModalTitle"
            >
                <Modal.Header closeButton style={{ borderBottom: '1px solid #dee2e6' }}>
                    <Modal.Title id="expiringPlansModalTitle" className="h4 text-warning fw-medium">
                        Active Plans Overview
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <p className="text-start text-primary fw-bold p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '0.5rem', border: '1px solid #dee2e6' }}>
                        The following plans are currently active:
                    </p>

                    {expiringPlans.length === 0 ? (
                        <p className="text-center text-muted">No active plans found.</p>
                    ) : (
                        <div className="table-responsive">

                            <table className="table table-bordered table-hover   table-bordered-custom table-striped ">
                                <thead className="bg-light text-nowrap">
                                    <tr>
                                        <th style={{ border: '1px solid #dee2e6' }}>Workspace Name</th>
                                        <th style={{ border: '1px solid #dee2e6' }}>Plan Type</th>
                                        <th style={{ border: '1px solid #dee2e6' }}>Expiry Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expiringPlans.map((plan, index) => (
                                        <tr key={index}>
                                            <td style={{ border: '1px solid #dee2e6' }}>{plan.workspace_name}</td>
                                            {/* <td style={{ border: '1px solid #dee2e6' }}>
                                                {plan.plan_type.charAt(0).toUpperCase() + plan.plan_type.slice(1).toLowerCase()}
                                            </td> */}
                                            <td style={{ border: '1px solid #dee2e6' }}>
                                                {formatPlanType(plan.plan_type)}
                                            </td>
                                            <td style={{ border: '1px solid #dee2e6', color: plan.isExpiringSoon ? 'red' : 'inherit' }}>
                                                {formatDateTime(plan.expire_date, 'yyyy-mm-dd')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer style={{ borderTop: '1px solid #dee2e6' }}>
                    <button type="button" className="btn btn-warning" onClick={() => setShowExpiringPlansModal(false)}>
                        Close
                    </button>
                </Modal.Footer>
            </Modal>


        </>
    )
}
