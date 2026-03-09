import React from 'react';

export type SpriteSheetName = 'chaos_ability_icons.png' | 'order_ability_icons.png' | 'judgment_ability_icons.png' | 'love_ability_icons.png' | 'character_portraits.png';

interface SpriteIconProps {
  sheet?: SpriteSheetName;
  row?: number; // 0 to 3
  col?: number; // 0 to 3
  size?: number | string;
  className?: string;
  gridSize?: number; // usually 4
}

export const SpriteIcon: React.FC<SpriteIconProps> = ({ 
  sheet, 
  row = 0, 
  col = 0, 
  size = 48, 
  className = '',
  gridSize = 4
}) => {
  if (!sheet) {
      return (
          <div 
              className={`inline-block rounded overflow-hidden flex-shrink-0 bg-gray-800 ${className}`}
              style={{ width: size, height: size }}
          />
      );
  }

  // Use percentage-based positioning for responsive sizing
  // 4x4 grid means positions are 0%, 33.33%, 66.66%, 100%
  const posX = (col / (gridSize - 1)) * 100;
  const posY = (row / (gridSize - 1)) * 100;

  return (
    <div 
      className={`inline-block rounded overflow-hidden flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        backgroundImage: `url(/sprites/${sheet})`,
        backgroundSize: `${gridSize * 100}%`,
        backgroundPosition: `${posX}% ${posY}%`,
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#111'
      }}
    />
  );
};
