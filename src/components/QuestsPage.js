import { useState, useEffect } from 'react';
import { Scroll, Clock, Star, Trophy, Play, CheckCircle } from 'lucide-react';
import { Character, Quest, User } from '../App';
import QuestModal from './QuestModal';



// Mock quests data
const mockQuests = [
  {
    id: 'quest1',
    title: 'The Algebra Adventure',
    description: 'Solve algebraic equations to unlock the ancient treasure',
    difficulty: 'Easy',
    xpReward: 50,
    timeLimit: 120,
    teacherId: 'teacher1',
    questions: [
      {
        id: 'q1',
        question: 'Solve for x: 2x + 5 = 13',
        options: ['x = 2', 'x = 4', 'x = 6', 'x = 8'],
        correctAnswer: 1
      },
      {
        id: 'q2',
        question: 'What is 3x - 7 = 8?',
        options: ['x = 3', 'x = 5', 'x = 7', 'x = 9'],
        correctAnswer: 1
      },
      {
        id: 'q3',
        question: 'Solve: 4x + 2 = 18',
        options: ['x = 2', 'x = 4', 'x = 6', 'x = 8'],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 'quest2',
    title: 'Geometry Quest',
    description: 'Master the secrets of shapes and angles',
    difficulty: 'Medium',
    xpReward: 100,
    timeLimit: 180,
    teacherId: 'teacher1',
    questions: [
      {
        id: 'q1',
        question: 'What is the sum of angles in a triangle?',
        options: ['90°', '180°', '270°', '360°'],
        correctAnswer: 1
      },
      {
        id: 'q2',
        question: 'Area of a circle with radius 5?',
        options: ['25π', '50π', '75π', '100π'],
        correctAnswer: 0
      },
      {
        id: 'q3',
        question: 'How many sides does a hexagon have?',
        options: ['4', '5', '6', '8'],
        correctAnswer: 2
      },
      {
        id: 'q4',
        question: 'Pythagorean theorem: a² + b² = ?',
        options: ['c', 'c²', '2c', 'c³'],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 'quest3',
    title: 'The Calculus Challenge',
    description: 'Face the ultimate test of mathematical prowess',
    difficulty: 'Hard',
    xpReward: 200,
    timeLimit: 300,
    teacherId: 'teacher1',
    questions: [
      {
        id: 'q1',
        question: 'What is the derivative of x²?',
        options: ['x', '2x', 'x²/2', '2x²'],
        correctAnswer: 1
      },
      {
        id: 'q2',
        question: 'Integral of 2x dx = ?',
        options: ['x²', 'x² + C', '2x²', '2x² + C'],
        correctAnswer: 1
      },
      {
        id: 'q3',
        question: 'Limit of (x² - 4)/(x - 2) as x approaches 2?',
        options: ['0', '2', '4', 'undefined'],
        correctAnswer: 2
      },
      {
        id: 'q4',
        question: 'Second derivative of x³?',
        options: ['3x²', '6x', 'x²', '3x'],
        correctAnswer: 1
      },
      {
        id: 'q5',
        question: 'What is d/dx(sin x)?',
        options: ['cos x', '-cos x', 'sin x', '-sin x'],
        correctAnswer: 0
      }
    ]
  }
];

export default function QuestsPage({ 
  character, 
  onUpdateCharacter, 
  studentClasses,
  teachers,
  onUnlockAchievement 
}) {
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [completedQuests, setCompletedQuests] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem(`completed_quests_${character.id}`);
    if (saved) {
      setCompletedQuests(JSON.parse(saved));
    }
  }, [character.id]);

  const handleQuestComplete = (questId, score, totalQuestions, timeLeft) => {
    const quest = mockQuests.find(q => q.id === questId);
    if (!quest) return;

    const percentage = (score / totalQuestions) * 100;
    const xpEarned = Math.floor((quest.xpReward * score) / totalQuestions);

    // Update character
    const newXp = character.xp + xpEarned;
    const newLevel = Math.floor(newXp / 100) + 1;
    const leveledUp = newLevel > character.level;

    onUpdateCharacter(character.id, {
      xp: newXp,
      level: newLevel,
      maxXp: newLevel * 100
    });

    // Mark quest as completed
    const newCompleted = [...completedQuests, questId];
    setCompletedQuests(newCompleted);
    localStorage.setItem(`completed_quests_${character.id}`, JSON.stringify(newCompleted));

    // Check for achievements
    if (completedQuests.length === 0) {
      onUnlockAchievement('first_quest');
    }
    if (percentage === 100) {
      onUnlockAchievement('perfect_score');
    }
    if (quest.timeLimit && timeLeft > quest.timeLimit * 0.5) {
      onUnlockAchievement('speed_demon');
    }
    if (newLevel >= 5) {
      onUnlockAchievement('level_5');
    }
    if (newLevel >= 10) {
      onUnlockAchievement('level_10');
    }

    setSelectedQuest(null);

    // Show results
    alert(
      `Quest Complete!\n\nScore: ${score}/${totalQuestions} (${percentage.toFixed(0)}%)\nXP Earned: +${xpEarned}\n${leveledUp ? `\n🎉 Level Up! You are now level ${newLevel}!` : ''}`
    );
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'green';
      case 'Medium':
        return 'yellow';
      case 'Hard':
        return 'red';
      default:
        return 'gray';
    }
  };

  // Filter quests based on student's classes
  const availableQuests = mockQuests.filter(quest => 
    studentClasses.includes(quest.teacherId)
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl text-amber-400">Available Quests</h2>
        <div className="text-purple-200">
          Completed: {completedQuests.length} / {availableQuests.length}
        </div>
      </div>

      {availableQuests.length === 0 ? (
        <div className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl p-12 border-2 border-purple-400/30 backdrop-blur-sm text-center">
          <Scroll className="w-16 h-16 mx-auto mb-4 text-purple-400/50" />
          <h3 className="text-2xl text-white mb-2">No Quests Available</h3>
          <p className="text-purple-200">
            Join a class to access quests created by your teachers!
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableQuests.map((quest) => {
            const isCompleted = completedQuests.includes(quest.id);
            const teacher = teachers.find(t => t.id === quest.teacherId);
            const difficultyColor = getDifficultyColor(quest.difficulty);

            return (
              <div
                key={quest.id}
                className={`bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl p-6 border-2 backdrop-blur-sm transition-all hover:scale-105 ${
                  isCompleted
                    ? 'border-green-400/50 opacity-75'
                    : 'border-purple-400/30 hover:border-purple-400/50'
                }`}
              >
                {isCompleted && (
                  <div className="flex items-center gap-2 text-green-400 mb-3">
                    <CheckCircle className="w-5 h-5" />
                    <span>Completed</span>
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <Scroll className="w-12 h-12 text-amber-400" />
                  <span className={`px-3 py-1 rounded-full text-sm bg-${difficultyColor}-600/30 text-${difficultyColor}-300 border border-${difficultyColor}-400/50`}>
                    {quest.difficulty}
                  </span>
                </div>

                <h3 className="text-xl text-white mb-2">{quest.title}</h3>
                <p className="text-purple-200 mb-4">{quest.description}</p>

                {teacher && (
                  <div className="text-sm text-purple-300 mb-4">
                    By: {teacher.name}
                  </div>
                )}

                <div className="flex items-center gap-4 mb-4 text-sm text-purple-200">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400" />
                    <span>+{quest.xpReward} XP</span>
                  </div>
                  {quest.timeLimit && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span>{Math.floor(quest.timeLimit / 60)}m</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-purple-400" />
                    <span>{quest.questions.length} Qs</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedQuest(quest)}
                  disabled={isCompleted}
                  className={`w-full py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                    isCompleted
                      ? 'bg-slate-700 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 text-white shadow-lg'
                  }`}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Completed
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Start Quest
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {selectedQuest && (
        <QuestModal
          quest={selectedQuest}
          onClose={() => setSelectedQuest(null)}
          onComplete={handleQuestComplete}
        />
      )}
    </div>
  );
}
