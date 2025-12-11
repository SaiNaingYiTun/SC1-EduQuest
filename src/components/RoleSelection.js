import { Sword, BookOpen } from 'lucide-react';



export default function RoleSelection({ onSelectRole }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-6xl mb-4 text-amber-400">⚔️ EduQuest ⚔️</h1>
          <p className="text-xl text-purple-200">Choose Your Path, Brave Adventurer</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Student Card */}
          <button
            onClick={() => onSelectRole('student')}
            className="group relative bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-8 hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-blue-500/50 border-4 border-blue-400"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent rounded-2xl" />
            
            <div className="relative">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                  <Sword className="w-12 h-12 text-white" />
                </div>
              </div>
              
              <h2 className="text-3xl mb-4 text-white">Student</h2>
              <p className="text-blue-100 mb-6">
                Embark on epic quests, level up your character, and compete with fellow adventurers on the leaderboards!
              </p>
              
              <div className="space-y-2 text-left text-blue-50">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400">⭐</span>
                  <span>Create your unique character</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400">⭐</span>
                  <span>Complete quests and earn XP</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400">⭐</span>
                  <span>Unlock achievements</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400">⭐</span>
                  <span>Climb the leaderboards</span>
                </div>
              </div>
            </div>
          </button>

          {/* Teacher Card */}
          <button
            onClick={() => onSelectRole('teacher')}
            className="group relative bg-gradient-to-br from-amber-600 to-orange-700 rounded-2xl p-8 hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-amber-500/50 border-4 border-amber-400"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-transparent rounded-2xl" />
            
            <div className="relative">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-amber-500 flex items-center justify-center shadow-lg">
                  <BookOpen className="w-12 h-12 text-white" />
                </div>
              </div>
              
              <h2 className="text-3xl mb-4 text-white">Teacher</h2>
              <p className="text-amber-100 mb-6">
                Craft challenging quests, guide your students, and monitor their progress through the realm of knowledge!
              </p>
              
              <div className="space-y-2 text-left text-amber-50">
                <div className="flex items-center gap-2">
                  <span className="text-blue-300">📜</span>
                  <span>Create custom quests</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-300">📜</span>
                  <span>Manage your class</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-300">📜</span>
                  <span>Track student progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-300">📜</span>
                  <span>Analyze class performance</span>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
