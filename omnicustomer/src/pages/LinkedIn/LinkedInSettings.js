import React, { useEffect, useState } from 'react';
import PageTitle from '../../common/PageTitle';
import Loader from "../../common/components/Loader";
import { triggerAlert } from '../../utils/CommonFunctions';
import { useForm } from 'react-hook-form';
import { fetchLinkedInSetting, updateLinkedInSettings } from '../../utils/ApiClient';

const LinkedInSettings = () => {
  const [isLoading, setIsloading] = useState(false);
  const [isLoadingEdit, setIsloadingEdit] = useState(false);
  const { register: registerEdit, handleSubmit: handleSubmitEdit, formState: { errors: errorsEdit }, setValue: setValueEdit, reset: resetEdit, trigger } = useForm();
  const [editMode, setEditMode] = useState(false);

  const handleEditMode = () => {
    setEditMode(true);
  };

  const handleUpdate = async (data) => {
    setIsloadingEdit(true);
    try {
      const response = await updateLinkedInSettings(data);
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
      const response = await fetchLinkedInSetting();
      if (response.data.error_code === 200) {
        const { linkedin_access_token, linkedin_organization } = response.data.results;
        setValueEdit('linkedin_access_token', linkedin_access_token || '');
        setValueEdit('linkedin_organization', linkedin_organization || '');
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
        <div className='container'>
          <div className='row'>
            <div className="col-md-12 mx-auto">
              <PageTitle heading="Settings" />
              {isLoading && (
                <div className='loader-overlay text-white'>
                  <Loader />
                </div>
              )}
              <div className="tab-content" id="myTabContent"></div>
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
                            <label className="form-label" htmlFor="linkedin_access_token">
                              LinkedIn Access Token<span style={{ color: 'red' }}>*</span>
                            </label>
                            <textarea
                              type="text"
                              className="form-control"
                              id="linkedin_access_token"
                              {...registerEdit('linkedin_access_token', {
                                required: 'LinkedIn Access Token required',
                              })}
                              rows={3}
                              disabled={!editMode}
                            />
                            {errorsEdit.linkedin_access_token && (
                              <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                {errorsEdit.linkedin_access_token.message}
                              </div>
                            )}
                          </div>

                          <div className="mb-1">
                            <label className="form-label" htmlFor="linkedin_organization">
                              LinkedIn Organization<span style={{ color: 'red' }}>*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="linkedin_organization"
                              {...registerEdit('linkedin_organization', {
                                required: 'LinkedIn Organization required',
                              })}
                              disabled={!editMode}
                            />
                            {errorsEdit.linkedin_organization && (
                              <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                {errorsEdit.linkedin_organization.message}
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
    // </div>
  );
};

export default LinkedInSettings;