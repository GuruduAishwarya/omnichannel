import React from 'react';

const Base64Preview = ({ base64Data, filename, filetype }) => {
  // console.log("Base64Preview", filetype, filename)
  // Determine if the file is an image
  const isImage = ['jpg', 'jpeg', 'png', 'PNG', 'JPG', 'JPEG', 'svg', 'SVG'].includes(filetype);
  return (
    <div>
      <p>Uploaded file:</p>
      {isImage ? (
        <img src={base64Data} alt={filename} style={{ maxWidth: '100%', maxHeight: '80px' }} />
      ) : (
        <a href={base64Data} download={filename}>
          Download {filename + '.' + filetype}
        </a>
      )}
    </div>
  );
};

export default Base64Preview;
