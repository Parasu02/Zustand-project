import React, { useEffect, useState } from "react";

import { useParams, useNavigate } from "react-router-dom";

import axios from "axios";
import {
  Pagination,
  Popover,
  Tag,
  Skeleton,
  Tooltip,
  notification,
} from "antd";
import dayjs from "dayjs";

import { API_END_POINT } from "../../../config";

import { useAuth } from "../../context/AuthContext";

import FilterComponent from "../../components/FilterComponent";

import useFilter from "../../hooks/useFilter";

import "./scss/css/Applications.css";

import { getPermission,truncateText,headers,makeFirstLatterCaps } from "../../utils/validate";
import ViewMore from "../../components/Applications/ViewMore";

const Applications = () => {
  const filterFields = useFilter("applicant");  
  const { id: batchId } = useParams();
  const { token, user } = useAuth();
  const [isLoading, setLoading] = useState(true);
  const [popoverVisible, setPopoverVisible] = useState(false);

  const [viewMoreApplicant, setViewMoreApplicant] = useState([]);
  const [applications, setApplications] = useState({ data: [] });
  const [applicationSearch, setApplicationSearch] = useState("");
  const [limit, setLimit] = useState(5);
  const [page, setPage] = useState(1);
  const [filterValues, setFilterValues] = useState({});



  useEffect(() => {
    setLoading(true);
    if (getPermission(user.permissions, "Applicant", "read")) {
      let urlBuild = `${API_END_POINT}applicant/${batchId}/list/applicants/?limit=${limit}&page=${page}&`;
      if (Object.keys(filterValues).length > 0) {
        Object.keys(filterValues).forEach((key) => {
          urlBuild += `filter_${key}=${filterValues[key]}&`;
        });
      }
      if (applicationSearch) {
        urlBuild += `search=${applicationSearch}`;
      }
      axios
        .get(urlBuild, { headers })
        .then((res) => {
          setApplications(res.data);
          setLoading(false);
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
  }, [filterValues, batchId, limit, page, applicationSearch]);

  const handleRemoveFilter = (fieldName) => {
    const updatedFilterState = { ...filterValues };

    if (fieldName in updatedFilterState) {
      // Use the 'delete' operator to remove the specified key
      delete updatedFilterState[fieldName];

      // Update the state with the modified filterValues
      setFilterValues(updatedFilterState);
    }
  };

  const content = (
    <div>
      <FilterComponent
        filter={filterFields}
        setPopoverVisible={setPopoverVisible}
        filterValues={filterValues}
        setFilterValues={setFilterValues}
      />
    </div>
  );

  const handleViewMore = (applicantId) => {
    let copyApplications = [...applications.data];
    copyApplications = copyApplications.filter(
      (application) => application.id === applicantId
    );

    setViewMoreApplicant(copyApplications);
  };


  return viewMoreApplicant?.length > 0 ? (
   <ViewMore viewMoreApplicant={viewMoreApplicant} handleViewMore={handleViewMore}/>
  ) : (
    <main className="application-full-container">
      <div className="application-main-container flex">
        <div className="header-name">
          <h1>Applications list</h1>
        </div>
        <div className="application-actions flex">
          <div className="import">
            {/* {getPermission(
              user.permissions,
              "create_Excel_Import",
              "create_Excel_Import"
            ) && <button className="btn primary-medium">Import</button>} */}
          </div>
        </div>
      </div>
      {getPermission(user.permissions, "Applicant", "read") && (
        <>
          <div className="application-inner-container">
               <div className="search-container">
               <img src="/icons/searchIcon.svg" alt="" className="search-icon" />
               <input
                 type="text"
                 value={applicationSearch}
                 placeholder="Search here"
                 onChange={(e) => setApplicationSearch(e.target.value)}
               />
 
               <Popover
                 placement="leftTop"
                 open={popoverVisible}
                 onOpenChange={(visible) => setPopoverVisible(visible)}
                 content={content}
                 trigger={["click"]}
               >
                 <img
                   src="/icons/filterIcon.svg"
                   alt=""
                   className="filter-icon"
                 />
               </Popover>
             </div>
           
            <div className="filter-or-search-container">
              {applicationSearch.length > 0 ? (
                <>
                  <Tag color="#49a843">Search : {applicationSearch} </Tag>
                  <img
                    src="/icons/Cancel.svg"
                    className="cancel-btn"
                    onClick={() => setApplicationSearch("")}
                  />
                </>
              ) : (
                ""
              )}
              {filterValues &&
                Object.keys(filterValues).map((filterName) => (
                  <>
                    <Tag color="#49a843">{`${filterName} : ${filterValues[
                      filterName
                    ].toLowerCase()} `}</Tag>
                    <img
                      src="/icons/Cancel.svg"
                      alt=""
                      className="cancel-btn"
                      onClick={() => handleRemoveFilter(filterName)}
                    />
                  </>
                ))}
            </div>

            <div className="application-list-container">
              {isLoading ? (
                <Skeleton active paragraph={20} />
              ) : (
                <>
                  {applications?.data?.map((application) => (
                    <div
                      className="application-card-container"
                      key={application.id}
                      onClick={() => handleViewMore(application.id)}
                    >
                      <div className="application-details-container flex">
                        <div className="application-info flex">
                          <div className="application-name-container">
                            <p>
                              {application.first_name[0].toUpperCase()}
                              {application.last_name[0].toUpperCase()}
                            </p>
                          </div>
                          <div className="application-email-container">
                            <p className="application-name">
                              <Tooltip
                                title={
                                  `${makeFirstLatterCaps(application.first_name)} ${makeFirstLatterCaps(application.last_name)}`
                                }
                              >
                              {truncateText(`${makeFirstLatterCaps(application.first_name)} ${makeFirstLatterCaps(application.last_name)}`,15)}
                              </Tooltip>
                            </p>
                            <p className="application-email">
                              {truncateText(application.email, 15)}
                            </p>
                          </div>
                        </div>
                        <div className="application-gender">
                          <p>Gender</p>
                          <span>-</span>
                        </div>
                        <div className="application-dob">
                          <p>Date of Birth</p>
                          <span>
                            {dayjs(application.dob).format("MMM DD, YYYY")}
                          </span>
                        </div>
                        <div className="application-district">
                          <p>District</p>
                          <p className="district-heading">
                            {application.district}
                          </p>
                        </div>
                        <div className="application-qualification">
                          <p>Qualification</p>
                          <span>Diploma</span>
                        </div>
                        <div className="application-mobile-no">
                          <p>Mobile No</p>
                          <span>{application.contact_number}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {applications?.data?.length === 0 && (
                    <div className="flex no-data-container flex" style={{flexDirection:"column"}}>
                      <img src="/icons/no-data.svg" className="no-data-image" />
                      <span>There are currently no data available.</span>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="application-pagination-container flex">
              {applications.data.length > 0 && (
                <Pagination
                  className="pagination"
                  current={applications.currentPage}
                  pageSize={limit}
                  total={applications.total}
                  onChange={(page) => setPage(page)}
                />
              )}
            </div>
          </div>
        </>
      )}
    </main>
  );
};

export default Applications;
