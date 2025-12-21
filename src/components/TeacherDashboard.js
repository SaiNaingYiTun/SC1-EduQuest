import { useState } from 'react';
import { Home, Users, Scroll, BarChart3, User as UserIcon } from 'lucide-react';
import { User, Character, Quest, Item } from '../App';
import TeacherHome from './TeacherHome';
import StudentOverview from './StudentOverview';
import QuestManagement from './QuestManagement';
import ClassAnalytics from './ClassAnalytics';
import TeacherProfile from './TeacherProfile';
import CourseManagement from './CourseManagement';



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
  authFetch
}) {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCourse, setSelectedCourse] = useState(user.subjects?.[0] || '');

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'quests', label: 'Quests', icon: Scroll },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'courses' , label: 'Courses' , icon : BarChart3},
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  const filteredStudents = selectedCourse
  ? students.filter(s => Array.isArray(s.classes) && s.classes.includes(selectedCourse))
  : students;
  
  const filteredQuests = selectedCourse
    ? quests.filter(q => q.classId === selectedCourse)
    : quests;

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-gradient-to-r from-amber-900 to-orange-900 border-b-4 border-amber-400 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl text-amber-400">📚 Teacher Portal</h1>
            <div className="flex items-center gap-4 text-white">
              <div className="text-right">
                <div className="text-sm text-amber-200">
                  {user.subjects && user.subjects.length>0
                   ? user.subjects.join(',')
                    : ''}
                  </div>
                <div>{user.name}</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center border-2 border-amber-400">
                <UserIcon className="w-6 h-6 text-white" />
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
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                    activeTab === tab.id
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
          {/*Course Selection Bar*/}
          {user.subjects && user.subjects.length >1 && (
            <div className="flex gap-2 mt-4">
              {user.subjects.map((course,idx) => (
                <button
                  key={idx}
                  className={`px-4 py-2 rounded ${
                    selectedCourse === course
                      ? 'bg-amber-500 text-white'
                      : 'bg-amber-800/50 text-amber-200'
                  }`}
                  onClick={() => setSelectedCourse(course)}
                  >
                    {course}
                  </button>
              ))}
            </div>
          )}

        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'home' && (
          <TeacherHome 
            user={user}
            students={filteredStudents} 
            characters={characters}
            selectedCourse={selectedCourse}
             />
        )}
        
        {activeTab === 'students' && (
          <StudentOverview
            user={user}
            students={students}
            allStudents={allStudents}
            characters={characters}
            onInviteStudent={onInviteStudent}
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
            selectedCourse ={selectedCourse}
          />
        )}

        {activeTab === 'courses' && (
          <CourseManagement
            user = {user}
            authFetch = {authFetch}
            onCoursesChange={(courses) => {

            }}
          />
            
        )}
        
        {activeTab === 'analytics' && (
          <ClassAnalytics students={students} characters={characters} />
        )}
        
        {activeTab === 'profile' && (
          <TeacherProfile user={user} onUpdateUser={onUpdateUser} onLogout={onLogout} />
        )}
      </div>
    </div>
  );
}