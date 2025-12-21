import { Users, Scroll, TrendingUp, BookOpen } from 'lucide-react';
import { User, Character } from '../App';



export default function TeacherHome({ user, students, characters , selectedCourse }) {
  const totalStudents = students.length;
  const totalQuests = 3; // Mock data
  const avgLevel = students.length > 0
    ? Math.round(students.reduce((sum, student) => {
        const char = student.characterId ? characters[student.characterId] : null;
        return sum + (char?.level || 0);
      }, 0) / students.length)
    : 0;

  const recentStudents = students.slice(-5).reverse();

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-amber-800/50 to-orange-800/50 rounded-2xl p-8 border-2 border-amber-400/30 backdrop-blur-sm">
        <h2 className="text-4xl text-amber-400 mb-2">Welcome, {user.name}!</h2>       
        <p className="text-xl text-amber-200">
          {selectedCourse
            ? <>Manage your <span className ="font-bold text-white">{selectedCourse} </span>class</>
            : "Manage your classes"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl p-6 border-2 border-blue-400/30 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-blue-400" />
            <div className="text-3xl text-white">{totalStudents}</div>
          </div>
          <div className="text-purple-200">Total Students</div>
        </div>

        <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 rounded-xl p-6 border-2 border-amber-400/30 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <Scroll className="w-8 h-8 text-amber-400" />
            <div className="text-3xl text-white">{totalQuests}</div>
          </div>
          <div className="text-purple-200">Active Quests</div>
        </div>

        <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl p-6 border-2 border-green-400/30 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-green-400" />
            <div className="text-3xl text-white">{avgLevel}</div>
          </div>
          <div className="text-purple-200">Average Level</div>
        </div>

        <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl p-6 border-2 border-purple-400/30 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-purple-400" />
            <div className="text-3xl text-white">{user.otpCode}</div>
          </div>
          <div className="text-purple-200">Class Code</div>
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
                <div className="text-sm text-purple-300">Subject</div>
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
                <div className="text-sm text-purple-300">Class OTP Code</div>
                <div className="text-2xl text-amber-400 tracking-wider">{user.otpCode}</div>
                <div className="text-xs text-purple-300 mt-1">
                  Share this code with students to join your class
                </div>
              </div>
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
            Share your class code <span className="text-amber-400 tracking-wider">{user.otpCode}</span> with students to get started!
          </p>
        </div>
      )}
    </div>
  );
}
