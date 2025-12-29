import React, { useEffect, useRef, useState } from "react";
import PageTitle from "../../../common/PageTitle";
import useLocation from "../../../common/components/customhooks/Location";
import InfiniteScrollWrapper from "../../../common/components/InfinityScrollWrapper";
import {
  downloadFile,
  extractFileName,
  formatDateTime,
  formatTimeToAmandPM,
  getBase64,
  getFormattedDate,
  transformText,
  triggerAlert,
  truncateName,
} from "../../../utils/CommonFunctions";
import {
  BulkSendTemp,
  fetchTempData,
  fetchWAContactList,
  fetchWhatsappUserChatHistory,
  forwardWhatsappMessage,
  listContact,
  reactToWhatsappMessage,
  sendWhatsappContacts,
  sendWhatsappLocation,
  sendWhatsappMessage,
  sendWhatsappVideoandAudio,
  updateWhatsappSeenStatus, fetchOptOutData
} from "../../../utils/ApiClient";
import SpinnerLoader from "../../../common/components/SpinnerLoader";
import Emojis from "../../../common/components/Emojis";
import { useForm } from "react-hook-form";
import DynamicLocation from "../../../common/components/DynamicLocation";
import { Modal, ModalFooter, Button, Form } from "react-bootstrap";
import TextToSpeech from "../../../common/components/TextToSpeech";
import LazyLoadImage from "../../../common/components/LazyLoadImage";
import SpeechToText from "../../../common/components/SpeechToText";
import VideoRecording from "../../../common/components/VideoRecording";
import AudioRecorder from "../../../common/components/AudioRecording";
import { useSocket } from "../../../SocketContext";
// import CreateContactModal from './CreateContactModal';
import { createtemplate } from "../../../utils/ApiClient";
import { useTwentyFourHoursTimer } from "./TwentyFourHoursTimer";
import { FaFilePdf } from "react-icons/fa";
import { MdOutlineDownloading } from "react-icons/md";
import { SiGooglesheets } from "react-icons/si";


export default function TelagramChannels() {
  const {
    register,
    handleSubmit,
    control,
    formState: { },
    reset,
    watch,
    clearErrors,
    setValue,
    setError,
    unregister,
  } = useForm();
  const { register: registerSendTemp, handleSubmit: handleSubmitSendTemp, formState: { errors: errorsSendTemp }, formState: { errors: BulkErrors }, register: registerBulk } = useForm();
  const { register: registerBulkTemp, handleSubmit: handleSubmitBulkTemp, formState: { errors: errorsBulkTemp } } = useForm();
  const MAX_FILE_LIMIT = 10;

  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [showAddChannelModal, setShowAddChannelModal] = useState(false);
  const contactsContainerRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFetch, setIsLoadingFetch] = useState(false);
  const [timer, setTimer] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const { location, loading, handleGetLocation } = useLocation();
  const [selectKey, setSelectKey] = useState("all");
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [contactList, setContactList] = useState([]);
  const [loadingMoreContacts, setLoadingMoreContacts] = useState(false);
  const [activeUserNum, setActiveUserNum] = useState(null); // To track the active chat
  const [activeUserName, setActiveUserName] = useState(null); // To track the active chat
  const [unseenCounts, setUnseenCounts] = useState({});
  const [hasMoreContacts, setHasMoreContacts] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showAboveScreen, setShowAboveScreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const handleShowOffcanvas = () => setShowOffcanvas(true);
  const handleCloseOffcanvas = () => setShowOffcanvas(false);
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const [userChatHistory, setUserChatHistory] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);

  const [totalNumberPages, setTotalNumberPages] = useState(0); //To track the contact list

  const [page, setPage] = useState(0); // To track the active chat
  const [totalPages, setTotalPages] = useState(0); // To track the active chat
  const [pageNumber, setPageNumber] = useState(1); // To track the active chat
  const pageSize = 10;

  const [showContactModal, setShowContactModal] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showBulkSendModal, setShowBulkSendModal] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [isHovered, setIsHovered] = useState(null);
  const [showEmojisReaction, setShowEmojisReaction] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [replyInfo, setReplyInfo] = useState({});
  const [isAudioRecording, setIsAudioRecording] = useState(false);
  const [show, setShow] = useState(false);
  const [templateData, setTemplateData] = useState(null);

  const [selectedTemplateDrop, setSelectedTemplateDrop] = useState(null);
  const [headerInputValueBulk, setHeaderInputValueBulk] = useState("");
  const [bodyInputValuesBulk, setBodyInputValuesBulk] = useState({});
  const [twentyFourHoursTimer, setTwentyFourHoursTimer] = useState(null);
  const { isExpired, timeLeft } = useTwentyFourHoursTimer(twentyFourHoursTimer);

  const [showOptout, setShowOptout] = useState(false);
  const [optedOut, setOptedOut] = useState(null); // State for managing checkbox

  const handleAddChannel = () => {
    cleanupModals();
    setShowAddChannelModal(true);
  };

  const handleCloseAddChannel = () => {
    setShowAddChannelModal(false);
    cleanupModals();
  };

  const cleanupModals = () => {
    // Remove any lingering backdrops
    const backdrops = document.getElementsByClassName('modal-backdrop');
    while (backdrops.length > 0) {
      backdrops[0].remove();
    }

    // Remove modal-open class from body
    document.body.classList.remove('modal-open');

    // Remove inline styles added by Bootstrap
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('padding-right');
  };

  // Add cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupModals();
    };
  }, []);


  const handleAddNewContact = (e) => {
    e.preventDefault();

    // Close the current offcanvas
    const currentOffcanvas = document.getElementById('offcanvasChannel');
    if (currentOffcanvas) {
      const bsOffcanvas = window.bootstrap.Offcanvas.getInstance(currentOffcanvas);
      if (bsOffcanvas) {
        bsOffcanvas.hide();
      }
    }

    // Wait for the first offcanvas to close before opening the second one
    setTimeout(() => {
      // Open the new contact offcanvas
      const newContactElement = document.getElementById('offcanvasRight_addNew');
      if (newContactElement) {
        const newContactOffcanvas = new window.bootstrap.Offcanvas(newContactElement);
        newContactOffcanvas.show();
      }
    }, 300);
  };


  const handleTemplateChange = (e) => {
    const selectedTemplateId = e.target.value;
    const selectedTemplate = templateData.find(template => template.id === selectedTemplateId);
    setSelectedTemplateDrop(selectedTemplate);
    setHeaderInputValueBulk(''); // Clear header input
    setBodyInputValuesBulk({}); // Clear body inputs
  };
  const handleBodyInputBulkChange = (index, value) => {
    setBodyInputValuesBulk(prev => ({
      ...prev,
      [index]: value,
    }));
  };
  const handleHeaderInputBulkChange = (value) => {
    setHeaderInputValueBulk(value);
  };

  const handleMouseOver = (id, whats_app_id) => {
    setIsHovered({
      id: id,
      whatsAppId: whats_app_id
    });
  };
  const handleMouseOut = () => {
    setIsHovered(null);
    // setShowEmojisReaction(false);
  };

  const handleShowContactModal = () => setShowContactModal(true);
  const handleShowContactCloseModal = () => setShowContactModal(false);
  const handleShowForwardModal = () => setShowForwardModal(true);
  const handleForwardCloseModal = () => setShowForwardModal(false);
  const handleShowVideoModal = () => setShowVideoModal(true);
  const handleVideoCloseModal = () => setShowVideoModal(false);

  const handleShowBulkSendModal = () => {
    setShowBulkSendModal(true);
    handleFetchTemplateData();
  };
  const handleCloseBulkSendModal = () => {
    setShowBulkSendModal(false); // Close the modal
    setSelectedTemplateDrop(null); // Reset the selected template
    reset(); // Reset the form to its default values
    clearErrors(); // Clear any existing validation errors
  };


  const handleAddMemberFromContacts = (e) => {
    e.preventDefault();

    // Close the current offcanvas
    const currentOffcanvas = document.getElementById('offcanvasChannel');
    if (currentOffcanvas) {
      const bsOffcanvas = window.bootstrap.Offcanvas.getInstance(currentOffcanvas);
      if (bsOffcanvas) {
        bsOffcanvas.hide();
      }
    }

    // Wait for the first offcanvas to close before opening the second one
    setTimeout(() => {
      // Open the contacts offcanvas
      const contactsElement = document.getElementById('offcanvasRightcontact');
      if (contactsElement) {
        const contactsOffcanvas = new window.bootstrap.Offcanvas(contactsElement);
        contactsOffcanvas.show();
      }
    }, 300);
  };

  const handleForwardShow = (id) => {
    setSelectedMessageId(id);
    handleShowForwardModal();
    fetchAllContacts();
  };
  const handleReplyShow = (id, text, direction) => {
    setShowAboveScreen(true);
    setReplyInfo({
      text: text,
      id: id,
      direction: direction,
    });
  };
  const handleContactShow = () => {
    handleShowContactModal();
    fetchAllContacts();
  };

  const handleSelect = (e) => {
    setContactList([]);
    const type = e.target.value;
    if (type) {
      setSelectKey(type);
      fetchContacts(type, 1, searchQuery);
    }
  };

  const handleDownload = (url) => {
    const filename = url.substring(url.lastIndexOf("/") + 1);
    downloadFile(url, filename);
  };

  const formReset = () => {
    reset();
  };

  const handleEmojiSelect = (emoji) => {
    // console.log("emoji", emoji)
    // Append selected emoji to the message field
    const currentMessage = watch("message") || ""; // Get current message value
    setValue("message", currentMessage + emoji); // Append emoji to the message
  };

  /////////////////////////// speech to text handle function///////////////////////////
  // Function that will handle transcription from child component
  const handleTranscription = (newTranscription) => {
    // setTranscription(newTranscription);
    const prev_message = watch("message");
    setValue("message", prev_message + newTranscription);
    // console.log("newTranscription", newTranscription)
  };
  /////////////////////////////////////////////////////////////////////////////////
  const handleContactClick = (activenum, activename, businessnum, opted_out) => {
    if (activenum) {
      setActiveUserNum(activenum);
      setActiveUserName(activename);
      // // Reset unseen count to 0 when contact is clicked
      // setUnseenCounts((prevCounts) => ({
      //   ...prevCounts,
      //   [activenum]: 0,
      // }));
      updateSeenStatus(businessnum, activenum);
      fetchWhatsappChatHistory(1, activenum);
      formReset();
      setOptedOut(opted_out);
    }
  };
  /////////////////////////left sidebar functions///////////////////////////////////////
  const fetchContacts = async (type, pageNumber, searchkey = '') => {
    // console.log('pageNumber_fetching', pageNumber);
    // setIsLoadingContacts(true);
    try {
      const params = {
        select_key: type,
        page_number: pageNumber,
        page_size: pageSize,
        keyword: searchkey ? searchkey : "",
      };

      const response = await fetchWAContactList(params);
      const response_data = response.data;
      if (response_data.error_code === 200) {
        const items = response_data.results.data;
        const total_pages = response_data.results.pagination.total_pages;
        setTotalNumberPages(total_pages);
        setIsLoadingContacts(false);
        const sortedContacts = [...items].reverse();

        if (pageNumber === 1) {
          setContactList(sortedContacts);
        }
        return sortedContacts;
        // triggerAlert('success', 'success', 'Recharged Successfully!!');
      } else if (response.status === 204) {
        setContactList([]);
        setTotalNumberPages(0);
        setIsLoadingContacts(false);
      } else {
        setIsLoadingContacts(false);
        // triggerAlert('error', 'Oops...', 'Recharge was unsuccessful');
      }
    } catch (error) {
      const response_data = error?.response?.data;
      setIsLoadingContacts(false);
      triggerAlert(
        "error",
        "Oops...",
        response_data ? response_data.message : "Something went wrong!"
      );
    }
  };
  const fetchMoreContacts = async () => {
    try {
      // Fetch data for the next page
      const nextPageNumber = pageNumber + 1;
      const nextPageNumberData = await fetchContacts(
        selectKey,
        nextPageNumber,
        searchQuery
      );

      // Check if the returned data is an array
      if (Array.isArray(nextPageNumberData)) {
        // Append the new data to the existing number list
        setContactList((prevNumberList) => [
          ...prevNumberList,
          ...nextPageNumberData,
        ]);

        // Increment the page number only after successful fetch
        setPageNumber(nextPageNumber);
      } else {
        console.error("The fetched data is not an array:", nextPageNumberData);
        // Handle the case where the data is not an array
      }
    } catch (error) {
      console.error("Failed to fetch more data:", error);
    }
  };
  const handleFetchMoreContacts = async () => {
    // console.log("pageNumber, totalNumberPages:", pageNumber, totalNumberPages);

    // Check if there are more pages to fetch
    if (pageNumber < totalNumberPages) {
      // Preserve current scroll position
      const currentScrollHeight = contactsContainerRef.current.scrollHeight;
      const currentScrollTop = contactsContainerRef.current.scrollTop;

      setLoadingMoreContacts(true);
      await fetchMoreContacts(); // Fetch more data for the next page
      setLoadingMoreContacts(false);

      // Calculate new scroll position
      const newScrollHeight = contactsContainerRef.current.scrollHeight;

      // Scroll only if the user was at the bottom before loading more data
      if (
        currentScrollTop + contactsContainerRef.current.clientHeight >=
        currentScrollHeight
      ) {
        contactsContainerRef.current.scrollTop = newScrollHeight;
      } else {
        // Preserve the current scroll position if the user was not at the bottom
        contactsContainerRef.current.scrollTop =
          newScrollHeight - (currentScrollHeight - currentScrollTop);
      }

      // Check if the next page will be the last
      if (pageNumber + 1 >= totalNumberPages) {
        setHasMoreContacts(false); // No more pages to load
      }
    } else {
      // No more pages to load
      // console.log("No more pages to load");
      setHasMoreContacts(false);
    }
  };
  ////////////////////////// right sidebar functions ///////////////////////////////
  const fetchWhatsappChatHistory = async (page, usernum) => {
    setIsLoadingFetch(true);
    if (page) setPage(page);

    try {
      const params = {
        page: page,
        page_size: pageSize,
        user_number: usernum,
      };
      const response = await fetchWhatsappUserChatHistory(params);
      const response_data = response.data;

      if (response_data.error_code === 200) {
        const items = response_data.results?.list_data?.data;
        const total_pages = response_data.results?.list_data.pagination.total_pages;
        const timer = response_data.results?.twentyfourhours;
        setTotalPages(total_pages);
        setIsLoadingFetch(false);
        setTwentyFourHoursTimer(timer);
        const sortedChatHistory = [...items].reverse();
        if (page === 1) {
          setUserChatHistory(sortedChatHistory);
        }
        return sortedChatHistory; // Return the sorted data
      } else {
        setIsLoadingFetch(false);
        return []; // Return an empty array on error
      }
    } catch (error) {
      console.error(error)
      setIsLoadingFetch(false);
      const response_data = error?.response?.data;
      triggerAlert(
        "error",
        "Oops...",
        response_data ? response_data.message : "Something went wrong!"
      );
      return []; // Return an empty array on exception
    }
  };
  ////////////////////// Send Whatsapp message function //////////////////////////////////
  const sendWhatsappMessageAPI = async (data) => {
    // return
    setIsLoading(true);

    try {
      const params = {
        person_name: activeUserName,
        to_number: activeUserNum,
        // person_name: "Amritha Sunny",
        // to_number: "917356889520",
        ...data,
      };

      if (uploadedFiles) params.base64_files = uploadedFiles;
      if (replyInfo?.id) params.reply_msg_id = replyInfo.id;
      // console.log("reply", params)
      // return
      const response = await sendWhatsappMessage(params);
      const response_data = response.data;

      if (response_data.error_code === 200) {
        const items = response_data.results.data;

        setIsLoading(false);
        formReset();
        fetchWhatsappChatHistory(1, activeUserNum);
        if (replyInfo?.id) {
          setReplyInfo({});
        }
        if (showEmojis) setShowEmojis(false)
        // triggerAlert('success', 'success', 'Recharged Successfully!!');
      } else {
        setIsLoading(false);
        // triggerAlert('error', 'Oops...', 'Recharge was unsuccessful');
      }
    } catch (error) {
      const response_data = error?.response?.data;
      setIsLoading(false);
      triggerAlert(
        "error",
        "Oops...",
        response_data ? response_data.message : "Something went wrong!"
      );
    } finally {
      setShowAboveScreen(false);
      setUploadedFiles([]);
      setIsUploading(false)
    }
  };
  ////////////////////// Send Location ///////////////////////////////////
  const sendWhatsappLocationAPI = async () => {
    // return
    setIsLoading(true);

    try {
      const params = {
        person_name: activeUserName,
        to_number: activeUserNum,
        // person_name: "Amritha Sunny",
        // to_number: "917356889520",
        latitude: location?.latitude,
        longitude: location?.longitude,
      };

      // if (data.msg_type == 'MMS') params.base64_files = mmsFile;
      const response = await sendWhatsappLocation(params);
      const response_data = response.data;

      if (response_data.error_code === 200) {
        const items = response_data.results.data;

        // setMMSFile({})
        setIsLoading(false);

        fetchWhatsappChatHistory(1, activeUserNum);
        // triggerAlert('success', 'success', 'Recharged Successfully!!');
      } else {
        setIsLoading(false);
        // triggerAlert('error', 'Oops...', 'Recharge was unsuccessful');
      }
    } catch (error) {
      const response_data = error?.response?.data;
      setIsLoading(false);
      triggerAlert(
        "error",
        "Oops...",
        response_data ? response_data.message : "Something went wrong!"
      );
    }
  };

  const fetchMoreData = async (page) => {
    try {
      // Wait for the data from the next page
      const nextPageData = await fetchWhatsappChatHistory(page, activeUserNum);

      // Append the new data to the existing chat history
      setUserChatHistory((prevChatHistory) => [
        ...nextPageData,
        ...prevChatHistory,
      ]);
      // Increment the page number
      // setPage(prevPage => prevPage + 1);
    } catch (error) {
      console.error("Failed to fetch more data:", error);
    }
  };
  const handleFetchMoreData = async () => {
    if (page < totalPages) {
      // Preserve current scroll position
      const currentScrollHeight = chatContainerRef.current.scrollHeight;
      const currentScrollTop = chatContainerRef.current.scrollTop;

      setLoadingMore(true);
      await fetchMoreData(page + 1); // Fetch more data for the next page

      setLoadingMore(false);

      // Calculate new scroll position
      const newScrollHeight = chatContainerRef.current.scrollHeight;
      chatContainerRef.current.scrollTop =
        newScrollHeight - (currentScrollHeight - currentScrollTop);
    } else {
      setHasMore(false); // No more pages to load
    }
  };

  /////////////////////////////////// Send contacts /////////////////////////////////////
  // fetch all contacts
  const fetchAllContacts = async (searchKeyword = "") => {
    setIsLoading(true);
    try {
      const params = {
        keyword: searchKeyword,
      };
      const response = await listContact(params);
      const response_data = response.data;

      // Check if the response contains users
      if (response_data.error_code === 200) {
        const data = response_data.results;
        if (data.length > 0) {
          setContacts(data);
        } else {
          // No users found, handle this gracefully
          setContacts([]);
        }
      } else {
        // Handle other non-success cases
        setContacts([]);
      }
    } catch (error) {
      const response_data = error?.response?.data;
      triggerAlert(
        "error",
        "",
        response_data ? response_data.message : "Something went wrong!"
      );
    } finally {
      setIsLoading(false);
    }
  };
  // handle single contact select
  const handleCheckboxChange = (user) => {
    setSelectedContacts((prevContacts) => {
      const isSelected = prevContacts.some(
        (contact) => contact.number === user.contact_number
      );

      if (isSelected) {
        // Remove contact if already selected (based on number)
        return prevContacts.filter(
          (contact) => contact.number !== user.contact_number
        );
      } else {
        // Add new contact (based on name and number)
        return [
          ...prevContacts,
          { name: user.contact_name, number: user.contact_number },
        ];
      }
    });
  };
  // handle contact search
  const handleContactSearch = (e) => {
    const searchKeyword = e.target.value;
    fetchAllContacts(searchKeyword);
  };
  // handle send contact
  const sendContact = async () => {
    // return
    if (selectedContacts.length === 0) {
      triggerAlert("info", "", "Please select atleast one contact");
      return;
    }
    setIsLoading(true);

    try {
      const api_input = {
        person_name: activeUserName,
        to_number: activeUserNum,
        // person_name: "Amritha Sunny",
        // to_number: "917356889520",
        contact_list: selectedContacts && selectedContacts,
      };

      const response = await sendWhatsappContacts(api_input);
      const response_data = response.data;

      if (response_data.error_code === 200) {
        const items = response_data.results.data;
        setIsLoading(false);
        setSelectedContacts([]);
        handleShowContactCloseModal();
        fetchWhatsappChatHistory(1, activeUserNum);
        triggerAlert("success", "success", "Successfully sent!!");
      } else {
        setSelectedContacts([]);
        setIsLoading(false);
        // triggerAlert('error', 'Oops...', 'Recharge was unsuccessful');
      }
    } catch (error) {
      setSelectedContacts([]);
      const response_data = error?.response?.data;
      setIsLoading(false);
      triggerAlert(
        "error",
        "Oops...",
        response_data ? response_data.message : "Something went wrong!"
      );
    }
  };
  ////////////////////////////////////////send video recording /////////////////////////////
  const handleRecordingComplete = async (base64_files) => {
    // console.log('Received Base64 Data:', base64Data);
    // Perform any action with the Base64 data, such as sending it to a server
    // return
    if (!base64_files) {
      triggerAlert("info", "", "Please try again after sometime!!");
      return;
    }
    setIsLoading(true);

    try {
      const api_input = {
        person_name: activeUserName,
        to_number: activeUserNum,
        // person_name: "Amritha Sunny",
        // to_number: "917356889520",
        base64_files,
      };
      // console.log("api_input", api_input)
      // return

      const response = await sendWhatsappVideoandAudio(api_input);
      const response_data = response.data;

      if (response_data.error_code === 200) {
        const items = response_data.results.data;
        setIsLoading(false);
        handleVideoCloseModal();
        fetchWhatsappChatHistory(1, activeUserNum);
        triggerAlert("success", "success", "Successfully sent!!");
      } else {
        setIsLoading(false);
        // triggerAlert('error', 'Oops...', 'Recharge was unsuccessful');
      }
    } catch (error) {
      const response_data = error?.response?.data;
      setIsLoading(false);
      triggerAlert(
        "error",
        "Oops...",
        response_data ? response_data.message : "Something went wrong!"
      );
    }
  };

  /////////////////////////////////////// forward message ///////////////////////////
  const forwardMessage = async () => {
    if (selectedContacts.length === 0) {
      triggerAlert("info", "", "Please select atleast one contact");
      return;
    }
    setIsLoading(true);

    try {
      const api_input = {
        person_name: activeUserName,
        to_number: activeUserNum,
        // person_name: "Amritha Sunny",
        // to_number: "917356889520",
        whats_app_id: selectedMessageId,
        contact_list: selectedContacts && selectedContacts,
      };

      const response = await forwardWhatsappMessage(api_input);
      const response_data = response.data;

      if (response_data.error_code === 200) {
        const items = response_data.results.data;
        setIsLoading(false);
        setSelectedContacts([]);
        handleForwardCloseModal();
        fetchWhatsappChatHistory(1, activeUserNum);
        triggerAlert("success", "success", "Successfully sent!!");
      } else {
        setSelectedContacts([]);
        setIsLoading(false);
        // triggerAlert('error', 'Oops...', 'Recharge was unsuccessful');
      }
    } catch (error) {
      setSelectedContacts([]);
      const response_data = error?.response?.data;
      setIsLoading(false);
      triggerAlert(
        "error",
        "Oops...",
        response_data ? response_data.message : "Something went wrong!"
      );
    }
  };

  useEffect(() => {
    if (initialLoad) {
      // Scroll to the bottom when the component mounts
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
      }
      setInitialLoad(false);
    } else {
      // Reset hasMore when userChatHistory changes
      setHasMore(true); // or set it to an appropriate value based on your data logic
    }
  }, [userChatHistory, initialLoad]);



  useEffect(() => {

    fetchContacts(selectKey, 1, searchQuery);
  }, []);




  useEffect(() => {
    if (location) {
      // Once the location is available, call the API
      sendWhatsappLocationAPI(location.latitude, location.longitude);
    }
  }, [location]);

  ////////////////////////
  const fileInputRef = useRef(null);

  // Handle the "Upload files" click to trigger file input
  const handleAttachmentClick = () => {
    fileInputRef.current.click();
    setIsUploading(true); // Hide other elements when uploading
  };

  // const handleFileUpload = async (event) => {
  //   const files = event.target.files;
  //   const selectedFiles = Array.from(files);

  //   // Check if the total file count exceeds the maximum limit
  //   if (uploadedFiles.length + selectedFiles.length > MAX_FILE_LIMIT) {
  //     triggerAlert("info", "", "Maximum 10 files are allowed...");
  //     return;
  //   }

  //   if (files && files.length > 0) {
  //     const newFilesArray = [];
  //     for (let i = 0; i < files.length; i++) {
  //       if (uploadedFiles.length + newFilesArray.length < MAX_FILE_LIMIT) {
  //         const base64File = await getBase64(files[i]);
  //         const base64WithoutPrefix = base64File.substring(
  //           base64File.indexOf(",") + 1
  //         );
  //         newFilesArray.push({
  //           file_name: files[i].name,
  //           file_type: files[i].type,
  //           file_size: files[i].size,
  //           file: base64WithoutPrefix,
  //           preview: base64File,
  //         });
  //       } else {
  //         break; // Stop adding files after reaching the limit
  //       }
  //     }

  //     // Update the state to include both old and new files
  //     setUploadedFiles((prevFiles) => [...prevFiles, ...newFilesArray]);
  //     setShowAboveScreen(true);
  //     // setIsUploading(false);
  //   }
  // };

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    const selectedFiles = Array.from(files);

    // Disallowed programming file extensions
    const disallowedExtensions = ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'cs', 'rb'];

    // Check if the total file count exceeds the maximum limit
    if (uploadedFiles.length + selectedFiles.length > MAX_FILE_LIMIT) {
      triggerAlert("info", "", "Maximum 10 files are allowed...");
      return;
    }

    if (files && files.length > 0) {
      const newFilesArray = [];
      for (let i = 0; i < files.length; i++) {
        const fileExtension = files[i].name.split('.').pop().toLowerCase();

        // Validate against disallowed extensions
        if (disallowedExtensions.includes(fileExtension)) {
          triggerAlert("error", "", `Files with extension .${fileExtension} are not allowed.`);
          continue; // Skip this file and proceed with the next one
        }

        if (uploadedFiles.length + newFilesArray.length < MAX_FILE_LIMIT) {
          const base64File = await getBase64(files[i]);
          const base64WithoutPrefix = base64File.substring(
            base64File.indexOf(",") + 1
          );
          newFilesArray.push({
            file_name: files[i].name,
            file_type: files[i].type,
            file_size: files[i].size,
            file: base64WithoutPrefix,
            preview: base64File,
          });
        } else {
          break; // Stop adding files after reaching the limit
        }
      }

      // Update the state to include both old and new files
      setUploadedFiles((prevFiles) => [...prevFiles, ...newFilesArray]);
      setShowAboveScreen(true);
    }
  };


  const handleRemoveFile = (index, type) => {
    if (type === "all") {
      setShowAboveScreen(false);
      setIsUploading(false);
      setUploadedFiles([]);
    } else {
      const newUploadedFiles = uploadedFiles.filter((_, i) => i !== index);
      if (newUploadedFiles.length === 0) {
        setShowAboveScreen(false);
        setIsUploading(false);
        setUploadedFiles([]);
      } else {
        setUploadedFiles(newUploadedFiles);
      }
    }
  };
  const handleRemoveReply = () => {
    setShowAboveScreen(false);
    setReplyInfo({});
    setSelectedMessageId(null);
  };

  const handleReactionSelect = async (emoji) => {
    try {
      const api_input = {
        person_name: activeUserName,
        to_number: activeUserNum,
        // person_name: "Amritha Sunny",
        // to_number: "917356889520",
        message: emoji,
        msg_id: isHovered?.id,
      };

      const response = await reactToWhatsappMessage(api_input);
      const response_data = response.data;

      if (response_data.error_code === 200) {
        const items = response_data.results.data;
        fetchWhatsappChatHistory(1, activeUserNum);
        // triggerAlert('success', 'success', 'Successfully sent!!');
      } else {
        // triggerAlert('error', 'Oops...', 'Recharge was unsuccessful');
      }
    } catch (error) {
      const response_data = error?.response?.data;
      triggerAlert(
        "error",
        "Oops...",
        response_data ? response_data.message : "Something went wrong!"
      );
    } finally {
      setSelectedContacts([]);
      setIsHovered(null);
      setShowEmojisReaction(
        !showEmojisReaction
      )

    }
  };

  const handleAudioRecording = () => {
    setIsAudioRecording(true);
  };

  const handleSaveAudio = async (audioFileDetails) => {
    if (!audioFileDetails) {
      triggerAlert("info", "", "Please try again after sometime!!");
      return;
    }
    setIsLoading(true);

    try {
      const api_input = {
        person_name: activeUserName,
        to_number: activeUserNum,
        // person_name: "Amritha Sunny",
        // to_number: "917356889520",
        base64_files: [audioFileDetails],
      };
      // console.log("api_input", api_input)
      // return

      const response = await sendWhatsappVideoandAudio(api_input);
      const response_data = response.data;

      if (response_data.error_code === 200) {
        const items = response_data.results.data;
        setIsLoading(false);
        setIsAudioRecording(false);
        fetchWhatsappChatHistory(1, activeUserNum);
        triggerAlert("success", "success", "Successfully sent!!");
      } else {
        setIsLoading(false);
        // triggerAlert('error', 'Oops...', 'Recharge was unsuccessful');
      }
    } catch (error) {
      const response_data = error?.response?.data;
      setIsLoading(false);
      triggerAlert(
        "error",
        "Oops...",
        response_data ? response_data.message : "Something went wrong!"
      );
    }
  };

  const handleAudioCancel = () => {
    setIsAudioRecording(false);
    fetchWhatsappChatHistory(1, activeUserNum);
  };
  //////////////////////////////////// Receiving socket /////////////////////////////
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    if (!activeUserNum) return; // Ensure activeUserNum is not null or undefined

    // Set up event listener for receiving chat messages
    socket.on("send_whatsapp_message", (newData) => {
      // Check for the socket_type in the response
      if (newData.socket_type === "status_update") {
        // Call function to handle 'seen' status update
        fetchWhatsappChatHistory(1, activeUserNum);
      } else if (newData.from_no == activeUserNum) {
        // Handle new chat messages
        fetchWhatsappChatHistory(1, activeUserNum);
      } else {
        // Handle contact list update
        setPageNumber(1);
        fetchContacts(selectKey, 1, searchQuery);
      }
    });

    // Clean up on unmount
    return () => {
      socket.off("send_whatsapp_message");
    };
  }, [socket, activeUserNum]);


  const handleKeySearch = (e) => {
    setSearchQuery(e.target.value);
    const searchkey = e.target.value;
    setPageNumber(1);
    fetchContacts(selectKey, 1, searchkey); // Update search results on every change
  };

  const bulkSendTemplate = async (data) => {
    try {
      setIsLoading(true);

      let api_input = {
        template_data: selectedTemplateDrop, // Full selected template object
        ...(headerInputValueBulk && { header_text: headerInputValueBulk }), // Add header text if available
        ...(Object.keys(bodyInputValuesBulk).length > 0 && { body_dynamic: bodyInputValuesBulk }), // Add body inputs if available
      };

      // If a file is uploaded, convert it to Base64 and add to the input
      if (data.fileUpload && data.fileUpload[0]) {
        const file = await getBase64(data.fileUpload[0]);
        const trimmedFile = file.split(',')[1]; // Extract the base64 content
        api_input = { ...api_input, base_64_file: trimmedFile }; // Add file to the input
      }
      // console.log(api_input);
      // return

      // Send the API request
      const response = await BulkSendTemp(api_input);
      const response_data = response.data;

      if (response_data.error_code === 200) {
        triggerAlert("success", "", 'Template sent successfully');
        handleCloseBulkSendModal();
      } else {
        triggerAlert("error", "", "Something went wrong!");
      }
    } catch (error) {
      console.error(error);
      triggerAlert('error', '', "Something went wrong!");
    } finally {
      setIsLoading(false); // Ensure loading state is reset
    }
  };

  //////////// Send Templetes//////////////////
  const handleClose = () => setShow(false);
  const handleShow = () => {
    setShow(true);
    handleFetchTemplateData();
  }

  const handleFetchTemplateData = async () => {
    try {
      const response = await fetchTempData();
      const response_data = response?.data;
      if (response_data.error_code === 200) {
        const items = response_data?.results?.response?.data;
        setTemplateData(items);
      } else {
        setTemplateData([]);
      }

    } catch (error) {
      triggerAlert("error", "Oops...", "Failed to fetch template data");
    }
  };

  const AddTemplate = async (formData) => {
    setIsLoading(true);
    try {
      // Prepare the `body_dynamic` as a key-value object (e.g., {0: "value1", 1: "value2"})
      const bodyDynamicFormatted = {};
      Object.keys(bodyInputValuesBulk).forEach((key) => {
        bodyDynamicFormatted[key] = bodyInputValuesBulk[key];
      });

      // Construct the payload
      const api_input = {
        to_number: [formData.contact_number],
        contact_type: "contact",
        template_data: selectedTemplateDrop,
        ...(headerInputValueBulk && { header_text: headerInputValueBulk }), // Add header text if available
        ...(Object.keys(bodyDynamicFormatted).length > 0 && { body_dynamic: bodyDynamicFormatted }), // Add body_dynamic if available
      };

      // Make the API call
      const response = await createtemplate(api_input);
      const response_data = response.data;

      if (response_data.error_code === 200) {
        setIsLoading(false);
        handleClose();
        triggerAlert("success", "Success", "Template sent successfully!");
      } else {
        setIsLoading(false);
        triggerAlert("error", "Oops...", response_data.message || "Template creation was unsuccessful.");
      }
    } catch (error) {
      setIsLoading(false);
      triggerAlert(
        "error",
        "Oops...",
        error?.response?.data?.message || "Something went wrong!"
      );
    }
  };

  const updateSeenStatus = async (selectednum, usernum) => {
    try {
      const params = {
        selected_number: selectednum,
        user_number: usernum,
      }
      const response = await updateWhatsappSeenStatus(params);
      const response_data = response.data;

      if (response_data.error_code === 200) {
        const items = response_data.results;
        fetchContacts(selectKey, 1, searchQuery);
      } else {
        // triggerAlert('error', 'Oops...', 'Recharge was unsuccessful');
      }
    } catch (error) {
      // const response_data = error?.response?.data
      // triggerAlert('error', 'Oops...', response_data ? response_data.message : "Something went wrong!");
    }
  }

  /////////////////////// Opt out ////////////////////////
  const handleCloseOptout = () => setShowOptout(false);
  const handleShowOptout = () => {
    setShowOptout(true);
  }

  const handleInboxData = async (e) => {
    const isChecked = e.target.checked;  // `true` if checked, `false` if unchecked
    console.log("isChecked", isChecked);
    setOptedOut(isChecked);
    // return
    try {
      const api_input = {
        contact_number: activeUserNum, // Ensure contact_number is a string
        stop_promotions: isChecked ? 1 : 0,
      };

      // Assuming 'fetchInboxData' accepts payload
      const response = await fetchOptOutData(api_input);  // Passing payload to the API
      const response_data = response?.data;

      if (response_data?.error_code === 200) {
        const successMessage = response_data?.message || 'Contact has been opted out successfully'; // Use the message from the API if available
        triggerAlert("success", "", successMessage); // Success alert with dynamic message


      } else {
        triggerAlert("error", "Error", response_data?.message || "Something went wrong"); // Handle failure case with the message from the API
      }

    } catch (error) {
      const error_message = error?.response?.data?.message;
      triggerAlert("error", "Oops...", error_message || "Failed to fetch opted out data");
    } finally {
      handleCloseOptout();
    }
  };


  ///////////////////////// Bulk Send ////////////////////////////

  const getShortenedPath = (path) => {
    const maxLength = Math.ceil(path.length / 2);
    return path.length > maxLength ? path.substring(0, maxLength) + '...' : path;
  };

  return (
    <main class="main-content mt-3 mb-4">
      <div class="container content-inner" id="page_layout">
        {/* <PageTitle heading="Inbox" showWarningButton="Bulk Send" onWarningClick={handleShowBulkSendModal}  showPrimaryButton="Create Contact" onWarningClick={handleShow} /> */}
        <PageTitle
          heading="Broadcast Channels"
          showWarningButton="Add Channel"
          onWarningClick={handleAddChannel}
          // showPrimaryButton="Add Cahnnel"
          onPrimaryClick={handleShow}
        />
        <div class="row w-100">
          <div class="col-md-3">
            <aside
              className="sidebar-chat sidebar-base border-end shadow-none rounded-2"
              data-sidebar="responsive"
            >
              {/* {contactList.length > 0 && ( */}
              <div className="chat-search pt-3 px-3 ">
                <div className="chat-searchbar mt-4 mb-2 ">
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
                <div className="select-chat mt-3">
                  <select
                    className="form-select"
                    id="exampleFormControlSelect1"
                    onChange={handleSelect}
                    value={selectKey}
                  >
                    <option value="all">All chats</option>
                    <option value="read">Read</option>
                    <option value="unread">Unread</option>
                    <option value="hrs">Last 24 hours</option>
                  </select>
                </div>
              </div>
              {/* )} */}

              <div
                className="sidebar-body pt-0 data-scrollbar mb-5 pb-5 pe-2"
                id="scrollableDivContacts"
                ref={contactsContainerRef}
                style={{
                  overflow: "auto",
                  display: "flex",
                  flexDirection: "column",
                  maxHeight: '572px'
                }}
              >
                <ul
                  className="nav navbar-nav iq-main-menu mt-3"
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
                          key={item.from_no}
                          className={`nav-item iq-chat-list ${activeUserNum === item.from_no ? "active" : ""
                            }`}
                          onClick={() =>
                            handleContactClick(item.from_no, item.contact_name, item.to_no, item.opted_out)
                          }
                        >
                          <a
                            href={`#user-content-${activeUserNum}`}
                            className={`nav-link d-flex gap-1 px-2 ${activeUserNum === item.from_no ? "active" : ""
                              }`}
                            data-bs-toggle="tab"
                            role="tab"
                            aria-controls={`#user-content-${activeUserNum}`}
                            aria-selected="true"
                          >
                            <div className="position-relative">
                              <span className="badge badge-pill btn btn-soft-danger font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2 ">
                                {item.contact_name ? item.contact_name[0] : "-"}
                              </span>
                            </div>
                            <div className="d-flex align-items-center w-100 iq-userlist-data">
                              <div className="d-flex flex-grow-1 flex-column">
                                <div className="d-flex align-items-center gap-1">
                                  <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">
                                    {item.contact_name
                                      ? truncateName(item.contact_name, 11)
                                      : "-"}
                                  </p>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                  <small className="text-ellipsis short-1 flex-grow-1 chat-small">
                                    {item.from_no ? item.from_no : "-"}
                                  </small>
                                </div>


                              </div>
                              <div className="">
                                <div className="d-flex align-items-center">
                                  <small className="text-capitalize">
                                    {item.created_at
                                      ? formatDateTime(
                                        item.created_at,
                                        "yyyy-mm-dd"
                                      )
                                      : "-"}
                                    , <br />
                                    {item.created_at
                                      ? formatDateTime(
                                        item.created_at,
                                        "hh:mm:ss"
                                      )
                                      : "-"}
                                  </small>
                                </div>
                              </div>
                              {item.unseen_count !== 0 && (
                                <span className="badge rounded-pill bg-success badge-30">
                                  {item.unseen_count}
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
              <div
                class="card tab-pane mb-0 fade show active"
                id="user-content-101"
                role="tabpanel"
              >
                {userChatHistory.length > 0 ? (
                  <>
                    <div class="chat-head">
                      <header class="d-flex justify-content-between align-items-center bg-white pt-3  ps-3 pe-3 pb-3 border-bottom rounded-top">
                        <div class="d-flex align-items-center">
                          <div class="position-relative">
                            <span class="badge badge-pill btn btn-soft-danger font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2 ">
                              {activeUserName ? activeUserName[0] : "-"}
                            </span>
                          </div>
                          <div class="d-flex align-items-center w-100 iq-userlist-data">
                            <div class="d-flex flex-grow-1 flex-column">
                              <div class="d-flex align-items-center h-19">
                                <p class="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">
                                  {activeUserName ? truncateName(activeUserName, 11) : "-"}
                                </p>
                                <a
                                  href="#/"
                                  class="btn btn-icon btn-soft-success btn-sm ms-3 rounded-pill"
                                  // data-bs-toggle="modal"
                                  // data-bs-target="#exampleModalCenter-view"
                                  onClick={handleShowOptout}
                                >
                                  <span class="btn-inner">
                                    <i class="material-symbols-outlined md-18">
                                      {" "}
                                      visibility
                                    </i>
                                  </span>
                                </a>
                              </div>
                              <div class="d-flex align-items-center gap-2">
                                <small class="text-ellipsis short-1 flex-grow-1 chat-small">
                                  {activeUserNum ? activeUserNum : "-"}
                                </small>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="chat-header-icons d-inline-flex ms-auto">
                          <div id="the-final-countdown" className={`color-full ${optedOut ? 'bg-warning text-dark' : isExpired ? 'bg-danger' : 'bg-success'} `}>
                            <p style={{ marginBottom: 0 }}>{optedOut ? 'Opted-out' : isExpired ? 'Expired' : timeLeft}</p>
                            <h5 class="text-center  time-remain">
                              TIME REMAINING
                            </h5>
                          </div>
                        </div>
                      </header>
                    </div>
                    <div class="card-body chat-body bg-body">
                      <div
                        id="scrollableDiv"
                        ref={chatContainerRef}
                        style={{
                          overflow: "auto",
                          display: "flex",
                          flexDirection: "column-reverse",
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
                          {loadingMore && (
                            <h4 className="text-center text-danger">
                              <SpinnerLoader />
                            </h4>
                          )}
                          {userChatHistory.map((item, index) => {
                            // Format the date of the current message
                            const messageDate = getFormattedDate(
                              item.created_at,
                              "mm-dd-yyyy"
                            );
                            // Get the date of the previous message (or null if it's the first message)
                            const prevMessageDate =
                              index > 0
                                ? getFormattedDate(
                                  userChatHistory[index - 1].created_at,
                                  "mm-dd-yyyy"
                                )
                                : null;
                            return (
                              <React.Fragment key={item.whats_app_id}>
                                {/* Render the date header if it's the first message or the date has changed */}
                                {(index === 0 ||
                                  messageDate !== prevMessageDate) && (
                                    <div className="chat-day-title">
                                      <span className="main-title">
                                        {messageDate}
                                      </span>
                                    </div>
                                  )}
                                {item.direction == "IN" ? (
                                  <div
                                    class="iq-message-body iq-other-user  gap-0"
                                    onMouseOver={() =>
                                      handleMouseOver(item.message_id, item.whats_app_id)
                                    }
                                    onMouseOut={handleMouseOut}
                                    style={{ position: "relative" }} // Ensuring positioning for absolute icon placement
                                  >
                                    <div class="chat-profile">
                                      <span class="badge badge-pill bg-soft-info font-weight-normal ms-auto me-2 badge-45 md-14 rounded-circle p-2 ">
                                        <span class="material-symbols-outlined">
                                          person_outline
                                        </span>
                                      </span>
                                    </div>

                                    <div class="iq-chat-text">
                                      <div class="d-flex align-items-center justify-content-start">
                                        <div class="iq-chating-content ">
                                          <div class="d-flex align-items-center gap-1">
                                            <p class="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-chat text-info">
                                              {activeUserName
                                                ? activeUserName
                                                : item.from_no
                                                  ? item.from_no
                                                  : "-"}
                                            </p>
                                            <div class="chat-lft p-1">
                                              <div class="dropdown-container">
                                                <div class="dropdown chat-drop-l">
                                                  <span
                                                    class="material-symbols-outlined fs-2"
                                                    id="dropdownMenuButton9 "
                                                    data-bs-toggle="dropdown"
                                                    aria-expanded="false"
                                                    role="button"
                                                  >
                                                    keyboard_arrow_down
                                                  </span>
                                                  <div
                                                    class="dropdown-menu dropdown-menu-end"
                                                    aria-labelledby="dropdownMenuButton9"
                                                  >
                                                    <a
                                                      class="dropdown-item"
                                                      href="#/"
                                                      onClick={() =>
                                                        handleReplyShow(
                                                          item.message_id,
                                                          item.message,
                                                          item.direction
                                                        )
                                                      }
                                                    >
                                                      Reply
                                                    </a>
                                                    <a
                                                      class="dropdown-item"
                                                      href="#/"
                                                      onClick={() =>
                                                        handleForwardShow(
                                                          item.whats_app_id
                                                        )
                                                      }
                                                    >
                                                      Forward
                                                    </a>
                                                    {/* <a class="dropdown-item" href="javascript:void(0);">Delete</a> */}
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                          {item.reply_body_type && (
                                            <div className="bg-light rounded px-1">
                                              <p class="fw-semibold mb-0">
                                                {item.reply_msg_name
                                                  ? item.reply_msg_name
                                                  : null}
                                              </p>
                                              <p class="mr-2 mb-1 px-2">
                                                {item.reply_msg_body
                                                  ? item.reply_msg_body
                                                  : null}
                                              </p>
                                            </div>
                                          )}

                                          {item.message_type == "text" ? (
                                            <p class="mr-2 mb-3">
                                              {item.message
                                                ? item.message
                                                : null}
                                            </p>
                                          ) : item.message_type == "image" ? (
                                            <div>
                                              <img
                                                src={item.attachment_path}
                                                class="img-fluid rounded"
                                                alt="chat-img"
                                                style={{ width: "316px" }}
                                              />
                                            </div>
                                          ) : item.message_type ==
                                            "location" ? (
                                            <div>
                                              <DynamicLocation
                                                url={item.image_id}
                                              />
                                            </div>
                                          ) : item.message_type == "audio" ? (
                                            <div>
                                              <audio
                                                controls
                                                onError={() =>
                                                  console.error(
                                                    "Failed to load audio"
                                                  )
                                                }
                                              >
                                                <source
                                                  src={item.attachment_path?.replace(
                                                    "//",
                                                    "/"
                                                  )} // Clean URL format
                                                  type="audio/mp4" // Adjust MIME type if needed
                                                />
                                                Your browser does not support
                                                the audio tag.
                                              </audio>
                                            </div>
                                          ) : item.message_type == "video" ? (
                                            <div>
                                              <div
                                                id="trailer"
                                                class="section d-flex justify-content-center embed-responsive embed-responsive-4by3"
                                                style={{
                                                  height: "20rem",
                                                  width: "100%",
                                                }}
                                              >
                                                <video
                                                  class="embed-responsive-item"
                                                  controls
                                                  controlsList="nodownload"
                                                >
                                                  <source
                                                    src={item.attachment_path}
                                                    type="video/mp4"
                                                  />
                                                  Your browser does not support
                                                  the video tag.
                                                </video>
                                              </div>
                                            </div>
                                          ) : item.message_type ==
                                            "contacts" ? (
                                            <div>
                                              <div class="d-flex justify-content-between  ">
                                                <div class="">
                                                  <span class="badge badge-pill btn btn-soft-danger font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2 ">
                                                    {/* <span class="material-symbols-outlined"> */}
                                                    {item.message
                                                      ? item.message[0]
                                                      : "-"}
                                                    {/* </span> */}
                                                  </span>
                                                </div>
                                                <div class="w-100 ">
                                                  <div class="">
                                                    <h5 class=" me-1 pe-5 send-cntct">
                                                      {item.message
                                                        ? item.message
                                                        : "-"}
                                                    </h5>
                                                  </div>
                                                  <p class="mb-0">
                                                    {item.image_id
                                                      ? item.image_id
                                                      : "-"}
                                                  </p>
                                                  <div class="d-flex justify-content-between align-items-center flex-wrap"></div>
                                                </div>
                                              </div>
                                              {/* <hr class="my-1" /> */}
                                              <div class="mb-2">
                                                <div class="d-flex justify-content-between align-items-center">
                                                  {/* <div class="d-flex align-items-center me-3">
                                                                                                                        <a href="#/">    <span class="card-text-1 ms-1">Message</span></a>
                                                                                                                    </div>
                                                                                                                    <div class="d-flex align-items-center me-3">
                                                                                                                        <a href="#/"><span class="card-text-1 ms-1">Add a group</span></a>
                                                                                                                    </div> */}
                                                </div>
                                                <span class="card-text-2">
                                                  5.2k people love it
                                                </span>
                                              </div>
                                            </div>
                                          ) : null}

                                          <div class="chat-time-position">
                                            <div class="chat-time-right">
                                              <small class="text-capitalize">
                                                {item.created_at
                                                  ? formatTimeToAmandPM(
                                                    item.created_at
                                                  )
                                                  : "-"}
                                              </small>
                                            </div>
                                          </div>
                                          {item.reaction_message_id && (
                                            <div className="chat-reaction p-1">
                                              <div className="reaction">
                                                <small>
                                                  {item.reaction_emoji}
                                                </small>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                        {(item.message_type == "text" ||
                                          item.message_type == "contacts") && (
                                            <TextToSpeech
                                              text={
                                                item.message_type == "contact"
                                                  ? item.message + item.image_id
                                                  : item.message
                                              }
                                            />
                                          )}
                                        {/* Conditionally render the smile icon */}
                                        {isHovered?.whatsAppId === item.whats_app_id && (
                                          <>
                                            <a
                                              href="#/"
                                              class="d-flex align-items-center pe-3"
                                              onClick={() =>
                                                setShowEmojisReaction(
                                                  !showEmojisReaction
                                                )
                                              }
                                            >
                                              <svg
                                                class="icon-24"
                                                width="20"
                                                viewBox="0 0 24 25"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                              >
                                                <g clip-path="url(#clip0_156_599)">
                                                  <path
                                                    d="M20.4853 4.01473C18.2188 1.74823 15.2053 0.5 12 0.5C8.79469 0.5 5.78119 1.74823 3.51473 4.01473C1.24819 6.28119 0 9.29469 0 12.5C0 15.7053 1.24819 18.7188 3.51473 20.9853C5.78119 23.2518 8.79469 24.5 12 24.5C15.2053 24.5 18.2188 23.2518 20.4853 20.9853C22.7518 18.7188 24 15.7053 24 12.5C24 9.29469 22.7518 6.28119 20.4853 4.01473ZM12 23.0714C6.17091 23.0714 1.42856 18.3291 1.42856 12.5C1.42856 6.67091 6.17091 1.92856 12 1.92856C17.8291 1.92856 22.5714 6.67091 22.5714 12.5C22.5714 18.3291 17.8291 23.0714 12 23.0714Z"
                                                    fill="currentcolor"
                                                  ></path>
                                                  <path
                                                    d="M9.40398 9.3309C8.23431 8.16114 6.33104 8.16123 5.16136 9.3309C4.88241 9.60981 4.88241 10.0621 5.16136 10.3411C5.44036 10.62 5.89266 10.62 6.17157 10.3411C6.78432 9.72836 7.78126 9.7284 8.39392 10.3411C8.53342 10.4806 8.71618 10.5503 8.89895 10.5503C9.08171 10.5503 9.26457 10.4806 9.40398 10.3411C9.68293 10.0621 9.68293 9.60986 9.40398 9.3309Z"
                                                    fill="currentcolor"
                                                  ></path>
                                                  <path
                                                    d="M18.8384 9.3309C17.6688 8.16123 15.7655 8.16114 14.5958 9.3309C14.3169 9.60981 14.3169 10.0621 14.5958 10.3411C14.8748 10.62 15.3271 10.62 15.606 10.3411C16.2187 9.72836 17.2156 9.72831 17.8284 10.3411C17.9679 10.4806 18.1506 10.5503 18.3334 10.5503C18.5162 10.5503 18.699 10.4806 18.8384 10.3411C19.1174 10.0621 19.1174 9.60986 18.8384 9.3309Z"
                                                    fill="currentcolor"
                                                  ></path>
                                                  <path
                                                    d="M18.3335 13.024H5.6668C5.2723 13.024 4.95251 13.3438 4.95251 13.7383C4.95251 17.6243 8.11409 20.7859 12.0001 20.7859C15.8862 20.7859 19.0477 17.6243 19.0477 13.7383C19.0477 13.3438 18.728 13.024 18.3335 13.024ZM12.0001 19.3573C9.14366 19.3573 6.77816 17.215 6.42626 14.4525H17.574C17.2221 17.215 14.8566 19.3573 12.0001 19.3573Z"
                                                    fill="currentcolor"
                                                  ></path>
                                                </g>
                                                <defs>
                                                  <clipPath>
                                                    <rect
                                                      width="24"
                                                      height="24"
                                                      fill="white"
                                                      transform="translate(0 0.5)"
                                                    ></rect>
                                                  </clipPath>
                                                </defs>
                                              </svg>
                                            </a>
                                            {showEmojisReaction && (
                                              <Emojis
                                                reaction={true}
                                                allowExpand={false}
                                                onEmojiSelect={
                                                  handleReactionSelect
                                                }
                                              />
                                            )}
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div
                                    class="iq-message-body iq-current-user"
                                    onMouseOver={() =>
                                      handleMouseOver(item.message_id, item.whats_app_id)
                                    }
                                    onMouseOut={handleMouseOut}
                                  >
                                    <div class="iq-chat-text">
                                      <div class="d-flex align-items-center justify-content-end">
                                        {/* Conditionally render the smile icon */}
                                        {isHovered?.whatsAppId === item.whats_app_id && (
                                          <>
                                            {showEmojisReaction && (
                                              <Emojis
                                                reaction={true}
                                                allowExpand={false}
                                                onEmojiSelect={
                                                  handleReactionSelect
                                                }
                                              />
                                            )}
                                            <a
                                              href="#/"
                                              class="d-flex align-items-center pe-3"
                                              onClick={() =>
                                                setShowEmojisReaction(
                                                  !showEmojisReaction
                                                )
                                              }
                                            >
                                              <svg
                                                class="icon-24"
                                                width="20"
                                                viewBox="0 0 24 25"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                              >
                                                <g clip-path="url(#clip0_156_599)">
                                                  <path
                                                    d="M20.4853 4.01473C18.2188 1.74823 15.2053 0.5 12 0.5C8.79469 0.5 5.78119 1.74823 3.51473 4.01473C1.24819 6.28119 0 9.29469 0 12.5C0 15.7053 1.24819 18.7188 3.51473 20.9853C5.78119 23.2518 8.79469 24.5 12 24.5C15.2053 24.5 18.2188 23.2518 20.4853 20.9853C22.7518 18.7188 24 15.7053 24 12.5C24 9.29469 22.7518 6.28119 20.4853 4.01473ZM12 23.0714C6.17091 23.0714 1.42856 18.3291 1.42856 12.5C1.42856 6.67091 6.17091 1.92856 12 1.92856C17.8291 1.92856 22.5714 6.67091 22.5714 12.5C22.5714 18.3291 17.8291 23.0714 12 23.0714Z"
                                                    fill="currentcolor"
                                                  ></path>
                                                  <path
                                                    d="M9.40398 9.3309C8.23431 8.16114 6.33104 8.16123 5.16136 9.3309C4.88241 9.60981 4.88241 10.0621 5.16136 10.3411C5.44036 10.62 5.89266 10.62 6.17157 10.3411C6.78432 9.72836 7.78126 9.7284 8.39392 10.3411C8.53342 10.4806 8.71618 10.5503 8.89895 10.5503C9.08171 10.5503 9.26457 10.4806 9.40398 10.3411C9.68293 10.0621 9.68293 9.60986 9.40398 9.3309Z"
                                                    fill="currentcolor"
                                                  ></path>
                                                  <path
                                                    d="M18.8384 9.3309C17.6688 8.16123 15.7655 8.16114 14.5958 9.3309C14.3169 9.60981 14.3169 10.0621 14.5958 10.3411C14.8748 10.62 15.3271 10.62 15.606 10.3411C16.2187 9.72836 17.2156 9.72831 17.8284 10.3411C17.9679 10.4806 18.1506 10.5503 18.3334 10.5503C18.5162 10.5503 18.699 10.4806 18.8384 10.3411C19.1174 10.0621 19.1174 9.60986 18.8384 9.3309Z"
                                                    fill="currentcolor"
                                                  ></path>
                                                  <path
                                                    d="M18.3335 13.024H5.6668C5.2723 13.024 4.95251 13.3438 4.95251 13.7383C4.95251 17.6243 8.11409 20.7859 12.0001 20.7859C15.8862 20.7859 19.0477 17.6243 19.0477 13.7383C19.0477 13.3438 18.728 13.024 18.3335 13.024ZM12.0001 19.3573C9.14366 19.3573 6.77816 17.215 6.42626 14.4525H17.574C17.2221 17.215 14.8566 19.3573 12.0001 19.3573Z"
                                                    fill="currentcolor"
                                                  ></path>
                                                </g>
                                                <defs>
                                                  <clipPath>
                                                    <rect
                                                      width="24"
                                                      height="24"
                                                      fill="white"
                                                      transform="translate(0 0.5)"
                                                    ></rect>
                                                  </clipPath>
                                                </defs>
                                              </svg>
                                            </a>
                                          </>
                                        )}
                                        {(item.message_type == "text_message" ||
                                          item.message_type == "contact") && (
                                            <TextToSpeech
                                              text={
                                                item.message_type == "contact"
                                                  ? item.message + item.image_id
                                                  : item.message
                                              }
                                            />
                                          )}

                                        <div class="iq-chating-content position-relative mt-3">
                                          {(item.message_type == "MARKETING" ||
                                            item.message_type == "UTILITY" ||
                                            item.message_type ==
                                            "AUTHENTICATION") && (
                                              <div
                                                className={`badge chat-template fw-semibold ${item.message_type == "MARKETING"
                                                  ? "badge-success"
                                                  : item.message_type ==
                                                    "UTILITY"
                                                    ? "badge-warning"
                                                    : "badge-warning"
                                                  }`}
                                              >
                                                {item.message_type}
                                              </div>
                                            )}

                                          <div class="align-items-center gap-1">
                                            {item.forwarded == 1 && (
                                              <>
                                                <p class="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-chat text-secondary">
                                                  <i class="fa fa-share"></i>
                                                  &nbsp; Forwarded
                                                </p>
                                                <hr
                                                  className="my-1"
                                                  style={{
                                                    borderTop:
                                                      "1px solid #232121 !important",
                                                  }}
                                                />
                                              </>
                                            )}

                                            <div class="chat-right ">
                                              <div class="dropdown-container">
                                                <div class="dropdown chat-drop">
                                                  <span
                                                    class="material-symbols-outlined fs-2"
                                                    id="dropdownMenuButton9 "
                                                    data-bs-toggle="dropdown"
                                                    aria-expanded="false"
                                                    role="button"
                                                  >
                                                    keyboard_arrow_down
                                                  </span>
                                                  <div
                                                    class="dropdown-menu dropdown-menu-end"
                                                    aria-labelledby="dropdownMenuButton9"
                                                  >
                                                    <a
                                                      class="dropdown-item "
                                                      href="#/"
                                                      onClick={() =>
                                                        handleReplyShow(
                                                          item.message_id,
                                                          item.message,
                                                          item.direction
                                                        )
                                                      }
                                                    >
                                                      Reply
                                                    </a>
                                                    <a
                                                      class="dropdown-item"
                                                      href="#/"
                                                      onClick={() =>
                                                        handleForwardShow(
                                                          item.whats_app_id
                                                        )
                                                      }
                                                    >
                                                      Forward
                                                    </a>
                                                    {/* <a class="dropdown-item " href="javascript:void(0);">Delete</a> */}
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                          {item.reply_body_type && (
                                            <div className="bg-light rounded px-1">
                                              <p class="fw-semibold mb-0">
                                                {item.reply_msg_name
                                                  ? item.reply_msg_name
                                                  : null}
                                              </p>
                                              <p class="mr-2 mb-1 px-2">
                                                {item.reply_msg_body
                                                  ? item.reply_msg_body
                                                  : null}
                                              </p>
                                            </div>
                                          )}

                                          {item.message_type ==
                                            "text_message" ? (
                                            <p class="mr-2 mb-1 px-1">
                                              {item.message
                                                ? item.message
                                                : null}
                                            </p>
                                          ) : item.message_type == "image" ? (
                                            <div>
                                              <img
                                                src={item.attachment_path}
                                                class="img-fluid rounded"
                                                alt="chat-img"
                                                style={{ width: "316px" }}
                                              />
                                            </div>
                                          ) : item.message_type ==
                                            "location" ? (
                                            <div>
                                              <DynamicLocation
                                                url={item.image_id}
                                              />
                                            </div>
                                          ) : item.message_type == "audio" ? (
                                            <div>
                                              <audio
                                                controls
                                                onError={() =>
                                                  console.error(
                                                    "Failed to load audio"
                                                  )
                                                }
                                              >
                                                <source
                                                  src={item.attachment_path?.replace(
                                                    "//",
                                                    "/"
                                                  )} // Clean URL format
                                                  type="audio/mp4" // Adjust MIME type if needed
                                                />
                                                Your browser does not support
                                                the audio tag.
                                              </audio>
                                            </div>
                                          ) : item.message_type == "video" ? (
                                            <div>
                                              <div
                                                id="trailer"
                                                class="section d-flex justify-content-center embed-responsive embed-responsive-4by3"
                                                style={{
                                                  height: "20rem",
                                                  width: "100%",
                                                }}
                                              >
                                                <video
                                                  class="embed-responsive-item"
                                                  controls
                                                  controlsList="nodownload"
                                                >
                                                  <source
                                                    src={item.attachment_path}
                                                    type="video/mp4"
                                                  />
                                                  Your browser does not support
                                                  the video tag.
                                                </video>
                                              </div>
                                            </div>
                                            ////// PDF ///////
                                          ) : item.message_type == "document" && item.attachment_path?.endsWith(".pdf") ? (
                                            <div className="d-flex bg-light rounded p-3" >
                                              <div className="me-2">
                                                {/* <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24" fill="#34B7F1">
                                                  <path d="M8 16h8v2H8zm0-4h8v2H8zm6-10H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
                                                </svg> */}
                                                <FaFilePdf style={{ fontSize: 'xx-large', color: '#f04b4c' }} />

                                              </div>
                                              <div className="d-flex justify-content-between align-items-center">
                                                <p className="mb-1 text-truncate">{getShortenedPath(item.attachment_path?.split('/').pop()) || "-"}</p>
                                                <button
                                                  className="btn btn-outline-light btn-sm py-0 px-2"
                                                  onClick={() => downloadFile(item.attachment_path, item.attachment_path?.split('/').pop())}
                                                >
                                                  <MdOutlineDownloading style={{ fontSize: 'x-large', color: 'grey' }} />
                                                </button>
                                              </div>
                                            </div>

                                            ////// Excel //////////
                                          ) : item.message_type === "document" && /\.(csv|sheet)$/i.test(item.attachment_path || "") ? (
                                            <div className="d-flex bg-light rounded p-3">
                                              <div className="me-2">
                                                <SiGooglesheets style={{ fontSize: 'xx-large', color: '#09a25f' }} />


                                              </div>
                                              <div className="d-flex justify-content-between align-items-center">
                                                <p className="mb-1 text-truncate">{getShortenedPath(item.attachment_path?.split('/').pop()) || "-"}</p>
                                                <button className="btn btn-outline-light btn-sm py-0 px-2" onClick={() => downloadFile(item.attachment_path, item.attachment_path?.split('/').pop())}>
                                                  <MdOutlineDownloading style={{ fontSize: 'x-large', color: 'grey' }} />
                                                </button>
                                              </div>
                                            </div>

                                          ) : item.message_type == "contact" ? (
                                            <div>
                                              <div class="d-flex justify-content-between  ">
                                                <div class="">
                                                  <span class="badge badge-pill btn btn-soft-danger font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2 ">
                                                    {/* <span class="material-symbols-outlined"> */}
                                                    {item.message
                                                      ? item.message[0]
                                                      : "-"}
                                                    {/* </span> */}
                                                  </span>
                                                </div>
                                                <div class="w-100 ">
                                                  <div class="">
                                                    <h5 class=" me-1 pe-5 send-cntct">
                                                      {item.message
                                                        ? item.message
                                                        : "-"}
                                                    </h5>
                                                  </div>
                                                  <p class="mb-0">
                                                    {item.image_id
                                                      ? item.image_id
                                                      : "-"}
                                                  </p>
                                                  <div class="d-flex justify-content-between align-items-center flex-wrap"></div>
                                                </div>
                                              </div>
                                            </div>
                                          ) : (
                                            (item.message_type == "MARKETING" ||
                                              item.message_type == "UTILITY" ||
                                              item.message_type ==
                                              "AUTHENTICATION") && (
                                              <div>
                                                <div className="d-flex justify-content-between">
                                                  <div className="w-100">
                                                    {item.template_data
                                                      ?.response?.data?.length >
                                                      1 ? (
                                                      // Loop through the template data and find the matching name
                                                      item?.template_data?.response?.data?.map(
                                                        (template, index) =>
                                                          template?.name ===
                                                          item?.image_id && (
                                                            <ul
                                                              class="list-inline mb-0"
                                                              key={index}
                                                            >
                                                              <li class="list-inline-item">
                                                                <div class="p-1 ctext-wrap-content-file-size">
                                                                  {/* <img src="https://customer.vitelsms.com/uploads/template_images/6.jpg" alt="" class="border d-flex" width="300" height="200" /> */}
                                                                  <div
                                                                    class="main_box_send1 m-auto border p-3 bg-light bg-gradient"
                                                                    style={{
                                                                      width:
                                                                        "300px",
                                                                    }}
                                                                  >
                                                                    {template?.components.find(
                                                                      (c) =>
                                                                        c.type ===
                                                                        "HEADER"
                                                                    ) && (
                                                                        <b>
                                                                          <span
                                                                            id="previewHeader_send"
                                                                            class="ng-binding"
                                                                          >
                                                                            {" "}
                                                                            {
                                                                              template?.components.find(
                                                                                (
                                                                                  c
                                                                                ) =>
                                                                                  c.type ===
                                                                                  "HEADER"
                                                                              )
                                                                                .text
                                                                            }
                                                                          </span>
                                                                        </b>
                                                                      )}
                                                                    <br />
                                                                    {template?.components.find(
                                                                      (c) =>
                                                                        c.type ===
                                                                        "BODY"
                                                                    ) && (
                                                                        <span id="previewText_send">
                                                                          <span class="ng-binding">
                                                                            {
                                                                              template.components.find(
                                                                                (
                                                                                  c
                                                                                ) =>
                                                                                  c.type ===
                                                                                  "BODY"
                                                                              )
                                                                                .text
                                                                            }
                                                                          </span>
                                                                        </span>
                                                                      )}
                                                                    {template?.components.find(
                                                                      (c) =>
                                                                        c.type ===
                                                                        "FOOTER"
                                                                    ) && (
                                                                        <span
                                                                          id="previewFooter_send"
                                                                          ng-if="proms.data[0].components[2].text !=''"
                                                                          class="ng-binding ng-scope"
                                                                        >
                                                                          {
                                                                            template.components.find(
                                                                              (
                                                                                c
                                                                              ) =>
                                                                                c.type ===
                                                                                "FOOTER"
                                                                            ).text
                                                                          }
                                                                        </span>
                                                                      )}

                                                                    <hr className="text-dark" />

                                                                    <div className="d-flex flex-column justify-content-between align-items-center">
                                                                      <div className="d-flex align-items-center">
                                                                        {/* Display arrow icon if buttons are present */}
                                                                        {template?.components?.find(
                                                                          (c) =>
                                                                            c.type ===
                                                                            "BUTTONS"
                                                                        )
                                                                          ?.buttons
                                                                          ?.length >
                                                                          0 && (
                                                                            <i
                                                                              className="fa fa-reply me-2"
                                                                              aria-hidden="true"
                                                                            ></i>
                                                                          )}

                                                                        {/* Display Buttons */}
                                                                        {template?.components
                                                                          ?.find(
                                                                            (
                                                                              c
                                                                            ) =>
                                                                              c.type ===
                                                                              "BUTTONS"
                                                                          )
                                                                          ?.buttons?.map(
                                                                            (
                                                                              button,
                                                                              index
                                                                            ) => (
                                                                              <div
                                                                                key={
                                                                                  index
                                                                                }
                                                                              >
                                                                                <span>
                                                                                  {
                                                                                    button.text
                                                                                  }
                                                                                </span>
                                                                              </div>
                                                                            )
                                                                          )}
                                                                      </div>
                                                                    </div>
                                                                  </div>
                                                                </div>
                                                              </li>
                                                            </ul>
                                                          )
                                                      )
                                                    ) : item.template_data
                                                      ?.response?.data
                                                      ?.length == 1 ? (
                                                      <ul class="list-inline mb-0">
                                                        <li class="list-inline-item">
                                                          <div class="p-1 ctext-wrap-content-file-size">
                                                            {/* <img src="https://customer.vitelsms.com/uploads/template_images/6.jpg" alt="" class="border d-flex" width="300" height="200" /> */}
                                                            <div
                                                              class="main_box_send1 m-auto border p-3 bg-light bg-gradient"
                                                              style={{
                                                                width: "300px",
                                                              }}
                                                            >
                                                              <></>
                                                              {item?.template_data?.response?.data[0]?.components.find(
                                                                (c) =>
                                                                  c.type ===
                                                                  "HEADER"
                                                              ) && (
                                                                  <b>
                                                                    <span
                                                                      id="previewHeader_send"
                                                                      class="ng-binding"
                                                                    >
                                                                      {" "}
                                                                      {
                                                                        item.template_data.response.data[0].components.find(
                                                                          (c) =>
                                                                            c.type ===
                                                                            "HEADER"
                                                                        ).text
                                                                      }
                                                                    </span>
                                                                  </b>
                                                                )}
                                                              <br />
                                                              {item?.template_data?.response?.data[0]?.components.find(
                                                                (c) =>
                                                                  c.type ===
                                                                  "BODY"
                                                              ) && (
                                                                  <span id="previewText_send">
                                                                    <span class="ng-binding">
                                                                      {
                                                                        item.template_data.response.data[0].components.find(
                                                                          (c) =>
                                                                            c.type ===
                                                                            "BODY"
                                                                        ).text
                                                                      }
                                                                    </span>
                                                                  </span>
                                                                )}
                                                              {item?.template_data?.response?.data[0]?.components.find(
                                                                (c) =>
                                                                  c.type ===
                                                                  "FOOTER"
                                                              ) && (
                                                                  <span
                                                                    id="previewFooter_send"
                                                                    ng-if="proms.data[0].components[2].text !=''"
                                                                    class="ng-binding ng-scope"
                                                                  >
                                                                    {
                                                                      item.template_data.response.data[0].components.find(
                                                                        (c) =>
                                                                          c.type ===
                                                                          "FOOTER"
                                                                      ).text
                                                                    }
                                                                  </span>
                                                                )}
                                                              <hr className="text-dark" />

                                                              <div className="d-flex flex-column justify-content-between align-items-center">
                                                                <div className="d-flex align-items-center">
                                                                  {/* Display Buttons */}
                                                                  {item?.template_data?.response?.data[0]?.components
                                                                    ?.find(
                                                                      (c) =>
                                                                        c.type ===
                                                                        "BUTTONS"
                                                                    )
                                                                    ?.buttons?.map(
                                                                      (
                                                                        button,
                                                                        index
                                                                      ) => (
                                                                        <div
                                                                          key={
                                                                            index
                                                                          }
                                                                        >
                                                                          {button.type ==
                                                                            "QUICK_REPLY" && (
                                                                              <i
                                                                                className="fa fa-reply me-2"
                                                                                aria-hidden="true"
                                                                              ></i>
                                                                            )}
                                                                          <span>
                                                                            {
                                                                              button.text
                                                                            }
                                                                          </span>
                                                                        </div>
                                                                      )
                                                                    )}
                                                                </div>
                                                              </div>
                                                            </div>
                                                          </div>
                                                        </li>
                                                      </ul>
                                                    ) : (
                                                      <p>No template found.</p>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                            )
                                          )}
                                          <div class="d-flex justify-content-end">
                                            {/* <div style={{ width: "49px" }}> */}
                                            <small class="text-capitalize">
                                              {item.created_at
                                                ? formatTimeToAmandPM(
                                                  item.created_at
                                                )
                                                : "-"}
                                            </small>
                                            <i
                                              className={`material-symbols-outlined ms-1 ${item.message_read === "Y"
                                                ? "text-info"
                                                : item.message_failed === "Y"
                                                  ? "text-danger"
                                                  : item.message_send === "Y" || item.message_delivered === "Y"
                                                    ? "text-secondary"
                                                    : ""
                                                }`}
                                            >
                                              {item.message_read === "Y" || item.message_delivered === "Y"
                                                ? "done_all"
                                                : item.message_failed === "Y"
                                                  ? "close"
                                                  : item.message_send === "Y"
                                                    ? "check"
                                                    : ""}
                                            </i>

                                            {/* </div> */}
                                          </div>
                                          {item.reaction_message_id && (
                                            <div className="chat-reaction p-1">
                                              <div className="reaction">
                                                <small>
                                                  {item.reaction_emoji}
                                                </small>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </InfiniteScrollWrapper>
                      </div>
                    </div>

                    <div class="card-footer px-3 py-3 border-top rounded-0">
                      {optedOut ? (
                        <div>
                          <p class="text-center bg-warning" style={{ color: '#000', fontWeight: '600', padding: '8px 20px 5px 20px', margin: '0', borderRadius: '5px', fontSize: '15px' }}>
                            The customer has opted out of receiving messages. Please respect their preference and do not send any further messages.
                          </p>
                        </div>
                      ) : isExpired ? (
                        <div>
                          <p class="text-center bg-danger" style={{ color: '#fff', fontWeight: '600', padding: '8px 20px 5px 20px', margin: '0', borderRadius: '5px', fontSize: '15px' }}>
                            After 24 hours of no customer interaction, chats are marked as expired. In such cases, WhatsApp permits the sending of only template messages
                          </p>
                        </div>
                      ) : (
                        <>
                          {!isAudioRecording ? (
                            <>
                              <div className="chat-container mb-2">
                                {showAboveScreen && (
                                  <>
                                    {uploadedFiles.length > 0 && (
                                      <div
                                        className="uploaded-files-preview"
                                        style={{
                                          position: "relative",
                                          border: "2px solid rgb(94 89 89 / 40%)",
                                          padding: "10px",
                                          borderRadius: "5px",
                                          display: "flex",
                                          flexWrap: "wrap",
                                          maxWidth: "1000px",
                                          width: "100%",
                                          backgroundColor: "#f9f9f9",
                                        }}
                                      >
                                        <button
                                          onClick={() =>
                                            handleRemoveFile("", "all")
                                          }
                                          style={{
                                            position: "absolute",
                                            top: "5px",
                                            right: "5px",
                                            background: "black",
                                            color: "white",
                                            width: "25px",
                                            height: "25px",
                                            cursor: "pointer",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            border: "none",
                                            borderRadius: "50%",
                                            fontSize: "16px",
                                          }}
                                        >
                                          &times;
                                        </button>
                                        {uploadedFiles.map((fileObj, index) => (
                                          <div
                                            key={index}
                                            className="uploaded-file-preview"
                                            style={{
                                              position: "relative",
                                              display: "inline-block",
                                              margin: "10px",
                                              width: "100px",
                                              height: "75px",
                                              overflow: "hidden",
                                              border: "1px solid #ccc",
                                              borderRadius: "5px",
                                              backgroundColor: "#f7f7f7",
                                            }}
                                          >
                                            {[
                                              "jpg",
                                              "jpeg",
                                              "png",
                                              "gif",
                                              "bmp",
                                            ].includes(
                                              fileObj?.file_type
                                                ?.split("/")[1]
                                                ?.toLowerCase()
                                            ) ? (
                                              <img
                                                src={fileObj?.preview}
                                                alt={`Uploaded Preview ${index + 1
                                                  }`}
                                                style={{
                                                  maxWidth: "100%",
                                                  maxHeight: "100%",
                                                  objectFit: "cover",
                                                  display: "block",
                                                  width: "inherit",
                                                  height: "-webkit-fill-available"
                                                }}
                                              />
                                            ) : (
                                              <div
                                                style={{
                                                  display: "flex",
                                                  flexDirection: "column",
                                                  alignItems: "center",
                                                  justifyContent: "center",
                                                  height: "100%",
                                                }}
                                              >
                                                <p
                                                  style={{
                                                    fontSize: "12px",
                                                    textAlign: "center",
                                                    margin: "0",
                                                    marginTop: "5px",
                                                    wordWrap: 'break-word', whiteSpace: 'pre-wrap'
                                                  }}
                                                >
                                                  {fileObj?.file_name}
                                                </p>
                                              </div>
                                            )}
                                            <button
                                              onClick={() =>
                                                handleRemoveFile(index, "single")
                                              }
                                              style={{
                                                position: "absolute",
                                                top: "0px",
                                                right: "0px",
                                                background: "black",
                                                color: "white",
                                                width: "20px",
                                                height: "20px",
                                                cursor: "pointer",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                              }}
                                            >
                                              &times;
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {Object.keys(replyInfo)?.length > 0 && (
                                      <div
                                        className="reply-info-preview position-relative"
                                        style={{
                                          marginTop: "20px",
                                          padding: "10px",
                                          border: "1px solid #ccc",
                                          borderRadius: "5px",
                                          backgroundColor: "#f1f1f1",
                                        }}
                                      >
                                        {/* Render the reply info content */}
                                        <p>
                                          {replyInfo.direction === "IN"
                                            ? activeUserName
                                            : "you"}{" "}
                                          : {replyInfo.text}
                                        </p>
                                        <button
                                          onClick={handleRemoveReply}
                                          style={{
                                            position: "absolute",
                                            top: "5px",
                                            right: "5px",
                                            background: "black",
                                            color: "white",
                                            width: "20px",
                                            height: "20px",
                                            cursor: "pointer",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                          }}
                                        >
                                          &times;
                                        </button>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>

                              <>
                                <form
                                  onSubmit={handleSubmit(sendWhatsappMessageAPI)}
                                >
                                  <div class="d-flex align-items-center">
                                    <div class="chat-attagement d-flex">
                                      {!isUploading && (
                                        <a
                                          href="#/"
                                          class="d-flex align-items-center pe-3"
                                          onClick={() => setShowEmojis(!showEmojis)}
                                        >
                                          <svg
                                            class="icon-24"
                                            width="24"
                                            viewBox="0 0 24 25"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <g clip-path="url(#clip0_156_599)">
                                              <path
                                                d="M20.4853 4.01473C18.2188 1.74823 15.2053 0.5 12 0.5C8.79469 0.5 5.78119 1.74823 3.51473 4.01473C1.24819 6.28119 0 9.29469 0 12.5C0 15.7053 1.24819 18.7188 3.51473 20.9853C5.78119 23.2518 8.79469 24.5 12 24.5C15.2053 24.5 18.2188 23.2518 20.4853 20.9853C22.7518 18.7188 24 15.7053 24 12.5C24 9.29469 22.7518 6.28119 20.4853 4.01473ZM12 23.0714C6.17091 23.0714 1.42856 18.3291 1.42856 12.5C1.42856 6.67091 6.17091 1.92856 12 1.92856C17.8291 1.92856 22.5714 6.67091 22.5714 12.5C22.5714 18.3291 17.8291 23.0714 12 23.0714Z"
                                                fill="currentcolor"
                                              ></path>
                                              <path
                                                d="M9.40398 9.3309C8.23431 8.16114 6.33104 8.16123 5.16136 9.3309C4.88241 9.60981 4.88241 10.0621 5.16136 10.3411C5.44036 10.62 5.89266 10.62 6.17157 10.3411C6.78432 9.72836 7.78126 9.7284 8.39392 10.3411C8.53342 10.4806 8.71618 10.5503 8.89895 10.5503C9.08171 10.5503 9.26457 10.4806 9.40398 10.3411C9.68293 10.0621 9.68293 9.60986 9.40398 9.3309Z"
                                                fill="currentcolor"
                                              ></path>
                                              <path
                                                d="M18.8384 9.3309C17.6688 8.16123 15.7655 8.16114 14.5958 9.3309C14.3169 9.60981 14.3169 10.0621 14.5958 10.3411C14.8748 10.62 15.3271 10.62 15.606 10.3411C16.2187 9.72836 17.2156 9.72831 17.8284 10.3411C17.9679 10.4806 18.1506 10.5503 18.3334 10.5503C18.5162 10.5503 18.699 10.4806 18.8384 10.3411C19.1174 10.0621 19.1174 9.60986 18.8384 9.3309Z"
                                                fill="currentcolor"
                                              ></path>
                                              <path
                                                d="M18.3335 13.024H5.6668C5.2723 13.024 4.95251 13.3438 4.95251 13.7383C4.95251 17.6243 8.11409 20.7859 12.0001 20.7859C15.8862 20.7859 19.0477 17.6243 19.0477 13.7383C19.0477 13.3438 18.728 13.024 18.3335 13.024ZM12.0001 19.3573C9.14366 19.3573 6.77816 17.215 6.42626 14.4525H17.574C17.2221 17.215 14.8566 19.3573 12.0001 19.3573Z"
                                                fill="currentcolor"
                                              ></path>
                                            </g>
                                            <defs>
                                              <clipPath>
                                                <rect
                                                  width="24"
                                                  height="24"
                                                  fill="white"
                                                  transform="translate(0 0.5)"
                                                ></rect>
                                              </clipPath>
                                            </defs>
                                          </svg>
                                        </a>
                                      )}
                                      <div class="card-header-toolbar pe-3">
                                        {!Object.keys(replyInfo)?.length > 0 && (
                                          <div class="dropdown">
                                            <div
                                              class="dropdown-toggle"
                                              id="dropdownMenuButton"
                                              data-bs-toggle="dropdown"
                                              aria-expanded="false"
                                              role="button"
                                            >
                                              <svg
                                                viewBox="0 0 24 24"
                                                height="24"
                                                width="24"
                                                preserveAspectRatio="xMidYMid meet"
                                                class="icon-24"
                                                fill="none"
                                              >
                                                <path
                                                  fill-rule="evenodd"
                                                  clip-rule="evenodd"
                                                  d="M20.5 13.2501L20.5 10.7501L13.25 10.7501L13.25 3.5L10.75 3.5L10.75 10.7501L3.5 10.7501L3.5 13.2501L10.75 13.2501L10.75 20.5L13.25 20.5L13.25 13.2501L20.5 13.2501Z"
                                                  fill="currentColor"
                                                ></path>
                                              </svg>
                                            </div>

                                            <div
                                              class="dropdown-menu dropdown-menu-right dropdown-upload"
                                              aria-labelledby="dropdownMenuButton"
                                            >
                                              <a
                                                className="dropdown-item d-flex align-items-center"
                                                href="#/"
                                                onClick={() => {
                                                  handleAttachmentClick();
                                                  // setImageUpload(false); // Assuming you want to set image upload to true
                                                }}
                                              >
                                                <span className="material-symbols-outlined me-2 md-18">
                                                  file_upload
                                                </span>
                                                Upload files
                                              </a>

                                              {/* Hidden file input */}

                                              <input
                                                type="file"
                                                ref={fileInputRef}
                                                style={{ display: "none" }}
                                                onChange={handleFileUpload}
                                                accept=".jpg,.jpeg,.png,.gif,.bmp,.pdf" // Accept multiple file types
                                                multiple // Allow multiple files
                                              // disabled={uploadedFiles.length >= MAX_FILE_LIMIT}
                                              />
                                              {!isUploading && (
                                                <>
                                                  <a
                                                    class="dropdown-item d-flex align-items-center"
                                                    href="#/"
                                                    onClick={handleAudioRecording}
                                                  >
                                                    <span class="material-symbols-outlined me-2 md-18">
                                                      volume_up
                                                    </span>
                                                    Audio
                                                  </a>
                                                  <a
                                                    class="dropdown-item d-flex align-items-center"
                                                    href="#/"
                                                    onClick={handleShowVideoModal}
                                                  >
                                                    <span class="material-symbols-outlined me-2 md-18">
                                                      smart_display
                                                    </span>
                                                    Video
                                                  </a>
                                                  <a
                                                    class="dropdown-item d-flex align-items-center"
                                                    href="#/"
                                                    onClick={handleGetLocation}
                                                  >
                                                    <span class="material-symbols-outlined me-2 md-18">
                                                      location_on
                                                    </span>
                                                    Location
                                                  </a>
                                                  <a
                                                    class="dropdown-item d-flex align-items-center"
                                                    href="#/"
                                                    onClick={handleContactShow}
                                                  >
                                                    <span class="material-symbols-outlined me-2 md-18">
                                                      contacts
                                                    </span>
                                                    Contacts
                                                  </a>
                                                </>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    {!isUploading ? (
                                      <>
                                        <input
                                          type="text"
                                          class="form-control me-3"
                                          placeholder="Type your message"
                                          name="message"
                                          {...register("message", {
                                            required: "Message is required",
                                          })}
                                        />
                                        {/* {location &&
                                                <div>
                                                    Current Location: Latitude: {location.latitude}, Longitude: {location.longitude}
                                                </div>
                                            } */}

                                        <div class="chat-attagement">
                                          <SpeechToText
                                            onTranscription={handleTranscription}
                                          />
                                        </div>
                                      </>
                                    ) : (
                                      <div className="w-100 text-end me-3">
                                        Total files selected:{" "}
                                        {uploadedFiles?.length}
                                      </div>
                                    )}

                                    <button
                                      type="submit"
                                      class="btn btn-primary d-flex align-items-center"
                                      disabled={isLoading}
                                    >
                                      <svg
                                        class="icon-20"
                                        width="18"
                                        viewBox="0 0 20 21"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          d="M13.8325 6.67463L8.10904 12.4592L1.59944 8.38767C0.66675 7.80414 0.860765 6.38744 1.91572 6.07893L17.3712 1.55277C18.3373 1.26963 19.2326 2.17283 18.9456 3.142L14.3731 18.5868C14.0598 19.6432 12.6512 19.832 12.0732 18.8953L8.10601 12.4602"
                                          stroke="currentcolor"
                                          stroke-width="2"
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                        ></path>
                                      </svg>
                                      <span class="d-none d-lg-block ms-1">
                                        {isLoading ? 'Sending...' : 'Send'}
                                      </span>
                                    </button>
                                  </div>
                                  <div className="mt-2">
                                    {showEmojis && (
                                      <Emojis
                                        onEmojiSelect={handleEmojiSelect}
                                        pickerSize={{ height: 400, width: 935 }}
                                      />
                                    )}
                                  </div>
                                </form>
                              </>
                            </>
                          ) : (
                            <div className="w-100 text-end me-3 position-relative">
                              <div className="mb-3">
                                <button
                                  onClick={handleAudioCancel}
                                  style={{
                                    position: "absolute",
                                    top: "-42px",
                                    right: "-16px",
                                    background: "black",
                                    color: "white",
                                    width: "25px",
                                    height: "25px",
                                    cursor: "pointer",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    border: "none",
                                    borderRadius: "50%",
                                    fontSize: "16px",
                                  }}
                                >
                                  &times;
                                </button>
                              </div>
                              <AudioRecorder onBase64Ready={handleSaveAudio} />
                            </div>
                          )}
                        </>
                      )}

                    </div>
                  </>
                ) : (
                  <div class="card-body bg-body chat-loadimage">
                    <div class="chat-head"></div>
                    <div className="d-flex justify-content-center flex-column align-items-center">
                      {/* <img src='/assets/images/Inbox.jpg' alt='inbox' /> */}
                      <LazyLoadImage
                        src="/assets/images/Inbox.jpg"
                        alt="inbox"
                      />
                      <p className="text-center">
                        Please select any one contact and view
                      </p>
                    </div>
                  </div>
                )
                }
              </div >
            </div >
          </div >
        </div >
      </div >

      <Modal
        show={showContactModal}
        onHide={handleShowContactCloseModal}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Send Contact</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div class="chat-searchbar">
            <div class="form-group chat-search-data m-0">
              <input
                type="text"
                class="form-control round"
                id="chat-search"
                placeholder="Search"
                onChange={handleContactSearch}
              />
              <i class="material-symbols-outlined">search</i>
            </div>
          </div>

          <ul
            className="nav navbar-nav iq-main-menu"
            style={{ border: "1px" }}
            id="sidebar-menu"
            role="tablist"
          >
            {/* Select All Checkbox */}
            {/* <li className="nav-item mb-0">
                                <div className="form-check form-check-inline me-2">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="select-all"
                                        checked={selectAll}
                                        onChange={handleSelectAllChange}
                                    />
                                    <label className="form-check-label" htmlFor="select-all">Select All</label>
                                </div>
                            </li> */}
            {contacts.length > 0 ? (
              contacts.map((user) => (
                <li
                  key={user.id}
                  className={`nav-item iq-chat-list px-0"`}
                  role="tab"
                >
                  <div
                    className="nav-link d-flex align-items-center gap-0"
                    role="tab"
                  >
                    <div className="form-check form-check-inline me-2">
                      <input
                        type="checkbox"
                        className="form-check-input p-2"
                        id={`checkbox-${user.id}`}
                        checked={selectedContacts?.some(
                          (contact) => contact.number === user.contact_number
                        )}
                        onChange={() => handleCheckboxChange(user)}
                      />
                    </div>
                    <div className="d-flex gap-1 align-items-center">
                      <div className="position-relative">
                        <span className="badge badge-pill btn btn-soft-success font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2">
                          {transformText(user.contact_name[0], 'capitalize')}
                        </span>
                      </div>
                      <div className="d-flex align-items-center w-100 iq-userlist-data">
                        <div className="d-flex flex-grow-1 flex-column">
                          <div className="d-flex align-items-center gap-1">
                            <p className="mb-0 text-ellipsis short-1 user-chat flex-grow-1 iq-userlist-name fw-500">
                              {truncateName(user.contact_name, 25)}
                            </p>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <small className="text-ellipsis short-1 flex-grow-1 chat-small">
                              {user.contact_number}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="nav-item no-user-found">
                <div className="nav-link d-flex gap-0 justify-content-center">
                  <span>No contacts found</span>
                </div>
              </li>
            )}
          </ul>
        </Modal.Body>
        <ModalFooter>
          <div className="d-flex justify-content-end">
            {/* <div>
                            {selectedContacts && ( // Use parentheses for clarity
                                <>
                                    <h6>Selected Contacts:</h6>
                                    {selectedContacts.map((item) => (
                                        <div key={item.id || item.number}>
                                            Convert item.number to string if it's not already
                                            {typeof item.number !== 'string' ? String(item.number) : item.number}
                                            {Array.isArray(item.number) ? item.number.join(', ') : item.number}
                                        </div>
                                    ))}
                                </>
                            )}
                        </div> */}
            <button
              type="button"
              class="btn btn-warning d-flex align-items-center"
              onClick={handleShowContactCloseModal}
            >
              <span class="d-none d-lg-block ms-1">Cancel</span>
            </button>
            <button
              type="button"
              class="btn btn-primary d-flex align-items-center ms-2"
              onClick={sendContact}
              disabled={isLoading}
            >
              <svg
                class="icon-20"
                width="18"
                viewBox="0 0 20 21"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.8325 6.67463L8.10904 12.4592L1.59944 8.38767C0.66675 7.80414 0.860765 6.38744 1.91572 6.07893L17.3712 1.55277C18.3373 1.26963 19.2326 2.17283 18.9456 3.142L14.3731 18.5868C14.0598 19.6432 12.6512 19.832 12.0732 18.8953L8.10601 12.4602"
                  stroke="currentcolor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></path>
              </svg>
              <span class="d-none d-lg-block ms-1">{isLoading ? 'Sending...' : 'Send'} </span>
            </button>
          </div>
        </ModalFooter>
      </Modal>
      <Modal
        show={showForwardModal}
        onHide={handleForwardCloseModal}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Forward message to</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div class="chat-searchbar">
            <div class="form-group chat-search-data m-0">
              <input
                type="text"
                class="form-control round"
                id="chat-search"
                placeholder="Search"
                onChange={handleContactSearch}
              />
              <i class="material-symbols-outlined">search</i>
            </div>
          </div>
          <ul
            className="nav navbar-nav iq-main-menu"
            style={{ border: "1px" }}
            id="sidebar-menu"
            role="tablist"
          >
            {/* Select All Checkbox */}
            {/* <li className="nav-item mb-0">
                                <div className="form-check form-check-inline me-2">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="select-all"
                                        checked={selectAll}
                                        onChange={handleSelectAllChange}
                                    />
                                    <label className="form-check-label" htmlFor="select-all">Select All</label>
                                </div>
                            </li> */}
            {contacts.length > 0 ? (
              contacts.map((user) => (
                <li
                  key={user.id}
                  className={`nav-item iq-chat-list`}
                  role="tab"
                >
                  <div
                    className="nav-link d-flex align-items-center gap-0"
                    role="tab"
                  >
                    <div className="form-check form-check-inline me-2">
                      <input
                        type="checkbox"
                        className="form-check-input p-2"
                        id={`checkbox-${user.id}`}
                        checked={selectedContacts?.some(
                          (contact) => contact.number === user.contact_number
                        )}
                        onChange={() => handleCheckboxChange(user)}
                      />
                    </div>
                    <div className="d-flex gap-1 align-items-center">
                      <div className="position-relative">
                        <span className="badge badge-pill bg-soft-success font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2">
                          {user.contact_name[0]}
                        </span>
                      </div>
                      <div className="d-flex align-items-center w-100 iq-userlist-data">
                        <div className="d-flex flex-grow-1 flex-column">
                          <div className="d-flex align-items-center gap-1">
                            <p className="mb-0 text-ellipsis short-1 user-chat flex-grow-1 iq-userlist-name fw-500">
                              {truncateName(user.contact_name, 10)}
                            </p>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <small className="text-ellipsis short-1 flex-grow-1 chat-small">
                              {user.contact_number}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="nav-item no-user-found">
                <div className="nav-link d-flex gap-0 justify-content-center">
                  <span>No contacts found</span>
                </div>
              </li>
            )}
          </ul>
        </Modal.Body>
        <ModalFooter>
          <div className="d-flex justify-content-end">
            {/* <div>
                            {selectedContacts && ( // Use parentheses for clarity
                                <>
                                    <h6>Selected Contacts:</h6>
                                    {selectedContacts.map((item) => (
                                        <div key={item.id || item.number}>
                                            Convert item.number to string if it's not already
                                            {typeof item.number !== 'string' ? String(item.number) : item.number}
                                            {Array.isArray(item.number) ? item.number.join(', ') : item.number}
                                        </div>
                                    ))}
                                </>
                            )}
                        </div> */}
            <button
              type="button"
              class="btn btn-warning d-flex align-items-center"
              onClick={handleForwardCloseModal}
            >
              <span class="d-none d-lg-block ms-1">Cancel</span>
            </button>
            <button
              type="button"
              class="btn btn-primary d-flex align-items-center ms-2"
              onClick={forwardMessage}
            >
              <svg
                class="icon-20"
                width="18"
                viewBox="0 0 20 21"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.8325 6.67463L8.10904 12.4592L1.59944 8.38767C0.66675 7.80414 0.860765 6.38744 1.91572 6.07893L17.3712 1.55277C18.3373 1.26963 19.2326 2.17283 18.9456 3.142L14.3731 18.5868C14.0598 19.6432 12.6512 19.832 12.0732 18.8953L8.10601 12.4602"
                  stroke="currentcolor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></path>
              </svg>
              <span class="d-none d-lg-block ms-1">Send</span>
            </button>
          </div>
        </ModalFooter>
      </Modal>
      <Modal
        show={showVideoModal}
        onHide={handleVideoCloseModal}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Send Video Recording</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <VideoRecording onRecordingComplete={handleRecordingComplete} />
        </Modal.Body>
      </Modal>

      {/* <div
        class="modal fade"
        id="exampleModalCenter-view"
        tabindex="-1"
        aria-labelledby="exampleModalCenterTitle"
        style={{ display: "none" }}
        aria-hidden="true"
      >
        <div class="modal-dialog modal-dialog-centered" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalCenterTitle">
                View Details
              </h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <div class="text-center">
                <div class="position-relative">
                  <span class="badge badge-pill btn btn-soft-danger  badge-60 rounded-circle p-2 ">
                    {activeUserName ? activeUserName[0] : "-"}
                  </span>
                </div>
                <h4 class="mt-2 mb-4">
                  +{activeUserNum ? activeUserNum : "-"}
                </h4>
                <div class="d-flex  justify-content-around mb-3 align-items-center">
                  <div class="me-20">
                    <div class="fw-500 text-muted">Marketing opt-out</div>
                  </div>
                  <label class="form-check form-switch form-check-custom form-check-solid">
                    <input
                      className="form-check-input form-check-2"
                      type="checkbox"
                      checked={optedOut}  // Checkbox is checked if optedOut is 1
                      id="status"
                      onChange={handleInboxData}  // Handle opt-out change
                    />
                  </label>
                </div>
                <p class="text-danger">
                  I understand that it's our responsibility to stop sending
                  marketing messages to customers who opt out.{" "}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      {/* <Modal show={showOptout} onHide={handleCloseOptout} backdrop="static" size="md" centered>
        <Modal.Header closeButton>
          <Modal.Title>Optout</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <div className="position-relative">
              <span className="badge badge-pill btn btn-soft-danger badge-60 rounded-circle p-2">
                {activeUserName ? activeUserName[0] : "-"}
              </span>
            </div>
            <h4 className="mt-2 mb-4">+{activeUserNum ? activeUserNum : "-"}</h4>
            <div className="d-flex justify-content-around mb-3 align-items-center">
              <div className="me-20">
                <div className="fw-500 text-muted">Marketing opt-out</div>
              </div>
              <label className="form-check form-switch form-check-custom form-check-solid">
                <input
                  className="form-check-input form-check-2"
                  type="checkbox"
                  checked={optedOut}  // Checkbox is checked if optedOut is 1
                  id="status"
                  onChange={handleInboxData}  // Handle opt-out change
                />
              </label>
            </div>
            <p className="text-danger">
              I understand that it's our responsibility to stop sending marketing messages to customers who opt out.
            </p>
          </div>
        </Modal.Body>
      </Modal> */}

      <div
        className={`offcanvas offcanvas-end on-rtl end ${showOptout ? 'show' : ''}`}
        tabIndex={-1}
        id="offcanvasEdit"
        aria-labelledby="offcanvasRightLabel1"
        style={{ visibility: showOptout ? 'visible' : 'hidden' }}
      >
        <div className="offcanvas-header">
          <h4 className="fw-bold text-primary">Channels Info</h4>
          <div className="close-icon" onClick={handleCloseOptout}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24px"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <div className="offcanvas-body">
          <div className="row">
            <div className="d-flex align-items-center justify-content-between w-100 mb-2">
              <div className="ms-3">
                <h5 className="mb-0 fw-500 text-primary">Channels Info</h5>
              </div>
            </div>
            <div className="">
              <aside
                className="sidebar-chat sidebar-base border-end shadow-none rounded-2"
                data-sidebar="responsive"
              >
                <div className="sidebar-body pt-0 data-scrollbar chat-group mb-5 pb-5 pe-2">
                  {/* Sidebar Menu Start */}
                  <ul
                    className="nav navbar-nav iq-main-menu mt-3"
                    id="sidebar-menu"
                    role="tablist"
                  >
                    <li
                      className="nav-item iq-chat-list active"
                      role="presentation"
                    >
                      <a href="#" className="nav-link d-flex gap-1 active">
                        <div className="position-relative">
                          <span className="badge badge-pill btn btn-soft-danger font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2">A</span>
                        </div>
                        <div className="d-flex align-items-center w-100 iq-userlist-data">
                          <div className="d-flex flex-grow-1 flex-column">
                            <div className="d-flex align-items-center gap-1">
                              <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">Akash</p>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <small className="text-ellipsis short-1 flex-grow-1 chat-small">918319904375</small>
                            </div>
                          </div>
                        </div>
                      </a>
                    </li>
                    <li className="nav-item iq-chat-list" role="presentation">
                      <a
                        href="#"
                        className="nav-link d-flex gap-1"
                        data-bs-toggle="tab"
                        role="tab"
                        aria-controls="user-content-102"
                        aria-selected="false"
                        tabIndex={-1}
                      >
                        <div className="position-relative">
                          <span className="badge badge-pill btn btn-soft-danger font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2">b</span>
                        </div>
                        <div className="d-flex align-items-center w-100 iq-userlist-data">
                          <div className="d-flex flex-grow-1 flex-column">
                            <div className="d-flex align-items-center gap-1">
                              <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">Biswa</p>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <small className="text-ellipsis short-1 flex-grow-1 chat-small">+918319904375</small>
                            </div>
                          </div>
                        </div>
                      </a>
                    </li>
                    <li className="nav-item iq-chat-list" role="presentation">
                      <a
                        href="#"
                        className="nav-link d-flex gap-1"
                        data-bs-toggle="tab"
                        role="tab"
                        aria-controls="user-content-103"
                        aria-selected="false"
                        tabIndex={-1}
                      >
                        <div className="position-relative">
                          <span className="badge badge-pill btn btn-soft-danger font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2">J</span>
                        </div>
                        <div className="d-flex align-items-center w-100 iq-userlist-data">
                          <div className="d-flex flex-grow-1 flex-column">
                            <div className="d-flex align-items-center gap-1">
                              <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">Jyothi</p>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <small className="text-ellipsis short-1 flex-grow-1 chat-small">+919663759309</small>
                            </div>
                          </div>
                        </div>
                      </a>
                    </li>
                  </ul>
                  {/* Sidebar Menu End */}
                  <div className="row mt-5">
                    <div className="col-sm-12 text-end">
                      <button
                        type="button"
                        className="btn add-button btn-primary mt-4 mr-3 fw-bold"
                        onClick={handleShowOffcanvas}
                      >
                        <span className="d-flex align-items-center">
                          <i className="material-symbols-outlined me-1 fs-3 md-18">group_add</i>
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>


      <Modal show={show} onHide={handleClose} backdrop="static" size="md" centered>
        <Modal.Header closeButton>
          <Modal.Title>Send Template</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitSendTemp(AddTemplate)}>
          <Modal.Body>
            {/* Phone Number */}
            <Form.Group className="mb-3" controlId="phoneNo">
              <Form.Label className="d-flex align-items-center fs-6 fw-semibold mb-2">
                <span className="required">
                  Phone No<span className="text-danger">*</span>
                </span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="201-555-0123"
                {...registerSendTemp("contact_number", {
                  required: "Phone number is required.",
                  pattern: {
                    value: /^[0-9-]+$/,
                    message: "Invalid phone number format.",
                  },
                })}
                isInvalid={!!errorsSendTemp.contact_number}
              />
              <Form.Control.Feedback type="invalid">
                {errorsSendTemp.contact_number?.message}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Template */}
            <Form.Group controlId="template_data">
              <Form.Label className="required">Template</Form.Label>
              <Form.Select
                {...registerSendTemp('template_data', { required: 'Please select a template' })}
                value={selectedTemplateDrop?.id || ''}
                onChange={handleTemplateChange}
              >
                <option value="">Select your template</option>
                {templateData && templateData.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </Form.Select>
              {BulkErrors.templateSelect && (
                <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                  {BulkErrors.templateSelect.message}
                </div>
              )}
              <div className="template-container mt-5">
                {selectedTemplateDrop?.components?.map((component, index) => {
                  if (component?.type === "HEADER" && component?.example?.header_text) {
                    return (
                      <div key={index} className="header-component mb-3 d-flex align-items-center">
                        <p className="mb-0 me-2">{component?.example?.header_text[0]}</p>
                        <input
                          type="text"
                          value={headerInputValueBulk}
                          onChange={(e) => handleHeaderInputBulkChange(e.target.value)}
                          className="form-control align-input"
                        />
                      </div>
                    );
                  }

                  if (component?.type === "BODY" && component?.example?.body_text) {
                    return (
                      <div key={index} className="body-component mb-3">
                        {component?.example?.body_text[0].map((text, bodyIndex) => (
                          <div key={bodyIndex} className="body-text-item mb-2 d-flex align-items-center">
                            <p className="mb-0 me-2">{text}</p>
                            <input
                              type="text"
                              value={bodyInputValuesBulk[bodyIndex] || ''}
                              onChange={(e) => handleBodyInputBulkChange(bodyIndex, e.target.value)}
                              className="form-control align-input"
                            />
                          </div>
                        ))}
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Add Channel Canvas Modal */}
      {/* All contacts end */}
      <div
        className={`offcanvas offcanvas-end on-rtl end ${showOffcanvas ? 'show' : ''}`}
        tabIndex={-1}
        id="offcanvasAll"
        aria-labelledby="offcanvasAll"
        style={{ visibility: showOffcanvas ? 'visible' : 'hidden' }}
      >
        <div className="offcanvas-header">
          <h4 className="fw-bold text-primary">All Contacts</h4>
          <div className="close-icon" onClick={handleCloseOffcanvas}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24px"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <div className="offcanvas-body">
          <div className="row">
            <div className="">
              <aside
                className="sidebar-chat sidebar-base border-0 shadow-none rounded-2"
                data-sidebar="responsive"
              >
                <div className="chat-searchbar">
                  <div className="form-group chat-search-data">
                    <input
                      type="text"
                      className="form-control round group-search"
                      id="chat-search"
                      placeholder="Add people..."
                    />
                  </div>
                </div>
                <div className="sidebar-body pt-0 data-scrollbar chat-group mb-5 pb-5 pe-2">
                  {/* Sidebar Menu Start */}
                  <ul
                    className="nav navbar-nav iq-main-menu mt-1"
                    id="sidebar-menu"
                    role="tablist"
                  >
                    <li className="nav-item iq-chat-list active" role="presentation">
                      <a href="#" className="nav-link d-flex gap-1">
                        <div className="position-relative">
                          <span className="badge badge-pill btn btn-soft-danger font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2">A</span>
                        </div>
                        <div className="d-flex align-items-center w-100 iq-userlist-data">
                          <div className="d-flex flex-grow-1 flex-column">
                            <div className="d-flex align-items-center gap-1">
                              <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">Akash</p>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <small className="text-ellipsis short-1 flex-grow-1 chat-small">918319904375</small>
                            </div>
                          </div>
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input group-select"
                              id="customCheck1"
                            />
                          </div>
                        </div>
                      </a>
                    </li>
                    <li className="nav-item iq-chat-list" role="presentation">
                      <a href="#" className="nav-link d-flex gap-1">
                        <div className="position-relative">
                          <span className="badge badge-pill btn btn-soft-danger font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2">b</span>
                        </div>
                        <div className="d-flex align-items-center w-100 iq-userlist-data">
                          <div className="d-flex flex-grow-1 flex-column">
                            <div className="d-flex align-items-center gap-1">
                              <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">Biswa</p>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <small className="text-ellipsis short-1 flex-grow-1 chat-small">+918319904375</small>
                            </div>
                          </div>
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input group-select"
                              id="customCheck2"
                            />
                          </div>
                        </div>
                      </a>
                    </li>
                    <li className="nav-item iq-chat-list" role="presentation">
                      <a href="#" className="nav-link d-flex gap-1">
                        <div className="position-relative">
                          <span className="badge badge-pill btn btn-soft-danger font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2">J</span>
                        </div>
                        <div className="d-flex align-items-center w-100 iq-userlist-data">
                          <div className="d-flex flex-grow-1 flex-column">
                            <div className="d-flex align-items-center gap-1">
                              <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">Jyothi</p>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <small className="text-ellipsis short-1 flex-grow-1 chat-small">+919663759309</small>
                            </div>
                          </div>
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input group-select"
                              id="customCheck3"
                            />
                          </div>
                        </div>
                      </a>
                    </li>
                    <li className="nav-item iq-chat-list" role="presentation">
                      <a href="#" className="nav-link d-flex gap-1">
                        <div className="position-relative">
                          <span className="badge badge-pill btn btn-soft-danger font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2">S</span>
                        </div>
                        <div className="d-flex align-items-center w-100 iq-userlist-data">
                          <div className="d-flex flex-grow-1 flex-column">
                            <div className="d-flex align-items-center gap-1">
                              <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">Satheesh</p>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <small className="text-ellipsis short-1 flex-grow-1 chat-small">+919307063834</small>
                            </div>
                          </div>
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input group-select"
                              id="customCheck4"
                            />
                          </div>
                        </div>
                      </a>
                    </li>
                    <li className="nav-item iq-chat-list" role="presentation">
                      <a href="#" className="nav-link d-flex gap-1">
                        <div className="position-relative">
                          <span className="badge badge-pill btn btn-soft-danger font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2">S</span>
                        </div>
                        <div className="d-flex align-items-center w-100 iq-userlist-data">
                          <div className="d-flex flex-grow-1 flex-column">
                            <div className="d-flex align-items-center gap-1">
                              <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">Sursh K</p>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <small className="text-ellipsis short-1 flex-grow-1 chat-small">+91 950246 5331</small>
                            </div>
                          </div>
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input group-select"
                              id="customCheck5"
                            />
                          </div>
                        </div>
                      </a>
                    </li>
                    <li className="nav-item iq-chat-list" role="presentation">
                      <a href="#" className="nav-link d-flex gap-1">
                        <div className="position-relative">
                          <span className="badge badge-pill btn btn-soft-danger font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2">N</span>
                        </div>
                        <div className="d-flex align-items-center w-100 iq-userlist-data">
                          <div className="d-flex flex-grow-1 flex-column">
                            <div className="d-flex align-items-center gap-1">
                              <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">Nagesh</p>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <small className="text-ellipsis short-1 flex-grow-1 chat-small">+919307063834</small>
                            </div>
                          </div>
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input group-select"
                              id="customCheck6"
                            />
                          </div>
                        </div>
                      </a>
                    </li>
                    <li className="nav-item iq-chat-list" role="presentation">
                      <a href="#" className="nav-link d-flex gap-1">
                        <div className="position-relative">
                          <span className="badge badge-pill btn btn-soft-danger font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2">P</span>
                        </div>
                        <div className="d-flex align-items-center w-100 iq-userlist-data">
                          <div className="d-flex flex-grow-1 flex-column">
                            <div className="d-flex align-items-center gap-1">
                              <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">Pramodh</p>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <small className="text-ellipsis short-1 flex-grow-1 chat-small">+919307063834</small>
                            </div>
                          </div>
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input group-select"
                              id="customCheck7"
                            />
                          </div>
                        </div>
                      </a>
                    </li>
                    <li className="nav-item iq-chat-list" role="presentation">
                      <a href="#" className="nav-link d-flex gap-1">
                        <div className="position-relative">
                          <span className="badge badge-pill btn btn-soft-danger font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2">S</span>
                        </div>
                        <div className="d-flex align-items-center w-100 iq-userlist-data">
                          <div className="d-flex flex-grow-1 flex-column">
                            <div className="d-flex align-items-center gap-1">
                              <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">Santhosh</p>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <small className="text-ellipsis short-1 flex-grow-1 chat-small">+919307063834</small>
                            </div>
                          </div>
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input group-select"
                              id="customCheck8"
                            />
                          </div>
                        </div>
                      </a>
                    </li>
                  </ul>
                  {/* Sidebar Menu End */}
                  <div>
                    <a href="#" className="btn btn-primary d-block mt-3">
                      Add
                    </a>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>

      {/* --off canvas--- */}
      <div
        className={`offcanvas offcanvas-end on-rtl end ${showAddChannelModal ? 'show' : ''}`}
        tabIndex={-1}
        id="offcanvasChannel"
      >
        <div className="offcanvas-header  ">
          <h4 className="fw-bold">Create Channel</h4>
          <div className="close-icon" onClick={handleCloseAddChannel} data-bs-dismiss="offcanvas">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24px"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <div className="offcanvas-body pt-0">
          <div className="row">
            <div className=" ">
              <aside
                className="sidebar-chat sidebar-base border-0 shadow-none  rounded-2"
                data-sidebar="responsive"
              >
                <form>
                  <div className="form-group mt-3">
                    <select
                      className="form-select"
                      value={selectedCommunity}
                      onChange={(e) => setSelectedCommunity(e.target.value)}
                    >
                      <option value="">Select the Community</option>
                      <option value="vitel">Vitel global</option>
                      <option value="varun">Varun digital</option>
                      <option value="pranathi">Pranathi soft</option>
                    </select>
                  </div>
                  <div className="form-floating mb-3">
                    <input
                      type="text"
                      className="form-control"
                      id="floatingInput"
                      placeholder="Enter group name"
                    />
                    <label htmlFor="floatingInput" className="fw-500">
                      Channel name
                    </label>
                  </div>
                  <div className="form-floating mb-3">
                    <input
                      type="text"
                      className="form-control"
                      id="floatingDescription"
                      placeholder="Enter Description"
                    />
                    <label htmlFor="floatingDescription" className="fw-500">
                      Description
                    </label>
                  </div>
                  <div className="d-flex  justify-content-between align-items-center mb-3">
                    {/*begin::Label*/}
                    <div className="ms-1">
                      <label className="fs-6 fw-bold form-label mb-0 text-primary">
                        Channel Type
                      </label>
                    </div>
                    {/*end::Label*/}
                    {/*begin::Switch*/}
                    <div className="form-check custom-radio custom-radio-color form-check-inline">
                      <input
                        type="radio"
                        id="customRadio02"
                        name="customRadio-11"
                        className="form-check-input bg-success"
                      />
                      <label className="form-check-label" htmlFor="customRadio02">
                        {" "}
                        Public{" "}
                      </label>
                    </div>
                    <div className="form-check custom-radio custom-radio-color form-check-inline">
                      <input
                        type="radio"
                        id="customRadio03"
                        name="customRadio-11"
                        className="form-check-input bg-danger"
                      />
                      <label className="form-check-label" htmlFor="customRadio03">
                        {" "}
                        Private{" "}
                      </label>
                    </div>
                    {/*end::Switch*/}
                  </div>
                </form>
              </aside>
            </div>
            <div className="row mb-3">
              <div className="col-xl-10">
                <label
                  htmlFor="staticEmail2"
                  className="form-label custom-file-input"
                >
                  Add member from contact list
                </label>
              </div>
              <div className="col-xl-2 text-end">
                <button
                  className="btn-Icon"
                  type="button"
                  onClick={handleAddMemberFromContacts}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                    <path
                      d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3zM504 312l0-64-64 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l64 0 0-64c0-13.3 10.7-24 24-24s24 10.7 24 24l0 64 64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-64 0 0 64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"
                      fill="#010060"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-xl-10">
                <label
                  htmlFor="staticEmail2"
                  className="form-label custom-file-input"
                >
                  Add a new contact
                </label>
              </div>
              <div className="col-xl-2 text-end">
                <button
                  className="btn-Icon"
                  type="button"
                  onClick={handleAddNewContact}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                    {/*!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.*/}
                    <path
                      d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3zM504 312l0-64-64 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l64 0 0-64c0-13.3 10.7-24 24-24s24 10.7 24 24l0 64 64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-64 0 0 64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"
                      fill="#010060"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="form-group">
              <div className="d-flex justify-content-between">
                <label
                  htmlFor="customFile"
                  className="form-label custom-file-input"
                >
                  {" "}
                  Bulk upload contacts
                </label>
              </div>
              <div className="d-flex justify-content-between g-5">
                <input
                  className="form-control me-3"
                  type="file"
                  id="customFile"
                />
                <button className="btn btn-warning">Process</button>
              </div>
            </div>
            <div className="sidebar-body pt-0 data-scrollbar chat-group   pb-5 pe-2 mt-3">
              <h5 className="text-primary fw-500">Members</h5>
              {/* Sidebar Menu Start */}
              <ul
                className="nav navbar-nav iq-main-menu  mt-3"
                id="sidebar-menu"
                role="tablist"
              >
                <li className="nav-item iq-chat-list active" role="presentation">
                  <a href="#" className="nav-link  d-flex gap-1 active">
                    <div className="position-relative">
                      <span className="badge badge-pill btn btn-soft-danger  font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2 ">
                        A
                      </span>
                    </div>
                    <div className="d-flex align-items-center w-100 iq-userlist-data">
                      <div className="d-flex flex-grow-1 flex-column">
                        <div className="d-flex align-items-center gap-1">
                          <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">
                            Akash{" "}
                          </p>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <small className="text-ellipsis short-1 flex-grow-1 chat-small">
                            918319904375
                          </small>
                        </div>
                      </div>
                      <div className="">
                        <span className="badge bg-danger">Remove</span>
                      </div>
                    </div>
                  </a>
                </li>
                <li className="nav-item iq-chat-list " role="presentation">
                  <a href="#" className="nav-link  d-flex gap-1 ">
                    <div className="position-relative">
                      <span className="badge badge-pill btn btn-soft-danger  font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2 ">
                        b
                      </span>
                    </div>
                    <div className="d-flex align-items-center w-100 iq-userlist-data">
                      <div className="d-flex flex-grow-1 flex-column">
                        <div className="d-flex align-items-center gap-1">
                          <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">
                            Biswa
                          </p>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <small className="text-ellipsis short-1 flex-grow-1 chat-small">
                            +918319904375
                          </small>
                        </div>
                      </div>
                      <div className="">
                        <span className="badge bg-danger">Remove</span>
                      </div>
                    </div>
                  </a>
                </li>
                <li className="nav-item iq-chat-list " role="presentation">
                  <a href="# " className="nav-link  d-flex gap-1 ">
                    <div className="position-relative">
                      <span className="badge badge-pill btn btn-soft-danger  font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2 ">
                        J
                      </span>
                    </div>
                    <div className="d-flex align-items-center w-100 iq-userlist-data">
                      <div className="d-flex flex-grow-1 flex-column">
                        <div className="d-flex align-items-center gap-1">
                          <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">
                            Jyothi
                          </p>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <small className="text-ellipsis short-1 flex-grow-1 chat-small">
                            +919663759309
                          </small>
                        </div>
                      </div>
                      <div className="">
                        <span className="badge bg-danger">Remove</span>
                      </div>
                    </div>
                  </a>
                </li>
                <li className="nav-item iq-chat-list " role="presentation">
                  <a href="# " className="nav-link  d-flex gap-1 ">
                    <div className="position-relative">
                      <span className="badge badge-pill btn btn-soft-danger  font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2 ">
                        S
                      </span>
                    </div>
                    <div className="d-flex align-items-center w-100 iq-userlist-data">
                      <div className="d-flex flex-grow-1 flex-column">
                        <div className="d-flex align-items-center gap-1">
                          <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">
                            Satheesh
                          </p>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <small className="text-ellipsis short-1 flex-grow-1 chat-small">
                            +919307063834
                          </small>
                        </div>
                      </div>
                      <div className="">
                        <span className="badge bg-danger">Remove</span>
                      </div>
                    </div>
                  </a>
                </li>
                <li className="nav-item iq-chat-list " role="presentation">
                  <a href="# " className="nav-link  d-flex gap-1 ">
                    <div className="position-relative">
                      <span className="badge badge-pill btn btn-soft-danger  font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2 ">
                        S
                      </span>
                    </div>
                    <div className="d-flex align-items-center w-100 iq-userlist-data">
                      <div className="d-flex flex-grow-1 flex-column">
                        <div className="d-flex align-items-center gap-1">
                          <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">
                            Sursh K
                          </p>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <small className="text-ellipsis short-1 flex-grow-1 chat-small">
                            +91 950246 5331
                          </small>
                        </div>
                      </div>
                      <div className="">
                        <span className="badge bg-danger">Remove</span>
                      </div>
                    </div>
                  </a>
                </li>
                <li className="nav-item iq-chat-list " role="presentation">
                  <a href="# " className="nav-link  d-flex gap-1 ">
                    <div className="position-relative">
                      <span className="badge badge-pill btn btn-soft-danger  font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2 ">
                        N
                      </span>
                    </div>
                    <div className="d-flex align-items-center w-100 iq-userlist-data">
                      <div className="d-flex flex-grow-1 flex-column">
                        <div className="d-flex align-items-center gap-1">
                          <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">
                            Nagesh
                          </p>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <small className="text-ellipsis short-1 flex-grow-1 chat-small">
                            +919307063834
                          </small>
                        </div>
                      </div>
                      <div className="">
                        <span className="badge bg-danger">Remove</span>
                      </div>
                    </div>
                  </a>
                </li>
                <li className="nav-item iq-chat-list " role="presentation">
                  <a href="# " className="nav-link  d-flex gap-1 ">
                    <div className="position-relative">
                      <span className="badge badge-pill btn btn-soft-danger  font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2 ">
                        P
                      </span>
                    </div>
                    <div className="d-flex align-items-center w-100 iq-userlist-data">
                      <div className="d-flex flex-grow-1 flex-column">
                        <div className="d-flex align-items-center gap-1">
                          <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">
                            Pramodh
                          </p>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <small className="text-ellipsis short-1 flex-grow-1 chat-small">
                            +919307063834
                          </small>
                        </div>
                      </div>
                      <div className="">
                        <span className="badge bg-danger">Remove</span>
                      </div>
                    </div>
                  </a>
                </li>
                <li className="nav-item iq-chat-list " role="presentation">
                  <a href="# " className="nav-link  d-flex gap-1 ">
                    <div className="position-relative">
                      <span className="badge badge-pill btn btn-soft-danger  font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2 ">
                        S
                      </span>
                    </div>
                    <div className="d-flex align-items-center w-100 iq-userlist-data">
                      <div className="d-flex flex-grow-1 flex-column">
                        <div className="d-flex align-items-center gap-1">
                          <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">
                            Santhosh{" "}
                          </p>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <small className="text-ellipsis short-1 flex-grow-1 chat-small">
                            +919307063834
                          </small>
                        </div>
                      </div>
                      <div className="">
                        <span className="badge bg-danger">Remove</span>
                      </div>
                    </div>
                  </a>
                </li>
              </ul>
              {/* Sidebar Menu End */}
            </div>
          </div>
          <div className="d-flex gap-4 mb-1  justify-content-between">
            <a href="#" className="btn btn-primary px-4">
              Create
            </a>
            <a href="#" className="btn btn-warning px-4">
              Cancel
            </a>
          </div>
        </div>
      </div>
      {/* --off canvas end--- */}
      <div
        className="offcanvas offcanvas-end on-rtl end"
        tabIndex={-1}
        id="offcanvasRight12"
        aria-labelledby="offcanvasRightLabel1"
      >
        <div className="offcanvas-header  ">
          <h4 className="fw-bold">Edit Channel</h4>
          <div className="close-icon" data-bs-dismiss="offcanvas">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24px"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <div className="offcanvas-body pt-0">
          <div className="row">
            <div className=" ">
              <aside
                className="sidebar-chat sidebar-base border-0 shadow-none  rounded-2"
                data-sidebar="responsive"
              >
                <form>
                  <div className="form-group mt-3">
                    <select
                      className="form-select"
                      id="exampleFormControlSelect1"
                    >
                      <option value="" selected="">
                        Select the Community
                      </option>
                      <option value=" ">Vitel global</option>
                      <option value=" ">Varun digital</option>
                      <option value=" ">Pranathi soft</option>
                    </select>
                  </div>
                  <div className="form-floating mb-3">
                    <input
                      type="text"
                      className="form-control"
                      id="floatingInput"
                      placeholder="Enter group name"
                    />
                    <label htmlFor="floatingInput" className="fw-500">
                      Channel name
                    </label>
                  </div>
                  <div className="form-floating mb-3">
                    <input
                      type="text"
                      className="form-control"
                      id="floatingDescription"
                      placeholder="Enter Description"
                    />
                    <label htmlFor="floatingDescription" className="fw-500">
                      Description
                    </label>
                  </div>
                  <div className="d-flex  justify-content-between align-items-center mb-3">
                    {/*begin::Label*/}
                    <div className="ms-1">
                      <label className="fs-6 fw-bold form-label mb-0 text-primary">
                        Channel Type
                      </label>
                    </div>
                    {/*end::Label*/}
                    {/*begin::Switch*/}
                    <div className="form-check custom-radio custom-radio-color form-check-inline">
                      <input
                        type="radio"
                        id="customRadio02"
                        name="customRadio-11"
                        className="form-check-input bg-success"
                      />
                      <label className="form-check-label" htmlFor="customRadio02">
                        {" "}
                        Public{" "}
                      </label>
                    </div>
                    <div className="form-check custom-radio custom-radio-color form-check-inline">
                      <input
                        type="radio"
                        id="customRadio03"
                        name="customRadio-11"
                        className="form-check-input bg-danger"
                      />
                      <label className="form-check-label" htmlFor="customRadio03">
                        {" "}
                        Private{" "}
                      </label>
                    </div>
                    {/*end::Switch*/}
                  </div>
                </form>
              </aside>
            </div>
            <div className="row mb-3">
              <div className="col-xl-10">
                <label
                  htmlFor="staticEmail2"
                  className="form-label custom-file-input"
                >
                  Add member from contact list
                </label>
              </div>
              <div className="col-xl-2 text-end">
                <button
                  className="btn-Icon"
                  type="button"
                  onClick={handleAddMemberFromContacts}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                    {/*!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.*/}
                    <path
                      d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3zM504 312l0-64-64 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l64 0 0-64c0-13.3 10.7-24 24-24s24 10.7 24 24l0 64 64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-64 0 0 64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"
                      fill="#010060"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-xl-10">
                <label
                  htmlFor="staticEmail2"
                  className="form-label custom-file-input"
                >
                  Add a new contact
                </label>
              </div>
              <div className="col-xl-2 text-end">
                <button
                  className="btn-Icon"
                  type="button"
                  onClick={handleAddNewContact}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                    {/*!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.*/}
                    <path
                      d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3zM504 312l0-64-64 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l64 0 0-64c0-13.3 10.7-24 24-24s24 10.7 24 24l0 64 64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-64 0 0 64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"
                      fill="#010060"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="form-group">
              <div className="d-flex justify-content-between">
                <label
                  htmlFor="customFile"
                  className="form-label custom-file-input"
                >
                  {" "}
                  Bulk upload contacts
                </label>
              </div>
              <div className="d-flex justify-content-between g-5">
                <input
                  className="form-control me-3"
                  type="file"
                  id="customFile"
                />
                <button className="btn btn-warning">Process</button>
              </div>
            </div>
            <div className="sidebar-body pt-0 data-scrollbar chat-group   pb-5 pe-2 mt-3">
              <h5 className="text-primary fw-500">Members</h5>
              {/* Sidebar Menu Start */}
              <ul
                className="nav navbar-nav iq-main-menu  mt-3"
                id="sidebar-menu"
                role="tablist"
              >
                <li className="nav-item iq-chat-list active" role="presentation">
                  <a href="#" className="nav-link  d-flex gap-1 active">
                    <div className="position-relative">
                      <span className="badge badge-pill btn btn-soft-danger  font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2 ">
                        A
                      </span>
                    </div>
                    <div className="d-flex align-items-center w-100 iq-userlist-data">
                      <div className="d-flex flex-grow-1 flex-column">
                        <div className="d-flex align-items-center gap-1">
                          <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">
                            Akash{" "}
                          </p>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <small className="text-ellipsis short-1 flex-grow-1 chat-small">
                            918319904375
                          </small>
                        </div>
                      </div>
                      <div className="">
                        <span className="badge bg-danger">Remove</span>
                      </div>
                    </div>
                  </a>
                </li>
                <li className="nav-item iq-chat-list " role="presentation">
                  <a href="#" className="nav-link  d-flex gap-1 ">
                    <div className="position-relative">
                      <span className="badge badge-pill btn btn-soft-danger  font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2 ">
                        b
                      </span>
                    </div>
                    <div className="d-flex align-items-center w-100 iq-userlist-data">
                      <div className="d-flex flex-grow-1 flex-column">
                        <div className="d-flex align-items-center gap-1">
                          <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">
                            Biswa
                          </p>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <small className="text-ellipsis short-1 flex-grow-1 chat-small">
                            +918319904375
                          </small>
                        </div>
                      </div>
                      <div className="">
                        <span className="badge bg-danger">Remove</span>
                      </div>
                    </div>
                  </a>
                </li>
                <li className="nav-item iq-chat-list " role="presentation">
                  <a href="# " className="nav-link  d-flex gap-1 ">
                    <div className="position-relative">
                      <span className="badge badge-pill btn btn-soft-danger  font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2 ">
                        J
                      </span>
                    </div>
                    <div className="d-flex align-items-center w-100 iq-userlist-data">
                      <div className="d-flex flex-grow-1 flex-column">
                        <div className="d-flex align-items-center gap-1">
                          <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">
                            Jyothi
                          </p>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <small className="text-ellipsis short-1 flex-grow-1 chat-small">
                            +919663759309
                          </small>
                        </div>
                      </div>
                      <div className="">
                        <span className="badge bg-danger">Remove</span>
                      </div>
                    </div>
                  </a>
                </li>
                <li className="nav-item iq-chat-list " role="presentation">
                  <a href="# " className="nav-link  d-flex gap-1 ">
                    <div className="position-relative">
                      <span className="badge badge-pill btn btn-soft-danger  font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2 ">
                        S
                      </span>
                    </div>
                    <div className="d-flex align-items-center w-100 iq-userlist-data">
                      <div className="d-flex flex-grow-1 flex-column">
                        <div className="d-flex align-items-center gap-1">
                          <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">
                            Satheesh
                          </p>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <small className="text-ellipsis short-1 flex-grow-1 chat-small">
                            +919307063834
                          </small>
                        </div>
                      </div>
                      <div className="">
                        <span className="badge bg-danger">Remove</span>
                      </div>
                    </div>
                  </a>
                </li>
                <li className="nav-item iq-chat-list " role="presentation">
                  <a href="# " className="nav-link  d-flex gap-1 ">
                    <div className="position-relative">
                      <span className="badge badge-pill btn btn-soft-danger  font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2 ">
                        S
                      </span>
                    </div>
                    <div className="d-flex align-items-center w-100 iq-userlist-data">
                      <div className="d-flex flex-grow-1 flex-column">
                        <div className="d-flex align-items-center gap-1">
                          <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">
                            Sursh K
                          </p>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <small className="text-ellipsis short-1 flex-grow-1 chat-small">
                            +91 950246 5331
                          </small>
                        </div>
                      </div>
                      <div className="">
                        <span className="badge bg-danger">Remove</span>
                      </div>
                    </div>
                  </a>
                </li>
                <li className="nav-item iq-chat-list " role="presentation">
                  <a href="# " className="nav-link  d-flex gap-1 ">
                    <div className="position-relative">
                      <span className="badge badge-pill btn btn-soft-danger  font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2 ">
                        N
                      </span>
                    </div>
                    <div className="d-flex align-items-center w-100 iq-userlist-data">
                      <div className="d-flex flex-grow-1 flex-column">
                        <div className="d-flex align-items-center gap-1">
                          <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">
                            Nagesh
                          </p>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <small className="text-ellipsis short-1 flex-grow-1 chat-small">
                            +919307063834
                          </small>
                        </div>
                      </div>
                      <div className="">
                        <span className="badge bg-danger">Remove</span>
                      </div>
                    </div>
                  </a>
                </li>
                <li className="nav-item iq-chat-list " role="presentation">
                  <a href="# " className="nav-link  d-flex gap-1 ">
                    <div className="position-relative">
                      <span className="badge badge-pill btn btn-soft-danger  font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2 ">
                        P
                      </span>
                    </div>
                    <div className="d-flex align-items-center w-100 iq-userlist-data">
                      <div className="d-flex flex-grow-1 flex-column">
                        <div className="d-flex align-items-center gap-1">
                          <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">
                            Pramodh
                          </p>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <small className="text-ellipsis short-1 flex-grow-1 chat-small">
                            +919307063834
                          </small>
                        </div>
                      </div>
                      <div className="">
                        <span className="badge bg-danger">Remove</span>
                      </div>
                    </div>
                  </a>
                </li>
                <li className="nav-item iq-chat-list " role="presentation">
                  <a href="# " className="nav-link  d-flex gap-1 ">
                    <div className="position-relative">
                      <span className="badge badge-pill btn btn-soft-danger  font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2 ">
                        S
                      </span>
                    </div>
                    <div className="d-flex align-items-center w-100 iq-userlist-data">
                      <div className="d-flex flex-grow-1 flex-column">
                        <div className="d-flex align-items-center gap-1">
                          <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">
                            Santhosh{" "}
                          </p>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <small className="text-ellipsis short-1 flex-grow-1 chat-small">
                            +919307063834
                          </small>
                        </div>
                      </div>
                      <div className="">
                        <span className="badge bg-danger">Remove</span>
                      </div>
                    </div>
                  </a>
                </li>
              </ul>
              {/* Sidebar Menu End */}
            </div>
          </div>
          <div className="d-flex gap-4 mb-1  justify-content-between">
            <a href="#" className="btn btn-warning px-4">
              Cancel
            </a>
            <a href="#" className="btn btn-primary px-4">
              Save
            </a>
          </div>
        </div>
      </div>
      <div
        className="offcanvas offcanvas-end on-rtl end"
        tabIndex={-1}
        id="offcanvasRightcontact"
        aria-labelledby="offcanvasRightLabel1"
      >
        <div className="offcanvas-header  ">
          <h4 className="fw-bold">Contacts</h4>
          <div className="close-icon" data-bs-dismiss="offcanvas">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24px"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <div className="offcanvas-body pt-0">
          <div className="row">
            <div className=" ">
              <aside
                className="sidebar-chat sidebar-base border-0 shadow-none  rounded-2"
                data-sidebar="responsive"
              >
                <div className="chat-searchbar  ">
                  <div className="form-group chat-search-data mt-3 mb-4">
                    <input
                      type="text"
                      className="form-control round group-search"
                      id="chat-search"
                      placeholder="Search Contacts.."
                    />
                  </div>
                </div>
                {/*   <div class="card-body text-center mt-4 mb-3">
                                 <h5 class="fw-500 text-info">Invite via Link : </h5>
                                 <h6>
                                    <a href="" class="fw-500 text-primary">
                                       https://t.me/+gElYatmTXNRiNTQ1
                                       <svg xmlns="http://www.w3.org/2000/svg" width="18px" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                                    </a>
                                    </svg>
                                 </h6>
                                 </div> */}
                <div className="sidebar-body pt-0 data-scrollbar chat-group mb-5 pb-5 pe-2">
                  {/* Sidebar Menu Start */}
                  <ul
                    className="nav navbar-nav iq-main-menu  "
                    id="sidebar-menu"
                    role="tablist"
                  >
                    <li
                      className="nav-item iq-chat-list active p-0"
                      role="presentation"
                    >
                      <a href="#" className="nav-link  d-flex gap-1 active">
                        <div className="position-relative">
                          <span className="badge badge-pill btn btn-soft-danger  font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2 ">
                            A
                          </span>
                        </div>
                        <div className="d-flex align-items-center w-100 iq-userlist-data">
                          <div className="d-flex flex-grow-1 flex-column">
                            <div className="d-flex align-items-center gap-1">
                              <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">
                                Akash{" "}
                              </p>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <small className="text-ellipsis short-1 flex-grow-1 chat-small">
                                918319904375
                              </small>
                            </div>
                          </div>
                          <div className="form-check ">
                            <input
                              type="checkbox"
                              className="form-check-input group-select"
                              id="customCheck1"
                            />
                          </div>
                        </div>
                      </a>
                    </li>
                    <li className="nav-item iq-chat-list p-0" role="presentation">
                      <a href="#" className="nav-link  d-flex gap-1 ">
                        <div className="position-relative">
                          <span className="badge badge-pill btn btn-soft-danger  font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2 ">
                            b
                          </span>
                        </div>
                        <div className="d-flex align-items-center w-100 iq-userlist-data">
                          <div className="d-flex flex-grow-1 flex-column">
                            <div className="d-flex align-items-center gap-1">
                              <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">
                                Biswa
                              </p>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <small className="text-ellipsis short-1 flex-grow-1 chat-small">
                                +918319904375
                              </small>
                            </div>
                          </div>
                          <div className="form-check ">
                            <input
                              type="checkbox"
                              className="form-check-input group-select"
                              id="customCheck1"
                            />
                          </div>
                        </div>
                      </a>
                    </li>
                    <li className="nav-item iq-chat-list p-0" role="presentation">
                      <a href="# " className="nav-link  d-flex gap-1 ">
                        <div className="position-relative">
                          <span className="badge badge-pill btn btn-soft-danger  font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2 ">
                            J
                          </span>
                        </div>
                        <div className="d-flex align-items-center w-100 iq-userlist-data">
                          <div className="d-flex flex-grow-1 flex-column">
                            <div className="d-flex align-items-center gap-1">
                              <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">
                                Jyothi
                              </p>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <small className="text-ellipsis short-1 flex-grow-1 chat-small">
                                +919663759309
                              </small>
                            </div>
                          </div>
                          <div className="form-check ">
                            <input
                              type="checkbox"
                              className="form-check-input group-select"
                              id="customCheck1"
                            />
                          </div>
                        </div>
                      </a>
                    </li>
                    <li className="nav-item iq-chat-list p-0" role="presentation">
                      <a href="# " className="nav-link  d-flex gap-1 ">
                        <div className="position-relative">
                          <span className="badge badge-pill btn btn-soft-danger  font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2 ">
                            S
                          </span>
                        </div>
                        <div className="d-flex align-items-center w-100 iq-userlist-data">
                          <div className="d-flex flex-grow-1 flex-column">
                            <div className="d-flex align-items-center gap-1">
                              <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">
                                Satheesh
                              </p>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <small className="text-ellipsis short-1 flex-grow-1 chat-small">
                                +919307063834
                              </small>
                            </div>
                          </div>
                          <div className="form-check ">
                            <input
                              type="checkbox"
                              className="form-check-input group-select"
                              id="customCheck1"
                            />
                          </div>
                        </div>
                      </a>
                    </li>
                    <li className="nav-item iq-chat-list p-0" role="presentation">
                      <a href="# " className="nav-link  d-flex gap-1 ">
                        <div className="position-relative">
                          <span className="badge badge-pill btn btn-soft-danger  font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2 ">
                            S
                          </span>
                        </div>
                        <div className="d-flex align-items-center w-100 iq-userlist-data">
                          <div className="d-flex flex-grow-1 flex-column">
                            <div className="d-flex align-items-center gap-1">
                              <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">
                                Sursh K
                              </p>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <small className="text-ellipsis short-1 flex-grow-1 chat-small">
                                +91 950246 5331
                              </small>
                            </div>
                          </div>
                          <div className="form-check ">
                            <input
                              type="checkbox"
                              className="form-check-input group-select"
                              id="customCheck1"
                            />
                          </div>
                        </div>
                      </a>
                    </li>
                    <li className="nav-item iq-chat-list p-0" role="presentation">
                      <a href="# " className="nav-link  d-flex gap-1 ">
                        <div className="position-relative">
                          <span className="badge badge-pill btn btn-soft-danger  font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2 ">
                            N
                          </span>
                        </div>
                        <div className="d-flex align-items-center w-100 iq-userlist-data">
                          <div className="d-flex flex-grow-1 flex-column">
                            <div className="d-flex align-items-center gap-1">
                              <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">
                                Nagesh
                              </p>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <small className="text-ellipsis short-1 flex-grow-1 chat-small">
                                +919307063834
                              </small>
                            </div>
                          </div>
                          <div className="form-check ">
                            <input
                              type="checkbox"
                              className="form-check-input group-select"
                              id="customCheck1"
                            />
                          </div>
                        </div>
                      </a>
                    </li>
                    <li className="nav-item iq-chat-list p-0" role="presentation">
                      <a href="# " className="nav-link  d-flex gap-1 ">
                        <div className="position-relative">
                          <span className="badge badge-pill btn btn-soft-danger  font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2 ">
                            P
                          </span>
                        </div>
                        <div className="d-flex align-items-center w-100 iq-userlist-data">
                          <div className="d-flex flex-grow-1 flex-column">
                            <div className="d-flex align-items-center gap-1">
                              <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">
                                Pramodh
                              </p>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <small className="text-ellipsis short-1 flex-grow-1 chat-small">
                                +919307063834
                              </small>
                            </div>
                          </div>
                          <div className="form-check ">
                            <input
                              type="checkbox"
                              className="form-check-input group-select"
                              id="customCheck1"
                            />
                          </div>
                        </div>
                      </a>
                    </li>
                    <li className="nav-item iq-chat-list p-0" role="presentation">
                      <a href="# " className="nav-link  d-flex gap-1 ">
                        <div className="position-relative">
                          <span className="badge badge-pill btn btn-soft-danger  font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2 ">
                            S
                          </span>
                        </div>
                        <div className="d-flex align-items-center w-100 iq-userlist-data">
                          <div className="d-flex flex-grow-1 flex-column">
                            <div className="d-flex align-items-center gap-1">
                              <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">
                                Santhosh{" "}
                              </p>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <small className="text-ellipsis short-1 flex-grow-1 chat-small">
                                +919307063834
                              </small>
                            </div>
                          </div>
                          <div className="form-check ">
                            <input
                              type="checkbox"
                              className="form-check-input group-select"
                              id="customCheck1"
                            />
                          </div>
                        </div>
                      </a>
                    </li>
                  </ul>
                  {/* Sidebar Menu End */}
                  <div>
                    <a
                      href="#"
                      className="btn btn-primary d-block mt-3"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvasRight1"
                      aria-controls="offcanvasRight"
                    >
                      Add
                    </a>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
      <div
        className="offcanvas offcanvas-end on-rtl end"
        tabIndex={-1}
        id="offcanvasRight_addNew"
        aria-labelledby="offcanvasRight_addNew"
      >
        <div className="offcanvas-header  ">
          <h4 className="fw-bold">Add Member to Channel</h4>
          <div className="close-icon" data-bs-dismiss="offcanvas">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24px"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <div className="offcanvas-body pt-0">
          <div className="row">
            <form>
              <div className="mb-3 mt-3">
                <label htmlFor="exampleInputEmail1" className="form-label">
                  Telegram User ID{" "}
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="exampleInputEmail1"
                  aria-describedby="emailHelp"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="exampleInputPassword1" className="form-label">
                  Phone Number{" "}
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="exampleInputPassword1"
                />
              </div>
              <div className="row mb-3">
                <div className="col-6 ps-2 form-check">
                  <label htmlFor="exampleInputPassword1" className="form-label">
                    First Name{" "}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="exampleInputPassword1"
                  />
                </div>
                <div className="col-6 pe-2 form-check">
                  <label htmlFor="exampleInputPassword1" className="form-label">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="exampleInputPassword1"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="exampleInputPassword1" className="form-label">
                  Email ID
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="exampleInputPassword1"
                />
              </div>
            </form>
            <div>
              <a
                href="#"
                className="btn btn-primary d-block mt-3"
                data-bs-toggle="modal"
                data-bs-target="#thanksModal"
              >
                {" "}
                Save and Add
              </a>
            </div>
          </div>
        </div>
      </div>


      {/* --off canvas  details sec--- */}
      {/* --off canvas end--- */}
      {/* details edit sectio */}
      {/* topic canvvas start */}
      <div
        className="offcanvas offcanvas-end on-rtl end"
        tabIndex={-1}
        id="offcanvasTopics"
        aria-labelledby="offcanvasRightLabel1"
      >
        <div className="offcanvas-header  ">
          <h4 className="fw-bold text-primary">All Topics</h4>
          <div className="close-icon" data-bs-dismiss="offcanvas">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24px"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <div className="offcanvas-body ps-0">
          <div className="row"></div>
          <div className=" ">
            <aside
              className="sidebar-chat sidebar-base border-end shadow-none  rounded-2"
              data-sidebar="responsive"
            >
              <div className="sidebar-body pt-0 data-scrollbar chat-group mb-5 pb-5 pe-2">
                {/* Sidebar Menu Start */}
                <ul
                  className="nav navbar-nav iq-main-menu "
                  id="sidebar-menu"
                  role="tablist"
                >
                  <li
                    className="nav-item iq-chat-list active"
                    role="presentation"
                  >
                    <a href="#" className="nav-link  d-flex gap-1 active">
                      <div className="position-relative">
                        <span className="badge badge-pill btn btn-soft-danger  font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2 ">
                          V
                        </span>
                      </div>
                      <div className="d-flex align-items-center w-100 iq-userlist-data">
                        <div className="d-flex flex-grow-1 flex-column">
                          <div className="d-flex align-items-center gap-1">
                            <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">
                              Vitel Hr team{" "}
                            </p>
                          </div>
                        </div>
                      </div>
                    </a>
                  </li>
                  <li className="nav-item iq-chat-list " role="presentation">
                    <a
                      href="#"
                      className="nav-link  d-flex gap-1 "
                      data-bs-toggle="tab"
                      role="tab"
                      aria-controls="user-content-102"
                      aria-selected="false"
                      tabIndex={-1}
                    >
                      <div className="position-relative">
                        <span className="badge badge-pill btn btn-soft-danger font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2 ">
                          D
                        </span>
                      </div>
                      <div className="d-flex align-items-center w-100 iq-userlist-data">
                        <div className="d-flex flex-grow-1 flex-column">
                          <div className="d-flex align-items-center gap-1">
                            <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">
                              Development topic
                            </p>
                          </div>
                        </div>
                      </div>
                    </a>
                  </li>
                  <li className="nav-item iq-chat-list " role="presentation">
                    <a
                      href="# "
                      className="nav-link  d-flex gap-1 "
                      data-bs-toggle="tab"
                      role="tab"
                      aria-controls="user-content-103"
                      aria-selected="false"
                      tabIndex={-1}
                    >
                      <div className="position-relative">
                        <span className="badge badge-pill btn btn-soft-danger  font-weight-normal ms-auto me-1 badge-45 md-14 rounded-circle p-2 ">
                          C
                        </span>
                      </div>
                      <div className="d-flex align-items-center w-100 iq-userlist-data">
                        <div className="d-flex flex-grow-1 flex-column">
                          <div className="d-flex align-items-center gap-1">
                            <p className="mb-0 text-ellipsis short-1 flex-grow-1 iq-userlist-name fw-500">
                              CRM topic
                            </p>
                          </div>
                        </div>
                      </div>
                    </a>
                  </li>
                </ul>
                {/* Sidebar Menu End */}
              </div>
            </aside>
          </div>
        </div>
      </div>
      {/* topics canvas end */}
      {/* Thanks Modal */}
      <div
        className="modal fade"
        id="thanksModal"
        tabIndex={-1}
        aria-labelledby="exampleModalCenterTitle"
        style={{ display: "none" }}
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-dialog-centered modal-md"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-body text-center">
              <img src="/assets/images/successfull.png" className="mt-3 mx-auto" />
              <h4 className="mt-3">Your data has been successfully saved!</h4>
            </div>
            <div className="modal-footer justify-content-center border-0">
              <button
                type="button"
                className="btn btn-primary px-5"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* topic modal */}
      <div
        className="modal fade"
        id="exampleTopic"
        tabIndex={-1}
        aria-labelledby="exampleModalCenterTitle"
        style={{ display: "none" }}
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalCenterTitle">
                Share link
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body px-3">
              <div className=" ">
                <label className="form-label mb-2" htmlFor=" ">
                  Share link to add member :{" "}
                </label>
                <div className="input-group mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="https://web.telegram.org/a/"
                  />
                  <button className="btn btn-success" type="submit">
                    Create link
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* topic modal end */}
      {/* topic edit modal */}
      <div
        className="modal fade"
        id="exampleEdit"
        tabIndex={-1}
        aria-labelledby="exampleModalCenterTitle"
        style={{ display: "none" }}
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalCenterTitle">
                Edit Topic
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body px-3">
              <div className="card-body">
                <div className="text-center">
                  <img
                    className="img-fluid rounded-circle avatar-100 mx-auto"
                    src="assets/images/user/user.png"
                    alt="profile-img"
                  />
                  <h4 className="mt-3 text-primary fw-500">Vitel Hr team</h4>
                  <p>
                    knowledge here n ask the relevant questions.It's a humble
                    request to each n every member tomaintain ethics and dignity in
                    this Group.
                  </p>
                </div>
                <div className="text-center">
                  <h5 className="mb-0  fw-500 text-primary">Share</h5>
                  <h6 className="mb-0 fw-500">
                    <a href="#">https://web.telegram.org/a/</a>
                    <span>
                      <a href="#">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={20}
                          height={20}
                          fill="currentColor"
                          className="bi bi-copy ms-2"
                          viewBox="0 0 16 16"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"
                          />
                        </svg>
                      </a>
                    </span>
                  </h6>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary">
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* topic edit modal end */}
      {/* end off canvas */}



      <Modal
        show={showBulkSendModal}
        onHide={handleCloseBulkSendModal}
        backdrop="static"
        size="md"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Bulk Contact
            <span>
              <span class="required text-danger">*</span>(Upload a CSV file)
            </span>
          </Modal.Title>
        </Modal.Header>
        <form
          id="creditCardForm"
          className=" g-3 fv-plugins-bootstrap5 fv-plugins-framework fv-plugins-icon-container"
          novalidate="novalidate"
          onSubmit={handleSubmitBulkTemp(bulkSendTemplate)}
        >
          <Modal.Body>
            <div class="mb-4">
              <p class="mb-2">
                {" "}
                <b>
                  Please use the below given sample file format for the upload.
                </b>
              </p>
              <a
                href="/samplefile/bulk_uploads_sample.csv"
                target="_blank"
                class="btn btn-sm btn-soft-success  "
              >
                {/* <!--begin::Svg Icon | path: icons/duotune/arrows/arr012.svg--> */}
                <span class="svg-icon svg-icon-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      opacity="0.3"
                      d="M4.425 20.525C2.525 18.625 2.525 15.525 4.425 13.525L14.825 3.125C16.325 1.625 18.825 1.625 20.425 3.125C20.825 3.525 20.825 4.12502 20.425 4.52502C20.025 4.92502 19.425 4.92502 19.025 4.52502C18.225 3.72502 17.025 3.72502 16.225 4.52502L5.82499 14.925C4.62499 16.125 4.62499 17.925 5.82499 19.125C7.02499 20.325 8.82501 20.325 10.025 19.125L18.425 10.725C18.825 10.325 19.425 10.325 19.825 10.725C20.225 11.125 20.225 11.725 19.825 12.125L11.425 20.525C9.525 22.425 6.425 22.425 4.425 20.525Z"
                      fill="currentcolor"
                    ></path>
                    <path
                      d="M9.32499 15.625C8.12499 14.425 8.12499 12.625 9.32499 11.425L14.225 6.52498C14.625 6.12498 15.225 6.12498 15.625 6.52498C16.025 6.92498 16.025 7.525 15.625 7.925L10.725 12.8249C10.325 13.2249 10.325 13.8249 10.725 14.2249C11.125 14.6249 11.725 14.6249 12.125 14.2249L19.125 7.22493C19.525 6.82493 19.725 6.425 19.725 5.925C19.725 5.325 19.525 4.825 19.125 4.425C18.725 4.025 18.725 3.42498 19.125 3.02498C19.525 2.62498 20.125 2.62498 20.525 3.02498C21.325 3.82498 21.725 4.825 21.725 5.925C21.725 6.925 21.325 7.82498 20.525 8.52498L13.525 15.525C12.325 16.725 10.525 16.725 9.32499 15.625Z"
                      fill="currentcolor"
                    ></path>
                  </svg>
                </span>
                {/* <!--end::Svg Icon-->Sample.csv */}&nbsp;Sample.csv
              </a>
            </div>
            <div class="form-group">
              <label class="d-flex align-items-center fs-6 fw-semibold form-label mb-2">
                <span class="required">
                  File<span class="text-danger">*</span>
                </span>
              </label>
              <input class="form-control"
                type="file"
                {...registerBulkTemp('fileUpload', {
                  required: 'File is required', // File is mandatory
                  validate: {
                    // Validate file size (1 MB limit)
                    sizeLimit: (file) =>
                      file[0]?.size <= 1048576 || 'File size exceeds 1 MB',

                    // Validate file type (CSV only)
                    fileType: (file) =>
                      file[0]?.type === 'text/csv' || 'Only CSV files are allowed',
                  },
                })} />
            </div>
            {errorsBulkTemp.fileUpload && (
              <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                {errorsBulkTemp.fileUpload.message}
              </div>
            )}
            <div class="form-group">
              <label class="d-flex align-items-center fs-6 fw-semibold form-label mb-2">
                <span class="required">
                  Template<span class="text-danger">*</span>
                </span>
              </label>
              <select class="form-select"
                // {...registerBulkTemp('template_data', { required: 'Please select a template' })}
                {...registerBulkTemp('template_data', { required: 'Please select a template' })}
                value={selectedTemplateDrop?.id || ''} // Set the value to the selected template ID
                onChange={handleTemplateChange}
              >

                <option value="">Select your template</option>
                {templateData && templateData.map((template) => (
                  <option key={template.id} value={template.id}> {/* Use template.id as value */}
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
            {errorsBulkTemp.template_data && (
              <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                {errorsBulkTemp.template_data.message}
              </div>
            )}
            <div className="template-container mt-5">
              {selectedTemplateDrop?.components?.map((component, index) => {
                if (component?.type === "HEADER" && component?.example?.header_text) {
                  return (
                    <div key={index} className="header-component mb-3 d-flex align-items-center">
                      <p className="mb-0 me-2">{component?.example?.header_text[0]}</p>
                      <input
                        type="text"
                        value={headerInputValueBulk}
                        onChange={(e) => handleHeaderInputBulkChange(e.target.value)}
                        className="form-control align-input" // Added class for uniform height
                      />
                    </div>
                  );
                }

                if (component?.type === "BODY" && component?.example?.body_text) {
                  return (
                    <div key={index} className="body-component mb-3">
                      {component?.example?.body_text[0].map((text, bodyIndex) => (
                        <div key={bodyIndex} className="body-text-item mb-2 d-flex align-items-center">
                          <p className="mb-0 me-2">{text}</p>
                          <input
                            type="text"
                            value={bodyInputValuesBulk[bodyIndex] || ''}
                            onChange={(e) => handleBodyInputBulkChange(bodyIndex, e.target.value)}
                            className="form-control align-input" // Added class for uniform height
                          />
                        </div>
                      ))}
                    </div>
                  );
                }

                return null;
              })}
            </div>
            <div class=" pb-5 border-0">
              <div>
                <button class="btn btn-primary d-block mt-3 w-100" type="submit">
                  Upload
                </button>
              </div>
            </div>
          </Modal.Body>
        </form>
      </Modal>
    </main >
  );
}