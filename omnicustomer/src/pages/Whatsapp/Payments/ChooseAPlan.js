import React, { useState, useEffect } from 'react';
import { fetchChoosePlan, fetchCreatePlan, fetchWorkspace, fetchActivePlan } from '../../../utils/ApiClient';
import { truncateName, formattedDateTime, triggerAlert, getCookie, ConfirmationAlert } from '../../../utils/CommonFunctions';
import './ChooseAPlan.css';
import { useForm } from 'react-hook-form';
import Loader from '../../../common/components/Loader';
import PageTitle from '../../../common/PageTitle';
import { whereToPost, channelImages } from '../../../utils/Constants';

const allChannels = whereToPost.map((channel, index) => ({
    id: index + 1,
    name: channel.label,
    icon: channelImages[index + 1]
}));

const ChannelSelectionModal = ({ plan, onClose, onConfirm, workspaceId }) => {
    const maxAllowedChannels = plan.social_pages;
    const [selectedIds, setSelectedIds] = useState(allChannels.slice(0, maxAllowedChannels).map(c => c.id));
    const [error, setError] = useState('');

    const toggleChannelSelection = (channelId) => {
        setError('');
        if (selectedIds.includes(channelId)) {
            setSelectedIds(prev => prev.filter(id => id !== channelId));
        } else {
            if (selectedIds.length >= maxAllowedChannels) {
                setError(`You can only select up to ${maxAllowedChannels} channels with this plan.`);
                return;
            }
            setSelectedIds(prev => [...prev, channelId]);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Included Channels for {plan.plan_name}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <div className="selected-count mb-3">
                            <span className={selectedIds.length === maxAllowedChannels ? 'text-success' : ''}>
                                Selected: {selectedIds.length}/{maxAllowedChannels} channels
                            </span>
                            {error && <div className="text-danger mt-2">{error}</div>}
                        </div>
                        <p>Click on channels to select or deselect them:</p>
                        <div className="row">
                            {allChannels.map(channel => (
                                <div key={channel.id} className="col-md-3 mb-3">
                                    <div
                                        className={`channel-item ${selectedIds.includes(channel.id) ? 'selected' : ''}`}
                                        onClick={() => toggleChannelSelection(channel.id)}
                                    >
                                        <div className="channel-icon">
                                            <img src={`/assets/images/icon/${channel.icon}`} alt={channel.name} />
                                        </div>
                                        <div className="channel-name">{channel.name}</div>
                                        <div className="channel-status">
                                            {selectedIds.includes(channel.id) ?
                                                <span className="text-success">✓ Selected</span> :
                                                <span className="text-muted">Click to select</span>
                                            }
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary me-2" onClick={onClose}>
                            Close
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => onConfirm(plan.plan_id, workspaceId, selectedIds)}
                            disabled={selectedIds.length === 0}
                        >
                            Confirm Selection
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default function ChooseAPlan() {
    const [activeTab, setActiveTab] = useState('sms');
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState([]);
    const [selectedPlanId, setSelectedPlanId] = useState('');
    const [workspaces, setWorkspaces] = useState([]);
    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState('');
    const [chosenPlans, setChosenPlans] = useState([]);
    const { register, handleSubmit } = useForm();
    const [activePlan, setActivePlan] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentPlan, setCurrentPlan] = useState(null);
    const [selectedChannels, setSelectedChannels] = useState([]);
    const [workspaceId, setWorkspaceId] = useState("");
    const workspace_id_from_cookie = getCookie('selected_workspace_id');

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    useEffect(() => {
        const fetchPlans = async (planType) => {
            setIsLoading(true);
            try {
                const response = await fetchChoosePlan(planType);
                setData(response.results);
            } catch (error) {
                console.error('Error fetching plans:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlans(activeTab);
    }, [activeTab]);

    const handlePlanSelection = (plan) => {
        console.log('Selected Workspace ID:', selectedWorkspaceId); // Log the selected workspace ID
        if (!selectedWorkspaceId) {
            triggerAlert('error', '', 'Please select a workspace first');
            return;
        }
        if (activeTab === 'social_media') {
            setCurrentPlan(plan);
            setShowModal(true);
        } else {
            const defaultSelectedChannels = allChannels.slice(0, plan.social_pages).map(c => c.id);
            handleConfirmPlan(plan.plan_id, selectedWorkspaceId, defaultSelectedChannels);
        }
    };

    const handleConfirmPlan = (planId, workspaceId, channelIds) => {
        setSelectedPlanId(planId);
        setSelectedChannels(channelIds);

        const api_input = {
            plan_id: planId,
            workspace_id: workspaceId,
            channel_ids: channelIds
        };

        submitPlan(api_input);
        setShowModal(false);
    };

    const submitPlan = async (api_input) => {
        ConfirmationAlert(
            ' You want to purchase the plan?',
            'Continue',
            async () => {
                setIsLoading(true); // Only set once

                try {
                    const response = await fetchCreatePlan(api_input);

                    if (response?.error_code === 200) {
                        triggerAlert('success', 'Success', 'Plan applied successfully');
                        await fetchActivePlanData(api_input.workspace_id);
                    } else {
                        triggerAlert('error', '', response?.message || 'An error occurred');
                    }
                } catch (error) {
                    console.error('Error submitting plan:', error);
                    triggerAlert('error', '', error?.response?.data?.message || 'Not enough balance in wallet for this transaction. Please recharge and try again!');
                } finally {
                    setIsLoading(false);
                }
            }
        );
    };


    const onSubmit = async ({ workspace, planId }) => {
        if (!workspace) {
            triggerAlert('error', '', 'Please select a workspace');
            return;
        }

        if (!planId) {
            triggerAlert('error', '', 'Please select a plan');
            return;
        }

        const selectedPlan = data.find(plan => plan.plan_id === planId);
        if (selectedPlan) {
            handlePlanSelection(selectedPlan);
        }
    };

    const fetchWorkspaceData = async () => {
        setIsLoading(true);
        try {
            const response = await fetchWorkspace();

            if (response && response.data && response.data.error_code === 200) {
                const workspaceData = response.data.results || [];

                if (workspaceData.length > 0) {
                    const formattedWorkspaces = workspaceData.map(workspace => ({
                        id: workspace.id.toString(),
                        name: workspace.company_name || `Workspace ${workspace.id}`
                    }));

                    setWorkspaces(formattedWorkspaces);

                    const selectedWorkspace = getSelectedWorkspace();
                    const workspaceExists = formattedWorkspaces.some(ws => ws.id === selectedWorkspace?.id);
                    const workspaceToSelect = workspaceExists ? selectedWorkspace.id : formattedWorkspaces[0]?.id || "139";

                    setWorkspaceId(workspaceToSelect);
                    setSelectedWorkspaceId(workspaceToSelect); // Ensure selectedWorkspaceId is set
                    await fetchActivePlanData(workspaceToSelect); // Fetch active plans for the default workspace
                }
            }
        } catch (error) {
            console.error('Error fetching workspaces:', error);
            triggerAlert("error", "Error", "You don’t have access to any workspaces. Please contact your administrator");
            setWorkspaceId("139");
        } finally {
            setIsLoading(false);
        }
    };

    const getSelectedWorkspace = () => {
        const cookieWorkspaceId = getCookie('selected_workspace_id');
        const localStorageWorkspaceId = localStorage.getItem('workspace_id') || localStorage.getItem('current_workspace_id');
        const workspaceName = getCookie('selected_workspace_name') || localStorage.getItem('selected_workspace_name');

        return {
            id: cookieWorkspaceId || localStorageWorkspaceId || "139",
            name: workspaceName || "Default Workspace"
        };
    };

    useEffect(() => {
        fetchWorkspaceData();
    }, []);

    useEffect(() => {
        if (workspace_id_from_cookie) {
            setWorkspaceId(workspace_id_from_cookie);
        }
    }, [workspace_id_from_cookie])

    useEffect(() => {
        if (!selectedWorkspaceId) return;
        // fetchActivePlanData(selectedWorkspaceId);
    }, [selectedWorkspaceId]);

    const handleWorkspaceChange = async (e) => {
        const selectedId = e.target.value;
        setWorkspaceId(selectedId);
        // setSelectedWorkspaceId(selectedId); // Ensure selectedWorkspaceId is set

        // localStorage.setItem('workspace_id', selectedId);
        // localStorage.setItem('current_workspace_id', selectedId);
        // document.cookie = `selected_workspace_id=${selectedId}; path=/; max-age=86400`;

        // const selectedWorkspace = workspaces.find(ws => ws.id === selectedId);
        // if (selectedWorkspace) {
        //     localStorage.setItem('selected_workspace_name', selectedWorkspace.name);
        //     document.cookie = `selected_workspace_name=${selectedWorkspace.name}; path=/; max-age=86400`;
        // }

        await fetchActivePlanData(selectedId);
    };

    const fetchActivePlanData = async (workspaceId) => {
        if (workspaceId) {
            setIsLoading(true);
            try {
                const response = await fetchActivePlan({ workspace_id: workspaceId });
                if (response?.error_code === 200 || response?.error_code === 204) {
                    console.log('Active Plan Response:', response);
                    if (response.results && Array.isArray(response.results.plan_details)) {
                        setChosenPlans(response.results.plan_details);
                    } else {
                        console.error('Expected an array but got:', response.results);
                        setActivePlan(null);
                    }
                } else {
                    setActivePlan(null);
                }
            } catch (error) {
                console.error('Error fetching active plan:', error);
                setActivePlan(null);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const formatPlanType = (planType) => {
        if (planType.toLowerCase() === 'sms') {
            return 'SMS'; // Return SMS in all caps
        }
        if (planType.toLowerCase() === 'whatsapp') {
            return 'WhatApp'; // Return WhatApp with only the first letter capitalized
        }
        // Capitalize the first letter of each word for other plan types
        return planType
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    return (
        <div className='container'>
            {activeTab === 'social_media' && showModal && currentPlan && (
                <ChannelSelectionModal
                    plan={currentPlan}
                    onClose={() => setShowModal(false)}
                    onConfirm={handleConfirmPlan}
                    workspaceId={selectedWorkspaceId}
                />
            )}
            <div className="card p-3">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className='row px-0'>
                        <div className="mb-3 col-md-4">
                            <label className="form-label" htmlFor="workspaceSelect">Select Workspace</label>
                            <div className="input-group">
                                <select
                                    className="form-select"
                                    id="workspaceSelect"
                                    value={workspaceId}
                                    onChange={handleWorkspaceChange}
                                >
                                    {workspaces.map(ws => (
                                        <option key={ws.id} value={ws.id}>
                                            {ws.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <PageTitle heading="Active Plans" />
                        {isLoading && (
                            <div className='loader-overlay text-white'>
                                <Loader />
                            </div>
                        )}
                        <div className="table-responsive">
                            <table className="table table-bordered table-hover">
                                <thead className="bg-light text-nowrap">
                                    <tr>
                                        <th scope="col">Plan Name</th>
                                        <th scope="col">Plan Type</th>
                                        <th scope="col">Expire Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {chosenPlans.length > 0 ? (
                                        chosenPlans.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.plan_name}</td>
                                                <td>{formatPlanType(item.plan_type)}</td>
                                                <td>{item.expire_date ? formattedDateTime(item.expire_date, "dd-mm-yyyy") : "N/A"}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="text-center">No data available</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                        </div>
                        <PageTitle heading="Choose Plans" />
                        <div className="" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <ul className="nav nav-tabs justify-content-center" id="myTab-1" role="tablist">
                                <li className="nav-item" role="presentation">
                                    <a
                                        className={`nav-link ${activeTab === 'sms' ? 'active' : ''}`}
                                        id="home-tab"
                                        onClick={() => handleTabClick('sms')}
                                        role="tab"
                                        aria-controls="home"
                                        aria-selected={activeTab === 'sms'}
                                    >
                                        SMS
                                    </a>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <a
                                        className={`nav-link ${activeTab === 'whatsapp' ? 'active' : ''}`}
                                        id="profile-tab"
                                        onClick={() => handleTabClick('whatsapp')}
                                        role="tab"
                                        aria-controls="profile"
                                        aria-selected={activeTab === 'whatsapp'}
                                    >
                                        WhatsApp
                                    </a>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <a
                                        className={`nav-link ${activeTab === 'social_media' ? 'active' : ''}`}
                                        id="contact-tab"
                                        onClick={() => handleTabClick('social_media')}
                                        role="tab"
                                        aria-controls="contact"
                                        aria-selected={activeTab === 'social_media'}
                                    >
                                        Social Media
                                    </a>
                                </li>
                            </ul>
                            <div className="tab-content" id="myTabContent-2">
                                <div className="tab-pane fade active show" id="home" role="tabpanel" aria-labelledby="home-tab">
                                    <div className="row justify-content-center py-4">
                                        {Array.isArray(data) && data.map(plan => (
                                            <div key={plan.plan_id} className="col-lg-3 col-md-6 col-sm-12">
                                                <div className="card equal-height-card" style={{ height: '100%' }}>
                                                    {activePlan && activePlan.plan_id === plan.plan_id && (
                                                        <div className="tick-mark-container">
                                                            <span className="tick-mark">✔</span>
                                                        </div>
                                                    )}
                                                    <div className="card-body border text-center rounded d-flex flex-column">
                                                        <span className="text-uppercase">{truncateName(plan.plan_name)}</span>
                                                        <div className="d-flex align-items-center justify-content-center flex-grow-1">
                                                            <h2 className="mb-4 display-8">${plan.plan_price}</h2>
                                                        </div>
                                                        <ul className="list-unstyled line-height-4 mb-0 flex-grow-1">
                                                            {plan.description && (
                                                                <div dangerouslySetInnerHTML={{ __html: plan.description }} />
                                                            )}
                                                            {plan.plan_credits !== null && <li>Credits: {plan.plan_credits}</li>}
                                                            {plan.tax !== null && <li>Tax: {plan.tax}%</li>}
                                                            {plan.sub_users !== null && <li>Sub Users: {plan.sub_users}</li>}
                                                            {plan.social_pages !== null && <li>Social Pages: {plan.social_pages}</li>}
                                                            {plan.post_count !== null && <li>Post Count: {plan.post_count}</li>}
                                                            {plan.approvals !== null && <li>Approvals: {plan.approvals}</li>}
                                                            {plan.allow_view !== null && <li>Allow View: {plan.allow_view}</li>}
                                                            {plan.validity_days !== null && <li>Validity: {plan.validity_days} days</li>}
                                                        </ul>
                                                        <button
                                                            type="button"
                                                            className={`btn plan-button mt-3 ${activePlan && activePlan.plan_id === plan.plan_id ? 'active' : ''}`}
                                                            onClick={() => handlePlanSelection(plan)}
                                                        >
                                                            {activePlan && activePlan.plan_id === plan.plan_id ? 'Active' : 'Choose'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
