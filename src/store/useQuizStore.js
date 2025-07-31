import { create } from "zustand";

export const useQuizStore = create((set, get) => ({
    quizData: [],

    setQuizData: (data) => {
        set({ quizData: data })
    },
}))