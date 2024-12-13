import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate, Link } from "react-router-dom";
import { Tooltip } from "antd";
import axios from "axios";

import { useAuth } from "../context/AuthContext";

import AddBatch from "../components/AddBatchModule/AddBatch";

import { API_END_POINT } from "../../config";
import { fetchUserInfo, getPermission,headers } from '../utils/utility'
const Sidebar = ({ menuList }) => {
  const navigate = useNavigate();
  const { id: batchId } = useParams();
  const { token,setToken, user,setUser } = useAuth();
  const currentPath = useLocation().pathname;
  const [active, setActive] = useState("");
  const [currentBatch, setCurrentBatch] = useState(null);
  const [open, setOpen] = useState(false);
  const [batchLoading,setBatchLoading] = useState(false)

  useEffect(() => {
    if (batchId) {
      // On Batch, setting Applications as default page
      const activeMenuItem = menuList.find((menu) =>currentPath.includes(menu.id));
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
  const renderMenuItem = (menu, active, setActive, batchId, userPermissions) => {
    const hasPermission = menu.permission ? getPermission(userPermissions, menu.permission, "read") : true;
    if (!hasPermission) return null;
  
    return (
      <li
        key={menu.id} // Using menu.id as key
        onClick={() => setActive(menu.id)}
        className={`main-link ${menu.id === active ? "main-active" : ""}`}
      >
        <Link to={`/batch/${batchId}/${menu.id}`} className="flex">
          <img
            src={menu.id === active ? menu.activeIcon : menu.icon}
            alt={menu.label}
          />
          <span>{menu.label}</span>
        </Link>
      </li>
    );
  };



  return (
    <>
      <nav className="side-nav-container flex">
        <div className="logo" style={{ cursor: "pointer" }}>
          <Link to={`/batch/${batchId}/applications`}>
            <img src="/images/dckap_palli_logo_sm.svg" alt="DCKAP Palli logo" />
          </Link>
        </div>
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
                {currentBatch?.batch_name.split(" ").map((word, index) => word.slice(0, index < 2 ? 1 : 2).toUpperCase()).join("")}
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
        <div className="nav-links">
          <ul>
             {menuList.map((menu) => renderMenuItem(menu, active, setActive, batchId, user.permissions))}
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
