import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import PageTitle from '../../../common/PageTitle';
import { templateList, createTemplate, editTemplate, deleteTemplate, workspaceDetails } from '../../../utils/ApiClient';
import { triggerAlert, ConfirmationAlert, pageReload, getToken, getInitials } from '../../../utils/CommonFunctions';
import { onlyAlphabetsandSpaces } from '../../../utils/Constants';
import LazyLoadImage from '../../../common/components/LazyLoadImage';
import Loader from '../../../common/components/Loader';
import { truncateName } from '../../../utils/CommonFunctions';

export default function Template() {
    const [searchKeyword, setSearchKeyword] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [templatesList, setTemplatesList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTemplate, setActiveTemplate] = useState(null);
    const [isEditing, setIsEditing] = useState(false); // Added state for edit mode
    const [isFormVisible, setFormVisible] = useState(false); // State to show/hide form
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [editMode, SetEditMode] = useState(false)
    const [selectedUser, SetSelectedUser] = useState(null)
    const [hideButton, setHideButton] = useState(true)
    const [messageError, setMessageError] = useState("")

    const token = getToken();

    const { register, handleSubmit, reset, formState: { errors }, setValue, reset: resetEdit, watch } = useForm();

    const fetchTemplates = async (page, searchkey) => {
        setIsLoading(true);
        try {
            const params = {
                page: page,
                page_size: 10,
                keyword: searchkey // Pass the keyword here
            };
            const response = await templateList(params);
            const response_data = response.data;

            if (response_data.error_code === 200) {
                const items = response_data.results.data;
                setTemplatesList(items);
            } else {
                triggerAlert('info', '', response_data.message || 'Failed to fetch templates');
            }
        } catch (error) {
            const response_data = error?.response?.data;
            triggerAlert('info', '', response_data?.message || 'Something went wrong!');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates(currentPage + 1, searchKeyword); // Pass the updated keyword state
    }, [currentPage, searchKeyword]);

              const handleBulkSendButton = async () => {
                try {
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
            
              }
              useEffect(() => {
                handleBulkSendButton()
              }, [])

    const onSubmit = async (data) => {
        const params = {
            template_name: data.templateName,
            template_message: data.templateMessage,
        };
        setIsLoading(true);
        try {
            if (isEditing) {
                // Update existing template
                const response = await editTemplate(activeTemplate.id, params);
                if (response.status === 200) {
                    triggerAlert('success', 'Success', 'Template updated successfully!!');
                }
            } else {
                // Create new template
                const response = await createTemplate(params);
                if (response.status === 201) {
                    triggerAlert('success', 'Success', 'Template created successfully!!');
                }
            }
            fetchTemplates(currentPage + 1, searchKeyword); // Refresh templates list
            reset(); // Clear form
            SetEditMode(false) // show view mode
            setFormVisible(false); // Hide form
            setIsEditing(false); // Reset edit mode
            setActiveTemplate(null); // Clear active template
        } catch (error) {
            const response_data = error?.response?.data;
            if (response_data?.error_code === 400) {
                triggerAlert('error', ' ', response_data?.message);
            } else {
                triggerAlert('error', ' ', response_data ? response_data.message : "Template already exists!");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateClick = () => {
        reset(); // Reset form fields
        setIsEditing(false); // Ensure create mode
        SetEditMode(true); // Enable form editing
        setFormVisible(true); // Show the form
        setActiveTemplate(null); // Clear active template
    };

    const handleSearch = (event) => {
        setSearchKeyword(event.target.value);
    };

    const handleTemplateClick = (template) => {
        setActiveTemplate(template);
        setIsEditing(true); // Set to edit mode
        setFormVisible(true); // Show form
        // Populate form fields with selected template data
        setValue('templateName', template.template_name);
        setValue('templateMessage', template.template_message);
    };

    const handleCancel = () => {
        SetEditMode(false)
        setFormVisible(false); // Hide form
        reset(); // Clear form fields
        setIsEditing(false); // Reset edit mode
        setActiveTemplate(null); // Clear active template
    };

    const handleDeleteClick = async () => {
        if (!activeTemplate) {
            // Directly show the message without title
            triggerAlert('info', '', 'Please select an Template');
            return;
        }

        ConfirmationAlert('You want to continue!', 'Continue', async () => {
            setIsLoading(true);
            try {
                const response = await deleteTemplate(activeTemplate.id);
                if (response.status === 200) {
                    triggerAlert('success', 'Success', 'Template deleted successfully');

                    // Ensure valid parameters are passed to fetchTemplates
                    fetchTemplates(currentPage + 1, searchKeyword || ''); // Ensure keyword is always a string

                    setActiveTemplate(null);
                    setFormVisible(false); // Hide the form after deletion
                } else {
                    triggerAlert('info', '', 'Failed to delete template');
                }
            } catch (error) {
                const response_data = error?.response?.data;
                triggerAlert('info', '', response_data ? response_data.message : 'Something went wrong!');
            } finally {
                setIsLoading(false);
            }
        });
    };

    const HandleEditMode = () => {
        if (!activeTemplate) {
            // Directly show the message without title
            triggerAlert('info', '', 'Please select a template');
            return;
        }

        setIsEditing(true); // Enable edit mode
        setFormVisible(true); // Show the form for editing

        // Populate the form with the selected template's data
        setValue('templateName', activeTemplate.template_name);
        setValue('templateMessage', activeTemplate.template_message);

        SetEditMode(true); // Set the edit mode
    };

    return (
        <>
            <main className="main-content mt-3 mb-4">
                <div className="container content-inner" id="page_layout">
                    <div className="container">
                        <PageTitle
                            heading="Template"
                            showPrimaryButton={hideButton ? "Create Template" : null}
                            onPrimaryClick={hideButton ? handleCreateClick : null}
                        />
                        {!hideButton && messageError && (
                            <div className="text-danger mt-2">
                                {messageError}
                            </div>
                        )}
                    </div>
                    <div className="row w-100">
                        <div className="col-md-3">
                            <aside className="sidebar-chat sidebar-base border-end shadow-none rounded-2" data-sidebar="responsive">
                                <div className="chat-search pt-3 px-3">
                                    <div className="chat-searchbar mt-4 mb-2 d-flex">
                                        <div className="form-group chat-search-data m-0 position-relative">
                                            <input
                                                type="text"
                                                className="form-control round"
                                                id="chat-search"
                                                placeholder="Search"
                                                value={searchKeyword}
                                                onChange={handleSearch}
                                            />
                                            <i className="material-symbols-outlined search-icon">
                                                search
                                            </i>
                                        </div>
                                        <div className="chat-header-icons d-inline-flex ms-auto">
                                            <div className="dropdown d-flex align-items-center justify-content-center dropdown-custom">
                                                <span className="material-symbols-outlined" id="dropdownMenuButton9" data-bs-toggle="dropdown" aria-expanded="false" role="button"> more_horiz</span>
                                                <div className="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton9">
                                                    {/* <a className="dropdown-item d-flex align-items-center" href="#" onClick={handleCreateClick}>
                                                        <i className="material-symbols-outlined md-18 me-1">add_circle</i>Create
                                                    </a> */}
                                                    {/* <a className="dropdown-item d-flex align-items-center" href="#" onClick={HandleEditMode}>
                                                        <i className="material-symbols-outlined md-18 me-1">edit</i>Edit
                                                    </a> */}
                                                    <a className="dropdown-item d-flex align-items-center" href="#" onClick={handleDeleteClick}>
                                                        <i className="material-symbols-outlined md-18 me-1">delete</i>Delete
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {isLoading && (
                                    <div className='loader-overlay text-white'>
                                        <Loader />
                                    </div>
                                )}

                                <div className='sidebar-body pt-0 data-scrollbar chat-scrollbar mb-5 pb-5 pe-2'>
                                    <ul className="nav navbar-nav iq-main-menu mt-3" id="sidebar-menu" role="tablist">
                                        {templatesList.length === 0 ? (
                                            <li className="nav-item iq-chat-list">
                                                <p className="text-center">No Templates found!</p>
                                            </li>
                                        ) : (
                                            templatesList.map((item) => (
                                                <li
                                                    className={`nav-item iq-chat-list ${activeTemplate?.id === item.id ? 'active' : ''}`}
                                                    key={item.id}
                                                    onClick={() => handleTemplateClick(item)}
                                                >
                                                    <a
                                                        href={`#user-content-${item.id}`}
                                                        className={`nav-link d-flex gap-1 ${activeTemplate?.id === item.id ? 'active' : ''}`}
                                                        data-bs-toggle="tab"
                                                        role="tab"
                                                        aria-controls={`user-content-${item.id}`}
                                                        aria-selected={activeTemplate?.id === item.id}
                                                    >
                                                        <div className="position-relative">
                                                            <span className="badge badge-pill btn btn-soft-danger font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2">

                                                                {item.template_name ? getInitials(item.template_name) : 'U'}

                                                            </span>
                                                        </div>

                                                        <div className="d-flex align-items-center w-100 iq-userlist-data">
                                                            <div className="d-flex flex-grow-1 flex-column">
                                                                <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">
                                                                    {truncateName(item.template_name, 10)}
                                                                </p>
                                                                <small className="text-ellipsis short-1 flex-grow-1 chat-small">
                                                                    {truncateName(item.template_message, 17)} {/* Adjust the length as needed */}
                                                                </small>
                                                            </div>
                                                        </div>
                                                    </a>
                                                </li>
                                            ))
                                        )}
                                    </ul>
                                </div>
                            </aside>
                        </div>
                        {isLoading && (
                            <div className='loader-overlay text-white'>
                                <Loader />
                            </div>
                        )}
                        <div className="col-md-9">
                            <div className="tab-content" id="myTabContent">
                                <div className="card tab-pane mb-0 fade show active" id="user-content-103" role="tabpanel">
                                    {isFormVisible ? (
                                        <>
                                            <div className="chat-head">
                                                <header className="d-flex justify-content-between align-items-center bg-white pt-3 ps-3 pe-3 pb-3 border-bottom">
                                                    <div className="d-flex align-items-center">
                                                        <h5 className="mb-0 text-primary fw-500">
                                                            {editMode
                                                                ? isEditing
                                                                    ? "Edit Template"
                                                                    : "Create Template"
                                                                : "View Template"}
                                                        </h5>
                                                    </div>
                                                    {!editMode && (
                                                        <div className="chat-header-icons d-inline-flex ms-auto">
                                                            <button type="submit" onClick={HandleEditMode} className="btn btn-primary d-flex align-items-center btn-sm">
                                                                <span className="material-symbols-outlined">edit_note</span>
                                                                <span className="d-none d-lg-block ms-1">Edit</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </header>
                                            </div>
                                            <div className="card-body chat-body bg-body chat-contacts">
                                                <form onSubmit={handleSubmit(onSubmit)}>
                                                    <div className="row mt-3">
                                                        <div className="col-md-12 mb-3">
                                                            <label className="form-label" for="validationDefault01">Template Name</label>
                                                            <input
                                                                type="text"
                                                                {...register('templateName', {
                                                                    required: 'Template Name is required',
                                                                })}
                                                                className={`form-control ${errors.templateName ? 'is-invalid' : ''}`}
                                                                value={editMode ? undefined : selectedUser?.templateMessage}
                                                                disabled={!editMode}
                                                                style={{ width: '100%' }}  // Adjust height as needed
                                                            />
                                                            {errors.templateName && (
                                                                <div className="invalid-feedback">
                                                                    {errors.templateName.message}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="col-md-12 mb-3">
                                                            <label className="form-label" htmlFor="validationDefault01">Template Message</label>
                                                            <textarea
                                                                {...register('templateMessage', {
                                                                    required: 'Template Message is required',
                                                                })}
                                                                className={`form-control ${errors.templateMessage ? 'is-invalid' : ''}`}
                                                                value={editMode ? undefined : selectedUser?.templateMessage}
                                                                disabled={!editMode}
                                                                rows={13}
                                                                style={{ width: '100%' }}
                                                                maxLength={1000}  // Allow up to 1000 characters
                                                            ></textarea>
                                                            {errors.templateMessage && (
                                                                <div className="invalid-feedback">
                                                                    Template Message is required
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="d-flex justify-content-between align-items-center mt-2">
                                                        <span>Total No Of Characters: {watch("templateMessage") ? watch("templateMessage").length : 0}</span>
                                                    </div>
                                                    {editMode && (
                                                        <div className="col-md-12 mb-3">
                                                            <div className="d-flex justify-content-end gap-3">
                                                                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                                                    {isLoading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update' : 'Create')}
                                                                </button>
                                                                <button type="button" onClick={handleCancel} className="btn btn-secondary px-4 d-flex align-items-center" disabled={isLoading}>
                                                                    <span>Cancel</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </form>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="card-body chat-body bg-body chat-loadimage">
                                            <div className='d-flex justify-content-center flex-column align-items-center'>
                                                <LazyLoadImage
                                                    src="/assets/images/Templates.jpg"
                                                    alt="Templates"
                                                />
                                                <p className='text-center'>Please select any one Template and view</p>
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
