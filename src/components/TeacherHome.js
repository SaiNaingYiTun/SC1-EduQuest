import { Users, Scroll, GraduationCap, BookOpen } from 'lucide-react';
import { User, Character } from '../App';



export default function TeacherHome({ user, students, characters, selectedCourse, dashboardStats }) {
  const totalStudents = students.length;
  const totalCourses = dashboardStats?.totalCourses || 0;
  const totalQuests = dashboardStats?.totalQuests || 0;

  const recentStudents = students.slice(-5).reverse();

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700/40 to-purple-800/40 rounded-2xl p-8 border border-indigo-400/20">
        <h2 className="text-3xl font-semibold text-white mb-2">
          Dashboard Overview
        </h2>
        <p className="text-purple-200">
          {selectedCourse
            ? <>Currently viewing  
              <span className="text-amber-400 font-medium">
                {selectedCourse.name} {selectedCourse.section && `(${selectedCourse.section})`}
              </span>
            </>
            : "Overview of all your courses"}
        </p>
      </div>


      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-slate-800/60 rounded-xl p-6 border border-indigo-400/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-purple-300">Total Students</div>
              <div className="text-3xl font-bold text-white">{totalStudents}</div>
            </div>
            <Users className="w-8 h-8 text-indigo-400" />
          </div>
        </div>

        <div className="bg-slate-800/60 rounded-xl p-6 border border-green-400/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-purple-300">Active Course</div>
              <div className="text-3xl font-bold text-white">{totalCourses}</div>
            </div>
            <GraduationCap className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-slate-800/60 rounded-xl p-6 border border-amber-400/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-purple-300">Active Quests</div>
              <div className="text-3xl font-bold text-white">{totalQuests}</div>
            </div>
            <Scroll className="w-8 h-8 text-amber-400" />
          </div>
        </div>
      </div>


      {/* Class Information */}
      <div className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl p-8 border-2 border-purple-400/30 backdrop-blur-sm">
        <h3 className="text-2xl text-amber-400 mb-6">Class Information</h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 rounded-lg p-6 border-2 border-purple-400/30">
            <div className="flex items-center gap-4 mb-4">
              <BookOpen className="w-8 h-8 text-amber-400" />
              <h4 className="text-xl text-white">Course Details</h4>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-purple-300">Faculty</div>
                <div className="text-white">{user.subjects}</div>
              </div>
              <div>
                <div className="text-sm text-purple-300">Instructor</div>
                <div className="text-white">{user.name}</div>
              </div>
              <div>
                <div className="text-sm text-purple-300">Username</div>
                <div className="text-white">@{user.username}</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-6 border-2 border-amber-400/30">
            <div className="flex items-center gap-4 mb-4">
              <Users className="w-8 h-8 text-amber-400" />
              <h4 className="text-xl text-white">Enrollment</h4>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-purple-300">Total Enrolled</div>
                <div className="text-white">{totalStudents} Students</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Students */}
      {recentStudents.length > 0 && (
        <div className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl p-8 border-2 border-purple-400/30 backdrop-blur-sm">
          <h3 className="text-2xl text-amber-400 mb-6">Recently Joined Students</h3>

          <div className="space-y-3">
            {recentStudents.map((student) => {
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
                      <div className="text-right">
                        <div className="text-white">Level {character.level}</div>
                        <div className="text-sm text-purple-200">{character.class}</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {totalStudents === 0 && (
        <div className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl p-12 border-2 border-purple-400/30 backdrop-blur-sm text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-purple-400/50" />
          <h3 className="text-2xl text-white mb-2">No Students Yet</h3>
          <p className="text-purple-200 mb-6">
            Invite students from the Students tab to start building your class.
          </p>
        </div>
      )}
    </div>
  );
}
