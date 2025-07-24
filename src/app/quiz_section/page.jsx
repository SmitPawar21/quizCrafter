import React, { useState, useEffect } from 'react';
import { RotateCcw, Trophy, Target, Clock, CheckCircle, XCircle, SkipForward } from 'lucide-react';
import { useQuizStore } from '@/store/useQuizStore';

export default function QuizFlashcardsPage() {
    // Sample MCQ data - replace with your actual data
    const { quizData } = useQuizStore();
    //  Format For Quiz
    //     id: 1,
    //     question: "What is the primary function of mitochondria in cellular biology?",
    //      options: [
    //          "Protein synthesis",
    //          "Energy production (ATP synthesis)",
    //          "DNA replication",
    //          "Waste removal"
    //      ],
    //      correctAnswer: 1

    const [currentCard, setCurrentCard] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [userAnswers, setUserAnswers] = useState({});
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [startTime] = useState(Date.now());
    const [sessionTime, setSessionTime] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);

    // Timer effect
    useEffect(() => {
        const timer = setInterval(() => {
            setSessionTime(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, [startTime]);

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

    const progressPercentage = ((currentCard + 1) / quizData.length) * 100;

    if (showResults) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-3xl shadow-2xl p-8">
                        {/* Results Header */}
                        <div className="text-center mb-8">
                            <Trophy className="h-20 w-20 text-yellow-500 mx-auto mb-4 animate-bounce" />
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">Quiz Complete!</h1>
                            <div className="text-6xl font-bold text-blue-600 mb-4">{score}</div>
                            <p className="text-xl text-gray-600">Total Score</p>
                            <p className="text-sm text-gray-500 mt-2">Time: {formatTime(sessionTime)}</p>
                        </div>

                        {/* Questions Review */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Question Review</h2>
                            <div className="space-y-6">
                                {quizData.map((question, index) => {
                                    const userAnswer = userAnswers[index];
                                    const isCorrect = userAnswer?.correct;
                                    const isSkipped = userAnswer?.skipped;

                                    return (
                                        <div key={question.id} className={`border rounded-2xl p-6 ${isSkipped ? 'bg-gray-50 border-gray-200' :
                                            isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                                            }`}>
                                            <div className="flex items-start justify-between mb-4">
                                                <h3 className="text-lg font-semibold text-gray-900 flex-1">
                                                    {index + 1}. {question.question}
                                                </h3>
                                                <div className="flex items-center space-x-2 ml-4">
                                                    {isSkipped ? (
                                                        <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                                            Skipped (0 pts)
                                                        </span>
                                                    ) : isCorrect ? (
                                                        <>
                                                            <CheckCircle className="h-6 w-6 text-green-600" />
                                                            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                                                +2 pts
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="h-6 w-6 text-red-600" />
                                                            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                                                -1 pt
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600 mb-2">Correct Answer:</p>
                                                    <p className="bg-green-100 text-green-800 p-3 rounded-lg">
                                                        {question.options[question.correctAnswer]}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600 mb-2">Your Answer:</p>
                                                    {isSkipped ? (
                                                        <p className="bg-gray-100 text-gray-600 p-3 rounded-lg italic">
                                                            Question skipped
                                                        </p>
                                                    ) : (
                                                        <p className={`p-3 rounded-lg ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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

                        <div className="text-center">
                            <button
                                onClick={resetQuiz}
                                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
                            >
                                <RotateCcw className="w-5 h-5 inline mr-2" />
                                Retake Quiz
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestion = quizData[currentCard];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header Stats */}
                <div className="flex flex-wrap justify-between items-center mb-8 bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                            <Target className="h-6 w-6 text-blue-600" />
                            <span className="text-lg font-semibold text-gray-700">
                                {currentCard + 1} / {quizData.length}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Clock className="h-6 w-6 text-green-600" />
                            <span className="text-lg font-semibold text-gray-700">{formatTime(sessionTime)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Trophy className="h-6 w-6 text-yellow-600" />
                            <span className="text-lg font-semibold text-gray-700">Score: {score}</span>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-600">Progress</span>
                        <span className="text-sm font-medium text-gray-600">{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                </div>

                {/* Flashcard */}
                <div className="flex justify-center mb-8">
                    <div className="relative w-full max-w-4xl h-96">
                        <div
                            className={`absolute inset-0 w-full h-full transition-transform duration-700 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''
                                }`}
                        >
                            {/* Front of card (Question & Options) */}
                            <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl shadow-2xl">
                                <div className="flex flex-col h-full p-8 text-white">
                                    <h2 className="text-2xl font-bold mb-6">Question {currentCard + 1}</h2>
                                    <div className="flex-1">
                                        <p className="text-xl leading-relaxed mb-8">{currentQuestion.question}</p>

                                        <div className="grid gap-4">
                                            {currentQuestion.options.map((option, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleOptionClick(index)}
                                                    className={`text-left p-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${selectedOption === index
                                                        ? 'bg-white text-blue-600 shadow-lg'
                                                        : 'bg-white/20 hover:bg-white/30'
                                                        }`}
                                                    disabled={isFlipped}
                                                >
                                                    <span className="font-semibold mr-3">{String.fromCharCode(65 + index)}.</span>
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {!isFlipped && (
                                        <div className="flex justify-center mt-6">
                                            <button
                                                onClick={handleSkip}
                                                className="flex items-center px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-300"
                                            >
                                                <SkipForward className="w-5 h-5 mr-2" />
                                                Skip Question
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Back of card (Result) */}
                            <div className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl shadow-2xl ${userAnswers[currentCard]?.skipped ? 'bg-gradient-to-br from-gray-600 to-gray-700' :
                                userAnswers[currentCard]?.correct ? 'bg-gradient-to-br from-green-600 to-teal-600' :
                                    'bg-gradient-to-br from-red-600 to-pink-600'
                                }`}>
                                <div className="flex flex-col justify-center items-center h-full p-8 text-white text-center">
                                    {userAnswers[currentCard]?.skipped ? (
                                        <>
                                            <SkipForward className="h-20 w-20 mb-6 animate-pulse" />
                                            <h2 className="text-4xl font-bold mb-4">Question Skipped</h2>
                                            <p className="text-xl mb-6">No points awarded</p>
                                            <div className="bg-white/20 rounded-2xl p-6">
                                                <p className="text-lg mb-2">Correct Answer:</p>
                                                <p className="text-2xl font-semibold">
                                                    {String.fromCharCode(65 + currentQuestion.correctAnswer)}. {currentQuestion.options[currentQuestion.correctAnswer]}
                                                </p>
                                            </div>
                                        </>
                                    ) : userAnswers[currentCard]?.correct ? (
                                        <>
                                            <CheckCircle className="h-20 w-20 mb-6 animate-bounce" />
                                            <h2 className="text-4xl font-bold mb-4">Correct!</h2>
                                            <p className="text-xl mb-6">+2 points</p>
                                            <p className="text-lg">
                                                {String.fromCharCode(65 + currentQuestion.correctAnswer)}. {currentQuestion.options[currentQuestion.correctAnswer]}
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="h-20 w-20 mb-6 animate-pulse" />
                                            <h2 className="text-4xl font-bold mb-4">Incorrect</h2>
                                            <p className="text-xl mb-6">-1 point</p>
                                            <div className="space-y-4">
                                                <div className="bg-white/20 rounded-xl p-4">
                                                    <p className="text-sm mb-1">Your Answer:</p>
                                                    <p className="text-lg font-semibold">
                                                        {String.fromCharCode(65 + selectedOption)}. {currentQuestion.options[selectedOption]}
                                                    </p>
                                                </div>
                                                <div className="bg-white/30 rounded-xl p-4">
                                                    <p className="text-sm mb-1">Correct Answer:</p>
                                                    <p className="text-lg font-semibold">
                                                        {String.fromCharCode(65 + currentQuestion.correctAnswer)}. {currentQuestion.options[currentQuestion.correctAnswer]}
                                                    </p>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <button
                                        onClick={nextQuestion}
                                        className="mt-8 bg-white/20 hover:bg-white/30 px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                                    >
                                        {currentCard === quizData.length - 1 ? 'View Results' : 'Next Question'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
        </div>
    );
}