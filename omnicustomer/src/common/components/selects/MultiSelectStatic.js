import React from 'react'
import Select from 'react-select';

export default function MultiSelectStatic({ options, value, onSelect, placeholder }) {

    const loadOptions = (inputValue, callback) => {
        const filteredOptions = options.filter(option =>
            option.label.toString().toLowerCase().includes(inputValue.toLowerCase())
        );
        callback(filteredOptions);
    };
    return (
        <Select
            isClearable // to clear selected option
            options={options}
            isMulti
            // value={selectedOptions}
            loadOptions={loadOptions}
            value={value} // Use provided value directly for multi-select
            getOptionLabel={(option) => option.label.toString()} // Ensure the label is a string
            onChange={onSelect}
            placeholder={placeholder}
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
    )
}
