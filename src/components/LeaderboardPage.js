import { Trophy, Medal, Crown, Star } from 'lucide-react';
import { Character } from '../App';



// Mock leaderboard data
const mockLeaderboard = [
  { id: '1', name: 'DragonSlayer99', class: 'Warrior', level: 15, xp: 1450, avatar: 'https://images.unsplash.com/photo-1635921481467-fba710b8e65c?w=100' },
  { id: '2', name: 'WizardMaster', class: 'Mage', level: 14, xp: 1380, avatar: 'https://images.unsplash.com/photo-1511174944925-a99f10911d45?w=100' },
  { id: '3', name: 'ShadowNinja', class: 'Rogue', level: 13, xp: 1250, avatar: 'https://images.unsplash.com/photo-1562008752-2459495a0c05?w=100' },
  { id: '4', name: 'HolyKnight', class: 'Cleric', level: 12, xp: 1150, avatar: 'https://images.unsplash.com/photo-1659489727971-4bbee4d4b312?w=100' },
  { id: '5', name: 'BraveHero', class: 'Warrior', level: 11, xp: 1050, avatar: 'https://images.unsplash.com/photo-1635921481467-fba710b8e65c?w=100' },
  { id: '6', name: 'MysticSage', class: 'Mage', level: 10, xp: 950, avatar: 'https://images.unsplash.com/photo-1511174944925-a99f10911d45?w=100' },
  { id: '7', name: 'SwiftArcher', class: 'Rogue', level: 9, xp: 850, avatar: 'https://images.unsplash.com/photo-1562008752-2459495a0c05?w=100' },
  { id: '8', name: 'LightBearer', class: 'Cleric', level: 8, xp: 750, avatar: 'https://images.unsplash.com/photo-1659489727971-4bbee4d4b312?w=100' },
];

export default function LeaderboardPage({ character }) {
  // Add current character to leaderboard
  const allPlayers = [
    ...mockLeaderboard,
    {
      id: character.id,
      name: character.name,
      class: character.class,
      level: character.level,
      xp: character.xp,
      avatar: character.avatar,
    }
  ].sort((a, b) => {
    if (b.level !== a.level) return b.level - a.level;
    return b.xp - a.xp;
  });

  const currentPlayerRank = allPlayers.findIndex(p => p.id === character.id) + 1;

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-purple-400">#{rank}</span>;
    }
  };

  const getRankBg = (rank) => {
    switch (rank) {
      case 1:
        return 'from-yellow-600/30 to-amber-600/30 border-yellow-400/50';
      case 2:
        return 'from-gray-400/20 to-gray-600/20 border-gray-400/50';
      case 3:
        return 'from-amber-700/20 to-orange-700/20 border-amber-600/50';
      default:
        return 'from-purple-800/20 to-blue-800/20 border-purple-400/30';
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl text-amber-400 mb-2">Leaderboard</h2>
        <p className="text-xl text-purple-200">Compete with fellow adventurers</p>
      </div>

      {/* Current Player Rank Card */}
      <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 rounded-2xl p-6 border-2 border-amber-400/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🏆</div>
            <div>
              <div className="text-purple-200">Your Rank</div>
              <div className="text-3xl text-white">#{currentPlayerRank}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-purple-200">Level {character.level}</div>
            <div className="text-white">{character.xp} XP</div>
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {allPlayers.slice(0, 3).map((player, index) => {
          const rank = index + 1;
          const isCurrentPlayer = player.id === character.id;

          return (
            <div
              key={player.id}
              className={`${rank === 1 ? 'md:order-2 md:-mt-8' : rank === 2 ? 'md:order-1' : 'md:order-3'}`}
            >
              <div className={`bg-gradient-to-br ${getRankBg(rank)} rounded-2xl p-6 border-2 backdrop-blur-sm ${
                isCurrentPlayer ? 'ring-4 ring-amber-400' : ''
              }`}>
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    {getRankIcon(rank)}
                  </div>
                  
                  <img
                    src={player.avatar}
                    alt={player.name}
                    className={`w-20 h-20 rounded-full mx-auto mb-4 object-cover ${
                      rank === 1 ? 'border-4 border-yellow-400 w-24 h-24' : 'border-2 border-purple-400'
                    }`}
                  />
                  
                  <h3 className={`${rank === 1 ? 'text-2xl' : 'text-xl'} text-white mb-1 ${
                    isCurrentPlayer ? 'text-amber-400' : ''
                  }`}>
                    {player.name}
                    {isCurrentPlayer && ' (You)'}
                  </h3>
                  <div className="text-purple-200 mb-2">{player.class}</div>
                  <div className="flex items-center justify-center gap-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400" />
                      <span className="text-white">Lv. {player.level}</span>
                    </div>
                    <div className="text-purple-300">{player.xp} XP</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rest of Leaderboard */}
      {allPlayers.length > 3 && (
        <div className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl p-6 border-2 border-purple-400/30 backdrop-blur-sm">
          <h3 className="text-2xl text-amber-400 mb-6">Rankings</h3>
          
          <div className="space-y-3">
            {allPlayers.slice(3).map((player, index) => {
              const rank = index + 4;
              const isCurrentPlayer = player.id === character.id;

              return (
                <div
                  key={player.id}
                  className={`bg-slate-800/30 rounded-lg p-4 border transition-all ${
                    isCurrentPlayer
                      ? 'border-2 border-amber-400 bg-amber-600/10'
                      : 'border border-purple-400/20 hover:border-purple-400/40'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 text-center">
                      {getRankIcon(rank)}
                    </div>
                    
                    <img
                      src={player.avatar}
                      alt={player.name}
                      className="w-12 h-12 rounded-full border-2 border-purple-400 object-cover"
                    />
                    
                    <div className="flex-1">
                      <div className={`text-white ${isCurrentPlayer ? 'text-amber-400' : ''}`}>
                        {player.name}
                        {isCurrentPlayer && ' (You)'}
                      </div>
                      <div className="text-sm text-purple-200">{player.class}</div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-white">
                        <Star className="w-4 h-4 text-amber-400" />
                        <span>Lv. {player.level}</span>
                      </div>
                      <div className="text-sm text-purple-300">{player.xp} XP</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
