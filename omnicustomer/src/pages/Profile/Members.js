import React, { useState, useEffect, useReducer, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { fetchSubUsersList, createSubUser, deleteSubUser, editSubUser, fetchSubUserPermission, createRolePermissions, fetchPermissionMenuWithWorkspaceId, fetchPaymentData, fetchSubUserPaymentPermission, createPaymentPermissions } from "../../utils/ApiClient";
import { triggerAlert, handleTableRowClick, ConfirmationAlert, AlertWithExtraButton } from "../../utils/CommonFunctions";
import { MaxLengthValidation, MinLengthValidation, onlyNumbers, passwordPattern } from "../../utils/Constants";
import PaginationComponent from "../../common/components/PaginationComponent";
import Loader from "../../common/components/Loader";
import Button from "react-bootstrap/Button";
import { FaPlus, FaEdit, FaTrash, FaCheck, FaShieldAlt, FaEye, FaEyeSlash, FaUserPlus, FaInfo, FaArrowLeft, FaWallet } from 'react-icons/fa';
import MultiSelectDyGet from "../../common/components/selects/MultiSelectDyGet";
import { getCookie } from '../../utils/CommonFunctions';
// Initial state
const initialState = {
  isFormVisible: false,
  isPermissionLoading: false,
  subUserList: [],
  isLoading: false,
  pageCount: 0,
  currentPage: 0,
  perPageLimit: 10,
  searchTerm: '',
  selectedRow: null,
  selectedRowId: null,
  permissionShow: false,
  userPermissionId: "",
  menuData: [],
  checkedActions: { view: [], add: [], edit: [], delete: [], excel_export: [] }, // Scoped permissions
  showPassword: false,
  currentView: 'list',
  allowedWorkspaces: [],
  workspaceVisible: true,
  isWorkspaceLoading: false,
  activePermissions: {}, // Permissions by workspace
};
// Action types
const actions = {
  TOGGLE_FORM: 'TOGGLE_FORM',
  SET_LOADING: 'SET_LOADING',
  SET_PERMISSION_LOADING: 'SET_PERMISSION_LOADING',
  SET_USERS: 'SET_USERS',
  SET_PAGE_COUNT: 'SET_PAGE_COUNT',
  SET_CURRENT_PAGE: 'SET_CURRENT_PAGE',
  SET_SELECTED_ROW: 'SET_SELECTED_ROW',
  SET_PERMISSION_SHOW: 'SET_PERMISSION_SHOW',
  SET_MENU_DATA: 'SET_MENU_DATA',
  UPDATE_CHECKED_PERMISSIONS: 'UPDATE_CHECKED_PERMISSIONS',
  TOGGLE_PASSWORD: 'TOGGLE_PASSWORD',
  SET_VIEW: 'SET_VIEW',
  SET_ALLOWED_WORKSPACES: 'SET_ALLOWED_WORKSPACES',
  SET_WORKSPACE_VISIBLE: 'SET_WORKSPACE_VISIBLE',
  CLEAR_MENU_DATA: 'CLEAR_MENU_DATA',
  SET_WORKSPACE_LOADING: 'SET_WORKSPACE_LOADING',
  SET_ACTIVE_PERMISSIONS: 'SET_ACTIVE_PERMISSIONS',
};
// Reducer function
const memberReducer = (state, action) => {
  switch (action.type) {
    case actions.TOGGLE_FORM:
      return { ...state, isFormVisible: !state.isFormVisible };
    case actions.SET_LOADING:
      return { ...state, isLoading: action.payload };
    case actions.SET_PERMISSION_LOADING:
      return { ...state, isPermissionLoading: action.payload };
    case actions.SET_USERS:
      return { ...state, subUserList: action.payload };
    case actions.SET_PAGE_COUNT:
      return { ...state, pageCount: action.payload };
    case actions.SET_CURRENT_PAGE:
      return { ...state, currentPage: action.payload };
    case actions.SET_SELECTED_ROW:
      return { ...state, selectedRow: action.payload.row, selectedRowId: action.payload.id };
    case actions.SET_PERMISSION_SHOW:
      return { ...state, permissionShow: action.payload };
    case actions.SET_MENU_DATA:
      return { ...state, menuData: action.payload.menuData, userPermissionId: action.payload.userId };
    case actions.UPDATE_CHECKED_PERMISSIONS:
      return { ...state, checkedActions: action.payload };
    case actions.TOGGLE_PASSWORD:
      return { ...state, showPassword: !state.showPassword };
    case actions.SET_VIEW:
      return { ...state, currentView: action.payload };
    case actions.SET_ALLOWED_WORKSPACES:
      return { ...state, allowedWorkspaces: action.payload };
    case actions.SET_WORKSPACE_VISIBLE:
      return { ...state, workspaceVisible: action.payload };
    case actions.CLEAR_MENU_DATA:
      return {
        ...state,
        menuData: [],
        checkedActions: { view: [], add: [], edit: [], delete: [], excel_export: [] },
        activePermissions: {} // Reset activePermissions when clearing menu data
      };
    case actions.SET_WORKSPACE_LOADING:
      return { ...state, isWorkspaceLoading: action.payload };
    case actions.SET_ACTIVE_PERMISSIONS:
      return { ...state, activePermissions: { ...state.activePermissions, [action.payload.workspaceId]: action.payload.permissions } };
    default:
      return state;
  }
};
const NoDataMessage = ({ type, customMessage }) => {
  const messages = {
    workspace: { icon: 'business', title: 'No Workspace Selected', description: 'No workspaces have been assigned yet.' },
    users: { icon: 'group_off', title: 'No Users Found', description: 'No users are available.' },
    permissions: { icon: 'security', title: 'No Permissions Set', description: 'No permissions have been configured for this workspace.' },
    custom: { icon: 'info', title: customMessage?.title || 'No Data Available', description: customMessage?.description || 'No data is available at the moment.' }
  };
  const { icon, title, description } = messages[type] || messages.custom;
  return (
    <div className="col-12">
      <div className="text-center p-5">
        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#6c757d' }}>{icon}</span>
        <h5 className="mt-3">{title}</h5>
        <p className="text-muted">{description}</p>
      </div>
    </div>
  );
};
const Members = ({ setShowTabs }) => {
  const [permissionData, setPermissionData] = useState([]);
  const [state, dispatch] = useReducer(memberReducer, initialState);
  const { register, handleSubmit, control, formState: { errors }, setValue, watch, reset } = useForm();
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const watchword = watch("password");
  const api_url = process.env.REACT_APP_API_BASE_URL;
  const workspaceApiUrl = useMemo(() => api_url + "workspace/workspace_listing/", [api_url]);
  const userTypeFromCookie = getCookie('user_type');
  const [isPaymentPermission, setIsPaymentPermission] = useState(false); // New state for payment permissions
  const toggleVisibility = () => dispatch({ type: actions.TOGGLE_FORM });
  // Add this new function to properly handle adding a new user
  const addNewUser = () => {
    // Clear any selected user first
    dispatch({ type: actions.SET_SELECTED_ROW, payload: { row: null, id: null } });
    // Reset the form to ensure all fields are empty
    reset({
      name: "",
      phone_no: "",
      watch_word: "",
      password: "",
      user_email: "",
      role: "",
      status: "",
      sub_uesr_id: ""
    });
    // Show the form
    dispatch({ type: actions.TOGGLE_FORM });
  };
  const clearWorkspaceData = () => {
    setWorkspaces([]);
    setActiveWorkspace(null);
    setPermissionData([]);
    dispatch({ type: actions.CLEAR_MENU_DATA });
    dispatch({ type: actions.SET_ALLOWED_WORKSPACES, payload: [] });
    // Explicitly reset checked actions to ensure fresh state
    dispatch({ type: actions.UPDATE_CHECKED_PERMISSIONS, payload: { view: [], add: [], edit: [], delete: [], excel_export: [] } });
  };
  const onSubmit = async (data) => {
    dispatch({ type: actions.SET_LOADING, payload: true });
    try {
      const formData = { ...data, watch_word: data.password };
      const response = data.sub_uesr_id ? await editSubUser(data.sub_uesr_id, formData) : await createSubUser(formData);
      if (response.data.error_code === 200 || response.data.error_code === 201) {
        triggerAlert("success", "Success", `User ${data.sub_uesr_id ? 'updated' : 'created'} successfully`);
        reset();
        dispatch({ type: actions.TOGGLE_FORM });
        if (!data.sub_uesr_id) {
          dispatch({ type: actions.SET_SELECTED_ROW, payload: { row: null, id: null } });
          clearWorkspaceData();
        }
        fetchSubUsers();
      } else throw new Error(response.data.message || "Operation failed");
    } catch (error) {
      // Check for email duplication errors
      const errorMsg = error.response?.data?.message || error.message || "Operation failed";
      // Check if the error is related to email duplication
      if (errorMsg.toLowerCase().includes("email") &&
        (errorMsg.toLowerCase().includes("exist") ||
          errorMsg.toLowerCase().includes("already") ||
          errorMsg.toLowerCase().includes("duplicate") ||
          errorMsg.toLowerCase().includes("in use"))) {
        triggerAlert("error", "Email Already Exists", "The email address is already registered in the system. Please use a different email address.");
      } else {
        triggerAlert("error", "Error", errorMsg);
      }
    } finally {
      dispatch({ type: actions.SET_LOADING, payload: false });
    }
  };
  const handlePageClick = (selected) => {
    const newPage = selected.selected;
    dispatch({ type: actions.SET_CURRENT_PAGE, payload: newPage });
    fetchSubUsers(newPage + 1); // Ensure the correct page number is passed to the API
  };
  const fetchSubUsers = async (page = state.currentPage + 1) => {
    dispatch({ type: actions.SET_LOADING, payload: true });
    try {
      const response = await fetchSubUsersList({
        page: page,
        per_page: state.perPageLimit,
        search: state.searchTerm,
      });
      if (response.data.error_code === 200) {
        const users = response.data.results?.data || [];
        if (users.length > 0) {
          dispatch({ type: actions.SET_USERS, payload: users });
          dispatch({
            type: actions.SET_PAGE_COUNT,
            payload: response.data.results.pagination?.total_pages || 0,
          });
        } else {
          dispatch({ type: actions.SET_USERS, payload: [] });
          dispatch({ type: actions.SET_PAGE_COUNT, payload: 0 });
          triggerAlert("info", "Info", response.data.message || "No users found");
        }
      }
      else {
        // Handle other error codes
        dispatch({ type: actions.SET_USERS, payload: [] });
        dispatch({ type: actions.SET_PAGE_COUNT, payload: 0 });
        const errorMessage = response.data.message || "Failed to fetch users";
        triggerAlert("error", "Error", errorMessage);
      }
    } catch (error) {
      // Handle any unexpected errors
      triggerAlert("error", "Error", error.message || "An unexpected error occurred");
      dispatch({ type: actions.SET_USERS, payload: [] });
      dispatch({ type: actions.SET_PAGE_COUNT, payload: 0 });
    } finally {
      dispatch({ type: actions.SET_LOADING, payload: false });
    }
  };
  const deleteSubUsers = async () => {
    if (state.selectedRowId) {
      ConfirmationAlert("You want to continue!", "Continue", async () => {
        dispatch({ type: actions.SET_LOADING, payload: true });
        try {
          const response = await deleteSubUser(state.selectedRowId);
          if (response.data.error_code === 200) {
            triggerAlert("success", "success", "User deleted successfully");
            fetchSubUsers();
          } else triggerAlert("error", "Oops...", "Failed to delete sub user");
        } catch (error) {
          triggerAlert("error", "Oops...", error?.response?.data?.message || "Something went wrong!");
        } finally {
          dispatch({ type: actions.SET_LOADING, payload: false });
        }
      });
    } else triggerAlert("info", "", "Please select a sub user");
  };
  const editSubUsers = () => {
    if (!state.selectedRow) {
      triggerAlert("info", "", "Please select a user to edit");
      return;
    }
    // First reset the form to clear any previous values
    reset();
    // Then set all form values at once (more reliable than individual setValue calls)
    reset({
      name: state.selectedRow.name,
      phone_no: state.selectedRow.phone_no,
      watch_word: state.selectedRow.watch_word,
      password: state.selectedRow.watch_word,
      user_email: state.selectedRow.user_email,
      role: state.selectedRow.role,
      status: state.selectedRow.status,
      sub_uesr_id: state.selectedRow.id
    });
    dispatch({ type: actions.TOGGLE_FORM });
  };
  const cancelForm = () => {
    dispatch({ type: actions.TOGGLE_FORM });
    reset();
  };
  // const handlePageClick = (selected) => {
  //   dispatch({ type: actions.SET_CURRENT_PAGE, payload: selected.selected });
  //   fetchSubUsers();
  // };
  const props = { pageCount: state.pageCount, handlePageClick };
  const handleMgUsersPermissionShow = () => dispatch({ type: actions.SET_PERMISSION_SHOW, payload: true });

  const editSubUserPermission = async (id, name) => {
    dispatch({ type: actions.SET_PERMISSION_SHOW, payload: true });
    dispatch({ type: actions.SET_PERMISSION_LOADING, payload: true });
    try {
      // Reset active permissions for a fresh start with this user
      dispatch({ type: actions.CLEAR_MENU_DATA });
      const response = await fetchSubUserPermission({ sub_user_id: id });
      if (response.status === 204 || !response.data.results || response.data.results.length === 0) {
        triggerAlert("info", "No Data", "This user currently has no assigned workspace permissions. Please select a workspace and grant the necessary access to proceed.");
        setPermissionData([]);
        dispatch({ type: actions.SET_ALLOWED_WORKSPACES, payload: [] });
        dispatch({ type: actions.SET_WORKSPACE_VISIBLE, payload: true });
        handleMgUsersPermissionShow();
        return;
      }
      const respdata = response.data.results || [];
      if (response.data.error_code === 200) {
        if (!respdata.length) {
          setPermissionData([]);
          dispatch({ type: actions.SET_ALLOWED_WORKSPACES, payload: [] });
          dispatch({ type: actions.SET_WORKSPACE_VISIBLE, payload: true });
          handleMgUsersPermissionShow();
          return;
        }
        setPermissionData(respdata);
        const permissionsByWorkspace = {};
        // Deduplicate workspaces
        const uniqueWorkspaces = Array.from(
          new Map(respdata.map(p => [p.workspace_id, { value: p.workspace_id, label: p.company_name || 'Workspace' }])).values()
        );
        setWorkspaces(uniqueWorkspaces); // Set deduplicated workspaces
        // Clear existing permissions first
        dispatch({ type: actions.CLEAR_MENU_DATA });
        respdata.forEach(workspacePermission => {
          const { workspace_id, menu_id_view, menu_id_add, menu_id_edit, menu_id_delete, excel_export } = workspacePermission;
          const permissionsByType = {
            view: menu_id_view && menu_id_view !== "" ? menu_id_view.split(',').map(Number) : [],
            add: menu_id_add && menu_id_add !== "" ? menu_id_add.split(',').map(Number) : [],
            edit: menu_id_edit && menu_id_edit !== "" ? menu_id_edit.split(',').map(Number) : [],
            delete: menu_id_delete && menu_id_delete !== "" ? menu_id_delete.split(',').map(Number) : [],
            excel_export: excel_export && excel_export !== "" ? excel_export.split(',').map(Number) : []
          };
          permissionsByWorkspace[workspace_id] = permissionsByType;
          dispatch({ type: actions.SET_ACTIVE_PERMISSIONS, payload: { workspaceId: workspace_id, permissions: permissionsByType } });
        });
        const allowedWorkspaceIds = uniqueWorkspaces.map(w => w.value);
        dispatch({ type: actions.SET_ALLOWED_WORKSPACES, payload: allowedWorkspaceIds });
        dispatch({ type: actions.SET_WORKSPACE_VISIBLE, payload: allowedWorkspaceIds.length === 0 });
        if (allowedWorkspaceIds.length > 0) {
          const initialWorkspace = allowedWorkspaceIds[0];
          const initialPermissions = permissionsByWorkspace[initialWorkspace];
          dispatch({ type: actions.UPDATE_CHECKED_PERMISSIONS, payload: initialPermissions });
          setActiveWorkspace(initialWorkspace); // Set the first workspace as active
        }
        handleMgUsersPermissionShow();
      } else {
        throw new Error(response.data.message || 'Failed to fetch permissions');
      }
    } catch (error) {
      triggerAlert("error", "Oops...", "Failed to fetch permissions");
      setPermissionData([]);
      dispatch({ type: actions.SET_ALLOWED_WORKSPACES, payload: [] });
      dispatch({ type: actions.SET_WORKSPACE_VISIBLE, payload: true });
    } finally {
      dispatch({ type: actions.SET_PERMISSION_LOADING, payload: false });
    }
  };
  const mgUserPermissionEdit = async (addition_user_purchase = 0) => {
    try {
      // Debug information to help identify the issue
      // console.log("Debug - selectedRowId:", state.selectedRowId);
      // console.log("Debug - workspaces:", workspaces);
      // console.log("Debug - userPermissionId:", state.userPermissionId);

      // Use userPermissionId as fallback if selectedRowId is not available
      const effectiveUserId = state.selectedRowId || state.userPermissionId;

      // Re-enable this critical check to prevent null user IDs
      if (!effectiveUserId) {
        triggerAlert("warning", "Missing User", "No user is currently selected. Please go back and select a user.");
        return;
      }

      if (workspaces.length === 0) {
        triggerAlert("warning", "No Workspace", "Please select at least one workspace before saving permissions.");
        return;
      }

      // Create a bulk permissions payload for all workspaces
      const bulkPermissionsPayload = workspaces.map(workspace => {
        const workspaceId = workspace.value;
        const permissions = state.activePermissions[workspaceId] || {
          view: [], add: [], edit: [], delete: [], excel_export: []
        };

        // Ensure we have a valid sub_user_id before sending to API
        if (!effectiveUserId) {
          throw new Error("Cannot create permissions without a valid user ID");
        }

        // Build parent_id specific to this workspace using its menu data
        const parentId = buildParentIdString(permissions.view || [], workspaceId);

        // console.log(`Workspace ${workspaceId} parent_id: ${parentId}`);

        return {
          sub_user_id: effectiveUserId,
          workspace_id: workspaceId,
          parent_id: parentId,
          menu_id_view: (permissions.view || []).join(','),
          menu_id_add: (permissions.add || []).join(','),
          menu_id_edit: (permissions.edit || []).join(','),
          menu_id_delete: (permissions.delete || []).join(','),
          excel_export: (permissions.excel_export || []).join(',')
        };
      });

      // console.log("Bulk permissions payload:", bulkPermissionsPayload);
      const payloadWithFlag = bulkPermissionsPayload.map((item) => ({
        ...item,
        additional_users: addition_user_purchase
      }));

      console.log("payloadWithFlag", payloadWithFlag);

      // Call API with bulk permissions payload
      const response = await createRolePermissions(payloadWithFlag);

      if (response.data.error_code === 200) {
        // Update the permissions data in state
        setPermissionData(prev => {
          // Remove existing permissions for these workspaces
          const filteredData = prev.filter(p => !workspaces.some(w => w.value === p.workspace_id));

          // Add the new permissions
          const newPermissions = bulkPermissionsPayload.map(payload => ({
            ...payload,
            company_name: workspaces.find(w => w.value === payload.workspace_id)?.label || "Unknown"
          }));

          return [...filteredData, ...newPermissions];
        });

        // Close the permissions modal
        dispatch({ type: actions.SET_PERMISSION_SHOW, payload: false });
        triggerAlert("success", "Success", response.data.message || "Permissions updated successfully for all workspaces");
        handleBackToList();
      }
    } catch (error) {
      const res = error.response?.data;
      console.error("Error updating permissions:", error);

      if (res?.message?.includes("Invalid sub_user_id")) {
        triggerAlert(
          "error",
          "User ID Error",
          res.message || "Could not save permissions: The user ID is missing or invalid."
        );
      } else if (
        error.response?.status === 400 &&
        Array.isArray(res?.results) &&
        res.results.includes("addition_user_purchase")
      ) {
        AlertWithExtraButton(
          "info",
          res?.message,
          "Purchase Additional User",
          async () => {
            await mgUserPermissionEdit(1); // now properly awaited
            // Swal.fire("Done", "Additional user added successfully", "success");
          }
        );
      } else {
        triggerAlert("error", "Error", res?.message || "Failed to update permissions");
      }
    }

  };

  const savePaymentPermissions = async () => {
    try {
      if (!state.selectedRowId) {
        triggerAlert("warning", "Missing User", "No user is currently selected. Please go back and select a user.");
        return;
      }
      const effectiveUserId = state.selectedRowId || state.userPermissionId;
      if (!effectiveUserId) {
        throw new Error("Cannot create permissions without a valid user ID");
      }

      // Helper function to ensure clean number arrays (no duplicates, no strings)
      const cleanPermissionArray = (arr) => {
        if (!arr || !Array.isArray(arr)) return [];

        // Flatten and convert all to numbers, filter out NaN
        const numbers = arr.map(item => {
          if (typeof item === 'string') {
            // Split string and convert each part to number
            return item.split(',').map(Number);
          }
          return Number(item);
        }).flat().filter(num => !isNaN(num) && num !== 0);

        // Remove duplicates using Set
        return [...new Set(numbers)].sort((a, b) => a - b);
      };

      // Get permissions directly from checkedActions and clean them
      const permissions = state.checkedActions || {
        view: [],
        add: [],
        edit: [],
        delete: [],
        excel_export: [],
      };

      const cleanedPermissions = {
        view: cleanPermissionArray(permissions.view),
        add: cleanPermissionArray(permissions.add),
        edit: cleanPermissionArray(permissions.edit),
        delete: cleanPermissionArray(permissions.delete),
        excel_export: cleanPermissionArray(permissions.excel_export),
      };

      // Build parent_id array from the selected view permissions
      const parentIdString = buildParentIdString(cleanedPermissions.view);

      // Parse the parentIdString into an array of numbers and remove duplicates
      const parentIdArray = parentIdString
        ? [...new Set(parentIdString.split(',').map(Number).filter(num => !isNaN(num) && num !== 0))].sort((a, b) => a - b)
        : [];

      // Construct the payload with proper array format
      const apiInput = {
        sub_user_id: effectiveUserId,
        parent_id: parentIdArray,
        menu_id_view: cleanedPermissions.view,
        menu_id_add: cleanedPermissions.add,
        menu_id_edit: cleanedPermissions.edit,
        menu_id_delete: cleanedPermissions.delete,
        excel_export: cleanedPermissions.excel_export,
      };

      // Log the payload for debugging
      console.log("Payment Permissions Payload:", apiInput);

      // Call the correct API for payment permissions
      const response = await createPaymentPermissions(apiInput);
      const responseData = response.data;
      if (responseData.error_code === 200) {
        triggerAlert("success", "Success", responseData.message || "Payment permissions updated successfully");
        handleBackToList();
      } else {
        throw new Error(responseData.message || "Failed to update payment permissions");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to update payment permissions";
      triggerAlert("error", "Error", errorMsg);
    }
  };



  // Initialize workspaceMenuData to store menu data by workspace
  const [workspaceMenuData, setWorkspaceMenuData] = useState({});
  // Modified buildParentIdString function to handle workspace-specific menu data
  const buildParentIdString = (selectedIds) => {
    if (!selectedIds || !selectedIds.length) return "";
    const menuData = state.menuData;
    if (!menuData || menuData.length === 0) {
      console.warn("No menu data found for payment permissions");
      return "";
    }
    const menuItemMap = {};
    const processMenuItems = (items) => {
      if (!items) return;
      items.forEach(item => {
        menuItemMap[item.id] = item;
        if (item.submenu?.length > 0) processMenuItems(item.submenu);
      });
    };
    processMenuItems(menuData);
    const idSet = new Set();
    selectedIds.forEach(id => {
      const menuItem = menuItemMap[id];
      if (menuItem) {
        idSet.add(id);
        if (menuItem.menu_pid && menuItem.menu_pid !== 0) {
          idSet.add(menuItem.menu_pid);
          let parentId = menuItem.menu_pid;
          let parentItem = menuItemMap[parentId];
          while (parentItem && parentItem.menu_pid && parentItem.menu_pid !== 0) {
            idSet.add(parentItem.menu_pid);
            parentId = parentItem.menu_pid;
            parentItem = menuItemMap[parentId];
          }
        }
      }
    });
    return Array.from(idSet).sort((a, b) => a - b).join(',');
  };



  // Modified fetchMenuItemsbasedonWorkspace function to store menu data by workspace ID
  const fetchMenuItemsbasedonWorkspace = async (workspaceId) => {
    try {
      dispatch({ type: actions.SET_WORKSPACE_LOADING, payload: true });
      const response = await fetchPermissionMenuWithWorkspaceId(workspaceId);
      if (response.data.error_code === 200) {
        const menuData = response.data.results.menu_data || [];
        // Store menu data for this specific workspace
        setWorkspaceMenuData(prev => ({
          ...prev,
          [workspaceId]: menuData
        }));
        dispatch({
          type: actions.SET_MENU_DATA, payload: {
            menuData: menuData,
            userId: state.selectedRowId
          }
        });
        if (!state.activePermissions[workspaceId]) {
          dispatch({
            type: actions.UPDATE_CHECKED_PERMISSIONS, payload: {
              view: [], add: [], edit: [], delete: [], excel_export: []
            }
          });
        }
      } else {
        dispatch({ type: actions.SET_MENU_DATA, payload: { menuData: [], userId: state.selectedRowId } });
      }
    } catch (error) {
      console.error("Error fetching menu data:", error);
      dispatch({ type: actions.SET_MENU_DATA, payload: { menuData: [], userId: state.selectedRowId } });
    } finally {
      dispatch({ type: actions.SET_WORKSPACE_LOADING, payload: false });
    }
  };
  const fetchPaymentPermissions = async () => {
    try {
      // Validate that a user is selected
      if (!state.selectedRowId) {
        triggerAlert("warning", "No User Selected", "Please select a user first before managing payment permissions.");
        return;
      }

      dispatch({ type: actions.SET_WORKSPACE_LOADING, payload: true });

      // 1. Fetch the payment menu data
      const menuResponse = await fetchPaymentData();
      console.log("Payment menu response:", menuResponse.data);
      if (menuResponse.data.error_code !== 200) {
        throw new Error(menuResponse.data.message || "Failed to fetch payment menu data");
      }
      const menuData = menuResponse.data.results?.menu_data || [];

      // 2. Fetch the sub-user's payment permissions
      const permissionResponse = await fetchSubUserPaymentPermission({ sub_user_id: state.selectedRowId });
      console.log("Payment permission response:", permissionResponse.data);

      // Handle different response scenarios
      let permissionData = {};
      if (permissionResponse.data.error_code === 200) {
        permissionData = permissionResponse.data.results || {};
      } else if (permissionResponse.data.error_code === 404 || permissionResponse.status === 204) {
        // No permissions found - this is okay, we'll use empty permissions
        console.log("No existing payment permissions found for user");
        permissionData = {};
      } else {
        throw new Error(permissionResponse.data.message || "Failed to fetch payment permissions");
      }

      // 3. Safely extract permissions
      const checkedActions = {
        view: Array.isArray(permissionData.menu_id_view)
          ? permissionData.menu_id_view
          : (typeof permissionData.menu_id_view === 'string'
            ? permissionData.menu_id_view.split(',').map(Number)
            : []),
        add: Array.isArray(permissionData.menu_id_add)
          ? permissionData.menu_id_add
          : (typeof permissionData.menu_id_add === 'string'
            ? permissionData.menu_id_add.split(',').map(Number)
            : []),
        edit: Array.isArray(permissionData.menu_id_edit)
          ? permissionData.menu_id_edit
          : (typeof permissionData.menu_id_edit === 'string'
            ? permissionData.menu_id_edit.split(',').map(Number)
            : []),
        delete: Array.isArray(permissionData.menu_id_delete)
          ? permissionData.menu_id_delete
          : (typeof permissionData.menu_id_delete === 'string'
            ? permissionData.menu_id_delete.split(',').map(Number)
            : []),
        excel_export: Array.isArray(permissionData.excel_export)
          ? permissionData.excel_export
          : (typeof permissionData.excel_export === 'string'
            ? permissionData.excel_export.split(',').map(Number)
            : []),
      };


      // 4. Update the state
      dispatch({
        type: actions.SET_MENU_DATA,
        payload: {
          menuData: menuData,
          userId: state.selectedRowId,
        },
      });
      dispatch({ type: actions.UPDATE_CHECKED_PERMISSIONS, payload: checkedActions });
      setIsPaymentPermission(true);
    } catch (error) {
      console.error("Error in fetchPaymentPermissions:", error);

      // Provide more specific error messages based on the error type
      let errorMessage = "Failed to fetch payment permissions";

      if (error.response) {
        // API responded with an error status
        const responseData = error.response.data;
        errorMessage = responseData?.message || `API Error: ${error.response.status}`;
      } else if (error.request) {
        // Network error - request was made but no response received
        errorMessage = "Network error: Unable to connect to the server";
      } else {
        // Other error
        errorMessage = error.message || "An unexpected error occurred";
      }

      triggerAlert("error", "Error", errorMessage);
    } finally {
      dispatch({ type: actions.SET_WORKSPACE_LOADING, payload: false });
    }
  };


  const handleCheckbox = (menuItem, action = 'view') => {
    const { id, menu_pid, submenu } = menuItem;
    const isChecked = !state.checkedActions[action].includes(id); // Toggle based on current state
    const newActions = { ...state.checkedActions };
    // Ensure all action types are initialized
    ['view', 'add', 'edit', 'delete', 'excel_export'].forEach(act => {
      newActions[act] = [...(newActions[act] || [])];
    });
    // Helper function to add or remove permissions
    const updatePermission = (itemId, actionType, add) => {
      if (add) {
        if (!newActions[actionType].includes(itemId)) {
          newActions[actionType].push(itemId);
        }
      } else {
        newActions[actionType] = newActions[actionType].filter(i => i !== itemId);
      }
    };
    // Recursively update children permissions
    const updateChildrenPermissions = (children, add) => {
      if (!children || !Array.isArray(children)) return;
      children.forEach(child => {
        // For view permission, add or remove it based on parent's state
        updatePermission(child.id, 'view', add);
        // When adding view permission, also add all other permissions
        if (add) {
          ['add', 'edit', 'delete', 'excel_export'].forEach(act => {
            updatePermission(child.id, act, true);
          });
        }
        // If removing view, also remove all other permissions
        else {
          ['add', 'edit', 'delete', 'excel_export'].forEach(act => {
            updatePermission(child.id, act, false);
          });
        }
        // Process submenu recursively
        if (child.submenu?.length > 0) {
          updateChildrenPermissions(child.submenu, add);
        }
      });
    };
    // Handle parent menu item
    if (menu_pid === 0) {
      updatePermission(id, action, isChecked);
      // If it's a view action being checked, update all other permissions automatically
      if (action === 'view') {
        if (isChecked) {
          // When adding view permission to parent, add all other permissions too
          ['add', 'edit', 'delete', 'excel_export'].forEach(act => {
            updatePermission(id, act, true);
          });
        } else {
          // If removing view, remove all other permissions too
          ['add', 'edit', 'delete', 'excel_export'].forEach(act => {
            updatePermission(id, act, false);
          });
        }
        // Update children permissions recursively
        if (submenu?.length > 0) {
          updateChildrenPermissions(submenu, isChecked);
        }
      }
    }
    // Handle submenu item
    else {
      // Check if parent has view permission
      const parentHasView = newActions.view.includes(menu_pid);
      if (action === 'view') {
        // Can't enable view without parent permission
        if (isChecked && !parentHasView) {
          triggerAlert("info", "Parent Permission Required", "Cannot enable View without parent permission.");
          return;
        }
        // Update this item's view permission
        updatePermission(id, 'view', isChecked);
        // When adding view permission, also add all other permissions
        if (isChecked) {
          ['add', 'edit', 'delete', 'excel_export'].forEach(act => {
            updatePermission(id, act, true);
          });
        }
        // If removing view, also remove all other permissions
        else {
          ['add', 'edit', 'delete', 'excel_export'].forEach(act => {
            updatePermission(id, act, false);
          });
        }
        // Update any children this submenu might have
        if (submenu?.length > 0) {
          updateChildrenPermissions(submenu, isChecked);
        }
      }
      // Handle other permission types (add, edit, delete, excel_export)
      else {
        // Can't grant permissions without view
        if (!newActions.view.includes(id) && isChecked) {
          triggerAlert("info", "View Required", `${action} requires View permission to be enabled first.`);
          return;
        }
        // Update the specific permission
        updatePermission(id, action, isChecked);
      }
    }
    dispatch({ type: actions.UPDATE_CHECKED_PERMISSIONS, payload: newActions });
    if (activeWorkspace) {
      dispatch({
        type: actions.SET_ACTIVE_PERMISSIONS, payload: {
          workspaceId: activeWorkspace,
          permissions: newActions
        }
      });
    }
  };
  const PermissionsView = () => (
    <div className="permissions-page">
      {state.isPermissionLoading ? (
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-3"> {/* Added margin-bottom here */}
            <label className="form-label">Assign Workspaces</label>
            <MultiSelectDyGet
              apiUrl={workspaceApiUrl}
              placeholder="Select Workspaces"
              mapOption={(result) => ({ value: result.id, label: result.company_name })}
              value={workspaces}
              onSelect={handleWorkspacesSelect}
              defaultValue={workspaces}
            />
            {workspaces.length === 0 && state.workspaceVisible && <NoDataMessage type="workspace" />}
          </div>
          {workspaces.length > 0 && (
            <div className="d-flex justify-content-between my-3 card-header px-0 pb-0">
              <ul className="nav nav-pills mb-3" id="pills-tab-1" role="tablist">
                {workspaces.map((workspace) => (
                  <li className="nav-item" role="presentation" key={workspace.value}>
                    <a
                      className={`nav-link me-1 workspace-tab ${activeWorkspace === workspace.value ? "active" : ""}`}
                      onClick={() => handleWorkspaceTabSelect(workspace.value)}
                    >
                      {workspace.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {state.isWorkspaceLoading ? (
            <div className="text-center p-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading workspace data...</span>
              </div>
            </div>
          ) : (
            <>
              {activeWorkspace && (!state.menuData || state.menuData.length === 0) && (
                <NoDataMessage
                  type="permissions"
                  customMessage={{
                    title: "No Permissions Set",
                    description: "No permissions are configured for this workspace.",
                  }}
                />
              )}
              {activeWorkspace && state.menuData && state.menuData.length > 0 && (
                <div className="permission-container">
                  {state.menuData.map((menu) => renderPermissionItem(menu))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
      .modal-backdrop { background: rgba(0, 0, 0, 0.5); }
      .modal { padding-left: 0 !important; }
      .modal.show .modal-dialog { transform: none; transition: transform 0.3s ease-out; }
      .custom-modal-body { max-height: 70vh; overflow-y: auto; padding: 1.5rem; scrollbar-width: thin; }
      .custom-modal-body::-webkit-scrollbar { width: 6px; }
      .custom-modal-body::-webkit-scrollbar-track { background: #f1f1f1; }
      .custom-modal-body::-webkit-scrollbar-thumb { background: #888; border-radius: 4px; }
      .permission-item { transition: all 0.2s ease; border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 1rem; background: #fff; cursor: default; }
      .permission-item:hover { box-shadow: 0 2px 4px rgba(0,0,0,0.05); transform: translateY(-1px); }
      .btn { transition: all 0.2s ease-in-out !important; }
      .btn-success { background-color: #28a745; border-color: #28a745; color: white; }
      .btn-outline-secondary { background-color: #ffffff; border-color: #6c757d; color: #6c757d; }
      .btn-outline-secondary:hover:not(:disabled) { background-color: #f8f9fa; border-color: #0056b3; color: #0056b3; transform: translateY(-2px); box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
      .btn-success:hover { background-color: #218838; border-color: #1e7e34; transform: translateY(-2px); box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
      .btn-action-view.btn-success { background-color: #28a745; border-color: #28a745; }
      .btn-action-add.btn-success { background-color: #007bff; border-color: #007bff; }
      .btn-action-edit.btn-success { background-color: #17a2b8; border-color: #17a2b8; }
      .btn-action-delete.btn-success { background-color: #dc3545; border-color: #dc3545; }
      .btn-action-view.btn-success:hover { background-color: #218838; border-color: #1e7e34; }
      .btn-action-add.btn-success:hover { background-color: #0056b3; border-color: #0056b3; }
      .btn-action-edit.btn-success:hover { background-color: #138496; border-color: #138496; }
      .btn-action-delete.btn-success:hover { background-color: #c82333; border-color: #c82333; }
      .permission-card { background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); transition: all 0.3s ease; border: 1px solid #e0e0e0; overflow: hidden; }
      .permission-card:hover { transform: translateY(-2px); box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1); }
      .permission-item { padding: 1rem; border-radius: 8px; margin-bottom: 1rem; background: #fff; border: 1px solid #e0e0e0; transition: all 0.3s ease; }
      .permission-item:hover { background: #f8f9fa; border-color: #0d6efd; }
      .btn-permission { border-radius: 6px; font-weight: 500; display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s ease; cursor: pointer; padding: 0.3rem 0.9rem; }
      .btn-permission:disabled { cursor: not-allowed !important; opacity: 0.6; }
      .btn-permission.active { transform: scale(1.05); }
      .permission-group { background: #f8f9fa; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
      .permission-group-header { display: flex; justify-content: space-between; align-items: center; cursor: default; }
      .permission-group-header .btn-permission[data-action="access"] { cursor: pointer; }
      .permission-group-header span { cursor: default; }
      .permission-group-header span.clickable { cursor: pointer; }
      @keyframes permissionPulse { 0% { transform: scale(1); } 50% { transform: scale(1.02); } 100% { transform: scale(1); } }
      .permission-changed { animation: permissionPulse 0.3s ease; }
      .user-list-item { transition: all 0.2s ease; border-left: 4px solid transparent; }
      .user-list-item:hover { background: #f8f9fa; border-left-color: #0d6efd; }
      .user-list-item.selected { background: #e7f1ff; border-left-color: #0d6efd; }
      .status-badge { padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.875rem; font-weight: 500; text-transform: capitalize; }
      .status-badge.active { background: #28a745; color: white; }
      .status-badge.inactive { background: #ffc107; color: #000; }
      .btn-action { padding: 0.5rem; border-radius: 6px; transition: all 0.2s ease; position: relative; }
      .btn-action:hover { transform: translateY(-2px); }
      .btn-action::after { content: attr(data-tooltip); position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); padding: 0.25rem 0.5rem; background: rgba(0, 0, 0, 0.8); color: white; border-radius: 4px; font-size: 0.75rem; opacity: 0; transition: opacity 0.2s ease; pointer-events: none; white-space: nowrap; }
      .btn-action:hover::after { opacity: 1; }
      .permission-nav { display: flex; gap: 1rem; margin-bottom: 2rem; padding: 0.5rem; background: #f8f9fa; border-radius: 8px; }
      .permission-nav-item { padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; transition: all 0.2s ease; }
      .permission-nav-item.active { background: #0d6efd; color: white; }
      .search-filter-section { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
      .search-input { flex: 1; position: relative; }
      .search-input input { padding-left: 2.5rem; border-radius: 8px; }
      .search-input .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #6c757d; }
      .toast-notification { position: fixed; bottom: 2rem; right: 2rem; padding: 1rem; border-radius: 8px; background: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); z-index: 1000; animation: slideIn 0.3s ease; }
      @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
      .permission-matrix { display: grid; gap: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; }
      .matrix-header { font-weight: 600; padding: 0.5rem; background: #e9ecef; border-radius: 4px; }
      [data-tooltip] { position: relative; cursor: help; }
      [data-tooltip]:before { content: attr(data-tooltip); position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); padding: 0.5rem; background: rgba(0, 0, 0, 0.8); color: white; border-radius: 4px; font-size: 0.75rem; opacity: 0; transition: all 0.2s ease; pointer-events: none; white-space: nowrap; }
      [data-tooltip]:hover:before { opacity: 1; transform: translateX(-50%) translateY(-8px); }
      .permission-item[data-tooltip]:before, .permission-group-header[data-tooltip]:before, .permission-item[data-tooltip]:after, .permission-group-header[data-tooltip]:after { display: none; }
      .btn-permission[data-tooltip] { position: relative; }
      .btn-permission[data-tooltip]:before { content: attr(data-tooltip); position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); padding: 0.25rem 0.5rem; background: rgba(0, 0, 0, 0.8); color: white; border-radius: 4px; font-size: 0.75rem; opacity: 0; transition: opacity 0.2s ease; pointer-events: none; white-space: nowrap; z-index: 1000; }
      .btn-permission[data-tooltip]:hover:before { opacity: 1; }
      .workspace-tab { cursor: pointer !important; transition: all 0.2s ease; }
      .workspace-tab:hover { background-color: rgba(13, 110, 253, 0.1); transform: translateY(-1px); }
      .workspace-tab.active { cursor: default !important; }
      .permission-group-header span { cursor: pointer; }
      .permission-group-header span:hover { }
      .workspace-loader { position: relative; min-height: 200px; }
      .workspace-loader .spinner-border { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }
      .active-permission { border-color: #28a745 !important; }
      .btn-permission.btn-success { background-color: #28a745; border-color: #28a745; color: white; }
      .permission-item.active-permission:hover { border-color: #218838 !important; background-color: rgba(0, 0, 0, 0.03) !important; }
      .disabled-permission { cursor: not-allowed !important; opacity: 0.65; position: relative; }
      .disabled-permission:after { content: '🚫'; position: absolute; top: -8px; right: -8px; font-size: 12px; opacity: 0; transition: opacity 0.2s ease; }
      .disabled-permission:hover:after { opacity: 1; }
      button:disabled { cursor: not-allowed !important; pointer-events: all !important; }
      button:disabled:hover { transform: none !important; box-shadow: none !important; }
    `;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);
  useEffect(() => { if (activeWorkspace) fetchMenuItemsbasedonWorkspace(activeWorkspace); else dispatch({ type: actions.CLEAR_MENU_DATA }); }, [activeWorkspace]);
  useEffect(() => { fetchSubUsers(); }, []);
  useEffect(() => { if (!activeWorkspace && state.allowedWorkspaces.length > 0) setActiveWorkspace(state.allowedWorkspaces[0]); }, [state.allowedWorkspaces]);
  // Update this function to toggle selection
  const handleTableRowClickLocal = (row) => {
    if (state.selectedRowId === row.id) {
      // If this row is already selected, unselect it
      dispatch({ type: actions.SET_SELECTED_ROW, payload: { row: null, id: null } });
    } else {
      // Otherwise, select this row
      dispatch({ type: actions.SET_SELECTED_ROW, payload: { row, id: row.id } });
    }
  };
  const handleBackToList = () => {
    dispatch({ type: actions.SET_VIEW, payload: 'list' });
    dispatch({ type: actions.SET_PERMISSION_SHOW, payload: false });
    dispatch({ type: actions.SET_SELECTED_ROW, payload: { row: null, id: null } });
    clearWorkspaceData();
    setShowTabs(true);
    setIsPaymentPermission(false); // Reset payment permission flag
  };
  const handleWorkspaceTabSelect = (workspaceId) => {
    setActiveWorkspace(workspaceId);
    const permissions = state.activePermissions[workspaceId] || {
      view: [],
      add: [],
      edit: [],
      delete: [],
      excel_export: [],
    };
    dispatch({ type: actions.UPDATE_CHECKED_PERMISSIONS, payload: permissions });
    // Fetch menu data for the selected workspace
    fetchMenuItemsbasedonWorkspace(workspaceId);
  };
  const handleWorkspacesSelect = (selectedWorkspaces) => {
    // Deduplicate selected workspaces
    const uniqueSelectedWorkspaces = Array.from(
      new Map(selectedWorkspaces.map(w => [w.value, w])).values()
    );
    setWorkspaces(uniqueSelectedWorkspaces);
    if (uniqueSelectedWorkspaces.length === 0) {
      setActiveWorkspace(null);
      dispatch({ type: actions.CLEAR_MENU_DATA });
    } else if (!activeWorkspace || !uniqueSelectedWorkspaces.some(w => w.value === activeWorkspace)) {
      const newActiveWorkspace = uniqueSelectedWorkspaces[0].value;
      setActiveWorkspace(newActiveWorkspace);
      const permissions = state.activePermissions[newActiveWorkspace] || { view: [], add: [], edit: [], delete: [], excel_export: [] };
      dispatch({ type: actions.UPDATE_CHECKED_PERMISSIONS, payload: permissions });
      fetchMenuItemsbasedonWorkspace(newActiveWorkspace); // Fetch menu for new active workspace
    }
    dispatch({ type: actions.SET_WORKSPACE_VISIBLE, payload: uniqueSelectedWorkspaces.length === 0 });
  };
  const handlePermissionsClick = (userId, userName) => {
    if (!userId) {
      triggerAlert("warning", "Invalid User", "Cannot manage permissions for this user. User ID is missing.");
      return;
    }
    // Clear all workspace and permission data
    clearWorkspaceData();
    // Set view to permissions and ensure user ID and name are stored
    dispatch({ type: actions.SET_VIEW, payload: 'permissions' });
    dispatch({ type: actions.SET_SELECTED_ROW, payload: { row: { id: userId, name: userName }, id: userId } });
    dispatch({ type: actions.SET_MENU_DATA, payload: { menuData: [], userId: userId } });
    // Fetch permissions for the user
    editSubUserPermission(userId, userName);
    setShowTabs(false);
  };
  const renderPermissionItem = (menuItem, depth = 0) => {
    const currentId = menuItem.id;
    const isParentItem = depth === 0;
    const hasViewPermission = state.checkedActions.view?.includes(currentId);
    const hasAddPermission = state.checkedActions.add?.includes(currentId);
    const hasEditPermission = state.checkedActions.edit?.includes(currentId);
    const hasDeletePermission = state.checkedActions.delete?.includes(currentId);
    const parentHasView = isParentItem || (menuItem.menu_pid && state.checkedActions.view?.includes(menuItem.menu_pid));
    return (
      <div key={currentId} className={`permission-item ${depth > 0 ? 'ms-4' : ''} ${hasViewPermission ? 'active-permission' : ''}`}>
        <div className="permission-group-header">
          <div className="d-flex align-items-center">
            <FaShieldAlt className={`me-2 ${hasViewPermission ? 'text-success' : 'text-secondary'}`} />
            <span className="fw-bold">{menuItem.menu_name}</span>
          </div>
          <div className="d-flex gap-2">
            <button type="button" className={`btn btn-sm ${hasViewPermission ? 'btn-success' : 'btn-outline-secondary'} ${!isParentItem && !parentHasView ? 'disabled-permission' : ''}`} onClick={() => handleCheckbox(menuItem, 'view')} disabled={!isParentItem && !parentHasView}>
              <FaEye className="me-1" /> <span>View</span>
            </button>
            {!isParentItem && (
              <>
                <button type="button" className={`btn btn-sm ${hasAddPermission ? 'btn-success' : 'btn-outline-secondary'} ${(!parentHasView || !hasViewPermission) ? 'disabled-permission' : ''}`} onClick={() => handleCheckbox(menuItem, 'add')} disabled={!parentHasView || !hasViewPermission}>
                  <FaPlus className="me-1" /> <span>Add</span>
                </button>
                <button type="button" className={`btn btn-sm ${hasEditPermission ? 'btn-success' : 'btn-outline-secondary'} ${(!parentHasView || !hasViewPermission) ? 'disabled-permission' : ''}`} onClick={() => handleCheckbox(menuItem, 'edit')} disabled={!parentHasView || !hasViewPermission}>
                  <FaEdit className="me-1" /> <span>Edit</span>
                </button>
                <button type="button" className={`btn btn-sm ${hasDeletePermission ? 'btn-success' : 'btn-outline-secondary'} ${(!parentHasView || !hasViewPermission) ? 'disabled-permission' : ''}`} onClick={() => handleCheckbox(menuItem, 'delete')} disabled={!parentHasView || !hasViewPermission}>
                  <FaTrash className="me-1" /> <span>Delete</span>
                </button>
              </>
            )}
          </div>
        </div>
        {menuItem.submenu?.length > 0 && (
          <div className="mt-3 permission-submenu">
            {menuItem.submenu.map(subItem => renderPermissionItem(subItem, depth + 1))}
          </div>
        )}
      </div>
    );
  };
  const normalizeStatus = (status) => {
    if (!status) return "";
    // Convert to lowercase for comparison
    return status.toLowerCase();
  }
  useEffect(() => {
    if (state.subUserList.length > 0) {
      // console.log("Status values from API:", state.subUserList.map(user => `${user.name}: ${user.status}`));
    }
  }, [state.subUserList]);
  return (
    <>
      {state.isLoading && <div className="loader-overlay text-white"><Loader /></div>}
      <div className="tab-pane fade show" id="pills-Invite-fill" role="tabpanel">
        {state.currentView === 'list' ? (
          <>
            {userTypeFromCookie !== "sub_user" && userTypeFromCookie !== "admin" && !state.isFormVisible && (
              <div className="mb-3 me-3 text-end">
                <div className="btn-group">
                  <button type="button" className="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <FaUserPlus className="me-2" /> Actions
                  </button>
                  <div className="dropdown-menu dropdown-menu-end">
                    <button className="dropdown-item d-flex align-items-center" onClick={addNewUser}>
                      <FaPlus className="me-2" /> Add User
                    </button>
                    <button className="dropdown-item d-flex align-items-center" onClick={editSubUsers} disabled={!state.selectedRowId}>
                      <FaEdit className="me-2" /> Edit User
                    </button>
                    <button className="dropdown-item d-flex align-items-center" onClick={deleteSubUsers} disabled={!state.selectedRowId}>
                      <FaTrash className="me-2" /> Delete User
                    </button>
                  </div>
                </div>
              </div>
            )}
            {state.isFormVisible ? (
              <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                <div className="row">
                  <div className="col-4">
                    <label className="form-label" htmlFor="city">Name <span style={{ color: "red" }}>*</span></label>
                    <input type="text" name="name" id="city" className="form-control" placeholder="Enter full name" {...register("name", { required: "Name is required", pattern: { value: /^[a-zA-Z]*[\w -]*[a-zA-Z]$/, message: "Invalid Name format" } })} />
                    {errors.name && <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>{errors.name.message}</div>}
                  </div>
                  <div className="col-4">
                    <label className="form-label" htmlFor="email">Login Email <span style={{ color: "red" }}>*</span></label>
                    <input
                      type="email"
                      name="user_email"
                      id="user_email"
                      className="form-control"
                      placeholder="Enter email address"
                      autoFocus={!state.selectedRow}
                      onFocus={(e) => e.target.select()}
                      autoComplete={state.selectedRow ? "email" : "new-email"}
                      {...register("user_email", {
                        required: "Email is required",
                        pattern: { value: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/, message: "Invalid Email Id format" }
                      })}
                    />
                    {errors.user_email && <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>{errors.user_email.message}</div>}
                  </div>
                  <div className="col-4">
                    <label className="form-label" htmlFor="phone_no">Phone <span style={{ color: "red" }}>*</span></label>
                    <input type="text" name="phone_no" id="phone_no" className="form-control" placeholder="Enter: 10-digit mobile number" {...register("phone_no", { required: "Phone no is required", maxLength: MaxLengthValidation(15), minLength: MinLengthValidation(10), pattern: onlyNumbers })} />
                    {errors.phone_no && <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>{errors.phone_no.message}</div>}
                  </div>
                  <div className="col-4">
                    <label className="form-label" htmlFor="password">Password <span style={{ color: "red" }}>*</span></label>
                    <div className="input-group">
                      <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type={state.showPassword ? "text" : "password"}
                            id="password"
                            className="form-control"
                            placeholder="Enter the password" // ✅ Correctly placed
                            autoComplete={state.selectedRow ? "current-password" : "new-password"}
                            autoFocus={!!state.selectedRow}
                            onFocus={(e) => e.target.select()}
                            {...register("password", {
                              required: "Password is required",
                              maxLength: MaxLengthValidation(25),
                              minLength: MinLengthValidation(6),
                              pattern: passwordPattern
                            })}
                            onChange={(e) => {
                              field.onChange(e);
                              setValue("watch_word", e.target.value);
                            }}
                          />
                        )}
                      />
                      <button type="button" className="btn btn-outline-primary" onClick={() => dispatch({ type: actions.TOGGLE_PASSWORD })}>{state.showPassword ? <FaEyeSlash className="font-size-14" /> : <FaEye className="font-size-14" />}</button>
                    </div>
                    {errors.password && <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>{errors.password.message}</div>}
                    <Controller name="watch_word" control={control} render={({ field }) => <input {...field} type="hidden" {...register("watch_word")} value={watchword} />} />
                  </div>
                  <div className="col-4">
                    <label className="form-label" htmlFor="role">Role <span style={{ color: "red" }}>*</span></label>
                    <Controller
                      control={control}
                      name="role"
                      rules={{ required: "Role is required" }}
                      render={({ field }) => (
                        <select {...field} className="form-select" id="role" aria-label="Role select">
                          <option value="" disabled>Select</option>
                          <option value="Admin">Admin</option>
                          <option value="Suser">Sub User</option>
                          {/* <option value="Auser">Account User</option> */}
                        </select>
                      )}
                    />
                    {errors.role && <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>{errors.role.message}</div>}
                  </div>
                  <div className="col-4">
                    <label className="form-label" htmlFor="status">Status <span style={{ color: "red" }}>*</span></label>
                    <Controller
                      control={control}
                      name="status"
                      rules={{ required: "Status is required" }}
                      render={({ field }) => (
                        <select {...field} className="form-select" id="status" aria-label="Status select">
                          <option value="" disabled>Select</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      )}
                    />
                    {errors.status && <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>{errors.status.message}</div>}
                  </div>
                </div>
                <input type="hidden" {...register("sub_uesr_id")} />
                <button type="button" className="btn btn-warning mt-3" onClick={cancelForm}>Cancel</button>
                <button type="submit" className="btn btn-primary mt-3 ms-2">Submit</button>
              </form>
            ) : (
              <div className="">
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-bordered hover" cellSpacing="0" width="100%">
                      <thead className="text-nowrap">
                        <tr style={{ backgroundColor: "#ededed" }}>
                          <th scope="col">Name/Phone</th>
                          <th scope="col">Role/Email</th>
                          <th scope="col">Permissions</th>
                          <th scope="col">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {state.subUserList.length > 0 ? (
                          state.subUserList.map((sub_user) => (
                            <tr key={sub_user.id} onClick={() => handleTableRowClickLocal(sub_user)} className={state.selectedRowId === sub_user.id ? "row_selected" : ""}>
                              <td scope="row">
                                <div className="d-flex">
                                  <div className="user-img img-fluid flex-shrink-0"></div>
                                  <div className="ms-3 text-nowrap">
                                    <h6>{sub_user.name}</h6>
                                    <p className="mb-0">{sub_user.phone_no}</p>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className="text-dark fw-bold mb-1 fs-6">
                                  {sub_user.role === "Suser" ? "Sub User" : sub_user.role === "Auser" ? "Account User" : sub_user.role}
                                </span>
                                <br />
                                {sub_user.user_email}
                              </td>
                              <td>
                                {sub_user.role === "Admin" ? (
                                  <span>_</span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent the row click event from firing
                                      handlePermissionsClick(sub_user.id, sub_user.name);
                                    }}
                                    className="btn btn-link d-flex align-items-center"
                                  >
                                    <FaUserPlus className="me-2" /> <span>Permissions</span>
                                  </button>
                                )}
                              </td>
                              <td>
                                <div className="confirm-click-btn">
                                  <span className={`badge ${sub_user.status.toLowerCase() === "active" ? "bg-success" : "bg-warning"} border-radius rounded-pill`}>
                                    {sub_user.status.toLowerCase() === "active" ? "Active" : "Inactive"}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4">
                              <NoDataMessage type="users" customMessage={{ title: "No Users Found", description: "No users are available in the current view." }} />
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    <PaginationComponent {...props} />
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
              <div>
                <h4 className="mb-0">
                  User Permissions - {state.selectedRow?.name || "No User Selected"}
                </h4>
                <small className="text-muted">
                  Managing permissions for {state.selectedRow?.name || "No User Selected"}
                </small>
              </div>
              <div className="d-flex align-items-center">
                <button
                  className="btn btn-warning me-3"
                  onClick={handleBackToList}
                >
                  <FaArrowLeft className="me-2" /> Back to Users
                </button>
                <button
                  type="button"
                  className="btn btn-primary me-3"
                  onClick={fetchPaymentPermissions}
                >
                  <FaWallet className="me-2" /> Payment Permissions
                </button>
                <Button
                  variant="primary"
                  onClick={isPaymentPermission ? savePaymentPermissions : () => mgUserPermissionEdit(0)}
                  className="d-flex align-items-center"
                >
                  <FaCheck className="me-2" /> Save Changes
                </Button>
              </div>
            </div>
            <PermissionsView />
          </>
        )}
      </div>
      <style>{`
        .dropdown-item { padding: 0.5rem 1rem; cursor: pointer; transition: all 0.2s ease; }
        .dropdown-item:hover { background-color: #f8f9fa; color: #0d6efd; }
        .dropdown-item.disabled, .dropdown-item:disabled { color: #6c757d; pointer-events: none; background-color: transparent; opacity: 0.65; }
        .btn-group .dropdown-toggle::after { margin-left: 0.5em; }
        .dropdown-menu { min-width: 200px; padding: 0.5rem 0; margin: 0; box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15); border: 1px solid rgba(0, 0, 0, 0.1); }
        .dropdown-item svg { font-size: 1rem; width: 20px; }
      `}</style>
    </>
  );
};
export default Members;
