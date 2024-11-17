import React from "react";

import { useAssessmentStore } from "../pages/assessmentModule/AssessmentStore";
import AssessmentCreate from "./AssessmentCreate";
import AssigneeWeightage from "./AssigneeWeightage";
import AssessmentScore from "./AssessmentScore";

const AssessmentView = ({
  weightageShow
}) => {

  const {isMode ,currentAssessment,studentLoading} = useAssessmentStore();
  const currAssessment = currentAssessment();
  return (
    <>
      {isMode == "card" ? (
        
        <AssessmentScore />
        
      ) : 
        <>
        {console.log(currAssessment)}
          {<AssessmentCreate />}
          {!currAssessment?.draft && <AssigneeWeightage weightageShow={weightageShow}/>}
        </>

      }
    </>
  );
};
export default AssessmentView;
