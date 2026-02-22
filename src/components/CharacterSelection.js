import { useState } from 'react';
import { Check } from 'lucide-react';
import { Character } from '../App';

import warriorSprite from '../sprites/characters/hero_warrior.png';
import mageSprite from '../sprites/characters/hero_mage.png';
import archerSprite from '../sprites/characters/hero_rogue.png';
import witchSprite from '../sprites/characters/hero_cleric.png';

const characterClasses = [
  {
    id: 'warrior',
    name: 'Warrior',
    description: 'Strong and brave, excels in combat challenges',
    icon: '\u2694\uFE0F',
    avatar: warriorSprite,
    idle: { src: '/assets/sprites/warrior/Idle.png', frameWidth: 135, frameHeight: 135, frameCount: 10, frameRate: 10, scale: 2.5, offsetX: 0, offsetY: 150 },
    color: 'red'
  },
  {
    id: 'mage',
    name: 'Mage',
    description: 'Wise and intelligent, masters arcane knowledge',
    icon: '\uD83D\uDD2E',
    avatar: mageSprite,
    idle: { src: '/assets/sprites/mage/Idle.png', frameWidth: 231, frameHeight: 190, frameCount: 6, frameRate: 6, scale: 1.65, offsetX: -20, offsetY: 75 },
    color: 'purple'
  },
  {
    id: 'archer',
    name: 'Archer',
    description: 'Precise and agile, strikes enemies from afar',
    icon: '\uD83C\uDFF9',
    avatar: archerSprite,
    idle: { src: '/assets/sprites/archer/Idle.png', frameWidth: 100, frameHeight: 100, frameCount: 10, frameRate: 10, scale: 1.8, offsetX: 8, offsetY: 90 },
    color: 'green'
  },
  {
    id: 'witch',
    name: 'Witch',
    description: 'Dark spellcaster who drains foes with forbidden magic',
    icon: '\u2620\uFE0F',
    avatar: witchSprite,
    idle: { src: '/assets/sprites/witch/Idle.png', frameWidth: 140, frameHeight: 140, frameCount: 10, frameRate: 10, scale: 1.85, offsetX: 0, offsetY: 100 },
    color: 'yellow'
  }
];

export default function CharacterSelection({ onCharacterCreated, userId }) {
  const [selectedClass, setSelectedClass] = useState('');
  const [characterName, setCharacterName] = useState('');
  const previewTargetHeight = 176;

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
      <style>{`
        @keyframes character-idle-sprite {
          from { background-position: 0 0; }
          to { background-position: var(--sheet-shift) 0; }
        }
      `}</style>

      <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl mb-4 text-amber-400 font-pixel">Create Your Character</h1>
          <p className="text-xl text-purple-200 font-pixel">Choose your path and begin your journey</p>
        </div>

        <div className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 backdrop-blur-sm rounded-2xl p-8 border-2 border-purple-400/30 shadow-2xl mb-8">
          <label className="block text-purple-100 mb-4 text-xl font-pixel">Character Name</label>
          <input
            type="text"
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            className="w-full bg-slate-800/50 border-2 border-purple-400/30 rounded-lg px-4 py-3 text-white placeholder-purple-300 focus:border-purple-400 focus:outline-none text-xl font-pixel"
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

              <div className="mb-4 flex items-end justify-center h-40 overflow-hidden">
                <div
                  role="img"
                  aria-label={`${charClass.name} idle animation`}
                  className="origin-bottom [image-rendering:pixelated]"
                  style={{
                    width: `${charClass.idle.frameWidth}px`,
                    height: `${charClass.idle.frameHeight}px`,
                    backgroundImage: `url(${charClass.idle.src})`,
                    backgroundRepeat: 'no-repeat',
                    position: 'relative',
                    left: `${charClass.idle.offsetX ?? 0}px`,
                    top: `${charClass.idle.offsetY ?? 0}px`,
                    transform: `scale(${(previewTargetHeight / charClass.idle.frameHeight) * (charClass.idle.scale ?? 1)})`,
                    '--sheet-shift': `${-charClass.idle.frameWidth * charClass.idle.frameCount}px`,
                    animation: `character-idle-sprite ${charClass.idle.frameCount / charClass.idle.frameRate}s steps(${charClass.idle.frameCount}) infinite`,
                  }}
                />
              </div>

              <div className="text-4xl mb-2">{charClass.icon}</div>
              <h3 className="text-2xl mb-2 text-white font-pixel">{charClass.name}</h3>
              <p className="text-purple-200 font-pixel">{charClass.description}</p>
            </button>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={handleCreate}
            disabled={!selectedClass || !characterName.trim()}
            className="bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-12 py-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-amber-500/50 transform hover:scale-105 disabled:transform-none disabled:shadow-none text-xl font-pixel"
          >
            Begin Your Quest
          </button>
        </div>
      </div>
    </div>
  );
}
