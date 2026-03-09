import React from 'react';

export const portraitMap: Record<string, { col: number; row: number }> = {
  'CAN': { row: 0, col: 0 },
  'DCY': { row: 0, col: 1 },
  'VOD': { row: 0, col: 2 },
  'SHD': { row: 0, col: 3 },
  'DTH': { row: 1, col: 0 },
  'CHR': { row: 1, col: 1 },
  'GRV': { row: 1, col: 2 },
  'MAG': { row: 1, col: 3 },
  'TRU': { row: 2, col: 0 },
  'FIR': { row: 2, col: 1 },
  'EAR': { row: 2, col: 2 },
  'WAT': { row: 2, col: 3 },
  'AIR': { row: 3, col: 0 },
  'LIF': { row: 3, col: 1 },
  'BLD': { row: 3, col: 2 },
  'GRW': { row: 3, col: 3 },
  'DRM': { row: 0, col: 0 } // wrap to 0 0 for DRM since board only has 16 slots
};

interface PortraitSpriteProps {
  baseId: string;
  className?: string;
}

export const PortraitSprite: React.FC<PortraitSpriteProps> = ({ baseId, className = '' }) => {
  // e.g. CHR_JUD_CAN_001
  const parts = baseId.split('_');
  if (parts.length < 3) return <div className={`bg-gray-800 ${className}`} />;

  const classKey = parts[2];
  const mapData = portraitMap[classKey];
  if (!mapData) return <div className={`bg-gray-800 ${className}`} />;

  const posX = (mapData.col / 3) * 100;
  const posY = (mapData.row / 3) * 100;

  return (
    <div 
      className={`display-inline-block bg-[#111] overflow-hidden ${className}`}
      style={{
        backgroundImage: `url(/assets/sprites/character_portraits.png)`,
        backgroundSize: `400%`,
        backgroundPosition: `${posX}% ${posY}%`,
        backgroundRepeat: 'no-repeat'
      }}
    />
  );
};
