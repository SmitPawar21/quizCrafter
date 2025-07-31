import { create } from "zustand";

export const useQuizStore = create((set, get) => ({
    quizData: [
        {
            id: 1,
            question: "",
            options: [
                "A",
                "B",
                "C",
                "D"
            ],
            correctAnswer: 1
        }
    ],

    setQuizData: (data) => {
        set({ quizData: data })
    },
}))