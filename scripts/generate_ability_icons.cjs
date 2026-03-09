const fs = require('fs');
const path = require('path');

const ICON_DIR = path.join(__dirname, '..', 'public', 'assets', 'icons', 'abilities');

// Ensure directory exists
if (!fs.existsSync(ICON_DIR)) {
  fs.mkdirSync(ICON_DIR, { recursive: true });
}

// Simple deterministic hash to generate unique features per abiility ID
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

// Helper to get consistent hue from string
function getHue(id, type) {
  if (type === 'attack') return 0; // Red for generic attack by default
  const hash = hashString(id);
  return Math.abs(hash % 360);
}

function generateSVG(id, type, name) {
  const hue = getHue(id, type);
  const isAttack = type === 'attack';
  
  // To make them look like "other images in the project", we'll give them a dark sci-fi/fantasy glossy badge look
  // dark background, inset glow, runic or geometric center
  
  const h1 = isAttack ? 0 : hue;
  const s1 = isAttack ? 80 : 70 + (hashString(id + 's1') % 30);
  const l1 = isAttack ? 50 : 50;

  const h2 = isAttack ? 30 : (hue + 40) % 360;
  
  let centerPiece = '';
  const randShape = Math.abs(hashString(id + name)) % 4;
  
  if (isAttack) {
    // A sword / claw shape for attack
    centerPiece = `
      <path d="M40,70 L50,20 L60,70 L50,90 Z" fill="url(#coreGlow)" filter="url(#drop-shadow)"/>
      <path d="M30,60 L70,60 L50,90 Z" fill="url(#coreGlow)" filter="url(#drop-shadow)"/>
    `;
  } else if (randShape === 0) {
    centerPiece = `<circle cx="50" cy="50" r="20" fill="url(#coreGlow)" filter="url(#drop-shadow)"/>
                   <circle cx="50" cy="50" r="28" fill="none" stroke="url(#coreGlow)" stroke-width="4" stroke-dasharray="10 5" filter="url(#drop-shadow)"/>`;
  } else if (randShape === 1) {
    centerPiece = `<rect x="35" y="35" width="30" height="30" transform="rotate(45 50 50)" fill="url(#coreGlow)" filter="url(#drop-shadow)"/>
                   <rect x="25" y="25" width="50" height="50" rx="10" fill="none" stroke="url(#coreGlow)" stroke-width="3" filter="url(#drop-shadow)"/>`;
  } else if (randShape === 2) {
    centerPiece = `<polygon points="50,20 80,75 20,75" fill="none" stroke="url(#coreGlow)" stroke-width="6" filter="url(#drop-shadow)"/>
                   <polygon points="50,40 65,70 35,70" fill="url(#coreGlow)" filter="url(#drop-shadow)"/>`;
  } else {
    centerPiece = `<path d="M 50 20 Q 80 50 50 80 Q 20 50 50 20" fill="url(#coreGlow)" filter="url(#drop-shadow)"/>
                   <circle cx="50" cy="50" r="10" fill="#fff" filter="url(#drop-shadow)"/>`;
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="256" height="256" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1a1a24" />
      <stop offset="100%" stop-color="#0a0a0f" />
    </linearGradient>
    <radialGradient id="ringGrad" cx="50%" cy="50%" r="50%">
      <stop offset="80%" stop-color="hsl(${h1}, ${s1}%, 30%)" />
      <stop offset="100%" stop-color="hsl(${h2}, ${s1}%, 15%)" />
    </radialGradient>
    <linearGradient id="coreGlow" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="hsl(${h1}, ${s1}%, ${l1}%)" />
      <stop offset="100%" stop-color="hsl(${h2}, ${s1}%, ${l1 - 10}%)" />
    </linearGradient>
    <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
      <feOffset dx="0" dy="2" result="offsetblur"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.5"/>
      </feComponentTransfer>
      <feMerge> 
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Base background block with rounded corners -->
  <rect x="5" y="5" width="90" height="90" rx="15" fill="url(#bgGrad)" stroke="#333" stroke-width="2"/>
  
  <!-- Inner textured ring -->
  <rect x="12" y="12" width="76" height="76" rx="10" fill="none" stroke="url(#ringGrad)" stroke-width="4"/>
  <rect x="15" y="15" width="70" height="70" rx="8" fill="none" stroke="#222" stroke-width="1"/>

  <!-- Center Graphic -->
  ${centerPiece}
  
  <!-- Highlight / Glass Effect overlay -->
  <path d="M10,10 L90,10 L90,50 Q50,40 10,50 Z" fill="#ffffff" opacity="0.05" pointer-events="none" />
</svg>`;

  return svg;
}

const abilityIds = [
  // Generic Attack (Used by all)
  'generic_attack',

  // Cannoneer
  'ABIL_CAN_SP1', 'ABIL_CAN_SP2', 'ABIL_CAN_ULT',
  // Entropy Phase
  'ABIL_DCY_SP1', 'ABIL_DCY_SP2', 'ABIL_DCY_ULT',
  // Void-Borg
  'ABIL_VOD_SP1', 'ABIL_VOD_SP2', 'ABIL_VOD_ULT',
  // Stealth
  'ABIL_SHD_SP1', 'ABIL_SHD_SP2', 'ABIL_SHD_ULT',
  // Necro
  'ABIL_DTH_SP1', 'ABIL_DTH_SP2', 'ABIL_DTH_ULT',
  // Time-Paladin
  'ABIL_CHR_SP1', 'ABIL_CHR_SP2', 'ABIL_CHR_ULT',
  // Grav-Lancer
  'ABIL_GRV_SP1', 'ABIL_GRV_SP2', 'ABIL_GRV_ULT',
  // Mag-Sentinel
  'ABIL_MAG_SP1', 'ABIL_MAG_SP2', 'ABIL_MAG_ULT',
  // Inquisitor
  'ABIL_TRU_SP1', 'ABIL_TRU_SP2', 'ABIL_TRU_ULT',
  // Pyromancer
  'ABIL_FIR_SP1', 'ABIL_FIR_SP2', 'ABIL_FIR_ULT',
  // Geomancer
  'ABIL_EAR_SP1', 'ABIL_EAR_SP2', 'ABIL_EAR_ULT',
  // Tidecaller
  'ABIL_WAT_SP1', 'ABIL_WAT_SP2', 'ABIL_WAT_ULT',
  // Zephyr
  'ABIL_AIR_SP1', 'ABIL_AIR_SP2', 'ABIL_AIR_ULT',
  // Weaver
  'ABIL_LIF_SP1', 'ABIL_LIF_SP2', 'ABIL_LIF_ULT',
  // Druid
  'ABIL_BLD_SP1', 'ABIL_BLD_SP2', 'ABIL_BLD_ULT',
  // Growth
  'ABIL_GRW_SP1', 'ABIL_GRW_SP2', 'ABIL_GRW_ULT',
  // Dream
  'ABIL_DRM_SP1', 'ABIL_DRM_SP2', 'ABIL_DRM_ULT',
];

console.log('Generating', abilityIds.length, 'icons...');

for (const id of abilityIds) {
  const isAttack = id === 'generic_attack';
  const svg = generateSVG(id, isAttack ? 'attack' : 'special', id);
  const filePath = path.join(ICON_DIR, `${id}.svg`);
  fs.writeFileSync(filePath, svg);
  console.log('Wrote', filePath);
}

console.log('Done.');
