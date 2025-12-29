import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { triggerAlert } from '../../utils/CommonFunctions';
import { usernameValidations, passwordValidations, formatDate, simpleAlert } from '../../utils/Constants';
import { forgetPassword, loginSubmit } from '../../utils/ApiClient';
import { resendOtp, otpVerification, captchrefresh, currentIpAddress } from '../../utils/ApiClient';
import { login } from '../../utils/CommonFunctions';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // FontAwesome icons
import MetaTitle from '../../common/MetaTitle';
import Loader from '../../common/components/Loader';
import AppConfig from '../../utils/Config';

export default function Login() {
    const [captchaUrl, setCaptchaUrl] = useState("");
    const [userCaptchaInput, setUserCaptchaInput] = useState("");
    const [isCaptchaValid, setIsCaptchaValid] = useState("");
    const [userDetailsOtp, setUserDetailsOtp] = useState({});
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const otpInputsRef = useRef([]);
    const [errorOTP, setErrorOTP] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [passwordType, setPasswordType] = useState("password");
    const otp_expire_time = 60; // 1 minute in seconds
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(otp_expire_time);
    const [isOtpExpired, setIsOtpExpired] = useState(false);
    const [showOtpScreen, setShowOtpScreen] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);

    const api_url = process.env.REACT_APP_API_BASE_URL;

    const { register, handleSubmit, formState: { errors }, reset, clearErrors, control, watch } = useForm();
    const { register: registerForgot, handleSubmit: handleSubmitForgot, formState: { errors: errorsForgot } } = useForm();

    const navigate = useNavigate();

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            otpVerify(e);
        }
    };

    const togglePassword = () => {
        setPasswordType(passwordType === "password" ? "text" : "password");
    };

    useEffect(() => {
        refreshCaptcha();
    }, []);

    useEffect(() => {
        let timer;
        if (isTimerActive && !isOtpExpired) {
            timer = setInterval(() => {
                setTimeLeft(prevTime => {
                    if (prevTime <= 1) {
                        clearInterval(timer);
                        setIsTimerActive(false);
                        setIsOtpExpired(true);
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isTimerActive, isOtpExpired]);

    const refreshCaptcha = async (api_input) => {
        try {
            const response = await captchrefresh(api_input);
            if (response.status === 200) {
                const data = await response.data;
                setIsCaptchaValid(data.captcha_text);
                setCaptchaUrl(`data:image/png;base64, ${data.image_data}`);
            }
        } catch (error) {
            console.error(error);
        }
    };


    const fetchCurrentIp = async () => {
        try {
            const response = await currentIpAddress();
            return response.data.ip; // Assuming the API returns the IP in `data.ip`
        } catch (error) {
            console.error("Error fetching current IP:", error);
            return null;
        }
    };

    const onSubmit = async (data) => {
        setIsLoading(true);
        if (showForgotPassword) {
            handleForgotPassword(data);
            setIsLoading(false);
            return;
        }
        try {
            const response = await loginSubmit(data);
            const response_data = response.data;
            if (response_data.error_code === 200) {
                const { token, user } = response_data.results;
                if (user) {
                    const auth_user = `${user.first_name} ${user.last_name}`;
                    const company_name = user.company_name;
                    const customer_id = user.id;
                    if (user.status.toLowerCase() === "active" && token) {
                        let full_name = user.user_type === "sub_user" ? user.first_name : `${user.first_name} ${user.last_name}`;

                        // Fetch current IP
                        const currentIpResponse = await currentIpAddress();
                        const currentIp = currentIpResponse.data.results.ip_address;

                        // Log for debugging
                        console.log("Current IP:", currentIp);
                        console.log("Allowed IPs:", user.ip_address);

                        // Check if current IP is in the user's ip_address array
                        const isIpAllowed = user.ip_address && user.ip_address.includes(currentIp);

                        // Log the result of the check
                        console.log("Is IP allowed?", isIpAllowed);

                        if (isIpAllowed) {
                            // Directly navigate to workspace
                            login(
                                token,
                                user.username,
                                user.email,
                                user.user_type,
                                user.user_type === 'sub_user' ? user.sub_user_id : user.user_id,
                                company_name,
                                full_name,
                                rememberMe
                            );
                            setTimeout(() => {
                                navigate("/workspace");
                            }, 2000);
                        } else {
                            // Show OTP page
                            const for_otp_response = {
                                token: token,
                                auth_user: auth_user,
                                company_name: company_name,
                                customer_id: customer_id,
                                email_id: user.email,
                                user_type: user.user_type,
                                user_id: user.user_type === 'sub_user' ? user.sub_user_id : user.user_id,
                                username: user.username,
                                full_name: full_name,
                                currentIp: currentIp,
                            };
                            setUserDetailsOtp(for_otp_response);
                            setIsTimerActive(false);
                            setTimeLeft(otp_expire_time);
                            setIsOtpExpired(false);
                            setIsTimerActive(true);
                            setShowOtpScreen(true);
                        }
                    } else {
                        // Handle inactive/blocked/pending status
                        const statusMessages = {
                            "inactive": "Your account is inactive. Please contact the administrator for assistance.",
                            "blocked": "Your account is blocked. Please contact the administrator for assistance.",
                            "pending": "Your account is not yet active. Please contact the administrator for assistance."
                        };
                        triggerAlert("info", "", statusMessages[user.status.toLowerCase()] || "Your account can't be logged in. Please contact the administrator for assistance.");
                    }
                }
            } else {
                triggerAlert("info", "", "Invalid Login.");
            }
        } catch (error) {
            console.error("An error occurred:", error);
            triggerAlert("info", "", error?.response?.data?.message || "Invalid Login.");
        } finally {
            setIsLoading(false);
        }
    };



    const handleResendOtp = async () => {
        clearOtpInputs();
        setIsLoading(true);
        const api_input = {
            user_id: userDetailsOtp.user_id,
            user_type: userDetailsOtp.user_type
        };
        try {
            const response = await resendOtp(api_input);
            const response_data = response.data;
            if (response_data.error_code === 200) {
                triggerAlert("success", "Success", `OTP has been sent to your email ${userDetailsOtp?.email_id}`);
                setIsTimerActive(false);
                setTimeLeft(otp_expire_time);
                setIsOtpExpired(false);
                setIsTimerActive(true);
            } else {
                triggerAlert("info", "", "Unable to send the OTP.");
            }
        } catch (error) {
            triggerAlert("info", "", "Unable to send the OTP.");
        } finally {
            setIsLoading(false);
        }
    };

    const parseDate = (dateString) => {
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? null : date;
    };

    const otpVerify = async (e) => {
        e.preventDefault();
        const isEmpty = otp.some((val) => val === '');
        if (isEmpty) {
            setErrorOTP('All fields are required');
            return;
        }
        setIsLoading(true);
        setErrorOTP('');
        const combinedOtp = otp.join('');
        const api_input = {
            otp: combinedOtp,
            user_id: userDetailsOtp.user_id,
            user_type: userDetailsOtp.user_type,
            currentIp: userDetailsOtp.currentIp, // Send current IP to backend
        };
        try {
            const response = await otpVerification(api_input);
            const response_data = response.data;
            if (response_data.error_code === 200) {
                login(
                    userDetailsOtp?.token,
                    userDetailsOtp?.username,
                    userDetailsOtp?.email_id,
                    userDetailsOtp?.user_type,
                    userDetailsOtp?.user_id,
                    userDetailsOtp?.company_name,
                    userDetailsOtp?.full_name,
                    rememberMe
                );
                setTimeout(() => {
                    navigate("/workspace");
                }, 2000);
            } else {
                setErrorOTP('Invalid OTP.');
                triggerAlert("info", "", "Invalid OTP.");
                setIsLoading(false);
            }
        } catch (error) {
            console.error('OTP Verification Error:', error);
            setErrorOTP('An error occurred while verifying OTP.');
            triggerAlert("info", "", "An error occurred while verifying OTP.");
            setIsLoading(false);
        }
    };


    const clearOtpInputs = () => {
        setOtp(Array(6).fill(''));
        otpInputsRef.current.forEach(input => {
            if (input) input.value = '';
        });
    };

    const handleInputChange = (index, value) => {
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value) {
            if (index < otpInputsRef.current.length - 1) {
                otpInputsRef.current[index + 1].focus();
            }
        } else {
            if (index > 0) {
                otpInputsRef.current[index - 1].focus();
            }
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpInputsRef.current[index - 1].focus();
            const newOtp = [...otp];
            newOtp[index - 1] = '';
            setOtp(newOtp);
        }
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handleLoginOtp = () => {
        setIsTimerActive(false);
        setTimeLeft(otp_expire_time);
        setIsOtpExpired(false);
        setErrorOTP('');
        clearOtpInputs();
        setShowOtpScreen(false);
        refreshCaptcha();
        reset();
        setUserCaptchaInput("");
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleForgotPassword = async (data) => {
        if (data.username !== "") {
            setIsForgotPasswordLoading(true);
            const api_input = {
                user_name: data.username?.trim()
            }
            try {
                const response = await forgetPassword(api_input);
                const response_data = response.data;
                if (response_data.error_code == 200) {
                    triggerAlert('success', 'Success', response_data.message);
                    setShowForgotPassword(false);
                }
            } catch (error) {
                console.log(error);
                triggerAlert('info', '', 'Something went wrong..');
            } finally {
                setIsForgotPasswordLoading(false);
            }
        } else {
            simpleAlert('Please enter the username')
        }
    };

    const props = {
        title: "Workspace | Social media Sync",
        description: "Premium Multipurpose Admin & Dashboard Template"
    }
    return (
        <>
            <MetaTitle {...props} />
            <div class="ls-bg">
                <img class="ls-bg-inner" src="assets/images/login-page3.png" alt="" />
            </div>

            <main className="overflow-hidden main-custom">
                <div className="wrapper">
                    <div className="main-inner">
                        <div className="logo">
                            <div className="logo-icon">
                                <img src="/assets/images/logo-light.png" alt="BeRifma" />
                            </div>
                        </div>
                        <div className="row h-100 align-content-center">
                            <div className="col-md-6 tab-100 order_2">
                                <div className="side-text">
                                    <article>
                                        <span>Welcome to Vitel global</span>
                                        <h4 className="main-heading">Boost Customer Satisfaction with omnipresence</h4>
                                        <p>
                                            Use SMS, WhatsApp, And Omnichannel Strategies To Streamline Communications
                                            And Uplift Your Brand's Image With Our Complete Digital CX Platform.
                                        </p>
                                    </article>
                                </div>
                            </div>
                            <div className="col-md-6 tab-100">
                                <div className="form">
                                    {!showOtpScreen && !showForgotPassword ? (
                                        <>
                                            <h2 className="login-form form-title">Sign In to Access Your Account</h2>
                                            <h2 className="signup-form form-Create">
                                                New Here? <Link to="/signup">Create an Account</Link>.
                                            </h2>
                                            <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
                                                <div className="input-field">
                                                    <input
                                                        type="text"
                                                        id="username"
                                                        required
                                                        placeholder="Username"
                                                        className="form-control"
                                                        autoComplete="off"
                                                        {...register("username", {
                                                            required: "Username is required",
                                                            pattern: usernameValidations
                                                        })}
                                                    />
                                                    {errors.username && (
                                                        <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                                                            {errors.username.message}
                                                        </div>
                                                    )}
                                                    <label>Username</label>
                                                </div>

                                                <div className="col-xs-12" style={{ position: "relative", display: "flex", alignItems: "center" }}>
                                                    <div className="input-field delay-100ms" style={{ flex: 1, position: "relative" }}>
                                                        <input
                                                            type={showPassword ? "text" : "password"}
                                                            id="password"
                                                            required
                                                            placeholder="password"
                                                            className="form-control"
                                                            autoComplete="new-password"
                                                            {...register("password", {
                                                                required: "Password is required",
                                                                minLength: {
                                                                    value: 6,
                                                                    message: "Password must be at least 6 characters long"
                                                                },
                                                                pattern: passwordValidations
                                                            })}
                                                        />
                                                        {errors.password && (
                                                            <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                                                                {errors.password.message}
                                                            </div>
                                                        )}
                                                        <label>Password</label>
                                                    </div>
                                                    <span
                                                        onClick={togglePasswordVisibility}
                                                        style={{
                                                            cursor: "pointer",
                                                            position: "absolute",
                                                            right: "10px",
                                                            top: "30%",
                                                            transform: "translateY(-50%)",
                                                            fontSize: "16px",
                                                        }}
                                                    >
                                                        {showPassword ? <FaEye /> : <FaEyeSlash />}
                                                    </span>
                                                </div>
                                                <div className="form-check mb-3 d-flex justify-content-between">
                                                    <div>
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id="rememberMe"
                                                            checked={rememberMe}
                                                            onChange={() => {
                                                                const newRememberMeValue = !rememberMe; // Calculate the new value
                                                                setRememberMe(newRememberMeValue); // Update state
                                                                AppConfig.rememberMe = newRememberMeValue; // Update AppConfig with the new value
                                                            }}
                                                        />
                                                        <label className="form-check-label" htmlFor="rememberMe">
                                                            Remember Me
                                                        </label>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="btn btn-link p-0"
                                                        onClick={() => setShowForgotPassword(true)}
                                                        style={{
                                                            color: '#9191ff',
                                                            textDecoration: 'underline',
                                                            // fontWeight: 'bold'
                                                        }}
                                                    // onMouseOver={(e) => e.target.style.color = 'orange'}
                                                    // onMouseOut={(e) => e.target.style.color = '#9191ff'}
                                                    >
                                                        Forgot Password?
                                                    </button>
                                                </div>
                                                <div className="col-xs-12">
                                                    <div className="d-flex mb-5">
                                                        <div className="col-xs-12">
                                                            <Controller
                                                                name="captcha"
                                                                control={control}
                                                                rules={{ required: 'Verification Code is required' }}
                                                                render={({ field }) => (
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        placeholder="Verification Code"
                                                                        {...field}
                                                                        value={userCaptchaInput}
                                                                        onChange={(e) => {
                                                                            setUserCaptchaInput(e.target.value);
                                                                            field.onChange(e);
                                                                        }}
                                                                    />
                                                                )}
                                                            />
                                                            {errors.captcha && <p style={{ color: "red" }}>{errors.captcha.message}</p>}
                                                        </div>
                                                        <div className="w-auto ms-3">
                                                            <img
                                                                id="vimg"
                                                                alt="captcha"
                                                                src={captchaUrl}
                                                                align="absmiddle"
                                                                style={{
                                                                    width: "130%",
                                                                    height: "auto",
                                                                    maxWidth: "109px",
                                                                    float: "left",
                                                                }}
                                                            />
                                                        </div>
                                                        <span
                                                            className="mx-3 mt-1"
                                                            id="refreshimage"
                                                        >
                                                            <svg
                                                                onClick={refreshCaptcha}
                                                                className="icon ms-2"
                                                                height="30"
                                                                viewBox="0 0 24 24"
                                                                width="38"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                            >
                                                                <path
                                                                    d="m23.8995816 10.3992354c0 .1000066-.1004184.1000066-.1004184.2000132 0 0 0 .1000066-.1004184.1000066-.1004184.1000066-.2008369.2000132-.3012553.2000132-.1004184.1000066-.3012552.1000066-.4016736.1000066h-6.0251046c-.6025105 0-1.0041841-.4000264-1.0041841-1.00006592 0-.60003954.4016736-1.00006591 1.0041841-1.00006591h3.5146443l-2.8117154-2.60017136c-.9037657-.90005932-1.9079498-1.50009886-3.0125523-1.90012523-2.0083682-.70004614-4.2175733-.60003954-6.12552305.30001977-2.0083682.90005932-3.41422594 2.50016478-4.11715481 4.5002966-.20083682.50003295-.80334728.80005275-1.30543933.60003954-.50209205-.10000659-.80334728-.70004613-.60251046-1.20007909.90376569-2.60017136 2.71129707-4.60030318 5.12133891-5.70037568 2.41004184-1.20007909 5.12133894-1.30008569 7.63179914-.40002637 1.4058578.50003296 2.7112971 1.30008569 3.7154812 2.40015819l3.0125523 2.70017795v-3.70024386c0-.60003955.4016736-1.00006591 1.0041841-1.00006591s1.0041841.40002636 1.0041841 1.00006591v6.00039545.10000662c0 .1000066 0 .2000132-.1004184.3000197zm-3.1129707 3.7002439c-.5020921-.2000132-1.1046025.1000066-1.3054394.6000396-.4016736 1.1000725-1.0041841 2.200145-1.9079497 3.0001977-1.4058578 1.5000989-3.5146444 2.3001516-5.623431 2.3001516-2.10878662 0-4.11715482-.8000527-5.72384938-2.4001582l-2.81171548-2.6001714h3.51464435c.60251046 0 1.0041841-.4000263 1.0041841-1.0000659 0-.6000395-.40167364-1.0000659-1.0041841-1.0000659h-6.0251046c-.10041841 0-.10041841 0-.20083682 0s-.10041841 0-.20083682 0c0 0-.10041841 0-.10041841.1000066-.10041841 0-.20083682.1000066-.20083682.2000132s0 .1000066-.10041841.1000066c0 .1000066-.10041841.1000066-.10041841.2000132v.2000131.1000066 6.0003955c0 .6000395.40167364 1.0000659 1.0041841 1.0000659s1.0041841-.4000264 1.0041841-1.0000659v-3.7002439l2.91213389 2.8001846c1.80753138 2.0001318 4.31799163 3.0001977 7.02928871 3.0001977 2.7112971 0 5.2217573-1.0000659 7.1297071-2.9001911 1.0041841-1.0000659 1.9079498-2.3001516 2.4100418-3.7002439.1004185-.6000395-.2008368-1.2000791-.7029288-1.3000857z"
                                                                    transform=""
                                                                ></path>
                                                            </svg>
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="login-btn">
                                                    <button
                                                        type="submit"
                                                        className="login"
                                                        disabled={isLoading}
                                                    >
                                                        {isLoading ? 'Logging you in....' : 'Login to your Account!'}
                                                    </button>
                                                </div>
                                            </form>


                                        </>
                                    ) : showOtpScreen ? (
                                        <>
                                            <div className="card-custom p-5 text-center">
                                                <h4 className="text-center mb-4">Two-Factor Authentication</h4>
                                                <h6 style={{ whiteSpace: 'nowrap' }}>Please enter the code to verify your account</h6>
                                                <div>
                                                    <span>A code has been sent to </span>
                                                    <span className="fw-semibold text-primary">{userDetailsOtp ? userDetailsOtp?.email_id : '-'}</span>
                                                </div>
                                                <div
                                                    id="otp"
                                                    className="inputs d-flex flex-row justify-content-center mt-2"
                                                >
                                                    {[...Array(6)].map((_, index) => (
                                                        <input
                                                            key={index}
                                                            className="m-2 text-center form-control rounded"
                                                            type="text"
                                                            maxLength="1"
                                                            value={otp[index]}
                                                            onChange={(e) => handleInputChange(index, e.target.value)}
                                                            onKeyDown={(e) => handleKeyDown(e, index)}
                                                            onKeyPress={handleKeyPress}
                                                            ref={(el) => (otpInputsRef.current[index] = el)}
                                                            style={{ width: '40px' }}
                                                        />
                                                    ))}
                                                </div>
                                                {errorOTP && <p className="text-danger">{errorOTP}</p>}
                                                {!isOtpExpired && (
                                                    <div className="mt-4">
                                                        <button
                                                            className="btn btn-primary px-4 validate"
                                                            onClick={otpVerify}
                                                            disabled={isOtpExpired || isLoading}
                                                        >
                                                            {isLoading ? 'Verifying..' : 'Verify'}
                                                        </button>
                                                    </div>
                                                )}
                                                {isTimerActive ? (
                                                    <p className={`timer mb-0 font-size-18 mt-4 text-success`}>
                                                        Time left <strong className={`${timeLeft <= 30 ? 'text-danger' : 'text-success'}`}>{formatTime(timeLeft)}</strong> seconds
                                                    </p>
                                                ) : isOtpExpired ? (
                                                    <p className="timer text-danger mb-0 font-size-18 mt-4">OTP expired. Resend now to continue.</p>
                                                ) : null}
                                                {isOtpExpired && (
                                                    <p className="resend text-muted mb-0 font-size-18 mt-4">
                                                        Didn't receive authentication code?{" "}
                                                        {isLoading ? (
                                                            <div
                                                                className="d-flex justify-content-center align-items-center"
                                                                style={{
                                                                    width: "100%",
                                                                    marginBottom: "40px",
                                                                    borderRadius: "12px",
                                                                    border: "0",
                                                                }}
                                                            >
                                                                <Loader />
                                                            </div>
                                                        ) : (
                                                            <a
                                                                type="button"
                                                                href="#/"
                                                                className="text-primary text-decoration-underline fw-semibold"
                                                                onClick={handleResendOtp}
                                                            >
                                                                Resend
                                                            </a>
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-center mt-3 d-flex align-items-baseline justify-content-center">
                                                <i className="fa fa-angle-double-left me-1"></i>
                                                <p role="button" className="text-decoration-underline fonst-size-20 fw-semibold" onClick={handleLoginOtp}>
                                                    Back to Login
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="forgot-password-container">
                                            <h5 className="form-title">Forgot Password</h5>
                                            <div className="modal-body">
                                                <form onSubmit={handleSubmitForgot(handleForgotPassword)}>
                                                    <div className="mb-3">
                                                        <label htmlFor="username" className="form-label">Email/Username</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="username"
                                                            {...registerForgot("username", { required: "Email/Username is required" })}
                                                        />
                                                        {errorsForgot.username && <div className="text-danger">{errorsForgot.username.message}</div>}
                                                    </div>
                                                    <button type="submit" className="btn btn-primary w-100" disabled={isForgotPasswordLoading}>
                                                        {isForgotPasswordLoading ? 'Sending...' : 'Send Reset Link'}
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};
