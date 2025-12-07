import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Quest, Question } from '../App';
import { 
  ArrowLeft, 
  Clock, 
  Star, 
  CheckCircle, 
  XCircle,
  Lightbulb,
  Zap,
  Trophy
} from 'lucide-react';



// Mock questions for the quest
const mockQuestions = [
  {
    id: '1',
    question: 'What is the solution to the equation: 2x + 5 = 13?',
    options: ['x = 4', 'x = 6', 'x = 8', 'x = 3'],
    correctAnswer: 0,
    explanation: 'To solve 2x + 5 = 13, subtract 5 from both sides to get 2x = 8, then divide by 2 to get x = 4.'
  },
  {
    id: '2',
    question: 'Which of the following is equivalent to 3(x + 2)?',
    options: ['3x + 2', '3x + 6', 'x + 6', '3x + 5'],
    correctAnswer: 1,
    explanation: 'Using the distributive property: 3(x + 2) = 3 × x + 3 × 2 = 3x + 6.'
  },
  {
    id: '3',
    question: 'If y = 2x - 3 and x = 5, what is the value of y?',
    options: ['7', '8', '9', '10'],
    correctAnswer: 0,
    explanation: 'Substitute x = 5 into y = 2x - 3: y = 2(5) - 3 = 10 - 3 = 7.'
  },
  {
    id: '4',
    question: 'What is the coefficient of x in the expression 4x + 7?',
    options: ['4', '7', '11', 'x'],
    correctAnswer: 0,
    explanation: 'The coefficient is the number multiplied by the variable. In 4x + 7, the coefficient of x is 4.'
  },
  {
    id: '5',
    question: 'Solve for x: x/3 = 12',
    options: ['x = 4', 'x = 9', 'x = 15', 'x = 36'],
    correctAnswer: 3,
    explanation: 'To solve x/3 = 12, multiply both sides by 3: x = 12 × 3 = 36.'
  }
];

export function QuestInterface({ quest, onComplete, onBack }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const [questComplete, setQuestComplete] = useState(false);
  const [answers, setAnswers] = useState(new Array(mockQuestions.length).fill(null));

  const currentQuestion = mockQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / mockQuestions.length) * 100;

  // Timer countdown
  useEffect(() => {
    if (timeRemaining > 0 && !questComplete) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      handleQuestComplete();
    }
  }, [timeRemaining, questComplete]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
    
    setShowExplanation(false);
    setSelectedAnswer(answers[currentQuestionIndex + 1] || null);
    
    if (currentQuestionIndex < mockQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleQuestComplete();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setShowExplanation(false);
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(answers[currentQuestionIndex - 1]);
    }
  };

  const handleShowExplanation = () => {
    setShowExplanation(true);
  };

  const handleQuestComplete = () => {
    // Calculate final score including any unanswered questions
    let finalScore = 0;
    answers.forEach((answer, index) => {
      if (answer === mockQuestions[index].correctAnswer) {
        finalScore++;
      }
    });
    setScore(finalScore);
    setQuestComplete(true);
  };

  const getScoreColor = () => {
    const percentage = (score / mockQuestions.length) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = () => {
    const percentage = (score / mockQuestions.length) * 100;
    if (percentage >= 90) return { text: 'Legendary!', color: 'bg-purple-500' };
    if (percentage >= 80) return { text: 'Excellent!', color: 'bg-green-500' };
    if (percentage >= 70) return { text: 'Good Job!', color: 'bg-blue-500' };
    if (percentage >= 60) return { text: 'Not Bad!', color: 'bg-yellow-500' };
    return { text: 'Keep Trying!', color: 'bg-red-500' };
  };

  if (questComplete) {
    const percentage = (score / mockQuestions.length) * 100;
    const badge = getScoreBadge();
    const xpEarned = Math.floor((percentage / 100) * quest.xpReward);

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <div className="mb-6">
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-2">Quest Complete!</h1>
              <h2 className="text-xl text-gray-600">{quest.title}</h2>
            </div>

            <div className="mb-8">
              <Badge className={`${badge.color} text-white text-lg px-4 py-2 mb-4`}>
                {badge.text}
              </Badge>
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getScoreColor()}`}>
                    {score}/{mockQuestions.length}
                  </div>
                  <div className="text-sm text-gray-600">Score</div>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getScoreColor()}`}>
                    {percentage.toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600">Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">
                    +{xpEarned}
                  </div>
                  <div className="text-sm text-gray-600">XP Earned</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-bold text-green-800 mb-2">🎉 Achievements Unlocked!</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  {percentage >= 80 && <li>• Quest Master - Scored 80% or higher!</li>}
                  {score === mockQuestions.length && <li>• Perfect Score - Answered every question correctly!</li>}
                  <li>• Knowledge Seeker - Completed the {quest.title} quest!</li>
                </ul>
              </div>

              <div className="flex gap-4 justify-center">
                <Button onClick={onComplete} size="lg">
                  Return to Dashboard
                </Button>
                <Button onClick={onBack} variant="outline" size="lg">
                  Review Answers
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-4">
            <div className="flex items-center text-orange-600">
              <Clock className="w-4 h-4 mr-1" />
              <span className="font-medium">{formatTime(timeRemaining)}</span>
            </div>
            <div className="flex items-center text-yellow-600">
              <Star className="w-4 h-4 mr-1" />
              <span className="font-medium">{quest.xpReward} XP</span>
            </div>
          </div>
        </div>

        {/* Quest Info */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">{quest.title}</h1>
              <p className="text-gray-600">{quest.description}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary">{quest.subject}</Badge>
              <Badge className={
                quest.difficulty === 'Easy' ? 'bg-green-500' :
                quest.difficulty === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
              }>
                {quest.difficulty}
              </Badge>
            </div>
          </div>
          
          {/* Progress */}
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span>Question {currentQuestionIndex + 1} of {mockQuestions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </Card>

        {/* Question */}
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">{currentQuestion.question}</h2>
            
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                let buttonClass = "w-full p-4 text-left border-2 rounded-lg transition-all ";
                
                if (showExplanation) {
                  if (index === currentQuestion.correctAnswer) {
                    buttonClass += "border-green-500 bg-green-50 text-green-800";
                  } else if (index === selectedAnswer && index !== currentQuestion.correctAnswer) {
                    buttonClass += "border-red-500 bg-red-50 text-red-800";
                  } else {
                    buttonClass += "border-gray-200 bg-gray-50 text-gray-600";
                  }
                } else {
                  if (selectedAnswer === index) {
                    buttonClass += "border-blue-500 bg-blue-50 text-blue-800";
                  } else {
                    buttonClass += "border-gray-200 hover:border-gray-300 hover:bg-gray-50";
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => !showExplanation && handleAnswerSelect(index)}
                    className={buttonClass}
                    disabled={showExplanation}
                  >
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full border-2 border-current mr-3 flex items-center justify-center">
                        {String.fromCharCode(65 + index)}
                      </div>
                      {option}
                      {showExplanation && index === currentQuestion.correctAnswer && (
                        <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                      )}
                      {showExplanation && index === selectedAnswer && index !== currentQuestion.correctAnswer && (
                        <XCircle className="w-5 h-5 text-red-600 ml-auto" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Explanation */}
          {showExplanation && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start">
                <Lightbulb className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">Explanation</h4>
                  <p className="text-blue-700 text-sm">{currentQuestion.explanation}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button 
              onClick={handlePreviousQuestion}
              variant="outline"
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>

            <div className="flex gap-2">
              {!showExplanation && selectedAnswer !== null && (
                <Button onClick={handleShowExplanation} variant="outline">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Show Explanation
                </Button>
              )}

              <Button 
                onClick={currentQuestionIndex === mockQuestions.length - 1 ? handleQuestComplete : handleNextQuestion}
                disabled={selectedAnswer === null && !showExplanation}
              >
                {currentQuestionIndex === mockQuestions.length - 1 ? 'Complete Quest' : 'Next Question'}
                <Zap className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}