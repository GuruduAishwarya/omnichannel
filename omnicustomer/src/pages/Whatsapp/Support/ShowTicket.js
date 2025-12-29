import React, { useState, useEffect, useRef } from "react";
import Loader from '../../../common/components/Loader';
import { fetchTicketDetailsData, addTicketReply, fetchUserDetailsData } from '../../../utils/ApiClient';
import { triggerAlert, handleTableRowClick, ConfirmationAlert, formatDateTime, getBase64, pageReload } from '../../../utils/CommonFunctions';
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Table, Container, Row, Col, Form, Button } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import SunEditor from 'suneditor-react'
import plugins from 'suneditor/src/plugins'
import { en } from 'suneditor/src/lang'
import katex from 'katex'
import Base64Preview from "../../../common/FilePreview";
import 'suneditor/dist/css/suneditor.min.css'
import 'katex/dist/katex.min.css'

export default function ShowTicket({ ticketNumber, activeTab, currentPage, setShowTicket }) {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState();
    const [selectedTicketDetails, setSelectedTicketDetails] = useState(null);
    const [selectedTicketdocuments, setSelectedTicketdocuments] = useState(null);
    const [ticketReplies, setTicketReplies] = useState(null);
    const [ticketStatus, setTicketStatus] = useState(null);
    const [ticketCategory, setTicketCategory] = useState(null);
    const [ticketSubCategory, setTicketSubCategory] = useState(null);
    const [imageData, setImageData] = useState([]);
    const [editorData, setEditorData] = useState("");
    const { register, handleSubmit, control, formState: { errors }, reset, watch, clearErrors, setValue, setError, unregister } = useForm();
    const fileInputRefs = useRef([]);
    const [userData, setUserData] = useState([]);

    // Fetch ticket data
    const fetchTicketDetails = async () => {
        setIsLoading(true);
        try {
            const params = {
                ticket_number: ticketNumber
            }
            const response = await fetchTicketDetailsData(params);
            const response_data = response.data.results;
            const ticketDetails = response_data.data;
            const ticket_docuemnts = response_data.data_doc;
            const ticket_reply = response_data.data_reply;
            // console.log("response_data", response_data)
            if (response.data.error_code === 200) {
                setIsLoading(false);
                setSelectedTicketDetails(ticketDetails);
                setSelectedTicketdocuments(ticket_docuemnts);
                setTicketReplies(ticket_reply);
                setTicketStatus(ticketDetails[0].status);
                setTicketCategory(ticketDetails[0].ticket_category_id);
                setTicketSubCategory(ticketDetails[0].ticket_sub_category_id);
                // triggerAlert('success', 'success', 'Recharged Successfully!!');
            } else {
                setIsLoading(false);
                // triggerAlert('error', 'Oops...', 'Recharge was unsuccessful');
            }
        } catch (error) {
            const response_data = error?.response?.data
            setIsLoading(false);
            triggerAlert('error', 'Oops...', response_data ? response_data.message : "Something went wrong!");
        }
    }

    //ticketCreateReply
    const ticketCreateReply = async (data) => {
        const api_input = {
            base64_files: imageData,
            status: ticketStatus,
            ticket_category_id: ticketCategory,
            sub_category_id: ticketSubCategory,
            message: editorData,
        };
        setIsLoading(true);
        try {
            const responseFromPost = await addTicketReply(ticketNumber, api_input);
            const dataResponseFromPost = responseFromPost.data;

            setIsLoading(false);
            if (responseFromPost.error_code === 200 || 201) {
                //change this
                triggerAlert("success", "success", dataResponseFromPost.message); //comment added
                pageReload();
                clearEditorAndFiles();
            } else {
                triggerAlert("error", "Oops...", dataResponseFromPost.message);
            }
        } catch (error) {
            triggerAlert("error", "Oops...", "Something went wrong..");
            setIsLoading(false);
        }
    };

    const clearEditorAndFiles = () => {
        // Clear editor data
        setEditorData("");
        reset({ ticket_desc: "" });
        // Reset file input elements
        const fileInputIds = ["file1", "file2", "file3", "file4"];
        fileInputIds.forEach((inputId) => {
            const fileInput = document.getElementsByName(inputId);
            if (fileInput) {
                fileInput.value = ""; // Reset the file input
            }
        });
    };

    const isContentEmpty = (value) => {
        const trimmedValue = value.replace(/<p><br><\/p>/g, '').trim();
        return trimmedValue.length > 0;
    };

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

    const handleEditorDataChange = (content) => {
        if (content) {
            clearErrors("ticket_desc");
        }
        setValue("ticket_desc", content);
        setEditorData(content);
    };

    const validateFileSize = (value) => {
        if (!value) return true; // Allow empty files
        const fileSize = value[0]?.size; // Access the size property of the File object
        const maxFileSize = 1024 * 1024; // 1 MB
        if (fileSize > maxFileSize) {
            return "File size exceeds the maximum allowed size (1 MB).";
        }
        return true;
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

    // const fetchUserDetails = async () => {
    //     setIsLoading(true);
    //     try {
    //         const response = await fetchUserDetailsData();
    //         const response_data = response.data;
    //         // console.log("data", response_data.error_code)
    //         if (response_data.error_code == 200) {
    //             const data = response.data.results;
    //             setIsLoading(false);
    //             setUserData(data);
    //         } else {
    //             setUserData([])
    //             setIsLoading(false);
    //         }
    //     } catch (error) {
    //         const response_data = error?.response?.data
    //         setIsLoading(false);
    //         triggerAlert('error', 'Oops...', response_data ? response_data.message : "Something went wrong!");
    //     }
    // }

    useEffect(() => {
        fetchTicketDetails();
        // fetchUserDetails();
    }, []);

    const handleBack = () => {
        setShowTicket(false);
    };

    return (
        <>
            {isLoading && (
                <div className='loader-overlay text-white'>
                    <Loader />
                </div>
            )}
            <div>
                <div class="position-relative">
                </div>
                <div id="content-page" class="content-page">
                    <div class="container">
                        <div class="row w-100 mb-4 mt-3">
                            {/* <div class="d-flex align-items-center justify-content-between flex-wrap">
                                <h4 class="fw-bold text-primary">Show Ticket</h4>
                            </div> */}
                        </div>

                        <div class="row">
                            <div class="col-sm-12">
                                <div class="card">
                                    <div class="card-header d-flex justify-content-between">
                                        <div class="header-title">
                                            <h4 class="card-title text-warning">{userData.email}</h4>
                                            <p class="mb-0">- Support - Trouble Ticket System</p>
                                        </div>
                                    </div>
                                    <div class="card-body">
                                        <div class="table-responsive mt-4">
                                            <table id="example" class="table table-striped table-bordered hover" cellspacing="0" width="100%">
                                                <thead class="border">
                                                    <tr>
                                                        <th>Tickect Number</th>
                                                        <th>Category</th>
                                                        <th>Opened</th>
                                                        <th>Last Updated</th>
                                                        <th>Updated by</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedTicketDetails ? (
                                                        selectedTicketDetails.map((ticket, index) => (
                                                            <React.Fragment key={index}>
                                                                <tr>
                                                                    <td>{ticket.ticket_number}</td>
                                                                    {/* <td>{getIssueTypeNameByValue(ticket.ticket_category_id)}</td> */}
                                                                    <td> {ticket.ticket_sub_category}</td>
                                                                    {/* <td>Other</td> */}
                                                                    <td>{formatDateTime(ticket.register_date, "yyyy-mm-dd hh:mm:ss")}</td>
                                                                    <td>{formatDateTime(ticket.updated_date, "yyyy-mm-dd hh:mm:ss")}</td>
                                                                    <td>
                                                                        {ticket.updated_name
                                                                            ? ticket.updated_name
                                                                            : "-"}
                                                                    </td>
                                                                    <td>
                                                                        <span
                                                                            className={`fw-semibold text-warning font-size-15`}
                                                                        >
                                                                            {ticket.ticket_status_value}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            </React.Fragment>
                                                        ))
                                                    ) : (
                                                        <tr rowspan="6" >No ticket details available.</tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div>
                                            <h4 class="mb-3">Support - Trouble Tickets Documents</h4>
                                            <div>
                                                {selectedTicketdocuments && selectedTicketdocuments.length > 0 ? (
                                                    selectedTicketdocuments.map((ticket_dic, index) => (
                                                        <React.Fragment key={index}>
                                                            <button type="button" class="btn d-inline-flex btn-soft-primary rounded-pill mb-3 me-1">
                                                                <a href={ticket_dic.doc_path} target="_blank">
                                                                    <svg width="24" height="24" aria-hidden="true" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <rect opacity="0.3" width="12" height="2" rx="1" transform="matrix(0 -1 -1 0 12.75 19.75)" fill="currentColor"></rect>
                                                                        <path d="M12.0573 17.8813L13.5203 16.1256C13.9121 15.6554 14.6232 15.6232 15.056 16.056C15.4457 16.4457 15.4641 17.0716 15.0979 17.4836L12.4974 20.4092C12.0996 20.8567 11.4004 20.8567 11.0026 20.4092L8.40206 17.4836C8.0359 17.0716 8.0543 16.4457 8.44401 16.056C8.87683 15.6232 9.58785 15.6554 9.9797 16.1256L11.4427 17.8813C11.6026 18.0732 11.8974 18.0732 12.0573 17.8813Z" fill="currentColor"></path>
                                                                        <path opacity="0.3" d="M18.75 15.75H17.75C17.1977 15.75 16.75 15.3023 16.75 14.75C16.75 14.1977 17.1977 13.75 17.75 13.75C18.3023 13.75 18.75 13.3023 18.75 12.75V5.75C18.75 5.19771 18.3023 4.75 17.75 4.75L5.75 4.75C5.19772 4.75 4.75 5.19771 4.75 5.75V12.75C4.75 13.3023 5.19771 13.75 5.75 13.75C6.30229 13.75 6.75 14.1977 6.75 14.75C6.75 15.3023 6.30229 15.75 5.75 15.75H4.75C3.64543 15.75 2.75 14.8546 2.75 13.75V4.75C2.75 3.64543 3.64543 2.75 4.75 2.75L18.75 2.75C19.8546 2.75 20.75 3.64543 20.75 4.75V13.75C20.75 14.8546 19.8546 15.75 18.75 15.75Z" fill="currentColor"></path>
                                                                    </svg>
                                                                    {ticket_dic.file_name}.{ticket_dic.doc_type}
                                                                </a>
                                                            </button>
                                                        </React.Fragment>
                                                    ))
                                                ) : (
                                                    <p>No ticket Documents.</p>
                                                )}
                                            </div>
                                            <div className="row">
                                                <div className="mt-4">
                                                    <h4 class="text-danger ">Problem Description</h4>
                                                </div>
                                                <div className="col-md-12">
                                                    {selectedTicketDetails && (
                                                        <div className="comment_div"
                                                            dangerouslySetInnerHTML={{
                                                                __html: selectedTicketDetails[0].ticket_desc,
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                            <div class="form-group mb-3 mt-3 text-end">
                                                <button class="btn btn-primary" type="button"
                                                    data-bs-toggle="collapse"
                                                    href="#collapseExample"
                                                    aria-expanded="false"
                                                    aria-controls="collapseExample">Add Comment</button>
                                                <button class="btn btn-warning px-3 ms-2" type="button" onClick={handleBack}>Back</button>
                                            </div>

                                            <div className="collapse " id="collapseExample">
                                                <h5 class="mb-3">Add Comments</h5>
                                                <Form onSubmit={handleSubmit(ticketCreateReply)}>
                                                    <div className="row px-3">
                                                        {/* <div className='col-md-12'> */}
                                                        <div as={Col} controlId="formDocument">
                                                            <label className="col-sm-4 text-right">
                                                                Comment{" "}
                                                                <span className="text-danger">*</span>
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
                                                                            onChange={(content) => {
                                                                                field.onChange(content); // Update form value with editor content
                                                                                handleEditorDataChange(content); // Handle editor data change
                                                                            }}
                                                                            value={field.value} // Ensure the editor value reflects the form value
                                                                        />
                                                                        {/* Display validation error message */}
                                                                        {errors.ticket_desc && (
                                                                            <div style={{ color: 'red' }}>{errors.ticket_desc.message}</div>
                                                                        )}
                                                                    </>
                                                                )}
                                                            />
                                                        </div>
                                                        {/* </div> */}
                                                    </div>

                                                    <Row className="mt-3 p-3 px-0">
                                                        {/* <Form> */}
                                                        <Col md={3}>
                                                            <div
                                                                as={Col}
                                                                controlId="formDocument"
                                                            >
                                                                <label className="col-sm-4 text-right">
                                                                    Upload Document 1
                                                                </label>
                                                                <Col sm={12}>
                                                                    <input
                                                                        type="file"
                                                                        className="form-control"
                                                                        name="file1"
                                                                        ref={(element) =>
                                                                            (fileInputRefs.current[0] = element)
                                                                        }
                                                                        {...register("file1", {
                                                                            //required: 'File is required',
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
                                                                        onChange={(e) =>
                                                                            handleImageUpload(e, 0)
                                                                        }
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
                                                                    {imageData.length > 0 && imageData[0]?.file_name !== undefined && (
                                                                        <Base64Preview
                                                                            base64Data={imageData[0]?.file}
                                                                            filename={imageData[0]?.file_name}
                                                                            filetype={imageData[0]?.file_type}
                                                                        />
                                                                    )}
                                                                </Col>
                                                            </div>
                                                        </Col>
                                                        <Col md={3}>
                                                            <div
                                                                as={Col}
                                                                controlId="formDocument"
                                                            >
                                                                <label className="col-sm-4 text-right">
                                                                    Upload Document 2
                                                                </label>
                                                                <Col sm={12}>
                                                                    <input
                                                                        type="file"
                                                                        id="formFile2"
                                                                        className="form-control"
                                                                        name="file2"
                                                                        accept=".doc, .docx, .txt, .pdf, .jpg, .jpeg, .png, .csv, .xls, .xlsx, .mp3, .mp4, .wav, .avi, .WAV"
                                                                        {...register("file2", {
                                                                            //required: 'File is required',
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
                                                                            //clearErrors('file2');
                                                                        }}
                                                                    />
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
                                                            </div>
                                                        </Col>

                                                        <Col md={3} >
                                                            <div
                                                                as={Col}
                                                                controlId="formDocument"
                                                            >
                                                                <label className="col-sm-4 text-right">
                                                                    Upload Document 3
                                                                </label>
                                                                <Col sm={12}>
                                                                    <input
                                                                        type="file"
                                                                        id="formFile3"
                                                                        className="form-control"
                                                                        name="file3"
                                                                        accept=".doc, .docx, .txt, .pdf, .jpg, .jpeg, .png, .csv, .xls, .xlsx, .mp3, .mp4, .wav, .avi, .WAV"
                                                                        {...register("file3", {
                                                                            //required: 'File is required',
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
                                                                            //clearErrors('file3');
                                                                        }}
                                                                    />
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
                                                            </div>
                                                        </Col>
                                                        <Col md={3} >
                                                            <div
                                                                as={Col}
                                                                controlId="formDocument"
                                                            >
                                                                <label className="col-sm-4 text-right">
                                                                    Upload Document 4
                                                                </label>
                                                                <Col sm={12}>
                                                                    <input
                                                                        type="file"
                                                                        id="formFile4"
                                                                        className="form-control"
                                                                        name="file4"
                                                                        accept=".doc, .docx, .txt, .pdf, .jpg, .jpeg, .png, .csv, .xls, .xlsx, .mp3, .mp4, .wav, .avi, .WAV"
                                                                        {...register("file4", {
                                                                            //required: 'File is required',
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
                                                                            //clearErrors('file4');
                                                                        }}
                                                                    />
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
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                    {/* </Form> */}
                                                    <div className="col-sm-12 text-end  mb-3">
                                                        <button
                                                            type="submit"
                                                            className="btn btn-primary btn-rounded waves-effect waves-light me-md-1 px-3"
                                                            id="submit"
                                                        >
                                                            Submit
                                                        </button>
                                                        <button
                                                            type="reset"
                                                            className="btn btn-warning  btn-rounded waves-effect waves-light px-3"
                                                            data-bs-toggle="collapse"
                                                            href="#collapseExample"
                                                            onClick={clearEditorAndFiles}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </Form>
                                            </div>

                                            {ticketReplies?.length > 0 && (
                                                <div>
                                                    <h4 class="text-danger ">Problem Comments</h4>
                                                    <ul class="post-comments p-2 m-0   rounded ">
                                                        {ticketReplies ? (
                                                            ticketReplies.map((userReply, index) => (
                                                                <li class="mb-2">
                                                                    <div class="d-flex justify-content-between">
                                                                        <div class="w-100 text-margin">
                                                                            <div class="">
                                                                                <h5 class="mb-0 me-1 text-primary">
                                                                                    From: :{" "}{userReply.updated_by} at {formatDateTime(userReply.cdate, "yyyy-mm-dd hh:mm:ss")}
                                                                                </h5>
                                                                                <h5 class="mb-0 text-warning">Message:</h5>
                                                                            </div>
                                                                            <div class="comment_div"
                                                                                dangerouslySetInnerHTML={{
                                                                                    __html: userReply.message,
                                                                                }}
                                                                            />
                                                                            {/* Dotted line */}
                                                                            <div style={{ borderTop: '1px dotted #666', margin: '10px 0' }}></div>
                                                                        </div>
                                                                    </div>
                                                                </li>
                                                            ))
                                                        ) : (
                                                            <p>No Data available.</p>
                                                        )}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div >
                    </div >
                </div >
            </div >
        </>
    )
}
