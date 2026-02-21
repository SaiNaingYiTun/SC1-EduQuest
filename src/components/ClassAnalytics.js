import { TrendingUp, Users, Award, Target } from 'lucide-react';
import { User, Character } from '../App';



export default function ClassAnalytics({ students, characters,selectedCourse }) {
  // Calculate analytics
  const totalStudents = students.length;
  const studentsWithCharacters = students.filter(s => s.characterId).length;
  
  const levels = students
    .map(s => s.characterId ? characters[s.characterId]?.level || 0 : 0)
    .filter(l => l > 0);
  
  const avgLevel = levels.length > 0
    ? (levels.reduce((sum, level) => sum + level, 0) / levels.length).toFixed(1)
    : 0;
  
  const totalXP = students.reduce((sum, student) => {
    const char = student.characterId ? characters[student.characterId] : null;
    return sum + (char?.xp || 0);
  }, 0);

  // Level distribution
  const levelDistribution = {
    beginner: levels.filter(l => l >= 1 && l <= 3).length,
    intermediate: levels.filter(l => l >= 4 && l <= 7).length,
    advanced: levels.filter(l => l >= 8 && l <= 10).length,
    expert: levels.filter(l => l > 10).length,
  };

  const maxDistribution = Math.max(...Object.values(levelDistribution));

  // Top performers
  const topPerformers = students
    .map(s => ({
      student: s,
      character: s.characterId ? characters[s.characterId] : null
    }))
    .filter(p => p.character)
    .sort((a, b) => {
      if (!a.character || !b.character) return 0;
      if (b.character.level !== a.character.level) {
        return b.character.level - a.character.level;
      }
      return b.character.xp - a.character.xp;
    })
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl text-amber-400 mb-2">Class Analytics</h2>
        <p className="text-xl text-purple-200">Track your class performance</p>
        
      </div>

      {totalStudents === 0 ? (
        <div className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl p-12 border-2 border-purple-400/30 backdrop-blur-sm text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-purple-400/50" />
          <h3 className="text-2xl text-white mb-2">No Data Available</h3>
          <p className="text-purple-200">
            Add students to your class to view analytics
          </p>
        </div>
      ) : (
        <>
          {/* Overview Stats */}
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl p-6 border-2 border-blue-400/30 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-8 h-8 text-blue-400" />
                <div className="text-3xl text-white">{totalStudents}</div>
              </div>
              <div className="text-purple-200">Total Students</div>
            </div>

            <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl p-6 border-2 border-green-400/30 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-8 h-8 text-green-400" />
                <div className="text-3xl text-white">{avgLevel}</div>
              </div>
              <div className="text-purple-200">Average Level</div>
            </div>

            <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 rounded-xl p-6 border-2 border-amber-400/30 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-8 h-8 text-amber-400" />
                <div className="text-3xl text-white">{totalXP}</div>
              </div>
              <div className="text-purple-200">Total XP Earned</div>
            </div>

            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl p-6 border-2 border-purple-400/30 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-8 h-8 text-purple-400" />
                <div className="text-3xl text-white">{studentsWithCharacters}</div>
              </div>
              <div className="text-purple-200">Active Characters</div>
            </div>
          </div>

          {/* Level Distribution */}
          <div className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl p-8 border-2 border-purple-400/30 backdrop-blur-sm">
            <h3 className="text-2xl text-amber-400 mb-6">Level Distribution</h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-500"></div>
                    <span className="text-white">Beginner (Level 1-3)</span>
                  </div>
                  <span className="text-purple-200">{levelDistribution.beginner} students</span>
                </div>
                <div className="bg-slate-800/50 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-full transition-all"
                    style={{ width: `${maxDistribution > 0 ? (levelDistribution.beginner / maxDistribution) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-blue-500"></div>
                    <span className="text-white">Intermediate (Level 4-7)</span>
                  </div>
                  <span className="text-purple-200">{levelDistribution.intermediate} students</span>
                </div>
                <div className="bg-slate-800/50 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full transition-all"
                    style={{ width: `${maxDistribution > 0 ? (levelDistribution.intermediate / maxDistribution) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-purple-500"></div>
                    <span className="text-white">Advanced (Level 8-10)</span>
                  </div>
                  <span className="text-purple-200">{levelDistribution.advanced} students</span>
                </div>
                <div className="bg-slate-800/50 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all"
                    style={{ width: `${maxDistribution > 0 ? (levelDistribution.advanced / maxDistribution) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-amber-500"></div>
                    <span className="text-white">Expert (Level 11+)</span>
                  </div>
                  <span className="text-purple-200">{levelDistribution.expert} students</span>
                </div>
                <div className="bg-slate-800/50 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all"
                    style={{ width: `${maxDistribution > 0 ? (levelDistribution.expert / maxDistribution) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Top Performers */}
          {topPerformers.length > 0 && (
            <div className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl p-8 border-2 border-purple-400/30 backdrop-blur-sm">
              <h3 className="text-2xl text-amber-400 mb-6">Top Performers</h3>
              
              <div className="space-y-4">
                {topPerformers.map((performer, index) => {
                  const { student, character } = performer;
                  if (!character) return null;

                  const rankColor = index === 0 ? 'amber' : index === 1 ? 'gray' : index === 2 ? 'orange' : 'purple';
                  const medals = ['🥇', '🥈', '🥉'];

                  return (
                    <div
                      key={student.id}
                      className={`bg-gradient-to-r from-${rankColor}-600/10 to-transparent rounded-lg p-4 border-2 border-${rankColor}-400/30`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{medals[index] || '🏆'}</div>
                        
                        <img
                          src={character.avatar}
                          alt={character.name}
                          className="w-14 h-14 rounded-full border-2 border-amber-400 object-cover"
                        />
                        
                        <div className="flex-1">
                          <div className="text-white">{student.name}</div>
                          <div className="text-sm text-purple-200">
                            {character.name} • {character.class}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-white">Level {character.level}</div>
                          <div className="text-sm text-purple-200">{character.xp} XP</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Engagement Stats */}
          <div className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl p-8 border-2 border-purple-400/30 backdrop-blur-sm">
            <h3 className="text-2xl text-amber-400 mb-6">Engagement</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 rounded-lg p-6 border-2 border-purple-400/30">
                <div className="text-center">
                  <div className="text-5xl text-green-400 mb-2">
                    {totalStudents > 0 ? ((studentsWithCharacters / totalStudents) * 100).toFixed(0) : 0}%
                  </div>
                  <div className="text-purple-200">Character Creation Rate</div>
                  <div className="text-sm text-purple-300 mt-2">
                    {studentsWithCharacters} of {totalStudents} students created characters
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-6 border-2 border-purple-400/30">
                <div className="text-center">
                  <div className="text-5xl text-blue-400 mb-2">
                    {studentsWithCharacters > 0 ? Math.round(totalXP / studentsWithCharacters) : 0}
                  </div>
                  <div className="text-purple-200">Avg XP per Active Student</div>
                  <div className="text-sm text-purple-300 mt-2">
                    Total {totalXP} XP earned across all students
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
