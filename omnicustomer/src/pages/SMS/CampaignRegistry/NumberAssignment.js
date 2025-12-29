import React, { useEffect, useState } from 'react'
import { Modal, Table } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form';
import { assignNumber, fetchCampaignList, fetchCompanyContactList, workspaceDetails } from '../../../utils/ApiClient';
import { triggerAlert } from '../../../utils/CommonFunctions';
import Loader from '../../../common/components/Loader';

export default function NumberAssignment() {
    ///////////////////////// Basic form /////////////////////////////////////////
    const { register, handleSubmit, formState: { errors }, setValue, reset, control, clearErrors, getValues, setError, watch, trigger } = useForm();

    const [show, setShow] = useState(false);
    const [companyContactList, setCompanyContactList] = useState([]);
    const [campaign, setCampaign] = useState([]); // Add this state for number list
     const [hideButton, setHideButton] = useState(true)
            const [messageError, setMessageError] = useState("")
    const [buttonLoading, setButtonLoading] = useState(true)
    
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
    
    const handleClose = () => {
        setShow(false);

        reset();
    };

    const handleShow = () => {
        setShow(true);
    };

    const handleNumberSelect = async (e) => {
        //console.log("selectedOption", e.target.value)

        const number = e.target.value;
        setValue('tn', number);

    };
    const handleCampaignSelect = async (e) => {
        //console.log("selectedOption", e.target.value)

        const campaignId = e.target.value;
        setValue('campaignId', campaignId);

    };
    const fetchCompanyContacts = async () => {
        try {
            const response = await fetchCompanyContactList();
            const response_data = response.data;

            if (response_data.error_code === 200) {
                const items = response_data.results;

                setCompanyContactList(items);

                // triggerAlert('success', 'success', 'Recharged Successfully!!');
            } else {
                // triggerAlert('error', 'Oops...', 'Recharge was unsuccessful');
            }
        } catch (error) {
            const response_data = error?.response?.data

            triggerAlert('error', 'Oops...', response_data ? response_data.message : "Something went wrong!");
        }
    }

    const fetchCampaign = async () => {
        // setIsLoading(true);

        try {
            const response = await fetchCampaignList();
            const response_data = response.data;
            if (response_data.error_code === 200) {
                const data = response_data.results;
                // setIsLoading(false);
                setCampaign(data);
            } else {
                setCampaign([]);
            }
        } catch (error) {
            console.error("Error fetching media data:", error);
            const error_msg = error?.response?.data
            triggerAlert('error', '', error_msg?.message || "Something went wrong...")
            setCampaign([]);
            // setIsLoading(false);
        } finally {
            // setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchCompanyContacts();
        fetchCampaign();
    }, [])

    const onSubmit = async (data) => {
        // console.log(data);
        try {
            data.displayName = "channel";
            const response = await assignNumber(data);
            if (response.data.error_code === 200) {
                triggerAlert('success', 'success', 'Number assigned successfully');
                // setCompanyContactList([...companyContactList, data]);
            } else {
                triggerAlert('error', 'Oops...', 'Number assignment was unsuccessful');
            }
        }
        catch (error) {
            console.error(error)
            const response_data = error?.response?.data
            triggerAlert('error', 'Oops...', response_data ? response_data.message : "Something went wrong!");
        } finally {
            handleClose();
        }
    }
    return (
        <div class="row mb-5">
            <div class="col-sm-12">
                <div class=" ">
                    <div class="row  ">
                        <div class="d-flex align-items-center justify-content-between flex-wrap mb-2 px-4 ">
                            <h5 class="  text-primary"> </h5>
                            {buttonLoading ? (
                                <div className="d-flex align-items-center mb-3">
                                    <h4 className="mb-0 me-3"> </h4>
                                    <div className="spinner-border spinner-border-sm" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : hideButton ? (
                                <div class="btn-group mt-2">
                                    <button type="button" class="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                        Action
                                    </button>
                                    <ul class="dropdown-menu">
                                        <li onClick={handleShow}><a class="dropdown-item" href="#/"  >Assign</a></li>
                                        {/* <li><a class="dropdown-item" href="#/">UnAssign</a></li> */}
                                    </ul>
                                </div>
                            ) : (
                                <div className="text-danger mt-2">
                                    {messageError}
                                </div>
                            )}
                        </div>
                    </div>
                    <div class="card-body pt-2">
                        <div class="table-responsive">
                            {/* <table id="example3" class="table table-striped table-bordered hover align-middle" cellspacing="0" width="100%">
                                <thead class="text-nowrap table-light">
                                    <tr>
                                        <th>Select DID's</th>
                                        <th>Campaign</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <div class="form-check  d-block ">
                                                <input type="checkbox" class="form-check-input" id="customChec11" />
                                                <label class="form-check-label" for="customChec11">736-9532-688</label>
                                            </div>
                                        </td>
                                        <td>CAMP52W1</td>
                                        <td><span class="badge   bg-soft-danger w-25">Not Assigned</span></td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div class="form-check  d-block ">
                                                <input type="checkbox" class="form-check-input" id="customChec11" />
                                                <label class="form-check-label" for="customChec11">736-9532-688</label>
                                            </div>
                                        </td>
                                        <td>CAMP52W1</td>
                                        <td><span class="badge   bg-soft-success w-25">  Assigned</span></td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div class="form-check  d-block">
                                                <input type="checkbox" class="form-check-input" id="customChec11" />
                                                <label class="form-check-label" for="customChec11">736-9532-688</label>
                                            </div>
                                        </td>
                                        <td>CAMP52W1</td>
                                        <td><span class="badge   bg-soft-danger w-25">Not Assigned</span></td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div class="form-check  d-block ">
                                                <input type="checkbox" class="form-check-input" id="customChec11" />
                                                <label class="form-check-label" for="customChec11">736-9532-688</label>
                                            </div>
                                        </td>
                                        <td>CAMP52W1</td>
                                        <td><span class="badge   bg-soft-success w-25">  Assigned</span></td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div class="form-check  d-block">
                                                <input type="checkbox" class="form-check-input" id="customChec11" />
                                                <label class="form-check-label" for="customChec11">736-9532-688</label>
                                            </div>
                                        </td>
                                        <td>CAMP52W1</td>
                                        <td><span class="badge   bg-soft-danger w-25">Not Assigned</span></td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div class="form-check  d-block">
                                                <input type="checkbox" class="form-check-input" id="customChec11" />
                                                <label class="form-check-label" for="customChec11">736-9532-688</label>
                                            </div>
                                        </td>
                                        <td>CAMP52W1</td>
                                        <td><span class="badge   bg-soft-success w-25">  Assigned</span></td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div class="form-check  d-block">
                                                <input type="checkbox" class="form-check-input" id="customChec11" />
                                                <label class="form-check-label" for="customChec11">736-9532-688</label>
                                            </div>
                                        </td>
                                        <td>CAMP52W1</td>
                                        <td><span class="badge   bg-soft-danger w-25">Not Assigned</span></td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div class="form-check  d-block">
                                                <input type="checkbox" class="form-check-input" id="customChec11" />
                                                <label class="form-check-label" for="customChec11">736-9532-688</label>
                                            </div>
                                        </td>
                                        <td>CAMP52W1</td>
                                        <td><span class="badge   bg-soft-success w-25">  Assigned</span></td>
                                    </tr>
                                </tbody>
                            </table> */}
                            <Table id="example2" className="table table-bordered hover align-middle" cellspacing="0" width="100%">
                                <thead className="text-nowrap" style={{ backgroundColor: '#ededed' }}>
                                    <tr>
                                        <th>Select DID's</th>
                                        <th>Campaign</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {/* {campaign?.length === 0 ? ( */}
                                    <tr>
                                        <td colSpan="5" className="text-center">No data found</td>
                                    </tr>
                                    {/* ) :
                                        campaign?.map((campaign, index) => (
                                            <tr>
                                                <td>{campaign.campaign_id ? campaign.campaign_id : '-'}</td>
                                                <td>{campaign.brand_id ? campaign.brand_id : '-'}</td>
                                                <td className="text-nowrap">{campaign.campaign_name ? campaign.campaign_name : '-'}</td>
                                                <td>{campaign.user_case ? campaign.user_case : '-'}</td>
                                                <td>{campaign.registered_on ? formatDateTime(campaign.registered_on, 'yyyy-mm-dd, hh:mm:ss') : '-'}</td>
                                                <td><span className={`badge font-size-14 ${campaign.status ? campaign.status == 1 ? 'bg-success' : 'bg-danger' : ''} border-radius rounded-pill`}>{campaign.status ? campaign.status == 1 ? 'Active' : 'Inactive' : '-'}</span> </td>
                                                <td>
                                                    <a className=" " href="#/" onClick={() => handleCampaignView(campaign)}><span className="material-symbols-outlined me-2 md-18">visibility</span> </a>
                                                    <a className=" " href="#/" onClick={() => handleCampaignEdit(campaign)}><span className="material-symbols-outlined me-2 md-18"> edit_square </span> </a>
                                                    <a className=" " href="#/" onClick={() => handleCampaignDelete(campaign.campaign_id)}><span className="material-symbols-outlined me-2 md-18"> Delete </span> </a>
                                                </td>
                                            </tr>
                                        ))} */}
                                </tbody>
                            </Table>
                        </div>
                    </div>
                </div>
                <Modal show={show} onHide={handleClose} size="lg" centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Number Assignment</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form class=" " onSubmit={handleSubmit(onSubmit)}>
                            <div class="card-body py-5">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label class="form-label">Selected DID</label>
                                            {/* <label class="form-label">Selected DID's</label> */}
                                            {/* <select class="form-select" data-trigger="" name="choices-single-default" id="choices-single-default">
                                                <option value="">Select DID's</option>
                                                <option value="Choice 1">732-456-1235</option>
                                                <option value="Choice 2">732-456-1235</option>
                                                <option value="Choice 3">732-456-1235</option>
                                            </select> */}
                                            <Controller
                                                name="tn"
                                                {...register('tn',
                                                    { required: 'Contact Number is required' }
                                                )}
                                                control={control}
                                                render={({ field }) => (
                                                    <select
                                                        class="form-select"
                                                        name="tn"
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
                                            {errors.tn && (
                                                <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                    {errors.tn.message}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label class="form-label">Select a Campaign (Which is Approved)</label>
                                            {/* <select class="form-select" data-trigger="" name="choices-single-default" id="choices-single-default">
                                                <option value="">Select Campaign</option>
                                                <option value="Choice 1">ABC458795</option>
                                                <option value="Choice 2">CAMP52W1</option>
                                                <option value="Choice 3">CAMP52W1  </option>
                                            </select> */}
                                            <Controller
                                                name="campaignId"
                                                {...register('campaignId',
                                                    { required: 'Campaign is required' }
                                                )}
                                                control={control}
                                                render={({ field }) => (
                                                    <select
                                                        class="form-select"
                                                        name="campaignId"
                                                        aria-label="Default select example"
                                                        onChange={handleCampaignSelect}
                                                        value={field.value}
                                                    >
                                                        <option value="" hidden>Select Campaign</option>
                                                        {campaign.map((item, index) => (
                                                            <option value={item.campaign_id}>
                                                                {item.campaign_id ? item.campaign_id : '-'}
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}
                                            />
                                            {errors.campaignId && (
                                                <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                                                    {errors.campaignId.message}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer justify-content-end pb-0 ">
                                <button class="btn btn-warning" onClick={handleClose}>Cancel</button>
                                <button class="btn btn-primary px-4" type="submit">Assign</button>
                            </div>
                        </form>
                    </Modal.Body>
                </Modal>
            </div>
        </div>
    )
}
