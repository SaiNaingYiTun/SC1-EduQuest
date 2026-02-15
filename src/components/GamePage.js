import { Character, Quest, Item, User } from '../App';
import PhaserQuestGame from './PhaserQuestGame1';



export default function GamePage({ quest, character, onQuestComplete, onBack }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <PhaserQuestGame
        quest={quest}
        character={character}
        onQuestComplete={onQuestComplete}
        onBack={onBack}
      />
    </div>
  );
}