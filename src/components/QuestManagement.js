import { useState } from 'react';
import { Plus, Scroll, Edit, Trash2, Clock, Star } from 'lucide-react';
import { User, Quest } from '../App';



export default function QuestManagement({ user }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Mock quests created by this teacher
  const teacherQuests = [
    {
      id: 'quest1',
      title: 'The Algebra Adventure',
      description: 'Solve algebraic equations to unlock the ancient treasure',
      difficulty: 'Easy',
      xpReward: 50,
      timeLimit: 120,
      teacherId: user.id,
      questions: [
        {
          id: 'q1',
          question: 'Solve for x: 2x + 5 = 13',
          options: ['x = 2', 'x = 4', 'x = 6', 'x = 8'],
          correctAnswer: 1
        },
        {
          id: 'q2',
          question: 'What is 3x - 7 = 8?',
          options: ['x = 3', 'x = 5', 'x = 7', 'x = 9'],
          correctAnswer: 1
        },
        {
          id: 'q3',
          question: 'Solve: 4x + 2 = 18',
          options: ['x = 2', 'x = 4', 'x = 6', 'x = 8'],
          correctAnswer: 1
        }
      ]
    },
    {
      id: 'quest2',
      title: 'Geometry Quest',
      description: 'Master the secrets of shapes and angles',
      difficulty: 'Medium',
      xpReward: 100,
      timeLimit: 180,
      teacherId: user.id,
      questions: [
        {
          id: 'q1',
          question: 'What is the sum of angles in a triangle?',
          options: ['90°', '180°', '270°', '360°'],
          correctAnswer: 1
        },
        {
          id: 'q2',
          question: 'Area of a circle with radius 5?',
          options: ['25π', '50π', '75π', '100π'],
          correctAnswer: 0
        },
        {
          id: 'q3',
          question: 'How many sides does a hexagon have?',
          options: ['4', '5', '6', '8'],
          correctAnswer: 2
        },
        {
          id: 'q4',
          question: 'Pythagorean theorem: a² + b² = ?',
          options: ['c', 'c²', '2c', 'c³'],
          correctAnswer: 1
        }
      ]
    },
    {
      id: 'quest3',
      title: 'The Calculus Challenge',
      description: 'Face the ultimate test of mathematical prowess',
      difficulty: 'Hard',
      xpReward: 200,
      timeLimit: 300,
      teacherId: user.id,
      questions: [
        {
          id: 'q1',
          question: 'What is the derivative of x²?',
          options: ['x', '2x', 'x²/2', '2x²'],
          correctAnswer: 1
        },
        {
          id: 'q2',
          question: 'Integral of 2x dx = ?',
          options: ['x²', 'x² + C', '2x²', '2x² + C'],
          correctAnswer: 1
        },
        {
          id: 'q3',
          question: 'Limit of (x² - 4)/(x - 2) as x approaches 2?',
          options: ['0', '2', '4', 'undefined'],
          correctAnswer: 2
        },
        {
          id: 'q4',
          question: 'Second derivative of x³?',
          options: ['3x²', '6x', 'x²', '3x'],
          correctAnswer: 1
        },
        {
          id: 'q5',
          question: 'What is d/dx(sin x)?',
          options: ['cos x', '-cos x', 'sin x', '-sin x'],
          correctAnswer: 0
        }
      ]
    }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'green';
      case 'Medium':
        return 'yellow';
      case 'Hard':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl text-amber-400">Quest Management</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white px-6 py-3 rounded-lg transition-all shadow-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create New Quest
        </button>
      </div>

      {/* Quest List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teacherQuests.map((quest) => {
          const difficultyColor = getDifficultyColor(quest.difficulty);

          return (
            <div
              key={quest.id}
              className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl p-6 border-2 border-purple-400/30 backdrop-blur-sm hover:border-purple-400/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <Scroll className="w-12 h-12 text-amber-400" />
                <span className={`px-3 py-1 rounded-full text-sm bg-${difficultyColor}-600/30 text-${difficultyColor}-300 border border-${difficultyColor}-400/50`}>
                  {quest.difficulty}
                </span>
              </div>

              <h3 className="text-xl text-white mb-2">{quest.title}</h3>
              <p className="text-purple-200 mb-4">{quest.description}</p>

              <div className="flex items-center gap-4 mb-6 text-sm text-purple-200">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span>+{quest.xpReward} XP</span>
                </div>
                {quest.timeLimit && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span>{Math.floor(quest.timeLimit / 60)}m</span>
                  </div>
                )}
                <div className="text-purple-300">
                  {quest.questions.length} Questions
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/50 text-white py-2 rounded-lg transition-all flex items-center justify-center gap-2">
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button className="flex-1 bg-red-600/30 hover:bg-red-600/50 border border-red-400/50 text-white py-2 rounded-lg transition-all flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Quest Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl max-w-2xl w-full border-4 border-purple-400 max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b-2 border-purple-400/30 sticky top-0 bg-purple-900/90 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl text-amber-400">Create New Quest</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-purple-200 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-purple-100 mb-2">Quest Title</label>
                <input
                  type="text"
                  className="w-full bg-slate-800/50 border-2 border-purple-400/30 rounded-lg px-4 py-3 text-white placeholder-purple-300 focus:border-purple-400 focus:outline-none"
                  placeholder="Enter quest title"
                />
              </div>

              <div>
                <label className="block text-purple-100 mb-2">Description</label>
                <textarea
                  className="w-full bg-slate-800/50 border-2 border-purple-400/30 rounded-lg px-4 py-3 text-white placeholder-purple-300 focus:border-purple-400 focus:outline-none"
                  rows={3}
                  placeholder="Enter quest description"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-purple-100 mb-2">Difficulty</label>
                  <select className="w-full bg-slate-800/50 border-2 border-purple-400/30 rounded-lg px-4 py-3 text-white focus:border-purple-400 focus:outline-none">
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-purple-100 mb-2">XP Reward</label>
                  <input
                    type="number"
                    className="w-full bg-slate-800/50 border-2 border-purple-400/30 rounded-lg px-4 py-3 text-white placeholder-purple-300 focus:border-purple-400 focus:outline-none"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="block text-purple-100 mb-2">Time Limit (min)</label>
                  <input
                    type="number"
                    className="w-full bg-slate-800/50 border-2 border-purple-400/30 rounded-lg px-4 py-3 text-white placeholder-purple-300 focus:border-purple-400 focus:outline-none"
                    placeholder="10"
                  />
                </div>
              </div>

              <div className="bg-amber-600/20 border-2 border-amber-400/30 rounded-lg p-4">
                <div className="text-amber-300 mb-2">📝 Note</div>
                <div className="text-amber-100 text-sm">
                  This is a demo version. In the full application, you would be able to add multiple questions with different answer choices.
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    alert('Quest creation feature is coming soon! This is a demo.');
                    setShowCreateModal(false);
                  }}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white py-3 rounded-lg transition-all shadow-lg"
                >
                  Create Quest
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
