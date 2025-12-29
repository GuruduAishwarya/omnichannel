import React from 'react';
import LazyLoad from 'react-lazyload';

export default function LazyLoadImage({ src, alt, className }) {
    return (
        <LazyLoad height={200} offset={100}>
            <img src={src} alt={alt} className={`img-fluid ${className}`} style={{ width: "500px" }} />
        </LazyLoad>
    );
}


