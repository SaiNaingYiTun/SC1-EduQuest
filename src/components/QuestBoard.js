import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { motion } from "motion/react";
import { Sparkles, Clock, Trophy } from "lucide-react";

const difficultyColors = {
  easy: 'bg-green-100 text-green-700 border-green-300',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  hard: 'bg-red-100 text-red-700 border-red-300'
};

export function QuestBoard({ quests, onSelectQuest }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-6 h-6 text-purple-600" />
        <h2 className="text-2xl">Available Quests</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quests.map((quest, index) => (
          <motion.div
            key={quest.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`h-full ${quest.completed ? 'opacity-60' : 'hover:shadow-lg transition-shadow'}`}>
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge className={difficultyColors[quest.difficulty]}>
                    {quest.difficulty}
                  </Badge>
                  {quest.completed && (
                    <Badge variant="secondary">✓ Completed</Badge>
                  )}
                </div>
                <CardTitle>{quest.title}</CardTitle>
                <CardDescription>{quest.subject}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{quest.description}</p>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {quest.duration}
                  </div>
                  <div className="flex items-center gap-1 text-blue-600">
                    <Sparkles className="w-4 h-4" />
                    {quest.xpReward} XP
                  </div>
                </div>

                {quest.itemReward && (
                  <div className="flex items-center gap-1 text-sm text-purple-600">
                    <Trophy className="w-4 h-4" />
                    Reward: {quest.itemReward}
                  </div>
                )}

                <Button 
                  onClick={() => onSelectQuest(quest)} 
                  className="w-full"
                  disabled={quest.completed}
                >
                  {quest.completed ? 'Completed' : 'Start Quest'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
