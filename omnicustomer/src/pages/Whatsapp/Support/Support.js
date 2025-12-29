import React, { useEffect, useState } from 'react';
import PageTitle from '../../../common/PageTitle';
import { useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import CreateTicket from '../../Whatsapp/Support/CreateTicket';
import ShowTicket from '../../Whatsapp/Support/ShowTicket';
import ListTicket from '../../Whatsapp/Support/ListTicket';

export default function Support() {
    const heading = 'Payment';
    const loggedUser = Cookies.get('auth_user');
    const props = {};
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('create-ticket');

    // Set the active tab based on the URL hash
    useEffect(() => {
        const hash = location.hash.substring(1); // remove the '#' symbol from the hash
        if (hash) {
            setActiveTab(hash);
        }
    }, [location]);

    const handleTabClick = (tab, event) => {
        event.preventDefault(); // Prevent the default anchor behavior
        setActiveTab(tab);
    };

    const handleHomeRedirect = () => {
        navigate('/workspace')
    }

    return (
        <div id="content-page" className="content-page">
            <div className="container">
                <nav className="tab-bottom-bordered">
                    <div className="mb-0 nav nav-pills flex-column flex-md-row rounded-top border-0" id="nav-tab1" role="tablist">
                        <button
                            className={`nav-link col-xs-12 ${activeTab === 'create-ticket' ? 'active' : ''}`}
                            onClick={(event) => handleTabClick('create-ticket', event)}
                        >
                            Create Ticket
                        </button>
                        <button
                            className={`nav-link col-xs-12 ${activeTab === 'show-ticket' ? 'active' : ''}`}
                            onClick={(event) => handleTabClick('show-ticket', event)}
                        >
                            Show Ticket
                        </button>

                    </div>
                </nav>
                <div className="col-xl-12 mt-4">
                    {/* Conditionally render the content for each tab */}
                    {activeTab === 'create-ticket' && (
                        <div className="tab-pane active show" id="create-ticket" role="tabpanel">
                            <CreateTicket />
                        </div>
                    )}
                    {activeTab === 'show-ticket' && (
                        <div className="tab-pane active show" id="show-ticket" role="tabpanel">
                            <ListTicket />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
