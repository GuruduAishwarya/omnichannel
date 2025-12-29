import React, { useState } from 'react';
import PageTitle from '../../common/PageTitle';
import Invite from './Invite';
import Members from './Members';
import Permissions from '../../pages/Profile/Permissions';

export default function ManageUsers() {
    const heading = "Manage Users";
    const [activeTab, setActiveTab] = useState('Members'); // changed default to 'Members'
    const [showTabs, setShowTabs] = useState(true);

    return (
        <div id="content-page" className="content-page">
            <div className="container">
                <PageTitle heading={heading} />

                <div className="row mb-5">
                    <div className="col-sm-12">
                        <div className="card">
                            {showTabs && (
                                <div className="card-header border-0">
                                    <ul className="nav nav-pills" id="pills-tab" role="tablist">
                                    <li className="nav-item" role="presentation">
                                            <a className={`nav-link ${activeTab === 'Members' ? 'active' : ''}`}
                                                data-bs-toggle="pill"
                                                href="#pills-Members-fill"
                                                role="tab"
                                                aria-controls="pills-Members-fill"
                                                aria-selected={activeTab === 'Members'}
                                                onClick={() => setActiveTab('Members')}
                                            ><i className="fa fa-users" aria-hidden="true"></i>
                                                <span className="ms-2">Members</span></a>
                                        </li>

                                        <li className="nav-item" role="presentation">
                                            <a className={`nav-link ${activeTab === 'Invite' ? 'active' : ''}`}
                                                id="pills-Invite-tab-fill"
                                                data-bs-toggle="pill"
                                                href="#pills-Invite-fill"
                                                role="tab"
                                                aria-controls="pills-Invite-fill"
                                                aria-selected={activeTab === 'Invite'}
                                                onClick={() => setActiveTab('Invite')}
                                            ><i className="fa fa-user-plus" aria-hidden="true"></i>
                                                <span className="ms-2">Invite</span></a>
                                        </li>
                                       
                                    </ul>
                                </div>
                            )}
                            <div className="card-body">
                                <div className="tab-content" id="pills-tabContent-1">
                                    <div className={`tab-pane ${activeTab === 'Invite' ? 'active show' : ''}`} id="Invite" role="tabpanel">
                                        {activeTab === 'Invite' && <Invite onInviteSuccess={() => setActiveTab('Members')} />}
                                    </div>
                                    <div className={`tab-pane ${activeTab === 'Members' ? 'active show' : ''}`} id="Members" role="tabpanel">
                                        {activeTab === 'Members' && <Members setShowTabs={setShowTabs} />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}