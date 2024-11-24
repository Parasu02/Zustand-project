import React, { useEffect } from 'react'
import { useAssessmentStore } from '../pages/assessmentModule/AssessmentStore'

import { getPermission,headers } from '../utils/utility'
import { useAuth } from '../context/AuthContext'

import { API_END_POINT } from '../../config'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import { Skeleton,notification } from 'antd'
import WeightageList from './WeightageList/WeightageList'
export default function AssigneeWeightage({weightageShow}) {
    const { user } = useAuth()
    const { id: batchId } = useParams()
    const { toggleAssigneeWeightage, setToggleAssigneeWeightage,
        setIsAssigneeLoading, isAssigneeLoading, setStudents, students,
        selectedStudents, editId, setSelectedStudents, assigneeSearchWord, setAssigneeSearch
    } = useAssessmentStore()

    useEffect(() => {
        if (getPermission(user.permissions, "TaskUser", "create")) {
            axios
                .get(`${API_END_POINT}applicant/${batchId}/list/students/?search=${assigneeSearchWord}`, { headers })
                .then((res) => {
                    if (res.status === 200 && res.data.message === "Success") {
                        setIsAssigneeLoading(false)
                        setStudents(res.data.data);
                    }
                })
                .catch((error) => {
                    setIsAssigneeLoading(false)
                    if (
                        error.response.data.status === 400 ||
                        "errors" in error.response.data
                    ) {
                        const errorMessages = error.response.data.errors;
                        notification.error({
                            message: error.response.data?.message,
                            description: errorMessages.detail,
                            duration: 1
                        })
                    }
                });
        }
    }, [assigneeSearchWord])
    const handleAllCheckboxChange = () => {
        const isNotAllSelected = [...students].every((student) =>
            selectedStudents.includes(student.id)
        );
        const allStudentIds = [...students].map((student) => student.id);
        setIsAssigneeLoading(true);
        if (isNotAllSelected) {
            //Deselect all students in tasks
            const url = `${API_END_POINT}task/${batchId}/remove/user/${editId}/`;

            const payload = { user: allStudentIds };
            axios
                .delete(url, { data: payload, headers })
                .then((res) => {
                    if (res.data.status === 200) {
                        notification.success({
                            message: "Success",
                            description: "All Students unAssigned Successfully",
                            duration: 1,
                        });
                        setSelectedStudents([]);
                        setIsAssigneeLoading(false);
                    }
                })
                .catch((error) => {
                    setIsAssigneeLoading(false);
                    console.log(error);
                    if (error.response && error.response.data && error.response.data.message) {
                        const errorMessage = error.response.data.message;
                        notification.error({
                            message: 'Error',
                            description: errorMessage,
                        });
                    }
                });
        } else {
            //selectAll students in tasks    
            axios
                .post(
                    `${API_END_POINT}task/${batchId}/assign/task/${editId}`,
                    { user: allStudentIds },
                    { headers: headers }
                )
                .then((res) => {
                    if (res.data.status === 200) {
                        notification.success({
                            message: "Success",
                            description: "All Students Assigned Successfully",
                            duration: 1,
                        });
                        setSelectedStudents(allStudentIds);
                        setAssigneeloader(false);
                    }
                })
                .catch((error) => {
                    setAssigneeloader(false);
                    if (error.response && error.response.data && error.response.data.message) {
                        const errorMessage = error.response.data.message;
                        notification.error({
                            message: 'Error',
                            description: errorMessage,
                        });
                    }
                });
        }
    };
    const handleCheckboxChange = (studentId) => {
        const isStudentAlreadySelected = [...selectedStudents].includes(studentId);
        setIsAssigneeLoading(true);
        if (isStudentAlreadySelected) {
          let updateTheStudent = [...selectedStudents];
          updateTheStudent = updateTheStudent.filter((id) => id != studentId);
          //remove user API call
          const url = `${API_END_POINT}task/${batchId}/remove/user/${editId}/`;
    
          const payload = { user: [studentId] };
          axios
            .delete(url, { data: payload, headers })
            .then((res) => {
              if (res.data.status === 200) {
                notification.success({
                  message: "Success",
                  description: `${res.data.message}`,
                  duration: 1,
                });
                setIsAssigneeLoading(false);
                setSelectedStudents(updateTheStudent);
              }
            })
            .catch((error) => {
              setIsAssigneeLoading(false);
              if (error.response && error.response.data && error.response.data.message) {
                const errorMessage = error.response.data.message;
                notification.error({
                  message: 'Error',
                  description: errorMessage,
                });
              }
            });
        } else {
          const updatedStudents = [...selectedStudents, studentId];
          //students add in task
          const url = `${API_END_POINT}task/${batchId}/assign/task/${editId}`;
          axios.post(url, { user: [studentId] }, { headers }).then((res) => {
            if (res.data.status === 200) {
              notification.success({
                message: "Success",
                description: `${res.data.message}`,
                duration: 1,
              });
              setAssigneeloader(false);
              setSelectedStudents(updatedStudents);    
            }
          }).catch((error)=>{
            if (error.response && error.response.data && error.response.data.message) {
              const errorMessage = error.response.data.message;
              notification.error({
                message: 'Error',
                description: errorMessage,
              });
            }
          })
        }
      };
    return (
        <section className="assignee-and-weightage-container">
            <div className={`title-section flex`}>
                {getPermission(user.permissions, "TaskWeightage", "create") && (
                    <div
                        className={`weightage-title selection ${toggleAssigneeWeightage === 1 ? "active" : ""
                            }`}
                    >
                        {weightageShow && (
                            <h4
                                onClick={() => setToggleAssigneeWeightage(1)}
                                className={
                                    toggleAssigneeWeightage === 1 ? "active" : ""
                                }
                            >
                                Weightage
                            </h4>
                        )}
                    </div>
                )}

                {getPermission(user.permissions, "TaskUser", "create") && (
                    <div
                        className={`assignee-title selection ${toggleAssigneeWeightage === 0 ? "active" : ""
                            }`}
                    >
                        <h4
                            onClick={() => setToggleAssigneeWeightage(0)}
                            className={
                                toggleAssigneeWeightage === 0 ? "active" : ""
                            }
                        >
                            Assignee
                        </h4>
                    </div>
                )}

            </div>
            {!toggleAssigneeWeightage ? (
                <div className="assign-listing-container">
                    <div className="assignee-search-container">
                        <input type="input" placeholder="search..." onChange={(e) => setAssigneeSearch(e.target.value)} />
                        <img
                            src="/icons/searchIcon.svg"
                            alt="search-icon"
                            className="search-icon"
                        />
                    </div>
                    {isAssigneeLoading ? <Skeleton active paragraph={4} /> : (
                        <>
                            {students?.length > 0 ? (
                                <>
                                    <div className="select-all flex">
                                        <input
                                            className="global-checkbox"
                                            type="checkbox"
                                            onChange={handleAllCheckboxChange}
                                            checked={selectedStudents.length == students.length}
                                        />
                                        <span>
                                            {selectedStudents.length === students.length
                                                ? "All Students Selected"
                                                : selectedStudents.length == 0
                                                    ? "Select All Students"
                                                    : `${selectedStudents.length} Selected`}
                                        </span>
                                    </div>
                                    <div className="assignee-card-listing-container">
                                        {students.map((student) => {
                                            return (
                                                <div
                                                    className="individual-assignee-card flex"
                                                    key={student.id}
                                                >
                                                    <input
                                                        className="student-checkbox "
                                                        type="checkbox"
                                                        onChange={() =>
                                                            handleCheckboxChange(student.id)
                                                        }
                                                        checked={selectedStudents.includes(
                                                            student.id
                                                        )}
                                                    />
                                                    <div className="profile flex">
                                                        <div className="profile-letter">
                                                            <span>
                                                                {student?.first_name[0]}
                                                                {student?.last_name[0]}
                                                            </span>
                                                        </div>
                                                        <div className="assignee-name">
                                                            <p>
                                                                {student.first_name} {student.last_name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            ) : (
                                <div className="select-something-container flex">
                                    <div className="image-container ">
                                        <img src="/icons/select-something.svg" alt="" />
                                        <p className="select-something-heading">
                                            No students Available in this batch

                                        </p>
                                    </div>
                                </div>
                            )}

                        </>
                    )}
                </div>
            ) : (
                <WeightageList />
            )}
        </section>
    )
}
