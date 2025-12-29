import React, { useState, useEffect } from 'react';
import AsyncSelect from 'react-select/async';
import axios from 'axios';
import { getToken, triggerAlert } from '../../../utils/CommonFunctions';

const fetchData = async (apiUrl, token) => {
    try {
        const response = await axios.get(apiUrl, token);
        const responseData = response.data;

        if (responseData.error_code === 200) {
            return responseData.results;
        } else if (response.status === 204) {
            //simpleAlert('No Data Available!');
            return [];
        } else {
            triggerAlert('error', 'Oops...', "Couldn't get the options");
            return [];
        }
    } catch (error) {
        console.error('Error loading options:', error);
        return [];
    }
};

// const DynamicSelect = ({
//     apiUrl,
//     onSelect,
//     placeholder,
//     mapOption, // Mapping function to transform API response into the expected format
//     value,
//     disabled,
// }) => {
//     const [options, setOptions] = useState([]);
//     useEffect(() => {
//         const token = getToken();
//         fetchData(apiUrl, token).then(apiResponse => {
//             // Apply the mapping function to transform the API response
//             const mappedOptions = apiResponse.map(mapOption);
//             setOptions(mappedOptions);
//         });
//     }, [apiUrl]);

//     const loadOptions = (inputValue, callback) => {
//         const filteredOptions = options.filter(option =>
//             option.label.toString().toLowerCase().includes(inputValue.toLowerCase())
//         );
//         callback(filteredOptions);
//     };

//     const handleSelect = selectedOption => {
//         if (onSelect) {
//             onSelect(selectedOption);
//         }
//     };

//     return (
//         <AsyncSelect
//             cacheOptions
//             isClearable // to clear selected option
//             loadOptions={loadOptions}
//             defaultOptions={options}
//             onChange={handleSelect}
//             isDisabled={disabled}
//             placeholder={placeholder || 'Search...'}
//             value={options.find(option => option.value == value) || null} // Preselect based on the provided value
//             styles={{
//                 control: baseStyles => ({
//                     ...baseStyles,
//                     border: '1px solid #e8e8f7 !important',
//                     boxShadow: '1px solid #e9e9ef',
//                     background: '#f6f6ff',
//                     color: '#000',
//                 }),
//             }}
//         />
//     );
// };


const DynamicSelect = ({
    apiUrl,
    onSelect,
    placeholder,
    mapOption,
    value,
    disabled,
    isClearable = true, // default is true if not provided
}) => {
    const [options, setOptions] = useState([]);

    useEffect(() => {
        const token = getToken();
        fetchData(apiUrl, token).then(apiResponse => {
            const mappedOptions = apiResponse.map(mapOption);
            setOptions(mappedOptions);
        });
    }, [apiUrl]);

    const loadOptions = (inputValue, callback) => {
        const filteredOptions = options.filter(option =>
            option.label.toString().toLowerCase().includes(inputValue.toLowerCase())
        );
        callback(filteredOptions);
    };

    const handleSelect = selectedOption => {
        if (onSelect) {
            onSelect(selectedOption);
        }
    };

    return (
        <AsyncSelect
            cacheOptions
            isClearable={isClearable} // <-- use the prop here
            loadOptions={loadOptions}
            defaultOptions={options}
            onChange={handleSelect}
            isDisabled={disabled}
            placeholder={placeholder || 'Search...'}
            value={options.find(option => option.value == value) || null}
            styles={{
                control: baseStyles => ({
                    ...baseStyles,
                    border: '1px solid #e8e8f7',
                    boxShadow: '1px solid #e9e9ef',
                    background: '#f6f6ff',
                    color: '#000',
                }),
            }}
        />
    );
};
export default DynamicSelect;
