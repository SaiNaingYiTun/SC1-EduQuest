import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import RoleSelection from './components/RoleSelection';
import AuthPage from './components/AuthPage';
import AdminLoginPage from './components/AdminLoginPage';
import AdminDashboard from './components/AdminDashboard';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import CharacterSelection from './components/CharacterSelection';
import GamePage from './components/GamePage';
import { createContext, useContext } from 'react';
import { API_URL } from './api';

const ToastCtx = createContext(() => { });
export const useToast = () => useContext(ToastCtx);



function App() {
  const [currentView, setCurrentView] = useState('role');
  const [selectedRole, setSelectedRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [courses, setCourses] = useState([]);


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
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'info') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2800);
  }, []);

  const lastFetchRef = useRef({
    users: 0,
    quests: 0,
    courses: 0,
  });

  const inflightRequestsRef = useRef(new Map());



  // -----------------------
  // Backend helpers
  // -----------------------

  const authFetch = useCallback(async (url, options = {}) => {
    const res = await fetch(`${API_URL}${url}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(options.method && options.method !== 'GET'
          ? { 'Content-Type': 'application/json' }
          : {})
      }
    });

    if (res.status === 401) {
      toast('Session expired. Please log in again.', 'warning');
      setCurrentUser(null);
      setAuthToken(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      setCurrentView('role');
    }

    return res;
  }, [authToken, toast]);

  const fetchedStudentStateRef = useRef(new Set());


  const refreshStudentClassesForTeacher = useCallback(async () => {
    if (!currentUser || currentUser.role !== 'teacher') return;

    const teacherCourseIds = courses
      .filter(c => String(c.teacherId) === String(currentUser.id))
      .map(c => String(c._id));

    if (teacherCourseIds.length === 0) return;

    const relevantStudents = allUsers.filter(
      u =>
        u.role === 'student' &&
        (studentClasses[u.id] || []).some(cid =>
          teacherCourseIds.includes(String(cid))
        )
    );

    const studentsToFetch = relevantStudents.filter(
      s => !fetchedStudentStateRef.current.has(s.id)
    );

    if (studentsToFetch.length === 0) return;

    const results = await Promise.allSettled(
      studentsToFetch.map(s =>
        authFetch(`/api/students/${s.id}/state`).then(r => r.json())
      )
    );

    const nextClasses = {};
    const nextCharacters = {};

    studentsToFetch.forEach((s, i) => {
      const r = results[i];
      if (r.status !== 'fulfilled') return;

      const value = r.value;

      if (Array.isArray(value.studentClasses)) {
        nextClasses[s.id] = value.studentClasses;
      }

      if (value.character && value.character.id) {
        nextCharacters[value.character.id] = value.character;
      }

      fetchedStudentStateRef.current.add(s.id);
    });

    setStudentClasses(prev => ({ ...prev, ...nextClasses }));
    setCharacters(prev => ({ ...prev, ...nextCharacters }));
  }, [currentUser, allUsers, courses, authFetch, studentClasses]);


  const refreshAllUsers = useCallback(async (force = false) => {
    // 🚀 Request deduplication - prevent multiple simultaneous requests
    const cacheKey = '/api/users';
    if (inflightRequestsRef.current.has(cacheKey)) {
      return inflightRequestsRef.current.get(cacheKey);
    }

    // 🚀 Freshness check - skip if data is recent (< 30s)
    const now = Date.now();
    if (!force && (now - lastFetchRef.current.users) < 30000) {
      return;
    }

    const requestPromise = (async () => {
      try {
        const res = await authFetch('/api/users');
        if (!res.ok) return;

        const data = await res.json();
        const normalized = data.map(u => ({ ...u, id: u.id || u._id }));
        setAllUsers(normalized);

        // ✅ Build studentClasses map from backend User.studentClasses
        const nextMap = {};
        for (const u of normalized) {
          if (u.role === 'student') {
            nextMap[u.id] = Array.isArray(u.studentClasses)
              ? u.studentClasses.map(String)
              : [];
          }
        }
        setStudentClasses(nextMap);

        lastFetchRef.current.users = Date.now();
      } finally {
        inflightRequestsRef.current.delete(cacheKey);
      }
    })();

    inflightRequestsRef.current.set(cacheKey, requestPromise);
    return requestPromise;
  }, [authFetch]);



  const refreshQuests = useCallback(async (force = false) => {
    const cacheKey = '/api/quests';
    if (inflightRequestsRef.current.has(cacheKey)) {
      return inflightRequestsRef.current.get(cacheKey);
    }

    const now = Date.now();
    if (!force && (now - lastFetchRef.current.quests) < 30000) {
      return;
    }

    const requestPromise = (async () => {
      try {
        const res = await authFetch('/api/quests');
        if (!res.ok) return;
        const data = await res.json();
        setQuests(Array.isArray(data) ? data : []);
        lastFetchRef.current.quests = Date.now();
      } finally {
        inflightRequestsRef.current.delete(cacheKey);
      }
    })();

    inflightRequestsRef.current.set(cacheKey, requestPromise);
    return requestPromise;
  }, [authFetch]);



  const refreshCourses = useCallback(async (force = false) => {
    if (!currentUser || !authToken) return;

    const url =
      currentUser.role === 'teacher'
        ? `/api/teachers/${currentUser.id}/courses`
        : '/api/courses';

    if (inflightRequestsRef.current.has(url)) {
      return inflightRequestsRef.current.get(url);
    }

    const now = Date.now();
    if (!force && (now - lastFetchRef.current.courses) < 30000) {
      return;
    }

    const requestPromise = (async () => {
      try {
        const res = await authFetch(url);
        if (!res.ok) return;
        const data = await res.json();
        setCourses(Array.isArray(data) ? data : []);
        lastFetchRef.current.courses = Date.now();
      } catch (err) {
        console.error('Error loading courses:', err);
      } finally {
        inflightRequestsRef.current.delete(url);
      }
    })();

    inflightRequestsRef.current.set(url, requestPromise);
    return requestPromise;
  }, [currentUser, authToken, authFetch]);








  const saveStudentState = async (
    studentId,
    achievementList,
    inventoryList,
    progressObj,
    levelInfo
  ) => {
    try {
      await fetch(`${API_URL}/api/students/${studentId}/state`, {
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

  const fetchStudentState = useCallback(async (studentId) => {
    try {
      const res = await fetch(`${API_URL}/api/students/${studentId}/state`);
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
  }, [API_URL]);

  const handleUpdateProgress = async (studentId, questId, score, xpGainedOverride) => {
    try {
      const res = await fetch(`${API_URL}/api/students/${studentId}/progress`, {
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
    refreshCourses();
  }, [refreshCourses]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'teacher') return;
    if (!allUsers.length || !courses.length) return;
    refreshStudentClassesForTeacher();
  }, [currentUser, allUsers, courses, refreshStudentClassesForTeacher]);



  useEffect(() => {
    if (!authToken) return;
    refreshAllUsers();
  }, [authToken, refreshAllUsers]);




  useEffect(() => {
    // Load from localStorage once on app mount.
    const savedUserRaw = localStorage.getItem('currentUser');
    const savedView = localStorage.getItem('currentView');
    const savedCharacters = localStorage.getItem('characters');
    const savedAchievements = localStorage.getItem('achievements');
    const savedStudentInventories = localStorage.getItem('studentInventories');

    let savedUser = null;
    if (savedUserRaw) {
      const parsedUser = JSON.parse(savedUserRaw);
      savedUser = { ...parsedUser, id: parsedUser.id || parsedUser._id };
      setCurrentUser(savedUser);
      setSelectedRole(savedUser.role);
    }

    if (savedCharacters) {
      setCharacters(JSON.parse(savedCharacters));
    }

    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements));
    }

    if (savedStudentInventories) {
      setStudentInventories(JSON.parse(savedStudentInventories));
    }

    // Always load quests from backend API (backend is source of truth)
    fetch(`${API_URL}/api/quests`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to load quests: ${res.status}`);
        }
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          throw new Error('Failed to load quests: backend did not return JSON');
        }
        return res.json();
      })
      .then((data) => {
        setQuests(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('Error loading quests from backend:', err);
      });

    if (savedUser) {
      if (savedView) {
        setCurrentView(savedView);
      } else if (savedUser.role === 'student' && !savedUser.characterId) {
        setCurrentView('character');
      } else {
        setCurrentView('dashboard');
      }

      // On reload, sync student state from backend once.
      if (savedUser.role === 'student') {
        fetchStudentState(savedUser.id);
      }
    }

    const rawPath = window.location.pathname;
    const path = rawPath.replace(/\/+$/, '') || '/';
    if (path === '/admin-login') {
      setCurrentView('admin-login');
    } else if (path === '/character') {
      if (savedUser && savedUser.role === 'student') {
        setCurrentView('character');
      }
    } else if (path === '/dashboard') {
      if (savedUser) {
        setCurrentView('dashboard');
      }
    }
  }, [fetchStudentState]);

  // -----------------------
  // Persist some state locally
  // -----------------------
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      localStorage.setItem('currentView', currentView);
    }
  }, [currentUser, currentView]);

  // -----------------------
  // Auth & user handling
  // -----------------------

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setCurrentView('auth');
  };






  const handleAuth = async (username, password, isSignUp, email, role) => {
    try {
      if (isSignUp) {
        // === SIGN UP ===
        const res = await fetch(`${API_URL}/api/auth/register`, {
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
          toast(errData.message || (isSignUp ? 'Failed to register' : 'Failed to login'), 'error');
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
        const res = await fetch(`${API_URL}/api/auth/login`, {
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
          toast(errData.message || 'Failed to login', 'error');
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
      toast('Something went wrong. Please try again.', 'error');
    }
  };

  const handleAdminLogin = async (username, password) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernameOrEmail: username,
          password,
          role: 'admin'
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error('Admin login failed response:', res.status, data);
        toast(data.message || 'Admin login failed', 'error');
        return;
      }

      if (!data.token) {
        console.error('Admin login succeeded but no token returned:', data);
        toast('No token returned from server for admin — check backend', 'error');
        return;
      }

      const adminUser = {
        ...data.user,
        id: data.user.id || data.user._id
      };

      setCurrentUser(adminUser);
      setAuthToken(data.token);
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('currentUser', JSON.stringify(adminUser));

      setCurrentView('admin');
    } catch (err) {
      console.error('Admin login error:', err);
      toast('Admin login failed', 'error');
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
      await fetch(`${API_URL}/api/students/${currentUser.id}/state`, {
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

  const handleAdminLogout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    setCurrentView('admin-login'); // return to admin-login after logout
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
      toast('Teacher not found!', 'error');
      return false;
    }

    if (teacher.otpCode !== otp) {
      toast('Invalid OTP code!', 'error');
      return false;
    }

    const currentClasses = studentClasses[currentUser.id] || [];
    if (currentClasses.includes(teacher.id)) {
      toast('You are already in this class!', 'warning');
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
        body: JSON.stringify(newQuest)
      });

      if (!response.ok) {
        throw new Error('Failed to create quest');
      }

      // Option 1: Fetch all quests from backend to ensure state is up-to-date
      const allQuestsRes = await fetch(`${API_URL}/api/quests`);
      if (allQuestsRes.ok) {
        const allQuests = await allQuestsRes.json();
        setQuests(allQuests);
      } else {
        // fallback: just add the created quest
        const createdQuest = await response.json();
        setQuests((prev) => [...prev, createdQuest]);
      }
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


  const onInviteStudent = async (studentId, courseId) => {
    const res = await authFetch(`/api/students/${studentId}/add-course`, {
      method: 'POST',
      body: JSON.stringify({ courseId }),
    });

    let data = null;
    try { data = await res.json(); } catch { }

    if (res.ok) {
      // Use backend truth if available
      const nextClasses = Array.isArray(data?.updatedState?.studentClasses)
        ? data.updatedState.studentClasses.map(String)
        : null;

      setStudentClasses(prev => {
        const fallback = Array.from(
          new Set([...(prev[studentId] || []), String(courseId)])
        );

        return {
          ...prev,
          [studentId]: nextClasses ?? fallback,
        };
      });

      // Prevent your “fetch student state” logic from missing them later
      fetchedStudentStateRef.current.add(String(studentId));

      // Keep allUsers in sync too
      await refreshAllUsers();
    }

    return res;
  };

  const teachers = useMemo(
    () => allUsers.filter(u => u.role === 'teacher'),
    [allUsers]
  );

  const students = useMemo(() => {
    if (!currentUser || currentUser.role !== 'teacher') return [];

    const teacherCourseIds = courses
      .filter(c => String(c.teacherId) === String(currentUser.id))
      .map(c => String(c._id));

    return allUsers
      .filter(u =>
        u.role === 'student' &&
        (studentClasses[u.id] || []).some(cid =>
          teacherCourseIds.includes(String(cid))
        )
      )
      .map(u => ({
        ...u,
        studentClasses: studentClasses[u.id] || []
      }));
  }, [allUsers, currentUser, courses, studentClasses]);

  const allStudentsWithClasses = useMemo(
    () => allUsers
      .filter(u => u.role === 'student')
      .map(u => ({
        ...u,
        studentClasses: studentClasses[u.id] || []
      })),
    [allUsers, studentClasses]
  );







  // -----------------------
  // Render
  // -----------------------

  return (
    <ToastCtx.Provider value={toast}>
      {/* 🌌 App Root */}
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 relative">

        {/* 🔔 Toast Overlay */}
        <div className="fixed top-4 right-4 z-[9999] space-y-3 w-[320px]">
          {toasts.map(t => {
            const style =
              t.type === 'success'
                ? 'border-green-400/40 bg-green-500/10'
                : t.type === 'error'
                  ? 'border-red-400/40 bg-red-500/10'
                  : t.type === 'warning'
                    ? 'border-amber-400/40 bg-amber-500/10'
                    : 'border-sky-400/30 bg-sky-500/10';

            const icon =
              t.type === 'success' ? '✅' :
                t.type === 'error' ? '❌' :
                  t.type === 'warning' ? '⚠️' :
                    'ℹ️';

            return (
              <div
                key={t.id}
                role="status"
                aria-live="polite"
                className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg
                backdrop-blur-md bg-slate-900/95 text-white animate-slide-in ${style}`}
              >
                <span className="text-lg leading-none">{icon}</span>
                <div className="text-sm leading-snug">{t.message}</div>
              </div>
            );
          })}
        </div>

        {/* 👇 APP CONTENT */}
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

        {currentView === 'admin-login' && (
          <AdminLoginPage
            onAdminLogin={handleAdminLogin}
            onBack={() => setCurrentView('role')}
          />
        )}

        {currentView === 'admin' && currentUser?.role === 'admin' && (
          <AdminDashboard
            user={currentUser}
            authFetch={authFetch}
            onLogout={handleAdminLogout}
            go={(view) => setCurrentView(view)}
          />
        )}

        {currentView === 'character' &&
          currentUser?.role === 'student' && (
            <CharacterSelection
              onCharacterCreated={handleCharacterCreation}
              userId={currentUser.id}
            />
          )}

        {currentView === 'dashboard' &&
          currentUser?.role === 'student' && (
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
              teachers={teachers}
              achievements={achievements[currentUser.id] || []}
              onUnlockAchievement={handleUnlockAchievement}
              quests={quests}
              inventory={studentInventories[currentUser.id] || []}
              progress={studentProgress[currentUser.id] || {}}
              levelInfo={studentLevels[currentUser.id] || { level: 1, xp: 0 }}
              onUpdateProgress={handleUpdateProgress}
              onStartQuest={handleStartQuest}
              courses={courses}
              authFetch={authFetch}
            />
          )}

        {currentView === 'dashboard' &&
          currentUser?.role === 'teacher' && (
            <TeacherDashboard
              user={currentUser}
              onLogout={handleLogout}
              onUpdateUser={handleUpdateUser}
              students={students}
              allStudents={allStudentsWithClasses}
              characters={characters}
              studentClasses={studentClasses}
              onInviteStudent={onInviteStudent}
              onCreateQuest={handleCreateQuest}
              onUpdateQuest={handleUpdateQuest}
              onDeleteQuest={handleDeleteQuest}
              onAddItemToInventory={handleAddItemToInventory}
              quests={quests}
              authFetch={authFetch}
              courses={courses}
              onRefreshAllUsers={refreshAllUsers}
              onRefreshStudentClasses={refreshStudentClassesForTeacher}
              onRefreshQuests={refreshQuests}
              onRefreshCourses={refreshCourses}
              onCoursesChange={setCourses}
            />
          )}

        {currentView === 'game' &&
          selectedQuest &&
          currentUser?.characterId && (
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
    </ToastCtx.Provider>
  );

}

export default App;
