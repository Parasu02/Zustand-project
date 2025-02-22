import React, { useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import axios from "axios";
import {
  Pagination,
  Popover,
  Tag,
  Skeleton,
  Tooltip
} from "antd";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";

import { API_END_POINT } from "../../../config";

import { useAuth } from "../../context/AuthContext";

import FilterComponent from "../../components/FilterComponent";

import useFilter from "../../hooks/useFilter";

import "./scss/css/Applications.css";

import { getPermission, truncateText, headers, makeFirstLatterCaps } from "../../utils/utility";

import ViewMore from "../../components/Applications/ViewMore";

const Applications = () => {
  const filterFields = useFilter("applicant");
  const { id: batchId } = useParams();
  const navigator = useNavigate()
  const { user } = useAuth();
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [viewMoreApplicant, setViewMoreApplicant] = useState([]);
  const [applicationSearch, setApplicationSearch] = useState("");
  const [limit, setLimit] = useState(5);
  const [page, setPage] = useState(1);
  const [filterValues, setFilterValues] = useState({});





  const getApplications = async () => {
    let urlBuild = `${API_END_POINT}applicant/${batchId}/list/applicants/?limit=${limit}&page=${page}&`;
    // const filtersParams = Object.entries(a).map(([key,value])=>`filter_${key}=${value}`).join("&")
    // url += filtersParams ? filtersParams : ""
    // url += applicationSearch ? `search=${applicationSearch}` : ""

    const { data } = await axios.get(urlBuild, { headers });
    return data.data; // Return only the applicants data
  }
  const { data: applications, error, isPending, refetch } = useQuery({
    queryKey: ["Applications", filterValues, batchId, limit, page, applicationSearch],
    queryFn: getApplications,
    enabled: !!user && getPermission(user.permissions, "Applicant", "read"),
  })



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
    let copyApplications = [...applications];
    copyApplications = copyApplications.filter(
      (application) => application.id === applicantId
    );

    setViewMoreApplicant(copyApplications);
  };


  return viewMoreApplicant?.length > 0 ? (
    <ViewMore viewMoreApplicant={viewMoreApplicant} handleViewMore={handleViewMore} />
  ) : (
    <main className="application-full-container">
      <div className="application-main-container flex">
        <div className="header-name">
          <h1>Applications list</h1>
        </div>
        <div className="application-actions flex">
          {/* <div className="import-btn-sec">
            {getPermission(
              user.permissions,
              "create_Excel_Import",
              "create_Excel_Import"
            ) && <button className="btn primary-medium">Import</button>}
          </div> */}
          <div className="create-application-btn-sec">
            <button className="btn primary-medium-icon" onClick={()=> navigator(`/batch/${batchId}/application/form`)}>Create</button>
          </div>
          <div className="refetch-btn-sec">
            <button className="btn primary-medium" onClick={refetch}>refetch</button>
          </div>
        </div>
      </div>
      {getPermission(user.permissions, "Applicant", "read") && (
        <>
          <div className="application-inner-container">
            <div className="search-container ">
              <div className="search-area-section">
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
              ) : null}
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
              {isPending ? (
                <Skeleton active paragraph={20} />
              ) : (
                <>
                  {applications?.map((application) => (
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
                                {truncateText(`${makeFirstLatterCaps(application.first_name)} ${makeFirstLatterCaps(application.last_name)}`, 15)}
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
                  {!applications?.length && (
                    <div className="flex no-data-container flex" style={{ flexDirection: "column" }}>
                      <img src="/icons/no-data.svg" className="no-data-image" />
                      <span>There are currently no data available.</span>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="application-pagination-container flex">
              {applications?.length > 0 && (
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
