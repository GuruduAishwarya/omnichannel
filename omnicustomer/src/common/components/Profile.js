import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import {
    MaxLengthValidation,
    MinLengthValidation,
    passwordPattern,
} from "../../utils/Constants";
import { Link, useNavigate } from 'react-router-dom';
import { getToken, logout, triggerAlert, getCompanyName, getCookie } from '../../utils/CommonFunctions';
import { fetchUserDetailsData, passwordReset, fetchUserDetailsDatas } from '../../utils/ApiClient';
import Modal from "react-bootstrap/Modal";

export default function Profile() {
    const [userData, setUserData] = useState([]);
    const [userDetails, setUserDetails] = useState({ first_name: '', last_name: '', role: '' });
    const navigate = useNavigate();
    const [addShow, setAddShow] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue,
    } = useForm();

    const newPassword = watch("password");
    const company_name = getCompanyName();
    const workspace_id_from_cookie = getCookie('selected_workspace_id');
    const [workspaceId, setWorkspaceId] = useState(workspace_id_from_cookie || "");

    const fetchCustomerDetails = async () => {
        try {
            const response = await fetchUserDetailsDatas();
            const response_data = response.data;
            if (response_data.error_code === 200 && response_data.results) {
                const { first_name, last_name, role } = response_data.results;
                setUserDetails({ first_name, last_name, role });
            }
        } catch (error) {
            console.error("Error fetching user details:", error);
        }
    };

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
    const changePassword = async (data) => {
        setIsLoading(true);
        try {
            const response = await passwordReset(data);
            if (response.status === 200) {
                setAddShow(false);
                setIsLoading(false);
                formReset();
                triggerAlert("success", "Success", "Password changed successfully!");
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            }
        } catch (error) {
            setAddShow(false); // Close the modal first
            setIsLoading(false);
            const response_data = error?.response?.data;
            triggerAlert(
                "error",
                "Oops",
                response_data.message || "Unable to change the password."
            );
        }
    };
    const formReset = () => {
        reset();
        setValue("old_password", null);
        setValue("password", null);
        setValue("confirm_password", null);
    };


    useEffect(() => {
        fetchCustomerDetails();
    }, []);

    // Your existing functions and logic here

    return (
        <div>
            <li className="nav-item dropdown user-dropdown">
                <a href="javascript:void(0);" className="d-flex align-items-center dropdown-toggle" id="drop-down-arrow"
                    data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <img src="/assets/images/icon-7797704_1280.png" className="rounded-circle me-3" alt="user" loading="lazy" />
                </a>
                <div className="sub-drop dropdown-menu caption-menu" aria-labelledby="drop-down-arrow">
                    <div className="card shadow-none m-0">
                        <div className="card-header">
                            <div className="header-title">
                                <h5 className="mb-0">{userDetails.first_name || ''} {userDetails.last_name || ''}</h5>
                                <small className="text-muted">{company_name || '-'}</small>
                            </div>
                        </div>
                        <div className="card-body p-0">
                            <Link to="/profilepage" className="d-flex align-items-center iq-sub-card border-0 text-decoration-none">
                                <span class="material-symbols-outlined">
                                    3p
                                </span>
                                <div className="ms-2">
                                    <span className="mb-0 h6">Profile</span>
                                </div>
                            </Link>

                            <div className="d-flex align-items-center iq-sub-card border-0" onClick={() => setAddShow(true)}>
                                <span className="material-symbols-outlined">lock</span>
                                <div className="ms-2">
                                    <div className="mb-0 h6">Change Password</div>
                                </div>
                            </div>
                            <Link to="/workspace" className="d-flex align-items-center iq-sub-card border-0 text-decoration-none">
                                <span className="material-symbols-outlined">workspaces</span>
                                <div className="ms-2">
                                    <span className="mb-0 h6">Workspace</span>
                                </div>
                            </Link>
                            <Link to="/payment" className="d-flex align-items-center iq-sub-card border-0 text-decoration-none">
                                <span className="material-symbols-outlined">account_balance_wallet</span>
                                <div className="ms-2">
                                    <p className="mb-0 h6">Payment</p>
                                </div>
                            </Link>
                            <Link to="/support-ticket" className="d-flex align-items-center iq-sub-card border-0 text-decoration-none">
                                <span className="material-symbols-outlined">contact_support</span>
                                <div className="ms-2">
                                    <p className="mb-0 h6">Support</p>
                                </div>
                            </Link>

                            <Link to="/api_documentation" className="d-flex align-items-center iq-sub-card border-0 text-decoration-none">
                                <span class="material-symbols-outlined">
                                    apk_document
                                </span>
                                <div className="ms-2">
                                    <p className="mb-0 h6">Api Documentation</p>
                                </div>
                            </Link>

                            <Link to="/2FA" className="d-flex align-items-center iq-sub-card border-0 text-decoration-none">
                                <span class="material-symbols-outlined">
                                    apk_document
                                </span>
                                <div className="ms-2">
                                    <p className="mb-0 h6">2FA Setting</p>
                                </div>
                            </Link>
                            <div className="d-flex align-items-center iq-sub-card" onClick={logoutUser}>
                                <span className="material-symbols-outlined">login</span>
                                <div className="ms-2">
                                    <div className="mb-0 h6">Sign out</div>
                                </div>
                            </div>
                            <div className="iq-sub-card">
                                <h6>Company Accounts</h6>
                            </div>
                            <Link to="/manage_users" className="d-flex align-items-center iq-sub-card border-0 text-decoration-none">
                                <span className="material-symbols-outlined">manage_accounts</span>
                                <div className="ms-2">
                                    <span className="mb-0 h6">Add/Manage</span>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </li>
            <Modal show={addShow} onHide={() => setAddShow(false)} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>Change Password</Modal.Title>
                </Modal.Header>
                <form
                    id="creditCardForm"
                    className="g-3 fv-plugins-bootstrap5 fv-plugins-framework fv-plugins-icon-container"
                    onSubmit={handleSubmit(changePassword)}
                >
                    <Modal.Body>
                        <div className="row">
                            <div className="mb-3">
                                <label className="form-label" htmlFor="old_password">Old Password</label>
                                <div className="input-group">
                                    <input
                                        type={showOldPassword ? "text" : "password"}
                                        className="form-control"
                                        id="old_password"
                                        placeholder="Enter Current Password"
                                        {...register("old_password", {
                                            required: "Current Password is required",
                                            pattern: passwordPattern,
                                            minLength: MinLengthValidation(6),
                                            maxLength: MaxLengthValidation(15),
                                        })}
                                        autoComplete='new-password'
                                    />
                                    <button
                                        className="btn btn-primary"
                                        type="button"
                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                    >
                                        <i className={`fa fa ${showOldPassword ? "fa-eye" : "fa-eye-slash"}`}></i>
                                    </button>
                                </div>
                                {errors.old_password && (
                                    <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                                        {errors.old_password.message}
                                    </div>
                                )}
                            </div>
                            <div className="mb-3">
                                <label className="form-label" htmlFor="password">New Password</label>
                                <div className="input-group">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        className="form-control"
                                        id="password"
                                        placeholder="Enter New Password"
                                        {...register("password", {
                                            required: "New Password is required",
                                            pattern: passwordPattern,
                                            minLength: MinLengthValidation(6),
                                            maxLength: MaxLengthValidation(15),
                                        })}
                                        autoComplete='new-password'
                                    />
                                    <button
                                        className="btn btn-primary"
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        <i className={`fa fa ${showNewPassword ? "fa-eye" : "fa-eye-slash"}`}></i>
                                    </button>
                                </div>
                                {errors.password && (
                                    <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                                        {errors.password.message}
                                    </div>
                                )}
                            </div>
                            <div className="mb-3">
                                <label className="form-label" htmlFor="confirm_password">Confirm Password</label>
                                <div className="input-group">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        className="form-control"
                                        id="confirm_password"
                                        placeholder="Enter Confirm Password"
                                        {...register("confirm_password", {
                                            required: "Confirm Password is required",
                                            pattern: passwordPattern,
                                            minLength: MinLengthValidation(6),
                                            maxLength: MaxLengthValidation(15),
                                            validate: (value) => value === newPassword || "Passwords do not match",
                                        })}
                                        autoComplete='new-password'
                                    />
                                    <button
                                        className="btn btn-primary"
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        <i className={`fa fa ${showConfirmPassword ? "fa-eye" : "fa-eye-slash"}`}></i>
                                    </button>
                                </div>
                                {errors.confirm_password && (
                                    <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                                        {errors.confirm_password.message}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button type="button" className="btn btn-warning" onClick={() => setAddShow(false)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {isLoading ? 'Submitting..' : 'Submit'}
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>
        </div>
    );
}
