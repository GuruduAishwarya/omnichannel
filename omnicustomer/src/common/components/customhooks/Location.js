// useLocation.js
import { useState } from 'react';
import { triggerAlert } from '../../../utils/CommonFunctions';


const useLocation = () => {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            triggerAlert('error', "Oops...", "Geolocation is not supported by this browser.");
            return;
        }

        setLoading(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ latitude, longitude });
                setLoading(false);
            },
            (error) => {
                setLoading(false);
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        triggerAlert('info', "", "User denied the request for Geolocation.");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        triggerAlert('error', "Oops...", "Location information is unavailable.");
                        break;
                    case error.TIMEOUT:
                        triggerAlert('error', "Oops...", "The request to get user location timed out.");
                        break;
                    case error.UNKNOWN_ERROR:
                        triggerAlert('error', "Oops...", "An unknown error occurred.");
                        break;
                    default:
                        triggerAlert('error', "Oops...", "An error occurred.");
                        break;
                }
            }
        );
    };

    return {
        location,
        loading,
        handleGetLocation,
    };
};

export default useLocation;
