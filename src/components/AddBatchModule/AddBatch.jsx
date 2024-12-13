import React from "react";

import { useNavigate } from "react-router-dom";
import { DatePicker, Modal, notification, Drawer, Tooltip } from "antd";
import { create } from "zustand";
import dayjs from "dayjs";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { API_END_POINT } from "../../../config";
import { getPermission, validateBatch, headers, truncateText } from "../../utils/utility";

import "./scss/AddBatch.css";



export const useBatchStore = create((set, get) => ({
  isBatchCreate: false,
  setIsBatchCreate: (status) => set({ isBatchCreate: status }),
  batchDetails: {},
  setBatchDetails: (value) => {
    const currentBatchDetails = get().batchDetails;
    if (!Object.keys(value).length) {
      set({ batchDetails: {} });
    } else {
      set({ batchDetails: { ...currentBatchDetails, ...value } });
    }
  },
  batchErrors: {},
  setBatchErros: (errors) => {
    const currentbatchErrors = get().batchErrors;
    if (!Object.keys(errors).length) {
      set({ batchErrors: {} });

    } else {
      set({ batchErrors: { ...currentbatchErrors, ...errors } });
    }

  },
  batchEditId: null,
  setBatchEditId: (id) => set({ batchEditId: id }),

}));

const AddBatch = (props) => {
  const { open, setOpen } = props
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const {
    isBatchCreate,
    setIsBatchCreate,
    setBatchDetails,
    batchEditId,
    setBatchEditId,
    batchDetails,
    batchErrors,
    setBatchErros
  } = useBatchStore()


  const resetFields = () => {
    setBatchDetails({});
    setBatchErros({});
    setBatchEditId(null);
    setIsBatchCreate(!isBatchCreate);
  };

  const handleSwitch = (batch) => {
    Modal.confirm({
      title: (
        <div style={{ fontWeight: 500, fontSize: "16px", fontFamily: "Roboto" }}>
          {`Confirm Switch to ${batch.batch_name}`}
        </div>
      ),
      content: "Are you sure you want to Switch this Batch?",
      onOk: () => {
        navigate(`/batch/${batch.id}/applications`);
        window.location.reload();
      },
    });
  };

  const handleEditClick = (batch) => {
    const { id, batch_name, end_date, start_date } = batch
    setBatchDetails({ "batch_name": batch_name })
    setBatchDetails({ "start_date": start_date })
    setBatchDetails({ "end_date": end_date })
    setBatchEditId(id)
  };

  const handleAddBatchCreate = (e) => {
    e.preventDefault();
    const isVaildBatch = validateBatch(batchDetails, setBatchErros);

    if (isVaildBatch) {
      axios.post(`${API_END_POINT}create/batch/`, batchDetails, { headers }).then((res) => {
        if (res.data.status == 200) {
          const newBatchData = res.data.data
          setUser({ ...user, batch: [newBatchData, ...user.batch,] });
          resetFields()
          notification.success({
            message: "Success",
            description: "Batch Created Successfully",
            duration: 3,
          });
        }
      }).catch((error) => {
        const errorMessage = error.response?.data?.errors;
        if (errorMessage) {
          Object.entries(errorMessage).forEach(([key, messages]) => {
            messages.forEach((message) =>
              notification.error({
                message: `${key}`,
                description: message,
              })
            );
          });
        }
      })
    }
  };



  const handleUpdateBatch = (e) => {
    e.preventDefault();
    const isVaildBatch = validateBatch(batchDetails, setBatchErros);
    if (isVaildBatch) {
      axios
        .put(`${API_END_POINT}update/batch/${batchEditId}/`, batchDetails, { headers })
        .then((res) => {
          if (res.data.status == 200) {
            const updatedData = [...user.batch]?.map((item) => {
              if (item.id === batchEditId) {
                return {
                  ...item,
                  ...res.data.data // Spread the properties of res.data.data to update the item
                };
              }
              return item;
            });
            setUser({ ...user, batch: updatedData })
            resetFields()
            notification.success({
              message: "Success",
              description: "Batch Updated Successfully",
              duration: 3,
            });
          }
        })
        .catch((error) => {
          const errorMessage = error.response?.data?.errors;
          if (errorMessage) {
            Object.entries(errorMessage).forEach(([key, messages]) => {
              messages.forEach((message) =>
                notification.error({
                  message: `${key}`,
                  description: message,
                })
              );
            });
          }
        });
    }
  };

  const handleInputChange = (input, type) => {
    let name, value

    if (type) {
      name = type
      value = dayjs(input).format("YYYY-MM-DD")
    } else {
      name = input.target.name,
        value = input.target.value
    }


    if (batchErrors[name]) {
      delete batchErrors[name];
    }

    setBatchDetails({ [name]: value })


  };


  return (
    <>
      <Drawer
        title={
          <div
            style={{ fontWeight: 500, fontSize: "16px", fontFamily: "Roboto" }}
          >
            {!isBatchCreate ? "Switch Batch" : batchEditId ? "Edit Batch" : "Add Batch"}
          </div>
        }
        onClose={() => {
          setOpen(false)
          resetFields()
        }}
        open={open}
        placement="left"
        maskClosable={false}
      >
        <div className="popup-container">
          <>
            <div className="popup-content">
              <div className="add-batch">
                {getPermission(user.permissions, "Batch", "create") && (
                  <button
                    className="add-batch-btn"
                    type="button"
                    onClick={resetFields}
                  >
                    {isBatchCreate ? (
                      <>
                        <span>
                          <img src="/icons/backIcon.svg" alt="backicon" />
                        </span>{" "}
                        Switch Batch
                      </>
                    ) : (
                      <>
                        <span>+</span> Add New Batch
                      </>
                    )}
                  </button>
                )}

              </div>

              {isBatchCreate && (
                <form onSubmit={batchEditId ? handleUpdateBatch : handleAddBatchCreate}>
                  <div className="input-fields">
                    <div className="input-field">
                      <p>Batch Name</p>
                      <input
                        className={`batch-inputs  ${batchErrors["batch_name"] ? "error-notify" : ""
                          }`}
                        type="text"
                        placeholder="Enter the Batch"
                        name="batch_name"
                        value={batchDetails["batch_name"]}
                        onChange={(e) => handleInputChange(e)}
                        autoComplete="off"
                      />
                      <p className="error-message">
                        {batchErrors["batch_name"] && (
                          <span style={{ color: "red" }}>{batchErrors["batch_name"]}</span>
                        )}
                      </p>
                    </div>

                    <div className="input-field">
                      <p>Start Year</p>
                      <DatePicker
                        className={`datepicker ${batchErrors["start_date"] ? "error-notify" : ""
                          }`}
                        format="YYYY-MM-DD"
                        value={batchDetails["start_date"] ? dayjs(batchDetails["start_date"]) : null}
                        onChange={(value) => handleInputChange(value, "start_date")}
                        placeholder="Start Year"
                      />
                      <p className="error-message">
                        {batchErrors["start_date"] && (
                          <span style={{ color: "red" }}>{batchErrors["start_date"]}</span>
                        )}
                      </p>
                    </div>
                    <div className="input-field">
                      <p>End Year</p>
                      <DatePicker
                        className={`datepicker ${batchErrors["end_date"] ? "error-notify" : ""
                          }`}
                        id="endYearInput"
                        format="YYYY-MM-DD"
                        value={batchDetails["end_date"] ? dayjs(batchDetails["end_date"]) : null}
                        onChange={(value) => handleInputChange(value, "end_date")}
                        placeholder="End Year"
                      />
                      <p className="error-message">
                        {batchErrors["end_date"] && (
                          <span style={{ color: "red" }}>{batchErrors["end_date"]}</span>
                        )}
                      </p>
                    </div>
                    <button className="btn primary-medium " > {batchEditId ? "Update Batch" : "Create Batch "}</button>
                  </div>
                </form>
              )}
            </div>
            <div className="switch-batch-list-container">
              {!isBatchCreate && user?.batch?.length > 0 && user?.batch?.map((batch, index) => (
                <div className="switchbatch-container" key={batch.id || index}>
                  <div
                    className="switch-batch-card flex"
                    onClick={() => handleSwitch(batch)}

                  >
                    <div className="batch-left-side flex">
                      <div className="batch-name-year">
                        <Tooltip title={truncateText(batch.batch_name).length < 30 ? "" : truncateText(batch.batch_name)}>
                          <h4>{truncateText(batch.batch_name,30)}</h4>
                        </Tooltip>
                        <p>
                          {dayjs(batch.start_date).format("YYYY")} - {dayjs(batch.end_date).format("YYYY")}
                        </p>
                      </div>

                    </div>
                  </div>
                  <div className="batch-right-side">
                    {getPermission(user.permissions, "Batch", "update") && (
                      <img
                        className="edit-icon"
                        src="/icons/edit-pencil-icon.svg"
                        alt=""
                        onClick={() => {
                          handleEditClick(batch);
                          setIsBatchCreate(!isBatchCreate)
                        }}
                        onMouseOver={(e) => {
                          e.target.src = "/icons/edit-icon-hover.svg";
                        }}
                        onMouseOut={(e) => {
                          e.target.src = "/icons/edit-pencil-icon.svg";
                        }}
                      />
                    )}

                  </div>
                </div>
              ))}
            </div>
          </>
        </div>
      </Drawer>
    </>
  );
};

export default AddBatch;
