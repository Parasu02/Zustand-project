import React from "react";

import { Skeleton,notification,Modal } from "antd";
const { confirm } = Modal;

import dayjs from "dayjs";
import utcPlugin from 'dayjs/plugin/utc';
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { API_END_POINT } from "../../config";

dayjs.extend(utcPlugin);

import { getPermission,headers } from "../utils/validate";


import { useAuth } from "../context/AuthContext";

import { useAssessmentStore } from "../pages/assessmentModule/AssessmentStore";
import { useParams } from "react-router-dom";


const TaskCard = ({
  assessment
}) => {
  const truncateText = (text, maxLength) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };
  const {user} = useAuth();
  const {id:batchId} = useParams()
  const {loading,setIsMode,isMode,editId,setAssessmentLists,setEditId,assessmentLists} = useAssessmentStore()

  const handleDelete = (id)=>{
    
    const deleteTask = [...assessmentLists].find(
      (assessment) => assessment.id == id
    );
    const updatedAssessmentLists = [...assessmentLists].filter(
      (assessment) => assessment.id !== id
    );
    
    if(deleteTask.draft){
      confirm({
        title: 'Are you sure Discard this task?',
        content: deleteTask.task_title,
        okText: 'Yes',
        cancelText: 'No',
        onOk() {
          notification.success({
            message: "Success",
            description: "Task Discard Successfully",
            duration: 3,
          });
          setAssessmentLists(updatedAssessmentLists)
          setEditId(updatedAssessmentLists.length > 0 ? updatedAssessmentLists[0].id : null);
        },
      })
   
    }else{
      confirm({
        title: 'Are you sure delete this task?',
        content: deleteTask.task_title,
        okText: 'Yes',
        cancelText: 'No',
        onOk() {
          axios
          .delete(`${API_END_POINT}task/${batchId}/delete_task/${id}`, {headers})
          .then((res) => {
            notification.success({
              message: "Success",
              description: "Task Deleted Successfully",
              duration: 3,
            });
            setAssessmentLists(updatedAssessmentLists);
            setEditId(updatedAssessmentLists.length > 0 ? updatedAssessmentLists[0].id : null);
          })
          .catch((error) => {
            console.log(error);
          });
        },
      })
     
    }
    
  }


  return (
    <>
      <div
        className={`task-card ${assessment.id === editId ? "active" : ""
          } flex`}
        key={assessment.id}
        id={assessment.id}
        onClick={() => {
          setIsMode(assessment.draft ? "edit" :"card")
        }}
      >
        {loading ? (
          <Skeleton avatar={{ size: "small" }} active paragraph={{ rows: 1 }} />
        ) : (
          <>
            <div className="task-icon flex">
                <span>
                  {assessment?.task_title &&
                    assessment?.task_title
                      .split(" ")
                      .map((word) => word.trim()) // Trim any extra spaces
                      .filter((word) => word) // Remove empty strings
                      .map((word) => word[0].toUpperCase())
                      .join("").slice(0,2)
                      }
                </span>
            </div>

            <div className="task-details">
              <div className="task-name-with-icon flex">
                <h2>{truncateText(assessment.task_title, 15)}</h2>
                <>
                    {getPermission(user.permissions, "Task", "update") && (
                      <img
                        src={editId === assessment.id && isMode == "edit" ? "/icons/edit-pencil-fill.svg" : "/icons/edit-pencil-icon.svg"}
                        className="edit-icon"
                        alt="edit-icon"
                        // onMouseOver={(e)=> e.target.src = "/icons/edit-icon-hover.svg"}
                        // onMouseOut={(e)=>e.target.src = "/icons/edit-pencil-icon.svg"}
                        onClick={(event) => {
                          event.stopPropagation();
                          setIsMode("edit")
                          setEditId(assessment.id)
                        }}
                      />
                    )}

                    {getPermission(user.permissions,"Task","delete") && (
                      <img
                        src="/icons/deleteIcon.svg"
                        alt="delete-icon"
                        className="delete-icon"
                        onMouseOver={(e)=>{
                          e.target.src ="/icons/delete-icon-hover.svg"
                        }}
                        onMouseOut={(e)=>{
                          e.target.src ="/icons/deleteIcon.svg"
                        }}
                        id={assessment.id}
                        onClick={(e) => {
                          handleDelete(assessment.id);
                          e.stopPropagation();
                        }}
                      />
                  )}

                </>
              </div>
              <p className="task-description">
                {truncateText(
                  assessment.task_description.replace(/<[^>]*>/g, ""),
                  60
                )}
              </p>
              <span className="btn btn-deadline">
                {dayjs.utc(assessment.due_date).format('MMM DD YYYY')}
              </span>
            </div>
          </>
        )}
      </div>
    </>
  );
};

const AssessmentList = ({
  mode,
  filterShow
}) => {
  const { user } = useAuth();
  const {loading,setAssessmentSearchWord,assessmentLists,setIsMode,setAssessmentLists,setEditId} = useAssessmentStore()

  const handleAdd = () => {
    const uniqueId = uuidv4();
    const createAssessment = {
      id: uniqueId,
      task_title: "Untitled",
      task_description: "",
      due_date: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      draft: true,
      task_type: mode == "assessment" ? 1 : 0,
    };
    const concatNewAssessment = [createAssessment, ...assessmentLists];
    setAssessmentLists(concatNewAssessment);
    setEditId(uniqueId);
    setIsMode("edit") //while adding new task that time open edit section mean create section
  };

  return (
    <>
      <section className="listing-container">
        <h1>{mode} lists</h1>
        <div className="search-container">
          <input
            type="input"
            placeholder="search..."
            onChange={(e) => setAssessmentSearchWord(e.target.value)}
          />{" "}
          <img
            src="/icons/searchIcon.svg"
            alt="search-icon"
            className="search-icon"
          />
          {filterShow && (
            <img
              src="/icons/filterIcon.svg"
              alt="filter-icon"
              className="filter-icon"
            />
          )}


        </div>

        {loading ? <Skeleton active /> : (
          <>
            <div className="create-container">
              {getPermission(user.permissions, "Task", "create") && (
                !loading && (
                  <button className="btn create-btn" onClick={handleAdd}>
                    <span>+</span>Create {mode}
                  </button>
                )

              )}

            </div>
            <div className="task-list-container">
              {assessmentLists &&
                assessmentLists.map((assessment) => (
                  <TaskCard
                    key={assessment.id}
                    assessment={assessment}
                  />
                ))}
            </div>
          </>
        )}
      </section>
    </>
  );
};

export default AssessmentList;
