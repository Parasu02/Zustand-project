import React, { useEffect } from "react";

import { useParams } from "react-router-dom";

import { notification } from "antd";
import axios from "axios";
import AssessmentList from "../../components/Assessment/AssessmentList";
import AssessmentView from "../../components/Assessment/AssessmentView";
import StudentLogin from "../studentLogin/StudentLogin";


import { useAuth } from "../../context/AuthContext";

import { API_END_POINT } from "../../../config";
import { getPermission,headers } from "../../utils/utility";
import { useAssessmentStore } from "./AssessmentStore";
import { useQuery } from "@tanstack/react-query";

const AssessmentModule = ({ type }) => {
  const { user } = useAuth()
  const { id: batchId } = useParams()

  const {
    setLoading, 
    setAssessmentLists,
    assessmentSearchWord,
    setEditId, 
    editId,
  } = useAssessmentStore()
  
  const getAssessmentLists = async () => {
    const url = `${API_END_POINT}task/${batchId}/list_task/?limit=10&page=1&filter_task_type=${type === "task" ? 0 : 1}&search=${assessmentSearchWord}`;
    const { data } = await axios.get(url, { headers });
    return data.data; 
  };

  const { data:assessmentLists, error, isPending } = useQuery({
    queryKey: ["AssessmentLists",type,assessmentSearchWord],
    queryFn: getAssessmentLists, 
  });

  useEffect(()=>{
    if(assessmentLists?.length){
      setAssessmentLists(assessmentLists)
    }
  },[assessmentLists?.length])
  
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
