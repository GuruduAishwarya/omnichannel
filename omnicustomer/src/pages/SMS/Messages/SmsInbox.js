import React, { useEffect, useRef, useState } from 'react'
import PageTitle from '../../../common/PageTitle'
import { useForm, Controller } from 'react-hook-form';
import { fetchCompanyContactList, fetchSMSContactList, fetchSMSUserChatHistory, sendSMSOrMMS, updateMessageSeenStatus,workspaceDetails } from '../../../utils/ApiClient';
import { downloadFile, extractFileName, formatDateTime, formatTimeToAmandPM, getBase64, sendNotification, triggerAlert, truncateName, getInitials } from '../../../utils/CommonFunctions';
import SpinnerLoader from '../../../common/components/SpinnerLoader';
import InfiniteScrollWrapper from '../../../common/components/InfinityScrollWrapper';
import LazyLoadImage from '../../../common/components/LazyLoadImage';
import { useSocket } from '../../../SocketContext';
import Emojis from '../../../common/components/Emojis';

export default function SmsInbox({ type }) {
    const heading = type === "IN" ? "Inbox" : type === "OUT" ? "Sent Items" : "History";

    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingContacts, setIsLoadingContacts] = useState(false);
    const [selectedNumber, setSelectedNumber] = useState("");
    const [companyContactList, setCompanyContactList] = useState([]);
    const [contactList, setContactList] = useState([]);
    const [userChatHistory, setUserChatHistory] = useState([]);
    const [activeUserNum, setActiveUserNum] = useState(null); // To track the active chat
    const [activeUserName, setActiveUserName] = useState(null); // To track the active chat
    const [mmsFile, setMMSFile] = useState({}); // To track the active chat
    const [page, setPage] = useState(1); // To track the active chat
    const [totalPages, setTotalPages] = useState(0); // To track the active chat
    const [unseenCounts, setUnseenCounts] = useState({});
    const [pageNumber, setPageNumber] = useState(1); // To track the active chat
    const pageSize = 10;
    const [showEmojis, setShowEmojis] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [hasMoreContacts, setHasMoreContacts] = useState(true);
    const contactsContainerRef = useRef(null);
    const [loadingMoreContacts, setLoadingMoreContacts] = useState(false);
    const [totalNumberPages, setTotalNumberPages] = useState(0);
    const scrollableDivRef = useRef(null);
    const [hideButton, setHideButton] = useState(true)
    const [messageError, setMessageError] = useState("")
    ///////////////////////// Basic form /////////////////////////////////////////
    const { register, handleSubmit, formState: { errors }, setValue, reset, control, getValues, watch } = useForm();
    const { register: registerIn, handleSubmit: handleSubmitIn, formState: { errors: errorsIn }, setValue: setValueIn, reset: resetIn, control: controlIn, getValues: getValuesIn, watch: watchIn, setError: setErrorIn, clearErrors: clearErrorsIn } = useForm();
    const formResetIn = () => {
        resetIn();
        setMMSFile({});
        setShowEmojis(false)
    }

    const messageType = watchIn('msg_type', 'SMS'); // Default to 'sms'

    const handleDefaultStage = () => {
        setSelectedNumber("");
        setContactList([]);
        setUserChatHistory([]);
        setActiveUserNum(null);
        setMMSFile({});
        setPage(1);
        setTotalPages(0);
        setUnseenCounts({});
    }

          const handleBulkSendButton = async () => {
            try {
              const workId = JSON.parse(localStorage.getItem("workspace_id"))
              const response = await workspaceDetails(workId)
              const data = response.data.results
              const filteredData = data.filter((item) => item.plan_type === "sms")
              if (filteredData.length === 0) {
                setHideButton(false)
                setMessageError("Note: No SMS plan is available.")
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

    const handleContactClick = (page, activenum, activename) => {
        if (activenum) {
            setActiveUserNum(activenum);
            setActiveUserName(activename);
            // Reset unseen count to 0 when contact is clicked
            setUnseenCounts(prevCounts => ({
                ...prevCounts,
                [activenum]: 0
            }));
            updateSeenStatus(activenum);
            fetchChatHistory(page, activenum).then(() => {
                // Scroll to bottom after chat history is loaded
                if (scrollableDivRef.current) {
                    scrollableDivRef.current.scrollTop = scrollableDivRef.current.scrollHeight;
                }
            });
            formResetIn();
        }

    }
    /////////////////////// Top functions /////////////////////////////////////////
    const fetchCompanyContacts = async () => {
        try {
            const response = await fetchCompanyContactList();
            const response_data = response.data;

            if (response_data.error_code === 200) {
                const items = response_data.results;

                setCompanyContactList(items);
                // Find the contact with make_primary set to 1
                const primaryContact = items.find(contact => contact.make_primary === 1);

                if (primaryContact) {
                    //console.log('companycontct', primaryContact.requested_no);
                    setValue('number', primaryContact.requested_no); // Set the default value to the primary number
                    setSelectedNumber(primaryContact.requested_no);
                    setPageNumber(1);
                    await fetchContacts(1, primaryContact.requested_no, searchQuery);
                }
                // triggerAlert('success', 'success', 'Recharged Successfully!!');
            } else {
                // triggerAlert('error', 'Oops...', 'Recharge was unsuccessful');
            }
        } catch (error) {
            const response_data = error?.response?.data
            setIsLoadingContacts(false);
            triggerAlert('error', 'Oops...', response_data ? response_data.message : "Something went wrong!");
        }
    }
    /////////////////////////left sidebar functions///////////////////////////////////////
    const fetchContacts = async (pageNumber, num, searchkey = '') => {
        if (!searchkey) {
            setIsLoadingContacts(true);
        } else {
            setIsLoadingContacts(false);
        }

        try {
            const params = {
                page: pageNumber,
                page_size: pageSize,
                number: num,
                keyword: searchkey,
            };

            // Add direction parameter only if the type is "IN"
            if (type === "IN") {
                params.direction = 'IN';
            }

            // Log the params to verify they are correct
            console.log('Request Params:', params);

            const response = await fetchSMSContactList(params);
            const response_data = response.data;

            if (response_data.error_code === 200) {
                const items = response_data.results.data;
                const total_pages = response_data.results.pagination.total_pages;
                setTotalNumberPages(total_pages);
                setIsLoadingContacts(false);

                if (pageNumber === 1) {
                    setContactList(items);
                }
                return items;
            } else {
                setIsLoadingContacts(false);
            }
        } catch (error) {
            const response_data = error?.response?.data;
            setIsLoadingContacts(false);
            triggerAlert('error', 'Oops...', response_data ? response_data.message : "Something went wrong!");
        }
    };


    const updateSeenStatus = async (usernum) => {
        try {
            const params = {
                selected_number: selectedNumber,
                user_number: usernum,
            }
            const response = await updateMessageSeenStatus(params);
            const response_data = response.data;

            if (response_data.error_code === 200) {
                const items = response_data.results;
                // fetchContacts(selectedNumber)
            } else {
                // triggerAlert('error', 'Oops...', 'Recharge was unsuccessful');
            }
        } catch (error) {
            const response_data = error?.response?.data
            triggerAlert('error', 'Oops...', response_data ? response_data.message : "Something went wrong!");
        }
    }
    ////////////////////////// right sidebar functions ///////////////////////////////
    const fetchChatHistory = async (page, usernum) => {
        setIsLoading(true);
        // if (page) setPage(page);

        try {
            const params = {
                page: page,
                page_size: pageSize,
                number: selectedNumber,
                user_number: usernum,
                msg_type: type
            };
            const response = await fetchSMSUserChatHistory(params);
            const response_data = response.data;

            if (response_data.error_code === 200) {
                const items = response_data.results.data;
                const total_pages = response_data.results.pagination.total_pages;
                setTotalPages(total_pages)
                setIsLoading(false);
                const sortedChatHistory = [...items].reverse();

                if (page === 1) {
                    setUserChatHistory(sortedChatHistory);
                }

                return sortedChatHistory; // Return the sorted data
            } else {
                setIsLoading(false);
                return []; // Return an empty array on error
            }
        } catch (error) {
            setIsLoading(false);
            const response_data = error?.response?.data;
            triggerAlert('error', 'Oops...', response_data ? response_data.message : "Something went wrong!");
            return []; // Return an empty array on exception
        }
    };

    ////////////////////// Send SMS or MMS function //////////////////////////////////
    const sendSMSOrMMSMessage = async (data) => {
        setIsLoading(true);

        // Check if the message type is MMS and if a file is required
        if (data.msg_type === 'MMS' && !mmsFile.file) {
            setIsLoading(false);
            triggerAlert('error', 'Oops...', 'File is required for MMS.');
            return;
        }

        try {
            const params = {
                from_number: String(selectedNumber),
                to_number: [activeUserNum],
                ...data
            };

            if (mmsFile.file) {
                mmsFile.file_name = mmsFile.file_name?.split(".")[0];
                params.base64_files = mmsFile;
            }

            const response = await sendSMSOrMMS(params);
            const response_data = response.data;

            if (response_data.error_code === 200) {
                const items = response_data.results.data;
                setValueIn('message', '');
                setValueIn('msg_type', 'SMS');
                setMMSFile({});
                setIsLoading(false);
                setShowEmojis(false);
                fetchChatHistory(1, activeUserNum);
            } else {
                setIsLoading(false);
                triggerAlert('error', 'Oops...', response_data.message || 'Failed to send message.');
            }
        } catch (error) {
            const response_data = error?.response?.data;
            setIsLoading(false);
            triggerAlert('error', 'Oops...', response_data ? response_data.message : "Something went wrong!");
        }
    };

    ////////////////////// select a number functions /////////////////////////////////
    const handleNumberSelect = async (e) => {
        //console.log("selectedOption", e.target.value)
        handleDefaultStage() //bring everything to default

        const number = e.target.value;
        setValue('number', number);
        if (number) {
            // Call the API function with the selected option
            setSelectedNumber(number)
            await fetchContacts(1, number, searchQuery);
        }
    };
    const selectElement = (
        <Controller
            name="number"
            {...register('number',
                // { required: 'Department is required' }
            )}
            control={control}
            render={({ field }) => (
                <select
                    class="form-select"
                    name="number"
                    aria-label="Default select example"
                    onChange={handleNumberSelect}
                    value={field.value}
                >
                    <option value="" hidden>Select Contact Number</option>
                    {companyContactList.map((item, index) => (
                        <option value={item.requested_no}>
                            {item.requested_no}
                        </option>
                    ))}
                </select>
            )}
        />
    );
    const [searchQuery, setSearchQuery] = useState("");
    const handleKeySearch = (e) => {
        setSearchQuery(e.target.value);
        const searchkey = e.target.value;
        setPageNumber(1);
        fetchContacts(1, selectedNumber, searchkey); // Update search results on every change
    };

    const fileInputRef = useRef(null);

    const handleAttachmentClick = (e) => {
        e.preventDefault(); // Prevent the default action of the anchor tag
        if (fileInputRef.current) {
            fileInputRef.current.click(); // Trigger the click on the file input
        }
    };

    const handleMMSFilechange = async (e) => {
        const file = e.target.files[0];
        let items = {};

        if (!file) {
            items.error = "File is required."
            return;
        }

        // Check if the file is a PDF
        if (file.type === "application/pdf") {
            items.error = "PDF files are not allowed.";
            e.target.value = ''; // Clear the input
            setMMSFile(items); // Set error state
            return;
        }

        // Check if the file size exceeds 2MB
        if (file.size > 2 * 1024 * 1024) {
            items.error = "File size should not exceed 2MB.";
            e.target.value = ''; // Clear the input
            setMMSFile(items); // Set error state
            return;
        }

        try {
            // Convert file to base64
            const base64 = await getBase64(file);
            const base64WithoutPrefix = base64.substring(base64.indexOf(",") + 1);
            items = {
                ...items,
                file_name: file?.name,
                file_type: file?.name?.split(".")[1],
                file_size: file.size,
                file: base64WithoutPrefix,
                preview: base64 // Store the full base64 string for preview
            };
            setMMSFile(items);
        } catch (error) {
            // console.error("Error converting file to base64:", error);
            items.error = "Failed to process the file.";
            setMMSFile(items);
        }
    }
    const handleDownload = (url) => {
        const filename = url.substring(url.lastIndexOf('/') + 1);
        downloadFile(url, filename);
    };
    const fetchMoreData = async () => {
        try {
            // Wait for the data from the next page
            const nextPageNumber = page + 1;
            const nextPageData = await fetchChatHistory(nextPageNumber, activeUserNum);
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




    const handleFetchMoreData = async () => {
        // console.log("handleFetchMoreData", page, totalPages)
        if (page < totalPages) {

            setLoadingMore(true);
            await fetchMoreData(); // Fetch more data for the next page
            setLoadingMore(false);

            // Check if the next page will be the last
            if (page + 1 >= totalPages) {
                setHasMore(false); // No more pages to load
            }
        } else {
            setHasMore(false); // No more pages to load
        }
    };


    //////////////////////////////////// Receiving socket /////////////////////////////
    const { socket } = useSocket();

    useEffect(() => {
        if (!socket) return;

        if (!selectedNumber && !activeUserNum) return; // Ensure both selectedNumber and activeUserNum are not null or undefined

        // Set up event listener for receiving chat messages
        socket.on('send_message', (newData) => {
            if (newData.src === activeUserNum) {
                // console.log('right panel', activeUserNum);
                fetchChatHistory(1, activeUserNum);
                updateSeenStatus(activeUserNum);
            } else {
                // console.log('left panel', selectedNumber);
                setPageNumber(1);
                fetchContacts(pageNumber, selectedNumber, searchQuery);
            }
            sendNotification('New Message!', `From:${newData?.src}` || 'Message content here')
        });

        // Clean up on unmount
        return () => {
            socket.off('send_message');
        };

    }, [socket, selectedNumber, activeUserNum]);


    ///////////////////////////////////// unseen count/////////////////////
    useEffect(() => {
        if (contactList && contactList.length > 0) {
            // Update unseenCounts state when contactList is available
            const newUnseenCounts = contactList.reduce((acc, item) => {
                acc[item.src] = item.un_seen_count || 0;
                return acc;
            }, {});

            setUnseenCounts(newUnseenCounts);
        }
    }, [contactList]); // Re-run the effect whenever contactList changes

    useEffect(() => {
        fetchCompanyContacts();
    }, [])

    const fetchMoreContacts = async () => {
        try {
            // Fetch data for the next page
            const nextPageNumber = pageNumber + 1;
            const nextPageNumberData = await fetchContacts(nextPageNumber, selectedNumber, searchQuery);

            // Check if the returned data is an array
            if (Array.isArray(nextPageNumberData)) {
                // Append the new data to the existing number list
                setContactList(prevNumberList => [...prevNumberList, ...nextPageNumberData]);

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


    const handleFetchMoreContacts = async () => {

        if (pageNumber < totalNumberPages) {

            setLoadingMoreContacts(true);
            await fetchMoreContacts(); // Fetch more data for the next page
            setLoadingMoreContacts(false);

            // Check if the next page will be the last
            if (pageNumber + 1 >= totalNumberPages) {
                setHasMoreContacts(false); // No more pages to load
            }
        } else {
            //console.log('else');
            // alert('No more pages to load');
            setHasMoreContacts(false); // No more pages to load
        }
    };

    const handleEmojiSelect = (emoji) => {
        const currentMessage = watchIn("message") || ""; // Get current message value
        setValueIn("message", currentMessage + emoji); // Append emoji to the message
    };
    return (
        <main class="main-content mt-3 mb-4">

            <div class="container content-inner  " id="page_layout">

                <PageTitle heading={heading} otherElements={selectElement} />
                <div class="row w-100">
                    <div class="col-md-3">
                        <aside
                            className="sidebar-chat sidebar-base border-end shadow-none rounded-2"
                            data-sidebar="responsive"
                        // style={{
                        //     height: '40vh', // Full page height
                        //     display: 'flex', // Flex layout for sidebar and its content
                        //     flexDirection: 'column',
                        // }}
                        >
                            {/* Chat search section */}
                            <div className="chat-search pt-3 px-3">
                                {contactList.length > 0 && (
                                    <div className="chat-searchbar mt-4 mb-2">
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
                                    </div>
                                )}
                            </div>

                            {/* Sidebar body with dynamic height */}
                            <div
                                className="sidebar-body pt-0 data-scrollbar chat-group mb-5 pb-5 pe-2"
                                id="scrollableDivContacts"
                                ref={contactsContainerRef}
                                style={{
                                    flexGrow: 1, // Allow the body to grow dynamically
                                    overflow: 'auto', // Enable scrolling
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                <ul
                                    className="nav navbar-nav iq-main-menu mt-2"
                                    id="sidebar-menu"
                                    role="tablist"
                                >
                                    <InfiniteScrollWrapper
                                        dataLength={contactList.length}
                                        next={handleFetchMoreContacts}
                                        hasMore={hasMoreContacts} // Stop loading more data when false
                                        inverse={false} // This ensures the scroll direction is "up"
                                        loader={null}
                                        scrollableTarget="scrollableDivContacts"
                                    >
                                        {loadingMoreContacts && (
                                            <h4 className="text-center text-danger">
                                                <SpinnerLoader />
                                            </h4>
                                        )}
                                        {contactList.length > 0 ? (
                                            contactList.map((item, index) => (
                                                <li
                                                    key={item.src}
                                                    className={`nav-item iq-chat-list p-0 ps-2 ${activeUserNum === item.src ? 'active' : ''
                                                        }`}
                                                    onClick={() =>
                                                        handleContactClick(1, item.src, item.contact_name)
                                                    }
                                                >
                                                    <a
                                                        href={`#user-content-${activeUserNum}`}
                                                        className={`nav-link  d-flex gap-1 ${activeUserNum === item.src ? 'active' : ''}`}
                                                        data-bs-toggle="tab"
                                                        role="tab"
                                                        aria-controls={`#user-content-${activeUserNum}`}
                                                        aria-selected="true"
                                                    >
                                                        <div className="position-relative">
                                                            <span className="badge badge-pill btn btn-soft-danger font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2">
                                                                {/* {item.contact_name
                                                                    ? item.contact_name[0]
                                                                    : '-'} */}
                                                                {item.contact_name ? getInitials(item.contact_name) : 'U'}

                                                            </span>
                                                        </div>
                                                        <div className="d-flex align-items-center w-100 iq-userlist-data">
                                                            <div className="d-flex flex-grow-1 flex-column">
                                                                <div className="d-flex align-items-center gap-1">
                                                                    <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">
                                                                        {item.contact_name
                                                                            ? truncateName(item.contact_name, 15)
                                                                            : '-'}
                                                                    </p>

                                                                </div>
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <small className="text-ellipsis short-1 flex-grow-1 chat-small">
                                                                        {item.src ? item.src : '-'}
                                                                    </small>

                                                                </div>
                                                            </div>
                                                            <div class="d-flex flex-grow-1 flex-column">
                                                                <div class="d-flex align-items-center gap-1">
                                                                    <small className="text-capitalize">
                                                                        {item.create_date
                                                                            ? formatDateTime(
                                                                                item.create_date,
                                                                                'yyyy-mm-dd'
                                                                            )
                                                                            : '-'}
                                                                        , <br />
                                                                        {item.create_date
                                                                            ? formatDateTime(
                                                                                item.create_date,
                                                                                'hh:mm:ss'
                                                                            )
                                                                            : '-'}
                                                                    </small>
                                                                    <div class="d-flex align-items-center gap-2">

                                                                    </div>
                                                                </div>

                                                            </div>
                                                            {unseenCounts[item.src] > 0 && (
                                                                <span className="badge rounded-pill bg-success badge-30">
                                                                    {unseenCounts[item.src]}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </a>
                                                </li>
                                            ))
                                        ) : (
                                            <p className="text-center">No contacts found!</p>
                                        )}
                                    </InfiniteScrollWrapper>
                                </ul>
                            </div>
                        </aside>

                    </div>
                    <div class="col-md-9">
                        <div class="tab-content" id="myTabContent">
                            <div class="card tab-pane mb-0 fade show active" id={`#user-content-${activeUserNum}`} role="tabpanel">
                                {userChatHistory.length > 0 ?

                                    <>
                                        <div class="chat-head">
                                            <header class="d-flex justify-content-between align-items-center bg-white pt-3  ps-3 pe-3 pb-3 border-bottom rounded-top">
                                                <div class="d-flex align-items-center">
                                                    <div class="position-relative">
                                                        <span class="badge badge-pill btn btn-soft-danger font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2">
                                                            {activeUserName ? getInitials(activeUserName) : 'U'}
                                                        </span>

                                                    </div>

                                                    <div class="d-flex align-items-center w-100 iq-userlist-data">
                                                        <div class="d-flex flex-grow-1 flex-column">
                                                            <div class="d-flex align-items-center h-19">
                                                                <p class="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">{activeUserName ? activeUserName : '-'}</p>
                                                            </div>
                                                            <div class="d-flex align-items-center gap-2">
                                                                <small class="text-ellipsis short-1 flex-grow-1 chat-small">{activeUserNum ? activeUserNum : '-'}</small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </header>
                                        </div>
                                        <div class="card-body chat-body inbox-body bg-body">

                                            <div
                                                id="scrollableDiv"
                                                ref={scrollableDivRef}
                                                style={{
                                                    // height: '500px',
                                                    overflow: 'auto',
                                                    display: 'flex',
                                                    flexDirection: 'column-reverse'
                                                }} // column-reverse to start at the bottom
                                            >
                                                <InfiniteScrollWrapper
                                                    dataLength={userChatHistory.length}
                                                    next={handleFetchMoreData}
                                                    hasMore={hasMore} // Stop loading more data when false
                                                    inverse={true} // This ensures the scroll direction is "up"
                                                    loader={null}
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
                                                                {/* Render the date header if it's the first message or the date has changed */}
                                                                {(index === 0 || messageDate !== prevMessageDate) && (
                                                                    <div className="chat-day-title">
                                                                        <span className="main-title">{messageDate}</span>
                                                                    </div>
                                                                )}
                                                                {item.directions == 'IN' ?
                                                                    <div class="iq-message-body iq-other-user  gap-0">
                                                                        <div class="chat-profile">
                                                                            <span class="badge badge-pill bg-soft-info font-weight-normal ms-auto me-2 badge-45 md-14 rounded-circle p-2 "><span class="material-symbols-outlined">person_outline</span></span>
                                                                        </div>

                                                                        <div class="iq-chat-text">
                                                                            <div class="d-flex align-items-center justify-content-start">
                                                                                <div class="iq-chating-content ">
                                                                                    <div class="d-flex align-items-center gap-1">
                                                                                        <p class="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-chat text-info">{activeUserName ? truncateName(activeUserName, 50) : item.src ? item.src : null}</p>
                                                                                        <div class="chat-lft p-1">
                                                                                            {/* <div class="dropdown-container">
                                                                                                <div class="dropdown chat-drop-l">
                                                                                                    <span class="material-symbols-outlined fs-2" id="dropdownMenuButton9 " data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                                                        keyboard_arrow_down
                                                                                                    </span>
                                                                                                    <div class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton9" >
                                                                                                        <a class="dropdown-item " href="javascript:void(0);">Replay</a>
                                                                                                        <a class="dropdown-item " href="javascript:void(0);">Forward</a>
                                                                                                        <a class="dropdown-item " href="javascript:void(0);">Delete</a>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div> */}
                                                                                        </div>
                                                                                    </div>
                                                                                    <p class="mr-2 mb-3">{item.message ? item.message : null}
                                                                                    </p>
                                                                                    {/* Conditionally Render Ash-Colored Div for SMS */}
                                                                                    {item.message_type === 'MMS' && (
                                                                                        <div className="ash-colored-div d-flex justify-content-between" style={{ backgroundColor: '#cde1d2', padding: '10px', marginTop: '10px', borderRadius: '5px' }}>
                                                                                            <p className='mb-0'>{extractFileName(item.attachment)}</p>
                                                                                            <span className="download-icon" onClick={() => handleDownload(item.attachment)} type="button">
                                                                                                <span className="material-symbols-outlined">download</span>
                                                                                            </span>
                                                                                        </div>
                                                                                    )}
                                                                                    <div class="position-relative">
                                                                                        <div class="chat-time-left pb-1">
                                                                                            <small class="text-capitalize">{item.create_date ? formatTimeToAmandPM(item.create_date) : '-'}</small>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    :
                                                                    <div class="iq-message-body iq-current-user">
                                                                        <div class="iq-chat-text">
                                                                            <div class="d-flex align-items-center justify-content-end">
                                                                                <div class="iq-chating-content  ">
                                                                                    <div class="d-flex align-items-center gap-1">
                                                                                        <p class="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-chat text-secondary">You</p>
                                                                                        <div class="chat-right ">
                                                                                            {/* <div class="dropdown-container">

                                                                                                <div class="dropdown chat-drop">
                                                                                                    <span class="material-symbols-outlined fs-2" id="dropdownMenuButton9 " data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                                                                                        keyboard_arrow_down
                                                                                                    </span>
                                                                                                    <div class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton9" >
                                                                                                        <a class="dropdown-item " href="javascript:void(0);">Replay</a>
                                                                                                        <a class="dropdown-item " href="javascript:void(0);">Forward</a>
                                                                                                        <a class="dropdown-item " href="javascript:void(0);">Delete</a>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div> */}
                                                                                        </div>
                                                                                    </div>

                                                                                    <p class="mr-2 mb-1 px-1">{item.message ? item.message : null}
                                                                                    </p>
                                                                                    {item.message_type === 'MMS' && (
                                                                                        <div className="ash-colored-div d-flex justify-content-between" style={{ backgroundColor: '#cde1d2', padding: '10px', marginTop: '10px', borderRadius: '5px' }}>
                                                                                            <p className='mb-0'>{extractFileName(item.attachment)}</p>
                                                                                            <span className="download-icon" onClick={() => handleDownload(item.attachment)} type="button">
                                                                                                <span className="material-symbols-outlined">download</span>
                                                                                            </span>
                                                                                        </div>
                                                                                    )}
                                                                                    <div class="d-flex justify-content-end">
                                                                                        <div style={{ width: "49px" }}>
                                                                                            <small class="text-capitalize">{item.create_date ? formatTimeToAmandPM(item.create_date) : '-'}</small>
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
                                        {/* Only show chat footer for History view */}
                                        {type !== "IN" && type !== "OUT" && userChatHistory.length > 0 && (
                                            <div class="card-footer px-3 py-3 border-top rounded-0">
                                                <form onSubmit={handleSubmitIn(sendSMSOrMMSMessage)}>
                                                    <div class="d-flex align-items-center">
                                                        <div class="me-3">
                                                            <Controller
                                                                name="msg_type"
                                                                control={controlIn}
                                                                defaultValue="SMS"
                                                                render={({ field }) => (
                                                                    <>
                                                                        <input
                                                                            {...field}
                                                                            type="radio"
                                                                            id="SMS"
                                                                            value="SMS"
                                                                            checked={field.value === 'SMS'}
                                                                        />
                                                                        &nbsp;
                                                                        <label htmlFor="SMS"> SMS</label>
                                                                    </>
                                                                )}
                                                            />
                                                        </div>
                                                        <div class="me-3">
                                                            <Controller
                                                                name="msg_type"
                                                                control={controlIn}
                                                                defaultValue="SMS"
                                                                render={({ field }) => (
                                                                    <>
                                                                        <input
                                                                            {...field}
                                                                            type="radio"
                                                                            id="MMS"
                                                                            value="MMS"
                                                                            checked={field.value === 'MMS'}
                                                                        />
                                                                        &nbsp;
                                                                        <label htmlFor="MMS"> MMS</label>
                                                                    </>
                                                                )}
                                                            />
                                                        </div>
                                                        {messageType === "MMS" &&
                                                            <div>
                                                                <p className='text-danger mb-0'>Note**: File size should not exceed 2 MB</p>
                                                            </div>
                                                        }
                                                    </div>
                                                    <div class="d-flex align-items-center">
                                                        <div class="chat-attagement d-flex">
                                                            <a href="#/" class="d-flex align-items-center pe-3" onClick={() => setShowEmojis(!showEmojis)}>
                                                                <svg class="icon-24" width="24" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <g clip-path="url(#clip0_156_599)">
                                                                        <path d="M20.4853 4.01473C18.2188 1.74823 15.2053 0.5 12 0.5C8.79469 0.5 5.78119 1.74823 3.51473 4.01473C1.24819 6.28119 0 9.29469 0 12.5C0 15.7053 1.24819 18.7188 3.51473 20.9853C5.78119 23.2518 8.79469 24.5 12 24.5C15.2053 24.5 18.2188 23.2518 20.4853 20.9853C22.7518 18.7188 24 15.7053 24 12.5C24 9.29469 22.7518 6.28119 20.4853 4.01473ZM12 23.0714C6.17091 23.0714 1.42856 18.3291 1.42856 12.5C1.42856 6.67091 6.17091 1.92856 12 1.92856C17.8291 1.92856 22.5714 6.67091 22.5714 12.5C22.5714 18.3291 17.8291 23.0714 12 23.0714Z" fill="currentcolor"></path>
                                                                        <path d="M9.40398 9.3309C8.23431 8.16114 6.33104 8.16123 5.16136 9.3309C4.88241 9.60981 4.88241 10.0621 5.16136 10.3411C5.44036 10.62 5.89266 10.62 6.17157 10.3411C6.78432 9.72836 7.78126 9.7284 8.39392 10.3411C8.53342 10.4806 8.71618 10.5503 8.89895 10.5503C9.08171 10.5503 9.26457 10.4806 9.40398 10.3411C9.68293 10.0621 9.68293 9.60986 9.40398 9.3309Z" fill="currentcolor"></path>
                                                                        <path d="M18.8384 9.3309C17.6688 8.16123 15.7655 8.16114 14.5958 9.3309C14.3169 9.60981 14.3169 10.0621 14.5958 10.3411C14.8748 10.62 15.3271 10.62 15.606 10.3411C16.2187 9.72836 17.2156 9.72831 17.8284 10.3411C17.9679 10.4806 18.1506 10.5503 18.3334 10.5503C18.5162 10.5503 18.699 10.4806 18.8384 10.3411C19.1174 10.0621 19.1174 9.60986 18.8384 9.3309Z" fill="currentcolor"></path>
                                                                        <path d="M18.3335 13.024H5.6668C5.2723 13.024 4.95251 13.3438 4.95251 13.7383C4.95251 17.6243 8.11409 20.7859 12.0001 20.7859C15.8862 20.7859 19.0477 17.6243 19.0477 13.7383C19.0477 13.3438 18.728 13.024 18.3335 13.024ZM12.0001 19.3573C9.14366 19.3573 6.77816 17.215 6.42626 14.4525H17.574C17.2221 17.215 14.8566 19.3573 12.0001 19.3573Z" fill="currentcolor"></path>
                                                                    </g>
                                                                    <defs>
                                                                        <clipPath>
                                                                            <rect width="24" height="24" fill="white" transform="translate(0 0.5)"></rect>
                                                                        </clipPath>
                                                                    </defs>
                                                                </svg>
                                                            </a>
                                                            <div className="mt-2" style={{ position: "relative" }}>
                                                                {showEmojis && (
                                                                    <div style={{ position: "absolute", zIndex: 1000, bottom: '39px', left: '-50px', backgroundColor: "#fff", boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", overflowY: "auto", maxHeight: "300px" }}>
                                                                        <Emojis onEmojiSelect={handleEmojiSelect} pickerSize={{ height: 300, width: 650 }} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <>
                                                                {messageType === 'MMS' && (
                                                                    <>
                                                                        <div className="chat-attachment d-flex">
                                                                            <a href="#" className="d-flex align-items-center pe-3" onClick={handleAttachmentClick}>
                                                                                <i className="fa fa-paperclip font-size-18"></i>
                                                                            </a>
                                                                        </div>
                                                                        <input
                                                                            type="file"
                                                                            ref={fileInputRef}
                                                                            name="mmsfile"
                                                                            style={{ display: 'none' }}
                                                                            onChange={handleMMSFilechange}
                                                                        />
                                                                    </>
                                                                )}
                                                            </>
                                                        </div>
                                                        <input type="text" class="form-control me-3" placeholder="Type your message" name='message'  {...registerIn("message", {
                                                            required: "Message is required",
                                                        })} />
                                                        {hideButton && <button type="submit" class="btn btn-primary d-flex align-items-center">
                                                            <svg class="icon-20" width="18" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M13.8325 6.67463L8.10904 12.4592L1.59944 8.38767C0.66675 7.80414 0.860765 6.38744 1.91572 6.07893L17.3712 1.55277C18.3373 1.26963 19.2326 2.17283 18.9456 3.142L14.3731 18.5868C14.0598 19.6432 12.6512 19.832 12.0732 18.8953L8.10601 12.4602" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                                            </svg>
                                                            <span class="d-none d-lg-block ms-1">Send</span>
                                                        </button>}
                                                        {!hideButton && messageError && (
                                                            <div className="text-danger ms-2">
                                                                {messageError}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div class="d-flex align-items-center">
                                                        {messageType == "MMS" &&
                                                            (mmsFile?.error ?
                                                                <div
                                                                    style={{
                                                                        color: "red",
                                                                        fontSize: "14px",
                                                                        marginTop: "5px",
                                                                    }}
                                                                >
                                                                    {mmsFile?.error}
                                                                </div>
                                                                :
                                                                mmsFile?.file_type && ['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(mmsFile.file_type.toLowerCase()) ? (
                                                                    <div style={{ marginTop: '10px' }}>
                                                                        <img
                                                                            src={mmsFile.preview}
                                                                            alt="Preview"
                                                                            style={{
                                                                                width: '100px',
                                                                                borderRadius: '5px'
                                                                            }}
                                                                        />
                                                                    </div>
                                                                ) : <div>
                                                                    <p className='text-primary mb-0'>{mmsFile?.file_name && `File attached: ${mmsFile?.file_name}`}</p>
                                                                </div>
                                                            )
                                                        }
                                                        {errorsIn.message && (
                                                            <div
                                                                style={{
                                                                    color: "red",
                                                                    fontSize: "14px",
                                                                    marginLeft: "5px",
                                                                }}
                                                            >
                                                                {errorsIn.message.message}
                                                            </div>
                                                        )}
                                                    </div>
                                                </form>
                                            </div>
                                        )}
                                    </>
                                    :
                                    <div class="card-body chat-body bg-body chat-contacts">
                                        <div className='d-flex justify-content-center flex-column align-items-center'>


                                            {/* <img src='/assets/images/Inbox.jpg' alt='inbox' /> */}
                                            <LazyLoadImage src='/assets/images/Inbox.jpg' alt='inbox' />                                            {/* <img src='/assets/images/Inbox.jpg' alt='inbox' /> */}
                                            <p className='text-center'>Please select any one Contact and view</p>
                                        </div> </div>
                                    // </div>
                                }
                            </div>
                        </div >
                    </div >
                </div >

            </div >
            {/* </div > */}
        </main >
    )
    //       </main >
}