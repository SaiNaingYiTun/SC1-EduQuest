import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { TrendingUp, TrendingDown, Award, Target, Clock } from "lucide-react";

const mockStudents = [
  {
    id: "s1",
    name: "Alex Johnson",
    avatar: "AJ",
    className: "Warrior",
    level: 8,
    totalXp: 2400,
    questsCompleted: 12,
    averageScore: 85,
    timeSpent: "3h 45m",
    recentActivity: [
      { questTitle: "Algebraic Expressions", score: 100, date: "2 hours ago" },
      { questTitle: "Geometry Basics", score: 75, date: "1 day ago" },
      { questTitle: "Linear Equations", score: 80, date: "3 days ago" }
    ],
    strengths: ["Algebra", "Problem Solving"],
    needsWork: ["Geometry"]
  },
  {
    id: "s2",
    name: "Maria Garcia",
    avatar: "MG",
    className: "Mage",
    level: 10,
    totalXp: 3000,
    questsCompleted: 15,
    averageScore: 92,
    timeSpent: "5h 20m",
    recentActivity: [
      { questTitle: "Forces and Motion", score: 95, date: "1 hour ago" },
      { questTitle: "Chemical Reactions", score: 90, date: "2 days ago" },
      { questTitle: "Energy Systems", score: 88, date: "4 days ago" }
    ],
    strengths: ["Physics", "Critical Thinking"],
    needsWork: ["Chemistry"]
  },
  {
    id: "s3",
    name: "Jordan Lee",
    avatar: "JL",
    className: "Hacker",
    level: 6,
    totalXp: 1800,
    questsCompleted: 9,
    averageScore: 78,
    timeSpent: "2h 30m",
    recentActivity: [
      { questTitle: "Programming Fundamentals", score: 70, date: "3 hours ago" },
      { questTitle: "Data Structures", score: 85, date: "2 days ago" },
      { questTitle: "Algorithms", score: 80, date: "5 days ago" }
    ],
    strengths: ["Logic", "Algorithms"],
    needsWork: ["Syntax", "Debugging"]
  }
];

export function StudentProgress() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Students</CardDescription>
            <CardTitle className="text-3xl">24</CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Average Score</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              85%
              <TrendingUp className="w-5 h-5 text-green-600" />
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Quests Completed</CardDescription>
            <CardTitle className="text-3xl">187</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Students</CardDescription>
            <CardTitle className="text-3xl">18</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Overview</CardTitle>
          <CardDescription>Track individual student progress and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={mockStudents[0].id}>
            <TabsList className="w-full justify-start overflow-x-auto">
              {mockStudents.map(student => (
                <TabsTrigger key={student.id} value={student.id}>
                  {student.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {mockStudents.map(student => (
              <TabsContent key={student.id} value={student.id} className="space-y-6 mt-6">
                <div className="flex items-start gap-6">
                  <Avatar className="w-20 h-20">
                    <AvatarFallback className="text-xl">{student.avatar}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-2xl mb-1">{student.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge>{student.className}</Badge>
                        <Badge variant="outline">Level {student.level}</Badge>
                        <span className="text-sm text-muted-foreground">{student.totalXp} XP</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <Target className="w-8 h-8 text-blue-600" />
                        <div>
                          <div className="text-2xl">{student.questsCompleted}</div>
                          <div className="text-xs text-muted-foreground">Quests Done</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <Award className="w-8 h-8 text-green-600" />
                        <div>
                          <div className="text-2xl">{student.averageScore}%</div>
                          <div className="text-xs text-muted-foreground">Avg Score</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                        <Clock className="w-8 h-8 text-purple-600" />
                        <div>
                          <div className="text-2xl">{student.timeSpent}</div>
                          <div className="text-xs text-muted-foreground">Time Spent</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {student.recentActivity.map((activity, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="text-sm mb-1">{activity.questTitle}</div>
                            <div className="text-xs text-muted-foreground">{activity.date}</div>
                          </div>
                          <Badge 
                            variant={activity.score >= 80 ? "default" : activity.score >= 60 ? "secondary" : "destructive"}
                          >
                            {activity.score}%
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Performance Insights</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-sm">Strengths</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {student.strengths.map((strength, idx) => (
                            <Badge key={idx} variant="outline" className="bg-green-50">
                              {strength}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingDown className="w-4 h-4 text-orange-600" />
                          <span className="text-sm">Needs Work</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {student.needsWork.map((area, idx) => (
                            <Badge key={idx} variant="outline" className="bg-orange-50">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2">
                        <div className="text-sm mb-2">Overall Progress</div>
                        <Progress value={student.averageScore} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>0%</span>
                          <span>{student.averageScore}%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
