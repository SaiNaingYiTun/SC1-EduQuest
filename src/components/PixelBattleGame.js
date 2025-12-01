import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, Skull } from "lucide-react";
import { Card, CardContent } from "./ui/card";

export function PixelBattleGame({ quiz, characterClass, onComplete, onExit }) {
  const canvasRef = useRef(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [gamePhase, setGamePhase] = useState('intro');
  
  // Battle state
  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [dialogue, setDialogue] = useState("");
  const [fullDialogue, setFullDialogue] = useState("");
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [showDialogueBox, setShowDialogueBox] = useState(true);
  const [isCorrect, setIsCorrect] = useState(false);
  const [damageNumber, setDamageNumber] = useState(null);
  
  // Animation state
  const [playerX, setPlayerX] = useState(100);
  const [enemyX, setEnemyX] = useState(500);
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState(false);

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  // Enemy data
  const enemyData = {
    easy: { name: "Quiz Slime", color: "#4ade80", maxHp: 80 },
    medium: { name: "Knowledge Goblin", color: "#f59e0b", maxHp: 100 },
    hard: { name: "Wisdom Dragon", color: "#ef4444", maxHp: 120 }
  }[quiz.difficulty] || { name: "Quiz Monster", color: "#8b5cf6", maxHp: 100 };

  // Character colors
  const characterColor = {
    warrior: "#ef4444",
    mage: "#a855f7",
    hacker: "#22c55e",
    scholar: "#eab308",
    artist: "#ec4899"
  }[characterClass] || "#3b82f6";

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 400;

    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw pixel grid background
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 20) {
      for (let y = 0; y < canvas.height; y += 20) {
        ctx.strokeRect(x, y, 20, 20);
      }
    }

    // Draw ground
    ctx.fillStyle = '#16213e';
    ctx.fillRect(0, 320, canvas.width, 80);

    // Draw platform lines
    ctx.strokeStyle = '#0f3460';
    ctx.lineWidth = 2;
    for (let i = 0; i < canvas.width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 320);
      ctx.lineTo(i + 20, 320);
      ctx.stroke();
    }

    // Draw player (pixel art style)
    const drawPlayer = (x, shaking) => {
      const shakeOffset = shaking ? Math.random() * 4 - 2 : 0;
      const px = x + shakeOffset;
      
      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(px - 5, 315, 50, 5);

      // Body
      ctx.fillStyle = characterColor;
      ctx.fillRect(px, 270, 40, 50);
      
      // Head
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(px + 10, 250, 20, 20);
      
      // Arms
      ctx.fillStyle = characterColor;
      ctx.fillRect(px - 10, 280, 10, 25);
      ctx.fillRect(px + 40, 280, 10, 25);
      
      // Legs
      ctx.fillRect(px + 5, 320, 12, 20);
      ctx.fillRect(px + 23, 320, 12, 20);

      // Weapon
      ctx.fillStyle = '#d4d4d8';
      ctx.fillRect(px + 45, 275, 5, 30);
      ctx.fillRect(px + 40, 270, 15, 5);
    };

    // Draw enemy (pixel art style)
    const drawEnemy = (x, shaking) => {
      const shakeOffset = shaking ? Math.random() * 4 - 2 : 0;
      const ex = x + shakeOffset;
      
      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(ex - 5, 315, 60, 5);

      // Body
      ctx.fillStyle = enemyData.color;
      ctx.fillRect(ex, 260, 50, 60);
      
      // Eyes
      ctx.fillStyle = '#fee2e2';
      ctx.fillRect(ex + 10, 275, 12, 12);
      ctx.fillRect(ex + 28, 275, 12, 12);
      
      // Pupils
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(ex + 14, 279, 6, 6);
      ctx.fillRect(ex + 32, 279, 6, 6);

      // Horns/spikes
      ctx.fillStyle = enemyData.color;
      ctx.fillRect(ex + 5, 250, 10, 10);
      ctx.fillRect(ex + 35, 250, 10, 10);
      
      // Arms
      ctx.fillRect(ex - 12, 280, 12, 20);
      ctx.fillRect(ex + 50, 280, 12, 20);
    };

    // Draw flash effect
    if (flash) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    drawPlayer(playerX, shake && !isCorrect);
    drawEnemy(enemyX, shake && isCorrect);

    // Draw HP bars
    const drawHPBar = (x, y, hp, maxHp, color) => {
      // Border
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, 100, 12);
      
      // Background
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + 2, y + 2, 96, 8);
      
      // HP
      ctx.fillStyle = color;
      ctx.fillRect(x + 2, y + 2, (hp / maxHp) * 96, 8);
    };

    drawHPBar(playerX - 10, 230, playerHp, 100, '#22c55e');
    drawHPBar(enemyX - 10, 230, enemyHp, enemyData.maxHp, '#ef4444');

    // Draw damage number
    if (damageNumber) {
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.font = 'bold 32px monospace';
      ctx.strokeText(`-${damageNumber.value}`, damageNumber.x, damageNumber.y);
      ctx.fillText(`-${damageNumber.value}`, damageNumber.x, damageNumber.y);
    }

  }, [playerX, enemyX, playerHp, enemyHp, shake, flash, damageNumber, characterColor, enemyData]);

  // Typewriter effect for dialogue
  useEffect(() => {
    if (dialogueIndex < fullDialogue.length) {
      const timeout = setTimeout(() => {
        setDialogue(fullDialogue.slice(0, dialogueIndex + 1));
        setDialogueIndex(dialogueIndex + 1);
      }, 30);
      return () => clearTimeout(timeout);
    }
  }, [dialogueIndex, fullDialogue]);

  // Intro dialogue
  useEffect(() => {
    if (gamePhase === 'intro') {
      setFullDialogue(`${enemyData.name}: "Halt, adventurer! Answer my riddle or face defeat!"`);
      setDialogueIndex(0);
      setDialogue("");
    }
  }, [gamePhase, enemyData.name]);

  // Question dialogue
  useEffect(() => {
    if (gamePhase === 'question') {
      setFullDialogue(`${enemyData.name}: "${question.question}"`);
      setDialogueIndex(0);
      setDialogue("");
    }
  }, [gamePhase, question, enemyData.name]);

  const handleStartQuestion = () => {
    setGamePhase('question');
    setShowDialogueBox(true);
  };

  const handleAnswerSelect = (index) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(index);
    const correct = index === question.correctAnswer;
    setIsCorrect(correct);
    setShowDialogueBox(false);

    // Attack animation
    if (correct) {
      // Player attacks
      setPlayerX(120);
      setTimeout(() => {
        setPlayerX(100);
        setShake(true);
        setFlash(true);
        const damage = Math.floor(Math.random() * 20) + 30;
        setEnemyHp(prev => Math.max(0, prev - damage));
        setDamageNumber({ value: damage, x: enemyX + 20, y: 250 });
        setScore(score + 1);
        
        setTimeout(() => {
          setShake(false);
          setFlash(false);
          setDamageNumber(null);
          setFullDialogue(question.explanation || "Correct! Well done!");
          setDialogueIndex(0);
          setDialogue("");
          setShowDialogueBox(true);
          setGamePhase('result');
        }, 500);
      }, 300);
    } else {
      // Enemy counter-attacks
      setEnemyX(480);
      setTimeout(() => {
        setEnemyX(500);
        setShake(true);
        setFlash(true);
        const damage = Math.floor(Math.random() * 15) + 15;
        setPlayerHp(prev => Math.max(0, prev - damage));
        setDamageNumber({ value: damage, x: playerX + 20, y: 250 });
        
        setTimeout(() => {
          setShake(false);
          setFlash(false);
          setDamageNumber(null);
          setFullDialogue(`Wrong! ${question.explanation || 'The correct answer was ' + question.options[question.correctAnswer]}`);
          setDialogueIndex(0);
          setDialogue("");
          setShowDialogueBox(true);
          setGamePhase('result');
        }, 500);
      }, 300);
    }
  };

  const handleNext = () => {
    if (playerHp === 0) {
      setGamePhase('complete');
      return;
    }

    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setGamePhase('intro');
      setEnemyHp(enemyData.maxHp);
    } else {
      setGamePhase('complete');
    }
  };

  // Victory/Defeat screen
  if (gamePhase === 'complete' || playerHp === 0) {
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
                  <p className="text-muted-foreground">You defeated the {enemyData.name}!</p>
                </>
              ) : (
                <>
                  <Skull className="w-24 h-24 mx-auto mb-4 text-red-500" />
                  <h2 className="text-3xl mb-2">Defeated...</h2>
                  <p className="text-muted-foreground">Train more and return stronger!</p>
                </>
              )}
            </motion.div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <div className="text-3xl mb-1">{score}/{quiz.questions.length}</div>
                <div className="text-sm text-muted-foreground">Correct Answers</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <div className="text-3xl mb-1">{xpEarned} XP</div>
                <div className="text-sm text-muted-foreground">Experience Earned</div>
              </div>
            </div>

            {victory && quiz.itemReward && finalScore >= 70 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-purple-50 rounded-lg border-2 border-purple-300 mb-6 text-center"
              >
                <div className="text-lg mb-2">🎁 Legendary Item Acquired!</div>
                <div className="text-sm text-muted-foreground">{quiz.itemReward}</div>
              </motion.div>
            )}

            <Button onClick={() => onComplete(finalScore, xpEarned)} className="w-full" size="lg">
              {victory ? 'Continue Adventure' : 'Return to Town'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-white">
            <h2 className="text-2xl mb-1 pixel-text">{quiz.title}</h2>
            <p className="text-purple-200 text-sm">Battle {currentQuestion + 1} of {quiz.questions.length}</p>
          </div>
          <Button variant="outline" onClick={onExit} size="sm">Exit</Button>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <Progress value={progress} className="h-2" />
        </div>

        {/* Pixel Art Battle Canvas */}
        <div className="mb-6 flex justify-center">
          <div className="relative border-4 border-white rounded-lg overflow-hidden shadow-2xl">
            <canvas 
              ref={canvasRef}
              className="pixel-art"
              style={{ imageRendering: 'pixelated' }}
            />
            
            {/* Character Labels */}
            <div className="absolute top-2 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm pixel-text">
              Hero
            </div>
            <div className="absolute top-2 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm pixel-text">
              {enemyData.name}
            </div>
          </div>
        </div>

        {/* Dialogue Box */}
        <AnimatePresence>
          {showDialogueBox && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mb-6"
            >
              <div className="bg-black/90 border-4 border-white rounded-lg p-6 text-white pixel-text relative">
                <div className="absolute -top-3 left-6 bg-black px-2 border-2 border-white rounded">
                  <span className="text-yellow-400">💬</span>
                </div>
                <p className="text-lg leading-relaxed min-h-[60px]">
                  {dialogue}
                  {dialogueIndex < fullDialogue.length && (
                    <span className="animate-pulse">▮</span>
                  )}
                </p>
                
                {gamePhase === 'intro' && dialogueIndex >= fullDialogue.length && (
                  <div className="mt-4 flex justify-end">
                    <Button onClick={handleStartQuestion} size="sm">
                      Ready! →
                    </Button>
                  </div>
                )}

                {gamePhase === 'question' && dialogueIndex >= fullDialogue.length && (
                  <div className="mt-4 flex justify-end">
                    <Button onClick={() => setShowDialogueBox(false)} size="sm">
                      Choose Answer! →
                    </Button>
                  </div>
                )}

                {gamePhase === 'result' && dialogueIndex >= fullDialogue.length && (
                  <div className="mt-4 flex justify-end">
                    <Button onClick={handleNext} size="sm">
                      {currentQuestion < quiz.questions.length - 1 ? 'Next Battle →' : 'Final Results →'}
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Answer Options */}
        {gamePhase === 'question' && !showDialogueBox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectAnswer = index === question.correctAnswer;
              
              let buttonClass = "bg-white/90 hover:bg-white border-4 border-gray-800";
              if (selectedAnswer !== null) {
                if (isCorrectAnswer) {
                  buttonClass = "bg-green-100 border-4 border-green-600";
                } else if (isSelected) {
                  buttonClass = "bg-red-100 border-4 border-red-600";
                }
              }

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: selectedAnswer === null ? 1.05 : 1 }}
                >
                  <button
                    className={`w-full p-4 rounded-lg ${buttonClass} transition-all pixel-text text-left disabled:cursor-not-allowed`}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={selectedAnswer !== null}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 border-2 border-gray-800 bg-yellow-400 rounded flex items-center justify-center">
                        <span>{String.fromCharCode(65 + index)}</span>
                      </div>
                      <span className="flex-1">{option}</span>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      <style>{`
        .pixel-text {
          font-family: 'Courier New', monospace;
          text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.5);
        }
        
        .pixel-art {
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
