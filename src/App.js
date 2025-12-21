import { useState, useEffect } from 'react';
import RoleSelection from './components/RoleSelection';
import AuthPage from './components/AuthPage';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import CharacterSelection from './components/CharacterSelection';
import GamePage from './components/GamePage';

function App() {
  const [currentView, setCurrentView] = useState('role');
  const [selectedRole, setSelectedRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedQuest, setSelectedQuest] = useState(null);
  

  const [characters, setCharacters] = useState({});
  const [studentClasses, setStudentClasses] = useState({});
  const [achievements, setAchievements] = useState({});
  const [quests, setQuests] = useState([]);
  const [studentInventories, setStudentInventories] = useState({});
  const [studentProgress, setStudentProgress] = useState({});
  const [studentLevels, setStudentLevels] = useState({});
  const [authToken, setAuthToken] = useState(() => {
  return localStorage.getItem('authToken') || null;
});

  // -----------------------
  // Backend helpers
  // -----------------------
 


  const saveStudentState = async (
    studentId,
    achievementList,
    inventoryList,
    progressObj,
    levelInfo
  ) => {
    try {
      await fetch(`/api/students/${studentId}/state`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          achievements: achievementList,
          inventory: inventoryList,
          progress: progressObj,
          level: levelInfo.level,
          xp: levelInfo.xp
        })
      });
    } catch (err) {
      console.error('Error saving student state:', err);
    }
  };

  const fetchStudentState = async (studentId) => {
    try {
      const res = await fetch(`/api/students/${studentId}/state`);
      const data = await res.json();

      const backendAchievements = Array.isArray(data.achievements)
        ? data.achievements
        : [];
      const backendInventory = Array.isArray(data.inventory)
        ? data.inventory
        : [];

      const backendProgress =
        data.progress && typeof data.progress === 'object'
          ? data.progress
          : {};

      const level = typeof data.level === 'number' ? data.level : 1;
      const xp = typeof data.xp === 'number' ? data.xp : 0;

      let finalAchievements = backendAchievements;

      // If no achievements saved yet in backend, init with defaults
      if (backendAchievements.length === 0) {
        finalAchievements = getDefaultAchievements();
        await saveStudentState(
          studentId,
          finalAchievements,
          backendInventory,
          backendProgress,
          { level, xp }
        );
      }

      if (data.character) {
      setCharacters((prev) => ({
        ...prev,
        [data.character.id]: data.character
      }));
      }

      setAchievements((prev) => ({
        ...prev,
        [studentId]: finalAchievements
      }));

      setStudentInventories((prev) => ({
        ...prev,
        [studentId]: backendInventory
      }));

      setStudentProgress((prev) => ({
        ...prev,
        [studentId]: backendProgress
      }));

      setStudentLevels((prev) => ({
        ...prev,
        [studentId]: { level, xp }
      }));

      setStudentClasses((prev) => ({
        ...prev,
        [studentId]: data.studentClasses || []
      }));
      
      

    } catch (err) {
      console.error('Error loading student state:', err);
    }
  };

  const handleUpdateProgress = async (studentId, questId, score, xpGainedOverride) => {
    try {
      const res = await fetch(`/api/students/${studentId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questId,
          score,
          xpGained: xpGainedOverride
        })
      });

      if (!res.ok) {
        throw new Error('Failed to update progress');
      }

      const data = await res.json();

      const updatedProgress =
        data.progress && typeof data.progress === 'object'
          ? data.progress
          : {};

      setStudentProgress((prev) => ({
        ...prev,
        [studentId]: updatedProgress
      }));

      setStudentLevels((prev) => ({
        ...prev,
        [studentId]: {
          level: data.level ?? 1,
          xp: data.xp ?? 0
        }
      }));
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  };

  // -----------------------
  // Initial load
  // -----------------------

  useEffect(() => {
  if (!authToken) return;
 
  const fetchAllUsers = async () => {
    try {
      const res = await authFetch('/api/users');
      if (!res.ok) return;
 
      const data = await res.json();
      const normalized = data.map((u) => ({
        ...u,
        id: u.id || u._id
      }));
 
      setAllUsers(normalized);
    } catch (err) {
      console.error("Error loading users:", err);
    }
  };
 
  fetchAllUsers();
}, [authToken]);

  useEffect(() => {
    // Load from localStorage
    const savedUser = localStorage.getItem('currentUser');
    const savedView = localStorage.getItem('currentView');
    const savedUsers = localStorage.getItem('allUsers');
    const savedCharacters = localStorage.getItem('characters');
    
    const savedAchievements = localStorage.getItem('achievements');
    const savedStudentInventories = localStorage.getItem('studentInventories');

    if (savedUser) {
    const user = JSON.parse(savedUser);
    setCurrentUser(user);

    // Fetch student state from backend if student
    if (user.role === 'student') {
      fetchStudentState(user.id);
    }
  }
    if (savedCharacters) {
      setCharacters(JSON.parse(savedCharacters));
    }
    
    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements));
    }

    // Always load quests from backend API (backend is source of truth)
    fetch('/api/quests')
      .then((res) => res.json())
      .then((data) => {
        setQuests(data);
      })
      .catch((err) => {
        console.error('Error loading quests from backend:', err);
      });

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

      // On reload, sync student state from backend too
      if (user.role === 'student') {
        fetchStudentState(user.id);
      }
    }

    
 

  }, []);

  // -----------------------
  // Persist some state locally
  // -----------------------

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
    localStorage.setItem('studentInventories', JSON.stringify(studentInventories));
  }, [currentUser, currentView, allUsers, characters, studentClasses, achievements, studentInventories]);

  // -----------------------
  // Auth & user handling
  // -----------------------

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setCurrentView('auth');
  };

  const authFetch = (url, options = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      // only add Content-Type if not provided (for GET it’s not needed)
      ...(options.method && options.method !== 'GET'
        ? { 'Content-Type': 'application/json' }
        : {})
    }
  });
};

//   const handleAuth = async (username, password, isSignUp, email, subjects) => {
//   try {
//     if (isSignUp) {
//       // === SIGN UP ===
//       const res = await fetch('/api/auth/register', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           username,
//           email,
//           password,
//           role: selectedRole,
//           name: username
//         })
//       });
 
//       if (!res.ok) {
//         const errData = await res.json().catch(() => ({}));
//         alert(errData.message || 'Failed to register');
//         return;
//       }
 
//       const data = await res.json(); // { user, token }
 
//       // normalise so we always have user.id
//       const backendUser = data.user;
//       const normalizedUser = {
//         ...backendUser,
//         id: backendUser.id || backendUser._id
//       };
 
//       setCurrentUser(normalizedUser);
//       setAuthToken(data.token);
//       localStorage.setItem('authToken', data.token);
 
//       // keep local allUsers if other parts of app still rely on it
//       setAllUsers((prev) => [...prev, normalizedUser]);
 
//       if (selectedRole === 'student') {
//         // set up local defaults for achievements/progress/inventory/level
//         const defaultAchievements = getDefaultAchievements();
//         const initialInventory = [];
//         const initialProgress = {};
//         const initialLevel = { level: 1, xp: 0 };
 
//         setAchievements((prev) => ({
//           ...prev,
//           [normalizedUser.id]: defaultAchievements
//         }));
 
//         setStudentInventories((prev) => ({
//           ...prev,
//           [normalizedUser.id]: initialInventory
//         }));
 
//         setStudentProgress((prev) => ({
//           ...prev,
//           [normalizedUser.id]: initialProgress
//         }));
 
//         setStudentLevels((prev) => ({
//           ...prev,
//           [normalizedUser.id]: initialLevel
//         }));
 
//         // initialise student state in backend with same defaults
//         await saveStudentState(
//           normalizedUser.id,
//           defaultAchievements,
//           initialInventory,
//           initialProgress,
//           initialLevel
//         );
 
//         setCurrentView('character');
//       } else {
//         // teacher goes straight to dashboard
//         setCurrentView('dashboard');
//       }
//     } else {
//       // === SIGN IN ===
//       const res = await fetch('/api/auth/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           usernameOrEmail: username,
//           password,
//           role: selectedRole
//         })
//       });
 
//       if (!res.ok) {
//         const errData = await res.json().catch(() => ({}));
//         alert(errData.message || 'Failed to login');
//         return;
//       }
 
//       const data = await res.json(); // { user, token }
 
//       const backendUser = data.user;
//       const normalizedUser = {
//         ...backendUser,
//         id: backendUser.id || backendUser._id
//       };
 
//       setCurrentUser(normalizedUser);
//       setAuthToken(data.token);
//       localStorage.setItem('authToken', data.token);
 
//       // keep local list if you still use allUsers for UI (classes, etc.)
//       setAllUsers((prev) => {
//         const exists = prev.some((u) => u.id === normalizedUser.id);
//         return exists ? prev : [...prev, normalizedUser];
//       });
 
//       // for students, load state from backend (achievements, inventory, progress, level)
//       if (normalizedUser.role === 'student') {
//         await fetchStudentState(normalizedUser.id);
//       }
 
//       if (normalizedUser.role === 'student' && !normalizedUser.characterId) {
//         setCurrentView('character');
//       } else {
//         setCurrentView('dashboard');
//       }
//     }
//   } catch (err) {
//     console.error('Auth error:', err);
//     alert('Something went wrong. Please try again.');
//   }
// };


  const handleAuth = async (username, password, isSignUp, email, role) => {
    try {
      if (isSignUp) {
      // === SIGN UP ===
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
          username,
          email,
          password,
          role: role || selectedRole,
          name: username
        })
      });
  

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      alert(errData.message || (isSignUp ? 'Failed to register' : 'Failed to login'));
      return;
    }

    const data = await res.json(); // { user, token }

    // normalise so we always have user.id
    const backendUser = data.user;
    const normalizedUser = {
      ...backendUser,
      id: backendUser.id || backendUser._id
    };

    setCurrentUser(normalizedUser);
    setAuthToken(data.token);
    localStorage.setItem('authToken', data.token);

    // keep local allUsers if other parts of app still rely on it
    setAllUsers((prev) => [...prev, normalizedUser]);

    if ((role || selectedRole) === 'student') {
      // set up local defaults for achievements/progress/inventory/level
      const defaultAchievements = getDefaultAchievements();
      const initialInventory = [];
      const initialProgress = {};
      const initialLevel = { level: 1, xp: 0 };

      setAchievements((prev) => ({
        ...prev,
        [normalizedUser.id]: defaultAchievements
      }));

      setStudentInventories((prev) => ({
        ...prev,
        [normalizedUser.id]: initialInventory
      }));

      setStudentProgress((prev) => ({
        ...prev,
        [normalizedUser.id]: initialProgress
      }));

      setStudentLevels((prev) => ({
        ...prev,
        [normalizedUser.id]: initialLevel
      }));

      // initialise student state in backend with same defaults
      await saveStudentState(
        normalizedUser.id,
        defaultAchievements,
        initialInventory,
        initialProgress,
        initialLevel
      );

      setCurrentView('character');
    } else {
      // teacher goes straight to dashboard
      setCurrentView('dashboard');
    }
  } else {
    // === SIGN IN ===
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usernameOrEmail: username,
        password,
        role: role || selectedRole
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      alert(errData.message || 'Failed to login');
      return;
    }

    const data = await res.json(); // { user, token }

    const backendUser = data.user;
    const normalizedUser = {
      ...backendUser,
      id: backendUser.id || backendUser._id
    };

    setCurrentUser(normalizedUser);
    setAuthToken(data.token);
    localStorage.setItem('authToken', data.token);

    // keep local list if you still use allUsers for UI (classes, etc.)
    setAllUsers((prev) => {
      const exists = prev.some((u) => u.id === normalizedUser.id);
      return exists ? prev : [...prev, normalizedUser];
    });

    // for students, load state from backend (achievements, inventory, progress, level)
    if (normalizedUser.role === 'student') {
      await fetchStudentState(normalizedUser.id);
    }

    if (normalizedUser.role === 'student' && !normalizedUser.characterId) {
      setCurrentView('character');
    } else {
      setCurrentView('dashboard');
    }
  }
    } catch (err) {
    console.error('Auth error:', err);
    alert('Something went wrong. Please try again.');
  }
};

  const handleCharacterCreation = async (character) => {
    if (!currentUser) return;

    

    const updatedUser = {
      ...currentUser,
      characterId: character.id
    };

    setCharacters((prev) => ({
      ...prev,
      [character.id]: character
    }));

    setCurrentUser(updatedUser);
    setAllUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));

    try {
    // Save characterId in backend User document
    await authFetch(`/api/users/${currentUser.id}/character`, {
      method: 'PUT',
      body: JSON.stringify({ characterId: character.id })
    });

    // Save full character object in student state
    await fetch(`/api/students/${currentUser.id}/state`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ character })
    });
  } catch (err) {
    console.error('Error updating character:', err);
  }


    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedRole(null);
    setCurrentView('role');
    setAuthToken(null);
    localStorage.removeItem('authToken');
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
    setAllUsers(allUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
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

    const teacher = allUsers.find((u) => u.username === teacherUsername && u.role === 'teacher');
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

  const handleUnlockAchievement = async (achievementId) => {
    if (!currentUser) return;

    const userId = currentUser.id;
    const userAchievements = achievements[userId] || [];

    const updatedAchievements = userAchievements.map((a) =>
      a.id === achievementId && !a.unlocked
        ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() }
        : a
    );

    const inventory = studentInventories[userId] || [];
    const progressObj = studentProgress[userId] || {};
    const levelInfo = studentLevels[userId] || { level: 1, xp: 0 };

    setAchievements({
      ...achievements,
      [userId]: updatedAchievements
    });

    await saveStudentState(
      userId,
      updatedAchievements,
      inventory,
      progressObj,
      levelInfo
    );
  };

  const handleCreateQuest = async (newQuest) => {
    try {
      const response = await authFetch('/api/quests', {
        method: 'POST',
        //headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuest)
      });

      if (!response.ok) {
        throw new Error('Failed to create quest');
      }

      const createdQuest = await response.json();

      setQuests((prev) => [...prev, createdQuest]);
    } catch (error) {
      console.error('Error creating quest:', error);
    }
  };

  const handleUpdateQuest = async (updatedQuest) => {
    try {
      const response = await authFetch(`/api/quests/${updatedQuest.id}`, {
        method: 'PUT',
       // headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedQuest)
      });

      if (!response.ok) {
        throw new Error('Failed to update quest');
      }

      const savedQuest = await response.json();

      setQuests((prev) =>
        prev.map((quest) => (quest.id === savedQuest.id ? savedQuest : quest))
      );
    } catch (error) {
      console.error('Error updating quest:', error);
    }
  };

  const handleDeleteQuest = async (questId) => {
    try {
      const response = await authFetch(`/api/quests/${questId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete quest');
      }

      setQuests((prev) => prev.filter((quest) => quest.id !== questId));
    } catch (error) {
      console.error('Error deleting quest:', error);
    }
  };

  const handleStartQuest = (quest) => {
    setSelectedQuest(quest);
    setCurrentView('game');
  };
  const handleQuestComplete = (questId, score, totalQuestions, timeLeft, itemsEarned) => {
    if (!currentUser || !currentUser.characterId) return;

    const quest = quests.find(q => q.id === questId);
    if (!quest) return;

    const character = characters[currentUser.characterId];
    if (!character) return;

    const percentage = (score / totalQuestions) * 100;
    const xpEarned = Math.floor((quest.xpReward * score) / totalQuestions);

    // Update character
    const newXp = character.xp + xpEarned;
    const newLevel = Math.floor(newXp / 100) + 1;
    const leveledUp = newLevel > character.level;

    handleUpdateCharacter(character.id, {
      xp: newXp,
      level: newLevel,
      maxXp: newLevel * 100
    });

    // Add earned items to inventory
    itemsEarned.forEach(item => {
      handleAddItemToInventory(currentUser.id, item);
    });

    // Check for achievements
    handleUnlockAchievement('first_quest');
    if (percentage === 100) {
      handleUnlockAchievement('perfect_score');
    }
    if (quest.timeLimit && timeLeft > quest.timeLimit * 0.5) {
      handleUnlockAchievement('speed_demon');
    }
    if (newLevel >= 5) {
      handleUnlockAchievement('level_5');
    }
    if (newLevel >= 10) {
      handleUnlockAchievement('level_10');
    }

    // Return to dashboard
    setCurrentView('dashboard');
    setSelectedQuest(null);

    // Show results
    let itemsText = '';
    if (itemsEarned.length > 0) {
      itemsText = `\n\nItems Earned:\n${itemsEarned.map(item => `${item.icon} ${item.name}`).join('\n')}`;
    }

    setTimeout(() => {
      alert(
        `Quest Complete!\n\nScore: ${score}/${totalQuestions} (${percentage.toFixed(0)}%)\nXP Earned: +${xpEarned}${leveledUp ? `\n\n🎉 Level Up! You are now level ${newLevel}!` : ''}${itemsText}`
      );
    }, 100);
  };

  const handleAddItemToInventory = async (studentId, item) => {
    const newInventory = [...(studentInventories[studentId] || []), item];

    const achievementList =
      achievements[studentId] || getDefaultAchievements();
    const progressObj = studentProgress[studentId] || {};
    const levelInfo = studentLevels[studentId] || { level: 1, xp: 0 };

    setStudentInventories({
      ...studentInventories,
      [studentId]: newInventory
    });

    await saveStudentState(
      studentId,
      achievementList,
      newInventory,
      progressObj,
      levelInfo
    );
  };

  // -----------------------
  // Helpers
  // -----------------------

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

  // -----------------------
  // Render
  // -----------------------

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      {currentView === 'role' && (
        <RoleSelection onSelectRole={handleRoleSelect} />
      )}

      {currentView === 'auth' && selectedRole && (
        <AuthPage
          role={selectedRole}
          onAuth={handleAuth}
          onBack={() => setCurrentView('role')}
        />
      )}

      {currentView === 'character' &&
        currentUser &&
        currentUser.role === 'student' && (
          <CharacterSelection
            onCharacterCreated={handleCharacterCreation}
            userId={currentUser.id}
          />
        )}

      {currentView === 'dashboard' &&
        currentUser &&
        currentUser.role === 'student' && (
          <StudentDashboard
            user={currentUser}
            character={
              currentUser.characterId
                ? characters[currentUser.characterId]
                : undefined
            }
            onLogout={handleLogout}
            onUpdateUser={handleUpdateUser}
            onUpdateCharacter={handleUpdateCharacter}
            onJoinClass={handleJoinClass}
            studentClasses={studentClasses[currentUser.id] || []}
            teachers={allUsers.filter((u) => u.role === 'teacher')}
            achievements={achievements[currentUser.id] || []}
            onUnlockAchievement={handleUnlockAchievement}
            quests={quests}
            inventory={studentInventories[currentUser.id] || []}
            progress={studentProgress[currentUser.id] || {}}
            levelInfo={studentLevels[currentUser.id] || { level: 1, xp: 0 }}
            onUpdateProgress={handleUpdateProgress}
            onStartQuest={handleStartQuest}
          />
        )}

      {currentView === 'dashboard' &&
        currentUser &&
        currentUser.role === 'teacher' && (
          <TeacherDashboard
            user={currentUser}
            onLogout={handleLogout}
            onUpdateUser={handleUpdateUser}
            students={allUsers.filter(
              (u) =>
                u.role === 'student' &&
                (studentClasses[u.id] || []).includes(currentUser.id)
            )}
            allStudents={allUsers.filter((u) => u.role === 'student')}
            characters={characters}
            studentClasses={studentClasses}
            onInviteStudent={async (studentId) => {
              const updatedClasses = [
                ...(studentClasses[studentId] || []),
                currentUser.id
              ];
              setStudentClasses({
                ...studentClasses,
                [studentId]: updatedClasses
              });

              try {
                const res = await fetch(`/api/students/${studentId}/state`);
                const existing = await res.json();
 
              // 2️⃣ save merged state (prevents wiping)
              await fetch(`/api/students/${studentId}/state`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                achievements: existing.achievements || [],
                inventory: existing.inventory || [],
                progress: existing.progress || {},
                level: existing.level ?? 1,
                xp: existing.xp ?? 0,
                studentClasses: updatedClasses})
                });
              } catch (err) {
                console.error('Error saving student classes:', err);
              }
            }}
            onCreateQuest={handleCreateQuest}
            onUpdateQuest={handleUpdateQuest}
            onDeleteQuest={handleDeleteQuest}
            onAddItemToInventory={handleAddItemToInventory}
            quests={quests}
            authFetch={authFetch}
          />
        )}
        {currentView === 'game' && selectedQuest && currentUser && currentUser.characterId && (
        <GamePage
          quest={selectedQuest}
          character={characters[currentUser.characterId]}
          onQuestComplete={handleQuestComplete}
          onBack={() => {
            setCurrentView('dashboard');
            setSelectedQuest(null);
          }}
        />
      )}
    </div>
  );
}

export default App;