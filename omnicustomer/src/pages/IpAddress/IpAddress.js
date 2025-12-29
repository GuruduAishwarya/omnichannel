import React, { useState, useEffect } from 'react';
import { ipAddressList, addIpAddress, updateIpAddress, deleteIpAddress, currentIpAddress, fetchProfileData } from "../../utils/ApiClient";
import { triggerAlert, ConfirmationAlert } from "../../utils/CommonFunctions";

export default function DeveloperApi() {
    // IP Address Management State
    const [ipList, setIpList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newIp, setNewIp] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [editItem, setEditItem] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentIp, setCurrentIp] = useState('');
    const [userName, setUserName] = useState('');
    const [workspaces, setWorkspaces] = useState([]);
    const [workspaceId, setWorkspaceId] = useState('');
    const [apiSecret, setApiSecret] = useState('');

    // Fetch user profile data
    const fetchUserProfile = async () => {
        try {
            const response = await fetchProfileData();
            const resData = response?.data || response;
            if (resData?.error_code === 200 && resData?.results) {
                setUserName(resData.results.user_name || resData.results.email || '');
            } else {
                console.warn("Failed to load user profile:", resData);
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };

    // Fetch IP list from API
    const fetchIpAddressList = async () => {
        setLoading(true);
        try {
            const response = await ipAddressList();
            if (response && response.data && response.data.results) {
                setIpList(response.data.results);
            } else if (response && Array.isArray(response)) {
                setIpList(response);
            }
        } catch (error) {
            console.error("Error fetching IP addresses", error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = async (item = null) => {
        if (item) {
            setEditItem(item);
            setNewIp(item.ip_address || '');
            setNewDescription(item.description || '');
            setCurrentIp('');
        } else {
            setEditItem(null);
            setNewIp('');
            setNewDescription('');
            try {
                const response = await currentIpAddress();
                const resData = response?.data || response;
                if (resData?.error_code === 200 && resData?.results?.ip_address) {
                    const fetchedIp = resData.results.ip_address;
                    setCurrentIp(fetchedIp);
                    setNewIp(fetchedIp);
                } else {
                    console.warn('Failed to get current IP:', resData);
                    setCurrentIp('');
                }
            } catch (err) {
                console.error('Failed to fetch current IP', err);
                setCurrentIp('');
            }
        }
        setShowModal(true);
    };

    useEffect(() => {
        fetchIpAddressList();
        fetchUserProfile();
    }, []);

    useEffect(() => {
        if (!showModal) {
            fetchIpAddressList();
        }
    }, [showModal]);

    const handleAddIp = async () => {
        if (!newIp) {
            triggerAlert('error', 'Error', 'IP Address is required');
            return;
        }
        const duplicate = ipList.some(
            (item) => item.ip_address.trim() === newIp.trim() && (!editItem || item.id !== editItem.id)
        );
        if (duplicate) {
            setShowModal(false);
            setEditItem(null);
            triggerAlert('error', 'Error', 'This IP address already exists for this user/sub-user');
            return;
        }
        setLoading(true);
        try {
            let response;
            if (editItem) {
                response = await updateIpAddress(editItem.id, {
                    ip_address: newIp,
                    description: newDescription
                });
            } else {
                response = await addIpAddress({
                    ip_address: newIp,
                    description: newDescription
                });
            }
            const resData = response.data || response;
            if (resData.error_code === 200) {
                await fetchIpAddressList();
                setShowModal(false);
                setEditItem(null);
                setNewIp('');
                setNewDescription('');
                setTimeout(() => {
                    triggerAlert(
                        'success',
                        'Success',
                        resData.message || `IP address ${editItem ? 'updated' : 'created'} successfully`
                    );
                }, 300);
            } else {
                setShowModal(false);
                setEditItem(null);
                triggerAlert('success', 'success', resData.message || `Failed to ${editItem ? 'update' : 'create'} IP address`);
            }
        } catch (error) {
            console.error(error);
            setShowModal(false);
            setEditItem(null);
            triggerAlert('error', 'Error', 'Something went wrong while saving the IP address');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        ConfirmationAlert('You want to delete this IP address?', 'Delete', async () => {
            setLoading(true);
            try {
                const response = await deleteIpAddress(id);
                if (response.status === 204 || (response.data && response.data.error_code >= 200 && response.data.error_code < 300)) {
                    triggerAlert('success', 'Success', response.data?.message || 'IP address deleted successfully');
                    await fetchIpAddressList();
                } else {
                    triggerAlert('error', 'Error', 'Failed to delete the IP address');
                }
            } catch (error) {
                console.error("Delete error:", error);
                triggerAlert('error', 'Error', error.response?.data?.message || 'Failed to delete the IP address');
            } finally {
                setLoading(false);
            }
        });
    };

    const handleWorkspaceChange = (e) => {
        setWorkspaceId(e.target.value);
    };

    return (
        <div>
            <div className="position-relative"></div>
            <div id="content-page" className="content-page">
                <div className="container">
                    {/* IP Address Management UI */}
                    <div className="row mt-4">
                        <div className="col-md-12">
                            <div className="card shadow-sm border-0">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">2FA Settings</h5>
                                    <button className="btn btn-primary btn-md" onClick={() => openModal()}>
                                        Add IP Address
                                    </button>
                                </div>
                                <div className="card-body">
                                    <p>
                                        Two-Factor Authentication is currently enabled for your registered email ID:
                                        <span className="text-warning"> {userName}</span>
                                    </p>
                                    <p>
                                        If you <strong>wish to bypass/skip</strong> the Two Factor Authentication, please add your IP address.
                                    </p>
                                </div>
                                <div className="card-body">
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-hover">
                                            <thead className="text-nowrap">
                                                <tr style={{ backgroundColor: "#ededed" }}>
                                                    <th>SNO</th>
                                                    <th>IP Address</th>
                                                    <th>Description</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loading ? (
                                                    <tr>
                                                        <td colSpan="4" className="text-center text-muted">Loading...</td>
                                                    </tr>
                                                ) : ipList.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="4" className="text-center text-muted">No IP addresses added yet</td>
                                                    </tr>
                                                ) : (
                                                    ipList.map((item, index) => (
                                                        <tr key={item.id}>
                                                            <td>{index + 1}</td>
                                                            <td>{item.ip_address}</td>
                                                            <td>{item.description}</td>
                                                            <td>
                                                                <div className="d-flex align-items-center">
                                                                    <a href="#/" onClick={() => openModal(item)} className="me-2">
                                                                        <span className="badge text-primary badge-circle2 p-6" title="Edit">
                                                                            <span className="material-symbols-outlined fs-4">edit</span>
                                                                        </span>
                                                                    </a>
                                                                    <a href="#/" onClick={() => handleDelete(item.id)}>
                                                                        <span className="badge badge-circle2 text-danger p-6" title="Delete">
                                                                            <span className="material-symbols-outlined fs-4">delete</span>
                                                                        </span>
                                                                    </a>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Modal for Add/Edit IP Address */}
            {showModal && (
                <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.5)' }} tabIndex="-1" role="dialog">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                                    {editItem ? 'Edit IP Address' : 'Add IP Address'}
                                    {!editItem && currentIp && (
                                        <span style={{ color: '#ff6600', marginLeft: '10px', fontWeight: 600, fontSize: '15px' }}>
                                            Your Current IP Address - {currentIp}
                                        </span>
                                    )}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => { setShowModal(false); setEditItem(null); }}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">IP Address</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={newIp}
                                        onChange={(e) => setNewIp(e.target.value)}
                                        placeholder="Enter IP Address"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Description</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={newDescription}
                                        onChange={(e) => setNewDescription(e.target.value)}
                                        placeholder="Enter Description"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setEditItem(null); }}>
                                    Cancel
                                </button>
                                <button type="button" className="btn btn-primary" onClick={handleAddIp} disabled={loading}>
                                    {loading ? 'Saving...' : editItem ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for Generate Auth Key */}
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
        </div>
    );
}
