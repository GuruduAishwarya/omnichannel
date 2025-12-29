// import React from "react";
// import "./CommentsSection.css";
// import SpinnerLoader from "../../common/components/SpinnerLoader";

// const CommentsSection = ({
//   comments,
//   onReplyClick,
//   onDeleteClick,
//   replyPreview,
//   onCloseReplyPreview,
//   isDeletingComment, // Add this prop
//   isPostingComment, // Add this prop
// }) => {
//   return (
//     <>
//       <div className="card-header border-bottom-0 d-flex justify-content-between pb-3 mb- card-body">
//         <div className="card-comment card-pop-comment mb-0 h-100">
//           <div className="card-header border-bottom d-flex justify-content-between pb-3 mb-3 px-0 ">
//             <div className="header-title">
//               <div className="d-flex justify-content-between">
//                 <div className="">
//                   <h5 className="mb-0 d-inline-block me-1">Comments</h5>
//                 </div>
//               </div>
//             </div>
//             <div className="share-block d-flex align-items-center feather-icon">
//               <a
//                 href="javascript:void(0);"
//                 className="d-flex align-items-center"
//                 // data-bs-toggle="modal"
//                 data-bs-target="#exampleModalShare"
//               >
//                 <span className="material-symbols-outlined text-dark">
//                   share
//                 </span>
//                 <span className="ms-1 fw-500 text-dark">Share</span>
//               </a>
//             </div>
//           </div>
//           <div
//             className="card-body pt-0 overflow-scroll"
//             style={{ maxHeight: "400px", overflowY: "auto" }}
//           >
//             {isDeletingComment || isPostingComment ? (
//               <SpinnerLoader />
//             ) : (
//               <div className="comments-section">
//                 {comments.map((comment) => (
//                   <div
//                     key={comment.comment_id}
//                     className="d-flex justify-content-between mb-3"
//                   >
//                     <div className="me-2">
//                       <img
//                         src="/assets/images/user/1.jpg"
//                         alt="userimg"
//                         className="avatar-40 rounded-circle img-fluid"
//                         loading="lazy"
//                       />
//                     </div>
//                     <div className="w-100 text-margin">
//                       <div className="">
//                         <h5 className="mb-0 d-inline-block me-1">
//                           Anonymous User
//                         </h5>
//                         <small className="mb-0 d-inline-block">Just now</small>
//                       </div>
//                       <p className="mb-0 font-13">{comment.comments}</p>
//                       <div className="d-flex justify-content-between align-items-center flex-wrap">
//                         <div className="d-flex justify-content-between align-items-center">
//                           <div className="d-flex align-items-center me-3">
//                             <a
//                               href="javascript:void(0);"
//                               onClick={() => onReplyClick(comment.comment_id)}
//                             >
//                               <span className="card-text-1">Reply</span>
//                             </a>
//                             <a
//                               href="javascript:void(0);"
//                               className="ms-3"
//                               onClick={() =>
//                                 onDeleteClick(comment.comment_id, "comment")
//                               }
//                             >
//                               <span className="card-text-1">Delete</span>
//                             </a>
//                           </div>
//                         </div>
//                         <div className="d-flex align-items-center px-2 flex-column justify-content-center lh-1">
//                           <a href="javascript:void(0);">
//                             <span className="material-symbols-outlined">
//                               favorite_border
//                             </span>
//                           </a>
//                           <span className="card-text-1 ms-1">
//                             {comment.comment_likes || 0}
//                           </span>
//                         </div>
//                       </div>

//                       {comment.replies && comment.replies.length > 0 && (
//                         <div className="Reply ms-1">
//                           <ul className="post-comments p-0 mt-2">
//                             {comment.replies.map((reply) => (
//                               <li key={reply.reply_id} className="mb-2">
//                                 <div className="d-flex justify-content-between">
//                                   <div className="me-3">
//                                     <img
//                                       src="/assets/images/user/1.jpg"
//                                       alt="userimg"
//                                       className="avatar-40 rounded-circle img-fluid avatar-1"
//                                       loading="lazy"
//                                     />
//                                   </div>
//                                   <div className="w-100 text-margin">
//                                     <div className="">
//                                       <h5 className="mb-0 d-inline-block me-1">
//                                         Anonymous User
//                                       </h5>
//                                       <h6 className="mb-0 d-inline-block">
//                                         Just now
//                                       </h6>
//                                     </div>
//                                     <p className="mb-0 font-13">
//                                       {reply.comments}
//                                     </p>
//                                     <div className="d-flex justify-content-between align-items-center flex-wrap">
//                                       <div className="d-flex justify-content-between align-items-center">
//                                         <div className="d-flex align-items-center me-3">
//                                           <a
//                                             href="javascript:void(0);"
//                                             onClick={() =>
//                                               onReplyClick(comment.comment_id)
//                                             }
//                                           >
//                                             <span className="card-text-1">
//                                               Reply
//                                             </span>
//                                           </a>
//                                           <a
//                                             href="javascript:void(0);"
//                                             className="ms-3"
//                                             onClick={() =>
//                                               onDeleteClick(
//                                                 reply.reply_id,
//                                                 "reply"
//                                               )
//                                             }
//                                           >
//                                             <span className="card-text-1">
//                                               Delete
//                                             </span>
//                                           </a>
//                                         </div>
//                                       </div>
//                                       <div className="d-flex align-items-center px-2 flex-column justify-content-center lh-1">
//                                         <a href="javascript:void(0);">
//                                           <span className="material-symbols-outlined">
//                                             favorite_border
//                                           </span>
//                                         </a>
//                                         <span className="card-text-1 ms-1">
//                                           {reply.comment_likes || 0}
//                                         </span>
//                                       </div>
//                                     </div>
//                                   </div>
//                                 </div>
//                               </li>
//                             ))}
//                           </ul>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default CommentsSection;
