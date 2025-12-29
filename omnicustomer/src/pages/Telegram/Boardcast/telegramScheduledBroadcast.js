import React, { useEffect, useState } from 'react';
import { Modal, Table } from 'react-bootstrap';
import { ConfirmationAlert, formatDateTime, transformText, triggerAlert } from '../../../utils/CommonFunctions';
import { addScheduleBroadcast, deleteScheduleBroadcast, fetchScheduleBroadcast, updateScheduleBroadcast } from '../../../utils/ApiClient';
import PaginationComponent from '../../../common/components/PaginationComponent';
import Loader from '../../../common/components/Loader';
import { Controller, useForm } from 'react-hook-form';
import { onlyAlphaNumericSpaces } from '../../../utils/Constants';
import MultiSelectDyGet from '../../../common/components/selects/MultiSelectDyGet';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import DynamicSelect from '../../../common/components/selects/DynamicSelect';
import { useNavigate } from 'react-router-dom';
import { fetchTempData } from '../../../utils/ApiClient';

const TelegramScheduledBroadcast = () => {
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

    const { register, handleSubmit, control, formState: { errors }, setValue, watch, reset } = useForm({
        defaultValues: {
            scheduled_date: new Date()
        }
    });

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

    const handleModifyClose = () => {
        setModifyShow(false);
        reset(); // Reset the form fields
        setSelectedTemplate(null); // Reset the selected template
        setContactNumbers([]); // Reset contact numbers
    };

    const handleModifyShow = () => {
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

            if (response?.data?.results?.response?.data?.length) {
                const data = response.data.results.response.data;

                // Map the fetched data to options for the dropdown
                const mappedOptions = data.map(template => ({
                    value: template.id,
                    label: template.name,
                    components: template.components // Include the components in the state
                }));

                setTemplateOptions(mappedOptions); // Update the state with the template data
            } else {
                // Handle the case where no data is returned
                triggerAlert('info', '', "No data available.");
            }
        } catch (error) {
            console.log(error, "error");
            let errorMessage = "Something went wrong!";

            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                errorMessage = error.response.data?.message || errorMessage;
            } else if (error.request) {
                // The request was made but no response was received
                errorMessage = "No response received from the server.";
            } else {
                // Something happened in setting up the request that triggered an Error
                errorMessage = error.message || errorMessage;
            }

            triggerAlert('error', '', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleScheduleHistory = () => {
        navigate('/telegram/broadcast/broadcast_history')
    }
    const handleRowSelect = (item) => {
        setSelectedItem(item); // Set the selected row item

        // Find and display the template name for the selected item
        if (item.temp_name) {
            console.log("Selected Template Name:", item.temp_name); // Log it or display it in UI
        }
    };

    // Function to set the form for editing a broadcast
    const editBroadcast = async (item) => {
        setModifyMode("Update"); // Set mode to update
        setDefaultValuesforEdit(item); // Populate the form with selected row data

        const templateForItem = templateOptions.find(template => template.value === item.temp_id.id);
        setSelectedTemplate(templateForItem); // Set the selected template based on the row

        // Display the template name of the selected item
        if (item.temp_name) {
            console.log("Editing Template Name:", item.temp_name); // Log or display in UI
        }

        await fetchTemplateData(); // Fetch additional data related to the template if necessary
        handleModifyShow(); // Show the edit modal or form
    };

    const setDefaultValuesforEdit = (item) => {
        setValue("temp_id", item.temp_id.id); // Set the template ID
        setValue("scheduled_date", new Date(item.scheduled_date)); // Set the date
        setValue("type", item.type); // Set the type (contact or group)
        setValue("id", item.id); // Set the ID

        // Set the template name and ensure it's displayed
        const template = templateOptions.find(option => option.value === item.temp_id.id);
        if (template) {
            setSelectedTemplate(template); // Set selected template
            setValue('temp_name', template.label); // Set the template name field
            console.log("Selected Template Name:", template.label); // Log or display in UI
        }

        // Handle contacts or groups based on the type
        if (item.type === "contact" && item.to_number) {
            const device_array = item.to_number.map(item => ({ label: item.label, value: item.value, id: item.id }));
            setValue("to_number", device_array); // Set the contact numbers
            setContactNumbers(item.phone_numbers);
        } else if (item.type === "group" && item.group_id) {
            setValue("phone_numbers", item.group_id); // Set group ID
        }

        // Set other form fields
        setValue("head_text", item.head_text || "");
        setValue("body_text_1", item.body_text_1 || "");
        setValue("body_text_2", item.body_text_2 || "");
        setValue("body_text_3", item.body_text_3 || "");
        setValue("body_text_4", item.body_text_4 || "");
        setValue("body_text_5", item.body_text_5 || "");
    };

    // Inside your component
    useEffect(() => {
        if (selectedItem) {
            setDefaultValuesforEdit(selectedItem); // Pass the selected item to your function
        }
    }, [selectedItem]);

    const modifyScheduleBroadcast = async (data) => {
        setIsLoading(true);
        try {
            // Prepare API input
            let api_input = {
                scheduled_date: formatDateTime(data.scheduled_date, 'yyyy-mm-dd hh:mm:ss'),
                temp_id: {
                    name: selectedTemplate.label,
                    components: selectedTemplate.components,
                    language: "en_US",
                    status: "APPROVED",
                    category: "MARKETING",
                    id: selectedTemplate.value
                },
                type: data.type || "contact",
                to_number: data.type === "group"
                    ? [{ id: data.phone_numbers }] // Use the id as a property for group
                    : data.to_number.map(number => ({
                        value: number.value,
                        label: number.label,
                        id: number.id
                    })),
                // Adjust phone_numbers based on the type
                phone_numbers: data.type === "group" ? data.phone_numbers.toString() : contactNumbers,
                head_text: data.head_text || "",
                body_text_1: data.body_text_1 || "",
                body_text_2: data.body_text_2 || "",
                body_text_3: data.body_text_3 || "",
                body_text_4: data.body_text_4 || "",
                body_text_5: data.body_text_5 || "",
                file_url: data.file_url || null,
                status: data.status || 1 // Default to 1 if not provided
            };

            // Include id for updates
            if (modifyMode === "Update") {
                api_input.id = data.id; // Set the ID here
            }

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
                setIsLoading(false);
                handleModifyClose();
                fetchScheduleBroadcastList(1);
                const successMessage = modifyMode === "Add"
                    ? (response_data.message || 'Schedule broadcast added successfully!')
                    : (response_data.message || 'Schedule updated successfully');
                triggerAlert('success', 'Success', successMessage);
                reset(); // Reset the form fields after successful submission
            } else {
                setIsLoading(false);
                triggerAlert('error', 'Oops...', 'Unable to process the schedule broadcast');
            }
        } catch (error) {
            console.error(error);
            const response_status = error?.response?.status;
            const response_data = error?.response?.data;
            setIsLoading(false);

            // Handle specific error statuses
            if (response_status === 400 || response_status === 404) {
                const errorMessage = response_data?.message || (response_status === 400 ? "No valid groups found or groups have no contacts." : "Requested resource not found.");
                triggerAlert('error', 'Error', errorMessage);
                handleModifyClose(); // Close the modal
            } else {
                triggerAlert('error', 'Oops...', response_data ? response_data.message : "Something went wrong!");
            }
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
        const selectedValues = selectedOption?.map((item) => item.id).join(",");
        setContactNumbers(selectedValues);
        setValue("to_number", selectedOption)
    };

    const handleGroupSelect = async (selectedOption) => {
        setValue('phone_numbers', selectedOption ? selectedOption.value : null)
    };

    return (
        <>
            <div>
                <div className="position-relative"></div>
                <div id="content-page" className="content-page">
                    <div className="container">
                        <div className="row mb-4 mt-5">
                            <div className="d-flex align-items-center justify-content-between flex-wrap">
                                <h4 className="fw-bold text-primary">Scheduled Broadcast</h4>
                                <div className="d-flex align-items-center">
                                    <button
                                        type="button"
                                        className="btn btn-primary ms-2 d-flex align-items-center"
                                        data-bs-toggle="modal"
                                        data-bs-target="#exampleModalCenter2"
                                        onClick={async () => {
                                            setModifyMode("Add");
                                            reset();
                                            handleModifyShow();
                                            await fetchTemplateData(); // Call the API here
                                        }}
                                    >
                                        {" "}
                                        <span className="ms-2">New Broadcast</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="row mb-5">
                            <div className="col-sm-12">
                                <div className="card">
                                    <div className="card-body ">
                                        <div className="table-responsive">
                                            <table
                                                id="example"
                                                className="table table-striped table-bordered hover"
                                                cellSpacing={0}
                                                width="100%"
                                            >
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Broadcast names</th>
                                                        <th>Broadcost type</th>
                                                        <th>Sheduled</th>
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
                                                                    <td>{item.scheduled_date ? formatDateTime(item.scheduled_date, 'yyyy-mm-dd hh:mm:ss') : '-'}</td>
                                                                    <td><a href="#/"><span class="badge badge-circle2  p-6" title="View Template"
                                                                        onClick={() => handleRecipientsShow(item.phone_numbers)}
                                                                        style={{ cursor: 'pointer' }}>{item.recipient ? item.recipient : '-'}</span></a></td>
                                                                    <td>{item.status ? item.status === 1 ? "Scheduled" : "-" : '-'}</td>
                                                                    <td>
                                                                        <div className="card-header-toolbar d-flex align-items-center">
                                                                            <div className="dropdown">
                                                                                <div
                                                                                    className="dropdown-toggle"
                                                                                    id="dropdownMenuButton"
                                                                                    data-bs-toggle="dropdown"
                                                                                    aria-expanded="false"
                                                                                    role="button"
                                                                                >
                                                                                    <span className="material-symbols-outlined">
                                                                                        more_vert
                                                                                    </span>
                                                                                </div>
                                                                                <div
                                                                                    className="dropdown-menu dropdown-menu-right"
                                                                                    aria-labelledby="dropdownMenuButton"
                                                                                    style={{}}
                                                                                >
                                                                                    <a
                                                                                        className="dropdown-item d-flex align-items-center"
                                                                                        href="#"
                                                                                        onClick={() => editBroadcast(item)}
                                                                                    >
                                                                                        <span className="material-symbols-outlined me-2 md-18">
                                                                                            edit
                                                                                        </span>
                                                                                        Edit
                                                                                    </a>
                                                                                    <a
                                                                                        className="dropdown-item d-flex align-items-center"
                                                                                        href="#"
                                                                                        onClick={() => deleteBroadcast(item.id)}
                                                                                    >
                                                                                        <span className="material-symbols-outlined me-2 md-18">
                                                                                            delete
                                                                                        </span>
                                                                                        Delete
                                                                                    </a>
                                                                                </div>
                                                                            </div>
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
                                            </table>
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
                            <div className="card-body bg-light-modal border p-4">
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
                                                    {/* Display arrow icon only if buttons are present */}
                                                    {/* {selectedTemplate && selectedTemplate.components && selectedTemplate.components.find(c => c.type === "BUTTONS")?.buttons?.length > 0 && (
                                                        <i className="fa fa-reply me-2" aria-hidden="true"></i>
                                                    )} */}
                                                    <span></span>
                                                    {selectedTemplate && selectedTemplate.components && selectedTemplate.components.find(c => c.type === "BUTTONS")?.buttons?.map((button, index) => (
                                                        <div className='d-flex justify-content-between align-items-center me-2'>
                                                            <i className="fa fa-reply me-1" aria-hidden="true"></i>
                                                            <div key={index}>
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
                                                    <option value="">Select template</option>
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
                                                name="scheduled_date" // Assign the name here
                                                className="form-control"
                                                render={({ field }) => (
                                                    <DatePicker
                                                        selected={field.value ? new Date(field.value) : new Date()}
                                                        onChange={(date) => {
                                                            setValue("scheduled_date", date);
                                                            field.onChange(date ? date : null);
                                                        }}
                                                        showTimeSelect
                                                        timeFormat="HH:mm"
                                                        timeIntervals={30}
                                                        dateFormat="yyyy-MM-dd HH:mm:ss"
                                                        placeholderText="YYYY-MM-DD HH:MM:SS"
                                                        className="form-control custom-datepicker-widths"
                                                        minDate={new Date()} // Only allow current and future dates
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
                                    <div className="card-body bg-light-modal border p-4">
                                        <div className="d-flex flex-column justify-content-between">
                                            <h6 className="mb-1 fw-500">
                                                {selectedTemplate && selectedTemplate.components && selectedTemplate.components.find(c => c.type === "HEADER") && (
                                                    <label className="form-label mb-1 fw-500">
                                                        {selectedTemplate.components.find(c => c.type === "HEADER").text}
                                                    </label>
                                                )}
                                                {/* Display Body */}
                                                {selectedTemplate && selectedTemplate.components && selectedTemplate.components.find(c => c.type === "BODY") && (
                                                    <p className="mb-1">
                                                        {selectedTemplate.components.find(c => c.type === "BODY").text}
                                                    </p>
                                                )}
                                            </h6>
                                            <p className="mb-1"></p>
                                            {selectedTemplate && selectedTemplate.components && selectedTemplate.components.find(c => c.type === "FOOTER") && (
                                                <p>{selectedTemplate.components.find(c => c.type === "FOOTER").text}</p>
                                            )}
                                        </div>
                                        <hr className="custom-black-hr" />
                                        <div className="d-flex flex-column justify-content-between align-items-center">
                                            <div className="d-flex align-items-center">
                                                {/* Display arrow icon only if buttons are present */}
                                                {/* {selectedTemplate && selectedTemplate.components && selectedTemplate.components.find(c => c.type === "BUTTONS")?.buttons?.length > 0 && (
                                                        <i className="fa fa-reply me-2" aria-hidden="true"></i>
                                                    )} */}
                                                <span></span>
                                                {selectedTemplate && selectedTemplate.components && selectedTemplate.components.find(c => c.type === "BUTTONS")?.buttons?.map((button, index) => (
                                                    <div className='d-flex justify-content-between align-items-center me-2'>
                                                        <i className="fa fa-reply me-1" aria-hidden="true"></i>
                                                        <div key={index}>
                                                            <span>{button.text}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </Modal.Body>
                        <Modal.Footer>
                            <button type="button" className="btn btn-warning" onClick={handleModifyClose}>Cancel</button>
                            <button type="submit" className="btn btn-primary">{modifyMode ? modifyMode : "Save"}</button>
                        </Modal.Footer>
                    </form>

                </Modal>

            </div>
        </>
    )
}

export default TelegramScheduledBroadcast;
