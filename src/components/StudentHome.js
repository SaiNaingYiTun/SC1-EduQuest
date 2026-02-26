import { Trophy, Star, Zap, BookOpen } from 'lucide-react';
import { Character, Achievement, User } from '../App';



export default function StudentHome({ character, achievements, studentClasses, teachers }) {
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const xpProgress = (character.xp / character.maxXp) * 100;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-800/50 to-blue-800/50 rounded-2xl p-8 border-2 border-purple-400/30 backdrop-blur-sm">
        <h2 className="text-4xl text-amber-400 mb-2 font-pixel">Welcome back, {character.name}!</h2>
        <p className="text-xl text-purple-200 font-pixel">Ready for your next adventure?</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl p-6 border-2 border-blue-400/30 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-8 h-8 text-blue-400" />
            <div className="text-3xl text-white font-pixel">{character.level}</div>
          </div>
          <div className="text-purple-200 font-pixel">Current Level</div>
        </div>

        <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 rounded-xl p-6 border-2 border-amber-400/30 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-8 h-8 text-amber-400" />
            <div className="text-3xl text-white font-pixel">{character.xp}</div>
          </div>
          <div className="text-purple-200 font-pixel">Total XP</div>
        </div>

        <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl p-6 border-2 border-green-400/30 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-green-400" />
            <div className="text-3xl text-white font-pixel">{unlockedAchievements.length}</div>
          </div>
          <div className="text-purple-200 font-pixel">Achievements</div>
        </div>

        <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl p-6 border-2 border-purple-400/30 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-purple-400" />
            <div className="text-3xl text-white font-pixel">{studentClasses.length}</div>
          </div>
          <div className="text-purple-200 font-pixel">Classes Joined</div>
        </div>
      </div>

      {/* Character Progress */}
      <div className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl p-8 border-2 border-purple-400/30 backdrop-blur-sm">
        <h3 className="text-2xl text-amber-400 mb-4 font-pixel">Character Progress</h3>
        
        <div className="flex items-center gap-6 mb-6">
          <img 
            src={character.avatar} 
            alt={character.name}
            className="w-24 h-24 rounded-full border-4 border-amber-400 object-cover shadow-lg"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-2xl text-white font-pixel">{character.name}</div>
                <div className="text-purple-200 font-pixel">{character.class}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl text-amber-400 font-pixel">Level {character.level}</div>
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-full h-6 overflow-hidden border-2 border-purple-400/30">
              <div
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all duration-500 flex items-center justify-center"
                style={{ width: `${xpProgress}%` }}
              >
                {xpProgress > 20 && (
                  <span className="text-sm text-white px-2 font-pixel">
                    {character.xp} / {character.maxXp} XP
                  </span>
                )}
              </div>
            </div>
            {xpProgress <= 20 && (
              <div className="text-sm text-purple-200 mt-1 font-pixel">
                {character.xp} / {character.maxXp} XP
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl p-8 border-2 border-purple-400/30 backdrop-blur-sm">
        <h3 className="text-2xl text-amber-400 mb-6 font-pixel">Recent Achievements</h3>
        
        {unlockedAchievements.length === 0 ? (
          <div className="text-center py-8 text-purple-200 font-pixel">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-purple-400/50" />
            <p>Complete quests to unlock achievements!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockedAchievements.slice(0, 6).map((achievement) => (
              <div
                key={achievement.id}
                className="bg-gradient-to-br from-amber-600/20 to-yellow-600/20 rounded-xl p-4 border-2 border-amber-400/30"
              >
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <div className="text-white mb-1 font-pixel">{achievement.title}</div>
                <div className="text-sm text-purple-200 font-pixel">{achievement.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
