import React, { useEffect, useState } from 'react'
import PageTitle from '../../../common/PageTitle'
import { useForm, Controller } from 'react-hook-form';
import { Form } from 'react-bootstrap';
import { PaymentDetailsGet, PaymentSaveAuto, saveLowBalanceSave, fetchWorkspace, workspacebillinglistingAccountBalance } from '../../../utils/ApiClient';
import { triggerAlert, simpleAlert, getCustomerId, getCookie } from '../../../utils/CommonFunctions';
import Loader from "../../../common/components/Loader"
export default function PaymentSetting() {

    const [isEnabled, setIsEnabled] = useState(false);
    const [isEnabledLBN, setIsEnabledLBN] = useState(false);
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const customer_id = getCustomerId();
    const [workspaces, setWorkspaces] = useState([]);

    const { register, handleSubmit, formState: { errors }, control, setValue, reset } = useForm();
    const { register: registerLBN, handleSubmit: handleSubmitLBN, formState: { errors: errorsLBN }, setValue: setValueLBN, reset: resetLBN, controlLBN } = useForm();
    const props = {
        title: "Payment Setting | Pay As You Go",
        description: "Premium Multipurpose Admin & Dashboard Template"
    }

    const workspace_id_from_cookie = getCookie('selected_workspace_id');
    const [workspaceId, setWorkspaceId] = useState(workspace_id_from_cookie || "");

    const getPaymentSettingDetails = async () => {
        setIsLoading(true);
        if (!workspaceId) {
            // Set loading to false to prevent infinite loading for new users
            setIsLoading(false);
            return;
        }
        try {
            const response = await PaymentDetailsGet(workspaceId);
            const response_data = response.data;
            if (response_data.error_code === 200) {
                const autoPaymentStatus = response_data.results.data.auto_payment_status;
                const lowBalanceNotificationStatus = response_data.results.data.low_balance_notification_status;
                setIsLoading(false);

                // Restore the state from local storage
                const savedState = localStorage.getItem('autoPaymentEnabled');
                if (savedState !== null) {
                    setIsEnabled(JSON.parse(savedState));
                } else {
                    // If no saved state, use the response data
                    setIsEnabled(autoPaymentStatus === "yes");
                }

                const savedStateLBN = localStorage.getItem('lowBalanceNotificationEnabled');
                if (savedStateLBN !== null) {
                    setIsEnabledLBN(JSON.parse(savedStateLBN));
                } else {
                    // If no saved state, use the response data
                    setIsEnabledLBN(lowBalanceNotificationStatus === "yes");
                }

                setValue('threshold_amount', response_data.results.data.threshold_amount || 10);
                setValue('auto_recharge_amount', response_data.results.data.auto_recharge_amount || 0);
                setValueLBN('low_balance_threshold_amount', response_data.results.data.low_balance_threshold_amount || 10);
            } else if (response.status === 204) {
                simpleAlert('Please try after sometime!');
                setIsLoading(false);
            } else {
                triggerAlert('error', '', 'Something went wrong..');
                setIsLoading(false);
            }
        } catch (error) {
            triggerAlert('error', '', 'Something went wrong..');
            setIsLoading(false);
        }
    };



    const handleSwitchChange = () => {
        const newState = !isEnabled;
        setIsEnabled(newState);
        // Save the state to local storage
        localStorage.setItem('autoPaymentEnabled', newState);
    };

    const handleSwitchChangeLBN = () => {
        const newState = !isEnabledLBN;
        setIsEnabledLBN(newState);
        // Save the state to local storage
        localStorage.setItem('lowBalanceNotificationEnabled', newState);
    };


    const handleAutoPaymentSave = async (data) => {
        let api_input = "";

        if (isEnabled) {
            api_input = {
                customer_id: workspaceId, // Use the workspaceId instead of customer_id
                auto_payment_status: 'yes',
                threshold_amount: Number(data.threshold_amount),
                auto_recharge_amount: Number(data.auto_recharge_amount)
            };
        } else {
            api_input = {
                customer_id: workspaceId, // Use the workspaceId instead of customer_id
                auto_payment_status: 'no',
                threshold_amount: 0,
                auto_recharge_amount: 0
            };
        }

        setIsLoading(true);
        try {
            const response = await PaymentSaveAuto(api_input);
            const response_data = response.data;

            if (response_data.error_code === 200) {
                const successMessage = isEnabled
                    ? 'Successfully enabled auto payment!'
                    : 'Successfully disabled auto payment!';

                triggerAlert('success', 'Success', successMessage);
                setIsLoading(false);
                getPaymentSettingDetails();
                workspacebillinglistingAccountBalance();
            } else if (response.status === 204) {
                simpleAlert('Please try after sometime!');
                setIsLoading(false);
            } else {
                triggerAlert('error', '', 'Something went wrong..');
                setIsLoading(false);
            }
        } catch (error) {
            triggerAlert('error', '', 'Something went wrong..');
            setIsLoading(false);
        }
    };


    const handleLowBalanceSave = async (data) => {
        let api_input = "";

        if (isEnabledLBN) {
            api_input = {
                low_balance_notification_status: 'yes',
                low_balance_threshold_amount: Number(data.low_balance_threshold_amount),
            };
        } else {
            api_input = {
                low_balance_notification_status: 'no',
                low_balance_threshold_amount: 0,
            };
        }

        setIsLoading(true);
        try {
            const response = await saveLowBalanceSave(api_input);
            const response_data = response.data;

            if (response_data.error_code === 200) {
                const successMessage = isEnabledLBN
                    ? 'Successfully enabled low balance notification!'
                    : 'Successfully disabled low balance notification!';

                triggerAlert('success', 'Success', successMessage);
                setIsLoading(false);
                // Do not reset the form here
            } else if (response.status === 204) {
                simpleAlert('Please try after sometime!');
                setIsLoading(false);
            } else {
                triggerAlert('error', '', 'Something went wrong..');
                setIsLoading(false);
            }
        } catch (error) {
            triggerAlert('error', '', 'Something went wrong..');
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Check if user is logged in and has a workspace
        if (customer_id) {
            // Restore the state from local storage
            const savedStateLBN = localStorage.getItem('lowBalanceNotificationEnabled');
            if (savedStateLBN !== null) {
                setIsEnabledLBN(JSON.parse(savedStateLBN));
            }
            getPaymentSettingDetails();
        } else {
            // Handle case when user is not properly logged in
            setIsLoading(false);
        }
    }, [workspaceId]); // Add workspaceId dependency to respond to workspace changes


    useEffect(() => {
        // Check if user is logged in and has a workspace
        if (customer_id) {
            // Restore the state from local storage
            const savedState = localStorage.getItem('autoPaymentEnabled');
            if (savedState !== null) {
                setIsEnabled(JSON.parse(savedState));
            }
            getPaymentSettingDetails();
        } else {
            // Handle case when user is not properly logged in
            setIsLoading(false);
        }
    }, [workspaceId]); // Add workspaceId dependency to respond to workspace changes


    const handleWorkspaceChange = async (e) => {
        const selectedId = e.target.value;
        setWorkspaceId(selectedId);
    };

    const getSelectedWorkspaceFromCookies = () => {
        const id = getCookie('selected_workspace_id');
        const name = getCookie('selected_workspace_name');

        return {
            id: id || null,
            name: name || "Default Workspace"
        };
    };

    const fetchWorkspaceData = async () => {
        setIsLoading(true);
        try {
            const response = await fetchWorkspace();

            if (response?.data?.error_code === 200) {
                const workspaceData = response.data.results || [];

                const formattedWorkspaces = workspaceData.map(workspace => ({
                    id: workspace.id.toString(),
                    name: workspace.company_name || `Workspace ${workspace.id}`
                }));

                setWorkspaces(formattedWorkspaces);

                const selectedWorkspace = getSelectedWorkspaceFromCookies();

                const workspaceExists = formattedWorkspaces.some(
                    ws => ws.id === selectedWorkspace.id
                );

                const workspaceToSelect = workspaceExists
                    ? selectedWorkspace.id
                    : formattedWorkspaces[0]?.id || "";

                setWorkspaceId(workspaceToSelect);
            }
        } catch (error) {
            console.error('Error fetching workspaces:', error);
            triggerAlert("error", "Error", "Failed to fetch workspaces");

            // Only set ID to "" on error, not a hardcoded value
            setWorkspaceId("");
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        fetchWorkspaceData();
    }, []);

    return (
        <>
            <div class="position-relative">
            </div>
            <div id="content-page" class="content-page">
                <div class="container">
                    <PageTitle heading="Payment Settings"{...props} />
                    <div class="row">
                        <div class="col-sm-6">
                            <div class="card">
                                <div class="card-header d-flex justify-content-between">
                                    <div class="header-title">
                                        <h5 class="card-title text-warning">Auto Payment Settings</h5>
                                    </div>
                                    <div className="col-md-6">
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
                                </div>
                                <div class="card-body">

                                    {/* <div class="alert bg-soft-success border-0 d-flex align-items-center" role="alert">
                                        <div class="ms-2">
                                            <h5 class="text-primary mb-2 fw-500">Auto Payment Settings</h5>
                                            <p class="mb-0">Automate your payments for convenience and uninterrupted service.</p>
                                            <p class="mb-0"><b>We Suggest :</b> It is advisable to keep the auto payment settings enabled at all times for hassle-free services.</p>
                                            <p class="mb-0">Minimum Threshold Amount: $10</p>
                                            <p>Recharge Amount:$10</p>
                                        </div>
                                    </div> */}
                                    <div class="alert bg-soft-info border-0 d-flex align-items-center" role="alert">
                                        <div class="ms-2">
                                            <h5 class="text-primary mb-2 fw-500">Auto Payment Settings</h5>
                                            <p class="mb-0">Automate your payments for convenience and uninterrupted service.</p>
                                            <p class="mb-0"><b>We Suggest :</b> It is advisable to keep the auto payment settings enabled at all times for hassle-free services.</p>
                                            <p class="mb-0">Minimum Threshold Amount: $10</p>
                                            <p>Recharge Amount:$10</p>

                                        </div>
                                    </div>
                                    <form
                                        onSubmit={handleSubmit(handleAutoPaymentSave)}
                                    >

                                        <div class="row">
                                            <div className="col-md-12 mb-3 d-flex align-items-center">
                                                <div className="form-check form-switch form-check-inline mb-3">
                                                    <input
                                                        className="form-check-input form-check-2"
                                                        type="checkbox"
                                                        id="customSwitch1"
                                                        checked={isEnabled}
                                                        onChange={handleSwitchChange}
                                                    />
                                                    <label className="form-check-label ms-2 mt-2" htmlFor="customSwitch1">
                                                        Enable / Disable Auto Payment
                                                    </label>
                                                </div>
                                            </div>
                                            {isEnabled && (
                                                <>
                                                    <div className="col-md-6 mb-3">
                                                        <Form.Group className="my-3">
                                                            <Form.Label>Threshold Amount</Form.Label>
                                                            <Controller
                                                                name="threshold_amount"
                                                                control={control}
                                                                defaultValue=""
                                                                render={({ field }) => (
                                                                    <Form.Control
                                                                        {...field}
                                                                        type="text"
                                                                        placeholder="Enter threshold amount"
                                                                        className="form-control"
                                                                        maxLength={6}
                                                                    />
                                                                )}
                                                                rules={{
                                                                    required: 'Threshold amount is required.',
                                                                    pattern: { value: /^\d{1,6}$/, message: 'Invalid Amount. Only numbers up to 6 digits are allowed.' },
                                                                    validate: value => parseFloat(value) >= 10 || 'The minimum amount required is $10.'
                                                                }}
                                                            />
                                                            {errors.threshold_amount && (
                                                                <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                                    {errors.threshold_amount.message}
                                                                </div>
                                                            )}
                                                        </Form.Group>
                                                    </div>

                                                    <div className="col-md-6 mb-3">
                                                        <Form.Group className="my-3">
                                                            <Form.Label>Recharge Amount</Form.Label>
                                                            <Controller
                                                                name="auto_recharge_amount"
                                                                control={control}
                                                                defaultValue=""
                                                                render={({ field }) => (
                                                                    <Form.Control
                                                                        {...field}
                                                                        type="text"
                                                                        placeholder="Enter recharge amount"
                                                                        className="form-control"
                                                                        maxLength={6}
                                                                    />
                                                                )}
                                                                rules={{
                                                                    required: 'Recharge amount is required.',
                                                                    pattern: { value: /^\d+$/, message: 'Invalid Amount. Only numbers are allowed.' },
                                                                    validate: value => parseFloat(value) >= 10 || 'The minimum amount required is $10.'
                                                                }}
                                                            />
                                                            {errors.auto_recharge_amount && (
                                                                <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                                    {errors.auto_recharge_amount.message}
                                                                </div>
                                                            )}
                                                        </Form.Group>
                                                    </div>

                                                </>

                                            )}

                                            <div class="form-group mb-0 text-end">
                                                <button class="btn btn-primary px-5" type="submit">Save</button>
                                            </div>
                                        </div>


                                    </form>



                                </div>
                            </div>
                        </div>
                        {isLoading ? (
                            <div className='loader-overlay'>
                                <Loader />
                            </div>

                        ) : null}
                        <div class="col-sm-6">
                            <div class="card">
                                <div class="card-header d-flex justify-content-between">
                                    <div class="header-title">
                                        <h5 class="card-title text-warning">Low Balance Notification</h5>
                                    </div>
                                    <div className="col-md-6">
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
                                </div>
                                <div class="card-body">

                                    <div class="alert bg-soft-info border-0 d-flex align-items-center" role="alert">
                                        <div class="ms-2">
                                            <h5 class="text-primary mb-2 fw-500">Low Balance Notification</h5>
                                            <p class="mb-0">Sends a daily alert to the <b>Billing Email Group</b> when your account balance drops below the threshold.</p>
                                            <p class="mb-0"><b>It is Strongly recommended </b>that you use this feature and set the threshold to a level that allows for enough time to post and proccess a payment</p>
                                            <p class="mb-0">Minimum Threshold Amount: 10</p>
                                        </div>
                                    </div>

                                    <form
                                        onSubmit={handleSubmitLBN(handleLowBalanceSave)}
                                    >
                                        <div class="row">
                                            <div className="col-md-12 mb-3 d-flex align-items-center">
                                                <div className="form-check form-switch form-check-inline mb-3">
                                                    <input
                                                        className="form-check-input form-check-2"
                                                        type="checkbox"
                                                        id="LowBalanceNotificationSwitch"
                                                        checked={isEnabledLBN}
                                                        onChange={handleSwitchChangeLBN}
                                                    />
                                                    <label className="form-check-label ms-2 mt-2" htmlFor="LowBalanceNotificationSwitch">
                                                        Enable / Disable Low Balance Notification
                                                    </label>
                                                </div>
                                            </div>
                                            {isEnabledLBN && (

                                                <div className="col-md-6 mb-3">
                                                    <Form.Group className="my-3">
                                                        <Form.Label>Threshold Amount</Form.Label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            {...registerLBN('low_balance_threshold_amount', {
                                                                required: 'Threshold Amount is required',
                                                                pattern: {
                                                                    value: /^[0-9]*$/,
                                                                    message: 'Invalid Amount. Only numbers are allowed.',
                                                                },
                                                                validate: value => parseFloat(value) >= 10 || 'The minimum amount required is $10.',
                                                            })}
                                                            name="low_balance_threshold_amount"
                                                            placeholder="Enter threshold amount"
                                                            maxLength={6}
                                                        />
                                                        {errorsLBN.low_balance_threshold_amount && (
                                                            <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                                {errorsLBN.low_balance_threshold_amount.message}
                                                            </div>
                                                        )}
                                                    </Form.Group>

                                                    {/* Submit Button */}

                                                </div>

                                            )}
                                            <div className="form-group mb-0 text-end mt-3">
                                                <button className="btn btn-primary px-5" type="submit">
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>


        </>
    )
}
