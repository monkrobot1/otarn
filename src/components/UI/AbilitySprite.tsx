import React from 'react';

const sheetMap: Record<string, { sheet: string; row: number }> = {
  // Judgment
  'CAN': { sheet: 'judgment_ability_icons.png', row: 0 },
  'DCY': { sheet: 'judgment_ability_icons.png', row: 1 },
  'VOD': { sheet: 'judgment_ability_icons.png', row: 2 },
  'SHD': { sheet: 'judgment_ability_icons.png', row: 2 },
  'DTH': { sheet: 'judgment_ability_icons.png', row: 3 },
  // Order
  'CHR': { sheet: 'order_ability_icons.png', row: 0 },
  'GRV': { sheet: 'order_ability_icons.png', row: 1 },
  'MAG': { sheet: 'order_ability_icons.png', row: 2 },
  'TRU': { sheet: 'order_ability_icons.png', row: 3 },
  // Chaos
  'FIR': { sheet: 'chaos_ability_icons.png', row: 0 },
  'EAR': { sheet: 'chaos_ability_icons.png', row: 1 },
  'WAT': { sheet: 'chaos_ability_icons.png', row: 2 },
  'AIR': { sheet: 'chaos_ability_icons.png', row: 3 },
  // Love
  'LIF': { sheet: 'love_ability_icons.png', row: 0 },
  'BLD': { sheet: 'love_ability_icons.png', row: 1 },
  'GRW': { sheet: 'love_ability_icons.png', row: 2 },
  'DRM': { sheet: 'love_ability_icons.png', row: 3 }
};

interface AbilitySpriteProps {
  abilityId: string;
  className?: string;
}

export const AbilitySprite: React.FC<AbilitySpriteProps> = ({ abilityId, className = '' }) => {
  // Extract parts e.g. ABIL_CAN_SP1 -> [ABIL, CAN, SP1]
  const parts = abilityId.split('_');
  if (parts.length < 3) return <div className={`bg-gray-800 ${className}`} />;

  const classKey = parts[1];
  const typeKey = parts[parts.length - 1]; // ATK, SP1, SP2, ULT

  const mapData = sheetMap[classKey];
  if (!mapData) return <div className={`bg-gray-800 ${className}`} />;

  const colMap: Record<string, number> = {
    'ATK': 0,
    'SP1': 1,
    'SP2': 2,
    'ULT': 3
  };
  const col = colMap[typeKey] ?? 0;
  const row = mapData.row;
  
  const posX = (col / 3) * 100;
  const posY = (row / 3) * 100;

  return (
    <div 
      className={`display-inline-block bg-[#111] overflow-hidden ${className}`}
      style={{
        backgroundImage: `url(/assets/sprites/${mapData.sheet})`,
        backgroundSize: `400%`,
        backgroundPosition: `${posX}% ${posY}%`,
        backgroundRepeat: 'no-repeat'
      }}
    />
  );
};
