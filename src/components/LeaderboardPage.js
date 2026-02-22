import { useEffect, useMemo, useState } from 'react';
import { Medal, Crown, Star } from 'lucide-react';

export default function LeaderboardPage({
  user,
  character,
  authFetch,
  studentClasses = [],
  courses = []
}) {
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const enrolledCourses = useMemo(() => {
    const enrolledSet = new Set((studentClasses || []).map(String));
    return (courses || []).filter((course) => enrolledSet.has(String(course._id)));
  }, [studentClasses, courses]);

  useEffect(() => {
    if (!enrolledCourses.length) {
      setSelectedCourseId('');
      return;
    }

    const stillValid = enrolledCourses.some((c) => String(c._id) === String(selectedCourseId));
    if (!selectedCourseId || !stillValid) {
      setSelectedCourseId(String(enrolledCourses[0]._id));
    }
  }, [enrolledCourses, selectedCourseId]);

  useEffect(() => {
    let isCancelled = false;

    const loadLeaderboard = async () => {
      if (!selectedCourseId || !authFetch) {
        setPlayers([]);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const res = await authFetch(`/api/courses/${selectedCourseId}/leaderboard`);
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.message || 'Failed to load leaderboard');
        }

        if (!isCancelled) {
          setPlayers(Array.isArray(data.leaderboard) ? data.leaderboard : []);
        }
      } catch (err) {
        if (!isCancelled) {
          setPlayers([]);
          setError(err.message || 'Failed to load leaderboard');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadLeaderboard();
    return () => {
      isCancelled = true;
    };
  }, [selectedCourseId, authFetch]);

  const allPlayers = players;
  const currentPlayerRank = allPlayers.findIndex((p) => String(p.id) === String(user?.id)) + 1;
  const currentPlayer = allPlayers.find((p) => String(p.id) === String(user?.id));

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

  const renderAvatar = (player, sizeClass) => {
    if (player.avatar) {
      return (
        <img
          src={player.avatar}
          alt={player.name}
          className={`${sizeClass} rounded-full border-2 border-purple-400 object-cover`}
        />
      );
    }

    const initial = player.name?.trim()?.charAt(0)?.toUpperCase() || '?';
    return (
      <div className={`${sizeClass} rounded-full border-2 border-purple-400 bg-purple-900/70 text-white grid place-items-center`}>
        {initial}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl text-amber-400 mb-2">Leaderboard</h2>
        <p className="text-xl text-purple-200">Compete with fellow adventurers in your class</p>
      </div>

      <div className="max-w-md mx-auto">
        <label className="block text-purple-200 mb-2">Course</label>
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-slate-900/80 border border-purple-400/40 text-white"
          disabled={enrolledCourses.length === 0}
        >
          {enrolledCourses.length === 0 ? (
            <option value="">No enrolled courses</option>
          ) : (
            enrolledCourses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.name}{course.section ? ` (${course.section})` : ''}
              </option>
            ))
          )}
        </select>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-400/40 text-red-200 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center text-purple-200">Loading leaderboard...</div>
      )}

      {!loading && !error && selectedCourseId && allPlayers.length === 0 && (
        <div className="text-center text-purple-200">No ranked students in this course yet.</div>
      )}

      {!loading && !error && allPlayers.length > 0 && (
        <>
          <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 rounded-2xl p-6 border-2 border-amber-400/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🏆</div>
                <div>
                  <div className="text-purple-200">Your Rank</div>
                  <div className="text-3xl text-white">{currentPlayerRank > 0 ? `#${currentPlayerRank}` : 'Unranked'}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-purple-200">Level {currentPlayer?.level ?? character?.level ?? 1}</div>
                <div className="text-white">{currentPlayer?.xp ?? character?.xp ?? 0} XP</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {allPlayers.slice(0, 3).map((player, index) => {
              const rank = index + 1;
              const isCurrentPlayer = String(player.id) === String(user?.id);

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

                      <div className="flex justify-center mb-4">
                        {renderAvatar(player, rank === 1 ? 'w-24 h-24' : 'w-20 h-20')}
                      </div>

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

          {allPlayers.length > 3 && (
            <div className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl p-6 border-2 border-purple-400/30 backdrop-blur-sm">
              <h3 className="text-2xl text-amber-400 mb-6">Rankings</h3>

              <div className="space-y-3">
                {allPlayers.slice(3).map((player, index) => {
                  const rank = index + 4;
                  const isCurrentPlayer = String(player.id) === String(user?.id);

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

                        {renderAvatar(player, 'w-12 h-12')}

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
        </>
      )}
    </div>
  );
}