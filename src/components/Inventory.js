import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Sword, Shield, Wand2, Book, Scroll, Gem } from "lucide-react";
import { motion } from "motion/react";

const rarityColors = {
  common: 'bg-gray-100 border-gray-300 text-gray-700',
  rare: 'bg-blue-100 border-blue-300 text-blue-700',
  epic: 'bg-purple-100 border-purple-300 text-purple-700',
  legendary: 'bg-yellow-100 border-yellow-300 text-yellow-700'
};

const getItemIcon = (type) => {
  switch (type) {
    case 'weapon':
      return Sword;
    case 'armor':
      return Shield;
    case 'accessory':
      return Gem;
    case 'consumable':
      return Scroll;
    default:
      return Book;
  }
};

export function Inventory({ items }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {items.map((item, index) => {
            const Icon = getItemIcon(item.type);
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className={`p-4 rounded-lg border-2 ${rarityColors[item.rarity]} cursor-pointer transition-all`}
              >
                <div className="text-center space-y-2">
                  <div className="text-4xl">{item.icon}</div>
                  <div>
                    <div className="text-sm mb-1">{item.name}</div>
                    <Badge variant="outline" className="text-xs">
                      {item.rarity}
                    </Badge>
                  </div>
                  {item.bonus && (
                    <div className="text-xs text-muted-foreground">{item.bonus}</div>
                  )}
                </div>
              </motion.div>
            );
          })}
          
          {/* Empty slots */}
          {items.length < 8 && (
            [...Array(8 - items.length)].map((_, i) => (
              <div
                key={`empty-${i}`}
                className="p-4 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center opacity-50"
              >
                <div className="text-gray-400 text-xs">Empty</div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
