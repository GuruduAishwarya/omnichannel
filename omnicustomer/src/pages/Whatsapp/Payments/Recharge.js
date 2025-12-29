import React, { useState, useEffect } from 'react';
import PageTitle from '../../../common/PageTitle';
import { Controller, useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getToken, triggerAlert, getCustomerId, transformText, ConfirmationAlert, simpleAlert, getCookie } from '../../../utils/CommonFunctions';
import { MaxLengthValidation, MinLengthValidation, onlyAlphabetsandSpaces, onlyNumbers } from '../../../utils/Constants';
import { Button, Card, Col, Modal, Row, Table } from 'react-bootstrap';
import Loader from '../../../common/components/Loader';
import CommonTooltip from '../../../common/components/CommonTooltip';
import {
    fetchAddfunds, fetchUserInfoPayment, fetchPaymentPrimary, fetchPaymentCardsData, fetchAddCardSubmit,
    fetchAddBankSubmit, fetchCardUpdate, fetchUserDetailsData, fetchBankUpdate, fetchWorkspace,
    workspacebillinglistingAccountBalance
} from '../../../utils/ApiClient';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '@mdi/font/css/materialdesignicons.min.css';
import { Form } from 'react-bootstrap';
import { PaymentDetailsGet, PaymentSaveAuto, saveLowBalanceSave } from '../../../utils/ApiClient';
import PaymenentSetting from "./PaymentSetting";
// import Payment from '../../../pages/Payment/Payment'
export default function BalanceDashbord() {
    const heading = 'Payments / Payment Details';
    const api_url = process.env.REACT_APP_API_BASE_URL;
    const customer_id = getCustomerId();
    const token = getToken();
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingTable, setIsLoadingTable] = useState(false);
    const [data, setData] = useState([]);
    const [sendInvoiceId, setSendInvoiceId] = useState(null);
    const [userData, setUserData] = useState([]);
    const [isEnabled, setIsEnabled] = useState(false);
    const [isEnabledLBN, setIsEnabledLBN] = useState(false);
    const [cardData, setCardData] = useState([]);
    const [showPayment, setShowPayment] = useState(false);
    const [userPaymentDetails, setUserPaymentDetails] = useState(null);
    const [formUpdate, setFormUpdate] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card");
    const [updatePaymentType, setUpdatePaymentType] = useState("");
    const [stateData, setStatesData] = useState([]);
    const [stateDataCust, setStatesDataCust] = useState([]);
    const [selectedCountryCode, setSelectedCountryCode] = useState(null);
    const [countryData, setCountriesData] = useState([]);
    const [selectedCountryCodeCust, setSelectedCountryCodeCust] = useState(null);
    const [workspaceId, setWorkspaceId] = useState(""); // Will be populated from cookies
    const [paymentWorkspaceId, setPaymentWorkspaceId] = useState(""); // Will also be populated from cookies
    const [workspaces, setWorkspaces] = useState([]);
    const [workspaceBalances, setWorkspaceBalances] = useState([]);
    const [selectedWorkspaceBalance, setSelectedWorkspaceBalance] = useState({
        wallet_amount: "0.00",
        credit_balance: "0.00",
        company_name: "Loading..."
    });
    const [paymentAmountError, setPaymentAmountError] = useState("");
    const navigate = useNavigate();


    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        reset,
        watch,
        control,
    } = useForm();

    const {
        register: registerPayment,
        handleSubmit: handleSubmitPayment,
        formState: { errors: errorsPayment },
        setValue: setValuePayment,
        reset: resetPayment,
        watch: watchPayment,
    } = useForm();

    const { register: registerAP, handleSubmit: handleSubmitAP, formState: { errors: errorsAP }, setValue: setValueAP, reset: resetAP, control: controlAP } = useForm();
    const { register: registerLBN, handleSubmit: handleSubmitLBN, formState: { errors: errorsLBN }, setValue: setValueLBN, reset: resetLBN, control: controlLBN } = useForm();

    const props = {
        title: "Payment Details | Pay As You Go",
        description: "Premium Multipurpose Admin & Dashboard Template"
    }
    const currentYear = new Date().getFullYear();
    const futureYears = 15;

    const options = [];
    for (let i = 0; i <= futureYears; i++) {
        const year = currentYear + i;
        options.push(
            <option key={year} value={year}>
                {year}
            </option>
        );
    }

    const formReset = () => {
        reset();
    };


    const handlePaymentClose = () => {
        setShowPayment(false);
        formReset();

    }

    const handleAddShow = (type) => {
        fetchUserInfo();
        setTimeout(() => { setShowPayment(true); }, 1000)
        if (type === 'add') setFormUpdate(false);
    }

    const updateUserPaymentDetails = (item) => {
        if (item.type == "Card") {
            const month = String(item.expiry_month);
            setValue("card_type", item.card_type);
            setValue("card_expiry_month", month);
            setValue("card_expiry_year", item.expiry_year);
            setValue("cvv_code", item.cvv_code);
        } else {
            setValue("account_type", item.account_type);
            setValue("account_number", item.account_number);
            setValue("routing_number", item.routing_number);
            setValue("name_on_account", item.card_holder_name);
            setValue("echeck_type", item.echeck_type);
            setValue("bank_name", item.bank_name);
        }
    }

    const updatePaymentDetails = (item, type) => {
        setFormUpdate(true);
        setSelectedPaymentMethod(type); // type is lowercase
        setUserPaymentDetails(item);
        setUpdatePaymentType(item.type); // type is captilized
        if (item) updateUserPaymentDetails(item);
        handleAddShow('update');
    };



    const fetchCardsData = async () => {
        setIsLoadingTable(true);
        try {
            const response = await fetchPaymentCardsData();


            const response_data = response.data;

            if (response_data.error_code === 200) {
                const itemsArray = response_data.results;

                setCardData(itemsArray);


                setIsLoadingTable(false);
            }
        } catch (error) {
            setIsLoadingTable(false);
            triggerAlert("error", "Oops...", "Something went wrong..");
        }
    };

    const fetchUserInfo = async (api_input) => {
        setIsLoading(true);

        try {
            const response = await fetchUserInfoPayment(api_input);
            const response_data = response.data;

            if (response_data.error_code === 200) {
                const userinformation = response_data.results;
                const user = userinformation[0];

                setValue('first_name', user.first_name);
                setValue('last_name', user.last_name);
                setValue('address', user.cust_address);
                setValue('city', user.city);
                setValue('country', user.country);
                setValue('state', user.state);
                setValue('zip', user.zipcode);
                setValue('company', user.company_name);
                setValue('email', user.email);
                setValue('phone_number', user.phone);

            } else {
                triggerAlert("error", "Oops...", "Something went wrong with the response.");
            }
        } catch (error) {
            console.error('Fetch user info error:', error);
            triggerAlert("error", "Oops...", "Something went wrong while fetching user info.");
        } finally {
            setIsLoading(false);
        }
    };


    const handleAddfunds = async (data) => {
        ConfirmationAlert(
            'You want to make the payments?',
            'Continue',
            async () => {
                setIsLoading(true);
                const postData = {
                    amount_collected: data.amount,
                    workspace_id: paymentWorkspaceId,
                };
                try {
                    const response = await fetchAddfunds(postData);
                    const response_data = response?.data;
                    if (response_data?.error_code === 200) {
                        triggerAlert(
                            "success",
                            "Payment Successful",
                            `$${data.amount} has been added to your wallet for workspace: ${workspaces.find(ws => ws.id === paymentWorkspaceId)?.name}`
                        );

                        // Update the workspaceId to match the paymentWorkspaceId
                        setWorkspaceId(paymentWorkspaceId);

                        // Reset the payment form
                        resetPayment();

                        // Refresh the workspace balances and other relevant data
                        fetchWorkspaceBalances(paymentWorkspaceId);

                        // Optionally, you can reset the page or navigate to refresh the entire view
                        // navigate(0); // This will refresh the page
                    } else {
                        triggerAlert("error", "Oops...", "Something went wrong..");
                    }
                } catch (error) {
                    triggerAlert(
                        "error",
                        "Oops...",
                        error.response?.data?.message || "Payment processing failed"
                    );
                } finally {
                    setIsLoading(false);
                }
            }
        );
    };


    const handlePrimary = (id) => {
        ConfirmationAlert(
            "You want to set this card as the primary payment method? Please note that it will be used for monthly recurring charges.",
            "Continue",
            async () => {
                setIsLoading(true);
                const api_input = {
                    card_id: id,
                };

                try {
                    const response = await fetchPaymentPrimary(api_input);
                    const response_data = response.data;

                    if (response_data.error_code === 200) {
                        triggerAlert("success", "Success", response_data.message || "Success!!");
                        fetchCardsData();
                    } else {
                        triggerAlert("error", "Oops...", "Action was unsuccessful");
                    }
                } catch (error) {
                    const response_data = error.response?.data;
                    triggerAlert(
                        "error",
                        "Oops...",
                        response_data ? response_data.message : "Something went wrong!"
                    );
                } finally {
                    setIsLoading(false);
                }
            }
        );
    };


    const AddCardSubmit = async (data) => {
        setIsLoading(true);

        try {
            let postData = { ...data };
            let response;

            if (formUpdate) {
                if (updatePaymentType === "Card") {
                    response = await fetchCardUpdate(postData);
                    data.card_id = userPaymentDetails.card_id;
                    data.primary_card_status = userPaymentDetails.primary_card_status;
                    postData = data;
                } else if (updatePaymentType === "Bank") {
                    response = await fetchBankUpdate(postData);
                    data.card_id = userPaymentDetails.card_id;
                    data.primary_card_status = userPaymentDetails.primary_card_status;
                    postData = data;
                } else {
                    throw new Error("Invalid payment type for update.");
                }
            } else {
                if (selectedPaymentMethod === "card") {
                    response = await fetchAddCardSubmit(postData);
                } else if (selectedPaymentMethod === "bank") {
                    response = await fetchAddBankSubmit(postData);
                } else {
                    throw new Error("Selected payment method is not card or bank.");
                }
            }

            const response_data = response.data;

            if (response_data.error_code === 200) {
                triggerAlert("success", "Success", response_data.message || "Payment method processed successfully");
                handlePaymentClose();
                formReset();
                fetchCardsData();
            } else {
                triggerAlert("info", "", response_data.message || "Something went wrong..");
            }
        } catch (error) {
            console.error(error);
            setIsLoading(false);
            const response_data = error.response ? error.response.data : { message: "Something went wrong.." };
            handlePaymentClose();
            triggerAlert("info", "", response_data.message || "Something went wrong..");
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        fetchCardsData();
        fetchCountriesData();
        fetchWorkspaceData();
    }, []);

    const fetchUserDetails = async () => {
        try {
            const response = await fetchUserDetailsData();
            const response_data = response.data;

            if (response_data.error_code == 200) {
                const data = response.data.results;
                setUserData(data);
            } else {
                setUserData([])
            }

            fetchWorkspaceBalances();
        } catch (error) {
            console.error("Error fetching user details:", error);
        }
    }

    const fetchWorkspaceBalances = async (wsId = null) => {
        setIsLoading(true);
        try {
            const response = await workspacebillinglistingAccountBalance();

            if (response && response.data && response.data.error_code === 200) {
                const balancesData = response.data.results.user_details || [];
                setWorkspaceBalances(balancesData);

                const idToUse = wsId || workspaceId;

                if (idToUse && balancesData.length > 0) {
                    const defaultBalance = balancesData.find(balance =>
                        balance.id.toString() === idToUse
                    ) || balancesData[0];

                    setSelectedWorkspaceBalance(defaultBalance);
                } else {
                    setSelectedWorkspaceBalance({
                        wallet_amount: "0.00",
                        credit_balance: "0.00",
                        company_name: "No Workspace Selected"
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching workspace balances:', error);
            triggerAlert("error", "Error", "Failed to fetch workspace balances");
        } finally {
            setIsLoading(false);
        }
    };


    const handleWorkspaceChange = (e) => {
        const selectedId = e.target.value;
        setWorkspaceId(selectedId);
        document.cookie = `workspace_id=${selectedId}; path=/; max-age=86400`;
        document.cookie = `current_workspace_id=${selectedId}; path=/; max-age=86400`;
        document.cookie = `selected_workspace_id=${selectedId}; path=/; max-age=86400`;

        // Fetch workspace balances for the selected workspace
        fetchWorkspaceBalances(selectedId);

        const selectedBalance = workspaceBalances.find(balance => balance.id.toString() === selectedId);
        if (selectedBalance) {
            setSelectedWorkspaceBalance(selectedBalance);
            const workspaceName = selectedBalance.company_name ||
                workspaces.find(ws => ws.id === selectedId)?.name ||
                "Default";
            document.cookie = `selected_workspace_name=${workspaceName}; path=/; max-age=86400`;
        } else {
            const selectedWorkspace = workspaces.find(ws => ws.id === selectedId);
            if (selectedWorkspace) {
                setSelectedWorkspaceBalance({
                    ...selectedWorkspaceBalance,
                    company_name: selectedWorkspace.name,
                    id: selectedId
                });
                document.cookie = `selected_workspace_name=${selectedWorkspace.name}; path=/; max-age=86400`;
            }
        }
    };

    const handlePaymentWorkspaceChange = (e) => {
        const selectedId = e.target.value;
        setPaymentWorkspaceId(selectedId);
    };

    const getPaymentSettingDetails = async () => {
        setIsLoading(true);
        if (!workspaceId) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const response = await PaymentDetailsGet(workspaceId)
            const response_data = response.data;
            if (response_data.error_code === 200) {
                const autoPaymentStatus = response_data.results.data.auto_payment_status;
                const lowBalanceNotificationStatus = response_data.results.data.low_balance_notification_status;
                setIsLoading(false);
                if (autoPaymentStatus === "yes") {
                    setIsEnabled(true);
                } else {
                    setIsEnabled(false);
                }

                if (lowBalanceNotificationStatus === "yes") {
                    setIsEnabledLBN(true);
                } else {
                    setIsEnabledLBN(false);
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
    }


    const handleSwitchChange = () => {
        setIsEnabled(!isEnabled);
        reset();
    };

    const handleSwitchChangeLBN = () => {
        setIsEnabledLBN(!isEnabledLBN);
        resetLBN();
    };


    const handleAutoPaymentSave = async (data) => {
        let api_input = "";

        if (isEnabled) {
            api_input = {

                "customer_id": customer_id,
                "auto_payment_status": 'yes',
                "threshold_amount": Number(data.threshold_amount),
                "auto_recharge_amount": Number(data.auto_recharge_amount)
            }
        } else {
            api_input = {

                "customer_id": customer_id,
                "auto_payment_status": 'no',
                "threshold_amount": 0,
                "auto_recharge_amount": 0
            }
        }
        setIsLoading(true);
        try {
            const response = await PaymentSaveAuto(api_input)

            const response_data = response.data;
            if (response_data.error_code === 200) {
                const successMessage = isEnabled
                    ? 'Successfully enabled auto payment!'
                    : 'Successfully disabled auto payment!';

                triggerAlert('success', 'Success', successMessage);
                setIsLoading(false);
                getPaymentSettingDetails();
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


    }
    const handleLowBalanceSave = async (data) => {
        let api_input = ""
        if (isEnabledLBN) {
            api_input = {
                "low_balance_notification_status": 'yes',
                "low_balance_threshold_amount": Number(data.low_balance_threshold_amount),
            }
        } else {
            api_input = {
                "low_balance_notification_status": 'no',
                "low_balance_threshold_amount": 0,
            }
        }

        setIsLoading(true);
        try {
            const response = await saveLowBalanceSave(api_input)
            const response_data = response.data;


            if (response_data.error_code === 200) {
                const successMessage = isEnabledLBN
                    ? 'Successfully enabled low balance notification!'
                    : 'Successfully disabled low balance notification!';

                triggerAlert('success', 'Success', successMessage);
                setIsLoading(false);
                getPaymentSettingDetails();
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

    }
    useEffect(() => {
        getPaymentSettingDetails();
    }, []);

    const handlePaymentDetails = () => {
        navigate('/payments/recharge');
    };

    const handleBalanceHistory = () => {
        navigate('/payments/balancehistory');
    };

    useEffect(() => {
        fetchCardsData();
        fetchCountriesData();
    }, []);

    const fetchStatesData = async (countryCode) => {
        try {
            const response = await axios.get(
                api_url + "customer/states_by_country_code/" + countryCode + "/"
            );
            const respdata = response.data.results.data;
            setStatesData(respdata);
        } catch (error) {
        }
    };

    const fetchCountriesData = async () => {
        try {
            const response = await axios.get(api_url + "customer/countries_list/");
            const respdata = response.data.results.data;
            setCountriesData(respdata);
        } catch (error) {
            console.log(error)
        }
    };

    const fetchStatesDataCust = async (countryCode) => {
        try {
            const response = await axios.get(
                api_url + "customer/states_by_country_code/" + countryCode + "/"
            );
            const respdata = response.data.results.data;
            setStatesDataCust(respdata);
        } catch (error) {
        }
    };

    const filteredStatesCust = stateDataCust.filter(
        (state) => state.country_code_char2 === selectedCountryCodeCust
    );

    const filteredStates = stateData.filter(
        (state) => state.country_code_char2 === selectedCountryCode
    );

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

                    const workspaceExists = formattedWorkspaces.some(ws => ws.id === selectedWorkspace.id);

                    const workspaceToSelect = workspaceExists ?
                        selectedWorkspace.id :
                        formattedWorkspaces[0]?.id || "";

                    setWorkspaceId(workspaceToSelect);
                    setPaymentWorkspaceId(workspaceToSelect);

                    fetchWorkspaceBalances(workspaceToSelect);
                } else {
                    // Set empty IDs instead of static "139"
                    setWorkspaceId("");
                    setPaymentWorkspaceId("");
                    fetchWorkspaceBalances("");
                }
            }
        } catch (error) {
            console.error('Error fetching workspaces:', error);
            triggerAlert("error", "Error", "You don’t have access to any workspaces. Please contact your administrator");

            // Set empty IDs instead of static "139"
            setWorkspaceId("");
            setPaymentWorkspaceId("");
            fetchWorkspaceBalances("");
        } finally {
            setIsLoading(false);
        }
    };

    const getSelectedWorkspace = () => {
        const cookieWorkspaceId = getCookie('selected_workspace_id') ||
            getCookie('workspace_id') ||
            getCookie('current_workspace_id');

        const workspaceName = getCookie('selected_workspace_name') || "Default Workspace";

        return {
            id: cookieWorkspaceId,
            name: workspaceName
        };
    };

    return (
        <>
            <div className="position-relative">
            </div>
            <div id="content-page" className="content-page">
                <div className="container">
                    <PageTitle heading="Recharge" />
                    {isLoading &&
                        <div className='loader-overlay text-white'>
                            <Loader />
                        </div>
                    }
                    <div className="row">
                        <div className="col-12 mb-3">
                            <div className="row">
                            </div>

                            <div className="row mt-2">
                                <div className="col-md-4">
                                    <div className="card h-100">
                                        <div className="card-body">
                                            <div className="col-12 col-lg-12 mb-4">
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
                                                    <span className="input-group-text bg-success text-white">
                                                        <i className="mdi mdi-check-circle-outline"></i>
                                                    </span>
                                                </div>
                                            </div>
                                            <h5 className="card-title mb-3 h4-card">Account Balances</h5>
                                            {workspaceId ? (
                                                <div className="row mb-3">
                                                    <div className="col-6">
                                                        <div className="d-flex flex-column">
                                                            <label className="text-muted mb-1">Credit Balance</label>
                                                            <h4 className={`${parseFloat(selectedWorkspaceBalance.credit_balance || 0) < 0 ? 'text-danger' : 'text-success'} mb-0`}>
                                                                {selectedWorkspaceBalance.credit_balance ? parseFloat(selectedWorkspaceBalance.credit_balance).toFixed(2) : '0.00'}
                                                            </h4>
                                                        </div>
                                                    </div>
                                                    <div className="col-6">
                                                        <div className="d-flex flex-column">
                                                            <label className="text-muted mb-1">Wallet Balance</label>
                                                            <h4 className={`${parseFloat(selectedWorkspaceBalance.wallet_amount || 0) < 0 ? 'text-danger' : 'text-success'} mb-0`}>
                                                                ${selectedWorkspaceBalance.wallet_amount ? parseFloat(selectedWorkspaceBalance.wallet_amount).toFixed(2) : '0.00'}
                                                            </h4>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p>No workspace selected</p>
                                            )}
                                        </div>
                                    </div>
                                </div>


                                <div className="col-md-8">
                                    <div className="card h-100">
                                        <div className="card-body">
                                            <div className="col-12 col-lg-5 mb-2">
                                                <label className="form-label" htmlFor="paymentWorkspaceSelect">
                                                    Select Payment Workspace
                                                </label>
                                                <div className="input-group">
                                                    <select
                                                        className="form-select"
                                                        id="paymentWorkspaceSelect"
                                                        value={paymentWorkspaceId}
                                                        onChange={handlePaymentWorkspaceChange}
                                                    >
                                                        {workspaces.map(ws => (
                                                            <option key={ws.id} value={ws.id}>
                                                                {ws.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <span className="input-group-text bg-primary text-white">
                                                        <i className="mdi mdi-cash-multiple"></i>
                                                    </span>
                                                </div>
                                                <small className="text-primary">
                                                    Payment will be applied to: <strong>{workspaces.find(ws => ws.id === paymentWorkspaceId)?.name}</strong>
                                                </small>
                                            </div>
                                            <h5 className="card-title mb-2 h4-card">Make A Payment</h5>
                                            <form className="row g-3 align-items-start" onSubmit={handleSubmitPayment(handleAddfunds)}>
                                                <div className="col-12 col-lg-auto d-flex align-items-center">
                                                    <label className="form-label mb-0" htmlFor="paymentCvv">I Would like to Pay</label>
                                                </div>
                                                <div className="col-12 col-lg">
                                                    <div className="input-group">
                                                        <span className="input-group-text">$</span>
                                                        <input
                                                            type="text"
                                                            className={`form-control ${paymentAmountError ? 'is-invalid' : ''}`}
                                                            name="amount"
                                                            {...registerPayment("amount", {
                                                                required: "Please enter the amount",
                                                                pattern: {
                                                                    value: /^\d+(\.\d{1,2})?$/,
                                                                    message: "Amount must be a valid number (e.g. 100.00)",
                                                                },
                                                                maxLength: MaxLengthValidation(6)
                                                            })}
                                                            placeholder="Enter amount"
                                                            onKeyPress={(e) => {
                                                                const keyCode = e.which || e.keyCode;
                                                                // Allow only numbers and decimal point
                                                                const isValid = (keyCode >= 48 && keyCode <= 57) || keyCode === 46;

                                                                // Prevent entering multiple decimal points
                                                                if (keyCode === 46 && e.target.value.includes('.')) {
                                                                    e.preventDefault();
                                                                    return;
                                                                }

                                                                // Prevent non-numeric input
                                                                if (!isValid) {
                                                                    e.preventDefault();
                                                                    setPaymentAmountError("Please enter numbers only for payment amount");
                                                                } else {
                                                                    setPaymentAmountError("");
                                                                }
                                                            }}
                                                            onChange={(e) => {
                                                                // Further clean the input to ensure only valid numbers
                                                                const value = e.target.value;
                                                                const numericValue = value.replace(/[^0-9.]/g, '');

                                                                // Handle case where user manually pastes invalid content
                                                                if (value !== numericValue) {
                                                                    e.target.value = numericValue;
                                                                    setPaymentAmountError("Please enter numbers only for payment amount");
                                                                } else {
                                                                    setPaymentAmountError("");
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                    <div style={{ minHeight: '20px' }}>
                                                        {paymentAmountError && (
                                                            <span style={{ color: "orange", fontSize: "14px", marginTop: "5px" }}>
                                                                <i className="mdi mdi-alert-circle-outline me-1"></i>
                                                                {paymentAmountError}
                                                            </span>
                                                        )}
                                                        {errorsPayment.amount && (
                                                            <span style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                                                                {errorsPayment.amount.message}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="col-12 col-lg-auto">
                                                    <button type="submit" className="btn btn-primary">Pay now</button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='col-12'>
                            <div className="card">
                                <div className="card-body">
                                    <div className='d-flex justify-content-between'>
                                        <h5 className="card-title mb-2 h4-card">Saved Cards / Bank Info</h5>
                                        {cardData?.length == 0 && <span className="text-danger fs-5">*Note: Please provide your card or bank information in order to proceed.</span>}
                                        <button
                                            type="button"
                                            className="btn btn-primary waves-effect waves-light"
                                            onClick={() => handleAddShow('add')}
                                        >
                                            Add Payment Details
                                        </button>
                                    </div>

                                    <Table bordered responsive className='mt-5'>
                                        <thead className="table-light">
                                            <tr >
                                                <th>Card / Bank</th>
                                                <th>Card Number / Account Number</th>
                                                <th>Exp Date</th>
                                                <th>Priority</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        {isLoadingTable ? (
                                            <tr>
                                                <td colSpan={6} className="text-center">
                                                    <Loader />
                                                </td>
                                            </tr>

                                        ) : (
                                            <tbody>
                                                {cardData.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="6" className="text-center">No data available</td>
                                                    </tr>
                                                ) : (
                                                    cardData?.map((item, index) => (
                                                        <tr key={item.card_id}>
                                                            <td>{item.type == 'Card' ?
                                                                item.card_type ? item.card_type === "Visa"
                                                                    ? <span>Visa <i class="fab fa-cc-visa font-size-20 ms-2"></i></span>
                                                                    : item.card_type === "DiscoverCard"
                                                                        ? <span>Discover <i class="fab fa-cc-discover font-size-20 ms-2"></i></span>
                                                                        : item.card_type === "MasterCard"
                                                                            ? <span>Master <i class="fab fa-cc-mastercard font-size-20 ms-2"></i></span>
                                                                            : item.card_type === "AmExCard" ? <span>AmEx <i class="fab fa-cc-amex font-size-20 ms-2"></i></span>
                                                                                : item.card_type : '-'
                                                                : item.account_type ? transformText(item.account_type, 'capitalize') : '-'}</td>
                                                            <td>{item.type == 'Card' ? item.card_no ? 'XXXX XXXX XXXX ' + item.card_no : '-' : item.account_number ? item.account_number : '-'}</td>
                                                            <td>{item.type == 'Card' ? item.expiry_month + '/' + item.expiry_year : '-'}</td>
                                                            <td>{item.primary_card_status !== "" ? item?.primary_card_status == 1 ? 'Primary' :
                                                                <>
                                                                    <span>
                                                                        Secondary</span>
                                                                    <CommonTooltip
                                                                        message="Set as primary"
                                                                        placement="top"
                                                                    >

                                                                        <i
                                                                            className="mdi mdi-checkbox-marked-circle-outline font-size-18 ms-2"
                                                                            style={{
                                                                                cursor: "pointer",
                                                                            }}
                                                                            onClick={() => handlePrimary(item.card_id)}
                                                                        ></i>

                                                                    </CommonTooltip></> : '-'}</td>
                                                            <td>
                                                                <span type="button" onClick={() =>
                                                                    updatePaymentDetails(
                                                                        item,
                                                                        transformText(item.type, 'lowercase')
                                                                    )
                                                                }><i className='far fa-edit font-size-16 ms-3'></i></span>
                                                            </td>

                                                        </tr>
                                                    ))
                                                )}

                                            </tbody>
                                        )}
                                    </Table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row">

                        <PaymenentSetting />


                        <Modal show={showPayment} onHide={handlePaymentClose} backdrop="static" size="lg">
                            <Modal.Header closeButton>
                                <Modal.Title>{formUpdate ? 'Update Payment Details' : 'Add Payment Details'}</Modal.Title>
                            </Modal.Header>
                            <form id="creditCardForm"
                                className=" g-3 fv-plugins-bootstrap5 fv-plugins-framework fv-plugins-icon-container"
                                onsubmit="return false" novalidate="novalidate" onSubmit={handleSubmit(AddCardSubmit)}>
                                <Modal.Body>
                                    <div className="row">
                                        <div className="col-6 col-md-4  ">
                                            <label
                                                className="form-label"
                                                for="paymentName"
                                            >
                                                First Name
                                            </label>
                                            <input
                                                type="text"
                                                id="first_name"
                                                className="form-control"
                                                {...register("first_name", {
                                                    required: "First Name is required",
                                                    pattern: onlyAlphabetsandSpaces,
                                                })}
                                                placeholder="Enter First name"
                                            />
                                            {errors.first_name && (
                                                <div
                                                    style={{
                                                        color: "red",
                                                        fontSize: "14px",
                                                        marginTop: "5px",
                                                    }}
                                                >
                                                    {errors.first_name.message}
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-6 col-md-4  ">
                                            <label
                                                className="form-label"
                                                for="paymentName"
                                            >
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                id="last_name"
                                                className="form-control"
                                                {...register("last_name", {
                                                    required: "Last Name is required",
                                                    pattern: onlyAlphabetsandSpaces,
                                                })}
                                                placeholder="Enter Last name"

                                            />
                                            {errors.last_name && (
                                                <div
                                                    style={{
                                                        color: "red",
                                                        fontSize: "14px",
                                                        marginTop: "5px",
                                                    }}
                                                >
                                                    {errors.last_name.message}
                                                </div>
                                            )}
                                        </div>
                                        <div className="col-6 col-md-4  ">
                                            <label
                                                className="form-label"
                                                for="paymentName"
                                            >
                                                Company Name
                                            </label>
                                            <input
                                                type="text"
                                                name="company"
                                                className="form-control"
                                                {...register("company")}
                                                placeholder="company name"

                                                style={{
                                                    backgroundColor: "#f0f0f0",
                                                    cursor: "not-allowed",
                                                }}
                                                readOnly
                                            />
                                            {errors.company && (
                                                <div
                                                    style={{
                                                        color: "red",
                                                        fontSize: "14px",
                                                        marginTop: "5px",
                                                    }}
                                                >
                                                    {errors.company.message}
                                                </div>
                                            )}
                                        </div>
                                        <div className="col-6 col-md-4 mt-2  ">
                                            <label
                                                className="form-label"
                                                for="paymentName"
                                            >
                                                Email Address
                                            </label>
                                            <input
                                                type="text"
                                                id="email"
                                                name="email"
                                                className="form-control"
                                                {...register("email")}
                                                placeholder="abcd@gmail.com"
                                                readOnly
                                                style={{
                                                    backgroundColor: "#f0f0f0",
                                                    cursor: "not-allowed",
                                                }}
                                            />

                                            {errors.email && (
                                                <div
                                                    style={{
                                                        color: "red",
                                                        fontSize: "14px",
                                                        marginTop: "5px",
                                                    }}
                                                >
                                                    {errors.email.message}
                                                </div>
                                            )}
                                        </div>
                                        <div className="col-6 col-md-4 mt-2  ">
                                            <label
                                                className="form-label"
                                                for="paymentName"
                                            >
                                                Address
                                            </label>
                                            <input
                                                type="text"
                                                id="address"
                                                className="form-control"
                                                {...register("address", {
                                                    required: "Address is required",
                                                })}
                                                placeholder="Enter Address"

                                            />
                                            {errors.address && (
                                                <div
                                                    style={{
                                                        color: "red",
                                                        fontSize: "14px",
                                                        marginTop: "5px",
                                                    }}
                                                >
                                                    {errors.address.message}
                                                </div>
                                            )}
                                        </div>
                                        <div className="col-6 col-md-4 mt-2  ">
                                            <label
                                                className="form-label"
                                                for="paymentName"
                                            >
                                                City
                                            </label>
                                            <input
                                                type="text"
                                                id="city"
                                                className="form-control"
                                                {...register("city", {
                                                    required: "City is required",
                                                    pattern: onlyAlphabetsandSpaces,
                                                })}
                                                placeholder="Enter City"

                                            />
                                            {errors.city && (
                                                <div
                                                    style={{
                                                        color: "red",
                                                        fontSize: "14px",
                                                        marginTop: "5px",
                                                    }}
                                                >
                                                    {errors.city.message}
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-6 col-md-4 mt-2  ">
                                            <label
                                                className="form-label"
                                                htmlFor="paymentName"
                                            >
                                                Country
                                            </label>
                                            <select id="inputState" className="form-select"
                                                name="cust_country"
                                                {...register("cust_country", {
                                                    required: "Country is required",
                                                })}
                                                onChange={(e) => {
                                                    setSelectedCountryCodeCust(e.target.value);
                                                    fetchStatesDataCust(e.target.value);
                                                    setValue('cust_state', '')
                                                }}
                                                autoComplete="off"
                                            >
                                                <option value="">Select</option>
                                                {countryData.map((item, index) => (
                                                    <option value={item.country_code_char2}>
                                                        {item.country_name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.cust_country && (
                                                <div
                                                    style={{
                                                        color: "red",
                                                        fontSize: "14px",
                                                        marginTop: "5px",
                                                    }}
                                                >
                                                    {errors.cust_country.message}
                                                </div>
                                            )}
                                        </div>
                                        <div className="col-6 col-md-4 mt-2  ">
                                            <label
                                                className="form-label"
                                                htmlFor="paymentName"
                                            >
                                                State
                                            </label>
                                            <select id="inputState" className="form-select"
                                                name="cust_state"
                                                {...register("cust_state", {
                                                    required: "State is required",
                                                })}
                                            >
                                                <option value="">Select</option>
                                                {filteredStatesCust.map((item, index) => (
                                                    <option value={item.state_subdivision_name}>
                                                        {item.state_subdivision_name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.cust_state && (
                                                <div
                                                    style={{
                                                        color: "red",
                                                        fontSize: "14px",
                                                        marginTop: "5px",
                                                    }}
                                                >
                                                    {errors.cust_state.message}
                                                </div>
                                            )}
                                        </div>
                                        <div className="col-6 col-md-4 mt-2  ">
                                            <label
                                                className="form-label"
                                                for="paymentName"
                                            >
                                                Zip Code
                                            </label>
                                            <input
                                                type="text"
                                                id="zip"
                                                className="form-control"
                                                {...register("zip", {
                                                    required: "Zip is required",
                                                    pattern: onlyNumbers,
                                                })}
                                                placeholder="Enter Zip code"

                                            />
                                            {errors.zip && (
                                                <div
                                                    style={{
                                                        color: "red",
                                                        fontSize: "14px",
                                                        marginTop: "5px",
                                                    }}
                                                >
                                                    {errors.zip.message}
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-6 col-md-4 mt-2  ">
                                            <label
                                                className="form-label"
                                                for="paymentName"
                                            >
                                                Phone
                                            </label>
                                            <input
                                                type="text"
                                                name="phone_number"
                                                id="phone_number"

                                                className="form-control"
                                                placeholder="Enter Phone number"
                                                {...register("phone_number", {
                                                    required: "Phone is required",
                                                    pattern: onlyNumbers,
                                                    maxLength: MaxLengthValidation(15),
                                                    minLength: MinLengthValidation(10),
                                                })}
                                            />
                                            {errors.phone_number && (
                                                <div
                                                    style={{
                                                        color: "red",
                                                        fontSize: "14px",
                                                        marginTop: "5px",
                                                    }}
                                                >
                                                    {errors.phone_number.message}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="row mt-3">
                                        <div className="col-12 d-flex align-items-center">
                                            <h6>Payment Information</h6>
                                            {formUpdate ? (
                                                <>
                                                    <hr />
                                                    <p className="badge bg-primary ms-3 font-size-18">
                                                        {updatePaymentType} Details
                                                    </p>
                                                </>
                                            ) : (
                                                <div className="ms-5">
                                                    <div className="form-check form-check-inline">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="paymentMethod"
                                                            id="paymentCard"
                                                            value="card"
                                                            checked={
                                                                selectedPaymentMethod === "card"
                                                            }
                                                            onChange={() => {
                                                                setValue("account_type", "");
                                                                setValue("account_number", "");
                                                                setValue("routing_number", "");
                                                                setValue("name_on_account", "");
                                                                setValue("echeck_type", "");
                                                                setValue("bank_name", "");
                                                                setSelectedPaymentMethod("card");
                                                            }}
                                                        />
                                                        <label
                                                            className="form-check-label"
                                                            htmlFor="paymentCard"
                                                        >
                                                            Card
                                                        </label>
                                                    </div>
                                                    <div className="form-check form-check-inline">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="paymentMethod"
                                                            id="paymentBank"
                                                            value="bank"
                                                            checked={
                                                                selectedPaymentMethod === "bank"
                                                            }
                                                            onChange={() => {
                                                                setValue("card_number", "");
                                                                setValue("card_type", "");
                                                                setValue("card_expiry_month", "");
                                                                setValue("card_expiry_year", "");
                                                                setValue("card_cvv", "");
                                                                setSelectedPaymentMethod("bank");
                                                            }}
                                                        />
                                                        <label
                                                            className="form-check-label"
                                                            htmlFor="paymentBank"
                                                        >
                                                            Bank
                                                        </label>
                                                    </div>
                                                </div>

                                            )}
                                        </div>
                                    </div>

                                    {selectedPaymentMethod === "card" && (
                                        <>
                                            <div className="row mt-3">
                                                <div className="col-6 col-md-6">
                                                    <label
                                                        className="form-label w-100"
                                                        for="paymentCard"
                                                    >
                                                        Card Number
                                                    </label>
                                                    <div className="input-group input-group-merge has-validation">
                                                        <input
                                                            id="paymentCard"
                                                            name="card_number"
                                                            maxlength="16"
                                                            {...register("card_number", {
                                                                required:
                                                                    "Card Number is required",
                                                                pattern: onlyNumbers,
                                                            })}
                                                            className="form-control credit-card-mask"
                                                            type="text"
                                                            placeholder="XXXXXXXXXXXXXXXX"
                                                            aria-describedby="paymentCard2"
                                                        />
                                                    </div>
                                                    {errors.card_number && (
                                                        <div
                                                            style={{
                                                                color: "red",
                                                                fontSize: "14px",
                                                                marginTop: "5px",
                                                            }}
                                                        >
                                                            {errors.card_number.message}
                                                        </div>
                                                    )}
                                                    <div className="fv-plugins-message-container invalid-feedback"></div>
                                                </div>

                                                <div className="col-6 col-md-6  ">
                                                    <label
                                                        className="form-label"
                                                        for="paymentName"
                                                    >
                                                        Card Type
                                                    </label>
                                                    <div className="input-group input-group-merge">
                                                        <select
                                                            className="form-select"
                                                            name="card_type"
                                                            aria-label="Default select example"
                                                            {...register("card_type", {
                                                                required:
                                                                    "Card Type is required",
                                                            })}
                                                        >
                                                            <option value="">
                                                                Select Card Type
                                                            </option>
                                                            <option value="MasterCard">
                                                                MasterCard
                                                            </option>
                                                            <option value="Visa">
                                                                Visa
                                                            </option>
                                                            <option value="AmExCard">
                                                                American Express
                                                            </option>
                                                            <option value="DiscoverCard">
                                                                Discover
                                                            </option>
                                                        </select>
                                                    </div>
                                                    {errors.card_type && (
                                                        <div
                                                            style={{
                                                                color: "red",
                                                                fontSize: "14px",
                                                                marginTop: "5px",
                                                            }}
                                                        >
                                                            {errors.card_type.message}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="col-6 col-md-4 mt-2">
                                                    <label
                                                        className="form-label"
                                                        for="paymentExpiryDate"
                                                    >
                                                        Expiry Month
                                                    </label>

                                                    <select
                                                        className="form-select"
                                                        name="card_expiry_month"
                                                        aria-label="Default select example"
                                                        {...register(
                                                            "card_expiry_month",
                                                            {
                                                                required: "Month is required",
                                                            }
                                                        )}
                                                    >
                                                        <option value="">
                                                            Select Month
                                                        </option>
                                                        <option value="01">1</option>
                                                        <option value="02">2</option>
                                                        <option value="03">3</option>
                                                        <option value="04">4</option>
                                                        <option value="05">5</option>
                                                        <option value="06">6</option>
                                                        <option value="07">7</option>
                                                        <option value="08">8</option>
                                                        <option value="09">9</option>
                                                        <option value="10">10</option>
                                                        <option value="11">11</option>
                                                        <option value="12">12</option>
                                                    </select>
                                                    {errors.card_expiry_month && (
                                                        <div
                                                            style={{
                                                                color: "red",
                                                                fontSize: "14px",
                                                                marginTop: "5px",
                                                            }}
                                                        >
                                                            {
                                                                errors.card_expiry_month
                                                                    .message
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="col-6 col-md-4 mt-2">
                                                    <label
                                                        className="form-label"
                                                        for="paymentExpiryDate"
                                                    >
                                                        Expiry Year
                                                    </label>

                                                    <select
                                                        className="form-select"
                                                        name="card_expiry_year"
                                                        aria-label="Default select example"
                                                        {...register("card_expiry_year", {
                                                            required: "Year is required",
                                                        })}
                                                    >
                                                        <option value="">
                                                            Select Year
                                                        </option>
                                                        {options}
                                                    </select>
                                                    {errors.card_expiry_year && (
                                                        <div
                                                            style={{
                                                                color: "red",
                                                                fontSize: "14px",
                                                                marginTop: "5px",
                                                            }}
                                                        >
                                                            {
                                                                errors.card_expiry_year
                                                                    .message
                                                            }
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="col-6 col-md-4 mt-2">
                                                    <label
                                                        className="form-label"
                                                        for="paymentCvv"
                                                    >
                                                        CVV
                                                    </label>
                                                    <input
                                                        type="password"
                                                        id="paymentCvv"
                                                        className="form-control cvv-code-mask"
                                                        maxlength="4"
                                                        name="card_cvv"
                                                        {...register("card_cvv", {
                                                            required:
                                                                "CVV Code is required",

                                                            pattern: {
                                                                value: /^[0-9]{3,4}$/,
                                                                message: "Invalid CVV format",
                                                            },
                                                        })}
                                                        placeholder="Enter Cvv Code"
                                                    />

                                                    {errors.card_cvv && (
                                                        <div
                                                            style={{
                                                                color: "red",
                                                                fontSize: "14px",
                                                                marginTop: "5px",
                                                            }}
                                                        >
                                                            {" "}
                                                            {errors.card_cvv.message}
                                                        </div>
                                                    )}
                                                </div>
                                                {watch("card_type") ===
                                                    "AmExCard" && (
                                                        <div className="mt-4">
                                                            <p className="text-danger">
                                                                Note : From January 1st, 2016,
                                                                payments through Amex credit
                                                                cards would attract 4%
                                                                processing fee and you will be
                                                                charged accordingly. If you
                                                                would like to avoid the charges,
                                                                we request you to move to other
                                                                Debit/Credit cards or e-check
                                                                payments.
                                                            </p>
                                                        </div>
                                                    )}
                                            </div>
                                        </>
                                    )}

                                    {selectedPaymentMethod === "bank" && (
                                        <>
                                            <div className="row mt-3">
                                                <div className="col-6 col-md-4  ">
                                                    <label
                                                        className="form-label"
                                                        for="account_type"
                                                    >
                                                        Account Type
                                                    </label>
                                                    <div className="input-group input-group-merge">
                                                        <select
                                                            className="form-select"
                                                            name="account_type"
                                                            {...register("account_type", {
                                                                required:
                                                                    "Account Type is required",
                                                            })}
                                                        >
                                                            <option value="">
                                                                Select Account Type
                                                            </option>
                                                            <option value="checking">
                                                                Checking
                                                            </option>
                                                            <option value="business">
                                                                Business Checking
                                                            </option>
                                                            <option value="savings">
                                                                Savings
                                                            </option>
                                                        </select>
                                                    </div>
                                                    {errors.account_type && (
                                                        <div
                                                            style={{
                                                                color: "red",
                                                                fontSize: "14px",
                                                                marginTop: "5px",
                                                            }}
                                                        >
                                                            {errors.account_type.message}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="col-6 col-md-4  ">
                                                    <label
                                                        className="form-label"
                                                        for="routing_number"
                                                    >
                                                        Routing Number
                                                    </label>
                                                    <div className="input-group input-group-merge">
                                                        <input
                                                            type="text"
                                                            className="form-control cvv-code-mask"
                                                            name="routing_number"
                                                            maxlength="9"
                                                            {...register("routing_number", {
                                                                required:
                                                                    "Routing Number is required",
                                                                pattern: onlyNumbers,
                                                            })}
                                                            placeholder="Enter Routing Number"
                                                        />
                                                    </div>
                                                    {errors.routing_number && (
                                                        <div
                                                            style={{
                                                                color: "red",
                                                                fontSize: "14px",
                                                                marginTop: "5px",
                                                            }}
                                                        >
                                                            {errors.routing_number.message}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="col-6 col-md-4  ">
                                                    <label
                                                        className="form-label"
                                                        for="account_number"
                                                    >
                                                        Account Number
                                                    </label>
                                                    <div className="input-group input-group-merge">
                                                        <input
                                                            type="text"
                                                            className="form-control cvv-code-mask"
                                                            name="account_number"
                                                            maxlength="17"
                                                            {...register("account_number", {
                                                                required:
                                                                    "Account Number is required",
                                                                pattern: onlyNumbers,
                                                            })}
                                                            placeholder="Enter Account Number"
                                                        />
                                                    </div>
                                                    {errors.account_number && (
                                                        <div
                                                            style={{
                                                                color: "red",
                                                                fontSize: "14px",
                                                                marginTop: "5px",
                                                            }}
                                                        >
                                                            {errors.account_number.message}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="col-6 col-md-4 mt-2  ">
                                                    <label
                                                        className="form-label"
                                                        for="name_on_account"
                                                    >
                                                        Name on Account
                                                    </label>
                                                    <div className="input-group input-group-merge">
                                                        <input
                                                            type="text"
                                                            className="form-control cvv-code-mask"
                                                            name="name_on_account"
                                                            maxlength="22"
                                                            {...register(
                                                                "name_on_account",
                                                                {
                                                                    required:
                                                                        "Name on Account is required",

                                                                    pattern:
                                                                        onlyAlphabetsandSpaces,
                                                                }
                                                            )}
                                                            placeholder="Enter Name on Account"
                                                        />
                                                    </div>
                                                    {errors.name_on_account && (
                                                        <div
                                                            style={{
                                                                color: "red",
                                                                fontSize: "14px",
                                                                marginTop: "5px",
                                                            }}
                                                        >
                                                            {errors.name_on_account.message}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="col-6 col-md-4 mt-2  ">
                                                    <label
                                                        className="form-label"
                                                        for="echeck_type"
                                                    >
                                                        eCheck Type
                                                    </label>
                                                    <div className="input-group input-group-merge">
                                                        <select
                                                            className="form-select"
                                                            name="echeck_type"
                                                            {...register("echeck_type", {
                                                                required:
                                                                    "eCheck Type is required",
                                                            })}
                                                        >
                                                            <option value="">
                                                                Select eCheck Type
                                                            </option>
                                                            <option value="PPD">PPD</option>
                                                            <option value="TEL">TEL</option>
                                                            <option value="WEB">WEB</option>
                                                            <option value="CCD">CCD</option>
                                                        </select>
                                                    </div>
                                                    {errors.echeck_type && (
                                                        <div
                                                            style={{
                                                                color: "red",
                                                                fontSize: "14px",
                                                                marginTop: "5px",
                                                            }}
                                                        >
                                                            {errors.echeck_type.message}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="col-6 col-md-4 mt-2  ">
                                                    <label
                                                        className="form-label"
                                                        for="bank_name"
                                                    >
                                                        Bank Name
                                                    </label>
                                                    <div className="input-group input-group-merge">
                                                        <input
                                                            type="text"
                                                            className="form-control cvv-code-mask"
                                                            name="bank_name"
                                                            maxlength="50"
                                                            {...register("bank_name", {
                                                                required:
                                                                    "Bank Name is required",

                                                                pattern:
                                                                    onlyAlphabetsandSpaces,
                                                            })}
                                                            placeholder="Enter Bank Name"
                                                        />
                                                    </div>
                                                    {errors.bank_name && (
                                                        <div
                                                            style={{
                                                                color: "red",
                                                                fontSize: "14px",
                                                                marginTop: "5px",
                                                            }}
                                                        >
                                                            {errors.bank_name.message}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                </Modal.Body>
                                <Modal.Footer>
                                    <button type="button"
                                        className="btn btn-warning  btn-rounded waves-effect waves-light btn-md me-md-2 px-5"
                                        onClick={handlePaymentClose}>Cancel</button>
                                    <button type="submit"
                                        className="btn btn-primary  btn-rounded waves-effect waves-light btn-md me-md-2 px-5"
                                    >Save</button>
                                </Modal.Footer>
                            </form>
                        </Modal>
                    </div>
                </div >
            </div>
        </>
    );
}