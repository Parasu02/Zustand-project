import React, { useEffect } from "react";

import axios from "axios";
import { Modal, Select, Skeleton, notification, Drawer } from "antd";

import { LoadingOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import { API_END_POINT } from "../../../config";
import { useParams } from "react-router-dom";

import "../studentLogin/scss/StudentLogin.css";


import { colorObject, validUrl, headers, truncateText } from "../../utils/utility";
import Comments from "../../components/Assessment/CommentsModule/Comments";
import { useStudentStore } from "./StudentStore";
import { useAssessmentStore } from "../assessmentModule/AssessmentStore";


const StudentLogin = ({ type }) => {

  const { id: batchId } = useParams();
  const {
    setAssessmentLists,
    editId, 
    setEditId,
    setIsLoading,
    assessmentSearch,
  } = useStudentStore(); // Destructure the store

  useEffect(() => {
    setIsLoading(true);
    axios
      .get(
        `${API_END_POINT}task/${batchId}/list/user/task/?filter_task_type=${type === "assessment" ? 1 : 0
        }&search=${assessmentSearch}`,
        { headers }
      )
      .then((res) => {
        setIsLoading(false);
        setAssessmentLists([...res.data.data]);
        setEditId([...res.data.data].length > 0 ? [...res.data.data][0]["id"] : null);
      })
      .catch((error) => {
        if (
          error.response.data.status === 400 ||
          "errors" in error.response.data
        ) {
          const errorMessages = error.response.data.errors;
          if (errorMessages && errorMessages.detail) {
            notification.error({
              message: error.response.data.message,
              description: errorMessages.detail,
              duration: 1,
            });
          }
          setIsLoading(false);
        }
      });
  }, [type, assessmentSearch]);




  return (
    <>
      <AssessmentList />
      {editId && <AssessmentView weightageShow={type === "task" ? false : true} />}
      {editId === null && (
        <div className="select-something-container flex">
          <div className="image-container ">
            <img src="/icons/select-something.svg" alt="" />
            <p className="select-something-heading">
              {editId !== null
                ? `Please Select any of the Available ${type}`
                : `No ${type} are currently available here.`}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentLogin;


export const AssessmentList = () => {
  const { setAssessmentSearch, AssessmentLists } = useStudentStore()



  return (
    <>
      <section className="listing-container">
        <h1>{"type"} list</h1>
        <div className="search-container">
          <input type="input" placeholder="search..." onChange={(e) => setAssessmentSearch(e.target.value)} />{" "}
          <img
            src="/icons/searchIcon.svg"
            alt="search-icon"
            className="search-icon"
          />
        </div>
        <div className="task-list-container">
          {AssessmentLists &&
            AssessmentLists.map((assessment) => {
              return (
                <TaskCard key={assessment.id} assessment={assessment} />
              );
            })}
        </div>
      </section>
    </>
  );
};

const TaskCard = ({ assessment }) => {
  const { isLoading, setEditId, editId } = useStudentStore()
  return (
    <>
      <div
        style={{ marginTop: "12px" }}
        className={`task-card  flex ${assessment.id === editId ? "active" : ""
          }`}
        onClick={() => setEditId(assessment.id)}
      >
        {isLoading ? (
          <Skeleton avatar={{ size: "small" }} active paragraph={{ rows: 1 }} />
        ) : (
          <>
            <div className="task-icon flex">
              <span>{assessment?.task?.task_title?.split(" ").slice(0, 2).map(word => word[0].toUpperCase()).join("")}</span>
            </div>

            <div className="task-details">
              <div className="task-name-with-icon flex">
                <h2>{truncateText(assessment.task.task_title, 15)}</h2>
              </div>
              <p className="task-description">
                {truncateText(
                  assessment.task.task_description.replace(/<[^>]*>/g, ""),
                  50
                )}
              </p>
              <span
                className="btn btn-inprogress"
                style={{
                  backgroundColor:
                    colorObject[assessment?.task_status]?.backgroundColor,
                  color: colorObject[assessment?.task_status]?.color,
                }}
              >
                {assessment.task_status}
              </span>
              <span className="btn btn-deadline">
                {dayjs.utc(assessment.task.due_date).format("MMM DD YYYY")}
              </span>
            </div>
          </>
        )}
      </div>
    </>
  );
};


export const AssessmentView = ({ weightageShow }) => {
  const { id: batchId } = useParams();
  const {
    setIsLoading,
    AssessmentLists,
    editId,
    isLoading,
    setAssessmentLists,
    getCurrentAssessment,
    setChangeStatus,
    changeStatus,
    formErrors,
    setFormErrors,
    submissionLink,
    setSubmissionLink
  } = useStudentStore()
  const currentAssessment = getCurrentAssessment()

  const { 
    setCommentText,
    setIsCommentEditId,
    openStudentCommentId,
    setOpentStudentCommentId
  } = useAssessmentStore()

  const handleChange = (status) => {
    setIsLoading(true);
    if (status !== "SUBMITTED") {
      axios
        .put(
          `${API_END_POINT}task/${batchId}/update/task/user/${editId}`,
          { task_status: status },
          { headers }
        )
        .then((res) => {
          setIsLoading(false);
          let copiedTaskList = AssessmentLists.map((task) => {
            if (task.id === editId) {
              task["task_status"] = status;
            }
            return task;
          });

          setAssessmentLists(copiedTaskList);
        })
        .catch((error) => {
          console.log(error);
          setIsLoading(false);

          if (
            error.response.data.status === 400 ||
            "errors" in error.response.data
          ) {
            const errorMessages = error.response.data.errors;
            notification.error({
              message: `Permission denied Error`,
              description: errorMessages.detail,
              duration: 1
            })
          }
        });
    } else {
      setChangeStatus(status);
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {

    if (validUrl(submissionLink, "Submission link", setFormErrors)) {
      const url = `${API_END_POINT}task/${batchId}/update/task/user/${editId}`;
      setIsLoading(true);
      axios
        .put(
          url,
          {
            task_status: changeStatus,
            submission_link: submissionLink,
          },
          { headers }
        )
        .then((res) => {
          if (res.status === 200) {
            let updatedTask = AssessmentLists.map((task) => {
              if (task.id === editId) {
                return {
                  ...task,
                  task_status: changeStatus,
                };
              }
              return task;
            });
            notification.success({
              message: "Success",
              description: `${type} Submitted`,
            });
            setAssessmentLists(updatedTask);
            setIsLoading(false);
            setChangeStatus("")
          }
        })
        .catch((error) => {
          setIsLoading(false);
          console.log(error);
          setChangeStatus("")
        });
    }

  };

  console.log(currentAssessment);

  return (
    <div className="main-container">
      {isLoading ? <Skeleton active paragraph={6} /> : (
        <>
          <div className="module-header-section flex" key={currentAssessment.id}>
            <div className="module-title-section flex">
              <h3>{currentAssessment.task.task_title}</h3>
            </div>
            <div className="comments" onClick={() => setOpentStudentCommentId(currentAssessment.id)}>
              <img src="/icons/comment-border.svg" alt="" />
              <button className="secondary-border-btn" >Comments</button>
            </div>
          </div>

          <div className="task-details-header-container">
            <div className="background-div">
              <div className="task-label-container flex">
                <h3>Task Details</h3>
                <div className="horizon-line"></div>
              </div>

              <div className="student-task-details-main-container flex">
                <div className="student-task-trainer-name">
                  <p>Trainer Name</p>
                  <span>{currentAssessment?.reviewer?.first_name}</span>
                </div>

                <div className="student-task-status">
                  <p>Status</p>
                  <Select
                    onChange={handleChange}
                    prefixCls={`students-status-${currentAssessment.task_status}-status`}
                    disabled={
                      currentAssessment.task_status === "SUBMITTED" ||
                      currentAssessment.task_status === "COMPLETED"
                    }
                    value={currentAssessment.task_status}
                    style={{ width: "70%" }}
                    suffixIcon={
                      <img src="/icons/drop.svg" alt="Sample SVG" />
                    }

                    options={[
                      { label: "Todo", value: "TODO" },
                      { label: "Inprogress", value: "INPROGRESS" },
                      { label: "Submitted", value: "SUBMITTED" }
                    ]}
                  />
                </div>
                <div className="student-task-deadline">
                  <p>Deadline</p>
                  <span>
                    {dayjs(currentAssessment.task.due_date).format("MMM,DD YYYY")}
                  </span>
                </div>
              </div>

              <div className="task-editor-container">
                <p>Description</p>

                <div className="task-instruction">
                  <span
                    dangerouslySetInnerHTML={{
                      __html: currentAssessment.task.task_description,
                    }}
                  ></span>
                </div>
              </div>
              {weightageShow && (
                <>
                  <div className="weightage-label-container flex">
                    <h3>Weightage Details</h3>
                    <div className="horizon-line"></div>
                  </div>
                  <div className="student-weightage-list flex">
                    {currentAssessment?.weightage_details &&
                      currentAssessment?.weightage_details?.map(
                        (weightageDetails, index) => (
                          <div className="student-weightage-card flex">
                            <p>
                              {
                                weightageDetails.weightage_details
                                  .weightage
                              }
                              {""}
                            </p>
                            <span>
                              {Number(
                                weightageDetails.weightage_percentage
                              )}
                            </span>
                            <span className="score">
                              {weightageDetails?.task_score?.map((a) =>
                                Number(a.task_score)
                              )}
                            </span>{" "}
                          </div>
                        )
                      )}
                  </div>
                </>
              )}

              {currentAssessment?.submission_link && (
                <div className="submission-link-container">
                  <div className="heading-line flex">
                    <h3>Submitted Link</h3>
                    <div className="horizon-line"></div>
                  </div>
                  <a
                    href={`${currentAssessment.submission_link}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {currentAssessment.submission_link}
                  </a>
                </div>
              )}
            </div>


            <div className="comments-container">
              <Drawer title="Comments"
                open={openStudentCommentId}
                onClose={() => {
                  setOpentStudentCommentId(null)
                  setCommentText("")
                  setIsCommentEditId(null)
                }}
              >
                <Comments role={"Student"} />
              </Drawer>
            </div>
          </div>
          <Modal
            prefixCls="submission-modal"
            title={<span>Submission Link</span>}
            open={changeStatus == "SUBMITTED"}
            onOk={handleSubmit}
            onCancel={()=>setChangeStatus("")}
            footer={[
              <div className="over-all-btns">
                <div className="all-btn flex">
                  <button
                    key="cancel"
                    className="btn primary-default"
                    onClick={() => ()=>setChangeStatus("")}
                  >
                    Cancel
                  </button>
                  <div className="submit-btn">
                    <button
                      key="submit"
                      type="primary"
                      className="btn primary-medium"
                      onClick={handleSubmit}
                      loading={isLoading}
                    >
                      {isLoading ? (
                        <span>
                          Submitting...
                          <LoadingOutlined className="loader" />
                        </span>
                      ) : (
                        "Submit"
                      )}
                    </button>
                  </div>
                </div>            
              </div>
            ]}
          >
            <div className="submission-link-input">
              <input
                className="input-link"
                type="url"
                name="Submission link"
                placeholder="Paste submission link"
                onChange={(e) => {
                  const { value, name } = e.target
                  setSubmissionLink(value)
                  if (formErrors[name]) {
                    delete formErrors[name];
                  }
                }}

              />
              <p className="error-message">{formErrors["Submission link"] ? formErrors["Submission link"] : ""}</p>
            </div>
          </Modal>


        </>
      )}
    </div>
  )
}