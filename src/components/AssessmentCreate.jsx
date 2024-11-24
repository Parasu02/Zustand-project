import React from 'react'
import { useAssessmentStore } from '../pages/assessmentModule/AssessmentStore';
import { DatePicker, notification, message as messageApi } from "antd";
import ReactQuill from "react-quill";
import dayjs from "dayjs";
import axios from 'axios';
import "quill/dist/quill.snow.css";
import { API_END_POINT } from '../../config';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateTask, toolbarConfig, getPermission, headers } from '../utils/utility'

export default function AssessmentCreate() {
    const { id: batchId } = useParams()
    const { user } = useAuth()
    const { assessmentLists, currentAssessment,editId,setEditId, assigneeloader, setFormErrors, formErrors, setAssessmentLists } = useAssessmentStore()
    const currAssessment = currentAssessment() || { task_title: "", task_description: "", due_date: null };

    const handleInputChange = (name, value) => {
        // console.log(name,value);

        // if name present in formErrors state check and delete the key in onchange example task_name present in error state delete it the key  
        if (formErrors[name]) {
            delete formErrors[name];
        }
        const cloneAssessmentList = [...assessmentLists];
        // console.log(cloneAssessmentList);

        const updatedList = cloneAssessmentList.map((assessment) => {
            if (assessment.id === editId) {
                return {
                    ...assessment,
                    [name]: value,
                };
            }
            return assessment;
        });
        setAssessmentLists(updatedList);
    };
    const handleSave = (assessment) => {
        const newTaskName = assessment.task_title.trim().toLowerCase();

        // Check if the task with the same task_title already exists
        const isDuplicateTask = assessmentLists.some(
            (existingAssessment, index) =>
                index !== 0 && existingAssessment.task_title.trim().toLowerCase() === newTaskName
        );

        if (isDuplicateTask) {
            messageApi.open({
                type: 'error',
                content: `${newTaskName} already exists`,
                duration: 1,
            });
            return; // Early return to avoid further processing
        }

        const isNew = "draft" in assessment;
        const {
            created_at,
            created_by,
            updated_at,
            batch,
            updated_by,
            is_deleted,
            ...currentAssessment
        } = assessment;

        // Clean up for new assessment
        if (isNew) {
            delete currentAssessment.draft;
            delete currentAssessment.id;
        }

        // API endpoint and method selection
        const apiEndpoint = isNew
            ? `${API_END_POINT}task/${batchId}/create_task/`
            : `${API_END_POINT}task/${batchId}/update_task/${currentAssessment.id}`;
        const method = isNew ? "POST" : "PUT";
        axios({
            method: method,
            url: apiEndpoint,
            headers: headers,
            data: currentAssessment,
        })
            .then((res) => {
                // Ensure that res.data.status is 200 before proceeding
                if (res.data.status === 200) {
                    notification.success({
                        message: "Success",
                        description: isNew
                            ? `${assessment.task_type === 0 ? "Task" : "Assessment"} Added Successfully`
                            : `${assessment.task_type === 0 ? "Task" : "Assessment"} Updated Successfully`,
                        duration: 1,
                    });
        
                    let updatedAssessmentLists = [...assessmentLists];
        
                    if (isNew) {
                        // Filter out the draft assessments and add the new one
                        updatedAssessmentLists = updatedAssessmentLists.filter(
                            (assessment) => !("draft" in assessment)
                        );
                        currentAssessment.id = res.data.data.id;  // Adding the new ID
                        updatedAssessmentLists = [currentAssessment, ...updatedAssessmentLists];
                    } else {
                        // Update the existing assessment
                        updatedAssessmentLists = updatedAssessmentLists.map((assessment) =>
                            assessment.id === res.data.data.id ? { ...currentAssessment,...assessment,  } : assessment
                        );
                    }
        
                    setAssessmentLists(updatedAssessmentLists);
                    setEditId(updatedAssessmentLists.length > 0 ? updatedAssessmentLists[0].id : null);
                } else {
                    // Handle response status other than 200
                    notification.error({
                        message: "Error",
                        description: `Unexpected response status: ${res.data.status}`,
                    });
                }
            })
            .catch((error) => {
                // Handle the error in a way that gives information
                const errorMessage = error.response?.data?.errors;
                if (errorMessage) {
                    Object.entries(errorMessage).forEach(([key, messages]) => {
                        messages.forEach((message) =>
                            notification.error({
                                message: `${key} Error`,
                                description: message,
                            })
                        );
                    });
                }
            });
        
    };
    return (
        <>
            <>
                <section className="main-container">
                    <>
                        <div className="module-header-section-container">
                            <div className="module-header-section flex">
                                <div className="module-title-section grid">
                                    <input
                                        value={currAssessment.task_title ? currAssessment.task_title : ""}
                                        name="task_title"
                                        type="text"
                                        onChange={(e) =>
                                            handleInputChange("task_title", e.target.value)
                                        }
                                        // onDoubleClick={onDoubleClick}
                                        placeholder={"Untitled"}
                                        className={` ${formErrors["task_title"] ? "error-notify" : ""
                                            } `}
                                    // readOnly={!isEditing}
                                    />

                                </div>
                            </div>
                            <p className="error-message">
                                {formErrors["task_title"] ? formErrors["task_title"] : ""}
                            </p>
                        </div>
                        <div className="task-details-header-container">
                            <div className="task-label-container flex">
                                <h4>Task Details </h4>
                                <div className="horizon-line"></div>
                            </div>
                            <div className="task-details-main-container flex">
                                <div className="task-deadline-container common-property">
                                    <p className="task-deadline-label">Deadline <span>*</span></p>
                                    <DatePicker
                                        prefixCls={`${formErrors["due_date"] ? "error-notify" : ""
                                            }`}
                                        value={currAssessment.due_date ? dayjs(currAssessment.due_date) : null}
                                        showTime={{ format: "HH:mm" }}
                                        placeholder="Select here..."
                                        format="YYYY-MM-DD HH:mm"
                                        onChange={(date, dateString) =>
                                            handleInputChange("due_date", dateString)
                                        }
                                        suffixIcon={<img src={`/icons/calendorIcon.svg`} />}
                                        disabledDate={(current) =>
                                            current && current < dayjs().startOf("day")
                                        }
                                    />
                                    <p className="error-message">
                                        {formErrors["due_date"] ? formErrors["due_date"] : ""}
                                    </p>
                                </div>
                            </div>
                            <div className="task-editor-container">
                                <p className="task-description-label">Description <span>*</span></p>
                                <div className="task-editor">
                                    <>
                                        {/* <CustomIcons /> */}
                                        <ReactQuill
                                            placeholder="Type here"
                                            className={`${formErrors["task_description"] ? "react-quill error-notify" : "react-quill"
                                                }`}
                                            value={currAssessment.task_description}
                                            modules={toolbarConfig}
                                            theme="snow"
                                            onChange={(value) =>
                                                handleInputChange("task_description", value)
                                            }
                                        />
                                        <p className="error-message">
                                            {formErrors["task_description"]
                                                ? formErrors["task_description"]
                                                : ""}
                                        </p>
                                    </>
                                </div>
                            </div>
                            {/* <div className="link">
                    <input
                      className="submission-folder-link-container"
                      type="link"
                      placeholder="Paste your link here..."
                    />
                  </div> */}
                            <div className="task-create-btn-section flex">
                                <div className="main-create-btn">
                                    {getPermission(user.permissions, "Task", "create") && (
                                        <button
                                            type="submit"
                                            className={`${assigneeloader
                                                ? "btn primary-medium-default"
                                                : "btn primary-medium"
                                                }`}
                                            onClick={() => !assigneeloader && validateTask(currAssessment, setFormErrors) ? handleSave(currAssessment) : null}

                                        >
                                            {currAssessment.draft ? "Create" : "Update"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                </section>
            </>
        </>
    )
}
