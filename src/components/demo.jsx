<>
    <div
        className="applied-weightage-list-container flex"
        style={{ gap: "10px" }}
    >
        {currentAssessment.task_weightages &&
            currentAssessment.task_weightages.map(
                (weightage, weightageIndex) => (
                    <div
                        key={weightageIndex}
                        className="applied-weightage-card flex"
                    >
                        <div className="applied-weightage-name">
                            <p>
                                {weightageLists &&
                                    weightageLists.length > 0 &&
                                    (() => {
                                        const foundWeightage =
                                            weightageLists.find(
                                                (weightageName) =>
                                                    weightageName.id ===
                                                    weightage.weightage
                                            );

                                        return (
                                            foundWeightage && (
                                                <>
                                                    <p>
                                                        {foundWeightage.weightage}{" "}
                                                        {Number(
                                                            weightage.weightage_percentage
                                                        )}
                                                    </p>
                                                </>
                                            )
                                        );
                                    })()}
                            </p>
                        </div>

                        <div className="weightage-checkbox">
                            <input
                                type="number"
                                name="score"
                                onChange={(e) => {
                                    handleScoreOnchange(
                                        e,
                                        students,
                                        weightage
                                    );
                                }}
                            />
                        </div>
                    </div>
                )
            )}
    </div>
    
</>