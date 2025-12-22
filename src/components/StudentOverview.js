import { useState, useEffect } from 'react';
import { Users, Search, BookOpen, UserPlus, Star, Trophy } from 'lucide-react';
import { User, Character } from '../App';

export default function StudentOverview({
  user,
  students,
  allStudents,
  characters,
  courses,
  onInviteStudent
}) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');

  // Set selectedCourseId when courses are loaded
  useEffect(() => {
    if (courses && courses.length > 0) {
      setSelectedCourseId(courses[0]._id);
    }
  }, [courses]);

  const availableStudents = allStudents.filter(
    s => !students.find(enrolled => enrolled.id === s.id)
  );

  const filteredStudents = availableStudents.filter(s =>
    s.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInvite = (studentId) => {
    onInviteStudent(studentId);
    alert('Student invited successfully!');
    setShowInviteModal(false);
    setSearchQuery('');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl text-amber-400">Student Overview</h2>
        <button
          onClick={() => setShowInviteModal(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white px-6 py-3 rounded-lg transition-all shadow-lg flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Invite Student
        </button>
      </div>

      {/* Student List */}
      {students.length === 0 ? (
        <div className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl p-12 border-2 border-purple-400/30 backdrop-blur-sm text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-purple-400/50" />
          <h3 className="text-2xl text-white mb-2">No Students Enrolled</h3>
          <p className="text-purple-200 mb-6">
            Invite students to join your class or share your class code: <span className="text-amber-400 tracking-wider">{user.otpCode}</span>
          </p>
          <button
            onClick={() => allStudents.length > 0 && setShowInviteModal(true)}
            disabled={allStudents.length === 0}
            className="bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white px-8 py-3 rounded-lg transition-all shadow-lg inline-flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Invite Your First Student
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl p-8 border-2 border-purple-400/30 backdrop-blur-sm">
          <h3 className="text-2xl text-amber-400 mb-6">Enrolled Students ({students.length})</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => {
              const character = student.characterId ? characters[student.characterId] : null;
              return (
                <div
                  key={student.id}
                  className="bg-slate-800/50 rounded-xl p-6 border-2 border-purple-400/30 hover:border-purple-400/50 transition-all"
                >
                  <div className="flex items-start gap-4 mb-4">
                    {character ? (
                      <img
                        src={character.avatar}
                        alt={character.name}
                        className="w-16 h-16 rounded-full border-2 border-amber-400 object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center border-2 border-purple-400">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-white truncate">{student.name}</div>
                      <div className="text-sm text-purple-200 truncate">@{student.username}</div>
                      <div className="text-xs text-purple-300 mt-1">
                        {Array.isArray(student.studentClasses) && student.studentClasses.length > 0 ? (
                          <>
                            Courses:&nbsp;
                            {student.studentClasses
                              .map(cid => {
                                const course = courses.find(c => c._id === cid);
                                return course ? `${course.name}${course.section ? ` (${course.section})` : ''}` : null;
                              })
                              .filter(Boolean)
                              .join(', ')
                            }
                          </>
                        ) : (
                          'No courses'
                        )}
                      </div>
                    </div>
                  </div>
                  {character ? (
                    <div className="space-y-3">
                      <div className="bg-slate-700/50 rounded-lg p-3 border border-purple-400/20">
                        <div className="text-sm text-purple-300 mb-1">Character</div>
                        <div className="flex items-center justify-between">
                          <span className="text-white">{character.name}</span>
                          <span className="text-purple-200 text-sm">{character.class}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-600/20 rounded-lg p-3 border border-blue-400/30">
                          <div className="flex items-center gap-2 mb-1">
                            <Star className="w-4 h-4 text-blue-400" />
                            <span className="text-xs text-blue-300">Level</span>
                          </div>
                          <div className="text-white">{character.level}</div>
                        </div>
                        <div className="bg-amber-600/20 rounded-lg p-3 border border-amber-400/30">
                          <div className="flex items-center gap-2 mb-1">
                            <Trophy className="w-4 h-4 text-amber-400" />
                            <span className="text-xs text-amber-300">XP</span>
                          </div>
                          <div className="text-white">{character.xp}</div>
                        </div>
                      </div>
                      <div className="bg-slate-700/50 rounded-lg p-2">
                        <div className="bg-slate-900/50 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all"
                            style={{ width: `${(character.xp / character.maxXp) * 100}%` }}
                          />
                        </div>
                        <div className="text-xs text-purple-300 mt-1 text-center">
                          {character.xp} / {character.maxXp} XP
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-purple-300 text-sm">
                      Character not created yet
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl max-w-2xl w-full border-4 border-purple-400 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b-2 border-purple-400/30">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl text-amber-400">Invite Students</h3>
                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    setSearchQuery('');
                  }}
                  className="text-purple-200 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            {/* Course selection dropdown */}
            <div className="p-6 border-b-2 border-purple-400/30">
              <label className="block text-purple-100 mb-2">Select Course</label>
              {(!courses || courses.length === 0) ? (
                <div className="text-purple-300">Loading courses...</div>
              ) : (
                <select
                  value={selectedCourseId}
                  onChange={e => setSelectedCourseId(e.target.value)}
                  className="w-full bg-slate-800/50 border-2 border-purple-400/30 rounded-lg px-4 py-3 text-white focus:border-purple-400 focus:outline-none"
                >
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>
                      {course.name} ({course.section})
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="p-6 border-b-2 border-purple-400/30">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800/50 border-2 border-purple-400/30 rounded-lg pl-12 pr-4 py-3 text-white placeholder-purple-300 focus:border-purple-400 focus:outline-none"
                  placeholder="Search by username or name..."
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-purple-200">
                  {searchQuery ? 'No students found' : 'No available students to invite'}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredStudents.map((student) => {
                    const character = student.characterId ? characters[student.characterId] : null;
                    return (
                      <div
                        key={student.id}
                        className="bg-slate-800/30 rounded-lg p-4 border border-purple-400/20 hover:border-purple-400/40 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          {character ? (
                            <img
                              src={character.avatar}
                              alt={character.name}
                              className="w-12 h-12 rounded-full border-2 border-purple-400 object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center border-2 border-purple-400">
                              <Users className="w-6 h-6 text-white" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="text-white">{student.name}</div>
                            <div className="text-sm text-purple-200">@{student.username}</div>
                          </div>
                          {character && (
                            <div className="text-right mr-4">
                              <div className="text-white text-sm">Level {character.level}</div>
                              <div className="text-xs text-purple-200">{character.class}</div>
                            </div>
                          )}
                          <button
                            onClick={() => handleInvite(student.id)}
                            className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white px-4 py-2 rounded-lg transition-all shadow-lg flex items-center gap-2"
                            disabled={!selectedCourseId}
                          >
                            <UserPlus className="w-4 h-4" />
                            Invite
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}