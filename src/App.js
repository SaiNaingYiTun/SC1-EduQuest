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

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedView = localStorage.getItem('currentView');
    const savedUsers = localStorage.getItem('allUsers');
    const savedCharacters = localStorage.getItem('characters');
    const savedStudentClasses = localStorage.getItem('studentClasses');
    const savedAchievements = localStorage.getItem('achievements');

    if (savedUsers) setAllUsers(JSON.parse(savedUsers));
    if (savedCharacters) setCharacters(JSON.parse(savedCharacters));
    if (savedStudentClasses) setStudentClasses(JSON.parse(savedStudentClasses));
    if (savedAchievements) setAchievements(JSON.parse(savedAchievements));

    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setSelectedRole(user.role);

      if (savedView) {
        setCurrentView(savedView);
      } else {
        if (user.role === 'student' && !user.characterId) {
          setCurrentView('character');
        } else {
          setCurrentView('dashboard');
        }
      }
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      localStorage.setItem('currentView', currentView);
    }

    localStorage.setItem('allUsers', JSON.stringify(allUsers));
    localStorage.setItem('characters', JSON.stringify(characters));
    localStorage.setItem('studentClasses', JSON.stringify(studentClasses));
    localStorage.setItem('achievements', JSON.stringify(achievements));
  }, [currentUser, currentView, allUsers, characters, studentClasses, achievements]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setCurrentView('auth');
  };

  const handleAuth = (username, password, isSignUp) => {
    if (isSignUp) {
      const existingUser = allUsers.find(u => u.username === username);
      if (existingUser) {
        alert('Username already exists!');
        return;
      }

      const newUser = {
        id: `${selectedRole}_${Date.now()}`,
        username,
        role: selectedRole,
        name: username
      };

      if (selectedRole === 'teacher') {
        newUser.subjectName = 'My Subject';
        newUser.otpCode = generateOTP();
      }

      setAllUsers([...allUsers, newUser]);
      setCurrentUser(newUser);

      if (selectedRole === 'student') {
        setAchievements({
          ...achievements,
          [newUser.id]: getDefaultAchievements()
        });
        setCurrentView('character');
      } else {
        setCurrentView('dashboard');
      }

    } else {
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
    setAllUsers(allUsers.map(u => (u.id === updatedUser.id ? updatedUser : u)));

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
    setAllUsers(allUsers.map(u => (u.id === updatedUser.id ? updatedUser : u)));
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

    const userAchievements = achievements[currentUser.id] || [];
    setAchievements({
      ...achievements,
      [currentUser.id]: userAchievements.map(a =>
        a.id === achievementId && !a.unlocked
          ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() }
          : a
      )
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
    { id: 'first_quest', title: 'First Steps', description: 'Complete your first quest', icon: '🎯', unlocked: false },
    { id: 'level_5', title: 'Apprentice Scholar', description: 'Reach level 5', icon: '📚', unlocked: false },
    { id: 'level_10', title: 'Expert Adventurer', description: 'Reach level 10', icon: '⚔️', unlocked: false },
    { id: 'perfect_score', title: 'Perfectionist', description: 'Get a perfect score on a quest', icon: '💯', unlocked: false },
    { id: 'speed_demon', title: 'Speed Demon', description: 'Complete a timed quest with 50% time remaining', icon: '⚡', unlocked: false },
    { id: 'class_joiner', title: 'Class Joined', description: 'Join your first class', icon: '🏫', unlocked: false }
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
        />
      )}

      {currentView === 'dashboard' && currentUser && currentUser.role === 'teacher' && (
        <TeacherDashboard
          user={currentUser}
          onLogout={handleLogout}
          onUpdateUser={handleUpdateUser}
          students={allUsers.filter(
            u => u.role === 'student' && (studentClasses[u.id] || []).includes(currentUser.id)
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
        />
      )}
    </div>
  );
}

export default App;
