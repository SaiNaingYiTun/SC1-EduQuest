import { Package } from 'lucide-react';

const rarityThemes = {
  common: {
    border: 'border-slate-400/30',
    badge: 'bg-slate-500/20 text-slate-100',
    icon: 'bg-slate-700/40 text-slate-100'
  },
  rare: {
    border: 'border-blue-400/40',
    badge: 'bg-blue-500/20 text-blue-100',
    icon: 'bg-blue-700/30 text-blue-100'
  },
  epic: {
    border: 'border-purple-400/40',
    badge: 'bg-purple-500/20 text-purple-100',
    icon: 'bg-purple-700/30 text-purple-100'
  },
  legendary: {
    border: 'border-amber-400/50',
    badge: 'bg-amber-500/20 text-amber-100',
    icon: 'bg-amber-700/30 text-amber-100'
  }
};

const formatRarity = (rarity) => {
  if (!rarity) return 'Common';
  return rarity.charAt(0).toUpperCase() + rarity.slice(1);
};

export default function InventoryPage({ inventory = [] }) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl text-amber-400 font-pixel">Inventory</h2>
          <p className="text-purple-200 font-pixel">Items earned from quests</p>
        </div>
        <div className="text-purple-200 font-pixel">{inventory.length} items</div>
      </div>

      {inventory.length === 0 ? (
        <div className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl p-12 border-2 border-purple-400/30 backdrop-blur-sm text-center">
          <Package className="w-14 h-14 mx-auto mb-4 text-purple-400/60" />
          <h3 className="text-2xl text-white mb-2 font-pixel">No Items Yet</h3>
          <p className="text-purple-200 font-pixel">Complete quests to earn rewards.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inventory.map((item, index) => {
            const rarity =
              typeof item?.rarity === 'string'
                ? item.rarity.toLowerCase()
                : 'common';
            const theme = rarityThemes[rarity] || rarityThemes.common;

            return (
              <div
                key={item?.id || `${item?.name || 'item'}-${index}`}
                className={`bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl p-5 border-2 ${theme.border} backdrop-blur-sm`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${theme.icon}`}>
                    {item?.icon ? (
                      <span className="text-2xl">{item.icon}</span>
                    ) : (
                      <Package className="w-6 h-6" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="text-white font-semibold font-pixel">
                      {item?.name || 'Unknown Item'}
                    </div>
                    <div className="text-sm text-purple-200 font-pixel">
                      {item?.description || 'No description available.'}
                    </div>
                  </div>

                  <div className={`text-xs px-2 py-1 rounded-full uppercase tracking-wide ${theme.badge} font-pixel`}>
                    {formatRarity(rarity)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}