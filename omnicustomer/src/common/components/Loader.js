import React from 'react'
import './Loader.css'

export default function Loader() {
  return (

    // <Spinner animation="border" role="status">
    //   <span className="visually-hidden">Loading...</span>
    // </Spinner>
    <div className="loader-container">
      <div className="loader"></div>
      <p>Loading...</p>
    </div>

  );
}