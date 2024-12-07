import React, { useState, useEffect } from "react";

import { useParams } from "react-router-dom";

import { Modal, Skeleton, notification, message as messageApi, Splitter } from "antd";
import axios from "axios";

import dayjs from "dayjs";

import AssessmentList from "../../components/AssessmentList";
// import AssessmentView from "../../components/AssessmentView";
// import StudentLogin from "../studentLogin/StudentLogin";

import { useAuth } from "../../context/AuthContext";

import { API_END_POINT } from "../../../config";
import { getPermission,headers } from "../../utils/utility";

import { useAssessmentStore } from "./AssessmentStore";
import AssessmentView from "../../components/AssessmentView";
import StudentLogin from "../studentLogin/StudentLogin";

const AssessmentModule = ({ type }) => {
  const { user } = useAuth()
  const { id: batchId } = useParams()

  const { assessmentLists, setLoading, loading, setAssessmentLists, assessmentSearchWord, setAssessmentSearchWord,
    setEditId, editId
  } = useAssessmentStore()
  useEffect(() => {
    setLoading(true);
   
    if (getPermission(user.permissions, "Task", "read")) {
      const url = `${API_END_POINT}task/${batchId}/list_task/?limit=10&page=1&filter_task_type=${type === "task" ? 0 : 1
        }&search=${assessmentSearchWord}`;
      let assessmentId = editId;

      axios
        .get(url, { headers })
        .then((res) => {
          if (res.status === 200 && res.data.message === "Success") {
            //manipulate the assessment list task type assessment put the 1 otherwise 0 and remove duplicate
            let assessmentList = [...res.data.data];
            assessmentList = assessmentList.map((assessment) => ({
              ...assessment,
              task_type: assessment.task_type === "ASSESSMENT" ? 1 : 0,
            }));

            setAssessmentLists(assessmentList);

            setLoading(false);
            assessmentId = res.data.data.length > 0 ? res.data.data[0].id : null;

            setEditId(assessmentId);
            // setFormErrors({});
          }
        })
        .catch((error) => {
          setLoading(false);
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

  }, [assessmentSearchWord, type]);
  return (
    <>
      {getPermission(user.permissions, "Task", "create") ? (
        <>
          <AssessmentList
            mode={type}
            filterShow={false}
          />
          {editId && <AssessmentView weightageShow={type === "task" ? false : true} />}
          {!editId && (
            <div className="main-container">
              <div className="task-main-container">
                <div className="select-something-container flex">
                  <div className="image-container ">
                    <img src="/icons/select-something.svg" alt="" />
                    <p className="select-something-heading">
                      Please Select any of the Available {type} or Create New {type}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <StudentLogin type={type}/>
      )}

    </>
  )
};

export default AssessmentModule;
