import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { MaxLengthValidation, MinLengthValidation, passwordPattern } from '../../utils/Constants';
import { getToken, triggerAlert } from '../../utils/CommonFunctions';
import { passwordReset } from '../../utils/ApiClient';

export default function ChangePassword() {
    const api_url = process.env.REACT_APP_API_BASE_URL;
    const token = getToken();
    const navigate = useNavigate();

    // State variables for password visibility
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { register, handleSubmit, formState: { errors }, watch, trigger } = useForm();
    const newPassword = watch('password');

    // Function to toggle password visibility for old password
    const toggleOldPassword = () => {
        setShowOldPassword(!showOldPassword);
    };

    // Function to toggle password visibility for new password
    const toggleNewPassword = () => {
        setShowNewPassword(!showNewPassword);
    };

    // Function to toggle password visibility for confirm password
    const toggleConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const changePassword = async (data) => {
        setIsLoading(true);
        try {
            const response = await passwordReset(data);
            if (response.status === 200) {
                setIsLoading(false);
                triggerAlert('success', 'Success', 'Password changed successfully!');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } catch (error) {
            setIsLoading(false);
            console.error(error);
            const response_data = error?.response?.data;
            triggerAlert('error', 'Oops', response_data.message || 'Unable to change the password.');
        }
    };

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <div className="d-flex justify-content-between flex-wrap">
                <a href="#" className="forget" onClick={openModal}>Change password</a>
                {isModalOpen && (
                    <div className="modal fade show" tabIndex="-1" role="dialog" style={{ display: 'block' }}>
                        <div className="modal-dialog modal-dialog-centered" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="exampleModalCenterTitle">Change Password</h5>
                                    <button type="button" className="btn-close" onClick={closeModal} aria-label="Close"></button>
                                </div>
                                <div className="modal-body">
                                    <form className="form-horizontal" onSubmit={handleSubmit(changePassword)}>
                                        <div className="mb-3">
                                            <label className="form-label" htmlFor="old_password">Old Password</label>
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
                                                        maxLength: MaxLengthValidation(15)
                                                    })}
                                                />
                                                <button className="btn btn-primary" type="button" id="button-addon2" onClick={toggleOldPassword}>
                                                    <i className={`fa fa ${showOldPassword ? 'fa-eye' : 'fa-eye-slash'} toggle-password field-icon `}></i>
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
                                            <div className='input-group'>
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
                                                        maxLength: MaxLengthValidation(15)
                                                    })}
                                                />
                                                <button className="btn btn-primary" type="button" id="button-addon2" onClick={toggleNewPassword}>
                                                    <i className={`fa fa ${showNewPassword ? 'fa-eye' : 'fa-eye-slash'} toggle-password field-icon `}></i>
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
                                            <div className='input-group'>
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
                                                        validate: (value) => value === newPassword || "Passwords do not match"
                                                    })}
                                                />
                                                <button className="btn btn-primary" type="button" id="button-addon2" onClick={toggleConfirmPassword}>
                                                    <i className={`fa fa ${showConfirmPassword ? 'fa-eye' : 'fa-eye-slash'} toggle-password field-icon `}></i>
                                                </button>
                                            </div>
                                            {errors.confirm_password && (
                                                <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                                                    {errors.confirm_password.message}
                                                </div>
                                            )}
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-warning" onClick={closeModal}>Cancel</button>
                                            <button type="submit" className="btn btn-primary">Submit</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}