import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTitle from '../../common/PageTitle';
import { fetchTicketCount, fetchUserDetailsData } from '../../utils/ApiClient';
import { getCustomerId, getToken, triggerAlert, formattedDateTime } from '../../utils/CommonFunctions';

export default function Dashboard() {
    const navigate = useNavigate();
    const [ticketData, setTicketData] = useState({
        templates: [], // Initialize as empty array
        favorite_contacts: [], // Initialize as empty array
        wallet_amount: 0,
    });

    const customer_id = getCustomerId();
    const token = getToken();
    const [userData, setUserData] = useState([]);

    const fetchUserDetails = async () => {
        try {

            const response = await fetchUserDetailsData();
            const response_data = response.data;
            // console.log("data", response_data.error_code)
            if (response_data.error_code == 200) {
                const data = response.data.results;
                setUserData(data);


            } else {
                setUserData([])
            }
        } catch (error) {
            const response_data = error?.response?.data
        }
    }

    useEffect(() => {
        const fetchDidTicketData = async () => {
            const api_input = {
                customer_id: customer_id
            };
            try {
                const response = await fetchTicketCount(api_input, token);

                const response_data = response.data.results.data;
                if (response.data.error_code === 200) {
                    setTicketData(response_data);
                } else {
                    triggerAlert('error', 'Oops...', 'Something went wrong.');
                }
            } catch (error) {
                console.log(error);
                triggerAlert('error', 'Oops...', 'Something went wrong..');
            }
        };
        fetchDidTicketData();
        fetchUserDetails();
    }, []);

    const handleRechargeClick = () => {
        navigate('/payments/recharge');
    };

    return (
        <>
            <div className="position-relative"></div>
            <div id="content-page" className="content-page">
                <div className="container">
                    <PageTitle heading="Dashboard" />
                    <div className="row px-2">
                        <div className="card rounded-3 welcome-lms-courses-box" style={{
                            background: 'linear-gradient(92.21deg, #3F51B5 1.38%, #6560f0)'
                        }}>
                            <div className="card-body ps-15 pe-15 ps-sm-20 pe-sm-20 ps-md-25 pe-md-25 ps-lg-30 pe-lg-30 ps-xl-40 pe-xl-40 letter-spacing">
                                <div className="row align-items-center">
                                    <div className="col-xxl-6">
                                        <div className="content">
                                            <p className="mb-0 text-light fw-bold">Welcome Back</p>
                                            <h3 className="fw-semibold mb-3 text-white">
                                                <span className="fw-bold text-white">{userData.first_name ? userData.first_name : 0} {userData.last_name ? userData.last_name : 0}</span>
                                            </h3>
                                            <div className="row list justify-content-center">
                                                <div class="col-lg-6 col-12 col-sm-4">
                                                    <div class="card rounded-3 h- ">
                                                        <div class="card-body ">
                                                            <div class="d-flex justify-content-between w-100">
                                                                <div>
                                                                    <div class="d-flex flex-column">
                                                                        <div class="text-primary fs-5">Chatbots</div>
                                                                        <div class="text-warning fw-bold fs-3 mb-0 text-center ">0</div>
                                                                    </div>
                                                                </div>
                                                                <span class="svg-icon svg-icon-primary svg-icon-3x ms-n1">
                                                                    <svg width="35" height="35" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <rect x="2" y="2" width="9" height="9" rx="2" fill="currentColor"></rect>
                                                                        <rect opacity="0.3" x="13" y="2" width="9" height="9" rx="2" fill="currentColor"></rect>
                                                                        <rect opacity="0.3" x="13" y="13" width="9" height="9" rx="2" fill="currentColor"></rect>
                                                                        <rect opacity="0.3" x="2" y="13" width="9" height="9" rx="2" fill="currentColor"></rect>
                                                                    </svg>
                                                                </span>
                                                            </div>
                                                            <div class="d-flex flex-column text-center mtf-5">
                                                                <div class="text-primary fs-5">Deactivated Numbers</div>
                                                                <div class="text-danger fw-bold fs-3 mb-0 ">0</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-lg-6 col-12 col-sm-3">
                                                    <div className="card rounded-3 h-">
                                                        <div className="card-body">
                                                            <div className="d-flex justify-content-between w-100">
                                                                <div>
                                                                    <div className="d-flex flex-column">
                                                                        <div className="text-dark fs-5">Open Tickets</div>
                                                                        <div class="text-warning fw-bold fs-3 mb-0 text-center ">{ticketData.open_tickets}</div>
                                                                    </div>
                                                                </div>
                                                                <span className="svg-icon svg-icon-warning svg-icon-3x ms-n1">
                                                                    <svg width="35" height="35" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path opacity="0.3" d="M8.9 21L7.19999 22.6999C6.79999 23.0999 6.2 23.0999 5.8 22.6999L4.1 21H8.9ZM4 16.0999L2.3 17.8C1.9 18.2 1.9 18.7999 2.3 19.1999L4 20.9V16.0999ZM19.3 9.1999L15.8 5.6999C15.4 5.2999 14.8 5.2999 14.4 5.6999L9 11.0999V21L19.3 10.6999C19.7 10.2999 19.7 9.5999 19.3 9.1999Z" fill="currentColor"></path>
                                                                        <path d="M21 15V20C21 20.6 20.6 21 20 21H11.8L18.8 14H20C20.6 14 21 14.4 21 15ZM10 21V4C10 3.4 9.6 3 9 3H4C3.4 3 3 3.4 3 4V21C3 21.6 3.4 22 4 22H9C9.6 22 10 21.6 10 21ZM7.5 18.5C7.5 19.1 7.1 19.5 6.5 19.5C5.9 19.5 5.5 19.1 5.5 18.5C5.5 17.9 5.9 17.5 6.5 17.5C7.1 17.5 7.5 17.9 7.5 18.5Z" fill="currentColor"></path>
                                                                    </svg>
                                                                </span>
                                                            </div>
                                                            <div className="d-flex flex-column text-center">
                                                                <div className="text-dark fs-5">Closed Tickets</div>
                                                                <div class="text-danger fw-bold fs-3 mb-0 ">{ticketData.closed_tickets}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xxl-6 text-center text-xxl-end mt-5">
                                        <img src="https://takie.vitelglobal.com/websites/vitet-social-mediasync/assets/images/welcome.png" className="img-fluid" alt="welcome-image" style={{ width: '427px' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <ul className="list-unstyled row mb-0 mt-2">
                        <div className="d-flex justify-content-between">
                            <div className="item2">
                                <h4 className="text-warning">Credit Balance</h4>
                                <p className="fw-bold text-primary">You have {ticketData.credit_balance} credits</p>
                                <li class="nav-item ">

                                </li>
                            </div>
                            <div className="item2">
                                <h4 className="text-warning">Wallet Amount</h4>
                                <p className="fw-bold text-primary">You have ${ticketData.wallet_amount.toFixed(2)} </p>

                            </div>
                            <div className="item4 ms-1">
                                <div className="d-flex justify-content-between align-items-center ms-1 flex-wrap">
                                    <button type="button" className="btn btn-primary ms-2 btn-sm d-flex align-items-center"
                                        onClick={handleRechargeClick}
                                    >
                                        <span className="me-2">+</span>
                                        Recharge Now
                                    </button>

                                </div>
                            </div>
                        </div>
                        <li className="col-lg-3 col-md-6">
                            <div className="card">
                                <div className="card-body d-flex flex-column justify-content-between">
                                    <div className="d-flex justify-content-between w-100">
                                        <div>
                                            <div className="d-flex flex-column">
                                                <div className="text-primary fb-weight">No of Promotional Templates sent</div>
                                                <div className="text-info fw-bold fs-4 mb-0 ng-binding">15</div>
                                            </div>
                                        </div>
                                        <i class="fa fa-paper-plane-o text-warning  fs-2"></i>
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li className="col-lg-3 col-md-6">
                            <div className="card">
                                <div className="card-body d-flex flex-column justify-content-between">
                                    <div className="d-flex justify-content-between w-100">
                                        <div>
                                            <div className="d-flex flex-column">
                                                <div className="text-primary fb-weight fs-6">No of Transactional Template Sent</div>
                                                <div className="text-info fw-bold fs-4 mb-0 ng-binding">22</div>
                                            </div>
                                        </div>
                                        <i className="fa fa-comments-o text-warning fs-2" aria-hidden="true"></i>
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li className="col-lg-3 col-md-6">
                            <div className="card">
                                <div className="card-body d-flex flex-column justify-content-between">
                                    <div className="d-flex justify-content-between w-100">
                                        <div>
                                            <div className="d-flex flex-column">
                                                <div className="text-primary fb-weight fs-6">No of Scheduled Templates</div>
                                                <div className="text-info fw-bold fs-4 mb-0 ng-binding">12</div>
                                            </div>
                                        </div>
                                        <i className="fa fa-clock-o text-warning fs-2" aria-hidden="true"></i>
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li className="col-lg-3 col-md-6">
                            <div className="card">
                                <div className="card-body d-flex flex-column justify-content-between">
                                    <div className="d-flex justify-content-between w-100">
                                        <div>
                                            <div className="d-flex flex-column">
                                                <div className="text-primary fb-weight fs-6">No of Conversation today</div>
                                                <div className="text-info fw-bold fs-4 mb-0 ng-binding">10</div>
                                            </div>
                                        </div>
                                        <i className="fa fa-commenting-o text-warning fs-2"></i>
                                    </div>
                                </div>
                            </div>
                        </li>
                    </ul>
                    <div className="row mb-5 mt-3">
                        <div className="col-lg-4">
                            <div className="card card-block card-stretch card-height">
                                <div className="card-header">
                                    <div className="d-flex justify-content-between flex-wrap">
                                        <h5 className="card-title text-dark">Templates Details</h5>
                                        <div className="dropdown">
                                            <span
                                                className="material-symbols-outlined"
                                                id="dropdownMenuButton9"
                                                data-bs-toggle="dropdown"
                                                aria-expanded="false"
                                                role="button"
                                            >
                                                more_horiz
                                            </span>
                                            <div className="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton9">
                                                <a className="dropdown-item" href="javascript:void(0);">All Promotions</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body pt-2">
                                    <div style={{ height: '290px', overflow: 'auto' }}>
                                        <table className="table table-hover table-row-dashed">
                                            <thead className="bg-soft-light text-primary">
                                                <tr>
                                                    <th style={{ width: '10px' }}>#</th>
                                                    <th>Name</th>
                                                    <th>Message</th>
                                                    <th>Created Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {ticketData.templates.length > 0 ? (
                                                    ticketData.templates.map((template, index) => (
                                                        <tr key={template.id}>
                                                            <td>{index + 1}</td>
                                                            <td>{template.template_name}</td>
                                                            <td>{template.template_message}</td>
                                                            <td>{formattedDateTime(template.created_date, "dd-mm-yyyy")}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="4" className="text-center">No templates available</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="card card-block card-stretch card-height">
                                <div className="card-header">
                                    <div className="d-flex justify-content-between flex-wrap">
                                        <h5 className="card-title text-dark">Favorite Contacts</h5>
                                        <div className="dropdown">
                                            <span
                                                className="material-symbols-outlined"
                                                id="dropdownMenuButton9"
                                                data-bs-toggle="dropdown"
                                                aria-expanded="false"
                                                role="button"
                                            >
                                                more_horiz
                                            </span>
                                            <div className="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton9">
                                                <a className="dropdown-item" href="javascript:void(0);">View all Users</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body pt-2">
                                    <div style={{ height: '290px', overflow: 'auto' }}>
                                        <table className="table table-hover table-row-dashed">
                                            <thead className="bg-soft-light text-primary">
                                                <tr>
                                                    <th>Name/Email</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {ticketData.favorite_contacts.length > 0 ? (
                                                    ticketData.favorite_contacts.map(contact => (
                                                        <tr key={contact.id}>
                                                            <td>
                                                                <a href=" ">
                                                                    <div className="d-flex align-items-center">
                                                                        <div className="symbol symbol-40px me-3">
                                                                            <div className="symbol-label fs-4 fw-semibold bg-warning text-inverse-danger">
                                                                                {contact.contact_name.charAt(0)}
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <span className="fw-bold">{contact.contact_name}</span>
                                                                            <span className="d-block">{contact.email}</span>
                                                                        </div>
                                                                    </div>
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="1" className="text-center">No contacts available</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="card card-block card-stretch card-height">
                                <div className="card-header">
                                    <div className="d-flex justify-content-between flex-wrap">
                                        <h5 className="card-title text-dark">Recent Activities</h5>
                                        <div className="dropdown">
                                            <span
                                                className="material-symbols-outlined"
                                                id="dropdownMenuButton9"
                                                data-bs-toggle="dropdown"
                                                aria-expanded="false"
                                                role="button"
                                            >
                                                more_horiz
                                            </span>
                                            <div className="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton9">
                                                <a className="dropdown-item" href="javascript:void(0);">View all Activities</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body pt-2">
                                    <div style={{ height: '290px', overflow: 'auto' }}>
                                        <table className="table table-hover table-row-dashed">
                                            <thead className="bg-soft-light text-primary">
                                                <tr>
                                                    <th>Activity</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>Started Campaign</td>
                                                    <td><span className="badge bg-success fs-8 fw-bold">Completed</span></td>
                                                </tr>
                                                <tr>
                                                    <td>Scheduled Message</td>
                                                    <td><span className="badge bg-success fs-8 fw-bold">Completed</span></td>
                                                </tr>
                                                <tr>
                                                    <td>Payment Received</td>
                                                    <td><span className="badge bg-info fs-8 fw-bold">Pending</span></td>
                                                </tr>
                                                <tr>
                                                    <td>Campaign Report</td>
                                                    <td><span className="badge bg-danger fs-8 fw-bold">Failed</span></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
