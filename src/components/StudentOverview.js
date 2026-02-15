import { useState } from 'react';
import { Users, Search, UserPlus, Star, Trophy } from 'lucide-react';
import { useToast } from '../App';




export default function StudentOverview({
  user,
  students,
  allStudents,
  characters,
  courses,
  onInviteStudent,
  selectedCourseId,
  onRefreshStudents
}) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteCourseId, setInviteCourseId] = useState(
    courses && courses.length > 0 ? courses[0]._id : ''
  );
  const [pendingIds, setPendingIds] = useState(new Set());
  const toast = useToast();


  // When opening the invite modal, set inviteCourseId to the current filter
  const handleOpenInvite = () => {
    // If a specific course is selected, use it. If "All Courses" (empty string), use first course or empty.
    setInviteCourseId(
      selectedCourseId && selectedCourseId !== ''
        ? selectedCourseId
        : (courses.length > 0 ? courses[0]._id : '')
    );
    setShowInviteModal(true);
  };

  // Remove student from course
  const handleRemoveFromCourse = async (studentId, courseId) => {
    if (!courseId) return;
    if (!window.confirm('Remove this student from the selected course?')) return;
    try {
      await fetch(`/api/students/${studentId}/remove-course`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });

      if (onRefreshStudents) await onRefreshStudents();
      toast('Removed from course', 'success');

    } catch (err) {
      toast('Failed to remove student from course.', 'error');
    }
  };


  const displayedStudents = (() => {
    // Deduplicate by student.id
    const seen = new Map();
    (selectedCourseId
      ? students.filter(
        s =>
          Array.isArray(s.studentClasses) &&
          s.studentClasses.some(cid => String(cid) === String(selectedCourseId))
      )
      : students
    ).forEach(s => {
      if (!seen.has(s.id)) seen.set(s.id, s);
    });
    return Array.from(seen.values());
  })();

  const availableStudents = (() => {
    // Deduplicate by student.id
    const seen = new Map();
    allStudents.forEach(s => {
      if (!seen.has(s.id)) seen.set(s.id, s);
    });
    // Exclude already enrolled in inviteCourseId
    return Array.from(seen.values()).filter(
      s => !(Array.isArray(s.studentClasses) &&
        s.studentClasses.some(cid => String(cid) === String(inviteCourseId))
      )
    );
  })();

  const filteredStudents = availableStudents.filter(s =>
    s.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInvite = async (studentId) => {
    if (!inviteCourseId) return;

    // block double click
    if (pendingIds.has(studentId)) return;

    setPendingIds(prev => new Set(prev).add(studentId));

    try {
      const res = await onInviteStudent(studentId, inviteCourseId);

      if (res?.status === 409) {
        toast('Student already enrolled', 'warning');
        return;
      }

      if (!res?.ok) {
        const data = await res.json().catch(() => null);
        toast(data?.message || 'Invite failed', 'error');
        return;
      }

      toast('Student invited successfully!', 'success');
      if (onRefreshStudents) await onRefreshStudents();
      setShowInviteModal(false);
      setSearchQuery('');
    } finally {
      setPendingIds(prev => {
        const next = new Set(prev);
        next.delete(studentId);
        return next;
      });
    }
  };



  const selectedCourse = courses.find(c => String(c._id) === String(inviteCourseId));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl text-amber-400">Student Overview</h2>
        <button
          onClick={handleOpenInvite}
          className=" bg-gradient-to-r from-indigo-500 to-purple-600
  hover:from-indigo-600 hover:to-purple-700
  text-white
  px-6 py-3
  rounded-full
  shadow-lg hover:shadow-indigo-500/40
  transition-all duration-200
  flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Invite Student
        </button>
      </div>

      {/* Student List */}
      {displayedStudents.length === 0 ? (
        <div className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl p-12 border-2 border-purple-400/30 backdrop-blur-sm text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-purple-400/50" />
          <h3 className="text-2xl text-white mb-2">No Students Enrolled</h3>
          <p className="text-purple-200 mb-6">
            Invite students to join your class or share your class code: <span className="text-amber-400 tracking-wider">{user.otpCode}</span>
          </p>
          <button
            onClick={handleOpenInvite}
            disabled={allStudents.length === 0}
            className="bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white px-8 py-3 rounded-lg transition-all shadow-lg inline-flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Invite Your First Student
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl p-8 border-2 border-purple-400/30 backdrop-blur-sm">
          <h3 className="text-2xl text-amber-400 mb-6">Enrolled Students ({displayedStudents.length})</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedStudents.map((student) => {
              const character = student.characterId ? characters[student.characterId] : null;
              return (
                <div
                  key={student.id}
                  className="bg-slate-800/60
                                backdrop-blur-md
                                rounded-2xl
                                p-6
                                border border-purple-400/20
                                hover:border-purple-400/40
                                hover:shadow-lg hover:shadow-purple-500/10
                                transition-all duration-300"
                                >

                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-4">
                      {character ? (
                        <img
                          src={character.avatar}
                          alt={character.name}
                          className="w-16 h-16 rounded-full border-2 border-amber-400 object-cover object-center"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center border-2 border-purple-400">
                          <Users className="w-8 h-8 text-white" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="text-white truncate">{student.name}</div>
                        <div className="text-sm text-purple-200 truncate">@{student.username}</div>

                        {/* Courses badges (display-only) */}
                        <div className="mt-2 flex flex-wrap gap-2">
                          {Array.isArray(student.studentClasses) && student.studentClasses.length > 0 ? (
                            Array.from(new Set(student.studentClasses)).map((cid) => {
                              const course = courses.find((c) => String(c._id) === String(cid));
                              return course ? (
                                <span
                                  key={cid}
                                  className="inline-flex items-center
                           bg-gradient-to-r from-amber-500/90 to-orange-500/90
                           text-white text-xs font-medium px-3 py-1 rounded-full shadow
                           border border-white/10"
                                >
                                  {course.name}{course.section ? ` (${course.section})` : ''}
                                </span>
                              ) : null;
                            })
                          ) : (
                            <span className="text-purple-300 text-xs">No courses enrolled</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Option A: One remove button per card, based on selected course filter */}
                    {selectedCourseId ? (
                      <button
                        onClick={() => handleRemoveFromCourse(student.id, selectedCourseId)}
                        className="
                              shrink-0
                              px-4 py-1.5
                              text-xs font-semibold
                              rounded-full
                              bg-gradient-to-r from-red-500/80 to-rose-600/80
                              hover:from-red-600 hover:to-rose-700
                              text-white
                              shadow-md
                              hover:shadow-red-500/40
                              transition-all duration-200
                              "
                        title="Remove from selected course"
                        type="button"
                      >
                        Remove
                      </button>

                    ) : null}
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
                <>
                  <select
                    value={inviteCourseId}
                    onChange={e => setInviteCourseId(e.target.value)}
                    className="w-full bg-slate-800/50 border-2 border-purple-400/30 rounded-lg px-4 py-3 text-white focus:border-purple-400 focus:outline-none"
                  >
                    {courses.map(course => (
                      <option key={course._id} value={course._id}>
                        {course.name} ({course.section})
                      </option>
                    ))}
                  </select>
                  {selectedCourse && (
                    <div className="mt-2 text-amber-300 text-sm font-mono">
                      <span className="font-semibold">Course OTP Code:</span> {selectedCourse.otpCode}
                    </div>
                  )}
                </>
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
                    const alreadyEnrolled = Array.isArray(student.studentClasses) &&
                      student.studentClasses.some(cid => String(cid) === String(inviteCourseId));
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
                            disabled={!inviteCourseId || alreadyEnrolled || pendingIds.has(student.id)}

                          >
                            <UserPlus className="w-4 h-4" />
                            {alreadyEnrolled ? "Already Enrolled" : "Invite"}
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