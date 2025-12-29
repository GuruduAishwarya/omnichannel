import React, { useState, useEffect } from "react";
import Loader from '../../../common/components/Loader';
import { fetchTicketListData, fetchUserDetailsData } from '../../../utils/ApiClient';
import { triggerAlert, formatDateTime, getToken } from '../../../utils/CommonFunctions';
import { Link } from "react-router-dom";
import PaginationComponent from "../../../common/components/PaginationComponent";
import ShowTicket from "./ShowTicket";

export default function ListTicket() {
    const [activeTab, setActiveTab] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [perPageLimit, setPerPageLimit] = useState(10);
    const [dataList, setDataList] = useState([]);
    const [pageCount, setPageCount] = useState(0);
    const [pageSlNo, setPageSlNo] = useState(0);
    const [userData, setUserData] = useState([]);
    const [showTicket, setShowTicket] = useState(false);
    const [selectTicket, setSelectTicket] = useState(false);

    const token = getToken();

    // Handle tab click
    const handleTabClick = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1);
    };

    // Fetch ticket data
    const fetchTicketData = async (selectedTab, page) => {
        setIsLoading(true);
        try {
            const params = {
                page_number: page,
                page_size: perPageLimit,
                line_type: selectedTab,
            };
            const response = await fetchTicketListData(params, token);
            const responseData = response.data;

            if (responseData.error_code === 200) {
                const data = Object.values(responseData.results.data);
                const { total_pages, total_items } = responseData.results.pagination;

                setDataList(data);
                setPageSlNo((page - 1) * perPageLimit);
                setPageCount(total_items === 0 ? 0 : total_pages);
            } else {
                setDataList([]);
                setPageCount(0);
            }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || "Something went wrong!";
            triggerAlert('error', 'Oops...', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch user details
    // const fetchUserDetails = async () => {
    //     try {
    //         const response = await fetchUserDetailsData();
    //         const responseData = response.data;

    //         if (responseData.error_code === 200) {
    //             setUserData(responseData.results);
    //         } else {
    //             setUserData([]);
    //         }
    //     } catch (error) {
    //         triggerAlert('error', 'Oops...', "Failed to fetch user details.");
    //     }
    // };

    // Handle pagination click
    const handlePageClick = (selected) => {
        setCurrentPage(selected.selected + 1);
    };

    useEffect(() => {
        fetchTicketData(activeTab, currentPage);
    }, [activeTab, currentPage, perPageLimit]);

    // useEffect(() => {
    //     fetchUserDetails();
    // }, []);

    const handleOpenTicket = (ticket_number) => {
        setShowTicket(true);
        setSelectTicket(ticket_number);
    };

    return (
        <div>
            <div id="content-page" className="content-page">
                <div className="container">
                    <div className="">
                        <div className="d-flex align-items-center justify-content-between flex-wrap">
                            <h4 className="fw-bold text-primary">Show Ticket</h4>
                        </div>
                    </div>

                    {!showTicket ? (
                        <div className="row mt-4">
                            <div className="col-sm-12 col-lg-12">
                                <div className="card">
                                    <div className="card-header d-flex justify-content-between">
                                        <div className="header-title">
                                            <h4 className="card-title text-warning">{userData.email}</h4>
                                            <p className="mb-0">- Support - Trouble Ticket System</p>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <div className="mb-4">
                                            <p className="fw-500 text-warning">
                                                Support representatives are available Monday through Friday 9:00 am to 5:30 pm EST.<br />
                                                All support inquiries will be reviewed in the order received.
                                            </p>
                                            <p className="fw-500 mb-0">
                                                Limited staff is available for emergency situations 24 hours a day 7 days a week.
                                            </p>
                                            <p className="fw-500">
                                                <Link to="/support-ticket#create-ticket" className="text-info">
                                                    Click here
                                                </Link> to open a new trouble ticket.
                                            </p>
                                            <div className="d-flex align-items-center justify-content-between flex-wrap">
                                                <ul className="nav nav-pills" id="pills-tab" role="tablist">
                                                    <li className="nav-item" role="presentation">
                                                        <button
                                                            className={`nav-link ${activeTab === 1 ? "active" : ""}`}
                                                            onClick={() => handleTabClick(1)}
                                                        >
                                                            Open Tickets
                                                        </button>
                                                    </li>
                                                    <li className="nav-item" role="presentation">
                                                        <button
                                                            className={`nav-link ${activeTab === 4 ? "active" : ""}`}
                                                            onClick={() => handleTabClick(4)}
                                                        >
                                                            Closed Tickets
                                                        </button>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>

                                        {isLoading ? (
                                            <Loader />
                                        ) : (
                                            <div className="table-responsive">
                                                <table className="table table-striped table-bordered hover" width="100%">
                                                    <thead>
                                                        <tr>
                                                            <th>#</th>
                                                            <th>Ticket Number</th>
                                                            <th>Workspace</th>
                                                            <th>Issue Type</th>
                                                            <th>Opened On</th>
                                                            <th>Last Updated On</th>
                                                            <th>Updated By</th>
                                                            <th>Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {dataList.length > 0 ? (
                                                            dataList.map((ticket, index) => (
                                                                <tr key={ticket.id}>
                                                                    <td>{pageSlNo + index + 1}</td>
                                                                    <td>#{ticket.ticket_number}</td>
                                                                    <td>{ticket.workspace_name || "-"}</td>
                                                                    <td>{ticket.ticket_sub_category}</td>
                                                                    <td>{formatDateTime(ticket.register_date, "yyyy-mm-dd hh:mm:ss")}</td>
                                                                    <td>{formatDateTime(ticket.updated_date, "yyyy-mm-dd hh:mm:ss")}</td>
                                                                    <td>{ticket.updated_name || "-"}</td>
                                                                    <td>
                                                                        <span
                                                                            className={`badge rounded-pill font-size-15 ${ticket.status === "closed" || ticket.status === 4
                                                                                ? "bg-success"
                                                                                : "bg-danger"}`}
                                                                            style={{ cursor: "pointer" }}
                                                                            onClick={() => handleOpenTicket(ticket.ticket_number)}
                                                                        >
                                                                            {ticket.status === "closed" || ticket.status === 4
                                                                                ? "Closed"
                                                                                : ticket.ticket_status_value}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="8" style={{ textAlign: "center" }}>
                                                                    No data to display
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                                <PaginationComponent
                                                    pageCount={pageCount}
                                                    handlePageClick={handlePageClick}
                                                    selectedPage={currentPage - 1}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <ShowTicket
                            ticketNumber={selectTicket}
                            activeTab={activeTab}
                            currentPage={currentPage}
                            setShowTicket={setShowTicket}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
