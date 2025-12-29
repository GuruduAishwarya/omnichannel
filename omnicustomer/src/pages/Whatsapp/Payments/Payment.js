import React, { useEffect, useState } from 'react';
import BalanceDashbord from '../../Whatsapp/Payments/Recharge';
import BalanceHistory from '../../Whatsapp/Payments/BalanceHistory';
import CreditHistory from '../../Whatsapp/Payments/CreditHistory';
import InvoiceHistory from '../../Whatsapp/Payments/InvoiceHistory';
import PageTitle from '../../../common/PageTitle';
import { useLocation, useNavigate } from 'react-router-dom';
import Recharge from '../../Whatsapp/Payments/ChooseAPlan';
import { fetchPaymentPermissionsData } from '../../../utils/ApiClient';

export default function Payment() {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('recharge');
    const [paymentMenus, setPaymentMenus] = useState([]);

    useEffect(() => {
        const hash = location.hash.substring(1);
        if (hash) setActiveTab(hash);
    }, [location]);

    useEffect(() => {
        fetchPaymentPermissions();
    }, []);

    const handleTabClick = (tab, event) => {
        event.preventDefault();
        setActiveTab(tab);
        navigate(`#${tab}`);
    };

    const fetchPaymentPermissions = async () => {
        try {
            const response = await fetchPaymentPermissionsData();
            const response_data = response.data;

            if (response_data.error_code === 200) {
                const menuData = response_data.results.menu_data || [];
                const subMenus = menuData.flatMap((menu) => menu.submenu || []);
                setPaymentMenus(subMenus);
            } else {
                setPaymentMenus([]);
            }
        } catch (error) {
            console.error("Error fetching payment permissions:", error);
            setPaymentMenus([]);
        }
    };

    // ✅ Helper: Check if a submenu exists by its page_name
    const hasMenu = (pageName) => {
        return paymentMenus.some((menu) => menu.page_name === pageName);
    };

    return (
        <div id="content-page" className="content-page">
            <div className="container">
                <PageTitle title="Payments" />

                <nav className="tab-bottom-bordered">
                    <div
                        className="mb-0 nav nav-pills flex-column flex-md-row rounded-top border-0"
                        id="nav-tab1"
                        role="tablist"
                    >
                        {hasMenu('payments_details') && (
                            <button
                                className={`nav-link ${activeTab === 'recharge' ? 'active' : ''}`}
                                onClick={(e) => handleTabClick('recharge', e)}
                            >
                                Payment Details
                            </button>
                        )}

                        {hasMenu('balance_history') && (
                            <button
                                className={`nav-link ${activeTab === 'balance_history' ? 'active' : ''}`}
                                onClick={(e) => handleTabClick('balance_history', e)}
                            >
                                Balance History
                            </button>
                        )}

                        {hasMenu('credit_history') && (
                            <button
                                className={`nav-link ${activeTab === 'credit_history' ? 'active' : ''}`}
                                onClick={(e) => handleTabClick('credit_history', e)}
                            >
                                Credits History
                            </button>
                        )}

                        {hasMenu('invoice') && (
                            <button
                                className={`nav-link ${activeTab === 'invoice' ? 'active' : ''}`}
                                onClick={(e) => handleTabClick('invoice', e)}
                            >
                                Invoice
                            </button>
                        )}

                        {hasMenu('plan') && (
                            <button
                                className={`nav-link ${activeTab === 'plan' ? 'active' : ''}`}
                                onClick={(e) => handleTabClick('plan', e)}
                            >
                                Plans
                            </button>
                        )}
                    </div>
                </nav>

                <div className="col-xl-12">
                    {activeTab === 'recharge' && hasMenu('payments_details') && <BalanceDashbord />}
                    {activeTab === 'balance_history' && hasMenu('balance_history') && <BalanceHistory />}
                    {activeTab === 'credit_history' && hasMenu('credit_history') && <CreditHistory />}
                    {activeTab === 'invoice' && hasMenu('invoice') && <InvoiceHistory />}
                    {activeTab === 'plan' && hasMenu('plan') && <Recharge />}
                </div>
            </div>
        </div>
    );
}
