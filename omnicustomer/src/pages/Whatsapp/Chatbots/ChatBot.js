import React, { useEffect, useState } from 'react'
import PageTitle from '../../../common/PageTitle'
import { useNavigate } from 'react-router-dom'
import { Table } from 'react-bootstrap';
import Loader from '../../../common/components/Loader';
import { formatDateTime, handleTableRowClick, triggerAlert } from '../../../utils/CommonFunctions';
import { fetchWhatsappChatbotList,workspaceDetails } from '../../../utils/ApiClient';
import PaginationComponent from '../../../common/components/PaginationComponent';

export default function ChatBot() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [chatbotList, setChatbotList] = useState([]);

    const [pageCount, setPageCount] = useState(0);
    const [perPageLimit, setPerPageLimit] = useState(10);
    const [pageSlNo, setPageSlNo] = useState(0);
    const [selectedRow, setSelectedRow] = useState(null);
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [hideButton, setHideButton] = useState(true)
    const [messageError, setMessageError] = useState("")

    const handleCreateChatbot = () => {
        navigate('/whatsapp/chatbot/create_chatbot');
    }

    /////////////// fetch broadcast list data ///////////////////
    const fetchChatbotList = async (page) => {
        setIsLoading(true);
        try {
            if (page) setPageCount(page);
            setPageSlNo((page - 1) * perPageLimit);
            const params = {
                page: page,
                page_size: perPageLimit,
                keyword: ""
            }
            const response = await fetchWhatsappChatbotList(params);
            const response_data = response.data;

            if (response_data.error_code === 200) {
                const items = response_data.results.data;
                const total_pages = response.data.results.pagination.total_pages;
                setIsLoading(false);
                setChatbotList(items);
                setPageCount(total_pages);
                // triggerAlert('success', 'success', 'Recharged Successfully!!');
            } else {
                setIsLoading(false);
                // triggerAlert('error', 'Oops...', 'Recharge was unsuccessful');
            }
        } catch (error) {
            const response_data = error?.response?.data;
            setIsLoading(false);
            triggerAlert('error', 'Oops...', response_data ? response_data.message : "Something went wrong!");
        }
    }

    useEffect(() => {
        fetchChatbotList(1);
    }, [])

    // Pagination
    const handlePageClick = (selected) => {
        const selectedPage = selected.selected;
        setPageCount(selectedPage);

        fetchChatbotList(selectedPage + 1); // Increment the page number by 1 for server-side pagination
    };
    let props = {
        pageCount: pageCount,
        handlePageClick: handlePageClick,
    };

    const handleManageChatbot = (type) => {
        if (selectedRowId && selectedRow) {
            navigate(`/whatsapp/chatbot/edit_chatbot?id=${selectedRowId}&type=${type}&name=${selectedRow?.chat_bot_name}`);
        } else {
            triggerAlert('info', '', 'Please select atleast one row!!');
        }
    }

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
      //////////
    return (
        <>
            <div class="position-relative">
            </div>
            <div id="content-page" class="content-page">
                <div class="container">
                    <PageTitle heading="Chatbot flow" showPrimaryButton={hideButton ? "Create Chatbots" : ""} onPrimaryClick={handleCreateChatbot} />
                    {!hideButton && messageError && <p className='text-danger' style={{ fontWeight: 500 }}>{messageError}</p>}

                    <div class="row mb-5">
                        <div class="col-sm-12">
                            <div class="card">
                                <div class="card-body ">

                                    <div class="table-responsive">
                                        {hideButton && (
                                            <div class="dropdown text-end mb-3">
                                                <a href="javascript:void(0);" class="text-white px-3 btn btn-warning dropdown-toggle" id="dropdownMenuButton222" data-bs-toggle="dropdown" aria-expanded="false">
                                                    Action
                                                </a>
                                                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton222" style={{}}>
                                                    <li onClick={() => handleManageChatbot('edit')}><a class="dropdown-item d-flex align-items-center" href="#/"><i class="material-symbols-outlined md-18 me-1"

                                                    >edit_note</i>Edit</a></li>
                                                    <li onClick={() => handleManageChatbot('clone')}><a class="dropdown-item d-flex align-items-center" href="#/"><i class="material-symbols-outlined md-18 me-1">content_copy</i>
                                                        Clone</a></li>
                                                </ul>
                                            </div>)
                                        }
                                        <Table
                                            className="table table-bordered dt-responsive nowrap"
                                        >
                                            <thead class="text-nowrap">
                                                <tr style={{ backgroundColor: "#ededed" }}>
                                                    <th> Sl No</th>
                                                    <th>Chatbot Name </th>
                                                    <th>Chatbot Message </th>
                                                    <th>Chatbot Text</th>
                                                    <th>Timings</th>
                                                    <th>Created Date</th>

                                                </tr>
                                            </thead>
                                            <tbody>
                                                {isLoading ? <div className='loader-overlay text-white'>
                                                    <Loader />
                                                </div> :
                                                    chatbotList?.length > 0 ?
                                                        chatbotList.map((item, index) => (
                                                            <tr key={item.chat_bot_id}
                                                                onClick={() => handleTableRowClick(item, selectedRow, setSelectedRow, selectedRowId, setSelectedRowId, item.chat_bot_id)} className={selectedRowId === item.chat_bot_id ? 'row_selected' : ''}
                                                            >
                                                                <th>{pageSlNo + index + 1}</th>
                                                                <td>{item.chat_bot_name ? item.chat_bot_name : '-'}</td>
                                                                <td>{item.welcome_message ? item.welcome_message : '-'}</td>
                                                                <td>{item.text_fields ? item.text_fields : '-'}</td>
                                                                <td>{item.timing ? item.timing : '-'}</td>
                                                                <td>{item.created_date ? formatDateTime(item.created_date, "yyyy-mm-dd hh:mm:ss") : '-'}</td>
                                                            </tr>
                                                        )) :
                                                        <tr>
                                                            <td colSpan={7} className="text-center">No data available</td>
                                                        </tr>
                                                }
                                            </tbody>
                                        </Table>
                                        <PaginationComponent {...props} />
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
