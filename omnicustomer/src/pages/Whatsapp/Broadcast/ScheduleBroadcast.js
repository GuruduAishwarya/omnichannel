import React, { useEffect, useState } from 'react';
import PageTitle from '../../../common/PageTitle';
import { Modal, Table } from 'react-bootstrap';
import { ConfirmationAlert, formatDateTimes, transformText, triggerAlert, downloadFile } from '../../../utils/CommonFunctions';
import { addScheduleBroadcast, deleteScheduleBroadcast, fetchScheduleBroadcast, updateScheduleBroadcast, workspaceDetails } from '../../../utils/ApiClient';
import PaginationComponent from '../../../common/components/PaginationComponent';
import Loader from '../../../common/components/Loader';
import { Controller, useForm } from 'react-hook-form';
import { onlyAlphaNumericSpaces, MaxLengthValidation, MinLengthValidation } from '../../../utils/Constants';
import MultiSelectDyGet from '../../../common/components/selects/MultiSelectDyGet';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import DynamicSelect from '../../../common/components/selects/DynamicSelect';
import { useNavigate } from 'react-router-dom';
import { fetchTempData } from '../../../utils/ApiClient';
import { format } from 'date-fns';
import { MdOutlineDownloading } from "react-icons/md";
import { FaFilePdf, FaFileDownload, FaTimes } from 'react-icons/fa';

export default function ScheduleBroadcast() {
    const api_url = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();
    const [selectedItem, setSelectedItem] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [scheduleBroadcastList, setScheduleBroadcastlist] = useState([]);
    const [recipientShow, setRecipientsShow] = useState(false);
    const [viewShow, setViewShow] = useState(false);
    const [modifyShow, setModifyShow] = useState(false);
    const [contactNumbers, setContactNumbers] = useState([]);
    const [modifyMode, setModifyMode] = useState("Add");
    const [selectedReceipientNumbers, setSelectedReceipientNumbers] = useState([]);
    const [templateOptions, setTemplateOptions] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [editData, setEditData] = useState(null); // Store the selected row data
    const [pageCount, setPageCount] = useState(0);
    const [perPageLimit, setPerPageLimit] = useState(10);
    const [hideButton, setHideButton] = useState(true)

    const { register, handleSubmit, control, formState: { errors }, setValue, watch, reset } = useForm({
        defaultValues: {
            scheduled_date: new Date()
        }
    });
    const [messageError, setMessageError] = useState("")


    ///////////////// Modal functions ///////////////////////////
    const handleRecipientsClose = () => {
        setRecipientsShow(false);
    }
    const handleRecipientsShow = (phoneNumbers) => {
        setSelectedReceipientNumbers(phoneNumbers.split(',')); // Split phone numbers by comma
        setRecipientsShow(true);
    }
    const handleViewClose = () => {
        setViewShow(false);
        setSelectedTemplate(null); // Reset selectedTemplate
    };

    const handleViewShow = (template_name) => {
        // Find the template by its name
        const template = templateOptions.find(temp => temp.label === template_name); // Ensure to match by name
        if (template) {
            setSelectedTemplate(template); // Set the selected template for viewing
            setViewShow(true); // Show the modal
        }
    };

    const handleBulkSendButton = async () => {
        try {
            const workId = JSON.parse(localStorage.getItem("workspace_id"))
            const response = await workspaceDetails(workId)
            const data = response.data.results
            const filteredData = data.filter((item) => item.plan_type === "whatsapp")
            if (filteredData.length === 0) {
                setHideButton(false)
                setMessageError("Note: No WhatsApp plan is available.")
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

    }
    useEffect(() => {
        handleBulkSendButton()
    }, [])


    const handleModifyClose = () => {
        setModifyShow(false);
        reset(); // Reset the form fields
        setSelectedTemplate(null); // Reset the selected template
        setContactNumbers([]); // Reset contact numbers

    };

    const handleModifyShow = async () => {
        await fetchTemplateData(); // Fetch template data before showing the modal
        if (selectedItem) {
            setDefaultValuesforEdit(selectedItem); // Set default values if an item is selected
        }
        setModifyShow(true);
    }

    /////////////// fetch broadcast list data ///////////////////
    const fetchScheduleBroadcastList = async (page = 1) => {
        setIsLoading(true);
        try {
            // Update page count for the requested page
            setPageCount(page);

            const params = {
                page_number: page,
                page_size: perPageLimit,
            };

            const response = await fetchScheduleBroadcast(params);
            const responseData = response.data;

            if (responseData.error_code === 200) {
                const items = responseData.results.data;
                const pagination = responseData.results.pagination;
                const totalPages = pagination.total_pages;
                const totalItems = pagination.total_items;

                setScheduleBroadcastlist(items);
                setPageCount(totalItems === 0 ? 0 : totalPages);
            } else {
                setScheduleBroadcastlist([]);
                setPageCount(0);
            }
        } catch (error) {
            const responseData = error?.response?.data;
            triggerAlert('error', 'Oops...', responseData ? responseData.message : "Something went wrong!");
        } finally {
            setIsLoading(false);
        }
    };

    ////////////////////////// Delete broadcast ///////////////////////////////////////////////////////////////////
    const deleteBroadcast = async (selectedRowId) => {
        if (selectedRowId) {
            ConfirmationAlert('You want to continue!', 'Continue', async () => {
                setIsLoading(true);

                try {
                    const params = {
                        id: selectedRowId
                    }
                    const response = await deleteScheduleBroadcast(params);

                    const response_data = response.data;

                    if (response.status === 204) {
                        setIsLoading(false);
                        triggerAlert('success', 'success', 'Broadcast deleted successfully');
                        fetchScheduleBroadcastList(1);
                    } else {
                        setIsLoading(false);
                        triggerAlert('error', 'Oops...', 'Failed to delete broadcast');

                    }
                } catch (error) {
                    const response_data = error?.response?.data
                    setIsLoading(false);
                    triggerAlert('error', 'Oops...', response_data ? response_data.message : "Something went wrong!");
                }
            })
        } else {
            triggerAlert("error", "Oops...", "Please select a broadcast");
        }
    }

    useEffect(() => {
        fetchScheduleBroadcastList(1);
        fetchTemplateData(); // Ensure template data is fetched on mount
    }, []);

    // Pagination
    const handlePageClick = (selected) => {
        const selectedPage = selected.selected;
        setPageCount(selectedPage);

        fetchScheduleBroadcastList(selectedPage + 1); // Increment the page number by 1 for server-side pagination
    };
    let props = {
        pageCount: pageCount,
        handlePageClick: handlePageClick,
    };

    const fetchTemplateData = async () => {
        try {
            setIsLoading(true);
            const response = await fetchTempData(); // Your API call function

            if (response?.data?.results?.length) {
                const data = response.data.results;

                // Map the fetched data to options for the dropdown
                const mappedOptions = data.map(template => ({
                    value: template.id,
                    label: template.name,
                    components: template.components // Include the components in the state
                }));

                setTemplateOptions(mappedOptions); // Update the state with the template data
            }
            else {
                // Handle the case where no data is returned
                triggerAlert('info', '', "No data available.");
            }
        } catch (error) {
            console.error("Failed to fetch  data:", error);
        } finally {
            setIsLoading(false);
        }
    };


    const handleScheduleHistory = () => {
        navigate('/whatsapp/broadcast/broadcast_history')
    }
    const handleRowSelect = (item) => {
        setSelectedItem(item); // Set the selected row item

        // Find and display the template name for the selected item
        if (item.temp_name) {
            // console.log("Selected Template Name:", item.temp_name); // Log it or display it in UI
        }
    };

    const editBroadcast = async (item) => {
        setModifyMode("Update"); // Set mode to update
        setDefaultValuesforEdit(item); // Populate the form with selected row data

        const templateForItem = templateOptions.find(template => template.value === item.template_id);
        setSelectedTemplate(templateForItem); // Set the selected template based on the row

        if (item.temp_name) {
            // console.log("Editing Template Name:", item.temp_name); // Log or display in UI
        }
        handleModifyShow(); // Show the edit modal or form
    };

    const setDefaultValuesforEdit = (item) => {
        try {
            setValue("temp_id", item.template_id); // Set the template ID

            // *** FIX STARTS HERE ***
            // The problem: new Date("2025-06-06T17:00:00-04:00") converts the date to the user's local timezone.
            // The solution: Remove the timezone part from the string before creating the Date object.
            // This forces the Date object to be created as if it were in the local timezone, which is what DatePicker needs for correct display.
            if (item.scheduled_date && typeof item.scheduled_date === 'string') {
                // Extracts "YYYY-MM-DDTHH:mm:ss" part from the string
                const dateStringWithoutTimezone = item.scheduled_date.substring(0, 19);
                setValue("scheduled_date", new Date(dateStringWithoutTimezone));
            } else {
                // Fallback if the date is in an unexpected format or null
                setValue("scheduled_date", new Date());
            }
            // *** FIX ENDS HERE ***

            setValue("type", item.group_id ? "group" : "contact"); // Set the type based on group_id
            setValue("id", item.id); // Set the ID

            const template = templateOptions.find(option => option.value === item.temp_id);
            if (template) {
                setSelectedTemplate(template); // Set selected template
                setValue('temp_name', template.label); // Set the template name field
            }

            // Handle contacts or groups based on the type
            if (item.group_id) {
                setValue("phone_numbers", item.group_id); // Set the group
            } else {
                const phoneNumbers = item.phone_numbers.split(',');

                const contactArray = phoneNumbers.map((phone, index) => ({
                    id: item.phone_id[index]?.toString() || phone, // Use phone_id if available, otherwise use the phone number
                    value: phone,
                    label: phone,
                }));

                setValue("to_number", contactArray);
            }

            // Set other form fields
            setValue("head_text", item.head_text || "");
            setValue("body_text_1", item.body_text_1 || "");
            setValue("body_text_2", item.body_text_2 || "");
            setValue("body_text_3", item.body_text_3 || "");
            setValue("body_text_4", item.body_text_4 || "");
            setValue("body_text_5", item.body_text_5 || "");
        }
        catch (error) {
            console.error("Failed to load contact details:", error);
        }
    };

    useEffect(() => {
        if (selectedItem) {
            setDefaultValuesforEdit(selectedItem); // Pass the selected item to your function
        }
    }, [selectedItem]);

    const modifyScheduleBroadcast = async (data) => {
        setIsLoading(true);
        try {
            const formatContactData = () => {
                if (data.type === "group") {
                    return {
                        to_number: [{ id: String(data.phone_numbers) }],
                        phone_numbers: String(data.phone_numbers)
                    };
                } else {
                    const formattedContacts = Array.isArray(data.to_number)
                        ? data.to_number.map(contact => ({
                            id: String(contact.id),
                            value: String(contact.value),
                            label: String(contact.label)
                        }))
                        : [];

                    return {
                        to_number: formattedContacts,
                        phone_numbers: formattedContacts.map(c => c.id).join(',') // Use contact IDs here
                    };
                }
            };

            const contactData = formatContactData();

            let api_input = {
                id: modifyMode === "Update" ? data.id : undefined,
                scheduled_date: format(new Date(data.scheduled_date), "yyyy-MM-dd'T'HH:mm:ss"),
                temp_id: {
                    name: selectedTemplate.label,
                    components: selectedTemplate.components,
                    language: "en_US",
                    status: "APPROVED",
                    category: "MARKETING",
                    id: selectedTemplate.value
                },
                type: data.type,
                ...contactData,
                head_text: data.head_text || "",
                body_text_1: data.body_text_1 || "",
                body_text_2: data.body_text_2 || "",
                body_text_3: data.body_text_3 || "",
                body_text_4: data.body_text_4 || "",
                body_text_5: data.body_text_5 || "",
                status: 1
            };

            // Remove undefined properties
            Object.keys(api_input).forEach(key => (api_input[key] === undefined) && delete api_input[key]);

            // Call the appropriate function based on modifyMode
            let response = modifyMode === "Add"
                ? await addScheduleBroadcast(api_input)
                : await updateScheduleBroadcast(api_input);

            // Handle response
            const response_data = response.data;
            const response_status = modifyMode === "Add" ? 201 : 200;

            if (response.status === response_status) {
                handleModifyClose();
                fetchScheduleBroadcastList(1);
                const successMessage = modifyMode === "Add"
                    ? (response_data.message || 'Schedule broadcast added successfully!')
                    : (response_data.message || 'Schedule updated successfully');
                triggerAlert('success', 'Success', successMessage);
                reset(); // Reset the form fields after successful submission
            } else {
                triggerAlert('error', 'Oops...', 'Unable to process the schedule broadcast');
            }
        } catch (error) {
            console.error(error);
            const response_status = error?.response?.status;
            const response_data = error?.response?.data;

            // Handle specific error statuses
            if (response_status === 400 || response_status === 404) {
                const errorMessage = response_data?.message || (response_status === 400 ? "No valid groups found or groups have no contacts." : "Requested resource not found.");
                triggerAlert('error', 'Error', errorMessage);
                handleModifyClose();
            } else {
                triggerAlert('error', 'Oops...', response_data ? response_data.message : "Something went wrong!");
            }
        } finally {
            setIsLoading(false); // Ensure loading state is reset in both success and error cases
        }
    };



    const handleTemplateSelect = (selectedOption) => {
        if (selectedOption) {
            // Set the temp_id to the selected option's value as a string
            setValue('temp_id', String(selectedOption.value)); // Ensure it's a string
            const selectedTemplate = templateOptions.find(option => option.value === selectedOption.value);
            setSelectedTemplate(selectedTemplate);
        } else {
            setSelectedTemplate(null); // Reset if no option is selected
            setValue('temp_id', ""); // Reset temp_id if no template is selected
        }
    };

    const handleContactSelect = async (selectedOption) => {
        if (!selectedOption) {
            setValue("to_number", []);
            setContactNumbers("");
            return;
        }

        try {
            const formattedContacts = Array.isArray(selectedOption)
                ? selectedOption.map(contact => ({
                    id: String(contact.id), // This is the contact ID from the API
                    value: contact.contact_number || contact.value,
                    label: contact.contact_number || contact.label
                }))
                : [];

            setContactNumbers(formattedContacts.map(c => c.id).join(',')); // Use IDs for phone_numbers
            setValue("to_number", formattedContacts);
        } catch (error) {
            console.error("Error handling contact selection:", error);
            triggerAlert('error', 'Error', 'Failed to process contact selection');
        }
    };

    const handleGroupSelect = async (selectedOption) => {
        setValue('phone_numbers', selectedOption ? selectedOption.value : null);
        if (selectedOption) {
            const groupContacts = selectedOption.label.split(',').map(phone => ({ label: phone, value: phone }));
            setContactNumbers(groupContacts);
        }
    };

    return (
        <>
            <div>
                <div class="position-relative">
                </div>
                <div id="content-page" class="content-page">
                    <div class="container">

                        <PageTitle
                            heading="Scheduled Broadcast"
                            showPrimaryButton="Scheduled History"
                            onPrimaryClick={handleScheduleHistory}
                            showWarningButton={hideButton ? "New Broadcast" : ""}
                            onWarningClick={async () => {
                                setModifyMode("Add");
                                reset();
                                handleModifyShow();
                                await fetchTemplateData(); // Call the API here
                            }}
                        />
                        {hideButton && messageError ? "" : <p className='text-danger' style={{ fontWeight: 500 }}>{messageError}</p>}
                        <div class="row mb-5">
                            <div class="col-sm-12">
                                <div class="card">
                                    <div class="card-body ">
                                        <div class="table-responsive">
                                            <Table id="example" class="table hover" cellspacing="0" width="100%" bordered >
                                                <thead style={{ backgroundColor: "rgb(237, 237, 237)" }}>
                                                    <tr>
                                                        <th>Broadcast Names</th>
                                                        <th>Broadcast Type</th>
                                                        <th>Scheduled</th>
                                                        <th>Recipients</th>
                                                        <th>Status</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {isLoading ? <div className='loader-overlay text-white'>
                                                        <Loader />
                                                    </div> :
                                                        scheduleBroadcastList?.length > 0 ?
                                                            scheduleBroadcastList.map((item, index) => (
                                                                <tr key={index}>
                                                                    <td>{item.temp_name ? item.temp_name : '-'}</td>
                                                                    <td>{item.temp_type ? transformText(item.temp_type, 'capitalize') : '-'}</td>
                                                                    <td>{item.scheduled_date ? formatDateTimes(item.scheduled_date, 'yyyy-mm-dd hh:mm:ss') : '-'}</td>
                                                                    <td><a href="#/"><span class="badge badge-circle2  p-6" title="View Template"
                                                                        onClick={() => handleRecipientsShow(item.phone_numbers)}
                                                                        style={{ cursor: 'pointer' }}>{item.recipient ? item.recipient : '-'}</span></a></td>
                                                                    <td>{item.status ? item.status === 1 ? "Scheduled" : "-" : '-'}</td>
                                                                    <td>
                                                                        <div class="d-flex   align-items-center  ">
                                                                            <a href="#/" onClick={() => handleViewShow(item.temp_name)}>
                                                                                <span className="badge badge-circle2 text-info p-6 me-2" title="View Template">
                                                                                    <span className="material-symbols-outlined fs-4">remove_red_eye</span>
                                                                                </span>
                                                                            </a>

                                                                            <a href="#/" onClick={() => deleteBroadcast(item.id)}><span class="badge badge-circle2 text-danger p-6 me-2" title="Delete"><span class="material-symbols-outlined fs-4">delete</span> </span></a>
                                                                            <a href="#/" onClick={() => editBroadcast(item)}><span class="badge text-primary badge-circle2  p-6" title="Edit"><span class="material-symbols-outlined fs-4" >edit</span> </span></a>
                                                                        </div>
                                                                    </td>

                                                                </tr>
                                                            )) :
                                                            <tr>
                                                                <td colSpan="10" className="text-center">
                                                                    No data available
                                                                </td>
                                                            </tr>

                                                    }

                                                </tbody>
                                            </Table>
                                            <PaginationComponent {...props} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <Modal show={recipientShow} onHide={handleRecipientsClose} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Recipients</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-5">
                        {selectedReceipientNumbers?.length > 0 ? (
                            <ul>
                                {selectedReceipientNumbers.map((phone, index) => (
                                    <li key={index}>{phone}</li>
                                ))}
                            </ul>
                        ) : (
                            <p>No phone numbers available</p>
                        )}
                    </Modal.Body>
                </Modal>

                <Modal show={viewShow} onHide={handleViewClose} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>View Template</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-5">
                        <div className="col-md-12 pre_box mx-20">
                            <div className="card-body bg-light-modal border p-2">
                                <div className="d-flex flex-column justify-content-between">
                                    {selectedTemplate && selectedTemplate.components && selectedTemplate.components.length > 0 ? (
                                        <>
                                            {selectedTemplate.components.map((component, index) => (
                                                <div key={index}>
                                                    {component.type === "HEADER" && (
                                                        <label className="form-label mb-1 fw-500">
                                                            {component.text}
                                                        </label>
                                                    )}
                                                    {component.format === 'IMAGE' && component.example?.header_handle?.length > 0 && (
                                                        <div className="mb-3 d-flex justify-content-center">
                                                            <img
                                                                src={component.example.header_handle[0]}
                                                                alt="Header"
                                                                className="img-fluid"
                                                                style={{ maxWidth: '100%', height: 'auto' }}
                                                            />
                                                        </div>
                                                    )}
                                                    {component.format === 'VIDEO' && component.example?.header_handle?.length > 0 && (
                                                        <div className="mb-3">
                                                            <video
                                                                src={component.example.header_handle[0]}
                                                                controls
                                                                controlsList="nodownload"
                                                                preload="metadata"
                                                                onError={(e) => console.error("Video playback error:", e)}
                                                                className="img-fluid"
                                                                style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }}
                                                            ></video>
                                                        </div>
                                                    )}
                                                    {component.format === 'DOCUMENT' && component.example?.header_handle?.length > 0 && (
                                                        <div className="mb-3 d-flex flex-column align-items-center">
                                                            <FaFilePdf size={50} color="#d32f2f" />                                                            <a
                                                                href={component.example.header_handle[0]}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                download
                                                                className="fw-bold text-primary text-decoration-none"
                                                            >
                                                                Uploaded Document
                                                                <button
                                                                    className="btn btn-outline-light btn-sm py-0 px-2"
                                                                    onClick={() => downloadFile(component.attachment_path, component.attachment_path?.split('/').pop())}
                                                                >
                                                                    <MdOutlineDownloading style={{ fontSize: 'x-large', color: 'grey' }} />
                                                                </button>
                                                            </a>
                                                        </div>
                                                    )}

                                                    {component.type === "BODY" && (
                                                        <p className="mb-1">
                                                            {component.text}
                                                        </p>
                                                    )}
                                                    {component.type === 'FOOTER' && (
                                                        <p className="mb-1">{component.text}</p>
                                                    )}
                                                </div>
                                            ))}
                                            <hr className="custom-black-hr" />
                                            <div className="d-flex flex-column justify-content-between align-items-center">
                                                <div className="d-flex align-items-center">
                                                    {selectedTemplate && selectedTemplate.components && selectedTemplate.components.find(c => c.type === "BUTTONS")?.buttons?.map((button, index) => (
                                                        <div className='d-flex justify-content-between align-items-center me-2' key={index}>
                                                            <i className="fa fa-reply me-1" aria-hidden="true"></i>
                                                            <div>
                                                                <span>{button.text}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <p>No template components available.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                </Modal>


                <Modal show={modifyShow} onHide={handleModifyClose} centered size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>{modifyMode ? modifyMode : ''} Scheduled Template</Modal.Title>
                    </Modal.Header>
                    <form onSubmit={handleSubmit(modifyScheduleBroadcast)}>
                        <Modal.Body className="p-5">
                            <div className="row">
                                <div className="col-md-7">
                                    {/* Template Selector */}
                                    <div className="form-group mb-2">
                                        <label className="form-label mb-2" htmlFor="temp_id">
                                            Template Name<span className="text-danger">*</span>
                                        </label>

                                        <Controller
                                            name="temp_id"
                                            {...register('temp_id', { required: 'Template name is required' })}
                                            control={control}
                                            render={({ field }) => (
                                                <select
                                                    {...field}
                                                    className="form-select"
                                                    disabled={isLoading}
                                                    onChange={(e) => {
                                                        const selectedOption = e.target.options[e.target.selectedIndex];
                                                        field.onChange(selectedOption.value); // Ensure you set the correct value
                                                        handleTemplateSelect(selectedOption); // Make sure this function sets the selectedTemplate state
                                                    }}
                                                >
                                                    <option value="" hidden>
                                                        Select template
                                                    </option>
                                                    {templateOptions.map(option => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        />
                                        {errors.temp_id && <div style={{ color: 'red' }}>{errors.temp_id.message}</div>}
                                    </div>

                                    {/* Header Text */}
                                    {selectedTemplate?.components.find(c => c.type === "HEADER")?.example?.header_text?.[0] && (
                                        <div className="mb-2">
                                            <label className="form-label mb-1 fw-500" htmlFor="headerText">
                                                {selectedTemplate.components.find(c => c.type === "HEADER").example.header_text[0]}
                                            </label>
                                            <input
                                                type="text"
                                                id="headerText"
                                                className="form-control"
                                                defaultValue={selectedTemplate.components.find(c => c.type === "HEADER").example.header_text[0]} // Set default value
                                                {...register('head_text', { required: 'Header text is required' })}
                                            />
                                        </div>
                                    )}

                                    {/* Body Text Fields */}
                                    {selectedTemplate?.components.find(c => c.type === "BODY")?.example?.body_text?.flat().map((text, index) => (
                                        <div key={index} className="mb-2">
                                            <label className="form-label mb-1 fw-500" htmlFor={`bodyText${index}`}>
                                                {text}
                                            </label>
                                            <input
                                                type="text"
                                                id={`bodyText${index}`}
                                                className="form-control"
                                                defaultValue={text} // Set default value for body text
                                                {...register(`body_text_${index}`, { required: `Body text step ${index + 1} is required` })}
                                            />
                                        </div>
                                    ))}

                                    {/* Type Selection */}
                                    <div className="form-group mb-2">
                                        <label className="form-label mb-2" htmlFor="type">Select Contact or Group<span className="text-danger">*</span></label>
                                        <select className="form-select" name="type" {...register("type", { required: "Contact is required" })}>
                                            <option value="" hidden>Select Contact</option>
                                            <option value="contact">Contact</option>
                                            <option value="group">Group</option>
                                        </select>
                                        {errors.type && <div style={{ color: "red" }}>{errors.type.message}</div>}
                                    </div>

                                    {/* Conditional Input for Contact or Group */}
                                    {watch("type") === "contact" && (
                                        <div className="form-group mb-2">
                                            <label className="form-label mb-2" htmlFor="type_of_contact">Select or enter phone number<span className="text-danger ">*</span></label>
                                            <Controller
                                                name="to_number"
                                                {...register('to_number', { required: 'Contact is required' })}
                                                control={control}
                                                render={({ field }) => (
                                                    <MultiSelectDyGet
                                                        {...field}
                                                        apiUrl={api_url + 'sms/get_all_contact_list/'}
                                                        placeholder="Select phone number"
                                                        mapOption={result => ({
                                                            value: result.contact_number,
                                                            label: result.contact_number,
                                                            id: result.id
                                                        })}
                                                        rules={{
                                                            required: 'Phone number is required',
                                                            maxLength: MaxLengthValidation(11),
                                                            minLength: MinLengthValidation(10),
                                                            pattern: {
                                                                value: /^[0-9\s\-+()]*$/,
                                                                message: 'Please enter a valid phone number',
                                                            }
                                                        }}
                                                        value={field.value}
                                                        onSelect={handleContactSelect}
                                                    />
                                                )}
                                            />
                                            {errors.to_number && (
                                                <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                                                    {errors.to_number.message}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {watch("type") === "group" && (
                                        <div className="form-group mb-2">
                                            <label className="form-label mb-2" htmlFor="type_of_contact">Select Group<span className="text-danger ">*</span></label>
                                            <Controller
                                                name="phone_numbers"
                                                {...register('phone_numbers', { required: 'Group is required' })}
                                                control={control}
                                                render={({ field }) => (
                                                    <DynamicSelect
                                                        {...field}
                                                        apiUrl={api_url + 'contact/template_groups_list/'}
                                                        placeholder="Select phone number"
                                                        mapOption={result => ({
                                                            value: result.id,
                                                            label: result.group_name,
                                                        })}
                                                        value={field.value}
                                                        onSelect={handleGroupSelect}
                                                    />
                                                )}
                                            />
                                            {errors.phone_numbers && (
                                                <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                                                    {errors.phone_numbers.message}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Schedule Date */}
                                    <div className="form-group mb-2">
                                        <label htmlFor="scheduled_date" className="form-label mb-2">Schedule (EST Timezone)</label>
                                        <div className="w-100">
                                            <Controller
                                                control={control}
                                                name="scheduled_date"
                                                rules={{ required: 'Schedule is required' }} // Add validation rule here
                                                render={({ field }) => (
                                                    <DatePicker
                                                        selected={field.value ? new Date(field.value) : null}
                                                        onChange={(date) => {
                                                            if (date) {
                                                                const formattedDate = format(date, "yyyy-MM-dd'T'HH:mm:ss");
                                                                setValue("scheduled_date", formattedDate);
                                                                field.onChange(formattedDate);
                                                            } else {
                                                                setValue("scheduled_date", null);
                                                                field.onChange(null);
                                                            }
                                                        }}
                                                        showTimeSelect
                                                        timeFormat="HH:mm"
                                                        timeIntervals={30}
                                                        dateFormat="yyyy-MM-dd HH:mm:ss"
                                                        placeholderText="YYYY-MM-DD HH:MM:SS"
                                                        className="form-control custom-datepicker-widths"
                                                        minDate={new Date()}
                                                    />
                                                )}
                                            />
                                        </div>
                                        {errors.scheduled_date && <div style={{ color: "red" }}>{errors.scheduled_date.message}</div>}
                                    </div>

                                    {/* Hidden Field for ID on Update */}
                                    {modifyMode === "Update" && (
                                        <input type="text" className="form-control" {...register('id')} name='id' hidden />
                                    )}
                                </div>

                                <div className="col-md-5">
                                    <p className="fw-500 mb-2 text-center">Preview</p>
                                    <div className="card-body bg-light-modal border p-2">
                                        <div className="d-flex flex-column justify-content-between">
                                            {selectedTemplate && selectedTemplate.components && selectedTemplate.components.map((component, index) => (
                                                <div key={index}>
                                                    {component.type === "HEADER" && (
                                                        <label className="form-label mb-1 fw-500">
                                                            {component.text}
                                                        </label>
                                                    )}
                                                    {component.format === 'IMAGE' && component.example?.header_handle?.length > 0 && (
                                                        <div className="mb-3 d-flex justify-content-center">
                                                            <img
                                                                src={component.example.header_handle[0]}
                                                                alt="Header"
                                                                className="img-fluid"
                                                                style={{ maxWidth: '100%', height: 'auto' }}
                                                            />
                                                        </div>
                                                    )}
                                                    {component.format === 'DOCUMENT' && component.example?.header_handle?.length > 0 && (
                                                        <div className="mb-3 d-flex flex-column align-items-center">
                                                            <FaFilePdf size={50} color="#d32f2f" />                                                            <a
                                                                href={component.example.header_handle[0]}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                download
                                                                className="fw-bold text-primary text-decoration-none"
                                                            >
                                                                Uploaded Document
                                                                <button
                                                                    className="btn btn-outline-light btn-sm py-0 px-2"
                                                                    onClick={() => downloadFile(component.attachment_path, component.attachment_path?.split('/').pop())}
                                                                >
                                                                    <MdOutlineDownloading style={{ fontSize: 'x-large', color: 'grey' }} />
                                                                </button>
                                                            </a>
                                                        </div>
                                                    )}
                                                    {component.format === 'VIDEO' && component.example?.header_handle?.length > 0 && (
                                                        <div className="mb-3">
                                                            <video
                                                                src={component.example.header_handle[0]}
                                                                controls
                                                                controlsList="nodownload"
                                                                preload="metadata"
                                                                onError={(e) => console.error("Video playback error:", e)}
                                                                className="img-fluid"
                                                                style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }} // Adjust maxHeight as needed
                                                            ></video>
                                                        </div>
                                                    )}
                                                    {component.type === "BODY" && (
                                                        <p className="mb-1">
                                                            {component.text}
                                                        </p>
                                                    )}
                                                    {component.type === 'FOOTER' && (
                                                        <p className="mb-1">{component.text}</p>
                                                    )}
                                                </div>
                                            ))}
                                            <hr className="custom-black-hr" />
                                            <div className="d-flex flex-column justify-content-between align-items-center">
                                                <div className="d-flex align-items-center">
                                                    {selectedTemplate && selectedTemplate.components && selectedTemplate.components.find(c => c.type === "BUTTONS")?.buttons?.map((button, index) => (
                                                        <div className='d-flex justify-content-between align-items-center me-2' key={index}>
                                                            <i className="fa fa-reply me-1" aria-hidden="true"></i>
                                                            <div>
                                                                <span>{button.text}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <button type="button" className="btn btn-warning" onClick={handleModifyClose}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                {isLoading ? (modifyMode === "Add" ? "Adding..." : "Updating...") : modifyMode}
                            </button>
                        </Modal.Footer>
                    </form>


                </Modal>

            </div >
        </>
    )
}