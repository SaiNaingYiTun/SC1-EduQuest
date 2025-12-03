import { useState } from "react";
import { RoleSelection } from "./components/RoleSelection";
import {CharacterSelection} from "./components/CharacterSelection";
import { GameDashboard } from "./components/GameDashboard";
import { PixelBattleGame } from "./components/PixelBattleGame";
import { TeacherDashboard } from "./components/TeacherDashboard";
import { Toaster } from "./components/ui/sonner";
import { toast } from  "sonner";
import "./App.css";



// Mock data for quizzes
const mockQuizzes = {
  warrior: [
    {
      id: "math-algebra-1",
      title: "Algebraic Expressions",
      subject: "Mathematics",
      difficulty: "easy",
      duration: "5 min",
      xpReward: 100,
      itemReward: "⚔️ Iron Sword",
      description: "Master the basics of algebraic expressions and equations.",
      questions: [
        {
          id: 1,
          question: "What is 2x + 3x?",
          options: ["5x", "5x²", "6x", "x⁵"],
          correctAnswer: 0,
          explanation: "When adding like terms, you add the coefficients: 2 + 3 = 5, so 2x + 3x = 5x"
        },
        {
          id: 2,
          question: "Solve for x: x + 5 = 12",
          options: ["x = 5", "x = 7", "x = 12", "x = 17"],
          correctAnswer: 1,
          explanation: "Subtract 5 from both sides: x = 12 - 5 = 7"
        },
        {
          id: 3,
          question: "What is 3(x + 2)?",
          options: ["3x + 2", "3x + 6", "x + 6", "3x + 5"],
          correctAnswer: 1,
          explanation: "Distribute 3 to both terms: 3 × x + 3 × 2 = 3x + 6"
        }
      ]
    },
    {
      id: "math-geometry-1",
      title: "Geometry Basics",
      subject: "Mathematics",
      difficulty: "medium",
      duration: "7 min",
      xpReward: 150,
      itemReward: "🛡️ Steel Shield",
      description: "Explore the fundamentals of shapes and angles.",
      questions: [
        {
          id: 1,
          question: "What is the sum of angles in a triangle?",
          options: ["90°", "180°", "270°", "360°"],
          correctAnswer: 1,
          explanation: "The sum of all interior angles in any triangle is always 180°"
        },
        {
          id: 2,
          question: "What is the area of a rectangle with length 5 and width 3?",
          options: ["8", "15", "30", "53"],
          correctAnswer: 1,
          explanation: "Area of rectangle = length × width = 5 × 3 = 15"
        }
      ]
    }
  ],
  mage: [
    {
      id: "science-physics-1",
      title: "Forces and Motion",
      subject: "Physics",
      difficulty: "medium",
      duration: "6 min",
      xpReward: 150,
      itemReward: "🪄 Crystal Wand",
      description: "Understand Newton's laws and basic mechanics.",
      questions: [
        {
          id: 1,
          question: "What is Newton's First Law of Motion?",
          options: [
            "F = ma",
            "An object in motion stays in motion unless acted upon by a force",
            "Energy cannot be created or destroyed",
            "Every action has an opposite reaction"
          ],
          correctAnswer: 1,
          explanation: "Newton's First Law (Law of Inertia) states that objects maintain their state of motion unless acted upon by an external force"
        },
        {
          id: 2,
          question: "If you push an object with 10N of force and it accelerates at 2 m/s², what is its mass?",
          options: ["5 kg", "10 kg", "20 kg", "12 kg"],
          correctAnswer: 0,
          explanation: "Using F = ma, we get m = F/a = 10/2 = 5 kg"
        }
      ]
    }
  ],
  hacker: [
    {
      id: "code-basics-1",
      title: "Programming Fundamentals",
      subject: "Computer Science",
      difficulty: "easy",
      duration: "5 min",
      xpReward: 120,
      itemReward: "💻 Debug Keyboard",
      description: "Learn the basics of programming logic and syntax.",
      questions: [
        {
          id: 1,
          question: "What is a variable?",
          options: [
            "A function that returns data",
            "A container for storing data values",
            "A loop structure",
            "A type of operator"
          ],
          correctAnswer: 1,
          explanation: "A variable is a named container that stores a value in memory that can be used and modified in a program"
        },
        {
          id: 2,
          question: "Which of these is a loop structure?",
          options: ["if-else", "for", "switch", "class"],
          correctAnswer: 1,
          explanation: "A 'for' loop is a control flow statement that allows code to be executed repeatedly"
        }
      ]
    }
  ],
  scholar: [
    {
      id: "history-ancient-1",
      title: "Ancient Civilizations",
      subject: "History",
      difficulty: "easy",
      duration: "6 min",
      xpReward: 110,
      itemReward: "📜 Ancient Scroll",
      description: "Explore the great civilizations of the ancient world.",
      questions: [
        {
          id: 1,
          question: "Which river was central to Ancient Egyptian civilization?",
          options: ["Tigris", "Nile", "Euphrates", "Indus"],
          correctAnswer: 1,
          explanation: "The Nile River was the lifeblood of Ancient Egypt, providing water, transportation, and fertile soil"
        },
        {
          id: 2,
          question: "What was the primary writing system of Ancient Mesopotamia?",
          options: ["Hieroglyphics", "Cuneiform", "Latin", "Sanskrit"],
          correctAnswer: 1,
          explanation: "Cuneiform was one of the earliest writing systems, developed by the ancient Sumerians in Mesopotamia"
        }
      ]
    }
  ],
  artist: [
    {
      id: "art-theory-1",
      title: "Color Theory Basics",
      subject: "Art & Design",
      difficulty: "easy",
      duration: "5 min",
      xpReward: 100,
      itemReward: "🎨 Rainbow Palette",
      description: "Master the fundamentals of color and design.",
      questions: [
        {
          id: 1,
          question: "What are the primary colors?",
          options: [
            "Red, Green, Blue",
            "Red, Yellow, Blue",
            "Orange, Purple, Green",
            "Red, Orange, Yellow"
          ],
          correctAnswer: 1,
          explanation: "In traditional color theory, the primary colors are Red, Yellow, and Blue - they cannot be created by mixing other colors"
        },
        {
          id: 2,
          question: "What color do you get by mixing red and yellow?",
          options: ["Purple", "Green", "Orange", "Brown"],
          correctAnswer: 2,
          explanation: "Red and yellow are primary colors that combine to create the secondary color orange"
        }
      ]
    }
  ]
};

// Mock leaderboard data
const mockLeaderboard = [
  { rank: 1, username: "DragonSlayer", className: "Warrior", level: 15, totalXp: 4500, avatar: "🐉" },
  { rank: 2, username: "MysticMage", className: "Mage", level: 14, totalXp: 4200, avatar: "🔮" },
  { rank: 3, username: "CodeNinja", className: "Hacker", level: 13, totalXp: 3900, avatar: "🥷" },
  { rank: 4, username: "HistoryBuff", className: "Scholar", level: 12, totalXp: 3600, avatar: "📚" },
  { rank: 5, username: "ArtMaster", className: "Artist", level: 11, totalXp: 3300, avatar: "🎨" },
  { rank: 6, username: "MathWizard", className: "Warrior", level: 10, totalXp: 3000, avatar: "🧙" },
  { rank: 7, username: "ScienceGeek", className: "Mage", level: 9, totalXp: 2700, avatar: "🧪" },
  { rank: 8, username: "BugHunter", className: "Hacker", level: 8, totalXp: 2400, avatar: "🐛" }
];

export default function App() {
  const [appState, setAppState] = useState('role');
  const [gameState, setGameState] = useState('selection');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [completedQuests, setCompletedQuests] = useState([]);
  const [customQuizzes, setCustomQuizzes] = useState([]);
  const [inventory, setInventory] = useState([
    {
      id: "starter-weapon",
      name: "Beginner's Tool",
      type: "weapon",
      rarity: "common",
      description: "Your first weapon",
      icon: "🗡️",
      bonus: "+5 Learning Speed"
    }
  ]);

  const handleSelectCharacter = (character) => {
    setSelectedCharacter({
      name: `Hero${Math.floor(Math.random() * 1000)}`,
      className: character.name,
      classId: character.id,
      level: 1,
      xp: 0,
      maxXp: 100,
      hp: character.stats.hp,
      maxHp: character.stats.hp,
      icon: character.icon,
      color: character.color,
      subject: character.subject
    });
    setGameState('dashboard');
    toast.success(`Welcome, ${character.name}! Your adventure begins now.`);
  };

  const handleSelectQuest = (quest) => {
    const classQuizzes = mockQuizzes[selectedCharacter.classId] || [];
    const allQuizzes = [...classQuizzes, ...customQuizzes];
    const quizData = allQuizzes.find(q => q.id === quest.id);
    
    if (quizData) {
      setCurrentQuiz(quizData);
      setGameState('quiz');
    }
  };

  const handleQuizComplete = (score, xpEarned) => {
    // Update character XP
    let newXp = selectedCharacter.xp + xpEarned;
    let newLevel = selectedCharacter.level;
    let newMaxXp = selectedCharacter.maxXp;

    // Level up logic
    while (newXp >= newMaxXp) {
      newXp -= newMaxXp;
      newLevel += 1;
      newMaxXp = Math.floor(newMaxXp * 1.5);
      toast.success(`🎉 Level Up! You are now level ${newLevel}!`);
    }

    setSelectedCharacter({
      ...selectedCharacter,
      xp: newXp,
      level: newLevel,
      maxXp: newMaxXp
    });

    // Mark quest as completed
    if (currentQuiz) {
      setCompletedQuests([...completedQuests, currentQuiz.id]);

      // Add item reward if score >= 70%
      if (score >= 70 && currentQuiz.itemReward) {
        const newItem = {
          id: `item-${Date.now()}`,
          name: currentQuiz.itemReward,
          type: "accessory",
          rarity: "rare",
          description: `Earned from ${currentQuiz.title}`,
          icon: currentQuiz.itemReward.split(' ')[0],
          bonus: `+${Math.floor(xpEarned / 10)} XP Boost`
        };
        setInventory([...inventory, newItem]);
        toast.success(`🎁 New item acquired: ${currentQuiz.itemReward}`);
      }
    }

    toast.success(`Quest completed! +${xpEarned} XP earned!`);
    setGameState('dashboard');
    setCurrentQuiz(null);
  };

  const handleExitQuiz = () => {
    setGameState('dashboard');
    setCurrentQuiz(null);
  };

  const handleRoleSelect = (role) => {
    setAppState(role);
    if (role === 'student') {
      setGameState('selection');
    }
  };

  const handleLogout = () => {
    setAppState('role');
    setGameState('selection');
    setSelectedCharacter(null);
    setCompletedQuests([]);
    setInventory([
      {
        id: "starter-weapon",
        name: "Beginner's Tool",
        type: "weapon",
        rarity: "common",
        description: "Your first weapon",
        icon: "🗡️",
        bonus: "+5 Learning Speed"
      }
    ]);
  };

  const handleCreateQuiz = (quiz) => {
    setCustomQuizzes([...customQuizzes, quiz]);
  };

  const handleDeleteQuiz = (quizId) => {
    setCustomQuizzes(customQuizzes.filter(q => q.id !== quizId));
    toast.success("Quest deleted successfully");
  };

  // Prepare quests for dashboard (including custom quizzes for the character's class)
  const getAvailableQuests = () => {
    if (!selectedCharacter) return [];
    
    const classQuizzes = mockQuizzes[selectedCharacter.classId] || [];
    const customClassQuizzes = customQuizzes.filter(q => q.characterClass === selectedCharacter.classId);
    const allQuizzes = [...classQuizzes, ...customClassQuizzes];
    
    return allQuizzes.map(quiz => ({
      ...quiz,
      completed: completedQuests.includes(quiz.id)
    }));
  };

  // Add current user to leaderboard
  const getLeaderboardWithUser = () => {
    if (!selectedCharacter) return mockLeaderboard;
    
    const userEntry = {
      rank: 0,
      username: selectedCharacter.name,
      className: selectedCharacter.className,
      level: selectedCharacter.level,
      totalXp: (selectedCharacter.level - 1) * 100 + selectedCharacter.xp,
      avatar: "⭐"
    };

    const combined = [...mockLeaderboard, userEntry].sort((a, b) => b.totalXp - a.totalXp);
    return combined.map((entry, index) => ({ ...entry, rank: index + 1 }));
  };

  return (
    <div className="App">
    <>
      {appState === 'role' && (
        <RoleSelection onSelectRole={handleRoleSelect} />
      )}

      {appState === 'teacher' && (
        <TeacherDashboard
          onLogout={handleLogout}
          customQuizzes={customQuizzes}
          onCreateQuiz={handleCreateQuiz}
          onDeleteQuiz={handleDeleteQuiz}
        />
      )}

      {appState === 'student' && (
        <>
          {gameState === 'selection' && (
            <CharacterSelection onSelectCharacter={handleSelectCharacter} />
          )}

          {gameState === 'dashboard' && selectedCharacter && (
            <GameDashboard
              character={selectedCharacter}
              quests={getAvailableQuests()}
              inventory={inventory}
              leaderboard={getLeaderboardWithUser()}
              onSelectQuest={handleSelectQuest}
              onLogout={handleLogout}
            />
          )}

          {gameState === 'quiz' && currentQuiz && selectedCharacter && (
            <PixelBattleGame
              quiz={currentQuiz}
              characterClass={selectedCharacter.classId}
              onComplete={handleQuizComplete}
              onExit={handleExitQuiz}
            />
          )}
        </>
      )}

      <Toaster />
    </>
    </div>
  );
}
