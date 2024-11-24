import React from "react";

import dayjs from "dayjs";

import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import ReactQuill from "react-quill";
import "quill/dist/quill.snow.css";
import { getPermission, toolbarConfig, validateComments, headers } from "../../utils/utility"
import { API_END_POINT } from "../../../config";

// import { CustomIcons, toolbarConfig, validateComments,getPermission } from "../../utils/validate";

import "./scss/Comments.css";
import { Drawer } from "antd";
import { useAssessmentStore } from "../../pages/assessmentModule/AssessmentStore";
import { useParams } from "react-router-dom";

const Comments = ({role}) => {

  const { id: batchId } = useParams()
  const { user } = useAuth()
  const { openComments, setOpenComments,
    currentAssessment, commentText, setCommentText,
    formErrors, setFormErrors, editId, setAssessmentLists, assessmentLists,
    setIsCommentEditId, isCommentEditId
  } = useAssessmentStore()
  const comments = currentAssessment()?.task_users?.find((student) => student.id === openComments)?.comments || []


  const handleSendComment = () => {
    const commentId = isCommentEditId || openComments; // Use either `isCommentEditId` or `openComments`
    const url = `${API_END_POINT}task/${batchId}/${isCommentEditId ? 'update' : 'create'}/task_comment/${commentId}`;
    const method = isCommentEditId ? "PUT" : "POST";    
    axios({
      method: method,
      url: url,
      data: { comments: commentText },
      headers: headers
    }).then((res) => {
      let updatedComment = res.data.data;
      const updatedAssessmentList = assessmentLists.map((assessment) => {
        if (assessment.id === editId) {
          // Check if it's an edit or a new comment
          if (isCommentEditId) {
            // If it's an edit, update the specific comment
            assessment.task_users.map((users) => {
              users.comments.map((comment) => {
                if (comment.id === isCommentEditId) {
                  // Update the existing comment
                  Object.assign(comment, updatedComment);
                }
              });
            });
          } else {
            // If it's a new comment, add it to the task
            assessment.task_users.map((users) => {
              users.comments.push(updatedComment);
            });
          }
        }
        return assessment;
      });

      setAssessmentLists(updatedAssessmentList)
      setCommentText("")
    }).catch((error) => {
      if (
        error.response.data.status === 400 ||
        "errors" in error.response.data
      ) {
        const errorMessages = error.response.data.errors;

        Object.entries(errorMessages).forEach(([key, messages]) => {
          messages.forEach((message) =>
            notification.error({
              message: `${key} Error`,
              description: message,
            })
          );
        });
      }
    })
  }

  const handleDeleteComment = (commentId) => {
    const url = `${API_END_POINT}task/${batchId}/delete/task_comment/${commentId}`
    axios.delete(url, { headers }).then((res) => {
      const updatedAssessmentList = assessmentLists.map((assessment) => {
        if (assessment.id === editId) {
          // Use map to update the user's comments by excluding the comment with the specified ID
          assessment.task_users.map((user) => {
            user.comments = user.comments.filter((comment) => comment.id !== commentId);
          });
        }
        return assessment;
      });
      if (res.data.status == 200) {
        // Update the local state with the modified task lists
        setAssessmentLists(updatedAssessmentList);
        notification.success({
          message: "Success",
          description: res?.data?.message,
          duration: 1
        })
      }

    }).catch((error) => {
      console.log(error);
    })
  }
  return (
    <>
      <Drawer
        title={<div style={{ fontWeight: 500, fontSize: "16px", fontFamily: "Roboto" }}>Comments</div>}
        open={openComments ? true : false}
        onClose={() => {
          setOpenComments(null)
          setIsCommentEditId(null)
          setCommentText("")
        }}
        maskClosable={false}
      >
        <div className="comments-list-container">
          <div>
            {comments?.length ? (
              <>
                {comments &&
                  comments?.map((comment, index) => {
                    return (
                      <>
                        <div className="comments-main-container" key={index}>
                          <div className="comments-section flex">
                            <div className="profile-image flex">{comment.commentor_details?.first_name[0]?.toUpperCase()}{comment.commentor_details?.last_name[0]?.toUpperCase()}</div>

                            <div className="user-detail flex">
                              <div className="name">
                                {comment.commentor_details.first_name}
                                <span>(
                                  {comment.commentor_details.role})</span>
                                <div className="comment-date">
                                  {dayjs.utc(comment?.created_at).format("MMM DD YYYY hh:mm a")}
                                </div>
                              </div>
                              <div className="icons">

                                {getPermission(user.permissions, "TaskComments", "delete") && (
                                  <>
                                    {comment?.commentor_details?.role == role &&

                                      <>
                                        <img
                                          src="/icons/deleteIcon.svg"
                                          alt="delete-icon"
                                          onMouseOver={(e) => {
                                            e.target.src = "/icons/delete-icon-hover.svg"
                                          }}
                                          onMouseOut={(e) => {
                                            e.target.src = "/icons/deleteIcon.svg"
                                          }}
                                          onClick={() => handleDeleteComment(comment.id)}
                                        />
                                      </>}
                                  </>

                                )}
                                {getPermission(user.permissions, "TaskComments", "update") && (
                                  <>
                                    {comment?.commentor_details?.role == role &&
                                      <>
                                        <img
                                          src="/icons/edit-pencil-icon.svg"
                                          alt="delete-icon"
                                          onMouseOver={(e) => e.target.src = "/icons/edit-icon-hover.svg"}
                                          onMouseOut={(e) => e.target.src = "/icons/edit-pencil-icon.svg"}
                                          onClick={() => {
                                            setIsCommentEditId(comment.id);
                                            setCommentText(comment.comments);
                                          }}
                                        />
                                      </>}
                                  </>
                                )}

                              </div>
                            </div>
                          </div>
                          <div className="comments" dangerouslySetInnerHTML={{ __html: comment.comments }}></div>
                        </div>
                      </>
                    );
                  })}
              </>
            ) : (
              <>
                <div className="no-comments-container">
                  <img src="/icons/no-data.svg" alt="" />
                  <p>No comments here...</p>
                </div>
              </>
            )}

          </div>
        </div>
        {getPermission(user.permissions, "TaskComments", "create") && (
          <div className="overall_input_send">
            <div className="Input-send">
              <div className="input-wrapper">
                <div className="send" onClick={() => validateComments(commentText, "Comments", setFormErrors) && handleSendComment()}>
                  <img
                    src="/icons/Send.svg"
                    alt="Send-icon"

                  />
                </div>
              </div>

              <ReactQuill
                placeholder="Comment here..."
                theme="snow"
                modules={toolbarConfig}
                value={commentText}
                onChange={(value) => {
                  if (formErrors["Comments"]) {
                    delete formErrors["Comments"];
                  }
                  setCommentText(value);
                }}

              />

              <p className="error-message">{formErrors["Comments"] ? formErrors["Comments"] : ""}</p>
            </div>
          </div>
        )}
      </Drawer>

    </>
  );
};

export default Comments;
