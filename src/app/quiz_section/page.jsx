"use client"
import React, { useState, useEffect } from 'react';
import { RotateCcw, Trophy, Target, Clock, CheckCircle, XCircle, SkipForward } from 'lucide-react';
import { useQuizStore } from '@/store/useQuizStore';
import { useRouter } from 'next/navigation';

export default function QuizFlashcardsPage() {
    const router = useRouter();
    
    const {quizData} = useQuizStore();
    const [currentCard, setCurrentCard] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [userAnswers, setUserAnswers] = useState({});
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [startTime] = useState(Date.now());
    const [finalTime, setFinalTime] = useState();
    const [sessionTime, setSessionTime] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    
    // Timer effect
    useEffect(() => {
        const timer = setInterval(() => {
            setSessionTime(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleOptionClick = (optionIndex) => {
        if (isFlipped) return;

        setSelectedOption(optionIndex);
        const isCorrect = optionIndex === quizData[currentCard].correctAnswer;

        // Update user answers
        const newUserAnswers = {
            ...userAnswers,
            [currentCard]: {
                selected: optionIndex,
                correct: isCorrect,
                skipped: false
            }
        };
        setUserAnswers(newUserAnswers);

        // Update score
        const newScore = score + (isCorrect ? 2 : -1);
        setScore(newScore);

        // Flip card to show result
        setIsFlipped(true);
    };

    const handleSkip = () => {
        if (isFlipped) return;

        // Update user answers for skip
        const newUserAnswers = {
            ...userAnswers,
            [currentCard]: {
                selected: null,
                correct: false,
                skipped: true
            }
        };
        setUserAnswers(newUserAnswers);

        // Score remains same (0 points for skip)
        // Flip card to show correct answer
        setIsFlipped(true);
    };

    const nextQuestion = () => {
        if (currentCard < quizData.length - 1) {
            setCurrentCard(currentCard + 1);
            setIsFlipped(false);
            setSelectedOption(null);
        } else {
            setFinalTime(sessionTime);
            setShowResults(true);
        }
    };

    const resetQuiz = () => {
        setCurrentCard(0);
        setIsFlipped(false);
        setUserAnswers({});
        setScore(0);
        setShowResults(false);
        setSelectedOption(null);
    };

    const goHome = () => {
        router.push('/');
    }

    const progressPercentage = ((currentCard + 1) / quizData.length) * 100;

    if (showResults) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-4 px-4 sm:py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8">
                        {/* Results Header */}
                        <div className="text-center mb-6 sm:mb-8">
                            <Trophy className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 text-yellow-500 mx-auto mb-3 sm:mb-4" />
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Quiz Complete!</h1>
                            <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-blue-600 mb-3 sm:mb-4">{score} / {quizData.length*2} </div>
                            <p className="text-lg sm:text-xl text-gray-600">Total Score</p>
                            <p className="text-sm text-gray-500 mt-2">Time: {formatTime(finalTime)}</p>
                        </div>

                        {/* Questions Review */}
                        <div className="mb-6 sm:mb-8">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Question Review</h2>
                            <div className="space-y-4 sm:space-y-6">
                                {quizData.map((question, index) => {
                                    const userAnswer = userAnswers[index];
                                    const isCorrect = userAnswer?.correct;
                                    const isSkipped = userAnswer?.skipped;

                                    return (
                                        <div key={question.id} className={`border rounded-xl sm:rounded-2xl p-4 sm:p-6 ${isSkipped ? 'bg-gray-50 border-gray-200' :
                                            isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                                            }`}>
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex-1 pr-0 sm:pr-4">
                                                    {index + 1}. {question.question}
                                                </h3>
                                                <div className="flex items-center space-x-2 flex-shrink-0">
                                                    {isSkipped ? (
                                                        <span className="bg-gray-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                                                            Skipped (0 pts)
                                                        </span>
                                                    ) : isCorrect ? (
                                                        <>
                                                            <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                                                            <span className="bg-green-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                                                                +2 pts
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                                                            <span className="bg-red-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                                                                -1 pt
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600 mb-2">Correct Answer:</p>
                                                    <p className="bg-green-100 text-green-800 p-2 sm:p-3 rounded-lg text-sm sm:text-base break-words">
                                                        {question.options[question.correctAnswer]}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600 mb-2">Your Answer:</p>
                                                    {isSkipped ? (
                                                        <p className="bg-gray-100 text-gray-600 p-2 sm:p-3 rounded-lg italic text-sm sm:text-base">
                                                            Question skipped
                                                        </p>
                                                    ) : (
                                                        <p className={`p-2 sm:p-3 rounded-lg text-sm sm:text-base break-words ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                            }`}>
                                                            {question.options[userAnswer.selected]}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="text-center flex gap-2">
                            <button
                                onClick={resetQuiz}
                                className="bg-blue-600 cursor-pointer text-white px-6 sm:px-8 py-2 sm:py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
                            >
                                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
                                Retake Quiz
                            </button>
                            <button
                                onClick={goHome}
                                className="bg-purple-600 cursor-pointer text-white px-6 sm:px-8 py-2 sm:py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
                            >
                                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
                                Go Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestion = quizData[currentCard];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-4 px-4 sm:py-8">
            <div className="max-w-6xl mx-auto">
                {/* Header Stats - Responsive Grid */}
                <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                        <div className="flex items-center justify-center sm:justify-start space-x-2">
                            <Target className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
                            <span className="text-base sm:text-lg font-semibold text-gray-700 whitespace-nowrap">
                                {currentCard + 1} / {quizData.length}
                            </span>
                        </div>
                        <div className="flex items-center justify-center sm:justify-start space-x-2">
                            <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0" />
                            <span className="text-base sm:text-lg font-semibold text-gray-700 whitespace-nowrap">
                                {formatTime(sessionTime)}
                            </span>
                        </div>
                        <div className="flex items-center justify-center sm:justify-start space-x-2">
                            <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600 flex-shrink-0" />
                            <span className="text-base sm:text-lg font-semibold text-gray-700 whitespace-nowrap">
                                Score: {score}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-600">Progress</span>
                        <span className="text-sm font-medium text-gray-600">{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                        <div
                            className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 sm:h-3 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                </div>

                {/* Flashcard Container - Fixed for Mobile */}
                <div className="flex justify-center mb-6 sm:mb-8">
                    <div className="w-full max-w-4xl">
                        <div className="relative min-h-[400px] sm:min-h-[450px] lg:min-h-[500px]">
                            {/* Front of card (Question & Options) */}
                            {!isFlipped && (
                                <div className="w-full bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl sm:rounded-3xl shadow-2xl min-h-[400px] sm:min-h-[450px] lg:min-h-[500px]">
                                    <div className="flex flex-col h-full p-4 sm:p-6 lg:p-8 text-white">
                                        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                                            Question {currentCard + 1}
                                        </h2>
                                        
                                        <div className="flex-1 flex flex-col">
                                            <p className="text-lg sm:text-xl leading-relaxed mb-6 sm:mb-8 flex-shrink-0">
                                                {currentQuestion.question}
                                            </p>

                                            <div className="grid gap-3 sm:gap-4 flex-1">
                                                {currentQuestion.options.map((option, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => handleOptionClick(index)}
                                                        className={`text-left p-3 sm:p-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] ${
                                                            selectedOption === index
                                                                ? 'bg-white text-blue-600 shadow-lg'
                                                                : 'bg-white/20 hover:bg-white/30'
                                                        }`}
                                                        disabled={isFlipped}
                                                    >
                                                        <div className="flex items-start">
                                                            <span className="font-semibold mr-2 sm:mr-3 flex-shrink-0">
                                                                {String.fromCharCode(65 + index)}.
                                                            </span>
                                                            <span className="text-sm sm:text-base break-words">{option}</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="flex justify-center mt-4 sm:mt-6 flex-shrink-0">
                                                <button
                                                    onClick={handleSkip}
                                                    className="flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-300 text-sm sm:text-base"
                                                >
                                                    <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                                    Skip Question
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Back of card (Result) */}
                            {isFlipped && (
                                <div className={`w-full rounded-2xl sm:rounded-3xl shadow-2xl min-h-[400px] sm:min-h-[450px] lg:min-h-[500px] ${
                                    userAnswers[currentCard]?.skipped 
                                        ? 'bg-gradient-to-br from-gray-600 to-gray-700' 
                                        : userAnswers[currentCard]?.correct 
                                            ? 'bg-gradient-to-br from-green-600 to-teal-600' 
                                            : 'bg-gradient-to-br from-red-600 to-pink-600'
                                }`}>
                                    <div className="flex flex-col justify-center items-center h-full p-4 sm:p-6 lg:p-8 text-white text-center min-h-[400px] sm:min-h-[450px] lg:min-h-[500px]">
                                        {userAnswers[currentCard]?.skipped ? (
                                            <>
                                                <SkipForward className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 mb-4 sm:mb-6 animate-pulse" />
                                                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Question Skipped</h2>
                                                <p className="text-lg sm:text-xl mb-4 sm:mb-6">No points awarded</p>
                                                <div className="bg-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-md w-full">
                                                    <p className="text-base sm:text-lg mb-2">Correct Answer:</p>
                                                    <p className="text-lg sm:text-xl lg:text-2xl font-semibold break-words">
                                                        {String.fromCharCode(65 + currentQuestion.correctAnswer)}. {currentQuestion.options[currentQuestion.correctAnswer]}
                                                    </p>
                                                </div>
                                            </>
                                        ) : userAnswers[currentCard]?.correct ? (
                                            <>
                                                <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 mb-4 sm:mb-6" />
                                                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Correct!</h2>
                                                <p className="text-lg sm:text-xl mb-4 sm:mb-6">+2 points</p>
                                                <p className="text-base sm:text-lg break-words max-w-md">
                                                    {String.fromCharCode(65 + currentQuestion.correctAnswer)}. {currentQuestion.options[currentQuestion.correctAnswer]}
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 mb-4 sm:mb-6 animate-pulse" />
                                                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Incorrect</h2>
                                                <p className="text-lg sm:text-xl mb-4 sm:mb-6">-1 point</p>
                                                <div className="space-y-3 sm:space-y-4 max-w-md w-full">
                                                    <div className="bg-white/20 rounded-xl p-3 sm:p-4">
                                                        <p className="text-sm mb-1">Your Answer:</p>
                                                        <p className="text-base sm:text-lg font-semibold break-words">
                                                            {String.fromCharCode(65 + selectedOption)}. {currentQuestion.options[selectedOption]}
                                                        </p>
                                                    </div>
                                                    <div className="bg-white/30 rounded-xl p-3 sm:p-4">
                                                        <p className="text-sm mb-1">Correct Answer:</p>
                                                        <p className="text-base sm:text-lg font-semibold break-words">
                                                            {String.fromCharCode(65 + currentQuestion.correctAnswer)}. {currentQuestion.options[currentQuestion.correctAnswer]}
                                                        </p>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        <button
                                            onClick={nextQuestion}
                                            className="mt-6 sm:mt-8 bg-white/20 hover:bg-white/30 px-6 sm:px-8 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
                                        >
                                            {currentCard === quizData.length - 1 ? 'View Results' : 'Next Question'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}