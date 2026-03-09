const fs = require('fs');

const abilityData = [
  // Judgment Sector (Null-Forged)
  { id: 'ABIL_CAN_ATK', name: 'Shatter-Shot', icon: 'crosshair', color: '#ff4444' },
  { id: 'ABIL_CAN_SP1', name: 'Artillery Bombardment', icon: 'bomb', color: '#ff4444' },
  { id: 'ABIL_CAN_SP2', name: 'Overcharge Reactor', icon: 'zap', color: '#ffaa00' },
  { id: 'ABIL_CAN_ULT', name: 'God-Killer Ordinance', icon: 'target', color: '#ff0000' },

  { id: 'ABIL_DCY_ATK', name: 'Corrosive Beam', icon: 'activity', color: '#a300a3' },
  { id: 'ABIL_DCY_SP1', name: 'Catalyst Outbreak', icon: 'cpu', color: '#a300a3' },
  { id: 'ABIL_DCY_SP2', name: 'Accelerated Entropy', icon: 'fast-forward', color: '#a300a3' },
  { id: 'ABIL_DCY_ULT', name: 'Heat Death', icon: 'sunset', color: '#ff4444' },

  { id: 'ABIL_VOD_ATK', name: 'Phase Strike', icon: 'scissors', color: '#8888ff' },
  { id: 'ABIL_VOD_SP1', name: 'Warp Prison', icon: 'lock', color: '#8888ff' },
  { id: 'ABIL_VOD_SP2', name: 'Singularity', icon: 'aperture', color: '#8888ff' },
  { id: 'ABIL_VOD_ULT', name: 'Absolute Vacuum', icon: 'circle', color: '#000000' },

  { id: 'ABIL_SHD_ATK', name: 'Shadow Dagger', icon: 'edit-2', color: '#555555' },
  { id: 'ABIL_SHD_SP1', name: 'Cloak & Dagger', icon: 'eye-off', color: '#555555' },
  { id: 'ABIL_SHD_SP2', name: 'Nerve Slice', icon: 'x', color: '#8800ff' },
  { id: 'ABIL_SHD_ULT', name: 'Thousand Cuts', icon: 'hash', color: '#ff0000' },

  { id: 'ABIL_DTH_ATK', name: 'Bone-Wrench', icon: 'tool', color: '#bbbbbb' },
  { id: 'ABIL_DTH_SP1', name: 'Reassemble', icon: 'life-buoy', color: '#00ff88' },
  { id: 'ABIL_DTH_SP2', name: 'Execution Protocol', icon: 'terminal', color: '#ff4444' },
  { id: 'ABIL_DTH_ULT', name: 'Machine Graveyard', icon: 'cpu', color: '#666666' },

  // Order Sector (Lumina)
  { id: 'ABIL_CHR_ATK', name: 'Luminous Strike', icon: 'sunrise', color: '#ffff88' },
  { id: 'ABIL_CHR_SP1', name: 'Chrono-Aura', icon: 'watch', color: '#ffff88' },
  { id: 'ABIL_CHR_SP2', name: 'Temporal Rewind', icon: 'rotate-ccw', color: '#ffff88' },
  { id: 'ABIL_CHR_ULT', name: 'Stasis Field', icon: 'hexagon', color: '#ffff88' },

  { id: 'ABIL_GRV_ATK', name: 'Grav-Thrust', icon: 'arrow-down-circle', color: '#bbbbff' },
  { id: 'ABIL_GRV_SP1', name: 'Crush Sphere', icon: 'arrow-down', color: '#bbbbff' },
  { id: 'ABIL_GRV_SP2', name: 'Event Horizon', icon: 'chevrons-right', color: '#bbbbff' },
  { id: 'ABIL_GRV_ULT', name: 'Planetary Collapse', icon: 'globe', color: '#bbbbff' },

  { id: 'ABIL_MAG_ATK', name: 'Magnetic Bash', icon: 'maximize', color: '#aaaaff' },
  { id: 'ABIL_MAG_SP1', name: 'Iron Maiden Protocol', icon: 'shield', color: '#aaaaff' },
  { id: 'ABIL_MAG_SP2', name: 'Polarity Shield', icon: 'shield-off', color: '#aaaaff' },
  { id: 'ABIL_MAG_ULT', name: 'Aegis of the Maker', icon: 'octagon', color: '#ffff00' },

  { id: 'ABIL_TRU_ATK', name: 'Verdict', icon: 'feather', color: '#ffff44' },
  { id: 'ABIL_TRU_SP1', name: 'Purge', icon: 'filter', color: '#ffff44' },
  { id: 'ABIL_TRU_SP2', name: 'Chain of Binding', icon: 'link', color: '#ffff44' },
  { id: 'ABIL_TRU_ULT', name: 'Final Judgment', icon: 'star', color: '#ffff44' },

  // Chaos Sector (Espers)
  { id: 'ABIL_FIR_ATK', name: 'Firebolt', icon: 'flame', color: '#ff6600' },
  { id: 'ABIL_FIR_SP1', name: 'Inferno Wave', icon: 'wind', color: '#ff6600' },
  { id: 'ABIL_FIR_SP2', name: 'Cinder Cage', icon: 'box', color: '#ff6600' },
  { id: 'ABIL_FIR_ULT', name: 'Supernova', icon: 'sun', color: '#ff0000' },

  { id: 'ABIL_EAR_ATK', name: 'Rock Toss', icon: 'codepen', color: '#a0522d' },
  { id: 'ABIL_EAR_SP1', name: 'Tectonic Fault', icon: 'sliders', color: '#a0522d' },
  { id: 'ABIL_EAR_SP2', name: 'Fossilize', icon: 'pause-circle', color: '#888888' },
  { id: 'ABIL_EAR_ULT', name: 'Earthshatter', icon: 'triangle', color: '#a0522d' },

  { id: 'ABIL_WAT_ATK', name: 'Water Whip', icon: 'droplet', color: '#00aaff' },
  { id: 'ABIL_WAT_SP1', name: 'Healing Rain', icon: 'cloud-rain', color: '#00aaff' },
  { id: 'ABIL_WAT_SP2', name: 'Wash Away', icon: 'cloud-drizzle', color: '#00aaff' },
  { id: 'ABIL_WAT_ULT', name: 'Tsunami', icon: 'activity', color: '#0044ff' },

  { id: 'ABIL_AIR_ATK', name: 'Wind Blade', icon: 'send', color: '#aaffff' },
  { id: 'ABIL_AIR_SP1', name: 'Tailwind', icon: 'fast-forward', color: '#aaffff' },
  { id: 'ABIL_AIR_SP2', name: 'Cyclone Dash', icon: 'navigation', color: '#aaffff' },
  { id: 'ABIL_AIR_ULT', name: 'Hurricane Flurry', icon: 'cloud-lightning', color: '#aaffff' },

  // Love Sector (Sylvan)
  { id: 'ABIL_LIF_ATK', name: 'Spirit Mend', icon: 'heart', color: '#ff88aa' },
  { id: 'ABIL_LIF_SP1', name: 'Web of Hearts', icon: 'share-2', color: '#ff88aa' },
  { id: 'ABIL_LIF_SP2', name: 'Cocoon', icon: 'shield', color: '#ff88aa' },
  { id: 'ABIL_LIF_ULT', name: 'Genesis Spore', icon: 'loader', color: '#ff88aa' },

  { id: 'ABIL_BLD_ATK', name: 'Vampiric Touch', icon: 'droplet', color: '#ff0000' },
  { id: 'ABIL_BLD_SP1', name: 'Blood Pact', icon: 'alert-triangle', color: '#cc0000' },
  { id: 'ABIL_BLD_SP2', name: 'Sanguine Pool', icon: 'disc', color: '#aa0000' },
  { id: 'ABIL_BLD_ULT', name: 'Crimson Harvest', icon: 'crosshair', color: '#ff0000' },

  { id: 'ABIL_GRW_ATK', name: 'Briar Patch', icon: 'map', color: '#22aa22' },
  { id: 'ABIL_GRW_SP1', name: 'Nurture', icon: 'heart', color: '#22cc22' },
  { id: 'ABIL_GRW_SP2', name: 'Barkskin', icon: 'shield', color: '#885522' },
  { id: 'ABIL_GRW_ULT', name: 'World Tree\\'s Embrace', icon: 'star', color: '#00ff00' },

  { id: 'ABIL_DRM_ATK', name: 'Mind Spike', icon: 'eye', color: '#cc88ff' },
  { id: 'ABIL_DRM_SP1', name: 'Lullaby', icon: 'moon', color: '#cc88ff' },
  { id: 'ABIL_DRM_SP2', name: 'Nightmare Weaver', icon: 'frown', color: '#8800ff' },
  { id: 'ABIL_DRM_ULT', name: 'Lucid Reality', icon: 'layers', color: '#ff00ff' },

  // Generic Base (Fallback)
  { id: 'generic_attack', name: 'Generic Attack', icon: 'crosshair', color: '#cccccc' }
];

const getLucideSvgBase64 = (iconName, color) => {
  // We'll generate a rich base SVG with an actual path if we had it, but since we don't have lucide path data in raw Node easily, 
  // wait we can use a script to fetch or just generate highly detailed procedural art!
  // Instead, since generating actual nice image icons in code is tough without an API, I will use unpkg to fetch SVG paths, OR better, I will generate actual WEBP using an unsplash API or something.
  // Actually, wait, the user said "image icons relevant for each character and attack...".
  return '';
};
