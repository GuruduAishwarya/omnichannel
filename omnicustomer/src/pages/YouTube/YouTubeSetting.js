import React, { useEffect, useState } from 'react';
import PageTitle from '../../common/PageTitle';
import Loader from "../../common/components/Loader";
import { triggerAlert } from '../../utils/CommonFunctions';
import { useForm } from 'react-hook-form';
import { fecthYouTubeSetting, YouTubeSettings } from '../../utils/ApiClient';

export default function YouTubeSetting() {
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
      const response = await YouTubeSettings(data);
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
      const response = await fecthYouTubeSetting();
      if (response.data.error_code === 200) {
        const { youtube_access_token, youtube_api_key, youtube_name, youtube_refresh_token, youtube_client_secret, youtube_client_id } = response.data.results;
        setValueEdit('youtube_name', youtube_name || '');
        setValueEdit('youtube_access_token', youtube_access_token || '');
        setValueEdit('youtube_api_key', youtube_api_key || '');
        setValueEdit('youtube_refresh_token', youtube_refresh_token || '');
        setValueEdit('youtube_client_secret', youtube_client_secret || '');
        setValueEdit('youtube_client_id', youtube_client_id || ''); // Add this line
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
                            <label className="form-label" htmlFor="youtube_name">
                              YouTube Name<span style={{ color: 'red' }}>*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="youtube_name"
                              {...registerEdit('youtube_name', {
                                required: 'YouTube Name required',
                              })}
                              disabled={!editMode}
                            />
                            {errorsEdit.youtube_name && (
                              <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                {errorsEdit.youtube_name.message}
                              </div>
                            )}
                          </div>

                          <div className="mb-1">
                            <label className="form-label" htmlFor="youtube_api_key">
                              YouTube API Key<span style={{ color: 'red' }}>*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="youtube_api_key"
                              {...registerEdit('youtube_api_key', {
                                required: 'YouTube API Key required',
                              })}
                              disabled={!editMode}
                            />
                            {errorsEdit.youtube_api_key && (
                              <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                {errorsEdit.youtube_api_key.message}
                              </div>
                            )}
                          </div>

                          <div className="mb-1">
                            <label className="form-label" htmlFor="accessToken">
                              YouTube Access Token<span style={{ color: 'red' }}>*</span>
                            </label>
                            <textarea
                              type="text"
                              className="form-control"
                              id="accessToken"
                              {...registerEdit('youtube_access_token', {
                                required: 'YouTube Access Token required',
                              })}
                              rows={3}
                              disabled={!editMode}
                            />
                            {errorsEdit.youtube_access_token && (
                              <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                {errorsEdit.youtube_access_token.message}
                              </div>
                            )}
                          </div>

                          <div className="mb-1">
                            <label className="form-label" htmlFor="youtube_refresh_token">
                              YouTube Refresh Token<span style={{ color: 'red' }}>*</span>
                            </label>
                            <textarea
                              type="text"
                              className="form-control"
                              id="youtube_refresh_token"
                              {...registerEdit('youtube_refresh_token', {
                                required: 'YouTube Refresh Token required',
                              })}
                              rows={3}
                              disabled={!editMode}
                            />
                            {errorsEdit.youtube_refresh_token && (
                              <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                {errorsEdit.youtube_refresh_token.message}
                              </div>
                            )}
                          </div>

                          <div className="mb-1">
                            <label className="form-label" htmlFor="youtube_client_secret">
                              YouTube Client Secret<span style={{ color: 'red' }}>*</span>
                            </label>
                            <textarea
                              type="text"
                              className="form-control"
                              id="youtube_client_secret"
                              {...registerEdit('youtube_client_secret', {
                                required: 'YouTube Client Secret required',
                              })}
                              rows={3}
                              disabled={!editMode}
                            />
                            {errorsEdit.youtube_client_secret && (
                              <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                {errorsEdit.youtube_client_secret.message}
                              </div>
                            )}
                          </div>

                          <div className="mb-1">
                            <label className="form-label" htmlFor="youtube_client_id">
                              YouTube Client ID<span style={{ color: 'red' }}>*</span>
                            </label>
                            <textarea
                              type="text"
                              className="form-control"
                              id="youtube_client_id"
                              {...registerEdit('youtube_client_id', {
                                required: 'YouTube Client ID required',
                              })}
                              rows={3}
                              disabled={!editMode}
                            />
                            {errorsEdit.youtube_client_id && (
                              <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                {errorsEdit.youtube_client_id.message}
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
  );
}