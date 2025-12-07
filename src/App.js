import { useState, useEffect } from 'react';
import RoleSelection from './components/RoleSelection';
import AuthPage from './components/AuthPage';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import CharacterSelection from './components/CharacterSelection';



function App() {
  const [currentView, setCurrentView] = useState('role');
  const [selectedRole, setSelectedRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([
    {
      id: 'teacher1',
      username: 'prof_merlin',
      role: 'teacher',
      name: 'Professor Merlin',
      subjectName: 'Advanced Mathematics',
      otpCode: 'MATH2024'
    }
  ]);

  const [characters, setCharacters] = useState({});
  const [studentClasses, setStudentClasses] = useState({});
  const [achievements, setAchievements] = useState({});
  const [quests, setQuests] = useState([
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
          correctAnswer: 1,
          explanation: 'To solve 2x + 5 = 13, subtract 5 from both sides to get 2x = 8, then divide by 2 to get x = 4.'
        },
        {
          id: 'q2',
          question: 'What is 3x - 7 = 8?',
          options: ['x = 3', 'x = 5', 'x = 7', 'x = 9'],
          correctAnswer: 1,
          explanation: 'Add 7 to both sides: 3x = 15, then divide by 3 to get x = 5.'
        },
        {
          id: 'q3',
          question: 'Solve: 4x + 2 = 18',
          options: ['x = 2', 'x = 4', 'x = 6', 'x = 8'],
          correctAnswer: 1,
          explanation: 'Subtract 2 from both sides: 4x = 16, then divide by 4 to get x = 4.'
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
  ]);
  const [studentInventories, setStudentInventories] = useState({});

  useEffect(() => {
    // Load from localStorage
    const savedUser = localStorage.getItem('currentUser');
    const savedView = localStorage.getItem('currentView');
    const savedUsers = localStorage.getItem('allUsers');
    const savedCharacters = localStorage.getItem('characters');
    const savedStudentClasses = localStorage.getItem('studentClasses');
    const savedAchievements = localStorage.getItem('achievements');
    const savedQuests = localStorage.getItem('quests');
    const savedStudentInventories = localStorage.getItem('studentInventories');

    if (savedUsers) {
      setAllUsers(JSON.parse(savedUsers));
    }
    if (savedCharacters) {
      setCharacters(JSON.parse(savedCharacters));
    }
    if (savedStudentClasses) {
      setStudentClasses(JSON.parse(savedStudentClasses));
    }
    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements));
    }
    if (savedQuests) {
      setQuests(JSON.parse(savedQuests));
    }
    if (savedStudentInventories) {
      setStudentInventories(JSON.parse(savedStudentInventories));
    }
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setSelectedRole(user.role);
      if (savedView) {
        setCurrentView(savedView);
      } else {
        // Determine view based on user state
        if (user.role === 'student' && !user.characterId) {
          setCurrentView('character');
        } else {
          setCurrentView('dashboard');
        }
      }
    }
  }, []);

  useEffect(() => {
    // Save to localStorage
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      localStorage.setItem('currentView', currentView);
    }
    localStorage.setItem('allUsers', JSON.stringify(allUsers));
    localStorage.setItem('characters', JSON.stringify(characters));
    localStorage.setItem('studentClasses', JSON.stringify(studentClasses));
    localStorage.setItem('achievements', JSON.stringify(achievements));
    localStorage.setItem('quests', JSON.stringify(quests));
    localStorage.setItem('studentInventories', JSON.stringify(studentInventories));
  }, [currentUser, currentView, allUsers, characters, studentClasses, achievements, quests, studentInventories]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setCurrentView('auth');
  };

  const handleAuth = (username, password, isSignUp) => {
    if (isSignUp) {
      // Sign up
      const existingUser = allUsers.find(u => u.username === username);
      if (existingUser) {
        alert('Username already exists!');
        return;
      }

      const newUser = {
        id: `${selectedRole}_${Date.now()}`,
        username,
        role: selectedRole,
        name: username,
      };

      if (selectedRole === 'teacher') {
        newUser.subjectName = 'My Subject';
        newUser.otpCode = generateOTP();
      }

      setAllUsers([...allUsers, newUser]);
      setCurrentUser(newUser);

      if (selectedRole === 'student') {
        // Initialize achievements for new student
        setAchievements({
          ...achievements,
          [newUser.id]: getDefaultAchievements()
        });
        setCurrentView('character');
      } else {
        setCurrentView('dashboard');
      }
    } else {
      // Sign in
      const user = allUsers.find(u => u.username === username && u.role === selectedRole);
      if (!user) {
        alert('Invalid username or password!');
        return;
      }

      setCurrentUser(user);

      if (user.role === 'student' && !user.characterId) {
        setCurrentView('character');
      } else {
        setCurrentView('dashboard');
      }
    }
  };

  const handleCharacterCreation = (character) => {
    if (!currentUser) return;

    const updatedUser = {
      ...currentUser,
      characterId: character.id
    };

    setCharacters({
      ...characters,
      [character.id]: character
    });

    setCurrentUser(updatedUser);
    setAllUsers(allUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedRole(null);
    setCurrentView('role');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentView');
  };

  const handleUpdateUser = (updates) => {
    if (!currentUser) return;

    const updatedUser = {
      ...currentUser,
      ...updates
    };

    setCurrentUser(updatedUser);
    setAllUsers(allUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const handleUpdateCharacter = (characterId, updates) => {
    setCharacters({
      ...characters,
      [characterId]: {
        ...characters[characterId],
        ...updates
      }
    });
  };

  const handleJoinClass = (teacherUsername, otp) => {
    if (!currentUser || currentUser.role !== 'student') return;

    const teacher = allUsers.find(u => u.username === teacherUsername && u.role === 'teacher');
    if (!teacher) {
      alert('Teacher not found!');
      return false;
    }

    if (teacher.otpCode !== otp) {
      alert('Invalid OTP code!');
      return false;
    }

    const currentClasses = studentClasses[currentUser.id] || [];
    if (currentClasses.includes(teacher.id)) {
      alert('You are already in this class!');
      return false;
    }

    setStudentClasses({
      ...studentClasses,
      [currentUser.id]: [...currentClasses, teacher.id]
    });

    return true;
  };

  const handleUnlockAchievement = (achievementId) => {
    if (!currentUser) return;

    const userAchievements = achievements[currentUser.id] || []
    setAchievements({
      ...achievements,
      [currentUser.id]: userAchievements.map(a => 
        a.id === achievementId && !a.unlocked
          ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() }
          : a
      )
    });
  };

  const handleCreateQuest = (quest) => {
    setQuests([...quests, quest]);
  };

  const handleUpdateQuest = (questId, updates) => {
    setQuests(quests.map(q => q.id === questId ? { ...q, ...updates } : q));
  };

  const handleDeleteQuest = (questId) => {
    setQuests(quests.filter(q => q.id !== questId));
  };

  const handleAddItemToInventory = (studentId, item) => {
    setStudentInventories({
      ...studentInventories,
      [studentId]: [...(studentInventories[studentId] || []), item]
    });
  };

  const generateOTP = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let otp = '';
    for (let i = 0; i < 8; i++) {
      otp += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return otp;
  };

  const getDefaultAchievements = () => [
    {
      id: 'first_quest',
      title: 'First Steps',
      description: 'Complete your first quest',
      icon: '🎯',
      unlocked: false
    },
    {
      id: 'level_5',
      title: 'Apprentice Scholar',
      description: 'Reach level 5',
      icon: '📚',
      unlocked: false
    },
    {
      id: 'level_10',
      title: 'Expert Adventurer',
      description: 'Reach level 10',
      icon: '⚔️',
      unlocked: false
    },
    {
      id: 'perfect_score',
      title: 'Perfectionist',
      description: 'Get a perfect score on a quest',
      icon: '💯',
      unlocked: false
    },
    {
      id: 'speed_demon',
      title: 'Speed Demon',
      description: 'Complete a timed quest with 50% time remaining',
      icon: '⚡',
      unlocked: false
    },
    {
      id: 'class_joiner',
      title: 'Class Joined',
      description: 'Join your first class',
      icon: '🏫',
      unlocked: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      {currentView === 'role' && (
        <RoleSelection onSelectRole={handleRoleSelect} />
      )}
      
      {currentView === 'auth' && selectedRole && (
        <AuthPage role={selectedRole} onAuth={handleAuth} onBack={() => setCurrentView('role')} />
      )}
      
      {currentView === 'character' && currentUser && currentUser.role === 'student' && (
        <CharacterSelection onCharacterCreated={handleCharacterCreation} userId={currentUser.id} />
      )}
      
      {currentView === 'dashboard' && currentUser && currentUser.role === 'student' && (
        <StudentDashboard
          user={currentUser}
          character={currentUser.characterId ? characters[currentUser.characterId] : undefined}
          onLogout={handleLogout}
          onUpdateUser={handleUpdateUser}
          onUpdateCharacter={handleUpdateCharacter}
          onJoinClass={handleJoinClass}
          studentClasses={studentClasses[currentUser.id] || []}
          teachers={allUsers.filter(u => u.role === 'teacher')}
          achievements={achievements[currentUser.id] || []}
          onUnlockAchievement={handleUnlockAchievement}
          quests={quests}
          inventory={studentInventories[currentUser.id] || []}
        />
      )}
      
      {currentView === 'dashboard' && currentUser && currentUser.role === 'teacher' && (
        <TeacherDashboard
          user={currentUser}
          onLogout={handleLogout}
          onUpdateUser={handleUpdateUser}
          students={allUsers.filter(u => 
            u.role === 'student' && 
            (studentClasses[u.id] || []).includes(currentUser.id)
          )}
          allStudents={allUsers.filter(u => u.role === 'student')}
          characters={characters}
          studentClasses={studentClasses}
          onInviteStudent={(studentId) => {
            setStudentClasses({
              ...studentClasses,
              [studentId]: [...(studentClasses[studentId] || []), currentUser.id]
            });
          }}
          onCreateQuest={handleCreateQuest}
          onUpdateQuest={handleUpdateQuest}
          onDeleteQuest={handleDeleteQuest}
          onAddItemToInventory={handleAddItemToInventory}
          quests={quests}
        />
      )}
    </div>
  );
}

export default App;