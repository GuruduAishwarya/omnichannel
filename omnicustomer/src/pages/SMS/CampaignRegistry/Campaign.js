import React, { useCallback, useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form';
import PageTitle from '../../../common/PageTitle';
import { MaxLengthValidation, MinLengthValidation } from '../../../utils/Constants';
import { Modal, Table } from 'react-bootstrap';
import { createCampaign, deleteCampaign, editCampaign, fetchCampaignList, fetchCampaignSubcases, fetchCampignUsecases, fetchCarrierDetailsforCampaignView, fetchVerifiedBrandsList, fetchBrandsListing, workspaceDetails } from '../../../utils/ApiClient';
import { ConfirmationAlert, formatDateTime, getBase64, transformText, triggerAlert } from '../../../utils/CommonFunctions';
import Base64Preview from '../../../common/FilePreview';
import Loader from '../../../common/components/Loader';

export default function Campaign() {

    ///////////////////////// Basic form /////////////////////////////////////////
    const { register, handleSubmit, formState: { errors }, setValue, reset, control, clearErrors, getValues, setError, watch, trigger } = useForm({
        defaultValues: {
            subscriberOptin: true,
            subscriberOptout: true,
            subscriberHelp: true,
            ageGated: false,
            directLending: false,
            embeddedLink: false,
            embeddedPhone: false,
            numberPool: false,
            termsAndConditions: true,

        }
    });

    const [show, setShow] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [campaign, setCampaign] = useState([]); // Add this state for number list
    const [viewCampaign, setViewCampaign] = useState(null); // Add this state for number list
    const [verifiedBrands, setVerifiedBrands] = useState([]);
    const [currentStep, setCurrentStep] = useState(1);
    const [usecaseOptions, setUsecaseOptions] = useState([]);
    const [selectedUsecase, setSelectedUsecase] = useState("");
    const [subcases, setSubcases] = useState([]);
    const [selectedSubcases, setSelectedSubcases] = useState([]);
    const [sampleFile, setSampleFile] = useState({});
    const [file1Data, setFile1Data] = useState({});
    const [file2Data, setFile2Data] = useState({});
    const [file3Data, setFile3Data] = useState({});
    const [carrierDetailsforView, setCarrierDetailsforView] = useState({});
    const [selectedBrand, setSelectedBrand] = useState('');
    const [brandListData, setBrandListData] = useState([]);

    const [mode, setMode] = useState('');
    const brandId = watch("brandId");

    const file1Ref = useRef(null);
    const file2Ref = useRef(null);
    const file3Ref = useRef(null);
    const sampleFileRef = useRef(null);

     const [hideButton, setHideButton] = useState(true)
            const [messageError, setMessageError] = useState("")
            const [buttonLoading, setButtonLoading] = useState(true)
    
              const handleBulkSendButton = async () => {
                try {
                  setButtonLoading(true)
                  const workId = JSON.parse(localStorage.getItem("workspace_id"))
                  const response = await workspaceDetails(workId)
                  const data = response.data.results
                  const filteredData = data.filter((item) => item.plan_type === "sms")
                  if (filteredData.length === 0) {
                    setHideButton(false)
                    setMessageError("Note: No SMS plan is available.")
                  }
                  else if (filteredData[0].plan_expire === 'Expired') {
                    setHideButton(false)
                    setMessageError("Note: Your plan has been expired")
                  }
                  else {
                    setHideButton(true)
                    setMessageError("")
                  }
            
                }
                catch (error) {
                  console.log(error)
                }
                finally {
                  setButtonLoading(false)
                }
            
              }
              useEffect(() => {
                handleBulkSendButton()
              }, [])
    

    const handleClose = () => {
        // Reset file inputs
        if (file1Ref.current) file1Ref.current.value = "";
        if (file2Ref.current) file2Ref.current.value = "";
        if (file3Ref.current) file3Ref.current.value = "";
        if (sampleFileRef.current) sampleFileRef.current.value = "";

        // Clear file data state
        setFile1Data({});
        setFile2Data({});
        setFile3Data({});
        setSampleFile({});

        // Reset form and other states
        setShow(false);
        setCurrentStep(1);
        setSelectedUsecase("");
        setSelectedSubcases([]);
        reset();
        setMode('');
    };


    const handleShow = () => {
        setShow(true);
        fetchUsecases();
        BrandListing(); // <-- Add this line
    };


    const fetchCampaign = async () => {
        setIsLoading(true);
        try {
            const response = await fetchCampaignList();
            const response_data = response.data;

            if (response_data.error_code === 200) {
                const data = response_data.results;

                console.log("Fetched Campaign Data:", data); // 👀 Check this in console

                setCampaign(data);
            } else {
                setCampaign([]);
            }
        } catch (error) {
            console.error("Error fetching campaign data:", error);
            const error_msg = error?.response?.data;
            triggerAlert('error', '', error_msg?.message || "Something went wrong...");
            setCampaign([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUsecases = async () => {
        setIsLoading(true);

        try {
            const response = await fetchCampignUsecases();
            const response_data = response.data;
            if (response_data.error_code === 200) {
                const data = response_data.results;
                setUsecaseOptions(data);
            } else {
                setUsecaseOptions([]);
            }
        } catch (error) {
            console.error("Error fetching media data:", error);
            const error_msg = error?.response?.data
            triggerAlert('error', '', error_msg?.message || "Something went wrong...")
            setUsecaseOptions([]);

        } finally {
            setIsLoading(false);
        }
    }

    const BrandListing = async () => {
        try {
            const response = await fetchBrandsListing();
            const respdata = response.data.results;
            setBrandListData(respdata);
        } catch (error) {
            console.error("Error fetching brand listing:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (brandListData.length === 0) {
            BrandListing();
        }
    }, []);


    const fetchCarrierDetailsforView = async (id) => {
        setIsLoading(true);
        try {
            const response = await fetchCarrierDetailsforCampaignView(id);
            const response_data = response.data;
            if (response_data.error_code === 200) {
                const data = response_data.results;
                setIsLoading(false);
                setCarrierDetailsforView(data);
            } else {
                setCarrierDetailsforView({});
            }
        } catch (error) {
            console.error("Error fetching media data:", error);
            const error_msg = error?.response?.data
            triggerAlert('error', '', error_msg?.message || "Something went wrong...")
            setCarrierDetailsforView({});
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    }

    const fetchVerifiedBrands = async () => {
        setIsLoading(true);

        try {
            const response = await fetchVerifiedBrandsList();
            const response_data = response.data;
            if (response_data.error_code === 200) {
                const data = response_data.results;
                setIsLoading(false);
                setVerifiedBrands(data);
            } else {
                setVerifiedBrands([]);
            }
        } catch (error) {
            console.error("Error fetching media data:", error);
            const error_msg = error?.response?.data
            triggerAlert('error', '', error_msg?.message || "Something went wrong...")
            setVerifiedBrands([]);
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    }

    // Fetch subcases when a valid use case with `status: 1` is selected
    const fetchSubcasesData = useCallback(async () => {
        if (selectedUsecase && usecaseOptions[selectedUsecase]?.status === 1) {
            const response = await fetchCampaignSubcases();
            const response_data = response.data;
            if (response_data.error_code === 200) {
                setSubcases(response_data.results || []);
            } else {
                setSubcases([]);
            }

        } else {
            setSubcases([]); // Clear subcases if not valid
        }
    }, [selectedUsecase, usecaseOptions]);

    useEffect(() => {
        fetchSubcasesData();
    }, [fetchSubcasesData]);
    const handleCampaignView = (campaign) => {
        if (!campaign) return
        setViewCampaign(campaign);
        fetchCarrierDetailsforView(campaign.campaign_id ? campaign.campaign_id : null);
    }
    const handleUsecaseSelection = (e) => {
        const selected = e.target.value;
        setSelectedUsecase(selected);
        setSelectedSubcases([]); // Reset subcases on change


    }
    const handleSubcaseSelection = (event) => {
        const { value, checked } = event.target;

        let updatedSelection = checked
            ? [...selectedSubcases, value]
            : selectedSubcases.filter((subcase) => subcase !== value);

        // Fetch min and max subcases for the selected use case
        const selectedUsecaseData = usecaseOptions[selectedUsecase] || {};
        const minSubcases = selectedUsecaseData.minSubUsecases || 0;  // If 0, no minimum required
        const maxSubcases = selectedUsecaseData.maxSubUsecases || 0;  // If 0, no limit
        // // **Ensure an empty array is set if no sub-usecases exist**
        // if (!selectedUsecaseData.subUsecases || selectedUsecaseData.subUsecases.length === 0) {
        //     setSelectedSubcases([]); // Set empty array explicitly
        //     clearErrors("subUsecases"); // Clear any validation errors
        //     return;
        // }

        // Validation logic
        if (maxSubcases > 0 && updatedSelection.length > maxSubcases) {
            setError("subUsecases", { type: "custom", message: `You can select a maximum of ${maxSubcases} subcases.` });
            return;
        }
        if (minSubcases > 0 && updatedSelection.length < minSubcases) {
            setError("subUsecases", { type: "custom", message: `You must select at least ${minSubcases} subcases.` });
        } else {
            clearErrors("subUsecases"); // Clear error when within valid range
        }
        setSelectedSubcases(updatedSelection);
    };

    const handleFileChangeGeneric = async (event, setFileData, fieldName) => {
        const file = event.target.files[0];
        if (!file) return;

        // Allow various file types (not limited to images)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            setError(fieldName, { type: "manual", message: "File size should not exceed 10MB." });
            return;
        }

        clearErrors(fieldName);

        try {
            const base64file = await getBase64(file);
            const base64WithoutPrefix = base64file.substring(base64file.indexOf(",") + 1)
            setFileData({
                preview: base64file,
                data: base64WithoutPrefix,
                name: file.name,
                type: file.type
            });
        } catch (error) {
            console.error("Error converting file to Base64:", error);
            setError(fieldName, { type: "manual", message: "Failed to process file." });
        }
    };

    const handleFile1Change = async (event) => {
        handleFileChangeGeneric(event, setFile1Data, "file_1");
    };

    const handleFile2Change = async (event) => {
        handleFileChangeGeneric(event, setFile2Data, "file_2");
    };

    const handleFile3Change = async (event) => {
        handleFileChangeGeneric(event, setFile3Data, "file_3");
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];

        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            setError("file", { type: "manual", message: "Only image files are allowed." });
            return;
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            setError("file", { type: "manual", message: "File size should not exceed 10MB." });
            return;
        }

        // ✅ Correct way to clear error:
        clearErrors("file"); // This removes the error properly

        try {
            const base64file = await getBase64(file);
            const base64WithoutPrefix = base64file.substring(base64file.indexOf(",") + 1)
            setSampleFile({
                preview: base64file,
                data: base64WithoutPrefix
            }
            );
        } catch (error) {
            console.error("Error converting file to Base64:", error);
            setError("file", { type: "manual", message: "Failed to process file." });
        }
    };

    // Console log errors correctly
    useEffect(() => {
        fetchVerifiedBrands();
    }, []);

    const handleNext = async () => {
        const isValid = await trigger(); // Trigger validation for all fields
        if (isValid) {
            setCurrentStep(currentStep + 1);
        }
    };

    useEffect(() => {
        if (brandId) {
            const brand = verifiedBrands.find(brand => brand.brand_id === brandId);
            if (brand) {
                setSelectedBrand(brand.display_name);
                // Set the campaign name to the selected brand's display name
                setValue("campaign_name", brand.display_name);
            }
        }
    }, [brandId, verifiedBrands, setValue]);

    const handlePrevious = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleCampaignEdit = (campaign) => {
        if (!campaign) return;

        setMode(campaign.campaign_id);
        setValue('brandId', campaign.brand_id);
        setSelectedUsecase(campaign.user_case);
        setValue('usecase', campaign.user_case);

        // Ensure sub_use_case is correctly handled
        if (campaign.sub_use_case) {
            const modifiedSubusecase = campaign.sub_use_case.split(",").map(item => item.trim());
            setSelectedSubcases(modifiedSubusecase);
            setValue('subUsecases', modifiedSubusecase);
        } else {
            setSelectedSubcases([]);
            setValue('subUsecases', []);
        }

        // Set other values...
        setValue('description', campaign.description);
        setValue('sample1', campaign.sample1);
        setValue('sample2', campaign.sample2);
        setValue('sample3', campaign.sample3);
        setValue('messageFlow', campaign.messsage_flow);
        setValue('help_message', campaign.help_message);
        setValue('age_gated', campaign.age_gated);
        setValue('affiliate_marketing', campaign.affiliate_marketing);
        setValue('embedded_phone', campaign.embedded_phone);
        setValue('embedded_link', campaign.embedded_link);
        setValue('direct_lending', campaign.direct_lending);
        setValue('number_pool', campaign.number_pool);
        setValue('subscriberHelp', campaign.subscriber_help);
        setValue('helpKeywords', campaign.subscriber_helpkey);
        setValue('helpMessage', campaign.subscriber_helpmess);
        setValue('subscriberOptin', campaign.subscriber_optin);
        setValue('optinMessage', campaign.subscriber_optinmess);
        setValue('optinKeywords', campaign.subscriber_optinkey);
        setValue('subscriberOptout', campaign.subscriber_optout);
        setValue('optoutKeywords', campaign.subscriber_optoutkey);
        setValue('optoutMessage', campaign.subscriber_optoutmess);
        setValue('privacyPolicyLink', campaign.privacy_policylink);
        setValue('termsAndConditionsLink', campaign.terms_and_conditionslink);
        setValue('terms_conditions', campaign.terms_conditions);
        setValue('embedded_linksample', campaign.embedded_linksample);
        setValue('reseller', campaign.reseller);
        setValue('file', campaign.multiple_file);

        setSampleFile({
            preview: campaign.multiple_file,
            data: campaign.multiple_file
        });

        if (campaign.image1) {
            setFile1Data({
                preview: campaign.image1,
                data: campaign.image1,
                name: "Existing file 1",
                type: "image/jpeg"
            });
        }

        if (campaign.image2) {
            setFile2Data({
                preview: campaign.image2,
                data: campaign.image2,
                name: "Existing file 2",
                type: "image/jpeg"
            });
        }

        if (campaign.image3) {
            setFile3Data({
                preview: campaign.image3,
                data: campaign.image3,
                name: "Existing file 3",
                type: "image/jpeg"
            });
        }

        setValue('campaign_name', campaign.campaign_name);
        handleShow();
    };


    const Addcampaign = async (data) => {
        setIsLoading(true);
        try {
            if (sampleFile) data.file = sampleFile?.data;
            if (file1Data?.data) data.file_1 = file1Data.data;
            if (file2Data?.data) data.file_2 = file2Data.data;
            if (file3Data?.data) data.file_3 = file3Data.data;
            if (selectedSubcases.length > 0) {
                data.subUsecases = [selectedSubcases.join(",")]; // Convert array to a single comma-separated string inside an array
            } else {
                data.subUsecases = []; // Ensure it's an empty array when no sub-usecases are selected
            }

            data.affiliateMarketing = true;
            data.resellerId = "R000000";

            // console.log("Data", data);

            let response;
            if (mode) {
                // Call the edit API if in edit mode
                response = await editCampaign(mode, data);
            } else {
                // Call the create API if in add mode
                response = await createCampaign(data);
            }

            const response_data = response.data;

            if (response_data.error_code === 200) {
                const items = response_data.results.data;
                triggerAlert('success', 'success', mode ? 'Campaign updated Successfully!!' : 'Campaign created Successfully!!');
                fetchCampaign();
            } else {
                // triggerAlert('error', 'Oops...', 'Operation was unsuccessful');
            }
        } catch (error) {
            console.error("Error processing campaign data:", error);
            const response_data = error?.response?.data;
            triggerAlert('error', 'Oops...', response_data ? response_data.message : "Something went wrong!");
        } finally {
            setIsLoading(false);

            handleClose();

        }
    };

    const handleCampaignDelete = async (campaign_id) => {
        if (!campaign_id) {
            console.error("Campaign ID is undefined.");
            return;
        }

        const isConfirmed = await ConfirmationAlert(
            'You want to continue?',
            'Continue',
            async () => {
                setIsLoading(true); // Start loading state
                try {
                    const response = await deleteCampaign(campaign_id);
                    const respdata = response.data.results;

                    if (response.data.error_code === 200) {
                        triggerAlert("success", "", "Campaign deleted successfully"); // Success alert
                        fetchCampaign();
                    } else {
                        triggerAlert("error", "Error", response.data.message || "Failed to delete brand!");
                    }
                } catch (error) {
                    console.error("Error deleting brand:", error);
                    triggerAlert("error", "Oops...", "Something went wrong!");
                } finally {
                    setIsLoading(false); // Stop loading state
                }
            }
        );

        if (!isConfirmed) return;
    }

    useEffect(() => {
        fetchCampaign();
    }, []);

    const handleDownload = async (url) => {
        try {
            const filename = url.substring(url.lastIndexOf("/") + 1);

            // Fetch the file as a blob
            const response = await fetch(url, { mode: "cors" });
            const blob = await response.blob();

            // Create a temporary object URL
            const blobUrl = window.URL.createObjectURL(blob);

            // Create a hidden anchor tag and trigger download
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();

            // Cleanup
            link.remove();
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("File download failed:", error);
            alert("Failed to download file. Please try again.");
        }
    };


    return (
        <>

            {!viewCampaign ?
                <div className="row mb-5">
                    <div className="col-sm-12">
                        {buttonLoading ? (
                            <div className="text-center">
                                <Loader />
                            </div>
                        ) : (
                            <>
                                <PageTitle heading="  " showPrimaryButton={hideButton ? "Create Campaign" : null} onPrimaryClick={hideButton ? handleShow : null} />
                                {!hideButton && messageError && (
                                    <div className="text-danger mt-2">
                                        {messageError}
                                    </div>
                                )}
                            </>
                        )}
                        <div className="card-body pt-2">
                            <div className="table-responsive">
                                <Table id="example2" className="table table-bordered hover align-middle" cellspacing="0" width="100%">
                                    <thead className="text-nowrap" style={{ backgroundColor: '#ededed' }}>
                                        <tr>
                                            <th>Campaign ID</th>
                                            <th> Brand ID</th>
                                            <th>Campaign Name </th>
                                            <th>Use-case  </th>
                                            <th>Registered On </th>
                                            <th>Tcr Status </th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {campaign?.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="text-center">No data found</td>
                                            </tr>
                                        ) :
                                            campaign?.map((campaign, index) => (
                                                <tr>
                                                    <td>{campaign.campaign_id ? campaign.campaign_id : '-'}</td>
                                                    <td>{campaign.brand_id ? campaign.brand_id : '-'}</td>
                                                    <td className="text-nowrap">{campaign.campaign_name ? campaign.campaign_name : '-'}</td>
                                                    <td>{campaign.user_case ? campaign.user_case : '-'}</td>
                                                    <td>{campaign.registered_on ? formatDateTime(campaign.registered_on, 'yyyy-mm-dd, hh:mm:ss') : '-'}</td>
                                                    <td><span className={`badge font-size-14 ${campaign.status ? campaign.status == 1 ? 'bg-success' : 'bg-danger' : ''} border-radius rounded-pill`}>{campaign.status ? campaign.status == 1 ? 'Active' : 'Inactive' : '-'}</span> </td>
                                                    <td>
                                                        <a className=" " href="#/" onClick={() => handleCampaignView(campaign)}><span className="material-symbols-outlined me-2 md-18">visibility</span> </a>
                                                        <a className=" " href="#/" onClick={() => handleCampaignEdit(campaign)}><span className="material-symbols-outlined me-2 md-18"> edit_square </span> </a>
                                                        <a className=" " href="#/" onClick={() => handleCampaignDelete(campaign.campaign_id)}><span className="material-symbols-outlined me-2 md-18"> Delete </span> </a>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </div> :
                <div className="row">
                    <div className="col-sm-12 d-flex justify-content-end my-2">
                        <button className="btn btn-warning" onClick={() => setViewCampaign(false)}>Back</button>
                    </div>
                    <div className="col-md-12">
                        <div className=" ">
                            <div className="mb-3 bg-soft-info   rounded font-size-18 p-3">
                                <div className="row">
                                    <h5 className="text-primary fw-500 mb-2">Campaign ID : {viewCampaign.campaign_id ? viewCampaign.campaign_id : '-'}</h5>
                                    <div className="col-md-6">
                                        <div className="d-flex flex-column justify-content-between">
                                            <div className="d-flex align-items-center mb-2">
                                                <h6 className=" md-18 me-2 fw-500 mb-0">Brand ID :  </h6>
                                                <p className="mb-0 fw-500">{viewCampaign.brand_id ? viewCampaign.brand_id : '-'}</p>
                                            </div>
                                            <div className="d-flex align-items-center mb-1">
                                                <h6 className=" md-18 me-2 fw-500 mb-0">Use-Case :  </h6>
                                                <p className="mb-0 fw-500">{viewCampaign.user_case ? viewCampaign.user_case : '-'}</p>
                                            </div>
                                            <div className="d-flex align-items-center mb-1">
                                                <h6 className=" md-18 me-2 fw-500 mb-0">Sub Usecases :  </h6>
                                                <p className="mb-0 fw-500">{viewCampaign.sub_use_case ? viewCampaign.sub_use_case?.split('_')?.join(' ') : '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="d-flex flex-column justify-content-between">
                                            <div className="d-flex align-items-center mb-1">
                                                <h6 className=" md-18 me-2 fw-500 mb-0">Registered on :  </h6>
                                                <p className="mb-0 fw-500">{viewCampaign.registered_on ? formatDateTime(viewCampaign.registered_on, 'yyyy-mm-dd') : '-'}</p>
                                            </div>
                                            <div className="d-flex align-items-center mb-1">
                                                <h6 className="md-18 me-2 fw-500 mb-0">Renewal Date:</h6>
                                                <p className="mb-0 fw-500">
                                                    {viewCampaign?.nextRenewalOrExpirationDate
                                                        ? formatDateTime(viewCampaign.nextRenewalOrExpirationDate, 'yyyy-mm-dd')
                                                        : '-'}
                                                </p>
                                            </div>

                                            <div className="d-flex align-items-center mb-1">
                                                <h6 className=" md-18 me-2 fw-500 mb-0"> Auto Renewal :  </h6>
                                                <p className="mb-0 fw-500">{viewCampaign.registered_on ? formatDateTime(viewCampaign.registered_on, 'yyyy-mm-dd') : '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mb-3 rounded font-size-18 p-3">
                                <div className="row">
                                    <h5 className="text-primary fw-500 mb-2">Carrier Status</h5>
                                    <div className="table-responsive">
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th scope="col" className="bg-soft-primary col-md-2">Carrier</th>
                                                    <th scope="col" className="bg-soft-info">Qualify</th>
                                                    <th scope="col" className="bg-soft-info">Mno Review</th>
                                                    <th scope="col" className="bg-soft-info">Tpm Scope</th>
                                                    <th scope="col" className="bg-soft-info">Sms Tpm</th>
                                                    <th scope="col" className="bg-soft-info">Mms Tpm</th>
                                                    <th scope="col" className="bg-soft-info">Message Class</th>
                                                    <th scope="col" className="bg-soft-info">Status</th>
                                                    <th scope="col" className="bg-soft-info">Elected Dca</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.keys(carrierDetailsforView).length > 0 ? (
                                                    Object.keys(carrierDetailsforView).map((key, index) => {
                                                        const carrier = carrierDetailsforView[key];
                                                        return (
                                                            <tr key={index}>
                                                                <th scope="row" className="bg-soft-primary">{carrier.mno || '-'}</th>
                                                                <td>{carrier.qualify ? 'YES' : 'NO'}</td>
                                                                <td>{carrier.mnoReview ? 'YES' : 'NO'}</td>
                                                                <td>{carrier.tpmScope || '-'}</td>
                                                                <td>{carrier.tpm || '-'}</td>
                                                                <td>{carrier.mmsTpm || '-'}</td>
                                                                <td>{carrier.msgClass || '-'}</td>
                                                                <td>{carrier.mnoSupport ? 'YES' : 'NO'}</td>
                                                                <td>{carrier.qualify ? 'YES' : 'NO'}</td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td colSpan={9} className="text-center">No Data Found</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="mb-3 bg-soft-info rounded font-size-18 p-3">
                                    <div className="row">
                                        <h5 className="text-primary fw-500 mb-2">Campaign Details</h5>
                                        <h5 className="mb-1 text-primary fw-500">Campaign Description:</h5>
                                        <p className="text-dark">{viewCampaign?.description || '-'}</p>
                                        <h5 className="mb-1 text-primary fw-500">Call-to-Action / Message Flow</h5>
                                        <p className="text-dark">{viewCampaign?.messsage_flow || '-'}</p>
                                        <div className="col-md-6">
                                            <div className="d-flex flex-column justify-content-between">
                                                <div className="d-flex align-items-center mb-2">
                                                    <h6 className="md-18 me-2 fw-500 mb-0">Privacy Policy Link:</h6>
                                                    <p className="mb-0 fw-500">{viewCampaign?.privacy_policylink || '-'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="d-flex flex-column justify-content-between">
                                                <div className="d-flex align-items-center mb-2">
                                                    <h6 className="md-18 me-2 fw-500 mb-0">Terms and Conditions Link:</h6>
                                                    <p className="mb-0 fw-500">{viewCampaign?.terms_and_conditionslink || '-'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-12 mt-3">
                                            <h6 className="text-primary md-18 me-2 fw-500 mb-3">
                                                CTA (Call-to-Action), Privacy Policy and/or Terms and Conditions Multimedia Upload
                                            </h6>

                                            <div className="d-flex flex-wrap gap-2">
                                                {[viewCampaign?.image1, viewCampaign?.image2, viewCampaign?.image3]
                                                    .filter(Boolean)
                                                    .map((imageUrl, index) => (
                                                        <div key={index} className="d-flex flex-column align-items-center">
                                                            {imageUrl && (
                                                                <>
                                                                    {imageUrl.endsWith(".png") ||
                                                                        imageUrl.endsWith(".jpg") ||
                                                                        imageUrl.endsWith(".jpeg") ? (
                                                                        <img
                                                                            src={imageUrl}
                                                                            alt={`CTA Image ${index + 1}`}
                                                                            className="img-fluid mb-2"
                                                                            style={{
                                                                                maxHeight: "200px",
                                                                                maxWidth: "200px",
                                                                                borderRadius: "8px",
                                                                            }}
                                                                            onError={(e) => {
                                                                                console.error("Error loading image:", e);
                                                                                e.target.style.display = "none";
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <div
                                                                            className="bg-light p-3 rounded text-center"
                                                                            style={{ width: "200px", height: "200px" }}
                                                                        >
                                                                            <p className="mb-0">File not previewable</p>
                                                                        </div>
                                                                    )}

                                                                    <button
                                                                        onClick={() => handleDownload(imageUrl)}
                                                                        className="btn btn-soft-primary rounded-pill w-100 d-flex justify-content-between align-items-center"
                                                                    >
                                                                        Download{" "}
                                                                        <i className="material-symbols-outlined ms-2">
                                                                            download_for_offline
                                                                        </i>
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                <div className="mb-3">
                                    <div className="row">
                                        <h5 className="text-primary fw-500 mb-2">Sample Messages</h5>
                                        <div className="col-md-4">
                                            <div>
                                                <h5 className="text-primary">Sample Messages 1</h5>
                                                <p>{viewCampaign?.sample1 || '-'}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div>
                                                <h5 className="text-primary">Sample Messages 2</h5>
                                                <p>{viewCampaign?.sample2 || '-'}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div>
                                                <h5 className="text-primary">Sample Messages 3</h5>
                                                <p>{viewCampaign?.sample3 || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <h6 className="md-18 me-2 fw-500 mb-2">Sample Multimedia files</h6>
                                        {viewCampaign?.multiple_file ? (
                                            <div className="d-flex flex-wrap gap-2">
                                                <div className="d-flex flex-column align-items-center">
                                                    {viewCampaign.multiple_file.endsWith('.png') ||
                                                        viewCampaign.multiple_file.endsWith('.jpg') ||
                                                        viewCampaign.multiple_file.endsWith('.jpeg') ? (
                                                        <img
                                                            src={viewCampaign.multiple_file}
                                                            alt="Sample Multimedia"
                                                            className="img-fluid mb-2"
                                                            style={{ maxHeight: "200px", maxWidth: "200px", borderRadius: "8px" }}
                                                            onError={(e) => {
                                                                console.error("Error loading image:", e);
                                                                e.target.style.display = "none";
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="bg-light p-3 rounded text-center" style={{ width: "200px", height: "200px" }}>
                                                            <p className="mb-0">File not previewable</p>
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={() => handleDownload(viewCampaign.multiple_file)}
                                                        className="btn btn-soft-primary rounded-pill w-100 d-flex justify-content-between align-items-center"
                                                    >
                                                        Download <i className="material-symbols-outlined ms-2">download_for_offline</i>
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p>No sample multimedia file available.</p>
                                        )}
                                    </div>




                                    <div className="row mb-3 bg-soft-info rounded font-size-18 p-3">
                                        <h5 className="text-primary fw-500 mb-2">Campaign and Content Attributes</h5>
                                        <div className="table-responsive">
                                            <table className="table table-borderless align-middle">
                                                <tbody>
                                                    <tr>
                                                        <td className="col-md-3">
                                                            <div className="form-check">
                                                                <input className="form-check-input" type="checkbox" checked={!!viewCampaign?.subscriber_optin} id="flexCheckDefault3" disabled />
                                                                <label className="form-check-label" htmlFor="flexCheckDefault3">
                                                                    Subscribe Opt-In
                                                                </label>
                                                            </div>
                                                        </td>
                                                        <td className="col-md-3">
                                                            <div className="form-group">
                                                                <label className="form-label">Type Opt-in Key words</label>
                                                                <p>{viewCampaign?.subscriber_optinkey || '-'}</p>
                                                            </div>
                                                        </td>
                                                        <td className="col-md-6">
                                                            <div className="form-group">
                                                                <label className="form-label">Opt-in Messages</label>
                                                                <p>{viewCampaign?.subscriber_optinmess || '-'}</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="col-md-3">
                                                            <div className="form-check">
                                                                <input className="form-check-input" type="checkbox" checked={!!viewCampaign?.subscriber_optout} id="flexCheckDefault4" disabled />
                                                                <label className="form-check-label" htmlFor="flexCheckDefault4">
                                                                    Subscribe Opt-Out
                                                                </label>
                                                            </div>
                                                        </td>
                                                        <td className="col-md-3">
                                                            <div className="form-group">
                                                                <label className="form-label">Type Opt-out Key words</label>
                                                                <p>{viewCampaign?.subscriber_optoutkey || '-'}</p>
                                                            </div>
                                                        </td>
                                                        <td className="col-md-6">
                                                            <div className="form-group">
                                                                <label className="form-label">Opt-out Messages</label>
                                                                <p>{viewCampaign?.subscriber_optoutmess || '-'}</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="col-md-3">
                                                            <div className="form-check">
                                                                <input className="form-check-input" type="checkbox" checked={!!viewCampaign?.subscriber_help} id="flexCheckDefault5" disabled />
                                                                <label className="form-check-label" htmlFor="flexCheckDefault5">
                                                                    Subscriber Help
                                                                </label>
                                                            </div>
                                                        </td>
                                                        <td className="col-md-3">
                                                            <div className="form-group">
                                                                <label className="form-label">Help Key Words</label>
                                                                <p>{viewCampaign?.subscriber_helpkey || '-'}</p>
                                                            </div>
                                                        </td>
                                                        <td className="col-md-6">
                                                            <div className="form-group">
                                                                <label className="form-label">Help Messages</label>
                                                                <p>{viewCampaign?.subscriber_helpmess || '-'}</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                <div className="row mb-3 bg-soft-info rounded font-size-18 p-3">
                                    <div className="table-responsive">
                                        <table className="table table-borderless align-middle">
                                            <tbody>
                                                <tr>
                                                    <td className="col-md-3">
                                                        <div className="form-check">
                                                            <input className="form-check-input" type="checkbox" checked={!!viewCampaign?.embedded_link} id="flexCheckDefault6" disabled />
                                                            <label className="form-check-label" htmlFor="flexCheckDefault6">
                                                                Embedded Link
                                                            </label>
                                                        </div>
                                                    </td>
                                                    <td className="col-md-3">
                                                        <div className="form-check">
                                                            <input className="form-check-input" type="checkbox" checked={!!viewCampaign?.number_pool} id="flexCheckDefault7" disabled />
                                                            <label className="form-check-label" htmlFor="flexCheckDefault7">
                                                                Number Pooling
                                                            </label>
                                                        </div>
                                                    </td>
                                                    <td className="col-md-3">
                                                        <div className="form-check">
                                                            <input className="form-check-input" type="checkbox" checked={!!viewCampaign?.direct_lending} id="flexCheckDefault8" disabled />
                                                            <label className="form-check-label" htmlFor="flexCheckDefault8">
                                                                Direct Lending or Loan Arrangement
                                                            </label>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="col-md-3">
                                                        <div className="form-check">
                                                            <input className="form-check-input" type="checkbox" checked={!!viewCampaign?.age_gated} id="flexCheckDefault9" disabled />
                                                            <label className="form-check-label" htmlFor="flexCheckDefault9">
                                                                Age-Gated Content
                                                            </label>
                                                        </div>
                                                    </td>
                                                    <td className="col-md-3">
                                                        <div className="form-check">
                                                            <input className="form-check-input" type="checkbox" checked={!!viewCampaign?.embedded_phone} id="flexCheckDefault10" disabled />
                                                            <label className="form-check-label" htmlFor="flexCheckDefault10">
                                                                Embedded Phone Number
                                                            </label>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="col-md-1">
                                                        <div className="form-check d-block">
                                                            <input className="form-check-input" type="checkbox" checked={!!viewCampaign?.terms_conditions} id="flexCheckDefault11" disabled />
                                                            <label className="form-check-label" htmlFor="flexCheckDefault11">
                                                                Terms & Conditions
                                                            </label>
                                                        </div>
                                                    </td>
                                                    <td colSpan="2">
                                                        <p>I confirm that this campaign will not be used for Affiliate Marketing.</p>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="mb-3 bg-soft-info rounded font-size-18 p-3">
                                        <div className="row">
                                            <h5 className="text-primary fw-500 mb-2">Other Responsible Parties</h5>
                                            <div className="col-md-6">
                                                <div className="d-flex flex-column justify-content-between">
                                                    <div className="d-flex align-items-center mb-2">
                                                        <h6 className="md-18 me-2 fw-500 mb-0">Connectivity Partner:</h6>
                                                        <p className="mb-0 fw-500">Vitelglobal Communications LLC</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="d-flex flex-column justify-content-between">
                                                    <div className="d-flex align-items-center mb-1">
                                                        <h6 className="md-18 me-2 fw-500 mb-0">Reseller Involved:</h6>
                                                        <p className="mb-0 fw-500">No</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <h5 className="text-primary fw-500 mb-2">Events</h5>
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-striped">
                                            <thead className="table-light">
                                                <tr>
                                                    <th scope="col">Event Type</th>
                                                    <th scope="col">Source</th>
                                                    <th scope="col">Campaign ID</th>
                                                    <th scope="col">Brand ID</th>
                                                    <th scope="col">Date & Time</th>
                                                    <th scope="col">Description</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td colSpan={6} className='text-center'>No Data Available</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            }

            <Modal show={show} onHide={handleClose} size="xl" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Create Campaign</Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <div className="card-body">
                        <form id="form-wizard1" className="text-center " onSubmit={handleSubmit(Addcampaign)}>
                            <ul id="top-tab-list" className="p-0 row list-inline justify-content-center mb-3">
                                <li className={`col-lg-3 col-md-6 text-start mb-2 ${currentStep === 1 ? 'active' : currentStep > 1 ? 'active done' : ''} `} id="account">
                                    <a href="javascript:void(0);" class="fs-6">
                                        <span>1. Brand and Use Case Details</span>
                                    </a>
                                </li>
                                <li id="personal" className={`col-lg-3 col-md-6 text-start mb-2 ${currentStep === 2 ? 'active' : currentStep > 2 ? 'active done' : ''}`}>
                                    <a href="javascript:void(0);" class="fs-6">
                                        <span>2.Terms Preview</span>
                                    </a>
                                </li>
                                <li id="payment" className={`col-lg-3 col-md-6 text-start mb-2 ${currentStep === 3 ? 'active' : currentStep > 3 ? 'active done' : ''}`}>
                                    <a href="javascript:void(0);" class="fs-6">
                                        <span>3. Campaign Details</span>
                                    </a>
                                </li>
                                <li id="confirm" className={`col-lg-3 col-md-6 text-start mb-2 ${currentStep === 4 ? 'active' : currentStep > 4 ? 'active done' : ''}`}>
                                    <a href="javascript:void(0);" class="fs-6">
                                        <span>4. Content Attributes</span>
                                    </a>
                                </li>
                            </ul>
                            {currentStep === 1 && (
                                <fieldset style={{ position: "relative", opacity: currentStep === 1 ? 1 : 0, display: currentStep === 1 ? 'block' : 'none' }}>
                                    <div className="form-card text-start">
                                        <div className="row">
                                            <div className="col-12">
                                                <h5 className="mb-3 text-primary fw-500">Brand and Use Case Details</h5>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label className="form-label">
                                                        What brand is associated with the campaign? <span className="text-danger">*</span>
                                                    </label>
                                                    <select
                                                        className="form-select"
                                                        id="choices-single-default"
                                                        name="brandId"
                                                        {...register("brandId", {
                                                            required: "Brand is required",
                                                        })}
                                                        disabled={mode || isLoading}
                                                    >
                                                        <option value="" hidden>Select brand</option>
                                                        {brandListData?.map((brand) => (
                                                            <option key={brand.brand_id} value={brand.brand_id}>
                                                                {brand.display_name}
                                                            </option>
                                                        ))}
                                                    </select>

                                                    {errors.brandId && (
                                                        <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                            {errors.brandId.message}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-12">
                                                <h5 className="mb-3 text-primary fw-500">Select a UseCase</h5>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-lg-6">
                                                <div className="card">
                                                    <h6 className="p-2 text-primary fw-500">Standard/Special Campaign Type<span className="text-danger">*</span></h6>
                                                    <div className="card-header d-flex justify-content-between ps-3 py-2 bg-soft-warning">
                                                        <div className="header-title">
                                                            <h6 className="card-title text-warning fw-500">Use Case</h6>
                                                        </div>
                                                    </div>
                                                    <div className="card-body">
                                                        {Object.keys(usecaseOptions).length > 0 ? (
                                                            Object.keys(usecaseOptions).map((key, index) => {
                                                                const usecase = usecaseOptions[key];
                                                                return (
                                                                    <div key={index} className="form-check d-block mb-2">
                                                                        <input
                                                                            type="radio"
                                                                            className="form-check-input"
                                                                            name="usecase"
                                                                            id={`radio${index}`}
                                                                            value={key}
                                                                            checked={selectedUsecase === key}
                                                                            {...register("usecase", {
                                                                                required: mode ? false : "Use case is required",
                                                                                onChange: handleUsecaseSelection
                                                                            })}
                                                                            disabled={mode}
                                                                        />
                                                                        <label htmlFor={`radio${index}`} className="form-check-label mb-0">
                                                                            {usecase.displayName || '-'}
                                                                        </label>
                                                                    </div>
                                                                );
                                                            })
                                                        ) : (
                                                            <p className='text-center'>Loading options...</p>
                                                        )}
                                                        {errors.usecase && (
                                                            <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                                {errors.usecase.message}
                                                            </div>
                                                        )}
                                                    </div>

                                                </div>
                                            </div>
                                            <div className="col-lg-6">
                                                <div className="card">
                                                    <h6 className="p-2 text-primary fw-500">Sub Use-cases <span className="text-danger">*</span> {usecaseOptions && (usecaseOptions[selectedUsecase]?.minSubUsecases || '0')} / {usecaseOptions && (usecaseOptions[selectedUsecase]?.maxSubUsecases || '0')}</h6>
                                                    <div className="card-header d-flex justify-content-between ps-3 py-2 bg-soft-warning">
                                                        <div className="header-title">
                                                            <h6 className="card-title text-warning fw-500">{selectedUsecase ? selectedUsecase?.split('_').join('  ') : ''}</h6>
                                                        </div>
                                                    </div>
                                                    <div className="card-body">
                                                        {Object.keys(subcases).length > 0 ? (
                                                            Object.keys(subcases).map((key, index) => {
                                                                const subcase = subcases[key];
                                                                return (
                                                                    <div key={index} className="form-check d-block mb-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="form-check-input"
                                                                            id={`subcase${index}`}
                                                                            value={key}
                                                                            checked={selectedSubcases.includes(key)}
                                                                            {...register("subUsecases", {
                                                                                required: mode ? false : "Sub use case is required",
                                                                                onChange: handleSubcaseSelection
                                                                            })}
                                                                            disabled={mode}
                                                                        />
                                                                        <label className="form-check-label" htmlFor={`subcase${index}`}>
                                                                            {subcase.displayName || '-'}
                                                                        </label>
                                                                    </div>
                                                                );
                                                            })
                                                        ) : (
                                                            <p className="text-center">
                                                                {selectedUsecase ? "No options available" : "Select a use case first"}
                                                            </p>
                                                        )}
                                                        {errors.subUsecases && (
                                                            <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                                {errors.subUsecases.message}
                                                            </div>
                                                        )}
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button type="button" name="next" className="btn btn-primary next action-button float-end px-4 mb-3" value="Next" onClick={handleNext}>Next</button>
                                </fieldset>
                            )}
                            {currentStep === 2 && (
                                <fieldset style={{ opacity: currentStep === 2 ? 1 : 0, position: 'relative', display: currentStep === 2 ? 'block' : 'none' }}>
                                    <div className="form-card text-start">
                                        <div className="row">
                                            <div className="col-12">
                                                <h5 className="mb-1 text-primary fw-500">Carrier Terms Preview</h5>
                                                <p>The terms displayed in this page may be subject to change at the sole discretion of the MNO!</p>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="table-responsive">
                                                <table className="table  ">
                                                    <thead  >
                                                        <tr>
                                                            <th scope="col" className="bg-soft-primary col-md-2">Carrier</th>
                                                            <th scope="col" className="bg-soft-info">Qualify</th>
                                                            <th scope="col" className="bg-soft-info">Mno Review</th>
                                                            <th scope="col" className="bg-soft-info">Tpm Scope</th>
                                                            <th scope="col" className="bg-soft-info">Sms Tpm</th>
                                                            <th scope="col" className="bg-soft-info">Mms Tpm </th>
                                                            <th scope="col" className="bg-soft-info">Message Calls</th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        <tr>
                                                            <th scope="row" className="bg-soft-primary  ">AT&T</th>
                                                            <td>YES</td>
                                                            <td>NO</td>
                                                            <td>Campaign	</td>
                                                            <td>240</td>
                                                            <td>150</td>
                                                            <td>E</td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row" className="bg-soft-primary  ">Verizon Wireless</th>
                                                            <td>YES</td>
                                                            <td>NO</td>
                                                            <td>N/A</td>
                                                            <td>N/A</td>
                                                            <td>N/A</td>
                                                            <td>N/A</td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row" className="bg-soft-primary  ">US Cellular</th>
                                                            <td>YES</td>
                                                            <td>NO</td>
                                                            <td>N/A</td>
                                                            <td>N/A</td>
                                                            <td>N/A</td>
                                                            <td>N/A</td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row" className="bg-soft-primary  ">Clear Sky</th>
                                                            <td>YES</td>
                                                            <td>NO</td>
                                                            <td>N/A</td>
                                                            <td>N/A</td>
                                                            <td>N/A</td>
                                                            <td>N/A</td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row" className="bg-soft-primary  ">Interop</th>
                                                            <td>YES</td>
                                                            <td>NO</td>
                                                            <td>N/A</td>
                                                            <td>N/A</td>
                                                            <td>N/A</td>
                                                            <td>N/A</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>

                                        </div>
                                    </div>
                                    <button type="button" name="next" className="btn btn-primary next action-button float-end px-4 mb-3  mt-2 px-4" value="Next" onClick={handleNext}>Next</button>
                                    <button type="button" name="previous" className="btn btn-dark previous action-button-previous float-end me-3 mb-3 mt-2" value="Previous" onClick={handlePrevious}>Previous</button>
                                </fieldset>
                            )}
                            {currentStep === 3 && (
                                <fieldset style={{ opacity: currentStep === 3 ? 1 : 0, position: 'relative', display: currentStep === 3 ? 'block' : 'none' }}>
                                    <div className="form-card text-start">
                                        <div className="row">
                                            <div className="col-12">
                                                <h5 className="mb-1 text-primary fw-500">Campaign Details</h5>
                                            </div>
                                            <div className="col-md-12">
                                                <div className="form-group">
                                                    <label className="form-label">Brand Name <span className="text-danger">*</span></label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="campaign_name"
                                                        placeholder="Enter Brand Name"
                                                        {...register("campaign_name", {
                                                            required: "Brand Name is required",
                                                            minLength: MinLengthValidation(3),
                                                            maxLength: MaxLengthValidation(100)
                                                        })}
                                                        readOnly // Add this attribute to make the field read-only
                                                    />
                                                    {errors.campaign_name && (
                                                        <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                            {errors.campaign_name.message}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="col-md-12">
                                                <div className="form-group mb-0">
                                                    <label className="form-label" for="exampleFormControlTextarea1">Campaign Description <span className="text-danger">*</span></label>
                                                    <textarea className="form-control" id="exampleFormControlTextarea1" rows="3" name="description" placeholder="Enter Campaign Description"
                                                        {...register("description", {
                                                            required: "Campaign Description is required",
                                                            minLength: MinLengthValidation(40),
                                                            maxLength: MaxLengthValidation(4096)

                                                        })}
                                                    />
                                                    <p className="text-end caption-text mb-0">Character Count - <span className={`${watch('description') ? watch('description').length > 4096 || watch('description').length < 40 ? 'text-danger' : '' : ''}`}>{watch('description') ? watch('description').length : 0}</span> / Length must be between 40 and 4096</p>
                                                    {errors.description && (
                                                        <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                            {errors.description.message}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-md-12">
                                                <div className="form-group">
                                                    <label className="form-label mb-0" for="exampleFormControlTextarea1">Call To Action/ Message Flow <span className="text-danger">*</span> (How are you obtaining consent?)</label>
                                                    <p className="">CONSENT IS REQUIRED BEFORE SENDING MESSAGES. TCR will reject your campaign if you do not provide a detailed description of how you are obtaining consent, or if the level of consent you are obtaining is not sufficient for the type of messages you are sending. Please note TCR and affiliated parties may require proof of any stated processes. Learn more about consent requirements and what TCR requires here.</p>
                                                    <textarea className="form-control" id="exampleFormControlTextarea1" rows="3" name="messageFlow" placeholder=" "
                                                        {...register("messageFlow", {
                                                            required: "Call To Action/ Message Flow is required",
                                                            minLength: MinLengthValidation(40),
                                                            maxLength: MaxLengthValidation(4096)
                                                        })}
                                                    />
                                                    <p className="text-end caption-text mb-0">Character Count - <span className={`${watch('messageFlow') ? watch('messageFlow').length > 4096 || watch('messageFlow').length < 40 ? 'text-danger' : '' : ''}`}>{watch('messageFlow') ? watch('messageFlow').length : 0}</span> / Length must be between 40 and 4096</p>
                                                    {errors.messageFlow && (
                                                        <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                            {errors.messageFlow.message}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group  ">
                                                    <label className="form-label">Terms And Conditions Links <span className="text-danger">*</span></label>
                                                    <input type="text" className="form-control" name="termsAndConditionsLink" placeholder=" "
                                                        {...register("termsAndConditionsLink", {
                                                            required: "Terms And Conditions Link is required",
                                                            pattern: {
                                                                value: /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-./?%&=]*)?$/,
                                                                message: "Please enter a valid URL",
                                                            },
                                                        })} />
                                                    {errors.termsAndConditionsLink && (
                                                        <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                            {errors.termsAndConditionsLink.message}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group  ">
                                                    <label className="form-label">Privacy Policy Links <span className="text-danger">*</span></label>
                                                    <input type="text" className="form-control" name="privacyPolicyLink" placeholder=" "
                                                        {...register("privacyPolicyLink", {
                                                            required: "Privacy Policy Link is required",
                                                            pattern: {
                                                                value: /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-./?%&=]*)?$/,
                                                                message: "Please enter a valid URL",
                                                            },
                                                        })} />
                                                    {errors.privacyPolicyLink && (
                                                        <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                            {errors.privacyPolicyLink.message}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <h5 className="mb-1 text-primary fw-500">CTA (Call-to-Action), Privacy Policy and/or Terms and Conditions Multimedia Upload<span className="text-danger">*</span></h5>
                                                <p>Provides an area to upload any supporting information for opt in, call-to-action, terms and conditions, privacy policy, etc. Not intended for MMS sample messages.</p>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="file_1" className="form-label custom-file-input">Choose Files</label>
                                                    <input
                                                        className="form-control"
                                                        type="file"
                                                        id="file_1"
                                                        ref={file1Ref}
                                                        {...register("file_1")}
                                                        onChange={handleFile1Change}
                                                    />
                                                    {file1Data?.name && (
                                                        <div className="mt-1 text-muted small">
                                                            Current file: {file1Data.name}
                                                        </div>
                                                    )}
                                                    {errors.file_1 && (
                                                        <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                            {errors.file_1.message}
                                                        </div>
                                                    )}
                                                    {file1Data?.preview && (
                                                        <div className="mt-2">
                                                            {file1Data.type?.startsWith('image/') ? (
                                                                <img src={file1Data.preview} alt="file-preview" className="img-fluid mt-2" style={{ maxHeight: "100px" }} />
                                                            ) : (
                                                                <div className="file-preview-box">
                                                                    <span>{file1Data.name || "Uploaded file"}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="file_2" className="form-label custom-file-input">Choose Files</label>
                                                    <input
                                                        className="form-control"
                                                        type="file"
                                                        id="file_2"
                                                        {...register("file_2")}
                                                        onChange={handleFile2Change}
                                                    />
                                                    {file2Data?.name && (
                                                        <div className="mt-1 text-muted small">
                                                            Current file: {file2Data.name}
                                                        </div>
                                                    )}
                                                    {errors.file_2 && (
                                                        <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                            {errors.file_2.message}
                                                        </div>
                                                    )}
                                                    {file2Data?.preview && (
                                                        <div className="mt-2">
                                                            {file2Data.type?.startsWith('image/') ? (
                                                                <img src={file2Data.preview} alt="file-preview" className="img-fluid mt-2" style={{ maxHeight: "100px" }} />
                                                            ) : (
                                                                <div className="file-preview-box">
                                                                    <span>{file2Data.name || "Uploaded file"}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="file_3" className="form-label custom-file-input">Choose Files</label>
                                                    <input
                                                        className="form-control"
                                                        type="file"
                                                        id="file_3"
                                                        {...register("file_3")}
                                                        onChange={handleFile3Change}
                                                    />
                                                    {file3Data?.name && (
                                                        <div className="mt-1 text-muted small">
                                                            Current file: {file3Data.name}
                                                        </div>
                                                    )}
                                                    {errors.file_3 && (
                                                        <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                            {errors.file_3.message}
                                                        </div>
                                                    )}
                                                    {file3Data?.preview && (
                                                        <div className="mt-2">
                                                            {file3Data.type?.startsWith('image/') ? (
                                                                <img src={file3Data.preview} alt="file-preview" className="img-fluid mt-2" style={{ maxHeight: "100px" }} />
                                                            ) : (
                                                                <div className="file-preview-box">
                                                                    <span>{file3Data.name || "Uploaded file"}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <h5 className="mb-1 text-primary fw-500">Sample Messages</h5>
                                                <p>Add 3 to 5 unique sample messages that best reflect how you will be using SMS for this campaign. Failure to provide accurate or representative sample messages may result in SMS carriers blocking your traffic or TCR disabling your campaign.</p>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label className="form-label mb-0" for="exampleFormControlTextarea1">Sample Messages 1 <span className="text-danger">*</span></label>
                                                    <textarea className="form-control" id="exampleFormControlTextarea1" rows="3" name="sample1" placeholder=" "
                                                        {...register("sample1", {
                                                            required: "Sample Messages 1 is required",
                                                            minLength: MinLengthValidation(40),
                                                            maxLength: MaxLengthValidation(4096),
                                                        })} />
                                                    <p className="text-end caption-text mb-0">Character Count - <span className={`${watch('sample1') ? watch('sample1').length > 4096 || watch('sample1').length < 40 ? 'text-danger' : '' : ''}`}>{watch('sample1') ? watch('sample1').length : 0}</span>/ Length must be between 40 and 4096</p>
                                                    {errors.sample1 && (
                                                        <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                            {errors.sample1.message}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label className="form-label mb-0" for="exampleFormControlTextarea1">Sample Messages 2 <span className="text-danger">*</span></label>
                                                    <textarea className="form-control" id="exampleFormControlTextarea1" rows="3" name="sample2" placeholder=" "
                                                        {...register("sample2", {
                                                            required: "Sample Messages 2 is required",
                                                            minLength: MinLengthValidation(40),
                                                            maxLength: MaxLengthValidation(4096),
                                                        })} />
                                                    <p className="text-end caption-text mb-0">Character Count - <span className={`${watch('sample2') ? watch('sample1').length > 4096 || watch('sample2').length < 40 ? 'text-danger' : '' : ''}`}>{watch('sample2') ? watch('sample2').length : 0}</span>/ Length must be between 40 and 4096</p>
                                                    {errors.sample2 && (
                                                        <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                            {errors.sample2.message}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label className="form-label mb-0" for="exampleFormControlTextarea1">Sample Messages 3 <span className="text-danger">*</span></label>
                                                    <textarea className="form-control" id="exampleFormControlTextarea1" rows="3" name="sample3" placeholder=" "
                                                        {...register("sample3", {
                                                            required: "Sample Messages 3 is required",
                                                            minLength: MinLengthValidation(40),
                                                            maxLength: MaxLengthValidation(4096),
                                                        })} />
                                                    <p className="text-end caption-text mb-0">Character Count - <span className={`${watch('sample3') ? watch('sample3').length > 4096 || watch('sample3').length < 40 ? 'text-danger' : '' : ''}`}>{watch('sample3') ? watch('sample3').length : 0}</span>/ Length must be between 40 and 4096</p>
                                                    {errors.sample3 && (
                                                        <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                            {errors.sample3.message}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <h5 className="mb-1 text-primary fw-500">Sample Multimedia</h5>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label for="customFile" className="form-label custom-file-input">Choose Files <span className="text-danger">*</span></label>
                                                    <input
                                                        className="form-control"
                                                        type="file"
                                                        id="customFile"
                                                        accept="image/*" // Allows only image files
                                                        {...register("file", {
                                                            validate: (value) => {
                                                                if (!sampleFile?.base64WithoutPrefix && !value?.length) {
                                                                    return "Sample Multimedia is required";
                                                                }
                                                                return true;
                                                            },
                                                        })}
                                                        onChange={handleFileChange}
                                                    />
                                                    {errors.file && (
                                                        <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                            {errors.file.message}
                                                        </div>

                                                    )}
                                                    {(sampleFile?.preview) && (
                                                        <img
                                                            src={sampleFile?.preview} // Use uploaded file preview or existing file URL
                                                            alt="sample-file"
                                                            className="img-fluid mt-2"
                                                        />
                                                    )}

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button type="button" name="next" className="btn btn-primary next action-button float-end mb-3  mt-2 px-4" value="Next" onClick={handleNext}>Next</button>
                                    <button type="button" name="previous" className="btn btn-dark previous action-button-previous float-end me-3 mb-3  mt-2" value="Previous" onClick={handlePrevious}>Previous</button>
                                </fieldset>
                            )}
                            {currentStep === 4 && (
                                <fieldset style={{ opacity: currentStep === 4 ? 1 : 0, position: 'relative', display: currentStep === 4 ? 'block' : 'none' }}>
                                    <div className="form-card text-start">
                                        <div className="row">
                                            <div className="col-12">
                                                <h5 className="mb-1 text-primary fw-500">Content Attributes</h5>
                                            </div>
                                            <div className="table-responsive">
                                                <table className="table table-borderless">
                                                    <thead>
                                                        <tr>
                                                            <th scope="col">Attributes<span className="text-danger">*</span></th>
                                                            <th scope="col">Description <span className="text-danger">*</span></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td className="align-content-around col-md-2">
                                                                <div className="form-check d-block">
                                                                    <input className="form-check-input" type="checkbox" id="flexCheckDefault3" name="subscriberOptin" placeholder=" "
                                                                        {...register("subscriberOptin", {
                                                                            // required: "Sample Messages 3 is required",
                                                                        })}
                                                                        // value="true" // Ensure it's always checked
                                                                        disabled
                                                                    />
                                                                    <label className="form-check-label" for="flexCheckDefault3">
                                                                        Subscribe Opt-In
                                                                    </label>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="form-group  ">
                                                                    <label className="form-label">Type Opt-in Key words here</label>
                                                                    <input type="text" className="form-control" name="optinKeywords" {...register("optinKeywords", {
                                                                        required: "Opt-in Key words is required",
                                                                        validate: (value) => {
                                                                            const keywords = value?.split(",")?.map((word) => word?.trim())?.filter(Boolean);
                                                                            return keywords.length > 0 ? true : "Please enter at least one keyword separated by commas.";
                                                                        }
                                                                    })} placeholder=""
                                                                    // disabled={!watch("subscriberOptin")}
                                                                    />
                                                                    {errors.optinKeywords && (
                                                                        <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                                            {errors.optinKeywords.message}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="form-group  ">
                                                                    <label className="form-label">Opt-in Messages here</label>
                                                                    <input type="text" className="form-control" name="optinMessage" {...register("optinMessage", {
                                                                        required: "Opt-in Message is required",
                                                                        minLength: MinLengthValidation(20)
                                                                    })} placeholder=""
                                                                    // disabled={!watch("subscriberOptin")}
                                                                    />
                                                                    {errors.optinMessage && (
                                                                        <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                                            {errors.optinMessage.message}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="align-content-around">
                                                                <div className="form-check d-block">
                                                                    <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault4" name="subscriberOptout" placeholder=" "
                                                                        {...register("subscriberOptout", {
                                                                            // required: "Sample Messages 3 is required",
                                                                        })}
                                                                        disabled />
                                                                    <label className="form-check-label" for="flexCheckDefault4">
                                                                        Subscribe Opt-Out
                                                                    </label>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="form-group  ">
                                                                    <label className="form-label">Type Opt-out Key words here</label>
                                                                    <input type="text" className="form-control" name="optoutKeywords" {...register("optoutKeywords", {
                                                                        required: "Opt-out Key words is required",
                                                                        validate: (value) => {
                                                                            const keywords = value?.split(",")?.map((word) => word?.trim())?.filter(Boolean);
                                                                            return keywords.length > 0 ? true : "Please enter at least one keyword separated by commas.";
                                                                        }
                                                                    })} placeholder=" "
                                                                    // disabled={!watch("subscriberOptout")}
                                                                    />
                                                                    {errors.optoutKeywords && (
                                                                        <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                                            {errors.optoutKeywords.message}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="form-group  ">
                                                                    <label className="form-label">Opt-in Messages here</label>
                                                                    <input type="text" className="form-control" name="optoutMessage" {...register("optoutMessage", {
                                                                        required: "Opt-out Message is required",
                                                                        minLength: MinLengthValidation(20)
                                                                    })} placeholder=" "
                                                                    // disabled={!watch("subscriberOptout")}
                                                                    />
                                                                    {errors.optoutMessage && (
                                                                        <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                                            {errors.optoutMessage.message}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="align-content-around">
                                                                <div className="form-check d-block">
                                                                    <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault5" name="subscriberHelp" placeholder=" "
                                                                        {...register("subscriberHelp", {
                                                                            // required: "Sample Messages 3 is required",
                                                                        })}

                                                                        disabled />
                                                                    <label className="form-check-label" for="flexCheckDefault5">
                                                                        Subscriber Help
                                                                    </label>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="form-group  ">
                                                                    <label className="form-label">Help Key words here</label>
                                                                    <input type="text" className="form-control" name="helpKeywords" {...register("helpKeywords", {
                                                                        required: "Help Key words is required",
                                                                        validate: (value) => {
                                                                            const keywords = value?.split(",")?.map((word) => word?.trim())?.filter(Boolean);
                                                                            return keywords.length > 0 ? true : "Please enter at least one keyword separated by commas.";
                                                                        }
                                                                    })} placeholder=" "
                                                                    // disabled={!watch("subscriberHelp")}
                                                                    />
                                                                    {errors.helpKeywords && (
                                                                        <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                                            {errors.helpKeywords.message}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="form-group  ">
                                                                    <label className="form-label">Help Messages here</label>
                                                                    <input type="text" className="form-control" name="helpMessage" {...register("helpMessage", {
                                                                        required: "Help Messages is required",
                                                                        minLength: MinLengthValidation(20)
                                                                    })} placeholder=" "
                                                                    // disabled={!watch("subscriberHelp")}
                                                                    />
                                                                    {errors.helpMessage && (
                                                                        <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                                            {errors.helpMessage.message}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="align-content-around">
                                                                <div className="form-check d-block">
                                                                    <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault55" name="embeddedLink" placeholder=" "
                                                                        {...register("embeddedLink", {
                                                                            // required: "Sample Messages 3 is required",
                                                                        })}
                                                                        disabled />
                                                                    <label className="form-check-label" for="flexCheckDefault55">
                                                                        Embedded Link
                                                                    </label>
                                                                </div>
                                                            </td>
                                                            <td colspan="2">
                                                                <p>Indicates whether the campaign is using an embedded link of any kind. Note that public URL shorteners
                                                                    such as Bitly and TinyURL aren't accepted.
                                                                </p>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="align-content-around">
                                                                <div className="form-check d-block">
                                                                    <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault6" name="numberPool" placeholder=" "
                                                                        {...register("numberPool", {
                                                                            // required: "Sample Messages 3 is required",
                                                                        })}
                                                                        disabled />
                                                                    <label className="form-check-label" for="flexCheckDefault6">
                                                                        Number Pooling
                                                                    </label>
                                                                </div>
                                                            </td>
                                                            <td colspan="2">
                                                                <p>Select this if you intend on using 50+ numbers as this will require a different provisioning process on T-Mobile.</p>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="align-content-around">
                                                                <div className="form-check d-block">
                                                                    <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault7" name="directLending" placeholder=" "
                                                                        {...register("directLending", {
                                                                            // required: "Sample Messages 3 is required",
                                                                        })}
                                                                        disabled />
                                                                    <label className="form-check-label" for="flexCheckDefault7">
                                                                        Direct Lending or Loan Arrangement

                                                                    </label>
                                                                </div>
                                                            </td>
                                                            <td colspan="2">
                                                                <p>Indicates whether the campaign includes content related to direct lending or other loan arrangements.</p>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="align-content-around">
                                                                <div className="form-check d-block">
                                                                    <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault8" name="embeddedPhone" placeholder=" "
                                                                        {...register("embeddedPhone", {
                                                                            // required: "Sample Messages 3 is required",
                                                                        })}
                                                                        disabled />
                                                                    <label className="form-check-label" for="flexCheckDefault8">
                                                                        Embedded Phone Number
                                                                    </label>
                                                                </div>
                                                            </td>
                                                            <td colspan="2">
                                                                <p>Indicates whether the campaign is using an embedded phone number (except the required help information contact number)</p>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="align-content-around">
                                                                <div className="form-check d-block">
                                                                    <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault10" name="ageGated" placeholder=" "
                                                                        {...register("ageGated", {
                                                                            // required: "Sample Messages 3 is required",
                                                                        })}
                                                                        disabled />
                                                                    <label className="form-check-label" for="flexCheckDefault10">
                                                                        Age-Gated Content
                                                                    </label>
                                                                </div>
                                                            </td>
                                                            <td colspan="2">
                                                                <p>Indicates whether the campaign includes any age-gated content as defined by carrier and CTIA guidelines.</p>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="align-content-around">
                                                                <div className="form-check d-block">
                                                                    <input className="form-check-input" type="checkbox" id="flexCheckDefault10" name="termsAndConditions" placeholder=" " {...register("termsAndConditions")}

                                                                        disabled />
                                                                    <label className="form-check-label" for="flexCheckDefault10">
                                                                        Terms & Conditions
                                                                    </label>
                                                                </div>
                                                            </td>
                                                            <td colspan="2">
                                                                <p>I confirm that this campaign will not be used for Affiliate</p>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                            <h5 className="mb-2 text-primary fw-500">Other Responsibilities Parties</h5>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label className="form-label">
                                                        Select your Connectivity Partner <span className="text-danger">*</span>
                                                    </label>
                                                    <select className="form-select" name="choices-single-default" id="choices-single-default" disabled>
                                                        <option value="Choice 1" selected>Vitel Global</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label className="form-label">
                                                        Select If Reseller Involved <span className="text-danger">*</span>
                                                    </label>
                                                    <select className="form-select" name="choices-single-default" id="choices-single-default" {...register("resellerId")} disabled>
                                                        <option value="R000000" selected>NO Reseller</option>
                                                    </select>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                    <button className="btn btn-primary  float-end mb-3  mt-2 px-4" type='submit' disabled={isLoading}>{isLoading ? 'Submitting...' : 'Submit'}</button>
                                    <button type="button" name="previous" className="btn btn-dark previous action-button-previous float-end me-3 mb-3  mt-2" value="Previous" onClick={handlePrevious}>Previous</button>
                                </fieldset>
                            )}
                        </form>
                    </div>

                </Modal.Body>
            </Modal>
        </>
    )

}