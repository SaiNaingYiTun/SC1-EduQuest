import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Trophy, Medal, Award } from "lucide-react";
import { motion } from "motion/react";

export function Leaderboard({ entries, currentUser }) {
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-600" />;
      default:
        return <div className="w-6 h-6 flex items-center justify-center">{rank}</div>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Global Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {entries.map((entry, index) => {
          const isCurrentUser = entry.username === currentUser;
          
          return (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                isCurrentUser ? 'bg-blue-50 border-2 border-blue-300' : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex-shrink-0">
                {getRankIcon(entry.rank)}
              </div>
              
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                <span>{entry.avatar}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={isCurrentUser ? 'text-blue-700' : ''}>
                    {entry.username}
                  </span>
                  {isCurrentUser && <Badge variant="secondary">You</Badge>}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{entry.className}</span>
                  <span>•</span>
                  <span>Level {entry.level}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-muted-foreground">Total XP</div>
                <div>{entry.totalXp.toLocaleString()}</div>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
