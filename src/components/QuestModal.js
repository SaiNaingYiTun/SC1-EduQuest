import { useState, useEffect } from 'react';
import { X, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Quest } from '../App';



export default function QuestModal({ quest, onClose, onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(quest.timeLimit || 0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!quest.timeLimit || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quest.timeLimit, isSubmitted]);

  const handleSelectAnswer = (answerIndex) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quest.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    const score = quest.questions.filter(
      (q, index) => selectedAnswers[index] === q.correctAnswer
    ).length;

    setIsSubmitted(true);
    setTimeout(() => {
      onComplete(quest.id, score, quest.questions.length, timeLeft);
    }, 2000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQ = quest.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quest.questions.length) * 100;
  const isLastQuestion = currentQuestion === quest.questions.length - 1;
  const canSubmit = selectedAnswers.length === quest.questions.length;

  if (isSubmitted) {
    const score = quest.questions.filter(
      (q, index) => selectedAnswers[index] === q.correctAnswer
    ).length;
    const percentage = (score / quest.questions.length) * 100;

    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl p-8 max-w-md w-full border-4 border-amber-400 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl text-amber-400 mb-4">Quest Complete!</h2>
          <div className="text-2xl text-white mb-2">
            Score: {score}/{quest.questions.length}
          </div>
          <div className="text-xl text-purple-200">
            {percentage.toFixed(0)}% Correct
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl max-w-3xl w-full border-4 border-purple-400 my-8">
        {/* Header */}
        <div className="p-6 border-b-2 border-purple-400/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl text-amber-400">{quest.title}</h2>
            <div className="flex items-center gap-4">
              {quest.timeLimit && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  timeLeft < 30 ? 'bg-red-600/30 text-red-300' : 'bg-blue-600/30 text-blue-300'
                }`}>
                  <Clock className="w-5 h-5" />
                  <span className="text-xl">{formatTime(timeLeft)}</span>
                </div>
              )}
              <button
                onClick={onClose}
                className="text-purple-200 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-slate-800/50 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-sm text-purple-200 mt-2">
            Question {currentQuestion + 1} of {quest.questions.length}
          </div>
        </div>

        {/* Question */}
        <div className="p-8">
          <h3 className="text-2xl text-white mb-6">{currentQ.question}</h3>

          <div className="space-y-4">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedAnswers[currentQuestion] === index
                    ? 'bg-amber-600/30 border-amber-400 text-white'
                    : 'bg-slate-800/30 border-purple-400/30 text-purple-200 hover:border-purple-400/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswers[currentQuestion] === index
                      ? 'border-amber-400 bg-amber-600'
                      : 'border-purple-400/50'
                  }`}>
                    {selectedAnswers[currentQuestion] === index && (
                      <div className="w-3 h-3 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-lg">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t-2 border-purple-400/30 flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="px-6 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white transition-all"
          >
            Previous
          </button>

          <div className="flex gap-2">
            {quest.questions.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  selectedAnswers[index] !== undefined
                    ? 'bg-amber-400'
                    : index === currentQuestion
                    ? 'bg-purple-400'
                    : 'bg-slate-600'
                }`}
              />
            ))}
          </div>

          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white transition-all shadow-lg"
            >
              Submit Quest
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 text-white transition-all shadow-lg"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
