// apiClient.js

import axios from 'axios';
import { getOnlyToken, getWToken } from './CommonFunctions';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://192.168.200.140:8000/';
const apiClient = axios.create({
	baseURL: BASE_URL,
});

// Add a request interceptor to set the Authorization header dynamically
apiClient.interceptors.request.use((config) => {
	const token = getOnlyToken();
	const wtoken = getWToken(); // Assuming this is how you fetch the second token
	const mainToken = wtoken ? wtoken : token;
	if (mainToken) {
		config.headers['Authorization'] = `${mainToken}`;
	}
	// Add the additional token to the headers
	// if (wtoken) {
	// 	config.headers['X-Additional-Token'] = `${wtoken}`; // Change the header name as needed
	// }
	// Dynamically set 'Content-Type' header for FormData
	if (config.data instanceof FormData) {
		config.headers['Content-Type'] = 'multipart/form-data';
	} else {
		config.headers['Content-Type'] = 'application/json';
	}
	return config;
}, (error) => {
	return Promise.reject(error);
});

// Define common API methods
export const _get = (url, config = {}) => {
	return apiClient.get(url, config);
};

export const _delete = (url, config = {}) => {
	return apiClient.delete(url, config);
};

export const _put = (url, data = {}, config = {}) => {
	return apiClient.put(url, data, config);
};

export const _post = (url, data = {}, config = {}) => {
	return apiClient.post(url, data, config);
};

export const _patch = (url, data = {}, config = {}) => {
	return apiClient.patch(url, data, config);
};

// Define API Calls
export const getCcCards = () => {
	const response = _get('/services/get_cc_cards');
	return response;
};
export const login = () => {
	const response = _post('/login');
	return response;
};
//////////////////// Workspace APIs //////////////////////////////////////////
export const fetchWorkspace = () => {
	const response = _get(`/workspace/workspace_listing/`);
	return response;
}

// export const fetchWorkSpaceList = (params) => {
// 	const response = _get(`/workspace/workspace_list?page_number=${params.page}&page_size=${params.page_size}`);
// 	return response;
// };
export const CreateWorkspace = (api_input) => {
	const response = _post('/workspace/create_workspace/', api_input);
	return response;
}
export const UpdateWorkspace = (id, api_input) => {
	const response = _put(`/workspace/update_workspace/${id}/`, api_input);
	return response;
}
export const DeleteWorkspace = (id) => {
	const response = _delete(`/workspace/delete_workspace/${id}/`);
	return response;
}
export const fetchWorkspaceToken = (id) => {
	const response = _post(`/customer/workspace_login/${id}/`);
	return response;
}
//////////////////// SMS APIs //////////////////////////////////////////
export const fetchCompanyContactList = (params) => {
	const response = _get(`/sms/get_company_number_list/`);
	return response;
}
export const fetchSMSContactList = (params) => {
	let url = `/sms/get_contact_list?page_number=${params?.page}&page_size=${params?.page_size}&keyword=${params.keyword}&selected_number=${params?.number}`;

	// Only append direction to the URL if it is defined and type is "IN"
	if (params.direction !== undefined && params.direction === 'IN') {
		url += `&direction=${params.direction}`;
	}

	const response = _get(url);
	return response;
};


export const fetchSMSUserChatHistory = (params) => {
	const response = _get(`/sms/get_user_sms_history?page_number=${params?.page}&page_size=${params?.page_size}&selected_number=${params?.number}&user_number=${params?.user_number}&msg_type=${params?.msg_type}`);
	return response;
}

export const sendSMSOrMMS = (api_input) => {
	const response = _post('/sms/send_sms_mms/', api_input);
	return response;
}
export const updateMessageSeenStatus = (api_input) => {
	const response = _put('/sms/update_message_seen_status/', api_input);
	return response;
}
//////////////////// SMS APIs End //////////////////////////////////////////

/////////////////// Login apis /////////////////////////
export const loginSubmit = (api_input) => {
	return _post('/customer/login/', api_input);
};


export const resendOtp = (api_input) => {
	return _post('customer/login/resend_two_fa_code/', api_input);
};

export const otpVerification = (api_input) => {
	return _post('customer/login/two_fa_verify/', api_input);
};


export const captchrefresh = (api_input) => {
	return _get('customer/GenerateCaptcha/', api_input);
};

export const passwordReset = (api_input) => {
	return _post('customer/reset_password/', api_input);
};




//////////////////////////////////////////////////////////////////
export const registerSubmit = (api_input) => {
	return _post('/customer/register/', api_input);
};

// Sub user
export const fetchSubUsersList = (params) => {
	const response = _post(`/subusers/list/`, params);
	return response;
}

export const createSubUser = (params) => {
	const response = _post(`/subusers/create/`, params);
	return response;
}

export const editSubUser = (id, params) => {
	const response = _put(`/subusers/update/${id}/`, params);
	return response;
}

export const deleteSubUser = (id) => {
	const response = _delete(`/subusers/delete/${id}/`);
	return response;
}

// Pending Invitation
export const fetchSubUsersInvitationList = (params) => {
	const response = _post(`/subusers/pending_sub_user_invitation/`, params);
	return response;
}

export const sentSubUserInvitation = (params) => {
	const response = _post(`/subusers/sent_sub_user_invitation/`, params);
	return response;
}

// Sub user permission
export const fetchSubUserPermission = (params) => {
	const response = _get(`customer/sub_user_workspace_permission_list/?sub_user_id=${params?.sub_user_id}`);
	return response;
}


export const UpdateSubUserPermission = (sub_user_id, params) => {
	const response = _post(`/subusers/sub_user_permission/${sub_user_id}/`, params);
	return response;
}

//////////////////////Template//////////////////////////////////
export const templateList = (params) => {
	const response = _get(`/sms/get_all_message_template_list?page_number=${params.page}&page_size=${params.page_size}&keyword=${params.keyword}`);
	return response;
};

export const createTemplate = (params) => {
	const response = _post(`/sms/create_template/`, params);
	return response;
}

export const editTemplate = (id, params) => {
	const response = _put(`/sms/update_template/${id}/update/`, params);
	return response;
}

export const deleteTemplate = (id, params) => {
	const response = _delete(`/sms/delete_template?template_id=${id}`, params);
	return response;
}


///////////////////////////////////////////////////////////////////////////////////////

// Tickets
export const fetchTicketListData = (params) => {
	const response = _post(`/ticket/tickets_list/`, params);
	return response;
}

export const fetchTicketDetailsData = (params) => {
	const response = _post(`/ticket/ticket_details/${params?.ticket_number}/`);
	return response;
}

export const addTicketReply = (ticket_number, params) => {
	const response = _put(`/ticket/ticket_update/${ticket_number}/update/`, params);
	return response;
}


export const fetchParentTickect = (api_input) => {
	return _get('ticket/get_ticket_parent_category/', api_input);
};

export const fetchParentCreateTickect = (parcategory, api_input) => {
	return _get(`/ticket/get_ticket_category/?parent_category=${parcategory}`, api_input);
};

export const fetchCreateTicket = (api_input) => {
	return _post(`ticket/create_ticket/`, api_input);
};





////////////// My Number ///////////////////////////////


export const fetchAllMynumbers = (params) => {
	const response = _get(`/my_numbers/get_number_list?page_number=${params?.page}&page_size=${params?.page_size}&keyword=${params?.keyword}`);
	return response;
}

export const fetchMyNumberList = (params) => {
	const response = _get(`/my_numbers/get_number_list?page_number=${params?.page}&page_size=${params?.page_size}&keyword=${params?.number}`);
	return response;
}

export const fetchNumberChatHistory = (params) => {
	const response = _get(`/my_numbers/get_message_history?page_number=${params?.page}&page_size=${params?.page_size}&selected_number=${params?.number}`);
	return response;
}

export const makePrimary = (params) => {
	const response = _put(`/my_numbers/make_as_number_primary/`, params);
	return response;
}

export const downloadingCsv = (params) => {
	const response = _get(`/my_numbers/download_message_history?selected_number=${params?.selected_number}`);
	return response;
}

export const AddMyNumbers = (params) => {
	const response = _post(`/my_numbers/create_my_number/`, params);
	return response;
}



export const exportToCsv = (data, filename) => {
	const csvContent = Object.keys(data[0]).join(",") + "\n" +
		data.map(row => Object.values(row).join(",")).join("\n");

	const blob = new Blob([csvContent], { type: 'text/csv' }); // for large amount of data 
	const url = URL.createObjectURL(blob);

	const link = document.createElement("a");
	link.setAttribute("href", url);
	link.setAttribute("download", filename + ".csv");
	document.body.appendChild(link);
	link.click();

	// Clean up
	URL.revokeObjectURL(url);
	document.body.removeChild(link);
};



////////////////// signup page /////////////////////////
// export const RegisterUser = (api_input) => {
// 	const response = _post('customer/register/', api_input);
// 	return response;
// }
export const RegisterUser = (api_input) => {
	const response = _post('workspace/register/', api_input);
	return response;
}
export const Verify_OTP = (api_input) => {
	const response = _post('workspace/verify_otp/', api_input);
	return response;
}

export const ReSendOTP = (api_input) => {
	const response = _post('customer/resend_otp/', api_input);
	return response;
}

////  contact Optout list ///////////
export const fetchOptoutLists = (params) => {
	const response = _get(`/ticket/opted_out_list?page_number=${params?.page}&page_size=${params?.page_size}&keyword=${params?.keyword}`);
	return response;
}


////////////// User Details ///////////////////////////////
export const fetchUserDetailsData = (id) => {
	const response = _get(`/my_numbers/get_customer_details/?customer_id=${id}`);
	return response;
}


export const fetchUserDetailsDatas = async () => {
	return await _get('/my_numbers/get_customer_details/');
};



///////////////////payment//////////////////////////////////

export const fetchAddfunds = (params) => {
	const response = _post(`/billing/recharge
`, params);
	return response;
}


export const fetchPaymentCardsData = () => {
	const response = _get(`/billing/get_cc_cards`,);
	return response;
};


// API call to add a card
export const fetchAddCardSubmit = (api_input) => {
	return _post(`/billing/create_customer_profile_card`, api_input);
};

// API call to add a bank account
export const fetchAddBankSubmit = (api_input) => {
	return _post(`/billing/create_customer_profile_bank`, api_input);
};

export const fetchCardUpdate = (api_input) => {
	return _post(`/billing/update_card_details`, api_input);
};

export const fetchBankUpdate = (api_input, token) => {
	return _post(`/billing/update_bank_details`, api_input, token);
};

export const fetchPaymentPrimary = (api_input) => {
	return _post(`/billing/update_primary_card_status`, api_input);
};

export const fetchUserInfoPayment = (api_input) => {
	return _get(`/billing/tariff_user_get`, { params: api_input });
};

///////////////////// balance history //////////////////////

export const fetchBalanceHistory = (api_input) => {
	return _post(`/payments/get_balance_history/`, api_input);
};

export const fetchDownloadHistory = (api_input) => {
	return _post(`payments/get_balance_history_download/`, api_input);
};

export const fetchCreditHistory = (api_input) => {
	return _post(`/payments/get_credit_history/`, api_input);
};


export const fetchDownloadCreditHistory = (api_input) => {
	return _post(`/payments/get_credit_history_download/`, api_input);
};

///////////////// All contacts//////////////////////////////////

export const CreateCoustomerContacts = (api_input) => {
	const response = _post(`contact/create_contacts/`, api_input)
	return response
}
export const fetchUsers = (params) => {
	const response = _get(`contact/contacts_list/?page_number=${params.page}&page_size=${params.page_size}&keyword=${params.keyword}`)
	return response
}
export const UpdateUser = (api_input) => {
	const response = _put(`contact/update_contact/${api_input.id}/`, api_input)
	return response
}

export const UploadBulk = (api_input) => {

	const response = _post("/contact/bulk_upload/", api_input)
	return response
}
export const DeleteUser = (api_input) => {
	const response = _post("/contact/delete/", api_input)
	return response
}

export const fetchGroups = (params) => {
	const response = _get(`/contact/customer_groups/?keyword=${params?.keyword}&page_number=${params?.page}&page_size=${params?.page_size}`)
	return response
}

export const deletelistGroup = (api_input) => {
	const response = _delete(`contact/customer_groups/delete/${api_input.id}/`)
	return response
}


export const UploadBulkGroup = (api_input) => {
	const response = _post(`contact/upload_bulk_groups/`, api_input)
	return response
}

///////////////// Payment settings //////////////////////////////////
export const updateGroup = (api_input) => {
	const response = _put(`/contact/customer_groups/update/${api_input.id}/`, api_input)
	return response
}

export const createGroupWhatsapp = (api_input) => {
	const response = _post("contact/create_customer_group/", api_input)
	return response
}

export const PaymentDetailsGet = (id) => {
	const response = _get(`payments/get_payment_settings_data/?customer_id=${id}`);
	return response;
}

export const PaymentSaveAuto = (api_input) => {

	const response = _post("payments/auto_payment_settings/", api_input)
	return response
}
export const saveLowBalanceSave = (api_input) => {

	const response = _post("payments/low_balance_notification_settings/", api_input)
	return response
}
///////////////////////////// Invoices ////////////////////////////////////////////////////////

export const GetInVoiceList = (api_input) => {
	const response = _post("payments/invoice_list/", api_input)
	return response
}

export const GetInvoiceData = (params) => {
	const response = _get(`payments/get_single_invoice_data?invoice_id=${params}`)
	return response
}


export const SendInvoiceData = (api_input) => {
	const response = _post("payments/send_invoice/", api_input)
	return response
}

///////////////////////////// whatsapp schedule broadcast//////////////////////////
export const fetchScheduleBroadcast = (params) => {
	const response = _get(`boardcasting/schedule_broadcast_get/?page_number=${params?.page_number}&page_size=${params?.page_size}`);
	return response;
}
export const deleteScheduleBroadcast = (params) => {
	const response = _delete(`boardcasting/schedule_broadcast_delete/${params?.id}/`)
	return response;
}
export const addScheduleBroadcast = (api_input) => {
	const response = _post(`boardcasting/schedule_broadcast/`, api_input)
	return response;
}
export const updateScheduleBroadcast = (api_input) => {
	const response = _put(`boardcasting/schedule_broadcast_update/${api_input.id}/`, api_input)
	return response;
}

export const fetchTicketCount = (api_input) => {
	return _post(`customer/get_dashboard_counts/`, api_input);
};
export const updateWhatsappSeenStatus = (api_input) => {
	const response = _put('whatsapp/update_message_seen_status_whatsapp/', api_input);
	return response;
}
///////////////// Menu sidebar //////////////////
export const fetchListSidebar = () => {
	return _get(`customer/get_main_menu_data/`);
};

export const fetchMenuItemsApi = () => {
	return _get(`customer/get_customer_menu_data/
`);
};



///////////////// payments ///////////////////////
export const fetchChoosePlan = async (planType) => {
	const response = await _get(`/billing/plans/?plan_type=${planType}`);
	return response.data; // Assuming the response has a data property with the plan array
};

export const fetchCreatePlan = async (api_input) => {
	const response = await _post(`/billing/create_plan/`, api_input);
	return response.data;
};

export const fetchActivePlan = async (params) => {
	const response = await _get(`/billing/workspace_balance/list/?workspace_id=${params.workspace_id}`);
	return response.data; // Assuming the response has a data property with the plan array
};

///////////////////////////////////// Order numbers //////////////////////////

export const getStateList = () => {
	return _get(`order_numbers/available_state_list/`);
}
export const getRateCenterList = (api_input) => {
	return _post(`order_numbers/ratecenter_list/`, api_input);
}
export const getLocalDidList = (api_input) => {
	return _post(`order_numbers/local_did_list/`, api_input);
}
export const orderDid = (api_input) => {
	return _post(`order_numbers/order_did/`, api_input);
}

/////////////////////////// Broadcast history ///////////////////////////////////////////
export const FetchBroadcastHistory = (api_input) => {
	const response = _get(`boardcasting/broadcast_history/counts/${api_input}`)
	return response
}

export const fetchDataListBroadcast = (api_input) => {
	const response = _get(`boardcasting/broadcast_history/list/${api_input}`)
	return response
}

export const fetchExportHistory = (api_input) => {
	const response = _post("/boardcasting/broadcast_history_export/", api_input)
	return response
}

export const singleDownload = async (api_input) => {
	const response = _post("/boardcasting/broadcast_history_single_download/", api_input)
	return response
}

// export const fetchCustomerMenu = async () => {
// 	const response = await _get(`/customer/get_customer_menu_data/`);
// 	return response.data; // Assuming the response has a data property with the plan array
// };

export const fetchCustomerMenu = async (menu_type, cust_id) => {
	const response = await _get(`/customer/get_customer_menu_data/?menu_type=${menu_type}&customer_id=${cust_id}`);
	return response.data;
};

export const DeliverStatus = (api_input) => {
	const response = _post("analytics/delivery_status/", api_input)
	return response
}
export const TotalChatList = (api_input) => {
	const response = _post("analytics/total_chat_list/", api_input)
	return response
}
export const TemplateDetails = (api_input) => {
	const response = _post("analytics/template_details/", api_input)
	return response
}
export const fetchImageTemplateFileUrl = () => {
	const response = _get("whatsapp/template_file_path/")
	return response
}



/////////////////////// Coomon country and state api ////////////////////////////////

export const fetchCountryList = () => {
	const response = _get(`customer/countries_list/`)
	return response
}
export const fetchStateList = (api_input) => {
	const response = _get(`customer/states_by_country_code/${api_input}/`)
	return response
}

///////////////////// Brands ///////////////////////////
export const fetchBrands = (api_input) => {
	const response = _post(`campaign_register/create_brand/`, api_input);
	return response
}

// Campaign Registry
export const fetchCampaignList = () => {
	const response = _get(`campaign_register/campaign_register_list/`);
	return response;
};
export const fetchCampignUsecases = () => {
	const response = _get("campaign_register/use_case/")
	return response
}

export const fetchCampaignSubcases = () => {
	const response = _get("campaign_register/sub_use_case/")
	return response
}

export const fetchVerifiedBrandsList = () => {
	const response = _get(`campaign_register/active_brand_list/`);
	return response;
};

export const createCampaign = (api_input) => {
	const response = _post(`campaign_register/campaign_register/`, api_input);
	return response
}
export const editCampaign = (id, api_input) => {
	const response = _put(`campaign_register/update_campaign_register/${id}/`, api_input);
	return response
}
export const deleteCampaign = (id) => {
	const response = _delete(`campaign_register/delete_campaign_register/${id}/`);
	return response
}
export const fetchCarrierDetailsforCampaignView = (id) => {
	const response = _get(`campaign_register/carrier_data_list/${id}/`);
	return response;
};
export const assignNumber = (api_input) => {
	const response = _post(`campaign_register/number_assign/`, api_input);
	return response;
};

// ///////////////////////////////////////////////////////////
export const listContact = (params) => {
	const response = _get(`/sms/get_all_contact_list/?keyword=${params.keyword}`);
	return response
}

// ////////////////////////////////////////////////////////////
export const FetchSettingData = () => {
	const response = _get(`/whatsapp/get_user_whatsapp_data/`);
	return response
}

export const UpdateSetting = (api_input) => {
	const response = _put(`/whatsapp/update_user_whatsapp_data/`, api_input);
	return response
}


///////////////////////whatsapp inbox apis ///////////////
export const fetchWAContactList = (params) => {
	const response = _get(`whatsapp/get_whatsapp_contact_list/?select_key=${params.select_key}&page_number=${params.page_number}&page_size=${params.page_size}&keyword=${params.keyword}`);
	return response
}
export const fetchWhatsappUserChatHistory = (params) => {
	const response = _get(`whatsapp/get_whatsapp_message_history/?user_number=${params?.user_number}&page_number=${params?.page}&page_size=${params?.page_size}`);
	return response;
}
export const sendWhatsappMessage = (api_input) => {
	const response = _post('whatsapp/send_whatsapp_message/', api_input);
	return response;
}
export const sendWhatsappLocation = (api_input) => {
	const response = _post('whatsapp/send_whatsapp_message_location/', api_input);
	return response;
}
export const sendWhatsappContacts = (api_input) => {
	const response = _post('whatsapp/send_whatsapp_message_contact/', api_input);
	return response;
}
export const sendWhatsappVideoandAudio = (api_input) => {
	const response = _post('whatsapp/send_whatsapp_audio_video_message/', api_input);
	return response;
}
export const forwardWhatsappMessage = (api_input) => {
	const response = _post('whatsapp/forward_message/', api_input);
	return response;
}
export const reactToWhatsappMessage = (api_input) => {
	const response = _post('whatsapp/send_reaction_message/', api_input);
	return response;
}

/////////////////////// whatsapp chatbot ////////////////////////////////////////////
export const fetchWhatsappChatbotList = (params) => {
	const response = _get(`chatbot/get_chat_bot_list?page_number=${params?.page}&page_size=${params?.page_size}&keyword=${params?.keyword}`);
	return response;
}
export const createWAChatbot = (api_input) => {
	const response = _post('chatbot/create_chat_bot/', api_input);
	return response;
}
export const updateWAChatbot = (api_input, id) => {
	const response = _put(`chatbot/update_chatbot/${id}/`, api_input);
	return response;
}
export const fetchSingleChatbotDetails = (params) => {
	const response = _get(`chatbot/get_chatbot_details/?chat_bot_id=${params.chat_bot_id}`);
	return response;
}
//////////////////////////////////////////////////////////
export const fetchTempData = () => {
	const response = _get(`/whatsapp/get_template_approved_list/`);
	return response
}
export const fetchTempList = () => {
	const response = _get(`/whatsapp/get_template_list/`);
	return response
}
export const fetchListChatbot = () => {
	const response = _get(`/whatsapp/get_chat_bot_list/`);
	return response
}

export const CreateTempBroadCast = (api_input) => {
	const response = _post(`/whatsapp/create_template/`, api_input);
	return response
}

export const DeleteWhatsAppTemp = (params) => {
	const response = _get(`/whatsapp/delete_template/?template_name=${params}`);
	return response
}

export const SendWhatsAppTemp = (api_input) => {
	const response = _post(`/whatsapp/send_template/`, api_input);
	return response
}

export const getTemplateGroup = () => {
	const response = _get('contact/template_groups_list/');
	return response
}

export const BulkSendTemp = (api_input) => {
	const response = _post('/whatsapp/bulk_send_template/', api_input);
	return response
}

////////////////////////////////// Automation ////////////////////////////////////////////////////
export const GetAutomationList = () => {
	const response = _get('chatbot/automation_details/')
	return response
}
export const GetChatBotList = () => {
	const response = _get('chatbot/chatbot_list/')
	return response
}
export const updateChatbotAutomation = (api_input) => {
	const response = _post('chatbot/update_automations/', api_input)
	return response
}

///////////////// instagram /////////////////////////////

export const SubUserList = (id) => {
	const response = _get(`/instagram/get_account_details/?customer_id=${id}`);
	return response;
};


// export const MediaListData = (params, id) => {
// 	const response = _get(`/instagram/media_list/?post_type=${params?.post_type}&page=${params?.page}&page_size=${params?.page_size}&title=${params?.title}&customer_id=${id}`);
// 	return response;
// }
export const MediaListData = (params, id) => {
	const response = _get(`/instagram/media_list/?post_type=${params?.post_type}&customer_id=${id}`);
	return response;
}

////////////////// instagram settings /////////////////////
// export const UpdateInstagramSetting = (api_input, id) => {
// 	const response = _put(`instagram/update_settings/?customer_id=${id}`, api_input);
// 	return response
// }


// export const FetchInstagramSettingData = (id) => {
// 	const response = _get(`/instagram/instagram_business_details/?customer_id=${id}`);
// 	return response;
// };


// export const commonComposeAPI = (params, api_input) => {
// 	const response = _post(`instagram/upload_instagram_image/?access_token=${params.access_token}&business_id=${params.business_id}`, api_input)
// 	return response
// }

export const commonComposeAPI = (api_input) => {
	const response = _post(`facebook/social_media_post/`, api_input)
	return response
}

// export const commonVideoAPI = (params, api_input) => {
// 	const response = _post(`/instagram/upload_reel/?access_token=${params.access_token}&business_id=${params.business_id}`, api_input)
// 	return response
// }

export const getInstaComments = (params) => {
	const response = _get(`instagram/get_comments/${params.image_Id}/`)
	return response

}
export const deleteInstaComment = (params) => {
	const response = _delete(`instagram/comments/delete/${params.comment_id}/`)
	return response

}

export const postInstaComment = (params, api_input) => {
	const response = _post(`instagram/post_comment/${params.reply_id}/`, api_input)
	return response
}
export const postInstaReply = (params, api_input) => {
	const response = _post(`instagram/reply_comment/${params.reply_id}/`, api_input)
	return response
}

// export const commonStoryAPI = (params, api_input) => {
// 	const response = _post(`/instagram/upload_instagram_story/?access_token=${params.access_token}&business_id=${params.business_id}`, api_input)
// 	return response
// }
export const getMediaGallery = (params) => {
	const queryParams = new URLSearchParams(params)?.toString();
	const response = _get(`/instagram/gallery/list/?${queryParams}`);
	return response;
};

export const mediaGallery = (api_input) => {
	const response = _post(`/instagram/common_gallery/`, api_input);
	return response
}

export const subUserData = () => {
	const response = _get(`/instagram/sub_users/`);
	return response
}

export const ListViewData = (params) => {
	const response = _post(`/instagram/list_view/`, params);
	return response;
};

export const MediaListComments = (image_id, params) => {
	const response = _get(`/instagram/comments_list/?image_id=${image_id}&page=${params?.page_number}&page_size=${params?.page_size}`);
	return response;
};

/////////////// facebook api's///////////////////////////

export const FacebookProfile = (customer_id) => {
	const response = _get(`/facebook/profile_picture/?customer_id=${customer_id}`);
	return response;
};


export const fetchTemplateData = async (templateName) => {
	const response = await _get(`/whatsapp/get_template_list/?name=${templateName}`);
	return response;
};

export const createtemplate = async (api_input) => {
	const response = await _post(`whatsapp/single_send_template/`, api_input);
	return response;
}

// export const commonTextAPI = (api_input) => {
// 	const response = _post(`/facebook/text_post/`, api_input)
// 	return response
// }

// export const facebookPostApi = (api_input) => {
// 	const response = _post(`/facebook/image_post/`, api_input)
// 	return response
// }

export const facebookStoryApi = (api_input) => {
	const response = _post(`/facebook/image_post/`, api_input)
	return response
}
export const facebookReelApi = (api_input) => {
	const response = _post(`/facebook/video_post/`, api_input)
	return response
}

export const FacebookProfileListing = (params, id) => {
	const response = _get(`/facebook/facebook_list/?page_number=${params?.page_number}&page_size=${params?.page_size}`);
	return response;
};


export const FaceBookDelete = (id) => {
	const response = _delete(`facebook/delete_post/${id}/`); // Use id directly
	return response;
};

export const FaceBookEditPost = (api_input) => {
	const response = _post(`/facebook/update_text_post/`, api_input)
	return response
}

//////////////// youtube ////////////////////
// export const commonYoutubeApi = (api_input) => {
// 	const response = _post(`/youtube/upload_video/`, api_input)
// 	return response
// }

export const YoutubeList = async (api_input) => {
	const { page_number, page_size, post_type } = api_input;
	const response = await _get(`/youtube/list_view/?page_number=${page_number}&page_size=${page_size}&post_type=${post_type}`);
	return response;
};

export const YoutubeSearch = (api_input) => {
	const { query, type = 'video', maxResults = 10 } = api_input;
	const response = _get(`/youtube/search/?part=snippet&q=${query}&type=${type}&maxResults=${maxResults}`);
	return response;
};

export const YoutubeEdit = (api_input) => {
	const response = _post(`/youtube/video_edit/`, api_input);
	return response;
};

export const YoutubeDelete = (videoId) => {
	const response = _delete(`/youtube/video/delete/${videoId}/`);
	return response;
};

export const YoutubeComment = (api_input) => {
	const response = _post(`/youtube/video_comment/`, api_input);
	return response;
};

export const YoutubeReply = (api_input) => {
	const response = _post(`/youtube/reply_comment/`, api_input);
	return response;
};

export const YoutubeCommentsListView = (api_input) => {
	const { post_id, page_number, page_size } = api_input;
	const response = _get(`/youtube/comments_listview/?post_id=${post_id}&page_number=${page_number}&page_size=${page_size}`);
	return response;
};

export const FaceBookListComment = (post_id, params) => {
	const response = _get(`/facebook/comment_list/?post_id=${post_id}&page=${params?.page_number}&page_size=${params?.page_size}`);
	return response;
};


export const FaceBookComments = (api_input) => {
	const response = _post(`facebook/comments/`, api_input)
	return response
}

export const FaceBookCommentDelete = (id) => {
	const response = _delete(`/facebook/comment_delete/${id}/`); // Use id directly
	return response;
};

export const postFacebookReply = (api_input) => {
	const response = _post(`facebook/reply_comments/`, api_input)
	return response
}

export const YoutubeCommentDelete = (params) => {
	const response = _delete(`/youtube/delete_comment/${params.comment_id}/`,);
	return response;
};

export const FaceBookPostLike = (post_id) => {
	const response = _get(`/facebook/post/likes/${post_id}`);
	return response;
};

export const YoutubePlayListEdit = (api_input) => {
	const response = _post(`/youtube/edit_playlist/`, api_input);
	return response;
};

export const YoutubePlaylistDelete = async (api_input) => {
	const response = await _post(`youtube/delete_playlist/`, api_input);
	return response;
};

export const YoutubeProfile = (api_input) => {
	return _get(`/youtube/youtube_profile/`, api_input);
};

export const YouTubePlayListCreate = (api_input) => {
	const response = _post(`/youtube/create_playlist/`, api_input)
	return response
}

export const YouTubePlayLists = async (api_input) => {
	const { playlist_id, page_number, page_size } = api_input;
	const response = await _get(`/youtube/get_playlist_video_list/?playlist_id=${playlist_id}&page_number=${page_number}&page_size=${page_size}`);
	return response;
};

export const youtubePlayList = () => {
	const response = _get(`/youtube/playlists_listview/`);
	return response;
};

export const YoutubeAddToPlaylist = (api_input) => {
	const response = _post(`/youtube/add_video_to_playlist/`, api_input);
	return response;
};

export const fetchOptOutData = (api_input) => {
	const response = _post(`/ticket/opt_out_marketing/`, api_input);
	return response;
};

export const forgetPassword = (api_input) => {
	const response = _post('/subusers/forgot_password/', api_input);
	return response;
};

export const fecthYouTubeSetting = () => {
	const response = _get(`youtube/settings_list/`);
	return response;
};

export const YouTubeSettings = (api_input) => {
	const response = _put(`youtube/update_settings/`, api_input);
	return response
}

export const ListViewDataCalender = (params) => {
	const response = _post(`/instagram/calendar_list/`, params);
	return response;
};

export const YoutubeReplyCommentDelete = async (reply_id) => {
	const response = await _delete(`/youtube/delete_reply_comment/${reply_id}/`);
	return response;
};

export const InstagramReplyCommentDelete = async (reply_id) => {
	const response = await _delete(`/instagram/reply_comments/delete/${reply_id}/`);
	return response;
};


/////////////// Pinterest APIs //////////////////
export const PinterestList = (api_input) => {
	const response = _post('/pinterest/list_view/', api_input);
	return response;
};

export const PinterestBoardCreate = (api_input) => {
	const response = _post('/pinterest/board/create/', api_input);
	return response;
};

export const PinterestBoardEdit = (id, api_input) => {
	const response = _put(`/pinterest/board/update/${id}/`, api_input);
	return response;
};

export const PinterestBoardDelete = (id) => {
	const response = _delete(`/pinterest/board/delete/${id}/`);
	return response;
};
// Get Pinterest profile data
export const PinterestGetProfile = () => {
	const response = _get('/pinterest/account_detail/');
	return response;
};


// Like Pinterest pin/video
export const PinterestPostLike = (post_id) => {
	const response = _post(`/pinterest/post/like/${post_id}/`);
	return response;
};

// Comment on Pinterest pin/video
export const PinterestPostComment = (post_id, api_input) => {
	const response = _post(`/pinterest/post/comment/${post_id}/`, api_input);
	return response;
};

// Share Pinterest pin/video
export const PinterestPostShare = (post_id) => {
	const response = _post(`/pinterest/post/share/${post_id}/`);
	return response;
};

export const mediaGalleryDelete = (ids) => {
	const response = _post('/instagram/delete_gallery/', { gallery_id: ids });
	return response;
}

////////////// pinterest /////////////////

export const updatePinterestSetting = (api_input) => {
	const response = _put(`pinterest/update_pinterest_details/`, api_input);
	return response
}


export const PinterestListing = async (api_input) => {
	const { page_number, page_size, post_type } = api_input;
	const response = await _get(`pinterest/list/?post_type=${post_type}&page=${page_number}&page_size=${page_size}`);
	return response;
};

// Role based on user Permissions
export const userPermissions = (api_input) => {
	const response = _post('subusers/permissions/', api_input);
	return response;
}

// // Role based permissions APIs
// export const createRolePermissions = (api_input) => {
// 	const response = _post('subusers/create_permissions/', api_input);
// 	return response;
// }

export const createRolePermissions = (api_input) => {
	const response = _post('customer/sub_user_workspace_permission/', api_input);
	return response;
}

export const updatePinterest = (data) => {
	return _put(`/pinterest/update_board/${data.board_id}/`, {
		name: data.name,
		description: data.description,
		status: data.status ? 'PUBLIC' : 'PRIVATE'
	});
};

export const PinterestDelete = (board_id) => {
	return _delete(`/pinterest/delete_board/${board_id}/`);
};

// Create Pinterset

export const createPinterestBoard = (data) => {
	return _post(`/pinterest/create_board/`, {
		name: data.name,
		description: data.description,
		privacy: 'PUBLIC'
	});
};



// Board section get API

export const PinterestBoardSectionList = (id) => {
	const response = _get(`pinterest/board_section_list/?board_id=${id}`);
	return response;
};

// Create board section
export const createBoardSection = (api_input) => {
	const response = _post(`/pinterest/create_board_section/${api_input.board_id}/`, {
		name: api_input.name,
		description: api_input.description
	});
	return response;
};

// Update board section
export const updateBoardSection = (section_board_id, api_input) => {
	const response = _patch(`/pinterest/update_board_section/${section_board_id}/`, {
		name: api_input.name,
		//   description: api_input.description
	});
	return response;
};

// Delete board section
export const deleteBoardSection = (section_board_id) => {
	const response = _delete(`/pinterest/delete_board_section/${section_board_id}/`);
	return response;
};


////////////////////////////// campaign /////////////////////////////

export const fetchBrandsListing = () => {
	const response = _get('/campaign_register/brand_list/');
	return response;
};

export const fetchEntitiesList = () => {
	const response = _get('/campaign_register/enity_list');
	return response;
};

export const fetchBrandRelationshipList = () => {
	const response = _get('/campaign_register/brand_relation_list/');
	return response;
};

export const fetchVerticalList = () => {
	const response = _get('/campaign_register/vertice_list/');
	return response;
};

export const fetchBrandEdit = (brand_id, api_input) => {
	const response = _put(`/campaign_register/update_brand/${brand_id}/`, api_input);
	return response;
};


export const fetchDeleteData = (brand_id) => {
	const response = _delete(`/campaign_register/delete_brand/${brand_id}/`);
	return response;
};

export const fetchPermissionMenuWithWorkspaceId = (id) => {
	const response = _get('customer/get_customer_workspace_menu_data/?customer_id=' + id);
	return response;
}



export const PintrestUserProfile = (user_id) => {
	const response = _get(`/pinterest/account_detail/`);
	return response;
}

export const PintrestMediaList = (params) => {
	const response = _get(`/pinterest/list/?post_type=${params?.post_type}&page=${params?.page}&page_size=${params?.page_size}&title=${params?.title}`)
	return response;
}

export const pintrestBoardCreate = (api_input) => {
	const response = _post(`/pinterest/create_board/`, api_input)
	return response;
}

export const pintrestBoardEdit = (id, api_input) => {
	const response = _put(`/pinterest/update_board/${id}/`, api_input)
	return response;
}

export const pintrestBoardDelete = (id) => {
	const response = _delete(`/pinterest/delete_board/${id}/`)
	return response;
}

export const pintrestBoardDetails = (id) => {
	const response = _get(`/pinterest/board_section_list/?board_id=${id}`)
	return response;
}

export const fetchPins = (params) => {
	const response = _get(`/pinterest/list_pins/?board_section_id=${params.board_section_id}&page=${params.page}&per_page=${params.page_size}`)
	return response;
}

export const pintrestBoardSection = (id, apiData) => {
	const response = _post(`/pinterest/create_board_section/${id}/`, apiData)
	return response;
}

export const pinstrestSectionDetails = (apiData) => {
	const response = _post(`/pinterest/pin_board_section/`, apiData)
	return response;
}

export const fetchPinterestSettingData = () => {
	const response = _get(`/pinterest/settings_list/`);
	return response;
};

export const LinkedInPosts = (params) => {
	const response = _get(`/linkedin/list/?page=${params?.page}&page_size=${params?.page_size}&title=${params?.title || ''}`);
	return response;
}

// Updated LinkedIn profile function
export const LinkedInProfile = () => {
	// Gets the LinkedIn profile information
	const response = _get('/linkedin/profile/');
	return response;
}

export const LinkedInProfileApi = () => {
	// Gets detailed LinkedIn profile data
	const response = _get('/linkedin/linkedin_profile/');
	return response;
}

// LinkedIn edit function - Using description parameter as required by API
export const LinkedInEditPost = (api_input) => {
	let postId = api_input.post_id || '';
	const response = _post(`/linkedin/post/update/${api_input.post_id}/`, api_input);
	return response;
}

// LinkedIn delete function
export const LinkedInDeletePost = (post_id) => {
	const response = _delete(`/linkedin/post/delete/${post_id}/`);
	return response;
}

// LinkedIn add comment function
export const LinkedInAddComment = (api_input) => {
	const response = _post('/linkedin/add_comment/', api_input);
	return response;
}

// LinkedIn comment function - Example response: { "message": "goodddd", "share_urn": "urn:li:share:7303001542310141952" }
export const linkedinComment = (api_input) => {
	// api_input should contain comment text and post_id
	const response = _post(`linkedin/comments/`, api_input);
	return response;
};

// export const workspacebillinglistingAccountBalance = (api_input) => {
// 	const response = _get('/billing/workspace_balance/list/');
// 	return response;
// }

export const workspacebillinglistingAccountBalance = (api_input) => {
	const response = _get('/billing/workspace_balance/list/');
	return response;
}

export const workspacebillinglistingAccountBalances = (workspace_id) => {
	return _get(`billing/workspace_balance/list/?workspace_id=${workspace_id}`);
};

export const sendEmailbase64 = (api_input) => {
	const response = _post('/payments/send_invoice/', api_input);
	return response;
}

export const fetchLinkedInSetting = () => {
	const response = _get(`/linkedin/settings_list/`);
	return response;
};

export const updateLinkedInSettings = (api_input) => {
	const response = _put(`/linkedin/update_settings/`, api_input);
	return response;
}

export const fetchPintrestPlaylist = () => {
	const response = _get(`/pinterest/board_list/`)
	return response
}

export const fetchRecipents = (filterType, image_Id) => {
	const response = _get(`/boardcasting/broadcast_history/receipients_list?keyword=${filterType}&template_name=${image_Id}`)
	return response
}

export const downloadRecipents = (filterType, image_Id) => {
	const response = _get(`/boardcasting/broadcast_history_receipient_download?keyword=${filterType}&template_name=${image_Id}`)
	return response
}

// LinkedIn comments list function
export const LinkedInCommentsList = (api_input) => {
	// Handle both cases: direct post_id value or object with post_id property
	const post_id = typeof api_input === 'object' ? (api_input?.post_id || '') : api_input;
	console.log("Fetching comments for post ID:", post_id); // Add logging to verify correct post_id
	const response = _get(`/linkedin/comments_list/?post_id=${post_id}`);
	return response;
};

export const fetchCommentReply = (api_input) => {
	const { comment_id = '' } = api_input || {};
	// Corrected URL endpoint: changed from '/linkedin/comments_replay/' to '/linkedin/comments_reply/{comment_id}'
	const response = _get(`/linkedin/comments_reply/${comment_id}`);
	return response;
};

export const UpdateInstagramSetting = (api_input, id) => {
	const response = _put(`instagram/update_settings/?customer_id=${id || ''}`, api_input);
	return response
}


export const FetchInstagramSettingData = (id) => {
	const response = _get(`/instagram/instagram_business_details/?customer_id=${id || ''}`);
	return response;
};

export const updateFacebookSetting = (api_input, id) => {
	const response = _put(`facebook/update_settings/?customer_id=${id || ''}`, api_input);
	return response
}


export const fetchFacebookSettingData = (id) => {
	const response = _get(`facebook/settings_list/?customer_id=${id || ''}`);
	return response;
};

export const composeChannelListing = () => {
	const response = _get('/instagram/compose_channel_list/');
	return response;
}

export const composePostingAction = () => {
	const response = _get('/instagram/compose_approval_list/');
	return response;
};
//  Pinterset API's

export const fetchPintrestFollowers = (pageNo, limit) => {
	const response = _get(`/pinterest/follower/?page=${pageNo}&page_size=${limit}`)
	return response;
}

export const fetchPintrestFollowing = (pageNo, limit) => {
	const response = _get(`pinterest/following/?page=${pageNo}&page_size=${limit}`)
	return response;
}

export const pintrestEditSection = (boardId, apiData) => {
	const response = _patch(`pinterest/update_board_section/${boardId}/`, apiData)
	return response;
}

export const pintrestDeleteSection = (boardId) => {
	const response = _delete(`pinterest/delete_board_section/${boardId}/`)
	return response;
}

export const boardpinslisting = (boardId) => {
	const response = _get(`pinterest/board_pin_list/${boardId}/`);
	return response;
}

export const fetchExpiringPlansList = () => {
	const response = _get(`/billing/plan_expire/`);
	return response;
};
export const workspaceDetails = (workspaceId) => {
	const response = _get(`/billing/plan_expire/${workspaceId}`);
	return response;
};

export const billingMonthlyInvoice = (api_input) => {
	const response = _post('/billing/monthly_invoice/', api_input);
	return response;
}

export const sendInvoiceBilling = (api_input) => {
	const response = _post('/payments/send_monthly_invoice/', api_input)
	return response
}
export const sendBulkSMSOrMMS = (api_input) => {
	const response = _post('/sms/bulk_send_sms_mms/', api_input);
	return response;
}
export const selectViewHeader = () => {
	const response = _get('/instagram/compose_allow_view_list/');
	return response;
}

export const aiGeneratedContent = (api_input) => {
	const response = _post(`/workspace/ai_generate_text/`, api_input);
	return response
}

export const GenerateApi = (id) => {
	const response = _get(`/sms/generate_api_secret/${id}`);
	return response;
};

export const fetchProfileData = async () => {
	return await _get('/customer/user_profile/');
};

export const fetchProfileUpdate = (api_input) => {
	const response = _post(`/customer/update_user_profile/`, api_input);
	return response
}

/////////////23,24///////////////////////


export const fetchSubUserPaymentPermission = (params) => {
	const response = _get(`customer/sub_user_panel_permission_list/?sub_user_id=${params?.sub_user_id}`);
	return response;
}
export const createPaymentPermissions = (api_input) => {
	const response = _post('customer/sub_user_panel_permission_update/', api_input);
	return response;
}

export const fetchPaymentData = () => {
	const response = _get(`/customer/panel_menu_list/`);
	return response;
}

export const fetchPaymentPermissionsData = () => {
	const response = _get(`/customer/payment_permission/`);
	return response;
}

export const fetchWorkSpaceList = (params) => {
	const response = _get(`/workspace/workspace_list?page_number=${params.page}&page_size=${params.page_size}&status=${params.status}`);
	return response;
};


export const currentIpAddress = async () => {
	const response = await _get(`/customer/current_ip_address/`);
	return response;
};


export const ipAddressList = async () => {
	const response = await _get(`/customer/ip_address_list/`);
	return response;
};



export const addIpAddress = async (data) => {
	const response = await _post(`/customer/ip_address/create/`, data);
	return response;
};

export const updateIpAddress = async (id, data) => {
	const response = await _put(`/customer/ip_address/${id}/`, data);
	return response;
};

export const deleteIpAddress = async (id) => {
	const response = await _delete(`/customer/ip_address/${id}/`);
	return response;
};