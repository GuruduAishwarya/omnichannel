import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { passwordReset, fetchCustomerMenu } from '../utils/ApiClient';

export default function Sidebar() {

    const [loggedUser, setLoggedUser] = useState("");
    const location = useLocation();

    const [channelState, setChannelState] = useState({});
    const [menuState, setMenuState] = useState({
        'messages': false,
        'contacts': false,
        'broadcast': false,
        'create-ticket': false,
        'list-ticket': false,
        'recharge': false,
        'balancehistory': false,
        'invoicehistory': false,
        'paymentsetting': false,
        'chatbot': false,
        'analytics': false,
        'my_number': false,
    });
    const [subMenuState, setSubMenuState] = useState({});

    const [msaStatus, setMsaStatus] = useState('');
    const [activeChannel, setActiveChannel] = useState("");
    const [activeMenu, setActiveMenu] = useState("");
    const [activeSubMenu, setActiveSubMenu] = useState("");
    const [toggleShow, setToggleShow] = useState("");

    const toggleChannel = (channel) => {
        setChannelState((prevState) => ({
            ...prevState,
            [channel]: !prevState[channel]
        }));
        setActiveChannel(channel)
    };


    const toggleSubMenu = (submenu) => {
        setSubMenuState((prevState) => ({
            ...prevState,
            [submenu]: !prevState[submenu]
        }));
    };


    const toggleMenu = (submenu) => {
        setMenuState((prevState) => ({
            ...prevState,
            [submenu]: !prevState[submenu]
        }));
        if (activeMenu !== submenu) {
            setActiveMenu(submenu)
        } else {
            setActiveMenu('')
        }
    };

    const isActiveMenu = (menuPath) => {
        const path_name = location.pathname;
        let main_module = '';

        if (path_name == '/dashboard' || path_name == '/logs') {
            main_module = path_name
        } else {
            main_module = path_name.split("/")[2];
        }
        return main_module === menuPath;
    };


    const [menuData, setmenuData] = useState([]);
    const [userParentModules, setUserParentModules] = useState([]);
    const [userChildModules, setUserChildModules] = useState([]);
    const [userType, setUserType] = useState('');
    const workspace_id_from_cookie = getCookie('selected_workspace_id');
    const [workspaceId, setWorkspaceId] = useState(workspace_id_from_cookie || "");

    const fetchMenuListApi = async () => {
        if (!workspaceId) {
            return;
        }
        try {

            const response = await fetchCustomerMenu(workspaceId);
            const response_data = response
            if (response_data.error_code === 200) {
                const itemsArray = response_data.results.data;


                const user_data = itemsArray?.user_data;
                const user_type = user_data.user_type;
                const sub_user_type = user_data.sub_user_type;
                const menu_data = itemsArray.menu_data
                setmenuData(menu_data);
                setLoggedUser(user_data.user_name)
                setMsaStatus(user_data.msa_status)

                if (user_type != "admin_user") {
                    if (sub_user_type != "Admin") {
                        //////////////////////////
                        const permissionsArray = itemsArray.permissions;
                        const parent_id_string = permissionsArray?.parent_id;
                        const parent_id_array = parent_id_string.split(',').map(Number);
                        setUserParentModules(parent_id_array);

                        /////////////////////////////// 
                        const child_id_string = permissionsArray?.child_id;
                        const child_id_array = child_id_string.split(',').map(Number);
                        setUserChildModules(child_id_array);
                    } else {
                        setUserType("admin_user")
                    }
                } else {
                    setUserType(user_data.user_type)
                }

                // Menu Details


            } else if (response.status === 204) {

            }
            else {
                // triggerAlert('error', 'Oops...', 'Something went wrong here..');
            }

        } catch (error) {
            // triggerAlert('error', 'Oops...', 'Something went wrong..');
        }
    };



    useEffect(() => {

        // console.log("inside useEffect")
        fetchMenuListApi()

        if (location) {
            const path_name = location.pathname;
            const channel = path_name.split("/")[1];
            const main_module = path_name.split("/")[2];
            const sub_module = path_name.split("/")[3];


            setActiveChannel(channel)
            setActiveMenu(main_module)
            setActiveSubMenu(sub_module)

            setChannelState((prevState) => ({
                ...prevState,
                [channel]: !prevState[channel]
            }));


            setMenuState((prevState) => ({
                ...prevState,
                [main_module]: true,
            }));

            setSubMenuState((prevState) => ({
                ...prevState,
                [sub_module]: true,
            }));
        }

    }, []);


    return (
        <div class="d-flex">
            <aside class="sidebar    sidebar-default sidebar-base navs-rounded-all sidebar-mini" id="first-tour" data-toggle=" " data-sidebar="responsive">
                <div class="sidebar-body pt-0 data-scrollbar">
                    <div class="sidebar-list">
                        {/* <!-- Sidebar Menu Start --> */}
                        <h5 class="text-primary fw-bold text-center p-3 mt-2">VDM</h5>
                        <ul class="navbar-nav iq-main-menu" id="sidebar-menu">
                            {menuData && menuData.length > 0 ? (
                                menuData.map((channel_item) => (
                                    <li className="nav-item" key={channel_item.id} onClick={() => toggleChannel(channel_item.page_name)}>
                                        {Array.isArray(channel_item.submenu) && channel_item.submenu.length > 0 ? (
                                            <>
                                                <a
                                                    className="nav-link collapsed"
                                                    data-bs-toggle="collapse"
                                                    data-bs-target={`#flush-collapse${channel_item.id}`}
                                                    aria-expanded={channelState[channel_item.page_name]}
                                                    aria-controls={`flush-collapse${channel_item.id}`}
                                                >
                                                    <img
                                                        src={`/assets/images/icon/${channel_item.menu_image}`}
                                                        className="img-fluid rounded"
                                                        alt={channel_item.menu_name}
                                                        loading="lazy"
                                                    />
                                                </a>
                                                {/* Collapsible content */}

                                            </>
                                        ) : (

                                            <Link className={`${channelState[channel_item.page_name] ? 'nav-link active' : 'nav-link'}`} aria-current="page" to={`/${channel_item.page_name}`}  >
                                                <img
                                                    src={`/assets/images/icon/${channel_item.menu_image}`}
                                                    className="img-fluid rounded"
                                                    alt={channel_item.menu_name}
                                                    loading="lazy"
                                                />
                                            </Link>

                                        )}
                                    </li>
                                ))
                            ) : null}
                        </ul>

                        {/* <!-- Sidebar Menu End -->         */}
                    </div>
                </div>
                <div class="sidebar-footer"></div>
            </aside>
            <div class="aside-subar">
                <div class=" ">
                    <div class="accordion accordion-flush" id="accordionFlushExample">
                        {menuData && menuData.length > 0 ? (
                            menuData.map((channel_item, index) => (
                                <div id={`flush-collapse${channel_item.id}`} class="accordion-collapse collapse" data-bs-parent="#accordionFlushExample">
                                    <div class="card mt-2">
                                        <div class="accordion-body sidebar-base2 sidebar2 sidebar-default2   sidebar-soft2 navs-rounded-all2 p-0 py-3">
                                            <div class="sidebar-body pt-0 data-scrollbar">
                                                <div class="sidebar-list">
                                                    {/* <!-- Sidebar Menu Start --> */}
                                                    <ul class="navbar-nav iq-main-menu" id="sidebar-menu">
                                                        <li class="nav-item">
                                                            <Link class="nav-link " to={`/${channel_item.page_name}`} >
                                                                <i class={`${channel_item.menu_icons} fs-4`} aria-hidden="true"></i>

                                                                <span class="item-name">{channel_item.menu_name} </span>
                                                            </Link>
                                                        </li>
                                                        {Array.isArray(channel_item.submenu) && channel_item.submenu.length > 0 ? (
                                                            channel_item.submenu.map((sub_menu_item, index) => (
                                                                <>
                                                                    {Array.isArray(sub_menu_item.submenu) && sub_menu_item.submenu.length > 0 ? (
                                                                        <li class="nav-item" onClick={() => toggleMenu(sub_menu_item.page_name)}>
                                                                            <a
                                                                                class="nav-link"
                                                                                data-bs-toggle="collapse"
                                                                                href="#sidebar-messages"
                                                                                role="button"
                                                                                aria-expanded="false"
                                                                                aria-controls="sidebar-auth">
                                                                                <i class="icon material-symbols-outlined">
                                                                                    {`${sub_menu_item.menu_icons}`}
                                                                                </i>
                                                                                <span class="item-name">{sub_menu_item.menu_name}  </span>
                                                                                <i class="right-icon material-symbols-outlined">keyboard_arrow_down</i>
                                                                            </a>
                                                                            <ul className="sub-nav collapse" id="sidebar-messages" data-bs-parent="#sidebar-menu">
                                                                                {sub_menu_item.submenu && sub_menu_item.submenu.length > 0 ? (
                                                                                    sub_menu_item.submenu.map((sub_menu, index) => (
                                                                                        <li class="nav-item">
                                                                                            <Link class="nav-link "
                                                                                                to={`/${channel_item.page_name}/${sub_menu_item.page_name}/${sub_menu.page_name}`}>
                                                                                                <i class="icon material-symbols-outlined filled">
                                                                                                    {`${sub_menu.menu_icons}`}
                                                                                                </i>
                                                                                                <span class="item-name">{sub_menu.menu_name}</span>
                                                                                            </Link>
                                                                                        </li>




                                                                                    ))
                                                                                ) : null}
                                                                            </ul>
                                                                        </li>
                                                                    ) : (
                                                                        <li class="nav-item" onClick={() => toggleMenu(sub_menu_item.page_name)}>
                                                                            <Link class="nav-link " to={`/${channel_item.page_name}/${sub_menu_item.page_name}`}>
                                                                                <i class="icon material-symbols-outlined">
                                                                                    {`${sub_menu_item.menu_icons}`}
                                                                                </i>

                                                                                <span class="item-name">{sub_menu_item.menu_name}</span>
                                                                            </Link>
                                                                        </li>
                                                                    )}
                                                                </>
                                                            ))
                                                        ) : null}


                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : null}

                    </div>
                </div>
            </div>
        </div>
    )
}
