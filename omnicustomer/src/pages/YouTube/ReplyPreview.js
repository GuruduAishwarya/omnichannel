import React from "react";

const ReplyPreview = ({ replyPreview, onCloseReplyPreview }) => {
  if (!replyPreview) return null;

  return (
    <div
      className="reply-info-preview position-relative"
      style={{
        margin: "8px 5px 1px",
        padding: "10px",
        border: "1px solid rgb(204, 204, 204)",
        borderRadius: "5px",
        backgroundColor: "rgb(241, 241, 241)",
      }}
    >
      <p>
      {replyPreview.userName}   {replyPreview.userComment}
      </p>
      <button
        style={{
          position: "absolute",
          top: "5px",
          right: "5px",
          background: "black",
          color: "white",
          width: "20px",
          height: "20px",
          cursor: "pointer",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: "50%",
        }}
        onClick={() => onCloseReplyPreview(replyPreview.commentId)}
      >
        ×
      </button>
    </div>
  );
};

export default ReplyPreview;
