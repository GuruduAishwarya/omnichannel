import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { fetchCustomerMenu } from "../utils/ApiClient";
import {
  getCompanyName,
  truncateName,
  getCookie,
  setCookie,
  triggerAlert,
  set_user_menu_permission,
  get_user_menu_permission,
  isCustomerUser,
  extractAndStoreMenuIds,
} from "../utils/CommonFunctions";
import { useSharedState } from "./components/context/SidebarContext";
import Skeleton from "react-loading-skeleton";

export default function CommunicationSidebar({ toggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarType } = useSharedState();
  const [menuData, setMenuData] = useState([]);
  const currentMenuType = sidebarType;
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState("");
  const [userSubType, setUserSubType] = useState("");
  const [userParentModules, setUserParentModules] = useState([]);
  const [workspaceName, setWorkspaceName] = useState("");

  useEffect(() => {
    const selectedWorkspace = getCookie("selected_workspace_name");
    if (selectedWorkspace) {
      setWorkspaceName(selectedWorkspace);
    }

    const savedUserType = getCookie("userType");
    const savedUserSubType = getCookie("subUserType");
    const savedParentModules = JSON.parse(getCookie("parentModules") || "[]");

    if (savedUserType) {
      setUserType(savedUserType);
    }
    if (savedUserSubType) {
      setUserSubType(savedUserSubType);
    }
    if (savedParentModules.length) {
      setUserParentModules(savedParentModules);
    }
  }, []);

  const workspace_id_from_cookie = getCookie("selected_workspace_id");
  const [workspaceId, setWorkspaceId] = useState(workspace_id_from_cookie || "");

  const hasPermission = (menuId, permissionType = "view") => {
    if (isCustomerUser() || userType === "admin_user" || userSubType === "Admin" || userType === "") {
      return true;
    }

    if (userType === "sub_user") {
      const menuIdNumber = Number(menuId);

      if (permissionType === "view") {
        return userParentModules.includes(menuIdNumber);
      }

      const typeMap = permissionType === "download" ? "export" : permissionType;
      return get_user_menu_permission(menuIdNumber, typeMap);
    }

    return false;
  };

  const renderPermissionIcons = (menuItem) => {
    if (userType !== "sub_user") return null;

    return (
      <span className="permission-icons ms-1" style={{ fontSize: "10px" }}>
        {hasPermission(menuItem.id, "add") && (
          <i className="ri-add-line text-success" title="Add Permission"></i>
        )}
        {hasPermission(menuItem.id, "edit") && (
          <i className="ri-edit-line text-primary mx-1" title="Edit Permission"></i>
        )}
        {hasPermission(menuItem.id, "delete") && (
          <i className="ri-delete-bin-line text-danger" title="Delete Permission"></i>
        )}
        {hasPermission(menuItem.id, "download") && (
          <i className="ri-download-line text-info ms-1" title="Download Permission"></i>
        )}
      </span>
    );
  };

  const fetchMenuListApi = async () => {
    setIsLoading(true);
    try {
      const response = await fetchCustomerMenu(currentMenuType, workspaceId);
      const response_data = response;

      if (response_data.error_code === 200) {
        const itemsArray = response_data.results.data;
        const user_data = itemsArray?.user_data;
        const user_type = user_data.user_type;
        const user_sub_type = user_data.sub_user_type;
        const menu_data = itemsArray.menu_data;

        const menuIdMap = extractAndStoreMenuIds(menu_data);
        console.log("Menu ID Map extracted:", menuIdMap);

        setMenuData(menu_data);
        setUserType(user_type);
        setUserSubType(user_sub_type);
        setCookie("userType", user_type);
        setCookie("subUserType", user_sub_type);

        if (user_type === "customer" || user_type === "admin_user" || user_sub_type === "Admin") {
          const allModuleIds = menu_data.map((item) => item.id);
          setUserParentModules(allModuleIds);
          setCookie("parentModules", JSON.stringify(allModuleIds));
        } else if (user_type === "sub_user") {
          const permissions = itemsArray.permissions?.[0];

          if (permissions) {
            if (!permissions.parent_id || permissions.parent_id === "") {
              console.log("Sub-user has no menu permissions (empty parent_id)");
              setMenuData([]);
              setUserParentModules([]);
              setCookie("parentModules", JSON.stringify([]));
              setCookie("noPermissions", "true");

              if (location.pathname !== "/dashboard") {
                navigate("/dashboard");
              }
              return;
            }

            setCookie("noPermissions", "false");

            const parentIds = permissions.parent_id
              ? permissions.parent_id.split(",").map(Number)
              : [];
            const addIds = permissions.menu_id_add
              ? permissions.menu_id_add.split(",").map(Number)
              : [];
            const editIds = permissions.menu_id_edit
              ? permissions.menu_id_edit.split(",").map(Number)
              : [];
            const deleteIds = permissions.menu_id_delete
              ? permissions.menu_id_delete.split(",").map(Number)
              : [];
            const downloadIds = permissions.excel_export
              ? permissions.excel_export.split(",").map(Number)
              : [];

            setUserParentModules(parentIds);
            setCookie("parentModules", JSON.stringify(parentIds));

            set_user_menu_permission(addIds, editIds, deleteIds, downloadIds);

            const filteredMenuData = filterMenuDataBasedOnPermissions(menu_data, parentIds);
            setMenuData(filteredMenuData);
          } else {
            console.log("No permissions found, redirecting to dashboard");
            navigate("/dashboard");
            return;
          }
        }
      } else if (response.status === 204) {
        triggerAlert("warning", "No Data", "No menu data available.");
      } else {
        triggerAlert("error", "Oops...", "Failed to fetch menu data.");
      }
    } catch (error) {
      console.error("Error fetching menu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterMenuDataBasedOnPermissions = (menuData, parentIds) => {
    return menuData.filter(item => parentIds.includes(item.id));
  };

  const checkMenuPermission = (pathname) => {
    const pathSegments = pathname.split("/").filter(Boolean);
    const mainPath = pathSegments[0] || "";
    const subPath = pathSegments[1] || "";
    const nestedPath = pathSegments[2] || "";

    if (mainPath === "dashboard" || (mainPath === "profile" && !subPath)) {
      sessionStorage.setItem("currentPagePermissions", JSON.stringify({ view: true }));
      return true;
    }

    if (isCustomerUser() || userType === "admin_user" || userSubType === "Admin") {
      sessionStorage.setItem("currentPagePermissions", JSON.stringify({ view: true }));
      return true;
    }

    if (userType === "sub_user") {
      if (!userParentModules.length) {
        console.log("User has no menu permissions, redirecting to dashboard");
        return false;
      }

      const menuItem = menuData.find((item) => item.page_name === mainPath);
      if (!menuItem) {
        console.log(`Menu item not found for path: ${mainPath}`);
        return false;
      }

      if (!subPath) {
        const hasMainMenuAccess = userParentModules.includes(Number(menuItem.id));
        console.log(`Main menu ${mainPath} (ID: ${menuItem.id}) - Access: ${hasMainMenuAccess}`);
        return hasMainMenuAccess;
      }

      if (subPath && menuItem.submenu) {
        const subMenuItem = menuItem.submenu.find((subItem) => subItem.page_name === subPath);
        if (!subMenuItem) {
          console.log(`Submenu item not found for path: ${subPath}`);
          return false;
        }

        const hasSubMenuAccess = userParentModules.includes(Number(subMenuItem.id));
        console.log(`Submenu ${subPath} (ID: ${subMenuItem.id}) - Access: ${hasSubMenuAccess}`);

        if (!hasSubMenuAccess) {
          console.log(`No access to submenu ${subPath}, redirecting to dashboard`);
          return false;
        }

        if (nestedPath && subMenuItem.submenu) {
          const nestedItem = subMenuItem.submenu.find(item => item.page_name === nestedPath);
          if (!nestedItem) {
            console.log(`Nested menu item not found for path: ${nestedPath}`);
            return false;
          }

          const hasNestedAccess = userParentModules.includes(Number(nestedItem.id));
          if (!hasNestedAccess) {
            console.log(`No access to nested menu ${nestedPath}, redirecting to dashboard`);
            return false;
          }
        }
      }

      sessionStorage.setItem("currentPagePermissions", JSON.stringify({ view: true }));
      return true;
    }

    sessionStorage.setItem("currentPagePermissions", JSON.stringify({ view: true }));
    return true;
  };

  useEffect(() => {
    if (!menuData.length || !userType) return;

    const hasAccess = checkMenuPermission(location.pathname);
    if (!hasAccess) {
      console.log(`Access denied for path: ${location.pathname}, redirecting to dashboard`);
      navigate("/dashboard");
    } else {
      sessionStorage.setItem("lastValidPath", location.pathname);
    }
  }, [location.pathname, menuData, userType, userSubType, userParentModules, navigate]);

  useEffect(() => {
    if (currentMenuType !== undefined) {
      fetchMenuListApi();
    }
  }, [currentMenuType, workspaceId]);

  const pathSegments = location.pathname.split("/").filter(Boolean);
  const activeMenu = pathSegments[0];
  const activeSubMenu = pathSegments[1];
  const activeNestedItem = pathSegments[2];

  const company_name = getCompanyName();

  const isActive = (menuPath, subMenuPath, nestedItemPath) => {
    return (
      menuPath === activeMenu &&
      (subMenuPath === activeSubMenu || !subMenuPath) &&
      (nestedItemPath === activeNestedItem || !nestedItemPath)
    );
  };

  useEffect(() => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    if (pathSegments[0]) {
      setExpandedMenu(pathSegments[0]);
    }
  }, [location.pathname]);

  const handleMenuClick = (menuPageName, event) => {
    if (expandedMenu === menuPageName) {
      setExpandedMenu(null);
    } else {
      setExpandedMenu(menuPageName);
    }
  };

  return (
    <aside
      className={`sidebar sidebar-default sidebar-base navs-rounded-all sidebar-hover ${toggleSidebar ? "sidebar-mini" : ""
        }`}
      id="first-tour"
      data-toggle="main-sidebar"
      data-sidebar="responsive"
    >
      <div
        className="sidebar-body pt-0 data-scrollbar"
        data-scrollbar="true"
        tabIndex="-1"
        style={{ overflow: "hidden", outline: "none" }}
      >
        <div className="scroll-content">
          <div className="sidebar-list">
            <ul className="navbar-nav iq-main-menu" id="sidebar-menu">
              {isLoading ? (
                <li className="nav-item mt-3 mb-0">
                  <Skeleton rectangle width={40} height={40} count={10} />
                </li>
              ) : (
                <>
                  <li className="nav-item mt-3 mb-0">
                    <a className="nav-link static-item disabled" href="#" tabIndex="-1">
                      <span className="default-icon fw-500 text-primay">
                        {workspaceName
                          ? truncateName(workspaceName, 25)
                          : company_name
                            ? truncateName(company_name, 25)
                            : "-"}
                      </span>
                      <span
                        className="mini-icon"
                        data-bs-toggle="tooltip"
                        data-bs-placement="right"
                        data-bs-original-title="Social"
                      >
                        {workspaceName
                          ? truncateName(workspaceName, 1)
                          : company_name && truncateName(company_name, 1)}
                      </span>
                    </a>
                  </li>
                  {menuData &&
                    menuData.length > 0 &&
                    menuData.map((menuItem, index) => {
                      if (!hasPermission(menuItem.id, "view")) return null;

                      const isActiveMenu = menuItem.page_name === activeMenu;
                      const isMenuExpanded = menuItem.page_name === expandedMenu;

                      return (
                        <li className={`nav-item ${isActiveMenu ? "active" : ""}`} key={index}>
                          <a
                            className={`nav-link ${isActiveMenu ? "active" : ""}`}
                            data-bs-toggle="collapse"
                            href={`#menu-item-${index}`}
                            role="button"
                            aria-expanded={isMenuExpanded}
                            aria-controls={`menu-item-${index}`}
                            aria-current="page"
                            onClick={(e) => handleMenuClick(menuItem.page_name, e)}
                          >
                            <img
                              src={`/assets/images/icon/${menuItem.menu_image}`}
                              className="img-fluid"
                              alt={menuItem.menu_name}
                              loading="lazy"
                            />
                            <span className="item-name">{menuItem.menu_name}</span>
                            {renderPermissionIcons(menuItem)}
                            <i className="right-icon material-symbols-outlined">chevron_right</i>
                          </a>

                          {menuItem.submenu && menuItem.submenu.length > 0 && (
                            <ul
                              className={`sub-nav collapse ${isMenuExpanded ? "show" : ""}`}
                              id={`menu-item-${index}`}
                              data-bs-parent="#sidebar-menu"
                            >
                              {menuItem.submenu.map((subItem, subIndex) => {
                                if (!hasPermission(subItem.id, "view")) return null;

                                const isActiveSubMenu = isActive(menuItem.page_name, subItem.page_name, null);

                                return (
                                  <li className="nav-item mt-2" key={subIndex}>
                                    <Link
                                      className={`nav-link ${isActiveSubMenu ? "active" : ""}`}
                                      data-bs-toggle={
                                        subItem.submenu && subItem.submenu.length > 0 ? "collapse" : ""
                                      }
                                      to={
                                        subItem.submenu && subItem.submenu.length > 0
                                          ? `#friend-list${index}-${subIndex}`
                                          : `/${menuItem.page_name}/${subItem.page_name}`
                                      }
                                      aria-expanded={isActiveSubMenu}
                                      aria-current="page"
                                    >
                                      {/\.(png|jpe?g|gif)$/i.test(subItem.menu_image) ? (
                                        <img
                                          src={`/assets/images/icon/${subItem.menu_image}`}
                                          className="img-fluid"
                                          alt={subItem.menu_name}
                                          loading="lazy"
                                          width="25"
                                        />
                                      ) : (
                                        <i className="icon material-symbols-outlined sidenav-mini-icon">
                                          {subItem.menu_image}
                                        </i>
                                      )}
                                      <span className="item-name">{subItem.menu_name}</span>
                                      {renderPermissionIcons(subItem)}
                                      {subItem.submenu && subItem.submenu.length > 0 && (
                                        <i className="right-icon material-symbols-outlined">chevron_right</i>
                                      )}
                                    </Link>

                                    {subItem.submenu && subItem.submenu.length > 0 && (
                                      <ul
                                        className={`sub-nav collapse ${isActiveSubMenu ? "show" : ""}`}
                                        id={`friend-list${index}-${subIndex}`}
                                        data-bs-parent={`#menu-item-${index}`}
                                      >
                                        {subItem.submenu.map((nestedItem, nestedIndex) => {
                                          if (!hasPermission(nestedItem.id, "view")) return null;

                                          const isActiveNestedItem = isActive(
                                            menuItem.page_name,
                                            subItem.page_name,
                                            nestedItem.page_name
                                          );
                                          return (
                                            <li className="nav-item" key={nestedIndex}>
                                              <Link
                                                className={`nav-link ${isActiveNestedItem ? "active" : ""}`}
                                                to={`/${menuItem.page_name}/${subItem.page_name}/${nestedItem.page_name}`}
                                              >
                                                <i className="icon material-symbols-outlined sidenav-mini-icon">
                                                  {nestedItem.menu_image}
                                                </i>
                                                <span className="item-name">
                                                  {nestedItem.menu_name
                                                    ? truncateName(nestedItem.menu_name, 15)
                                                    : "-"}
                                                  {renderPermissionIcons(nestedItem)}
                                                </span>
                                              </Link>
                                            </li>
                                          );
                                        })}
                                      </ul>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                </>
              )}
            </ul>
          </div>
        </div>
        <div className="scrollbar-track scrollbar-track-x" style={{ display: "none" }}>
          <div
            className="scrollbar-thumb scrollbar-thumb-x"
            style={{ width: "250px", transform: "translate3d(0px, 0px, 0px)" }}
          ></div>
        </div>
        <div className="scrollbar-track scrollbar-track-y" style={{ display: "block" }}>
          <div
            className="scrollbar-thumb scrollbar-thumb-y"
            style={{ height: "71.025px", transform: "translate3d(0px, 0px, 0px)" }}
          ></div>
        </div>
      </div>
    </aside>
  );
}
