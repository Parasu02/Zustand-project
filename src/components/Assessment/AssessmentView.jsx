import React from "react";


import { useAssessmentStore } from "../../pages/assessmentModule/AssessmentStore";

import AssessmentCreate from "./AssessmentCreate";

import AssigneeWeightage from "./AssigneeWeightage";

import AssessmentScore from "./AssessmentScore";

const AssessmentView = ({
  weightageShow
}) => {

  const {isMode ,getCurrentAssessment} = useAssessmentStore();
  const currentAssessment = getCurrentAssessment();
  return (
    <>
      {isMode == "card" ? (<AssessmentScore />) : 
        <>
          {<AssessmentCreate />}
          {!currentAssessment?.draft && <AssigneeWeightage weightageShow={weightageShow}/>}
        </>

      }
    </>
  );
};
export default AssessmentView;
