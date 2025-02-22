import { create } from "zustand";



export const useAssessmentStore = create((set, get) => ({
  assessmentLists:[],
  setAssessmentLists: (assessmentLists) => set({ assessmentLists: assessmentLists }),
  assessmentSearchWord:"",
  setAssessmentSearchWord:(word) => set({ assessmentSearchWord:word }),
  editId : null,
  setEditId :(id) => set({ editId:id }),
  isMode:"edit",
  setIsMode:(mode) => set({ isMode:mode }),
  getCurrentAssessment: () => {
    const state = get();    
    const assessment = state.assessmentLists.find((asses) => asses.id === state.editId);
    return assessment
  },
  formErrors: {},
  setFormErrors: (errors) => set({ formErrors: errors }),
  assigneeloader:false,
  setAssigneLoading:(status) => set({ assigneeloader:status }),
  isStudentScoreOpen:false,
  setStudentScoreOpen:(status) => set({ isStudentScoreOpen:status }),
  toggleAssigneeWeightage: 1,
  initializeWeightage: (type) =>
    set({
      toggleAssigneeWeightage: type === "task" ? 0 : 1
    }),
  setToggleAssigneeWeightage:(boolen) => set({ toggleAssigneeWeightage:boolen }),
  isAssigneeLoading:false,
  setIsAssigneeLoading:(loading) => set({ isAssigneeLoading:loading}),
  students:[],
  setStudents: (studentLists) => set({ students: studentLists }),
  selectedStudents:[],
  setSelectedStudents: (selectedStudents) => set({ selectedStudents: selectedStudents }),
  assigneeSearchWord:"",
  setAssigneeSearch:(searchWords) => set({ assigneeSearchWord: searchWords }),
  weightageErrors:{},
  setWeightageErros:(errors)=> set({ weightageErrors: errors }),
  weightageLists:[],
  setWeightageLists:(weightages)=> set({ weightageLists: weightages }),
  studentLoading:false,
  setStudentLoading:(status) => set({ studentLoading:status }),
  assginedStudentsSearchWord:"",
  setAssignedStudentsSearchWord:(studentName)=> set({ studentsSearchWord: studentName }),
  studentScoreLists:[],
  setStudentScoreLists:(scoreLists) => set({ studentScoreLists: scoreLists}),
  openStudentCommentId:null,
  setOpentStudentCommentId:(id) => set({ openStudentCommentId: id}),
  commentText: "",
  setCommentText:(commentsText) => set({ commentText: commentsText}),
  isCommentEditId: null,
  setIsCommentEditId:(id) => set({ isCommentEditId: id}),
}));

