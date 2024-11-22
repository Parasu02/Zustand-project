import React, { useState, useEffect, useRef } from "react";
import { useLocation, useParams, useNavigate, Link } from "react-router-dom";
import { Tooltip } from "antd";
import axios from "axios";

import { DASHBOARD } from "../routes/routes";
import { useAuth } from "../context/AuthContext";

import AddBatch from "../components/AddBatchModule/AddBatch";

import { API_END_POINT } from "../../config";
import { fetchUserInfo, getPermission } from '../utils/utility'
const Sidebar = ({ menuList, activeMenuItem }) => {
  const navigate = useNavigate();
  const { id: batchId } = useParams();

  const { token,setToken, user,setUser } = useAuth();

  const currentPath = useLocation().pathname;
  const isDashboardPage = currentPath.includes(DASHBOARD);
  const [active, setActive] = useState(activeMenuItem);
  const [currentBatch, setCurrentBatch] = useState(null);
  const [open, setOpen] = useState(false);
  const [batchLoading,setBatchLoading] = useState(false)


 

  const headers = {
    Authorization: `Bearer ${token.access}`,
    "Content-type": "application/json",
  };

  useEffect(() => {
      if (batchId) {
        // On Batch, setting Applications as default page
        const activeMenuItem = menuList.find((menu) =>
        currentPath.includes(menu.id)
      );
      setActive(activeMenuItem.id);
      fetchUserInfo(token, setToken, setUser, navigate, setBatchLoading,false);
      
      const currentBatch = user?.batch.find(batch => batch.id === Number(batchId));
      setCurrentBatch(currentBatch);

      }
  }, [batchId]);


  const handleLogout = () => {
    axios
      .post(`${API_END_POINT}accounts/logout/`, token, { headers })
      .then((res) => {
        navigate("/login");
        localStorage.removeItem("token");
        localStorage.removeItem("user");

      }).catch((error)=>{
        if (
          error.response.data.status === 400 ||
          "errors" in error.response.data
        ) {
          const errorMessages = error.response.data.errors;
          notification.error({
            message: error.response.data?.message,
            description: errorMessages.detail,
            duration:1
          })
        }
      })
  };



  return (
    <>
      <nav className="side-nav-container flex">
        <div className="logo" style={{ cursor: "pointer" }}>
          <Link to={``}>
            <img src="/images/dckap_palli_logo_sm.svg" alt="DCKAP Palli logo" />
          </Link>
        </div>

        {!isDashboardPage && (
          <div
            className="batch-switch-container flex"
            onClick={()=>{
              if (getPermission(user.permissions, "Batch", "read")) {
                setOpen(true); 
              }
            }}
            style={{ cursor: getPermission(user.permissions,"Batch","read") ?  "pointer" : "default"}}
          >
            <div className="batch-content-container flex">
              <div className="batch-logo">
                <p className="flex">
                  {currentBatch?.batch_name
                    .split(" ")
                    .map((word, index, array) => {
                      if (array.length === 1) {
                        return word.slice(0, 2).toUpperCase();
                      } else if (index < 2) {
                        return word.slice(0, 1).toUpperCase();
                      } else {
                        return "";
                      }
                    })
                    .join("")}
                </p>
              </div>
              <div className="batch-name">
                {currentBatch?.batch_name.length > 9 ? (
                  <Tooltip title={currentBatch?.batch_name}>
                    <p>
                      {currentBatch?.batch_name.length > 9
                        ? `${currentBatch?.batch_name.slice(0, 9)}...`
                        : currentBatch?.batch_name}
                    </p>
                  </Tooltip>
                ) : (
                  <p>{currentBatch?.batch_name}</p>
                )}
                
                <span>
                  {currentBatch?.start_date?.slice(0, 4)}-
                  {currentBatch?.end_date?.slice(0, 4)}
                </span>
              </div>
            </div>
            <div className="switch-icon">
             {getPermission(user.permissions,"Batch","read") && <img src="/icons/dropdown.svg" alt="" /> }
            </div>
          </div>
        )}
        <div className="nav-links">
          <ul>
            {menuList.map((menu, index) => {
              // Check if the menu id is "applications" and the user has permission related to "Applicant"
              if (menu.id === "applications" && getPermission(user.permissions, "Applicant", "read")) {
                return (
                  <li
                    key={index}
                    onClick={() => setActive(menu.id)}
                    className={`main-link ${menu.id === active ? "main-active" : ""}`}
                  >
                    <Link
                      to={isDashboardPage ? "/dashboard" : `/batch/${batchId}/${menu.id}`}
                      className="flex"
                    >
                      <img src={menu.id === active ? "/icons/application_active.svg" : "/icons/application_icon.svg"}alt={menu.label} />
                      <span>{menu.label}</span>
                    </Link>
                  </li>
                );
              } else if (menu.id === "task" || menu.id === "assessment") {
                // Render the remaining menu items only if the user has permission to read Task
                const hasReadPermissionForTask = getPermission(user.permissions, "Task", "read");
                if (hasReadPermissionForTask) {
                  return (
                    <li
                      key={index}
                      onClick={() => setActive(menu.id)}
                      className={`main-link ${menu.id === active ? "main-active" : ""}`}
                    >
                      <Link
                        to={isDashboardPage ? "/dashboard" : `/batch/${batchId}/${menu.id}`}
                        className="flex"
                      >
                        <img src={menu.id === active ? "/icons/task_active.svg":"/icons/task_icon.svg"} alt={menu.label} />
                        <span>{menu.label}</span>
                      </Link>
                    </li>
                  );
                } else {
                  return null; // Skip rendering Task and Assessment if user doesn't have read permission for Task
                }
              } else if (menu.id == "settings") {
                // return null; // Skip rendering other menu items
                return(
                  <li
                  key={index}
                  onClick={() => setActive(menu.id)}
                  className={`main-link ${menu.id === active ? "main-active" : ""}`}
                >
                  <Link
                    to={isDashboardPage ? "/dashboard" : `/batch/${batchId}/${menu.id}`}
                    className="flex"
                  >
                    <img src={menu.id === active ? "/icons/setting_active_icon.svg":"/icons/settings_icon.svg"} alt={menu.label} />
                    <span>{menu.label}</span>
                  </Link>
                </li>
                )
              }
            })}

          </ul>
        </div>

        <div className="user-profile flex">
          <div className="profile-img flex">
          {user.first_name[0]?.toUpperCase()}{user.last_name[0]?.toUpperCase()}
            {/* <img src="/icons/profile.svg" alt="" /> */}
          </div>
            <div className="user-details">
              <p>{user.first_name} {user.last_name}</p>
                 <div className="logout-icon flex"
                  onMouseOver={(e)=>{
                    e.target.src ="/icons/logout-hover.svg"
                  }}
                  onMouseOut={(e)=>{
                    e.target.src ="/icons/logout.svg"
                  }}>
                   <span>
                   {" "}
                  {user.role}
              </span>
              <Tooltip title="Logout">
                     <img src="/icons/logout.svg" alt="logout" onClick={handleLogout}/>
              </Tooltip>
              </div>
            </div>
        </div>
      </nav>
      {batchLoading ? <Skeleton active/> : (
        <AddBatch
        open={open} 
        setOpen={(value)=>setOpen(value)} 
      />
      )}
      
    </>
  );
};

export default Sidebar;
