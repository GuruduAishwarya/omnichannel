import React, { useEffect, useRef, useState } from "react";
import PageTitle from "../../../common/PageTitle";
import SkeletonLoader from "../../../common/components/SkeletonLoader";
import {
  fetchListChatbot,
  fetchTempData,
  CreateTempBroadCast,
  SendWhatsAppTemp,
  DeleteWhatsAppTemp,
  listContact,
  getTemplateGroup,
  BulkSendTemp,
  fetchTempList,
  fetchImageTemplateFileUrl,
  workspaceDetails
} from "../../../utils/ApiClient";
import {
  getBase64,
  triggerAlert,
  ConfirmationAlert,
  downloadFile,
} from "../../../utils/CommonFunctions";
import {
  isValidTemplateName,
  noEmptySpacesValidation,
  onlyAlphabetsandSpaces,
  MaxLengthValidation,
  MinLengthValidation,
} from "../../../utils/Constants";
import { Modal, Button, Form } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import Loader from "../../../common/components/Loader";
import CountryCodeSelector from "../../../common/components/CountryCode";
import IntlTelInput from "intl-tel-input/react";
import { FaFilePdf, FaFileDownload, FaTimes } from "react-icons/fa";
import { MdOutlineDownloading } from "react-icons/md";
import CreatableMultiSelectDyGet from "../../../common/components/selects/CreatableMultiSelectDyGet";

export default function Templates() {
  const api_url = process.env.REACT_APP_API_BASE_URL;
  const [isLoading, setIsLoading] = useState(false);
  const [marketingData, setMarketingData] = useState([]);
  const [utilityData, setUtilityData] = useState([]);
  const [authenticationData, setAuthenticationData] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [dataTemplate, setDataTemplate] = useState(null);
  const [templateCategory, setTemplateCategory] = useState("");
  const [headerSelect, setHeaderSelect] = useState("1");
  const [headerText, setHeaderText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [templateText, setTemplateText] = useState("");
  const [templateFooter, setTemplateFooter] = useState("");
  const [buttonSelect, setButtonSelect] = useState("");
  const [stopPromos, setStopPromos] = useState(false);
  const [typeOfAction, setTypeOfAction] = useState("1");
  const [buttonTextCall, setButtonTextCall] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isSecurityMessageVisible, setSecurityMessageVisible] = useState(true);
  const [buttonTextWebsite, setButtonTextWebsite] = useState("");
  const [codeDelivery, setCodeDelivery] = useState("ONE_TAP");
  const [packageName, setPackageName] = useState("");
  const [appHash, setAppHash] = useState("");
  const [autoFillText, setAutoFillText] = useState("Autofill");
  const [copyCodeText, setCopyCodeText] = useState("Copy code");
  const [copyCode, setCopyCode] = useState("");
  const [addSecurityRec, setAddSecurityRec] = useState(true);
  const [addExpiryTime, setAddExpiryTime] = useState(false);
  const [expiryIn, setExpiryIn] = useState("");
  const [expireTime, setExpireTime] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [format, setFormat] = useState("");
  const [text, setText] = useState("");
  const textareaRef = useRef(null);
  const [chatbotDrop, setchatDrpopDown] = useState([]);
  const [base64File, setBase64File] = useState({});
  const [inputs, setInputs] = useState([]);
  const [isFileReady, setIsFileReady] = useState(false);
  const [variables, setVariables] = useState([]);
  const [variablesTemp, setVariablesTemp] = useState([]);
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [fileName, setFileName] = useState("");
  const [allTemplates, setAllTemplates] = useState([]);
  const [promos, setPromos] = useState([]);
  const [show, setShow] = useState(false);
  const [showSend, setShowSend] = useState(false);
  const [showScheduleInput, setShowScheduleInput] = useState(false);
  const [schedule, setSchedule] = useState("");
  const [groupContactVal, setGroupContactVal] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  // const [showDropdown, setShowDropdown] = useState(false);
  const [selectedContact, setSelectedContact] = useState(" ");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [contactNumbers, setContactNumbers] = useState([]);
  const [customPhoneNumber, setCustomPhoneNumber] = useState("");
  const [headerInputValue, setHeaderInputValue] = useState("");
  const [headerInputValueBulk, setHeaderInputValueBulk] = useState("");
  const [bodyInputValuesBulk, setBodyInputValuesBulk] = useState({});
  const [bodyInputValues, setBodyInputValues] = useState({});
  const [selectedTemplateDrop, setSelectedTemplateDrop] = useState(null);
  const [hasTextAfterVariable, setHasTextAfterVariable] = useState(false);
   const [hideButton, setHideButton] = useState(true)
          const [messageError, setMessageError] = useState("")
  
            const handleBulkSendButton = async () => {
              try {
                const workId = JSON.parse(localStorage.getItem("workspace_id"))
                const response = await workspaceDetails(workId)
                const data = response.data.results
                const filteredData = data.filter((item) => item.plan_type === "whatsapp")
                if (filteredData.length === 0) {
                  setHideButton(false)
                  setMessageError("Note: No WhatsApp plan is available.")
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
  

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [component, setComponent] = useState({
    format: "DOCUMENT",
    example: {
      header_name: "",
      header_handle: [],
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
    reset,
    trigger,
    clearErrors,
    setErrors,
    unregister,
    setError,
  } = useForm({
    defaultValues: {
      codeDelivery: "ONE_TAP",
      // copyCodeText:"Autofill",
      // autoFillText: "Copy code",
    },
  });
  const [isVisible, setIsVisible] = useState(true);

  const {
    register: registerSend,
    handleSubmit: handleSubmitsSend,
    control: controlSend,
    formState: { errors: sendErrors },
    reset: sendReset,
    trigger: sendtrigger,
    clearErrors: sendClearErrors,
    unregister: sendunregister,
  } = useForm();
  const verificationCode = "123456";
  const {
    register: registerBulk,
    handleSubmit: handleSubmitsBulk,
    control: controlBulk,
    formState: { errors: BulkErrors },
    reset: BulkReset,
    trigger: Bulktrigger,
    clearErrors: BulkClearErrors,
    unregister: Bulkunregister,
  } = useForm();

  useEffect(() => {
    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      new window.bootstrap.Tooltip(tooltipTriggerEl);
    });
  }, []);


  const dropdownRef = useRef(null);
  const [showDropdown, setShowDropdown] = React.useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const handleActionButtonClick = () => {
    if (dataTemplate) {
      setShowDropdown(!showDropdown);
    } else {
      triggerAlert("info", "", "Select a template.");
    }
  };


  const handleToSelect = async (selectedOption) => {
    if (Array.isArray(selectedOption)) {
      const selectedValues = selectedOption.map((item) => {
        const numericValue =
          !isNaN(item.value) && typeof item.value === "string"
            ? Number(item.value)
            : item.value;
        return {
          ...item,
          value: numericValue,
        };
      });
      const valuesArray = selectedValues.map((item) => String(item.value));
      setContactNumbers(valuesArray); // Update state
      setValue("to_number", selectedValues); // Update form
    } else {
      console.error("Selected option is not an array.");
    }
  };

  const handleHeaderInputChange = (value) => {
    setHeaderInputValue(value);
  };
  const handleHeaderInputBulkChange = (value) => {
    setHeaderInputValueBulk(value);
  };

  const handleBodyInputChange = (index, value) => {
    setBodyInputValues((prev) => ({
      ...prev,
      [index]: value,
    }));
  };
  const handleBodyInputBulkChange = (index, value) => {
    const newBodyInputValues = [...bodyInputValuesBulk];
    newBodyInputValues[index] = value;
    setBodyInputValuesBulk(newBodyInputValues);
  };

  const removeContactNumber = (number) => {
    setContactNumbers((prevNumbers) =>
      prevNumbers.filter((num) => num !== number)
    );
  };

  const fetchContact = async () => {
    try {
      const params = {
        keyword: "",
      };
      const response = await listContact(params);

      const response_data = response.data;

      if (response_data.error_code === 200) {
        const data = Object.values(response_data.results);

        if (data.length > 0) {
          setUsers(data);
        } else {
          setUsers([]);
        }
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error(error);
      const response_data = error?.response?.data;
      triggerAlert(
        "error",
        "",
        response_data ? response_data.message : "Something went wrong!"
      );
    }
  };

  const fetchGroup = async () => {
    try {
      const response = await getTemplateGroup();
      if (response.data.error_code === 200) {
        const data = Object.values(response.data.results);
        if (data.length > 0) {
          setGroups(data);
        } else {
          setGroups([]);
        }
      }
    } catch (error) {
      console.error(error);
      const response_data = error?.response?.data;
      triggerAlert(
        "error",
        "",
        response_data ? response_data.message : "Something went wrong!"
      );
    }
  };


  const handleSendClick = async () => {
    setShowSend(true);
  };
  const handleCloseSend = async () => {
    setShowSend(false);
    sendReset();
    setDataTemplate(null);
    setShowDropdown(!showDropdown);
    setContactNumbers([]); // Reset contact numbers
    setHeaderInputValue("");
    setGroupContactVal("");
    setBodyInputValues({});
    setShowSend(false);
    setSchedule("");
    setCustomPhoneNumber("");
    setSelectedGroup("");
    setValue("to_number", []); // Explicitly reset the form field
  };

  const handleScheduleClick = () => {
    setShowScheduleInput(true);
  };

  const handleScheduleChange = (e) => {
    clearErrors("schedule");
    setSchedule(e.target.value);
  };
  const handleGroupContactChange = (e) => {
    const value = e.target.value;
    setGroupContactVal(value);
    if (value === "contact") {
      setSelectedGroup("");
    } else if (value === "group") {
      setContactNumbers([]);
    }
    sendClearErrors("groupContactVal");
  };

  // const handleDeleteClick = async () => {
  //     try {
  //         console.log('Delete clicked');
  //         setIsLoading(true)
  //         const params = dataTemplate.name
  //         const response = await DeleteWhatsAppTemp(params)
  //         console.log(response);
  //         if (response.data.error_code === 200) {
  //             triggerAlert("success", "", 'template Deleted Successfully');
  //             setIsLoading(false)
  //             fetchTemplateData()
  //             setDataTemplate(null)
  //             setShowDropdown(!showDropdown);
  //         }
  //     } catch (error) {
  //         setIsLoading(false)
  //         triggerAlert('error', '', error?.response?.data ? error?.response?.data?.message : "Something went wrong!");
  //     }
  // };

  const handleDeleteClick = async () => {
    ConfirmationAlert("You want to continue?", "Continue", async () => {
      setIsLoading(true);
      try {
        const params = dataTemplate.name;
        const response = await DeleteWhatsAppTemp(params);
        if (response.data.error_code === 200) {
          triggerAlert("success", "", "Template deleted successfully");
          fetchTemplateData();
          setDataTemplate(null);
          setShowDropdown(!showDropdown);
        }
      } catch (error) {
        triggerAlert(
          "error",
          "",
          error?.response?.data?.message || "Something went wrong!"
        );
      } finally {
        setIsLoading(false);
      }
    });
  };

  const handleEditClick = () => {
    // console.log('Edit clicked');
  };

  const MAX_INPUT_FIELDS = 9;

  const addInputField = () => {
    setInputs((prevInputs) => {
      if (prevInputs.length < MAX_INPUT_FIELDS) {
        const newId = `n${prevInputs.length + 1}`;
        return [...prevInputs, { id: newId }];
      } else {
        triggerAlert("info", "", "You can only add up to 9 chatbot lists.");
        return prevInputs;
      }
    });
  };

  const removeInputField = (id) => {
    setInputs((prevInputs) => prevInputs.filter((input) => input.id !== id));
  };
  const handleShowModal = (template) => {
    setSelectedTemplate(template);
    // Programmatically trigger the Bootstrap modal
    const modalElement = document.getElementById("exampleModalCenter-view");
    const modal = new window.bootstrap.Modal(modalElement);
    modal.show();
  };

  const applyFormatting = (formatType) => {
    const textarea = document.querySelector(".text_area_message");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = templateText.substring(start, end);
    let startTag = "";
    let endTag = "";

    switch (formatType) {
      case "bold":
        startTag = "*";
        endTag = "*";
        break;

      case "italic":
        startTag = "_";
        endTag = "_";
        break;

      case "strikethrough":
        startTag = "~";
        endTag = "~";
        break;

      case "bullet":
        // Handle bullet points separately
        if (selectedText.includes("• ")) {
          // Remove bullet points
          const newText = selectedText.replace(/^• /gm, ""); // Remove bullet from each line
          const updatedText =
            templateText.slice(0, start) + newText + templateText.slice(end);
          setTemplateText(updatedText);
          setValue("template_texts", updatedText); // Sync with form
        } else {
          // Add bullet points
          const newText = selectedText
            ?.split("\n")
            ?.map((line) => (line.trim() ? `• ${line}` : ""))
            ?.join("\n");
          const updatedText =
            templateText.slice(0, start) + newText + templateText.slice(end);
          setTemplateText(updatedText);
          setValue("template_texts", updatedText); // Sync with form
        }
        return; // Exit as bullets are handled differently

      default:
        break;
    }

    // Apply formatting for bold, italic, or strikethrough
    const newText = selectedText
      ?.split("\n") // Handle multiple lines
      ?.map((line) => (line ? `${startTag}${line}${endTag}` : "")) // Apply tags to each line
      ?.join("\n");

    const updatedText =
      templateText.slice(0, start) + newText + templateText.slice(end);

    // Update state
    setTemplateText(updatedText);
    setValue("template_texts", updatedText); // Sync with form

    // Move cursor or retain selection
    setTimeout(() => {
      const cursorPosition = selectedText
        ? start + newText.length
        : start + startTag.length;
      textarea.setSelectionRange(cursorPosition, cursorPosition);
      textarea.focus();
    }, 0);
  };

  // const applyFormatting = (formatType) => {
  //     let startTag = '';
  //     let endTag = '';

  //     switch (formatType) {
  //         case 'bold':
  //             startTag = '*';
  //             endTag = '*';
  //             break;
  //         case 'italic':
  //             startTag = '_';
  //             endTag = '_';
  //             break;
  //         case 'strikethrough':
  //             startTag = '~';
  //             endTag = '~';
  //             break;
  //         case 'bullet':
  //             // Handling bullet points differently
  //             const textarea = document.querySelector('.form-control');
  //             const start = textarea.selectionStart;
  //             const end = textarea.selectionEnd;
  //             const selectedText = templateText.substring(start, end);

  //             if (selectedText.includes('• ')) {
  //                 // Remove bullet points
  //                 const newText = selectedText.replace(/• /g, '');
  //                 const updatedText = templateText.slice(0, start) + newText + templateText.slice(end);
  //                 setTemplateText(updatedText);
  //                 setValue('template_texts', updatedText); // Sync with form
  //                 return; // Exit function after removing bullet points
  //             } else {
  //                 // Add bullet points
  //                 const newText = selectedText.split('\n').map(line => `• ${line}`).join('\n');
  //                 const updatedText = templateText.slice(0, start) + newText + templateText.slice(end);
  //                 setTemplateText(updatedText);
  //                 setValue('template_texts', updatedText); // Sync with form
  //                 return; // Exit function after adding bullet points
  //             }

  //         default:
  //             break;
  //     }

  //     const textarea = document.querySelector('.form-control');
  //     const start = textarea.selectionStart;
  //     const end = textarea.selectionEnd;
  //     const selectedText = templateText.substring(start, end);
  //     const newText = `${startTag}${selectedText}${endTag}`;

  //     const updatedText = templateText.slice(0, start) + newText + templateText.slice(end);
  //     setTemplateText(updatedText);
  //     setValue('template_texts', updatedText); // Sync with form
  // };

  const isValidFutureDate = (value) => {
    const selectedDate = new Date(value);
    const currentDate = new Date();

    // Check if selected date is in the future
    return selectedDate > currentDate || "Scheduled time must be in the future";
  };
  const maxLength = 512;
  const watchedTemplateNumber = watch("template_number", "");
  const watchHeader = watch("header_text", "");
  const watchTemplateText = watch("template_texts", " ");
  const watchFooter = watch("footer_text", "");
  const watchbuttonSelect = watch("button_select");
  const watchCodeDelivery = watch("codeDelivery");
  const watchAddExpiryTime = watch("addExpiryTime");
  const watchAddSecurityRec = watch("addSecurityRec", false); // Watch checkbox state for 'Add security recommendation'

  const fetchTemplateData = async () => {
    try {
      setIsLoading(true);
      const response = await fetchTempList(); // Your API call
      if (response?.data?.error_code === 200) {
        const data = response.data.results.response.data;

        setMarketingData(data.filter((item) => item.category === "MARKETING"));
        setUtilityData(data.filter((item) => item.category === "UTILITY"));
        setAuthenticationData(
          data.filter((item) => item.category === "AUTHENTICATION")
        );
      } else {
        // No data available
        setMarketingData([]);
        setUtilityData([]);
        setAuthenticationData([]);
        triggerAlert("warning", "", "No data available.");
      }
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      // console.log(`Error code: ${error?.response?.status}, Error message: ${error?.response?.data?.message || 'Something went wrong!'}`);
      setIsLoading(false);
      triggerAlert(
        "error",
        "",
        error?.response?.data?.message || "Something went wrong!"
      );
    }
  };

  const fetchTemplatApprovedData = async () => {
    try {
      setIsLoading(true);
      const response = await fetchTempData(); // Your API call
      if (response?.data?.error_code === 200) {
        const data = response.data.results;

        setAllTemplates(data);
      } else {
        // No data available
        setAllTemplates([]);
        triggerAlert("warning", "", "No data available.");
      }
      setIsLoading(false);
    } catch (error) {
      // console.log(`Error code: ${error?.response?.status}, Error message: ${error?.response?.data?.message || 'Something went wrong!'}`);
      setIsLoading(false);
      triggerAlert(
        "error",
        "",
        error?.response?.data?.message || "Something went wrong!"
      );
    }
  };

  const HandleDataclick = (item) => {
    setDataTemplate(item);
    // console.log(dataTemplate, "dataTemplate");
  };

  const renderTableRows = (data) => {
    return data?.map((item, index) => (
      <tr
        key={index}
        onClick={() => HandleDataclick(item)}
        className={`nav-item iq-chat-list${dataTemplate?.id === item.id ? "active row_selected" : ""
          }`}
        style={{ cursor: "pointer" }}
      >
        <th scope="row">{item.name}</th>
        <td>{item.category}</td>
        <td>
          {item.components.find((comp) => comp.type === "HEADER")?.text ||
            "N/A"}
        </td>
        <td>
          <span
            className={`badge ${item.status === "APPROVED" ? "bg-success" : "bg-danger"
              } border-radius rounded-pill`}
          >
            {item.status}
          </span>
        </td>
        <td>
          <a href="#" onClick={() => handleShowModal(item)}>
            <span className="badge badge-circle p-6" title="View Template">
              <span className="material-symbols-outlined fs-3">
                remove_red_eye
              </span>
            </span>
          </a>
        </td>
      </tr>
    ));
  };

  const HandleCreate = async () => {
    setShowCreate(true);
  };

  // const CancelCreate = async () => {
  //   setShowCreate(false);
  //   setTemplateCategory("");
  //   reset();
  //   setSelectedFile(null);
  // };


  const CancelCreate = async () => {
    // Reset all local state variables
    setShowCreate(false);
    setTemplateCategory("");
    setHeaderSelect("1");
    setButtonSelect("0");
    setTypeOfAction("");
    setTemplateName("");
    setHeaderText("");
    setTemplateText("");
    setTemplateFooter("");
    setVariables([]);
    setVariablesTemp([]);
    setSelectedFile(null);
    setStopPromos(false);
    setInputs([]);
    setCodeDelivery("ONE_TAP");
    setWebsiteUrl("");
    setPhoneNumber("");
    setExpiryIn("");
    setAddExpiryTime(false);
    setAddSecurityRec(false);
    setSecurityMessageVisible(false);

    // Reset React Hook Form
    reset();
  };

  const handleCategoryChange = (e) => {
    setTemplateCategory(e.target.value);
  };

  const handleHeaderSelectChange = (e) => {
    setHeaderSelect(e.target.value);
  };

  const handleTemplateTextChange = (e) => {
    const newText = e.target.value;
    setTemplateText(newText);

    // Reset variables if the text area is cleared
    if (newText.trim() === "") {
      setVariablesTemp([]); // Clear all variables when the text area is empty
    }

    // Check if text has been entered after the last variable
    if (variablesTemp.length > 0) {
      const lastVariableIndex = newText.lastIndexOf(`{{${variablesTemp.length}}}`);
      if (lastVariableIndex !== -1) {
        // Check if there is any character (including space) after the variable
        const textAfterVariable = newText.slice(lastVariableIndex + (`{{${variablesTemp.length}}}`).length).trim();
        setHasTextAfterVariable(textAfterVariable.length > 0 || newText.length > lastVariableIndex + (`{{${variablesTemp.length}}}`).length);
      } else {
        setHasTextAfterVariable(false);
      }
    }

    setValue("template_texts", newText); // Sync with form
  };



  const handleButtonSelectChange = (e) => {
    setButtonSelect(e.target.value);
    setValue("button_select", e.target.value);
  };

  const handleTypeOfActionChange = (e) => {
    setTypeOfAction(e.target.value);
    setValue("typeOfAction", e.target.value);
  };

  const handleButtonTextCallChange = (e) => {
    setButtonTextCall(e.target.value);
  };

  const handlePhoneNumberChange = (value) => {
    setPhoneNumber(value);
  };

  const handleCustomPhoneNumberChange = (isValid, number) => {
    if (isValid) {
      setCustomPhoneNumber(number);
    } else {
      setCustomPhoneNumber(""); // If the number is invalid, pass an empty string
    }
  };

  const handleCustomPhoneNumberBlur = () => {
    if (customPhoneNumber && !contactNumbers.includes(customPhoneNumber)) {
      setContactNumbers((prev) => [...prev, customPhoneNumber]);
      setCustomPhoneNumber(""); // Clear the input after adding
    }
  };

  const handleCustomPhoneNumberKeyPress = (e) => {
    if (
      e.key === "Enter" &&
      customPhoneNumber &&
      !contactNumbers.includes(customPhoneNumber)
    ) {
      setContactNumbers((prev) => [...prev, customPhoneNumber]);
      setCustomPhoneNumber(""); // Clear the input after adding
    }
  };

  const handleWebsiteUrlChange = (e) => {
    setPhoneNumber("");
    setWebsiteUrl(e.target.value);
  };

  const handleStopPromosChange = () => {
    setStopPromos((prevState) => {
      const newStopPromos = !prevState;
      setTemplateFooter(
        newStopPromos ? "Not interested? Tap Stop promotions" : ""
      ); // Update based on new state
      return newStopPromos;
    });
  };

  const handleCodeDeliveryChange = (e) => {
    setCodeDelivery(e.target.value);
  };
  const toggleSecurityMessage = () => {
    setSecurityMessageVisible((prevState) => !prevState);
  };

  const handleExpiryTimeChange = (event) => {
    setExpireTime(event.target.value);
  };

  const handleAddSecurityRecChange = () => {
    setAddSecurityRec(!addSecurityRec);
  };

  const handleAddExpiryTimeChange = () => {
    setAddExpiryTime(!addExpiryTime);
  };

  const handleExpiryInChange = (e) => {
    setExpiryIn(e.target.value);
  };

  const onSubmit = async (data) => {
    // Check if text has been entered after a variable
    if (variablesTemp.length > 0 && !hasTextAfterVariable) {
      triggerAlert("info", "", "Please enter some text after adding a variable.");
      return;
    }

    if (!selectedContact && !selectedGroup) {
      triggerAlert("error", "Oops...", "Please select a contact or group.");
      return;
    }

    setIsLoading(true);
    setShowCreate(false);

    let variablesValues = [];
    if (data.variablesTemp_text) {
      variablesValues = Object.values(data.variablesTemp_text);
    }

    let chatbot_list = Object.keys(data)
      .filter((key) => key.startsWith("chatbot_list_"))
      ?.map((key) => data[key]);

    if (data.chatbot_list) {
      chatbot_list.push(data.chatbot_list);
    }

    let api_input = {
      template_name: data.template_name,
      template_category: data.template_category,
      ...(data.variables && data.template_category !== "AUTHENTICATION" && {
        body_dyna_head1: data.variables,
      }),
      ...(data.variablesTemp_text && data.template_category !== "AUTHENTICATION" && {
        body_dyna1: variablesValues,
      }),
      ...(data.template_category === "MARKETING" && {
        stop_promos: stopPromos,
      }),
      ...(data.template_category !== "AUTHENTICATION" &&
        headerSelect == 1 &&
        data.button_select == 0 && {
        header_select: headerSelect,
        header_txt: data.header_text,
        template_texts: data.template_texts,
        template_footer: data.footer_text,
        button_select: parseInt(data.button_select),
      }),
      ...(data.template_category !== "AUTHENTICATION" &&
        headerSelect == 2 &&
        data.button_select == 0 && {
        header_select: headerSelect,
        base64_files: base64File,
        button_select: data.button_select,
        template_texts: data.template_texts,
        template_footer: data.footer_text,
        button_select: parseInt(data.button_select),
      }),
      ...(data.template_category !== "AUTHENTICATION" &&
        headerSelect == 1 &&
        data.button_select == 1 && {
        header_select: headerSelect,
        header_txt: data.header_text,
        template_texts: data.template_texts,
        template_footer: data.footer_text,
        button_select: parseInt(data.button_select),
        chatbot_list: chatbot_list,
      }),
      ...(data.template_category !== "AUTHENTICATION" &&
        headerSelect == 2 &&
        data.button_select == 1 && {
        header_select: headerSelect,
        base64_files: base64File,
        template_texts: data.template_texts,
        template_footer: data.footer_text,
        button_select: parseInt(data.button_select),
        chatbot_list: chatbot_list,
      }),
      ...(data.template_category !== "AUTHENTICATION" &&
        headerSelect == 1 &&
        data.button_select == 2 &&
        data.typeOfAction == 1 && {
        header_select: headerSelect,
        header_txt: data.header_text,
        template_texts: data.template_texts,
        template_footer: data.footer_text,
        button_select: parseInt(data.button_select),
        button_text_call: data.buttonTextCall,
        mob_numb: data.phoneNumber,
        type_of_action: parseInt(data.typeOfAction),
      }),
      ...(data.template_category !== "AUTHENTICATION" &&
        headerSelect == 2 &&
        data.button_select == 2 &&
        data.typeOfAction == 1 && {
        header_select: headerSelect,
        base64_files: base64File,
        template_texts: data.template_texts,
        template_footer: data.footer_text,
        button_select: parseInt(data.button_select),
        button_text_call: data.buttonTextCall,
        mob_numb: data.phoneNumber,
        type_of_action: parseInt(data.typeOfAction),
      }),
      ...(data.template_category !== "AUTHENTICATION" &&
        headerSelect == 1 &&
        data.button_select == 2 &&
        data.typeOfAction == 2 && {
        header_select: headerSelect,
        header_txt: data.header_text,
        template_texts: data.template_texts,
        template_footer: data.footer_text,
        button_select: parseInt(data.button_select),
        button_text_call: data.buttonTextWebsite,
        website_url: data.websiteUrl,
        type_of_action: parseInt(data.typeOfAction),
      }),
      ...(data.template_category !== "AUTHENTICATION" &&
        headerSelect == 2 &&
        data.button_select == 2 &&
        data.typeOfAction == 2 && {
        header_select: headerSelect,
        base64_files: base64File,
        template_texts: data.template_texts,
        template_footer: data.footer_text,
        button_select: parseInt(data.button_select),
        button_text_call: data.buttonTextWebsite,
        website_url: data.websiteUrl,
        type_of_action: parseInt(data.typeOfAction),
      }),
      ...(data.template_category === "AUTHENTICATION" && codeDelivery == "ONE_TAP" && {
        code_delivery: data.codeDelivery,
        package_name: data.packageName,
        app_hash: data.appHash,
        auto_fill: data.autoFillText,
        copy_code_tap: data.copyCodeText,
        add_security_rec: data.addSecurityRec,
        add_expiry_time: data.addExpiryTime,
      }),
      ...(data.template_category === "AUTHENTICATION" && codeDelivery == "COPY_CODE" && {
        code_delivery: data.codeDelivery,
        add_security_rec: data.addSecurityRec,
        add_expiry_time: data.addExpiryTime,
        copy_code: data.copyCode,
      }),
      ...(data.template_category === "AUTHENTICATION" &&
        (codeDelivery == "ONE_TAP" || codeDelivery == "COPY_CODE") &&
        data.addExpiryTime && {
        expiry_in: data.expiryIn,
      }),
    };

    try {
      const response = await CreateTempBroadCast(api_input);
      if (response.data.error_code === 200) {
        setShowCreate(false);
        triggerAlert("success", "", "Template Created Successfully");
        setTemplateCategory("");
        setWebsiteUrl("");
        setPhoneNumber("");
        setVariables("");
        setVariablesTemp("");
        reset();
        setIsLoading(false);
        setSelectedFile(null);
        fetchTemplateData();
      }
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
      setTemplateCategory("");
      setWebsiteUrl("");
      setPhoneNumber("");
      setVariables("");
      setVariablesTemp("");
      setSelectedFile(null);
      reset();
      setIsLoading(false);
      setShowCreate(false);
      triggerAlert("error", "", "Something went Wrong");
      const response_data = error?.response?.data;
      if (response_data?.error_code === 400) {
        triggerAlert("error", " ", response_data?.message);
      } else {
        triggerAlert(
          "error",
          " ",
          response_data ? response_data.message : "Template already exists!"
        );
      }
    }
  };

  // const handleHeaderTextChange = (e) => {

  //   const value = e.target.value;
  //   setHeaderText(value); 
  //   setSelectedFile(null);
  //   setValue("header_text", value); 
  // };


  const handleHeaderTextChange = (e) => {
    const value = e.target.value;
    setHeaderText(value);
    setSelectedFile(null);
    setValue("header_text", value);
  };
  const noEmojis = (value) => {
    // Return true for empty values (other validators handle required)
    if (value === undefined || value === null || value === "") return true;
    // Use explicit emoji/codepoint ranges to avoid false positives from other symbol characters.
    // This covers the most common emoji blocks: pictographs, emoticons, transport/map, dingbats, flags, supplemental symbols, etc.
    const emojiRegex = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{1F1E6}-\u{1F1FF}]/u;
    try {
      return !emojiRegex.test(String(value)) || "It should not allow emojis.";
    } catch (e) {
      // In case the runtime doesn't support the u-flag with astral ranges, fall back to previous behavior
      const fallback = /[\uFE0F]/;
      return !fallback.test(String(value)) || "It should not allow emojis.";
    }
  };

  const handleFileChange = async (e) => {
    const fileList = Array.from(e.target.files);
    if (fileList.length > 0) {
      const file = fileList[0];
      // Allowed file types
      const validImageTypes = ["image/jpeg", "image/png", "image/jpg"];
      const validVideoTypes = ["video/mp4", "video/webm"];
      const validDocumentTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      const isImage = validImageTypes.includes(file.type);
      const isVideo = validVideoTypes.includes(file.type);
      const isDocument = validDocumentTypes.includes(file.type);

      // File size validation
      const maxImageSize = 5 * 1024 * 1024; // 5 MB
      const maxVideoSize = 16 * 1024 * 1024; // 16 MB
      const maxDocumentSize = 100 * 1024 * 1024; // 100 MB

      // Check file type
      if (!isImage && !isVideo && !isDocument) {
        setError("files", {
          type: "manual",
          message: "Please upload a valid image (JPEG, PNG, GIF), video (MP4, WEBM, OGG), or document (PDF, DOC, DOCX).",
        });
        setSelectedFile(null);
        return;
      }

      // Check file size
      if (isImage && file.size > maxImageSize) {
        setError("files", {
          type: "manual",
          message: "Image size must not exceed 5 MB.",
        });
        setSelectedFile(null);
        return;
      }

      if (isVideo && file.size > maxVideoSize) {
        setError("files", {
          type: "manual",
          message: "Video size must not exceed 16 MB.",
        });
        setSelectedFile(null);
        return;
      }

      if (isDocument && file.size > maxDocumentSize) {
        setError("files", {
          type: "manual",
          message: "Document size must not exceed 100 MB.",
        });
        setSelectedFile(null);
        return;
      }

      // Check video duration (for videos only)
      if (isVideo) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          if (video.duration > 180) { // 3 minutes in seconds
            setError("files", {
              type: "manual",
              message: "Video duration must not exceed 3 minutes.",
            });
            setSelectedFile(null);
            return;
          } else {
            // If all validations pass, proceed
            clearErrors("files");
            setUploadedFiles(fileList);
            setSelectedFile(file);
            setHeaderText("");
            setValue("files", fileList);
            // Convert file to Base64
            getBase64(file).then((base64String) => {
              const fileData = {
                file_name: file.name.split(".").slice(0, -1).join("."),
                file_extension: file.name.split(".").pop(),
                file_type: file.type,
                file_size: file.size,
                file: base64String.split(",")[1],
              };
              setBase64File(fileData);
            }).catch((error) => {
              console.error("Base64 conversion error: ", error);
            });
          }
        };
        video.src = URL.createObjectURL(file);
      } else {
        // If not a video, proceed
        clearErrors("files");
        setUploadedFiles(fileList);
        setSelectedFile(file);
        setHeaderText("");
        setValue("files", fileList);
        // Convert file to Base64
        try {
          const base64String = await getBase64(file);
          const fileData = {
            file_name: file.name.split(".").slice(0, -1).join("."),
            file_extension: file.name.split(".").pop(),
            file_type: file.type,
            file_size: file.size,
            file: base64String.split(",")[1],
          };
          setBase64File(fileData);
        } catch (error) {
          console.error("Base64 conversion error: ", error);
        }
      }
    } else {
      // No file selected, reset the state
      setSelectedFile(null);
    }
  };

  const handleChange = (e) => {
    setTemplateName(e.target.value);
    setValue("template_name", e.target.value);
  };

  const handleVariableChange = (id, newValue) => {
    setVariables((prevVars) =>
      prevVars?.map((variable) =>
        variable.id === id ? { ...variable, value: newValue } : variable
      )
    );
    const newHeaderText = headerText.replace(/{{1}}/, newValue);
    setHeaderText(newHeaderText);
    setValue("header_text", newHeaderText);
    setValue(`variables.${id}`, newValue);
  };

  const handleAddVariable = () => {
    if (variables?.length > 0) {
      triggerAlert("info", "", "Only one variable can be used");
      return;
    }

    const newId = Date.now();
    setVariables((prevVars) => [...prevVars, { id: newId, value: "" }]);
    setHeaderText((prevText) => prevText + " {{1}}");
    setValue("header_text", headerText + " {{1}}");
    setValue(`variables.${newId}`, "");
  };

  const handleDeleteVariable = (id) => {
    setVariables((prevVars) =>
      prevVars.filter((variable) => variable.id !== id)
    );
    const updatedHeaderText = headerText.replace(" {{1}}", "");
    setHeaderText(updatedHeaderText);
    setValue("header_text", updatedHeaderText);
    setValue(`variables.${id}`, undefined);
    unregister(`variables.${id}`);
  };

  const handleVariableChangeTemp = (id, value) => {
    setVariablesTemp((prevVars) =>
      prevVars?.map((variable) =>
        variable.id === id ? { ...variable, value } : variable
      )
    );
  };

  const handleDeleteVariableTemp = (id) => {
    const variableToDelete = variablesTemp.find(
      (variable) => variable.id === id
    );
    const variableIndex = variablesTemp.indexOf(variableToDelete) + 1;
    const variablePlaceholder = `{{${variableIndex}}}`;
    setVariablesTemp((prevVars) =>
      prevVars.filter((variable) => variable.id !== id)
    );
    const updatedTemplateText = templateText
      .replace(variablePlaceholder, "")
      .trim();
    setTemplateText(updatedTemplateText);
    setValue("template_texts", updatedTemplateText);
    setValue(`variablesTemp_text.${id}`, undefined);
    unregister(`variablesTemp_text.${id}`);
  };

  const handletempAddVariable = () => {
    // Check if templateText is empty
    if (!templateText.trim()) {
      triggerAlert("info", "", "Please enter some text before adding a variable.");
      return;
    }

    const variableCount = variablesTemp?.length;
    const wordCount = templateText.split(/\s+/).filter(Boolean).length;
    let requiredWordCount = 0;

    if (variableCount === 0) {
      requiredWordCount = 4;
    } else if (variableCount === 1) {
      requiredWordCount = 8;
    } else if (variableCount === 2 || variableCount === 3) {
      requiredWordCount = 12;
    } else if (variableCount === 4) {
      requiredWordCount = 20;
    }

    if (variableCount >= 5) {
      triggerAlert("info", "", "You can't include more than 5 variables.");
      return;
    }

    if (wordCount < requiredWordCount) {
      triggerAlert(
        "info",
        "",
        `Please enter at least ${requiredWordCount} words to include ${variableCount + 1} variables.`
      );
      return;
    }

    // Check if the cursor is at the start or end of the text
    const textarea = document.querySelector(".text_area_message");
    const cursorPosition = textarea.selectionStart;
    if (cursorPosition !== 0 && cursorPosition !== templateText.length) {
      triggerAlert("info", "", "Variables can only be added at the start or end of the text.");
      return;
    }

    const newId = Date.now();
    const newVariableNumber = variableCount + 1;
    const newVariableText = `{{${newVariableNumber}}}`;

    // Add the variable at the start or end based on cursor position
    let updatedText;
    if (cursorPosition === 0) {
      updatedText = newVariableText + " " + templateText;
    } else {
      updatedText = templateText + " " + newVariableText;
    }

    setVariablesTemp((prevVars) => [...prevVars, { id: newId, value: "" }]);
    setTemplateText(updatedText);
    setValue("template_texts", updatedText);
    setValue(`variablesTemp_text.${newId}`, "");
    setHasTextAfterVariable(false); // Reset this flag when a variable is added
  };



  const fetchChatbotList = async () => {
    try {
      const response = await fetchListChatbot();
      // console.log(response, "responseresponse");
      if (response?.data?.results) {
        const optionValues = response.data.results?.map(
          (item) => item.option_value
        );

        setchatDrpopDown(optionValues);
      }
    } catch (error) {
      console.error(error);
      triggerAlert(
        "error",
        "",
        error?.response?.data
          ? error?.response?.data?.message
          : "Something went wrong!"
      );
    }
  };

  const handleShowBulk = () => {
    setShow(true); // Show the modal
  };

  const handleClose = () => {
    setShow(false); // Hide the modal
    setSelectedTemplateDrop(null); // Reset the selected template
    BulkReset(); // Reset all form values
    clearErrors(); // Clear validation errors
    setHeaderInputValueBulk(""); // Clear header input
    setBodyInputValuesBulk([]); // Clear body input values
  };

  const handleTemplateChange = (e) => {
    const selectedTemplate = allTemplates.find(
      (template) => template.id === e.target.value
    );
    setSelectedTemplateDrop(selectedTemplate);
    setHeaderInputValueBulk("");
    setBodyInputValuesBulk([]);
  };

  const fetchTemplateImageUrl = async (selectedTemplateDrop) => {
    try {
      if (!selectedTemplateDrop) return null;

      // Check if the template contains either an image or a video
      const hasMedia = selectedTemplateDrop.components?.some(
        (component) =>
          component.type === "HEADER" &&
          (component.format === "IMAGE" ||
            component.format === "VIDEO" ||
            component.format === "DOCUMENT")
      );

      if (!hasMedia) {
        return null; // No media, no need to fetch templates
      }

      // Fetch all templates
      const response = await fetchImageTemplateFileUrl(); // Replace with actual API function
      const responseData = response?.data;

      if (responseData?.error_code === 200) {
        const templates = responseData.results || [];

        // Find the matching template
        const matchedTemplate = templates.find(
          (template) => template.template_name === selectedTemplateDrop.name
        );

        return matchedTemplate ? matchedTemplate.template_image_url_s3 : null;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      return null;
    }
  };

  const resetFormStates = () => {
    setDataTemplate(null);
    setShowDropdown(!showDropdown);
    setContactNumbers([]);
    setHeaderInputValue("");
    setGroupContactVal("");
    setBodyInputValues({});
    setShowSend(false);
    setSelectedGroup("");
    setCustomPhoneNumber("");
    sendReset();
    fetchTemplateData();
  };

  const handleSubmitSend = async (data) => {
    if (data.groupContactVal === "contact" && contactNumbers.length === 0) {
      setSendErrors((prev) => ({
        ...prev,
        customPhoneNumber: "Please add at least one contact number.",
      }));
      return;
    }

    setShowSend(false);

    try {
      setIsLoading(true);

      // Fetch the template image/video URL if applicable
      const templateFileType = await fetchTemplateImageUrl(dataTemplate);
      let updatedTemplate = { ...dataTemplate };

      if (templateFileType && updatedTemplate) {
        updatedTemplate.components = updatedTemplate.components.map(
          (component) =>
            component.type === "HEADER" &&
              (component.format === "IMAGE" ||
                component.format === "VIDEO" ||
                component.format === "DOCUMENT")
              ? { ...component, example: { header_handle: [templateFileType] } }
              : component
        );
      }

      const apiInput = {
        template_data: updatedTemplate,
        contact_type: data.groupContactVal,
        ...(data.groupContactVal === "contact" && {
          to_number: contactNumbers,
        }),
        ...(data.groupContactVal === "group" && { group_id: selectedGroup }),
        ...(data.schedule
          ? { schedule_date: data.schedule }
          : { schedule_date: "" }),
        ...(headerInputValue !== "" && { header_text: headerInputValue }),
        ...(Object.keys(bodyInputValues).length !== 0 && {
          body_dynamic: bodyInputValues,
        }),
      };

      const response = await SendWhatsAppTemp(apiInput);

      if (response.data.error_code === 200) {
        triggerAlert("success", "", "Template sent successfully");
        setIsLoading(false);
        resetFormStates();
        handleCloseSend();
      }
    } catch (error) {
      resetFormStates();
      handleCloseSend();
      setIsLoading(false);
      console.error("Error sending template:", error);
      triggerAlert(
        "error",
        "Oops...",
        error?.response?.data?.message || "Something went wrong!"
      );
    }
  };

  const onSubmitBulk = async (data) => {
    try {
      setIsLoading(true); // Show loading state
      if (data.fileUpload && data.fileUpload[0]) {
        const file = await getBase64(data.fileUpload[0]);
        const trimmedFile = file.split(",")[1]; // Extract base64 file data

        if (selectedTemplateDrop) {
          // Fetch the template_image_url_s3 for the selected template
          const templateImageUrl = await fetchTemplateImageUrl(selectedTemplateDrop);

          // Prepare the template_data with the media URL
          const templateDataWithMedia = {
            ...selectedTemplateDrop,
            components: selectedTemplateDrop.components.map(component => {
              if (
                component.type === "HEADER" &&
                (component.format === "IMAGE" ||
                  component.format === "VIDEO" ||
                  component.format === "DOCUMENT")
              ) {
                return {
                  ...component,
                  example: {
                    ...component.example,
                    header_handle: [templateImageUrl], // Pass the fetched URL
                  },
                };
              }
              return component;
            }),
          };

          const api_input = {
            base_64_file: trimmedFile,
            template_data: templateDataWithMedia, // Updated template with media URL
            ...(headerInputValueBulk && { header_text: headerInputValueBulk }),
            ...(Object.keys(bodyInputValuesBulk).length > 0 && {
              body_dynamic: bodyInputValuesBulk,
            }),
          };

          const response = await BulkSendTemp(api_input);
          if (response.data.error_code === 200) {
            triggerAlert("success", "", "Template sent successfully!");
            handleClose(); // Reset modal and form
            setIsLoading(false); // Hide loading state
          }
        } else {
          console.error("No template selected");
        }
      }
    } catch (error) {
      console.error("Error sending bulk data:", error);
      triggerAlert("error", "", "Something went wrong!");
      handleClose(); // Reset modal and form
      setIsLoading(false); // Hide loading state
    }
  };

  React.useEffect(() => {
    setTemplateName(watchedTemplateNumber);
    setHeaderText(watchHeader);
    setTemplateText(watchTemplateText);
    setTemplateFooter(watchFooter);
    setButtonSelect(watchbuttonSelect);
    setExpiryIn(watchAddExpiryTime);
    setCodeDelivery(watchCodeDelivery);
  }, [
    watchedTemplateNumber,
    watchTemplateText,
    watchFooter,
    watchbuttonSelect,
    watchCodeDelivery,
    watchHeader,
  ]);

  useEffect(() => {
    // Reset values when typeOfAction changes
    if (typeOfAction === "1") {
      setValue("buttonTextWebsite", "");
      setValue("websiteUrl", "");
    } else if (typeOfAction === "2") {
      setValue("buttonTextCall", "");
      setValue("phoneNumber", "");
    }
  }, [typeOfAction, setValue]);

  useEffect(() => {
    fetchTemplateData();
    fetchChatbotList();
    fetchContact();
    fetchGroup();
  }, []);

  // useEffect(() => {
  //     setValue('template_texts', templateText);
  // }, [templateText, setValue]);

  // Conditional registration for ONE_TAP fields
  useEffect(() => {
    if (
      watchCodeDelivery === "ONE_TAP" &&
      templateCategory === "AUTHENTICATION"
    ) {
      register("packageName", { required: "Package name is required" });
      register("appHash", { required: "App hash is required" });
      register("autoFillText", { required: "Text is required" });
      register("copyCodeText", { required: "Button text is required" });

      // Unregister COPY_CODE specific fields
      unregister("copyCode");
    } else {
      unregister("packageName");
      unregister("appHash");
      unregister("autoFillText");
      unregister("copyCodeText");
    }
  }, [watchCodeDelivery, templateCategory, register, unregister]);

  // Conditional registration for COPY_CODE fields
  useEffect(() => {
    if (
      watchCodeDelivery === "COPY_CODE" &&
      templateCategory === "AUTHENTICATION"
    ) {
      register("copyCode", { required: "Text is required" });

      // Unregister ONE_TAP specific fields
      unregister("packageName");
      unregister("appHash");
      unregister("autoFillText");
      unregister("copyCodeText");
    } else {
      unregister("copyCode");
    }
  }, [watchCodeDelivery, templateCategory, register, unregister]);

  const handleTabChange = (e) => {
    setDataTemplate(null); // Reset dataTemplate state when tab changes
  };

  useEffect(() => {
    const tabElements = document.querySelectorAll(".nav-link");
    tabElements.forEach((tab) => {
      tab.addEventListener("click", handleTabChange);
    });

    return () => {
      tabElements.forEach((tab) => {
        tab.removeEventListener("click", handleTabChange);
      });
    };
  }, []);

  const handleDownloadSampleCSV = () => {
    const link = document.createElement("a");
    link.href = "/samplefile/bulk_sms.csv";
    link.download = "bulk_sms.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // const [sendError, setSendErrors] = useState({
  //     customPhoneNumber: ''
  // });

  // const validatePhoneNumber = (number) => {
  //     // Extract only digits from the number (ignoring country code and other characters)
  //     const digitsOnly = number.replace(/[^0-9]/g, '');

  //     // Check minimum length (counting only digits)
  //     if (digitsOnly.length < 10) {
  //         setSendErrors(prev => ({
  //             ...prev,
  //             customPhoneNumber: 'Phone number must be at least 10 digits long'
  //         }));
  //         return false;
  //     }

  //     // Check maximum length (counting only digits)
  //     if (digitsOnly.length > 15) {
  //         setSendErrors(prev => ({
  //             ...prev,
  //             customPhoneNumber: 'Phone number cannot exceed 15 digits'
  //         }));
  //         return false;
  //     }

  //     // Check for duplicates
  //     if (contactNumbers.includes(number)) {
  //         setSendErrors(prev => ({
  //             ...prev,
  //             customPhoneNumber: 'This phone number is already added'
  //         }));
  //         return false;
  //     }

  //     // Clear errors if all validations pass
  //     setSendErrors(prev => ({
  //         ...prev,
  //         customPhoneNumber: ''
  //     }));
  //     return true;
  // };

  const [sendError, setSendErrors] = useState({
    customPhoneNumber: "",
  });

  const validatePhoneNumber = (number) => {
    // Allow only numbers and the "+" symbol at the beginning
    const validCharactersRegex = /^\+?[0-9]+$/;
    if (!validCharactersRegex.test(number)) {
      setSendErrors((prev) => ({
        ...prev,
        customPhoneNumber:
          'Phone number can only contain digits and must start with "+" (if present).',
      }));
      return false;
    }

    // Ensure the "+" is only at the beginning (if present)
    if (number.includes("+") && number.indexOf("+") !== 0) {
      setSendErrors((prev) => ({
        ...prev,
        customPhoneNumber:
          'The "+" symbol should only be at the beginning of the phone number.',
      }));
      return false;
    }

    // Extract digits only for length validation
    const digitsOnly = number.replace(/\D/g, ""); // Removes all non-digit characters

    // Ensure the length is between 11 and 15 digits (excluding "+")
    if (digitsOnly.length < 11 || digitsOnly.length > 15) {
      setSendErrors((prev) => ({
        ...prev,
        customPhoneNumber:
          'Phone number must be between 11 and 15 digits long (excluding "+").',
      }));
      return false;
    }

    // Check for duplicates
    if (contactNumbers.includes(number)) {
      setSendErrors((prev) => ({
        ...prev,
        customPhoneNumber: "This phone number is already added.",
      }));
      return false;
    }

    // Clear errors if all validations pass
    setSendErrors((prev) => ({
      ...prev,
      customPhoneNumber: "",
    }));
    return true;
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setComponent({
        ...component,
        example: {
          ...component.example,
          header_name: file.name, // Set uploaded file name
          header_handle: [URL.createObjectURL(file)], // Create a temporary URL
        },
      });
    }
  };

  return (
    <>
      <div id="content-page" class="content-page">
        <div class="container">
          {hideButton && (
            <PageTitle
              heading="Templates"
              showWarningButton="Bulk Send"
              onWarningClick={() => {
                fetchTemplatApprovedData();
                handleShowBulk();
              }}
              showPrimaryButton="Create"
              onPrimaryClick={HandleCreate}
            />
          )}
          {!hideButton && messageError && (
            <>
              <PageTitle heading="Templates" />
              <div className="text-danger">
                {messageError}
              </div>
            </>
          )}
          <div class="row">
            <div className="col-sm-12 col-lg-12">
              <div className="card">
                <div className="card-header border-0">
                  <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <ul className="nav nav-pills" id="pills-tab" role="tablist">
                      <li className="nav-item" role="presentation">
                        <a
                          className="nav-link active"
                          id="pills-home-tab"
                          data-bs-toggle="pill"
                          href="#pills-home"
                          role="tab"
                          aria-controls="pills-home"
                          aria-selected="true"
                        >
                          Marketing
                        </a>
                      </li>
                      <li className="nav-item" role="presentation">
                        <a
                          className="nav-link"
                          id="pills-profile-tab"
                          data-bs-toggle="pill"
                          href="#pills-profile"
                          role="tab"
                          aria-controls="pills-profile"
                          aria-selected="false"
                        >
                          Utility
                        </a>
                      </li>
                      <li className="nav-item" role="presentation">
                        <a
                          className="nav-link"
                          id="pills-contact-tab"
                          data-bs-toggle="pill"
                          href="#pills-contact"
                          role="tab"
                          aria-controls="pills-contact"
                          aria-selected="false"
                        >
                          Authentication
                        </a>
                      </li>
                    </ul>
                    <div className="d-inline-flex ms-auto">
                      <div className="dropdown d-flex align-items-center" ref={dropdownRef}>
                        <button
                          className="btn btn-sm btn-icon btn-primary"
                          style={{ padding: "0px 30px" }}
                          onClick={handleActionButtonClick}
                          aria-haspopup="true"
                          aria-expanded={showDropdown}
                          data-toggle="tooltip"
                          data-placement="right"
                          title="Select below template"
                        >
                          Action
                        </button>
                        {showDropdown && dataTemplate && (
                          <div
                            className="dropdown-menu dropdown-menu-end show"
                            style={{ marginTop: "160px" }}
                            aria-labelledby="dropdownMenuButton"
                          >
                            {/* Show both "Send" and "Delete" buttons for "Marketing" and "Authentication" */}
                            {(dataTemplate.category === "MARKETING" ||
                              dataTemplate.category === "AUTHENTICATION") && (
                                <>
                                  {hideButton && (
                                    <button
                                      className="dropdown-item d-flex align-items-center"
                                      onClick={handleSendClick}
                                    >
                                      <i className="material-symbols-outlined md-18 me-1">
                                        upload
                                      </i>
                                      Send
                                    </button>
                                  )}
                                  <button
                                    className="dropdown-item d-flex align-items-center"
                                    onClick={handleDeleteClick}
                                  >
                                    <i className="material-symbols-outlined md-18 me-1">
                                      delete
                                    </i>
                                    Delete
                                  </button>
                                </>
                              )}
                            {/* Show only the "Delete" button for "Utility" */}
                            {dataTemplate.category === "UTILITY" && (
                              <button
                                className="dropdown-item d-flex align-items-center"
                                onClick={handleDeleteClick}
                              >
                                <i className="material-symbols-outlined md-18 me-1">
                                  delete
                                </i>
                                Delete
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      <Modal show={show} onHide={handleClose} centered>
                        <Modal.Header closeButton>
                          <Modal.Title>Bulk Contact</Modal.Title>
                          <span style={{ marginRight: "auto" }}>
                            <span className="required"></span>(Upload a CSV
                            file)
                          </span>
                        </Modal.Header>
                        <Modal.Body className="scroll-y mx-5 mx-xl-7 my-7">
                          <b>
                            Please use the below given sample file format for
                            the upload.
                          </b>
                          <br />
                          <button
                            type="button"
                            className="btn btn-sm btn-soft-success"
                            onClick={handleDownloadSampleCSV}
                          >
                            <span className="svg-icon svg-icon-3">
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
                            Sample.csv
                          </button>

                          {/* Start Form */}
                          <form onSubmit={handleSubmitsBulk(onSubmitBulk)}>
                            {/* File Upload Field with Validation */}
                            <Form.Group controlId="fileUpload" className="mb-3">
                              <Form.Label className="required">
                                File<span className="text-danger">*</span>
                              </Form.Label>
                              <Form.Control
                                type="file"
                                {...registerBulk("fileUpload", {
                                  required: "File is required",
                                  validate: {
                                    sizeLimit: (file) =>
                                      file[0]?.size <= 1048576 ||
                                      "File size exceeds 1 MB",
                                    fileType: (file) =>
                                      file[0]?.type === "text/csv" ||
                                      "Only CSV files are allowed",
                                  },
                                })}
                              />
                              {BulkErrors.fileUpload && (
                                <div
                                  style={{
                                    color: "red",
                                    fontSize: "14px",
                                    marginTop: "5px",
                                  }}
                                >
                                  {BulkErrors.fileUpload.message}
                                </div>
                              )}
                            </Form.Group>

                            <Form.Group controlId="templateSelect">
                              <Form.Label className="required">
                                Template<span className="text-danger">*</span>
                              </Form.Label>
                              <Form.Select
                                {...registerBulk("templateSelect", {
                                  required: "Please select a template",
                                })}
                                value={selectedTemplateDrop?.id || ""}
                                onChange={handleTemplateChange}
                              >
                                <option value="">Select your template</option>
                                {allTemplates &&
                                  allTemplates.map((template) => (
                                    <option
                                      key={template.id}
                                      value={template.id}
                                    >
                                      {template.name}
                                    </option>
                                  ))}
                              </Form.Select>
                              {BulkErrors.templateSelect && (
                                <div
                                  style={{
                                    color: "red",
                                    fontSize: "14px",
                                    marginTop: "5px",
                                  }}
                                >
                                  {BulkErrors.templateSelect.message}
                                </div>
                              )}

                              <div className="template-container mt-5">
                                {selectedTemplateDrop?.components?.map(
                                  (component, index) => {
                                    if (
                                      component?.type === "HEADER" &&
                                      component?.example?.header_text
                                    ) {
                                      return (
                                        <div
                                          key={index}
                                          className="header-component mb-3 d-flex align-items-center"
                                        >
                                          <p className="mb-0 me-2">
                                            {component?.example?.header_text[0]}
                                          </p>
                                          <input
                                            type="text"
                                            value={headerInputValueBulk}
                                            onChange={(e) =>
                                              handleHeaderInputBulkChange(
                                                e.target.value
                                              )
                                            }
                                            className="form-control align-input"
                                          />
                                        </div>
                                      );
                                    }

                                    if (
                                      component?.type === "BODY" &&
                                      component?.example?.body_text
                                    ) {
                                      return (
                                        <div
                                          key={index}
                                          className="body-component mb-3"
                                        >
                                          {component?.example?.body_text[0].map(
                                            (text, bodyIndex) => (
                                              <div
                                                key={bodyIndex}
                                                className="body-text-item mb-2 d-flex align-items-center"
                                              >
                                                <p className="mb-0 me-2">
                                                  {text}
                                                </p>
                                                <input
                                                  type="text"
                                                  value={
                                                    bodyInputValuesBulk[
                                                    bodyIndex
                                                    ] || ""
                                                  }
                                                  onChange={(e) =>
                                                    handleBodyInputBulkChange(
                                                      bodyIndex,
                                                      e.target.value
                                                    )
                                                  }
                                                  className="form-control align-input"
                                                />
                                              </div>
                                            )
                                          )}
                                        </div>
                                      );
                                    }

                                    return null;
                                  }
                                )}
                              </div>
                            </Form.Group>

                            <div className="d-flex justify-content-center">
                              <Button
                                variant="primary"
                                type="submit"
                                className="mb-5 w-50 mt-5"
                                disabled={isLoading} // Disable button while processing
                              >
                                {isLoading ? "Sending..." : "Send"}
                              </Button>
                            </div>
                          </form>
                        </Modal.Body>
                      </Modal>
                    </div>
                  </div>
                </div>

                <div className="card-body">
                  <div className="tab-content" id="pills-tabContent-2">
                    <div
                      className="tab-pane fade active show"
                      id="pills-home"
                      role="tabpanel"
                      aria-labelledby="pills-home-tab"
                    >
                      {isLoading ? (
                        <div className="loader-overlay text-white">
                          <Loader />
                        </div>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-bordered table-hover ">
                            <thead className="bg-light text-nowrap">
                              <tr>
                                <th scope="col">Template Name</th>
                                <th scope="col">Template Type</th>
                                <th scope="col">Template Header</th>
                                <th scope="col">Status</th>
                                <th scope="col">Action</th>
                              </tr>
                            </thead>
                            <tbody>{renderTableRows(marketingData)}</tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    <div
                      className="tab-pane fade"
                      id="pills-profile"
                      role="tabpanel"
                      aria-labelledby="pills-profile-tab"
                    >
                      {isLoading ? (
                        <div className="loader-overlay text-white">
                          <Loader />
                        </div>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-bordered table-hover ">
                            <thead className="bg-light text-nowrap">
                              <tr>
                                <th scope="col">Template Name</th>
                                <th scope="col">Template Type</th>
                                <th scope="col">Template Header</th>
                                <th scope="col">Status</th>
                                <th scope="col">Action</th>
                              </tr>
                            </thead>
                            <tbody>{renderTableRows(utilityData)}</tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    <div
                      className="tab-pane fade"
                      id="pills-contact"
                      role="tabpanel"
                      aria-labelledby="pills-contact-tab"
                    >
                      {isLoading ? (
                        <div className="loader-overlay text-white">
                          <Loader />
                        </div>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-bordered table-hover ">
                            <thead className="bg-light text-nowrap">
                              <tr>
                                <th scope="col">Template Name</th>
                                <th scope="col">Template Type</th>
                                <th scope="col">Template Header</th>
                                <th scope="col">Status</th>
                                <th scope="col">Action</th>
                              </tr>
                            </thead>
                            <tbody>{renderTableRows(authenticationData)}</tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="modal fade" id="exampleModalCenter-view" tabIndex="-1" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalCenterTitle">
                  {selectedTemplate?.name || "Template Details"}
                </h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <div className="card-body">
                  {selectedTemplate ? (
                    <>
                      {/* Render Header, Body, Footer, and Media Components */}
                      <div className="d-flex flex-column justify-content-between">
                        {selectedTemplate.components?.map((component, index) => (
                          <div key={index}>
                            {component.type === "HEADER" && (
                              <h6 className="mb-1 fw-500">{component.text || ""}</h6>
                            )}
                            {component.format === "IMAGE" && component.example?.header_handle?.length > 0 && (
                              <div className="mb-3">
                                <img
                                  src={component.example.header_handle[0]}
                                  alt="Header Image"
                                  className="img-fluid"
                                  style={{ maxWidth: "100%", height: "auto" }}
                                />
                              </div>
                            )}
                            {component.format === "VIDEO" && component.example?.header_handle?.length > 0 && (
                              <div className="mb-3">
                                <video
                                  src={component.example.header_handle[0]}
                                  controls
                                  controlsList="nodownload"
                                  preload="metadata"
                                  onError={(e) => console.error("Video playback error:", e)}
                                  className="img-fluid"
                                  style={{ width: "100%", maxHeight: "300px", objectFit: "contain" }}
                                />
                              </div>
                            )}
                            {component.format === "DOCUMENT" && component.example?.header_handle?.length > 0 && (
                              <div className="mb-3 d-flex flex-column align-items-center">
                                <FaFilePdf size={50} color="#d32f2f" />
                                <a
                                  href={component.example.header_handle[0]}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download
                                  className="fw-bold text-primary text-decoration-none"
                                >
                                  Uploaded Document
                                  <button
                                    className="btn btn-outline-light btn-sm py-0 px-2"
                                    onClick={() =>
                                      downloadFile(
                                        component.attachment_path,
                                        component.attachment_path?.split("/").pop()
                                      )
                                    }
                                  >
                                    <MdOutlineDownloading style={{ fontSize: "x-large", color: "grey" }} />
                                  </button>
                                </a>
                              </div>
                            )}
                            {component.type === "BODY" && <p className="mb-1">{component.text}</p>}
                            {component.type === "FOOTER" && <p className="mb-1">{component.text}</p>}
                          </div>
                        ))}
                      </div>
                      <hr className="custom-black-hr" />
                      {/* Render Buttons, Excluding Stop Promotions */}
                      <div className="d-flex flex-column justify-content-between align-items-center">
                        <div className="d-flex align-items-center flex-wrap">
                          {selectedTemplate?.components
                            ?.find((c) => c.type === "BUTTONS")
                            ?.buttons?.map((button, index) => {

                              if (button.type === "QUICK_REPLY" && button.text === "Stop Promotions") {
                                return null;
                              }

                              let iconClass = "";
                              let tooltipContent = "";

                              if (button.type === "QUICK_REPLY") {
                                iconClass = "fa fa-reply";
                                tooltipContent = button.text;
                              } else if (button.type === "PHONE_NUMBER") {
                                iconClass = "fa fa-phone";
                                tooltipContent = button.phone_number || "No number provided";
                              } else if (button.type === "URL") {
                                iconClass = "fa fa-globe";
                                tooltipContent = button.url || "No URL provided";
                              } else {
                                return null;
                              }

                              return (
                                <div
                                  key={index}
                                  className="d-flex align-items-center m-2"
                                  title={tooltipContent}
                                  data-bs-toggle="tooltip"
                                  data-bs-placement="top"
                                >
                                  <i className={iconClass} style={{ marginRight: "5px" }} />
                                  <span>{button.text}</span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </>
                  ) : (
                    <p>No template selected.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {showCreate && (
          <>
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.5)", // Black with 50% opacity
                zIndex: 1040, // Ensure it's behind the modal
              }}
            ></div>
            <div
              className="modal fade show"
              id="exampleModalCenter-create"
              tabIndex="-1"
              aria-labelledby="exampleModalCenterTitle"
              style={{
                display: "block",
                zIndex: 1050, // Higher than backdrop
              }}
              aria-hidden="false"
            >
              <div
                className="modal-dialog modal-dialog-centered modal-lg"
                role="document"
              >
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="exampleModalCenterTitle">
                      Create Template
                    </h5>
                    <button
                      onClick={CancelCreate}
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                    ></button>
                  </div>
                  <div class="modal-body">
                    <div class="row">
                      <div class="col-md-7">
                        <form onSubmit={handleSubmit(onSubmit)}>
                          <div className="form-group">
                            <label
                              className="form-label mb-3"
                              htmlFor="template_name"
                            >
                              Template Name
                              <span className="text-danger">
                                * &nbsp;&nbsp;(Allows only lower case
                                characters, numbers and underscores)
                              </span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              name="template_name"
                              placeholder="Enter template name"
                              {...register("template_name", {
                                required: "Template Name is required",
                                pattern: isValidTemplateName,
                              })}
                              onChange={handleChange}
                            />

                            <div className="counts text-end">
                              {templateName.length} / {maxLength}
                            </div>
                            {errors.template_name && (
                              <div
                                style={{
                                  color: "red",
                                  fontSize: "14px",
                                  marginTop: "5px",
                                }}
                              >
                                {errors.template_name.message}
                              </div>
                            )}
                          </div>
                          <div class="form-group">
                            <label class="form-label mb-3" for="t_name">
                              Template Category
                              <span class="text-danger ">*</span>
                            </label>
                            <select
                              className="form-select"
                              id="exampleFormControlSelect1"
                              value={templateCategory}
                              {...register("template_category", {
                                required: "Category is required",
                              })}
                              onChange={(e) => {
                                handleCategoryChange(e);
                              }}
                            >
                              <option value="" disabled>
                                Select Category
                              </option>
                              <option value="UTILITY">Utility</option>
                              <option value="MARKETING">Marketing</option>
                              <option value="AUTHENTICATION">
                                Authentication
                              </option>
                            </select>

                            {errors.template_category && (
                              <div
                                style={{
                                  color: "red",
                                  fontSize: "14px",
                                  marginTop: "5px",
                                }}
                              >
                                {errors.template_category.message}
                              </div>
                            )}

                            {templateCategory === "UTILITY" ||
                              templateCategory === "MARKETING" ? (
                              <>
                                <label className="form-label mb-3">
                                  Template header
                                </label>
                                <div className="row">
                                  <select
                                    id="header_select"
                                    name="header_select"
                                    className="form-control"
                                    style={{ width: "35%" }} // Adjust width as needed
                                    value={headerSelect}
                                    onChange={handleHeaderSelectChange}
                                  >
                                    <option value="1">Text</option>
                                    <option value="2">Media</option>
                                  </select>
                                  <div className="col-md-9">
                                    {headerSelect === "1" && (
                                      <div className="mb-5 fv-row mt-3">
                                        <input
                                          type="text"
                                          className="form-control"
                                          placeholder="Enter header text"
                                          {...register("header_text", {
                                            required: "Header text is required",
                                            maxLength: {
                                              value: 60,
                                              message: "Your title cannot exceed 60 characters.",
                                            },
                                            validate: {
                                              noEmptySpacesValidation,
                                              noEmojis, // 👈 added validation
                                            },
                                          })}
                                          onChange={handleHeaderTextChange}
                                        />

                                        <div className="counts text-end">
                                          {headerText.length} / 60
                                        </div>
                                        {errors.header_text && (
                                          <div
                                            style={{
                                              color: "red",
                                              fontSize: "14px",
                                              marginTop: "5px",
                                            }}
                                          >
                                            {errors.header_text.message}
                                          </div>
                                        )}

                                        <div className="formatting-buttons">
                                          <span
                                            className="char-icons"
                                            title="Add Variable"
                                            onClick={handleAddVariable}
                                            style={{
                                              display: "inline-flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              width: "120px",
                                              height: "30px",
                                              borderRadius: "5px",
                                              cursor: "pointer",
                                              fontWeight: "bold",
                                              textAlign: "center",
                                              transition:
                                                "background-color 0.3s",
                                              userSelect: "none",
                                              fontSize: "14px",
                                            }}
                                          >
                                            + Add Variable
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                    {variables &&
                                      variables?.map((variable) => (
                                        <div
                                          key={variable?.id}
                                          className="variable-container mb-3"
                                        >
                                          <div className="d-flex align-items-center">
                                            <span
                                              className="variable-heading"
                                              style={{
                                                fontWeight: "bold",
                                                marginRight: "10px",
                                              }}
                                            >
                                              {"{{1}}"}
                                            </span>

                                            <input
                                              type="text"
                                              className="form-control"
                                              style={{ flexGrow: 1 }}
                                              value={variable?.value}
                                              {...register(`variables`, {
                                                validate:
                                                  noEmptySpacesValidation,
                                              })}
                                              onChange={(e) =>
                                                handleVariableChange(
                                                  variable?.id,
                                                  e.target.value
                                                )
                                              }
                                            />

                                            <FaTimes
                                              style={{
                                                cursor: "pointer",
                                                color: "red",
                                                fontSize: "1.2rem",
                                                marginLeft: "10px",
                                              }}
                                              onClick={() =>
                                                handleDeleteVariable(
                                                  variable?.id
                                                )
                                              }
                                            />
                                          </div>

                                          {errors?.variables?.[variable.id] && (
                                            <div
                                              style={{
                                                color: "red",
                                                fontSize: "14px",
                                                marginTop: "5px",
                                              }}
                                            >
                                              {
                                                errors.variables[variable.id]
                                                  .message
                                              }
                                            </div>
                                          )}
                                        </div>
                                      ))}

                                    {headerSelect === "2" && (
                                      <div className="mb-5 fv-row mt-3">
                                        <label
                                          htmlFor="template_files"
                                          className="form-label"
                                        >
                                          Upload File
                                        </label>
                                        <span className="text-danger">
                                          * &nbsp;&nbsp;(Accepted Media Types:
                                          Image, Video, Document)
                                        </span>
                                        <input
                                          type="file"
                                          id="template_files"
                                          className="form-control"
                                          onChange={handleFileChange}
                                          multiple
                                        />
                                        {errors.files && (
                                          <span
                                            className="error_msg"
                                            style={{
                                              color: "red",
                                              fontSize: "14px",
                                              marginTop: "5px",
                                            }}
                                          >
                                            {errors.files.message}
                                          </span>
                                        )}

                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="mb-5 fv-row">
                                  <label className="form-label mb-3">
                                    Enter text message
                                    <span className="text-danger">*</span>
                                  </label>
                                  <textarea
                                    rows="5"
                                    className={`form-control text_area_message${errors.template_texts ? "is-invalid" : ""
                                      }`}
                                    {...register("template_texts", {
                                      required: "Text message is required",
                                      maxLength: {
                                        value: 1024,
                                        message:
                                          "Text message cannot exceed 1024 characters",
                                      },
                                      validate: noEmptySpacesValidation,
                                    })}
                                    value={templateText}
                                    onChange={(e) => {
                                      handleTemplateTextChange(e);
                                      setValue(
                                        "template_texts",
                                        e.target.value
                                      ); // Sync with form
                                    }}
                                    placeholder="Enter text message"
                                  />

                                  <div className="counts text-end">
                                    {templateText.length} /1024
                                  </div>
                                  {errors.template_texts && (
                                    <div
                                      style={{
                                        color: "red",
                                        fontSize: "14px",
                                        marginTop: "5px",
                                      }}
                                    >
                                      {errors.template_texts.message}
                                    </div>
                                  )}
                                  <div className="formatting-buttons">
                                    <span
                                      className="char-icons"
                                      title="Bold"
                                      onClick={() => applyFormatting("bold")}
                                      style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: "30px",
                                        height: "30px",
                                        borderRadius: "5px",

                                        cursor: "pointer",
                                        fontWeight: "bold",
                                        textAlign: "center",

                                        userSelect: "none",
                                        color: "#000", // Color for bold button
                                      }}
                                    >
                                      B
                                    </span>

                                    <span
                                      className="char-icons"
                                      title="Italic"
                                      onClick={() => applyFormatting("italic")}
                                      style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: "30px",
                                        height: "30px",
                                        borderRadius: "5px",
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                        textAlign: "center",
                                        userSelect: "none",
                                        color: "#000",
                                      }}
                                    >
                                      I
                                    </span>

                                    <span
                                      className="char-icons"
                                      title="Strikethrough"
                                      onClick={() =>
                                        applyFormatting("strikethrough")
                                      }
                                      style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: "30px",
                                        height: "30px",
                                        borderRadius: "5px",
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                        textAlign: "center",
                                        userSelect: "none",
                                        textDecoration: "line-through", // Strikethrough text style
                                      }}
                                    >
                                      S
                                    </span>

                                    <span
                                      className="char-icons"
                                      title="Bullet"
                                      onClick={() => applyFormatting("bullet")}
                                      style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: "30px",
                                        height: "30px",
                                        borderRadius: "5px",
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                        textAlign: "center",
                                        userSelect: "none",
                                      }}
                                    >
                                      B
                                    </span>

                                    <span
                                      className="char-icons"
                                      title="Add Variable"
                                      onClick={handletempAddVariable}
                                      style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: "120px",
                                        height: "30px",
                                        borderRadius: "5px",
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                        textAlign: "center",
                                        transition: "background-color 0.3s",
                                        userSelect: "none",

                                        fontSize: "14px",
                                      }}
                                    >
                                      + Add Variable
                                    </span>
                                  </div>
                                </div>

                                {variablesTemp &&
                                  variablesTemp?.map((variable, index) => (
                                    <div
                                      key={variable.id}
                                      className="variable-container mb-3"
                                    >
                                      <div className="d-flex align-items-center">
                                        <span
                                          className="variable-heading"
                                          style={{
                                            fontWeight: "bold",
                                            marginRight: "10px",
                                          }}
                                        >
                                          {`{{${index + 1}}}`}
                                        </span>

                                        <input
                                          type="text"
                                          className="form-control"
                                          style={{ flexGrow: 1 }}
                                          value={variable.value}
                                          {...register(
                                            `variablesTemp_text.${variable.id}`,
                                            {
                                              validate: noEmptySpacesValidation,
                                            }
                                          )}
                                          onChange={(e) =>
                                            handleVariableChangeTemp(
                                              variable.id,
                                              e.target.value
                                            )
                                          }
                                        />

                                        <FaTimes
                                          style={{
                                            cursor: "pointer",
                                            color: "red",
                                            fontSize: "1.2rem",
                                            marginLeft: "10px",
                                          }}
                                          onClick={() =>
                                            handleDeleteVariableTemp(
                                              variable.id
                                            )
                                          }
                                        />
                                      </div>

                                      {errors?.variablesTemp_text?.[
                                        variable.id
                                      ] && (
                                          <div
                                            style={{
                                              color: "red",
                                              fontSize: "14px",
                                              marginTop: "5px",
                                            }}
                                          >
                                            {
                                              errors.variablesTemp_text[
                                                variable.id
                                              ]?.message
                                            }
                                          </div>
                                        )}
                                    </div>
                                  ))}

                                <div className="mb-5 fv-row">
                                  <label className="form-label mb-3">
                                    Template Footer
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    name="template_footer"
                                    value={templateFooter}
                                    {...register("footer_text", {
                                      required: "Footer text is required",
                                      maxLength: {
                                        value: 60,
                                        message:
                                          "Your Footer cannot exceed 60 characters.",
                                      },
                                      validate: noEmptySpacesValidation,
                                    })}
                                    onChange={(e) => {
                                      setTemplateFooter(e.target.value);
                                      setValue("footer_text", e.target.value); // Sync with form
                                    }}
                                    placeholder="Enter footer text"
                                  />
                                  <div className="counts text-end">
                                    {templateFooter.length} / 60
                                  </div>
                                  {errors.footer_text && (
                                    <div
                                      style={{
                                        color: "red",
                                        fontSize: "14px",
                                        marginTop: "5px",
                                      }}
                                    >
                                      {errors.footer_text.message}
                                    </div>
                                  )}

                                  <div className="counts"></div>
                                </div>

                                <label className="form-label mb-3">
                                  Template Buttons
                                </label>
                                <div
                                  className="col-md-3"
                                  style={{ marginRight: "56px" }}
                                >
                                  <div className="mb-5 fv-row">
                                    <select
                                      id="button_select"
                                      name="button_select"
                                      className="form-control"
                                      value={buttonSelect}
                                      onChange={handleButtonSelectChange}
                                      style={{
                                        width: "120px",
                                        textAlign: "center",
                                        textAlignLast: "center",
                                      }} // Adjust width as needed
                                      {...register("button_select", {
                                        required: "Category is required", // Validation rule
                                      })}
                                    >
                                      <option value="" disabled>
                                        Select
                                      </option>
                                      <option value="0">None</option>
                                      <option value="1">Quick reply</option>
                                      <option value="2">Call to action</option>
                                    </select>
                                  </div>
                                  {errors.button_select && (
                                    <div
                                      style={{
                                        color: "red",
                                        fontSize: "14px",
                                        marginTop: "5px",
                                      }}
                                    >
                                      {errors.button_select.message}
                                    </div>
                                  )}
                                </div>

                                {buttonSelect === "1" && (
                                  <div id="quick_reply">
                                    <div className="row">
                                      {templateCategory === "MARKETING" && (
                                        <>
                                          <div className="d-flex gap-4 mb-3">
                                            <div className="flex-grow-1">
                                              <label>(Optional)</label>
                                              <input
                                                type="text"
                                                name="Marketing opt-out"
                                                value="Marketing opt-out"
                                                disabled
                                                className="form-control"
                                                style={{ fontSize: "0.7rem" }}
                                              />
                                            </div>
                                            <div className="flex-grow-1">
                                              <label>Button text</label>
                                              <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Stop Promotions"
                                                disabled
                                                style={{ fontSize: "0.7rem" }}
                                              />
                                            </div>
                                            <div className="flex-grow-1">
                                              <label>Footer text</label>
                                              <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Not interested?"
                                                disabled
                                                style={{ fontSize: "0.7rem" }}
                                              />
                                            </div>
                                          </div>

                                          <div className="col-md-12">
                                            <div className="col-md-12">
                                              <div className="form-check">
                                                <input
                                                  className="form-check-input"
                                                  type="checkbox"
                                                  checked={stopPromos}
                                                  onChange={
                                                    handleStopPromosChange
                                                  }
                                                />
                                                I understand that it's our
                                                responsibility to stop sending
                                                marketing messages to customers
                                                who opt out.
                                              </div>
                                            </div>
                                            <div className="col-md-12">
                                              <p className="text-info">
                                                Note: Check below checkbox for
                                                stop promotions{" "}
                                              </p>
                                            </div>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                    <div className="input-wrapper">
                                      <div className="d-flex col-md-12">
                                        <div
                                          className="col-md-2"
                                          style={{ marginRight: "30px" }}
                                        >
                                          <div className="mb-5 fv-row">
                                            <input
                                              type="text"
                                              name="custom"
                                              value="Custom"
                                              disabled
                                              style={{ fontSize: "0.7rem" }}
                                              className="form-control"
                                            />
                                          </div>
                                        </div>
                                        <div className="col-md-8">
                                          <select
                                            className="form-select"
                                            name="select_list_name[]"
                                            {...register("chatbot_list", {
                                              required:
                                                "Please select a chatbot from the list",
                                            })}
                                          >
                                            <option value="">
                                              Select chatbot list
                                            </option>
                                            {/* Dynamically render options */}
                                            {chatbotDrop.map(
                                              (optionValue, index) => (
                                                <option
                                                  key={index}
                                                  value={optionValue}
                                                >
                                                  {optionValue}
                                                </option>
                                              )
                                            )}
                                          </select>

                                          {/* Display error message if validation fails */}
                                          {errors.chatbot_list && (
                                            <div
                                              style={{
                                                color: "red",
                                                fontSize: "14px",
                                                marginTop: "5px",
                                              }}
                                            >
                                              {errors.chatbot_list.message}
                                            </div>
                                          )}
                                        </div>

                                        <p
                                          href=""
                                          className="add-input col-md-2"
                                          title="Add input"
                                          style={{
                                            marginLeft: "20px",
                                            marginTop: "5px",
                                            cursor: "pointer",
                                          }}
                                          onClick={addInputField}
                                        >
                                          +
                                        </p>
                                      </div>

                                      {/* Render dynamic input fields */}
                                      {inputs?.map((input) => (
                                        <div
                                          key={input.id}
                                          className="d-flex mb-2"
                                        >
                                          <div
                                            className="col-md-2"
                                            style={{ marginRight: "30px" }}
                                          >
                                            <div className="mb-5 fv-row">
                                              <input
                                                type="text"
                                                name={`custom_${input.id}`}
                                                value="Custom"
                                                disabled
                                                style={{ fontSize: "0.7rem" }}
                                                className="form-control"
                                              />
                                            </div>
                                          </div>
                                          <div className="col-md-8">
                                            <select
                                              className="form-select"
                                              name={`select_list_name_${input.id}`} // Update the name to make it unique per input
                                              {...register(
                                                `chatbot_list_${input.id}`,
                                                {
                                                  required:
                                                    "Please select a chatbot from the list",
                                                }
                                              )}
                                            >
                                              <option value="">
                                                Select chatbot list
                                              </option>
                                              {/* Dynamically render options */}
                                              {chatbotDrop?.map(
                                                (optionValue, index) => (
                                                  <option
                                                    key={index}
                                                    value={optionValue}
                                                  >
                                                    {optionValue}
                                                  </option>
                                                )
                                              )}
                                            </select>

                                            {/* Display error message if validation fails */}
                                            {errors[
                                              `chatbot_list_${input.id}`
                                            ] && (
                                                <div
                                                  style={{
                                                    color: "red",
                                                    fontSize: "14px",
                                                    marginTop: "5px",
                                                  }}
                                                >
                                                  {
                                                    errors[
                                                      `chatbot_list_${input.id}`
                                                    ]?.message
                                                  }
                                                </div>
                                              )}
                                          </div>
                                          <p
                                            className="remove-input col-md-2"
                                            title="Remove input"
                                            style={{
                                              marginLeft: "20px",
                                              cursor: "pointer",
                                              color: "red",
                                            }}
                                            onClick={() =>
                                              removeInputField(input.id)
                                            }
                                          >
                                            &times;{" "}
                                            {/* Unicode for multiplication sign */}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {buttonSelect === "2" && (
                                  <div id="call_to_action">
                                    <div className="row">
                                      {/* Type of Action */}
                                      <div className="col-md-6">
                                        <label>Type of action</label>
                                        <div className="mb-5 fv-row">
                                          <select
                                            id="type_of_action"
                                            name="type_of_action"
                                            className="form-control"
                                            {...register("typeOfAction")}
                                            onChange={(e) => {
                                              handleTypeOfActionChange(e);
                                              setValue(
                                                "typeOfAction",
                                                e.target.value
                                              ); // Ensure form state is updated
                                            }}
                                          >
                                            <option value="" disabled>
                                              Select
                                            </option>
                                            <option value="1">
                                              Call Phone Numbers
                                            </option>
                                            <option value="2">
                                              Visit Website
                                            </option>
                                          </select>
                                        </div>
                                      </div>

                                      {/* Button Text */}
                                      <div className="col-md-6">
                                        <label>Button text</label>
                                        {typeOfAction === "1" && (
                                          <>
                                            <input
                                              type="text"
                                              className="form-control"
                                              name="button_text_call"
                                              {...register("buttonTextCall", {
                                                required:
                                                  "Button text is required",
                                                maxLength: {
                                                  value: 25,
                                                  message:
                                                    "Button text cannot exceed 25 characters",
                                                },
                                              })}
                                              placeholder="Enter Button text"
                                              style={{ fontSize: "14px" }}
                                            />

                                            {errors.buttonTextCall && (
                                              <div
                                                style={{
                                                  color: "red",
                                                  fontSize: "14px",
                                                  marginTop: "5px",
                                                }}
                                              >
                                                {errors.buttonTextCall.message}
                                              </div>
                                            )}
                                          </>
                                        )}
                                        {typeOfAction === "2" && (
                                          <>
                                            <input
                                              type="text"
                                              className="form-control"
                                              name="button_text_website"
                                              {...register(
                                                "buttonTextWebsite",
                                                {
                                                  required:
                                                    "Button text is required",
                                                  maxLength: {
                                                    value: 25,
                                                    message:
                                                      "Button text cannot exceed 25 characters",
                                                  },
                                                }
                                              )}
                                              placeholder="Enter Button text"
                                              style={{ fontSize: "14px" }}
                                            />
                                            {errors.buttonTextWebsite && (
                                              <div
                                                style={{
                                                  color: "red",
                                                  fontSize: "14px",
                                                  marginTop: "5px",
                                                }}
                                              >
                                                {
                                                  errors.buttonTextWebsite
                                                    .message
                                                }
                                              </div>
                                            )}
                                          </>
                                        )}
                                      </div>
                                    </div>

                                    <div className="row mt-3">
                                      {typeOfAction === "1" && (
                                        <div className="col-md-12 d-flex">
                                          <div
                                            style={{
                                              width: "100%",
                                              maxWidth: "400px",
                                            }}
                                          >
                                            <label>Phone Number</label>

                                            <Controller
                                              control={control}
                                              name="phoneNumber"
                                              rules={{
                                                required:
                                                  "Phone number is required",
                                              }}
                                              render={({
                                                field: {
                                                  onChange,
                                                  onBlur,
                                                  value,
                                                  ref,
                                                },
                                              }) => (
                                                // <PhoneInput
                                                //     placeholder="Enter phone number"
                                                //     onChange={(value) => {
                                                //         onChange(value); // Update the form state
                                                //         handlePhoneNumberChange(value); // Update local state
                                                //     }}
                                                //     onBlur={onBlur} // Call onBlur to manage touched state
                                                //     value={value} // Control the value of the input
                                                //     ref={ref} // Set the ref for focus management
                                                //     defaultCountry="US"
                                                //     className="form-control border-0"
                                                // />
                                                <CountryCodeSelector
                                                  control={control} // Provided by react-hook-form
                                                  name="phoneNumber"
                                                  containerClass="custom-iti-class" // Add custom classes to the wrapper div
                                                  rules={{
                                                    required:
                                                      "Phone number is required",
                                                    maxLength:
                                                      MaxLengthValidation(15),
                                                    minLength:
                                                      MinLengthValidation(10),
                                                    // pattern: onlyNumbers,
                                                  }}
                                                />
                                              )}
                                            />

                                            {/* {errors.phoneNumber && (
                                                                                            <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                                                                {errors.phoneNumber.message}
                                                                                            </div>
                                                                                        )} */}
                                          </div>
                                        </div>
                                      )}

                                      {typeOfAction === "2" && (
                                        <div className="col-md-12">
                                          <label>Website URL</label>
                                          <input
                                            type="text"
                                            className="form-control"
                                            {...register("websiteUrl", {
                                              required:
                                                "Website URL is required",
                                              pattern: {
                                                value:
                                                  /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
                                                message:
                                                  "Please enter a valid URL",
                                              },
                                            })}
                                            onChange={handleWebsiteUrlChange}
                                            placeholder="Enter website URL"
                                            style={{ fontSize: "14px" }}
                                          />

                                          {errors.websiteUrl && (
                                            <div
                                              style={{
                                                color: "red",
                                                fontSize: "14px",
                                                marginTop: "5px",
                                              }}
                                            >
                                              {errors.websiteUrl.message}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : templateCategory === "AUTHENTICATION" ? (
                              <div>
                                <label
                                  className="form-label mb-3"
                                  htmlFor="code_delivery"
                                >
                                  Code delivery
                                  <span className="text-danger">*</span>
                                </label>
                                <div className="col-md-12 d-flex flex-row">
                                  <div
                                    className="col-md-2"
                                    style={{ marginRight: "54px" }}
                                  >
                                    <div
                                      className="mb-5 fv-row"
                                      style={{ width: "110px" }}
                                    >
                                      <select
                                        id="code_delivery"
                                        name="codeDelivery"
                                        className="form-control"
                                        defaultValue="ONE_TAP"
                                        {...register("codeDelivery", {
                                          required: "Code delivery is required",
                                        })}
                                      >
                                        <option value="ONE_TAP">
                                          Auto-fill
                                        </option>
                                        <option value="COPY_CODE">
                                          Copy code
                                        </option>
                                      </select>
                                      {errors.codeDelivery && (
                                        <div
                                          style={{
                                            color: "red",
                                            fontSize: "14px",
                                            marginTop: "5px",
                                          }}
                                        >
                                          {errors.codeDelivery.message}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div
                                    className={`col-md-9 ${watchCodeDelivery === "ONE_TAP"
                                      ? ""
                                      : "d-none"
                                      }`}
                                  >
                                    <div className="mb-5 fv-row">
                                      <input
                                        type="text"
                                        className="form-control"
                                        name="packageName"
                                        id="package_name"
                                        placeholder="Package name"
                                        {...register("packageName", {
                                          required: "Package name is required",
                                        })}
                                      />
                                      {errors.packageName && (
                                        <div
                                          style={{
                                            color: "red",
                                            fontSize: "14px",
                                            marginTop: "5px",
                                          }}
                                        >
                                          {errors.packageName.message}
                                        </div>
                                      )}
                                    </div>
                                    <div className="mb-5 fv-row">
                                      <input
                                        type="text"
                                        className="form-control"
                                        name="appHash"
                                        id="app_hash"
                                        placeholder="App signature hash"
                                        {...register("appHash", {
                                          required: "App hash is required",
                                        })}
                                      />
                                      {errors.appHash && (
                                        <div
                                          style={{
                                            color: "red",
                                            fontSize: "14px",
                                            marginTop: "5px",
                                          }}
                                        >
                                          {errors.appHash.message}
                                        </div>
                                      )}
                                    </div>
                                    <div className="mb-5 fv-row">
                                      <label
                                        className="form-label mb-3"
                                        htmlFor="auto_fill"
                                      >
                                        Button text
                                      </label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        name="autoFillText"
                                        id="auto_fill"
                                        placeholder="Auto-fill"
                                        defaultValue="Auto-fill"
                                        {...register("autoFillText", {
                                          required: "Text is required",
                                        })}
                                      />
                                      {errors.autoFillText && (
                                        <div
                                          style={{
                                            color: "red",
                                            fontSize: "14px",
                                            marginTop: "5px",
                                          }}
                                        >
                                          {errors.autoFillText.message}
                                        </div>
                                      )}
                                    </div>
                                    <div className="mb-5 fv-row">
                                      <input
                                        type="text"
                                        className="form-control"
                                        name="copyCodeText"
                                        id="copy_code_tap"
                                        placeholder="Copy code"
                                        defaultValue="copyCodeText"
                                        {...register("copyCodeText", {
                                          required: "Text is required",
                                        })}
                                      />
                                      {errors.copyCodeText && (
                                        <div
                                          style={{
                                            color: "red",
                                            fontSize: "14px",
                                            marginTop: "5px",
                                          }}
                                        >
                                          {errors.copyCodeText.message}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div
                                    className={`col-md-9 ${watchCodeDelivery === "COPY_CODE"
                                      ? ""
                                      : "d-none"
                                      }`}
                                  >
                                    <div className="mb-5 fv-row">
                                      <label
                                        className="form-label mb-3"
                                        htmlFor="copy_code"
                                      >
                                        Button text
                                      </label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        name="copyCode"
                                        id="copy_code"
                                        placeholder="Copy code"
                                        {...register("copyCode")}
                                      />
                                      {errors.copyCode && (
                                        <div
                                          style={{
                                            color: "red",
                                            fontSize: "14px",
                                            marginTop: "5px",
                                          }}
                                        >
                                          {errors.copyCode.message}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="mb-5 fv-row">
                                  <label
                                    className="form-label mb-3"
                                    htmlFor="compose"
                                  >
                                    Message content
                                    <span className="text-danger">*</span>
                                  </label>
                                  <p>
                                    Content for authentication message templates
                                    can't be edited. You can add additional
                                    content from the options below.
                                  </p>
                                  <div className="form-check mb-5">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id="add_security_rec"
                                      {...register("addSecurityRec")}
                                    />
                                    <label
                                      className="form-check-label"
                                      htmlFor="add_security_rec"
                                    >
                                      Add security recommendation
                                    </label>
                                  </div>
                                  <div className="form-check mb-5">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id="add_expiry_time"
                                      {...register("addExpiryTime")}
                                    />
                                    <label
                                      className="form-check-label"
                                      htmlFor="add_expiry_time"
                                    >
                                      Add expiry time for the code
                                    </label>
                                  </div>
                                  {watchAddExpiryTime && (
                                    <div className="row d-flex">
                                      <label
                                        className="form-label mb-3 col-md-3"
                                        htmlFor="expiry_in"
                                      >
                                        Expires in
                                      </label>
                                      <div className="form-check col-md-6">
                                        <input
                                          className="form-control"
                                          type="number"
                                          id="expiry_in"
                                          placeholder="Enter expiry time"
                                          {...register("expiryIn", {
                                            required: "Expiry time is required",
                                            min: {
                                              value: 1,
                                              message:
                                                "Expiry time must be at least 1 minute",
                                            },
                                            onChange: (e) =>
                                              handleExpiryInChange(e),
                                          })}
                                        />
                                        {errors.expiryIn && (
                                          <div
                                            style={{
                                              color: "red",
                                              fontSize: "14px",
                                              marginTop: "5px",
                                            }}
                                          >
                                            {errors.expiryIn.message}
                                          </div>
                                        )}
                                      </div>
                                      <div className="col-md-3">
                                        <span>minutes</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div></div>
                            )}
                          </div>
                          <div className="modal-footer">
                            <button
                              type="submit"
                              className="btn btn-primary"
                              disabled={isLoading}
                            >
                              {isLoading ? "Creating..." : "Create"}
                            </button>
                          </div>
                        </form>
                      </div>
                      <div className="col-md-5">
                        <p className="fw-500 mb-3 text-center">Preview</p>
                        {(templateCategory === "UTILITY" || templateCategory === "MARKETING") && (
                          <div className="main_box_send_auth m-auto border p-3 bg-light w-100 rounded">
                            <p style={{ color: 'black', fontWeight: 'bold', maxWidth: '100%', height: 'auto' }}>
                              {headerText}
                            </p>
                            {selectedFile && (
                              <div>
                                {selectedFile.type === 'application/pdf' ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <FaFilePdf size={50} color="#d32f2f" />
                                    <a href={URL.createObjectURL(selectedFile)} download={selectedFile.name}>
                                      &nbsp; {selectedFile.name}
                                      <button
                                        className="btn btn-outline-light btn-sm py-0 px-2"
                                        onClick={() => downloadFile(selectedFile.attachment_path, selectedFile.attachment_path?.split('/').pop())}
                                      >
                                        <MdOutlineDownloading style={{ fontSize: 'x-large', color: 'grey' }} />
                                      </button>
                                    </a>
                                  </div>
                                ) : selectedFile.type.startsWith("image/") ? (
                                  <img
                                    src={URL.createObjectURL(selectedFile)}
                                    alt="Uploaded Image"
                                    style={{ maxWidth: "100%", height: "auto" }}
                                  />
                                ) : selectedFile.type.startsWith("video/") ? (
                                  <video
                                    controls
                                    style={{ maxWidth: "100%", height: "auto" }}
                                    controlsList="nodownload"
                                  >
                                    <source src={URL.createObjectURL(selectedFile)} type={selectedFile.type} />
                                    Your browser does not support the video tag.
                                  </video>
                                ) : (
                                  <a
                                    href={URL.createObjectURL(selectedFile)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download={selectedFile.name}
                                  >
                                    {selectedFile.name}
                                  </a>
                                )}
                              </div>
                            )}
                            <p>{templateText}</p>
                            <p>{templateFooter}</p>
                            <hr style={{ borderTop: "solid 1px rgb(241, 234, 234)" }} />
                            {buttonSelect !== '0' && (
                              <div className="d-flex justify-content-center">
                                {buttonSelect === '1' && (
                                  <div className="d-flex flex-column">
                                    {watch("chatbot_list") && (
                                      <div
                                        className="d-flex align-items-center justify-content-center mt-2"
                                        title={watch("chatbot_list") || "No chatbot selected"}
                                        data-bs-toggle="tooltip"
                                        data-bs-placement="top"
                                      >
                                        <i className="fa fa-reply" style={{ marginRight: "5px" }}></i>
                                        <span>{watch("chatbot_list") || "Quick Reply"}</span>
                                      </div>
                                    )}
                                    {inputs.map((input) => (
                                      <div
                                        key={input.id}
                                        className="d-flex align-items-center mb-2"
                                        title={watch(`chatbot_list_${input.id}`) || "No chatbot selected"}
                                        data-bs-toggle="tooltip"
                                        data-bs-placement="top"
                                      >
                                        <i className="fa fa-reply" style={{ marginRight: "5px" }}></i>
                                        <span>{watch(`chatbot_list_${input.id}`) || "Quick Reply"}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {buttonSelect === '2' && (
                                  <div className="d-flex flex-column align-items-center">
                                    {typeOfAction === '1' && (
                                      <div className="d-flex align-items-center justify-content-center mb-2">
                                        <i className="fa fa-phone" style={{ marginRight: "5px" }}></i>
                                        <span>{watch("buttonTextCall") || "Click to Dial"}</span>
                                      </div>
                                    )}

                                    {typeOfAction === '2' && (
                                      <div
                                        className="d-flex align-items-center justify-content-center mb-2"
                                        title={websiteUrl || "No website URL selected"} // Tooltip shown on hover
                                      >
                                        <i className="fa fa-globe" style={{ marginRight: "5px" }}></i>
                                        <span>{watch("buttonTextWebsite") || "Visit Website"}</span>
                                      </div>
                                    )}

                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        {templateCategory === "AUTHENTICATION" && (
                          <div className="main_box_send_auth m-auto border p-3 bg-light w-100 rounded">
                            <p>
                              <span id="previewVerify">
                                <b>{verificationCode}</b> is your verification code.
                              </span>
                              {isSecurityMessageVisible && (
                                <span id="previewSecurity">For your security, do not share the code.</span>
                              )}
                            </p>
                            {watchAddExpiryTime && (
                              <p id="timeers">
                                <span>This code expires in <span id="time_preview">{expiryIn}</span> minutes.</span>
                              </p>
                            )}
                            <hr />
                            <span id="previewcopy_code" className="ng-binding">
                              {codeDelivery === 'COPY_CODE' ? 'Copy code' : ''}
                            </span>
                            <span id="previewauto_fill" className="ng-binding">
                              {codeDelivery === 'ONE_TAP' ? 'Autofill' : ''}
                            </span>
                          </div>
                        )}
                      </div>



                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <Modal show={showSend} onHide={handleCloseSend} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Send Template</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row">
              <div className="col-md-7">
                <form
                  onSubmit={handleSubmitsSend(handleSubmitSend)}
                  className="p-2"
                >
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label mb-2">Template Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={dataTemplate?.name}
                        disabled
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label mb-2">
                        Select Contact or Group
                        <span className="text-danger">*</span>
                      </label>
                      <select
                        style={{ display: isVisible ? "block" : "none" }}
                        className={`form-select ${sendErrors.groupContactVal ? "is-invalid" : ""
                          }`}
                        {...registerSend("groupContactVal", {
                          required: "Please select a contact or group",
                          validate: (value) =>
                            value !== "" || "Please select a valid option",
                        })}
                        value={groupContactVal}
                        onChange={(e) => {
                          handleGroupContactChange(e);
                          sendClearErrors("groupContactVal");
                        }}
                      >
                        <option value="" style={{ display: "none" }}>
                          Select
                        </option>
                        <option value="contact">Contact</option>
                        <option value="group">Group</option>
                      </select>

                      {sendErrors.groupContactVal && (
                        <div
                          style={{
                            color: "red",
                            fontSize: "14px",
                            marginTop: "5px",
                          }}
                        >
                          {sendErrors.groupContactVal.message}
                        </div>
                      )}
                    </div>
                    {groupContactVal === "contact" && (
                      <div className="mb-3">
                        <label className="form-label mb-2">
                          Select or enter phone number
                          <span className="text-danger">*</span>
                        </label>

                        <Controller
                          name="to_number"
                          {...register("to_number", {
                            required: "Phone number is required",
                          })}
                          control={control}
                          render={({ field }) => (
                            <CreatableMultiSelectDyGet
                              key={showSend ? "open" : "closed"} // Force re-render
                              {...field}
                              apiUrl={api_url + "sms/get_all_contact_list/"}
                              placeholder="Select phone number"
                              mapOption={(result) => ({
                                value: result.contact_number,
                                label: result.contact_number,
                              })}
                              rules={{
                                required: "Phone number is required",
                                maxLength: MaxLengthValidation(14),
                                minLength: MinLengthValidation(10),
                                pattern: {
                                  value: /^[0-9\s\-+()]*$/,
                                  message: "Please enter a valid phone number",
                                },
                              }}
                              value={contactNumbers.length > 0 ? field.value : []} // Ensure value is empty if contactNumbers is empty
                              onSelect={handleToSelect}
                            />

                          )}
                        />

                        {errors.to_number && (
                          <div
                            style={{
                              color: "red",
                              fontSize: "14px",
                              marginTop: "5px",
                            }}
                          >
                            {errors.to_number.message}
                          </div>
                        )}

                        {/* <input
                                                    type="text" // Allows entry of the "+" symbol
                                                    className={`form-control mb-2 ${sendErrors.customPhoneNumber ? 'is-invalid' : ''}`}
                                                    placeholder="Select or enter a phone number"
                                                    value={customPhoneNumber}
                                                    onChange={(e) => {
                                                        const value = e.target.value.trim();
                                                        setCustomPhoneNumber(value);
                                                        validatePhoneNumber(value);
                                                    }}
                                                    onBlur={() => {
                                                        if (customPhoneNumber && validatePhoneNumber(customPhoneNumber)) {
                                                            setContactNumbers((prev) => [...prev, customPhoneNumber]);
                                                            setCustomPhoneNumber(""); // Clear input after adding
                                                            setSendErrors((prev) => ({ ...prev, customPhoneNumber: '' }));
                                                        }
                                                    }}
                                                    list="contactOptions"
                                                />



                                                {sendError.customPhoneNumber && (
                                                    <div className="d-block" style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                        {sendError.customPhoneNumber}
                                                    </div>
                                                )}


                                                <div className="d-flex flex-wrap mt-3 gap-2">
                                                    {contactNumbers?.map((number, index) => (
                                                        <div
                                                            key={index}
                                                            className="p-2 mr-2 mb-2 d-flex align-items-center"
                                                            style={{
                                                                backgroundColor: "#d3d3d3", // light gray background
                                                                color: "black", // black text
                                                                borderRadius: "5px", // optional: adds rounded corners for styling
                                                            }}
                                                        >
                                                            {number}
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm ml-2"
                                                                style={{ marginLeft: '10px', padding: '0 5px', color: 'black' }}
                                                                onClick={() => removeContactNumber(number)}
                                                            >
                                                                &times;
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div> */}

                        {/* If no contact numbers are entered */}
                        {/* {contactNumbers.length === 0 && ( */}
                        <span className="text-danger">
                          Note**: &nbsp;&nbsp;At least one contact number is
                          required. Please include country code, e.g., +91 / +1
                          followed by the phone number.
                        </span>

                        {/* )} */}
                      </div>
                    )}

                    {groupContactVal === "group" && (
                      <div className="mb-3 ">
                        <label className="form-label mb-3">
                          Select Group<span className="text-danger">*</span>
                        </label>

                        <select
                          className={`form-control ${sendErrors.selectedGroup ? "is-invalid" : ""
                            }`}
                          {...registerSend("selectedGroup", {
                            required: "Please select a group",
                            validate: (value) =>
                              value !== "" || "Group selection is required",
                          })}
                          value={selectedGroup}
                          onChange={(e) => {
                            setSelectedGroup(e.target.value);
                            sendClearErrors("selectedGroup");
                          }}
                        >
                          <option value="">Select a group</option>
                          {groups?.map((group, index) => (
                            <option key={index} value={group.id}>
                              {group.group_name}
                            </option>
                          ))}
                        </select>

                        {sendErrors.selectedGroup && (
                          <div
                            style={{
                              color: "red",
                              fontSize: "14px",
                              marginTop: "5px",
                            }}
                          >
                            {sendErrors.selectedGroup.message}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="template-container">
                      {dataTemplate?.components?.map((component, index) => {
                        if (
                          component?.type === "HEADER" &&
                          component?.example?.header_text
                        ) {
                          return (
                            <div key={index} className="header-component mb-5">
                              <label class="form-label mb-2">
                                {component?.example?.header_text[0]}
                              </label>
                              <input
                                type="text"
                                value={headerInputValue}
                                onChange={(e) =>
                                  handleHeaderInputChange(e.target.value)
                                }
                                className="form-control align-input" // Added class for uniform height
                              />
                            </div>
                          );
                        }

                        if (
                          component?.type === "BODY" &&
                          component?.example?.body_text
                        ) {
                          return (
                            <div key={index} className="body-component mb-3">
                              {component?.example?.body_text[0]?.map(
                                (text, bodyIndex) => (
                                  <div
                                    key={bodyIndex}
                                    className="body-text-item mb-2 d-flex align-items-center"
                                  >
                                    <p className="mb-0 me-2">{text}</p>
                                    <input
                                      type="text"
                                      value={bodyInputValues[bodyIndex] || ""}
                                      onChange={(e) =>
                                        handleBodyInputChange(
                                          bodyIndex,
                                          e.target.value
                                        )
                                      }
                                      className="form-control align-input" // Added class for uniform height
                                    />
                                  </div>
                                )
                              )}
                            </div>
                          );
                        }
                        return null; // Return null if the component type is not handled
                      })}
                    </div>
                    {showScheduleInput && (
                      <div className="mb-5 ">
                        <label className="form-label mb-3">
                          Schedule (EST Timezone)
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="datetime-local"
                          className={`form-control ${sendErrors.schedule ? "is-invalid" : ""
                            }`}
                          {...registerSend("schedule", {
                            required: "Please select a valid date and time.",
                            // validate: isValidFutureDate // Custom validation function to check future date
                            validate: (value) => {
                              const selectedDateEST = new Date(value); // User-selected date in EST
                              const currentDateIST = new Date(); // Current system time in IST

                              // Convert current IST time to EST
                              const currentDateEST = new Date(
                                currentDateIST.toLocaleString("en-US", {
                                  timeZone: "America/New_York",
                                })
                              );

                              // Ensure selected EST date/time is in the future
                              if (selectedDateEST <= currentDateEST) {
                                return `The selected time must be ${currentDateEST.toLocaleString(
                                  "en-US",
                                  {
                                    timeZone: "America/New_York",
                                    hour12: true,
                                  }
                                )} or later (EST).`;
                              }

                              return true; // Validation passed
                            },
                          })}
                          min={new Date(
                            new Date().toLocaleString("en-US", {
                              timeZone: "America/New_York",
                            })
                          )
                            .toISOString()
                            .slice(0, 16)} // Set minimum selectable time dynamically in EST
                          value={schedule}
                          onChange={handleScheduleChange}
                        />

                        {sendErrors.schedule && (
                          <div
                            style={{
                              color: "red",
                              fontSize: "14px",
                              marginTop: "5px",
                            }}
                          >
                            {sendErrors.schedule.message}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-center ">
                    <Button
                      variant="primary"
                      onClick={handleScheduleClick}
                      className="ms-2"
                    >
                      Schedule
                    </Button>
                    <Button variant="primary" type="submit" className="ms-2">
                      Send Message
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={handleCloseSend}
                      className="ms-2"
                    >
                      Close
                    </Button>
                  </div>
                </form>
              </div>
              <div className="col-md-5 text-center">
                <p className="text-center">Preview</p>
                <div className="main_box_send m-auto border p-3 bg-light w-100">
                  {dataTemplate?.components[0]?.format === "IMAGE" && (
                    <img
                      src={
                        dataTemplate?.components[0]?.example?.header_handle[0]
                      }
                      style={{ width: "100%" }}
                      alt="Preview"
                    />
                  )}
                  {dataTemplate?.components[0]?.format === "VIDEO" && (
                    <div>
                      <a
                        href={
                          dataTemplate?.components[0]?.example?.header_handle[0]
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Watch Video
                      </a>
                    </div>
                  )}
                  <p>
                    <b>{dataTemplate?.components[0]?.text}</b>
                  </p>
                  <p>{dataTemplate?.components[1]?.text}</p>
                  <p>{dataTemplate?.components[2]?.text}</p>
                </div>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
}
