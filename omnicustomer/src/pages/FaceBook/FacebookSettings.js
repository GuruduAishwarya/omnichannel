import React, { useEffect, useState } from 'react';
import PageTitle from '../../common/PageTitle';
import Loader from "../../common/components/Loader";
import { triggerAlert, getCookie, isCustomerUser, get_user_menu_permission } from '../../utils/CommonFunctions';
import { useForm } from 'react-hook-form';
import { fetchFacebookSettingData, updateFacebookSetting } from '../../utils/ApiClient';
import { getMenuId } from "../../utils/Constants";

export default function FacebookSettings() {
    const [isLoading, setIsloading] = useState(false);
    const [isLoadingEdit, setIsloadingEdit] = useState(false);

    const { register: registerEdit, handleSubmit: handleSubmitEdit, formState: { errors: errorsEdit }, setValue: setValueEdit, reset: resetEdit, trigger } = useForm();

    const [editMode, setEditMode] = useState(false);
    const [viewPermission, setViewPermission] = useState(true);
    const [editPermission, setEditPermission] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const handleEditMode = () => {
        if (!editPermission) {
            setErrorMessage("You don't have permission to edit settings");
            setTimeout(() => setErrorMessage(null), 5000);
            return;
        }
        setEditMode(true);
    };

    const handleUpdate = async (data) => {
        if (!workspaceId) {
            return;
        }

        if (!editPermission) {
            setErrorMessage("You don't have permission to update settings");
            setTimeout(() => setErrorMessage(null), 5000);
            return;
        }

        setIsloadingEdit(true);
        try {
            const response = await updateFacebookSetting(data, workspaceId);
            if (response.data.error_code === 200) {
                setEditMode(false);
                triggerAlert('success', 'success', 'Updated successfully!!');
                FetchData();
            }
        } catch (error) {
            triggerAlert('error', '', "Something went wrong!");
        } finally {
            setIsloadingEdit(false);
        }
    };

    const handleCancelEdit = () => {
        setEditMode(false);
        resetEdit();
        FetchData();
        trigger();
    };
    const workspace_id_from_cookie = getCookie('selected_workspace_id');
    const [workspaceId, setWorkspaceId] = useState(workspace_id_from_cookie || "");

    const FetchData = async () => {
        setIsloading(true);
        if (!workspaceId) {
            return;
        }
        try {
            const response = await fetchFacebookSettingData(workspaceId);
            if (response.data.error_code === 200) {
                const { facebook_page_id, facebook_user_name, facebook_access_token, facebook_id } = response.data.results;
                setValueEdit('facebook_user_name', facebook_user_name);
                setValueEdit('facebook_access_token', facebook_access_token);
                setValueEdit('facebook_page_id', facebook_page_id);
                setValueEdit('facebook_id', facebook_id);
            }
        } catch (error) {
            triggerAlert('error', '', "Something went wrong!");
        } finally {
            setIsloading(false);
        }
    };

    useEffect(() => {
        console.log("DEBUG - Permission Check Starting for Facebook Settings");
        console.log("DEBUG - Is Customer User:", isCustomerUser());

        const menu_id = getMenuId('facebook', 'settings');
        console.log("DEBUG - Menu ID:", menu_id);

        setViewPermission(true);

        if (isCustomerUser()) {
            console.log("DEBUG - User is a customer, granting full permissions");
            setEditPermission(true);
        } else {
            console.log("DEBUG - User is a sub-user, checking specific permissions");
            const editPerm = get_user_menu_permission(menu_id, 'edit');

            console.log("DEBUG - Edit Permission:", editPerm);

            setEditPermission(editPerm);
        }
        console.log("DEBUG - Permission Check Complete for Facebook Settings");
    }, []);

    useEffect(() => {
        FetchData();
    }, [viewPermission]);

    useEffect(() => {
        if (editMode) {
            trigger();
        }
    }, [trigger, editMode]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <div id="content-page" className="content-page" style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
                <div className='container' >
                    <div className='row' >
                        <div className="col-md-12 mx-auto">
                            <PageTitle heading="Settings" />
                            {isLoading && (
                                <div className='loader-overlay text-white'>
                                    <Loader />
                                </div>
                            )}
                            {errorMessage && (
                                <div className="alert alert-danger mt-3" role="alert" style={{
                                    margin: "8px 5px 15px",
                                    borderRadius: "5px",
                                    backgroundColor: "#f8d7da",
                                    color: "#721c24",
                                    padding: "10px",
                                    fontWeight: "bold",
                                    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
                                    transition: "all 0.3s ease-in-out",
                                }}>
                                    {errorMessage}
                                </div>
                            )}
                            <div className="tab-content" id="myTabContent">
                                <div className="card tab-pane mb-0 fade show active" id="user-content-103" role="tabpanel" style={{ flex: 1 }}>
                                    <div className="chat-head">
                                        <header className="d-flex justify-content-between align-items-center bg-white pt-3 ps-3 pe-3 pb-3 border-bottom">
                                            <div className="d-flex align-items-center">
                                                <h5 className="mb-0 text-primary fw-500">
                                                    {editMode ? "Edit Details" : "View Details"}
                                                </h5>
                                            </div>
                                            {!editMode && editPermission && (
                                                <div className="chat-header-icons d-inline-flex ms-auto">
                                                    <button type="button" onClick={handleEditMode} className="btn btn-primary d-flex align-items-center btn-sm">
                                                        <span className="material-symbols-outlined">edit_note</span>
                                                        <span className="d-none d-lg-block ms-1">Edit</span>
                                                    </button>
                                                </div>
                                            )}
                                        </header>
                                    </div>
                                    <div className="card-body chat-body bg-body chat-contacts" style={{ flex: 1 }}>
                                        <form onSubmit={handleSubmitEdit(handleUpdate)}>
                                            <div className="row mt-1">
                                                <div className="col-md-6 mb-1">
                                                    <div className="mb-1">
                                                        <label className="form-label" htmlFor="facebook_user_name">
                                                            Username<span style={{ color: 'red' }}>*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="facebook_user_name"
                                                            {...registerEdit('facebook_user_name', {
                                                                required: 'Username is required',
                                                            })}
                                                            disabled={!editMode}
                                                        />
                                                        {errorsEdit.facebook_user_name && (
                                                            <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                                {errorsEdit.facebook_user_name.message}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="mb-1">
                                                        <label className="form-label" htmlFor="instagramBusinessAccountId">
                                                            Facebook Business Account ID<span style={{ color: 'red' }}>*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="instagramBusinessAccountId"
                                                            {...registerEdit('facebook_page_id', {
                                                                required: 'Facebook Business Account ID required',
                                                            })}
                                                            disabled={!editMode}
                                                        />
                                                        {errorsEdit.facebook_page_id && (
                                                            <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                                {errorsEdit.facebook_page_id.message}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="mb-1">
                                                        <label className="form-label" htmlFor="facebook_id">
                                                            Facebook ID<span style={{ color: 'red' }}>*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="instagramUserId"
                                                            {...registerEdit('facebook_id', {
                                                                required: 'Facebook ID required',
                                                            })}
                                                            disabled={!editMode}
                                                        />
                                                        {errorsEdit.facebook_id && (
                                                            <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                                {errorsEdit.facebook_id.message}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="mb-1">
                                                        <label className="form-label" htmlFor="accessToken">
                                                            Access Token<span style={{ color: 'red' }}>*</span>
                                                        </label>
                                                        <textarea
                                                            type="text"
                                                            className="form-control"
                                                            id="accessToken"
                                                            {...registerEdit('facebook_access_token', {
                                                                required: 'Access Token required',
                                                            })}
                                                            rows={3}
                                                            disabled={!editMode}
                                                        />
                                                        {errorsEdit.facebook_access_token && (
                                                            <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                                {errorsEdit.facebook_access_token.message}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="d-flex justify-content-end mt-3">
                                                {editMode && (
                                                    <>
                                                        <button type="button" className="btn btn-secondary me-2 px-5" onClick={handleCancelEdit}>Cancel</button>
                                                        <button type="submit" className="btn btn-primary px-5" disabled={isLoadingEdit}>{isLoadingEdit ? 'Saving...' : 'Save'}</button>
                                                    </>
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
        </div>
    )
}
