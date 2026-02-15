import { useState, useEffect } from 'react';
import { Scroll, Clock, Star, Trophy, Play, CheckCircle } from 'lucide-react';
import { Character, Quest, User, Item } from '../App';

const MOCK_QUESTS = [
  {
    id: 'mock-quest-1',
    title: 'Dungeon of Trials',
    description: 'Practice quiz in a spooky medieval dungeon.',
    difficulty: 'Easy',
    xpReward: 50,
    timeLimit: 180, // seconds
    teacherId: 'mock-teacher-1',
    questions: [
      {
        id: 'q1',
        question: 'Which metal is most often used to forge medieval swords?',
        options: ['Gold', 'Iron', 'Silver', 'Copper'],
        correctAnswer: 1
      },
      {
        id: 'q2',
        question: 'What is the main purpose of a castle moat?',
        options: ['Decoration', 'Waste disposal', 'Defense', 'Farming'],
        correctAnswer: 2
      },
      {
        id: 'q3',
        question: 'Which job would a medieval alchemist likely try to do?',
        options: [
          'Turn lead into gold',
          'Command armies',
          'Collect taxes',
          'Write laws'
        ],
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
  onUnlockAchievement,
  quests,
  inventory,
  onStartQuest
}) {
  
  const [completedQuests, setCompletedQuests] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem(`completed_quests_${character.id}`);
    if (saved) {
      setCompletedQuests(JSON.parse(saved));
    }
  }, [character.id]);

  const handleQuestComplete = (questId, score, totalQuestions, timeLeft, itemsEarned) => {
    // const quest = quests.find(q => q.id === questId);
    // if (!quest) return;

    // Use both real quests and mock quests
    const allQuests = [...MOCK_QUESTS, ...(quests || [])];
    const quest = allQuests.find(q => q.id === questId);
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

    // Show results
    let itemsText = '';
    if (itemsEarned.length > 0) {
      itemsText = `\n\nItems Earned:\n${itemsEarned.map(item => `${item.icon} ${item.name}`).join('\n')}`;
    }

    alert(
      `Quest Complete!\\n\\nScore: ${score}/${totalQuestions} (${percentage.toFixed(0)}%)\\nXP Earned: +${xpEarned}${leveledUp ? `\\n\\n🎉 Level Up! You are now level ${newLevel}!` : ''}${itemsText}`
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

  const hasRealQuests = Array.isArray(quests) && quests.length > 0;

  // Always include mock quests; add real quests if present
  const sourceQuests = [
    ...MOCK_QUESTS,
    ...(hasRealQuests ? quests : [])
  ];

  // Only filter real quests by class; mock quests are always visible
  const availableQuests = sourceQuests.filter((quest) => {
    if (quest.teacherId?.startsWith('mock')) return true;      // keep mock
    if (!hasRealQuests) return true;                           // only mock
    return studentClasses.includes(quest.teacherId);           // real quests
  });

  // const sourceQuests = quests && quests.length > 0 ? quests : MOCK_QUESTS;

  // const availableQuests =
  //   quests && quests.length > 0
  //     ? sourceQuests.filter((quest) => studentClasses.includes(quest.teacherId))
  //     : sourceQuests;

  // Filter quests based on student's classes
  // const availableQuests = quests.filter(quest => 
  //   studentClasses.includes(quest.teacherId)
  // );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl text-amber-400 font-pixel">Available Quests</h2>
        <div className="text-purple-200 font-pixel">
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
                  <span className={`px-3 py-1 rounded-full text-sm bg-${difficultyColor}-600/30 text-${difficultyColor}-300 border border-${difficultyColor}-400/50 font-pixel`}>
                    {quest.difficulty}
                  </span>
                </div>

                <h3 className="text-xl text-white mb-2 font-pixel">{quest.title}</h3>
                <p className="text-purple-200 mb-4 font-pixel">{quest.description}</p>

                {teacher || quest.teacherId?.startsWith('mock') ? (
                  <div className="text-sm text-purple-300 mb-4 font-pixel">
                    By: {teacher ? teacher.name : 'Demo Dungeon Master'}
                  </div>
                ) : null}

                {/* {teacher && (
                  <div className="text-sm text-purple-300 mb-4">
                    By: {teacher.name}
                  </div>
                )} */}

                <div className="flex items-center gap-4 mb-4 text-sm text-purple-200 font-pixel">
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
                  onClick={() => onStartQuest && onStartQuest(quest)}
                  disabled={isCompleted}
                  className={`w-full py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                    isCompleted
                      ? 'bg-slate-700 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 text-white shadow-lg'
                  }`}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle className="w-5 h-5 font-pixel" />
                      Completed
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 font-pixel" />
                      Start Quest
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}