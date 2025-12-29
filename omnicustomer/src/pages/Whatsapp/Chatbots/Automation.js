import React, { useEffect, useState } from 'react';
import { triggerAlert } from '../../../utils/CommonFunctions';
import { GetAutomationList, GetChatBotList, updateChatbotAutomation, workspaceDetails } from '../../../utils/ApiClient';
import { Controller, useForm } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Loader from '../../../common/components/Loader';
import PageTitle from '../../../common/PageTitle';
import { Link } from 'react-router-dom';

export default function Automation() {
    const [listAuto, setListAuto] = useState([]);
    const [listChatbot, setListChatbot] = useState([]);
    const { control, handleSubmit } = useForm();
    const [extraTimes, setExtraTimes] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [defaultChatbotId, setDefaultChatbotId] = useState("");
    const [timeSlotErrors, setTimeSlotErrors] = useState({});
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
      

    const GetAutoList = async () => {
        setIsLoading(true);
        try {
            const response = await GetAutomationList();
            if (response.data.error_code === 200) {
                const items = response.data.results;
                const default_chatbot_id = items.filter(item => item.day === 0);
                setListAuto(items);
                setDefaultChatbotId(default_chatbot_id.length ? default_chatbot_id[0]?.chat_bot_id : null);
            }
        } catch (error) {
            triggerAlert('error', '', error?.response?.data?.message || "Something went wrong!");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchChatbots = async () => {
        try {
            const response = await GetChatBotList();
            if (response.data.error_code === 200) {
                setListChatbot(response.data.results);
            }
        } catch (error) {
            triggerAlert('error', '', error?.response?.data?.message || "Something went wrong!");
        }
    };

    useEffect(() => {
        fetchChatbots();
        GetAutoList();
    }, []);

    const handleDefaultChatbotChange = (e) => {
        setDefaultChatbotId(e.target.value);
    };

    const getDayName = (day) => {
        if (day === 0) return "Default";
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return days[day - 1];
    };

    const convertTimeToDate = (time) => {
        const now = new Date();
        now.setHours(time || 0);
        now.setMinutes(0);
        now.setSeconds(0);
        return now;
    };

    const handleAddTimeRange = (dayIndex) => {
        setExtraTimes((prev) => {
            const newTimingId = Date.now();
            const newTimeSlot = {
                timing_id: newTimingId,
                day: parseInt(dayIndex, 10),
                chat_bot_id: "",
                start_time: null,
                end_time: null,
            };
            const updatedTimes = [...(prev[dayIndex] || []), newTimeSlot];
            return { ...prev, [dayIndex]: updatedTimes };
        });
    };

    const handleRemoveTimeRange = (dayIndex, timingId) => {
        setExtraTimes((prev) => {
            const updatedDay = prev[dayIndex]?.filter((time) => time.timing_id !== timingId) || [];
            return { ...prev, [dayIndex]: updatedDay };
        });
    };

    const handleChatbotChangeExtraTime = (dayIndex, timingId, value) => {
        setExtraTimes((prev) => {
            const updatedDay = prev[dayIndex].map((time) => {
                if (time.timing_id === timingId) {
                    return { ...time, chat_bot_id: value };
                }
                return time;
            });
            return { ...prev, [dayIndex]: updatedDay };
        });
    };

    const groupedByDay = listAuto
        .filter(item => item.default_chatbot_id === null)
        .reduce((acc, item) => {
            if (!acc[item.day]) {
                acc[item.day] = [];
            }
            acc[item.day].push(item);
            return acc;
        }, {});

    useEffect(() => {
        const initialExtraTimes = {};
        listAuto.forEach(item => {
            if (!initialExtraTimes[item.day]) {
                initialExtraTimes[item.day] = [];
            }
            if (item.day !== 0) {
                initialExtraTimes[item.day].push(item);
            }
        });

        // Ensure each day has at least one time slot
        for (let day = 1; day <= 7; day++) {
            if (!initialExtraTimes[day]) {
                initialExtraTimes[day] = [{
                    timing_id: `initial-${day}`,
                    day: day,
                    chat_bot_id: "",
                    start_time: null,
                    end_time: null,
                }];
            }
        }

        setExtraTimes(initialExtraTimes);
    }, [listAuto]);

    const updateChatbotTimings = async (data) => {
        const timingsPayload = Object.entries(extraTimes).map(([dayIndex, timeSlots]) => {
            return timeSlots.map((item) => ({
                day: item.day,
                start_time: item.start_time,
                end_time: item.end_time,
                chat_bot_id: item.chat_bot_id
            }));
        }).flat();

        const defaultChatbotPayload = {
            default_chatbot: Number(defaultChatbotId),
        };

        const payload = {
            automation_data: timingsPayload,
            ...defaultChatbotPayload,
        };

        setIsLoading(true);
        try {
            const response = await updateChatbotAutomation(payload);
            if (response.data.error_code === 201) {
                fetchChatbots();
                triggerAlert('success', 'success', 'Updated Successfully!!');
            }
        } catch (error) {
            triggerAlert('error', 'Oops...', error?.response?.data?.message || "Something went wrong!");
        } finally {
            setIsLoading(false);
        }
    };

    const validateTimeSlot = (dayIndex, timing_id, start_time, end_time, timeSlots) => {
        let errors = {};

        if (start_time === end_time) {
            errors[timing_id] = "Start time and end time should not be the same.";
        }

        if (end_time < start_time) {
            errors[timing_id] = "End time should not be earlier than start time.";
        }

        const hasOverlap = timeSlots.some((slot) => {
            if (slot.timing_id !== timing_id && slot.day === timeSlots[0].day) {
                return (
                    (start_time >= slot.start_time && start_time < slot.end_time) ||
                    (end_time > slot.start_time && end_time <= slot.end_time) ||
                    (start_time <= slot.start_time && end_time >= slot.end_time)
                );
            }
            return false;
        });

        if (hasOverlap) {
            errors[timing_id] = "Chatbot already exists in selected time slots.";
        }

        setTimeSlotErrors((prev) => ({
            ...prev,
            [timing_id]: errors[timing_id] || ""
        }));
    };

    const handleStartTimeChange = (dayIndex, timing_id, date) => {
        const hours = date.getHours();
        setExtraTimes((prev) => {
            const updatedTimes = [...(prev[dayIndex] || [])];
            const updatedTime = updatedTimes.find(time => time.timing_id === timing_id);
            if (updatedTime) {
                updatedTime.start_time = hours;
                validateTimeSlot(dayIndex, timing_id, hours, updatedTime.end_time, updatedTimes);
            }
            return { ...prev, [dayIndex]: updatedTimes };
        });
    };

    const handleEndTimeChange = (dayIndex, timing_id, date) => {
        const hours = date.getHours();
        setExtraTimes((prev) => {
            const updatedTimes = [...(prev[dayIndex] || [])];
            const updatedTime = updatedTimes.find(time => time.timing_id === timing_id);
            if (updatedTime) {
                updatedTime.end_time = hours;
                validateTimeSlot(dayIndex, timing_id, updatedTime.start_time, hours, updatedTimes);
            }
            return { ...prev, [dayIndex]: updatedTimes };
        });
    };

    const hasErrors = () => {
        return Object.values(timeSlotErrors)?.some(error => error !== "");
    };

    return (
        <>
            <div>
                <div className="position-relative"></div>
                {isLoading && (
                    <div className="loader-overlay text-white">
                        <Loader />
                    </div>
                )}
                <div id="content-page" className="content-page">
                    <div className="container">
                        <PageTitle heading={"Chatbots Automation"} />
                        {!hideButton && messageError && <p className='text-danger' style={{ fontWeight: 500 }}>{messageError}</p>}
                        <div className="row">
                            <div className="col-sm-12 col-lg-12">
                                <div className="card">
                                    {/* <div className="card-header d-flex justify-content-between">
                                        <div className="header-title">
                                            <h5 className="card-title text-warning">
                                                Sahiti@vitelglobal.com
                                            </h5>
                                            <p className="mb-0">Chatbots Automation</p>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <Link
                                                type="button"
                                                to="/whatsapp/chatbot/chatbot"
                                                className="btn btn-primary d-flex align-items-center"
                                            >
                                                <span className=" ">Chatbots List</span>
                                            </Link>
                                        </div>
                                    </div> */}
                                    <div className="card-body">
                                        <h5 className="mb-3 fw-500">Working hours</h5>
                                        <form onSubmit={handleSubmit(updateChatbotTimings)}>
                                            {Array.from({ length: 7 }, (_, dayIndex) => (
                                                <div key={dayIndex + 1}>
                                                    {(
                                                        extraTimes[dayIndex + 1] || [
                                                            {
                                                                day: dayIndex + 1,
                                                                timing_id: `initial-${dayIndex + 1}`,
                                                                start_time: null,
                                                                end_time: null,
                                                            },
                                                        ]
                                                    ).map((item, index) => (
                                                        <div
                                                            key={item.timing_id}
                                                            className="row align-items-center mb-4"
                                                        >
                                                            {index === 0 ? (
                                                                <>
                                                                    <div className="col-md-1">
                                                                        <p>{getDayName(dayIndex + 1)}</p>
                                                                    </div>
                                                                    <div className="col-md-3">
                                                                        <Controller
                                                                            control={control}
                                                                            name={`startTime-${item.timing_id}`}
                                                                            render={({ field }) => (
                                                                                <DatePicker
                                                                                    {...field}
                                                                                    showTimeSelect
                                                                                    showTimeSelectOnly
                                                                                    timeIntervals={60}
                                                                                    timeCaption="Start Time"
                                                                                    timeFormat="HH:mm"
                                                                                    dateFormat="HH:mm"
                                                                                    className="form-control"
                                                                                    selected={
                                                                                        item.start_time !== null
                                                                                            ? convertTimeToDate(item.start_time)
                                                                                            : convertTimeToDate(0)
                                                                                    }
                                                                                    onChange={(date) =>
                                                                                        handleStartTimeChange(
                                                                                            dayIndex + 1,
                                                                                            item.timing_id,
                                                                                            date
                                                                                        )
                                                                                    }
                                                                                    onKeyDown={(e) => e.preventDefault()}

                                                                                />
                                                                            )}
                                                                        />
                                                                        {timeSlotErrors[item.timing_id] && (
                                                                            <div className="text-danger position-absolute">
                                                                                {timeSlotErrors[item.timing_id]}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="col-md-1 text-center">
                                                                        <p>To</p>
                                                                    </div>
                                                                    <div className="col-md-3">
                                                                        <Controller
                                                                            control={control}
                                                                            name={`endTime-${item.timing_id}`}
                                                                            render={({ field }) => (
                                                                                <DatePicker
                                                                                    {...field}
                                                                                    showTimeSelect
                                                                                    showTimeSelectOnly
                                                                                    timeIntervals={60}
                                                                                    timeCaption="End Time"
                                                                                    timeFormat="HH:mm"
                                                                                    dateFormat="HH:mm"
                                                                                    className="form-control"
                                                                                    selected={
                                                                                        item.end_time !== null
                                                                                            ? convertTimeToDate(item.end_time)
                                                                                            : convertTimeToDate(0)
                                                                                    }
                                                                                    onChange={(date) =>
                                                                                        handleEndTimeChange(
                                                                                            dayIndex + 1,
                                                                                            item.timing_id,
                                                                                            date
                                                                                        )
                                                                                    }
                                                                                    onKeyDown={(e) => e.preventDefault()}
                                                                                />
                                                                            )}
                                                                        />
                                                                    </div>
                                                                    <div className="col-md-3">
                                                                        <select
                                                                            className="form-select"
                                                                            value={item.chat_bot_id || ""}
                                                                            onChange={(e) =>
                                                                                handleChatbotChangeExtraTime(
                                                                                    dayIndex + 1,
                                                                                    item.timing_id,
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                        >
                                                                            <option value="" hidden>
                                                                                Select Chatbot
                                                                            </option>
                                                                            {listChatbot.map((chatbot) => (
                                                                                <option
                                                                                    key={chatbot.chat_bot_id}
                                                                                    value={chatbot.chat_bot_id}
                                                                                >
                                                                                    {chatbot.chat_bot_name}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                    <div className="col-md-1">
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-success px-4"
                                                                            onClick={() =>
                                                                                handleAddTimeRange(dayIndex + 1)
                                                                            }
                                                                        >
                                                                            <span className="material-symbols-outlined">
                                                                                add
                                                                            </span>
                                                                        </button>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <div className="col-md-3 offset-md-1">
                                                                        <Controller
                                                                            control={control}
                                                                            name={`startTime-${item.timing_id}`}
                                                                            render={({ field }) => (
                                                                                <DatePicker
                                                                                    {...field}
                                                                                    selected={
                                                                                        item.start_time !== null
                                                                                            ? convertTimeToDate(item.start_time)
                                                                                            : convertTimeToDate(0)
                                                                                    }
                                                                                    showTimeSelect
                                                                                    showTimeSelectOnly
                                                                                    timeIntervals={60}
                                                                                    timeCaption="Start Time"
                                                                                    timeFormat="HH:mm"
                                                                                    dateFormat="HH:mm"
                                                                                    className="form-control"
                                                                                    onChange={(date) =>
                                                                                        handleStartTimeChange(
                                                                                            dayIndex + 1,
                                                                                            item.timing_id,
                                                                                            date
                                                                                        )
                                                                                    }
                                                                                    onKeyDown={(e) => e.preventDefault()}
                                                                                />
                                                                            )}
                                                                        />
                                                                        {timeSlotErrors[item.timing_id] && (
                                                                            <div className="text-danger">
                                                                                {timeSlotErrors[item.timing_id]}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="col-md-1 text-center">
                                                                        <p>To</p>
                                                                    </div>
                                                                    <div className="col-md-3">
                                                                        <Controller
                                                                            control={control}
                                                                            name={`endTime-${item.timing_id}`}
                                                                            render={({ field }) => (
                                                                                <DatePicker
                                                                                    {...field}
                                                                                    selected={
                                                                                        item.end_time !== null
                                                                                            ? convertTimeToDate(item.end_time)
                                                                                            : convertTimeToDate(0)
                                                                                    }
                                                                                    showTimeSelect
                                                                                    showTimeSelectOnly
                                                                                    timeIntervals={60}
                                                                                    timeCaption="End Time"
                                                                                    timeFormat="HH:mm"
                                                                                    dateFormat="HH:mm"
                                                                                    className="form-control"
                                                                                    onChange={(date) =>
                                                                                        handleEndTimeChange(
                                                                                            dayIndex + 1,
                                                                                            item.timing_id,
                                                                                            date
                                                                                        )
                                                                                    }
                                                                                    onKeyDown={(e) => e.preventDefault()}
                                                                                />
                                                                            )}
                                                                        />
                                                                    </div>
                                                                    <div className="col-md-3">
                                                                        <select
                                                                            className="form-select"
                                                                            value={item.chat_bot_id || ""}
                                                                            onChange={(e) =>
                                                                                handleChatbotChangeExtraTime(
                                                                                    dayIndex + 1,
                                                                                    item.timing_id,
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                        >
                                                                            <option value="" hidden>
                                                                                Select Chatbot
                                                                            </option>
                                                                            {listChatbot.map((chatbot) => (
                                                                                <option
                                                                                    key={chatbot.chat_bot_id}
                                                                                    value={chatbot.chat_bot_id}
                                                                                >
                                                                                    {chatbot.chat_bot_name}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                    <div className="col-md-1">
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-danger px-4"
                                                                            onClick={() =>
                                                                                handleRemoveTimeRange(
                                                                                    dayIndex + 1,
                                                                                    item.timing_id
                                                                                )
                                                                            }
                                                                        >
                                                                            <span className="material-symbols-outlined">
                                                                                remove
                                                                            </span>
                                                                        </button>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                            <div className="row mt-4">
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label
                                                            className="form-label"
                                                            htmlFor="defaultChatbotSelect"
                                                        >
                                                            Default Chatbot
                                                        </label>
                                                        <select
                                                            className="form-select"
                                                            id="defaultChatbotSelect"
                                                            value={defaultChatbotId}
                                                            onChange={handleDefaultChatbotChange}
                                                        >
                                                            <option value="" hidden>
                                                                Select Chatbot
                                                            </option>
                                                            {listChatbot.map((chatbot) => (
                                                                <option
                                                                    key={chatbot.chat_bot_id}
                                                                    value={chatbot.chat_bot_id}
                                                                >
                                                                    {chatbot.chat_bot_name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-md-12 text-danger">
                                                    Note: Please note that the chatbot will be active
                                                    outside the designated working hours and days
                                                    (during non-working hours) by default.
                                                </div>
                                                {hideButton && (
                                                    <div className="form-group mb-3 text-end">
                                                        <button
                                                            className="btn btn-success px-4"
                                                            type="submit"
                                                            disabled={hasErrors()}
                                                        >
                                                            Save
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </form>
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
