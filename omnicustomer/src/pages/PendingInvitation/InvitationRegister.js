import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { triggerAlert } from '../../utils/CommonFunctions';
import PageTitle from '../../common/PageTitle'
import { onlyAlphabetsandSpaces, MinLengthValidation, MaxLengthValidation } from '../../utils/Constants'
import { Invitation_RegisterUser, captchrefresh } from '../../utils/ApiClient';
import SpinnerLoader from '../../common/components/SpinnerLoader';
import MetaTitle from '../../common/MetaTitle';

export default function InvitationRegister() {
  const api_url = process.env.REACT_APP_API_BASE_URL;
  const [data, setData] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [passwordType, setPasswordType] = useState("password");
  const [emailid, setEmail] = useState("");
  const [disableAdd, setDisableAdd] = useState(null);
  // Get the current URL
  const currentUrl = new URL(window.location.href);
  const [captchaUrl, setCaptchaUrl] = useState("");
  const [isCaptchaValid, setIsCaptchaValid] = useState("");
  const [userCaptchaInput, setUserCaptchaInput] = useState("");
  const [passwordError, setPasswordError] = useState(true);
  // Get the token from the query parameters
  const token = currentUrl.searchParams.get("token");
  // const token = 'gAAAAABmzuugbWUVYQJADgWWkx5pN2QnCnWScdfB05hCMZDjIy2hPVfpbj_tvVLzPTBD-J5yEFeiYqy3YbLh2Mt1H1ub8_GPUmKPc433Hhm18lVONsX6JBctQMUdemywegcylnJyIUBW9rv8y_1K8eujPOfC2wVToHTTylgfHstxlY-pgs0fAeKwLqMhdkw-m1zs2InaePEn1Hqiabc3sdZhRDmbuOyk02MXcbBns7OhMqZVe0JsB4wXlAt4AbkVJlpl1xX3ayeG5fekJoG82nmehl1sqh8QTQ==';

  const navigate = useNavigate();
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





  useEffect(() => {
    async function fetchData() {
      try {
        // Replace 'YOUR_API_ENDPOINT' with the actual API endpoint you want to call
        const response = await axios.post(
          api_url + "subusers/sub_user_invitation_verify/",
          "",
          {
            headers: {
              Authorization: token,
            },
          }
        );
        const response_data = response.data;
        if (response_data.error_code === 200) {

          const user_email = response_data.results.user_email;
          setIsLoading(true);
          setData(user_email);
          refreshCaptcha();
        } else {
          // Handle errors if the API call is not successful
          triggerAlert("error", "Oops...", "API request failed");
          setIsLoading(false);
        }
      } catch (error) {
        const response_data = error?.response?.data;
        if (response_data?.error_code === 400) {
          triggerAlert("success", "Success", response_data.message);
          setTimeout(() => {
            navigate('/login'); // Redirect to login page after success popup
          }, 2000);
          setIsLoading(false);
          triggerAlert('error', 'Oops...', response_data?.message);
        } else {
          setIsLoading(false);
          triggerAlert('error', 'Oops...', error.message);
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);


  const refreshCaptcha = async (api_input) => {

    try {
      const response = await captchrefresh(api_input);

      if (response.status === 200) {
        const data = await response.data;

        // Set the CAPTCHA text
        setIsCaptchaValid(data.captcha_text);

        // Set the CAPTCHA image by creating a data URL
        setCaptchaUrl(`data:image/png;base64, ${data.image_data}`);
      }
    } catch (error) {
      console.error(error);

    }
  };

  const InvitationSubmit = async (data) => {

    const api_data = {};
    if (data["password"] === data["confirm_password"]) {
      setPasswordError(true);
      if (isCaptchaValid == userCaptchaInput) {
        setIsLoading(true);
        try {
          const params = {
            user_email: data["user_email"],
            name: data["name"],
            phone_no: data["phone"],
            password: data["password"],
          };

          const response = await axios.post(
            api_url + "subusers/sub_user_registration/",
            params,
            {
              headers: {
                Authorization: token,
              },
            }
          );
          const response_data = response.data;
          // console.log('response_data', response_data); 
          if (response_data.error_code === 200) {
            setIsLoading(false);
            triggerAlert("success", "Success", response_data.message);
            setTimeout(() => {
              navigate('/login'); // Redirect to login page after success popup
            }, 2000);
          } else {
            setIsLoading(false);
            triggerAlert("error", "Oops...", "Invalid Register..");
          }
        } catch (error) {
          setIsLoading(false);
          triggerAlert("error", "Oops...", "Invalid Register..");
        }
      } else {
        //console.log('Captcha is invalid. Please try again.');
        triggerAlert("error", "Oops...", "Captcha is invalid..");
      }
    } else {
      setPasswordError(false);

      triggerAlert(
        "error",
        "Oops...",
        "Password and Confirm Password doesnot match"
      );
    }
    return false;
  };


  const handleSubmitClick = async () => {

    const values = getValues();
    let hasError = 0;


    const name = values.name?.trim();
    const last_name = values.last_name?.trim();
    //   const user_name = values.user_name?.trim();
    const website = values.website?.trim();
    const company_name = values.company_name?.trim();
    const phone = values.phone?.trim();




    if (!values.name) {
      clearErrors('name')
      hasError++;
      setError("name", {
        type: "manual",
        message: "Name is required",
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
        message: "Phone number must be between 10 and 11 digits",
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

  };
  const props = {
    title: " Invitation Register | Social media Sync ",
    description: "Premium Multipurpose Admin & Dashboard Template"
  }

  return (
    <>
      <MetaTitle {...props} />
      {isLoading &&
        <div className='loader-overlay text-white'>
          <SpinnerLoader />
        </div>}
      {data ? (
        <section className="fxt-template-animation fxt-template-layout4 loaded">
          <div class="preloader preloader-dark" style={{ display: "none" }}>
            <div class="lds-ellipsis" style={{ display: "none" }}>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>

          <div id="main-wrapper" class="oxyy-login-register bg-d" style={{ background: "whitesmoke" }}>
            <div class="container">
              <div class="row g-0 min-vh-100 py-4 py-md-5">
                <div class="col-lg-7 shadow-lg">
                  <img src="/assets/images/login-bg.png" class="img-fluid rounded-left-3" />
                </div>
                <div data-bs-theme="dark" class="col-lg-5 shadow-lg d-flex align-items-center bg-white ">
                  <div class="container my-auto py-5">
                    <div class="row">
                      <div class="col-11 col-lg-10 mx-auto">
                        <div class="row g-0">
                          <div class="text-center mb-5">
                            <a href=" " title=" ">
                              <img src="/assets/images/logo.svg" alt="Oxyy" width="300" />
                            </a>
                          </div>



                        </div>
                        <h3 class="  text-center mb-4 fw-bold text-primary">Register into your account</h3>
                        <form id="loginForm" class="form-dark row" method="post" onSubmit={handleSubmit(InvitationSubmit)}>
                          {/* <div class="mb-3 col-md-6"> */}
                          <div class="mb-3">
                            <label class="form-label  " for="emailAddress">Email address</label>
                            <input type="user_email" class="form-control"
                              name="user_email"
                              id="user_email"
                              value={data}
                              placeholder="test@gmail.com"
                              {...register("user_email", {
                                required: "Mail is required",
                                maxLength: MaxLengthValidation(150),
                                minLength: MinLengthValidation(8),
                                pattern: {
                                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                  message: "Invalid  email format",
                                },
                              })}
                              autocomplete="off" />
                            {errors.user_email && errors.user_email.type !== 'manual' && (<div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>{errors.user_email.message}</div>)}
                            {errors.user_email?.type === 'manual' && (
                              <div style={{ color: 'green', fontSize: '14px', marginTop: '5px' }}>
                                {errors.user_email.message}
                              </div>
                            )}
                          </div>
                          <div class="mb-3">
                            <label class="form-label  " for="emailAddress">Name</label>
                            <input type="text" class="form-control"
                              name="name"
                              id="name"
                              placeholder="Enter Name"
                              {...register("name", {
                                required: "Name is required",
                                pattern: onlyAlphabetsandSpaces,
                                maxLength: MaxLengthValidation(100),
                                // minLength: MinLengthValidation(6)
                              })} />
                            {errors.name && (
                              <div
                                style={{
                                  color: "red",
                                  fontSize: "14px",
                                  marginTop: "5px",
                                }}
                              >
                                {errors.name.message}
                              </div>
                            )}
                          </div>
                          {/* <div class="mb-3 col-md-6">
                                                <label class="form-label  " for="emailAddress">Last name</label>
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
                                            </div> */}
                          <div class="mb-3">
                            <label class="form-label  " for="Phone">Phone</label>
                            <input
                              type="text"
                              className="form-control"
                              id="phone"
                              {...register("phone", {
                                required: "Phone number is required",
                                //     maxLength: MaxLengthValidation(15),
                                // minLength: MinLengthValidation(10),
                                pattern: {
                                  value: /^[0-9]+$/,
                                  message: 'Please enter a valid phone number',
                                }
                              })}
                            />
                            {errors.phone && (
                              <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                                {errors.phone.message}
                              </div>
                            )}
                          </div>

                          <div class="mb-3">
                            <label class="form-label  " for="loginPassword">Password</label>
                            <input type="password" class="form-control"
                              name="password"
                              id="password"
                              placeholder="Enter Password"
                              {...register("password", {
                                required: "Password is required",
                                maxLength: MaxLengthValidation(15),
                                minLength: MinLengthValidation(6),
                                // pattern: {
                                //   value: /^[a-zA-Z0-9@%+-]+$/,
                                //   message: 'Password should contain numbers, alphabets or special symbols like @+-%',
                                // },
                              })}
                              autocomplete="new-password" />
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
                          <div class="mb-3">
                            <label class="form-label  " for="loginPassword">Confirm password</label>
                            <input type="password" class="form-control"
                              name="confirm_password"
                              id="confirm_password"
                              placeholder="Re Enter Password"
                              {...register("confirm_password", {
                                required: "Confirm password is required",
                                maxLength: MaxLengthValidation(15),
                                minLength: MinLengthValidation(6),
                                // pattern: {
                                //   value: /^[a-zA-Z0-9@%+-]+$/,
                                //   message: 'Confirm Password should contain numbers, alphabets or special symbols like @+-%',
                                // },
                              })}
                              autocomplete="new-password" />
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
                          <div className="col-xs-12">
                            <div className="d-flex mb-5">
                              <div className="col-xs-12">
                                <input
                                  type="text"
                                  className="form-control"
                                  id="username"
                                  placeholder="Verification Code"
                                  value={userCaptchaInput}
                                  onChange={(e) =>
                                    setUserCaptchaInput(e.target.value)
                                  }
                                />
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
                                {/* <i style={{ color: '#00CA00', fontSize: '20px', cursor: 'pointer' }} className="fas fa-refresh" onClick={refreshCaptcha}></i> */}
                              </div>
                              <span
                                className="mx-3 mt-1"
                                id="refreshimage"
                                onClick={refreshCaptcha}
                              >
                                <svg
                                  onClick={refreshCaptcha}
                                  className="icon ms-2"
                                  height="30"
                                  viewBox="0 0 24 24"
                                  width="30"
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

                          <div class="d-grid my-5">
                            <button class="btn btn-warning fw-bold" type="submit" onClick={handleSubmitClick}>Sign Up</button>
                          </div>
                        </form>


                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        // <div>Error fetching data.</div>
        <div></div>
      )}




    </>
  )
}
