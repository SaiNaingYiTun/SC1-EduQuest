import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Heart, Zap, Trophy, Star } from "lucide-react";
import { motion } from "motion/react";

export function CharacterStats({ character }) {
  const xpPercentage = (character.xp / character.maxXp) * 100;
  const hpPercentage = (character.hp / character.maxHp) * 100;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
      <div className="flex items-center gap-4">
        <div className={`p-4 rounded-lg ${character.color}`}>
          <character.icon className="w-10 h-10 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl">{character.name}</h2>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{character.className}</Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              Level {character.level}
            </Badge>
          </div>
        </div>
      </div>

      {/* HP Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-600">
            <Heart className="w-4 h-4" />
            <span>HP</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {character.hp} / {character.maxHp}
          </span>
        </div>
        <Progress value={hpPercentage} className="h-2 bg-red-100" />
      </div>

      {/* XP Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-600">
            <Zap className="w-4 h-4" />
            <span>XP</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {character.xp} / {character.maxXp}
          </span>
        </div>
        <div className="relative">
          <Progress value={xpPercentage} className="h-2" />
          {xpPercentage === 100 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-8 right-0 bg-yellow-400 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
            >
              <Trophy className="w-3 h-3" />
              Ready to Level Up!
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
