import Swal from "sweetalert2";
import Cookies from 'js-cookie';
import AppConfig from "./Config";
// export const login = (token, username, email, user_type, user_id, company_name, full_name) => {
//     //change this accordingly
//     Cookies.set('customer_user_token', token);
//     Cookies.set('username', username);
//     Cookies.set('email', email);
//     Cookies.set('user_type', user_type);
//     Cookies.set('user_id', user_id);
//     Cookies.set('company_name', company_name);
//     Cookies.set('full_name', full_name);
// }
export const login = (token, username, email, user_type, user_id, company_name, full_name, rememberMe) => {
    const expirationDate = rememberMe ? new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000) : null;
    const cookieOptions = {
        path: '/',
        secure: true,
        sameSite: 'Lax',
        ...(expirationDate && { expires: expirationDate }),
    };

    Cookies.set('customer_user_token', token, cookieOptions);
    Cookies.set('username', username, cookieOptions);
    Cookies.set('email', email, cookieOptions);
    Cookies.set('user_type', user_type, cookieOptions);
    Cookies.set('user_id', user_id, cookieOptions);
    Cookies.set('company_name', company_name, cookieOptions);
    Cookies.set('full_name', full_name, cookieOptions);
};



export const setToken = (token) => {
    // console.log("AppConfig.rememberMesetToken", AppConfig.rememberMe)
    const expirationDate = AppConfig.rememberMe
        ? new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000)
        : undefined;
    const cookieOptions = {
        path: '/',
        secure: true,
        sameSite: 'Lax',
        ...(expirationDate && { expires: expirationDate }),
    };

    Cookies.set('customer_user_token', token, cookieOptions);
}
export const settingMenuType = (type) => {
    // console.log("AppConfig.rememberMe", AppConfig.rememberMe)
    const expirationDate = AppConfig.rememberMe
        ? new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000)
        : undefined;
    const cookieOptions = {
        path: '/',
        secure: true,
        sameSite: 'Lax',
        ...(expirationDate && { expires: expirationDate }),
    };

    Cookies.set('type', type, cookieOptions);
}

export const gettingMenuType = () => {
    return Cookies.get('type');
}

export const logout = () => {
    //change this accordingly
    Cookies.remove('customer_user_token');
    Cookies.remove('username');
    Cookies.remove('email');
    Cookies.remove('user_type');
    Cookies.remove('user_id');
    Cookies.remove('full_name');
    Cookies.remove('company_name');
    Cookies.remove('type');

    Cookies.remove('menu_id_add');
    Cookies.remove('menu_id_edit');
    Cookies.remove('menu_id_delete');
    Cookies.remove('excel_export');
    Cookies.remove('admin_menu_data');
    Cookies.remove('admin_permission_data');
    Cookies.remove('selected_workspace_id');
    Cookies.remove('selected_workspace_name');
    Cookies.remove('userType');
    return true;
}


export const isLogin = () => {
    //return true;
    if (Cookies.get('customer_user_token')) { //change this accordingly
        return true;
    }

}

export const getOnlyToken = () => {
    const token = Cookies.get('customer_user_token');
    return token;
}
export const getCustomerId = () => {
    const customerId = parseInt(Cookies.get('user_id'), 10); //change this accordingly

    if (customerId) {
        return customerId;
    } else {
        return null;
    }
};


export const getToken = () => {
    const token = Cookies.get('customer_user_token'); //change this accordingly
    if (token) {
        return {

            headers: {
                Authorization: `${token}`
            }
        }
    } else {
        return null;
    }
};


export const getLoginData = () => {
    //return true;
    if (Cookies.get('user_id')) {
        let user_data = {
            "auth_user": Cookies.get('auth_user'),
            "username": Cookies.get('username'),
            "user_id": Cookies.get('user_id')
        };
        return user_data;
    }

}

export const getUserId = () => {
    const user_id = parseInt(Cookies.get('user_id'));

    if (user_id) {
        return user_id;
    } else {
        return null;
    }
};

export const getCompanyName = () => {
    const company_name = Cookies.get("company_name");

    if (company_name) {
        return company_name;
    } else {
        return null;
    }
};

export const setWToken = (token) => {
    if (token) Cookies.set('w_token', token);
}

export const getWToken = () => {
    const token = Cookies.get('w_token');
    return token;
}
export const getUserFullname = () => {
    const token = Cookies.get('full_name');
    return token;
}

// Sweetalert functions
export const triggerAlert = (icon, title, message) => {
    return Swal.fire({
        icon: icon,
        title: title,
        text: message,
        timer: 5000,
    })
}
export const simpleAlert = (text) => {
    return Swal.fire({
        text: text,
        timer: 3000,
    })
}

export const ConfirmationAlert = async (title, buttonText, buttonFunc) => {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: title,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: buttonText,
        timer: null//3000,
    });
    if (result.isConfirmed) {
        buttonFunc();
    }
}

export const AlertWithExtraButton = async (title, text, saveText = "Save", buttonFunc) => {
    Swal.fire({
        // title: title,
        text: text,
        icon: title, // you can change this to "error" if needed
        showCancelButton: true,
        confirmButtonText: saveText,
        showLoaderOnConfirm: true,
        allowOutsideClick: () => !Swal.isLoading(),
        preConfirm: async () => {
            try {
                await buttonFunc(); // Await the passed async function
            } catch (err) {
                Swal.showValidationMessage(`Request failed: ${err.message}`);
            }
        }
    });
};
//export to excel functions
export const exportToCsv = (data, filename) => {
    const csvContent = Object.keys(data[0]).join(",") + "\n" +
        data.map(row => Object.values(row).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' }); // for large amount of data more than 3000 rows
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename + ".csv");
    document.body.appendChild(link);
    link.click();

    // Clean up
    URL.revokeObjectURL(url);
    document.body.removeChild(link);
};

//converting files to base64

export function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
}
export const formatDate = (dateInput, format) => {

    // If the input is a string, convert it to a Date object
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

    // Check if the date is not null and is a valid Date object
    if (!date || isNaN(date.getTime())) {
        return '-';
    } else {
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0'); // January is 0!
        const monthName = monthNames[date.getMonth()];
        const yyyy = date.getFullYear();

        switch (format) {
            case 'dd-mm-yyyy':
                return `${dd}-${mm}-${yyyy}`;
            case 'yyyy-mm-dd':
                return `${yyyy}-${mm}-${dd}`;
            case 'dd/mm/yyyy':
                return `${dd}/${mm}/${yyyy}`;
            case 'mm/dd/yyyy':
                return `${mm}/${dd}/${yyyy}`;
            case 'month dd, yyyy':
                return `${monthName} ${dd}, ${yyyy}`;
            // Add more format cases as needed
            default:
                return `${dd}-${mm}-${yyyy}`;
        }
    }
};

// Formatting date and time
export const formatDateTime = (dateTimeInput, format) => {
    let date, time;

    // Handle different formats of dateTimeInput
    if (typeof dateTimeInput === 'string') {
        // Case when dateTimeInput includes 'T' (ISO 8601 format)
        if (dateTimeInput.includes('T')) {
            [date, time] = dateTimeInput.split('T');
            date = new Date(dateTimeInput);
        } else {
            // Handle cases like 'Thu Aug 22 2024 18:44:49 GMT+0530 (India Standard Time)'
            date = new Date(dateTimeInput);
        }
    } else {
        // If it's not a string, assume it's a Date object
        date = new Date(dateTimeInput);
    }

    // Validate the date object
    if (!date || isNaN(date.getTime())) {
        return '-';
    }

    // Date components
    const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    const monthName = month[date.getMonth()];

    // Time components (default to 00:00:00 if not provided)
    let hours = String(date.getHours()).padStart(2, '0');
    let minutes = String(date.getMinutes()).padStart(2, '0');
    let seconds = String(date.getSeconds()).padStart(2, '0');

    // Return formatted date and time based on the specified format
    switch (format) {
        case 'dd-mm-yyyy':
            return `${dd}-${mm}-${yyyy}`;
        case 'yyyy-mm-dd':
            return `${yyyy}-${mm}-${dd}`;
        case 'dd/mm/yyyy':
            return `${dd}/${mm}/${yyyy}`;
        case 'mm/dd/yyyy':
            return `${mm}/${dd}/${yyyy}`;
        case 'month dd, yyyy':
            return `${monthName} ${dd}, ${yyyy}`;
        case 'yyyy-mm-dd, hh:mm:ss':
            return `${yyyy}-${mm}-${dd}, ${hours}:${minutes}:${seconds}`;
        case 'yyyy-mm-dd hh:mm:ss':
            return `${yyyy}-${mm}-${dd} ${hours}:${minutes}:${seconds}`;
        case 'hh:mm:ss':
            return `${hours}:${minutes}:${seconds}`;
        case 'mm-dd-yyyy':
            return `${mm}-${dd}-${yyyy}`;
        case 'month dd, hh:mm':
            return `${monthName} ${dd}, ${hours}:${minutes}`;


        // Add more format cases as needed
        default:
            return '-';
    }
};

//remove html tags 
export const removePTags = (inputString) => {
    if (inputString) {
        // Remove HTML tags
        const withoutPTags = inputString.replace(/<\/?[^>]+(>|$)/g, "");
        // Remove &nbsp;
        const removeBraces = withoutPTags.replace(/&nbsp;/g, '');
        return removeBraces;
    }
}

//download files
export const downloadFile = (url, filename) => {
    fetch(url)
        .then(response => response.blob())
        .then(blob => {
            // Create a temporary link element
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = filename;

            // Programatically click the link to trigger the download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        })
        .catch(error => console.error('Error downloading file:', error));
};

//row selection 
export const handleTableRowClick = (value, selectedRow, setSelectedRow, selectedRowId, setSelectedRowId, row_id) => {

    if (selectedRowId === row_id) {
        setSelectedRow();
        setSelectedRowId();
    } else {
        setSelectedRow(value);
        setSelectedRowId(row_id);
    }

};

//generate random password of given characters
export const generatePassword = (noOfChar) => {
    // Use crypto.getRandomValues() for cryptographically strong randomness
    const randomValues = new Uint8Array(noOfChar);
    crypto.getRandomValues(randomValues);

    // const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*_+-?'; // Include symbols for stronger passwords
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; // removed symbols 
    const password = Array.from(randomValues, (value) => charset[value % charset.length]).join('');

    return password;
}

export const togglePasswordVisibility = (inputId, class_name) => {
    const passwordInput = document.getElementById(inputId);
    const inputClass = document.querySelector(`.${class_name}`);
    // console.log(inputClass)
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        inputClass.classList.add('bx-show');
        inputClass.classList.remove('bx-hide');
    } else {
        passwordInput.type = 'password';
        inputClass.classList.remove('bx-show');
        inputClass.classList.add('bx-hide');
    }
};

///transform strings
export function transformText(text, transformation) {
    if (!text) console.error("unable to retrieve the text");
    switch (transformation) {
        case 'lowercase':
            return text.toLowerCase();
        case 'uppercase':
            return text.toUpperCase();
        case 'capitalize':
            return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
        default:
            throw new Error(`Invalid transformation: ${transformation}`);
    }
}

///extract filename 
export function extractFileName(url) {
    const parts = url?.split('/');
    return parts[parts?.length - 1];
}


export const pageReload = () => {
    setTimeout(() => {
        window.location.reload();
    }, 1000);

}

export const AlertWithButton = async (title, htmlCode, buttonText, buttonFunc) => {
    const result = await Swal.fire({
        title: title,
        html: htmlCode,
        confirmButtonText: buttonText,
    });
    if (result.isConfirmed) {
        buttonFunc();
    }
}



export const formattedDateTime = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month starts from 0
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export function formatTimeToAmandPM(dateString) {
    const date = new Date(dateString);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    const formattedTime = hours + ':' + formattedMinutes + ' ' + ampm;
    return formattedTime;
}
export const truncateName = (message, length = 50) => {
    if (message?.length > length) {
        return message.substring(0, length) + '...';
    }
    return message;
};

export const truncatePrice = (price, length = 6) => {
    const priceStr = price.toString();
    return priceStr.length > length ? priceStr.substring(0, length) + "..." : priceStr;
};



// Function to extract latitude and longitude from the URL
export const extractCoordinates = (url) => {
    const regex = /place\/(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = url.match(regex);
    if (match) {
        return {
            latitude: match[1],
            longitude: match[2]
        };
    }
    return { latitude: null, longitude: null };
};

// Function to get formatted date as Today, Yesterday, day of the week, or mm-dd-yyyy
export const getFormattedDate = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to midnight
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // Check if the message date is today
    if (messageDate.toDateString() === today.toDateString()) {
        return 'Today';
    }

    // Check if the message date is yesterday
    if (messageDate.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    }

    // Check if the message is within the current week
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Set to the start of the week (Sunday)

    if (messageDate >= startOfWeek) {
        return messageDate.toLocaleString('en-US', { weekday: 'long' }); // Return the day name
    }

    // For older messages, return the formatted date
    return formatDateTime(messageDate, 'mm-dd-yyyy');
};

export const formatCount = (count) => {
    if (count >= 1000000) {
        // Format millions
        return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
        // Format thousands
        return (count / 1000).toFixed(1) + 'K';
    } else {
        // Return the number as is if less than 1000
        return count.toString();
    }
};
export const validateFileSize = (value) => {
    if (!value) return true; // Allow empty files
    const fileSize = value[0]?.size; // Access the size property of the File object
    const maxFileSize = 1024 * 1024; // 1 MB
    if (fileSize > maxFileSize) {
        return 'File size exceeds the maximum allowed size (1 MB).';
    }
    return true;
};

export function sendNotification(title, message) {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            // console.log('Notification permission:', permission); // Check permission status
            if (permission === 'granted') {
                new Notification(title, {
                    body: message,
                    icon: '/path/to/icon.png' // Optional: include an icon
                });
            } else {
                console.log('Permission denied or dismissed');
            }
        }).catch(error => {
            console.error('Notification request failed:', error);
        });
    } else {
        console.log('Notification API not supported in this browser.');
    }
}

export const getInitials = (str) => {
    if (!str) return '-'; // Return '-' if the string is empty or undefined

    // Ensure str is a string to avoid errors
    const stringValue = String(str);

    return stringValue
        .split(' ') // Split the string into words
        .slice(0, 3) // Take the first 3 words
        .map((word) => word[0]?.toUpperCase() || '') // Safely get the first letter of each word and convert to uppercase
        .join(''); // Join the initials into a single string
};

export const setCookie = (name, value, days = 7) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
};

export const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
    return '';
};

export const ConfirmationAlerts = async (title, buttonText, buttonFunc) => {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: title,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: buttonText,
        cancelButtonText: 'Cancel',
        timer: null // 3000,
    });

    if (result.isConfirmed) {
        buttonFunc();
    }
};


export const set_user_menu_permission = (menu_id_add, menu_id_edit, menu_id_delete, excel_export) => {
    setCookie('menu_id_add', JSON.stringify(menu_id_add));
    setCookie('menu_id_edit', JSON.stringify(menu_id_edit));
    setCookie('menu_id_delete', JSON.stringify(menu_id_delete));
    setCookie('excel_export', JSON.stringify(excel_export));
}

export const get_user_menu_permission = (menu_id, type) => {
    // If user is a customer, grant all permissions
    if (isCustomerUser()) {
        return true;
    }
    // For sub-users, check their specific permissions
    let has_permission = false;
    if (type === "add") {
        const add_permissions = JSON.parse(getCookie('menu_id_add') || '[]');
        has_permission = add_permissions.includes(Number(menu_id));
    } else if (type === "edit") {
        const edit_permissions = JSON.parse(getCookie('menu_id_edit') || '[]');
        has_permission = edit_permissions.includes(Number(menu_id));
    } else if (type === "delete") {
        const delete_permissions = JSON.parse(getCookie('menu_id_delete') || '[]');
        has_permission = delete_permissions.includes(Number(menu_id));
    } else if (type === "export") {
        const excel_export_permissions = JSON.parse(getCookie('excel_export') || '[]');
        has_permission = excel_export_permissions.includes(Number(menu_id));
    }
    return has_permission;
};

export const isCustomerUser = () => {
    const userType = Cookies.get('user_type');
    return userType == 'customer';
};

// Updated function to extract and store menu IDs from menu data
export const extractAndStoreMenuIds = (menuData) => {
    try {
        const menuIdMap = {};

        // Process menu items to extract IDs
        if (Array.isArray(menuData)) {
            menuData.forEach(platform => {
                if (!menuIdMap[platform.page_name]) {
                    menuIdMap[platform.page_name] = {
                        main: platform.id
                    };
                }

                // Process submenu items (like profile, settings)
                if (Array.isArray(platform.submenu)) {
                    platform.submenu.forEach(submenu => {
                        // Store submenu IDs directly with their page names
                        menuIdMap[platform.page_name][submenu.page_name] = submenu.id;

                        // Process nested submenu items if any
                        if (Array.isArray(submenu.submenu)) {
                            submenu.submenu.forEach(nestedItem => {
                                const nestedKey = `${submenu.page_name}_${nestedItem.page_name}`;
                                menuIdMap[platform.page_name][nestedKey] = nestedItem.id;
                            });
                        }
                    });
                }
            });
        }

        // Store the menu ID mapping in cookies with longer expiration (30 days)
        const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = 'admin_menu_data=' + encodeURIComponent(JSON.stringify(menuIdMap)) +
            '; expires=' + expires + '; path=/; secure; sameSite=Lax';

        console.log('Menu IDs extracted and stored:', menuIdMap);
        return menuIdMap;
    } catch (error) {
        console.error('Error extracting menu IDs:', error);
        return {};
    }
};

// Updated function to get menu ID from stored data with better error handling
export const getMenuId = (platform, type) => {
    try {
        const cookieValue = getCookie('admin_menu_data');
        if (!cookieValue) {
            console.log('No menu data found in cookies');
            return null;
        }

        const menuData = JSON.parse(cookieValue);

        // Check if the requested platform and type exist
        if (!menuData[platform]) {
            console.log(`Platform "${platform}" not found in menu data`);
            return null;
        }

        if (!menuData[platform][type]) {
            console.log(`Menu type "${type}" not found for platform "${platform}"`);
            return null;
        }

        return menuData[platform][type];
    } catch (error) {
        console.error('Error retrieving menu ID:', error);
        return null;
    }
};

export const formatDateTimes = (dateTimeInput, format) => {
    // If input is invalid, return a placeholder
    if (!dateTimeInput) {
        return '-';
    }

    // *** FIX STARTS HERE ***
    // Specific override for the format "yyyy-mm-dd hh:mm:ss" to prevent timezone conversion for ISO strings.
    // This displays the time as it appears in the string, regardless of the user's local timezone.
    if (format === 'yyyy-mm-dd hh:mm:ss' && typeof dateTimeInput === 'string' && dateTimeInput.includes('T')) {
        const datePart = dateTimeInput.substring(0, 10); // Extracts "YYYY-MM-DD"
        const timePart = dateTimeInput.substring(11, 19); // Extracts "HH:MM:SS"
        return `${datePart} ${timePart}`;
    }
    // *** FIX ENDS HERE ***

    let date;
    // For all other formats, or if the input isn't a string, use the Date object.
    // This preserves existing behavior and handles various date formats correctly in the user's local time.
    try {
        date = new Date(dateTimeInput);
        if (isNaN(date.getTime())) {
            return '-'; // Return placeholder if the date is invalid
        }
    } catch (e) {
        return '-';
    }

    // Date components (in local time)
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthName = month[date.getMonth()];

    // Time components (in local time)
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // Return formatted date and time based on the specified format
    switch (format) {
        case 'dd-mm-yyyy':
            return `${dd}-${mm}-${yyyy}`;
        case 'yyyy-mm-dd':
            return `${yyyy}-${mm}-${dd}`;
        case 'dd/mm/yyyy':
            return `${dd}/${mm}/${yyyy}`;
        case 'mm/dd/yyyy':
            return `${mm}/${dd}/${yyyy}`;
        case 'month dd, yyyy':
            return `${monthName} ${dd}, ${yyyy}`;
        case 'yyyy-mm-dd, hh:mm:ss':
            return `${yyyy}-${mm}-${dd}, ${hours}:${minutes}:${seconds}`;
        case 'yyyy-mm-dd hh:mm:ss':
            // This case will now be hit only if the special override wasn't triggered
            return `${yyyy}-${mm}-${dd} ${hours}:${minutes}:${seconds}`;
        case 'hh:mm:ss':
            return `${hours}:${minutes}:${seconds}`;
        case 'mm-dd-yyyy':
            return `${mm}-${dd}-${yyyy}`;
        case 'month dd, hh:mm':
            return `${monthName} ${dd}, ${hours}:${minutes}`;
        default:
            return '-';
    }
};