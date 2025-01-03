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
    getCurrentAssessment, // Destructure the function first
    setSelectedStudents
  } = useAssessmentStore(); 
  
  const currentAssessment = getCurrentAssessment(); // Now call the function
  
  
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
      setEditId(assessmentLists?.[0].id);
      let assessmentList = [...assessmentLists];
      assessmentList = assessmentList.map((assessment) => ({
        ...assessment,
        task_type: assessment.task_type === "ASSESSMENT" ? 1 : 0,
        // task_weightages:assessment.task_weightages.length > 0 ? assessment.task_weightages : assessment.task_weightages.push({ weightage: null, weightage_percentage: null })
      }));
      
      
      setAssessmentLists(assessmentLists)
     
    }
  },[assessmentLists?.length])
 
  useEffect(() => {

    if (editId && assessmentLists.length > 0) {
      let cloneAssessmentList = [...assessmentLists];
      let assignedUsers = [];
      console.log(currentAssessment);
      
      if ("task_users" in currentAssessment) {
        console.log(currentAssessment);
        
        assignedUsers = currentAssessment?.task_users?.map(
          (assigned) => assigned.user.id
        );
      }
      //formatting task_weightage object as per frontend need
      cloneAssessmentList = cloneAssessmentList?.map((assessment) => {
        if (assessment?.task_weightages?.length > 0) {
          assessment["task_weightages"] = assessment.task_weightages?.map(
            (weightage) => {
              const weightObject = {
                weightage_percentage: weightage.weightage_percentage,
                weightage: weightage.weightage,
                taskScore : weightage.task_score
              };

              if ("id" in weightage) {
                weightObject["id"] = weightage.id;
              }
              return weightObject;
            }
          );
        } else {
          assessment["task_weightages"] = [
            {
              weightage_percentage: null,
              weightage: null,
            },
          ];
        }

        return assessment;
      });

      console.log(assignedUsers);
      
      setAssessmentLists(cloneAssessmentList);
      setSelectedStudents(assignedUsers)
    }

  }, [editId]);

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
