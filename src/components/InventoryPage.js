import { Package } from 'lucide-react';

const WEAPON_BONUS_BY_TIER = {
  rare: 0.05,
  epic: 0.1,
  legendary: 0.3,
  mythic: 1,
};

const HEADWEAR_HP_BONUS_BY_TIER = {
  rare: 50,
  epic: 100,
  legendary: 200,
  mythic: 500,
};

const ARMOR_REDUCTION_BY_TIER = {
  rare: 0.03,
  epic: 0.05,
  legendary: 0.08,
  mythic: 0.15,
};

const BOOTS_SPEED_BONUS_BY_TIER = {
  rare: 0.05,
  epic: 0.1,
  legendary: 0.15,
  mythic: 0.3,
};

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
  },
  mythic: {
    border: 'border-pink-400/60',
    badge: 'bg-pink-500/20 text-pink-100',
    icon: 'bg-pink-700/30 text-pink-100'
  }
};

const inferItemType = (value) => {
  const text = String(value || '').toLowerCase();
  if (text.includes('sword') || text.includes('bow') || text.includes('staff')) return 'weapon';
  if (text.includes('helmet') || text.includes('hat') || text.includes('hood') || text.includes('headband')) return 'headwear';
  if (text.includes('armor')) return 'armor';
  if (text.includes('boot')) return 'boots';
  return 'misc';
};

const formatRarity = (rarity) => {
  if (!rarity) return 'Common';
  return rarity.charAt(0).toUpperCase() + rarity.slice(1);
};

const formatItemType = (type) => {
  if (!type) return 'Misc';
  if (type === 'headwear') return 'Headwear';
  return type.charAt(0).toUpperCase() + type.slice(1);
};

const getItemAttributeText = (itemType, tier) => {
  if (itemType === 'weapon') return `Attack +${Math.round((WEAPON_BONUS_BY_TIER[tier] || 0) * 100)}%`;
  if (itemType === 'headwear') return `Bonus HP +${HEADWEAR_HP_BONUS_BY_TIER[tier] || 0}`;
  if (itemType === 'armor') return `Damage Reduction ${Math.round((ARMOR_REDUCTION_BY_TIER[tier] || 0) * 100)}%`;
  if (itemType === 'boots') return `Move Speed +${Math.round((BOOTS_SPEED_BONUS_BY_TIER[tier] || 0) * 100)}%`;
  return 'No combat bonus';
};

export default function InventoryPage({ inventory = [], onEquipItem }) {
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
              typeof (item?.tier || item?.rarity) === 'string'
                ? (item.tier || item.rarity).toLowerCase()
                : 'common';
            const theme = rarityThemes[rarity] || rarityThemes.common;
            const spriteSrc = item?.sprite || item?.image;
            const itemType = item?.itemType || inferItemType(item?.name || item?.slug);
            const attributeText = getItemAttributeText(itemType, rarity);
            const isEquipped = Boolean(item?.equipped);

            return (
              <div
                key={item?.id || `${item?.name || 'item'}-${index}`}
                className={`bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl p-5 border-2 ${theme.border} backdrop-blur-sm`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${theme.icon}`}>
                    {spriteSrc ? (
                      <img
                        src={spriteSrc}
                        alt={item?.name || 'Item'}
                        className="w-10 h-10 object-contain [image-rendering:pixelated]"
                      />
                    ) : item?.icon ? (
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
                    <div className="text-xs text-purple-300 mt-1 font-pixel">
                      Type: {formatItemType(itemType)}
                    </div>
                    <div className="text-xs text-amber-300 mt-1 font-pixel">
                      {attributeText}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className={`text-xs px-2 py-1 rounded-full uppercase tracking-wide ${theme.badge} font-pixel`}>
                      {formatRarity(rarity)}
                    </div>
                    {typeof onEquipItem === 'function' && item?.id && (
                      <button
                        onClick={() => onEquipItem(item.id)}
                        className={`text-xs px-3 py-1 rounded-md font-pixel border transition-colors ${
                          isEquipped
                            ? 'bg-emerald-600/30 text-emerald-100 border-emerald-300/40'
                            : 'bg-slate-700/40 text-slate-100 border-slate-300/30 hover:bg-slate-600/50'
                        }`}
                      >
                        {isEquipped ? 'Equipped' : 'Equip'}
                      </button>
                    )}
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
