import React from 'react';

export default function DynamicLocation({ latitude, longitude, url = "" }) {
    let googleMapUrl = '';

    // Extract latitude and longitude from the URL if provided
    if (url) {
        try {
            const urlObject = new URL(url);
            const coords = urlObject.pathname.split('/').pop().split(',');
            if (coords.length === 2) {
                latitude = coords[0];
                longitude = coords[1];
            }
        } catch (error) {
            console.error('Error parsing URL:', error);
        }
    }

    // Debugging: Log the latitude and longitude values
    // console.log('Latitude:', latitude);
    // console.log('Longitude:', longitude);

    // Construct the Google Maps iframe URL dynamically based on latitude and longitude
    if (latitude && longitude) {
        googleMapUrl = `https://www.google.com/maps?q=${latitude},${longitude}&hl=es;z=14&output=embed`;
    }
    return (
        <div>
            {googleMapUrl && (
                <iframe
                    src={googleMapUrl}
                    width="300"
                    height="200"
                    style={{ border: 0 }}
                    title='location'
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                />
            )}
        </div>
    );
}
