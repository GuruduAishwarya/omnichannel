import React from 'react'

export default function SpinnerLoader() {
    return (
        <div className="text-center">
            <img src="/assets/images/page-img/page-load-loader.gif" alt="loader" style={{ height: '100px' }} loading="lazy" />
        </div>
    )
}
