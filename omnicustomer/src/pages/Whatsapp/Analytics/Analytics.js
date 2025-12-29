import React, { useEffect, useRef, useState } from 'react';
import LineChart from './LineChart';
import PageTitle from '../../../common/PageTitle';
import { Controller, useForm } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import { DeliverStatus, TemplateDetails, TotalChatList } from '../../../utils/ApiClient';
import { formatDate, triggerAlert } from '../../../utils/CommonFunctions';
import Loader from "../../../common/components/Loader";

export default function Analytics() {
    const currentDate = new Date();
    const [isLoading, setIsLoading] = useState(false);
    const [start_date, setPeriodStart] = useState(currentDate);
    const [end_date, setPeriodEnd] = useState(currentDate);
    const [year, setYear] = useState(new Date().getFullYear());
    const [minEndDate, setMinEndDate] = useState(start_date ? new Date(start_date) : null);
    const {
        register,
        formState: { errors },
        control,
        watch,
        setError,
        clearErrors,
        getValues,
        setValue
    } = useForm({
        defaultValues: {
            start_date: currentDate,
            end_date: currentDate
        }
    });
    const [filterType, setFilterType] = useState("today");
    const [chartData, setChartData] = useState({
        dates: [],
        message_delivered_counts: [],
        message_failed_counts: [],
        message_read_counts: [],
        message_send_counts: [],
    });
    const [totalChatData, setTotalChatData] = useState({
        dates: [],
        business_initiated_counts: [],
        user_initiated_counts: [],
    });
    const [templateData, setTemplateData] = useState({
        dates: [],
        authentication_counts: [],
        marketing_counts: [],
        utility_counts: [],
    });

    const datepickerToRef = useRef(null);
    const datepickerfromRef = useRef(null);

    const handleClickDatepickerFromIcon = () => {
        if (datepickerfromRef.current) {
            datepickerfromRef.current.input.focus();
        }
    };

    const handleClickDatepickerToIcon = () => {
        if (datepickerToRef.current) {
            datepickerToRef.current.setOpen(true);
        }
    };

    const fetchStatus = async (type) => {
        setIsLoading(true);
        setFilterType(type);

        let api_input = {
            year: year.toString(),
            start_date: "",
            end_date: "",
            tab_type: type,
        };

        switch (type) {
            case "today":
                api_input.tab_type = "date_wise";
                const today = new Date();
                api_input.start_date = api_input.end_date = formatDate(today, "yyyy-mm-dd");
                break;
            case "date_wise":
                const formattedFromDate = start_date ? formatDate(start_date, "yyyy-mm-dd") : "";
                const formattedToDate = end_date ? formatDate(end_date, "yyyy-mm-dd") : "";
                api_input.start_date = formattedFromDate;
                api_input.end_date = formattedToDate;
                break;
            case "last_7days":
                api_input.tab_type = "last_7days";
                break;
            case "last_30days":
                api_input.tab_type = "last_30days";
                break;
            case "this_year":
                api_input.tab_type = "this_year";
                break;
            default:
                console.error("Unsupported filterType:", filterType);
                return;
        }

        try {
            const [response, response2, response3] = await Promise.all([
                DeliverStatus(api_input),
                TotalChatList(api_input),
                TemplateDetails(api_input)
            ]);

            const { dates, message_delivered_counts, message_failed_counts, message_read_counts, message_send_counts } = response?.data?.results;
            setChartData({
                dates,
                message_delivered_counts,
                message_failed_counts,
                message_read_counts,
                message_send_counts
            });

            const { dates: chatDates, business_initiated_counts, user_initiated_counts } = response2?.data?.results;
            setTotalChatData({
                dates: chatDates || [],
                business_initiated_counts: business_initiated_counts || [],
                user_initiated_counts: user_initiated_counts || []
            });

            const { dates: templateDates, authentication_counts, marketing_counts, utility_counts } = response3?.data?.results;
            setTemplateData({
                dates: templateDates || [],
                authentication_counts: authentication_counts || [],
                marketing_counts: marketing_counts || [],
                utility_counts: utility_counts || []
            });

            setIsLoading(false);
        } catch (error) {
            if (error?.response?.data?.error_code === 400) {
                triggerAlert("info", "Oops", error.response.data.message);
            } else {
                triggerAlert("error", "Oops...", "Couldn't download data");
            }
            setIsLoading(false);
        }
    };

    const handleSearch = () => {
        const { start_date, end_date } = getValues();
        clearErrors(["start_date", "end_date"]);

        let hasError = false;
        if (!start_date) {
            setError("start_date", {
                type: "manual",
                message: "From Date is required",
            });
            hasError = true;
        }
        if (!end_date) {
            setError("end_date", {
                type: "manual",
                message: "To Date is required",
            });
            hasError = true;
        }
        if (hasError) {
            return;
        }

        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        if (startDate > endDate) {
            setError("start_date", {
                type: "manual",
                message: "From date cannot be later than to date",
            });
            return;
        }

        // Ensure fetchStatus is called only once
        if (filterType !== 'date_wise') {
            setFilterType('date_wise');
        } else {
            fetchStatus('date_wise');
        }
    };

    const handleChange = (tab) => {
        if (filterType !== tab) {
            setFilterType(tab);
        }
    };

    useEffect(() => {
        fetchStatus(filterType);
    }, [filterType]);

    return (
        <>
            <div>
                <div className="position-relative"></div>
                <div id="content-page" className="content-page">
                    <div className="container">
                        <PageTitle heading="Analytics" />
                        {isLoading && (
                            <div className='loader-overlay text-white'>
                                <Loader />
                            </div>
                        )}
                        <div className="row">
                            <div className="col-sm-12">
                                <div className="card p-3">
                                    <form className="mx-auto w-100 fv-plugins-bootstrap5 fv-plugins-framework ng-pristine ng-valid">
                                        <div className="row mb-3">
                                            <div className="col-lg-12">
                                                <div className="row g-5" style={{ alignItems: "center" }}>
                                                    <div className="col-md-3 mb-3 d-flex flex-column position-relative">
                                                        <label htmlFor="fromDate" className="form-label">From</label>
                                                        <i
                                                            className="mdi mdi-calendar"
                                                            style={{
                                                                position: "absolute",
                                                                top: "50%",
                                                                right: "20px",
                                                                transform: "translateY(-2%)",
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
                                                                    className="px-3 form-control"
                                                                    placeholderText="MM/DD/YYYY"
                                                                    selected={field.value}
                                                                    onChange={(date) => {
                                                                        field.onChange(date);
                                                                        setPeriodStart(date);
                                                                        setMinEndDate(date);
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
                                                            <div style={{ color: 'red', fontSize: '14px', marginTop: '5px', position: 'absolute', bottom: '-25px' }}>
                                                                {errors.period_start.message}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="col-md-3 mb-3 d-flex flex-column position-relative">
                                                        <label htmlFor="toDate" className="form-label">To</label>
                                                        <i
                                                            className="mdi mdi-calendar"
                                                            style={{
                                                                position: "absolute",
                                                                top: "50%",
                                                                right: "20px",
                                                                transform: "translateY(-50%)",
                                                                zIndex: 3,
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
                                                                    className="px-3 form-control"
                                                                    placeholderText="MM/DD/YYYY"
                                                                    selected={field.value}
                                                                    onChange={(date) => {
                                                                        field.onChange(date);
                                                                        setPeriodEnd(date);
                                                                        if (date) clearErrors("period_end");
                                                                    }}
                                                                    showMonthDropdown
                                                                    showYearDropdown
                                                                    maxDate={new Date()}
                                                                    minDate={minEndDate}
                                                                    autoComplete="off"
                                                                    ref={datepickerToRef}
                                                                    popperProps={{
                                                                        modifiers: [
                                                                            {
                                                                                name: "preventOverflow",
                                                                                options: {
                                                                                    boundary: "viewport",
                                                                                },
                                                                            },
                                                                        ],
                                                                    }}
                                                                    popperPlacement="bottom-start"
                                                                    popperClassName="custom-datepicker-popper"
                                                                />
                                                            )}
                                                        />
                                                        {errors.period_end && (
                                                            <div
                                                                style={{
                                                                    color: 'red',
                                                                    fontSize: '14px',
                                                                    marginTop: '5px',
                                                                    position: 'absolute',
                                                                    bottom: '-25px',
                                                                    zIndex: 2,
                                                                }}
                                                            >
                                                                {errors.period_end.message}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="d-flex justify-content-start gap-2 mt-5">
                                                            <button type="button" className="btn btn-success rounded-pill mb-3 me-1" onClick={handleSearch}>Apply Now</button>
                                                            <button type="button" className="btn btn-light rounded-pill mb-3 me-1" onClick={() => handleChange("last_7days")}>Last 7 days</button>
                                                            <button type="button" className="btn btn-light rounded-pill mb-3 me-1" onClick={() => handleChange("last_30days")}>Last 30 days</button>
                                                            <button type="button" className="btn btn-light rounded-pill mb-3 me-1" onClick={() => handleChange("this_year")}>This year</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                        <div className="row mb-5">
                            <div className="col-sm-6">
                                <div className="card">
                                    <div className="card-header border-0">
                                        <div className="header-title">
                                            <h5 className="card-title">Template Details</h5>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <LineChart type="template_chart" data={{
                                            dates: templateData.dates,
                                            authentication: templateData.authentication_counts,
                                            marketing: templateData.marketing_counts,
                                            utility: templateData.utility_counts
                                        }} />
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-6">
                                <div className="card">
                                    <div className="card-header border-0">
                                        <div className="header-title">
                                            <h5 className="card-title">Total Chart</h5>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <LineChart type="total_chart" data={{
                                            dates: totalChatData.dates,
                                            business_initiated: totalChatData.business_initiated_counts,
                                            user_initiated: totalChatData.user_initiated_counts,
                                        }} />
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-12">
                                <div className="card">
                                    <div className="card-header border-0">
                                        <div className="header-title">
                                            <h5 className="card-title">Delivery Status</h5>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <LineChart type="delivery_chart" data={{
                                            dates: chartData.dates,
                                            delivered: chartData.message_delivered_counts,
                                            failed: chartData.message_failed_counts,
                                            read: chartData.message_read_counts,
                                            sent: chartData.message_send_counts
                                        }} />
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
