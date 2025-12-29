import React from "react";

const ReplyPreview = ({ replyPreview, onCloseReplyPreview }) => {
  if (!replyPreview) return null;

  return (
    <div className="reply-preview p-2 border rounded mb-2 bg-light">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <small className="text-muted">Replying to comment:</small>
        <button
          type="button"
          className="btn-close btn-sm"
          aria-label="Close"
          onClick={() => onCloseReplyPreview(replyPreview.commentId)}
        ></button>
      </div>
      <p className="mb-0 small text-truncate">{replyPreview.userComment}</p>
    </div>
  );
};

export default ReplyPreview;
