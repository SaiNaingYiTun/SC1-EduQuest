import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Users, BookOpen, Trophy, TrendingUp } from "lucide-react";

const classDistributionData = [
  { name: "Warrior", value: 8, color: "#ef4444" },
  { name: "Mage", value: 6, color: "#a855f7" },
  { name: "Hacker", value: 5, color: "#22c55e" },
  { name: "Scholar", value: 3, color: "#eab308" },
  { name: "Artist", value: 2, color: "#ec4899" }
];

const performanceData = [
  { subject: "Math", avgScore: 85, completion: 92 },
  { subject: "Science", avgScore: 88, completion: 87 },
  { subject: "Programming", avgScore: 78, completion: 75 },
  { subject: "History", avgScore: 91, completion: 95 },
  { subject: "Arts", avgScore: 82, completion: 88 }
];

const weeklyActivityData = [
  { day: "Mon", students: 18 },
  { day: "Tue", students: 20 },
  { day: "Wed", students: 16 },
  { day: "Thu", students: 22 },
  { day: "Fri", students: 19 },
  { day: "Sat", students: 10 },
  { day: "Sun", students: 8 }
];

const topPerformers = [
  { name: "Maria Garcia", class: "Mage", level: 10, xp: 3000, avatar: "🔮" },
  { name: "Alex Johnson", class: "Warrior", level: 8, xp: 2400, avatar: "⚔️" },
  { name: "Jordan Lee", class: "Hacker", level: 6, xp: 1800, avatar: "💻" }
];

export function ClassOverview() {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total Students</CardDescription>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl">24</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">+3</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Quests Created</CardDescription>
            <BookOpen className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl">42</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across 5 subjects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Completion Rate</CardDescription>
            <Trophy className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl">87%</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">+5%</span> improvement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Avg Class Score</CardDescription>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl">85%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Excellent performance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Character Class Distribution</CardTitle>
            <CardDescription>Student preferences across character types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={classDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {classDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-5 gap-2 mt-4">
              {classDistributionData.map((item) => (
                <div key={item.name} className="text-center">
                  <div className="w-4 h-4 mx-auto mb-1" style={{ backgroundColor: item.color }} />
                  <div className="text-xs text-muted-foreground">{item.name}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>Daily active students this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="students" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Subject Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Performance</CardTitle>
          <CardDescription>Average scores and completion rates by subject</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avgScore" fill="#8b5cf6" name="Avg Score %" />
              <Bar dataKey="completion" fill="#22c55e" name="Completion %" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-600" />
              <span className="text-sm">Average Score</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500" />
              <span className="text-sm">Completion Rate</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
          <CardDescription>Students leading the class</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformers.map((student, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                <div className="flex-shrink-0 text-3xl">
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                </div>
                <div className="flex-shrink-0 text-3xl">{student.avatar}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{student.name}</span>
                    <Badge variant="outline">{student.class}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Level {student.level}</span>
                    <span>{student.xp} XP</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl">#{index + 1}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
