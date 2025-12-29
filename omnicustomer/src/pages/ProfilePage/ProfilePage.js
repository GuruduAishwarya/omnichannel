import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { fetchProfileData, fetchProfileUpdate } from "../../utils/ApiClient";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Loader from "../../common/components/Loader";
import Cookies from 'js-cookie';

export default function ProfilePage({ isSubUser = false }) {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState({
        profile: false,
        company: false,
        address: false,
    });
    const [editModes, setEditModes] = useState({
        profile: false,
        company: false,
        address: false,
    });
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        companyName: "",
        user_name: "",
        user_profile: "",
    });
    const navigate = useNavigate();
    const user_type = Cookies.get('user_type');

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            password: "",
            twoFactor: false,
            companyName: "",
            website: "",
            ceoContact: "",
            ceoName: "",
            ceoEmail: "",
            address: "",
            country: "",
            state: "",
            city: "",
            zip: "",
        },
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetchProfileData();
                const respData = response.data.results;
                reset({
                    firstName: respData.first_name || "",
                    lastName: respData.last_name || "",
                    email: respData.email || "",
                    phone: respData.phone || "",
                    password: respData.watch_word || "",
                    twoFactor: !!respData.two_fa_enable,
                    companyName: respData.company_name || "",
                    website: respData.website || "",
                    ceoContact: respData.ceo_phone || "",
                    ceoName: respData.ceo || "",
                    ceoEmail: respData.ceo_mail || "",
                    address: respData.address || "",
                    country: respData.country || "",
                    state: respData.state || "",
                    city: respData.city || "",
                    zip: respData.zipcode || "",
                });
                setFormData({
                    firstName: respData.first_name || "",
                    lastName: respData.last_name || "",
                    companyName: respData.company_name || "",
                    user_name: respData.user_name || "",
                    user_profile: respData.user_profile || "",
                });
            } catch (error) {
                console.error("Error fetching profile data:", error);
            }
        };
        fetchData();
    }, [reset]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData((prev) => ({
                    ...prev,
                    user_profile: reader.result.split(",")[1],
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleEdit = (section) => {
        setEditModes((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const onSubmit = async (data, section) => {
        setLoading((prev) => ({ ...prev, [section]: true }));
        try {
            let api_input = {};
            if (section === "company") {
                api_input = {
                    company_name: data.companyName,
                    website: data.website,
                    ceo_phone: data.ceoContact,
                    ceo: data.ceoName,
                    ceo_mail: data.ceoEmail,
                };
            } else if (section === "address") {
                api_input = {
                    address: data.address,
                    country: data.country,
                    state: data.state,
                    city: data.city,
                    zipcode: data.zip,
                };
            } else if (section === "profile") {
                api_input = {
                    first_name: data.firstName,
                    last_name: data.lastName,
                    two_fa_enable: data.twoFactor ? 1 : 0,
                    phone: data.phone,
                    password: data.password,
                    user_profile: formData.user_profile || "",
                };
            }
            const response = await fetchProfileUpdate(api_input);
            if (response.error_code === 200) {
                const updatedResponse = await fetchProfileData();
                const updatedData = updatedResponse.data.results;
                setFormData({
                    firstName: updatedData.first_name || "",
                    lastName: updatedData.last_name || "",
                    companyName: updatedData.company_name || "",
                    user_name: updatedData.user_name || "",
                    user_profile: updatedData.user_profile || "",
                });
                navigate("/profilepage");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
        } finally {
            setLoading((prev) => ({ ...prev, [section]: false }));
            setEditModes((prev) => ({ ...prev, [section]: false }));
        }
    };

    return (
        <div>
            <div id="content-page" className="content-page">
                <div className="container">
                    <div className="row mt-3">
                        <div className="mb-3">
                            <h4 className="fw-bold text-primary">Profile</h4>
                        </div>
                    </div>

                    {/* Profile Section */}
                    <div className="row mb-3">
                        <div className="col-sm-12">
                            <div className="card">
                                <div className="card-header d-flex justify-content-between border-0 pb-0">
                                    <div className="header-title">
                                        <h4 class="fw-500 text-primary">Profile Information</h4>
                                    </div>
                                    {!editModes.profile && (
                                        <button
                                            onClick={() => toggleEdit("profile")}
                                            className="btn btn-icon btn-soft-warning btn-sm"
                                        >
                                            <i className="material-symbols-outlined">edit</i>
                                        </button>
                                    )}
                                </div>
                                <div className="card-body">
                                    {loading.profile ? (
                                        <Loader />
                                    ) : (
                                        <div className="row">
                                            <div className="col-md-2">
                                                <div className="text-center">
                                                    <img
                                                        className="img-fluid rounded avatar-200"
                                                        src={
                                                            formData.user_profile
                                                                ? formData.user_profile.startsWith("http")
                                                                    ? formData.user_profile
                                                                    : `data:image/jpeg;base64,${formData.user_profile}`
                                                                : "assets/images/icon-7797704_1280.png"
                                                        }
                                                        alt="profile-img"
                                                        onError={(e) => {
                                                            e.currentTarget.src = "assets/images/icon-7797704_1280.png";
                                                        }}
                                                    />
                                                    {editModes.profile && (
                                                        <div className="mt-2">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                className="form-control form-control-sm"
                                                                onChange={handleImageChange}
                                                            />
                                                        </div>
                                                    )}
                                                    <h4 className="mt-2 mb-0 text-warning">
                                                        {formData.firstName} {formData.lastName}
                                                    </h4>
                                                    <p className="text-muted mb-0">{formData.companyName}</p>
                                                </div>
                                            </div>
                                            <div className="col-md-10">
                                                <form
                                                    onSubmit={handleSubmit((data) => onSubmit(data, "profile"))}
                                                    className="row align-items-center g-3"
                                                >
                                                    <div className="col-md-4">
                                                        <label className="form-label mb-2">First Name *</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            {...register("firstName", {
                                                                required: "First name is required",
                                                                minLength: { value: 2, message: "Min 2 chars" },
                                                                maxLength: { value: 30, message: "Max 30 chars" },
                                                            })}
                                                            disabled={!editModes.profile}
                                                        />
                                                        {errors.firstName && (
                                                            <p className="text-danger small">{errors.firstName.message}</p>
                                                        )}
                                                    </div>
                                                    <div className="col-md-4">
                                                        <label className="form-label mb-2">Last Name *</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            {...register("lastName", {
                                                                required: "Last name is required",
                                                            })}
                                                            disabled={!editModes.profile}
                                                        />
                                                        {errors.lastName && (
                                                            <p className="text-danger small">{errors.lastName.message}</p>
                                                        )}
                                                    </div>
                                                    <div className="col-md-4">
                                                        <label className="form-label mb-2">Email *</label>
                                                        <input
                                                            type="email"
                                                            className="form-control"
                                                            {...register("email", {
                                                                required: "Email is required",
                                                                pattern: {
                                                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                                    message: "Invalid email",
                                                                },
                                                            })}
                                                            disabled
                                                        />
                                                        {errors.email && (
                                                            <p className="text-danger small">{errors.email.message}</p>
                                                        )}
                                                    </div>
                                                    <div className="col-md-4">
                                                        <label className="form-label mb-2">Phone *</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            {...register("phone", {
                                                                required: "Phone number required",
                                                                pattern: {
                                                                    value: /^[0-9]{10}$/,
                                                                    message: "Must be 10 digits",
                                                                },
                                                            })}
                                                            disabled={!editModes.profile}
                                                        />
                                                        {errors.phone && (
                                                            <p className="text-danger small">{errors.phone.message}</p>
                                                        )}
                                                    </div>
                                                    <div className="col-md-4">
                                                        <label className="form-label mb-2">Password *</label>
                                                        <div className="input-group">
                                                            <input
                                                                type={showPassword ? "text" : "password"}
                                                                className="form-control"
                                                                {...register("password", {
                                                                    required: "Password required",
                                                                    minLength: {
                                                                        value: 6,
                                                                        message: "Min length 6",
                                                                    },
                                                                })}
                                                                disabled={!editModes.profile}
                                                            />
                                                            <button
                                                                type="button"
                                                                className="btn btn-icon btn-soft-success"
                                                                onClick={togglePasswordVisibility}
                                                            >
                                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                                            </button>
                                                        </div>
                                                        {errors.password && (
                                                            <p className="text-danger small">{errors.password.message}</p>
                                                        )}
                                                    </div>
                                                    {/* <div className="col-md-4">
                                                        <div className="form-check form-switch form-check-inline">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                {...register("twoFactor")}
                                                                checked={watch("twoFactor")}
                                                                disabled={!editModes.profile}
                                                            />
                                                            <label className="form-label mt-2 ms-3">
                                                                2 Factor Authentication
                                                            </label>
                                                        </div>
                                                    </div> */}
                                                    {editModes.profile && (
                                                        <div className="col-12 d-flex justify-content-end mt-3">
                                                            <button
                                                                type="button"
                                                                className="btn btn-warning me-2"
                                                                onClick={() => toggleEdit("profile")}
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button type="submit" className="btn btn-primary">
                                                                Update
                                                            </button>
                                                        </div>
                                                    )}
                                                </form>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Company Section */}
                    <div className="row mb-3">
                        <div className="col-sm-12">
                            <div className="card">
                                <div className="card-header d-flex justify-content-between border-0 pb-0">
                                    <div className="header-title">
                                        <h4 class="fw-500 text-primary">Company Information</h4>
                                    </div>
                                    {/* Hide edit button for sub_user */}
                                    {user_type !== "sub_user" && !editModes.company && (
                                        <button
                                            onClick={() => toggleEdit("company")}
                                            className="btn btn-icon btn-soft-warning btn-sm"
                                        >
                                            <i className="material-symbols-outlined">edit</i>
                                        </button>
                                    )}
                                </div>
                                <div className="card-body">
                                    {loading.company ? (
                                        <Loader />
                                    ) : (
                                        <form
                                            onSubmit={handleSubmit((data) => onSubmit(data, "company"))}
                                            className="row align-items-center g-3"
                                        >
                                            <div className="col-md-4">
                                                <label className="form-label mb-2">Company Name *</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    {...register("companyName", {
                                                        required: "Company name is required",
                                                        minLength: { value: 3, message: "Minimum 3 characters" },
                                                        maxLength: { value: 100, message: "Maximum 100 characters" },
                                                    })}
                                                    disabled={user_type === "sub_user" || !editModes.company}
                                                />
                                                {errors.companyName && (
                                                    <small className="text-danger">{errors.companyName.message}</small>
                                                )}
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label mb-2">Website</label>
                                                <input
                                                    type="url"
                                                    className="form-control"
                                                    {...register("website", {
                                                        pattern: {
                                                            value: /^(https?:\/\/)?([\w\d-]+\.){1,}[a-z]{2,}.*$/,
                                                            message: "Enter a valid URL",
                                                        },
                                                    })}
                                                    disabled={user_type === "sub_user" || !editModes.company}
                                                />
                                                {errors.website && (
                                                    <small className="text-danger">{errors.website.message}</small>
                                                )}
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label mb-2">CEO Contact</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    {...register("ceoContact", {
                                                        pattern: {
                                                            value: /^[0-9]{7,15}$/,
                                                            message: "Enter a valid phone number (7–15 digits)",
                                                        },
                                                    })}
                                                    disabled={user_type === "sub_user" || !editModes.company}
                                                />
                                                {errors.ceoContact && (
                                                    <small className="text-danger">{errors.ceoContact.message}</small>
                                                )}
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label mb-2">CEO Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    {...register("ceoName", {
                                                        minLength: { value: 3, message: "Minimum 3 characters" },
                                                        maxLength: { value: 50, message: "Maximum 50 characters" },
                                                    })}
                                                    disabled={user_type === "sub_user" || !editModes.company}
                                                />
                                                {errors.ceoName && (
                                                    <small className="text-danger">{errors.ceoName.message}</small>
                                                )}
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label mb-2">CEO Email</label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    {...register("ceoEmail", {
                                                        pattern: {
                                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                            message: "Invalid email address",
                                                        },
                                                    })}
                                                    disabled={user_type === "sub_user" || !editModes.company}
                                                />
                                                {errors.ceoEmail && (
                                                    <small className="text-danger">{errors.ceoEmail.message}</small>
                                                )}
                                            </div>
                                            {editModes.company && user_type !== "sub_user" && (
                                                <div className="col-12 d-flex justify-content-end mt-3">
                                                    <button
                                                        type="button"
                                                        className="btn btn-warning me-2"
                                                        onClick={() => toggleEdit("company")}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button type="submit" className="btn btn-primary">
                                                        Update
                                                    </button>
                                                </div>
                                            )}
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Address Section */}
                    <div className="row mb-3">
                        <div className="col-sm-12">
                            <div className="card">
                                <div className="card-header d-flex justify-content-between border-0 pb-0">
                                    <div className="header-title">
                                        <h4 class="fw-500 text-primary">Address Information</h4>
                                    </div>
                                    {/* Hide edit button for sub_user */}
                                    {user_type !== "sub_user" && !editModes.address && (
                                        <button
                                            onClick={() => toggleEdit("address")}
                                            className="btn btn-icon btn-soft-warning btn-sm"
                                        >
                                            <i className="material-symbols-outlined">edit</i>
                                        </button>
                                    )}
                                </div>
                                <div className="card-body">
                                    {loading.address ? (
                                        <Loader />
                                    ) : (
                                        <form
                                            onSubmit={handleSubmit((data) => onSubmit(data, "address"))}
                                            className="row align-items-center g-3"
                                        >
                                            <div className="col-md-4">
                                                <label className="form-label mb-2">Address *</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    {...register("address", { required: "Address is required" })}
                                                    disabled={user_type === "sub_user" || !editModes.address}
                                                    placeholder="Enter Address"
                                                />
                                                {errors.address && (
                                                    <small className="text-danger">{errors.address.message}</small>
                                                )}
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label mb-2">Country *</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    {...register("country", { required: "Country is required" })}
                                                    disabled={user_type === "sub_user" || !editModes.address}
                                                    placeholder="Enter Country"
                                                />
                                                {errors.country && (
                                                    <small className="text-danger">{errors.country.message}</small>
                                                )}
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label mb-2">State/Province *</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    {...register("state", {
                                                        required: "State/Province is required",
                                                        minLength: { value: 2, message: "State must be at least 2 characters" },
                                                        maxLength: { value: 50, message: "State must not exceed 50 characters" },
                                                    })}
                                                    disabled={user_type === "sub_user" || !editModes.address}
                                                    placeholder="Enter State/Province"
                                                />
                                                {errors.state && (
                                                    <small className="text-danger">{errors.state.message}</small>
                                                )}
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label mb-2">City *</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    {...register("city", { required: "City is required" })}
                                                    disabled={user_type === "sub_user" || !editModes.address}
                                                    placeholder="Enter City"
                                                />
                                                {errors.city && (
                                                    <small className="text-danger">{errors.city.message}</small>
                                                )}
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label mb-2">ZIP/Postal Code</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    {...register("zip", {
                                                        pattern: { value: /^[0-9]{4,10}$/, message: "Enter a valid ZIP" },
                                                    })}
                                                    disabled={user_type === "sub_user" || !editModes.address}
                                                    placeholder="Enter ZIP/Postal Code"
                                                />
                                                {errors.zip && (
                                                    <small className="text-danger">{errors.zip.message}</small>
                                                )}
                                            </div>
                                            {editModes.address && user_type !== "sub_user" && (
                                                <div className="col-12 d-flex justify-content-end mt-3">
                                                    <button
                                                        type="button"
                                                        className="btn btn-warning me-2"
                                                        onClick={() => toggleEdit("address")}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button type="submit" className="btn btn-primary">
                                                        Update
                                                    </button>
                                                </div>
                                            )}
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
