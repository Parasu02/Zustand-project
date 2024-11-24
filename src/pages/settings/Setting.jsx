import axios from "axios";
import React, { useEffect, useState } from "react";
import { API_END_POINT } from "../../../config";
import { useAuth } from "../../context/AuthContext";
import { validateNewpassword,headers } from "../../utils/utility";
import { Popover, notification } from "antd";
import GetPasswordPopover from "../../components/PasswordRequirement/PasswordRequirement";
import { LoadingOutlined } from "@ant-design/icons";
import { create } from "zustand";

//CSS here
import "./scss/Settings.css";
import { useParams } from "react-router-dom";


export const useSettingStore = create((set, get) => ({
  activeTab:"2",
  setActiveTab:(tab)=> set({activeTab:tab}),
  weightageList:[],
  setWeightageLists:(batchLists)=> set({weightageList:batchLists}),
}));

function Settings() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState({});
  const [loading,setLoading] = useState(false)
  const { user, token } = useAuth();
  const {activeTab,setActiveTab} = useSettingStore()
  const {id:batchId} = useParams()
  const {weightageList,setWeightageLists} = useSettingStore()
 
  const handleChangePassword = (e) => {
    e.preventDefault();
    const validateField = validateNewpassword(
      { newPassword, confirmPassword },
      setPasswordError
    );

    if (validateField) {
      setLoading(true);
      axios
        .put(
          `${API_END_POINT}/api/accounts/reset/password/`,
          { password: confirmPassword },
          { headers }
        )
        .then((res) => {
          if (res.status == 200) {
            notification.success({
              message: "Success",
              description: res?.data?.message,
              duration: 1,
            });
            setNewPassword("");
            setConfirmPassword("");
            setLoading(false);

          }
        })
        .catch((error) => {
          setLoading(false);
          if (
            error.response.data.status === 400 ||
            "errors" in error.response.data
          ) {
            const errorMessages = error.response.data.errors;
  
            Object.entries(errorMessages).forEach(([key, messages]) => {
              notification.error({
                message: `${key} Error`,
                description: messages,
                duration:1
              })
            });
          }
        });
    }
  };

  useEffect(()=>{
    axios.get(`${API_END_POINT}task/${batchId}/list/weightage`,{headers}).then((res)=>{
      console.log(res.data.data);
      if(res.data.status == 200){
        const batchLists = [...res.data.data]
        setWeightageLists(batchLists)
      }
      
    }).catch((error)=>{
      console.log(error);
      
    })
  })
  return (
    <>
    
      <div className="main-listing-container">
        <section className="listing-container">
          <div className="user-info-container">
            <div className="user-image-container">
              {/* <img src="" alt="" /> */}
              <p>
                {user?.first_name?.[0].toUpperCase()}
                {user?.last_name?.[0].toUpperCase()}
              </p>
            </div>
            <div className="name-and-email-info">
              <p>
                {user?.first_name}
                {user?.last_name}
              </p>
              <p className="email">{user?.email}</p>
            </div>
          </div>
          <div className="hl-line"></div>
          <div className="settings-menu-list-container">
            <div className="menu-list">
              <ul>
                <li className="settings-nav" onClick={()=>setActiveTab("1")}>Change Password <img src="/icons/Change-password-lock.svg" alt="" /></li>
                <li className="settings-nav" onClick={()=>setActiveTab("2")}>Wegihtage <img src="" alt="" /></li>
              </ul>
            </div>
          </div>
        </section>
      </div>
      <div className="vertical-line">
      </div>
      <div className="main-container-settings">
        {activeTab == "1" && (
          <div className="change-password-menu-container">
          <div className="menu-title">
            <p> Change Password</p>
            <img src="" alt="" />
            {/* icon here */}
          </div>
          <form action="" onSubmit={handleChangePassword}>
            <div className="inputs-section">
              <div className="new-password-input-section flex">
                <label htmlFor="">New Password</label>
                <Popover
                  trigger={"focus"}
                  placement="rightTop"
                  content={<GetPasswordPopover password={newPassword} />}
                >
                  <input
                    className={`input-field ${
                      passwordError.newPassword ? "error-notify " : ""
                    }`}
                    value={newPassword}
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    placeholder="Type here..."
                    onChange={(e) => {
                      if (passwordError[e.target.name]) {
                        delete passwordError[e.target.name];
                      }
                      setNewPassword(e.target.value);
                    }}
                  />
                </Popover>
                <img
                  src={
                    showNewPassword
                      ? "/icons/eye-open.svg"
                      : "/icons/eye-close.svg"
                  }
                  className="eye-icon"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                />
                <p className="error-message">
                  {passwordError.newPassword ? passwordError.newPassword : ""}
                </p>
              </div>
              <div className="confirm-password-input-section flex">
                <label htmlFor="">Confirm Password</label>
                <input
                  className={`input-field ${
                    passwordError.confirmPassword ? "error-notify " : ""
                  }`}
                  value={confirmPassword}
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Type here..."
                  onChange={(e) => {
                    if (passwordError[e.target.name]) {
                      delete passwordError[e.target.name];
                    }
                    setConfirmPassword(e.target.value);
                  }}
                />
                <img
                  src={
                    showConfirmPassword
                      ? "/icons/eye-open.svg"
                      : "/icons/eye-close.svg"
                  }
                  className="eye-icon"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                />
                <p className="error-message">
                  {passwordError.confirmPassword
                    ? passwordError.confirmPassword
                    : ""}
                </p>
              </div>
              <div className="change-password-button-section">
                {/* <button className="btn btn primary-medium">Update</button> */}
                <button className="btn primary-medium " disabled={loading}>
                    {loading ? (
                      <span>
                        Updating...
                        <LoadingOutlined className="loader" />
                      </span>
                    ) : (
                      "Update"
                    )}
                  </button>
              </div>
            </div>
          </form>
        </div>
        )}
        {activeTab == "2" && (
          <div>
            <div className="weightage-list-container">
              <div className="weightage-card">
                <div className="weightage-name">
                  + Add Weightage
                </div>
              </div>
              {weightageList?.map((batch) => (
                <div className="weightage-card" key={batch.id}>
                  <div className="weightage-name">
                    {batch.weightage}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Settings;
