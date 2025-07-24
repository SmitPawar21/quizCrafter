import { create } from "zustand";

export const useQuizStore = create((set, get) => ({
    quizData: null, // List of Objects

    setQuizData: (data) => {
        set({quizData: data})
    },
}))