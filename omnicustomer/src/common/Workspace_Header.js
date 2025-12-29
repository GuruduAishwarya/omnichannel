import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { fetchUserDetailsData } from '../utils/ApiClient';
import { logout, triggerAlert, getCookie } from '../utils/CommonFunctions';
import Profile from './components/Profile';
import AppConfig from '../utils/Config';

export default function Workspace_Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeButton, setActiveButton] = useState('/payment'); // Default to the payments page
    const [activeButtonSupport, setActiveButtonSupport] = useState('/support-ticket'); // Default to support ticket page
    const [userData, setUserData] = useState([]);

    // Set the active button based on the current path
    useEffect(() => {
        const currentPath = location.pathname; // Get the current path
        // Check if the current path starts with '/payment' to keep it active
        setActiveButton(currentPath.startsWith('/payment') ? '/payment' : '');
        // Check if the current path starts with '/support-ticket' to keep it active
        setActiveButtonSupport(currentPath.startsWith('/support-ticket') ? '/support-ticket' : '');
    }, [location]);

    const workspace_id_from_cookie = getCookie('selected_workspace_id');
    const [workspaceId, setWorkspaceId] = useState(workspace_id_from_cookie || "");

    const fetchUserDetails = async () => {
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
                AppConfig.companyLogo = data?.company_logo;


            } else {
                setUserData([])
            }
        } catch (error) {
            const response_data = error?.response?.data
        }
    }

    useEffect(() => {
        fetchUserDetails();
    }, []);

    const logoutUser = () => {
        try {

            if (logout()) {
                navigate('/login');
            } else {
                triggerAlert('error', 'Oops...', 'Something went wrong..');
            }

        } catch (error) {
            triggerAlert('error', 'Oops...', 'Something went wrong..');
        }

    };
    return (
        <div>
            <div class="iq-top-navbar">
                <nav class="nav navbar navbar-expand-lg navbar-light iq-navbar p-lg-0">
                    <div class="container-fluid navbar-inner">
                        <div class="d-flex align-items-center  gap-3 pb-2 pb-lg-0">
                            <a href="index.php" class="d-flex align-items-center gap-2 iq-header-logo">
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
                            </a>
                        </div>
                        <ul class="navbar-nav navbar-list">

                            <li className="nav-item">
                                <Link
                                    to="/workspace"
                                    className="d-flex align-items-center"
                                >
                                    <button
                                        type="button"
                                        className={`btn ${activeButton === '/workspace' ? 'btn-warning' : 'btn-primary'}`} // Conditional class application
                                        onClick={() => setActiveButton('/workspace')} // Update active button on click
                                    >
                                        <i class="fa fa-home" aria-hidden="true"></i> Home
                                    </button>
                                </Link>
                            </li>
                            <li className="nav-item">
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
                            </li>
                            {/* <li class="nav-item dropdown user-dropdown">
                                <a href="javascript:void(0);" class="d-flex align-items-center dropdown-toggle" id="drop-down-arrow" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    <img src="assets/images/user/1.jpg" class="img-fluid rounded-circle me-3" alt="user" loading="lazy" />
                                </a>
                                <div class="sub-drop dropdown-menu caption-menu w-30" aria-labelledby="drop-down-arrow">
                                    <div class="card shadow-none m-0">
                                        <div class="card-header ">
                                            <div class="header-title">
                                                <h5 class="mb-0 ">Hello {userData.first_name ? userData.first_name : 0} {userData.last_name ? userData.last_name : 0}</h5>
                                            </div>
                                        </div>
                                        <div class="card-body p-0 ">

                                            <div class="d-flex align-items-center iq-sub-card" onClick={logoutUser}>
                                                <span class="material-symbols-outlined">
                                                    login
                                                </span>
                                                <div class="ms-3">
                                                    <a href="#/" class="mb-0 h6">
                                                        Sign out
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li> */}
                            <Profile />

                        </ul>
                    </div>
                </nav>
            </div>
        </div>
    )
}
