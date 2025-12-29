import React, { useState, useEffect, useRef } from "react";
import Loader from '../../../common/components/Loader';
import { useForm, Controller } from "react-hook-form";
import { triggerAlert, ConfirmationAlert, getCustomerId, getToken, formatDateTime, exportToCsv, simpleAlert, formattedDateTime, transformText, secondsToTime, getCookie } from '../../../utils/CommonFunctions';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import PageTitle from '../../../common/PageTitle';
import PaginationComponent from "../../../common/components/PaginationComponent";
import { fetchBalanceHistory, fetchDownloadHistory, fetchWorkspace } from '../../../utils/ApiClient';
import '@mdi/font/css/materialdesignicons.min.css';

export default function BalanceHistory() {

    const [isLoading, setIsLoading] = useState();
    const customer_id = getCustomerId();
    const token = getToken();
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageCount, setPageCount] = useState(0);
    const [pageSlNo, setPageSlNo] = useState(0);
    const [perPageLimit, setPerPageLimit] = useState(10);
    const [pageLimitSelected, setPageLimitSelected] = useState(10);
    const [downlodEnable, setDownlodEnable] = useState(false);
    const [workspaces, setWorkspaces] = useState([]);
    const [error, setError] = useState(null);

    const currentDate = new Date();
    const [period_start, setPeriodStart] = useState(currentDate);
    const [period_end, setPeriodEnd] = useState(currentDate);
    const [minEndDate, setMinEndDate] = useState(
        period_start ? new Date(period_start) : null
    );

    const [filterType, setFilterType] = useState("today"); // Track the active tab: 'month' or 'date'
    const workspace_id_from_cookie = getCookie('selected_workspace_id');
    const [workspaceId, setWorkspaceId] = useState(workspace_id_from_cookie || "");

    const {
        register,
        formState: { errors },
        control,
        watch,
        clearErrors,
        getValues,
        setValue
    } = useForm({
        defaultValues: {
            period_start: currentDate,
            period_end: currentDate
        }
    });


    useEffect(() => {
        // Check if workspaceId is set before making the API call
        if (workspaceId) {
            setCurrentPage(0);
            fetchData(filterType, currentPage + 1);
        }
    }, [perPageLimit, workspaceId]);

    const fetchData = async (type, page, searchkey) => {
        // Check if workspaceId is set before proceeding
        if (!workspaceId) {
            console.error("Workspace ID is not set");
            return;
        }

        setFilterType(type);
        setIsLoading(true);
        setError(null);
        setDownlodEnable(false);

        const per_page = perPageLimit;
        const api_input = {
            filter_type: type,
            from_date: "",
            to_date: "",
            page: page,
            per_page: per_page,
            search_key: searchkey || "",
            workspace_id: workspaceId, // Include the selected workspace ID
        };

        // Handle specific filter types
        switch (type) {
            case "today":
                api_input.filter_type = "date_wise";
                const today = new Date();
                api_input.from_date = api_input.to_date = formatDateTime(today, "dd-mm-yyyy");
                break;
            case "date_wise":
                api_input.from_date = period_start
                    ? formatDateTime(period_start, "dd-mm-yyyy")
                    : "";
                api_input.to_date = period_end
                    ? formatDateTime(period_end, "dd-mm-yyyy")
                    : "";
                break;
            case "last_3_month":
            case "last_7_days":
                // Handle these cases if necessary
                break;
            default:
                console.error("Unsupported filterType:", type);
                return;
        }

        setPageSlNo((page - 1) * per_page);

        try {
            const response = await fetchBalanceHistory(api_input, token);
            const response_data = response.data.results;

            if (response_data.data) {
                setDownlodEnable(true);
                setData(response_data.data);
                setPageCount(response_data.pagination.total_pages);
            } else {
                setData([]); // Set data to an empty array to trigger "No data available" message
            }
        } catch (error) {
            // Handle other errors if necessary
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };


    const handlePageClick = (selected) => {
        const selectedPage = selected.selected;
        setCurrentPage(selectedPage);
        fetchData(filterType, selectedPage + 1);
    };



    let pgntn_props = {
        pageCount: pageCount,
        handlePageClick: handlePageClick,
        selectedPage: currentPage,
    };




    const handleChange = (tab) => {

        setCurrentPage(0);
        fetchData(tab, 1);
    };

    const handleSearch = () => {
        const { period_start, period_end } = getValues();


        clearErrors(["period_start", "period_end"]);

        let hasError = false;


        if (!period_start) {
            setError("period_start", {
                type: "manual",
                message: "From Date is required",
            });
            hasError = true;
        }

        if (!period_end) {
            setError("period_end", {
                type: "manual",
                message: "To Date is required",
            });
            hasError = true;
        }


        if (hasError) {
            return;
        }


        const startDate = new Date(period_start);
        const endDate = new Date(period_end);


        if (startDate > endDate) {
            setError("period_start", {
                type: "manual",
                message: "From date cannot be later than to date",
            });

            return;
        }


        setCurrentPage(0);
        fetchData('date_wise', 1);
    };



    const downloadCsv = async () => {
        try {
            const api_input = {
                workspace_id: workspaceId,
                filter_type: filterType,
                from_date: "",
                to_date: "",
                search_key: searchQuery,
            };

            switch (filterType) {
                case "today":
                    api_input.filter_type = "date_wise";
                    break;
                case "date_wise":
                    const formattedFromDate = period_start
                        ? formatDateTime(period_start, "dd-mm-yyyy")
                        : "";
                    const formattedToDate = period_end
                        ? formatDateTime(period_end, "dd-mm-yyyy")
                        : "";
                    api_input.from_date = formattedFromDate;
                    api_input.to_date = formattedToDate;
                    break;

                case "last_3_month":
                    break;

                case "last_7_days":
                    break;

                default:
                    console.error("Unsupported filterType:", filterType);
                    return;
            }

            const response = await fetchDownloadHistory(api_input, token);
            const response_data = response.data.results;
            const csv_data = response_data.data;
            exportToCsv(csv_data, "balance_history");
        } catch (error) {
            triggerAlert("info", "", "Couldn't download data");
        }
    };

    const [searchQuery, setSearchQuery] = useState("");
    const handleKeySearch = (e) => {
        setSearchQuery(e.target.value);
        const searchkey = e.target.value;
        setCurrentPage(0);
        fetchData(filterType, 1, searchkey); // Update search results on every change
    };

    const handlePageChange = (event) => {
        if (event.target.value) {
            setCurrentPage(0);
            setPerPageLimit(event.target.value);
            setPageLimitSelected(event.target.value);
        } else {
            setPerPageLimit(10);
            setPageLimitSelected(10);

        }
    };


    const [expandedRows, setExpandedRows] = useState([]);

    const toggleDescription = (index) => {
        const newExpandedRows = [...expandedRows];
        if (expandedRows.includes(index)) {
            newExpandedRows.splice(newExpandedRows.indexOf(index), 1);
        } else {
            newExpandedRows.push(index);
        }
        setExpandedRows(newExpandedRows);
    };

    const isRowExpanded = (index) => {
        return expandedRows.includes(index);
    };

    const datepickerRef = useRef(null);
    const datepickerfromRef = useRef(null);
    // OPENS UP THE DATEPICKER WHEN THE CALENDAR ICON IS CLICKED FOR THE INPUT FIELD
    const handleClickDatepickerFromIcon = () => {
        if (datepickerfromRef.current) {
            datepickerfromRef.current.input.focus(); // Focus on the input element
        }
    };

    const handleClickDatepickerIcon = () => {
        if (datepickerRef.current) {
            datepickerRef.current.input.focus(); // Focus on the input element
        }
    };


    const [outboundCallDate, setOutboundCallDate] = useState("");
    const [outboundCalls, setOutboundCalls] = useState([]);
    const [isOutboundLoading, setIsOutboundLoading] = useState(false);
    const [outboundCallShow, setOutboundCallShow] = useState(false);
    const [currentPageOut, setCurrentPageOut] = useState(0);
    const [pageCountOut, setPageCountOut] = useState(0);
    const [pageSlNoOut, setPageSlNoOut] = useState(0);
    const [perPageLimitOut, setPerPageLimitOut] = useState(20);
    const [pageLimitSelectedOut, setPageLimitSelectedOut] = useState(10);


    const handleOutboundCallShow = () => setOutboundCallShow(true);

    const handleOutboundCallClose = () => {
        setOutboundCallShow(false);
        setPageCountOut(0);
        setCurrentPageOut(0);
    };

    const handlePageClickOut = (selected) => {


        const selectedPage = selected.selected;
        setCurrentPageOut(selectedPage);
        // handleOutboundCallModal(selectedPage + 1, outboundCallDate); // Increment the page number by 1 for server-side pagination
    };

    const datepickerToRef = useRef(null);



    const handleClickDatepickerToIcon = () => {
        if (datepickerToRef.current) {
            datepickerToRef.current.setOpen(true);
        }
    };

    let out_pgntn_props = {
        pageCount: pageCountOut,
        handlePageClick: handlePageClickOut,
        selectedPage: currentPageOut,
    };

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
            triggerAlert("error", "Error", "You don’t have access to any workspaces. Please contact your administrator");

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
            <div id="content-page" className="content-page">
                <div className="container">
                    {isOutboundLoading ? (
                        <div className="loader-overlay text-white">
                            <Loader />
                        </div>
                    ) : null}
                    <PageTitle heading="Balance History" />

                    <div className="row">
                        <div className="col-sm-12">
                            <div className="card p-3">
                                <form className="mx-auto w-100 fv-plugins-bootstrap5 fv-plugins-framework ng-pristine ng-valid" id="">
                                    <div className="row mb-3">
                                        <div className="col-lg-12">
                                            <div className="row g-3 align-items-center">
                                                <div className="col-md-3 mb-3 d-flex flex-column">
                                                    <label className="col-form-label">Select a Workspace</label>
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

                                                <div className="col-md-2 mb-3 d-flex flex-column position-relative">
                                                    <label htmlFor="fromDate" className="form-label">From</label>
                                                    <i
                                                        className="mdi mdi-calendar"
                                                        style={{
                                                            position: "absolute",
                                                            top: "76%",
                                                            right: "10px",
                                                            transform: "translateY(-50%)",
                                                            zIndex: "1",
                                                            fontSize: "24px",
                                                            cursor: "pointer",
                                                            color: "#6c757d",
                                                        }}
                                                        onClick={handleClickDatepickerFromIcon}
                                                    ></i>
                                                    <Controller
                                                        control={control}
                                                        name="period_start"
                                                        render={({ field }) => (
                                                            <DatePicker
                                                                className="form-control"
                                                                placeholderText="MM/DD/YYYY"
                                                                selected={field.value}
                                                                onChange={(date) => {
                                                                    field.onChange(date);
                                                                    setPeriodStart(date);
                                                                    setMinEndDate(date); // Update minDate for period_end
                                                                    if (date) clearErrors("period_start");
                                                                }}
                                                                showMonthDropdown
                                                                showYearDropdown
                                                                maxDate={new Date()}
                                                                autoComplete="off"
                                                                ref={datepickerfromRef}
                                                            />
                                                        )}
                                                    />
                                                    {errors.period_start && (
                                                        <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                            {errors.period_start.message}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="col-md-2 mb-3 d-flex flex-column position-relative">
                                                    <label htmlFor="toDate" className="form-label">To</label>
                                                    <i
                                                        className="mdi mdi-calendar"
                                                        style={{
                                                            position: "absolute",
                                                            top: "76%",
                                                            right: "10px",
                                                            transform: "translateY(-50%)",
                                                            zIndex: "1",
                                                            fontSize: "24px",
                                                            cursor: "pointer",
                                                            color: "#6c757d",
                                                        }}
                                                        onClick={handleClickDatepickerToIcon}
                                                    ></i>
                                                    <Controller
                                                        control={control}
                                                        name="period_end"
                                                        render={({ field }) => (
                                                            <DatePicker
                                                                className="form-control"
                                                                placeholderText="MM/DD/YYYY"
                                                                selected={field.value}
                                                                onChange={(date) => {
                                                                    field.onChange(date);
                                                                    setPeriodEnd(date); // Update the state variable
                                                                    if (date) clearErrors("period_end");
                                                                }}
                                                                showMonthDropdown
                                                                showYearDropdown
                                                                maxDate={new Date()}
                                                                minDate={minEndDate}
                                                                autoComplete="off"
                                                                ref={datepickerToRef}
                                                            />
                                                        )}
                                                    />
                                                    {errors.period_end && (
                                                        <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                            {errors.period_end.message}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="col-md-5 d-flex justify-content-start gap-2" style={{ marginTop: '30px' }}>
                                                    <button
                                                        type="button"
                                                        className="btn btn-success rounded-pill"
                                                        onClick={handleSearch}
                                                    >
                                                        Search
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary rounded-pill"
                                                        onClick={() => handleChange("last_7_days")}
                                                    >
                                                        Last 7 Days
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-warning rounded-pill"
                                                        onClick={() => handleChange("last_3_month")}
                                                    >
                                                        Last 3 Months
                                                    </button>
                                                    {data?.length > 0 && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-info rounded-pill"
                                                            onClick={() => downloadCsv()}
                                                        >
                                                            Download
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </form>

                            </div>
                        </div>
                    </div>


                    <>
                        {error && (
                            <div className="alert alert-danger" role="alert">
                                {error}
                            </div>
                        )}
                        <div className="row mb-5">
                            <div className="col-sm-12">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between mb-3">
                                            <div className="dataTables_length" id="example_length">
                                                <label>
                                                    Show
                                                    <select
                                                        name="example_length"
                                                        aria-controls="example"
                                                        className="table_length"
                                                        onChange={handlePageChange}
                                                        value={pageLimitSelected}
                                                    >
                                                        <option value="10">10</option>
                                                        <option value="20">20</option>
                                                        <option value="50">50</option>
                                                        <option value="100">100</option>
                                                    </select>{" "}
                                                    entries
                                                </label>
                                            </div>
                                            <div className="btn-group">
                                                <input
                                                    type="search"
                                                    placeholder="Search..."
                                                    value={searchQuery}
                                                    className="form-control form-control-sm"
                                                    aria-controls="example"
                                                    onChange={handleKeySearch}
                                                />
                                            </div>
                                        </div>
                                        {isLoading ? (
                                            <Loader />
                                        ) : (

                                            <div className="table-responsive">
                                                <table className="table table-bordered display" style={{ width: "100%" }}>
                                                    <thead>
                                                        <tr>
                                                            <th scope="col">#</th>
                                                            <th scope="col">Transaction Date</th>
                                                            <th scope="col">Description</th>
                                                            <th scope="col">Units</th>
                                                            <th scope="col">Unit Cost</th>
                                                            <th scope="col">Amount</th>
                                                            <th scope="col">Type</th>
                                                            <th scope="col">Balance Amount</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {data?.length > 0 ? (
                                                            data.map((item, index) => (
                                                                <tr key={index}>
                                                                    <th scope="row">{pageSlNo + index + 1}</th>
                                                                    <td>{formattedDateTime(item.created_date, "dd-mm-yyyy")}</td>
                                                                    <td
                                                                        style={{
                                                                            whiteSpace: "normal",
                                                                            wordWrap: "break-word",
                                                                            overflowWrap: "break-word",
                                                                            minWidth: "211px",
                                                                            maxWidth: "211px",
                                                                        }}
                                                                    >
                                                                        {expandedRows.includes(index) ? (
                                                                            item.description
                                                                        ) : (
                                                                            <div>
                                                                                {item.description.length > 40
                                                                                    ? `${item.description.slice(0, 40)}... `
                                                                                    : item.description}
                                                                                {item.description.length > 40 && (
                                                                                    <span
                                                                                        className="text-primary fs-6"
                                                                                        style={{ cursor: "pointer", fontWeight: "bold" }}
                                                                                        onClick={() => toggleDescription(index)}
                                                                                    >
                                                                                        more
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                        {isRowExpanded(index) && (
                                                                            <span
                                                                                className="text-primary fs-6"
                                                                                style={{ cursor: "pointer", fontWeight: "bold" }}
                                                                                onClick={() => toggleDescription(index)}
                                                                            >
                                                                                less
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                    <td>{item.unit}</td>
                                                                    <td>${item.unit_cost}</td>
                                                                    <td>
                                                                        {item.payment_type === "credit" ? (
                                                                            <span className="text-success font-size-15">
                                                                                ${item.amount_collected}
                                                                            </span>
                                                                        ) : (
                                                                            <span className="text-danger font-size-15">
                                                                                ${item.amount_collected}
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                    <td>
                                                                        {item.payment_type === "credit" ? (
                                                                            <span className="badge bg-success rounded-pill font-size-12">
                                                                                Credit
                                                                            </span>
                                                                        ) : (
                                                                            <span className="badge bg-danger rounded-pill font-size-12">
                                                                                Debit
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                    <td>${item.current_balance}</td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="8" className="text-center">
                                                                    No data available
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                                <PaginationComponent {...pgntn_props} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>

                </div>
            </div>
        </>
    )
}


