import { useState, useEffect } from 'react';
import { Plus, Scroll, BookOpen, Edit, Trash2, Clock, Star, X } from 'lucide-react';
import { User, Quest, Question, Item } from '../App';

export default function QuestManagement({
  user,
  onCreateQuest,
  onUpdateQuest,
  onDeleteQuest,
  onAddItemToInventory,
  quests,
  selectedCourse
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingQuest, setEditingQuest] = useState(null);

  // Courses from backend
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  console.log('DEBUG:', { quests, userId: user.id, selectedCourse });


  // Filter quests for this teacher
  const teacherQuests = quests.filter(q =>
  String(q.teacherId) === String(user.id) &&
  (
    !selectedCourse ||
    String(q.courseId) === String(selectedCourse._id)
  )
);
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [xpReward, setXpReward] = useState(50);
  const [timeLimit, setTimeLimit] = useState(10);
  const [subject, setSubject] = useState('');
  const [questions, setQuestions] = useState([
    { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }
  ]);
  const [localQuests, setLocalQuests] = useState([]);

  // Fetch courses from backend
  useEffect(() => {
    async function fetchCourses() {
      if (user?.role === 'teacher' && user?.id) {
        setLoadingCourses(true);
        try {
          const res = await fetch(`/api/teachers/${user.id}/courses`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
          });
          if (!res.ok) throw new Error('Failed to fetch courses');
          const data = await res.json();
          setCourses(data);
          // Set default subject if not editing
          if (!editingQuest && data.length > 0) setSubject(data[0].name);
        } catch (err) {
          setCourses([]);
        } finally {
          setLoadingCourses(false);
        }
      }
    }
    fetchCourses();
    // eslint-disable-next-line
  }, [user, editingQuest]);

  useEffect(() => {
    // Load quests from localStorage
    const savedQuests = localStorage.getItem('quests');
    if (savedQuests) {
      const allQuests = JSON.parse(savedQuests);
      setLocalQuests(allQuests.filter((q) => q.teacherId === user.id));
    }
  }, [user.id]);

  useEffect(() => {
    // Listen for storage changes
    const handleStorageChange = () => {
      const savedQuests = localStorage.getItem('quests');
      if (savedQuests) {
        const allQuests = JSON.parse(savedQuests);
        setLocalQuests(allQuests.filter((q) => q.teacherId === user.id));
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also poll for changes
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [user.id]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDifficulty('Easy');
    setXpReward(50);
    setTimeLimit(10);
    setSubject(courses.length > 0 ? courses[0]._id : '');
    setQuestions([
      { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }
    ]);
    setEditingQuest(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (quest) => {
    setTitle(quest.title);
    setDescription(quest.description);
    setDifficulty(quest.difficulty);
    setXpReward(quest.xpReward);
    setTimeLimit(quest.timeLimit ? quest.timeLimit / 60 : 10);
    const course = courses.find(c => c.name === quest.courseName || c._id === quest.courseId);
    setSubject(course ? course._id : (courses.length > 0 ? courses[0]._id : ''));
    setQuestions(
      quest.questions.map(q => ({
        question: q.question,
        options: [...q.options],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || ''
      }))
    );
    setEditingQuest(quest);
    setShowCreateModal(true);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateQuestionOption = (questionIndex, optionIndex, value) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const handleSubmit = () => {
    // Validation
    if (!title.trim()) {
      alert('Please enter a quest title');
      return;
    }
    if (!description.trim()) {
      alert('Please enter a quest description');
      return;
    }
      const course = courses.find(c => c._id === subject);
    if (!subject || !course) {
      alert('Please select a course for this quest');
      return;
    }
    if (questions.some(q => !q.question.trim())) {
      alert('Please fill in all question fields');
      return;
    }
    if (questions.some(q => q.options.some(opt => !opt.trim()))) {
      alert('Please fill in all answer options');
      return;
    }

    const questData = {
      id: editingQuest ? editingQuest.id : `quest_${Date.now()}`,
      title,
      description,
      difficulty,
      xpReward,
      timeLimit: timeLimit * 60,
      teacherId: user.id,
      courseId: course._id,
      courseName: course.name,
      section: course.section,
      questions: questions.map((q, idx) => ({
        id: `q${idx + 1}`,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || undefined
      }))
    };

    if (editingQuest) {
      onUpdateQuest(editingQuest.id, questData);
    } else {
      onCreateQuest(questData);
    }

    setShowCreateModal(false);
    resetForm();
  };

  const handleDelete = (questId) => {
    if (window.confirm('Are you sure you want to delete this quest?')) {
      onDeleteQuest(questId);
    }
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl text-amber-400">Quest Management</h2>
        <button
          onClick={openCreateModal}
          className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white px-6 py-3 rounded-lg transition-all shadow-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create New Quest
        </button>
      </div>

      {/* Quest List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teacherQuests.length === 0 ? (
          <div className="col-span-full bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl p-12 border-2 border-purple-400/30 backdrop-blur-sm text-center">
            <Scroll className="w-16 h-16 mx-auto mb-4 text-purple-400/50" />
            <h3 className="text-2xl text-white mb-2">No Quests Yet</h3>
            <p className="text-purple-200">
              Create your first quest to get started!
            </p>
          </div>
        ) : (
          teacherQuests.map((quest) => {
            const difficultyColor = getDifficultyColor(quest.difficulty);

            return (
              <div
                key={quest.id}
                className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl p-6 border-2 border-purple-400/30 backdrop-blur-sm hover:border-purple-400/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <Scroll className="w-12 h-12 text-amber-400" />
                  <span className={`px-3 py-1 rounded-full text-sm bg-${difficultyColor}-600/30 text-${difficultyColor}-300 border border-${difficultyColor}-400/50`}>
                    {quest.difficulty}
                  </span>
                </div>

                <h3 className="text-xl text-white mb-2">{quest.title}</h3>
                <p className="text-purple-200 mb-4">{quest.description}</p>

                {/* subject list*/}
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-amber-400 font-semibold">{quest.courseName} ({quest.section})</span>
                </div>

                <div className="flex items-center gap-4 mb-6 text-sm text-purple-200">
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
                  <div className="text-purple-300">
                    {quest.questions.length} Questions
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(quest)}
                    className="flex-1 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/50 text-white py-2 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(quest.id)}
                    className="flex-1 bg-red-600/30 hover:bg-red-600/50 border border-red-400/50 text-white py-2 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create/Edit Quest Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl max-w-4xl w-full border-4 border-purple-400 my-8">
            <div className="p-6 border-b-2 border-purple-400/30 sticky top-0 bg-purple-900/90 backdrop-blur-sm rounded-t-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl text-amber-400">
                  {editingQuest ? 'Edit Quest' : 'Create New Quest'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="text-purple-200 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-purple-100 mb-2">Course *</label>
                <select
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full bg-slate-800/50 border-2 border-purple-400/30 rounded-lg px-4 py-3 text-white focus:border-purple-400 focus:outline-none"
                  disabled={loadingCourses}
                >
                  {loadingCourses && (
                    <option>Loading...</option>
                  )}
                  {!loadingCourses && courses.length === 0 && (
                    <option value="">No courses found</option>
                  )}
                  {!loadingCourses && courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.name} ({course.section})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-purple-100 mb-2">Quest Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-800/50 border-2 border-purple-400/30 rounded-lg px-4 py-3 text-white placeholder-purple-300 focus:border-purple-400 focus:outline-none"
                  placeholder="Enter quest title"
                />
              </div>

              <div>
                <label className="block text-purple-100 mb-2">Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-800/50 border-2 border-purple-400/30 rounded-lg px-4 py-3 text-white placeholder-purple-300 focus:border-purple-400 focus:outline-none"
                  rows={3}
                  placeholder="Enter quest description"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-purple-100 mb-2">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-slate-800/50 border-2 border-purple-400/30 rounded-lg px-4 py-3 text-white focus:border-purple-400 focus:outline-none"
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-purple-100 mb-2">XP Reward</label>
                  <input
                    type="number"
                    value={xpReward}
                    onChange={(e) => setXpReward(Number(e.target.value))}
                    className="w-full bg-slate-800/50 border-2 border-purple-400/30 rounded-lg px-4 py-3 text-white placeholder-purple-300 focus:border-purple-400 focus:outline-none"
                    placeholder="100"
                    min="10"
                    step="10"
                  />
                </div>

                <div>
                  <label className="block text-purple-100 mb-2">Time Limit (min)</label>
                  <input
                    type="number"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                    className="w-full bg-slate-800/50 border-2 border-purple-400/30 rounded-lg px-4 py-3 text-white placeholder-purple-300 focus:border-purple-400 focus:outline-none"
                    placeholder="10"
                    min="1"
                  />
                </div>
              </div>

              {/* Questions Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl text-amber-300">Questions</h4>
                  <button
                    onClick={addQuestion}
                    className="bg-green-600/50 hover:bg-green-600/70 border border-green-400/50 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Question
                  </button>
                </div>

                {questions.map((q, qIdx) => (
                  <div key={qIdx} className="bg-slate-800/30 border-2 border-purple-400/20 rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="text-purple-100">Question {qIdx + 1}</h5>
                      {questions.length > 1 && (
                        <button
                          onClick={() => removeQuestion(qIdx)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-purple-100 text-sm mb-2">Question Text *</label>
                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => updateQuestion(qIdx, 'question', e.target.value)}
                        className="w-full bg-slate-700/50 border border-purple-400/30 rounded-lg px-4 py-2 text-white placeholder-purple-300 focus:border-purple-400 focus:outline-none"
                        placeholder="Enter your question"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct_${qIdx}`}
                            checked={q.correctAnswer === optIdx}
                            onChange={() => updateQuestion(qIdx, 'correctAnswer', optIdx)}
                            className="w-4 h-4 text-green-600"
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => updateQuestionOption(qIdx, optIdx, e.target.value)}
                            className="flex-1 bg-slate-700/50 border border-purple-400/30 rounded-lg px-3 py-2 text-white placeholder-purple-300 focus:border-purple-400 focus:outline-none text-sm"
                            placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-purple-300">Select the radio button for the correct answer</p>

                    <div>
                      <label className="block text-purple-100 text-sm mb-2">Explanation (Optional)</label>
                      <textarea
                        value={q.explanation}
                        onChange={(e) => updateQuestion(qIdx, 'explanation', e.target.value)}
                        className="w-full bg-slate-700/50 border border-purple-400/30 rounded-lg px-4 py-2 text-white placeholder-purple-300 focus:border-purple-400 focus:outline-none text-sm"
                        rows={2}
                        placeholder="Explain why this is the correct answer"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t-2 border-purple-400/30 bg-purple-900/50 rounded-b-xl flex gap-4">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white py-3 rounded-lg transition-all shadow-lg"
              >
                {editingQuest ? 'Update Quest' : 'Create Quest'}
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}