import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { QuizCreator } from "./QuizCreator";
import { StudentProgress } from "./StudentProgress";
import { ClassOverview } from "./ClassOverview";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { LogOut, LayoutDashboard, Users, BookOpen, Plus, Edit, Trash2 } from "lucide-react";
import { motion } from "motion/react";

export function TeacherDashboard({ onLogout, customQuizzes, onCreateQuiz, onDeleteQuiz }) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-3xl bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent"
              >
                EduQuest Teacher Portal
              </motion.h1>
              <p className="text-sm text-muted-foreground mt-1">Manage quests and track student progress</p>
            </div>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Exit Portal
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Students</span>
            </TabsTrigger>
            <TabsTrigger value="quests" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Quests</span>
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <ClassOverview />
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students">
            <StudentProgress />
          </TabsContent>

          {/* Quests Management Tab */}
          <TabsContent value="quests">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl mb-2">Quest Library</h2>
                  <p className="text-muted-foreground">Manage your created quests</p>
                </div>
                <Button onClick={() => setActiveTab("create")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Quest
                </Button>
              </div>

              {customQuizzes.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl mb-2">No Custom Quests Yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      Start creating engaging quests to challenge your students and track their learning progress.
                    </p>
                    <Button onClick={() => setActiveTab("create")}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Quest
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customQuizzes.map((quiz, index) => (
                    <motion.div
                      key={quiz.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="h-full hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between mb-2">
                            <Badge>{quiz.difficulty}</Badge>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => onDeleteQuiz(quiz.id)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                          <CardTitle>{quiz.title}</CardTitle>
                          <CardDescription>{quiz.subject}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-muted-foreground">{quiz.description}</p>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {quiz.questions.length} questions
                            </span>
                            <span className="text-blue-600">
                              +{quiz.xpReward} XP
                            </span>
                          </div>

                          {quiz.itemReward && (
                            <div className="text-sm text-purple-600">
                              🎁 {quiz.itemReward}
                            </div>
                          )}

                          <div className="pt-2 border-t">
                            <div className="text-xs text-muted-foreground">
                              For: <Badge variant="outline">{quiz.characterClass}</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Create Quest Tab */}
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Create New Quest</CardTitle>
                <CardDescription>
                  Design an engaging quiz to help your students learn and level up
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QuizCreator onSaveQuiz={(quiz) => {
                  onCreateQuiz(quiz);
                  setActiveTab("quests");
                }} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
