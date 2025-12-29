import React, { useState, useEffect } from 'react';
import Loader from './Loader';

const PDFViewer = ({ url, title, containerStyle = {} }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Clean up the URL to ensure it's properly formatted
  const cleanUrl = url ? url.trim() : '';
  
  // Extract file name from URL for display
  const fileName = cleanUrl ? cleanUrl.split('/').pop() : 'document.pdf';

  // Handle errors with iframe loading
  const handleIframeError = () => {
    console.log("PDF iframe error loading:", cleanUrl);
    setError(true);
    setLoading(false);
  };

  // Handle iframe load completion
  const handleIframeLoad = () => {
    console.log("PDF iframe loaded successfully:", cleanUrl);
    setLoading(false);
  };

  // Reset state when URL changes
  useEffect(() => {
    setLoading(true);
    setError(false);
  }, [url]);

  // Open PDF in new tab - this is now the main action
  const openInNewTab = () => {
    if (cleanUrl) {
      window.open(cleanUrl, '_blank');
    }
  };

  return (
    <div style={{ 
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      ...containerStyle
    }}>
      {/* Document header - simplified */}
      <div className="d-flex align-items-center justify-content-between p-2 bg-light border-bottom">
        <div className="d-flex align-items-center">
          <i className="fa fa-file-pdf-o text-danger me-2"></i>
          <span className="text-truncate" style={{maxWidth: '200px'}} title={title || fileName}>
            {title || fileName}
          </span>
        </div>
        <button 
          className="btn btn-sm btn-primary" 
          onClick={openInNewTab}
          title="Open document in a new tab"
        >
          <i className="fa fa-external-link me-1"></i> View Document
        </button>
      </div>
      
      {/* Document content area - simplified to just show a PDF placeholder */}
      <div style={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: '20px',
        textAlign: 'center'
      }}>
        <i className="fa fa-file-pdf-o text-danger mb-3" style={{fontSize: '64px'}}></i>
        <h5 className="mb-2">{title || 'Document'}</h5>
        <p className="text-muted mb-4">Click the button below to view this document</p>
        <button className="btn btn-lg btn-primary mb-4" onClick={openInNewTab}>
          <i className="fa fa-external-link me-2"></i> Open PDF
        </button>
        
        <div className="border rounded p-3 mb-3 bg-light text-start" style={{maxWidth: '400px'}}>
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-truncate" style={{maxWidth: '300px'}} title={fileName}>
              <i className="fa fa-file-pdf-o text-danger me-2"></i>{fileName}
            </span>
            <span className="badge bg-danger">PDF</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
