import React, { useState,useEffect } from 'react';
import PageTitle from '../../../common/PageTitle';
import { Controller, useForm } from 'react-hook-form';
import DynamicSelect from '../../../common/components/selects/DynamicSelect';
import { formatDateTime, getBase64, triggerAlert } from '../../../utils/CommonFunctions';
import { noEmptySpacesValidation } from '../../../utils/Constants';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import MultiSelectDyGet from '../../../common/components/selects/MultiSelectDyGet';
import { sendSMSOrMMS, sendBulkSMSOrMMS,workspaceDetails } from '../../../utils/ApiClient';
import Loader from '../../../common/components/Loader';
import Emojis from '../../../common/components/Emojis';
import CreatableMultiSelectDyGet from '../../../common/components/selects/CreatableMultiSelectDyGet';
import { FaFileCsv, FaFilePdf, FaFileAlt } from 'react-icons/fa';

export default function Compose() {
    const api_url = process.env.REACT_APP_API_BASE_URL;
    const currentDate = new Date();

    // State for the main form
    const [showSchedule, setShowSchedule] = useState(false);
    const [mmsFile, setMMSFile] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [sendToNumbers, setSendToNumbers] = useState([]);
    const [activeTab, setActiveTab] = useState('contact');
    const [groupContacts, setGroupContacts] = useState([]);
    const [showEmojis, setShowEmojis] = useState(false);
    const [hideButton, setHideButton] = useState(true)
      const [messageError, setMessageError] = useState("")
    const [buttonLoading, setButtonLoading] = useState(true)

    // State for the Bulk Contact Modal
    const [showModal, setShowModal] = useState(false);
    const [isBulkLoading, setIsBulkLoading] = useState(false);
    const [bulkContactFile, setBulkContactFile] = useState(null);
    const [modalMMSFile, setModalMMSFile] = useState({});

    // React Hook Form for the main form
    const { register, handleSubmit, formState: { errors }, setValue, reset, control, watch, setError, clearErrors } = useForm({
        defaultValues: {
            scheduled_date: showSchedule ? currentDate : null,
            msg_type: 'SMS',
        }
    });

    // Separate React Hook Form instance for the Bulk Contact Modal
    const {
        register: bulkRegister,
        handleSubmit: bulkHandleSubmit,
        formState: { errors: bulkErrors },
        control: bulkControl,
        reset: bulkReset,
        setValue: bulkSetValue,
        watch: bulkWatch,
        setError: bulkSetError,
        clearErrors: bulkClearErrors
    } = useForm({
        defaultValues: {
            msg_type: 'SMS'
        }
    });

    const messageType = watch('msg_type');
    const bulkMessageType = bulkWatch('msg_type');

    const formReset = () => {
        reset({
            msg_type: 'SMS',
            scheduled_date: null,
            message: '', // Ensure the message field is reset
            to_number: [],
            from_number: null,
            template: null,
            group_id: null
        });
        setMMSFile({});
        setSendToNumbers([]);
        setGroupContacts([]);
        setShowEmojis(false);
        setShowSchedule(false);
    };

    const handleTabClick = (tabId) => {
        formReset();
        setActiveTab(tabId);
    };

    const handleToSelect = async (selectedOption) => {
        if (Array.isArray(selectedOption)) {
            const selectedValues = selectedOption.map(item => ({ ...item, value: !isNaN(item.value) ? Number(item.value) : item.value }));
            const valuesArray = selectedValues.map(item => String(item.value));
            setSendToNumbers(valuesArray);
            setValue("to_number", selectedValues);
        }
    };

    const handleNumberSelect = (selectedOption) => {
        setValue('from_number', selectedOption ? selectedOption.value : null);
    };

    const handleTemplateChange = (selectedOption) => {
        setValue('message', selectedOption ? selectedOption.message : '');
        setValue('template', selectedOption ? selectedOption.value : null);
    };

    const handleGroupSelect = (selectedOption) => {
        const selectedValues = selectedOption?.map(item => item.value) || [];
        const selectedGroupContacts = selectedOption?.flatMap(item =>
            (item.group_contacts || []).map(contact => ({ ...contact, group_id: item.value }))
        ) || [];

        setSendToNumbers(selectedValues);
        setGroupContacts(prev => {
            const selectedGroupIds = new Set(selectedOption.map(group => group.value));
            const filteredPrev = prev.filter(contact => selectedGroupIds.has(contact.group_id));
            const combinedContacts = [...filteredPrev];
            selectedGroupContacts.forEach(newContact => {
                if (!combinedContacts.some(c => c.id === newContact.id && c.group_id === newContact.group_id)) {
                    combinedContacts.push(newContact);
                }
            });
            return combinedContacts;
        });
        setValue('group_id', selectedOption);
    };

    const handleFileChange = async (e, setFileState, setErrorFunc, clearErrorsFunc) => {
        const file = e.target.files[0];
        if (!file) {
            setFileState({});
            return;
        }
        if (file.type === "application/pdf") {
            setErrorFunc('mmsfile', { type: 'manual', message: "PDF files are not allowed." });
            e.target.value = '';
            setFileState({});
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setErrorFunc('mmsfile', { type: 'manual', message: "File size should not exceed 2MB." });
            e.target.value = '';
            setFileState({});
            return;
        }
        try {
            clearErrorsFunc('mmsfile');
            const base64 = await getBase64(file);
            const base64WithoutPrefix = base64.substring(base64.indexOf(",") + 1);
            const items = {
                file_name: file.name,
                file_type: file?.name?.split(".").pop(),
                file_size: file.size,
                file: base64WithoutPrefix,
                preview: base64
            };
            setFileState(items);
        } catch (error) {
            setFileState({ error: "Failed to process the file." });
        }
    };
      const handleBulkSendButton = async () => {
        try {
          setButtonLoading(true)
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
        finally {
          setButtonLoading(false)
        }
    
      }
      useEffect(() => {
        handleBulkSendButton()
      }, [])
    

    const handleMMSFilechange = (e) => handleFileChange(e, setMMSFile, setError, clearErrors);
    const handleModalMMSFileChange = (e) => handleFileChange(e, setModalMMSFile, bulkSetError, bulkClearErrors);

    const composeSMSorMMSMessage = async (data) => {
        setIsLoading(true);
        if (data.msg_type === 'MMS' && Object.keys(mmsFile).length === 0) {
            setIsLoading(false);
            triggerAlert('error', 'Oops...', 'File is required for MMS!');
            return;
        }
        try {
            const params = { ...data };
            params.from_number = String(params.from_number);
            params.type = activeTab;
            if (activeTab === 'contact') {
                params.to_number = sendToNumbers;
                delete params.group_id;
            } else {
                params.group_id = sendToNumbers;
                delete params.to_number;
            }
            if (params.scheduled_date)
                params.scheduled_date = formatDateTime(params.scheduled_date, 'yyyy-mm-dd hh:mm:ss');
            if (params.msg_type === 'MMS')
                params.base64_files = mmsFile;

            const response = await sendSMSOrMMS(params);
            if (response.data.error_code === 200) {
                triggerAlert('success', 'Success', 'Message sent Successfully!');
                formReset();
                window.location.reload(); // Reload the page after success
            } else {
                triggerAlert('error', 'Oops...', 'Unable to send message!');
            }
        } catch (error) {
            const response_data = error?.response?.data;
            triggerAlert('error', 'Oops...', response_data ? response_data.message : "Something went wrong!");
        } finally {
            setIsLoading(false);
            setShowEmojis(false);
        }
    };

    const handleEmojiSelect = (emoji) => {
        const currentMessage = watch("message") || "";
        setValue("message", currentMessage + emoji);
    };

    const onRequestClose = () => {
        setShowModal(false);
        bulkReset();
        setBulkContactFile(null);
        setModalMMSFile({});
        setActiveTab('contact');
    };

    const handleBulkContactClick = () => {
        setActiveTab('bulkcontact');
        setShowModal(true);
    };

    const handleBulkFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            setBulkContactFile(null);
            return;
        }
        const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        if (validTypes.includes(file.type)) {
            setBulkContactFile(file);
            bulkClearErrors('to_number');
        } else {
            bulkSetError('to_number', { type: 'manual', message: 'Please upload a valid CSV or Excel file.' });
            e.target.value = '';
            setBulkContactFile(null);
        }
    };

    const handleDownloadSampleCSV = () => {
        const link = document.createElement('a');
        link.href = '/samplefile/bulk_sms.csv';
        link.download = 'bulk_sms.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const composeBulkMessage = async (data) => {
        if (!bulkContactFile) {
            bulkSetError('to_number', { type: 'manual', message: 'Contact file is required.' });
            return;
        }

        if (data.msg_type === 'MMS' && Object.keys(modalMMSFile).length === 0) {
            triggerAlert('error', 'Oops...', 'MMS attachment is required for bulk MMS!');
            return;
        }

        setIsBulkLoading(true);

        try {
            const base64ToNumber = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(bulkContactFile);
                reader.onload = () => {
                    const base64String = reader.result.split(',')[1];
                    resolve(base64String);
                };
                reader.onerror = error => reject(error);
            });

            const payload = {
                from_number: String(data.from_number),
                to_number: base64ToNumber,
                message: data.message,
                msg_type: data.msg_type,
            };

            if (data.msg_type === 'MMS' && modalMMSFile.file) {
                payload.base64_files = modalMMSFile;
            }

            const response = await sendBulkSMSOrMMS(payload);

            if (response && response.data && response.data.error_code === 200) {
                const successMsg =
                    data.msg_type === 'MMS'
                        ? 'Bulk MMS has been sent successfully.'
                        : 'Bulk SMS has been sent successfully.';
                triggerAlert('success', 'Success', successMsg);
                onRequestClose();
            } else {
                const errorMessage = response?.data?.message || 'Failed to send bulk message.';
                triggerAlert('error', 'Oops...', errorMessage);
            }
        } catch (error) {
            const responseData = error?.response?.data;
            const errorMessage = responseData ? responseData.message : "Something went wrong!";
            triggerAlert('error', 'Oops...', errorMessage);
        } finally {
            setIsBulkLoading(false);
        }
    };


    const renderFilePreview = (fileState) => {
        if (fileState.preview) {
            return <img src={fileState.preview} alt="Preview" className="mt-2" style={{ width: '100px', borderRadius: '5px' }} />;
        } else if (fileState.file_name) {
            const fileExtension = fileState.file_name.split('.').pop().toLowerCase();
            let fileIcon;

            switch (fileExtension) {
                case 'csv':
                    fileIcon = <FaFileCsv size={30} color="#28a745" />; // Smaller size for CSV icon
                    break;
                case 'pdf':
                    fileIcon = <FaFilePdf size={30} color="#dc3545" />; // Smaller size for PDF icon
                    break;
                case 'exe':
                    fileIcon = <FaFileAlt size={30} color="#007bff" />; // Smaller size for EXE icon
                    break;
                default:
                    fileIcon = <FaFileAlt size={30} color="#6c757d" />; // Smaller size for default icon
            }

            return (
                <div className="mt-2 d-flex align-items-center">
                    <div className="me-2">{fileIcon}</div>
                    <p>{fileState.file_name}</p>
                </div>
            );
        }
        return null;
    };


    return (
        <div>
            <style>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1050;
                }
                .modal-content {
                    background: white;
                    padding: 2rem;
                    border-radius: 8px;
                    width: 90%;
                    max-width: 600px;
                    position: relative;
                    max-height: 90vh;
                    overflow-y: auto;
                }
                .close-button {
                    position: absolute;
                    top: 10px;
                    right: 15px;
                    font-size: 1.5rem;
                    font-weight: bold;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                }
                .form-group {
                    margin-bottom: 1rem;
                }
            `}</style>

            <main className="main-content mt-3">
                <div className="container content-inner" id="page_layout">
                    {buttonLoading ? (
                        <div className="d-flex align-items-center mb-3">
                            <h4 className="mb-0 me-3">Compose</h4>
                            <div className="spinner-border spinner-border-sm" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <PageTitle heading="Compose" />
                    )}
                    {(isLoading || isBulkLoading) && <div className='loader-overlay text-white'><Loader /></div>}
                    <div className="row">
                        <div className="col-sm-12 col-lg-12">
                            <div className="tab-content" id="myTabContent">
                                <div className="card tab-pane mb-0 fade show active" id="user-content-103" role="tabpanel">
                                    <form onSubmit={handleSubmit(composeSMSorMMSMessage)}>
                                        <div className="card-header border-0">
                                            <ul className="nav nav-pills" id="pills-tab" role="tablist">
                                                <li className="nav-item" role="presentation">
                                                    <a className={`nav-link ${activeTab === 'contact' ? 'active' : ''}`} href="#!" onClick={() => handleTabClick('contact')}>
                                                        <i className="fa fa-solid fa-address-book" aria-hidden="true"></i>
                                                        <span className="ms-2">Contacts</span>
                                                    </a>
                                                </li>
                                                <li className="nav-item" role="presentation">
                                                    <a className={`nav-link ${activeTab === 'groups' ? 'active' : ''}`} href="#!" onClick={() => handleTabClick('groups')}>
                                                        <i className="fa fa-users" aria-hidden="true"></i>
                                                        <span className="ms-2">Groups</span>
                                                    </a>
                                                </li>
                                                <li className="nav-item" role="presentation">
                                                    <a className={`nav-link ${activeTab === 'bulkcontact' ? 'active' : ''}`} href="#!" onClick={handleBulkContactClick}>
                                                        <i className="fa fa-users" aria-hidden="true"></i>
                                                        <span className="ms-2">Bulk Send</span>
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="card-body bg-body">
                                            <div className="row mt-3">
                                                <div className="col-md-6 mb-3">
                                                    <div className='d-flex justify-content-between'>
                                                        <label className="form-label">To <span className='text-danger'>*</span></label>
                                                        {activeTab === 'contact' ? (
                                                            <span>Recipients: {watch('to_number')?.length || 0}</span>
                                                        ) : (
                                                            <span>Recipients: {groupContacts?.length || 0}</span>
                                                        )}
                                                    </div>
                                                    {activeTab === 'contact' ? (
                                                        <>
                                                            <Controller
                                                                name="to_number"
                                                                control={control}
                                                                rules={{ required: 'To is required' }}
                                                                render={({ field }) => (
                                                                    <CreatableMultiSelectDyGet
                                                                        {...field}
                                                                        apiUrl={`${api_url}sms/get_all_contact_list/`}
                                                                        placeholder="Select or type phone numbers"
                                                                        mapOption={r => ({ value: r.contact_number, label: r.contact_number })}
                                                                        onSelect={handleToSelect}
                                                                    />
                                                                )}
                                                            />
                                                            {errors.to_number && <div className="text-danger mt-1 small">{errors.to_number.message}</div>}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Controller
                                                                name="group_id"
                                                                control={control}
                                                                rules={{ required: 'Group is required' }}
                                                                render={({ field }) => (
                                                                    <MultiSelectDyGet
                                                                        {...field}
                                                                        apiUrl={`${api_url}contact/template_groups_list/`}
                                                                        placeholder="Select group(s)"
                                                                        mapOption={r => ({ value: r.id, label: r.group_name, group_contacts: r.group_contacts })}
                                                                        onSelect={handleGroupSelect}
                                                                    />
                                                                )}
                                                            />
                                                            {errors.group_id && <div className="text-danger mt-1 small">{errors.group_id.message}</div>}
                                                        </>
                                                    )}
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label">From <span className='text-danger'>*</span></label>
                                                    <Controller
                                                        name="from_number"
                                                        control={control}
                                                        rules={{ required: 'From number is required' }}
                                                        render={({ field }) => (
                                                            <DynamicSelect
                                                                {...field}
                                                                apiUrl={`${api_url}sms/get_company_number_list/`}
                                                                placeholder="Select phone number"
                                                                mapOption={r => ({ value: r.requested_no, label: r.requested_no })}
                                                                onSelect={handleNumberSelect}
                                                                isClearable={false} // <-- pass this only for "From" field
                                                            />
                                                        )}
                                                    />
                                                    {errors.from_number && <div className="text-danger mt-1 small">{errors.from_number.message}</div>}
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label">Template</label>
                                                    <Controller
                                                        name="template"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <DynamicSelect
                                                                {...field}
                                                                apiUrl={`${api_url}sms/get_message_template_list/`}
                                                                placeholder="Select a template"
                                                                mapOption={r => ({ value: r.id, label: r.template_name, message: r.template_message })}
                                                                onSelect={handleTemplateChange}
                                                            />
                                                        )}
                                                    />
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label">Select Type <span className='text-danger'>*</span></label>
                                                    <div className='d-flex align-items-center mt-2'>
                                                        <div className="me-3">
                                                            <input {...register("msg_type")} type="radio" id="SMS" value="SMS" />
                                                            <label htmlFor="SMS" className="ms-1">SMS</label>
                                                        </div>
                                                        <div className="me-3">
                                                            <input {...register("msg_type")} type="radio" id="MMS" value="MMS" />
                                                            <label htmlFor="MMS" className="ms-1">MMS</label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label">Message <span className="text-danger">*</span></label>
                                                    <textarea
                                                        className="form-control"
                                                        placeholder="Enter message"
                                                        rows="4"
                                                        {...register("message", { required: "Message is required", validate: noEmptySpacesValidation })}
                                                    />
                                                    {errors.message && <div className="text-danger mt-1 small">{errors.message.message}</div>}
                                                    <div className="d-flex justify-content-between align-items-center mt-2">
                                                        <span>Characters: {watch("message")?.length || 0}</span>
                                                        <a href="#!" onClick={() => setShowEmojis(!showEmojis)} title="Insert Emoji">
                                                            <svg className="icon-24" width="24" viewBox="0 0 24 25" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M20.4853 4.01473C18.2188 1.74823 15.2053 0.5 12 0.5C8.79469 0.5 5.78119 1.74823 3.51473 4.01473C1.24819 6.28119 0 9.29469 0 12.5C0 15.7053 1.24819 18.7188 3.51473 20.9853C5.78119 23.2518 8.79469 24.5 12 24.5C15.2053 24.5 18.2188 23.2518 20.4853 20.9853C22.7518 18.7188 24 15.7053 24 12.5C24 9.29469 22.7518 6.28119 20.4853 4.01473ZM12 23.0714C6.17091 23.0714 1.42856 18.3291 1.42856 12.5C1.42856 6.67091 6.17091 1.92856 12 1.92856C17.8291 1.92856 22.5714 6.67091 22.5714 12.5C22.5714 18.3291 17.8291 23.0714 12 23.0714Z"></path><path d="M9.40398 9.3309C8.23431 8.16114 6.33104 8.16123 5.16136 9.3309C4.88241 9.60981 4.88241 10.0621 5.16136 10.3411C5.44036 10.62 5.89266 10.62 6.17157 10.3411C6.78432 9.72836 7.78126 9.7284 8.39392 10.3411C8.53342 10.4806 8.71618 10.5503 8.89895 10.5503C9.08171 10.5503 9.26457 10.4806 9.40398 10.3411C9.68293 10.0621 9.68293 9.60986 9.40398 9.3309Z"></path><path d="M18.8384 9.3309C17.6688 8.16123 15.7655 8.16114 14.5958 9.3309C14.3169 9.60981 14.3169 10.0621 14.5958 10.3411C14.8748 10.62 15.3271 10.62 15.606 10.3411C16.2187 9.72836 17.2156 9.72831 17.8284 10.3411C17.9679 10.4806 18.1506 10.5503 18.3334 10.5503C18.5162 10.5503 18.699 10.4806 18.8384 10.3411C19.1174 10.0621 19.1174 9.60986 18.8384 9.3309Z"></path><path d="M18.3335 13.024H5.6668C5.2723 13.024 4.95251 13.3438 4.95251 13.7383C4.95251 17.6243 8.11409 20.7859 12.0001 20.7859C15.8862 20.7859 19.0477 17.6243 19.0477 13.7383C19.0477 13.3438 18.728 13.024 18.3335 13.024ZM12.0001 19.3573C9.14366 19.3573 6.77816 17.215 6.42626 14.4525H17.574C17.2221 17.215 14.8566 19.3573 12.0001 19.3573Z"></path></svg>
                                                        </a>
                                                    </div>
                                                    {showEmojis && (
                                                        <div style={{ position: "relative", zIndex: 1000 }}>
                                                            <div style={{ position: "absolute", top: "5px", left: 0, right: 0 }}>
                                                                <Emojis onEmojiSelect={handleEmojiSelect} pickerSize={{ height: 300, width: '100%' }} />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                {showSchedule &&
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">Schedule (EST Timezone)</label>
                                                        <Controller
                                                            control={control}
                                                            name="scheduled_date"
                                                            render={({ field }) => (
                                                                <DatePicker
                                                                    selected={field.value}
                                                                    onChange={date => field.onChange(date)}
                                                                    showTimeSelect
                                                                    timeFormat="HH:mm"
                                                                    timeIntervals={30}
                                                                    dateFormat="yyyy-MM-dd HH:mm:ss"
                                                                    placeholderText="Select date and time"
                                                                    className="form-control custom-datepicker-width"
                                                                    minDate={currentDate}
                                                                />
                                                            )}
                                                        />
                                                    </div>
                                                }
                                                {messageType === 'MMS' && (
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">Attachment <span className="text-danger">*</span></label>
                                                        <input
                                                            type="file"
                                                            name="mmsfile"
                                                            className="form-control"
                                                            onChange={handleMMSFilechange}
                                                        />
                                                        {errors.mmsfile && <div className="text-danger mt-1 small">{errors.mmsfile.message}</div>}
                                                        {renderFilePreview(mmsFile)}
                                                    </div>
                                                )}

                                            </div>
                                        </div>
                                        {!buttonLoading && (
                                            <div className="card-footer px-3 py-3 rounded-0">
                                                <div className="d-flex justify-content-end flex-wrap">
                                                    {hideButton && (
                                                        <button type="button" className="btn btn-info px-4 d-flex align-items-center me-2 mb-2" onClick={() => setShowSchedule(!showSchedule)}>
                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                                            <span className="ms-2">{showSchedule ? 'Un-Schedule' : 'Schedule'}</span>
                                                        </button>
                                                    )}
                                                    <button type="button" className="btn btn-warning px-4 d-flex align-items-center me-2 mb-2" onClick={formReset}><span>Cancel</span></button>
                                                    {hideButton && (
                                                        <button type="submit" className="btn btn-success px-4 d-flex align-items-center mb-2" disabled={isLoading}>
                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                                                            <span className="ms-2">{isLoading ? "Sending..." : "Send"}</span>
                                                        </button>
                                                    )}
                                                </div>
                                                {!hideButton && messageError && (
                                                    <div className="text-danger mt-2 text-center">
                                                        {messageError}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Bulk Contact Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-button" onClick={onRequestClose}>×</button>
                        <h2>Bulk Send</h2>
                        <div className="mb-4">
                            <p className="mb-2">
                                <b>Please use the below given sample file format for the upload.</b>
                            </p>
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
                        </div>
                        <form onSubmit={bulkHandleSubmit(composeBulkMessage)}>
                            <div className="form-group">
                                <label>Attachment (CSV) <span className="text-danger">*</span></label>
                                <input
                                    className="form-control"
                                    type="file"
                                    onChange={handleBulkFileChange}
                                />
                                {bulkErrors.to_number && <div className="text-danger mt-1 small">{bulkErrors.to_number.message}</div>}
                            </div>
                            <div className="form-group">
                                <label>From <span className="text-danger">*</span></label>
                                <Controller
                                    name="from_number"
                                    control={bulkControl}
                                    rules={{ required: "From number is required" }}
                                    render={({ field }) => (
                                        <DynamicSelect
                                            {...field}
                                            apiUrl={`${api_url}sms/get_company_number_list/`}
                                            placeholder="Select phone number"
                                            mapOption={r => ({ value: r.requested_no, label: r.requested_no })}
                                            onSelect={(opt) => field.onChange(opt ? opt.value : null)}
                                            isClearable={false} // <-- This disables the cross (clear icon)
                                        />

                                    )}
                                />
                                {bulkErrors.from_number && <div className="text-danger mt-1 small">{bulkErrors.from_number.message}</div>}
                            </div>
                            <div className="form-group">
                                <label>Template</label>
                                <Controller
                                    name="template"
                                    control={bulkControl}
                                    render={({ field }) => (
                                        <DynamicSelect
                                            {...field}
                                            apiUrl={`${api_url}sms/get_message_template_list/`}
                                            placeholder="Select a template"
                                            mapOption={r => ({ value: r.id, label: r.template_name, message: r.template_message })}
                                            onSelect={(opt) => {
                                                field.onChange(opt ? opt.value : null);
                                                bulkSetValue('message', opt ? opt.message : '');
                                            }}
                                        />
                                    )}
                                />
                            </div>
                            <div className="form-group">
                                <label>Select Type <span className="text-danger">*</span></label>
                                <div className='d-flex align-items-center mt-2'>
                                    <div className="me-3">
                                        <input {...bulkRegister("msg_type")} type="radio" id="bulkSMS" value="SMS" />
                                        <label htmlFor="bulkSMS" className="ms-1">SMS</label>
                                    </div>
                                    <div className="me-3">
                                        <input {...bulkRegister("msg_type")} type="radio" id="bulkMMS" value="MMS" />
                                        <label htmlFor="bulkMMS" className="ms-1">MMS</label>
                                    </div>
                                </div>
                            </div>
                            {bulkMessageType === 'MMS' && (
                                <div className="form-group">
                                    <label>Attachment <span className="text-danger">*</span></label>
                                    <input type="file" name="mmsfile" className="form-control" onChange={handleModalMMSFileChange} />
                                    {bulkErrors.mmsfile && <div className="text-danger mt-1 small">{bulkErrors.mmsfile.message}</div>}
                                    {modalMMSFile.preview && <img src={modalMMSFile.preview} alt="Preview" className="mt-2" style={{ width: '100px', borderRadius: '5px' }} />}
                                </div>
                            )}
                            <div className="form-group">
                                <label>Message <span className="text-danger">*</span></label>
                                <textarea
                                    className="form-control"
                                    placeholder="Enter message"
                                    rows="4"
                                    {...bulkRegister("message", { required: "Message is required", validate: noEmptySpacesValidation })}
                                />
                                {bulkErrors.message && <div className="text-danger mt-1 small">{bulkErrors.message.message}</div>}
                                <div className="d-flex justify-content-between align-items-center mt-2">
                                    <span>Characters: {bulkWatch("message")?.length || 0}</span>
                                </div>
                            </div>
                            {hideButton && <button type="submit" className="btn btn-primary w-100" disabled={isBulkLoading}>
                                {isBulkLoading ? "Submitting..." : "Submit"}
                            </button>}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
