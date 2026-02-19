import { useState } from 'react';
import { Check } from 'lucide-react';
import { Character } from '../App';



const characterClasses = [
  {
    id: 'warrior',
    name: 'Warrior',
    description: 'Strong and brave, excels in combat challenges',
    icon: '⚔️',
    avatar: 'https://images.unsplash.com/photo-1635921481467-fba710b8e65c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW50YXN5JTIwd2FycmlvciUyMGtuaWdodHxlbnwxfHx8fDE3NjQ5MzQwOTF8MA&ixlib=rb-4.1.0&q=80&w=400',
    color: 'red'
  },
  {
    id: 'mage',
    name: 'Mage',
    description: 'Wise and intelligent, masters arcane knowledge',
    icon: '🔮',
    avatar: 'https://images.unsplash.com/photo-1511174944925-a99f10911d45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpZXZhbCUyMG1hZ2UlMjB3aXphcmR8ZW58MXx8fHwxNzY1MDE2NzIyfDA&ixlib=rb-4.1.0&q=80&w=400',
    color: 'purple'
  },
  {
    id: 'archer',
    name: 'Archer',
    description: 'Swift and precise, strikes from afar with deadly accuracy',
    icon: '🏹',
    avatar: 'https://images.unsplash.com/photo-1562008752-2459495a0c05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW50YXN5JTIwcm9ndWUlMjBhcmNoZXJ8ZW58MXx8fHwxNzY0OTc4NzgxfDA&ixlib=rb-4.1.0&q=80&w=400',
    color: 'green'
  }
];

export default function CharacterSelection({ onCharacterCreated, userId }) {
  const [selectedClass, setSelectedClass] = useState('');
  const [characterName, setCharacterName] = useState('');

  const handleCreate = () => {
    if (!selectedClass || !characterName.trim()) {
      alert('Please select a class and enter a name');
      return;
    }

    const selectedClassData = characterClasses.find(c => c.id === selectedClass);
    
    const character = {
      id: `char_${userId}_${Date.now()}`,
      name: characterName,
      class: selectedClassData.name,
      level: 1,
      xp: 0,
      maxXp: 100,
      avatar: selectedClassData.avatar
    };

    onCharacterCreated(character);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl mb-4 text-amber-400">Create Your Character</h1>
          <p className="text-xl text-purple-200">Choose your path and begin your journey</p>
        </div>

        <div className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 backdrop-blur-sm rounded-2xl p-8 border-2 border-purple-400/30 shadow-2xl mb-8">
          <label className="block text-purple-100 mb-4 text-xl">Character Name</label>
          <input
            type="text"
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            className="w-full bg-slate-800/50 border-2 border-purple-400/30 rounded-lg px-4 py-3 text-white placeholder-purple-300 focus:border-purple-400 focus:outline-none text-xl"
            placeholder="Enter your character's name"
          />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {characterClasses.map((charClass) => (
            <button
              key={charClass.id}
              onClick={() => setSelectedClass(charClass.id)}
              className={`relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-6 border-4 transition-all duration-300 hover:scale-105 ${
                selectedClass === charClass.id
                  ? `border-${charClass.color}-400 shadow-lg shadow-${charClass.color}-500/50`
                  : 'border-purple-400/30 hover:border-purple-400/50'
              }`}
            >
              {selectedClass === charClass.id && (
                <div className={`absolute top-4 right-4 w-8 h-8 rounded-full bg-${charClass.color}-500 flex items-center justify-center`}>
                  <Check className="w-5 h-5 text-white" />
                </div>
              )}

              <div className="aspect-square rounded-lg overflow-hidden mb-4 bg-slate-700">
                <img 
                  src={charClass.avatar} 
                  alt={charClass.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="text-4xl mb-2">{charClass.icon}</div>
              <h3 className="text-2xl mb-2 text-white">{charClass.name}</h3>
              <p className="text-purple-200">{charClass.description}</p>
            </button>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={handleCreate}
            disabled={!selectedClass || !characterName.trim()}
            className="bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-12 py-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-amber-500/50 transform hover:scale-105 disabled:transform-none disabled:shadow-none text-xl"
          >
            Begin Your Quest
          </button>
        </div>
      </div>
    </div>
  );
}
