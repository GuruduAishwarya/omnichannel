import React, { useEffect, useState } from 'react';
import PageTitle from '../../../common/PageTitle';
import { useForm, Controller } from 'react-hook-form';
import { MaxLengthValidation, MinLengthValidation, onlyAlphabetsandSpaces, onlyAlphaNumericSpaces, onlyNumbers } from '../../../utils/Constants';
import { fetchBrands, fetchCountryList, fetchStateList, fetchBrandsListing, fetchEntitiesList, fetchBrandRelationshipList, fetchVerticalList, fetchBrandEdit, fetchDeleteData, workspaceDetails } from '../../../utils/ApiClient';
import { triggerAlert, ConfirmationAlerts, ConfirmationAlert, pageReload } from '../../../utils/CommonFunctions';
import { Modal } from 'react-bootstrap';
import { formatDateTime } from '../../../utils/CommonFunctions';
import Loader from '../../../common/components/Loader';

export default function Brands() {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        clearErrors,
        setError,
        getValues,
        setValue,
        reset,
        trigger, watch,
    } = useForm();

    const [showCreateBrand, setShowCreateBrand] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Set initial loading state to true
    const [countryData, setCountriesData] = useState([]);
    const [stateData, setStatesData] = useState([]);
    const [showBrandStatus, setShowBrandStatus] = useState(false);
    const [showTable, setShowTable] = useState(true);
    const [selectedRowData, setSelectedRowData] = useState({});
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [brandListData, setBrandListData] = useState([]);
    const [entities, setEntities] = useState([]);
    const [brandRelationship, setBrandRelationship] = useState([]);
    const [vertical, setVertical] = useState([]);
    const countryCode = watch("country");
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

    const handleShowCreateBrand = () => {
        setShowCreateBrand(true);
        setSelectedRowData({});
        setIsEditMode(false);
        setCurrentStep(1);
        reset(); // Reset the form fields
    }

    const handleCloseCreateBrand = () => {
        setShowCreateBrand(false);
        setShowTable(true);
        reset();
    }

    const handleViewClick = (rowData) => {
        setSelectedRowData(rowData);
        setShowBrandStatus(true);
        setShowTable(false);
    }

    const handleDeleteClick = async (brand_id) => {
        if (!brand_id) {
            console.error("Brand ID is undefined.");
            return;
        }

        const isConfirmed = await ConfirmationAlert(
            'You want to continue?',
            'Continue',
            async () => {
                setIsLoading(true); // Start loading state
                try {
                    const response = await fetchDeleteData(brand_id);
                    const respdata = response.data.results;

                    if (response.data.error_code === 200) {
                        triggerAlert("success", "", "Brand deleted successfully"); // Success alert
                        setBrandListData(respdata);
                        BrandListing();
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
    };

    const handleEditClick = async (rowData) => {
        setSelectedRowData(rowData);
        setShowCreateBrand(true);
        setShowTable(false);
        setIsEditMode(true);
        setCurrentStep(1);

        // Populate the form fields with the selected row data
        setValue("brand_id", rowData.brand_id);
        setValue("companyName", rowData.company_name);
        setValue("displayName", rowData.display_name);
        setValue("entityType", rowData.organization_type);
        setValue("countryOfRegistration", rowData.country);
        setValue("ein", rowData.ein);
        setValue("einIssuingCountry", rowData.ein_issuing_country);
        setValue("website", rowData.website);
        setValue("vertical", rowData.vertical);
        setValue("tag", rowData.tag);
        setValue("brandRelationship", rowData.brand_relationship);
        setValue("firstName", rowData.first_name);
        setValue("lastName", rowData.last_name);
        setValue("street", rowData.street);
        setValue("city", rowData.city);
        setValue("postalCode", rowData.postal_code);
        setValue("country", rowData.country);
        setValue("email", rowData.email);
        setValue("phone", rowData.phone);

        // Fetch states data based on the country of the selected row
        await fetchStatesData(rowData.country);

        // Set the state value after fetching the states data
        setValue("state", rowData.state);

        // Reset form errors
        clearErrors();
    };



    const handleBackClick = () => {
        setShowBrandStatus(false);
        setShowTable(true);
        setSelectedRowData({});
    }

    const fetchCountriesData = async () => {
        try {
            const response = await fetchCountryList();
            const respdata = response.data.results.data;
            setCountriesData(respdata);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchStatesData = async (countryCode) => {
        try {
            const response = await fetchStateList(countryCode);
            const respdata = response.data.results.data;
            setStatesData(respdata);
        } catch (error) {
            console.error("Error fetching states data:", error);
        }
    };

    useEffect(() => {
        if (countryCode) {
            fetchStatesData(countryCode);
        }
    }, [countryCode]);



    // const filteredStates = stateData.filter(
    //     (state) => state.country_code_char2 === selectedCountryCode
    // );

    const createBrand = async (data) => {
        console.log(data);

        handleCloseCreateBrand(); // Close the modal first

        if (!isEditMode) {
            const isConfirmed = await ConfirmationAlerts(
                'Please confirm that the EIN/Tax ID, Legal Name, and Address provided match your business registration. A mismatch may result in automatic rejection by TCR with a non-refundable fee.',
                'Confirm',
                async () => {
                    const isPaymentConfirmed = await ConfirmationAlerts(
                        'A one-time, non-refundable payment of $10 is required to register each brand.',
                        'Confirm',
                        async () => {
                            await submitBrandData(data);
                        }
                    );

                    if (!isPaymentConfirmed) return;
                }
            );

            if (!isConfirmed) return;
        } else {
            await submitBrandData(data);
        }
    };

    const submitBrandData = async (data) => {
        try {
            const { brand_id, ...formDataFields } = data;
            const formData = new FormData();

            Object.entries(formDataFields).forEach(([key, value]) => {
                if (key === "state") {
                    const stateCode = stateData.find(state => state.state_code === value)?.state_code;
                    formData.append(key, stateCode);
                } else {
                    formData.append(key, value);
                }
            });

            formData.append("profile_id", "");
            formData.append("mock", false);
            formData.append("identity_status", "pending");

            setIsLoading(true);
            let response;
            if (brand_id) {
                response = await fetchBrandEdit(brand_id, formData);
            } else {
                response = await fetchBrands(formData);
            }

            const responseData = response.data;
            if (responseData.error_code === 200) {
                triggerAlert('success', 'Success', brand_id ? 'Brand updated successfully!' : 'Brand created successfully!');
                pageReload();
            } else {
                triggerAlert('error', 'Error', responseData.message || "Failed to process brand!");
            }
        } catch (error) {
            const responseData = error?.response?.data;
            triggerAlert('error', 'Oops...', responseData ? responseData.message : "Something went wrong!");
        } finally {
            setIsLoading(false);
        }
    };


    const handleNext = async () => {
        const isValid = await trigger();
        if (isValid) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        setCurrentStep(currentStep - 1);
    };

    const BrandListing = async () => {
        try {
            const response = await fetchBrandsListing();
            const respdata = response.data.results;
            setBrandListData(respdata);
        } catch (error) {
            console.error("Error fetching brand listing:", error);
        } finally {
            setIsLoading(false); // Stop loading state
        }
    };

    const fetchBrandTypes = async () => {
        try {
            const [entitiesResponse, brandRelationshipResponse, verticalResponse] = await Promise.all([
                fetchEntitiesList(),
                fetchBrandRelationshipList(),
                fetchVerticalList()
            ]);

            const entitiesData = entitiesResponse.data.results;
            const brandRelationshipData = brandRelationshipResponse.data.results;
            const verticalData = verticalResponse.data.results;

            setEntities(entitiesData);
            setBrandRelationship(brandRelationshipData);
            setVertical(verticalData);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchCountriesData();
        fetchBrandTypes();
        BrandListing();
    }, []);

    const verticalMapping = {
        "professional-services": "PROFESSIONAL_SERVICES",
        "real-estate": "REAL_ESTATE",
        "healthcare-and-lifesciences": "HEALTHCARE_AND_LIFESCIENCES",
        "human-resources-staffing-recruitment": "HUMAN_RESOURCES",
        "energy-and-utilities": "ENERGY_AND_UTILITIES",
        "entertainment": "ENTERTAINMENT",
        "retail-and-consumer-products": "RETAIL_AND_CONSUMER_PRODUCTS",
        "transportation-logistics": "TRANSPORTATION_OR_LOGISTICS",
        "agriculture": "AGRICULTURE",
        "insurance": "INSURANCE",
        "postal-delivery": "POSTAL_AND_DELIVERY",
        "education": "EDUCATION",
        "hospitality": "HOSPITALITY_AND_TRAVEL",
        "financial-services": "FINANCIAL_SERVICES",
        "political": "POLITICAL",
        "gambling-and-lottery": "GAMBLING_AND_LOTTERY",
        "legal": "LEGAL",
        "construction-and-materials": "CONSTRUCTION_MATERIALS_AND_TRADE_SERVICES",
        "non-profit-organization": "NON_PROFIT_ORGANIZATION",
        "manufacturing": "MANUFACTURING",
        "public-sector": "GOVERNMENT_SERVICES_AND_AGENCIES",
        "information-technology-services": "INFORMATION_TECHNOLOGY_SERVICES",
        "mass-media-and-communication": "MEDIA_AND_COMMUNICATION"
    };

    return (
        <>
            {isLoading && (
                <div className="text-center">
                    <Loader />
                </div>
            )}
            {!isLoading && showTable && (
                <div className="row mb-3">
                    <div className="col-sm-12">
                        {buttonLoading ? (
                            <div className="d-flex align-items-center mb-3">
                                <h4 className="mb-0 me-3"> </h4>
                                <div className="spinner-border spinner-border-sm" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                <PageTitle heading=" " showPrimaryButton={hideButton ? "Create Brand" : null} onPrimaryClick={hideButton ? handleShowCreateBrand : null} />
                                {!hideButton && messageError && (
                                    <div className="text-danger mt-2">
                                        {messageError}
                                    </div>
                                )}
                            </>
                        )}
                        <div className="card-body pt-2">
                            <div className="table-responsive">
                                <table id="example" className="table table-striped table-bordered hover align-middle" cellSpacing="0" width="100%">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Brand Name</th>
                                            <th>Brand ID</th>
                                            <th>Registered On</th>
                                            <th>Company Name</th>
                                            <th>Country</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {brandListData?.length > 0 ? (
                                            brandListData.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{item.display_name ? item.display_name : '-'}</td>
                                                    <td>{item.brand_id ? item.brand_id : '-'}</td>
                                                    <td>{item.date ? formatDateTime(item.date, 'yyyy-mm-dd hh:mm:ss') : '-'}</td>
                                                    <td>{item.company_name ? item.company_name : '-'}</td>
                                                    <td>{item.country ? item.country : '-'}</td>
                                                    {/* <td>{item.status === "1" ? "Active" : item.status || '-'}</td> */}
                                                    {/* <td>
                                                        {item.status === "1" ? (
                                                            <span className="badge bg-success border-radius rounded-pill">Active</span>
                                                        ) : (
                                                            item.status || '-'
                                                        )}
                                                    </td> */}
                                                    <td>{item.identity_status ? item.identity_status : '-'}</td>


                                                    <td>
                                                        <a className="" href="#" onClick={() => handleViewClick(item)}><span className="material-symbols-outlined me-2 md-18">visibility</span></a>
                                                        <a className="" href="#" onClick={() => handleEditClick(item)}><span className="material-symbols-outlined me-2 md-18">edit_square</span></a>
                                                        <a className="" href="#" onClick={() => handleDeleteClick(item.brand_id)}>
                                                            <span className="material-symbols-outlined me-2 md-18">Delete</span>
                                                        </a>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="10" className="text-center">
                                                    No data available
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

            )}
            {showBrandStatus && selectedRowData && (
                <div className="row">
                    <div className="col-md-12">
                        <div className="mb-3 d-flex justify-content-end">
                            <button className="btn btn-primary" onClick={handleBackClick}>Back</button>
                        </div>
                        <div className="">
                            <div className="mb-3 bg-soft-info rounded font-size-18 p-3">
                                <div className="row">
                                    <h5 className="text-primary fw-500 mb-2">Brand Status</h5>
                                    <div className="col-md-6">
                                        <div className="d-flex flex-column justify-content-between">
                                            <div className="d-flex align-items-center mb-2">
                                                <h6 className="md-18 me-2 fw-500 mb-0"> Legal Company Name : </h6>
                                                <p className="mb-0 fw-500">{selectedRowData.company_name || '-'}</p>
                                            </div>
                                            <div className="d-flex align-items-center mb-1">
                                                <h6 className="md-18 me-2 fw-500 mb-0"> Universal EIN : </h6>
                                                <p className="mb-0 fw-500">{selectedRowData.ein || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="d-flex flex-column justify-content-between">
                                            <div className="d-flex align-items-center mb-1">
                                                <h6 className="md-18 me-2 fw-500 mb-0">Brand ID : </h6>
                                                <p className="mb-0 fw-500">{selectedRowData.brand_id || '-'}</p>
                                            </div>
                                            <div className="d-flex align-items-center mb-1">
                                                <h6 className="md-18 me-2 fw-500 mb-0"> Status : </h6>
                                                <p className="mb-0 fw-500">{selectedRowData.status === "1" ? "Verified" : "Pending" || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mb-3 bg-soft-info rounded font-size-18 p-3">
                                <div className="row">
                                    <h5 className="text-primary fw-500 mb-2">Company Details</h5>
                                    <div className="col-md-6">
                                        <div className="d-flex flex-column justify-content-between">
                                            <div className="d-flex align-items-center mb-2">
                                                <h6 className="md-18 me-2 fw-500 mb-0"> Brand Name Or DBA : </h6>
                                                <p className="mb-0 fw-500">{selectedRowData.display_name || '-'}</p>
                                            </div>
                                            <div className="d-flex align-items-center mb-2">
                                                <h6 className="md-18 me-2 fw-500 mb-0">EIN Issuing Country : </h6>
                                                <p className="mb-0 fw-500">{selectedRowData.ein_issuing_country || '-'}</p>
                                            </div>
                                            <div className="d-flex align-items-center mb-2">
                                                <h6 className="md-18 me-2 fw-500 mb-0">Address/Street : </h6>
                                                <p className="mb-0 fw-500">{selectedRowData.street || '-'}</p>
                                            </div>
                                            <div className="d-flex align-items-center mb-2">
                                                <h6 className="md-18 me-2 fw-500 mb-0">Postal Code : </h6>
                                                <p className="mb-0 fw-500">{selectedRowData.postal_code || '-'}</p>
                                            </div>
                                            <div className="d-flex align-items-center mb-2">
                                                <h6 className="md-18 me-2 fw-500 mb-0">Website/ Online presence : </h6>
                                                <p className="mb-0 fw-500">{selectedRowData.website || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="d-flex flex-column justify-content-between">
                                            <div className="d-flex align-items-center mb-2">
                                                <h6 className="md-18 me-2 fw-500 mb-0"> Entity Type : </h6>
                                                <p className="mb-0 fw-500">{selectedRowData.organization_type || '-'}</p>
                                            </div>
                                            <div className="d-flex align-items-center mb-2">
                                                <h6 className="md-18 me-2 fw-500 mb-0"> Vertical : </h6>
                                                <p className="mb-0 fw-500">{selectedRowData.vertical || '-'}</p>
                                            </div>
                                            <div className="d-flex align-items-center mb-2">
                                                <h6 className="md-18 me-2 fw-500 mb-0"> City : </h6>
                                                <p className="mb-0 fw-500">{selectedRowData.city || '-'}</p>
                                            </div>
                                            <div className="d-flex align-items-center mb-2">
                                                <h6 className="md-18 me-2 fw-500 mb-0"> Country : </h6>
                                                <p className="mb-0 fw-500">{selectedRowData.country || '-'}</p>
                                            </div>
                                            <div className="d-flex align-items-center mb-2">
                                                <h6 className="md-18 me-2 fw-500 mb-0"> Registered On : </h6>
                                                <p className="mb-0 fw-500">
                                                    {selectedRowData.date ? formatDateTime(selectedRowData.date, 'yyyy-mm-dd hh:mm:ss') : '-'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mb-3 bg-soft-info rounded font-size-18 p-3">
                                <div className="row">
                                    <h5 className="text-primary fw-500 mb-2">Support Contact Details</h5>
                                    <div className="col-md-6">
                                        <div className="d-flex flex-column justify-content-between">
                                            <div className="d-flex align-items-center mb-2">
                                                <h6 className="md-18 me-2 fw-500 mb-0"> Support Email Address : </h6>
                                                <p className="mb-0 fw-500">{selectedRowData.email || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="d-flex flex-column justify-content-between">
                                            <div className="d-flex align-items-center mb-2">
                                                <h6 className="md-18 me-2 fw-500 mb-0"> Support Phone Number : </h6>
                                                <p className="mb-0 fw-500">{selectedRowData.phone || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Modal show={showCreateBrand} onHide={handleCloseCreateBrand} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{isEditMode ? 'Edit Brand' : 'Create Brand'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="card-body">
                        <form id="form-wizard1" className="text-center" onSubmit={handleSubmit(createBrand)}>
                            <input type="hidden" name="brand_id" value={selectedRowData.brand_id || ''} {...register("brand_id")} />
                            <ul id="top-tab-list" className="p-0 row list-inline justify-content-center mb-3">
                                <li
                                    className={`col-lg-4 col-md-6 text-start mb-2 ${currentStep > 1 ? 'active done' : ''} ${currentStep === 1 ? 'active' : ''}`}
                                    id="account"
                                >
                                    <a href="javascript:void(0);">
                                        <span>1. Add Company Details</span>
                                    </a>
                                </li>
                                <li
                                    id="personal"
                                    className={`col-lg-4 col-md-6 mb-2 text-start ${currentStep > 2 ? 'done' : ''} ${currentStep === 2 ? 'active' : ''}`}
                                >
                                    <a href="javascript:void(0);">
                                        <span>2. Address and Contact</span>
                                    </a>
                                </li>
                            </ul>

                            {currentStep === 1 && (
                                <fieldset style={{ position: 'relative', opacity: currentStep === 1 ? 1 : 0, display: currentStep === 1 ? 'block' : 'none' }}>
                                    <div className="form-card text-start">
                                        <div className="row">
                                            <div className="col-7">
                                                <h5 className="mb-3 text-primary fw-500">Company Details</h5>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label" htmlFor="companyName">
                                                        Legal Company Name <span className='text-danger'>*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="companyName"
                                                        id="companyName"
                                                        placeholder="Enter Company name"
                                                        {...register("companyName", {
                                                            required: "Legal Company name is required",
                                                            pattern: onlyAlphaNumericSpaces,
                                                            minLength: MinLengthValidation(2),
                                                            maxLength: MaxLengthValidation(100)
                                                        })}
                                                        onChange={() => clearErrors("companyName")}
                                                    />
                                                    {errors.companyName && (
                                                        <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                                                            {errors.companyName.message}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label">DBA or Brand Name if Diff. from Legal Name <span className='text-danger'>*</span></label>
                                                    <input type="text" className="form-control" name="displayName" placeholder="DBA or Brand Name if Diff. from Legal Name"
                                                        {...register("displayName", {
                                                            required: "DBA or Brand Name is required",
                                                            pattern: onlyAlphaNumericSpaces,
                                                            minLength: MinLengthValidation(2),
                                                            maxLength: MaxLengthValidation(100)
                                                        })}
                                                        onChange={() => clearErrors("displayName")}
                                                    />
                                                    {errors.displayName && (
                                                        <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                                                            {errors.displayName.message}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label">What type of legal form is the Organization? <span className='text-danger'>*</span></label>
                                                    <select
                                                        className="form-select"
                                                        {...register("entityType", { required: "Please select an organization type." })}
                                                        name="entityType"
                                                        id="entityType"
                                                        onChange={(e) => {
                                                            clearErrors("entityType");
                                                            setValue("entityType", e.target.value);
                                                        }}
                                                    >
                                                        <option value="" hidden>Select Organization</option>
                                                        {entities && entities.length > 0 ? (
                                                            entities.map((item, index) => (
                                                                <option key={index} value={item}>
                                                                    {item}
                                                                </option>
                                                            ))
                                                        ) : (
                                                            <option value="">No data available</option>
                                                        )}
                                                    </select>
                                                    {errors.entityType && (
                                                        <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                                                            {errors.entityType.message}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label">Country Of Registration <span className='text-danger'>*</span> </label>
                                                    <select className="form-select" {...register("countryOfRegistration", { required: "Please select a country of registration." })} name="countryOfRegistration" id="countryOfRegistration"
                                                        onChange={(e) => {
                                                            clearErrors("countryOfRegistration");
                                                            setValue("countryOfRegistration", e.target.value);
                                                        }}>
                                                        <option value="" hidden>Select Country</option>
                                                        {countryData.map((item) => (
                                                            <option key={item.country_code_char2} value={item.country_code_char2}>
                                                                {item.country_name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {errors.countryOfRegistration && (
                                                        <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                                                            {errors.countryOfRegistration.message}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label">
                                                        Tax Number/ID/EIN <span className='text-danger'>*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="ein"
                                                        placeholder="Tax Number/ID/EIN"
                                                        maxLength={9}
                                                        {...register("ein", {
                                                            required: "Tax Number/ID/EIN is required",
                                                            pattern: {
                                                                value: /^[a-zA-Z0-9 ]+$/,
                                                                message: "Only alphanumeric characters and spaces are allowed"
                                                            },
                                                            validate: value =>
                                                                value.length === 9 || "EIN must be exactly 9 characters"
                                                        })}
                                                    />
                                                    {errors.ein && (
                                                        <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                                                            {errors.ein.message}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label">Tax Number/ID/EIN issuing Country <span className='text-danger'>*</span></label>
                                                    <select className="form-select" {...register("einIssuingCountry", { required: "Please select the issuing country." })} name="einIssuingCountry" id="einIssuingCountry"
                                                        onChange={(e) => {
                                                            clearErrors("einIssuingCountry");
                                                            setValue("einIssuingCountry", e.target.value);
                                                        }} >
                                                        <option value="" hidden>Select issuing Country</option>
                                                        {countryData.map((item) => (
                                                            <option key={item.country_code_char2} value={item.country_code_char2}>
                                                                {item.country_name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {errors.einIssuingCountry && (
                                                        <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                                                            {errors.einIssuingCountry.message}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {/* <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label">DUNS or GIIN or LEI Number <span className='text-danger'>*</span></label>
                                                    <select className="form-select" {...register("dunsNumber", { required: "Please select a DUNS, GIIN, or LEI number." })} name="dunsNumber" id="dunsNumber"
                                                        onChange={(e) => {
                                                            clearErrors("dunsNumber");
                                                            setValue("dunsNumber", e.target.value);
                                                        }}>
                                                        <option value="" hidden>Select DUNS or GIIN or LEI Number</option>
                                                        <option value="123456">123456</option>
                                                        <option value="7891011">7891011</option>
                                                        <option value="13141516">13141516</option>
                                                    </select>
                                                    {errors.dunsNumber && (
                                                        <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                                                            {errors.dunsNumber.message}
                                                        </div>
                                                    )}
                                                </div>
                                            </div> */}
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label">Website/Online Presence<span className='text-danger'>*</span></label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="website"
                                                        placeholder="Website/Online Presence"
                                                        {...register("website", {
                                                            required: "Website/Online Presence is required",
                                                            pattern: {
                                                                value: /^(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+$/,
                                                                message: "Enter a valid website"
                                                            },
                                                            minLength: MinLengthValidation(2),
                                                            maxLength: MaxLengthValidation(100)
                                                        })}
                                                        onChange={() => clearErrors("website")}
                                                    />
                                                    {errors.website && (
                                                        <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                                                            {errors.website.message}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label">Vertical Type <span className='text-danger'>*</span></label>
                                                    <select
                                                        className="form-select"
                                                        {...register("vertical", { required: "Please select a vertical type." })}
                                                        name="vertical"
                                                        id="vertical"
                                                        onChange={(e) => {
                                                            clearErrors("vertical");
                                                            setValue("vertical", e.target.value);
                                                        }}
                                                        value={getValues("vertical")} // Ensure the current value is set
                                                    >
                                                        <option value="" hidden>Select Type</option>
                                                        {vertical && Object.keys(vertical).length > 0 ? (
                                                            Object.keys(vertical).map((key) => (
                                                                <option key={key} value={key}>
                                                                    {vertical[key].displayName.toUpperCase()}
                                                                </option>
                                                            ))
                                                        ) : (
                                                            <option value="">No data available</option>
                                                        )}
                                                    </select>
                                                    {errors.vertical && (
                                                        <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                                                            {errors.vertical.message}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label">Tag<span className='text-danger'>*</span></label>
                                                    <input type="text" className="form-control" name="tag" placeholder="Reference ID "
                                                        {...register("tag", {
                                                            required: "Reference ID is required",
                                                            pattern: onlyAlphaNumericSpaces,
                                                            minLength: MinLengthValidation(2),
                                                            maxLength: MaxLengthValidation(100)
                                                        })}
                                                        onChange={() => clearErrors("tag")}
                                                    />
                                                    {errors.tag && (
                                                        <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                                                            {errors.tag.message}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label">Brand Relationship <span className='text-danger'>*</span></label>
                                                    <select
                                                        className="form-select"
                                                        {...register("brandRelationship", { required: "Please select a brand relationship." })}
                                                        name="brandRelationship"
                                                        id="choices-single-default"
                                                        onChange={(e) => {
                                                            clearErrors("brandRelationship");
                                                            setValue("brandRelationship", e.target.value);
                                                        }}
                                                    >
                                                        <option value="" hidden>Select Relationship</option>
                                                        {brandRelationship && brandRelationship.length > 0 ? (
                                                            brandRelationship.map((item, index) => (
                                                                <option key={index} value={item}>
                                                                    {item}
                                                                </option>
                                                            ))
                                                        ) : (
                                                            <option value="">No data available</option>
                                                        )}
                                                    </select>
                                                    {errors.brandRelationship && (
                                                        <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                                                            {errors.brandRelationship.message}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label" htmlFor="firstName">
                                                        First Name <span className='text-danger'>*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="firstName"
                                                        id="firstName"
                                                        placeholder="Enter First Name"
                                                        {...register("firstName", {
                                                            required: "First Name is required",
                                                            pattern: onlyAlphaNumericSpaces,
                                                            minLength: MinLengthValidation(2),
                                                            maxLength: MaxLengthValidation(100)
                                                        })}
                                                        onChange={() => clearErrors("firstName")}
                                                    />
                                                    {errors.firstName && (
                                                        <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                                                            {errors.firstName.message}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label" htmlFor="lastName">
                                                        Last Name <span className='text-danger'>*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="lastName"
                                                        id="lastName"
                                                        placeholder="Enter Last Name"
                                                        {...register("lastName", {
                                                            required: "Last Name is required",
                                                            pattern: onlyAlphaNumericSpaces,
                                                            minLength: MinLengthValidation(2),
                                                            maxLength: MaxLengthValidation(100)
                                                        })}
                                                        onChange={() => clearErrors("lastName")}
                                                    />
                                                    {errors.lastName && (
                                                        <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                                                            {errors.lastName.message}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                    <button type="button" name="next" className="btn btn-primary next action-button float-end px-4 mb-3" value="Next" onClick={handleNext}>Next</button>
                                </fieldset>
                            )}
                            {currentStep === 2 && (
                                <fieldset style={{ position: 'relative', opacity: currentStep === 2 ? 1 : 0, display: currentStep === 2 ? 'block' : 'none' }}>
                                    <div className="form-card text-start">
                                        <div className="row">
                                            <div className="col-7">
                                                <h5 className="mb-3 text-primary fw-500">Company Address</h5>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label">Address/Street <span className='text-danger'>*</span></label>
                                                    <input type="text" className="form-control" name="street" id="street" placeholder="Address/Street"
                                                        {...register("street", { required: "Street is required" })}
                                                        onChange={() => clearErrors("street")}
                                                    />
                                                    {errors.street && (
                                                        <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                                                            {errors.street.message}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label">City <span className='text-danger'>*</span></label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="city"
                                                        id="city"
                                                        placeholder="Enter City"
                                                        {...register("city", { required: "City is required" })}
                                                        onChange={(e) => {
                                                            clearErrors("city");
                                                            setValue("city", e.target.value);
                                                        }}
                                                    />
                                                    {errors.city && (
                                                        <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                                                            {errors.city.message}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label">ZIP Code <span className='text-danger'>*</span></label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="postalCode"
                                                        placeholder="Enter ZIP Code"
                                                        {...register("postalCode", { required: "ZIP Code is required" })}
                                                        onChange={(e) => {
                                                            clearErrors("postalCode");
                                                            setValue("postalCode", e.target.value);
                                                        }}
                                                    />
                                                    {errors.postalCode && (
                                                        <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                                                            {errors.postalCode.message}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label">Country <span className='text-danger'>*</span></label>
                                                    <select
                                                        id="inputState"
                                                        className="form-select"
                                                        name="country"
                                                        {...register("country", { required: "Country is required" })}
                                                        onChange={async (e) => {
                                                            clearErrors("country");
                                                            await fetchStatesData(e.target.value);
                                                            setValue("state", ""); // Reset state value when country changes
                                                        }}
                                                        autoComplete="off"
                                                    >
                                                        <option value="" hidden>Select</option>
                                                        {countryData.map((item, index) => (
                                                            <option value={item.country_code_char2} key={index}>
                                                                {item.country_name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {errors.country && (
                                                        <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                                                            {errors.country.message}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>


                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label">State/Region <span className='text-danger'>*</span></label>
                                                    <Controller
                                                        name="state"
                                                        control={control}
                                                        rules={{ required: "State is required" }}
                                                        render={({ field }) => (
                                                            <select
                                                                className="form-select"
                                                                {...field}
                                                            >
                                                                <option value="" hidden>Select</option>
                                                                {stateData.map((item) => (
                                                                    <option key={item.state_code} value={item.state_code}>
                                                                        {item.state_subdivision_name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        )}
                                                    />

                                                    {errors.state && (
                                                        <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                                                            {errors.state.message}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-12">
                                                    <h5 className="mb-1 text-primary fw-500">Contact Details</h5>
                                                    <p>You will be contacted by TCR, If additional brand information is needed</p>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label">Support Email Address <span className='text-danger'>*</span></label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="email"
                                                        placeholder="Support Email Address"
                                                        {...register("email", {
                                                            required: "Support Email Address is required",
                                                            pattern: {
                                                                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                                                message: "Enter a valid email address (e.g., example@domain.com)"
                                                            },
                                                            minLength: MinLengthValidation(5),
                                                            maxLength: MaxLengthValidation(100)
                                                        })}
                                                        onChange={() => clearErrors("email")}
                                                    />
                                                    {errors.email && (
                                                        <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                                                            {errors.email.message}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label">Support Phone Number <span className='text-danger'>*</span></label>
                                                    <input type="text" className="form-control" name="phone" placeholder="Support Phone Number"
                                                        {...register("phone", {
                                                            required: "Support Phone Number is required",
                                                            pattern: onlyAlphaNumericSpaces,
                                                            minLength: MinLengthValidation(2),
                                                            maxLength: MaxLengthValidation(100)
                                                        })}
                                                        onChange={() => clearErrors("phone")}
                                                    />
                                                    {errors.phone && (
                                                        <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                                                            {errors.phone.message}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn btn-primary float-end px-4 mb-3 mt-2"
                                        disabled={isLoading} // Disable button while processing
                                    >
                                        {isLoading ? (isEditMode ? "Updating..." : "Submitting...") : (isEditMode ? "Update" : "Submit")}
                                    </button>

                                    <button type="button" name="previous" className="btn btn-dark previous action-button-previous float-end me-3 mb-3 mt-2" value="Previous" onClick={handlePrevious}>Previous</button>
                                </fieldset>
                            )}
                        </form>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    )
}
