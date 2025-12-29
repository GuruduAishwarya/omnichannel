import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import {
    MaxLengthValidation,
    MinLengthValidation,
    passwordPattern,
} from "../../utils/Constants";
import { Link, useNavigate } from 'react-router-dom';
import { getToken, logout, triggerAlert } from '../../utils/CommonFunctions';
import { fetchUserDetailsData, passwordReset } from '../../utils/ApiClient';
import Modal from "react-bootstrap/Modal";

export default function HeaderSidebar() {
    const [userData, setUserData] = useState([]);
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

    const fetchUserDetails = async () => {
        try {
            const response = await fetchUserDetailsData();
            const response_data = response.data;
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

    const handleAddClose = () => {
        setAddShow(false);
        formReset();
    };

    const formReset = () => {
        reset();
        setValue("old_password", null);
        setValue("password", null);
        setValue("confirm_password", null);
    };

    const handleAddShow = () => setAddShow(true);

    // const changePassword = async (data) => {
    //     setIsLoading(true);
    //     try {
    //         const response = await passwordReset(data);
    //         if (response.status === 200) {
    //             setAddShow(false);
    //             setIsLoading(false);
    //             formReset();
    //             triggerAlert("success", "Success", "Password changed successfully!");
    //             setTimeout(() => {
    //                 navigate("/login");
    //             }, 2000);
    //         }
    //     } catch (error) {
    //         setAddShow(false); // Close the modal first
    //         setIsLoading(false);
    //         const response_data = error?.response?.data;
    //         triggerAlert(
    //             "error",
    //             "Oops",
    //             response_data.message || "Unable to change the password."
    //         );
    //     }
    // };

    const toggleOldPassword = () => {
        setShowOldPassword(!showOldPassword);
    };

    const toggleNewPassword = () => {
        setShowNewPassword(!showNewPassword);
    };

    const toggleConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <div>
            <li className="nav-item dropdown user-dropdown">
                <a href="javascript:void(0);" className="d-flex align-items-center dropdown-toggle" id="drop-down-arrow"
                    data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <img src="/assets/images/icon-7797704_1280.png" className="rounded-circle me-3" alt="user"
                        loading="lazy" />
                </a>
                <div className="sub-drop dropdown-menu caption-menu" aria-labelledby="drop-down-arrow">
                    <div className="card shadow-none m-0">
                        <div className="card-header">
                            <div className="header-title">
                                <h5 className="mb-0">Hello {userData.first_name ? userData.first_name : 0} {userData.last_name ? userData.last_name : 0}</h5>
                            </div>
                        </div>
                        <div className="card-body p-0">
                            <div class="d-flex align-items-center iq-sub-card border-0 " onClick={handleAddShow}>
                                <span class="material-symbols-outlined">
                                    lock
                                </span>
                                <div class="ms-2">

                                    <div class="mb-0 h6" >
                                        Change Password
                                    </div>
                                </div>

                            </div>

                            <Link to="/workspace" className="d-flex align-items-center iq-sub-card border-0 text-decoration-none">
                                <span className="material-symbols-outlined">
                                    workspaces
                                </span>
                                <div className="ms-2">
                                    <span className="mb-0 h6">Workspace</span>
                                </div>
                            </Link>

                            <Link to="/payment" className="d-flex align-items-center iq-sub-card border-0 text-decoration-none">
                                <span className="material-symbols-outlined">
                                    account_balance_wallet
                                </span>
                                <div className="ms-2">
                                    <p className="mb-0 h6">Payment</p>
                                </div>
                            </Link>

                            <Link to="/support-ticket" className="d-flex align-items-center iq-sub-card border-0 text-decoration-none">
                                <span className="material-symbols-outlined">
                                    contact_support
                                </span>
                                <div className="ms-2">
                                    <p className="mb-0 h6">Support</p>
                                </div>
                            </Link>

                            <div className="d-flex align-items-center iq-sub-card" onClick={logoutUser}>
                                <span className="material-symbols-outlined">
                                    login
                                </span>
                                <div className="ms-2">
                                    <div className="mb-0 h6">
                                        Sign out
                                    </div>
                                </div>
                            </div>
                            <div className="iq-sub-card">
                                <h6>Company Accounts</h6>
                            </div>
                            <Link to="/manage_users" className="d-flex align-items-center iq-sub-card border-0 text-decoration-none">
                                <span className="material-symbols-outlined">
                                    manage_accounts
                                </span>
                                <div className="ms-2">
                                    <span className="mb-0 h6">
                                        Add/Manage
                                    </span>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </li>
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
                                        autoComplete='new-password'
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
                                        autoComplete='new-password'

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
                                        autoComplete='new-password'

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
                            onClick={handleAddClose}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Submit
                        </button>
                    </Modal.Footer>
                </form>
            </Modal> */}
        </div>
    );
}
