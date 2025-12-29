import React, { useEffect, useState } from 'react';
import PageTitle from '../../common/PageTitle';
import Loader from "../../common/components/Loader";
import { triggerAlert, isCustomerUser, get_user_menu_permission } from '../../utils/CommonFunctions';
import { useForm } from 'react-hook-form';
import { FetchInstagramSettingData, UpdateInstagramSetting } from '../../utils/ApiClient';
import { getMenuId } from "../../utils/Constants";

export default function Setting() {
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
      const response = await UpdateInstagramSetting(data, workspaceId);
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
  const workspaceId = localStorage.getItem('workspace_id');

  const FetchData = async () => {
    setIsloading(true);
    if (!workspaceId) {
      return;
    }
    
    try {
      const response = await FetchInstagramSettingData(workspaceId);
      if (response.data.error_code === 200) {
        const { instagram_bussiness_id, instagram_name, instagram_access_token, instagram_user_id } = response.data.results;
        setValueEdit('instagram_name', instagram_name);
        setValueEdit('instagram_access_token', instagram_access_token);
        setValueEdit('instagram_bussiness_id', instagram_bussiness_id);
        setValueEdit('instagram_user_id', instagram_user_id);
      }
    } catch (error) {
      triggerAlert('error', '', "Something went wrong!");
    } finally {
      setIsloading(false);
    }
  };

  useEffect(() => {
    console.log("DEBUG - Permission Check Starting for Instagram Settings");
    console.log("DEBUG - Is Customer User:", isCustomerUser());
    
    // Use instagram menu ID instead of settings
    const menu_id = getMenuId('instagram', 'settings');
    console.log("DEBUG - Menu ID:", menu_id);
    
    // Always set viewPermission to true for all users
    setViewPermission(true);
    
    if (isCustomerUser()) {
      console.log("DEBUG - User is a customer, granting full permissions");
      setEditPermission(true);
    } else {
      console.log("DEBUG - User is a sub-user, checking specific permissions");
      // Only check edit permission since view is always true
      const editPerm = get_user_menu_permission(menu_id, 'edit');
      
      console.log("DEBUG - Edit Permission:", editPerm);
      
      setEditPermission(editPerm);
    }
    console.log("DEBUG - Permission Check Complete for Instagram Settings");
  }, []);

  useEffect(() => {
    // Since viewPermission is always true, this will always execute
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
                            <label className="form-label" htmlFor="instagram_name">
                              Name<span style={{ color: 'red' }}>*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="instagram_name"
                              {...registerEdit('instagram_name', {
                                required: 'Name required',
                              })}
                              disabled={!editMode || !editPermission}
                            />
                            {errorsEdit.instagram_name && (
                              <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                {errorsEdit.instagram_name.message}
                              </div>
                            )}
                          </div>

                          <div className="mb-1">
                            <label className="form-label" htmlFor="instagramBusinessAccountId">
                              Instagram Business Account ID<span style={{ color: 'red' }}>*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="instagramBusinessAccountId"
                              {...registerEdit('instagram_bussiness_id', {
                                required: 'Instagram Business Account ID required',
                              })}
                              disabled={!editMode || !editPermission}
                            />
                            {errorsEdit.instagram_bussiness_id && (
                              <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                {errorsEdit.instagram_bussiness_id.message}
                              </div>
                            )}
                          </div>
                          <div className="mb-1">
                            <label className="form-label" htmlFor="instagram_user_id">
                              Instagram User ID<span style={{ color: 'red' }}>*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="instagramUserId"
                              {...registerEdit('instagram_user_id', {
                                required: 'Instagram User ID required',
                              })}
                              disabled={!editMode || !editPermission}
                            />
                            {errorsEdit.instagram_user_id && (
                              <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                {errorsEdit.instagram_user_id.message}
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
                              {...registerEdit('instagram_access_token', {
                                required: 'Access Token required',
                              })}
                              rows={3}
                              disabled={!editMode || !editPermission}
                            />
                            {errorsEdit.instagram_access_token && (
                              <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                {errorsEdit.instagram_access_token.message}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="d-flex justify-content-end mt-3">
                        {editMode && editPermission && (
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
  );
}