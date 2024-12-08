import React, { useEffect } from 'react'
import { Select, Tooltip,notification } from 'antd';
import axios from 'axios';
import { API_END_POINT } from '../../../../config';
import { headers,isWeightageValid } from '../../../utils/utility';
import { useAssessmentStore } from '../../../pages/assessmentModule/AssessmentStore';
import { useParams } from 'react-router-dom';
import "./scss/WeightageList.css"

export default function WeightageList() {
  const { getCurrentAssessment, weightageErrors, setWeightageErros, setWeightageLists,
    weightageLists, selectedStudents,editId,assessmentLists,setAssessmentLists
  } = useAssessmentStore();
  const currentAssessment = getCurrentAssessment();
  const { id: batchId } = useParams()
  useEffect(() => {
    axios
      .get(`${API_END_POINT}task/${batchId}/list/weightage`, { headers })
      .then((res) => {
        if (res.status === 200 && res.data.message === "Success") {
          const copyWeightageLists = [...res.data.data];
          setWeightageLists(copyWeightageLists);
        }
      }).catch((error) => {
        if (
          error.response.data.status === 400 ||
          "errors" in error.response.data
        ) {
          const errorMessages = error.response.data.errors;

          Object.entries(errorMessages).forEach(([key, messages]) => {
            notification.error({
              message: `${key} Error`,
              description: messages,
              duration: 1
            })
          });
        }
      })
  }, []);
  const handleAddWeightage = () => {
    const newWeightage = { weightage: null, weightage_percentage: null };

    const updatedAssessmentList = assessmentLists.map((assessment) => {
      if (assessment.id === editId) {
        assessment.task_weightages = [
          ...assessment.task_weightages,
          newWeightage,
        ];
      }

      return assessment;
    });

    setAssessmentLists(updatedAssessmentList);
  };
  const handleWeightageChange = (value, index, key) => {
    if(weightageErrors[key]){
      delete weightageErrors[key]
    }
    else if(key === "weightage_percentage"){
      delete weightageErrors["weightage"]
    }
    let copyAssessment = [...assessmentLists];

    copyAssessment = copyAssessment.map((assessment) => {
      if (assessment.id === editId) {
        assessment.task_weightages[index][key] = parseFloat(value);
      }
      return assessment;
    });

    setAssessmentLists(copyAssessment);
  };
  const makePostRequest = async (url, data, method) => {
    const response = await axios(url, {
      method: method,
      headers: headers,
      data: data,
    });
    return response;
  };
  const handleSaveWeightage = () => {
    let cloneAssessmentList = [...assessmentLists];

    let currentAssessment = cloneAssessmentList.find(
      (assessment) => assessment.id == editId
    );

    let createPromise = [];
    let updatePromise = [];


    currentAssessment.task_weightages.map((weightage) => {
      if ("id" in weightage) {
        const url = `${API_END_POINT}task/${batchId}/update/task_weightage/${weightage.id}`;
        //its for update
        const { id, ...postPayload } = weightage;
        updatePromise.push(makePostRequest(url, postPayload, "PUT"));
      } else {
        const url = `${API_END_POINT}task/${batchId}/assign/task_weightage/${editId}`;
        createPromise.push(makePostRequest(url, weightage, "POST"));
      }
    });

    if (createPromise.length > 0) {
      Promise.all(createPromise)
        .then((results) => {
          notification.success({
            message: "Sucess",
            description: "Weightage Linked Successfully",
          });

          //need to rework, check with BE
          cloneAssessmentList = cloneAssessmentList.map((assessment) => {
            if (assessment.id == editId) {
              assessment["task_weightages"] = assessment.task_weightages.map(
                (weightage, index) => {
                  for (const res of results) {
                    if (res.data.data.task === editId) {
                      weightage["id"] = res.data.data.id;
                    }
                    return weightage;
                  }
                }
              );
            }
            return assessment;
          });

          setAssessmentLists(cloneAssessmentList);
        })
        .catch((error) => {
          if (
            error.response.data.status === 400 ||
            "errors" in error.response.data
          ) {
            const errorMessages = error.response.data.errors;
            if (Array.isArray(errorMessages)) {
              notification.error({
                message: `Error`,
                description: errorMessages,
              });
            } else {
              Object.entries(errorMessages).forEach(([key, messages]) => {
                messages.forEach((message) =>
                  notification.error({
                    message: `${key} Error`,
                    description: message,
                  })
                );
              });
            }
          }
        });
    }

    if (updatePromise.length > 0) {
      Promise.all(updatePromise)
        .then((results) => {
          notification.success({
            message: "Sucess",
            description: "Weightage Update Successfully",
          });
        })
        .catch((error) => {
          if (
            error.response.data.status === 400 ||
            "errors" in error.response.data
          ) {
            const errorMessages = error.response.data.errors;
            if (Array.isArray(errorMessages)) {
              notification.error({
                message: `Error`,
                description: errorMessages,
              });
            } else {
              Object.entries(errorMessages).forEach(([key, messages]) => {
                messages.forEach((message) =>
                  notification.error({
                    message: `${key} Error`,
                    description: message,
                  })
                );
              });
            }
          }
        });
    }
  
  };
  const handleDeleteWeightage = (deleteWeightageId, index) => {
    let updatedAssessmentList = [...assessmentLists];

    if (deleteWeightageId) {
      updatedAssessmentList = updatedAssessmentList.map((assessment) => {
        if (assessment.id === editId) {
          // Use map to create a new array of task_weightages without the specified deleteWeightageId
          const updatedTaskWeightages = assessment.task_weightages.filter(
            (weightage) => weightage.id !== deleteWeightageId
          );
          return {
            ...assessment,
            task_weightages: updatedTaskWeightages,
          };
        }
        return assessment;
      });
      const url = `${API_END_POINT}task/${batchId}/delete/task_weightage/${deleteWeightageId}`;
      axios
        .delete(url, { headers })
        .then((res) => {
          if (res.data.status === 200) {
            notification.success({
              message: "Success",
              description: `${res.data.message}`,
            });
            setAssessmentLists(updatedAssessmentList);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      updatedAssessmentList = updatedAssessmentList.map((assessment) => {
        if (assessment.id === editId) {
          // Use map to create a new array of task_weightages without the specified index
          const updatedTaskWeightages = [...assessment.task_weightages];
          updatedTaskWeightages.splice(index, 1);

          return {
            ...assessment,
            task_weightages: updatedTaskWeightages,
          };
        }
        return assessment;
      });

      setAssessmentLists(updatedAssessmentList);
    }
  };
  return (
    <div className="weightage-main-container">
      <div className="overall">
        <div className="weightage-adding-container flex">
          <div className="weight-inputs">
            {currentAssessment?.task_weightages?.map((taskWeightage, index) => {
              return (
                <div className="weight-age-input" key={index}>
                  <div className="weightage-select">
                    <Tooltip placement="left" title={selectedStudents.length > 0 && <p>Once users are assigned to the assessment, weightage cannot be modified</p>}>
                      <Select
                        style={{
                          width: "170px", opacity: selectedStudents.length > 0 ? 0.5 : 1,
                          cursor:
                            selectedStudents.length > 0 ? "not-allowed" : "auto",
                        }}
                        placeholder={"Select Weightage"}
                        value={taskWeightage.weightage}
                        onChange={(value) =>
                          handleWeightageChange(value, index, "weightage")
                        }
                        disabled={selectedStudents.length ? true : false}
                      >
                        {weightageLists.map((weightageList) => (
                          <Select.Option
                            key={weightageList.id}
                            value={weightageList.id}
                          >
                            {weightageList.weightage}
                          </Select.Option>
                        ))}
                      </Select>
                    </Tooltip>

                  </div>
                  <div className="percentage">
                    <input
                      type="number"
                      min="1" // Set the minimum allowed value
                      max="100" // Set the maximum allowed value
                      value={parseFloat(taskWeightage.weightage_percentage)} // Ensure it's a string or an empty string
                      onChange={(e) =>
                        handleWeightageChange(
                          e.target.value,
                          index,
                          "weightage_percentage"
                        )
                      }
                      disabled={selectedStudents.length}
                      className="task-weight-value-selector"
                      style={{
                        opacity: selectedStudents.length > 0 ? 0.5 : 1,
                        cursor:
                          selectedStudents.length > 0 ? "not-allowed" : "auto",
                        '-moz-appearance': 'textfield'
                      }}
                    />
                  </div>
                  <div className="weightage-unit-container flex" >
                    <div className="weightage-action" >
                      {/* Show the delete icon only if weightage is greater than 0 */}
                      <span
                        onClick={() =>
                          !selectedStudents.length &&
                          handleDeleteWeightage(taskWeightage.id, index)
                        }
                      >
                        <img
                          src="/icons/deleteIcon.svg"
                          alt="delete-icon"
                          className="delete-icon"
                          style={{
                            cursor: selectedStudents.length
                              ? "not-allowed"
                              : "auto",
                            opacity: selectedStudents.length > 0 ? 0.5 : 1,
                          }}
                        />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {weightageErrors["weightage"] ? <p className="error-message">
          {weightageErrors["weightage"] ? weightageErrors["weightage"] : ""}
        </p> : ""}
        <div className="all-btns">
          <div className="add-weightage-button">
            <button
              className="btn create-btn"
            onClick={handleAddWeightage}
            >
              + Add 
            </button>
          </div>
          <div>
            <div className="apply-weightage">
              <Tooltip
                title={
                  currentAssessment?.task_weightages?.length === 0
                    ? "Add atleast one weightage to link in task"
                    : ""
                }
              >
                <button
                  className={`${currentAssessment?.task_weightages?.length === 0
                    ? "btn secondary-medium-default"
                    : "btn secondary-medium"
                    }`}
                  onClick={() => isWeightageValid(currentAssessment?.task_weightages, setWeightageErros)? handleSaveWeightage(): null}
                >
                  Save
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>


    </div>
  )
}
