"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { motion, AnimatePresence } from "motion/react";
import { Sword, Shield, Sparkles, Zap, Heart, Trophy, Skull } from "lucide-react";

export function BattleQuizGame({ quiz, characterClass, onComplete, onExit }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  
  // Battle state
  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [battleLog, setBattleLog] = useState([]);
  const [isAttacking, setIsAttacking] = useState(false);
  const [isDamaged, setIsDamaged] = useState(false);
  const [showHitEffect, setShowHitEffect] = useState(false);

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  // Enemy data based on difficulty
  const enemyData = {
    easy: { name: "Slime", emoji: "🟢", maxHp: 80 },
    medium: { name: "Goblin", emoji: "👹", maxHp: 100 },
    hard: { name: "Dragon", emoji: "🐉", maxHp: 120 }
  }[quiz.difficulty] || { name: "Monster", emoji: "👾", maxHp: 100 };

  const characterEmoji = {
    warrior: "⚔️",
    mage: "🪄",
    hacker: "💻",
    scholar: "📚",
    artist: "🎨"
  }[characterClass] || "⚔️";

  const handleAnswerSelect = (index) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(index);
    const correct = index === question.correctAnswer;
    setIsCorrect(correct);
    
    // Battle animation
    setIsAttacking(true);
    
    setTimeout(() => {
      setIsAttacking(false);
      setShowHitEffect(true);
      
      if (correct) {
        const damage = Math.floor(Math.random() * 20) + 30; // 30-50 damage
        setEnemyHp(prev => Math.max(0, prev - damage));
        setBattleLog(prev => [...prev, `You attacked for ${damage} damage! 💥`]);
        setScore(prev => prev + 1);
      } else {
        const damage = Math.floor(Math.random() * 15) + 15; // 15-30 damage
        setPlayerHp(prev => Math.max(0, prev - damage));
        setBattleLog(prev => [...prev, `Enemy countered for ${damage} damage! 💢`]);
        setIsDamaged(true);
        setTimeout(() => setIsDamaged(false), 500);
      }
      
      setTimeout(() => {
        setShowHitEffect(false);
        setShowResult(true);
      }, 500);
    }, 600);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setBattleLog([]);
      // Reset enemy HP for next question
      setEnemyHp(enemyData.maxHp);
    } else {
      setQuizComplete(true);
    }
  };

  const handleFinish = () => {
    const finalScore = (score / quiz.questions.length) * 100;
    const xpEarned = Math.floor((finalScore / 100) * quiz.xpReward);
    onComplete(finalScore, xpEarned);
  };

  // Victory/Defeat screen
  if (quizComplete || playerHp === 0) {
    const finalScore = (score / quiz.questions.length) * 100;
    const xpEarned = Math.floor((finalScore / 100) * quiz.xpReward);
    const victory = playerHp > 0;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-8"
      >
        <Card className="max-w-2xl w-full bg-white/95 backdrop-blur">
          <CardContent className="p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="text-center mb-6"
            >
              {victory ? (
                <>
                  <Trophy className="w-24 h-24 mx-auto mb-4 text-yellow-500" />
                  <h2 className="text-3xl mb-2">Victory! 🎉</h2>
                  <p className="text-muted-foreground">You defeated all enemies!</p>
                </>
              ) : (
                <>
                  <Skull className="w-24 h-24 mx-auto mb-4 text-red-500" />
                  <h2 className="text-3xl mb-2">Defeated...</h2>
                  <p className="text-muted-foreground">But you can try again!</p>
                </>
              )}
            </motion.div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <div className="text-3xl mb-1">{score}/{quiz.questions.length}</div>
                <div className="text-sm text-muted-foreground">Correct Answers</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <div className="text-3xl mb-1 flex items-center justify-center gap-2">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                  {xpEarned}
                </div>
                <div className="text-sm text-muted-foreground">XP Earned</div>
              </div>
            </div>

            {victory && quiz.itemReward && finalScore >= 70 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-purple-50 rounded-lg border-2 border-purple-300 mb-6 text-center"
              >
                <div className="text-lg mb-2">🎁 Reward Unlocked!</div>
                <div className="text-sm text-muted-foreground">{quiz.itemReward}</div>
              </motion.div>
            )}

            <Button onClick={handleFinish} className="w-full" size="lg">
              {victory ? 'Continue Adventure' : 'Return to Dashboard'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="text-white">
            <h2 className="text-2xl mb-1">{quiz.title}</h2>
            <p className="text-purple-200">Battle {currentQuestion + 1} of {quiz.questions.length}</p>
          </div>
          <Button variant="outline" onClick={onExit}>Exit Battle</Button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <Progress value={progress} className="h-3" />
        </div>

        {/* Battle Arena */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Player */}
          <Card className="bg-blue-900/50 backdrop-blur border-blue-400">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <div className="text-sm text-blue-200 mb-2">You</div>
                <motion.div
                  animate={{
                    x: isAttacking ? 20 : 0,
                    rotate: isAttacking ? 10 : 0,
                    scale: isDamaged ? 0.9 : 1
                  }}
                  transition={{ duration: 0.3 }}
                  className="text-7xl mb-2"
                >
                  {characterEmoji}
                </motion.div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-white">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span>HP</span>
                  </div>
                  <span>{playerHp}/100</span>
                </div>
                <Progress 
                  value={playerHp} 
                  className="h-3 bg-red-900/50"
                />
              </div>

              <div className="mt-4 flex gap-2 justify-center">
                <div className="p-2 bg-blue-800 rounded-lg">
                  <Sword className="w-5 h-5 text-yellow-300" />
                </div>
                <div className="p-2 bg-blue-800 rounded-lg">
                  <Shield className="w-5 h-5 text-gray-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Battle Effects */}
          <div className="flex items-center justify-center relative">
            <AnimatePresence>
              {isAttacking && (
                <motion.div
                  initial={{ opacity: 0, x: -50, scale: 0.5 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 50, scale: 0 }}
                  className="absolute"
                >
                  <Zap className="w-16 h-16 text-yellow-400" />
                </motion.div>
              )}
              {showHitEffect && (
                <motion.div
                  initial={{ opacity: 0, scale: 2 }}
                  animate={{ opacity: [0, 1, 0], scale: [2, 1.5, 0] }}
                  transition={{ duration: 0.5 }}
                  className="absolute text-6xl"
                >
                  {isCorrect ? "💥" : "💢"}
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="text-white text-center">
              <Sparkles className="w-8 h-8 mx-auto opacity-50" />
            </div>
          </div>

          {/* Enemy */}
          <Card className="bg-red-900/50 backdrop-blur border-red-400">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <div className="text-sm text-red-200 mb-2">{enemyData.name}</div>
                <motion.div
                  animate={{
                    x: showHitEffect && isCorrect ? -10 : 0,
                    scale: showHitEffect && isCorrect ? 0.9 : 1
                  }}
                  transition={{ duration: 0.3 }}
                  className="text-7xl mb-2"
                >
                  {enemyData.emoji}
                </motion.div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-white">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span>HP</span>
                  </div>
                  <span>{enemyHp}/{enemyData.maxHp}</span>
                </div>
                <Progress 
                  value={(enemyHp / enemyData.maxHp) * 100} 
                  className="h-3 bg-red-950"
                />
              </div>

              {enemyHp === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-center text-green-300 text-sm"
                >
                  ✓ Defeated!
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Battle Log */}
        {battleLog.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-black/30 backdrop-blur rounded-lg"
          >
            <div className="text-white text-sm text-center">
              {battleLog[battleLog.length - 1]}
            </div>
          </motion.div>
        )}

        {/* Question Card */}
        <Card className="bg-white/95 backdrop-blur">
          <CardContent className="p-6">
            <h3 className="text-xl mb-6">{question.question}</h3>
            
            <div className="space-y-3 mb-6">
              <AnimatePresence mode="wait">
                {question.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrectAnswer = index === question.correctAnswer;
                  
                  let buttonClass = "";
                  if (showResult) {
                    if (isCorrectAnswer) {
                      buttonClass = "border-green-500 bg-green-50";
                    } else if (isSelected && !isCorrect) {
                      buttonClass = "border-red-500 bg-red-50";
                    }
                  }

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: selectedAnswer === null ? 1.02 : 1 }}
                    >
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left h-auto py-4 px-6 ${buttonClass}`}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={selectedAnswer !== null}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center">
                            <span className="text-sm">{String.fromCharCode(65 + index)}</span>
                          </div>
                          <span className="flex-1">{option}</span>
                        </div>
                      </Button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {showResult && question.explanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg mb-4 ${isCorrect ? 'bg-green-50' : 'bg-blue-50'}`}
              >
                <p className="text-sm">{question.explanation}</p>
              </motion.div>
            )}

            {showResult && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Button onClick={handleNext} className="w-full" size="lg">
                  {currentQuestion < quiz.questions.length - 1 ? 'Next Battle' : 'Final Results'}
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}