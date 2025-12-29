import React from 'react'
import LazyLoadImage from '../../../common/components/LazyLoadImage'

export default function MessageNo() {
    return (
        <div className='d-flex justify-content-center flex-column align-items-center'>
            {/* <img src='/assets/images/Templates.jpg' alt='inbox' style={{ width: '80%', height: '100' }} /> */}
            <LazyLoadImage src='/assets/images/Inbox.jpg' alt='inbox' />
            <p className='text-center'>Please select any one Contact and view</p>
        </div>
    )
}
