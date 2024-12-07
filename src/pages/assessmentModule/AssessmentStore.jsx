import axios from "axios";
import { create } from "zustand";
import { API_END_POINT } from "../../../config";

// import { useParams } from "react-router-dom";

export const useAssessmentStore = create((set, get) => ({
  loading: false,
  setLoading:(status) => set({ loading:status }),
  assessmentLists:[],
  setAssessmentLists: (assessmentLists) => set({ assessmentLists: assessmentLists }),
  assessmentSearchWord:"",
  setAssessmentSearchWord:(word) => set({ assessmentSearchWord:word }),
  editId : null,
  setEditId :(id) => set({ editId:id }),
  isMode:"card",
  setIsMode:(mode) => set({ isMode:mode }),
  currentAssessment: () => {
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
  toggleAssigneeWeightage: 0,
  setToggleAssigneeWeightage:(boolen) => set({ toggleAssigneeWeightage:boolen }),
  isAssigneeLoading:false,
  setIsAssigneeLoading:(loading) => set({ isAssigneeLoading:loading}),
  students:[],
  setStudents: (studentLists) => set({ students: studentLists }),
  selectedStudents:[],
  setSelectedStudents: (selectedStudents) => set({ students: selectedStudents }),
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
  openComments:null,
  setOpenComments:(id) => set({ openComments: id}),
  commentText: "",
  setCommentText:(commentsText) => set({ commentText: commentsText}),
  isCommentEditId: null,
  setIsCommentEditId:(id) => set({ isCommentEditId: id}),
}));

// const {id:batchId} = useParams()
// const url = `${API_END_POINT}task/${batchId}/list_task/?limit=10&page=1&filter_task_type=${1}&search=`
// axios.get(`${API_END_POINT}/`)