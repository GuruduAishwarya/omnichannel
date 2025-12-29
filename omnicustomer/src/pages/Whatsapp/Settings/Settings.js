import React, { useEffect, useState } from 'react';
import PageTitle from '../../../common/PageTitle';
import Loader from '../../../common/components/Loader';
import { triggerAlert } from '../../../utils/CommonFunctions';
import { useForm } from 'react-hook-form';
import { FetchSettingData, UpdateSetting } from '../../../utils/ApiClient';
import { onlyNumbers } from '../../../utils/Constants';
import { getOnlyToken, getWToken } from '../../../utils/CommonFunctions';


export default function Setting() {

    const token = getOnlyToken();
    const wtoken = getWToken(); // Assuming this is how you fetch the second token


    const mainToken = wtoken ? wtoken : token;
    console.log("✅ WhatsApp Registration Successssssss:", mainToken);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [formData, setFormData] = useState({
        transactional_input1: '',
        transactional_input2: '',
        transactional_input3: '',
        promotional_input1: '',
        promotional_input2: '',
        promotional_input3: '',
        chatbot_input1: '',
        chatbot_input2: '',
        chatbot_input3: '',
        access_token: '',
        appid: '',
        version: ''
    });

    const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit, formState: { errors: errorsEdit }, setValue: setValueEdit, watch } = useForm({
        defaultValues: formData
    });

    const [syncPromotionalTransactional, setSyncPromotionalTransactional] = useState(false);
    const [syncChatbotTransactional, setSyncChatbotTransactional] = useState(false);

    const [sessionInfo, setSessionInfo] = useState({});
    const [sdkResponse, setSdkResponse] = useState({});
    const [backendResponse, setBackendResponse] = useState({});

    const formValues = watch();

    useEffect(() => {
        if (isEditMode) {
            setFormData(formValues);
        }
    }, [formValues, isEditMode]);

    const toggleEditMode = () => {
        if (isEditMode) {
            resetEdit(formData);
        }
        setIsEditMode(!isEditMode);
    };

    const handleUpdate = async (data) => {
        setIsUpdating(true);
        try {
            const api_input = {
                wa_permanent_access_token: data.access_token,
                wa_app_id: data.appid,
                wa_version: data.version,
                phone_number_id: data.transactional_input1,
                waba_id: data.transactional_input2,
                bussiness_number: data.transactional_input3,
                promotional_number: data.promotional_input3,
                promo_waba_id: data.promotional_input2,
                promo_phone_number_id: data.promotional_input1,
                chatbot_number: data.chatbot_input3,
                chatbot_waba_id: data.chatbot_input2,
                chatbot_phone_number_id: data.chatbot_input1
            };
            const response = await UpdateSetting(api_input);
            if (response.data.error_code === 200) {
                triggerAlert('success', 'Success', 'Updated successfully!');
                await FetchData();
                setIsEditMode(false);
            }
        } catch (error) {
            triggerAlert('error', 'Error', "Something went wrong!");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCheckboxChangePromotional = () => {
        const isChecked = !syncPromotionalTransactional;
        setSyncPromotionalTransactional(isChecked);
        if (isChecked) {
            setValueEdit('promotional_input1', formValues.transactional_input1);
            setValueEdit('promotional_input2', formValues.transactional_input2);
            setValueEdit('promotional_input3', formValues.transactional_input3);
        } else {
            setValueEdit('promotional_input1', '');
            setValueEdit('promotional_input2', '');
            setValueEdit('promotional_input3', '');
        }
    };

    const handleCheckboxChangeChatbot = () => {
        const isChecked = !syncChatbotTransactional;
        setSyncChatbotTransactional(isChecked);
        if (isChecked) {
            setValueEdit('chatbot_input1', formValues.transactional_input1);
            setValueEdit('chatbot_input2', formValues.transactional_input2);
            setValueEdit('chatbot_input3', formValues.transactional_input3);
        } else {
            setValueEdit('chatbot_input1', '');
            setValueEdit('chatbot_input2', '');
            setValueEdit('chatbot_input3', '');
        }
    };

    const FetchData = async () => {
        setIsLoading(true);
        try {
            const response = await FetchSettingData();
            if (response.data.error_code === 200) {
                const {
                    phone_number_id,
                    waba_id,
                    bussiness_number,
                    promo_phone_number_id,
                    promo_waba_id,
                    promotional_number,
                    chatbot_phone_number_id,
                    chatbot_waba_id,
                    chatbot_number,
                    wa_permanent_access_token,
                    wa_app_id,
                    wa_version
                } = response.data.results;
                const newFormData = {
                    transactional_input1: phone_number_id,
                    transactional_input2: waba_id,
                    transactional_input3: bussiness_number,
                    promotional_input1: promo_phone_number_id,
                    promotional_input2: promo_waba_id,
                    promotional_input3: promotional_number,
                    chatbot_input1: chatbot_phone_number_id,
                    chatbot_input2: chatbot_waba_id,
                    chatbot_input3: chatbot_number,
                    access_token: wa_permanent_access_token,
                    appid: wa_app_id,
                    version: wa_version
                };
                setFormData(newFormData);
                resetEdit(newFormData);
            }
        } catch (error) {
            triggerAlert('error', 'Error', "Something went wrong!");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        FetchData();

    const fbScript = document.createElement("script");
    fbScript.src = "https://connect.facebook.net/en_US/sdk.js";
    fbScript.async = true;
    fbScript.defer = true;
    document.body.appendChild(fbScript);

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: "724723899130595", // Your FB App ID
        autoLogAppEvents: true,
        xfbml: true,
        version: "v23.0",
      });
    };

    // Listen for Embedded Signup Events
    const handleMessage = (event) => {
      if (
        event.origin !== "https://www.facebook.com" &&
        event.origin !== "https://web.facebook.com"
      ) {
        return;
      }

      try {
        const data = JSON.parse(event.data);

        if (data.type === "WA_EMBEDDED_SIGNUP") {
          if (data.event === "FINISH") {
            console.log("Embedded Signup Completed:", data.data);
            const { phone_number_id, waba_id } = data.data;

            // Send WABA + Phone Number + FB Code to backend
           
            fetch("https://omnichannelapi.vitelglobal.com/whatsapp/update_user_whatsapp_auth/", {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `${mainToken}`,
              },
              body: JSON.stringify({
                phone_number_id,
                waba_id,
                codee: { xyz: sdkResponse?.authResponse?.code },
              }),
            })
              .then((res) => res.json())
              .then((res) => {
                console.log("✅ WhatsApp Registration Success:", res);
                setBackendResponse(res);
              })
              .catch((err) => console.error("❌ Backend Error:", err));
          } else if (data.event === "CANCEL") {
            console.warn("Signup Canceled:", data.data.current_step);
          } else if (data.event === "ERROR") {
            console.error("Signup Error:", data.data.error_message);
          }
        }

        setSessionInfo(data);
      } catch (err) {
        console.log("Non-JSON Response:", event.data);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
    }, [sdkResponse]);


     const fbLoginCallback = (response) => {
    console.log("FB Login Response:", response);
    setSdkResponse(response);

    if (response.authResponse?.code) {
      console.log("FB Code received:", response.authResponse.code);
      // The code is sent to backend after signup, no token exchange on frontend
    }
  };

  // Launch WhatsApp signup
  const launchWhatsAppSignup = () => {
    window.FB.login(fbLoginCallback, {
      config_id: "2076030239448408", // Your embedded signup config_id
      response_type: "code",
      override_default_response_type: true,
      extras: { version: "v3" },
    });
  };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <div id="content-page" className="content-page" style={{ flex: 1, padding: '20px', overflow: 'hidden' }}>
                <div className='container'>
                    <div className='row'>
                        <div className="col-md-12">
                            <PageTitle heading="Settings" />
                            {isLoading && (
                                <div className='loader-overlay text-white'>
                                    <Loader />
                                </div>
                            )}
                            <div className="tab-content" id="myTabContent">
                                <div className="card tab-pane mb-0 fade show active" id="user-content-103" role="tabpanel" style={{ flex: 1 }}>
                                    <div className="chat-head">
                                        <header className="d-flex justify-content-between align-items-center bg-white pt-3 ps-3 pe-3 pb-3 border-bottom">
                                            <div className="d-flex align-items-center">
                                                <h5 className="mb-0 text-primary fw-500">
                                                    {isEditMode ? "Update Details" : "View Details"}
                                                </h5>
                                            </div>
                                            

                                            <div style={{ padding: "20px" }}>
                                              <button
                                                onClick={launchWhatsAppSignup}
                                                style={{
                                                  backgroundColor: "#1877f2",
                                                  border: 0,
                                                  borderRadius: 4,
                                                  color: "#fff",
                                                  cursor: "pointer",
                                                  fontFamily: "Helvetica, Arial, sans-serif",
                                                  fontSize: 16,
                                                  fontWeight: "bold",
                                                  height: 40,
                                                  padding: "0 24px",
                                                }}
                                              >
                                                Login with Facebook
                                              </button>
                                            </div>



                                            <div className="d-flex align-items-center">
                                                <button
                                                    type="button"
                                                    className="btn btn-primary"
                                                    onClick={toggleEditMode}
                                                >
                                                    {isEditMode ? "Cancel" : "Edit"}
                                                </button>
                                                {isEditMode && (
                                                    <button
                                                        type="submit"
                                                        className="btn btn-success ms-2"
                                                        onClick={handleSubmitEdit(handleUpdate)}
                                                        disabled={isUpdating}
                                                    >
                                                        {isUpdating ? "Updating..." : "Update"}
                                                    </button>
                                                )}
                                            </div>
                                        </header>
                                    </div>
                                    <div className="card-body">
                                        {isEditMode ? (
                                            <form onSubmit={handleSubmitEdit(handleUpdate)}>
                                                <div className="row mt-1">
                                                    <div className="col-md-4 mb-1">
                                                        <h5 className="mb-1">Transactional</h5>
                                                        <div className="border p-2">
                                                            <div className="mb-1">
                                                                <label className="form-label" htmlFor="transactionalInput1">
                                                                    Phone Number Id<span style={{ color: 'red' }}>*</span>
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="transactionalInput1"
                                                                    {...registerEdit('transactional_input1', {
                                                                        pattern: onlyNumbers,
                                                                        required: 'Phone number is required',
                                                                    })}
                                                                />
                                                                {errorsEdit.transactional_input1 && (
                                                                    <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                                        {errorsEdit.transactional_input1.message}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="mb-1">
                                                                <label className="form-label" htmlFor="transactionalInput2">
                                                                    WABA Id<span style={{ color: 'red' }}>*</span>
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="transactionalInput2"
                                                                    {...registerEdit('transactional_input2', {
                                                                        pattern: onlyNumbers,
                                                                        required: 'WABA Id is required',
                                                                    })}
                                                                />
                                                                {errorsEdit.transactional_input2 && (
                                                                    <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                                        {errorsEdit.transactional_input2.message}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="mb-1">
                                                                <label className="form-label" htmlFor="transactionalInput3">
                                                                    Business / Transactional Number<span style={{ color: 'red' }}>*</span>
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="transactionalInput3"
                                                                    {...registerEdit('transactional_input3', {
                                                                        pattern: onlyNumbers,
                                                                        required: 'Business/Transactional number is required',
                                                                    })}
                                                                />
                                                                {errorsEdit.transactional_input3 && (
                                                                    <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                                        {errorsEdit.transactional_input3.message}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4 mb-1">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <h5 className="mb-1">Promotional</h5>
                                                            <div>
                                                                <label className="form-check-label me-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="form-check-input"
                                                                        checked={syncPromotionalTransactional}
                                                                        onChange={handleCheckboxChangePromotional}
                                                                    />
                                                                    <span className='ms-1'>Sync</span>
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div className="border p-2">
                                                            <div className="mb-1">
                                                                <label className="form-label" htmlFor="promotionalInput1">
                                                                    Promotional Phone Number Id<span style={{ color: 'red' }}>*</span>
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="promotionalInput1"
                                                                    {...registerEdit('promotional_input1', {
                                                                        pattern: onlyNumbers,
                                                                        required: 'Promotional phone number Id is required',
                                                                    })}
                                                                />
                                                                {errorsEdit.promotional_input1 && (
                                                                    <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                                        {errorsEdit.promotional_input1.message}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="mb-1">
                                                                <label className="form-label" htmlFor="promotionalInput2">
                                                                    Promotional WABA Id<span style={{ color: 'red' }}>*</span>
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="promotionalInput2"
                                                                    {...registerEdit('promotional_input2', {
                                                                        pattern: onlyNumbers,
                                                                        required: 'Promotional WABA Id is required',
                                                                    })}
                                                                />
                                                                {errorsEdit.promotional_input2 && (
                                                                    <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                                        {errorsEdit.promotional_input2.message}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="mb-1">
                                                                <label className="form-label" htmlFor="promotionalInput3">
                                                                    Promotional Number<span style={{ color: 'red' }}>*</span>
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="promotionalInput3"
                                                                    {...registerEdit('promotional_input3', {
                                                                        pattern: onlyNumbers,
                                                                        required: 'Promotional number is required',
                                                                    })}
                                                                />
                                                                {errorsEdit.promotional_input3 && (
                                                                    <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                                        {errorsEdit.promotional_input3.message}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4 mb-1">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <h5 className="mb-1">Chatbot</h5>
                                                            <div>
                                                                <label className="form-check-label me-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="form-check-input"
                                                                        checked={syncChatbotTransactional}
                                                                        onChange={handleCheckboxChangeChatbot}
                                                                    />
                                                                    <span className='ms-1'>Sync</span>
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div className="border p-2">
                                                            <div className="mb-1">
                                                                <label className="form-label" htmlFor="chatbotInput1">
                                                                    Chatbot Phone Number Id<span style={{ color: 'red' }}>*</span>
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="chatbotInput1"
                                                                    {...registerEdit('chatbot_input1', {
                                                                        pattern: onlyNumbers,
                                                                        required: 'Chatbot phone number Id is required',
                                                                    })}
                                                                />
                                                                {errorsEdit.chatbot_input1 && (
                                                                    <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                                        {errorsEdit.chatbot_input1.message}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="mb-1">
                                                                <label className="form-label" htmlFor="chatbotInput2">
                                                                    Chatbot WABA Id<span style={{ color: 'red' }}>*</span>
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="chatbotInput2"
                                                                    {...registerEdit('chatbot_input2', {
                                                                        pattern: onlyNumbers,
                                                                        required: 'Chatbot WABA Id is required',
                                                                    })}
                                                                />
                                                                {errorsEdit.chatbot_input2 && (
                                                                    <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                                        {errorsEdit.chatbot_input2.message}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="mb-1">
                                                                <label className="form-label" htmlFor="chatbotInput3">
                                                                    Chatbot Number<span style={{ color: 'red' }}>*</span>
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="chatbotInput3"
                                                                    {...registerEdit('chatbot_input3', {
                                                                        pattern: onlyNumbers,
                                                                        required: 'Chatbot number is required',
                                                                    })}
                                                                />
                                                                {errorsEdit.chatbot_input3 && (
                                                                    <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                                        {errorsEdit.chatbot_input3.message}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="row mt-3">
                                                    <div className="col-md-12 mb-1">
                                                        <div className="border p-2">
                                                            <div className="mb-1">
                                                                <label className="form-label" htmlFor="accessToken">
                                                                    Access Token<span style={{ color: 'red' }}>*</span>
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="accessToken"
                                                                    {...registerEdit('access_token', {
                                                                        required: 'Access Token is required',
                                                                    })}
                                                                />
                                                                {errorsEdit.access_token && (
                                                                    <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                                        {errorsEdit.access_token.message}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="mb-1">
                                                                <label className="form-label" htmlFor="appid">
                                                                    AppID<span style={{ color: 'red' }}>*</span>
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="appid"
                                                                    {...registerEdit('appid', {
                                                                        required: 'AppID is required',
                                                                    })}
                                                                />
                                                                {errorsEdit.appid && (
                                                                    <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                                        {errorsEdit.appid.message}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="mb-1">
                                                                <label className="form-label" htmlFor="version">
                                                                    Version<span style={{ color: 'red' }}>*</span>
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="version"
                                                                    {...registerEdit('version', {
                                                                        required: 'Version is required',
                                                                    })}
                                                                />
                                                                {errorsEdit.version && (
                                                                    <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                                        {errorsEdit.version.message}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </form>
                                        ) : (
                                            <div>
                                                <div className="row mt-1">
                                                    <div className="col-md-4 mb-1">
                                                        <h5 className="mb-1">Transactional</h5>
                                                        <div className="border p-2">
                                                            <div className="mb-1">
                                                                <label className="form-label">Phone Number Id</label>
                                                                <p>{formData.transactional_input1}</p>
                                                            </div>
                                                            <div className="mb-1">
                                                                <label className="form-label">WABA Id</label>
                                                                <p>{formData.transactional_input2}</p>
                                                            </div>
                                                            <div className="mb-1">
                                                                <label className="form-label">Business / Transactional Number</label>
                                                                <p>{formData.transactional_input3}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4 mb-1">
                                                        <h5 className="mb-1">Promotional</h5>
                                                        <div className="border p-2">
                                                            <div className="mb-1">
                                                                <label className="form-label">Promotional Phone Number Id</label>
                                                                <p>{formData.promotional_input1}</p>
                                                            </div>
                                                            <div className="mb-1">
                                                                <label className="form-label">Promotional WABA Id</label>
                                                                <p>{formData.promotional_input2}</p>
                                                            </div>
                                                            <div className="mb-1">
                                                                <label className="form-label">Promotional Number</label>
                                                                <p>{formData.promotional_input3}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4 mb-1">
                                                        <h5 className="mb-1">Chatbot</h5>
                                                        <div className="border p-2">
                                                            <div className="mb-1">
                                                                <label className="form-label">Chatbot Phone Number Id</label>
                                                                <p>{formData.chatbot_input1}</p>
                                                            </div>
                                                            <div className="mb-1">
                                                                <label className="form-label">Chatbot WABA Id</label>
                                                                <p>{formData.chatbot_input2}</p>
                                                            </div>
                                                            <div className="mb-1">
                                                                <label className="form-label">Chatbot Number</label>
                                                                <p>{formData.chatbot_input3}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="row mt-3">
                                                    <div className="col-md-12 mb-1">
                                                        <div className="border p-2">
                                                            <div className="mb-1">
                                                                <label className="form-label">Access Token</label>
                                                                <p>{formData.access_token}</p>
                                                            </div>
                                                            <div className="mb-1">
                                                                <label className="form-label">AppID</label>
                                                                <p>{formData.appid}</p>
                                                            </div>
                                                            <div className="mb-1">
                                                                <label className="form-label">Version</label>
                                                                <p>{formData.version}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
