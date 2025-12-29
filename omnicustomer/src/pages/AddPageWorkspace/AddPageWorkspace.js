import React, { useState, useEffect } from 'react'
import {
  workspacebillinglistingAccountBalances,
  fetchFacebookSettingData,
  FetchInstagramSettingData,
  updateFacebookSetting,
  UpdateInstagramSetting,
  YouTubeSettings,
  updatePinterestSetting,
  fetchPinterestSettingData,
  fecthYouTubeSetting,
  FetchSettingData,
  UpdateSetting // <-- updated import added
} from '../../utils/ApiClient';
import Loader from '../../common/components/Loader';
import { useLocation, Link } from 'react-router-dom';
import { getCookie, setCookie } from '../../utils/CommonFunctions';
const AddPageWorkspace = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [channelStatus, setChannelStatus] = useState({
    whatsapp: false,
    instagram: false,
    facebook: false,
    youtube: false,
    linkedin: false,
    pinterest: false,
    twitter: false,
    tiktok: false,
    telegram: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentModal, setCurrentModal] = useState('');
  const [formData, setFormData] = useState({});
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const configType = queryParams.get('config_type'); // read config type

  // New states for channel settings from API
  const [facebookSettings, setFacebookSettings] = useState(null);
  const [instagramSettings, setInstagramSettings] = useState(null);
  const [youtubeSettings, setYoutubeSettings] = useState(null);
  const [pinterestSettings, setPinterestSettings] = useState(null);
  const [isChannelLoading, setIsChannelLoading] = useState(false);
  const [whatsappSettings, setWhatsappSettings] = useState(null);

  // Get workspace ID using the same approach as in LandingWorkSpace.js
  const getWorkspaceId = () => {
    // // 1. First try URL params
    // const urlParams = new URLSearchParams(location.search);
    // const urlWorkspaceId = urlParams.get('workspace_id');

    // 2. Then try cookie
    let cookieWorkspaceId;
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const trimmedCookie = cookie.trim();
      if (trimmedCookie.startsWith('selected_workspace_id=')) {
        cookieWorkspaceId = trimmedCookie.substring('selected_workspace_id='.length);
        break;
      }
    }

    // 3. Use the first available ID, with a default fallback
    return cookieWorkspaceId;
  };

  // Utility function to get cookie
  // const getCookie = (name) => {
  //   const cookieName = `${name}=`;
  //   const cookies = document.cookie.split(';');
  //   for (let i = 0; i < cookies.length; i++) {
  //     let cookie = cookies[i].trim();
  //     if (cookie.indexOf(cookieName) === 0) {
  //       return cookie.substring(cookieName.length, cookie.length);
  //     }
  //   }
  //   return null;
  // };

  // Utility function to set cookie with expiration
  // const setCookie = (name, value, days = 30) => {
  //   const date = new Date();
  //   date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  //   const expires = `expires=${date.toUTCString()}`;
  //   document.cookie = `${name}=${value};${expires};path=/`;
  // };

  // Load channel configurations from cookies for specific workspace
  const loadChannelStatus = (workspaceId) => {
    if (!workspaceId) return;

    const cookieName = `workspace_channel_status_${workspaceId}`;
    const savedChannelsData = getCookie(cookieName);

    if (savedChannelsData) {
      try {
        const workspaceChannels = JSON.parse(savedChannelsData);
        console.log(`Loaded channel status for workspace ${workspaceId}:`, workspaceChannels);
        setChannelStatus(workspaceChannels);
      } catch (e) {
        console.error('Error parsing saved workspace channel status:', e);
        setChannelStatus(getDefaultChannelStatus());
      }
    } else {
      setChannelStatus(getDefaultChannelStatus());
    }
  };

  // Get default channel status (all false)
  const getDefaultChannelStatus = () => ({
    whatsapp: false,
    instagram: false,
    facebook: false,
    youtube: false,
    linkedin: false,
    pinterest: false,
    twitter: false,
    tiktok: false,
    telegram: false
  });

  // Save channel status to cookies for specific workspace
  const saveChannelStatus = (workspaceId, newStatus) => {
    if (!workspaceId) return;

    const cookieName = `workspace_channel_status_${workspaceId}`;

    // Save data using cookie
    console.log(`Saving channel status for workspace ${workspaceId}:`, newStatus);
    setCookie(cookieName, JSON.stringify(newStatus));
  };

  // Fetch workspace data
  useEffect(() => {
    // First fetch channel-specific settings, then load workspace data
    fetchWorkspaceData();
  }, []);

  const fetchWorkspaceData = async () => {
    setIsLoading(true);
    try {
      const workspaceId = getWorkspaceId();
      console.log("Using workspace ID for configuration:", workspaceId);

      const response = await workspacebillinglistingAccountBalances(workspaceId);

      if (response && response.data && response.data.error_code === 200) {
        const workspaceData = response.data.results?.user_details || [];
        // console.log("Workspace data:", workspaceData);
        setWorkspaces(workspaceData);

        // Select first workspace by default
        if (workspaceData.length > 0) {
          const firstWorkspace = workspaceData[0];
          setSelectedWorkspace(firstWorkspace);

          // Load channel status for this specific workspace
          loadChannelStatus(firstWorkspace.id.toString());

          // First fetch channel-specific data, which is more reliable
          await fetchAllChannelSettings();

          // Then only use workspace data as fallback
          updateChannelStatusWithFallback(firstWorkspace);
        }
      }
    } catch (error) {
      console.error('Error fetching workspace data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // New function to fetch all channel settings
  const fetchAllChannelSettings = async () => {
    setIsChannelLoading(true);
    try {
      // Execute these sequentially to ensure proper state updates
      await fetchFacebookSettings();
      await fetchInstagramSettings();
      await fetchYoutubeSettings();
      await fetchPinterestSettings();
      await fetchWhatsappSettings();

      // console.log("All channel settings fetched successfully");
    } catch (error) {
      console.error('Error fetching channel settings:', error);
    } finally {
      setIsChannelLoading(false);
    }
  };

  const workspace_id_from_cookie = getCookie('selected_workspace_id');
  const [workspaceId, setWorkspaceId] = useState(workspace_id_from_cookie || "");
  // New function to fetch Facebook settings with improved error handling
  const fetchFacebookSettings = async () => {
    if (!workspaceId) {
      return;
    }
    try {
      const response = await fetchFacebookSettingData(workspaceId);
      // console.log("Facebook API response:", response);

      if (response && response.data && response.data.error_code === 200) {
        const settings = response.data.results;
        // console.log("Facebook settings:", settings);
        setFacebookSettings(settings);

        // Auto-update channel status if Facebook is connected
        if (settings && settings.facebook_access_token) {
          // console.log("Facebook is connected via API data");
          const newStatus = {
            ...channelStatus,
            facebook: true
          };
          setChannelStatus(newStatus);

          if (selectedWorkspace) {
            saveChannelStatus(selectedWorkspace.id.toString(), newStatus);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching Facebook settings:', error);
    }
  };


  // New function to fetch Instagram settings with improved error handling
  const fetchInstagramSettings = async () => {
    try {
      const workspaceId = selectedWorkspace?.id;
      const response = await FetchInstagramSettingData(workspaceId);
      // console.log("Instagram API response:", response);

      if (response && response.data && response.data.error_code === 200) {
        const settings = response.data.results;
        // console.log("Instagram settings:", settings);
        setInstagramSettings(settings);

        // Auto-update channel status if Instagram is connected
        if (settings && settings.instagram_access_token) {
          // console.log("Instagram is connected via API data");
          const newStatus = {
            ...channelStatus,
            instagram: true
          };
          setChannelStatus(newStatus);

          if (selectedWorkspace) {
            saveChannelStatus(selectedWorkspace.id.toString(), newStatus);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching Instagram settings:', error);
    }
  };

  // New function to fetch YouTube settings
  const fetchYoutubeSettings = async () => {
    try {
      const response = await fecthYouTubeSetting();
      // console.log("YouTube API response:", response);

      if (response && response.data && response.data.error_code === 200) {
        const settings = response.data.results;
        // console.log("YouTube settings:", settings);
        setYoutubeSettings(settings);

        // Auto-update channel status if YouTube is connected
        if (settings && settings.youtube_access_token) {
          const newStatus = { ...channelStatus, youtube: true };
          setChannelStatus(newStatus);
          if (selectedWorkspace) {
            saveChannelStatus(selectedWorkspace.id.toString(), newStatus);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching YouTube settings:', error);
    }
  };

  // New function to fetch Pinterest settings
  const fetchPinterestSettings = async () => {
    try {
      const workspaceId = selectedWorkspace?.id;
      const response = await fetchPinterestSettingData(workspaceId);
      // console.log("Pinterest API response:", response);

      if (response && response.data && response.data.error_code === 200) {
        const settings = response.data.results;
        // console.log("Pinterest settings:", settings);
        setPinterestSettings(settings);

        // Auto-update channel status if Pinterest is connected
        if (settings && settings.pinterest_access_token) {
          const newStatus = { ...channelStatus, pinterest: true };
          setChannelStatus(newStatus);
          if (selectedWorkspace) {
            saveChannelStatus(selectedWorkspace.id.toString(), newStatus);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching Pinterest settings:', error);
    }
  };

  // New function to fetch WhatsApp settings
  const fetchWhatsappSettings = async () => {
    try {
      const response = await FetchSettingData();
      // console.log("WhatsApp API response:", response);

      if (response && response.data && response.data.error_code === 200) {
        const settings = response.data.results;
        // console.log("WhatsApp settings:", settings);
        setWhatsappSettings(settings);

        // Auto-update channel status if WhatsApp is connected
        if (settings && settings.wa_permanent_access_token) {
          // console.log("WhatsApp is connected via API data");
          const newStatus = {
            ...channelStatus,
            whatsapp: true
          };
          setChannelStatus(newStatus);

          if (selectedWorkspace) {
            saveChannelStatus(selectedWorkspace.id.toString(), newStatus);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching WhatsApp settings:', error);
    }
  };

  // New function that only uses workspace data as fallback
  const updateChannelStatusWithFallback = (workspace) => {
    if (!workspace || !workspace.id) return;

    // Get current channel status
    const currentStatus = { ...channelStatus };

    // Only update channels that are not already set to true from channel-specific APIs
    const updatedStatus = {
      ...currentStatus,
      whatsapp: currentStatus.whatsapp || !!workspace.wa_permanent_access_token,
      instagram: currentStatus.instagram || !!workspace.instagram_access_token,
      facebook: currentStatus.facebook || !!workspace.facebook_access_token,
      youtube: currentStatus.youtube || !!workspace.youtube_access_token,
      linkedin: currentStatus.linkedin || (!!workspace.linkedin_access_token && workspace.linkedin_access_token !== "1"),
      pinterest: currentStatus.pinterest || !!workspace.pinterest_access_token,
    };

    // console.log("Channel status after fallback updates:", updatedStatus);

    // Update state and localStorage only if something changed
    if (JSON.stringify(currentStatus) !== JSON.stringify(updatedStatus)) {
      setChannelStatus(updatedStatus);
      saveChannelStatus(workspace.id.toString(), updatedStatus);
    }
  };

  const handleWorkspaceChange = (e) => {
    const workspaceId = parseInt(e.target.value);
    const selected = workspaces.find(ws => ws.id === workspaceId);
    if (selected) {
      setSelectedWorkspace(selected);

      // Load channel status for the selected workspace
      loadChannelStatus(workspaceId.toString());

      // First get channel-specific settings
      fetchAllChannelSettings().then(() => {
        // Then use workspace data only as fallback
        updateChannelStatusWithFallback(selected);
      });
    }
  };

  // Update the getChannelStatusClass function for more professional styling
  const getChannelStatusClass = (channel) => {
    return channelStatus[channel] ? 'channel-active' : 'channel-inactive';
  };

  // Get badge class for channel status
  const getChannelBadgeClass = (channel) => {
    return channelStatus[channel] ? 'bg-success' : 'bg-secondary';
  };

  // Define all channels
  const allChannels = [
    { id: 'facebook', name: 'Facebook', icon: 'facebook.png', inactive: 'facebook1_inactive.png' },
    { id: 'instagram', name: 'Instagram', icon: 'insta.png', inactive: 'insta_iactive.png' },
    { id: 'linkedin', name: 'LinkedIn', icon: 'linkedin.png', inactive: 'linkedin_iactive.png' },
    { id: 'youtube', name: 'YouTube', icon: 'youtube.png', inactive: 'youtube_inactive.png' },
    { id: 'pinterest', name: 'Pinterest', icon: 'pinterest.png', inactive: 'pinterest_inactive.png' },
    { id: 'whatsapp', name: 'WhatsApp', icon: 'whatsapp.png', inactive: 'whatsapp_inactive.png' }
  ];
  // Filter channels based on config_type from URL
  const channels = allChannels;

  // Helper function to get appropriate icon based on channel status
  const getChannelIcon = (channel) => {
    return channelStatus[channel.id] ? channel.icon : channel.inactive;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Open channel modal
  const openModal = (channelId) => {
    setCurrentModal(channelId);

    // Pre-fill form data with API settings if available
    let initialData = {};

    switch (channelId) {
      case 'facebook':
        if (facebookSettings) {
          initialData = {
            username: facebookSettings.facebook_user_name || '',
            businessAccountId: facebookSettings.facebook_page_id || '',
            facebookId: facebookSettings.facebook_id || '',
            accessToken: facebookSettings.facebook_access_token || ''
          };
        }
        break;
      case 'instagram':
        if (instagramSettings) {
          initialData = {
            name: instagramSettings.instagram_name || '',
            businessAccountId: instagramSettings.instagram_bussiness_id || '',
            userId: instagramSettings.instagram_user_id || '',
            accessToken: instagramSettings.instagram_access_token || ''
          };
        }
        break;
      case 'youtube':
        if (youtubeSettings) {
          initialData = {
            name: youtubeSettings.youtube_name || '',
            apiKey: youtubeSettings.youtube_api_key || '',
            accessToken: youtubeSettings.youtube_access_token || '',
            refreshToken: youtubeSettings.youtube_refresh_token || '',
            clientSecret: youtubeSettings.youtube_client_secret || '',
            clientId: youtubeSettings.youtube_client_id || ''
          };
        }
        break;
      case 'pinterest':
        if (pinterestSettings) {
          initialData = {
            username: pinterestSettings.pinterest_user_name || '',
            secretKey: pinterestSettings.pinterest_secret_key || '',
            userId: pinterestSettings.pinterest_user_id || '',
            accessToken: pinterestSettings.pinterest_access_token || ''
          };
        }
        break;
      case 'whatsapp':
        if (whatsappSettings) {
          initialData = {
            accessToken: whatsappSettings.wa_permanent_access_token || '',
            appId: whatsappSettings.wa_app_id || '',
            version: whatsappSettings.wa_version || '',
            phoneNumberId: whatsappSettings.phone_number_id || '',
            wabaId: whatsappSettings.waba_id || '',
            businessNumber: whatsappSettings.bussiness_number || ''
          };
        }
        break;
      default:
        initialData = {};
    }

    setFormData(initialData);
  };

  // Submit channel form with more robust error handling
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedWorkspace || !selectedWorkspace.id) {
      console.error("No workspace selected");
      return;
    }

    setIsLoading(true);

    try {
      // Prepare API input based on channel type and call the appropriate update API
      let api_input = {};
      let response = null;

      switch (currentModal) {
        case 'facebook':
          api_input = {
            facebook_user_name: formData.username || '',
            facebook_page_id: formData.businessAccountId || '',
            facebook_id: formData.facebookId || '',
            facebook_access_token: formData.accessToken || ''
          };
          response = await updateFacebookSetting(api_input);
          break;

        case 'instagram':
          api_input = {
            instagram_name: formData.name || '',
            instagram_bussiness_id: formData.businessAccountId || '',
            instagram_user_id: formData.userId || '',
            instagram_access_token: formData.accessToken || ''
          };
          response = await UpdateInstagramSetting(api_input);
          break;

        case 'youtube':
          api_input = {
            youtube_name: formData.name || '',
            youtube_api_key: formData.apiKey || '',
            youtube_access_token: formData.accessToken || '',
            youtube_refresh_token: formData.refreshToken || '',
            youtube_client_secret: formData.clientSecret || '',
            youtube_client_id: formData.clientId || ''
          };
          response = await YouTubeSettings(api_input);
          break;

        case 'pinterest':
          api_input = {
            pinterest_user_name: formData.username || '',
            pinterest_secret_key: formData.secretKey || '',
            pinterest_user_id: formData.userId || '',
            pinterest_access_token: formData.accessToken || ''
          };
          response = await updatePinterestSetting(api_input);
          break;

        case 'whatsapp':
          api_input = {
            wa_permanent_access_token: formData.accessToken || '',
            wa_app_id: formData.appId || '',
            wa_version: formData.version || '',
            phone_number_id: formData.phoneNumberId || '',
            waba_id: formData.wabaId || '',
            bussiness_number: formData.businessNumber || ''
          };
          response = await UpdateSetting(api_input); // <-- using new API
          break;

        default:
          // For other channels, simulate API call as before
          await new Promise(resolve => setTimeout(resolve, 500));
          break;
      }

      // console.log(`Saving ${currentModal} configuration:`, api_input);
      // console.log(`API Response:`, response);

      // If we have a response and it's successful
      if (response && response.data && response.data.error_code === 200) {
        console.log(`Successfully updated ${currentModal} settings`);
      }

      // Update channel status for current workspace
      const newStatus = {
        ...channelStatus,
        [currentModal]: true
      };

      setChannelStatus(newStatus);

      // Save to workspace-specific storage
      saveChannelStatus(selectedWorkspace.id.toString(), newStatus);

      // Refetch the specific channel's settings to show real-time updates
      switch (currentModal) {
        case 'facebook':
          await fetchFacebookSettings();
          break;
        case 'instagram':
          await fetchInstagramSettings();
          break;
        case 'youtube':
          await fetchYoutubeSettings();
          break;
        case 'pinterest':
          await fetchPinterestSettings();
          break;
        case 'whatsapp':
          await fetchWhatsappSettings();
          break;
        default:
          // For other channels
          break;
      }

      // console.log(`Saved ${currentModal} configuration for workspace ${selectedWorkspace.id}`);
    } catch (error) {
      console.error(`Error saving ${currentModal} settings:`, error);
    } finally {
      setIsLoading(false);
      // Close modal
      document.getElementById('closeModalButton').click();
    }
  };

  // Render channel content conditionally based on connection status
  const renderChannelContent = (channelId) => {
    // Get the appropriate settings object based on channel
    let channelSettings = null;
    let channelUsername = '';
    const currentChannel = channels.find(c => c.id === channelId);

    switch (channelId) {
      case 'facebook':
        channelSettings = facebookSettings;
        channelUsername = channelSettings?.facebook_user_name;
        break;
      case 'instagram':
        channelSettings = instagramSettings;
        channelUsername = channelSettings?.instagram_name;
        break;
      case 'youtube':
        channelSettings = youtubeSettings;
        channelUsername = channelSettings?.youtube_name;
        break;
      case 'pinterest':
        channelSettings = pinterestSettings;
        channelUsername = channelSettings?.pinterest_user_name;
        break;
      case 'whatsapp':
        channelSettings = whatsappSettings;
        channelUsername = channelSettings?.bussiness_number;
        break;
      default:
        channelUsername = selectedWorkspace?.company_name?.toLowerCase().replace(/\s+/g, '');
    }

    if (channelStatus[channelId]) {
      // Show connected pages for connected channels
      return (
        <>
          <div className="row">
            <h5 className="text-center fw-bold mb-4">
              <span className="d-inline-flex align-items-center">
                <span className="me-2" style={{
                  display: 'inline-block',
                  width: '10px',
                  height: '10px',
                  background: '#38b172',
                  borderRadius: '50%',
                }}>
                </span>
                Connected Pages
              </span>
              {isChannelLoading && <small className="ms-2">(Refreshing...)</small>}
            </h5>
            <div className="d-flex justify-content-center">
              <div className="col-sm-4 col-lg-4">
                <div className="card py-1 border-dashed">
                  <div className="card-header border-0 py-2">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="">
                        <i className="fa fa-flag-o fs-4 text-dark" aria-hidden="true" />
                      </div>
                      <div className="">
                        {/* <div className="dropdown">
                          <span
                            className="material-symbols-outlined"
                            id="dropdownMenuButton9"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            role="button"
                          >
                            more_vert
                          </span>
                          <div
                            className="dropdown-menu dropdown-menu-end"
                            aria-labelledby="dropdownMenuButton9"
                          >
                            <a
                              className="dropdown-item d-flex align-items-center"
                              href="#"
                              onClick={() => {
                                const newStatus = { ...channelStatus, [channelId]: false };
                                setChannelStatus(newStatus);
                                saveChannelStatus(selectedWorkspace.id.toString(), newStatus);
                              }}
                            >
                              Remove
                            </a>
                            <a
                              className="dropdown-item d-flex align-items-center"
                              href="#"
                              data-bs-toggle="modal"
                              data-bs-target="#channelConfigModal"
                              onClick={() => openModal(channelId)}
                            >
                              Edit
                            </a>
                          </div>
                        </div> */}
                      </div>
                    </div>
                  </div>
                  <div className="card-body text-center py-1">
                    <div className="text-primary">
                      <img
                        src={`assets/images/icon/${currentChannel?.icon}`}
                        className="img-fluid rounded"
                        alt={channelId}
                        loading="lazy"
                      />
                    </div>
                    <h5 className="mt-2 d-flex justify-content-center align-items-center">
                      {currentChannel?.name}
                    </h5>
                    <small className="mb-0">@{channelUsername || selectedWorkspace?.company_name?.toLowerCase().replace(/\s+/g, '')}</small>
                    <p className="text-success pt-0">Connected</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      );
    } else {
      // Simplified UI - only show Add Pages option
      return (
        <>
          <div className="row justify-content-center">
            <div className="col-sm-4 col-lg-4">
              <a href="#" data-bs-toggle="modal" data-bs-target="#channelConfigModal" onClick={() => openModal(channelId)}>
                <div className="card py-3 border-dashed">
                  <div className="card-body text-center">
                    <div className="md-36 text-primary bg-round2">
                      <img
                        src={`assets/images/icon/${currentChannel?.inactive}`}
                        className="img-fluid rounded"
                        alt={channelId}
                        loading="lazy"
                        style={{ width: '36px', height: '36px' }}
                      />
                    </div>
                    <h5 className="mt-2 d-flex justify-content-center align-items-center">
                      Add {currentChannel?.name || 'Channel'}
                    </h5>
                    <h5 className="d-flex justify-content-center align-items-center">
                      Pages
                    </h5>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </>
      );
    }
  };

  // Render modal fields based on current channel
  const renderModalFields = () => {
    switch (currentModal) {
      case 'pinterest':
        return (
          <>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Username*</label>
              <input type="text" className="form-control" id="username" name="username" value={formData.username || ''} onChange={handleInputChange} required />
            </div>
            <div className="mb-3">
              <label htmlFor="secretKey" className="form-label">Pinterest Secret Key*</label>
              <input type="text" className="form-control" id="secretKey" name="secretKey" value={formData.secretKey || ''} onChange={handleInputChange} required />
            </div>
            <div className="mb-3">
              <label htmlFor="userId" className="form-label">Pinterest User ID*</label>
              <input type="text" className="form-control" id="userId" name="userId" value={formData.userId || ''} onChange={handleInputChange} required />
            </div>
            <div className="mb-3">
              <label htmlFor="accessToken" className="form-label">Access Token*</label>
              <input type="text" className="form-control" id="accessToken" name="accessToken" value={formData.accessToken || ''} onChange={handleInputChange} required />
            </div>
          </>
        );
      case 'youtube':
        return (
          <>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">YouTube Name*</label>
              <input type="text" className="form-control" id="name" name="name" value={formData.name || ''} onChange={handleInputChange} required />
            </div>
            <div className="mb-3">
              <label htmlFor="apiKey" className="form-label">YouTube API Key*</label>
              <input type="text" className="form-control" id="apiKey" name="apiKey" value={formData.apiKey || ''} onChange={handleInputChange} required />
            </div>
            <div className="mb-3">
              <label htmlFor="accessToken" className="form-label">YouTube Access Token*</label>
              <input type="text" className="form-control" id="accessToken" name="accessToken" value={formData.accessToken || ''} onChange={handleInputChange} required />
            </div>
            <div className="mb-3">
              <label htmlFor="refreshToken" className="form-label">YouTube Refresh Token*</label>
              <input type="text" className="form-control" id="refreshToken" name="refreshToken" value={formData.refreshToken || ''} onChange={handleInputChange} required />
            </div>
            <div className="mb-3">
              <label htmlFor="clientSecret" className="form-label">YouTube Client Secret*</label>
              <input type="text" className="form-control" id="clientSecret" name="clientSecret" value={formData.clientSecret || ''} onChange={handleInputChange} required />
            </div>
            <div className="mb-3">
              <label htmlFor="clientId" className="form-label">YouTube Client ID*</label>
              <input type="text" className="form-control" id="clientId" name="clientId" value={formData.clientId || ''} onChange={handleInputChange} required />
            </div>
          </>
        );
      case 'instagram':
        return (
          <>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Name</label>
              <input type="text" className="form-control" id="name" name="name" value={formData.name || ''} onChange={handleInputChange} />
            </div>
            <div className="mb-3">
              <label htmlFor="businessAccountId" className="form-label">Instagram Business Account ID*</label>
              <input type="text" className="form-control" id="businessAccountId" name="businessAccountId" value={formData.businessAccountId || ''} onChange={handleInputChange} required />
            </div>
            <div className="mb-3">
              <label htmlFor="userId" className="form-label">Instagram User ID*</label>
              <input type="text" className="form-control" id="userId" name="userId" value={formData.userId || ''} onChange={handleInputChange} required />
            </div>
            <div className="mb-3">
              <label htmlFor="accessToken" className="form-label">Access Token*</label>
              <input type="text" className="form-control" id="accessToken" name="accessToken" value={formData.accessToken || ''} onChange={handleInputChange} required />
            </div>
          </>
        );
      case 'facebook':
        return (
          <>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Username</label>
              <input type="text" className="form-control" id="username" name="username" value={formData.username || ''} onChange={handleInputChange} />
            </div>
            <div className="mb-3">
              <label htmlFor="businessAccountId" className="form-label">Facebook Business Account ID*</label>
              <input type="text" className="form-control" id="businessAccountId" name="businessAccountId" value={formData.businessAccountId || ''} onChange={handleInputChange} required />
            </div>
            <div className="mb-3">
              <label htmlFor="facebookId" className="form-label">Facebook ID*</label>
              <input type="text" className="form-control" id="facebookId" name="facebookId" value={formData.facebookId || ''} onChange={handleInputChange} required />
            </div>
            <div className="mb-3">
              <label htmlFor="accessToken" className="form-label">Access Token*</label>
              <input type="text" className="form-control" id="accessToken" name="accessToken" value={formData.accessToken || ''} onChange={handleInputChange} required />
            </div>
          </>
        );
      case 'whatsapp':
        return (
          <>
            <div className="mb-3">
              <label htmlFor="accessToken" className="form-label">Access Token*</label>
              <input type="text" className="form-control" id="accessToken" name="accessToken" value={formData.accessToken || ''} onChange={handleInputChange} required />
            </div>
            <div className="mb-3">
              <label htmlFor="appId" className="form-label">WhatsApp App ID*</label>
              <input type="text" className="form-control" id="appId" name="appId" value={formData.appId || ''} onChange={handleInputChange} required />
            </div>
            <div className="mb-3">
              <label htmlFor="version" className="form-label">WhatsApp API Version*</label>
              <input type="text" className="form-control" id="version" name="version" value={formData.version || ''} onChange={handleInputChange} required />
            </div>
            <div className="mb-3">
              <label htmlFor="phoneNumberId" className="form-label">Phone Number ID</label>
              <input type="text" className="form-control" id="phoneNumberId" name="phoneNumberId" value={formData.phoneNumberId || ''} onChange={handleInputChange} />
            </div>
            <div className="mb-3">
              <label htmlFor="wabaId" className="form-label">WABA ID</label>
              <input type="text" className="form-control" id="wabaId" name="wabaId" value={formData.wabaId || ''} onChange={handleInputChange} />
            </div>
            <div className="mb-3">
              <label htmlFor="businessNumber" className="form-label">Business Number</label>
              <input type="text" className="form-control" id="businessNumber" name="businessNumber" value={formData.businessNumber || ''} onChange={handleInputChange} />
            </div>
          </>
        );
      default:
        return (
          <div className="mb-3">
            <p>Please configure this channel by filling in the required details.</p>
          </div>
        );
    }
  };

  return (
    <div>
      <div className="position-relative">
        {(isLoading || isChannelLoading) && <div className='loader-overlay text-white'><Loader /></div>}
      </div>
      <div id="content-page" className="content-page">
        <div className="container">
          <div className="row mt-3 mb-4">
            <div className="d-flex align-items-center justify-content-between flex-wrap mb-4">
              <div className="d-flex align-items-center">
                <h4 className="text-primary fw-500 mb-0">
                  Add Page to {selectedWorkspace?.company_name || "Default"} workspace
                </h4>
              </div>

              <div className="d-flex align-items-center gap-3">
                <Link to="/landing" className="btn btn-primary gap-2" style={{ marginTop: '32px' }}>
                  <i className="fa fa-arrow-left me-1"></i> Back
                </Link>
                {/* {workspaces.length > 0 && (
                  <div className="form-group mb-0">
                    <label className="form-label">Select Workspace</label>
                    <select
                      className="form-select"
                      value={selectedWorkspace?.id || ''}
                      onChange={handleWorkspaceChange}
                    >
                      {workspaces.map(workspace => (
                        <option key={workspace.id} value={workspace.id}>
                          {workspace.company_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )} */}
                <div className="d-flex align-items-end" style={{ height: '100%' }}>

                </div>
              </div>

            </div>
          </div>
          <div className="row">
            <div className=" ">
              <div className="card-header d-flex justify-content-center">
                <div className="header-title">
                  <ul
                    className="nav nav-pills mb-3 p-3 nav-fill"
                    id="pills-tab-1"
                    role="tablist"
                  >
                    {channels.map((channel, index) => (
                      <li key={channel.id} className="nav-item" role="presentation">
                        <a
                          className={`nav-link ${index === 0 ? 'active' : ''} ${getChannelStatusClass(channel.id)}`}
                          id={`pills-${channel.id}-tab-fill`}
                          data-bs-toggle="pill"
                          href={`#pills-${channel.id}-fill`}
                          role="tab"
                          aria-controls={`pills-${channel.id}`}
                          aria-selected={index === 0 ? "true" : "false"}
                          tabIndex={index === 0 ? undefined : -1}
                        >
                          <div className="channel-icon-wrapper">
                            <img
                              src={`assets/images/icon/${getChannelIcon(channel)}`}
                              className="img-fluid rounded channel-icon"
                              alt={channel.name}
                              loading="lazy"
                            />
                            {channelStatus[channel.id] &&
                              <div className="status-indicator"></div>
                            }
                          </div>
                          {channelStatus[channel.id] &&
                            <span className="status-label">Connected</span>
                          }
                        </a>
                      </li>
                    ))}
                    {/* <li className="nav-item" role="presentation">
                      <a
                        className="nav-link"
                        id="pills-adds-tab-fill"
                        data-bs-toggle="pill"
                        href="#pills-adds-fill"
                        role="tab"
                        aria-controls="pills-adds"
                        aria-selected="false"
                        tabIndex={-1}
                      >
                        <div className="channel-icon-wrapper">
                          <img
                            src="assets/images/icon/addon.png"
                            className="img-fluid rounded channel-icon"
                            alt="Addons"
                            loading="lazy"
                          />
                        </div>
                      </a>
                    </li> */}
                  </ul>
                </div>
              </div>

              {/* Professional styling for active/inactive channels - Remove blur effects */}
              <style jsx>{`
                .channel-active {
                  position: relative;
                  transition: all 0.2s ease;
                }
                
                .channel-active:hover {
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12) !important;
                }
                
                .channel-inactive {
                  position: relative;
                  background: #f0f7ff !important; /* Light blue background for inactive */
                  opacity: 0.85;
                  filter: blur(0); /* Remove blur effect */
                  border: 1px solid #cce3ff !important; /* Light blue border */
                  transition: all 0.2s ease;
                }
                
                
                .status-indicator {
                  display: block;
                  position: absolute;
                  top: 5px; /* Moved higher */
                  right: 5px; /* Moved more to the right */
                  width: 10px;
                  height: 10px;
                  background: #38b172;
                  border: 2px solid #fff;
                  border-radius: 50%;
                  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
                  z-index: 2; /* Ensure it appears on top */
                }
                
                .status-label {
                  display: none; /* Keep label hidden */
                }
                
                .badge {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }
                
                .channel-icon-wrapper {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  width: 100%;
                  position: relative;
                }
                
                .channel-icon {
                  width: 32px;
                  height: 32px;
                  object-fit: contain;
                  max-width: 100%;
                  max-height: 100%;
                  transition: transform 0.2s ease;
                  filter: blur(0); /* Remove blur from all icons */
                }
                
                .channel-active .channel-icon {
                  transform: scale(1.05);
                  filter: blur(0); /* Remove blur for active icons */
                }
                
                .channel-active:hover .channel-icon {
                  transform: scale(1.1);
                }
                
                .channel-inactive:hover .channel-icon {
                  filter: blur(0); /* Remove blur on hover */
                }
                
                
                
                .tab-content .text-primary img {
                  width: 48px;
                  height: 48px;
                  object-fit: contain;
                  filter: blur(0); /* Remove blur from content images */
                }
                
                /* Active tab styling */
                .nav-link.active {
                  border-color: #dee2e6 #dee2e6 #fff !important;
                  filter: blur(0) !important; /* Keep without blur */
                }
                
                .nav-link.active .channel-icon {
                  filter: blur(0); /* Keep without blur */
                }
                
                .nav-link.active.channel-active {
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12) !important;
                }
              `}</style>

              <div className="card-body mt-2">
                <div className="tab-content" id="pills-tabContent-1">
                  {channels.map((channel, index) => (
                    <div
                      key={channel.id}
                      className={`tab-pane fade ${index === 0 ? 'active show' : ''}`}
                      id={`pills-${channel.id}-fill`}
                      role="tabpanel"
                      aria-labelledby={`pills-${channel.id}-tab-fill`}
                    >
                      {renderChannelContent(channel.id)}
                    </div>
                  ))}

                  <div
                    className="tab-pane fade"
                    id="pills-adds-fill"
                    role="tabpanel"
                    aria-labelledby="pills-adds-tab-fill"
                  >
                    <div className="row justify-content-center">
                      <div className="col-sm-4 col-lg-4">
                        <a href="#">
                          <div className="card py-3 border-dashed">
                            <div className="card-body text-center">
                              <div className="md-36 text-primary bg-round2">
                                <i className="fa fa-file-text-o fs-4" aria-hidden="true" />
                              </div>
                              <h5 className="mt-2 mb-0 d-flex justify-content-center align-items-center">
                                Create a page for
                              </h5>
                              <h5 className="d-flex justify-content-center align-items-center">
                                universal content
                              </h5>
                            </div>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal Structure */}
      <div className="modal fade" id="channelConfigModal" tabIndex="-1" aria-labelledby="channelConfigModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="channelConfigModalLabel">
                Configure {channels.find(c => c.id === currentModal)?.name || 'Channel'}
              </h5>
              <button type="button" id="closeModalButton" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form id="channelConfigForm" onSubmit={handleSubmit}>
                {renderModalFields()}
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="submit" className="btn btn-primary" form="channelConfigForm">Save</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddPageWorkspace;