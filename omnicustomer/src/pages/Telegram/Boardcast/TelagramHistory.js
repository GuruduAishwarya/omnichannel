import React, { useEffect, useRef, useState } from 'react';
import PageTitle from '../../../common/PageTitle';
import Loader from '../../../common/components/Loader';
import { useForm, Controller } from "react-hook-form";
import { triggerAlert, ConfirmationAlert, getCustomerId, getToken, formatDateTime, exportToCsv, simpleAlert, formattedDateTime, transformText, secondsToTime } from '../../../utils/CommonFunctions';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment-timezone";
import { Modal, Pagination, Button } from "react-bootstrap";
import { FetchBroadcastHistory, fetchDataListBroadcast, fetchExportHistory, singleDownload } from '../../../utils/ApiClient';
import PaginationComponent from "../../../common/components/PaginationComponent";
import { useNavigate } from 'react-router-dom';

const TelagramHistory = () => {
  const navigate = useNavigate();
  const customer_id = getCustomerId();
  const token = getToken();
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [pageSlNo, setPageSlNo] = useState(0);
  const [perPageLimit, setPerPageLimit] = useState(10);
  const [pageLimitSelected, setPageLimitSelected] = useState(10);
  const [downlodEnable, setDownlodEnable] = useState(false);
  const currentDate = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(currentDate.getMonth() - 1);
  const [period_start, setPeriodStart] = useState(currentDate);
  const [period_end, setPeriodEnd] = useState(currentDate);
  const [minEndDate, setMinEndDate] = useState(
    period_start ? new Date(period_start) : null
  );
  const [isLoading, setIsLoading] = useState();
  const api_url = process.env.REACT_APP_API_BASE_URL;
  const [filterType, setFilterType] = useState("today"); // Track the active tab: 'month' or 'date'
  const props = {
    title: "Transaction History | Pay As You Go",
    description: "Premium Multipurpose Admin & Dashboard Template",
  };

  const [broadcasts, setBroadcasts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPhoneNumbers, setSelectedPhoneNumbers] = useState([]);

  const [broadcastData, setBroadcastData] = useState({
    scheduled: 0,
    sent: 0,
    delivered: 0,
    message_read: 0,
    failed: 0,
  });
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
      period_start: oneMonthAgo,
      period_end: currentDate
    }
  });
  const handleShowModal = (phoneNumbers) => {
    setSelectedPhoneNumbers(phoneNumbers.split(',')); // Split phone numbers by comma
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);
  const handleClickDatepickerFromIcon = () => {
    if (datepickerfromRef.current) {
      datepickerfromRef.current.input.focus(); // Focus on the input element
    }
  };

  const datepickerToRef = useRef(null);
  const datepickerfromRef = useRef(null);

  const handleClickDatepickerToIcon = () => {
    if (datepickerToRef.current) {
      datepickerToRef.current.setOpen(true);
    }
  };

  const handleChange = (tab) => {
    setCurrentPage(0);
    fetchData(tab, 1);
    fetchDataList(tab, currentPage + 1);
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
    fetchData('date_wise');
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

  const fetchData = async (type) => {
    setIsLoading(true)
    console.log(type, "typetype");
    setFilterType(type);

    let api_input = `?`

    let param_data = "";
    let from_date = ""
    let to_date = ""
    let keyword = ""
    switch (type) {
      case "today":
        const today = new Date();
        from_date = to_date = formatDateTime(today, "yyyy-mm-dd");
        keyword = "date_wise"
        param_data = `${api_input}keyword=${keyword}&startdate=${from_date}&enddate=${to_date}`;
        break;
      case "date_wise":
        keyword = "date_wise"
        from_date = period_start
          ? formatDateTime(period_start, "yyyy-mm-dd")
          : "";
        to_date = period_end
          ? formatDateTime(period_end, "yyyy-mm-dd")
          : "";
        param_data = `${api_input}keyword=${keyword}&startdate=${from_date}&enddate=${to_date}`;

        break;
      case "last_7_days":
        keyword = "last_7_days"
        param_data = `${api_input}keyword=${keyword}`;

        break;
      case "last_30_days":
        keyword = "last_30_days"
        param_data = `${api_input}keyword=${keyword}`;

        break;
      case "last_year":
        keyword = "last_year"
        param_data = `${api_input}keyword=${keyword}`;

        break;
      default:
        console.error("Unsupported filterType:", type);
        return;
    }

    try {
      const response = await FetchBroadcastHistory(param_data)
      console.log(response.data.results, "response.results");
      const data = response.data.results;

      setBroadcastData({
        scheduled: data.scheduled || 0,
        sent: data.sent || 0,
        delivered: data.delivered || 0,
        message_read: data.message_read || 0,
        failed: data.failed || 0,
      });
      setIsLoading(false)
    } catch (error) {
      triggerAlert("error", "", "Couldn't download data");
      setIsLoading(false)
    }
  }

  const handlePageClickOut = (selected) => {
    const selectedPage = selected.selected;
    setCurrentPage(selectedPage);
    fetchDataList(filterType, selectedPage + 1); // Ensure page number is correctly adjusted
  };

  let pgntn_props = {
    pageCount: pageCount,
    handlePageClick: handlePageClickOut,
    selectedPage: currentPage,
  };

  const fetchDataList = async (type, page) => {
    setIsLoading(true)
    console.log(type, "typetype");
    setFilterType(type);

    const per_page = perPageLimit;
    let api_input = `?`
    let param_data = "";
    let from_date = ""
    let to_date = ""
    let keyword = ""

    switch (type) {
      case "today":
        const today = new Date();
        from_date = to_date = formatDateTime(today, "yyyy-mm-dd");
        keyword = "date_wise"
        param_data = `${api_input}keyword=${keyword}&startdate=${from_date}&enddate=${to_date}&page=${page}&page_size=${per_page}`;
        break;
      case "date_wise":
        keyword = "date_wise"
        from_date = period_start
          ? formatDateTime(period_start, "yyyy-mm-dd")
          : "";
        to_date = period_end
          ? formatDateTime(period_end, "yyyy-mm-dd")
          : "";
        param_data = `${api_input}keyword=${keyword}&startdate=${from_date}&enddate=${to_date}&page=${page}&page_size=${per_page}`;

        break;
      case "last_7_days":
        keyword = "last_7_days"
        param_data = `${api_input}keyword=${keyword}&page=${page}&page_size=${per_page}`;

        break;
      case "last_30_days":
        keyword = "last_30_days"
        param_data = `${api_input}keyword=${keyword}&page=${page}&page_size=${per_page}`;

        break;
      case "last_year":
        keyword = "last_year"
        param_data = `${api_input}keyword=${keyword}&page=${page}&page_size=${per_page}`;

        break;
      default:
        console.error("Unsupported filterType:", type);
        return;
    }

    console.log(param_data, "param_data");
    try {
      const response = await fetchDataListBroadcast(param_data)
      console.log(response, "response");
      setBroadcasts(response.data.results.data);
      setPageCount(response.data.results.pagination.total_pages || 0);
      setIsLoading(false)
    } catch (error) {
      triggerAlert('error', '', 'Something went wrong..');
      setIsLoading(false)
    }
  }

  const downloadCsv = async () => {
    try {
      console.log(filterType, "typetype");
      let api_input = {
        keyword: filterType,
        from_date: "",
        to_date: ""
      }
      switch (filterType) {
        case "today":
          api_input.keyword = "date_wise";
          const today = new Date();
          api_input.from_date = api_input.to_date = formatDateTime(today, "yyyy-mm-dd");
          break;
        case "date_wise":
          const formattedFromDate = period_start
            ? formatDateTime(period_start, "yyyy-mm-dd")
            : "";
          const formattedToDate = period_end
            ? formatDateTime(period_end, "yyyy-mm-dd")
            : "";
          api_input.from_date = formattedFromDate;
          api_input.to_date = formattedToDate;
          break;

        case "last_7_days":
          api_input.keyword = "last_7_days";
          break;

        case "last_30_days":
          api_input.keyword = "last_30_days";
          break;

        case "last_year":
          api_input.keyword = "last_year";
          break;

        default:
          console.error("Unsupported filterType:", filterType);
          return;
      }

      const response = await fetchExportHistory(api_input)
      console.log(response, "response123");
      const response_data = response.data.results.data;
      const csv_data = response_data;
      exportToCsv(csv_data, "broadcast_history");
    } catch (error) {
      triggerAlert("error", "", "Couldn't download data");
    }
  }

  const handleSingleDownload = async (id) => {
    try {
      const response = await singleDownload({ schedule_id: id })
      const response_data = response.data.data;
      const csv_data = response_data;
      exportToCsv(csv_data, "broadcast_history_single");
    } catch (error) {
      triggerAlert("error", "", "Couldn't download data");
    }
  }

  useEffect(() => {
    fetchData(filterType);
    fetchDataList(filterType, currentPage + 1)
  }, [filterType, currentPage]);

  return (
    <>
      <div>
        <div className="position-relative"></div>
        <div id="content-page" className="content-page">
          <div className="container">
            <PageTitle heading="Broadcast History" onPrimaryClick={() => {
              // navigate('/whatsapp/broadcast/schedule_broadcast')
            }} />
            {isLoading ? (
              <div className='loader-overlay text-white'>
                <Loader />
              </div>
            ) : null
            }
            <div className="row">
              <div className="col-sm-12">
                <div className="card p-3">
                  <h5 className="mb-3 mt-3">Date range filter</h5>
                  <form
                    className="mx-auto w-100 fv-plugins-bootstrap5 fv-plugins-framework ng-pristine ng-valid"
                    id=""
                  >
                    <div className="row mb-3">
                      <div className="col-lg-6">
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label htmlFor="fromDate" className="form-label">From</label>
                            <i
                              className="mdi mdi-calendar"
                              style={{
                                position: "absolute",
                                top: "50%",
                                right: "20px", // Adjust this value as needed
                                transform: "translateY(-2%)",
                                zIndex: "1",
                                fontSize: "24px",
                                cursor: "pointer",
                                color: "#6c757d", // Optional: set a color for visibility
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
                              <div style={{ color: 'red', fontSize: '14px', marginTop: '5px', position: 'absolute', bottom: '-25px' }}>
                                {errors.period_start.message}
                              </div>
                            )}
                          </div>

                          <div className="col-md-6 mb-3">
                            <label htmlFor="toDate" className="form-label">To</label>
                            <i
                              className="mdi mdi-calendar"
                              style={{
                                position: "absolute",
                                top: "50%",
                                right: "20px", // Adjust this value as needed
                                transform: "translateY(-2%)",
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
                                  className="px-3 form-control"
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
                              <div style={{ color: 'red', fontSize: '14px', marginTop: '5px', position: 'absolute', bottom: '-25px' }}>
                                {errors.period_end.message}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="d-flex justify-content-start gap-2 mt-9">
                          <button type="button" className="btn btn-warning rounded-pill mb-3 me-1" onClick={handleSearch}>Search</button>
                          {broadcasts?.length > 0 && (
                            <button type="button" className="btn btn-info rounded-pill mb-3 me-1" onClick={() => downloadCsv()}>Export</button>
                          )}
                          <button type="button" className="btn btn-light rounded-pill mb-3 me-1" onClick={() => handleChange("last_7_days")}>Last 7 days</button>
                          <button type="button" className="btn btn-light rounded-pill mb-3 me-1" onClick={() => handleChange("last_30_days")}>Last 30 days</button>
                          <button type="button" className="btn btn-success rounded-pill mb-3 me-1" onClick={() => handleChange("last_year")}>This year</button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col">
                <div className="card">
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-center">
                      <div className="border rounded bg-soft-warning avatar-55 d-flex align-items-center justify-content-center">
                        <img src="/assets/images/icon/sent.png" className="img-fluid rounded" alt="Sent" loading="lazy" style={{ width: "41px" }} />
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <h3 style={{ color: "#FF9800" }}>{broadcastData.sent}</h3>
                      <p className="mb-0">Sent</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col">
                <div className="card">
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-center">
                      <div className="border rounded bg-soft-warning avatar-55 d-flex align-items-center justify-content-center">
                        <img src="/assets/images/icon/read.png" className="img-fluid rounded" alt="Read" loading="lazy" style={{ width: "40px" }} />
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <h3 style={{ color: "#FF9800" }}>{broadcastData.message_read}</h3>
                      <p className="mb-0">Read</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col">
                <div className="card">
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-center">
                      <div className="border rounded bg-soft-warning avatar-55 d-flex align-items-center justify-content-center">
                        <img src="/assets/images/icon/delivered.png" className="img-fluid rounded" alt="Delivered" loading="lazy" style={{ width: "40px" }} />
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <h3 style={{ color: "#FF9800" }}>{broadcastData.delivered}</h3>
                      <p className="mb-0">Delivered</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col">
                <div className="card">
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-center">
                      <div className="border rounded bg-soft-warning avatar-55 d-flex align-items-center justify-content-center">
                        <img src="/assets/images/icon/failed.png" className="img-fluid rounded" alt="Failed" loading="lazy" style={{ width: "40px" }} />
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <h3 style={{ color: "#FF9800" }}>{broadcastData.failed}</h3>
                      <p className="mb-0">Failed</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col">
                <div className="card">
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-center">
                      <div className="border rounded bg-soft-warning avatar-55 d-flex align-items-center justify-content-center">
                        <img src="/assets/images/icon/scheduled.png" className="img-fluid rounded" alt="Scheduled" loading="lazy" style={{ width: "40px" }} />
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <h3 style={{ color: "#FF9800" }}>{broadcastData.scheduled}</h3>
                      <p className="mb-0">Scheduled</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row mb-5">
              <div className="col-sm-12">
                <div className="card">
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-bordered hover" cellSpacing="0" width="100%">
                        <thead className="text-nowrap">
                          <tr>
                            <th>Broadcast Names</th>
                            <th>Broadcast Type</th>
                            <th>Scheduled</th>
                            <th>Successful</th>
                            <th>Read</th>
                            <th>Recipients</th>
                            <th>Delivered</th>
                            <th>Failed</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {broadcasts?.length > 0 ? (
                            broadcasts?.map((broadcast, index) => (
                              <tr key={index}>
                                <td>{broadcast.scheduled_id__temp_name}</td>
                                <td>{broadcast.message_type}</td>
                                <td>{new Date(broadcast.scheduled_id__scheduled_date).toLocaleString()}</td>
                                <td>{broadcast.sent_msg_count}</td>
                                <td>{broadcast.read_msg_count}</td>
                                <td>
                                  <span
                                    className="badge badge-circle2 p-6"
                                    title="View Recipients"
                                    onClick={() => handleShowModal(broadcast.scheduled_id__phone_numbers)}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    {broadcast.total_counts}
                                  </span>
                                </td>
                                <td>{broadcast.delivered_msg_count}</td>
                                <td>{broadcast.failed_msg_count}</td>
                                <td>{broadcast.scheduled_id__status === 0 ? 'Completed' : 'Pending'}</td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <a href="#">
                                      <span className="badge badge-circle2 text-info p-6 me-2" title="View Template" data-bs-toggle="modal" data-bs-target="#exampleModalCenter-view">
                                        <span className="material-symbols-outlined fs-4">remove_red_eye</span>
                                      </span>
                                    </a>
                                    <a href="#">
                                      <span
                                        className="material-symbols-outlined fs-4"
                                        onClick={() => handleSingleDownload(broadcast.scheduled_id__id)}
                                      >
                                        file_download
                                      </span>
                                    </a>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="10" className="text-center">No broadcast data available</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                      <PaginationComponent {...pgntn_props} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal for displaying phone numbers */}
              <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                  <Modal.Title>Recipients</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  {selectedPhoneNumbers?.length > 0 ? (
                    <ul>
                      {selectedPhoneNumbers.map((phone, index) => (
                        <li key={index}>{phone}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No phone numbers available</p>
                  )}
                </Modal.Body>
              </Modal>

              {/* Modal for view template */}
              <div className="modal fade" id="exampleModalCenter-view" tabIndex="-1" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" role="document">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title" id="exampleModalCenterTitle">View Template</h5>
                      <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close">
                      </button>
                    </div>
                    <div className="modal-body p-5">
                      <div className="card-body bg-light-modal border p-4">
                        <div className="d-flex flex-column justify-content-between">
                          <h6 className="mb-1 fw-500">Testing Template</h6>
                          <p className="mb-1">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</p>
                          <span className="previewFooter_send">Not interested? Tap Stop promotions</span>
                        </div>
                        <hr />
                        <div className="d-flex flex-column justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            <i className="fa fa-reply me-2" aria-hidden="true"></i>
                            <span>Welcome to Sales</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default TelagramHistory;
