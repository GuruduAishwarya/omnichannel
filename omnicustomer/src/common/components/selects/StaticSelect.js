import React from 'react';
import Select from 'react-select';

const StaticSelect = ({ options, value, onChange, isDisabled, placeholder }) => {
    const selectedOption = options?.find(option => option.value == value);
    return (
        <Select
            options={options}
            isDisabled={isDisabled}
            value={selectedOption || null}
            onChange={onChange}
            placeholder={placeholder}
            isClearable
            styles={{
                control: baseStyles => ({
                    ...baseStyles,
                    border: isDisabled ? '1px solid #e9e9ef !important' : '1px solid #e9e9ef !important',
                    boxShadow: isDisabled ? 'none' : '1px solid #f8f9fa',
                    background: isDisabled ? '#e9e9ef' : '#f8f9fa',
                    color: isDisabled ? '#999' : '#000',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                }),
            }}
        />
    );
};

export default StaticSelect;
