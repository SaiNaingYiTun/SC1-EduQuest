import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { GraduationCap, Users } from "lucide-react";
import { motion } from "motion/react";

export function RoleSelection({ onSelectRole }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl mb-4 text-white">EduQuest</h1>
          <p className="text-xl text-purple-200">Transform Learning Into An Epic Adventure</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Card className="h-full bg-white/95 backdrop-blur-md border-white/20 hover:shadow-2xl transition-all cursor-pointer">
              <CardHeader className="text-center pb-4">
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-12 h-12 text-white" />
                </div>
                <CardTitle className="text-2xl">I'm a Student</CardTitle>
                <CardDescription className="text-base">
                  Embark on quests, earn XP, and level up while learning
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Choose your character class
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Complete interactive quizzes
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Collect items and rewards
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Compete on global leaderboards
                  </li>
                </ul>
                <Button 
                  onClick={() => onSelectRole('student')}
                  className="w-full mt-6"
                  size="lg"
                >
                  Start Your Adventure
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Card className="h-full bg-white/95 backdrop-blur-md border-white/20 hover:shadow-2xl transition-all cursor-pointer">
              <CardHeader className="text-center pb-4">
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                  <Users className="w-12 h-12 text-white" />
                </div>
                <CardTitle className="text-2xl">I'm a Teacher</CardTitle>
                <CardDescription className="text-base">
                  Create quests, track progress, and inspire learners
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Create custom quizzes and quests
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Track student progress and analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    View class performance insights
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Manage assignments and rewards
                  </li>
                </ul>
                <Button 
                  onClick={() => onSelectRole('teacher')}
                  className="w-full mt-6"
                  size="lg"
                  variant="outline"
                >
                  Access Teacher Portal
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
