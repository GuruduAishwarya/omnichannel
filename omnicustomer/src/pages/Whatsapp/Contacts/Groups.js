import React, { useEffect, useState } from 'react'
import PageTitle from '../../../common/PageTitle'
import { deletelistGroup, fetchGroups, createGroupWhatsapp, updateGroup, fetchUsers, UploadBulkGroup, listContact,workspaceDetails } from '../../../utils/ApiClient'
import { ConfirmationAlert, getBase64, getInitials, triggerAlert } from '../../../utils/CommonFunctions'
import { useForm } from 'react-hook-form'
import { onlyAlphabetsandSpaces } from '../../../utils/Constants'
import SpinnerLoader from '../../../common/components/SpinnerLoader'
import LazyLoadImage from '../../../common/components/LazyLoadImage'
import { Modal, Form } from 'react-bootstrap';
import { truncateName } from '../../../utils/CommonFunctions';

const Groups = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingGroups, setIsLoadingGroups] = useState(false);
    const [GroupList, setGroupList] = useState([]);
    const [showOffCanvas, setShowOffCanvas] = useState(false);
    const [showOffCanvasEdit, setShowOffCanvasEdit] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [showModal1, setShowModal1] = useState(false);
    const [users, setUsers] = useState([])
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchKeyUser, setSearchKeywordUser] = useState('');
    const { register, handleSubmit, formState: { errors }, setValue, getValues, reset: resetEdit } = useForm();
    const { register: registerCreate, handleSubmit: handleSubmitCreate, formState: { errors: errorsCreate }, reset } = useForm();
    const { register: registerBulk, handleSubmit: HandleSubmitBulk, formState: { errors: errorsBulk }, reset: resetBulk } = useForm();
    const [previousSelectedUsers, setPreviousSelectedUsers] = useState([]);
    const [isChecked, setIsChecked] = useState(selectedGroup?.status === 1);
    const pageSize = 10;
    const [selectedUser, SetSelectedUser] = useState(null);
    const [totalItems, setTotalItems] = useState(0);

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
          
    

    const handleSearch = (event) => {
        setSearchKeyword(event.target.value);
        setCurrentPage(0); // Update search results on every change
        Groups(currentPage + 1, event.target.value);
    };

    const HandleUserSearch = (event) => {
        setSearchKeywordUser(event.target.value);
        fetchAllUsers(currentPage + 1, event.target.value);


    };

    const onSubmit = async (data) => {
        try {
            if (selectedUsers.length === 0) {
                triggerAlert('error', '', "There are no selected users");
                return;
            }

            const status = isChecked ? "1" : "0"; // Use the isChecked state to determine the status

            const response = await updateGroup({
                group_name: data.group_name,
                group_contacts: selectedUsers,
                channel: 1,
                id: selectedGroup.id,
                status: status, // Pass the status as a string
            });

            if (response.status === 200) {
                setShowOffCanvasEdit(false);
                triggerAlert('success', 'success', 'Group Updated successfully!!');
                Groups(currentPage + 1, searchKeyword);
                setSelectedGroup(null);
                setSelectedUsers([]);
                setSelectAll(false);
                setShowDropdown(false);
                fetchAllUsers(currentPage + 1, searchKeyUser);
                resetEdit();
                setIsEditing(false);
            }
        } catch (error) {
            console.log(error, "error");
            triggerAlert('error', '', error?.response?.data ? error?.response?.data?.message : "Something went wrong!");
        }
    };





    const handleEditClick = () => {
        setIsEditing(true);

    };



    // Function to handle "Select All" checkbox change
    const handleSelectAllChange = () => {
        if (selectAll) {
            // Uncheck all checkboxes
            setSelectedUsers([]);
        } else {
            // Check all checkboxes (select all user IDs)
            const allUserIds = users.map(user => user.id);
            setSelectedUsers(allUserIds);
        }
        setSelectAll(!selectAll);
    };


    // Function to handle individual checkbox changes
    const handleCheckboxChange = (userId) => {
        if (selectedUsers.includes(userId)) {
            // If the user is already selected, remove them from the selectedUsers array
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            // Otherwise, add the user to the selectedUsers array
            setSelectedUsers([...selectedUsers, userId]);
        }
    };



    const handleGroupClick = (group) => {
        setSelectedGroup(group);


    };

    const handleShowCreate = () => {
        setPreviousSelectedUsers(selectedUsers);
        setSelectedUsers([])
        setShowOffCanvas(true);
    }

    const handleCloseCreate = () => {
        setShowOffCanvas(false);
        setSelectedUsers(previousSelectedUsers);
    }
    const handleShowEdit = () => {
        if (!selectedGroup) {
            triggerAlert("error", "", "Please select a group");
        } else {
            setShowOffCanvasEdit(true);
        }

    }

        ;

    const handleCloseEdit = () => {
        setShowOffCanvasEdit(false);
        setIsEditing(false)
    }


    const toggleDropdown = () => {
        setShowDropdown((prevState) => !prevState);
    };


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

    const HandleSubmitBulkupdate = async (data) => {
        setIsLoading(true); // Set loading state to true
        try {
            if (data.file && data.file[0]) {
                const file = await getBase64(data.file[0]);
                const trimmedFile = file.split(',')[1];

                const response = await UploadBulkGroup({ group_name: data.group_name, file: trimmedFile });

                if (response.data.error_code === 201) {
                    triggerAlert('success', 'success', 'Bulk created successfully!!');
                    await Groups(currentPage + 1, searchKeyword);  // Ensure this is awaited
                    fetchAllUsers(currentPage + 1, searchKeyUser);
                    setShowDropdown(false);
                    setShowModal1(false);
                }
            }
            resetBulk(); // Resetting form after operation is complete
        } catch (error) {
            const response_data = error?.response?.data;
            if (response_data?.error_code === 400) {
                triggerAlert('error', ' ', response_data?.message);
            } else {
                triggerAlert('error', ' ', response_data ? response_data.message : "Group already exists!");
            }
        } finally {
            setIsLoading(false); // Ensure loading state is reset in both success and error cases
            handleCloseModal1();
        }
    };



    const deleteGroup = async () => {
        if (selectedGroup) {
            ConfirmationAlert('You want to continue!', 'Continue', async () => {
                setIsLoading(true);

                try {
                    const response = await deletelistGroup(selectedGroup);

                    if (response.status === 204) {
                        // Fetch updated group list after deletion
                        const updatedGroups = await fetchGroups({
                            page: currentPage + 1,
                            page_size: 10,
                            keyword: searchKeyword
                        });

                        if (updatedGroups.data.results.data.length === 0 && currentPage > 0) {
                            // If the current page is empty after deletion, go to the previous page
                            setCurrentPage(currentPage - 1);
                            Groups(currentPage, searchKeyword);
                        } else {
                            Groups(currentPage + 1, searchKeyword);
                        }

                        triggerAlert('success', 'success', 'Group Deleted successfully!!');
                        setShowDropdown(false);
                        setIsLoading(false)

                        // Optionally, reset selectedGroup to avoid issues with referencing the deleted group
                        setSelectedGroup(updatedGroups.data.results.data[0] || null);
                    } else {
                        setIsLoading(false);
                        triggerAlert('error', '', 'Failed to delete group');

                    }
                } catch (error) {
                    const response_data = error?.response?.data
                    setIsLoading(false);
                    triggerAlert('error', '', response_data ? response_data.message : "Something went wrong!");
                }
            })
        } else {
            triggerAlert("error", "", "Please select a group");
        }
    }
    const [hasMore, setHasMore] = useState(true); // Used to stop API calls when all pages fetched

    const Groups = async (page = 1, keyword = "") => {
        try {
            setIsLoadingGroups(true);
            // keyword = searchKeyword
            const params = {
                page: page,
                page_size: 10,
                keyword: keyword
            };
            // console.log("params", params)
            const response = await fetchGroups(params);

            if (response.data.error_code === 200) {
                const items = response.data.results.data;

                if (items.length > 0) {
                    setGroupList(items);

                } else {
                    // No groups found,ndle this gracefully
                    setGroupList([]);
                    setSelectedGroup(null);
                }
            }
        } catch (error) {
            const response_data = error?.response?.data;
            triggerAlert('error', '', response_data ? response_data.message : "Something went wrong!");
        } finally {
            setIsLoadingGroups(false);
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

    const CreateGroup = async (data) => {
        setIsLoading(true); // Set loading state to true
        try {
            if (selectedUsers.length === 0) {
                triggerAlert('error', '', "There are no selected users");
                setIsLoading(false); // Reset loading state
            } else {
                const response = await createGroupWhatsapp({
                    group_name: data.group_name,
                    group_contacts: selectedUsers,
                    channel: 1
                });

                if (response.status === 201) {
                    triggerAlert('success', 'success', 'Group Created successfully!!');
                    setShowOffCanvas(false);
                    Groups(currentPage + 1, searchKeyword);
                    setShowDropdown(false);
                    setSelectedUsers([]);
                    setSelectAll(false);
                    reset();
                }
            }
        } catch (error) {
            const response_data = error?.response?.data;
            triggerAlert('error', '', response_data ? response_data.message : "Something went wrong!");
        } finally {
            setIsLoading(false); // Reset loading state
        }
    };

    // const handleStatusChange = (isChecked) => {
    //     const newStatus = isChecked ? 1 : 0; // Convert true/false to 1/0
    //     setValue('status', newStatus); // Update the form value

    //     setSelectedGroup((prevGroup) => ({
    //         ...prevGroup,
    //         status: newStatus, // Update the selected group's status
    //     }));
    // };


    const handleStatusChange = (isChecked) => {
        setSelectedGroup((prevGroup) => ({
            ...prevGroup,
            status: isChecked ? "1" : "0", // Update the status to "1" for checked or "0" for unchecked
        }));
        setIsChecked(isChecked); // Update the checked state
    };


    useEffect(() => {
        if (selectedGroup) {
            setValue('group_name', selectedGroup.group_name);
            setIsChecked(selectedGroup.status == 1 ? true : false);
        }
    }, [selectedGroup]);


    useEffect(() => {
        if (selectedGroup) {
            // Extract contact numbers of users already in the selected group
            const preselectedUserIds = users
                .filter(user => selectedGroup.group_contacts.some(contact => contact.contact_number === user.contact_number))
                .map(user => user.id);

            // Set these users as selected
            setSelectedUsers(preselectedUserIds);
        }
    }, [selectedGroup, users]);



    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            Groups(currentPage + 1);
            fetchAllUsers(currentPage + 1);
        }, 500);



        return () => clearTimeout(delayDebounceFn);
    }, [currentPage]);

    useEffect(() => {
        if (!isEditing) {
            setSelectedUsers([]); // Reset to empty array when not editing
        }
    }, [isEditing]);

    // console.log("Selected Group:", isChecked);
    // console.log("Users:", users);

    const handleShowModal1 = () => {
        setShowDropdown(false); // Close the dropdown
        setShowModal1(true); // Open the Bulk upload modal
    };


    const handleCloseModal1 = () => setShowModal1(false);



    return (
        <>
            <div id="content-page" className="content-page">

                <div className="container">


                    {buttonLoading ? (
                        <div className="d-flex align-items-center mb-3">
                            <h4 className="mb-0 me-3">Group List</h4>
                            <div className="spinner-border spinner-border-sm" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <PageTitle heading="Group List" showPrimaryButton={hideButton ? "Create Group " : ""} showWarningButton={hideButton ? "Bulk Upload" : ""} onPrimaryClick={handleShowCreate} onWarningClick={handleShowModal1} />
                            {!hideButton && messageError && <p className='text-danger' style={{ fontWeight: 500 }}>{messageError}</p>}
                        </>
                    )}
                        <div class="row w-100">
                            <div className="col-md-3">
                                <aside className="sidebar-chat sidebar-base border-end shadow-none rounded-2" data-sidebar="responsive">
                                    {GroupList.length > 0 && ( // Only render search if there are groups
                                        <div className="chat-search pt-3 px-3">
                                            <div className="chat-searchbar mt-4 mb-2 d-flex">
                                                <div className="form-group chat-search-data m-0">
                                                    <input
                                                        type="text"
                                                        className="form-control round"
                                                        id="chat-search"
                                                        placeholder="Search"
                                                        value={searchKeyword}
                                                        onChange={handleSearch}
                                                    />
                                                    <i className="material-symbols-outlined">
                                                        search
                                                    </i>
                                                </div>
                                                <div className="chat-header-icons d-inline-flex ms-auto">
                                                    <div className="dropdown d-flex align-items-center justify-content-center dropdown-custom">
                                                        <span
                                                            className="material-symbols-outlined"
                                                            id="dropdownMenuButton9"
                                                            onClick={toggleDropdown}
                                                            role="button"
                                                        >
                                                            more_horiz
                                                        </span>

                                                        {showDropdown && (
                                                            <div
                                                                className="dropdown-menu dropdown-menu-end show"
                                                                aria-labelledby="dropdownMenuButton9"
                                                                style={{
                                                                    position: "absolute",
                                                                    inset: "0px 0px auto auto",
                                                                    margin: "0px",
                                                                    transform: "translate(-8px, 34px)",
                                                                    zIndex: 1050, // Ensure it appears above other elements
                                                                }}
                                                            >
                                                                {/* <button
                                                                    className="dropdown-item d-flex align-items-center"
                                                                    onClick={() => {
                                                                        handleShowCreate();
                                                                        // closeDropdown();
                                                                    }}
                                                                >
                                                                    <i className="material-symbols-outlined md-18 me-1">add_circle</i>Create
                                                                </button> */}
                                                                <button
                                                                    className="dropdown-item d-flex align-items-center"
                                                                    onClick={() => {
                                                                        deleteGroup();
                                                                        // closeDropdown();
                                                                    }}
                                                                >
                                                                    <i className="material-symbols-outlined md-18 me-1">delete</i>Delete
                                                                </button>
                                                                {/* <button
                                                                    className="dropdown-item d-flex align-items-center"
                                                                    onClick={() => {
                                                                        handleShowEdit();
                                                                        // closeDropdown();
                                                                    }}
                                                                >
                                                                    <i className="material-symbols-outlined md-18 me-1">edit_note</i>Edit
                                                                </button> */}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="sidebar-body pt-0 data-scrollbar chat-scrollbar mb-5 pb-5 pe-2">
                                        <ul className="nav navbar-nav iq-main-menu mt-3" id="sidebar-menu" role="tablist">
                                            {isLoadingGroups ? (
                                                <SpinnerLoader />
                                            ) : GroupList.length > 0 ? (
                                                GroupList.map((item) => (
                                                    <li
                                                        className={`nav-item iq-chat-list ${selectedGroup?.id === item.id ? "active row_selected" : ""
                                                            }`}
                                                        onClick={() => handleGroupClick(item)}
                                                        role="tab"
                                                        key={item.id}
                                                    >
                                                        <div className="nav-link d-flex gap-0" role="tab">
                                                            <div className="position-relative me-2">
                                                                <span className="badge badge-pill btn btn-soft-danger font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2">
                                                                    {item.group_name
                                                                        ? getInitials(item.group_name)
                                                                        : 'U'}
                                                                </span>
                                                                {/* <div class={`iq-profile-avatar  ${item.status == 1 && 'status-online'}`} >

                                                                </div> */}
                                                            </div>
                                                            <div className="d-flex align-items-center w-100 iq-userlist-data">
                                                                <div className="d-flex flex-grow-1 flex-column">
                                                                    <div className="d-flex align-items-center gap-1">
                                                                        <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">
                                                                            {truncateName(item.group_name, 10)}
                                                                        </p>
                                                                        <span
                                                                            className={`badge ${item.status === 1 ? 'bg-success' : 'bg-secondary'}`}
                                                                            style={{ minWidth: '60px', display: 'inline-block', textAlign: 'center' }}
                                                                        >
                                                                            {item.status === 1 ? 'Active' : 'Inactive'}
                                                                        </span>

                                                                    </div>

                                                                    <div className="d-flex align-items-center gap-2">
                                                                        <small className="text-ellipsis short-1 flex-grow-1 chat-small">
                                                                            {item.group_contacts.length} Members
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))
                                            ) : (
                                                <div
                                                    style={{
                                                        padding: "20px",
                                                        color: "#6c757d",
                                                        fontSize: "16px",
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    No data found
                                                </div>
                                            )}
                                        </ul>
                                    </div>
                                </aside>

                            </div>




                            <div class="col-md-9">
                                <div class="tab-content" id="myTabContent">
                                    <div class="card tab-pane mb-0 fade show active" role="tabpanel">
                                        {/* <!-- Chat Header --> */}
                                        <>
                                            {/* {
                                            isLoading ? (
                                                <Loader />
                                            ) : ( */}
                                            {selectedGroup ? (
                                                <>
                                                    <div className="chat-head">
                                                        <header className="d-flex justify-content-between align-items-center bg-white pt-3 ps-3 pe-3 pb-3 border-bottom rounded-top">
                                                            <div className="d-flex align-items-center">

                                                                <div className="position-relative">
                                                                    <span className="badge badge-pill btn btn-soft-danger font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2">
                                                                        {selectedGroup.group_name
                                                                            ? getInitials(selectedGroup.group_name)
                                                                            : 'U'}
                                                                    </span>
                                                                </div>

                                                                <div className="d-flex align-items-center w-100 iq-userlist-data">
                                                                    <div className="d-flex flex-grow-1 flex-column">
                                                                        <p className="mb-0 iq-userlist-name fw-500">{selectedGroup?.group_name}</p>
                                                                        <small className="text-ellipsis chat-small">{selectedGroup?.group_contacts.length} Members</small>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {/* Edit Button */}
                                                            {hideButton && (
                                                                <button onClick={handleShowEdit} type="submit" className="btn btn-primary d-flex align-items-center btn-sm">
                                                                    <span className="material-symbols-outlined">edit_note</span>
                                                                    <span className="d-none d-lg-block ms-1">Edit</span>
                                                                </button>
                                                            )}
                                                        </header>
                                                    </div>
                                                    <div class="card-body chat-body bg-body chat-contacts">
                                                        <div className="group-members-list p-3 border-bottom">
                                                            <h6>Group Members</h6>
                                                            <ul className="list-unstyled mb-0">
                                                                {selectedGroup?.group_contacts.map((contact) => (
                                                                    <li key={contact.id} className="d-flex justify-content-between align-items-center py-2">
                                                                        <div className="d-flex align-items-center">
                                                                            {/* First letter badge */}
                                                                            <div className="position-relative me-2">
                                                                                <span className="badge badge-pill bg-soft-primary font-weight-normal badge-45 md-14 rounded-circle p-2">
                                                                                    {contact.contact_name ? getInitials(contact.contact_name) : 'U'}
                                                                                </span>
                                                                            </div>

                                                                            {/* Contact name and number */}
                                                                            <div>
                                                                                <strong>{contact.contact_name}</strong>
                                                                                <div>
                                                                                    <small className="text-muted">{contact.contact_number}</small>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <div></div>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (


                                                <div class="card-body chat-body bg-body chat-contacts">
                                                    <div className='d-flex justify-content-center flex-column align-items-center'>
                                                        <LazyLoadImage src="/assets/images/Groups.jpg" alt="group" />

                                                        <p className='text-center'>Please select any one Group and view</p>
                                                    </div>
                                                </div>
                                            )}
                                            {/* )} */}

                                        </>







                                        {/* <!-- Chat Body --> */}

                                        {/* <div className="card-body chat-body inbox-body bg-body" style={{ height: "500px", overflowY: "auto" }}>
                                            <div class="iq-message-body iq-current-user">
                                                <div class="iq-chat-text">
                                                    <div class="d-flex align-items-center justify-content-end">
                                                        <div class="iq-chating-content">
                                                            <p class="mb-0 iq-userlist-chat text-secondary">Here is another message!</p>
                                                            <small class="text-capitalize text-end">12:16 PM</small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div> */}
                                    </div>
                                </div>
                            </div>


                            <Modal show={showModal1} onHide={handleCloseModal1} size="lg" centered>
                                <Modal.Header closeButton>
                                    <Modal.Title>
                                        Bulk Contact <span className="required text-danger">*</span>
                                        <span className="modal-span">(Upload a CSV file)</span>
                                    </Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <form onSubmit={HandleSubmitBulk(HandleSubmitBulkupdate)}>
                                        {/* Header Section */}
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

                                        {/* Group Name Input */}
                                        <Form.Group controlId="formGroupName" className="mb-3">
                                            <Form.Label>Group Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter Group Name"
                                                {...registerBulk('group_name', {
                                                    required: 'Group Name is required',
                                                    maxLength: { value: 50, message: 'Group Name cannot exceed 50 characters' },
                                                    required: ' Group Name is required',
                                                    pattern: {
                                                        value: /^[a-zA-Z0-9]+$/, // Allows only alphabets and numbers, no spaces
                                                        message: 'Group Name can only contain letters and numbers',
                                                    },
                                                })}
                                            />
                                            {errorsBulk.group_name && (
                                                <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                    {errorsBulk.group_name.message}
                                                </div>
                                            )}
                                        </Form.Group>

                                        {/* File Upload Input */}
                                        <Form.Group controlId="formFile" className="mb-3">
                                            <Form.Label>Choose File</Form.Label>
                                            <Form.Control
                                                type="file"
                                                accept=".csv"
                                                {...registerBulk('file', { validate: validateFile })}
                                            />

                                            {errorsBulk.file && (
                                                <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                    {errorsBulk.file.message}
                                                </div>
                                            )}
                                        </Form.Group>

                                        <Modal.Footer>
                                            <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                                {isLoading ? "Updating..." : "Update"}

                                            </button>
                                        </Modal.Footer>
                                    </form>
                                </Modal.Body>
                            </Modal>

                            <div
                                className={`offcanvas offcanvas-end ${showOffCanvas ? 'show' : ''}`}
                                tabIndex="-1"
                                id="offcanvasRight1"
                                aria-labelledby="offcanvasRightLabel1"
                                style={{ visibility: showOffCanvas ? 'visible' : 'hidden', padding: '0px' }}
                            >
                                <div className="offcanvas-header">
                                    <h4 className="fw-bold text-white">Create Group</h4>
                                    <div className="close-icon" onClick={handleCloseCreate}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24px" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                                        </svg>
                                    </div>
                                </div>
                                <form onSubmit={handleSubmitCreate(CreateGroup)}>
                                    <div className="offcanvas-body">
                                        <div className="row">
                                            <div className="px-0">
                                                <aside className="sidebar-chat sidebar-base border-end shadow-none rounded-2" data-sidebar="responsive">
                                                    {/* <div className="chat-search px-3">
                                                        <div className="chat-searchbar mb-2">
                                                            <div className="form-group chat-search-data m-0 d-flex align-items-center">
                                                                <input
                                                                    type="text"
                                                                    className="form-control round"
                                                                    id="chat-search"
                                                                    placeholder="Search"
                                                                    value={searchKeyUser}
                                                                    onChange={(e) => { HandleUserSearch(e) }}
                                                                />
                                                                <i className="material-symbols-outlined ms-2">search</i>
                                                            </div>
                                                        </div>
                                                    </div> */}

                                                    <div class="chat-search px-3 ">
                                                        <div class="chat-searchbar  mb-2  ">
                                                            <div class="form-group chat-search-data m-0">
                                                                <input
                                                                    type="text"
                                                                    className="form-control round"
                                                                    id="chat-search"
                                                                    placeholder="Search"
                                                                    value={searchKeyUser}
                                                                    onChange={HandleUserSearch}
                                                                />
                                                                <i class="material-symbols-outlined">
                                                                    search
                                                                </i>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="chat-search px-3 mt-3">
                                                        <div className="chat-searchbar mb-2">
                                                            <div className="form-group chat-search-data m-0">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Enter Group Name"
                                                                    className="form-control round group-name flex-grow-1 me-2"
                                                                    name="group_name"
                                                                    {...registerCreate('group_name', {
                                                                        required: 'Group Name is required',
                                                                        pattern: {
                                                                            value: /^[a-zA-Z0-9]+$/, // Allows only alphabets and numbers, no spaces
                                                                            message: 'Group Name can only contain letters and numbers',
                                                                        },
                                                                    })}
                                                                />
                                                            </div>
                                                            {errorsCreate.group_name && (
                                                                <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                                    {errorsCreate.group_name.message}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>


                                                    <div className="sidebar-body pt-0 data-scrollbar chat-scrollbar mb-5 pb-5 pe-2">
                                                        <ul className="nav navbar-nav iq-main-menu" style={{ border: "1px" }} id="sidebar-menu" role="tablist">
                                                            <li className="nav-item static-item mb-0">
                                                                <a className="nav-link static-item disabled mb-0" href="#" tabIndex="-1">
                                                                    <h5 className="default-icon">TOTAL CONTACTS {users.length}</h5>
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
                                                                users.map((user) => {
                                                                    const isUserChecked = selectedUsers.includes(user.id);

                                                                    return (
                                                                        <li key={user.id} className={`nav-item iq-chat-list`} role="tab">
                                                                            <div className="nav-link d-flex gap-0" role="tab">
                                                                                <div className="form-check form-check-inline me-2">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        className="form-check-input p-2"
                                                                                        id={`checkbox-${user.id}`}
                                                                                        checked={isEditing ? isUserChecked : isUserChecked}
                                                                                        onChange={() => handleCheckboxChange(user.id)}
                                                                                    />
                                                                                </div>
                                                                                <div className="d-flex gap-1 align-items-center">
                                                                                    <div className="position-relative">
                                                                                        <span className="badge badge-pill btn btn-soft-danger font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2">
                                                                                            {user.contact_name
                                                                                                ? getInitials(user.contact_name)

                                                                                                : 'U'}
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
                                                                    );
                                                                })
                                                            ) : (
                                                                <li className="nav-item iq-chat-list no-data-found" role="tab">
                                                                    <div className="nav-link d-flex gap-0 justify-content-center">
                                                                        <span>No data found</span>
                                                                    </div>
                                                                </li>
                                                            )}
                                                        </ul>
                                                        <div
                                                            style={{
                                                                position: "sticky",
                                                                height: 14,
                                                                bottom: 0,
                                                                backgroundColor: "white",
                                                                padding: "10px 0",
                                                                zIndex: 1,
                                                            }}
                                                        >
                                                            <button className="btn btn-primary d-block w-100 mt-1" disabled={isLoading}>
                                                                {isLoading ? "Creating..." : "Create"}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </aside>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>






                            <div
                                className={`offcanvas offcanvas-end ${showOffCanvasEdit ? 'show' : ''}`}
                                tabIndex="-1"
                                id="offcanvasRight1"
                                aria-labelledby="offcanvasRightLabel1"
                                style={{ visibility: showOffCanvasEdit ? 'visible' : 'hidden', padding: '0px' }}
                            >



                                <div className="offcanvas-header">
                                    <h4 className="fw-bold text-white" >Edit Group</h4>
                                    <div className="close-icon" onClick={handleCloseEdit}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24px" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                                        </svg>
                                    </div>
                                </div>


                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <div className="offcanvas-body">

                                        <div className="row">
                                            <div className="px-0">
                                                <aside className="sidebar-chat sidebar-base border-end shadow-none rounded-2" data-sidebar="responsive">

                                                    {/* <div className="chat-search px-3">
                                                        <div className="chat-searchbar mb-2">
                                                            <div className="form-group chat-search-data m-0 d-flex align-items-center">
                                                                <input
                                                                    type="text"
                                                                    className="form-control round"
                                                                    id="chat-search"
                                                                    placeholder="Search"
                                                                    value={searchKeyUser}
                                                                    onChange={HandleUserSearch}
                                                                />
                                                                <i className="material-symbols-outlined ms-2">search</i>
                                                            </div>
                                                        </div>
                                                    </div> */}

                                                    <div class="chat-search px-3 ">
                                                        <div class="chat-searchbar  mb-2  ">
                                                            <div class="form-group chat-search-data m-0">
                                                                <input
                                                                    type="text"
                                                                    className="form-control round"
                                                                    id="chat-search"
                                                                    placeholder="Search"
                                                                    value={searchKeyUser}
                                                                    onChange={HandleUserSearch}
                                                                />
                                                                <i class="material-symbols-outlined">
                                                                    search
                                                                </i>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="chat-search px-3 mt-3">
                                                        <div className="chat-searchbar mb-2">

                                                            <div className="form-group chat-search-data m-0 d-flex align-items-center">
                                                                <input
                                                                    type="text"
                                                                    placeholder={selectedGroup?.group_name}
                                                                    className="form-control round group-name flex-grow-1 me-2"
                                                                    name="group_name"
                                                                    {...register('group_name', {
                                                                        required: isEditing ? ' GroupName is required' : false,
                                                                        pattern: isEditing ? onlyAlphabetsandSpaces : undefined,
                                                                    })}

                                                                    disabled={!isEditing}
                                                                />

                                                                {!isEditing && (
                                                                    <button type="button" className="btn btn-primary d-flex align-items-center btn-sm">
                                                                        <span className="material-symbols-outlined" onClick={handleEditClick}>edit_note</span>

                                                                    </button>
                                                                )}

                                                            </div>
                                                            {errors.group_name && (
                                                                <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                                    {errors.group_name.message}
                                                                </div>
                                                            )}

                                                        </div>


                                                    </div>

                                                    <div className="group-status mb-3 mt-4">
                                                        <div className="d-flex justify-content-around">
                                                            <div className="me-20">
                                                                <label className="fs-6 fw-semibold form-label mb-0">Check to Yes?</label>
                                                                <div className="fw-500 text-muted">If you need to activate your group</div>
                                                            </div>
                                                            <label className="form-check form-switch form-check-custom form-check-solid">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="checkbox"
                                                                    id="status"
                                                                    checked={isChecked}
                                                                    onChange={(e) => handleStatusChange(e.target.checked)}
                                                                />
                                                                <span className="form-check-label fw-semibold text-muted">Status</span>
                                                            </label>
                                                        </div>
                                                    </div>



                                                    <div className="sidebar-body pt-0 data-scrollbar chat-scrollbar mb-5 pb-5 pe-2" style={{ position: "relative", paddingBottom: "70px" }}>
                                                        {/* <!-- Sidebar Menu Start --> */}
                                                        <ul className="nav navbar-nav iq-main-menu" style={{ border: "1px" }} id="sidebar-menu" role="tablist">
                                                            <li className="nav-item static-item mb-0">
                                                                <a className="nav-link static-item disabled mb-0" href="#" tabIndex="-1">
                                                                    <h5 className="default-icon"> TOTAL CONTACTS {users.length}</h5>
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
                                                                users.map((user) => {
                                                                    // Determine if the user should be checked
                                                                    const isUserChecked = selectedUsers.includes(user.id);

                                                                    return (
                                                                        <li key={user.id} className={`nav-item iq-chat-list`} role="tab">
                                                                            <div className="nav-link d-flex gap-0" role="tab">
                                                                                <div className="form-check form-check-inline me-2">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        className="form-check-input p-2"
                                                                                        id={`checkbox-${user.id}`}
                                                                                        checked={isEditing ? isUserChecked : isUserChecked}
                                                                                        onChange={() => handleCheckboxChange(user.id)}
                                                                                    />
                                                                                </div>
                                                                                <div className="d-flex gap-1 align-items-center">
                                                                                    <div className="position-relative">
                                                                                        <span className="badge badge-pill btn btn-soft-success font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2">
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
                                                                    );
                                                                })
                                                            ) : (
                                                                <li className="nav-item iq-chat-list no-data-found" role="tab">
                                                                    <div className="nav-link d-flex gap-0 justify-content-center">
                                                                        <span>No data found</span>
                                                                    </div>
                                                                </li>
                                                            )}
                                                        </ul>

                                                        {/* Update Button - Fixed at the bottom */}
                                                        <div style={{
                                                            position: "sticky",
                                                            height: 14,
                                                            bottom: 0,
                                                            backgroundColor: "white",
                                                            padding: "10px 0",
                                                            zIndex: 1,
                                                        }}>
                                                            <button className="btn btn-primary d-block w-100 mt-1">Update</button>
                                                        </div>

                                                        {/* <!-- Sidebar Menu End --> */}
                                                    </div>

                                                </aside>
                                            </div>
                                        </div>
                                    </div>
                                </form>


                            </div>
                        </div >

                </div>
            </div>
        </>
    )
}

export default Groups

