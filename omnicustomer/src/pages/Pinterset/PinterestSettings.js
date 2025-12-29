import React, { useEffect, useState } from 'react';
import PageTitle from '../../common/PageTitle';
import Loader from "../../common/components/Loader";
import { triggerAlert } from '../../utils/CommonFunctions';
import { useForm } from 'react-hook-form';
import { fetchPinterestSettingData, updatePinterestSetting } from '../../utils/ApiClient';

export default function PinterestSettings() {
    const [isLoading, setIsloading] = useState(false);
    const [isLoadingEdit, setIsloadingEdit] = useState(false);

    const { register: registerEdit, handleSubmit: handleSubmitEdit, formState: { errors: errorsEdit }, setValue: setValueEdit, reset: resetEdit, trigger } = useForm();

    const [editMode, setEditMode] = useState(false);

    const handleEditMode = () => {
        setEditMode(true);
    };

    const handleUpdate = async (data) => {
        // console.log(data);
        // return
        setIsloadingEdit(true);
        try {
            const response = await updatePinterestSetting(data);
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

    const FetchData = async () => {
        setIsloading(true);
        try {
            const response = await fetchPinterestSettingData();
            if (response.data.error_code === 200) {
                const { pinterest_user_id, pinterest_user_name, pinterest_access_token, pinterest_secret_key } = response.data.results;
                setValueEdit('pinterest_user_name', pinterest_user_name);
                setValueEdit('pinterest_access_token', pinterest_access_token);
                setValueEdit('pinterest_user_id', pinterest_user_id);
                setValueEdit('pinterest_secret_key', pinterest_secret_key);
            }
        } catch (error) {
            triggerAlert('error', '', "Something went wrong!");
        } finally {
            setIsloading(false);
        }
    };

    useEffect(() => {
        FetchData();
    }, []);

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
                            <div className="tab-content" id="myTabContent">
                                <div className="card tab-pane mb-0 fade show active" id="user-content-103" role="tabpanel" style={{ flex: 1 }}>
                                    <div className="chat-head">
                                        <header className="d-flex justify-content-between align-items-center bg-white pt-3 ps-3 pe-3 pb-3 border-bottom">
                                            <div className="d-flex align-items-center">
                                                <h5 className="mb-0 text-primary fw-500">
                                                    {editMode ? "Edit Details" : "View Details"}
                                                </h5>
                                            </div>
                                            {!editMode && (
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
                                                        <label className="form-label" htmlFor="pinterest_user_name">
                                                            Username<span style={{ color: 'red' }}>*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="pinterest_user_name"
                                                            {...registerEdit('pinterest_user_name', {
                                                                required: 'Username is required',
                                                            })}
                                                            disabled={!editMode}
                                                        />
                                                        {errorsEdit.pinterest_user_name && (
                                                            <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                                {errorsEdit.pinterest_user_name.message}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="mb-1">
                                                        <label className="form-label" htmlFor="instagramBusinessAccountId">
                                                            Pinterest Secret Key<span style={{ color: 'red' }}>*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="instagramBusinessAccountId"
                                                            {...registerEdit('pinterest_secret_key', {
                                                                required: 'Pinterest Secret Key required',
                                                            })}
                                                            disabled={!editMode}
                                                        />
                                                        {errorsEdit.pinterest_secret_key && (
                                                            <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                                {errorsEdit.pinterest_secret_key.message}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="mb-1">
                                                        <label className="form-label" htmlFor="pinterest_user_id">
                                                            Pinterest User ID<span style={{ color: 'red' }}>*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="instagramUserId"
                                                            {...registerEdit('pinterest_user_id', {
                                                                required: 'Pinterest User ID required',
                                                            })}
                                                            disabled={!editMode}
                                                        />
                                                        {errorsEdit.pinterest_user_id && (
                                                            <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                                {errorsEdit.pinterest_user_id.message}
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
                                                            {...registerEdit('pinterest_access_token', {
                                                                required: 'Access Token required',
                                                            })}
                                                            rows={3}
                                                            disabled={!editMode}
                                                        />
                                                        {errorsEdit.pinterest_access_token && (
                                                            <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                                {errorsEdit.pinterest_access_token.message}
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
