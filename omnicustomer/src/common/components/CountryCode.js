//Working - final
import React, { useEffect, useState } from 'react';
import IntlTelInput from 'intl-tel-input/react';
import 'intl-tel-input/build/css/intlTelInput.css';
import { Controller } from 'react-hook-form';
import { rawCountryData } from '../../utils/Constants'; // Your country data

const CountryCodeSelector = ({ control, name, rules, className, placeholder, containerClass, disabled, defaultValue }) => {
    const [initialCountry, setInitialCountry] = useState('');
    const [componentKey, setComponentKey] = useState(0); // Unique key for reinitialization

    // Function to extract country code based on phone number
    const getCountryCodeByDialCode = (phoneNumber) => {
        const cleanPhoneNumber = phoneNumber.replace(/[^0-9]/g, ''); // Remove non-numeric characters
        const matchedCountry = rawCountryData.find((country) =>
            cleanPhoneNumber.startsWith(country.dialCode) // Check if number starts with any dial code
        );

        // If country code is +1, prioritize 'us'
        if (matchedCountry?.dialCode === '1') {
            return 'us'; // Ensure US flag is shown when country code is 1
        }
        return matchedCountry ? matchedCountry.code : ''; // Return country code or empty string
    };
    // Set initial country code based on the default value
    useEffect(() => {
        if (defaultValue) {
            const countryCode = getCountryCodeByDialCode(defaultValue);
            setInitialCountry(countryCode || 'us'); // Default to US if code not found
        } else {
            setInitialCountry('us'); // Default to US if no default value
        }
        setComponentKey((prevKey) => prevKey + 1); // Force re-render
    }, [defaultValue]);



    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            defaultValue={defaultValue}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
                <div key={componentKey}>
                    <IntlTelInput
                        initialValue={defaultValue || value || ''} // Set initial value
                        onChangeNumber={(isValid) => {
                            // console.log('Phone Number:', isValid); // Log the full phone number
                            if (isValid) {
                                onChange(isValid); // Pass the full valid phone number to react-hook-form
                            } else {
                                onChange(''); // Clear value if invalid
                            }
                        }}
                        initOptions={{
                            preferredCountries: ['us', 'in',], // Prioritize India & US
                            initialCountry: initialCountry || 'auto', // Set initial country or 'auto' if no country
                            // preferredCountries: ['us', 'gb', 'in', 'ca'],
                            localizedCountries: { in: 'India', us: 'United States' }, // Localized country names
                            separateDialCode: true,
                            containerClass: containerClass || ' ',
                            loadUtils: () => import('intl-tel-input/utils'),
                        }}
                        inputProps={{
                            className: `form-control ${className}`,
                            style: { width: '100%' },
                            placeholder: placeholder || 'Enter your contact number',
                        }}
                        disabled={disabled || false}
                    />
                    {error && (
                        <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                            {error.message}
                        </div>
                    )}
                </div>
            )}
        />
    );
};

export default CountryCodeSelector;
