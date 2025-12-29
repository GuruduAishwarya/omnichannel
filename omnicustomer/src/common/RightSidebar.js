import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function RightSidebar() {
    const location = useLocation();
    const currentPath = location.pathname;

    // Hide sidebar if the URL contains 'whatsapp' or 'sms'
    const shouldShowSidebar = !(
        currentPath.includes('whatsapp') || currentPath.includes('sms')
    );

    if (!shouldShowSidebar) {
        return null; // Render nothing if the condition is not met
    }

    return (
        <div className="right-sidebar-mini">
            <div className="right-sidebar-panel p-0">
                <div className="card shadow-none">
                    <div className="card-body p-0">
                        <div className="right-medai p-3" data-scrollbar="init">
                            <ul className="navbar-nav" id="sidebar-menu">
                                <li className="nav-item static-item">
                                    <a className="nav-link static-item disabled" href="/comingsoon" tabIndex="-1">
                                        <Link to="/comingsoon" className="item-name ms-1">
                                            Feed view
                                        </Link>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a className={`nav-link ${currentPath === '/comingsoon' ? 'active' : ''}`} aria-current="page" href="/comingsoon">
                                        <i className="fa fa-columns" aria-hidden="true"></i>
                                        <Link to="/comingsoon" className="item-name ms-1">
                                            Feed view
                                        </Link>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" href="/comingsoon">
                                        <i className="fa fa-calendar" aria-hidden="true"></i>
                                        <Link to="/comingsoon" className="item-name ms-1">
                                            Calendar view
                                        </Link>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" href="/comingsoon">
                                        <i className="fa fa-list" aria-hidden="true"></i>
                                        <Link to="/comingsoon" className="item-name ms-1">
                                            List view
                                        </Link>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" href="/comingsoon">
                                        <i className="fa fa-plus" aria-hidden="true"></i>
                                        <Link to="/comingsoon" className="item-name ms-1">
                                            Create a custom view
                                        </Link>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" href="/comingsoon">
                                        <i className="fa fa-bar-chart" aria-hidden="true"></i>
                                        <Link to="/comingsoon" className="item-name ms-1">
                                            Analytics
                                        </Link>
                                    </a>
                                </li>
                            </ul>
                        </div>
                        {/* <div className="right-sidebar-toggle bg-primary text-white mt-3 d-flex">
                            <span className="material-symbols-outlined">view_day</span>
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    );
}
