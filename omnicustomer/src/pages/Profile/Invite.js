import React, { useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { fetchSubUsersInvitationList, sentSubUserInvitation, deleteSubUser } from '../../utils/ApiClient';
import { triggerAlert, formatDateTime, handleTableRowClick, ConfirmationAlert } from '../../utils/CommonFunctions';
import { MaxLengthValidation, MinLengthValidation, onlyNumbers, passwordPattern } from "../../utils/Constants";
import PaginationComponent from "../../common/components/PaginationComponent";
import Loader from '../../common/components/Loader';
import { getCookie } from '../../utils/CommonFunctions';

// Add NoDataMessage component
const NoDataMessage = ({ type, customMessage }) => {
    const messages = {
        workspace: { icon: 'business', title: 'No Workspace Selected', description: 'No workspaces have been assigned yet.' },
        users: { icon: 'group_off', title: 'No Users Found', description: 'No users are available.' },
        permissions: { icon: 'security', title: 'No Permissions Set', description: 'No permissions have been configured for this workspace.' },
        custom: { icon: 'info', title: customMessage?.title || 'No Data Available', description: customMessage?.description || 'No data is available at the moment.' }
    };
    const { icon, title, description } = messages[type] || messages.custom;
    return (
        <div className="col-12">
            <div className="text-center p-5">
                <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#6c757d' }}>{icon}</span>
                <h5 className="mt-3">{title}</h5>
                <p className="text-muted">{description}</p>
            </div>
        </div>
    );
};

const Invite = () => {
    const [isFormVisible, setIsFormVisible] = useState(false);
    const { register, handleSubmit, control, formState: { errors }, setValue, watch, reset } = useForm();

    const [subUserList, setSubUserList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pageCount, setPageCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [perPageLimit, setPerPageLimit] = useState(10);

    const [selectedRow, setSelectedRow] = useState(null);
    const [selectedRowId, setSelectedRowId] = useState(null);
    const userTypeFromCookie = getCookie('user_type');

    const watchword = watch("password");

    const toggleVisibility = () => {
        setIsFormVisible(!isFormVisible);
    };

    const onSubmit = async (data) => {


        // console.log(data);

        setIsLoading(true);
        try {
            const params = data
            const response = await sentSubUserInvitation(params);

            const response_data = response.data;
            // console.log("response_data", response_data)

            if (response_data.error_code === 200) {
                fetchSubUsers();
                reset();
                setIsFormVisible(!isFormVisible);
                setIsLoading(false);
                triggerAlert('success', 'success', response_data?.message || 'Invitation sent successfully!!');
            } else {
                setSubUserList([])
                setIsLoading(false);
                triggerAlert('error', 'Oops...', 'Failed to create sub user');
            }
        } catch (error) {
            const response_data = error?.response?.data;
            if (response_data?.error_code === 400) {
                setIsLoading(false);

                triggerAlert('error', 'Oops...', response_data?.message);
            } else {
                setIsLoading(false);
                triggerAlert('error', 'Oops...', response_data ? response_data.message : "Something went wrong!");
            }

        }
        // Handle form submission
    };

    // Fetch user data
    const fetchSubUsers = async () => {
        setIsLoading(true);
        try {
            const params = {
                page: currentPage + 1,
                per_page: perPageLimit
            }
            const response = await fetchSubUsersInvitationList(params);
            const response_data = response.data;

            if (response_data.error_code === 200) {
                const data = Object.values(response.data.results.data);
                const total_pages = response.data.results.pagination.total_pages;
                const total_items = response.data.results.pagination.total_items;
                setIsLoading(false);
                setSubUserList(data);
                if (total_items == 0) {
                    setPageCount(0);
                } else {
                    setPageCount(total_pages);
                }
                // triggerAlert('success', 'success', 'Recharged Successfully!!');
            } else {
                setSubUserList([])
                setPageCount(0);
                setIsLoading(false);
                // triggerAlert('error', 'Oops...', 'Recharge was unsuccessful');
            }
        } catch (error) {
            const response_data = error?.response?.data
            setIsLoading(false);
            triggerAlert('error', 'Oops...', response_data ? response_data.message : "Something went wrong!");
        }
    }
    // Delete User
    const deleteSubUsers = async () => {
        if (selectedRowId) {
            ConfirmationAlert('You want to continue!', 'Continue', async () => {
                setIsLoading(true);

                try {
                    const response = await deleteSubUser(selectedRowId);

                    const response_data = response.data;

                    if (response_data.error_code === 200) {
                        setIsLoading(false);
                        triggerAlert('success', 'success', 'Sub user deleted successfully');
                        fetchSubUsers();
                    } else {
                        setIsLoading(false);
                        triggerAlert('error', 'Oops...', 'Failed to delete sub user');

                    }
                } catch (error) {
                    const response_data = error?.response?.data
                    setIsLoading(false);
                    triggerAlert('error', 'Oops...', response_data ? response_data.message : "Something went wrong!");
                }
            })
        } else {
            triggerAlert("info", "", "Please select a sub user");
        }
    }
    // Edit sub user

    const cancelForm = () => {
        setIsFormVisible(!isFormVisible);
        reset()
    };
    // Pagination
    const handlePageClick = (selected) => {
        const selectedPage = selected.selected;
        setCurrentPage(selectedPage);

        fetchSubUsers(); // Increment the page number by 1 for server-side pagination
    };

    let props = {
        pageCount: pageCount,
        handlePageClick: handlePageClick,
    };
    // /////////////////////////////////////



    useEffect(() => {
        fetchSubUsers();
    }, []);


    return (
        <>

            {isLoading && (
                <div className='loader-overlay text-white'>
                    <Loader />
                </div>
            )}
            <div>
                <div class="tab-pane fade active show" id="pills-Invite-fill" role="tabpanel" aria-labelledby="pills-Invite-tab-fill">
                    {!isFormVisible && userTypeFromCookie !== "sub_user" && userTypeFromCookie !== "admin" && (
                        <div className="mb-3 me-3 text-end">
                            <div className="btn-group">
                                <button type="button" className="btn btn-warning dropdown-toggle" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    Action
                                </button>
                                <div className="dropdown-menu dropdown-menu-end py-2">
                                    <a type="button" className="dropdown-item" onClick={toggleVisibility}>
                                        <i className="fa fa-user-plus font-size-14"></i> Create Invitation
                                    </a>
                                    <a type="button" className="dropdown-item" onClick={deleteSubUsers}>
                                        <i className="fa fa-trash-o font-size-14" aria-hidden="true"></i> Delete
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                    {isFormVisible ? (
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div class="row">
                                <div className="col-6">
                                    <label className="form-label" htmlFor="email">
                                        Email <span style={{ color: 'red' }}>*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="user_email"
                                        id="user_email"
                                        className="form-control"
                                        placeholder="sample@gmail.com"
                                        {...register('user_email', {
                                            required: 'Email is required',
                                            pattern: {
                                                value: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/,
                                                message: 'Invalid Email Id format',
                                            },
                                        })}
                                    />
                                    {errors.user_email && (
                                        <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                            {errors.user_email.message}
                                        </div>
                                    )}
                                </div>
                                <div className="col-6">
                                    <label className="form-label" htmlFor="role">
                                        Role <span style={{ color: 'red' }}>*</span>
                                    </label>
                                    <Controller
                                        control={control}
                                        name="role"
                                        rules={{
                                            required: "Role is required",
                                        }}
                                        render={({ field }) => (
                                            <select
                                                class="form-select"
                                                name="role"
                                                aria-label="Default select example"
                                                onChange={field.onChange}
                                                value={field.value}
                                            >
                                                <option selected="" hidden>Select</option>
                                                <option value="Admin">Admin</option>
                                                <option value="Suser">Sub User</option>
                                                {/* <option value="Auser">Account User</option> */}
                                            </select>
                                        )}
                                    />
                                    {errors.role && (
                                        <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                            {errors.role.message}
                                        </div>
                                    )}
                                </div>
                                <div class="col-md-12">
                                    <button type="button" className="btn btn-warning next action-button float-end mt-3 ms-2" onClick={cancelForm}>Cancel</button>
                                    <button type="submit" name="next" class="btn btn-primary next action-button float-end mt-3" value="Next">Send Invite</button>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="">
                            <div className="card-body">
                                <div class="table-responsive">
                                    <table class="table table-bordered">
                                        <thead>
                                            <tr style={{ backgroundColor: "#ededed" }}>
                                                <th scope="col">Email</th>
                                                <th scope="col">Role</th>
                                                <th scope="col">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {subUserList.length > 0 ? (
                                                subUserList.map(sub_user => (
                                                    <tr key={sub_user.id} onClick={() => handleTableRowClick(sub_user, selectedRow, setSelectedRow, selectedRowId, setSelectedRowId, sub_user.id)} className={selectedRowId === sub_user.id ? 'row_selected' : ''}>
                                                        <td scope="row">
                                                            <div className="d-flex">
                                                                <div className="user-img img-fluid flex-shrink-0">
                                                                    {/* <img src="assets/images/user/05.jpg" alt="story-img" className="rounded-circle avatar-40" loading="lazy"  /> */}
                                                                </div>
                                                                <div className=" ms-3 text-nowrap">
                                                                    <h6>{sub_user.user_email}</h6>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td >
                                                            {sub_user.role === "Suser" ? (
                                                                <span className="text-dark fw-bold mb-1 fs-6">
                                                                    Sub User
                                                                </span>
                                                            ) : sub_user.role === "Auser" ? (
                                                                <span className="text-dark fw-bold mb-1 fs-6">
                                                                    Account User
                                                                </span>
                                                            ) : (
                                                                <span className="text-dark fw-bold mb-1 fs-6">
                                                                    {sub_user.role}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td >
                                                            <div className="confirm-click-btn">
                                                                {sub_user.invitation_status === 1 ? (
                                                                    <span className="badge bg-success border-radius  rounded-pill ">Invitation Sent</span>
                                                                ) : sub_user.invitation_status === 2 ? (
                                                                    <span className="badge bg-primary border-radius  rounded-pill ">Invitation Accepted</span>
                                                                ) : (
                                                                    <span className="badge bg-warning border-radius  rounded-pill ">-</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="3">
                                                        <NoDataMessage
                                                            type="users"
                                                            customMessage={{
                                                                title: "No Invitation Data",
                                                                description: "No invitations have been sent yet."
                                                            }}
                                                        />
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                    <PaginationComponent {...props} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default Invite;
