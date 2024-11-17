import React from 'react'
import { useAssessmentStore } from '../pages/assessmentModule/AssessmentStore'
import colorObject from '../utils/validate'
import dayjs from "dayjs";
import axios from 'axios';
import { API_END_POINT } from '../../config';
import { Skeleton, Collapse, Dropdown, notification } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import { Drawer } from 'antd';
import { getPermission, headers, isScoreValidate } from '../utils/validate';
import { useAuth } from '../context/AuthContext';
import { makeFirstLatterCaps } from '../utils/validate';
import { useParams } from 'react-router-dom';
import Comments from './CommentsModule/Comments';
export default function AssessmentScore() {
    const { user } = useAuth()
    const { id: batchId } = useParams()
    const { currentAssessment, assessmentLists, setAssessmentLists, formErrors, setFormErrors, assginedStudentsSearchWord, setAssignedStudentsSearchWord, studentLoading,
        setStudentLoading, setStudentScoreLists, studentScoreLists,setOpenComments
    } = useAssessmentStore()
    const currAssessment = currentAssessment()

    const handleStatusChange = (studentId, status) => {
        setStudentLoading(true)
        const url = `${API_END_POINT}task/${batchId}/update/task/user/${studentId}`;

        axios
            .put(url, { task_status: status }, { headers })
            .then((res) => {
                setStudentLoading(false)
                let copiedTaskStatusChangeStudents = assessmentLists.map(
                    (assessment) => {
                        assessment["task_users"] = assessment.task_users.map((user) => {
                            if (user.id === studentId) {
                                user.task_status = status;
                            }
                            return user;
                        });
                        return assessment;
                    }
                );

                setAssessmentLists(copiedTaskStatusChangeStudents);

                notification.success({
                    message: "Success",
                    description: `${""}`,
                    duration: 1,
                });
            })
            .catch((error) => {
                setStudentLoading(false)
                console.log(error);
            });
    };
    const handleScoreOnchange = (e, students, weightage) => {

        const { name, value } = e.target;
        if (formErrors[name]) {
            delete formErrors[name];
        }

        if (Number(value)) {

            // If the score is a number, update or add the score to the state
            const updatedScore = {
                task_user: students.id,
                task_weightage: weightage.id,
                task_score: Number(value),
            };

            const existingScoreIndex = studentScoreLists.findIndex(
                (score) =>
                    score.task_user === students.id &&
                    score.task_weightage === weightage.id
            );

            if (existingScoreIndex !== -1) {
                // If the score exists, update it
                const updatedStudentScores = [...studentScoreLists];
                updatedStudentScores[existingScoreIndex].task_score = Number(value);
                setStudentScoreLists(updatedStudentScores);
            } else {
                // If the score doesn't exist, add it to the state
                setStudentScoreLists([...studentScoreLists, updatedScore]);
            }
        } else {
            // If the score is null or not a number, remove the corresponding object from the state
            const filteredStudentScores = studentScoreLists.filter(
                (score) =>
                    score.task_user !== students.id ||
                    score.task_weightage !== weightage.id
            );
            setStudentScoreLists(filteredStudentScores);
        }


    };
    
    const handleAddScore = () => {
        setStudentLoading(true)
        studentScoreLists.map((scores) => {
          const url = `${API_END_POINT}task/${batchId}/create/task_score/`;
          axios
            .post(url, scores, { headers })
            .then((res) => {
              axios
                .put(
                  `${API_END_POINT}task/${batchId}/update/task/user/${scores.task_user}`,
                  { task_status: "COMPLETED" },
                  { headers }
                )
                .then((res) => {
                  setStudentLoading(false)
                  let statusChangeAfterScore = [...assessmentLists];
                  statusChangeAfterScore = statusChangeAfterScore.map((assessment) => {
                    assessment.task_users = assessment.task_users.map((student) => {
                      studentScoreLists.forEach((scores) => {
                        if (student.id === scores.task_user) {
                          student.task_status = "COMPLETED";
                        }
                      });
                      return student;
                    });
                    return assessment;
                  });
                  setAssessmentLists(statusChangeAfterScore);
                  
                  notification.success({
                    message:"Success",
                    description:"Score Added Successfully"
                  })
                })
                .catch((error) => {
                  console.log(error);
                  setStudentLoading(false)
    
                });
            })
            .catch((error) => {
                setStudentLoading(false)
              if("errors" in error.response.data){
                const errorMessages = error.response.data.errors;
                notification.error({
                  message: 'Error',
                  description: (
                    <>
                      {errorMessages.map((message, index) => (
                        <p key={index}>{message}</p>
                      ))}
                    </>
                  ),
                });
              }
            });
        });
      };

    return (
        <>
            <main className="main-container">
                {studentLoading ? <Skeleton active /> : (
                    <>
                        <div className="task-heading">
                            <p>{currAssessment?.task_users?.length && currAssessment?.task_title ? currAssessment.task_title : ""}</p>
                            {currAssessment?.task_users?.length > 0 && (
                                <div className="search-container">
                                    <input
                                        type="input"
                                        placeholder="Search..."
                                        onChange={(e) => setAssignedUsersSearch(e.target.value)}
                                    />
                                    <img
                                        src="/icons/searchIcon.svg"
                                        alt="Search icon"
                                        className="search-icon"
                                    />
                                </div>
                            )}
                        </div>
                        {currAssessment?.task_users?.length ? (
                            <div className='task-main-container'>
                                <Collapse
                                    bordered={false}
                                    ghost
                                    prefixCls='score-section'
                                    defaultActiveKey={['1']}
                                    expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                                    style={{
                                        background: "#ffff",
                                    }}
                                    items={
                                        currAssessment?.task_users?.map((student, index) => {
                                            
                                            return (
                                                {
                                                    key: index + 1,
                                                    label: (
                                                        <>
                                                            {makeFirstLatterCaps(student["user_details"]["first_name"])}{" "}
                                                            {makeFirstLatterCaps(student["user_details"]["last_name"])}
                                                        </>
                                                    ),
                                                    children: (

                                                        <div className="task-container" key={index}>
                                                            <div className="task-user-list-container flex" key={index}>
                                                                {/* <div className="student-info flex">
                                                                    <div className="student-name-container">
                                                                        <p>
                                                                            {student["user_details"][
                                                                                "first_name"
                                                                            ][0]?.toUpperCase()}
                                                                            {student["user_details"][
                                                                                "last_name"
                                                                            ][0]?.toUpperCase()}
                                                                        </p>
                                                                    </div>
                                                                   
                                                                </div> */}
                                                                <div className="student-status">
                                                                    <p>Status</p>
                                                                    <span
                                                                        style={{
                                                                            ...colorObject[student?.task_status] || {
                                                                                backgroundColor: "#F0F0F0", // Default background if status is undefined or not found
                                                                                color: "#333333", // Default color
                                                                            },
                                                                        }}
                                                                    >
                                                                        {student?.task_status}
                                                                    </span>{" "}
                                                                </div>
                                                                <div className="sumbitted-date">
                                                                    <p>Deadline</p>
                                                                    <span>
                                                                        {dayjs(student["task"]["due_date"]).format(
                                                                            "MMMM, DD YYYY"
                                                                        )}
                                                                    </span>
                                                                </div>
                                                                <div className="student-file">
                                                                    <p>Submission Link</p>
                                                                    <p>
                                                                        {student["submission_link"] !== null ? (
                                                                            <a
                                                                                href={`${student["submission_link"]}`}
                                                                                target="_blank"
                                                                            >
                                                                                {student["submission_link"]}
                                                                            </a>
                                                                        ) : (
                                                                            "N/A"
                                                                        )}
                                                                    </p>
                                                                </div>
                                                                <div className="student-comment">
                                                                    <img
                                                                        src="/icons/comment-fill.svg"
                                                                        onClick={() => setOpenComments(student.id)}
                                                                        alt="comment-icon"
                                                                        onMouseOver={(e) => {
                                                                            e.target.src = "/icons/comment-fill-hover.svg";
                                                                        }}
                                                                        onMouseOut={(e) => {
                                                                            e.target.src = "/icons/comment-fill.svg";
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="student-work">
                                                                    {student.task.task_type ? (
                                                                        student["task_status"] === "SUBMITTED" && (

                                                                            getPermission(user.permissions, "TaskScore", "create") && (
                                                                                <button className="secondary-btn-sm"
                                                                                    onClick={() =>
                                                                                        isScoreValidate(currAssessment.task_weightages, studentScoreLists, setFormErrors)
                                                                                            ? handleAddScore()
                                                                                            : null
                                                                                    }
                                                                                >
                                                                                    {studentScoreLists.length ? "Submit" : "Add Score"}
                                                                                </button>
                                                                            )
                                                                        )
                                                                    ) : (
                                                                        getPermission(user.permissions, "TaskScore", "create") && (
                                                                            <Dropdown
                                                                                className="secondary-btn-sm"
                                                                                menu={{
                                                                                    items: [
                                                                                        {
                                                                                            key: "0",
                                                                                            label: (
                                                                                                <p onClick={() => handleStatusChange(student.id, "REWORK")}>
                                                                                                    Rework
                                                                                                </p>
                                                                                            ),
                                                                                        },
                                                                                        {
                                                                                            key: "1",
                                                                                            label: (
                                                                                                <p onClick={() => handleStatusChange(student.id, "COMPLETED")}>
                                                                                                    Completed
                                                                                                </p>
                                                                                            ),
                                                                                        },
                                                                                    ],
                                                                                }}
                                                                                placement="bottomLeft"
                                                                                trigger={["click"]}
                                                                            >
                                                                                <button
                                                                                    className="ant-dropdown-link secondary-btn-sm"
                                                                                    onClick={(e) => {
                                                                                        e.preventDefault();
                                                                                    }}
                                                                                >
                                                                                    Take action
                                                                                </button>
                                                                            </Dropdown>
                                                                        )
                                                                    )}

                                                                </div>
                                                            </div>
                                                            <Comments role={"Admin"}/>
                                                            <div className="applied-weightage-list-container flex" style={{ gap: "10px" }}>
                                                                {currAssessment?.task_weightages?.map(
                                                                    (weightage, weightageIndex) => (
                                                                        <div key={weightageIndex} className="applied-weightage-card flex">
                                                                            <div className="applied-weightage-name">
                                                                                <p>
                                                                                    {weightage.weightage_details.weightage}{" "}
                                                                                    {Number(weightage.weightage_percentage)}
                                                                                </p>
                                                                            </div>
                                                                            <div className="weightage-checkbox">
                                                                                <input
                                                                                    type="number"
                                                                                    name="score"
                                                                                    // min={0}
                                                                                    // max={100}
                                                                                    value={Number(weightage?.task_score?.[weightageIndex - weightageIndex]?.task_score) || ""}
                                                                                    onChange={(e) => {
                                                                                        handleScoreOnchange(
                                                                                            e,
                                                                                            student,
                                                                                            weightage
                                                                                        );
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                )}
                                                            </div>
                                                            {formErrors["score"]
                                                                ? <p className="error-message">{formErrors["score"]}</p>
                                                                : ""}
                                                        </div>

                                                    ),
                                                    style: {
                                                        marginBottom: 10,
                                                        background: "#f2f9e4",
                                                        borderRadius: "5px",
                                                        border: 'none',
                                                    }

                                                }
                                            )
                                        })
                                    }

                                />
                            </div>
                        ) : (
                            <div className="select-something-container flex">
                                <div className="image-container ">
                                    <img src="/icons/select-something.svg" alt="" />
                                    <p className="select-something-heading">
                                        No Assignee has been assigned to this {currAssessment.task_type ? "assessment" : "task"}
                                        <button className="btn primary-medium" style={{ marginTop: "10px" }} onClick={() => {
                                            setIsStudentScoreOpen(!isStudentScoreOpen)
                                            if (type === "assessment") {
                                                setToggleAssigneeWeightage(1)
                                            } else {
                                                setToggleAssigneeWeightage(0)
                                            }
                                            setIsMode("edit")
                                        }}>Add Assignee</button>
                                    </p>
                                </div>
                            </div>
                        )}

                    </>
                )}

            </main>
        </>
    )
}
