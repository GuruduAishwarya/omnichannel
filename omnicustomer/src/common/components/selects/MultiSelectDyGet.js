import React, { useState, useEffect } from 'react';
import AsyncSelect from 'react-select/async';
import axios from 'axios';
import { getToken, simpleAlert, triggerAlert } from '../../../utils/CommonFunctions';

const fetchData = async (apiUrl, token) => {
    try {
        const response = await axios.get(apiUrl, token);
        const responseData = response.data;

        if (responseData.error_code === 200) {
            return responseData.results;
        } else if (response.status === 204) {
            simpleAlert('Data not found!');
        } else {
            triggerAlert('error', 'Oops...', "Couldn't get the options");
        }
    } catch (error) {
        console.error('Error loading options:', error);
        return [];
    }
};

export default function MultiSelectDyGet({
    apiUrl,
    onSelect,
    placeholder,
    mapOption,
    value,
}) {
    const [options, setOptions] = useState([]);

    useEffect(() => {
        const token = getToken();
        fetchData(apiUrl, token).then(apiResponse => {
            const mappedOptions = apiResponse?.map(mapOption);
            setOptions(mappedOptions);
        });
    }, [apiUrl]);

    const loadOptions = (inputValue, callback) => {
        const filteredOptions = options.filter(option =>
            option.label?.toString()?.toLowerCase()?.includes(inputValue.toLowerCase())
        );
        callback(filteredOptions);
    };

    return (
        <AsyncSelect
            isMulti
            cacheOptions
            isClearable
            loadOptions={loadOptions}
            defaultOptions={options}
            onChange={onSelect}
            placeholder={placeholder || 'Search...'}
            value={value} // Use provided value directly for multi-select
            getOptionLabel={(option) => option?.label?.toString()} // Ensure the label is a string
            styles={{
                control: baseStyles => ({
                    ...baseStyles,
                    border: '1px solid #e8e8f7 !important',
                    boxShadow: '1px solid #e9e9ef',
                    background: '#f6f6ff',
                    color: '#000',
                }),
            }}
        />
    );
};

