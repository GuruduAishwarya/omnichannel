import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { logout, triggerAlert, getCookie } from "../utils/CommonFunctions";
import { fetchUserDetailsData, selectViewHeader } from "../utils/ApiClient";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Compose from "../pages/Compose/Compose";
import ComposeModal from "../pages/Compose/ShowComposeModal";
import { useSharedState } from "./components/context/SidebarContext";
import Profile from './components/Profile';
import AppConfig from "../utils/Config";

export default function Header({
    toggleSidebar,
    handleToggleSidebar,
}) {
    // const initialValue = gettingMenuType();
    const navigate = useNavigate();
    const [userData, setUserData] = useState([]);
    const [addShow, setAddShow] = useState(false);
    const [selectView, setSelectView] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [viewDropdownOpen, setViewDropdownOpen] = useState(false);

    const [showComposeModal, setShowComposeModal] = useState(false);
    const [showMediaModal, setShowMediaModal] = useState(false);
    const { sidebarType, setSidebarType } = useSharedState();
    const handleRadioChange = (event) => {
        const selectedMenuType = event.target.value;
        setSidebarType(Number(selectedMenuType));
        navigate("/dashboard"); // Navigate to the default dashboard path
    };
    const workspace_id_from_cookie = getCookie('selected_workspace_id');
    const [workspaceId, setWorkspaceId] = useState(workspace_id_from_cookie || "");

    const handleAddShow = () => setAddShow(true);

    const fetchUserDetails = async () => {
        setIsLoading(true);
        if (!workspaceId) {
            return;
        }
        try {
            const response = await fetchUserDetailsData(workspaceId);
            const response_data = response.data;
            // console.log("data", response_data.error_code)
            if (response_data.error_code == 200) {
                const data = response.data.results;
                setUserData(data);
            } else {
                setUserData([]);
            }
        } catch (error) {
            const response_data = error?.response?.data;
        }
    };

    useEffect(() => {
        fetchUserDetails();
        // setSidebarType(initialValue);
    }, []);



    const handleComposeClose = () => {
        setShowComposeModal(false);
    };

    const handleShowComposeModal = () => {
        setShowComposeModal(true);
    };

    const handleMediaClose = () => {
        setShowMediaModal(false);
    };

    const handleShowMediaModal = () => {
        setShowMediaModal(true);
    };



    const location = useLocation();
    const [activeButton, setActiveButton] = useState("/payment"); // Default to the payments page
    const [activeButtonSupport, setActiveButtonSupport] =
        useState("/support-ticket"); // Default to support ticket page

    // Set the active button based on the current path
    useEffect(() => {
        const currentPath = location.pathname; // Get the current path
        // Check if the current path starts with '/payment' to keep it active
        setActiveButton(currentPath.startsWith("/payment") ? "/payment" : "");
        // Check if the current path starts with '/support-ticket' to keep it active
        setActiveButtonSupport(
            currentPath.startsWith("/support-ticket") ? "/support-ticket" : ""
        );
    }, [location]);


    const fetchSelectView = async () => {
        try {
            setIsLoading(true);
            const response = await selectViewHeader();
            if (response?.data?.error_code === 200) {
                setSelectView(response.data.results);
            } else {
                console.error('Error fetching allowed views:', response?.data?.message);
                setSelectView([]);
            }
        } catch (error) {
            console.error('Error fetching allowed views:', error);
            setSelectView([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSelectView();
    }, []);

    return (
        <div class="iq-top-navbar">
            <nav class="nav navbar navbar-expand-lg navbar-light iq-navbar p-lg-0">
                <div class="container-fluid navbar-inner">
                    <div class="d-flex align-items-center   gap-3 pb-2 pb-lg-0">
                        <Link
                            to="/workspace"
                            className="d-flex align-items-center gap-2 iq-header-logo"
                        >
                            <img
                                src={AppConfig.companyLogo ? AppConfig.companyLogo : "/assets/images/logo.svg"}
                                className="img-fluid"
                                width="200"
                                alt='logo'
                            />
                        </Link>
                        <a
                            className={`sidebar-toggle ${toggleSidebar ? "mini" : ""}`}
                            data-toggle="sidebar"
                            data-active="true"
                            href="javascript:void(0);"
                            onClick={handleToggleSidebar}
                        >
                            <div class="icon material-symbols-outlined iq-burger-menu">
                                menu
                            </div>
                        </a>

                        {/* <a className="sidebar-toggle" data-toggle="sidebar" data-active="true" href="javascript:void(0);">
               <div class="icon material-symbols-outlined iq-burger-menu">
                  menu
               </div>
            </a> */}

                        {/* <div class="iq-search-bar iq-search-bar2 device-search  position-relative">
                            <form action="#" class="searchbox" data-bs-toggle="modal" data-bs-target="#searchmodal">
                                <a class="search-link d-none d-lg-block" href="javascript:void(0);">
                                    <span class="material-symbols-outlined">search</span>
                                </a>
                                <input type="text" class="text search-input form-control    d-none d-lg-block"
                                    placeholder="Search here..." />
                                <a class="d-lg-none d-flex d-none d-lg-block" href="javascript:void(0);" data-bs-toggle="modal"
                                    data-bs-target="#searchmodal">
                                    <span class="material-symbols-outlined">search</span>
                                </a>
                            </form>
                        </div> */}


                    </div>
                    <div className="d-flex justify-content-center ">
                        <div
                            className="btn-group mt-1 checkboxradio"
                            role="group"
                            aria-label="Basic radio toggle button group"
                        // style={{
                        //     position: "relative",
                        //     left: "70%",
                        //     transform: "translateX(50%)",
                        // }}
                        >
                            <input
                                type="radio"
                                className="btn-check"
                                name="btnradio"
                                id="btnradio1"
                                value={0}
                                checked={sidebarType == 0}
                                onChange={handleRadioChange}
                            />
                            <label className="btn btn-outline-primary text-nowrap" htmlFor="btnradio1">
                                Social Media
                            </label>
                            <input
                                type="radio"
                                className="btn-check"
                                name="btnradio"
                                id="btnradio2"
                                value={1}
                                checked={sidebarType == 1}
                                onChange={handleRadioChange}
                            />
                            <label className="btn btn-outline-primary" htmlFor="btnradio2">
                                Communication
                            </label>
                        </div>
                    </div>
                    {/* Change password react modal start*/}
                    {/* <Modal show={addShow} onHide={handleAddClose} backdrop="static">
                        <Modal.Header closeButton>
                            <Modal.Title>Change Password</Modal.Title>
                        </Modal.Header>
                        <form
                            id="creditCardForm"
                            className=" g-3 fv-plugins-bootstrap5 fv-plugins-framework fv-plugins-icon-container"
                            onsubmit="return false"
                            novalidate="novalidate"
                            onSubmit={handleSubmit(changePassword)}
                        >
                            <Modal.Body>
                                <div className="row">
                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="old_password">
                                            Old Password
                                        </label>
                                        <div className="input-group">
                                            <input
                                                type={showOldPassword ? "text" : "password"}
                                                className="form-control"
                                                id="old_password"
                                                style={{ position: "relative" }}
                                                placeholder="Enter Current Password"
                                                {...register("old_password", {
                                                    required: "Current Password is required",
                                                    pattern: passwordPattern,
                                                    minLength: MinLengthValidation(6),
                                                    maxLength: MaxLengthValidation(15),
                                                })}
                                            />
                                            <button
                                                className="btn btn-primary"
                                                type="button"
                                                id="button-addon2"
                                                onClick={toggleOldPassword}
                                            >
                                                <i
                                                    className={`fa fa ${showOldPassword ? "fa-eye" : "fa-eye-slash"
                                                        } toggle-password field-icon `}
                                                ></i>
                                            </button>
                                        </div>
                                        {errors.old_password && (
                                            <div
                                                style={{
                                                    color: "red",
                                                    fontSize: "14px",
                                                    marginTop: "5px",
                                                }}
                                            >
                                                {errors.old_password.message}
                                            </div>
                                        )}
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="password">
                                            New Password
                                        </label>
                                        <div className="input-group">
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                className="form-control"
                                                id="password"
                                                style={{ position: "relative" }}
                                                placeholder="Enter New Password"
                                                {...register("password", {
                                                    required: "New Password is required",
                                                    pattern: passwordPattern,
                                                    minLength: MinLengthValidation(6),
                                                    maxLength: MaxLengthValidation(15),
                                                })}
                                            />
                                            <button
                                                className="btn btn-primary"
                                                type="button"
                                                id="button-addon2"
                                                onClick={toggleNewPassword}
                                            >
                                                <i
                                                    className={`fa fa ${showNewPassword ? "fa-eye" : "fa-eye-slash"
                                                        } toggle-password field-icon `}
                                                ></i>
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <div
                                                style={{
                                                    color: "red",
                                                    fontSize: "14px",
                                                    marginTop: "5px",
                                                }}
                                            >
                                                {errors.password.message}
                                            </div>
                                        )}
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="confirm_password">
                                            Confirm Password
                                        </label>
                                        <div className="input-group">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                className="form-control"
                                                id="confirm_password"
                                                style={{ position: "relative" }}
                                                placeholder="Enter Confirm Password"
                                                {...register("confirm_password", {
                                                    required: "Confirm Password is required",
                                                    pattern: passwordPattern,
                                                    minLength: MinLengthValidation(6),
                                                    maxLength: MaxLengthValidation(15),
                                                    validate: (value) =>
                                                        value === newPassword || "Passwords do not match",
                                                })}
                                            />
                                            <button
                                                className="btn btn-primary"
                                                type="button"
                                                id="button-addon2"
                                                onClick={toggleConfirmPassword}
                                            >
                                                <i
                                                    className={`fa fa ${showConfirmPassword ? "fa-eye" : "fa-eye-slash"
                                                        } toggle-password field-icon `}
                                                ></i>
                                            </button>
                                        </div>
                                        {errors.confirm_password && (
                                            <div
                                                style={{
                                                    color: "red",
                                                    fontSize: "14px",
                                                    marginTop: "5px",
                                                }}
                                            >
                                                {errors.confirm_password.message}
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </Modal.Body>
                            <Modal.Footer>
                                <button
                                    type="button"
                                    className="btn btn-warning"
                                    data-bs-dismiss="modal"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Submit
                                </button>
                            </Modal.Footer>
                        </form>
                    </Modal> */}
                    {/* Add number react modal end*/}

                    <ul class="navbar-nav navbar-list ms-4">
                        {/* <li class="nav-item">
                            <Link to="/payment" class="d-flex align-items-center">
                                <button type="button" class="btn btn-primary" >
                                    <i class="fa fa-credit-card" aria-hidden="true"></i> Payments</button>
                            </Link>
                        </li>
                        <li class="nav-item">
                            <Link to="/support-ticket" class="d-flex align-items-center">
                                <button type="button" class="btn btn-primary">
                                    <i class="fa fa-question-circle-o" aria-hidden="true"></i> Support</button>
                            </Link>
                        </li>
                        <li class="nav-item">
                            <a href="#" class="d-flex align-items-center">
                                <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#staticBackdrop">
                                    <i class="fa fa-pencil" aria-hidden="true"></i>
                                    Compose
                                </button>
                            </a>
                        </li> */}

                        {/* <li className="nav-item">
                            <Link
                                to="/payment"
                                className="d-flex align-items-center"
                            >
                                <button
                                    type="button"
                                    className={`btn ${activeButton === '/payment' ? 'btn-warning' : 'btn-primary'}`} // Conditional class application
                                    onClick={() => setActiveButton('/payment')} // Update active button on click
                                >
                                    <i className="fa fa-credit-card" aria-hidden="true"></i> Payments
                                </button>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/support-ticket" className="d-flex align-items-center">
                                <button
                                    type="button"
                                    className={`btn ${activeButtonSupport === '/support-ticket' ? 'btn-warning' : 'btn-primary'}`} // Conditional class application
                                    onClick={() => setActiveButtonSupport('/support-ticket')} // Update active button on click
                                >
                                    <i className="fa fa-question-circle-o" aria-hidden="true"></i> Support
                                </button>
                            </Link>
                        </li> */}
                        {/* <li class="nav-item">
                            <a href="#" class="d-flex align-items-center">
                                <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#staticBackdrop">
                                    <i class="fa fa-pencil" aria-hidden="true"></i>
                                    Compose
                                </button>
                            </a>
                        </li> */}
                        {sidebarType == 0 && <>
                            <li className="nav-item">
                                <a className="d-flex align-items-center" href="#/" onClick={handleShowComposeModal}>
                                    <button type="button" className="btn btn-primary">
                                        <i className="fa fa-pencil" aria-hidden="true"></i> Compose
                                    </button>
                                </a>
                            </li>
                            {showComposeModal && <Compose showComposeModal={showComposeModal} handleComposeClose={handleComposeClose} />}
                            <li className="nav-item dropdown">
                                <a
                                    // href="#!"
                                    className="d-flex align-items-center "
                                    href="#"
                                    onClick={handleShowMediaModal}
                                >
                                    <span className="material-symbols-outlined">perm_media</span>
                                    <span className="ms-2 font-size-14 hover-effect">Media</span>
                                </a>
                            </li>
                            <ComposeModal show={showMediaModal} onHide={handleMediaClose} />

                            <li className="nav-item dropdown">
                                <a
                                    href="javascript:void(0);"
                                    className="search-toggle dropdown-toggle d-flex align-items-center"
                                    id="notification-drop"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                    onClick={() => {
                                        if (!viewDropdownOpen) {
                                            fetchSelectView(); // Fetch on first click
                                        }
                                        setViewDropdownOpen(!viewDropdownOpen);
                                    }}
                                >
                                    <i className="material-symbols-outlined">view_agenda</i>
                                    <span className="ms-2 font-size-14">Select View </span>
                                </a>

                                <div
                                    className="sub-drop dropdown-menu dropdown-width"
                                    aria-labelledby="notification-drop"
                                    style={{ width: "100%", display: viewDropdownOpen ? "block" : "none" }}
                                >
                                    <div className="card shadow-none m-0">
                                        <div className="card-body p-0">
                                            {selectView.map((view) => {
                                                let route = "/";
                                                let icon = "view_agenda";
                                                let label = view.name;

                                                switch (view.name.toLowerCase()) {
                                                    case "feed":
                                                        route = "/listview";
                                                        icon = "view_list";
                                                        label = "List"; // ✅ Change label for display
                                                        break;
                                                    case "calendar":
                                                        route = "/calenderview";
                                                        icon = "event_note";
                                                        label = "Calendar";
                                                        break;
                                                    case "grid views":
                                                        route = "/feedview";
                                                        icon = "grid_view";
                                                        label = "Grid";
                                                        break;
                                                    default:
                                                        label = view.name;
                                                }

                                                return (
                                                    <div
                                                        key={view.id}
                                                        className="d-flex align-items-center iq-sub-card border-0"
                                                        onClick={() => {
                                                            navigate(route);
                                                            setViewDropdownOpen(false);
                                                        }}
                                                    >
                                                        <span className="material-symbols-outlined">{icon}</span>
                                                        <div className="ms-3">
                                                            <a href="#/" className="mb-0 h6">
                                                                {label} View
                                                            </a>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </li>


                        </>}

                        {/* <li class="nav-item ">
                            <a href="javascript:void(0);" class="dropdown-toggle d-flex align-items-center" data-bs-toggle="modal" data-bs-target="#Pages">
                                <span class="material-symbols-outlined">note_add</span> <span class="ms-2 font-size-14">Add page </span>

                            </a>
                        </li>
                        <li class="nav-item ">
                            <a href="javascript:void(0);" class="dropdown-toggle d-flex align-items-center" id="settingbutton" data-bs-toggle="offcanvas" data-bs-target="#live-customizer1" role="button" aria-controls="live-customizer">
                                <span class="material-symbols-outlined">filter_list</span> <span class="ms-2 font-size-14">Filter </span>
                            </a>
                        </li>


                        <li class="nav-item ">
                            <a href="javascript:void(0);" class="dropdown-toggle d-flex align-items-center" data-bs-toggle="modal" data-bs-target="#exampleModal">
                                <span class="material-symbols-outlined">perm_media</span> <span class="ms-2 font-size-14">Media </span>
                            </a>

                            <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                <div class="modal-dialog modal-dialog-centered modal-lg">
                                    <div class="modal-content">
                                        <div class="modal-header">
                                            <h1 class="modal-title fs-5" id="exampleModalLabel">Upload media</h1>
                                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                        </div>
                                        <div class="modal-body">
                                            <div class="row">
                                                <div class=" ">
                                                    <div class="card-body">
                                                        <ul class="nav   mb-3 nav-fill" id="pills-tab-1" role="tablist">
                                                            <li class="nav-item" role="presentation">
                                                                <a class="nav-link active" id="pills-home1-tab-fill" data-bs-toggle="pill" href="#pills-home1-fill" role="tab" aria-controls="pills-home1" aria-selected="true">Photos </a>
                                                            </li>
                                                            <li class="nav-item" role="presentation">
                                                                <a class="nav-link" id="pills-profile2-tab-fill" data-bs-toggle="pill" href="#pills-profile2-fill" role="tab" aria-controls="pills-profile2" aria-selected="false" tabindex="-1">Videos</a>
                                                            </li>
                                                            <li class="nav-item" role="presentation">
                                                                <a class="nav-link" id="pills-contact3-tab-fill" data-bs-toggle="pill" href="#pills-contact3-fill" role="tab" aria-controls="pills-contact3" aria-selected="false" tabindex="-1">Docs</a>
                                                            </li>
                                                        </ul>
                                                        <div class="tab-content" id="pills-tabContent-1">
                                                            <div class="tab-pane fade show active" id="pills-home1-fill" role="tabpanel" aria-labelledby="pills-home1-tab-fill">
                                                                <div class="row">
                                                                    <div class="col-lg-4 col-md-6">
                                                                        <div class="user-images position-relative overflow-hidden mb-3">
                                                                            <a data-fslightbox="gallery" href="/assets/images/page-img/51.jpg">
                                                                                <img src="/assets/images/page-img/51.jpg" class="img-fluid rounded" alt="photo-profile" loading="lazy" />
                                                                            </a>
                                                                            <div class="image-hover-data">
                                                                                <div class="product-elements-icon">
                                                                                    <ul class="d-flex align-items-center m-0 p-0 list-inline">
                                                                                        <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 60 <i class="material-symbols-outlined md-14 ms-1">
                                                                                            thumb_up
                                                                                        </i> </a>
                                                                                        </li>
                                                                                        <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 30 <span class="material-symbols-outlined  md-14 ms-1">
                                                                                            chat_bubble_outline
                                                                                        </span> </a>
                                                                                        </li>
                                                                                        <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 10 <span class="material-symbols-outlined md-14 ms-1">
                                                                                            forward
                                                                                        </span></a>
                                                                                        </li>
                                                                                    </ul>
                                                                                </div>
                                                                            </div>
                                                                            <a href="#" class="image-edit-btn material-symbols-outlined md-16" data-bs-toggle="tooltip" data-bs-placement="top" title="" data-bs-original-title="Edit or Remove">
                                                                                drive_file_rename_outline
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                    <div class="col-lg-4 col-md-6">
                                                                        <div class="user-images position-relative overflow-hidden mb-3">
                                                                            <a data-fslightbox="gallery" href="/assets/images/page-img/52.jpg">
                                                                                <img src="/assets/images/page-img/52.jpg" class="img-fluid rounded" alt="photo-profile" loading="lazy" />
                                                                            </a>
                                                                            <div class="image-hover-data">
                                                                                <div class="product-elements-icon">
                                                                                    <ul class="d-flex align-items-center m-0 p-0 list-inline">
                                                                                        <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 60 <i class="material-symbols-outlined md-14 ms-1">
                                                                                            thumb_up
                                                                                        </i> </a>
                                                                                        </li>
                                                                                        <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 30 <span class="material-symbols-outlined  md-14 ms-1">
                                                                                            chat_bubble_outline
                                                                                        </span> </a>
                                                                                        </li>
                                                                                        <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 10 <span class="material-symbols-outlined md-14 ms-1">
                                                                                            forward
                                                                                        </span></a>
                                                                                        </li>
                                                                                    </ul>
                                                                                </div>
                                                                            </div>
                                                                            <a href="#" class="image-edit-btn material-symbols-outlined md-16" data-bs-toggle="tooltip" data-bs-placement="top" title="" data-bs-original-title="Edit or Remove">
                                                                                drive_file_rename_outline
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                    <div class="col-lg-4 col-md-6">
                                                                        <div class="user-images position-relative overflow-hidden mb-3">
                                                                            <a data-fslightbox="gallery" href="/assets/images/page-img/53.jpg">
                                                                                <img src="/assets/images/page-img/53.jpg" class="img-fluid rounded" alt="photo-profile" loading="lazy" />
                                                                            </a>
                                                                            <div class="image-hover-data">
                                                                                <div class="product-elements-icon">
                                                                                    <ul class="d-flex align-items-center m-0 p-0 list-inline">
                                                                                        <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 60 <i class="material-symbols-outlined md-14 ms-1">
                                                                                            thumb_up
                                                                                        </i> </a>
                                                                                        </li>
                                                                                        <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 30 <span class="material-symbols-outlined  md-14 ms-1">
                                                                                            chat_bubble_outline
                                                                                        </span> </a>
                                                                                        </li>
                                                                                        <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 10 <span class="material-symbols-outlined md-14 ms-1">
                                                                                            forward
                                                                                        </span></a>
                                                                                        </li>
                                                                                    </ul>
                                                                                </div>
                                                                            </div>
                                                                            <a href="#" class="image-edit-btn material-symbols-outlined md-16" data-bs-toggle="tooltip" data-bs-placement="top" title="" data-bs-original-title="Edit or Remove">
                                                                                drive_file_rename_outline
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                    <div class="col-lg-4 col-md-6">
                                                                        <div class="user-images position-relative overflow-hidden mb-3">
                                                                            <a data-fslightbox="gallery" href="/assets/images/page-img/54.jpg">
                                                                                <img src="/assets/images/page-img/54.jpg" class="img-fluid rounded" alt="photo-profile" loading="lazy" />
                                                                            </a>
                                                                            <div class="image-hover-data">
                                                                                <div class="product-elements-icon">
                                                                                    <ul class="d-flex align-items-center m-0 p-0 list-inline">
                                                                                        <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 60 <i class="material-symbols-outlined md-14 ms-1">
                                                                                            thumb_up
                                                                                        </i> </a>
                                                                                        </li>
                                                                                        <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 30 <span class="material-symbols-outlined  md-14 ms-1">
                                                                                            chat_bubble_outline
                                                                                        </span> </a>
                                                                                        </li>
                                                                                        <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 10 <span class="material-symbols-outlined md-14 ms-1">
                                                                                            forward
                                                                                        </span></a>
                                                                                        </li>
                                                                                    </ul>
                                                                                </div>
                                                                            </div>
                                                                            <a href="#" class="image-edit-btn material-symbols-outlined md-16" data-bs-toggle="tooltip" data-bs-placement="top" title="" data-bs-original-title="Edit or Remove">
                                                                                drive_file_rename_outline
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                    <div class="col-lg-4 col-md-6">
                                                                        <div class="user-images position-relative overflow-hidden mb-3">
                                                                            <a data-fslightbox="gallery" href="/assets/images/page-img/55.jpg">
                                                                                <img src="/assets/images/page-img/55.jpg" class="img-fluid rounded" alt="photo-profile" loading="lazy" />
                                                                            </a>
                                                                            <div class="image-hover-data">
                                                                                <div class="product-elements-icon">
                                                                                    <ul class="d-flex align-items-center m-0 p-0 list-inline">
                                                                                        <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 60 <i class="material-symbols-outlined md-14 ms-1">
                                                                                            thumb_up
                                                                                        </i> </a>
                                                                                        </li>
                                                                                        <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 30 <span class="material-symbols-outlined  md-14 ms-1">
                                                                                            chat_bubble_outline
                                                                                        </span> </a>
                                                                                        </li>
                                                                                        <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 10 <span class="material-symbols-outlined md-14 ms-1">
                                                                                            forward
                                                                                        </span></a>
                                                                                        </li>
                                                                                    </ul>
                                                                                </div>
                                                                            </div>
                                                                            <a href="#" class="image-edit-btn material-symbols-outlined md-16" data-bs-toggle="tooltip" data-bs-placement="top" title="" data-bs-original-title="Edit or Remove">
                                                                                drive_file_rename_outline
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                    <div class="col-lg-4 col-md-6">
                                                                        <div class="user-images position-relative overflow-hidden mb-3">
                                                                            <a data-fslightbox="gallery" href="/assets/images/page-img/56.jpg">
                                                                                <img src="/assets/images/page-img/56.jpg" class="img-fluid rounded" alt="photo-profile" loading="lazy" />
                                                                            </a>
                                                                            <div class="image-hover-data">
                                                                                <div class="product-elements-icon">
                                                                                    <ul class="d-flex align-items-center m-0 p-0 list-inline">
                                                                                        <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 60 <i class="material-symbols-outlined md-14 ms-1">
                                                                                            thumb_up
                                                                                        </i> </a>
                                                                                        </li>
                                                                                        <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 30 <span class="material-symbols-outlined  md-14 ms-1">
                                                                                            chat_bubble_outline
                                                                                        </span> </a>
                                                                                        </li>
                                                                                        <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 10 <span class="material-symbols-outlined md-14 ms-1">
                                                                                            forward
                                                                                        </span></a>
                                                                                        </li>
                                                                                    </ul>
                                                                                </div>
                                                                            </div>
                                                                            <a href="#" class="image-edit-btn material-symbols-outlined md-16" data-bs-toggle="tooltip" data-bs-placement="top" title="" data-bs-original-title="Edit or Remove">
                                                                                drive_file_rename_outline
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="tab-pane fade" id="pills-profile2-fill" role="tabpanel" aria-labelledby="pills-profile2-tab-fill">
                                                                <div class="row">
                                                                    <div class="col-lg-4 col-md-6">
                                                                        <div class="card">
                                                                            <div class="card-body card-thumbnail p-0">
                                                                                <div class="position-relative iq-video-hover user-images position-relative overflow-hidden">
                                                                                    <a data-fslightbox="html5-video" href="/assets/images/plugins/video-2.mp4">
                                                                                        <img src="/assets/images/page-img/54.jpg" class="img-fluid rounded" alt="file-manager" loading="lazy" />
                                                                                    </a>
                                                                                    <div class="image-hover-data">
                                                                                        <div class="product-elements-icon">
                                                                                            <ul class="d-flex align-items-center m-0 p-0 list-inline">
                                                                                                <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 60 <i class="material-symbols-outlined md-14 ms-1">
                                                                                                    thumb_up
                                                                                                </i> </a>
                                                                                                </li>
                                                                                                <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 30 <span class="material-symbols-outlined  md-14 ms-1">
                                                                                                    chat_bubble_outline
                                                                                                </span> </a>
                                                                                                </li>
                                                                                                <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 10 <span class="material-symbols-outlined md-14 ms-1">
                                                                                                    forward
                                                                                                </span></a>
                                                                                                </li>
                                                                                            </ul>
                                                                                        </div>
                                                                                    </div>
                                                                                    <a href="#" class="image-edit-btn material-symbols-outlined md-16" data-bs-toggle="tooltip" data-bs-placement="top" title="" data-bs-original-title="Edit or Remove">
                                                                                        drive_file_rename_outline
                                                                                    </a>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div class="col-lg-4 col-md-6">
                                                                        <div class="card">
                                                                            <div class="card-body card-thumbnail p-0">
                                                                                <div class="position-relative iq-video-hover user-images position-relative overflow-hidden">
                                                                                    <a data-fslightbox="html5-video" href="/assets/images/plugins/video-3.mp4">
                                                                                        <img src="/assets/images/page-img/53.jpg" class="img-fluid rounded" alt="file-manager" loading="lazy" />
                                                                                    </a>
                                                                                    <div class="image-hover-data">
                                                                                        <div class="product-elements-icon">
                                                                                            <ul class="d-flex align-items-center m-0 p-0 list-inline">
                                                                                                <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 60 <i class="material-symbols-outlined md-14 ms-1">
                                                                                                    thumb_up
                                                                                                </i> </a>
                                                                                                </li>
                                                                                                <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 30 <span class="material-symbols-outlined  md-14 ms-1">
                                                                                                    chat_bubble_outline
                                                                                                </span> </a>
                                                                                                </li>
                                                                                                <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 10 <span class="material-symbols-outlined md-14 ms-1">
                                                                                                    forward
                                                                                                </span></a>
                                                                                                </li>
                                                                                            </ul>
                                                                                        </div>
                                                                                    </div>
                                                                                    <a href="#" class="image-edit-btn material-symbols-outlined md-16" data-bs-toggle="tooltip" data-bs-placement="top" title="" data-bs-original-title="Edit or Remove">
                                                                                        drive_file_rename_outline
                                                                                    </a>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div class="col-lg-4 col-md-6">
                                                                        <div class="card">
                                                                            <div class="card-body card-thumbnail p-0">
                                                                                <div class="position-relative iq-video-hover user-images position-relative overflow-hidden">
                                                                                    <a data-fslightbox="html5-video" href="/assets/images/plugins/video-3.mp4">
                                                                                        <img src="/assets/images/page-img/53.jpg" class="img-fluid rounded" alt="file-manager" loading="lazy" />
                                                                                    </a>
                                                                                    <div class="image-hover-data">
                                                                                        <div class="product-elements-icon">
                                                                                            <ul class="d-flex align-items-center m-0 p-0 list-inline">
                                                                                                <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 60 <i class="material-symbols-outlined md-14 ms-1">
                                                                                                    thumb_up
                                                                                                </i> </a>
                                                                                                </li>
                                                                                                <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 30 <span class="material-symbols-outlined  md-14 ms-1">
                                                                                                    chat_bubble_outline
                                                                                                </span> </a>
                                                                                                </li>
                                                                                                <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 10 <span class="material-symbols-outlined md-14 ms-1">
                                                                                                    forward
                                                                                                </span></a>
                                                                                                </li>
                                                                                            </ul>
                                                                                        </div>
                                                                                    </div>
                                                                                    <a href="#" class="image-edit-btn material-symbols-outlined md-16" data-bs-toggle="tooltip" data-bs-placement="top" title="" data-bs-original-title="Edit or Remove">
                                                                                        drive_file_rename_outline
                                                                                    </a>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div class="col-lg-4 col-md-6">
                                                                        <div class="card">
                                                                            <div class="card-body card-thumbnail p-0">
                                                                                <div class="position-relative iq-video-hover user-images position-relative overflow-hidden">
                                                                                    <a data-fslightbox="html5-video" href="/assets/images/plugins/video-1.mp4">
                                                                                        <img src="/assets/images/page-img/54.jpg" class="img-fluid rounded" alt="file-manager" loading="lazy" />
                                                                                    </a>
                                                                                    <div class="image-hover-data">
                                                                                        <div class="product-elements-icon">
                                                                                            <ul class="d-flex align-items-center m-0 p-0 list-inline">
                                                                                                <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 60 <i class="material-symbols-outlined md-14 ms-1">
                                                                                                    thumb_up
                                                                                                </i> </a>
                                                                                                </li>
                                                                                                <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 30 <span class="material-symbols-outlined  md-14 ms-1">
                                                                                                    chat_bubble_outline
                                                                                                </span> </a>
                                                                                                </li>
                                                                                                <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 10 <span class="material-symbols-outlined md-14 ms-1">
                                                                                                    forward
                                                                                                </span></a>
                                                                                                </li>
                                                                                            </ul>
                                                                                        </div>
                                                                                    </div>
                                                                                    <a href="#" class="image-edit-btn material-symbols-outlined md-16" data-bs-toggle="tooltip" data-bs-placement="top" title="" data-bs-original-title="Edit or Remove">
                                                                                        drive_file_rename_outline
                                                                                    </a>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div class="col-lg-4 col-md-6">
                                                                        <div class="card">
                                                                            <div class="card-body card-thumbnail p-0">
                                                                                <div class="position-relative iq-video-hover user-images position-relative overflow-hidden">
                                                                                    <a data-fslightbox="html5-video" href="/assets/images/plugins/video-2.mp4">
                                                                                        <img src="/assets/images/page-img/55.jpg" class="img-fluid rounded" alt="file-manager" loading="lazy" />
                                                                                    </a>
                                                                                    <div class="image-hover-data">
                                                                                        <div class="product-elements-icon">
                                                                                            <ul class="d-flex align-items-center m-0 p-0 list-inline">
                                                                                                <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 60 <i class="material-symbols-outlined md-14 ms-1">
                                                                                                    thumb_up
                                                                                                </i> </a>
                                                                                                </li>
                                                                                                <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 30 <span class="material-symbols-outlined  md-14 ms-1">
                                                                                                    chat_bubble_outline
                                                                                                </span> </a>
                                                                                                </li>
                                                                                                <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 10 <span class="material-symbols-outlined md-14 ms-1">
                                                                                                    forward
                                                                                                </span></a>
                                                                                                </li>
                                                                                            </ul>
                                                                                        </div>
                                                                                    </div>
                                                                                    <a href="#" class="image-edit-btn material-symbols-outlined md-16" data-bs-toggle="tooltip" data-bs-placement="top" title="" data-bs-original-title="Edit or Remove">
                                                                                        drive_file_rename_outline
                                                                                    </a>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div class="col-lg-4 col-md-6">
                                                                        <div class="card">
                                                                            <div class="card-body card-thumbnail p-0">
                                                                                <div class="position-relative iq-video-hover user-images position-relative overflow-hidden">
                                                                                    <a data-fslightbox="html5-video" href="/assets/images/plugins/video-2.mp4">
                                                                                        <img src="/assets/images/page-img/56.jpg" class="img-fluid rounded" alt="file-manager" loading="lazy" />
                                                                                    </a>
                                                                                    <div class="image-hover-data">
                                                                                        <div class="product-elements-icon">
                                                                                            <ul class="d-flex align-items-center m-0 p-0 list-inline">
                                                                                                <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 60 <i class="material-symbols-outlined md-14 ms-1">
                                                                                                    thumb_up
                                                                                                </i> </a>
                                                                                                </li>
                                                                                                <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 30 <span class="material-symbols-outlined  md-14 ms-1">
                                                                                                    chat_bubble_outline
                                                                                                </span> </a>
                                                                                                </li>
                                                                                                <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 10 <span class="material-symbols-outlined md-14 ms-1">
                                                                                                    forward
                                                                                                </span></a>
                                                                                                </li>
                                                                                            </ul>
                                                                                        </div>
                                                                                    </div>
                                                                                    <a href="#" class="image-edit-btn material-symbols-outlined md-16" data-bs-toggle="tooltip" data-bs-placement="top" title="" data-bs-original-title="Edit or Remove">
                                                                                        drive_file_rename_outline
                                                                                    </a>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="tab-pane fade" id="pills-contact3-fill" role="tabpanel" aria-labelledby="pills-contact3-tab-fill">
                                                                <div class="row">
                                                                    <div class="col-lg-4 col-md-6">
                                                                        <div class="user-images position-relative overflow-hidden mb-3">
                                                                            <a data-fslightbox="gallery" href="/assets/images/page-img/pdf.png">
                                                                                <img src="/assets/images/page-img/pdf.png" class="img-fluid rounded" alt="photo-profile" loading="lazy" />
                                                                            </a>
                                                                            <div class="image-hover-data">
                                                                                <div class="product-elements-icon">
                                                                                    <ul class="d-flex align-items-center m-0 p-0 list-inline">
                                                                                        <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 60 <i class="material-symbols-outlined md-14 ms-1">
                                                                                            thumb_up
                                                                                        </i> </a>
                                                                                        </li>
                                                                                        <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 30 <span class="material-symbols-outlined  md-14 ms-1">
                                                                                            chat_bubble_outline
                                                                                        </span> </a>
                                                                                        </li>
                                                                                        <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 10 <span class="material-symbols-outlined md-14 ms-1">
                                                                                            forward
                                                                                        </span></a>
                                                                                        </li>
                                                                                    </ul>
                                                                                </div>
                                                                            </div>
                                                                            <a href="#" class="image-edit-btn material-symbols-outlined md-16" data-bs-toggle="tooltip" data-bs-placement="top" title="" data-bs-original-title="Edit or Remove">
                                                                                drive_file_rename_outline
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                    <div class="col-lg-4 col-md-6">
                                                                        <div class="user-images position-relative overflow-hidden mb-3">
                                                                            <a data-fslightbox="gallery" href="/assets/images/page-img/pdf.png">
                                                                                <img src="/assets/images/page-img/pdf.png" class="img-fluid rounded" alt="photo-profile" loading="lazy" />
                                                                            </a>
                                                                            <div class="image-hover-data">
                                                                                <div class="product-elements-icon">
                                                                                    <ul class="d-flex align-items-center m-0 p-0 list-inline">
                                                                                        <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 60 <i class="material-symbols-outlined md-14 ms-1">
                                                                                            thumb_up
                                                                                        </i> </a>
                                                                                        </li>
                                                                                        <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 30 <span class="material-symbols-outlined  md-14 ms-1">
                                                                                            chat_bubble_outline
                                                                                        </span> </a>
                                                                                        </li>
                                                                                        <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 10 <span class="material-symbols-outlined md-14 ms-1">
                                                                                            forward
                                                                                        </span></a>
                                                                                        </li>
                                                                                    </ul>
                                                                                </div>
                                                                            </div>
                                                                            <a href="#" class="image-edit-btn material-symbols-outlined md-16" data-bs-toggle="tooltip" data-bs-placement="top" title="" data-bs-original-title="Edit or Remove">
                                                                                drive_file_rename_outline
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                    <div class="col-lg-4 col-md-6">
                                                                        <div class="user-images position-relative overflow-hidden mb-3">
                                                                            <a data-fslightbox="gallery" href="/assets/images/page-img/pdf.png">
                                                                                <img src="/assets/images/page-img/pdf.png" class="img-fluid rounded" alt="photo-profile" loading="lazy" />
                                                                            </a>
                                                                            <div class="image-hover-data">
                                                                                <div class="product-elements-icon">
                                                                                    <ul class="d-flex align-items-center m-0 p-0 list-inline">
                                                                                        <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 60 <i class="material-symbols-outlined md-14 ms-1">
                                                                                            thumb_up
                                                                                        </i> </a>
                                                                                        </li>
                                                                                        <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 30 <span class="material-symbols-outlined  md-14 ms-1">
                                                                                            chat_bubble_outline
                                                                                        </span> </a>
                                                                                        </li>
                                                                                        <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 10 <span class="material-symbols-outlined md-14 ms-1">
                                                                                            forward
                                                                                        </span></a>
                                                                                        </li>
                                                                                    </ul>
                                                                                </div>
                                                                            </div>
                                                                            <a href="#" class="image-edit-btn material-symbols-outlined md-16" data-bs-toggle="tooltip" data-bs-placement="top" title="" data-bs-original-title="Edit or Remove">
                                                                                drive_file_rename_outline
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                    <div class="col-lg-4 col-md-6">
                                                                        <div class="user-images position-relative overflow-hidden mb-3">
                                                                            <a data-fslightbox="gallery" href="/assets/images/page-img/pdf.png">
                                                                                <img src="/assets/images/page-img/pdf.png" class="img-fluid rounded" alt="photo-profile" loading="lazy" />
                                                                            </a>
                                                                            <div class="image-hover-data">
                                                                                <div class="product-elements-icon">
                                                                                    <ul class="d-flex align-items-center m-0 p-0 list-inline">
                                                                                        <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 60 <i class="material-symbols-outlined md-14 ms-1">
                                                                                            thumb_up
                                                                                        </i> </a>
                                                                                        </li>
                                                                                        <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 30 <span class="material-symbols-outlined  md-14 ms-1">
                                                                                            chat_bubble_outline
                                                                                        </span> </a>
                                                                                        </li>
                                                                                        <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 10 <span class="material-symbols-outlined md-14 ms-1">
                                                                                            forward
                                                                                        </span></a>
                                                                                        </li>
                                                                                    </ul>
                                                                                </div>
                                                                            </div>
                                                                            <a href="#" class="image-edit-btn material-symbols-outlined md-16" data-bs-toggle="tooltip" data-bs-placement="top" title="" data-bs-original-title="Edit or Remove">
                                                                                drive_file_rename_outline
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                    <div class="col-lg-4 col-md-6">
                                                                        <div class="user-images position-relative overflow-hidden mb-3">
                                                                            <a data-fslightbox="gallery" href="/assets/images/page-img/pdf.png">
                                                                                <img src="/assets/images/page-img/pdf.png" class="img-fluid rounded" alt="photo-profile" loading="lazy" />
                                                                            </a>
                                                                            <div class="image-hover-data">
                                                                                <div class="product-elements-icon">
                                                                                    <ul class="d-flex align-items-center m-0 p-0 list-inline">
                                                                                        <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 60 <i class="material-symbols-outlined md-14 ms-1">
                                                                                            thumb_up
                                                                                        </i> </a>
                                                                                        </li>
                                                                                        <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 30 <span class="material-symbols-outlined  md-14 ms-1">
                                                                                            chat_bubble_outline
                                                                                        </span> </a>
                                                                                        </li>
                                                                                        <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 10 <span class="material-symbols-outlined md-14 ms-1">
                                                                                            forward
                                                                                        </span></a>
                                                                                        </li>
                                                                                    </ul>
                                                                                </div>
                                                                            </div>
                                                                            <a href="#" class="image-edit-btn material-symbols-outlined md-16" data-bs-toggle="tooltip" data-bs-placement="top" title="" data-bs-original-title="Edit or Remove">
                                                                                drive_file_rename_outline
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                    <div class="col-lg-4 col-md-6">
                                                                        <div class="user-images position-relative overflow-hidden mb-3">
                                                                            <a data-fslightbox="gallery" href="/assets/images/page-img/pdf.png">
                                                                                <img src="/assets/images/page-img/pdf.png" class="img-fluid rounded" alt="photo-profile" loading="lazy" />
                                                                            </a>
                                                                            <div class="image-hover-data">
                                                                                <div class="product-elements-icon">
                                                                                    <ul class="d-flex align-items-center m-0 p-0 list-inline">
                                                                                        <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 60 <i class="material-symbols-outlined md-14 ms-1">
                                                                                            thumb_up
                                                                                        </i> </a>
                                                                                        </li>
                                                                                        <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 30 <span class="material-symbols-outlined  md-14 ms-1">
                                                                                            chat_bubble_outline
                                                                                        </span> </a>
                                                                                        </li>
                                                                                        <li><a href="#" class="pe-3 text-white d-flex align-items-center"> 10 <span class="material-symbols-outlined md-14 ms-1">
                                                                                            forward
                                                                                        </span></a>
                                                                                        </li>
                                                                                    </ul>
                                                                                </div>
                                                                            </div>
                                                                            <a href="#" class="image-edit-btn material-symbols-outlined md-16" data-bs-toggle="tooltip" data-bs-placement="top" title="" data-bs-original-title="Edit or Remove">
                                                                                drive_file_rename_outline
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="modal-footer">
                                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                            <button type="button" class="btn btn-primary">Save changes</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li> */}
                        {/* <li class="nav-item dropdown">

                            <button type="button" class="btn btn-primary mt-3" data-bs-toggle="modal" data-bs-target="#staticBackdrop">
                                <i class="fa fa-pencil" aria-hidden="true"></i>
                                Compose
                            </button>

                            <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                                <div class="modal-dialog modal-dialog-centered modal-md">
                                    <div class="modal-content">
                                        <div class="modal-header">
                                            <h5 class="modal-title" id="staticBackdropLabel">
                                                Create Post
                                            </h5>
                                            <h5 class="modal-title mx-auto" id="staticBackdropLabel">
                                                <a href=""> <i class="fa fa-calendar-check-o" aria-hidden="true" ></i> Select date</a>
                                            </h5>
                                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                        </div>
                                        <div class="modal-body">
                                            <div>
                                                <div class="d-flex align-items-center">
                                                    <div class="user-img ">
                                                        <img src="/assets/images/user/1.jpg" alt="userimg" class="rounded-circle img-fluid" loading="lazy" width="40" />
                                                    </div>
                                                    <p class="px-2 mt-3   fw-bold">Vitel gloabal</p>
                                                </div>
                                                <form class="post-text ms-5" action="javascript:void();">
                                                    <input type="text" class="form-control rounded" placeholder="Write something here..." style={{ border: "none" }} />
                                                </form>
                                            </div>
                                        </div>
                                        <div class="modal-footer justify-content-between">
                                            <div class="  d-flex align-items-center">
                                                <a href="javascript:void(0);" class="me-2 link">
                                                    <button class="btn btn-soft-primary"> <i class="fa fa-picture-o fs-5" aria-hidden="true"></i></button>
                                                </a>
                                                <a href="javascript:void(0);" class="me-2">
                                                    <button class="btn btn-soft-primary"><i class="fa fa-file-video-o fs-5" aria-hidden="true"></i></button>
                                                </a>
                                                <a href="javascript:void(0);" class="me-2 ">
                                                    <button class="  btn btn-soft-primary"> <i class="fa fa-map-marker fs-5" aria-hidden="true"></i></button>
                                                </a>
                                                <a href="javascript:void(0);" class="me-2 ">
                                                    <button class="  btn btn-soft-primary"><i class="fa fa-meh-o fs-5" aria-hidden="true"></i></button>
                                                </a>
                                                <a href="javascript:void(0);" class="me-2 ">
                                                    <button class="  btn btn-soft-primary">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-filetype-gif" viewBox="0 0 16 16">
                                                            <path fill-rule="evenodd" d="M14 4.5V14a2 2 0 0 1-2 2H9v-1h3a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5zM3.278 13.124a1.4 1.4 0 0 0-.14-.492 1.3 1.3 0 0 0-.314-.407 1.5 1.5 0 0 0-.48-.275 1.9 1.9 0 0 0-.636-.1q-.542 0-.926.229a1.5 1.5 0 0 0-.583.632 2.1 2.1 0 0 0-.199.95v.506q0 .408.105.745.105.336.32.58.213.243.533.377.323.132.753.132.402 0 .697-.111a1.29 1.29 0 0 0 .788-.77q.097-.261.097-.551v-.797H1.717v.589h.823v.255q0 .199-.09.363a.67.67 0 0 1-.273.264 1 1 0 0 1-.457.096.87.87 0 0 1-.519-.146.9.9 0 0 1-.305-.413 1.8 1.8 0 0 1-.096-.615v-.499q0-.547.234-.85.237-.3.665-.301a1 1 0 0 1 .3.044q.136.044.236.126a.7.7 0 0 1 .17.19.8.8 0 0 1 .097.25zm1.353 2.801v-3.999H3.84v4h.79Zm1.493-1.59v1.59h-.791v-3.999H7.88v.653H6.124v1.117h1.605v.638z" />
                                                        </svg>
                                                    </button>
                                                </a>
                                            </div>
                                            <button type="button" class="btn btn-primary px-3">Post</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li class="nav-item dropdown">
                            <a href="javascript:void(0);" class="search-toggle dropdown-toggle d-flex align-items-center"
                                id="notification-drop" data-bs-toggle="dropdown">
                                <i class="material-symbols-outlined">notifications</i>
                            </a>
                            <div class="sub-drop dropdown-menu" aria-labelledby="notification-drop">
                                <div class="card shadow-none m-0">
                                    <div class="card-header d-flex justify-content-between bg-primary">
                                        <div class="header-title bg-primary">
                                            <h5 class="mb-0 text-white">All Notifications</h5>
                                        </div>
                                        <small class="badge  bg-light text-dark">4</small>
                                    </div>
                                    <div class="card-body p-0">
                                        <a href="javascript:void(0);" class="iq-sub-card">
                                            <div class="d-flex align-items-center">
                                                <div class="">
                                                    <img class="avatar-40 rounded" src="/assets/images/user/01.jpg" alt="" />
                                                </div>
                                                <div class="ms-3 w-100">
                                                    <h6 class="mb-0 ">Emma Watson Bni</h6>
                                                    <div class="d-flex justify-content-between align-items-center">
                                                        <p class="mb-0">95 MB</p>
                                                        <small class="float-right font-size-12">Just Now</small>
                                                    </div>
                                                </div>
                                            </div>
                                        </a>
                                        <a href="javascript:void(0);" class="iq-sub-card">
                                            <div class="d-flex align-items-center">
                                                <div class="">
                                                    <img class="avatar-40 rounded" src="/assets/images/user/02.jpg" alt=""
                                                        loading="lazy" />
                                                </div>
                                                <div class="ms-3 w-100">
                                                    <h6 class="mb-0 ">New customer is join</h6>
                                                    <div class="d-flex justify-content-between align-items-center">
                                                        <p class="mb-0">Cyst Bni</p>
                                                        <small class="float-right font-size-12">5 days ago</small>
                                                    </div>
                                                </div>
                                            </div>
                                        </a>
                                        <a href="javascript:void(0);" class="iq-sub-card">
                                            <div class="d-flex align-items-center">
                                                <div class="">
                                                    <img class="avatar-40 rounded" src="/assets/images/user/03.jpg" alt=""
                                                        loading="lazy" />
                                                </div>
                                                <div class="ms-3 w-100">
                                                    <h6 class="mb-0 ">Two customer is left</h6>
                                                    <div class="d-flex justify-content-between align-items-center">
                                                        <p class="mb-0">Cyst Bni</p>
                                                        <small class="float-right font-size-12">2 days ago</small>
                                                    </div>
                                                </div>
                                            </div>
                                        </a>
                                        <a href="javascript:void(0);" class="iq-sub-card">
                                            <div class="d-flex align-items-center">
                                                <div class="">
                                                    <img class="avatar-40 rounded" src="/assets/images/user/04.jpg" alt=""
                                                        loading="lazy" />
                                                </div>
                                                <div class="w-100 ms-3">
                                                    <h6 class="mb-0 ">New Mail from Fenny</h6>
                                                    <div class="d-flex justify-content-between align-items-center">
                                                        <p class="mb-0">Cyst Bni</p>
                                                        <small class="float-right font-size-12">3 days ago</small>
                                                    </div>
                                                </div>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </li> */}
                        <li class="nav-item ">
                            <a class="dropdown-toggle d-flex align-items-center">
                                <span class="ms-2 font-size-14">Credit Balance </span>
                                <span class="badge bg-success fs-8 fw-bold ms-2">
                                    {userData.credit_balance ? userData.credit_balance : 0}
                                </span>
                            </a>
                        </li>

                        <li class="nav-item ">
                            <a class="dropdown-toggle d-flex align-items-center">
                                <span class="ms-2 font-size-14">Wallet Balance </span>
                                <span class="badge bg-success fs-8 fw-bold ms-2">
                                    ${userData.wallet_amount}
                                </span>
                            </a>
                        </li>

                        <li class="nav-item d-none d-lg-none">
                            <a
                                href="https://templates.iqonic.design/socialv/bs5/html/dist/app/chat.php"
                                class="dropdown-toggle d-flex align-items-center"
                                id="mail-drop-1"
                                data-bs-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="false"
                            >
                                <i class="material-symbols-outlined">mail</i>
                                <span class="mobile-text  ms-3">Message</span>
                            </a>
                        </li>
                        {/* <li class="nav-item dropdown user-dropdown">
                            <a
                                href="javascript:void(0);"
                                class="d-flex align-items-center dropdown-toggle"
                                id="drop-down-arrow"
                                data-bs-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="false"
                            >
                                <img
                                    src="/assets/images/icon-7797704_1280.png"
                                    class=" rounded-circle me-3"
                                    alt="user"
                                    loading="lazy"
                                />
                            </a>
                            <div
                                class="sub-drop dropdown-menu caption-menu"
                                aria-labelledby="drop-down-arrow"
                            >
                                <div class="card shadow-none m-0">
                                    <div class="card-header ">
                                        <div class="header-title">
                                            <h5 class="mb-0 ">
                                                Hello {userData.first_name ? userData.first_name : 0}{" "}
                                                {userData.last_name ? userData.last_name : 0}
                                            </h5>
                                        </div>
                                    </div>
                                    <div class="card-body p-0 ">
                                       
                                        <div class="d-flex align-items-center iq-sub-card border-0">
                                            <span class="material-symbols-outlined">lock</span>
                                            <div class="ms-3">
                                                <div class="mb-0 h6" onClick={handleAddShow}>
                                                    Change Password
                                                </div>
                                            </div>
                                        </div>
                                        <div class="d-flex align-items-center iq-sub-card border-0">
                                            <span class="material-symbols-outlined">
                                                workspaces
                                            </span>
                                            <div class="ms-2">
                                                <a href="/workspace" class="mb-0 h6">
                                                    Workspace
                                                </a>
                                            </div>
                                        </div>
                                        <div class="d-flex align-items-center iq-sub-card border-0">
                                            <span class="material-symbols-outlined">
                                                account_balance_wallet
                                            </span>
                                            <div class="ms-2">
                                                <a href="/payment" class="mb-0 h6">
                                                    Payment
                                                </a>
                                            </div>
                                        </div>
                                        <div class="d-flex align-items-center iq-sub-card border-0">
                                            <span class="material-symbols-outlined">
                                                contact_support
                                            </span>
                                            <div class="ms-2">
                                                <a href="/support-ticket" class="mb-0 h6">
                                                    Support
                                                </a>
                                            </div>
                                        </div>
                                        <div
                                            class="d-flex align-items-center iq-sub-card"
                                            onClick={logoutUser}
                                        >
                                            <span class="material-symbols-outlined">login</span>
                                            <div class="ms-3">
                                                <div class="mb-0 h6">Sign out</div>
                                            </div>
                                        </div>
                                        <div class=" iq-sub-card">
                                            <h6>Company Accounts</h6>
                                        </div>
                                        <div class="d-flex align-items-center iq-sub-card border-0">
                                            <span class="material-symbols-outlined">
                                                manage_accounts
                                            </span>
                                            <div class="ms-3">
                                                <Link to="/manage_users" class="mb-0 h6">
                                                    Add/Manage
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li> */}
                        <Profile handleAddShow={handleAddShow} addShow={addShow} />

                    </ul>
                </div>
            </nav>
        </div>
    );
}
