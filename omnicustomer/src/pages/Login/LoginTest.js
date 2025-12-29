import React, { useState, useEffect, useRef } from 'react';
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { triggerAlert } from '../../utils/CommonFunctions';
import { usernameValidations, passwordValidations, simpleAlert } from '../../utils/Constants';
import { forgetPassword, loginSubmit } from '../../utils/ApiClient';
import { resendOtp, otpVerification, captchrefresh } from '../../utils/ApiClient';
import { login } from '../../utils/CommonFunctions';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import MetaTitle from '../../common/MetaTitle';
import Loader from '../../common/components/Loader';
import AppConfig from '../../utils/Config';

export default function LoginTest() {
    const [captchaUrl, setCaptchaUrl] = useState("");
    const [userCaptchaInput, setUserCaptchaInput] = useState("");
    const [isCaptchaValid, setIsCaptchaValid] = useState("");
    const [userDetailsOtp, setUserDetailsOtp] = useState({});
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const otpInputsRef = useRef([]);
    const [errorOTP, setErrorOTP] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [passwordType, setPasswordType] = useState("password");
    const otp_expire_time = 60;
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(otp_expire_time);
    const [isOtpExpired, setIsOtpExpired] = useState(false);
    const [showOtpScreen, setShowOtpScreen] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const { register: registerForgot, handleSubmit: handleSubmitForgot, formState: { errors: errorsForgot } } = useForm();
    const navigate = useNavigate();

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            otpVerify(e);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
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

                        const for_otp_response = {
                            token: token,
                            auth_user: auth_user,
                            company_name: company_name,
                            customer_id: customer_id,
                            email_id: user.email,
                            user_type: user.user_type,
                            user_id: user.user_type === 'sub_user' ? user.sub_user_id : user.user_id,
                            username: user.username,
                            full_name: full_name
                        };

                        setUserDetailsOtp(for_otp_response);
                        setIsTimerActive(false);
                        setTimeLeft(otp_expire_time);
                        setIsOtpExpired(false);
                        setIsTimerActive(true);
                        setShowOtpScreen(true);
                    } else {
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
            user_type: userDetailsOtp.user_type
        };
        try {
            const response = await otpVerification(api_input);
            const response_data = response.data;
            if (response_data.error_code === 200) {
                login(userDetailsOtp?.token, userDetailsOtp?.username, userDetailsOtp?.email_id, userDetailsOtp?.user_type, userDetailsOtp?.user_id, userDetailsOtp?.company_name, userDetailsOtp?.full_name);
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
        if (isNaN(value)) return; // Only allow numbers
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // ✅ Move focus only when typing a number, not when deleting
        if (value && index < otpInputsRef.current.length - 1) {
            otpInputsRef.current[index + 1].focus();
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
                triggerAlert('info', '', 'Something went wrong.');
            } finally {
                setIsForgotPasswordLoading(false);
            }
        } else {
            simpleAlert('Please enter the username');
        }
    };

    const props = {
        title: "Workspace | Social media Sync",
        description: "Premium Multipurpose Admin & Dashboard Template"
    };

    return (
        <>
            <MetaTitle {...props} />
            <div className="ls-bg">
                <img className="ls-bg-inner" src="assets/images/login-page3.png" alt="" />
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
}
