import React, { useEffect, useRef, useState } from 'react'
import PageTitle from '../../../common/PageTitle'
import { useForm } from 'react-hook-form';
import { fetchAllMynumbers, fetchNumberChatHistory, makePrimary, downloadingCsv, AddMyNumbers, exportToCsv, workspaceDetails } from '../../../utils/ApiClient';
import { formatDateTime, formatTimeToAmandPM, getBase64, triggerAlert, truncateName } from '../../../utils/CommonFunctions';
import SpinnerLoader from '../../../common/components/SpinnerLoader';
import InfiniteScrollWrapper from '../../../common/components/InfinityScrollWrapper';
import { useNavigate } from "react-router-dom";

import { MinLengthValidation, MaxLengthValidation } from '../../../utils/Constants'
import Modal from 'react-bootstrap/Modal';
import LazyLoadImage from '../../../common/components/LazyLoadImage';
import { useSocket } from '../../../SocketContext';
import CountryCodeSelector from '../../../common/components/CountryCode';

export default function MyNumber() {

    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);
    const [numberList, setNumberList] = useState([]);
    const [userChatHistory, setUserChatHistory] = useState([]);
    const [activeUserNum, setActiveUserNum] = useState(null); // To track the active chat
    const [primaryID, setPrimaryID] = useState(null);
    const [uploadType, setUploadType] = useState('single');
    const [erroradd, setErroradd] = useState({});
    const [page, setPage] = useState(1); // To track the active chat
    const [addFile, setAddFile] = useState({}); // To track the active chat
    const [totalPages, setTotalPages] = useState(0);
    const [isFormVisible, setFormVisible] = useState(false); // State to show/hide form
    const [addShow, setAddShow] = useState(false);
    const [totalNumberPages, setTotalNumberPages] = useState(0);
    const [pageNumber, setPageNumber] = useState(0); // To track the active chat
    const [hideButton, setHideButton] = useState(true)
    const [messageError, setMessageError] = useState("")
    ///////////////////////// Basic form /////////////////////////////////////////
    const { register, handleSubmit, formState: { errors }, setValue, reset, control, clearErrors, getValues, setError, watch } = useForm({
        mode: "onChange",
        defaultValues: {
            number: '',
            base_64_file: null,
        },
    });

    ///////////// Get all my numbers /////////////
    const fetchAllMynumber = async (pageNumber, searchkey = '') => {

        setIsLoading(true);
        if (pageNumber) setPageNumber(pageNumber);
        if (!searchkey) {
            setIsLoading(true);

        } else {
            setIsLoading(false);

        }
        try {
            const params = {
                page: pageNumber,
                page_size: 10,
                keyword: searchkey

            }
            const response = await fetchAllMynumbers(params);
            const response_data = response.data;
            if (response_data.error_code === 200) {

                const items = response_data.results.data;
                const total_pages = response_data.results.pagination.total_pages;
                setTotalNumberPages(total_pages);
                setIsLoading(false);
                // const sortedNumberHistory = [...items].reverse();

                const sortedNumberHistory = [...items].reverse();
                if (pageNumber === 1) {
                    setNumberList(sortedNumberHistory);
                }
                return sortedNumberHistory;
            }
            else {
                setIsLoading(false);
                // triggerAlert('error', 'Oops...', 'Recharge was unsuccessful');
            }
        } catch (error) {
            const response_data = error?.response?.data
            setIsLoading(false);
            triggerAlert('error', 'Oops...', response_data ? response_data.message : "Something went wrong!");
        }
    }

    /////////////////////////left sidebar functions///////////////////////////////////////
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [hasMoreNumber, setHasMoreNumber] = useState(true);
    const [loadingMoreNumber, setLoadingMoreNumber] = useState(false);

    useEffect(() => {
        fetchAllMynumber(1);
    }, []);

    /////Add Number //////////
    const handleTypeChange = (e) => {
        setUploadType(e.target.value);
        setErroradd({});
    };

    ////////////////////////// right sidebar functions ///////////////////////////////
    const fetchMynumberUserChatHistory = async (page, selectedNumber, id) => {

        setIsLoading(true);
        if (selectedNumber) setActiveUserNum(selectedNumber)
        if (id) setPrimaryID(id)
        try {
            const params = {
                page: page,
                page_size: 20,
                number: selectedNumber
            };

            const response = await fetchNumberChatHistory(params);
            const response_data = response.data;

            if (response_data.error_code === 200) {

                const items = response_data.results.data;
                const total_pages = response_data.results.pagination.total_pages;
                setTotalPages(total_pages);
                setIsLoading(false);
                const sortedChatHistory = [...items].reverse();
                if (page === 1) {
                    setUserChatHistory(sortedChatHistory);
                }
                return sortedChatHistory;
            } else {
                setIsLoading(false);
                setUserChatHistory([]);
                return []; // Return an empty array on error
            }
        } catch (error) {
            const response_data = error?.response?.data;
            console.log("first", error)
            setIsLoading(false);
            setUserChatHistory([]);
            triggerAlert('error', 'Oops..', response_data ? response_data.message : "Something went wrong!");
            return []; // Return an empty array on exception
        }
    }

    const formReset = () => {
        reset();
        setValue('base_64_file', null);
        setValue('number', null);
        setValue('addFile', null);
    }

    const handleFilechange = async (e) => {
        const file = e.target.files[0];
        let items = {};

        if (!file) return;

        // Check if the file is a PDF
        if (file.type === "application/pdf") {
            setError('base_64_file', {
                type: 'manual',
                message: "PDF files are not allowed.",
            });
            e.target.value = ''; // Clear the input
            setAddFile(items); // Set error state
            return;
        }

        // Check if the file size exceeds 2MB
        if (file.size > 2 * 1024 * 1024) {
            setError('base_64_file', {
                type: 'manual',
                message: "File size should not exceed 2MB.",
            });
            e.target.value = ''; // Clear the input
            setAddFile(items); // Set error state
            return;
        }

        try {
            clearErrors('base_64_file')
            // Convert file to base64
            const base64 = await getBase64(file);
            items = {
                ...items,
                file_name: file.name,
                file_type: file?.name?.split(".")[1],
                file_size: file.size,
                file: base64,
            };
            //console.log(items);
            setAddFile(items);
        } catch (error) {
            // console.error("Error converting file to base64:", error);
            items.error = "Failed to process the file.";
            setAddFile(items);
        }
    }

    const AddMyNumber = async (data) => {

        const params = data;

        setIsLoading(true);
        try {
            if (data.type == 'bulk') {
                const base_64_files = addFile;

                const files = base_64_files.file;
                const base_64_file = files.split(',')[1];
                params.base_64_file = base_64_file;
            }

            // console.log('params', params);
            // return
            const response = await AddMyNumbers(params);
            const response_data = response.data;
            //console.log('response', response);
            //console.log('error_code', response_data.error_code);

            if (response_data.error_code == 201) {
                const message = response_data.message;
                setAddShow(false);
                setIsLoading(false);
                formReset();
                fetchAllMynumber(1);
                triggerAlert('success', 'success', 'Number Added Successfully!!');
            } else if (response_data.error_code == 400) {

                setIsLoading(false);
                triggerAlert("error", "Oops...", "Something went wrong..");
            } else {

                setIsLoading(false);
                //console.log("response_data.error_code11")
                triggerAlert("error", "Oops...", "Something went wrong..");
            }
        } catch (error) {

            setIsLoading(false);
            //console.log("response_data.error_code22")
            triggerAlert("error", "Oops...", "Something went wrong..");
            handleAddClose();
        }

    };

    const handlePrimaryClick = async () => {
        setIsLoading(true);

        if (!primaryID) {
            triggerAlert('info', '', 'Please select a Number');
            return;
        }
        else {
            try {
                const params = {
                    id: primaryID
                };

                const response = await makePrimary(params);
                const response_data = response.data;
                //console.log('params', response);

                if (response_data.error_code === 200) {

                    setIsLoading(false);
                    triggerAlert('success', 'success', `${activeUserNum} Number has been changed as Primary`);
                } else {
                    setIsLoading(false);
                    return []; // Return an empty array on error
                }
            } catch (error) {
                const response_data = error?.response?.data;
                setIsLoading(false);
                setUserChatHistory([]);
                triggerAlert('error', 'Oops...', response_data ? response_data.message : "Something went wrong!");
                return []; // Return an empty array on exception
            }
        }

        setFormVisible(true); // Show the form for editing

    };

    const fetchMoreData = async () => {
        try {
            // Wait for the data from the next page
            const nextPageNumber = page + 1;
            const nextPageData = await fetchMynumberUserChatHistory(nextPageNumber, activeUserNum, primaryID);
            if (Array.isArray(nextPageData)) {
                // Append the new data to the existing chat history
                setUserChatHistory(prevChatHistory => [...nextPageData, ...prevChatHistory]);
                // Increment the page number
                setPage(nextPageNumber);
            } else {
                console.error('The fetched data is not an array:', nextPageData);
                // Handle the case where the data is not an array                
            }
        } catch (error) {
            console.error('Failed to fetch more data:', error);
        }
    };

    const fetchMoreNumber = async () => {
        try {
            // Fetch data for the next page
            const nextPageNumber = pageNumber + 1;
            const nextPageNumberData = await fetchAllMynumber(nextPageNumber);

            // Check if the returned data is an array
            if (Array.isArray(nextPageNumberData)) {
                // Append the new data to the existing number list
                setNumberList(prevNumberList => [...prevNumberList, ...nextPageNumberData]);

                // Increment the page number only after successful fetch
                setPageNumber(nextPageNumber);
            } else {
                console.error('The fetched data is not an array:', nextPageNumberData);
                // Handle the case where the data is not an array
            }

        } catch (error) {
            console.error('Failed to fetch more data:', error);
        }
    };

    const handleFetchMoreData = async () => {
        if (page < totalPages) {
            setLoadingMore(true);
            await fetchMoreData(page + 1); // Fetch more data for the next page
            setLoadingMore(false);
            // Check if the next page will be the last
            if (page + 1 >= totalPages) {
                setHasMore(false); // No more pages to load
            }
        } else {
            setHasMore(false); // No more pages to load
        }
    };

    const handleFetchMoreNumber = async () => {

        if (pageNumber < totalNumberPages) {



            setLoadingMoreNumber(true);
            await fetchMoreNumber(); // Fetch more data for the next page
            setLoadingMoreNumber(false);

            // Check if the next page will be the last
            if (pageNumber + 1 >= totalNumberPages) {
                setHasMoreNumber(false); // No more pages to load
            }
        } else {
            //console.log('else');
            // alert('No more pages to load');
            setHasMoreNumber(false); // No more pages to load
        }
    };

    const downloadCsv = async () => {
        // setIsLoading(true);
        if (!activeUserNum) {
            triggerAlert('info', '', 'Please select a Number');
            return;
        }
        else {

            try {
                const params = {
                    selected_number: activeUserNum
                };

                const response = await downloadingCsv(params);
                const response_data = response.data;

                const response_data_result = response_data.error_code;
                //console.log('response_data_result', response_data_result);

                if (response_data.error_code === 200) {

                    const csv_data = response_data.results.data;

                    exportToCsv(csv_data, "mynumber_history");
                    setIsLoading(false);
                    triggerAlert('success', 'success', 'downloaded successfully');
                } else if (response.status === 204) {
                    triggerAlert('info', '', 'No data to download');
                } else {
                    setIsLoading(false);
                    return []; // Return an empty array on error
                }
            } catch (error) {
                const response_data = error?.response?.data;
                setIsLoading(false);
                setUserChatHistory([]);
                triggerAlert('error', 'Oops...', response_data ? response_data.message : "Something went wrong!");
                return []; // Return an empty array on exception
            }
        }
    };
    const handleAddClose = () => {
        setAddShow(false);
        formReset();

    }
    const [searchQuery, setSearchQuery] = useState("");
    const handleKeySearch = (e) => {
        setSearchQuery(e.target.value);
        const searchkey = e.target.value;
        setPageNumber(1);
        fetchAllMynumber(1, searchkey); // Update search results on every change
    };

    const handleAddShow = () => setAddShow(true);

    const Downloadhistory = (
        <>
            {numberList?.length > 0 && (
                <button
                    type="button"
                    className="btn btn-info btn-rounded waves-effect waves-light me-2"
                    onClick={() => downloadCsv()}
                >
                    Download
                </button>
            )}

        </>
    );

    //////////////////////////////////// Receiving socket /////////////////////////////
    const { socket } = useSocket();

    useEffect(() => {
        if (!socket) return;

        if (!activeUserNum) return; // Ensure both selectedNumber and activeUserNum are not null or undefined

        // Set up event listener for receiving chat messages
        socket.on('send_message', (newData) => {
            if (newData.dst == activeUserNum) {
                fetchMynumberUserChatHistory(1, activeUserNum, primaryID);
            }
        });

        // Clean up on unmount
        return () => {
            socket.off('send_message');
        };

    }, [socket, activeUserNum]);
    const handleBulkSendButton = async () => {
        try {
            const workId = JSON.parse(localStorage.getItem("workspace_id"))
            const response = await workspaceDetails(workId)
            const data = response.data.results
            const filteredData = data.filter((item) => item.plan_type === "sms")
            if (filteredData.length === 0) {
                setHideButton(false)
                setMessageError("Note: No sms plan is available.")
            }
            else if (filteredData[0].plan_expire === 'Expired') {
                setHideButton(false)
                setMessageError("Note: Your plan has been expired")
            }
            else {
                setHideButton(true)
                setMessageError("")
            }

        }
        catch (error) {
            console.log(error)
        }

    }
    useEffect(() => {
        handleBulkSendButton()
    }, [])


    return (
        <main className="main-content mt-3 mb-4">

            <div className="container content-inner" id="page_layout">

                <PageTitle
                    heading="My Number"
                    otherElements={Downloadhistory}
                    showWarningButton={"Create"}
                    onWarningClick={handleAddShow}
                    showPrimaryButton="Order New"
                    numberButtonHide={!hideButton}
                    onPrimaryClick={() => {
                        navigate('/sms/order_numbers')
                    }}

                />
                {hideButton && messageError ? "" : <p className='text-danger' style={{ fontWeight: 500 }}>{messageError}</p>}

                <div className="row w-100">
                    <div className="col-md-3">
                        <aside className="sidebar-chat sidebar-base border-end shadow-none rounded-2" data-sidebar="responsive">
                            <div className="chat-search pt-3 px-3">
                                {numberList.length > 0 && ( // Only render the search bar if there is data
                                    <div className="chat-searchbar mt-4 mb-2 d-flex">
                                        <div className="form-group chat-search-data m-0">
                                            <input
                                                type="text"
                                                className="form-control round"
                                                id="chat-search"
                                                placeholder="Search"
                                                value={searchQuery}
                                                onChange={handleKeySearch}
                                            />
                                            <i className="material-symbols-outlined">search</i>
                                        </div>
                                        <div className="chat-header-icons d-inline-flex ms-auto">
                                            <div className="dropdown d-flex align-items-center justify-content-center dropdown-custom">
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
                                                    <a className="dropdown-item d-flex align-items-center" href="#" onClick={handlePrimaryClick}>
                                                        <i className="material-symbols-outlined md-18 me-1">add_circle</i>Make Primary
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="sidebar-body pt-0 data-scrollbar chat-scrollbar pb-5 pe-2" id="scrollableDivNumber"
                                style={{
                                    // height: '500px',
                                    overflow: 'auto', display: 'flex', flexDirection: 'column'
                                }}>
                                {/* <!-- Sidebar Menu Start --> */}
                                <div>
                                    <ul className="nav navbar-nav iq-main-menu" id="sidebar-menu" role="tablist">
                                        <InfiniteScrollWrapper
                                            dataLength={numberList.length}
                                            next={handleFetchMoreNumber}
                                            hasMore={hasMoreNumber} // Stop loading more data when false
                                            inverse={false} // This ensures the scroll direction is "down"
                                            scrollableTarget="scrollableDivNumber"
                                        >
                                            {numberList.length > 0 ? (
                                                numberList.map((itemnum, index) => (
                                                    <React.Fragment key={itemnum.id}>
                                                        <li className={`nav-item iq-chat-list ${activeUserNum == itemnum.requested_no ? 'active' : ''}`} onClick={() => fetchMynumberUserChatHistory(1, itemnum.requested_no, itemnum.id)}>
                                                            <a href={`#user-content-${activeUserNum}`} className={`nav-link d-flex gap-1 ${activeUserNum == itemnum.requested_no ? 'active' : ''}`} data-bs-toggle="tab" role="tab" aria-controls={`#user-content-${activeUserNum}`} aria-selected="true">
                                                                <div className="position-relative">
                                                                    <span className="badge badge-pill btn btn-soft-danger font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2">
                                                                        U</span>
                                                                </div>
                                                                <div className="d-flex align-items-center w-100 iq-userlist-data">
                                                                    <div className="d-flex flex-grow-1 flex-column">
                                                                        <div className="d-flex align-items-center gap-1">
                                                                            <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">{itemnum.requested_no ? itemnum.requested_no : '-'}</p>
                                                                        </div>
                                                                        <div className="d-flex align-items-center gap-2">
                                                                            <small className="text-ellipsis short-1 flex-grow-1 chat-small">{itemnum.status ? itemnum.status : '-'}</small>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </a>
                                                        </li>
                                                    </React.Fragment>
                                                ))
                                            ) : (
                                                <div className='d-flex justify-content-center flex-column align-items-center'>
                                                    {/* <LazyLoadImage src='/assets/images/Inbox.jpg' alt='mynumber' /> */}
                                                    <p className='text-center'>No contact found!</p>
                                                </div>
                                            )}
                                            {loadingMoreNumber && <h4 className='text-center text-danger'><SpinnerLoader /></h4>}
                                        </InfiniteScrollWrapper>
                                    </ul>
                                </div>
                                {/* <!-- Sidebar Menu End --> */}
                            </div>
                        </aside>
                    </div>
                    <div className="col-md-9">
                        <div className="tab-content" id="myTabContent">
                            <div className="card tab-pane mb-0 fade show active" id={`user-content-${activeUserNum}`} role="tabpanel">
                                {userChatHistory.length > 0 ?

                                    <>
                                        <div className="chat-head">
                                            <header className="d-flex justify-content-between align-items-center bg-white pt-3 ps-3 pe-3 pb-3 border-bottom rounded-top">
                                                <div className="d-flex align-items-center">
                                                    <div className="position-relative">
                                                        <span className="badge badge-pill btn btn-soft-danger font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2">U</span>
                                                    </div>
                                                    <div className="d-flex align-items-center w-100 iq-userlist-data">
                                                        <div className="d-flex flex-grow-1 flex-column">
                                                            <div className="d-flex align-items-center h-19">
                                                                <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">{activeUserNum ? activeUserNum : '-'}</p>
                                                            </div>
                                                            <div className="d-flex align-items-center gap-2">
                                                                <small className="text-ellipsis short-1 flex-grow-1 chat-small">{activeUserNum ? activeUserNum : '-'}</small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </header>
                                        </div>
                                        <div className="card-body chat-body bg-body chat-contacts">

                                            <div
                                                id="scrollableDiv"
                                                style={{
                                                    // height: '500px',
                                                    overflow: 'auto', display: 'flex', flexDirection: 'column-reverse'
                                                }} // column-reverse to start at the bottom
                                            >

                                                <InfiniteScrollWrapper
                                                    dataLength={userChatHistory.length}
                                                    next={handleFetchMoreData}
                                                    hasMore={hasMore} // Stop loading more data when false
                                                    inverse={true} // This ensures the scroll direction is "up"
                                                    scrollableTarget="scrollableDiv"
                                                >
                                                    {loadingMore && <h4 className='text-center text-danger'><SpinnerLoader /></h4>}
                                                    {userChatHistory.map((item, index) => {
                                                        // Format the date of the current message
                                                        const messageDate = formatDateTime(item.create_date, 'mm-dd-yyyy');
                                                        // Get the date of the previous message (or null if it's the first message)
                                                        const prevMessageDate = index > 0 ? formatDateTime(userChatHistory[index - 1].create_date, 'mm-dd-yyyy') : null;
                                                        return (

                                                            <React.Fragment key={item.id}>
                                                                {(index === 0 || messageDate !== prevMessageDate) && (
                                                                    <div className="chat-day-title">
                                                                        <span className="main-title">{messageDate}</span>
                                                                    </div>
                                                                )}
                                                                {item.directions == 'IN' ?
                                                                    <div className="iq-message-body iq-other-user gap-0">
                                                                        <div className="chat-profile">
                                                                            <span className="badge badge-pill bg-soft-info font-weight-normal ms-auto me-2 badge-45 md-14 rounded-circle p-2 "><span className="material-symbols-outlined">person_outline</span></span>
                                                                        </div>

                                                                        <div className="iq-chat-text">
                                                                            <div className="d-flex align-items-center justify-content-start">
                                                                                <div className="iq-chating-content ">
                                                                                    <div className="d-flex align-items-center gap-1">
                                                                                        <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-chat text-info">{item.src ? item.src : null}</p>
                                                                                        <div className="chat-lft p-1">

                                                                                        </div>
                                                                                    </div>
                                                                                    <p className="mr-2 mb-3">{item.message ? item.message : null}
                                                                                    </p>
                                                                                    {/* Conditionally Render Ash-Colored Div for SMS */}
                                                                                    {/* {item.message_type === 'MMS' && (
                                                                                    <div className="ash-colored-div d-flex justify-content-between" style={{ backgroundColor: '#cde1d2', padding: '10px', marginTop: '10px', borderRadius: '5px' }}>
                                                                                        <p className='mb-0'>{extractFileName(item.attachment)}</p>
                                                                                        <span className="download-icon" onClick={() => handleDownload(item.attachment)} type="button">
                                                                                            <span className="material-symbols-outlined">download</span>
                                                                                        </span>
                                                                                    </div>
                                                                                )}
                                                                                 */}
                                                                                    <div className="position-relative">
                                                                                        <div className="chat-time-left pb-1">
                                                                                            <small className="text-capitalize">{item.create_date ? formatTimeToAmandPM(item.create_date) : '-'}</small>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    :
                                                                    <div className="iq-message-body iq-current-user">
                                                                        <div className="iq-chat-text">
                                                                            <div className="d-flex align-items-center justify-content-end">
                                                                                <div className="iq-chating-content ">
                                                                                    <div className="d-flex align-items-center gap-1">
                                                                                        <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-chat text-secondary">You</p>
                                                                                        <div className="chat-right ">

                                                                                        </div>
                                                                                    </div>

                                                                                    <p className="mr-2 mb-1 px-1">{item.message ? item.message : null}
                                                                                    </p>
                                                                                    {/* {item.message_type === 'MMS' && (
                                                                                    <div className="ash-colored-div d-flex justify-content-between" style={{ backgroundColor: '#cde1d2', padding: '10px', marginTop: '10px', borderRadius: '5px' }}>
                                                                                        <p className='mb-0'>{extractFileName(item.attachment)}</p>
                                                                                        <span className="download-icon" onClick={() => handleDownload(item.attachment)} type="button">
                                                                                            <span className="material-symbols-outlined">download</span>
                                                                                        </span>
                                                                                    </div>
                                                                                )}
                                                                                */}
                                                                                    <div className="d-flex justify-content-end">
                                                                                        <div style={{ width: "49px" }}>
                                                                                            <small className="text-capitalize">{item.create_date ? formatTimeToAmandPM(item.create_date) : '-'}</small>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                }
                                                            </React.Fragment>
                                                        )
                                                    })}
                                                </InfiniteScrollWrapper>
                                            </div>

                                        </div>
                                        {/* <div className="card-footer px-3 py-3 border-top rounded-0">

                                        </div> */}
                                    </>

                                    :
                                    <div className="card-body chat-body inbox-body bg-body">
                                        <div className='d-flex justify-content-center flex-column align-items-center'>
                                            <LazyLoadImage src='/assets/images/Inbox.jpg' alt='mynumber' />
                                            <p className='text-center'>Please select any one Number and view</p>
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Add number react modal start*/}
            <Modal show={addShow} onHide={handleAddClose} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>Add Number</Modal.Title>
                </Modal.Header>
                <form id="creditCardForm"
                    className="g-3 fv-plugins-bootstrap5 fv-plugins-framework fv-plugins-icon-container"
                    onsubmit="return false" novalidate="novalidate" onSubmit={handleSubmit(AddMyNumber)}>
                    <Modal.Body>
                        <div className="row">

                            <div className="form-group">
                                <label className="d-flex align-items-center fs-6 fw-semibold form-label mb-2">
                                    <span className="required">Type<span className="text-danger">*</span></span>
                                </label>
                                <select className="form-select" id="exampleFormControlSelect1" name="type"
                                    {...register("type", {
                                        required: "Type is required",
                                    })}
                                    autoComplete="off" value={uploadType} onChange={handleTypeChange}>
                                    <option value="single">Single Upload</option>
                                    <option value="bulk">Bulk Upload</option>
                                </select>
                            </div>

                            {uploadType === 'single' && (
                                <div className="form-group">
                                    <label className="d-flex align-items-center fs-6 fw-semibold form-label mb-2">
                                        <span className="required">Enter your number <span className="text-danger">*</span></span>
                                    </label>
                                    {/* <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter Phone Number"
                                        id="number"
                                        {...register("number", {
                                            required: "Phone number is required",
                                            pattern: {
                                                value: /^[0-9]+$/,
                                                message: 'Please enter a valid phone number',
                                            },
                                            maxLength: MaxLengthValidation(15),
                                            minLength: MinLengthValidation(10)
                                        })}
                                    /> */}

                                    <CountryCodeSelector
                                        control={control}
                                        name="number"
                                        containerClass="custom-iti-class"
                                        rules={{
                                            required: 'Phone number is required',
                                            maxLength: MaxLengthValidation(15),
                                            minLength: MinLengthValidation(10),
                                            pattern: {
                                                value: /^[0-9\s\-+()]*$/,
                                                message: 'Please enter a valid phone number',
                                            }
                                        }}
                                    />
                                    {/* {errors.contact_number && (
            <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                {errors.contact_number.message}
            </div>
        )} */}
                                </div>
                            )}

                            {uploadType === 'bulk' && (
                                <>
                                    <div className="mb-4">
                                        <p className="mb-2"><b>Please use the below given sample file format for the upload.</b></p>
                                        <a href="https://customer.vitelsms.com/assets/plugins/docs/Sample_Doc.csv" target="_blank" className="btn btn-sm btn-soft-success">
                                            <span className="svg-icon svg-icon-3">
                                                {/* SVG Icon */}
                                            </span>
                                            Sample.csv
                                        </a>
                                    </div>

                                    <div className="form-group">
                                        <label className="d-flex align-items-center fs-6 fw-semibold form-label mb-2">
                                            <span className="required">Upload File <span className="text-danger">*</span></span>
                                        </label>

                                        <input
                                            type="file"
                                            name="addFile"
                                            id="formFile"
                                            className="form-control"
                                            {...register("addFile", { required: "Upload CSV is required", })}
                                            onChange={handleFilechange}
                                        />
                                        {errors.addFile && (
                                            <div
                                                style={{
                                                    color: "red",
                                                    fontSize: "14px",
                                                    marginTop: "5px",
                                                }}
                                            >
                                                {errors.addFile.message}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* <input type='hidden' value='Active' name='status' {...register('status')} /> */}
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button type="submit" className="btn btn-primary" disabled={isLoading}>
                            {isLoading ? "Submitting..." : "Submit"}
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>
            {/* Add number react modal end*/}
        </main>
    )
}
