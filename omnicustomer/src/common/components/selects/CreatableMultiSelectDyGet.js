import React, { useState, useEffect } from 'react';
import CreatableSelect from 'react-select/creatable';
import axios from 'axios';
import { getToken, simpleAlert, triggerAlert } from '../../../utils/CommonFunctions';

const fetchData = async (apiUrl, token) => {
    try {
        const response = await axios.get(apiUrl, token);
        const responseData = response.data;

        if (responseData.error_code === 200) {
            return responseData.results;
        } else if (response.status === 204) {
            // simpleAlert('Data not found!');
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

const createOption = (label) => ({
    label,
    value: label.toLowerCase().replace(/\W/g, ''),
});

export default function CreatableMultiSelectDyGet({
    apiUrl,
    onSelect,
    placeholder,
    mapOption,
    value = [], // Ensure value defaults to an empty array
}) {
    const [options, setOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch options from the API on component mount and whenever apiUrl changes
    useEffect(() => {
        const token = getToken();
        const fetchOptions = async () => {
            const apiResponse = await fetchData(apiUrl, token);
            const mappedOptions = apiResponse?.map(mapOption) || [];
            setOptions(mappedOptions);
        };

        fetchOptions();
    }, [apiUrl]);

    const loadOptions = (inputValue, callback) => {
        const filteredOptions = options.filter(option =>
            option.label?.toString()?.toLowerCase()?.includes(inputValue.toLowerCase())
        );
        callback(filteredOptions);
    };
    const handleCreate = (inputValue) => {
        const newOptionValue = Number(inputValue); // Convert to number

        // Check if the input is numeric and meets the length requirements
        if (!isNaN(newOptionValue)) {
            const valueLength = inputValue.toString().length; // Get the length of the input as a string

            if (valueLength >= 10 && valueLength <= 14) {
                setIsLoading(true);
                setTimeout(() => {
                    const newOption = createOption(newOptionValue.toString());
                    setIsLoading(false);

                    // Remove newly created option from the options list after adding
                    setOptions((prev) => prev.filter((option) => option.value !== newOption.value));

                    // Select the new option
                    onSelect([...Array.isArray(value) ? value : [], newOption]);
                }, 1000);
            } else {
                // Trigger alert for invalid length
                triggerAlert('info', 'Invalid input', 'Phone number must be between 10 and 11 digits');
            }
        } else {
            // Handle non-numeric case
            triggerAlert('info', 'Invalid input', 'Only numeric values are allowed');
        }
    };

    const handleChange = (selectedOption) => {
        // Remove selected options from available options
        const selectedValues = selectedOption.map(option => option.value);
        const filteredOptions = options.filter(option => !selectedValues.includes(option.value));

        // Update available options without the selected ones
        setOptions(filteredOptions);

        // Call onSelect with the new selection
        onSelect(selectedOption);
    };

    return (
        <CreatableSelect
            isMulti
            cacheOptions
            isClearable
            loadOptions={loadOptions}
            options={options} // Show initial options from API
            onChange={handleChange} // Use custom handler to remove selected options
            onCreateOption={handleCreate} // Enable creating new options
            placeholder={placeholder || 'Search...'}
            value={value} // Use provided value directly for multi-select
            getOptionLabel={(option) => option?.label?.toString()} // Ensure the label is a string
            isLoading={isLoading} // Show loading state when creating a new option
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
}
