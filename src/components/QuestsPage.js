import { useState, useEffect } from 'react';
import { Scroll, Clock, Star, Trophy, Play, CheckCircle, Filter } from 'lucide-react';

export default function QuestsPage({
  character,
  onUpdateCharacter,
  studentClasses = [],
  teachers = [],
  onUnlockAchievement,
  quests = [],
  courses = [],
  onStartQuest
}) {
  const [completedQuests, setCompletedQuests] = useState([]);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');

  const getId = (value) => String(value?._id ?? value?.id ?? value ?? '');
  const enrolledCourseIds = studentClasses.map(String);

  const enrolledCourses = courses.filter((course) =>
    enrolledCourseIds.includes(getId(course._id))
  );

  useEffect(() => {
    const saved = localStorage.getItem(`completed_quests_${character.id}`);
    if (saved) {
      setCompletedQuests(JSON.parse(saved));
    }
  }, [character.id]);

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

  const availableQuests = (Array.isArray(quests) ? quests : []).filter((quest) => {
    const questCourseId = getId(quest.courseId);
    if (!questCourseId) return false;

    const isEnrolled = enrolledCourseIds.includes(questCourseId);
    const matchesCourseFilter =
      selectedCourseFilter === 'all' || questCourseId === selectedCourseFilter;

    return isEnrolled && matchesCourseFilter;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl text-amber-400 font-pixel">Available Quests</h2>
        <div className="text-purple-200 font-pixel">
          Completed: {completedQuests.length} / {availableQuests.length}
        </div>
      </div>

      {enrolledCourses.length > 0 && (
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-purple-300" />
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="bg-slate-800/50 border-2 border-purple-400/30 rounded-lg px-4 py-2 text-white font-pixel focus:border-purple-400 focus:outline-none"
          >
            <option value="all">All Courses</option>
            {enrolledCourses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {availableQuests.length === 0 ? (
        <div className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl p-12 border-2 border-purple-400/30 backdrop-blur-sm text-center">
          <Scroll className="w-16 h-16 mx-auto mb-4 text-purple-400/50" />
          <h3 className="text-2xl text-white mb-2 font-pixel">No Quests Available</h3>
          <p className="text-purple-200 font-pixel">
            No real quests are assigned to your enrolled classes yet.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableQuests.map((quest) => {
            const questId = getId(quest.id || quest._id);
            const teacherId = getId(quest.teacherId);
            const isCompleted = completedQuests.includes(questId);
            const teacher = teachers.find((t) => getId(t.id || t._id) === teacherId);
            const difficultyColor = getDifficultyColor(quest.difficulty);

            return (
              <div
                key={questId}
                className={`bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl p-6 border-2 backdrop-blur-sm transition-all hover:scale-105 ${
                  isCompleted
                    ? 'border-green-400/50 opacity-75'
                    : 'border-purple-400/30 hover:border-purple-400/50'
                }`}
              >
                {isCompleted && (
                  <div className="flex items-center gap-2 text-green-400 mb-3">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-pixel">Completed</span>
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <Scroll className="w-12 h-12 text-amber-400" />
                  <span
                    className={`px-3 py-1 rounded-full text-sm bg-${difficultyColor}-600/30 text-${difficultyColor}-300 border border-${difficultyColor}-400/50 font-pixel`}
                  >
                    {quest.difficulty}
                  </span>
                </div>

                <h3 className="text-xl text-white mb-2 font-pixel">{quest.title}</h3>
                <p className="text-purple-200 mb-4 font-pixel">{quest.description}</p>

                {teacher && (
                  <div className="text-sm text-purple-300 mb-4 font-pixel">
                    By: {teacher.name}
                  </div>
                )}

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
