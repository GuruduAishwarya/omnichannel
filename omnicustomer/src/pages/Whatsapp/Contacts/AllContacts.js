import React, { useState, useEffect, useRef } from 'react';
import PageTitle from '../../../common/PageTitle';
import { Modal, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { onlyAlphabets, onlyNumbers, MaxLengthValidation, MinLengthValidation, onlyAlphabetsandSpaces, emailValidation, noEmptySpacesValidation } from "../../../utils/Constants";
import { triggerAlert, getBase64, ConfirmationAlert, getInitials } from '../../../utils/CommonFunctions';
import { CreateCoustomerContacts, fetchUsers, UpdateUser, UploadBulk, DeleteUser, workspaceDetails } from "../../../utils/ApiClient";
import { truncateName, truncateMessage } from '../../../utils/CommonFunctions';
import CountryCodeSelector from '../../../common/components/CountryCode';

export default function AllContacts() {
    const [showModal2, setShowModal2] = useState(false);
    const [showModal1, setShowModal1] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedUser, SetSelectedUser] = useState(null);
    const [editMode, SetEditMode] = useState(false);
    const [favourite, setFavourite] = useState(selectedUser?.favourite || 0);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [countryCode, setCountryCode] = useState('+1'); // Default to US
    const pageSize = 10;
    const [currentPage, setCurrentPage] = useState(1); // Start from 1
    const [hasMore, setHasMore] = useState(true); // Used to stop API calls when all pages fetched
    const [totalItems, setTotalItems] = useState(0); // State to store total items
    const dropdownRef = useRef(null);
     const [hideButton, setHideButton] = useState(true)
    const [messageError, setMessageError] = useState("")
    const [buttonLoading, setButtonLoading] = useState(true)
          
    const handleBulkSendButton = async () => {
        try {
            setButtonLoading(true)
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
        finally {
            setButtonLoading(false)
        }
    }
                    useEffect(() => {
                      handleBulkSendButton()
                    }, [])
          
    

    const { register, handleSubmit, control, formState: { errors }, setValue, watch, reset } = useForm();
    const { register: registerEdit, handleSubmit: handleSubmitEdit, control: controlEdit, formState: { errors: errorsEdit }, setValue: setValueEdit, watch: watchEdit, reset: resetEdit, trigger } = useForm({
        defaultValues: {
            contact_name: selectedUser?.contact_name || '',
            contact_number: selectedUser?.contact_number || '',
            designation: selectedUser?.designation || '',
            email: selectedUser?.email || '',
        }
    });

    const handleSearch = (event) => {
        setSearchKeyword(event.target.value);
    };

    const { register: registerBulk, handleSubmit: HandleSubmitBulk, formState: { errors: errorsBulk }, reset: resetBulk } = useForm();

    const validateFile = (file) => {
        if (!file || file.length === 0) {
            return 'Please select a file.';
        }
        const selectedFile = file[0];
        const isCSV = selectedFile.type === 'text/csv';
        const isValidSize = selectedFile.size <= 1024 * 1024;

        if (!isCSV) {
            return 'Please upload a valid CSV file.';
        }
        if (!isValidSize) {
            return 'File size should be less than 1MB.';
        }
        return true;
    };

    const handleSelectAllChange = async (event) => {
        const isChecked = event.target.checked;
        setSelectAll(isChecked);

        if (isChecked) {
            try {
                const response = await fetchUsers({ page: 1, page_size: totalItems, keyword: searchKeyword });
                if (response.data.error_code === 200) {
                    const allUserIds = Object.values(response.data.results.data).map(user => user.id);
                    setSelectedUsers(allUserIds);
                }
            } catch (error) {
                triggerAlert('error', '', 'Failed to select all contacts.');
            }
        } else {
            setSelectedUsers([]);
        }
    };



    const handleCheckboxChange = (userId) => {
        const newSelectedUsers = selectedUsers.includes(userId)
            ? selectedUsers.filter(id => id !== userId)
            : [...selectedUsers, userId];

        setSelectedUsers(newSelectedUsers);

        if (selectedUsers.includes(userId)) {
            // If a user is deselected, `selectAll` must be false.
            setSelectAll(false);
        } else if (newSelectedUsers.length === totalItems && totalItems > 0) {
            // If all users are now selected, set `selectAll` to true.
            setSelectAll(true);
        }
    };

    const toggleDropdown = () => {
        setShowDropdown((prevState) => !prevState);
    };

    const HandleSubmitBulkupdate = async (data) => {
        setIsLoading(true); // Set loading state to true
        try {
            if (data.file[0]) {
                const file = await getBase64(data.file[0]);
                const trimmedFile = file.split(',')[1];
                const response = await UploadBulk({ file: trimmedFile });

                if (response.data.error_code === 201) {
                    fetchAllUsers();
                    triggerAlert('success', 'success', 'Bulk created successfully!!');
                    setShowDropdown(false);
                    setShowModal1(false);
                    setSearchKeyword("");
                }
            }
            resetBulk();
        } catch (error) {
            const response_data = error?.response?.data;
            if (response_data?.error_code === 400) {
                triggerAlert('error', ' ', response_data?.message);
            } else {
                triggerAlert('error', ' ', response_data ? response_data.message : "Something went wrong!");
            }
            setShowModal1(false);
        } finally {
            setIsLoading(false); // Reset loading state
        }
    };


    const handleShowModal2 = (e) => {
        e.preventDefault();
        setShowModal2(true);
        reset(); // Reset the form fields
    };

    const handleShowModal1 = () => {
        setShowDropdown(false); // Close the dropdown
        setShowModal1(true); // Open the Bulk upload modal
    };

    const handleFavouriteToggle = () => {
        if (editMode) {
            setFavourite(prev => (prev === 1 ? 0 : 1));
        }
    };

    const HandleEditMode = () => {
        if (!selectedUser) {
            triggerAlert('info', ' ', 'At least select one user');
            return; // Prevent further execution if no user is selected
        }
        setShowDropdown(false); // Close the dropdown
        SetEditMode(true); // Set to edit mode
    };

    const handleCancelEdit = () => {
        // Reset form to initial values
        SetEditMode(false);  // Exit edit mode
        resetEdit({
            contact_name: selectedUser?.contact_name || '',
            contact_number: selectedUser?.contact_number || '',
            designation: selectedUser?.designation || '',
            email: selectedUser?.email || '',
        });

        // Clear all validation errors
        trigger(); // Ensure no errors are being triggered
    };

    const handleCloseModal2 = () => setShowModal2(false);
    const handleCloseModal1 = () => setShowModal1(false);
    const HandleSubmit = async (data) => {
        setIsLoading(true); // Set loading state to true
        try {
            // Trim the contact_name field to remove leading and trailing spaces
            const trimmedName = data.contact_name?.trim();

            // Check if the trimmed name is empty or only spaces
            if (!trimmedName) {
                triggerAlert('error', 'Validation Error', 'Name cannot be empty or just spaces');
                setIsLoading(false); // Reset loading state
                return; // Stop the submission
            }

            console.log("data", data);
            // Update the data with the trimmed name
            const params = { ...data, contact_name: trimmedName };

            const response = await CreateCoustomerContacts(params);
            const response_data = response.data;

            if (response_data.error_code === 201) {
                triggerAlert('success', 'success', 'User created successfully!!');
                fetchAllUsers();
                setShowDropdown(false);
                setSearchKeyword("");
                reset(); // Reset the form fields after successful submission
            } else {
                triggerAlert('error', ' ', 'Failed to create user');
            }
        } catch (error) {
            const response_data = error?.response?.data;
            if (response_data?.error_code === 400) {
                triggerAlert('error', ' ', response_data?.message);
            } else {
                triggerAlert('error', ' ', response_data ? response_data.message : "Something went wrong!");
            }
        } finally {
            setIsLoading(false); // Reset loading state
            handleCloseModal2();
        }
    };

    // Fetch user data
    const fetchAllUsers = async (page = 1, searchKeyword = "", append = false) => {
        setIsLoading(true);
        try {
            const params = {
                page: page,
                page_size: pageSize,
                keyword: searchKeyword
            };
            const response = await fetchUsers(params);
            const response_data = response.data;
            if (response_data.error_code === 200) {
                const data = Object.values(response_data.results.data);
                const pagination = response_data.results.pagination;
                if (data.length > 0) {
                    if (append) {
                        setUsers(prevUsers => [...prevUsers, ...data]);
                        // If selectAll is active, add the new users to the selection
                        if (selectAll) {
                            const newUserIds = data.map(user => user.id);
                            setSelectedUsers(prevSelected => [...new Set([...prevSelected, ...newUserIds])]);
                        }
                    } else {
                        setUsers(data);
                        if (selectAll) {
                            setSelectedUsers(data.map(user => user.id));
                        }
                        SetSelectedUser(data[0]);
                    }
                    setHasMore(pagination.page_number < pagination.total_pages);
                    setTotalItems(pagination.total_items); // Update total items
                } else {
                    if (!append) {
                        setUsers([]);
                        SetSelectedUser(null);
                    }
                    setHasMore(false);
                }
            } else {
                setUsers([]);
                triggerAlert('error', ' ', 'Failed to fetch users.');
            }
        } catch (error) {
            const response_data = error?.response?.data;
            triggerAlert('error', '', response_data ? response_data.message : "Something went wrong!");
        } finally {
            setIsLoading(false);
        }
    };



    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const scrollHeight = document.body.scrollHeight;
            const clientHeight = window.innerHeight;

            if (scrollTop + clientHeight >= scrollHeight - 100 && hasMore && !isLoading) {
                const nextPage = currentPage + 1;
                setCurrentPage(nextPage);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [currentPage, isLoading, hasMore]);


    const handleUserClick = (user) => {
        // Set the selected user
        SetSelectedUser(user);
        setValueEdit('contact_name', user.contact_name);
        setValueEdit('contact_number', user.contact_number);
        setValueEdit('designation', user.designation);
        setValueEdit('email', user.email);
        // Reset the form and clear validation errors
        // resetEdit({
        //     contact_name: user.contact_name || '',
        //     contact_number: user.contact_number || '',
        //     designation: user.designation || '',
        //     email: user.email || '',
        // });

        // Optionally, you might want to switch to edit mode if needed
        // SetEditMode(true);
    };

    useEffect(() => {
        if (selectedUser) {
            setValueEdit('contact_name', selectedUser.contact_name);
            setValueEdit('contact_number', selectedUser.contact_number);
            setValueEdit('designation', selectedUser.designation);
            setValueEdit('email', selectedUser.email);
        }
    }, [selectedUser]);

    const HandleUpdate = async (data) => {
        setIsLoading(true); // Set loading state to true
        try {
            // Check if a user is selected
            if (!selectedUser?.id) {
                triggerAlert('info', ' ', 'At least select one user');
                setIsLoading(false); // Reset loading state
                return; // Prevent further execution if no user is selected
            }

            const updatedData = { ...data, id: selectedUser?.id, favourite };
            const response = await UpdateUser(updatedData);

            if (response.data.error_code === 200) {
                SetEditMode(false);
                fetchAllUsers();
                triggerAlert('success', 'success', 'User updated successfully!!');
                setShowDropdown(false);
                SetSelectedUser(selectedUser?.id);
                setSearchKeyword(" ");
            }
        } catch (error) {
            const response_data = error?.response?.data;
            if (response_data?.error_code === 400) {
                triggerAlert('error', ' ', response_data?.message);
            } else {
                triggerAlert('error', ' ', response_data ? response_data.message : "Something went wrong!");
            }
        } finally {
            setIsLoading(false); // Reset loading state
        }
    };

    const deleteMultiple = async () => {
        try {
            if (selectedUsers.length === 0) {
                triggerAlert('info', ' ', 'At least select one user');
            } else {
                ConfirmationAlert('You want to continue!', 'Continue', async () => {
                    const response = await DeleteUser({ contact_ids: selectedUsers });

                    if (response.status === 204) {
                        triggerAlert('success', 'Success', 'Contacts deleted successfully!');
                        setShowDropdown(false);

                        // ✅ Reload entire page
                        setTimeout(() => {
                            window.location.reload();
                        }, 1000); // Delay to allow alert to show
                    }
                });
            }
        } catch (error) {
            triggerAlert('error', ' ', error?.response?.data?.message || 'Something went wrong!');
        }
    };

    useEffect(() => {
        if (editMode) {
            trigger();
        }
    }, [trigger]);

    // useEffect(() => {
    //     if (selectedUser) {
    //         setFavourite(selectedUser.favourite === "1" ? 1 : 0);
    //     }

    //     if (selectedUsers.length === users.length) {
    //         setSelectAll(true);
    //     } else {
    //         setSelectAll(false);
    //     }
    // }, [selectedUsers, users.length, selectedUser]);

    useEffect(() => {
        fetchAllUsers(currentPage, searchKeyword, currentPage > 1); // append if page > 1
    }, [currentPage, searchKeyword]);


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) && showDropdown) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);


    return (
        <>
            <div id="content-page" className="content-page">
                <div className="container">
                    {buttonLoading ? (
                        <div className="d-flex align-items-center mb-3">
                            <h4 className="mb-0 me-3">Contact List</h4>
                            <div className="spinner-border spinner-border-sm" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <PageTitle heading="Contact List" showPrimaryButton={hideButton ? "Create Contact" : ""} showWarningButton={hideButton ? "Bulk Upload" : ""} onPrimaryClick={handleShowModal2} onWarningClick={handleShowModal1} />
                            {!hideButton && messageError && <p className='text-danger' style={{ fontWeight: 500 }}>{messageError}</p>}
                        </>
                    )}
                        <div class="row w-100">
                            <div class="col-md-3">
                                <aside class="sidebar-chat sidebar-base border-end shadow-none  rounded-2" data-sidebar="responsive">
                                    <div class="chat-search pt-3 px-3 ">
                                        <div class="chat-searchbar mt-4 mb-2 d-flex">
                                            <div class="form-group chat-search-data m-0">
                                                <input
                                                    type="text"
                                                    className="form-control round"
                                                    id="chat-search"
                                                    placeholder="Search"
                                                    value={searchKeyword}
                                                    onChange={handleSearch}
                                                />
                                                <i class="material-symbols-outlined">
                                                    search
                                                </i>
                                            </div>

                                            <div className="dropdown d-flex align-items-center justify-content-center dropdown-custom" ref={dropdownRef}>
                                                <span
                                                    className="material-symbols-outlined show"
                                                    role="button"
                                                    onClick={toggleDropdown}
                                                >
                                                    more_horiz
                                                </span>
                                                {showDropdown && (
                                                    <div className="dropdown-menu dropdown-menu-end show" aria-labelledby="dropdownMenuButton9"
                                                        style={{ position: "absolute", inset: "0px 0px auto auto", margin: "0px", transform: "translate(-8px, 34px)" }}>
                                                        <button onClick={deleteMultiple} className="dropdown-item d-flex align-items-center">
                                                            <i className="material-symbols-outlined md-18 me-1">delete</i>Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>


                                            <Modal show={showModal1} onHide={handleCloseModal1} size="lg" centered>
                                                <Modal.Header closeButton>
                                                    <Modal.Title>
                                                        Bulk Contact <span className="required text-danger">*</span> <span className="modal-span">(Upload a CSV file)</span>
                                                    </Modal.Title>
                                                </Modal.Header>
                                                <Modal.Body>
                                                    <form onSubmit={HandleSubmitBulk(HandleSubmitBulkupdate)}>
                                                        <div className="card-header d-flex justify-content-between align-items-center">
                                                            <div className="header-title text-warning">
                                                                <p>Please use the below given sample file format for the upload.</p>
                                                            </div>
                                                            <div className="card-header-toolbar d-flex align-items-center">
                                                                <a
                                                                    href="https://customer.vitelsms.com/plugin/docs/bulk_uploads_sample.csv"
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="btn btn-sm btn-primary me-2 d-flex"
                                                                >
                                                                    <span className="material-symbols-outlined">attach_file_add</span>
                                                                    Sample.csv
                                                                </a>
                                                            </div>
                                                        </div>

                                                        <Form.Group controlId="formFile" className="mb-3">
                                                            <Form.Label>Choose File</Form.Label>
                                                            <Form.Control
                                                                type="file"
                                                                accept=".csv"
                                                                {...registerBulk('file', { validate: validateFile })}
                                                            />
                                                            {errorsBulk.file && <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                                {errorsBulk.file.message}
                                                            </div>}
                                                        </Form.Group>

                                                        <Modal.Footer>
                                                            <button type="submit" className="btn btn-primary" disabled={isLoading} >
                                                                {isLoading ? "Updating..." : "Update"}
                                                            </button>
                                                        </Modal.Footer>
                                                    </form>
                                                </Modal.Body>
                                            </Modal>

                                            {/* Create Contact Modal */}
                                            <Modal show={showModal2} onHide={handleCloseModal2} size="lg" centered>
                                                <Modal.Header closeButton>
                                                    <Modal.Title>Create Contact</Modal.Title>
                                                </Modal.Header>
                                                <Modal.Body>
                                                    <form onSubmit={handleSubmit(HandleSubmit)}>
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <div className="form-group">
                                                                    <label className="form-label" htmlFor="exampleInputText1">Name<span className="text-danger">*</span></label>
                                                                    <input
                                                                        type="text"
                                                                        name="contact_name"
                                                                        id="city"
                                                                        className="form-control"
                                                                        placeholder="Enter your name"
                                                                        {...register('contact_name', {
                                                                            required: 'Name is required',
                                                                            validate: value => value.trim() !== '' || 'Name cannot be empty or just spaces',
                                                                            pattern: onlyAlphabetsandSpaces,
                                                                            maxLength: MaxLengthValidation(100),
                                                                        })}
                                                                    />
                                                                    {errors.contact_name && (
                                                                        <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                                            {errors.contact_name.message}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group">
                                                                    <label className="form-label" htmlFor="exampleInputText1">Email<span className="text-danger"></span></label>
                                                                    <input
                                                                        type="text"
                                                                        name="email"
                                                                        id="city"
                                                                        className="form-control"
                                                                        placeholder="Enter your email"
                                                                        {...register('email', {
                                                                            pattern: emailValidation,
                                                                        })}
                                                                    />
                                                                    {errors.email && (
                                                                        <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                                            {errors.email.message}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group">
                                                                    <label className="form-label" htmlFor="exampleInputText1">Phone No<span className="text-danger">*</span></label>
                                                                    <CountryCodeSelector
                                                                        control={control}
                                                                        name="contact_number"
                                                                        containerClass="custom-iti-class"
                                                                        rules={{
                                                                            required: 'Phone number is required',
                                                                            maxLength: MaxLengthValidation(15),
                                                                            minLength: MinLengthValidation(10),
                                                                            pattern: {
                                                                                value: /^[0-9\s\-+()]*$/,
                                                                                message: 'Please enter a valid phone number',
                                                                            }
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group">
                                                                    <label className="form-label" htmlFor="exampleInputText1">Designation<span className="text-danger"></span></label>
                                                                    <input
                                                                        type="text"
                                                                        name="designation"
                                                                        id="city"
                                                                        className="form-control"
                                                                        placeholder="Enter your designation"
                                                                        {...register('designation', {
                                                                            pattern: onlyAlphabetsandSpaces,
                                                                            maxLength: MaxLengthValidation(100),
                                                                        })}
                                                                    />
                                                                    {errors.designation && (
                                                                        <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                                            {errors.designation.message}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                        </div>
                                                        <Modal.Footer>
                                                            <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                                                {isLoading ? "Creating..." : "Create"}
                                                            </button>
                                                        </Modal.Footer>
                                                    </form>
                                                </Modal.Body>
                                            </Modal>


                                            {/* </div> */}
                                        </div>
                                    </div>

                                    <div className="sidebar-body pt-0 data-scrollbar chat-scrollbar   pe-2">
                                        {/* <!-- Sidebar Menu Start --> */}
                                        <ul className="nav navbar-nav iq-main-menu" style={{ border: "1px" }} id="sidebar-menu" role="tablist">
                                            <li className="nav-item static-item mb-0">
                                                <a className="nav-link static-item disabled mb-0" href="#" tabIndex="-1">
                                                    <h5 className="default-icon">TOTAL CONTACTS {totalItems}</h5>
                                                </a>
                                            </li>

                                            {/* Select All Checkbox */}
                                            <li className="nav-item mb-0">
                                                <div className="form-check form-check-inline me-2">
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        id="select-all"
                                                        checked={selectAll}
                                                        onChange={handleSelectAllChange}
                                                    />
                                                    <label className="form-check-label" htmlFor="select-all">Select All</label>
                                                </div>
                                            </li>
                                            {users.length > 0 ? (
                                                users.map((user) => (
                                                    <li
                                                        key={user.id}
                                                        className={`nav-item iq-chat-list ${selectedUser?.id === user.id ? 'active row_selected' : ''}`}
                                                        onClick={() => handleUserClick(user)}
                                                        role="tab"
                                                    >
                                                        <div className="nav-link d-flex gap-0" role="tab">
                                                            <div className="form-check form-check-inline me-2">
                                                                <input
                                                                    type="checkbox"
                                                                    className="form-check-input p-2"
                                                                    id={`checkbox-${user.id}`}
                                                                    checked={selectedUsers.includes(user.id)}
                                                                    onChange={() => handleCheckboxChange(user.id)}
                                                                />
                                                            </div>
                                                            <div className="d-flex gap-1 align-items-center">
                                                                <div className="position-relative">
                                                                    <span className="badge badge-pill btn btn-soft-danger font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2">
                                                                        {user.contact_name ? getInitials(user.contact_name) : 'U'}
                                                                    </span>
                                                                </div>
                                                                <div className="d-flex align-items-center w-100 iq-userlist-data">
                                                                    <div className="d-flex flex-grow-1 flex-column">
                                                                        <div className="d-flex align-items-center gap-1">
                                                                            <p className="mb-0 text-ellipsis short-1 user-chat flex-grow-1 iq-userlist-name fw-500">
                                                                                {truncateName(user.contact_name, 17)}
                                                                            </p>
                                                                        </div>
                                                                        <div className="d-flex align-items-center gap-2">
                                                                            <small className="text-ellipsis short-1 flex-grow-1 chat-small">
                                                                                {user.contact_number}
                                                                            </small>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="nav-item no-user-found">
                                                    <div className="nav-link d-flex gap-0 justify-content-center">
                                                        <span>No Contacts found!</span>
                                                    </div>
                                                </li>
                                            )}

                                        </ul>
                                        {/* <!-- Sidebar Menu End --> */}
                                    </div>

                                </aside>
                            </div>

                            <div className="col-md-9">
                                <div className="tab-content" id="myTabContent">
                                    <div className="card tab-pane mb-0 fade show active" id="user-content-103" role="tabpanel">
                                        <div className="chat-head">
                                            <header className="d-flex justify-content-between align-items-center bg-white pt-3 ps-3 pe-3 pb-3 border-bottom">
                                                <div className="d-flex align-items-center">
                                                    <h5 className="mb-0 text-primary fw-500">
                                                        {editMode ? "Edit Contact" : "View Contact"}
                                                    </h5>
                                                </div>

                                                {!editMode && hideButton && (
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
                                            <form onSubmit={handleSubmitEdit(HandleUpdate)}>
                                                <div className="row mt-3">
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label" htmlFor="contactName">Contact Name <span className="text-danger">*</span></label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            {...registerEdit('contact_name', {
                                                                required: editMode ? 'Name is required' : false,
                                                                validate: value => value.trim() !== '' || 'Contact Name cannot be empty or just spaces',
                                                                pattern: editMode ? onlyAlphabetsandSpaces : undefined,
                                                                maxLength: MaxLengthValidation(100),
                                                            })}
                                                            disabled={!editMode}
                                                        />
                                                        {errorsEdit.contact_name && (
                                                            <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                                {errorsEdit.contact_name.message}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label" htmlFor="phoneNumber">Phone number <span className="text-danger">*</span></label>
                                                        <CountryCodeSelector
                                                            control={controlEdit}
                                                            name="contact_number"
                                                            defaultValue={selectedUser && `${selectedUser?.contact_number}`}
                                                            containerClass="custom-iti-class"
                                                            rules={{
                                                                required: 'Phone number is required',
                                                                maxLength: MaxLengthValidation(15),
                                                                minLength: MinLengthValidation(10),
                                                                pattern: {
                                                                    value: /^[0-9\s\-+()]*$/,
                                                                    message: 'Please enter a valid phone number',
                                                                }
                                                            }}
                                                            disabled={!editMode}
                                                        />
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label" htmlFor="designation">Designation <span className="text-danger"></span></label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            {...registerEdit('designation', {
                                                                pattern: onlyAlphabetsandSpaces,
                                                                maxLength: MaxLengthValidation(100),
                                                            })}
                                                            disabled={!editMode}
                                                        />
                                                        {errorsEdit.designation && (
                                                            <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                                {errorsEdit.designation.message}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label" htmlFor="email">Email <span className="text-danger"></span></label>
                                                        <input
                                                            type="email"
                                                            className="form-control"
                                                            {...registerEdit('email', {
                                                                pattern: emailValidation,
                                                            })}
                                                            disabled={!editMode}
                                                        />
                                                        {errorsEdit.email && (
                                                            <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                                {errorsEdit.email.message}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label mb-0" htmlFor="favourite">Favourite</label>
                                                        <a
                                                            href="#"
                                                            onClick={handleFavouriteToggle}
                                                            style={{
                                                                pointerEvents: editMode ? 'auto' : 'none',
                                                                color: favourite === 1 ? 'darkorange' : 'gray',
                                                                cursor: editMode ? 'pointer' : 'default'
                                                            }}
                                                        >
                                                            <span className="d-flex align-items-center mt-2">
                                                                <i className="fa fa-star fs-3" aria-hidden="true"></i>
                                                            </span>
                                                        </a>
                                                    </div>
                                                    {editMode && (
                                                        <div className="col-md-12 mb-3">
                                                            <div className="d-flex justify-content-end gap-3">
                                                                <button type="submit" className="btn btn-success px-4 d-flex align-items-center" disabled={isLoading}>
                                                                    {isLoading ? "Updating..." : "Update"}
                                                                </button>
                                                                <button type="button" onClick={handleCancelEdit} className="btn btn-secondary px-4 d-flex align-items-center">
                                                                    <span>Cancel</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
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
