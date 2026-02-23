import { useState } from 'react';
import { Home, Scroll, Trophy, User as UserIcon, Users, Package } from 'lucide-react';
//import { User, Character, Achievement, Quest, Item } from '../App';
import StudentHome from './StudentHome';
import QuestsPage from './QuestsPage';
import LeaderboardPage from './LeaderboardPage';
import StudentProfile from './StudentProfile';
import ClassesPage from './ClassesPage';
import InventoryPage from './InventoryPage';
//import ReportTeacherModal from './ReportTeacherModal';



export default function StudentDashboard({
  user,
  character,
  onLogout,
  onUpdateUser,
  onUpdateCharacter,
  onJoinClass,
  studentClasses,
  teachers,
  achievements,
  onUnlockAchievement,
  quests,
  inventory,
  onStartQuest,
  courses,
  authFetch
}) {
  const [activeTab, setActiveTab] = useState('home');
  //const [showReportModal, setShowReportModal] = useState(false);
  //const [reportingTeacher, setReportingTeacher] = useState(null);

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'quests', label: 'Quests', icon: Scroll },
    { id: 'classes', label: 'Classes', icon: Users },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'profile', label: 'Profile', icon: UserIcon },

  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-gradient-to-r from-purple-900 to-blue-900 border-b-4 border-amber-400 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl text-amber-400 font-pixel">⚔️ EduQuest</h1>
            {character && (
              <div className="flex items-center gap-4 text-white">
                <div className="text-right">
                  <div className="text-sm text-purple-200 font-pixel">Level {character.level}</div>
                  <div className="font-pixel">{character.name}</div>
                </div>
                <img
                  src={character.avatar}
                  alt={character.name}
                  className="w-12 h-12 rounded-full border-2 border-amber-400 object-cover"
                />
              </div>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap font-pixel ${activeTab === tab.id
                    ? 'bg-amber-500 text-white shadow-lg'
                    : 'bg-purple-800/50 text-purple-200 hover:bg-purple-700/50'
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

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'home' && character && (
          <StudentHome
            character={character}
            achievements={achievements}
            studentClasses={studentClasses}
            teachers={teachers}
          />
        )}

        {activeTab === 'quests' && character && (
          <QuestsPage
            user={user}
            character={character}
            onUpdateCharacter={onUpdateCharacter}
            studentClasses={studentClasses}
            teachers={teachers}
            onUnlockAchievement={onUnlockAchievement}
            quests={quests}
            inventory={inventory}
            onStartQuest={onStartQuest}
            courses={courses}
          />
        )}

        {activeTab === 'classes' && (
          <ClassesPage
            user={user}
            studentClasses={studentClasses}
            teachers={teachers}
            onJoinClass={onJoinClass}
            courses={courses}
          />
        )}
        {activeTab === 'leaderboard' && user && (
          <LeaderboardPage user={user} character={character} authFetch={authFetch} studentClasses={studentClasses} courses={courses} />
        )}

        {activeTab === 'inventory' && (
          <InventoryPage inventory={inventory} />
        )}

        

        {activeTab === 'profile' && character && (
          <StudentProfile
            user={user}
            character={character}
            onUpdateUser={onUpdateUser}
            onLogout={onLogout}
          />
        )}
      </div>
    </div>
  );
}
