import { useState } from 'react';
import { Search, BookOpen, Check } from 'lucide-react';
import { User } from '../App';



export default function ClassesPage({ studentClasses, teachers, onJoinClass }) {
  const [teacherUsername, setTeacherUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);

  const handleJoin = (e) => {
    e.preventDefault();
    
    if (!teacherUsername.trim() || !otp.trim()) {
      alert('Please fill in all fields');
      return;
    }

    const success = onJoinClass(teacherUsername, otp);
    if (success) {
      alert('Successfully joined class!');
      setTeacherUsername('');
      setOtp('');
      setShowJoinForm(false);
    }
  };

  const myTeachers = teachers.filter(t => studentClasses.includes(t.id));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl text-amber-400">My Classes</h2>
        <button
          onClick={() => setShowJoinForm(!showJoinForm)}
          className="bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white px-6 py-3 rounded-lg transition-all shadow-lg flex items-center gap-2"
        >
          <Search className="w-5 h-5" />
          Join New Class
        </button>
      </div>

      {/* Join Class Form */}
      {showJoinForm && (
        <div className="bg-gradient-to-br from-blue-800/30 to-purple-800/30 rounded-2xl p-8 border-2 border-blue-400/30 backdrop-blur-sm">
          <h3 className="text-2xl text-amber-400 mb-6">Join a Class</h3>
          
          <form onSubmit={handleJoin} className="space-y-6">
            <div>
              <label className="block text-purple-100 mb-2">Teacher Username</label>
              <input
                type="text"
                value={teacherUsername}
                onChange={(e) => setTeacherUsername(e.target.value)}
                className="w-full bg-slate-800/50 border-2 border-purple-400/30 rounded-lg px-4 py-3 text-white placeholder-purple-300 focus:border-purple-400 focus:outline-none"
                placeholder="Enter teacher's username"
              />
            </div>

            <div>
              <label className="block text-purple-100 mb-2">Class OTP Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.toUpperCase())}
                className="w-full bg-slate-800/50 border-2 border-purple-400/30 rounded-lg px-4 py-3 text-white placeholder-purple-300 focus:border-purple-400 focus:outline-none uppercase"
                placeholder="Enter OTP code provided by teacher"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white py-3 rounded-lg transition-all shadow-lg"
              >
                Join Class
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowJoinForm(false);
                  setTeacherUsername('');
                  setOtp('');
                }}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* My Classes List */}
      {myTeachers.length === 0 ? (
        <div className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl p-12 border-2 border-purple-400/30 backdrop-blur-sm text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-purple-400/50" />
          <h3 className="text-2xl text-white mb-2">No Classes Yet</h3>
          <p className="text-purple-200 mb-6">
            Join a class using your teacher's username and OTP code to start your learning journey!
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {myTeachers.map((teacher) => (
            <div
              key={teacher.id}
              className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl p-8 border-2 border-purple-400/30 backdrop-blur-sm hover:border-purple-400/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-6 h-6 text-amber-400" />
                    <h3 className="text-2xl text-white">{teacher.subjects}</h3>
                  </div>
                  <div className="text-purple-200">
                    Instructor: {teacher.name}
                  </div>
                  <div className="text-sm text-purple-300">
                    @{teacher.username}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-400/20">
                <div className="text-sm text-purple-300 mb-1">Class Code</div>
                <div className="text-lg text-amber-400 tracking-wider">{teacher.otpCode}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
