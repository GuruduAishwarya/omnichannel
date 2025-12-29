import { useState, useEffect } from 'react';
import { fetchWorkspace, GenerateApi } from "../../utils/ApiClient";
import { triggerAlert, getCookie } from '../../utils/CommonFunctions';

export default function DeveloperApi() {
    const [workspaceId, setWorkspaceId] = useState("");
    const [workspaces, setWorkspaces] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [apiSecret, setApiSecret] = useState("");
    const workspace_id_from_cookie = getCookie('selected_workspace_id');

    const handleWorkspaceChange = async (e) => {
        const selectedId = e.target.value;
        setWorkspaceId(selectedId);
    };

    const fetchWorkspaceData = async () => {
        setIsLoading(true);
        try {
            const response = await fetchWorkspace();
            if (response && response.data && response.data.error_code === 200) {
                const workspaceData = response.data.results || [];
                if (workspaceData.length > 0) {
                    const formattedWorkspaces = workspaceData.map(workspace => ({
                        id: workspace.id.toString(),
                        name: workspace.company_name || `Workspace ${workspace.id}`
                    }));
                    setWorkspaces(formattedWorkspaces);
                    const selectedWorkspace = getSelectedWorkspace();
                    const workspaceExists = formattedWorkspaces.some(ws => ws.id === selectedWorkspace?.id);
                    const workspaceToSelect = workspaceExists ? selectedWorkspace.id : formattedWorkspaces[0]?.id || "139";
                    setWorkspaceId(workspaceToSelect);
                }
            }
        } catch (error) {
            console.error('Error fetching workspaces:', error);
            triggerAlert("error", "Error", "Failed to fetch workspaces");
            setWorkspaceId("139");
        } finally {
            setIsLoading(false);
        }
    };

    const getSelectedWorkspace = () => {
        const cookieWorkspaceId = getCookie('selected_workspace_id');
        const localStorageWorkspaceId = localStorage.getItem('workspace_id') || localStorage.getItem('current_workspace_id');
        const workspaceName = getCookie('selected_workspace_name') || localStorage.getItem('selected_workspace_name');
        return {
            id: cookieWorkspaceId || localStorageWorkspaceId || "139",
            name: workspaceName || "Default Workspace"
        };
    };

    useEffect(() => {
        fetchWorkspaceData();
    }, []);

    useEffect(() => {
        if (workspace_id_from_cookie) {
            setWorkspaceId(workspace_id_from_cookie);
        }
    }, [workspace_id_from_cookie]);

    // Fetch API secret whenever workspaceId changes
    useEffect(() => {
        const fetchApiSecret = async () => {
            if (workspaceId) {
                try {
                    const response = await GenerateApi(workspaceId);
                    console.log("API Response:", response); // Debug log
                    if (response?.data?.error_code === 200) {
                        setApiSecret(response.data.results.api_secret);
                    } else {
                        console.error('Error fetching API secret:', response?.data?.message);
                        setApiSecret("");
                    }
                } catch (error) {
                    console.error('Error fetching API secret:', error);
                    setApiSecret("");
                }
            }
        };
        fetchApiSecret();
    }, [workspaceId]);

    return (
        <div>
            <div class="position-relative">
            </div>
            <div id="content-page" class="content-page">
                <div class="container">
                    <div class="row mb-4 mt-3">
                        <div class="d-flex align-items-center justify-content-between flex-wrap">
                            <h4 class="fw-bold text-primary">Developer API</h4>
                            <div>
                                <a href="#" class="social-item btn btn-warning d-flex align-items-center justify-content-center" data-bs-toggle="modal" data-bs-target="#exampleModalCenter3">
                                    Generate Auth Key
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-lg-12">
                            <div class="card">
                                <div class="card-header">
                                    <div class="d-flex justify-content-between">
                                        <ul class="nav nav-pills   " id="pills-tab-1" role="tablist">
                                            <li class="nav-item" role="presentation">
                                                <a class="nav-link active px-4" id="pills-home-tab-fill" data-bs-toggle="pill" href="#pills-home-filla" role="tab" aria-controls="pills-homea" aria-selected="true"><img src="assets/images/chat-bubble-icon.png" alt="icon" class="img-fluid me-1" loading="lazy" width="20" /> SMS</a>
                                            </li>
                                            <li class="nav-item" role="presentation">
                                                <a class="nav-link ms-3 px-3" id="pills-profile-tab-fill" data-bs-toggle="pill" href="#pills-profile-filla" role="tab" aria-controls="pills-profilea" aria-selected="false" tabindex="-1"><img src="assets/images/whatsapp-icon.png" alt="icon" class="img-fluid me-1" loading="lazy" width="20" /> Whatsapp</a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <div class="card-body">
                                    <div class="tab-content" id="pills-tabContent-1">
                                        <div class="tab-pane fade show active" id="pills-home-filla" role="tabpanel" aria-labelledby="pills-home-tab-filla">
                                            <div class="row ">
                                                <div class="row">
                                                    <div class="col-lg-12">
                                                        <div class="accordion" id="accordionExample">
                                                            <div class="accordion-item mb-3">
                                                                <h2 class="accordion-header" id="heading1">
                                                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse1" aria-expanded="false" aria-controls="collapse1">
                                                                        Send SMS / Media message API
                                                                    </button>
                                                                </h2>
                                                                <div id="collapse1" class="accordion-collapse collapse  " aria-labelledby="heading1" data-bs-parent="#accordionExample">
                                                                    <div class="accordion-body">
                                                                        <div class="bg-soft-primary mb-3 p-3 rounded">
                                                                            <h6 class="fw-normal ">URL: <a class="text-info">https://omnichannelapi.vitelglobal.com/sms/api/send_sms_mms/</a></h6>
                                                                        </div>
                                                                        <div>
                                                                            <h5 class="mb-2 ">Method : <span class="fw-semibol">Post</span></h5>
                                                                            <h5 class="mb-2">Parameter Name with Description :</h5>
                                                                            <div class="table-responsive">
                                                                                <table class="table table-bordered border">
                                                                                    <thead class="table-success">
                                                                                        <tr>
                                                                                            <th>Parameter Name</th>
                                                                                            <th>Data Type</th>
                                                                                            <th>Description</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody>
                                                                                        {/* <tr>
                                                                                            <td>user_name</td>
                                                                                            <td>String</td>
                                                                                            <td>Vitelglobal registered username</td>
                                                                                        </tr> */}
                                                                                        <tr>
                                                                                            <td>api_key</td>
                                                                                            <td>String</td>
                                                                                            <td>b30bcda6-9d43-4a4b-abbd-40e6a224ef4d</td>
                                                                                        </tr>
                                                                                        <tr>
                                                                                            <td>msg_type</td>
                                                                                            <td>String</td>
                                                                                            <td>SMS</td>
                                                                                        </tr>
                                                                                        <tr>
                                                                                            <td>from_number</td>
                                                                                            <td>Number</td>
                                                                                            <td>17867855965</td>
                                                                                        </tr>
                                                                                        <tr>
                                                                                            <td>to_number</td>
                                                                                            <td>Number</td>
                                                                                            <td>["17324443132",”1XXXXXXXXXX",”1XXXXXXXXXX"]</td>
                                                                                        </tr>
                                                                                        <tr>
                                                                                            <td>message</td>
                                                                                            <td>text</td>
                                                                                            <td>Hello This is a test SMS JSON</td>
                                                                                        </tr>
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <h5 class="mb-2 fw-semibol">Sample Output :</h5>
                                                                            <div class="bg-soft-info p-3 rounded">
                                                                                <div class="form-group">
                                                                                    <pre>
                                                                                        <code
                                                                                            style={{
                                                                                                color: "#555770", // pink/red tone
                                                                                                whiteSpace: "pre-wrap", // preserve formatting & line breaks
                                                                                            }}
                                                                                        >
                                                                                            {JSON.stringify(
                                                                                                {
                                                                                                    results: {},
                                                                                                    message: "Message processed successfully.",
                                                                                                    error_code: 200,
                                                                                                },
                                                                                                null,
                                                                                                2
                                                                                            )}
                                                                                        </code>
                                                                                    </pre>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="accordion-item mb-3">
                                                                <h2 class="accordion-header" id="heading2">
                                                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse2" aria-expanded="false" aria-controls="collapse2">
                                                                        Received SMS / Media message API
                                                                    </button>
                                                                </h2>
                                                                <div id="collapse2" class="accordion-collapse collapse" aria-labelledby="heading2" data-bs-parent="#accordionExample">
                                                                    <div class="accordion-body">
                                                                        <div class="bg-soft-primary mb-3 p-3 rounded">
                                                                            <h6 class="fw-normal ">URL: <a class="text-info">  https://omnichannelapi.vitelglobal.com/socket_app/socket_app/</a></h6>
                                                                        </div>
                                                                        <div>
                                                                            <h5 class="mb-2 ">Method : <span class="fw-semibol">Post</span></h5>
                                                                            <h5 class="mb-2">Parameter Name with Description :</h5>
                                                                            <div class="table-responsive">
                                                                                <table class="table table-bordered border">
                                                                                    <thead class="table-success">
                                                                                        <tr>
                                                                                            <th>Parameter Name</th>
                                                                                            <th>Data Type</th>
                                                                                            <th>Description</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td>user_name</td>
                                                                                            <td>String</td>
                                                                                            <td>Vitelglobal registered username</td>
                                                                                        </tr>
                                                                                        <tr>
                                                                                            <td>api_key</td>
                                                                                            <td>String</td>
                                                                                            <td>Login authentication key</td>
                                                                                        </tr>
                                                                                        <tr>
                                                                                            <td>message_type</td>
                                                                                            <td>String</td>
                                                                                            <td>SMS = 1 / MMS = 2</td>
                                                                                        </tr>
                                                                                        <tr>
                                                                                            <td>from_number</td>
                                                                                            <td>Number</td>
                                                                                            <td>XXXXXXXXXX</td>
                                                                                        </tr>
                                                                                        <tr>
                                                                                            <td>to_number</td>
                                                                                            <td>Number</td>
                                                                                            <td>XXXXXXXXXX</td>
                                                                                        </tr>
                                                                                        <tr>
                                                                                            <td>message</td>
                                                                                            <td>text</td>
                                                                                            <td>Text message</td>
                                                                                        </tr>
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <h5 class="mb-2 fw-semibol">Sample Output :</h5>
                                                                            <div class="bg-soft-info p-3 rounded">
                                                                                <div class="form-group">
                                                                                    <textarea
                                                                                        className="form-control border-0"
                                                                                        id="exampleFormControlTextarea1"
                                                                                        rows={5}
                                                                                        readOnly
                                                                                    >
                                                                                        {`[
  {"errcode":200,"errmsg":"Message Sent Successfully!","credits":1},
  {"errcode":202,"errmsg":"Invalid API Key, please contact support team or generate it from customer portal."},
  {"errcode":202,"errmsg":"Invalid username or API key was not generated, please contact support team or generate it from customer portal."}
]`}
                                                                                    </textarea>

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
                                        <div class="tab-pane fade" id="pills-profile-filla" role="tabpanel" aria-labelledby="pills-profile-tab-filla">
                                            <div class="row">
                                                <div class="accordion" id="accordionExample2">
                                                    <div class="accordion-item mb-3">
                                                        <h2 class="accordion-header" id="headingOne">
                                                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
                                                                Send marketing template
                                                            </button>
                                                        </h2>
                                                        <div id="collapseOne" class="accordion-collapse collapse  " aria-labelledby="headingOne" data-bs-parent="#accordionExample2">
                                                            <div class="accordion-body">

                                                                <div class="bg-soft-primary mb-3 p-3 rounded">
                                                                    <h6 class="fw-normal ">URL: <a class="text-info">https://omnichannelapi.vitelglobal.com/whatsapp/send_templates/</a></h6>
                                                                </div>
                                                                <div>
                                                                    <h5 class="mb-2 ">Method : <span class="fw-semibol">Post</span></h5>
                                                                    <h5 class="mb-2">Parameter Name with Description :</h5>
                                                                    <div class="table-responsive">
                                                                        <table class="table table-bordered border">
                                                                            <thead class="table-success">
                                                                                <tr>
                                                                                    <th>Parameter Name</th>
                                                                                    <th>Data Type</th>
                                                                                    <th>Description</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>phone_numbers</td>
                                                                                    <td>91XXXXXXXXXX</td>
                                                                                    <td>Enter phone numbers with comma seperated</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>template_name</td>
                                                                                    <td>String</td>
                                                                                    <td>Template name</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>username</td>
                                                                                    <td>String</td>
                                                                                    <td>Login username</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>token_no</td>
                                                                                    <td>String</td>
                                                                                    <td>Login authentication key</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <h5 class="mb-2 fw-semibol">Sample Output :</h5>
                                                                    <div class="bg-soft-info p-3 rounded">
                                                                        <div class="form-group">
                                                                            <textarea
                                                                                className="form-control border-0"
                                                                                id="exampleFormControlTextarea1"
                                                                                rows={5}
                                                                                readOnly
                                                                            >
                                                                                {`{
  "errcode": 200,
  "errmsg": "Successfully sent"
}`}
                                                                            </textarea>

                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="accordion-item mb-3">
                                                        <h2 class="accordion-header" id="headingTwo">
                                                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                                                                Send authentication template
                                                            </button>
                                                        </h2>
                                                        <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample2">
                                                            <div class="accordion-body">
                                                                <div class="bg-soft-primary mb-3 p-3 rounded">
                                                                    <h6 class="fw-normal ">URL: <a class="text-info">https://omnichannelapi.vitelglobal.com/whatsapp/send_templates/</a></h6>
                                                                </div>
                                                                <div>
                                                                    <h5 class="mb-2 ">Method : <span class="fw-semibol">Post</span></h5>
                                                                    <h5 class="mb-2">Parameter Name with Description :</h5>
                                                                    <div class="table-responsive">
                                                                        <table class="table table-bordered border">
                                                                            <thead class="table-success">
                                                                                <tr>
                                                                                    <th>Parameter Name</th>
                                                                                    <th>Data Type</th>
                                                                                    <th>Description</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>phone_numbers</td>
                                                                                    <td>91XXXXXXXXXX</td>
                                                                                    <td>Enter phone numbers with comma seperated</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>template_name</td>
                                                                                    <td>String</td>
                                                                                    <td>Template name</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>username</td>
                                                                                    <td>String</td>
                                                                                    <td>Login username</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>token_no</td>
                                                                                    <td>String</td>
                                                                                    <td>Login authentication key</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>otp</td>
                                                                                    <td>Number</td>
                                                                                    <td>It should be a 6-digit numeric code</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <h5 class="mb-2 fw-semibol">Sample Output :</h5>
                                                                    <div class="bg-soft-info p-3 rounded">
                                                                        <div class="form-group">
                                                                            <textarea
                                                                                className="form-control border-0"
                                                                                id="exampleFormControlTextarea1"
                                                                                rows={5}
                                                                                readOnly
                                                                            >
                                                                                {`{
  "errcode": 200,
  "errmsg": "Successfully sent"
}`}
                                                                            </textarea>

                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="accordion-item mb-3">
                                                        <h2 class="accordion-header" id="headingThree">
                                                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                                                                Send utility template
                                                            </button>
                                                        </h2>
                                                        <div id="collapseThree" class="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#accordionExample2">
                                                            <div class="accordion-body">
                                                                <div class="bg-soft-primary mb-3 p-3 rounded">
                                                                    <h6 class="fw-normal ">URL: <a class="text-info">https://omnichannelapi.vitelglobal.com/whatsapp/send_templates/</a></h6>
                                                                </div>
                                                                <div>
                                                                    <h5 class="mb-2 ">Method : <span class="fw-semibol">Post</span></h5>
                                                                    <h5 class="mb-2">Parameter Name with Description :</h5>
                                                                    <div class="table-responsive">
                                                                        <table class="table table-bordered border">
                                                                            <thead class="table-success">
                                                                                <tr>
                                                                                    <th>Parameter Name</th>
                                                                                    <th>Data Type</th>
                                                                                    <th>Description</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>phone_numbers</td>
                                                                                    <td>91XXXXXXXXXX</td>
                                                                                    <td>Enter phone numbers with comma seperated</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>template_name</td>
                                                                                    <td>String</td>
                                                                                    <td>Template name</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>username</td>
                                                                                    <td>String</td>
                                                                                    <td>Login username</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>token_no</td>
                                                                                    <td>String</td>
                                                                                    <td>Login authentication key</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>header_text</td>
                                                                                    <td>String</td>
                                                                                    <td>Header text</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>body_text1</td>
                                                                                    <td>String</td>
                                                                                    <td class="ng-binding">1 for this you can set dynamic value. (optional)</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>body_text2</td>
                                                                                    <td>String</td>
                                                                                    <td class="ng-binding">2 for this you can set dynamic value. (optional)</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>body_text3</td>
                                                                                    <td>String</td>
                                                                                    <td class="ng-binding">3 for this you can set dynamic value. (optional)</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>body_text4</td>
                                                                                    <td>String</td>
                                                                                    <td class="ng-binding">4 for this you can set dynamic value. (optional)</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>body_text5</td>
                                                                                    <td>String</td>
                                                                                    <td class="ng-binding">5 for this you can set dynamic value. (optional)</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <h5 class="mb-2 fw-semibol">Sample Output :</h5>
                                                                    <div class="bg-soft-info p-3 rounded">
                                                                        <div class="form-group">
                                                                            <textarea
                                                                                className="form-control border-0"
                                                                                id="exampleFormControlTextarea1"
                                                                                rows={5}
                                                                                readOnly
                                                                            >
                                                                                {`{
  "errcode": 200,
  "errmsg": "Successfully sent"
}`}
                                                                            </textarea>

                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="accordion-item mb-3">
                                                        <h2 class="accordion-header" id="headingFour">
                                                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFour" aria-expanded="false" aria-controls="collapseTwo">
                                                                Create authentication template
                                                            </button>
                                                        </h2>
                                                        <div id="collapseFour" class="accordion-collapse collapse" aria-labelledby="headingFour" data-bs-parent="#accordionExample2">
                                                            <div class="accordion-body">
                                                                <h5 class="mb-2">Create authentication template API:</h5>
                                                                <div class="bg-soft-primary mb-3 p-3 rounded">
                                                                    <h6 class="fw-normal ">URL: <a class="text-info">https://omnichannelapi.vitelglobal.com/whatsapp/create_templates/</a></h6>
                                                                </div>

                                                                <div>
                                                                    <h5 class="mb-2 ">Method : <span class="fw-semibol">Post</span></h5>
                                                                    <h5 class="mb-2">Parameter Name with Description :</h5>
                                                                    <div class="table-responsive">
                                                                        <table class="table table-bordered border">
                                                                            <thead class="table-success">
                                                                                <tr>
                                                                                    <th>Parameter Name</th>
                                                                                    <th>Data Type</th>
                                                                                    <th>Description</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>phone_numbers</td>
                                                                                    <td>91XXXXXXXXXX</td>
                                                                                    <td>Enter phone numbers with comma seperated</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>template_name</td>
                                                                                    <td>String</td>
                                                                                    <td>Template name</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>username</td>
                                                                                    <td>String</td>
                                                                                    <td>Login username</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>token_no</td>
                                                                                    <td>Number</td>
                                                                                    <td>Login authentication key</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>template_category</td>
                                                                                    <td>AUTHENTICATION</td>
                                                                                    <td>AUTHENTICATION</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>code_delivery</td>
                                                                                    <td>ONE_TAP</td>
                                                                                    <td>ONE_TAP / COPY_CODE</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>package_name</td>
                                                                                    <td>welcome product one</td>
                                                                                    <td>One-tap buttons only</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>auto_signature_hash</td>
                                                                                    <td>string</td>
                                                                                    <td>One-tap buttons only</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>autofill</td>
                                                                                    <td>Autofill</td>
                                                                                    <td>Optional &amp; Only for ONE_TAP code_delivery </td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>copy_code</td>
                                                                                    <td>String</td>
                                                                                    <td>(optional)</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>security_recommendation</td>
                                                                                    <td>true</td>
                                                                                    <td>true/false</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>expiry_in_minutes</td>
                                                                                    <td>55</td>
                                                                                    <td>1-90 mins digits only // Optional</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>

                                                                </div>

                                                                <div>
                                                                    <h5 class="mb-2 fw-semibol">Sample Output :</h5>
                                                                    <div class="bg-soft-info p-3 rounded mb-1">
                                                                        <div class="form-group">
                                                                            <textarea
                                                                                className="form-control border-0"
                                                                                id="exampleFormControlTextarea1"
                                                                                rows={5}
                                                                                readOnly
                                                                            >
                                                                                {`{
  "errcode": 200,
  "errmsg": "Successfully sent"
}`}
                                                                            </textarea>

                                                                        </div>
                                                                    </div>
                                                                    <h5>Response : JSON Format</h5>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="accordion-item mb-3">
                                                        <h2 class="accordion-header" id="headingFive">
                                                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFive" aria-expanded="false" aria-controls="collapseFive">
                                                                Create marketing / utility template (media)
                                                            </button>
                                                        </h2>
                                                        <div id="collapseFive" class="accordion-collapse collapse" aria-labelledby="headingFive" data-bs-parent="#accordionExample2">
                                                            <div class="accordion-body">
                                                                <div class="bg-soft-primary mb-3 p-3 rounded">
                                                                    <h6 class="fw-normal ">URL: <a class="text-info">https://omnichannelapi.vitelglobal.com/whatsapp/create_templates/</a></h6>
                                                                </div>

                                                                <div>
                                                                    <h5 class="mb-2 ">Method : <span class="fw-semibol">Post</span></h5>
                                                                    <h5 class="mb-2">Parameter Name with Description :</h5>
                                                                    <div class="table-responsive">
                                                                        <table class="table table-bordered border">
                                                                            <thead class="table-success">
                                                                                <tr>
                                                                                    <th>Parameter Name</th>
                                                                                    <th>Data Type</th>
                                                                                    <th>Description</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>phone_numbers</td>
                                                                                    <td>91XXXXXXXXXX</td>
                                                                                    <td>Enter phone numbers with comma seperated</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>template_name</td>
                                                                                    <td>String</td>
                                                                                    <td>Template name</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>username</td>
                                                                                    <td>String</td>
                                                                                    <td>Login username</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>token_no</td>
                                                                                    <td>String</td>
                                                                                    <td>Login authentication key</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>template_category</td>
                                                                                    <td>String</td>
                                                                                    <td>UTILITY or MARKETING</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>header_select</td>
                                                                                    <td>Number</td>
                                                                                    <td>1 :Text or 2 : Media</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>image_upload</td>
                                                                                    <td>File</td>
                                                                                    <td>(optional)</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>header_text</td>
                                                                                    <td>String</td>
                                                                                    <td>Add header text(optional)</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>body_dynamic_head</td>
                                                                                    <td>String</td>
                                                                                    <td class="ng-binding">1 for this you can set dynamic value. this is for only header dynamic value you can set and it will be 1(optional) </td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>template_message_text</td>
                                                                                    <td>String</td>
                                                                                    <td class="ng-binding">1 message dynamic value you can set and it will be 1 to 5 (optional)</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>body_dyna1</td>
                                                                                    <td>String</td>
                                                                                    <td class="ng-binding">1 for this you can set dynamic value. (optional)</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>body_dyna2</td>
                                                                                    <td>String</td>
                                                                                    <td class="ng-binding">2 for this you can set dynamic value. (optional)</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>body_dyna3</td>
                                                                                    <td>String</td>
                                                                                    <td class="ng-binding">3 for this you can set dynamic value. (optional)</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>body_dyna4</td>
                                                                                    <td>String</td>
                                                                                    <td class="ng-binding">4 for this you can set dynamic value. (optional)</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>body_dyna5</td>
                                                                                    <td>String</td>
                                                                                    <td class="ng-binding">5 for this you can set dynamic value. (optional)</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>template_footer_text</td>
                                                                                    <td>String</td>
                                                                                    <td>Fotter text(optional)</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>template_button_select</td>
                                                                                    <td>Number</td>
                                                                                    <td>0:None, 1:Quick reply, 2:Call to action</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>quick_reply_options</td>
                                                                                    <td>String</td>
                                                                                    <td>(optional)</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>template_type_of_action</td>
                                                                                    <td>Number</td>
                                                                                    <td>Type of action ie: 1:Call Phone number, 2:Visit Website</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>template_button_text_call</td>
                                                                                    <td>String</td>
                                                                                    <td>Button text(optional)</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>template_phone_number</td>
                                                                                    <td>String</td>
                                                                                    <td>Phone number(optional)</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>template_website_url</td>
                                                                                    <td>Url</td>
                                                                                    <td>Website Url(optional)</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>


                                                                </div>

                                                                <div>
                                                                    <h5 class="mb-2 fw-semibol">Sample Output :</h5>
                                                                    <div class="bg-soft-info p-3 rounded mb-1">
                                                                        <div class="form-group">
                                                                            <textarea
                                                                                className="form-control border-0"
                                                                                id="exampleFormControlTextarea1"
                                                                                rows={5}
                                                                                readOnly
                                                                            >
                                                                                {`{
  "errcode": 200,
  "errmsg": "Successfully sent"
}`}
                                                                            </textarea>

                                                                        </div>
                                                                    </div>
                                                                    <h5>Response : JSON Format</h5>
                                                                </div>
                                                            </div>
                                                        </div>


                                                    </div>
                                                    <div class="accordion-item mb-3">
                                                        <h2 class="accordion-header" id="headingSix">
                                                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseSix" aria-expanded="false" aria-controls="collapseTwo">
                                                                Delete template
                                                            </button>
                                                        </h2>
                                                        <div id="collapseSix" class="accordion-collapse collapse" aria-labelledby="headingSix" data-bs-parent="#accordionExample2">
                                                            <div class="accordion-body">
                                                                <div class="bg-soft-primary mb-3 p-3 rounded">
                                                                    <h6 class="fw-normal ">URL: <a class="text-info">https://omnichannelapi.vitelglobal.com/whatsapp/templates/delete_template</a></h6>
                                                                </div>

                                                                <div>
                                                                    <h5 class="mb-2 ">Method : <span class="fw-semibol">Post</span></h5>
                                                                    <h5 class="mb-2">Parameter Name with Description :</h5>
                                                                    <div class="table-responsive">
                                                                        <table class="table table-bordered border">
                                                                            <thead class="table-success">
                                                                                <tr>
                                                                                    <th>Parameter Name</th>
                                                                                    <th>Data Type</th>
                                                                                    <th>Description</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>phone_numbers</td>
                                                                                    <td>91XXXXXXXXXX</td>
                                                                                    <td>Enter phone numbers with comma seperated</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>template_name</td>
                                                                                    <td>String</td>
                                                                                    <td>Template name</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>username</td>
                                                                                    <td>String</td>
                                                                                    <td>Login username</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>token_no</td>
                                                                                    <td>String</td>
                                                                                    <td>Login authentication key</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>


                                                                </div>

                                                                <div>
                                                                    <h5 class="mb-2 fw-semibol">Sample Output :</h5>
                                                                    <div class="bg-soft-info p-3 rounded mb-1">
                                                                        <div class="form-group">
                                                                            <textarea
                                                                                className="form-control border-0"
                                                                                id="exampleFormControlTextarea1"
                                                                                rows={5}
                                                                                readOnly
                                                                            >
                                                                                {`{
  "errcode": 200,
  "errmsg": "Successfully sent"
}`}
                                                                            </textarea>

                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>


                                                    </div>

                                                    <div class="accordion-item mb-3">
                                                        <h2 class="accordion-header" id="headingSeven">
                                                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseSeven" aria-expanded="false" aria-controls="collapseSeven">
                                                                Send text message
                                                            </button>
                                                        </h2>
                                                        <div id="collapseSeven" class="accordion-collapse collapse" aria-labelledby="headingSeven" data-bs-parent="#accordionExample2">
                                                            <div class="accordion-body">
                                                                <div class="bg-soft-primary mb-3 p-3 rounded">
                                                                    <h6 class="fw-normal ">URL: <a class="text-info"> https://omnichannelapi.vitelglobal.com/whatsapp_api/send_text_message</a></h6>
                                                                </div>

                                                                <div>
                                                                    <h5 class="mb-2 ">Method : <span class="fw-semibol">Post</span></h5>
                                                                    <h5 class="mb-2">Parameter Name with Description :</h5>
                                                                    <div class="table-responsive">
                                                                        <table class="table table-bordered border">
                                                                            <thead class="table-success">
                                                                                <tr>
                                                                                    <th>Parameter Name</th>
                                                                                    <th>Data Type</th>
                                                                                    <th>Description</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>user_name</td>
                                                                                    <td>String</td>
                                                                                    <td>Vitelglobal registered username</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>api_key</td>
                                                                                    <td>String</td>
                                                                                    <td>Login authentication key</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>from_number</td>
                                                                                    <td>Number</td>
                                                                                    <td>XXXXXXXXXX (note: kindly add country code ex: 91 for IN, 1 for US)</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>to_number</td>
                                                                                    <td>Number</td>
                                                                                    <td>XXXXXXXXXX (note: kindly add your bussiness number)</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>text_message</td>
                                                                                    <td>text</td>
                                                                                    <td>Text message</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>


                                                                </div>

                                                                <div>
                                                                    <h5 class="mb-2 fw-semibol">Sample Output :</h5>
                                                                    <div class="bg-soft-info p-3 rounded mb-1">
                                                                        <div class="form-group">
                                                                            <textarea
                                                                                className="form-control border-0"
                                                                                id="exampleFormControlTextarea1"
                                                                                rows={5}
                                                                                readOnly
                                                                            >
                                                                                {`{
  "errcode": 200,
  "errmsg": "Successfully sent"
}`}
                                                                            </textarea>

                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="accordion-item mb-3">
                                                        <h2 class="accordion-header" id="headingEight">
                                                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseEight" aria-expanded="false" aria-controls="collapseEight">
                                                                Whatsapp messages list
                                                            </button>
                                                        </h2>
                                                        <div id="collapseEight" class="accordion-collapse collapse" aria-labelledby="headingEight" data-bs-parent="#accordionExample2">
                                                            <div class="accordion-body">
                                                                <div class="bg-soft-primary mb-3 p-3 rounded">
                                                                    <h6 class="fw-normal ">URL: <a class="text-info">https://omnichannelapi.vitelglobal.com/whatsapp_api/list_messages</a></h6>
                                                                </div>

                                                                <div>
                                                                    <h5 class="mb-2 ">Method : <span class="fw-semibol">Post</span></h5>
                                                                    <h5 class="mb-2">Parameter Name with Description :</h5>
                                                                    <div class="table-responsive">
                                                                        <table class="table table-bordered border">
                                                                            <thead class="table-success">
                                                                                <tr>
                                                                                    <th>Parameter Name</th>
                                                                                    <th>Data Type</th>
                                                                                    <th>Description</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>user_name</td>
                                                                                    <td>String</td>
                                                                                    <td>Vitelglobal registered username</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>api_key</td>
                                                                                    <td>String</td>
                                                                                    <td>Login authentication key</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>from_number</td>
                                                                                    <td>Number</td>
                                                                                    <td>XXXXXXXXXX (note: kindly add country code ex: 91 for IN, 1 for US / Remove for display all messages)</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>



                                                                </div>

                                                                <div>
                                                                    <h5 class="mb-2 fw-semibol">Sample Output :</h5>
                                                                    <div class="bg-soft-info p-3 rounded mb-1">
                                                                        <div class="form-group">
                                                                            <textarea
                                                                                className="form-control border-0"
                                                                                id="exampleFormControlTextarea1"
                                                                                rows={5}
                                                                                readOnly
                                                                            >
                                                                                {`{
  "errcode": 200,
  "errmsg": "Successfully sent"
}`}
                                                                            </textarea>

                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="accordion-item mb-3">
                                                        <h2 class="accordion-header" id="headingNine">
                                                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseNine" aria-expanded="false" aria-controls="collapseNine">
                                                                Dynamic Send Template
                                                            </button>
                                                        </h2>
                                                        <div id="collapseNine" class="accordion-collapse collapse" aria-labelledby="headingNine" data-bs-parent="#accordionExample2">
                                                            <div class="accordion-body">
                                                                <div class="bg-soft-primary mb-3 p-3 rounded">
                                                                    <h6 class="fw-normal ">URL: <a class="text-info">https://omnichannelapi.vitelglobal.com/whatsapp/dynamic_send_template/</a></h6>
                                                                </div>
                                                                <div>
                                                                    <h5 class="mb-2 ">Method : <span class="fw-semibol">Post</span></h5>
                                                                    <h5 class="mb-2">Parameter Name with Description :</h5>
                                                                    <div class="table-responsive">
                                                                        <table class="table table-bordered border">
                                                                            <thead class="table-success">
                                                                                <tr>
                                                                                    <th>Parameter Name</th>
                                                                                    <th>Data Type</th>
                                                                                    <th>Description</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>api_key</td>
                                                                                    <td>String</td>
                                                                                    <td>Login authentication key</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>template_name</td>
                                                                                    <td>String</td>
                                                                                    <td>Name of the WhatsApp template to be sent</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>contact_type</td>
                                                                                    <td>String</td>
                                                                                    <td>Type of recipient, e.g., "contact" or "group"</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>to_number</td>
                                                                                    <td>Array</td>
                                                                                    <td>List of recipient phone numbers with country code, e.g., ["919553757568","919492312018"]</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>header_text</td>
                                                                                    <td>String/Number</td>
                                                                                    <td>Text to appear in the header of the template; 0 if no dynamic header</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>body_dynamic</td>
                                                                                    <td>Object</td>
                                                                                    <td>Dictionary mapping placeholders to actual values, e.g., {JSON.stringify({ "0": "1000", "1": "123456" })}</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <h5 class="mb-2 fw-semibol">Sample Output :</h5>
                                                                    <div class="bg-soft-info p-3 rounded mb-1">
                                                                        <div class="form-group">
                                                                            <textarea
                                                                                className="form-control border-0"
                                                                                id="exampleFormControlTextarea1"
                                                                                rows={5}
                                                                                readOnly
                                                                            >
                                                                                {`{
  "errcode": 200,
  "errmsg": "Successfully sent"
}`}
                                                                            </textarea>
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
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal fade" id="exampleModalCenter3" tabIndex="-1" aria-labelledby="exampleModalCenterTitle">
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title text-primary fw-semibol" id="exampleModalCenterTitle">API Secret Key</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body py-5">
                            <form id="" name="createform" className="">
                                <div className="d-flex flex-column mb-3 single_key">
                                    <div className="row g-2 align-items-center px-3">
                                        <div className="mb-3 col-md-12">
                                            <label className="form-label" htmlFor="workspaceSelect">Select Workspace</label>
                                            <div className="input-group">
                                                <select
                                                    className="form-select"
                                                    id="workspaceSelect"
                                                    value={workspaceId}
                                                    onChange={handleWorkspaceChange}
                                                >
                                                    {workspaces.map(ws => (
                                                        <option key={ws.id} value={ws.id}>
                                                            {ws.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="mb-3 col-md-12">
                                            <input
                                                className="form-control form-control-solid"
                                                type="text"
                                                id="keyTextBox"
                                                readOnly
                                                value={apiSecret}
                                                placeholder="Ut6CG3srkRIPmEUZ"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-warning px-5" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
            {/* ... rest of your JSX ... */}
        </div>
    );
}
