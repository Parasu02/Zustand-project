import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../layout/Sidebar";

const PrivateRoute = () => {
  const { token, user,  } = useAuth();


  const auth = token["access"] ? true : false;

  // If authorized, return an outlet that will render child elements
  // If not, return element that will navigate to login page


  const menuList = [
    { label: "Applications", id: "applications", icon: "/icons/application_icon.svg", activeIcon: "/icons/application_active.svg", permission: "Applicant" },
    { label: "Task", id: "task", icon: "/icons/task_icon.svg", activeIcon: "/icons/task_active.svg", permission: "Task" },
    { label: "Assessment", id: "assessment", icon: "/icons/task_icon.svg", activeIcon: "/icons/task_active.svg", permission: "Task" }, 
    { label: "Settings", id: "settings", icon: "/icons/settings_icon.svg", activeIcon: "/icons/setting_active_icon.svg", permission: null },
  ];


  // Filter for student login remove the application
  const filteredMenuList = menuList.filter(
    (menuItem) => !(user.role === "Student" && menuItem.id === "applications")
  );

  return auth ? (
    <div className="container">
      <Sidebar menuList={filteredMenuList} />
      <Outlet />
    </div>
  ) : (
    <Navigate to="/login" replace />
  );
};

export default PrivateRoute;