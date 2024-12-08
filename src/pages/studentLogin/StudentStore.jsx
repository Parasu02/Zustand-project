import { create } from "zustand";



export const useStudentStore = create((set,get)=>({
    AssessmentLists: [],
    editId: null,
    changeStatus: "",
    submissionLink: "",
    isLoading: false,
    formErrors: {},
    assessmentSearch: "",
    getCurrentAssessment: () => {
        const state = get();    
        const assessment = state.AssessmentLists.find((asses) => asses.id === state.editId);
        return assessment
    },
    setAssessmentLists: (AssessmentLists) => set({ AssessmentLists: AssessmentLists }),
    setEditId: (id) => set({ editId: id }),
    setChangeStatus: (status) => set({ changeStatus: status }),
    setSubmissionLink: (link) => set({ submissionLink: link }),
    setIsLoading: (loading) => set({ isLoading: loading }),
    setFormErrors: (errors) => set({ formErrors: errors }),
    setAssessmentSearch: (search) => set({ assessmentSearch: search }),
}))