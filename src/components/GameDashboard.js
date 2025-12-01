import { useState } from "react";
import { CharacterStats } from "./CharacterStats";
import { QuestBoard } from "./QuestBoard";
import { Inventory } from "./Inventory";
import { Leaderboard } from "./Leaderboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { LogOut, Map, Package, Trophy } from "lucide-react";
import { motion } from "motion/react";

export function GameDashboard({ 
  character, 
  quests, 
  inventory, 
  leaderboard,
  onSelectQuest,
  onLogout 
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
            >
              EduQuest
            </motion.h1>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Exit
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <CharacterStats character={character} />
          </div>
          
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white"
            >
              <Map className="w-8 h-8 mb-2 opacity-80" />
              <div className="text-3xl mb-1">{quests.filter(q => !q.completed).length}</div>
              <div className="text-sm opacity-90">Active Quests</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white"
            >
              <Package className="w-8 h-8 mb-2 opacity-80" />
              <div className="text-3xl mb-1">{inventory.length}</div>
              <div className="text-sm opacity-90">Items Collected</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg p-6 text-white"
            >
              <Trophy className="w-8 h-8 mb-2 opacity-80" />
              <div className="text-3xl mb-1">#{leaderboard.findIndex(l => l.username === character.name) + 1}</div>
              <div className="text-sm opacity-90">Global Rank</div>
            </motion.div>
          </div>
        </div>

        <Tabs defaultValue="quests" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="quests">Quests</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="quests">
            <QuestBoard quests={quests} onSelectQuest={onSelectQuest} />
          </TabsContent>

          <TabsContent value="inventory">
            <Inventory items={inventory} />
          </TabsContent>

          <TabsContent value="leaderboard">
            <Leaderboard entries={leaderboard} currentUser={character.name} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
