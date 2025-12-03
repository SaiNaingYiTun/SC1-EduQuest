import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Sword, Wand2, Code, Lightbulb, Palette, Heart } from "lucide-react";
import { motion } from "motion/react";

const characterClasses = [
  {
    id: "warrior",
    name: "Warrior",
    subject: "Mathematics",
    description: "Master of numbers and logic. Solves equations with brute force and precision.",
    icon: Sword,
    color: "bg-red-500",
    stats: {
      hp: 150,
      strength: "Problem Solving",
      specialty: "Algebra & Geometry"
    }
  },
  {
    id: "mage",
    name: "Mage",
    subject: "Science",
    description: "Harnesses the power of nature and experiments. Casts spells of knowledge.",
    icon: Wand2,
    color: "bg-purple-500",
    stats: {
      hp: 120,
      strength: "Analysis",
      specialty: "Physics & Chemistry"
    }
  },
  {
    id: "hacker",
    name: "Hacker",
    subject: "Programming",
    description: "Codes their way through challenges. Master of algorithms and logic.",
    icon: Code,
    color: "bg-green-500",
    stats: {
      hp: 130,
      strength: "Critical Thinking",
      specialty: "Code & Algorithms"
    }
  },
  {
    id: "scholar",
    name: "Scholar",
    subject: "History & Literature",
    description: "Keeper of stories and wisdom. Learns from the past to shape the future.",
    icon: Lightbulb,
    color: "bg-yellow-500",
    stats: {
      hp: 110,
      strength: "Memory",
      specialty: "Events & Analysis"
    }
  },
  {
    id: "artist",
    name: "Artist",
    subject: "Arts & Design",
    description: "Creates beauty through creativity. Sees patterns where others see chaos.",
    icon: Palette,
    color: "bg-pink-500",
    stats: {
      hp: 100,
      strength: "Creativity",
      specialty: "Design & Theory"
    }
  }
];

export function CharacterSelection({ onSelectCharacter }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900 p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl mb-4 text-white">Choose Your Path</h1>
          <p className="text-xl text-purple-200">Select a character class to begin your learning adventure</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characterClasses.map((character, index) => (
            <motion.div
              key={character.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card className="h-full bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-2">
                    <div className={`p-3 rounded-lg ${character.color}`}>
                      <character.icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white">{character.name}</CardTitle>
                      <CardDescription className="text-purple-200">{character.subject}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-purple-100">{character.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      <span>HP: {character.stats.hp}</span>
                    </div>
                    <div>
                      <span className="text-purple-300">Strength:</span> {character.stats.strength}
                    </div>
                    <div>
                      <span className="text-purple-300">Specialty:</span> {character.stats.specialty}
                    </div>
                  </div>

                  <Button 
                    className="w-full mt-4"
                    onClick={() => onSelectCharacter(character)}
                  >
                    Select {character.name}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
