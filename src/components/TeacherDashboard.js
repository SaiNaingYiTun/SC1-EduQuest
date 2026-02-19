import { useState, useEffect } from 'react';
import { Home, Users, Scroll, BarChart3, User as UserIcon } from 'lucide-react';
import TeacherHome from './TeacherHome';
import StudentOverview from './StudentOverview';
import QuestManagement from './QuestManagement';
import ClassAnalytics from './ClassAnalytics';
import TeacherProfile from './TeacherProfile';
import CourseManagement from './CourseManagement';
import NotificationBell from './NotificationBell';

export default function TeacherDashboard({
  user,
  onLogout,
  onUpdateUser,
  students,
  allStudents,
  characters,
  studentClasses,
  onInviteStudent,
  onCreateQuest,
  onUpdateQuest,
  onDeleteQuest,
  onAddItemToInventory,
  quests,
  authFetch,
  onRefreshAllUsers,
  onRefreshQuests,
  onRefreshStudentClasses,
  onRefreshCourses,
  onCoursesChange,

}) {
  const [activeTab, setActiveTab] = useState('home');
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  

  // Fetch courses
  useEffect(() => {
    async function fetchCourses() {
      const res = await authFetch(`/api/teachers/${user.id}/courses`);
      const data = await res.json();
      setCourses(data);

    }
    fetchCourses();
  }, [user.id, authFetch]);

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'quests', label: 'Quests', icon: Scroll },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'courses', label: 'Courses', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  const filteredStudents = selectedCourse && selectedCourse._id
    ? students.filter(s =>
      Array.isArray(s.studentClasses) &&
      s.studentClasses.some(cid => String(cid) === String(selectedCourse._id))
    )
    : students;

  const filteredQuests = selectedCourse && typeof selectedCourse === 'object' && selectedCourse._id
    ? quests.filter(q => String(q.courseId) === String(selectedCourse._id))
    : quests;

  // Course selector dropdown (shown for tabs that use course context)
  const showCourseSelector = ['students', 'quests','analytics'].includes(activeTab) && courses.length > 0;

  const [dashboardStats, setDashboardStats] = useState({
    totalCourses: 0,
    totalQuests: 0,
  });

  useEffect(() => {
    async function fetchDashboardStats() {
      const res = await authFetch(`/api/teachers/${user.id}/dashboard-stats`);
      if (!res.ok) return;
      const data = await res.json();
      setDashboardStats(data);
    }
    fetchDashboardStats();
  }, [user.id, authFetch]);


  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-gradient-to-r from-amber-900 to-orange-900 border-b-4 border-amber-400 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl text-amber-400">📚 Teacher Portal</h1>
            <div className="flex items-center gap-4 text-white">
              <div className="text-right">
                <div>{user.name}</div>
                <div>{Array.isArray(user.subjects) ? (user.subjects[0] || 'Not set') : (user.subjects || 'Not set')}</div>
              </div>
              <div className="w-12 h-12 rounded-full  object-cover overflow-hidden">
                {user.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt={user.name}
                    className="w-12 h-12 rounded-full border-2 border-amber-400 object-cover"
                  />
                ) : (
                  <UserIcon className="w-6 h-6 text-amber-500" />
                )}
              </div>

              {/* Notification Bell + Logout */}
              <div className="flex gap-2 ml-4 pl-4 border-l border-amber-600">
                <NotificationBell user={user} authFetch={authFetch} />
                
              </div>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${activeTab === tab.id
                    ? 'bg-amber-500 text-white shadow-lg'
                    : 'bg-amber-800/50 text-amber-200 hover:bg-amber-700/50'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Course Selector */}
      {showCourseSelector && (
        <div className="max-w-7xl mx-auto px-4 mt-6 mb-2">
          <label className="text-amber-400 mr-2 font-semibold">Filter by Course:</label>
          <select
            value={selectedCourse?._id || ''}
            onChange={e => {
              const value = e.target.value;
              if (value === '') {
                setSelectedCourse(null); // All Courses
              } else {
                const course = courses.find(c => c._id === value);
                setSelectedCourse(course || null);
              }
            }}
            className="px-4 py-2 rounded border border-amber-400 bg-amber-50 text-amber-900"
          >
            <option value="">All Courses</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>
                {course.name} ({course.section})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'home' && (
          <TeacherHome
            user={user}
            students={filteredStudents}
            characters={characters}
            selectedCourse={selectedCourse}
            dashboardStats={dashboardStats}
          />
        )}

        {activeTab === 'students' && (
          <StudentOverview
            user={user}
            students={students}
            allStudents={allStudents}
            characters={characters}
            onInviteStudent={onInviteStudent}
            courses={Array.isArray(courses) ? courses : []}
            selectedCourseId={selectedCourse ? selectedCourse._id : ''}
            onRefreshStudents={async () => {
              await onRefreshCourses?.();
              await onRefreshAllUsers?.();
              await onRefreshStudentClasses?.();
            }}


          />
        )}

        {activeTab === 'quests' && (
          <QuestManagement
            user={user}
            onCreateQuest={onCreateQuest}
            onUpdateQuest={onUpdateQuest}
            onDeleteQuest={onDeleteQuest}
            onAddItemToInventory={onAddItemToInventory}
            quests={filteredQuests}
            selectedCourse={selectedCourse}
          />
        )}

        {activeTab === 'courses' && (
          <CourseManagement
            user={user}
            authFetch={authFetch}
            onCoursesChange={(courses) => {
              setCourses(courses);
              // Optionally update selectedCourse if needed
              if (courses.length > 0 && (!selectedCourse || !courses.some(c => c._id === selectedCourse._id))) {
                setSelectedCourse(courses[0]);
              }
            }}
            onAfterCourseChange={async () => {
              await onRefreshQuests?.();
              await onRefreshCourses?.();
              await onRefreshAllUsers?.();
              await onRefreshStudentClasses?.();
            }}

          />
        )}

        {activeTab === 'analytics' && (
          <ClassAnalytics students={filteredStudents} characters={characters} selectedCourse={selectedCourse} />
          
        )}

        {activeTab === 'profile' && (
          <TeacherProfile user={user}
            onUpdateUser={onUpdateUser}
            onLogout={onLogout}
            stats={{
              courses: courses.length,
              students: students.length,
              quests: quests.length,
            }}
          />
        )}
      </div>
    </div>
  );
}