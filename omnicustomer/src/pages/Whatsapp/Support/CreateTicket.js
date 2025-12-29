import React, { useState, useEffect } from "react";
import SunEditor from 'suneditor-react'
import plugins from 'suneditor/src/plugins'
import { en } from 'suneditor/src/lang'
import katex from 'katex'
import 'suneditor/dist/css/suneditor.min.css'
import 'katex/dist/katex.min.css'
import PageTitle from '../../../common/PageTitle';
import { Link, useNavigate } from "react-router-dom";
import { fetchParentCreateTickect, fetchParentTickect, captchrefresh, fetchCreateTicket, fetchTicketListData, fetchUserDetailsData, fetchWorkspace } from '../../../utils/ApiClient';
import Loader from '../../../common/components/Loader';
import {
    Table,
    Container,
    Row,
    Col,
    Form,
    Button,
    Modal,
} from "react-bootstrap"; // popup
import { useForm, Controller } from "react-hook-form";
import {
    triggerAlert,
    AlertWithButton,
    // getCustomerId,
    getToken,
    getBase64,
    pageReload,
} from '../../../utils/CommonFunctions';
import Base64Preview from '../../../common/FilePreview';
export function formatDate(dateString) {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, options);
}
export default function CreateTicket() {
    const [subcategory, setSubcategory] = useState([]);
    const [isLoading, setIsLoading] = useState();
    const [isLoadingCreate, setIsLoadingCreate] = useState();
    const [parentcategory, setParentcategory] = useState([]);
    const [secondFormErrors, setSecondFormErrors] = useState({});
    const [showCommentAndFile, setShowCommentAndFile] = useState(false); //showComment&file
    const [show, setShow] = useState(false);
    const [loadListStatus, setLoadListStatus] = useState(true);
    const [activeTab, setActiveTab] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPageLimit, setPerPageLimit] = useState(10);
    const [imageData, setImageData] = useState([]);
    const [userCaptchaInput, setUserCaptchaInput] = useState("");
    const [captchaUrl, setCaptchaUrl] = useState("");
    const [isCaptchaValid, setIsCaptchaValid] = useState("");
    const [tickets, setTickets] = useState([]);
    const [pageCount, setPageCount] = useState(0);
    const [pageSlNo, setPageSlNo] = useState(0);
    const [userData, setUserData] = useState([]);
    const token = getToken();
    const [workspaces, setWorkspaces] = useState([]);
    const navigate = useNavigate();


    const options = {
        plugins: plugins,
        height: 250,

        katex: katex,
        lang: en,
        buttonList: [
            [
                'font',
                'fontSize',
                'formatBlock',
                'bold',
                'underline',
                'italic',
                'paragraphStyle',
                'blockquote',
                'strike',
                'subscript',
                'superscript',
                'fontColor',
                'hiliteColor',
                'textStyle',
                'removeFormat',
                'undo',
                'redo',
                'outdent',
                'indent',
                'align',
                'horizontalRule',
                'list',
                'lineHeight',
                'table',
                'link',
                'image',
                'video',
                'audio',
                // You must add the 'katex' library at options to use the 'math' plugin.
                // 'math',
                // You must add the "imageGalleryUrl".

                'fullScreen',
                'showBlocks',
                'codeView',
                'preview',
                'print'

            ]
        ]
    }

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        control,
        clearErrors,
        // setValue,
        getValues,
        // trigger,
        setError
    } = useForm();

    const parentcateselection = (event) => {
        if (event.target.value) {
            fetchsubcategoryData(event.target.value);
        }
    };

    const fetchparent_category = async () => {
        try {
            const response = await fetchParentTickect();
            const response_data = response.data;

            if (response.data.error_code === 200) {
                const category = response_data.results;
                setParentcategory(category);
            } else {
                triggerAlert("error", "Oops...", "Something went wrong..");
            }
        } catch (error) {
            console.log(error);
            triggerAlert("error", "Oops...", "Something went wrong..");
        }
    };

    useEffect(() => {
        refreshCaptcha();
    }, []);


    useEffect(() => {
        fetchparent_category();
    }, []);

    const fetchsubcategoryData = async (parcategory) => {
        try {
            const response = await fetchParentCreateTickect(parcategory);

            const response_data = response.data;
            setSubcategory(null);

            if (response.data.error_code === 200) {
                const subarray = response_data.results;
                setSubcategory(subarray);
            } else {
                setSubcategory(null);
                triggerAlert("error", "Oops...", "Something went wrong..");
            }
        } catch (error) {
            triggerAlert("error", "Oops...", "Something went wrong..");
        }
    };

    const handleGoButtonClick = () => {
        const keyEventValues = getValues();
        const checkSecondFrmKeyValues = Object.values(keyEventValues).some(
            (value) => value !== undefined || value !== ""
        );
        if (checkSecondFrmKeyValues) {
            const secondFormErrors = validateSecondForm(keyEventValues);
            if (Object.keys(secondFormErrors).length > 0) {
                setSecondFormErrors(secondFormErrors);
                return;
            }
        }
        setSecondFormErrors({});
        const selectedIssueType = watch("ticket_category_id");
        if (!selectedIssueType || selectedIssueType === "0") {
            setShowCommentAndFile(false);
        } else {
            setShowCommentAndFile(true);
        }
    };

    const validateSecondForm = (keyEventValues) => {
        const errors = {};
        const requiredKeys = ["ticket_category_id", "sub_category_id"];
        const displayNames = ["Category", "Subcategory"];
        requiredKeys.forEach((key, index) => {
            if (
                !(key in keyEventValues) ||
                keyEventValues[key] === undefined ||
                keyEventValues[key] === ""
            ) {
                errors[key] = `${displayNames[index]} is required`;
            }
        });
        return errors;
    };

    const isContentEmpty = (value) => {
        const trimmedValue = value.replace(/<p><br><\/p>/g, '').trim();
        return trimmedValue.length > 0;
    };
    const validateFileSize = (value) => {
        if (!value) return true; // Allow empty files
        const fileSize = value[0]?.size; // Access the size property of the File object
        // const maxFileSize = 1024 * 1024; // 1 MB
        const maxFileSize = 20 * 1024 * 1024; // 20 MB
        if (fileSize > maxFileSize) {
            return "File size exceeds the maximum allowed size (20 MB).";
        }
        return true;
    };
    const handleClose = () => {
        setShow(false);
        setShowCommentAndFile(false);
        formReset();
        setImageData([]);
        setLoadListStatus(false);
        setUserCaptchaInput("")
    };

    const handleImageUpload = (event, index) => {
        const files = event.target.files;
        const file_length = Object.keys(files)?.length;
        // console.log(file_length)
        if (file_length > 0) {
            const filesArray = Array.from(files);
            if (filesArray.length > 0) {
                const fileName = filesArray[0].name.split(".")[0];
                const fileExt = filesArray[0].name.split(".")[1];
                const fileSize = filesArray[0].size;

                // Check file extensions for each selected file
                const maxSizeInBytes = 20 * 1024 * 1024; // 20MB
                const allowedExtensions = [".doc", ".docx", ".txt", ".pdf", ".jpg", ".jpeg", ".png", ".csv", ".xls", ".xlsx", ".mp3", ".mp4", ".wav", ".avi"];
                const isValidFiles = filesArray.every((file) => {
                    const fileExtension = "." + file.name.split(".").pop().toLowerCase();
                    // console.log("fileExtension", fileExtension);
                    return allowedExtensions.includes(fileExtension);
                });

                if (isValidFiles) {
                    clearErrors(`file${index + 1}`);
                    if (fileSize < maxSizeInBytes) {
                        clearErrors(`file${index + 1}`);
                        // Convert each selected file to base64
                        Promise.all(filesArray.map((file) => getBase64(file))).then(
                            (base64Array) => {
                                // Set the selectedFiles state with the base64-encoded files
                                setImageData((currentFiles) => {
                                    const updatedFiles = [...currentFiles];
                                    updatedFiles[index] = {
                                        file_name: fileName,
                                        file_type: fileExt,
                                        file_size: fileSize,
                                        file: base64Array[0],
                                    };
                                    return updatedFiles;
                                });
                            }
                        );
                        // document.getElementById("submit").removeAttribute("disabled");
                    } else {
                        setError(`file${index + 1}`, {
                            type: "manual",
                            message: "File size should not be more than 20MB",
                        });
                        // triggerAlert(
                        //   "error",
                        //   "Oops...",
                        //   "File size should not be more than 20MB"
                        // );
                        // document.getElementById("submit").setAttribute("disabled", "true");
                    }
                } else {
                    // Show an error message or handle the invalid file type
                    setError(`file${index + 1}`, {
                        type: "manual",
                        message: "Invalid file type. Please select another file.",
                    });

                    // triggerAlert(
                    //   "error",
                    //   "Oops...",
                    //   "Invalid file type. Please select another file."
                    // );
                    // document.getElementById("submit").setAttribute("disabled", "true");
                }
            }
        } else {
            // User cleared the file input, remove corresponding entry from imageData state
            setImageData((currentFiles) => {
                const updatedFiles = [...currentFiles];
                updatedFiles[index] = null; // or remove the entry entirely based on your data structure
                clearErrors(`file${index + 1}`);
                return updatedFiles;
            });
        }
    };

    const formReset = () => {
        reset();
    };

    const refreshCaptcha = async (api_input) => {
        try {
            const response = await captchrefresh(api_input);
            if (response.status === 200) {
                const data = response.data; // Ensure you're accessing the data correctly
                setIsCaptchaValid(data.captcha_text);
                setCaptchaUrl(`data:image/png;base64,${data.image_data}`);
            }
        } catch (error) {
            console.error("Error refreshing captcha:", error);
        }
    };

    const postTicketCreated = async (data) => {
        let modifiedData = {};
        modifiedData["workspace_id"] = data.id;

        modifiedData["ticket_category_id"] = data.ticket_category_id;
        modifiedData["ticket_sub_category_id"] = data.sub_category_id;
        modifiedData["ticket_desc"] = data.ticket_desc
        //modifiedData['ticket_priority'] = data.ticket_priority ;
        modifiedData["base64_files"] = imageData;
        // console.log(modifiedData);
        // return
        setIsLoadingCreate(true);
        if (isCaptchaValid == userCaptchaInput) {
            try {
                const responseFromPost = await fetchCreateTicket(modifiedData);

                const dataResponseFromPost = responseFromPost.data.message;

                if (dataResponseFromPost.error_code === 200 || 201) {
                    //change this
                    // sendEmail('TestTicket', data['ticket_desc'], data['to_email']);
                    // AlertWithButton('Ticket Created', `Reference ID : <b>#${dataResponseFromPost}</b> <br> Status : <b>Opened</b>`, 'Ok', ticketCreatedfunc) //ticket created alert
                    AlertWithButton(
                        "Ticket Created",
                        `Status : <b>Opened</b>`,
                        "Ok",
                        ticketCreatedfunc
                    ); //ticket created alert
                    navigate("/support-ticket#show-ticket");
                    setActiveTab('support-ticket');
                    setIsLoadingCreate(false);
                } else {
                    setIsLoadingCreate(false);
                    triggerAlert("error", "Oops...", "Something went wrong..");
                }
            } catch (error) {

                const response_data = error?.response?.data;
                if (response_data?.error_code === 401) {
                    setIsLoadingCreate(false);
                    triggerAlert('error', 'Oops...', response_data?.message);
                } else {
                    setIsLoadingCreate(false);
                    triggerAlert("error", "Oops...", "Something went wrong..");
                }
            }
        } else {
            setIsLoadingCreate(false);
            triggerAlert("error", "Oops...", "Invalid captcha..");
        }
    };

    const ticketCreatedfunc = () => {
        fetchTicketData(activeTab, currentPage);
    };

    const fetchTicketData = async (selectedTab, page) => {
        setIsLoading(true);
        const per_page = perPageLimit;

        const api_input = {
            page_number: page,
            page_size: per_page,
            line_type: selectedTab,
            //customer_id: customer_id
        };

        try {
            setPageSlNo((page - 1) * per_page);

            // Call the updated fetchTicketList function
            const response = await fetchTicketListData(api_input);

            const response_data = response.data.results;
            const ticketData = response_data.data;
            const total_pages = response_data.pagination.total_pages;

            if (response.data.error_code === 200) {
                setPageCount(total_pages);
                setTickets(ticketData);
                setIsLoading(false);
            } else {
                triggerAlert("error", "Oops...", "Something went wrong..");
            }
        } catch (error) {
            setIsLoading(false);
            triggerAlert("error", "Oops...", "Something went wrong..");
        }
    };

    // useEffect(() => {
    //     const getUserDetails = async () => {
    //         const response = await fetchUserDetailsData();
    //         if (response && response.data && response.data.results) {
    //             setUserData(response.data.results);
    //         }
    //     };
    //     getUserDetails();
    // }, []);

    // const fetchUserDetails = async () => {
    //     try {

    //         const response = await fetchUserDetailsData();
    //         const response_data = response.data;
    //         // console.log("data", response_data.error_code)
    //         if (response_data.error_code == 200) {
    //             const data = response.data.results;
    //             setUserData(data);


    //         } else {
    //             setUserData([])
    //         }
    //     } catch (error) {
    //         const response_data = error?.response?.data
    //     }
    // }

    // useEffect(() => {
    //     fetchUserDetails();
    // }, []);

    const fetchWorkspaces = async () => {
        setIsLoading(true);

        try {
            const response = await fetchWorkspace();
            const response_data = response.data;
            if (response_data.error_code === 200) {
                const data = response_data.results;
                setIsLoading(false);
                setWorkspaces(data?.reverse());
            } else {
                setWorkspaces([]);
            }
        } catch (error) {
            console.error("Error fetching media data:", error);
            const error_msg = error?.response?.data
            triggerAlert('error', '', error_msg?.message || "Something went wrong...")
            setWorkspaces([]);
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    }
    useEffect(() => {
        fetchWorkspaces();

    }, [])

    return (
        <>

            <div className="position-relative">
                <div id="content-page" className="content-page">
                    <div className="container">
                        <PageTitle heading="Create Ticket" />
                        {/* <div className="col-md-12">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button type="submit" className="btn btn-primary">Create Ticket</button>
                                    <button type="submit" className="btn btn-primary">Show Ticket</button>

                                </div>

                            </div>
                        </div> */}
                        <div className="row mt-4">
                            <div className="col-sm-12">
                                <div className="card">
                                    <div className="card-header d-flex justify-content-between">
                                        <div className="header-title">
                                            <div class="header-title">
                                                <h4 class="card-title text-warning">{userData.email} </h4>
                                                <p class="mb-0">- Support - Trouble Ticket System</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="card-body">

                                        <div class="alert bg-soft-info border-0 d-flex align-items-center" role="alert">
                                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path opacity="0.3" d="M20.5543 4.37824L12.1798 2.02473C12.0626 1.99176 11.9376 1.99176 11.8203 2.02473L3.44572 4.37824C3.18118 4.45258 3 4.6807 3 4.93945V13.569C3 14.6914 3.48509 15.8404 4.4417 16.984C5.17231 17.8575 6.18314 18.7345 7.446 19.5909C9.56752 21.0295 11.6566 21.912 11.7445 21.9488C11.8258 21.9829 11.9129 22 12.0001 22C12.0872 22 12.1744 21.983 12.2557 21.9488C12.3435 21.912 14.4326 21.0295 16.5541 19.5909C17.8169 18.7345 18.8277 17.8575 19.5584 16.984C20.515 15.8404 21 14.6914 21 13.569V4.93945C21 4.6807 20.8189 4.45258 20.5543 4.37824Z" fill="currentColor"></path>
                                                <path d="M10.5606 11.3042L9.57283 10.3018C9.28174 10.0065 8.80522 10.0065 8.51412 10.3018C8.22897 10.5912 8.22897 11.0559 8.51412 11.3452L10.4182 13.2773C10.8099 13.6747 11.451 13.6747 11.8427 13.2773L15.4859 9.58051C15.771 9.29117 15.771 8.82648 15.4859 8.53714C15.1948 8.24176 14.7183 8.24176 14.4272 8.53714L11.7002 11.3042C11.3869 11.6221 10.874 11.6221 10.5606 11.3042Z" fill="currentColor"></path>
                                            </svg>
                                            <div class="ms-2">
                                                <p class="mb-0 fw-500">Support representatives are available Monday through Friday 9:00 am to 5:30 pm EST.</p>
                                                <p class="mb-0 fw-500">All support inquiries will be reviewed in the order received.</p>
                                            </div>
                                        </div>


                                        <div class="alert bg-soft-danger d-flex align-items-center" role="alert">
                                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path opacity="0.3" d="M20.5543 4.37824L12.1798 2.02473C12.0626 1.99176 11.9376 1.99176 11.8203 2.02473L3.44572 4.37824C3.18118 4.45258 3 4.6807 3 4.93945V13.569C3 14.6914 3.48509 15.8404 4.4417 16.984C5.17231 17.8575 6.18314 18.7345 7.446 19.5909C9.56752 21.0295 11.6566 21.912 11.7445 21.9488C11.8258 21.9829 11.9129 22 12.0001 22C12.0872 22 12.1744 21.983 12.2557 21.9488C12.3435 21.912 14.4326 21.0295 16.5541 19.5909C17.8169 18.7345 18.8277 17.8575 19.5584 16.984C20.515 15.8404 21 14.6914 21 13.569V4.93945C21 4.6807 20.8189 4.45258 20.5543 4.37824Z" fill="currentColor"></path>
                                                <path d="M10.5606 11.3042L9.57283 10.3018C9.28174 10.0065 8.80522 10.0065 8.51412 10.3018C8.22897 10.5912 8.22897 11.0559 8.51412 11.3452L10.4182 13.2773C10.8099 13.6747 11.451 13.6747 11.8427 13.2773L15.4859 9.58051C15.771 9.29117 15.771 8.82648 15.4859 8.53714C15.1948 8.24176 14.7183 8.24176 14.4272 8.53714L11.7002 11.3042C11.3869 11.6221 10.874 11.6221 10.5606 11.3042Z" fill="currentColor"></path>
                                            </svg>
                                            <div class=" ms-2">
                                                <p class="mb-0 fw-500">Limited staff is available for emergency situations 24 hours a day 7 days a week.</p>
                                                <p class="mb-0 fw-500">Technical Support representatives are not authorized to make phone calls to end users in response to Trouble Tickets.</p>
                                            </div>
                                        </div>

                                        <p class="fw-500 text-primary">Please select the category best describing the issue you are experiencing to proceed</p>
                                        {isLoadingCreate ? (
                                            <div className="loader-overlay text-white">
                                                <Loader />
                                            </div>
                                        ) : null}
                                        <form onSubmit={handleSubmit(postTicketCreated)}>
                                            <Row className="g-3">
                                                <Col md={3}>
                                                    <label htmlFor="WorkSpace">
                                                        Workspace <span className="text-danger">*</span>
                                                    </label>
                                                    <Form.Select
                                                        id="id"
                                                        name="id"
                                                        {...register("id", {
                                                            required: "WorkSpace is required",
                                                        })}
                                                    >
                                                        <option value="" hidden>
                                                            Select Workspace
                                                        </option>
                                                        {workspaces && workspaces.length > 0 ? (
                                                            workspaces.map((cat) => (
                                                                <option key={cat.workspace_id} value={cat.id}>
                                                                    {cat.company_name}
                                                                </option>
                                                            ))
                                                        ) : (
                                                            <option value="">No data available</option>
                                                        )}
                                                    </Form.Select>
                                                    {errors.id && (
                                                        <div
                                                            style={{
                                                                color: "red",
                                                                fontSize: "14px",
                                                                marginTop: "5px",
                                                            }}
                                                        >
                                                            {errors.id.message}
                                                        </div>
                                                    )}
                                                    {!errors.id &&
                                                        secondFormErrors.id && (
                                                            <div
                                                                style={{
                                                                    color: "red",
                                                                    fontSize: "14px",
                                                                    marginTop: "5px",
                                                                }}
                                                            >
                                                                {secondFormErrors.id}
                                                            </div>
                                                        )}
                                                </Col>

                                                <Col md={3}>
                                                    <label htmlFor="issueType">
                                                        Issue Type <span className="text-danger">*</span>
                                                    </label>
                                                    <Form.Select
                                                        id="issueType"
                                                        {...register("ticket_category_id", {
                                                            required: "Issue type is required.",
                                                        })}
                                                        name="ticket_category_id"
                                                        onChange={parentcateselection}
                                                    >
                                                        <option value="" hidden>
                                                            Select Issue Type
                                                        </option>
                                                        {parentcategory.map((item) => (
                                                            <option key={item.id} value={item.id}>
                                                                {item.parent_cat_name}
                                                            </option>
                                                        ))}
                                                    </Form.Select>
                                                    {errors.ticket_category_id && (
                                                        <div
                                                            style={{
                                                                color: "red",
                                                                fontSize: "14px",
                                                                marginTop: "5px",
                                                            }}
                                                        >
                                                            {errors.ticket_category_id.message}
                                                        </div>
                                                    )}
                                                    {!errors.ticket_category_id &&
                                                        secondFormErrors.ticket_category_id && (
                                                            <div
                                                                style={{
                                                                    color: "red",
                                                                    fontSize: "14px",
                                                                    marginTop: "5px",
                                                                }}
                                                            >
                                                                {secondFormErrors.ticket_category_id}
                                                            </div>
                                                        )}
                                                </Col>
                                                <Col md={3}>
                                                    <label htmlFor="subCategory">
                                                        Sub Category Type <span className="text-danger">*</span>
                                                    </label>
                                                    <Form.Select
                                                        id="sub_category_id"
                                                        name="sub_category_id"
                                                        {...register("sub_category_id", {
                                                            required: "Subcategory is required",
                                                        })}
                                                    >
                                                        <option value="" hidden>
                                                            Select Subcategory
                                                        </option>
                                                        {subcategory && subcategory.length > 0 ? (
                                                            subcategory.map((cat) => (
                                                                <option key={cat.ticket_category_id} value={cat.ticket_category_id}>
                                                                    {cat.ticket_category_name}
                                                                </option>
                                                            ))
                                                        ) : (
                                                            <option value="">No data available</option>
                                                        )}
                                                    </Form.Select>
                                                    {errors.sub_category_id && (
                                                        <div
                                                            style={{
                                                                color: "red",
                                                                fontSize: "14px",
                                                                marginTop: "5px",
                                                            }}
                                                        >
                                                            {errors.sub_category_id.message}
                                                        </div>
                                                    )}
                                                    {!errors.sub_category_id &&
                                                        secondFormErrors.sub_category_id && (
                                                            <div
                                                                style={{
                                                                    color: "red",
                                                                    fontSize: "14px",
                                                                    marginTop: "5px",
                                                                }}
                                                            >
                                                                {secondFormErrors.sub_category_id}
                                                            </div>
                                                        )}
                                                </Col>

                                                <Col xs={3}>
                                                    <label>&nbsp;</label>
                                                    <div className="button-items">
                                                        <Button
                                                            type="button"
                                                            className="btn btn-primary btn-rounded waves-effect waves-light w-25"
                                                            onClick={handleGoButtonClick}
                                                        >
                                                            Go
                                                        </Button>
                                                    </div>
                                                </Col>

                                                {showCommentAndFile && (
                                                    <>
                                                        <Col md={12}>
                                                            <div as={Col} controlId="formDocument">
                                                                <label className="col-sm-4 text-right">
                                                                    Comment <span className="text-danger">*</span>
                                                                </label>
                                                                <Controller
                                                                    name="ticket_desc"
                                                                    control={control}
                                                                    defaultValue=""
                                                                    rules={{
                                                                        required: 'Content is required',
                                                                        validate: {
                                                                            notEmpty: (value) => isContentEmpty(value) || 'Content is required'
                                                                        }
                                                                    }}
                                                                    render={({ field }) => (
                                                                        <>
                                                                            <SunEditor
                                                                                placeholder="Please type here..."
                                                                                lang="en"
                                                                                setDefaultStyle="font-family: Arial; font-size: 14px;"
                                                                                setOptions={options}
                                                                                onChange={field.onChange}
                                                                                value={field.value}
                                                                            />
                                                                            {errors.ticket_desc && (
                                                                                <div style={{ color: 'red' }}>{errors.ticket_desc.message}</div>
                                                                            )}
                                                                        </>
                                                                    )}
                                                                />
                                                            </div>
                                                        </Col>
                                                        <Col md={3}>
                                                            <div className="mb-3">
                                                                <label
                                                                    htmlFor="formFile1"
                                                                    className="form-label"
                                                                >
                                                                    Upload file-1
                                                                </label>
                                                                <input
                                                                    type="file"
                                                                    className="form-control"
                                                                    id="formFile1"
                                                                    name="file1"
                                                                    accept=".doc, .docx, .txt, .pdf, .jpg, .jpeg, .png, .csv, .xls, .xlsx, .mp3, .mp4, .wav, .avi, .WAV"
                                                                    {...register("file1", {
                                                                        validate: {
                                                                            validFormat: (value) => {
                                                                                if (value[0]?.name) {
                                                                                    const allowedExtensions = /\.(docx?|pdf|jpe?g|png|csv|txt|xlsx|mp3|mp4|wav|avi)$/i;
                                                                                    if (!value[0]) return true; // Allow empty files
                                                                                    if (!allowedExtensions.test(value[0]?.name)) {
                                                                                        return 'Invalid file format. Please upload a valid file.';
                                                                                    }
                                                                                }
                                                                                return true;
                                                                            },
                                                                            validSize: validateFileSize,
                                                                        },
                                                                    })}
                                                                    onChange={(e) => {
                                                                        handleImageUpload(e, 0);
                                                                    }}
                                                                />
                                                                {errors.file1 && (
                                                                    <div
                                                                        style={{
                                                                            color: "red",
                                                                            fontSize: "14px",
                                                                            marginTop: "5px",
                                                                        }}
                                                                    >
                                                                        {errors.file1.message}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {imageData.length > 0 && imageData[0]?.file_name !== undefined && (
                                                                <Base64Preview
                                                                    base64Data={imageData[0]?.file}
                                                                    filename={imageData[0]?.file_name}
                                                                    filetype={imageData[0]?.file_type}
                                                                />
                                                            )}
                                                        </Col>
                                                        <Col md={3}>
                                                            <div className="mb-3">
                                                                <label className="form-label">Upload file-2</label>
                                                                <input
                                                                    type="file"
                                                                    id="formFile2"
                                                                    className="form-control"
                                                                    name="file2"
                                                                    accept=".doc, .docx, .txt, .pdf, .jpg, .jpeg, .png, .csv, .xls, .xlsx, .mp3, .mp4, .wav, .avi, .WAV"
                                                                    {...register("file2", {
                                                                        validate: {
                                                                            validFormat: (value) => {
                                                                                if (value[0]?.name) {
                                                                                    const allowedExtensions = /\.(docx?|pdf|jpe?g|png|csv|txt|xlsx|mp3|mp4|wav|avi)$/i;
                                                                                    if (!value[0]) return true; // Allow empty files
                                                                                    if (!allowedExtensions.test(value[0]?.name)) {
                                                                                        return 'Invalid file format. Please upload a valid file.';
                                                                                    }
                                                                                }
                                                                                return true;
                                                                            },
                                                                            validSize: validateFileSize,
                                                                        },
                                                                    })}
                                                                    onChange={(e) => {
                                                                        handleImageUpload(e, 1);
                                                                    }}
                                                                />
                                                            </div>
                                                            {errors.file2 && (
                                                                <div
                                                                    style={{
                                                                        color: "red",
                                                                        fontSize: "14px",
                                                                        marginTop: "5px",
                                                                    }}
                                                                >
                                                                    {errors.file2.message}
                                                                </div>
                                                            )}
                                                            {imageData.length > 1 && imageData[1]?.file_name !== undefined && (
                                                                <Base64Preview
                                                                    base64Data={imageData[1]?.file}
                                                                    filename={imageData[1]?.file_name}
                                                                    filetype={imageData[1]?.file_type}
                                                                />
                                                            )}
                                                        </Col>
                                                        <Col md={3}>
                                                            <div className="mb-3">
                                                                <label className="form-label">Upload file-3</label>
                                                                <input
                                                                    type="file"
                                                                    id="formFile3"
                                                                    className="form-control"
                                                                    name="file3"
                                                                    accept=".doc, .docx, .txt, .pdf, .jpg, .jpeg, .png, .csv, .xls, .xlsx, .mp3, .mp4, .wav, .avi, .WAV"
                                                                    {...register("file3", {
                                                                        validate: {
                                                                            validFormat: (value) => {
                                                                                if (value[0]?.name) {
                                                                                    const allowedExtensions = /\.(docx?|pdf|jpe?g|png|csv|txt|xlsx|mp3|mp4|wav|avi)$/i;
                                                                                    if (!value[0]) return true; // Allow empty files
                                                                                    if (!allowedExtensions.test(value[0]?.name)) {
                                                                                        return 'Invalid file format. Please upload a valid file.';
                                                                                    }
                                                                                }
                                                                                return true;
                                                                            },
                                                                            validSize: validateFileSize,
                                                                        },
                                                                    })}
                                                                    onChange={(e) => {
                                                                        handleImageUpload(e, 2);
                                                                    }}
                                                                />
                                                            </div>
                                                            {errors.file3 && (
                                                                <div
                                                                    style={{
                                                                        color: "red",
                                                                        fontSize: "14px",
                                                                        marginTop: "5px",
                                                                    }}
                                                                >
                                                                    {errors.file3.message}
                                                                </div>
                                                            )}
                                                            {imageData.length > 2 && imageData[2]?.file_name !== undefined && (
                                                                <Base64Preview
                                                                    base64Data={imageData[2]?.file}
                                                                    filename={imageData[2]?.file_name}
                                                                    filetype={imageData[2]?.file_type}
                                                                />
                                                            )}
                                                        </Col>
                                                        <Col md={3}>
                                                            <div className="mb-3">
                                                                <label className="form-label">Upload file-4</label>
                                                                <input
                                                                    type="file"
                                                                    id="formFile4"
                                                                    className="form-control"
                                                                    name="file4"
                                                                    accept=".doc, .docx, .txt, .pdf, .jpg, .jpeg, .png, .csv, .xls, .xlsx, .mp3, .mp4, .wav, .avi, .WAV"
                                                                    {...register("file4", {
                                                                        validate: {
                                                                            validFormat: (value) => {
                                                                                if (value[0]?.name) {
                                                                                    const allowedExtensions = /\.(docx?|pdf|jpe?g|png|csv|txt|xlsx|mp3|mp4|wav|avi)$/i;
                                                                                    if (!value[0]) return true; // Allow empty files
                                                                                    if (!allowedExtensions.test(value[0]?.name)) {
                                                                                        return 'Invalid file format. Please upload a valid file.';
                                                                                    }
                                                                                }
                                                                                return true;
                                                                            },
                                                                            validSize: validateFileSize,
                                                                        },
                                                                    })}
                                                                    onChange={(e) => {
                                                                        handleImageUpload(e, 3);
                                                                    }}
                                                                />
                                                            </div>
                                                            {errors.file4 && (
                                                                <div
                                                                    style={{
                                                                        color: "red",
                                                                        fontSize: "14px",
                                                                        marginTop: "5px",
                                                                    }}
                                                                >
                                                                    {errors.file4.message}
                                                                </div>
                                                            )}
                                                            {imageData.length > 3 && imageData[3]?.file_name !== undefined && (
                                                                <Base64Preview
                                                                    base64Data={imageData[3]?.file}
                                                                    filename={imageData[3]?.file_name}
                                                                    filetype={imageData[3]?.file_type}
                                                                />
                                                            )}
                                                        </Col>
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
                                                                    {/* <i style={{ color: '#00CA00', fontSize: '20px', cursor: 'pointer' }} className="fas fa-refresh" onClick={refreshCaptcha}></i> */}
                                                                </div>
                                                                <span
                                                                    className="mx-3 mt-1"
                                                                    id="refreshimage"
                                                                // onClick={refreshCaptcha}
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

                                                        <Col xs={12}>
                                                            <div className="d-grid gap-2 d-md-flex justify-content-md-center mt-4">
                                                                <Button
                                                                    className="btn btn-success btn-rounded waves-effect waves-light btn-md me-md-2 px-5"
                                                                    id="submit"
                                                                    type="submit"
                                                                    variant="success"
                                                                    disabled={Object.keys(errors)?.length > 0}
                                                                >
                                                                    Create Ticket
                                                                </Button>
                                                                <Button
                                                                    className="btn btn-warning btn-rounded waves-effect waves-light btn-md px-5"
                                                                    type="button"
                                                                    variant="warning"
                                                                    onClick={handleClose}
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            </div>
                                                        </Col>
                                                    </>
                                                )}
                                            </Row>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}
