import React, { useState, useEffect, useRef } from 'react';
import { useForm } from "react-hook-form";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { getBase64, triggerAlert, validateFileSize } from '../../utils/CommonFunctions';
import { onlyAlphabetsandSpaces, onlyAlphaNumericSpaces, passwordValidations, onlyAlphabets, emailValidation, onlyNumbers, MinLengthValidation, MaxLengthValidation } from '../../utils/Constants'
import { registerSubmit, RegisterUser, Verify_OTP, ReSendOTP } from '../../utils/ApiClient';
import MetaTitle from '../../common/MetaTitle';
import Loader from '../../common/components/Loader';
import Base64Preview from "../../common/FilePreview";
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Signup() {
    const api_url = process.env.REACT_APP_API_BASE_URL;
    const [stateData, setStatesData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordType, setPasswordType] = useState("password");
    const [confirmPasswordType, setConfirmPasswordType] = useState("password");
    const [sameAddress, setSameAddress] = useState(false);
    const [emailid, setEmail] = useState("");
    const [sussuid, setUid] = useState("");
    const [sussresp, setSussresp] = useState("");
    const [selectedCountryCode, setSelectedCountryCode] = useState(null);
    const [selectedCountryCodeCust, setSelectedCountryCodeCust] = useState(null);
    const [stateDataCust, setStatesDataCust] = useState([]);
    const [countryData, setCountriesData] = useState([]);
    const [disableAdd, setDisableAdd] = useState(null);
    const [otpverified, setOtpverify] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const [planData, setPlanData] = useState([]);

    const [otp, setOtp] = useState(new Array(6).fill(""));
    const otpInputsRef = useRef([]);


    const handleInputChange = (index, value) => {
        if (isNaN(value)) return; // Ensure only numbers are input

        let newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus to the next input if value is entered
        if (value && index < otpInputsRef.current.length - 1) {
            otpInputsRef.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        // Handle backspace
        if (e.key === 'Backspace') {
            let newOtp = [...otp];
            newOtp[index] = "";
            setOtp(newOtp);

            if (index > 0) {
                otpInputsRef.current[index - 1].focus();
            }
        }
    };

    const [errorOTP, setErrorOTP] = useState('');

    const otpVerify = async (e) => {

        e.preventDefault();
        const isEmpty = otp.some((val) => val === '');

        if (isEmpty) {
            setErrorOTP('All fields are required');
        } else {
            setIsLoading(true);
            // Update progress bar for Step 3 if no errors
            if (currentStep === 3) {
                const tab3 = document.querySelector('#progress-form__tab-3');
                tab3.setAttribute('data-complete', 'true');
                tab3.setAttribute('aria-selected', 'true');

            }
            setErrorOTP('');
            const combinedOtp = otp.join('');

            const api_input = {
                signup_otp: combinedOtp,
                user_id: sussuid
            }

            try {
                const response = await Verify_OTP(api_input);
                const response_data = response.data;
                if (response_data.error_code == 200) {
                    setIsLoading(false);
                    setOtpverify(response_data.error_code);

                } else {
                    setIsLoading(false);
                    triggerAlert("error", "Oops...", "Invalid Otp..");

                }
            } catch (error) {
                // console.log("response_data.error_code22")
                setIsLoading(false);
                triggerAlert("error", "Oops...", "Invalid Otp..");
            }
        }
    };



    const clearOtpInputs = () => {
        setOtp(Array(6).fill(''));
        otpInputsRef.current.forEach(input => {
            if (input) input.value = '';
        });
    };
    const handleResendOtp = async () => {
        clearOtpInputs();
        const api_input = {
            user_id: sussuid
        }
        try {

            const response = await ReSendOTP(api_input);
            const response_data = response.data;
            // alert("sefsed")
            //console.log("sdfwsef");
            if (response_data.error_code == 200) {
                setOtpSent(true);
                triggerAlert("success", "Success", `OTP has been sent to your email :${emailid} `);
            } else {
                triggerAlert("error", "Oops...", "Unable to send the OTP..");
            }
        } catch (error) {
            // console.log("response_data.error_code22")
            triggerAlert("error", "Oops...", "Unable to send the OTP..");
        }
        //  setOtpverify("200");
        //console.log(otpverified)
    }

    const filteredStatesCust = stateDataCust.filter(
        (state) => state.country_code_char2 === selectedCountryCodeCust
    );

    const filteredStates = stateData.filter(
        (state) => state.country_code_char2 === selectedCountryCode
    );


    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        clearErrors,
        setError,
        getValues,
        setValue,
    } = useForm({
        mode: "onChange", // Enable onChange mode for real-time validation
    });

    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);

    const togglePassword = () => {
        setPasswordType(passwordType === "password" ? "text" : "password");
    };

    const toggleConfirmPassword = () => {
        setConfirmPasswordType(confirmPasswordType === "password" ? "text" : "password");
    };

    const [completedSteps, setCompletedSteps] = useState(0);


    useEffect(() => {
        fetchCountriesData();
        fetchPlanData();

    }, []);



    const fetchStatesData = async (countryCode) => {
        // setIsLoading(true);
        try {
            const response = await axios.get(
                api_url + "customer/states_by_country_code/" + countryCode + "/"
            );
            const respdata = response.data.results.data;
            setStatesData(respdata);
            // setIsLoading(false);
        } catch (error) {
            //triggerAlert('error','','No data available');
        }
    };

    const fetchCountriesData = async () => {
        //setIsLoading(true);
        try {
            const response = await axios.get(api_url + "customer/countries_list/");
            const respdata = response.data.results.data;
            setCountriesData(respdata);
            // setIsLoading(false);
        } catch (error) {
            console.log(error)
            // triggerAlert("error", "", "No data available");
        }
    };
    const fetchPlanData = async () => {

        //setIsLoading(true);
        try {
            const response = await axios.get(api_url + "billing/plans/");
            const respdata = response.data;
            setPlanData(respdata);
            // setIsLoading(false);
        } catch (error) {
            console.log(error)
            // triggerAlert("error", "", "No data available");
        }
    };

    const registerUser = async (data) => {
        if (currentStep === 2) {
            const tab2 = document.querySelector('#progress-form__tab-2');
            tab2.setAttribute('data-complete', 'true');
            // tab2.setAttribute('aria-selected', 'true');
            // tab2.removeAttribute('aria-disabled');
            setCompletedSteps(2)
        }

        // console.log(trimmedPayload)
        // return
        setIsLoading(true);
        try {
            //   data.email = data.user_name;
            data.billed_address = sameAddress;
            data.user_name = data.email;

            setEmail(data.email)
            if (selectedFiles[0]?.file) data.company_logo = selectedFiles[0]?.file;
            const { file0, ...trimmedPayload } = data;
            // console.log("data_payload", data)

            // return
            const response = await RegisterUser(trimmedPayload);
            const response_data = response.data;

            if (response_data.error_code == 201) {
                setIsLoading(false);
                //console.log(response_data.error_code)
                //console.log("response_data.error_code")
                setSussresp(response_data.error_code);
                setUid(response_data.results);
                setCompletedSteps(3)
                setCurrentStep(3);
                // console.log(otpverified)
            } else if (response_data.error_code == 400) {
                setIsLoading(false);
                triggerAlert("error", "Oops...", "Username Already Exist");
            } else {
                setIsLoading(false);
                //console.log("response_data.error_code11")
                triggerAlert("error", "Oops...", "Something went wrong..");
            }
        } catch (error) {
            const error_msg = error?.response?.data?.message;
            setIsLoading(false);
            console.log("response_data.error_code22", error)
            triggerAlert("error", "Oops...", error_msg || "Something went wrong..");
        }

        // }
    };



    const handleNextClick = async () => {
        const values = getValues();
        let hasError = 0;

        if (currentStep === 1) {
            const first_name = values.first_name?.trim();
            const last_name = values.last_name?.trim();
            const ceo_name = values.ceo_name?.trim();
            const ceo_mail = values.ceo_mail?.trim();
            // const user_name = values.user_name?.trim();
            const website = values.website?.trim();
            const company_name = values.company_name?.trim();

            if (!first_name) {
                clearErrors('first_name')
                hasError++
                setError("first_name", {
                    type: "manual",
                    message: "First Name is required",
                });
            }

            if (!ceo_name) {
                clearErrors('ceo_name')
                hasError++
                setError("ceo_name", {
                    type: "manual",
                    message: "Ceo Name is required",
                });
            }

            if (!website) {
                clearErrors('website')
                hasError++
                setError("website", {
                    type: "manual",
                    message: "Website is required",
                });
            }

            if (!company_name) {
                clearErrors('company_name')
                hasError++
                setError("company_name", {
                    type: "manual",
                    message: "Company Name is required",
                });
            }

            if (!last_name) {
                clearErrors('last_name')
                hasError++
                setError("last_name", {
                    type: "manual",
                    message: "Last Name is required",
                });
            }

            if (!values.ceo_phone) {
                hasError++;
                setError("ceo_phone", {
                    type: "manual",
                    message: "Phone number is required",
                });
            } else if (!/^\d{10,14}$/.test(values.ceo_phone)) {
                hasError++;
                setError("ceo_phone", {
                    type: "manual",
                    message: "Phone number must be between 10 and 14 digits",
                });
            }

            if (!values.phone) {
                hasError++;
                setError("phone", {
                    type: "manual",
                    message: "Phone number is required",
                });
            } else if (!/^\d{10,14}$/.test(values.phone)) {
                hasError++;
                setError("phone", {
                    type: "manual",
                    message: "Phone number must be between 10 and 14 digits",
                });
            }

            // Removed the validation check for plan_id
            // if (!values.plan_id) {
            //     clearErrors('plan_id')
            //     hasError++;
            //     setError("plan_id", {
            //         type: "manual",
            //         message: "Plan is required",
            //     });
            // }

            if (!ceo_mail) {
                clearErrors('ceo_mail')
                hasError++;
                setError("ceo_mail", {
                    type: "manual",
                    message: "Ceo Mail is required",
                });
            }

            if (!values.password) {
                clearErrors('password')
                hasError++;
                setError("password", {
                    type: "manual",
                    message: "Password is required",
                });
            }

            const PwPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{6,}$/;
            if (!PwPattern.test(values.password)) {
                hasError++;
                clearErrors('password');
                setError("password", {
                    type: "pattern",
                    message: "Password must contain at least 6 characters, including at least one uppercase letter, one lowercase letter, one number, and one special character.",
                });
                return;
            }

            if (!values.confirm_password) {
                clearErrors('confirm_password')
                hasError++;
                setError("confirm_password", {
                    type: "manual",
                    message: "Confirm Password is required",
                });
            }

            if (values.password !== values.confirm_password) {
                clearErrors('password')
                clearErrors('confirm_password')
                hasError++;
                setError("confirm_password", {
                    type: "manual",
                    message: "Password is Not Matching",
                });
            }

            if (values.email !== "") {
                try {
                    const response = await axios.get(
                        api_url + "customer/exist_username/" + values.email + "/"
                    );
                    const error_code = response.data.error_code;
                    const response_message = response.data?.message;
                    if (error_code == 200) {
                        hasError++;
                        clearErrors('email'); // Clear any previous errors
                        setError("email", {
                            type: "custom",
                            message: "Email / Username already exists.",
                        })
                        setDisableAdd(true);
                    } else if (error_code == 203) {
                        clearErrors('email'); // Clear any previous errors
                        setError('email', {
                            type: 'manual',
                            message: 'Email / Username available',
                        });
                        setDisableAdd(false);
                    } else {
                        clearErrors("email")
                        setDisableAdd(false);
                    }
                } catch (error) {
                    clearErrors("email")
                    setDisableAdd(false);
                }
            }

            // Update progress bar for Step 1 if no errors
            if (currentStep === 1 && hasError === 0) {
                const tab1 = document.querySelector('#progress-form__tab-1');
                tab1.setAttribute('data-complete', 'true');
                tab1.setAttribute('aria-selected', 'true');
                tab1.removeAttribute('aria-disabled');
                setCompletedSteps(1)
            }
        }

        // Move to the next step if no errors
        if (hasError === 0) {
            setCurrentStep((prevStep) => prevStep + 1);
        }
    };


    const handlePreviousClick = (step) => {
        setCurrentStep(step);
    };


    const handleSameAddressChange = (e) => {
        const isChecked = e.target.checked;
        setSameAddress(isChecked);

        if (isChecked) {
            const AddressValue = getValues("address");
            const CityValue = getValues("city");
            const ZipValue = getValues("zipcode");
            const CountryValue = getValues("country");
            const StateValue = getValues("state");

            setValue("cust_state", StateValue);
            setValue("cust_country", CountryValue);
            setValue("cust_city", CityValue);
            setValue("cust_address", AddressValue);
            setValue("cust_zipcode", ZipValue);

            // Log the values to ensure they are being set correctly
            console.log("Address:", AddressValue);
            console.log("City:", CityValue);
            console.log("Zip:", ZipValue);
            console.log("Country:", CountryValue);
            console.log("State:", StateValue);
        } else {
            setValue("cust_state", '');
            setValue("cust_country", '');
            setValue("cust_city", '');
            setValue("cust_address", '');
            setValue("cust_zipcode", '');
        }
    };




    const fetchStatesDataCust = async (countryCode) => {
        // setIsLoading(true);
        try {
            const response = await axios.get(
                api_url + "customer/states_by_country_code/" + countryCode + "/"
            );
            const respdata = response.data.results.data;
            setStatesDataCust(respdata);
            // setIsLoading(false);
        } catch (error) {
            //triggerAlert('error','','No data available');
        }
    };
    const props = {
        title: " Signup | Social media Sync ",
        description: "Premium Multipurpose Admin & Dashboard Template"
    }

    // const handleFileChange = async (e, index) => {
    //     const file = e.target.files[0];

    //     if (!file) return;

    //     // Validate file size and type
    //     if (file.size > 3 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/jpg',].includes(file.type)) {
    //         e.target.value = ''; // Clear the input
    //         setImgUpload(null);
    //         return;
    //     }


    //     try {
    //         const base64 = await getBase64(file);
    //         const base64WithoutPrefix = base64.substring(base64.indexOf(',') + 1);
    //         const items = {
    //             file_name: file.name,
    //             file_type: file.name.split('.').pop().toLowerCase(), // Ensure file type is lowercase for consistency
    //             file_size: file.size,
    //             file: base64WithoutPrefix,
    //             preview: base64 // Store the full base64 string for preview
    //         };

    //         // Set state based on file type
    //         if (['jpg', 'jpeg', 'png'].includes(items.file_type)) {
    //             setImgUpload(items);
    //         } else {
    //             // If the file type doesn't match, set an error
    //             setError(`file${index + 1}`, {
    //                 type: "manual",
    //                 message: "Unsupported file type.",
    //             });
    //         }
    //     } catch (error) {
    //         triggerAlert('error', 'Oops...', 'Failed to process the file.');
    //     }
    // };


    const handleFileChange = (e, index) => {
        const files = e.target.files;
        const file_length = Object.keys(files)?.length;

        if (file_length > 0) {
            const filesArray = Array.from(files);
            if (filesArray.length > 0) {
                const fileName = filesArray[0].name.split(".")[0];
                const fileExt = filesArray[0].name.split(".")[1];
                const fileSize = filesArray[0].size;

                // Check file extensions for each selected file
                const maxSizeInBytes = 20 * 1024 * 1024; // 20MB
                const allowedExtensions = [".jpg", ".jpeg", ".png", ".svg"];
                const isValidFiles = filesArray.every((file) => {
                    const fileExtension = "." + file.name.split(".").pop().toLowerCase();
                    return allowedExtensions.includes(fileExtension);
                });

                if (isValidFiles) {
                    // If files are valid, proceed with further checks
                    if (fileSize < maxSizeInBytes) {
                        clearErrors(`file${index}`);
                        // Convert each selected file to base64
                        Promise.all(filesArray.map((file) => getBase64(file))).then(
                            (base64Array) => {
                                // Set the selectedFiles state with the base64-encoded files
                                setSelectedFiles((currentFiles) => {
                                    const updatedFiles = [...currentFiles];
                                    updatedFiles[index] = {
                                        file_name: fileName,
                                        file_type: fileExt,
                                        file_size: fileSize,
                                        file: base64Array[0], // base64 string of the first file
                                    };
                                    return updatedFiles;
                                });
                            }
                        );
                    } else {
                        // If file size is too large, clear the preview and show an error
                        setError(`file${index}`, {
                            type: "manual",
                            message: "File size should not be more than 20MB",
                        });
                        setSelectedFiles((currentFiles) => {
                            const updatedFiles = [...currentFiles];
                            updatedFiles[index] = null; // Clear preview for this file
                            return updatedFiles;
                        });
                    }
                } else {
                    // If file format is invalid, clear the preview and show an error
                    setError(`file${index}`, {
                        type: "manual",
                        message: `Invalid file format. Please upload a valid file.`,
                    });
                    setSelectedFiles((currentFiles) => {
                        const updatedFiles = [...currentFiles];
                        updatedFiles[index] = null; // Clear preview for this file
                        return updatedFiles;
                    });
                }
            }
        } else {
            // User cleared the file input, remove corresponding entry from selectedFiles state
            setSelectedFiles((currentFiles) => {
                const updatedFiles = [...currentFiles];
                updatedFiles[index] = null; // Clear the file preview
                clearErrors(`file${index}`);
                return updatedFiles;
            });
        }
    };
    console.log("selectedFiles", selectedFiles)
    const handleBackToLogin = () => {
        navigate('/login');
    };

    return (

        <>
            <MetaTitle {...props} />
            <div className="modal fade" id="exampleModalCenter" tabIndex="-1" aria-labelledby="exampleModalCenterTitle" aria-hidden="true" style={{ display: 'none' }}>
            </div>
            {isLoading && <div className='loader-overlay text-white'><Loader /></div>}
            <section className="fxt-template-animation fxt-template-layout33 loaded">
                <div className="fxt-content-wrap">
                    <button onClick={handleBackToLogin} style={backButtonStyle}>Back to Login</button>
                    <div className="fxt-heading-content">
                        <div className="fxt-inner-wrap fxt-transformX-R-50 fxt-transition-delay-3">
                            <div className="fxt-transformX-R-50 fxt-transition-delay-10"></div>
                            <div className="fxt-transformX-R-50 fxt-transition-delay-10"></div>
                        </div>
                    </div>
                    <div className="fxt-form-content">
                        <div className="d-flex align-items-center">
                            <div className="pt-5 pb-5 mt-5">
                                <div className="card-header text-center border-0">
                                    <a className="mb-5" href="#/">
                                        <img src="/assets/images/logo.svg" className="img-fluid" alt="logo" loading="lazy" width="260" />
                                    </a>
                                    {otpverified !== 200 && (
                                        <h3 className="mb-0 text-warning fw-500 mt-3 ms-5" style={{ display: otpverified === 200 ? 'none' : 'block' }}>
                                            Create Account
                                        </h3>
                                    )}
                                </div>

                                <div class="sign-in-from mt-3">
                                    <div class="row justify-content-center">
                                        <div class="col-md-3" style={{ display: otpverified == 200 ? "none" : "block" }}>
                                            <ul id="top-tabbar-vertical" class="p-0">


                                                <li className={`step1 ${currentStep === 1 ? 'active' : ''}`} id="personal">
                                                    <a
                                                        href="#/"
                                                        id="progress-form__tab-1"
                                                        className={`flex-1 px-0 pt-2 progress-form__tabs-item ${currentStep >= 1 ? 'active' : ''}`}
                                                        aria-controls="progress-form__panel-1"
                                                        aria-selected={currentStep === 1 ? 'true' : 'false'}
                                                        aria-disabled={completedSteps < 1 ? 'true' : 'false'}
                                                        onClick={() => handlePreviousClick(1)}
                                                    >
                                                        <i className="material-symbols-outlined border text-primary">person</i>
                                                        <span className="d-block step" aria-hidden="true">User Information</span>
                                                    </a>
                                                </li>

                                                <li className={`step2 ${currentStep === 2 ? 'active' : ''}`} id="contact">
                                                    <a
                                                        href="#/"
                                                        id="progress-form__tab-2"
                                                        className={`flex-1 px-0 pt-2 progress-form__tabs-item ${currentStep >= 2 ? 'active' : ''}`}
                                                        aria-controls="progress-form__panel-2"
                                                        aria-selected={currentStep === 2 ? 'true' : 'false'}
                                                        aria-disabled={completedSteps < 1 ? 'true' : 'false'}
                                                        onClick={() => completedSteps >= 1 && handlePreviousClick(2)}
                                                    >
                                                        <i className="material-symbols-outlined border text-danger">receipt_long</i>
                                                        <span className="d-block step" aria-hidden="true">Billing Information / Communication Address</span>
                                                    </a>
                                                </li>
                                                <li className={`step3 ${currentStep === 3 ? 'active' : ''}`} id="official">
                                                    <a
                                                        href="#"
                                                        id="progress-form__tab-3"
                                                        className={`flex-1 px-0 pt-2 progress-form__tabs-item ${currentStep >= 3 ? 'active' : ''}`}
                                                        aria-controls="progress-form__panel-3"
                                                        aria-selected={currentStep === 3 ? 'true' : 'false'}
                                                        aria-disabled={completedSteps < 1 ? 'true' : 'false'}
                                                        onClick={() => completedSteps >= 1 && handlePreviousClick(3)}
                                                    >
                                                        <i className="material-symbols-outlined border text-danger">request_quote</i>
                                                        <span className="d-block step" aria-hidden="true">OTP Verification</span>
                                                    </a>
                                                </li>

                                                {/* <li id="official" class="step3">
                                                                                    <a href="javascript:void(0);">
                                                                                        <i class="material-symbols-outlined  border text-success">
                                                                                            map
                                                                                        </i><span>Communication Address</span>
                                                                                    </a>
                                                                                </li>
                                                                                <li id="payment" class="step4">
                                                                                    <a href="javascript:void(0);">
                                                                                        <i class="material-symbols-outlined  border text-warning">
                                                                                            request_quote
                                                                                        </i><span>Payment Information</span>
                                                                                    </a>
                                                                                </li> */}
                                            </ul>
                                        </div>
                                        <div class="col-md-9">

                                            <form id="form-wizard3" className="text-start ps-4" onSubmit={handleSubmit(registerUser)}>
                                                <section role="tabpanel"
                                                    aria-labelledby="progress-form__tab-1" tabindex="0" id={`step${currentStep}`}
                                                    style={{
                                                        display:
                                                            currentStep === 1 && sussresp !== 201 ? "block" : "none",
                                                    }}>
                                                    <div className="form-card text-left">
                                                        <div className="row">
                                                            <div className="col-12">
                                                                <h4 className="mb-2 fw-500">User Information</h4>
                                                            </div>
                                                        </div>
                                                        <div className="row">
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label className="form-label" htmlFor="fname">First Name  <span style={{ color: "red" }} >*</span></label>
                                                                    <input type="text" class="form-control"
                                                                        name="first_name"
                                                                        id="first_name"
                                                                        placeholder="Enter First Name"
                                                                        {...register("first_name", {
                                                                            required: "First Name is required",
                                                                            pattern: onlyAlphabetsandSpaces,
                                                                            maxLength: MaxLengthValidation(100),
                                                                            // minLength: MinLengthValidation(6)
                                                                        })} />
                                                                    {errors.first_name && (
                                                                        <div
                                                                            style={{
                                                                                color: "red",
                                                                                fontSize: "14px",
                                                                                marginTop: "5px",
                                                                            }}
                                                                        >
                                                                            {errors.first_name.message}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label className="form-label" htmlFor="lastName">Last Name  <span style={{ color: "red" }} >*</span></label>
                                                                    <input class="form-control" type="text"
                                                                        name="last_name"
                                                                        id="last_name"
                                                                        placeholder="Enter Last Name"
                                                                        {...register("last_name", {
                                                                            required: "Last Name is required",
                                                                            pattern: onlyAlphabetsandSpaces,
                                                                            maxLength: MaxLengthValidation(100),
                                                                            // minLength: MinLengthValidation(6)
                                                                        })} />
                                                                    {errors.last_name && (
                                                                        <div
                                                                            style={{
                                                                                color: "red",
                                                                                fontSize: "14px",
                                                                                marginTop: "5px",
                                                                            }}
                                                                        >
                                                                            {errors.last_name.message}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label className="form-label" htmlFor="email">Email / Username <span style={{ color: "red" }}> *</span></label>
                                                                    <input
                                                                        type="email"
                                                                        className="form-control"
                                                                        name="email"
                                                                        id="email"
                                                                        placeholder="Enter Email / Username"
                                                                        {...register("email", {
                                                                            required: "Email is required",
                                                                            maxLength: MaxLengthValidation(150),
                                                                            minLength: MinLengthValidation(8),
                                                                            pattern: {
                                                                                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                                                                message: "Invalid email format",
                                                                            },
                                                                        })}
                                                                        onChange={async (e) => {
                                                                            const email = e.target.value;
                                                                            if (email) {
                                                                                try {
                                                                                    const response = await axios.get(api_url + "customer/exist_username/" + email + "/");
                                                                                    const error_code = response.data.error_code;
                                                                                    const response_message = response.data?.message;
                                                                                    if (error_code === 200) {
                                                                                        setError("email", {
                                                                                            type: "custom",
                                                                                            message: "Username already exists.",
                                                                                        });
                                                                                        setDisableAdd(true);
                                                                                    } else if (error_code === 203) {
                                                                                        clearErrors("email");
                                                                                        setError("email", {
                                                                                            type: "manual",
                                                                                            message: "Username available",
                                                                                        });
                                                                                        setDisableAdd(false);
                                                                                    } else {
                                                                                        clearErrors("email");
                                                                                        setDisableAdd(false);
                                                                                    }
                                                                                } catch (error) {
                                                                                    clearErrors("email");
                                                                                    setDisableAdd(false);
                                                                                }
                                                                            } else {
                                                                                clearErrors("email");
                                                                                setDisableAdd(false);
                                                                            }
                                                                        }}
                                                                        autoComplete="off"
                                                                    />
                                                                    {errors.email && errors.email.type !== 'manual' && (
                                                                        <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                                            {errors.email.message}
                                                                        </div>
                                                                    )}
                                                                    {errors.email?.type === 'manual' && (
                                                                        <div style={{ color: 'green', fontSize: '14px', marginTop: '5px' }}>
                                                                            {errors.email.message}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* <div className="col-md-4">
                                                                                                <div className="form-group">
                                                                                                    <label className="form-label" htmlFor="user_name">User Name  <span style={{ color: "red" }} >*</span></label>
                                                                                                    <input
                                                                                                        type="text"
                                                                                                        className="form-control"
                                                                                                        name="user_name"
                                                                                                        id="user_name"
                                                                                                        placeholder="Enter User Name"
                                                                                                        {...register("user_name", {
                                                                                                            required: "User Name is required",
                                                                                                            pattern: {
                                                                                                                value: /^[A-Za-z0-9_ ]+$/,
                                                                                                                message: "User Name can only contain letters, numbers, underscores, and spaces",
                                                                                                            },
                                                                                                            maxLength: MaxLengthValidation(100),
                                                                                                            // minLength: MinLengthValidation(6),
                                                                                                        })}
                                                                                                    />
                                
                                                                                                    {errors.user_name && errors.user_name.type !== 'manual' && (<div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>{errors.user_name.message}</div>)}
                                                                                                    {errors.user_name?.type === 'manual' && (
                                                                                                        <div style={{ color: 'green', fontSize: '14px', marginTop: '5px' }}>
                                                                                                            {errors.user_name.message}
                                                                                                        </div>
                                                                                                    )}
                                                                                                </div>
                                                                                            </div> */}
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label className="form-label" htmlFor="phone">Phone <span style={{ color: "red" }}> *</span></label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        placeholder="Enter Phone Number"
                                                                        id="phone"
                                                                        autoComplete="off" // This disables auto-fill
                                                                        maxLength="10"
                                                                        {...register("phone", {
                                                                            required: "Phone number is required",
                                                                            pattern: {
                                                                                value: /^[0-9]{10}$/,
                                                                                message: "Please enter a valid 10-digit phone number",
                                                                            },
                                                                        })}
                                                                    />
                                                                    {errors.phone && (
                                                                        <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                                                                            {errors.phone.message}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>


                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label className="form-label" htmlFor="password">Password  <span style={{ color: "red" }} >*</span></label>
                                                                    <div className="input-group">
                                                                        <input type={passwordType} className="form-control"
                                                                            name="password"
                                                                            id="password"
                                                                            placeholder="Enter Password"
                                                                            {...register("password", {
                                                                                required: "Password is required",
                                                                                maxLength: MaxLengthValidation(15),
                                                                                minLength: MinLengthValidation(6),
                                                                            })}
                                                                            autoComplete="new-password" />
                                                                        <span className="input-group-text" onClick={togglePassword} style={{ cursor: 'pointer' }}>
                                                                            {passwordType === "password" ? <FaEye /> : <FaEyeSlash />}
                                                                        </span>
                                                                    </div>
                                                                    {errors.password && (
                                                                        <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                                                                            {errors.password.message}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label className="form-label" htmlFor="confirm_password">Confirm Password  <span style={{ color: "red" }} >*</span></label>
                                                                    <div className="input-group">
                                                                        <input type={confirmPasswordType} className="form-control"
                                                                            name="confirm_password"
                                                                            id="confirm_password"
                                                                            placeholder="Re Enter Password"
                                                                            {...register("confirm_password", {
                                                                                required: "Confirm password is required",
                                                                                maxLength: MaxLengthValidation(15),
                                                                                minLength: MinLengthValidation(6),
                                                                            })}
                                                                            autoComplete="new-password" />
                                                                        <span className="input-group-text" onClick={toggleConfirmPassword} style={{ cursor: 'pointer' }}>
                                                                            {confirmPasswordType === "password" ? <FaEye /> : <FaEyeSlash />}
                                                                        </span>
                                                                    </div>
                                                                    {errors.confirm_password && (
                                                                        <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                                                                            {errors.confirm_password.message}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>


                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label className="form-label" htmlFor="companyName">Company Name  <span style={{ color: "red" }} >*</span></label>
                                                                    <input type="text" class="form-control"
                                                                        name="company_name"
                                                                        id="company_name"
                                                                        placeholder="Enter Company name"
                                                                        {...register("company_name", {
                                                                            required: "Company name is required",
                                                                            pattern: onlyAlphaNumericSpaces,
                                                                            maxLength: MaxLengthValidation(50),
                                                                            minLength: MinLengthValidation(1),
                                                                        })} />
                                                                    {errors.company_name && (
                                                                        <div
                                                                            style={{
                                                                                color: "red",
                                                                                fontSize: "14px",
                                                                                marginTop: "5px",
                                                                            }}
                                                                        >
                                                                            {errors.company_name.message}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {/* <div className="col-md-4">
                                                                                                <div className="form-group">
                                                                                                    <label className="form-label" htmlFor="company_logo">Company Logo</label>
                                                                                                    <input type="file" class="form-control"
                                                                                                        name="company_logo"
                                                                                                        id="company_logo"
                                                                                                        placeholder="Enter Company Logo"
                                                                                                        onChange={handleFileChange}
                                                                                                        {...register("company_logo", {
                                                                                                            // required: "Company Logo is required",
                                                                                                        })} />
                                                                                                    {errors.company_logo && (
                                                                                                        <div
                                                                                                            style={{
                                                                                                                color: "red",
                                                                                                                fontSize: "14px",
                                                                                                                marginTop: "5px",
                                                                                                            }}
                                                                                                        >
                                                                                                            {errors.company_logo.message}
                                                                                                        </div>
                                                                                                    )}
                                                                                                </div>
                                                                                            </div> */}
                                                            <div className="col-md-3">
                                                                <label className="form-label" htmlFor="companyLogo">Company Logo</label>
                                                                <input
                                                                    className="form-control mb-1"
                                                                    type="file"
                                                                    id="companyLogo"
                                                                    accept=".jpg, .jpeg, .png,.svg"
                                                                    {...register("file0", {
                                                                        validate: {
                                                                            validFormat: (value) => {
                                                                                if (!value.length) return true; // Skip validation if no file is selected
                                                                                const file = value[0];
                                                                                return /\.(jpe?g|png|svg)$/i.test(file.name) || 'Invalid file format. Please upload a JPEG, PNG, or other supported format.';
                                                                            },
                                                                            validSize: (value) => {
                                                                                if (!value.length) return true; // Skip validation if no file is selected
                                                                                return validateFileSize(value[0]) || 'File size should not be more than 20MB';
                                                                            },
                                                                        },
                                                                    })}
                                                                    onChange={(e) => handleFileChange(e, 0)}
                                                                />
                                                                {errors.file0 && (
                                                                    <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                                                                        {errors.file0.message}
                                                                    </div>
                                                                )}
                                                                {selectedFiles[0] && selectedFiles[0]?.file && (
                                                                    <Base64Preview
                                                                        base64Data={selectedFiles[0]?.file}
                                                                        filename={selectedFiles[0]?.file_name}
                                                                        filetype={selectedFiles[0]?.file_type}
                                                                    />
                                                                )}
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label className="form-label" htmlFor="website">Website  <span style={{ color: "red" }} >*</span></label>
                                                                    <input type="text" class="form-control"
                                                                        name="website"
                                                                        id="website"
                                                                        placeholder="Enter Website URL"
                                                                        {...register("website", {
                                                                            required: "Website is required",
                                                                            minLength: MinLengthValidation(10),
                                                                            maxLength: MaxLengthValidation(100)
                                                                        })} />
                                                                    {errors.website && (
                                                                        <div
                                                                            style={{
                                                                                color: "red",
                                                                                fontSize: "14px",
                                                                                marginTop: "5px",
                                                                            }}
                                                                        >
                                                                            {errors.website.message}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* <div className="col-md-4">
                                                                                                <div className="form-group">
                                                                                                    <label className="form-label" htmlFor="plan">Plan Name <span style={{ color: "red" }} >*</span></label>
                                
                                
                                                                                                    <select id="inputState" class="form-select"
                                                                                                        name="plan_id"
                                                                                                        {...register("plan_id", {
                                                                                                            required: "Plan is required",
                                                                                                        })}
                                
                                                                                                        autoComplete="off"
                                
                                                                                                    >
                                                                                                        <option value="">-- Select</option>
                                                                                                        {Array.isArray(planData) && planData.map((res, index) => (
                                                                                                            <option value={res.plan_name} key={index}>
                                                                                                                {res.plan_name}
                                                                                                            </option>
                                                                                                        ))}
                                
                                
                                                                                                    </select>
                                                                                                    {errors.plan_id && (
                                                                                                        <div
                                                                                                            style={{
                                                                                                                color: "red",
                                                                                                                fontSize: "14px",
                                                                                                                marginTop: "5px",
                                                                                                            }}
                                                                                                        >
                                                                                                            {errors.plan_id.message}
                                                                                                        </div>
                                                                                                    )}
                                
                                                                                                </div>
                                                                                            </div> */}

                                                            <h5 className="mb-2 text-warning">CEO Information</h5>

                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label className="form-label" htmlFor="ceoName">CEO Name
                                                                        {/* <span style={{ color: "red" }} >*</span> */}
                                                                    </label>
                                                                    <input type="text" class="form-control"
                                                                        name="ceo_name"
                                                                        id="ceo_name"
                                                                        placeholder="Enter Ceo Name"
                                                                        {...register("ceo_name", {
                                                                            required: "Ceo Name is required",
                                                                            pattern: onlyAlphabetsandSpaces,
                                                                            maxLength: MaxLengthValidation(100),
                                                                            // minLength: MinLengthValidation(6)
                                                                        })} />
                                                                    {errors.ceo_name && (
                                                                        <div
                                                                            style={{
                                                                                color: "red",
                                                                                fontSize: "14px",
                                                                                marginTop: "5px",
                                                                            }}
                                                                        >
                                                                            {errors.ceo_name.message}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label className="form-label" htmlFor="ceoEmail">CEO Email
                                                                        {/* <span style={{ color: "red" }} >*</span> */}
                                                                    </label>

                                                                    <input type="ceo_mail" class="form-control"
                                                                        name="ceo_mail"
                                                                        id="ceo_mail"
                                                                        placeholder="Enter Ceo Email"
                                                                        {...register("ceo_mail", {
                                                                            required: "Ceo mail is required",
                                                                            maxLength: MaxLengthValidation(150),
                                                                            minLength: MinLengthValidation(8),
                                                                            pattern: {
                                                                                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                                                                message: "Invalid Ceo email format",
                                                                            },
                                                                        })}
                                                                        autocomplete="off" />
                                                                    {errors.ceo_mail && errors.ceo_mail.type !== 'manual' && (<div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>{errors.ceo_mail.message}</div>)}
                                                                    {errors.ceo_mail?.type === 'manual' && (
                                                                        <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                                            {errors.ceo_mail.message}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label className="form-label" htmlFor="ceo_phone">CEO Contact
                                                                        {/* <span style={{ color: "red" }}> *</span> */}
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        placeholder="Enter Phone number"
                                                                        id="ceo_phone"
                                                                        maxLength="10"
                                                                        onInput={(e) => {
                                                                            // This ensures that only 10 digits can be entered
                                                                            e.target.value = e.target.value.slice(0, 10);
                                                                        }}
                                                                        {...register("ceo_phone", {
                                                                            required: "Phone number is required",
                                                                            pattern: {
                                                                                value: /^[0-9]{10}$/,
                                                                                message: "Please enter a valid 10-digit phone number",
                                                                            },
                                                                        })}
                                                                    />
                                                                    {errors.ceo_phone && (
                                                                        <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                                                                            {errors.ceo_phone.message}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                        </div>
                                                    </div>
                                                    {currentStep < 3 && (
                                                        <button type="button" class="btn btn-primary p-2 mt-3 px-5 float-end"
                                                            data-action="next"
                                                            onClick={handleNextClick}>Next </button>
                                                    )}

                                                    {/* <button
                                                                                        id="submit"
                                                                                        type="button"
                                                                                        name="next"
                                                                                        className="btn btn-primary next action-button float-end px-5 mt-3"
                                                                                        onClick={handleSubmit(onSubmit)}
                                                                                    >
                                                                                        Next
                                                                                    </button> */}
                                                </section>

                                                <section id={`step${currentStep}`} role="tabpanel"
                                                    aria-labelledby="progress-form__tab-2" tabindex="0" style={{
                                                        display:
                                                            currentStep === 2 && sussresp !== 201 ? "block" : "none",
                                                    }}>
                                                    <div className="form-card text-left">
                                                        <div className="row">
                                                            <div className="col-12">
                                                                <h4 className="mb-3 fw-500">Billing Information</h4>
                                                            </div>
                                                        </div>
                                                        <div className="row">
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label className="form-label" htmlFor="address">Address  <span style={{ color: "red" }} >*</span></label>
                                                                    <input type="text" class="form-control"
                                                                        name="address"
                                                                        id="address"
                                                                        placeholder="Enter Address"
                                                                        {...register("address", {
                                                                            required: "Address is required",
                                                                        })}
                                                                        disabled={sameAddress}
                                                                    />
                                                                    {errors.address && (
                                                                        <div
                                                                            style={{
                                                                                color: "red",
                                                                                fontSize: "14px",
                                                                                marginTop: "5px",
                                                                            }}
                                                                        >
                                                                            {errors.address.message}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label className="form-label" htmlFor="city">City  <span style={{ color: "red" }} >*</span></label>
                                                                    <input type="text" class="form-control"
                                                                        name="city"
                                                                        id="city"
                                                                        placeholder="Enter City"
                                                                        {...register("city", {
                                                                            required: "City is required",
                                                                        })}
                                                                        disabled={sameAddress}
                                                                    />
                                                                    {errors.city && (
                                                                        <div
                                                                            style={{
                                                                                color: "red",
                                                                                fontSize: "14px",
                                                                                marginTop: "5px",
                                                                            }}
                                                                        >
                                                                            {errors.city.message}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label className="form-label" htmlFor="country">Country  <span style={{ color: "red" }} >*</span></label>
                                                                    <select id="inputState" class="form-select"
                                                                        name="country"
                                                                        {...register("country", {
                                                                            required: "Country is required",
                                                                        })}
                                                                        onChange={(e) => {
                                                                            setSelectedCountryCode(e.target.value);
                                                                            fetchStatesData(e.target.value);
                                                                            setValue('state', '')
                                                                        }} autoComplete="off">
                                                                        <option value="">-- Select</option>
                                                                        {countryData.map((item, index) => (
                                                                            <option value={item.country_code_char2}>
                                                                                {item.country_name}
                                                                            </option>
                                                                        ))}
                                                                        {/* <option value="" disabled>Select Country</option>
                                                                                                        <option>Andhra Pradesh</option>
                                                                                                        <option>Arunachal Pradesh</option>
                                                                                                        <option>Andaman and Nicobar Islands</option> */}

                                                                    </select>
                                                                    {errors.country && (
                                                                        <div
                                                                            style={{
                                                                                color: "red",
                                                                                fontSize: "14px",
                                                                                marginTop: "5px",
                                                                            }}
                                                                        >
                                                                            {errors.country.message}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label className="form-label" htmlFor="state">State  <span style={{ color: "red" }} >*</span></label>
                                                                    <select id="inputState" class="form-select"
                                                                        name="state"
                                                                        {...register("state", {
                                                                            required: "State is required",
                                                                        })} autoComplete="off"
                                                                    >
                                                                        <option value="">Select</option>
                                                                        {filteredStates.map((item, index) => (
                                                                            <option value={item.state_subdivision_name}>
                                                                                {item.state_subdivision_name}
                                                                            </option>
                                                                        ))}

                                                                        {/* <option value="" disabled>Select Country</option>
                                                                                                        <option>Andhra Pradesh</option>
                                                                                                        <option>Arunachal Pradesh</option>
                                                                                                        <option>Andaman and Nicobar Islands</option> */}


                                                                    </select>
                                                                    {errors.state && (
                                                                        <div
                                                                            style={{
                                                                                color: "red",
                                                                                fontSize: "14px",
                                                                                marginTop: "5px",
                                                                            }}
                                                                        >
                                                                            {errors.state.message}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label className="form-label" htmlFor="zipCode">Zip Code  <span style={{ color: "red" }} >*</span></label>
                                                                    <input type="text" class="form-control" style={{ position: 'relative' }}
                                                                        name="zipcode"
                                                                        id="zipcode"
                                                                        placeholder="Enter Zip Code"
                                                                        {...register("zipcode", {
                                                                            required: "Zip Code is required",
                                                                            pattern: onlyNumbers,
                                                                            minLength: MinLengthValidation(4),
                                                                            maxLength: MaxLengthValidation(10)
                                                                        })}
                                                                    />
                                                                    {errors.zipcode && (
                                                                        <div
                                                                            style={{
                                                                                color: "red",
                                                                                fontSize: "14px",
                                                                                // marginTop: "5px",
                                                                                position: 'absolute'
                                                                            }}
                                                                        >
                                                                            {errors.zipcode.message}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="row">
                                                                <div className="col-12">
                                                                    <h4 className="mb-3 fw-500">Communication Address</h4>
                                                                </div>
                                                                <div className="col-md-12">
                                                                    <div className="form-group">
                                                                        <div className="form-check">
                                                                            {/* <input
                                                                                                            className="form-check-input"
                                                                                                            type="checkbox"
                                                                                                            id="sameAsBilling"
                                                                                                            {...register("fname", {
                                                                                                                required: "First Name is required",
                                                                                                                pattern: {
                                                                                                                    value: /^[a-zA-Z0-9]*$/,
                                                                                                                    message: 'Please enter only numbers and alphabets',
                                                                                                                }
                                                                                                            })} /> */}

                                                                            {/* <label className="form-check-label fw-500" htmlFor="sameAsBilling">
                                                                                                            Same as Billing Address Information
                                                                                                        </label> */}

                                                                            <span className="d-flex align-items-center mb-2"
                                                                                style={{ color: "#000", textAlign: "center" }}>
                                                                                <input
                                                                                    type="checkbox"
                                                                                    className="ms-2"
                                                                                    onChange={handleSameAddressChange}
                                                                                    checked={
                                                                                        sameAddress ? sameAddress : false
                                                                                    }
                                                                                />&nbsp;
                                                                                Same as my billing information

                                                                            </span>


                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <div className="form-group">
                                                                        <label className="form-label" htmlFor="address">Address  <span style={{ color: "red" }} >*</span></label>
                                                                        <input type="text" class="form-control"
                                                                            name="cust_address"
                                                                            id="cust_address"
                                                                            placeholder="Enter Address"
                                                                            {...register("cust_address", {
                                                                                required: "Address is required",
                                                                            })}
                                                                            disabled={sameAddress}
                                                                        />
                                                                        {errors.cust_address && (
                                                                            <div
                                                                                style={{
                                                                                    color: "red",
                                                                                    fontSize: "14px",
                                                                                    marginTop: "5px",
                                                                                }}
                                                                            >
                                                                                {errors.cust_address.message}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <div className="form-group">
                                                                        <label className="form-label" htmlFor="city">City  <span style={{ color: "red" }} >*</span></label>
                                                                        <input type="text" class="form-control"
                                                                            name="cust_city"
                                                                            id="cust_city"
                                                                            placeholder="Enter City"
                                                                            {...register("cust_city", {
                                                                                required: "City is required",
                                                                            })}
                                                                            disabled={sameAddress}
                                                                        />
                                                                        {errors.cust_city && (
                                                                            <div
                                                                                style={{
                                                                                    color: "red",
                                                                                    fontSize: "14px",
                                                                                    marginTop: "5px",
                                                                                }}
                                                                            >
                                                                                {errors.cust_city.message}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <div className="form-group">
                                                                        <label className="form-label" htmlFor="country">Country  <span style={{ color: "red" }} >*</span></label>
                                                                        <select id="inputState" class="form-select"
                                                                            name="cust_country"
                                                                            {...register("cust_country", {
                                                                                required: "Country is required",
                                                                            })}
                                                                            onChange={(e) => {
                                                                                setSelectedCountryCodeCust(e.target.value);
                                                                                fetchStatesDataCust(e.target.value);
                                                                                setValue('cust_state', '')
                                                                            }}
                                                                            autoComplete="off"
                                                                            disabled={sameAddress}
                                                                        >
                                                                            <option value="">-- Select</option>
                                                                            {countryData.map((item, index) => (
                                                                                <option value={item.country_code_char2}>
                                                                                    {item.country_name}
                                                                                </option>
                                                                            ))}

                                                                            {/* <option value="" disabled>Select Country</option>
                                                                                                        <option>Andhra Pradesh</option>
                                                                                                        <option>Arunachal Pradesh</option>
                                                                                                        <option>Andaman and Nicobar Islands</option> */}
                                                                        </select>
                                                                        {errors.cust_country && (
                                                                            <div
                                                                                style={{
                                                                                    color: "red",
                                                                                    fontSize: "14px",
                                                                                    marginTop: "5px",
                                                                                }}
                                                                            >
                                                                                {errors.cust_country.message}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <div className="form-group">
                                                                        <label className="form-label" htmlFor="state">State  <span style={{ color: "red" }} >*</span></label>
                                                                        {sameAddress ? (
                                                                            <input
                                                                                type="text"
                                                                                class="form-control"
                                                                                name="cust_state"
                                                                                {...register("cust_state")}
                                                                                disabled={sameAddress}
                                                                            />
                                                                        ) : (
                                                                            <select id="inputState" class="form-select"
                                                                                name="cust_state"
                                                                                {...register("cust_state", {
                                                                                    required: "State is required",
                                                                                })}
                                                                                autoComplete="off"
                                                                            >
                                                                                <option value="">Select</option>
                                                                                {filteredStatesCust.map((item, index) => (
                                                                                    <option value={item.state_subdivision_name}>
                                                                                        {item.state_subdivision_name}
                                                                                    </option>
                                                                                ))}

                                                                                {/* <option value="" disabled>Select Country</option>
                                                                                                        <option>Andhra Pradesh</option>
                                                                                                        <option>Arunachal Pradesh</option>
                                                                                                        <option>Andaman and Nicobar Islands</option> */}
                                                                            </select>)}
                                                                        {errors.cust_state && (
                                                                            <div
                                                                                style={{
                                                                                    color: "red",
                                                                                    fontSize: "14px",
                                                                                    marginTop: "5px",
                                                                                }}
                                                                            >
                                                                                {errors.cust_state.message}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <div className="form-group">
                                                                        <label className="form-label" htmlFor="zipCode">Zip Code  <span style={{ color: "red" }} >*</span></label>
                                                                        <input type="text" class="form-control" style={{ position: 'relative' }}
                                                                            name="cust_zipcode"
                                                                            id="cust_zipcode"
                                                                            placeholder="Enter Zip Code"
                                                                            {...register("cust_zipcode", {
                                                                                required: "Zip Code is required",
                                                                                pattern: onlyNumbers,
                                                                                minLength: MinLengthValidation(4),
                                                                                maxLength: MaxLengthValidation(10)
                                                                            })}
                                                                            disabled={sameAddress}
                                                                        />
                                                                        {errors.cust_zipcode && (
                                                                            <div
                                                                                style={{
                                                                                    color: "red",
                                                                                    fontSize: "14px",
                                                                                    position: 'absolute'
                                                                                }}
                                                                            >
                                                                                {errors.cust_zipcode.message}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                            </div>
                                                        </div>
                                                        <div className="row mt-4">
                                                            <div className="col-12 text-end">
                                                                {/* {currentStep < 3 && (
                                                                                                <button type="button" class="btn btn-primary p-2 mt-3 px-5 float-end"
                                                                                                data-action="next"
                                                                                                onClick={handleNextClick}>Next </button>
                                                                                            )} */}

                                                                {currentStep < 3 && (
                                                                    <button type="submit" class="btn btn-primary p-2 mt-3 px-5   float-end"
                                                                    >Submit </button>
                                                                )}

                                                            </div>
                                                        </div>
                                                    </div>
                                                </section>
                                            </form>
                                            <form
                                            // onSubmit={handleSubmit2(otpVerify)}
                                            >
                                                {/* <!-- Step 3 --> */}
                                                <section id="progress-form__Otp_verify" style={{
                                                    display:
                                                        sussresp === 201 && otpverified != 200 ? "block" : "none",
                                                }}>

                                                    <div className="card card-custom p-2 text-center">
                                                        <h6>Please enter the Code to verify your account</h6>
                                                        <div>
                                                            <span>A code has been sent to</span> <small>{emailid}</small>
                                                        </div>
                                                        <div
                                                            id="otp"
                                                            className="inputs d-flex flex-row justify-content-center mt-2"
                                                        >
                                                            {[...Array(6)].map((_, index) => (
                                                                <input
                                                                    key={index}
                                                                    className="m-2 text-center form-control rounded otp-form"
                                                                    type="text"
                                                                    maxLength="1"
                                                                    value={otp[index]}
                                                                    onChange={(e) => handleInputChange(index, e.target.value)}
                                                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                                                    ref={(el) => (otpInputsRef.current[index] = el)}
                                                                />
                                                            ))}
                                                        </div>
                                                        {errorOTP && <p className="text-danger">{errorOTP}</p>}
                                                        <div className="mt-4 d-flex justify-content-center gap-3">
                                                            <button
                                                                className="btn btn-primary px-4 validate"
                                                                style={{
                                                                    minWidth: '120px',
                                                                    fontWeight: '500',
                                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                                    transition: 'all 0.3s ease'
                                                                }}
                                                                onClick={otpVerify}
                                                            >
                                                                Validate
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-primary px-4"

                                                                style={{
                                                                    minWidth: '120px',
                                                                    fontWeight: '500',
                                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                                    transition: 'all 0.3s ease'
                                                                }}

                                                                onClick={handleResendOtp}
                                                            >
                                                                Resend OTP
                                                            </button>
                                                        </div>
                                                    </div>
                                                </section>
                                            </form>

                                            <section id="progress-form__thank-you" style={{ display: otpverified === 200 ? "block" : "none" }}>
                                                <h2
                                                    className="mb-3 thank-h3"
                                                    style={{
                                                        color: "#000053",
                                                        fontSize: "32px",
                                                        marginBottom: "20px",
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    Thank you for your registration with
                                                    <br />
                                                    Vitel Global Communications LLC!
                                                </h2>

                                                <p
                                                    className="thank-p"
                                                    style={{
                                                        color: "#000",
                                                        fontSize: "18px",
                                                        textAlign: "center",
                                                        lineHeight: "1.556",
                                                    }}
                                                >
                                                    Your account has been successfully created and is currently in the final review phase.Once the activation process has been completed will reach out to you. <br />
                                                    We truly appreciate your interest and support. Should you have any questions or need assistance, please don't hesitate to reach out to us.
                                                </p>

                                                <p className="thank-p" style={{ color: "#000", textAlign: "center" }}>
                                                    <b style={{ fontSize: '18px' }}>
                                                        Best regards, <br />
                                                        The Vitel Support Team <br />
                                                        {" "}

                                                        <a
                                                            href="mailto:support@vitelglobal.com?subject=Reg:%20Vitel%20Meet"
                                                            style={{ textDecoration: 'underline', fontSize: '18px' }}
                                                            title="support@vitelglobal.com"
                                                        >
                                                            <span
                                                                className="material-symbols-outlined"
                                                                style={{
                                                                    background: '#10238f',
                                                                    padding: '5px',
                                                                    borderRadius: '100%',
                                                                    color: '#fff',
                                                                    fontSize: '18px',
                                                                }}
                                                            >
                                                                mail
                                                            </span>

                                                            <span style={{ marginLeft: '7px' }}>support@vitelglobal.com</span>
                                                        </a>
                                                        <br />
                                                        <a
                                                            href="tel:+17324443132"
                                                            style={{
                                                                // textDecoration: 'underline',
                                                                color: 'inherit',
                                                                display: 'flex',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                marginTop: '8px',
                                                            }}
                                                            title="+1 732-444-3132"
                                                        >
                                                            <span
                                                                className="material-symbols-outlined"
                                                                style={{
                                                                    background: '#10238f',
                                                                    padding: '5px',
                                                                    borderRadius: '100%',
                                                                    color: '#fff',
                                                                    fontSize: '18px',
                                                                }}
                                                            >
                                                                phone_in_talk
                                                            </span>
                                                            <span style={{ marginLeft: '7px' }}>+1 732-444-3132</span>
                                                        </a>
                                                    </b>
                                                </p>


                                                {/* <p className="thank-p text-center text-dark">
                                                    <Link to="/login" className="fw-medium text-primary text-decoration-underline">
                                                        Ready to begin?
                                                    </Link>{" "}
                                                    Log in to explore the amazing features that await you.
                                                </p> */}
                                            </section>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );


}

const backButtonStyle = {
    position: 'absolute',
    top: '30px',
    left: '20px',
    padding: '7px 14px',
    backgroundColor: '#10238f',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    zIndex: 1000,
};
